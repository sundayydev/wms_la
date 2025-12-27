using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Quản lý người dùng hệ thống (Admin, Nhân viên bán hàng, Kỹ thuật viên, Thủ kho)
/// </summary>
[Table("User")]
public class User
{
    /// <summary>
    /// Khóa chính UUID, tự động tạo
    /// </summary>
    [Key]
    public Guid UserID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Tên đăng nhập, duy nhất trong hệ thống
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Mật khẩu đã được mã hóa (BCrypt/Argon2)
    /// </summary>
    [Required]
    [StringLength(255)]
    public string Password { get; set; } = string.Empty;

    #region Thông tin cá nhân

    /// <summary>
    /// Họ và tên đầy đủ của người dùng
    /// </summary>
    [Required]
    [StringLength(100)]
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Đường dẫn ảnh đại diện (URL)
    /// </summary>
    [StringLength(500)]
    public string? Avatar { get; set; }

    /// <summary>
    /// Email người dùng, dùng để khôi phục mật khẩu
    /// </summary>
    [Required]
    [StringLength(100)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Số điện thoại liên hệ
    /// </summary>
    [Required]
    [StringLength(20)]
    [Phone]
    public string PhoneNumber { get; set; } = string.Empty;

    /// <summary>
    /// Ngày sinh của người dùng
    /// </summary>
    public DateOnly? DateOfBirth { get; set; }

    /// <summary>
    /// Giới tính: MALE, FEMALE, OTHER
    /// </summary>
    [StringLength(10)]
    public string? Gender { get; set; }

    #endregion

    #region Địa chỉ

    /// <summary>
    /// Địa chỉ chi tiết
    /// </summary>
    [StringLength(500)]
    public string? Address { get; set; }

    #endregion

    #region Phân quyền và gán kho

    /// <summary>
    /// Vai trò: ADMIN, RECEPTIONIST, TECHNICIAN, WAREHOUSE
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Role { get; set; } = string.Empty;

    /// <summary>
    /// FK: Kho được gán cho nhân viên (nullable cho Admin)
    /// </summary>
    public Guid? WarehouseID { get; set; }

    #endregion

    #region Trạng thái tài khoản

    /// <summary>
    /// Trạng thái hoạt động (TRUE = đang làm việc)
    /// </summary>
    [Required]
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Tài khoản bị khóa (do đăng nhập sai quá nhiều lần)
    /// </summary>
    [Required]
    public bool IsLocked { get; set; } = false;

    /// <summary>
    /// Số lần đăng nhập sai liên tiếp
    /// </summary>
    public int FailedLoginAttempts { get; set; } = 0;

    /// <summary>
    /// Thời điểm hết khóa tài khoản
    /// </summary>
    public DateTime? LockedUntil { get; set; }

    #endregion

    #region Authentication & Session

    /// <summary>
    /// Thời điểm đăng nhập gần nhất
    /// </summary>
    public DateTime? LastLoginAt { get; set; }

    /// <summary>
    /// Địa chỉ IP lần đăng nhập cuối
    /// </summary>
    [StringLength(50)]
    public string? LastLoginIP { get; set; }

    /// <summary>
    /// Thời điểm thay đổi mật khẩu gần nhất
    /// </summary>
    public DateTime? PasswordChangedAt { get; set; }

    #endregion

    #region Audit fields

    /// <summary>
    /// Thời điểm tạo bản ghi
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Thời điểm cập nhật gần nhất
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Soft delete - ngày xóa (NULL = chưa xóa)
    /// </summary>
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    /// <summary>
    /// Kho được gán cho nhân viên
    /// </summary>
    [ForeignKey(nameof(WarehouseID))]
    public virtual Warehouse? Warehouse { get; set; }

    /// <summary>
    /// Danh sách quyền được phân cho người dùng
    /// </summary>
    public virtual ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();

    #endregion
}

