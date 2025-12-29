using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Quản lý đơn sửa chữa / bảo hành
/// </summary>
[Table("Repairs")]
public class Repair
{
    [Key]
    public Guid RepairID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Mã phiếu sửa chữa (VD: RP-2024-001)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string RepairCode { get; set; } = string.Empty;

    /// <summary>
    /// FK: Khách hàng mang máy đến sửa
    /// </summary>
    [Required]
    public Guid CustomerID { get; set; }

    /// <summary>
    /// FK: Máy cụ thể cần sửa (nếu có trong hệ thống)
    /// </summary>
    public Guid? InstanceID { get; set; }

    /// <summary>
    /// FK: Loại sản phẩm (nếu máy ngoài hệ thống)
    /// </summary>
    public Guid? ComponentID { get; set; }

    /// <summary>
    /// Mô tả lỗi/triệu chứng do khách báo
    /// </summary>
    [Required]
    public string ProblemDescription { get; set; } = string.Empty;

    public DateTime RepairDate { get; set; } = DateTime.UtcNow;

    public DateOnly? ExpectedCompletionDate { get; set; }

    public DateOnly? ActualCompletionDate { get; set; }

    /// <summary>
    /// Trạng thái: PENDING, IN_PROGRESS, COMPLETED, CANCELLED, AWAITING_PARTS
    /// </summary>
    [StringLength(50)]
    public string Status { get; set; } = "PENDING";

    /// <summary>
    /// FK: Kỹ thuật viên phụ trách
    /// </summary>
    public Guid? TechnicianUserID { get; set; }

    /// <summary>
    /// Chi phí công sửa chữa
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal RepairCost { get; set; } = 0;

    /// <summary>
    /// Chi phí linh kiện thay thế
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal PartsCost { get; set; } = 0;

    /// <summary>
    /// Tổng chi phí = RepairCost + PartsCost
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal TotalCost { get; set; } = 0;

    [StringLength(50)]
    public string PaymentStatus { get; set; } = "UNPAID";

    /// <summary>
    /// Loại BH: IN_WARRANTY, OUT_WARRANTY, EXTENDED_WARRANTY
    /// </summary>
    [StringLength(50)]
    public string? WarrantyType { get; set; }

    public string? Notes { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(CustomerID))]
    public virtual Customer Customer { get; set; } = null!;

    [ForeignKey(nameof(InstanceID))]
    public virtual ProductInstance? Instance { get; set; }

    [ForeignKey(nameof(ComponentID))]
    public virtual Component? Component { get; set; }

    [ForeignKey(nameof(TechnicianUserID))]
    public virtual User? Technician { get; set; }

    public virtual ICollection<RepairPart> Parts { get; set; } = new List<RepairPart>();
    public virtual ICollection<RepairStatusHistory> StatusHistory { get; set; } = new List<RepairStatusHistory>();

    #endregion
}
