using System.Security.Claims;
using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.Configurations;
using BE_WMS_LA.Shared.DTOs.Auth;
using BE_WMS_LA.Shared.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller xử lý xác thực người dùng
/// Sử dụng HttpOnly Cookie cho Refresh Token và Memory cho Access Token
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;
    private readonly IConfiguration _configuration;

    public AuthController(AuthService authService, ILogger<AuthController> logger, IConfiguration configuration)
    {
        _authService = authService;
        _logger = logger;
        _configuration = configuration;
    }

    #region Public Endpoints

    /// <summary>
    /// Đăng nhập vào hệ thống
    /// </summary>
    /// <param name="request">Thông tin đăng nhập</param>
    /// <returns>Access Token (trong body) và Refresh Token (trong HttpOnly Cookie)</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    [EndpointSummary("Đăng nhập")]
    [EndpointDescription("Đăng nhập vào hệ thống. Access Token trả về trong response body, Refresh Token được set trong HttpOnly Cookie.")]
    [ProducesResponseType<ApiResponse<LoginResponseDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<LoginResponseDto>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ApiResponse<LoginResponseDto>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<LoginResponseDto>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        // Lấy IP address của client
        var ipAddress = GetClientIpAddress();

        _logger.LogInformation("Login attempt for user: {Username} from IP: {IpAddress}",
            request.Username, ipAddress);

        var result = await _authService.LoginAsync(request, ipAddress);

        if (!result.Success)
        {
            _logger.LogWarning("Login failed for user: {Username}. Reason: {Message}",
                request.Username, result.Message);
            return Unauthorized(result);
        }

        // Set Refresh Token vào HttpOnly Cookie
        if (!string.IsNullOrEmpty(result.RefreshToken))
        {
            SetRefreshTokenCookie(result.RefreshToken);
            // Xóa refresh token khỏi response để không expose ra client
            result.RefreshToken = null;
        }

        _logger.LogInformation("User {Username} logged in successfully from IP: {IpAddress}",
            request.Username, ipAddress);

        return Ok(result);
    }

    /// <summary>
    /// Đăng ký tài khoản mới
    /// </summary>
    /// <param name="request">Thông tin đăng ký</param>
    /// <returns>Thông tin tài khoản đã tạo</returns>
    [HttpPost("register")]
    [AllowAnonymous]
    [EndpointSummary("Đăng ký tài khoản")]
    [EndpointDescription("Đăng ký tài khoản mới trong hệ thống. Chỉ Admin mới có thể chỉ định Role.")]
    [ProducesResponseType<ApiResponse<UserInfoDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<UserInfoDto>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<UserInfoDto>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("Registration attempt for username: {Username}", request.Username);

        var result = await _authService.RegisterAsync(request);

        if (!result.Success)
        {
            _logger.LogWarning("Registration failed for username: {Username}. Reason: {Message}",
                request.Username, result.Message);
            return BadRequest(result);
        }

        _logger.LogInformation("User {Username} registered successfully", request.Username);

        return CreatedAtAction(nameof(GetCurrentUser), result);
    }

    /// <summary>
    /// Làm mới Access Token bằng Refresh Token từ Cookie
    /// </summary>
    /// <returns>Access Token mới và Refresh Token mới (trong HttpOnly Cookie)</returns>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [EndpointSummary("Làm mới Token")]
    [EndpointDescription("Làm mới Access Token bằng Refresh Token từ HttpOnly Cookie. KHÔNG CẦN gửi Access Token cũ trong header Authorization.")]
    [ProducesResponseType<ApiResponse<LoginResponseDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<LoginResponseDto>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken()
    {
        // Debug: Log all cookies received
        _logger.LogInformation("=== Refresh Token Request ===");
        _logger.LogInformation("All cookies received:");
        foreach (var cookie in Request.Cookies)
        {
            _logger.LogInformation("  Cookie: {Name} = {Value}", cookie.Key, cookie.Value?.Substring(0, Math.Min(20, cookie.Value?.Length ?? 0)) + "...");
        }

        // Lấy refresh token từ HttpOnly Cookie
        var refreshToken = GetRefreshTokenFromCookie();
        _logger.LogInformation("Expected cookie name: {CookieName}", CookieSettings.RefreshTokenCookieName);
        _logger.LogInformation("Refresh token found: {Found}", !string.IsNullOrEmpty(refreshToken));

        if (string.IsNullOrEmpty(refreshToken))
        {
            return Unauthorized(ApiResponse<LoginResponseDto>.ErrorResponse("Refresh Token không tồn tại. Vui lòng đăng nhập lại."));
        }

        // Gọi service chỉ với refreshToken (không cần accessToken)
        var result = await _authService.RefreshTokenAsync(refreshToken);

        if (!result.Success)
        {
            // Xóa cookie nếu refresh token không hợp lệ
            DeleteRefreshTokenCookie();
            return Unauthorized(result);
        }

        // Set Refresh Token mới vào HttpOnly Cookie (Token Rotation)
        if (!string.IsNullOrEmpty(result.RefreshToken))
        {
            SetRefreshTokenCookie(result.RefreshToken);
            result.RefreshToken = null;
        }

        return Ok(result);
    }

    #endregion

    #region Protected Endpoints (Yêu cầu đăng nhập)

    /// <summary>
    /// Lấy thông tin người dùng hiện tại
    /// </summary>
    /// <returns>Thông tin người dùng</returns>
    [HttpGet("me")]
    [Authorize]
    [EndpointSummary("Thông tin người dùng hiện tại")]
    [EndpointDescription("Lấy thông tin chi tiết của người dùng đang đăng nhập.")]
    [ProducesResponseType<ApiResponse<UserInfoDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<UserInfoDto>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetCurrentUser()
    {

        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<UserInfoDto>.ErrorResponse("Không tìm thấy thông tin người dùng"));
        }

        var result = await _authService.GetCurrentUserAsync(userId.Value);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Đổi mật khẩu
    /// </summary>
    /// <param name="request">Thông tin đổi mật khẩu</param>
    /// <returns>Kết quả đổi mật khẩu</returns>
    [HttpPost("change-password")]
    [Authorize]
    [EndpointSummary("Đổi mật khẩu")]
    [EndpointDescription("Đổi mật khẩu cho người dùng đang đăng nhập.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<bool>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<bool>.ErrorResponse("Không tìm thấy thông tin người dùng"));
        }

        var result = await _authService.ChangePasswordAsync(
            userId.Value,
            request.CurrentPassword,
            request.NewPassword);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        // Xóa refresh token cookie khi đổi mật khẩu để bắt buộc đăng nhập lại
        DeleteRefreshTokenCookie();

        _logger.LogInformation("Password changed for user ID: {UserId}", userId);

        return Ok(result);
    }

    /// <summary>
    /// Đăng xuất
    /// </summary>
    /// <returns>Kết quả đăng xuất</returns>
    [HttpPost("logout")]
    [Authorize]
    [EndpointSummary("Đăng xuất")]
    [EndpointDescription("Đăng xuất khỏi hệ thống và xóa refresh token.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized(ApiResponse<bool>.ErrorResponse("Không tìm thấy thông tin người dùng"));
        }

        // Xóa refresh token từ Redis
        var result = await _authService.LogoutAsync(userId.Value);

        // Xóa refresh token cookie
        DeleteRefreshTokenCookie();

        _logger.LogInformation("User ID: {UserId} logged out", userId);

        return Ok(result);
    }

    #endregion

    #region Admin Endpoints

    /// <summary>
    /// Tạo tài khoản mới (chỉ Admin)
    /// </summary>
    /// <param name="request">Thông tin tài khoản</param>
    /// <returns>Thông tin tài khoản đã tạo</returns>
    [HttpPost("create-user")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Tạo tài khoản (Admin)")]
    [EndpointDescription("Tạo tài khoản mới với vai trò được chỉ định. Chỉ Admin mới có quyền sử dụng.")]
    [ProducesResponseType<ApiResponse<UserInfoDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<UserInfoDto>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ApiResponse<UserInfoDto>>(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreateUser([FromBody] RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<UserInfoDto>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var adminId = GetCurrentUserId();
        _logger.LogInformation("Admin {AdminId} is creating new user: {Username}",
            adminId, request.Username);

        var result = await _authService.RegisterAsync(request);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        _logger.LogInformation("Admin {AdminId} created user {Username} successfully",
            adminId, request.Username);

        return CreatedAtAction(nameof(GetCurrentUser), result);
    }

    #endregion

    #region Cookie Helper Methods

    /// <summary>
    /// Set Refresh Token vào HttpOnly Cookie
    /// </summary>
    /// <param name="refreshToken">Refresh Token</param>
    private void SetRefreshTokenCookie(string refreshToken)
    {
        var isDevelopment = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true, // Không thể truy cập từ JavaScript
            Secure = !isDevelopment, // HTTPS only in production
            // Lax cho phép gửi cookie trong cross-origin requests (dev: localhost:5173 -> localhost:5023)
            // Strict sẽ block cookie trong cross-origin requests
            SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict,
            Path = CookieSettings.CookiePath,
            Expires = DateTimeOffset.UtcNow.AddDays(CookieSettings.RefreshTokenExpirationDays),
            IsEssential = true // Cookie thiết yếu cho authentication
        };

        Response.Cookies.Append(CookieSettings.RefreshTokenCookieName, refreshToken, cookieOptions);

        _logger.LogDebug("Refresh token cookie set. SameSite: {SameSite}, Secure: {Secure}, Expires: {Expires}",
            cookieOptions.SameSite, cookieOptions.Secure, cookieOptions.Expires);
    }

    /// <summary>
    /// Lấy Refresh Token từ HttpOnly Cookie
    /// </summary>
    /// <returns>Refresh Token hoặc null nếu không tồn tại</returns>
    private string? GetRefreshTokenFromCookie()
    {
        return Request.Cookies[CookieSettings.RefreshTokenCookieName];
    }

    /// <summary>
    /// Xóa Refresh Token Cookie
    /// </summary>
    private void DeleteRefreshTokenCookie()
    {
        var isDevelopment = HttpContext.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment();

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = !isDevelopment,
            SameSite = isDevelopment ? SameSiteMode.Lax : SameSiteMode.Strict,
            Path = CookieSettings.CookiePath,
            Expires = DateTimeOffset.UtcNow.AddDays(-1) // Đặt thời gian hết hạn trong quá khứ để xóa
        };

        Response.Cookies.Delete(CookieSettings.RefreshTokenCookieName, cookieOptions);

        _logger.LogDebug("Refresh token cookie deleted");
    }

    #endregion

    #region Helper Methods

    /// <summary>
    /// Lấy User ID từ JWT Claims
    /// </summary>
    private Guid? GetCurrentUserId()
    {
        // 1. Thử tìm theo chuẩn JWT ("sub") - Khuyên dùng
        var userIdClaim = User.FindFirst("sub");

        // 2. Nếu không có, tìm theo chuẩn Microsoft XML (phòng hờ chưa tắt mapping)
        if (userIdClaim == null)
        {
            userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        }

        // 3. Nếu vẫn không có, tìm theo tên "id" (nếu lúc tạo token bạn dùng key này)
        if (userIdClaim == null)
        {
            userIdClaim = User.FindFirst("id");
        }

        // Parse dữ liệu
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }

        _logger.LogWarning("Found claim but cannot parse to Guid: {Value}", userIdClaim?.Value);
        return null;
    }

    /// <summary>
    /// Lấy IP Address của client
    /// </summary>
    private string? GetClientIpAddress()
    {
        // Kiểm tra header X-Forwarded-For (nếu có reverse proxy)
        var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwardedFor))
        {
            return forwardedFor.Split(',').First().Trim();
        }

        // Lấy IP từ connection
        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    /// <summary>
    /// Lấy Access Token từ Authorization header
    /// </summary>
    private string? GetAccessTokenFromHeader()
    {
        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (authHeader != null && authHeader.StartsWith("Bearer "))
        {
            return authHeader["Bearer ".Length..].Trim();
        }
        return null;
    }

    #endregion
}
