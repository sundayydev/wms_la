using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.User;

/// <summary>
/// DTO tạo người dùng mới
/// </summary>
public class CreateUserDto
{
    /// <summary>
    /// Tên đăng nhập
    /// </summary>
    [Required(ErrorMessage = "Tên đăng nhập là bắt buộc")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Tên đăng nhập từ 3-50 ký tự")]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Mật khẩu
    /// </summary>
    [Required(ErrorMessage = "Mật khẩu là bắt buộc")]
    [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu từ 6-100 ký tự")]
    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// Họ và tên
    /// </summary>
    [Required(ErrorMessage = "Họ và tên là bắt buộc")]
    [StringLength(100, ErrorMessage = "Họ và tên tối đa 100 ký tự")]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Email
    /// </summary>
    [Required(ErrorMessage = "Email là bắt buộc")]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    [StringLength(100)]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Số điện thoại
    /// </summary>
    [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Ngày sinh
    /// </summary>
    public DateOnly? DateOfBirth { get; set; }

    /// <summary>
    /// Giới tính: MALE, FEMALE, OTHER
    /// </summary>
    [StringLength(10)]
    public string? Gender { get; set; }

    /// <summary>
    /// Địa chỉ
    /// </summary>
    [StringLength(500)]
    public string? Address { get; set; }

    /// <summary>
    /// Đường dẫn ảnh đại diện
    /// </summary>
    [StringLength(500)]
    public string? Avatar { get; set; }

    /// <summary>
    /// Vai trò: ADMIN, RECEPTIONIST, TECHNICIAN, WAREHOUSE
    /// </summary>
    [Required(ErrorMessage = "Vai trò là bắt buộc")]
    [StringLength(50)]
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// ID kho được gán (nullable cho Admin)
    /// </summary>
    public Guid? WarehouseID { get; set; }

    /// <summary>
    /// Trạng thái hoạt động
    /// </summary>
    public bool IsActive { get; set; } = true;
}
