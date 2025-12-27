using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Auth;

/// <summary>
/// DTO cho request đăng nhập
/// </summary>
public class LoginRequestDto
{
    /// <summary>
    /// Tên đăng nhập
    /// </summary>
    [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
    [StringLength(50, ErrorMessage = "Tên đăng nhập không được vượt quá 50 ký tự")]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Mật khẩu
    /// </summary>
    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6 đến 100 ký tự")]
    public string Password { get; set; } = string.Empty;
}
