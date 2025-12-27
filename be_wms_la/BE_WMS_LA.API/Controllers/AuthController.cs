using System.Security.Claims;
using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.DTOs.Auth;
using BE_WMS_LA.Shared.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller xử lý xác thực người dùng
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(AuthService authService, ILogger<AuthController> logger)
    {
        _authService = authService;
        _logger = logger;
    }

    #region Public Endpoints

    /// <summary>
    /// Đăng nhập vào hệ thống
    /// </summary>
    /// <param name="request">Thông tin đăng nhập</param>
    /// <returns>Access Token và thông tin người dùng</returns>
    [HttpPost("login")]
    [AllowAnonymous]
    [EndpointSummary("Đăng nhập")]
    [EndpointDescription("Đăng nhập vào hệ thống với tên đăng nhập và mật khẩu. Trả về JWT token nếu thành công.")]
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
    /// Làm mới Access Token
    /// </summary>
    /// <param name="request">Refresh Token</param>
    /// <returns>Access Token mới</returns>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [EndpointSummary("Làm mới Token")]
    [EndpointDescription("Làm mới Access Token bằng Refresh Token. Gửi kèm Access Token cũ trong header Authorization.")]
    [ProducesResponseType<ApiResponse<LoginResponseDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<LoginResponseDto>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ApiResponse<LoginResponseDto>.ErrorResponse("Refresh Token là bắt buộc"));
        }

        // Lấy access token từ header
        var accessToken = GetAccessTokenFromHeader();
        if (string.IsNullOrEmpty(accessToken))
        {
            return Unauthorized(ApiResponse<LoginResponseDto>.ErrorResponse("Access Token không được cung cấp"));
        }

        var result = await _authService.RefreshTokenAsync(request.RefreshToken, accessToken);

        if (!result.Success)
        {
            return Unauthorized(result);
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
