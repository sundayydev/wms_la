namespace BE_WMS_LA.Shared.DTOs.Auth;

/// <summary>
/// DTO cho request làm mới token
/// Lưu ý: Refresh Token được lấy từ HttpOnly Cookie, không cần gửi trong body
/// Class này được giữ lại để backward compatibility
/// </summary>
[Obsolete("Refresh Token được lấy từ HttpOnly Cookie. Class này chỉ để backward compatibility.")]
public class RefreshTokenRequestDto
{
    /// <summary>
    /// Refresh Token hiện tại (không còn sử dụng - lấy từ Cookie)
    /// </summary>
    public string? RefreshToken { get; set; }
}
