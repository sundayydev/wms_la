using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Linh kiện thay thế trong quá trình sửa chữa
/// </summary>
[Table("RepairParts")]
public class RepairPart
{
    [Key]
    public Guid RepairPartID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK: Đơn sửa chữa
    /// </summary>
    [Required]
    public Guid RepairID { get; set; }

    /// <summary>
    /// FK: Loại linh kiện thay
    /// </summary>
    [Required]
    public Guid ComponentID { get; set; }

    /// <summary>
    /// FK: Linh kiện cụ thể (nếu có Serial)
    /// </summary>
    public Guid? InstanceID { get; set; }

    /// <summary>
    /// Số lượng sử dụng
    /// </summary>
    [Required]
    public int Quantity { get; set; }

    /// <summary>
    /// Đơn giá linh kiện
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal UnitPrice { get; set; }

    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal TotalPrice { get; set; }

    public string? Notes { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(RepairID))]
    public virtual Repair Repair { get; set; } = null!;

    [ForeignKey(nameof(ComponentID))]
    public virtual Component Component { get; set; } = null!;

    [ForeignKey(nameof(InstanceID))]
    public virtual ProductInstance? Instance { get; set; }

    #endregion
}
