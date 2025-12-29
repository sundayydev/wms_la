using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Chi tiết từng dòng sản phẩm trong đơn nhập
/// </summary>
[Table("PurchaseOrderDetails")]
public class PurchaseOrderDetail
{
    [Key]
    public Guid PurchaseOrderDetailID { get; set; } = Guid.NewGuid();

    [Required]
    public Guid PurchaseOrderID { get; set; }

    /// <summary>
    /// FK: Sản phẩm nhập
    /// </summary>
    [Required]
    public Guid ComponentID { get; set; }

    /// <summary>
    /// Số lượng đặt
    /// </summary>
    [Required]
    public int Quantity { get; set; }

    /// <summary>
    /// Đơn giá
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Thành tiền = Quantity x UnitPrice
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal TotalPrice { get; set; }

    /// <summary>
    /// Số lượng đã nhận thực tế
    /// </summary>
    public int ReceivedQuantity { get; set; } = 0;

    public string? Notes { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(PurchaseOrderID))]
    public virtual PurchaseOrder PurchaseOrder { get; set; } = null!;

    [ForeignKey(nameof(ComponentID))]
    public virtual Component Component { get; set; } = null!;

    #endregion
}
