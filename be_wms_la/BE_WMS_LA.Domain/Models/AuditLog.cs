using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Nhật ký mọi hoạt động trong hệ thống (Security Audit)
/// </summary>
[Table("AuditLogs")]
public class AuditLog
{
    [Key]
    public Guid LogID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK: Người thực hiện (NULL nếu là hệ thống)
    /// </summary>
    public Guid? UserID { get; set; }

    /// <summary>
    /// FK: Kho liên quan (cho đa chi nhánh)
    /// </summary>
    public Guid? WarehouseID { get; set; }

    /// <summary>
    /// Hành động: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT
    /// </summary>
    [Required]
    [StringLength(100)]
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Loại đối tượng: User, Product, Order...
    /// </summary>
    [StringLength(100)]
    public string? EntityType { get; set; }

    /// <summary>
    /// ID của đối tượng bị thay đổi
    /// </summary>
    public Guid? EntityID { get; set; }

    /// <summary>
    /// Giá trị cũ (JSON) - để rollback nếu cần
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? OldValue { get; set; }

    /// <summary>
    /// Giá trị mới (JSON)
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? NewValue { get; set; }

    /// <summary>
    /// Trạng thái: SUCCESS, FAILURE, WARNING
    /// </summary>
    [StringLength(20)]
    public string Status { get; set; } = "SUCCESS";

    /// <summary>
    /// Lưu lỗi nếu Status = FAILURE
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Nguồn: WEB_ADMIN, PDA_APP, MOBILE_APP, SYSTEM_JOB
    /// </summary>
    [StringLength(50)]
    public string? Source { get; set; }

    /// <summary>
    /// Trace ID để gom nhóm log theo request
    /// </summary>
    [StringLength(100)]
    public string? RequestID { get; set; }

    /// <summary>
    /// Địa chỉ IP của người thực hiện
    /// </summary>
    [StringLength(50)]
    public string? IPAddress { get; set; }

    /// <summary>
    /// Thông tin trình duyệt/thiết bị
    /// </summary>
    public string? UserAgent { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    #region Navigation Properties

    [ForeignKey(nameof(UserID))]
    public virtual User? User { get; set; }

    [ForeignKey(nameof(WarehouseID))]
    public virtual Warehouse? Warehouse { get; set; }

    #endregion
}
