namespace BE_WMS_LA.Shared.DTOs.Auth;

/// <summary>
/// DTO cho response đăng nhập thành công
/// </summary>
public class LoginResponseDto
{
    /// <summary>
    /// Access Token (JWT)
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;

    /// <summary>
    /// Refresh Token để làm mới access token
    /// </summary>
    public string RefreshToken { get; set; } = string.Empty;
}
