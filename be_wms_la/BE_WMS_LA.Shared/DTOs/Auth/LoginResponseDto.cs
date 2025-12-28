namespace BE_WMS_LA.Shared.DTOs.Auth;

/// <summary>
/// DTO cho response đăng nhập thành công
/// Access Token được trả về trong response body (lưu trong memory của client)
/// Refresh Token được gửi qua HttpOnly Cookie (không thể truy cập từ JavaScript)
/// </summary>
public class LoginResponseDto
{
    /// <summary>
    /// Access Token (JWT) - Client lưu trong memory
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Thời gian hết hạn của Access Token (Unix timestamp - seconds)
    /// </summary>
    public long ExpiresAt { get; set; }

    /// <summary>
    /// Thời gian hết hạn của Access Token (phút)
    /// </summary>
    public int ExpiresInMinutes { get; set; }
}
