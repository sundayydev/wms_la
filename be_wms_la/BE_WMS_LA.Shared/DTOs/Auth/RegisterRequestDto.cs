using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Auth;

/// <summary>
/// DTO cho request đăng ký tài khoản
/// </summary>
public class RegisterRequestDto
{
    /// <summary>
    /// Tên đăng nhập
    /// </summary>
    [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Tên đăng nhập phải từ 3 đến 50 ký tự")]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Mật khẩu
    /// </summary>
    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải từ 6 đến 100 ký tự")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Xác nhận mật khẩu
    /// </summary>
    [Required(ErrorMessage = "Xác nhận mật khẩu là bắt buộc")]
    [Compare("Password", ErrorMessage = "Mật khẩu xác nhận không khớp")]
    public string ConfirmPassword { get; set; } = string.Empty;

    /// <summary>
    /// Họ và tên đầy đủ
    /// </summary>
    [Required(ErrorMessage = "Họ và tên là bắt buộc")]
    [StringLength(100, ErrorMessage = "Họ và tên không được vượt quá 100 ký tự")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Email
    /// </summary>
    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự")]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Số điện thoại
    /// </summary>
    [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Vai trò (chỉ Admin mới được set)
    /// </summary>
    [StringLength(50)]
    public string? Role { get; set; }

    /// <summary>
    /// ID kho được gán
    /// </summary>
    public Guid? WarehouseID { get; set; }
}
