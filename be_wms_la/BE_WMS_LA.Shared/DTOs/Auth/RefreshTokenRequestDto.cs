using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Auth;

/// <summary>
/// DTO cho request làm mới token
/// </summary>
public class RefreshTokenRequestDto
{
    /// <summary>
    /// Refresh Token hiện tại
    /// </summary>
    [Required(ErrorMessage = "Refresh Token là bắt buộc")]
    public string RefreshToken { get; set; } = string.Empty;
}
