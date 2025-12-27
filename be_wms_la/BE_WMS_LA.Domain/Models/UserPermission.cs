using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Bảng trung gian phân quyền người dùng - liên kết User với Permission
/// </summary>
[Table("UserPermission")]
public class UserPermission
{
    /// <summary>
    /// Khóa chính UUID, tự động tạo
    /// </summary>
    [Key]
    public Guid UserPermissionID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK: Người dùng được phân quyền
    /// </summary>
    [Required]
    public Guid UserID { get; set; }

    /// <summary>
    /// FK: Quyền được gán cho người dùng
    /// </summary>
    [Required]
    public Guid PermissionID { get; set; }

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
    /// Người dùng được phân quyền
    /// </summary>
    [ForeignKey(nameof(UserID))]
    public virtual User? User { get; set; }

    /// <summary>
    /// Quyền được gán
    /// </summary>
    [ForeignKey(nameof(PermissionID))]
    public virtual Permission? Permission { get; set; }

    #endregion
}
