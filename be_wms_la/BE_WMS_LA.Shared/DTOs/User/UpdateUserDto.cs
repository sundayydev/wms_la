using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.User;

/// <summary>
/// DTO cập nhật thông tin người dùng
/// </summary>
public class UpdateUserDto
{
    /// <summary>
    /// Họ và tên
    /// </summary>
    [StringLength(100, ErrorMessage = "Họ và tên tối đa 100 ký tự")]
    public string? FullName { get; set; }

    /// <summary>
    /// Email
    /// </summary>
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    [StringLength(100)]
    public string? Email { get; set; }

    /// <summary>
    /// Số điện thoại
    /// </summary>
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Ngày sinh
    /// </summary>
    public DateOnly? DateOfBirth { get; set; }

    /// <summary>
    /// Giới tính
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
    /// Vai trò
    /// </summary>
    [StringLength(50)]
    public string? Role { get; set; }

    /// <summary>
    /// ID kho được gán
    /// </summary>
    public Guid? WarehouseID { get; set; }

    /// <summary>
    /// Trạng thái hoạt động
    /// </summary>
    public bool? IsActive { get; set; }
}
