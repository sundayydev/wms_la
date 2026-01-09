using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.Configurations;
using BE_WMS_LA.Shared.DTOs.Auth;
using BE_WMS_LA.Shared.DTOs.Common;
using Isopoh.Cryptography.Argon2;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service xử lý xác thực người dùng
/// Hỗ trợ HttpOnly Cookie (Refresh Token) + Memory (Access Token)
/// </summary>
public class AuthService
{
    private readonly UserRepository _userRepository;
    private readonly IConfiguration _configuration;
    private readonly IConnectionMultiplexer? _redis;
    private readonly IDatabase? _redisDb;

    // Cấu hình lock account
    private const int MaxFailedAttempts = 10;
    private const int LockoutDurationMinutes = 15;

    // Cấu hình refresh token
    private const string RefreshTokenPrefix = "refresh_token:";

    public AuthService(
        UserRepository userRepository,
        IConfiguration configuration,
        IConnectionMultiplexer? redis = null)
    {
        _userRepository = userRepository;
        _configuration = configuration;
        _redis = redis;
        _redisDb = redis?.GetDatabase();
    }

    #region Public Methods

    /// <summary>
    /// Đăng nhập
    /// </summary>
    public async Task<AuthResult> LoginAsync(LoginRequestDto request, string? ipAddress = null)
    {
        // 1. Tìm user theo username
        var user = await _userRepository.GetByUsernameAsync(request.Username);
        if (user == null)
        {
            return AuthResult.Error("Tên đăng nhập hoặc mật khẩu không đúng");
        }

        // 2. Kiểm tra tài khoản bị khóa
        if (user.IsLocked && user.LockedUntil.HasValue)
        {
            if (DateTime.UtcNow < user.LockedUntil.Value)
            {
                var remainingMinutes = (int)(user.LockedUntil.Value - DateTime.UtcNow).TotalMinutes;
                return AuthResult.Error(
                    $"Tài khoản đã bị khóa. Vui lòng thử lại sau {remainingMinutes + 1} phút");
            }
            else
            {
                // Hết thời gian khóa, mở khóa
                user.IsLocked = false;
                user.LockedUntil = null;
                user.FailedLoginAttempts = 0;
            }
        }

        // 3. Kiểm tra tài khoản active
        if (!user.IsActive)
        {
            return AuthResult.Error("Tài khoản đã bị vô hiệu hóa");
        }

        // 4. Kiểm tra soft delete
        if (user.DeletedAt.HasValue)
        {
            return AuthResult.Error("Tài khoản không tồn tại");
        }

        // 5. Xác thực mật khẩu
        if (!VerifyPassword(request.Password, user.Password))
        {
            // Tăng số lần đăng nhập thất bại
            user.FailedLoginAttempts++;

            if (user.FailedLoginAttempts >= MaxFailedAttempts)
            {
                user.IsLocked = true;
                user.LockedUntil = DateTime.UtcNow.AddMinutes(LockoutDurationMinutes);
                await _userRepository.UpdateAsync(user);
                return AuthResult.Error(
                    $"Tài khoản đã bị khóa do đăng nhập sai quá {MaxFailedAttempts} lần. Vui lòng thử lại sau {LockoutDurationMinutes} phút");
            }

            await _userRepository.UpdateAsync(user);
            return AuthResult.Error(
                $"Tên đăng nhập hoặc mật khẩu không đúng. Còn {MaxFailedAttempts - user.FailedLoginAttempts} lần thử");
        }

        // 6. Đăng nhập thành công - Reset failed attempts
        user.FailedLoginAttempts = 0;
        user.IsLocked = false;
        user.LockedUntil = null;
        user.LastLoginAt = DateTime.UtcNow;
        user.LastLoginIP = ipAddress;
        await _userRepository.UpdateAsync(user);

        // 7. Tạo token
        var expirationMinutes = GetAccessTokenExpirationMinutes();
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);
        var accessToken = await GenerateAccessTokenAsync(user, expiresAt);
        var refreshToken = GenerateRefreshToken();

        // 8. Lưu refresh token vào Redis
        await SaveRefreshTokenAsync(user.UserID, refreshToken);

