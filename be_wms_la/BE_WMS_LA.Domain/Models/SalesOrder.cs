using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Đơn bán hàng cho khách
/// </summary>
[Table("SalesOrders")]
public class SalesOrder
{
    [Key]
    public Guid SalesOrderID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Mã đơn bán (VD: SO-2024-001)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string OrderCode { get; set; } = string.Empty;

    /// <summary>
    /// FK: Khách hàng
    /// </summary>
    [Required]
    public Guid CustomerID { get; set; }

    /// <summary>
    /// FK: Kho xuất hàng
    /// </summary>
    [Required]
    public Guid WarehouseID { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Trạng thái đơn: PENDING, CONFIRMED, COMPLETED, CANCELLED
    /// </summary>
    [StringLength(50)]
    public string Status { get; set; } = "PENDING";

    [Column(TypeName = "decimal(15,2)")]
    public decimal TotalAmount { get; set; } = 0;

    [Column(TypeName = "decimal(15,2)")]
    public decimal DiscountAmount { get; set; } = 0;

    [Column(TypeName = "decimal(15,2)")]
    public decimal FinalAmount { get; set; } = 0;

    /// <summary>
    /// Trạng thái thanh toán: UNPAID, PARTIAL, PAID
    /// </summary>
    [StringLength(50)]
    public string PaymentStatus { get; set; } = "UNPAID";

    /// <summary>
    /// Phương thức: CASH, BANK_TRANSFER, MOMO, CREDIT_CARD
    /// </summary>
    [StringLength(50)]
    public string? PaymentMethod { get; set; }

    public Guid? CreatedByUserID { get; set; }

    public string? Notes { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(CustomerID))]
    public virtual Customer Customer { get; set; } = null!;

    [ForeignKey(nameof(WarehouseID))]
    public virtual Warehouse Warehouse { get; set; } = null!;

    [ForeignKey(nameof(CreatedByUserID))]
    public virtual User? CreatedByUser { get; set; }

    public virtual ICollection<SalesOrderDetail> Details { get; set; } = new List<SalesOrderDetail>();

    #endregion
}
