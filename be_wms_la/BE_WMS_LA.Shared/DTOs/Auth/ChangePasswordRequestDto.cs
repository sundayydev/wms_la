using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Auth;

/// <summary>
/// DTO cho request đổi mật khẩu
/// </summary>
public class ChangePasswordRequestDto
{
    /// <summary>
    /// Mật khẩu hiện tại
    /// </summary>
    [Required(ErrorMessage = "Mật khẩu hiện tại là bắt buộc")]
    public string CurrentPassword { get; set; } = string.Empty;

    /// <summary>
    /// Mật khẩu mới
    /// </summary>
    [Required(ErrorMessage = "Mật khẩu mới là bắt buộc")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu mới phải từ 6 đến 100 ký tự")]
    public string NewPassword { get; set; } = string.Empty;

    /// <summary>
    /// Xác nhận mật khẩu mới
    /// </summary>
    [Required(ErrorMessage = "Xác nhận mật khẩu mới là bắt buộc")]
    [Compare("NewPassword", ErrorMessage = "Mật khẩu xác nhận không khớp")]
    public string ConfirmNewPassword { get; set; } = string.Empty;
}
