 using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Đơn đặt hàng nhập từ nhà cung cấp
/// </summary>
[Table("PurchaseOrders")]
public class PurchaseOrder
{
    [Key]
    public Guid PurchaseOrderID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Mã đơn nhập (VD: PO-2024-001)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string OrderCode { get; set; } = string.Empty;

    /// <summary>
    /// FK: Nhà cung cấp
    /// </summary>
    [Required]
    public Guid SupplierID { get; set; }

    /// <summary>
    /// FK: Kho nhận hàng
    /// </summary>
    [Required]
    public Guid WarehouseID { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Ngày dự kiến giao hàng
    /// </summary>
    public DateOnly? ExpectedDeliveryDate { get; set; }

    /// <summary>
    /// Ngày thực tế nhận hàng
    /// </summary>
    public DateOnly? ActualDeliveryDate { get; set; }

    /// <summary>
    /// Trạng thái: PENDING, CONFIRMED, DELIVERED, CANCELLED
    /// </summary>
    [StringLength(50)]
    public string Status { get; set; } = "PENDING";

    /// <summary>
    /// Tổng tiền chưa chiết khấu
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal TotalAmount { get; set; } = 0;

    /// <summary>
    /// Số tiền chiết khấu
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal DiscountAmount { get; set; } = 0;

    /// <summary>
    /// Số tiền thực trả = Total - Discount
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal FinalAmount { get; set; } = 0;

    /// <summary>
    /// FK: Người tạo đơn
    /// </summary>
    public Guid? CreatedByUserID { get; set; }

    public string? Notes { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(SupplierID))]
    public virtual Supplier Supplier { get; set; } = null!;

    [ForeignKey(nameof(WarehouseID))]
    public virtual Warehouse Warehouse { get; set; } = null!;

    [ForeignKey(nameof(CreatedByUserID))]
    public virtual User? CreatedByUser { get; set; }

    public virtual ICollection<PurchaseOrderDetail> Details { get; set; } = new List<PurchaseOrderDetail>();

    public virtual ICollection<PurchaseOrderHistory> History { get; set; } = new List<PurchaseOrderHistory>();

    #endregion
}
