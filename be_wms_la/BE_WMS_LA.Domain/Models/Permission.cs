using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Quản lý phân quyền trong hệ thống
/// </summary>
[Table("Permission")]
public class Permission
{
    /// <summary>
    /// Khóa chính UUID, tự động tạo
    /// </summary>
    [Key]
    public Guid PermissionID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Tên quyền (ví dụ: CREATE_USER, VIEW_WAREHOUSE, MANAGE_INVENTORY)
    /// </summary>
    [Required]
    [StringLength(100)]
    public string PermissionName { get; set; } = string.Empty;

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
    /// Danh sách phân quyền người dùng liên kết với quyền này
    /// </summary>
    public virtual ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();

    #endregion
}
