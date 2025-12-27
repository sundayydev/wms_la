namespace BE_WMS_LA.Shared.DTOs.Auth;

/// <summary>
/// DTO chứa thông tin cơ bản của user
/// </summary>
public class UserInfoDto
{
    /// <summary>
    /// ID của user
    /// </summary>
    public Guid UserID { get; set; }

    /// <summary>
    /// Tên đăng nhập
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Họ và tên đầy đủ
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Email
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Số điện thoại
    /// </summary>
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Ngày sinh
    /// </summary>
    public DateTime? DateOfBirth { get; set; }

    /// <summary>
    /// Giới tính
    /// </summary>
    public string? Gender { get; set; }

    /// <summary>
    /// Địa chỉ
    /// </summary>
    public string? Address { get; set; }

    /// <summary>
    /// Đường dẫn ảnh đại diện
    /// </summary>
    public string? Avatar { get; set; }

    /// <summary>
    /// Vai trò trong hệ thống
    /// </summary>
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// Trạng thái hoạt động
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Thời gian đăng nhập cuối cùng
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Địa chỉ IP đăng nhập cuối cùng
    /// </summary>
    public string? LastLoginIP { get; set; }

    /// <summary>
    /// Thời gian tạo
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Tên kho được gán (nếu có)
    /// </summary>
    public string? WarehouseName { get; set; }

    /// <summary>
    /// ID kho được gán (nếu có)
    /// </summary>
    public Guid? WarehouseID { get; set; }
}