        // 9. Tạo response
        return AuthResult.SuccessResult(
            accessToken: accessToken,
            refreshToken: refreshToken,
            expiresAt: new DateTimeOffset(expiresAt).ToUnixTimeSeconds(),
            expiresInMinutes: expirationMinutes,
            message: "Đăng nhập thành công");
    }

    /// <summary>
    /// Đăng ký tài khoản mới
    /// </summary>
    public async Task<ApiResponse<UserInfoDto>> RegisterAsync(RegisterRequestDto request)
    {
        // 1. Kiểm tra username đã tồn tại
        var existingUser = await _userRepository.GetByUsernameAsync(request.Username);
        if (existingUser != null)
        {
            return ApiResponse<UserInfoDto>.ErrorResponse("Tên đăng nhập đã tồn tại");
        }

        // 2. Tạo user mới
        var user = new User
        {
            UserID = Guid.NewGuid(),
            Username = request.Username,
            Password = HashPassword(request.Password),
            FullName = request.FullName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            Role = request.Role ?? UserRoles.Receptionist, // Mặc định là Receptionist
            WarehouseID = request.WarehouseID,
            IsActive = true,
            IsLocked = false,
            FailedLoginAttempts = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // 3. Lưu vào database
        await _userRepository.AddAsync(user);

        // 4. Trả về thông tin user
        return ApiResponse<UserInfoDto>.SuccessResponse(
            MapToUserInfoDto(user),
            "Đăng ký tài khoản thành công");
    }

    /// <summary>
    /// Làm mới Access Token (chỉ cần Refresh Token)
    /// </summary>
    /// <remarks>
    /// WARNING: Phương thức này sử dụng Redis Keys() scan - có thể gây performance issue
    /// với số lượng lớn users. Xem xét sử dụng reverse mapping hoặc cấu trúc khác.
    /// </remarks>
    public async Task<AuthResult> RefreshTokenAsync(string refreshToken)
    {
        // 0. Kiểm tra Redis có sẵn không
        if (_redis == null || _redisDb == null)
        {
            return AuthResult.Error("Redis không khả dụng");
        }

        // 1. Tìm user từ refresh token trong Redis
        // WARNING: Keys() là blocking operation, không nên dùng trong production với lượng lớn keys
        // TODO: Cân nhắc lưu thêm reverse mapping "refresh_token_lookup:{token_hash} -> userId"
        var db = _redis.GetDatabase();
        var keys = _redis.GetServer(_redis!.GetEndPoints().First()).Keys(pattern: "refresh_token:*");

        Guid userId = Guid.Empty;
        foreach (var key in keys)
        {
            var storedToken = await db.StringGetAsync(key);
            if (storedToken == refreshToken)
            {
                // Extract userId from key "refresh_token:{userId}"
                var keyString = key.ToString();
                var userIdString = keyString.Replace("refresh_token:", "");
                if (Guid.TryParse(userIdString, out userId))
                {
                    break;
                }
            }
        }

        if (userId == Guid.Empty)
        {
            return AuthResult.Error("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        // NOTE: Không cần gọi ValidateRefreshTokenAsync() ở đây vì đã xác nhận token khớp ở bước trên

        // 2. Tìm user
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsActive || user.DeletedAt.HasValue)
        {
            return AuthResult.Error("Người dùng không tồn tại hoặc đã bị vô hiệu hóa");
        }

        // 3. Tạo token mới
        var expirationMinutes = GetAccessTokenExpirationMinutes();
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);
        var newAccessToken = await GenerateAccessTokenAsync(user, expiresAt);
        var newRefreshToken = GenerateRefreshToken();

        // 4. Token rotation: Xóa token cũ rồi lưu token mới
        await RevokeRefreshTokenAsync(userId);
        await SaveRefreshTokenAsync(userId, newRefreshToken);

        return AuthResult.SuccessResult(
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresAt: new DateTimeOffset(expiresAt).ToUnixTimeSeconds(),
            expiresInMinutes: expirationMinutes,
            message: "Làm mới token thành công");
    }

    /// <summary>
    /// Làm mới Access Token (với Access Token cũ)
    /// </summary>
    public async Task<AuthResult> RefreshTokenAsync(string refreshToken, string accessToken)
    {
        // 1. Validate access token (có thể đã hết hạn)
        var principal = GetPrincipalFromExpiredToken(accessToken);
        if (principal == null)
        {
            return AuthResult.Error("Token không hợp lệ");
        }

        // 2. Lấy thông tin user từ token
        // NOTE: Sử dụng JwtRegisteredClaimNames.Sub để khớp với claim được tạo trong GenerateAccessTokenAsync
        var userIdClaim = principal.FindFirst(JwtRegisteredClaimNames.Sub)
                          ?? principal.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return AuthResult.Error("Token không hợp lệ");
        }

        // 3. Validate refresh token từ Redis
        if (!await ValidateRefreshTokenAsync(userId, refreshToken))
        {
            return AuthResult.Error("Refresh token không hợp lệ hoặc đã hết hạn");
        }

        // 4. Tìm user
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsActive || user.DeletedAt.HasValue)
        {
            return AuthResult.Error("Người dùng không tồn tại hoặc đã bị vô hiệu hóa");
        }

        // 5. Tạo token mới
        var expirationMinutes = GetAccessTokenExpirationMinutes();
        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);
        var newAccessToken = await GenerateAccessTokenAsync(user, expiresAt);
        var newRefreshToken = GenerateRefreshToken();

        // 6. Token rotation: Xóa token cũ rồi lưu token mới
        await RevokeRefreshTokenAsync(userId);
        await SaveRefreshTokenAsync(userId, newRefreshToken);

        return AuthResult.SuccessResult(
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            expiresAt: new DateTimeOffset(expiresAt).ToUnixTimeSeconds(),
            expiresInMinutes: expirationMinutes,
            message: "Làm mới token thành công");
    }

    /// <summary>
    /// Đăng xuất - Xóa refresh token
    /// </summary>
    public async Task<ApiResponse<bool>> LogoutAsync(Guid userId)
    {
        await RevokeRefreshTokenAsync(userId);
        return ApiResponse<bool>.SuccessResponse(true, "Đăng xuất thành công");
    }

    /// <summary>
    /// Đổi mật khẩu
    /// </summary>
    public async Task<ApiResponse<bool>> ChangePasswordAsync(Guid userId, string currentPassword, string newPassword)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return ApiResponse<bool>.ErrorResponse("Người dùng không tồn tại");
        }

        if (!VerifyPassword(currentPassword, user.Password))
        {
            return ApiResponse<bool>.ErrorResponse("Mật khẩu hiện tại không đúng");
        }

        user.Password = HashPassword(newPassword);
        user.PasswordChangedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        // Xóa refresh token để bắt buộc đăng nhập lại
        await RevokeRefreshTokenAsync(userId);

        return ApiResponse<bool>.SuccessResponse(true, "Đổi mật khẩu thành công");
    }

    /// <summary>
    /// Lấy thông tin user hiện tại từ token
    /// </summary>
    public async Task<ApiResponse<UserInfoDto>> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsActive || user.DeletedAt.HasValue)
        {
            return ApiResponse<UserInfoDto>.ErrorResponse("Người dùng không tồn tại");
        }

        return ApiResponse<UserInfoDto>.SuccessResponse(MapToUserInfoDto(user));
    }

    #endregion

    #region Private Methods

    /// <summary>
    /// Hash mật khẩu sử dụng Argon2
    /// </summary>
    private static string HashPassword(string password)
    {
        return Argon2.Hash(password);
    }

    /// <summary>
    /// Xác thực mật khẩu
    /// </summary>
    private static bool VerifyPassword(string password, string hashedPassword)
    {
        return Argon2.Verify(hashedPassword, password);
    }

    /// <summary>
    /// Tạo Access Token (JWT)
    /// </summary>
    private async Task<string> GenerateAccessTokenAsync(User user, DateTime expiresAt)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"] ?? "WmsApi";
        var audience = jwtSettings["Audience"] ?? "WmsClient";

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            // 1. QUAN TRỌNG NHẤT: Đổi sang chuẩn "sub" để khớp với code đọc UserID
            new(JwtRegisteredClaimNames.Sub, user.UserID.ToString()),

            // 2. Các claim khác chuyển sang chuẩn ngắn gọn
            new(JwtRegisteredClaimNames.Name, user.Username), // Key sẽ là "name" hoặc "unique_name"
            new(JwtRegisteredClaimNames.Email, user.Email),   // Key sẽ là "email"
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()), // Key là "jti"

            // 3. Role: Nên để chữ thường "role" cho ngắn gọn
            new("role", user.Role),
            
            // 4. Custom Claim
            new("FullName", user.FullName)
        };
        if (user.WarehouseID.HasValue)
        {
            claims.Add(new Claim("WarehouseId", user.WarehouseID.Value.ToString()));
        }

        // Lấy permissions từ Repository thay vì trực tiếp từ DbContext
        var permissions = await _userRepository.GetUserPermissionsAsync(user.UserID);
        foreach (var permission in permissions)
        {
            claims.Add(new Claim("Permission", permission));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Tạo Refresh Token
    /// </summary>
    private static string GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return Convert.ToBase64String(randomNumber);
    }

    /// <summary>
    /// Lấy principal từ token đã hết hạn
    /// </summary>
    private ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");

        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
            ValidateLifetime = false // Cho phép token hết hạn
        };

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken ||
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }

            return principal;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Lấy thời gian hết hạn của Access Token (phút)
    /// </summary>
    private int GetAccessTokenExpirationMinutes()
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        if (int.TryParse(jwtSettings["AccessTokenExpirationMinutes"], out var minutes))
        {
            return minutes;
        }
        return 1; // Mặc định 1 phút
    }

    /// <summary>
    /// Map User entity sang UserInfoDto
    /// </summary>
    private static UserInfoDto MapToUserInfoDto(User user)
    {
        return new UserInfoDto
        {
            UserID = user.UserID,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            DateOfBirth = user.DateOfBirth.HasValue
                ? user.DateOfBirth.Value.ToDateTime(TimeOnly.MinValue)
                : null,
            Gender = user.Gender,
            Address = user.Address,
            Avatar = user.Avatar,
            Role = user.Role,
            IsActive = user.IsActive,
            LastLoginAt = user.LastLoginAt,
            LastLoginIP = user.LastLoginIP,
            CreatedAt = user.CreatedAt,
            WarehouseID = user.WarehouseID,
            WarehouseName = user.Warehouse?.WarehouseName
        };
    }

    #endregion

    #region Redis Refresh Token Methods

    /// <summary>
    /// Lưu refresh token vào Redis
    /// </summary>
    private async Task SaveRefreshTokenAsync(Guid userId, string refreshToken)
    {
        if (_redisDb == null) return;

        var key = $"{RefreshTokenPrefix}{userId}";
        var expiration = TimeSpan.FromDays(CookieSettings.RefreshTokenExpirationDays);

        // Lưu refresh token với thời hạn
        await _redisDb.StringSetAsync(key, refreshToken, expiration);
    }

    /// <summary>
    /// Lấy refresh token từ Redis
    /// </summary>
    private async Task<string?> GetRefreshTokenAsync(Guid userId)
    {
        if (_redisDb == null) return null;

        var key = $"{RefreshTokenPrefix}{userId}";
        var token = await _redisDb.StringGetAsync(key);
        return token.HasValue ? token.ToString() : null;
    }

    /// <summary>
    /// Validate refresh token từ Redis
    /// </summary>
    public async Task<bool> ValidateRefreshTokenAsync(Guid userId, string refreshToken)
    {
        if (_redisDb == null) return true; // Bỏ qua nếu không có Redis

        var storedToken = await GetRefreshTokenAsync(userId);
        return storedToken != null && storedToken == refreshToken;
    }

    /// <summary>
    /// Xóa refresh token khỏi Redis (dùng khi logout)
    /// </summary>
    public async Task RevokeRefreshTokenAsync(Guid userId)
    {
        if (_redisDb == null) return;

        var key = $"{RefreshTokenPrefix}{userId}";
        await _redisDb.KeyDeleteAsync(key);
    }

    /// <summary>
    /// Xóa tất cả refresh token của user (dùng khi đổi mật khẩu hoặc revoke all sessions)
    /// </summary>
    public async Task RevokeAllRefreshTokensAsync(Guid userId)
    {
        await RevokeRefreshTokenAsync(userId);
    }

    #endregion
}

/// <summary>
/// Kết quả xác thực bao gồm cả RefreshToken để Controller set vào Cookie
/// </summary>
public class AuthResult : ApiResponse<LoginResponseDto>
{
    /// <summary>
    /// Refresh Token - Controller sẽ set vào HttpOnly Cookie
    /// </summary>
    public string? RefreshToken { get; set; }

    public static AuthResult Error(string message)
    {
        return new AuthResult
        {
            Success = false,
            Message = message,
            Data = null
        };
    }

    public static AuthResult SuccessResult(string accessToken, string refreshToken, long expiresAt, int expiresInMinutes, string message)
    {
        return new AuthResult
        {
            Success = true,
            Message = message,
            RefreshToken = refreshToken,
            Data = new LoginResponseDto
            {
                AccessToken = accessToken,
                ExpiresAt = expiresAt,
                ExpiresInMinutes = expiresInMinutes
            }
        };
    }
}
