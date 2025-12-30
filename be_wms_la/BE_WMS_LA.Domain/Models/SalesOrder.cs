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
    /// Mã đơn bán nội bộ (VD: SO-2024-001)
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

    #region Mã PO từ Khách hàng

    /// <summary>
    /// Mã PO của khách hàng (VD: PO-ABC-2024-123)
    /// </summary>
    [StringLength(100)]
    public string? CustomerPONumber { get; set; }

    /// <summary>
    /// Ngày PO của khách hàng
    /// </summary>
    public DateTime? CustomerPODate { get; set; }

    /// <summary>
    /// Thông tin tham chiếu khác từ khách (VD: Số hợp đồng)
    /// </summary>
    [StringLength(200)]
    public string? CustomerReference { get; set; }

    #endregion

    #region Liên kết Báo giá

    /// <summary>
    /// FK: Báo giá đã được chấp nhận (nếu có)
    /// </summary>
    public Guid? QuotationID { get; set; }

    #endregion

    #region Thông tin đơn hàng

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Loại đơn: SALES (Bán), DEMO (Xuất demo), CONSIGNMENT (Ký gửi)
    /// </summary>
    [StringLength(50)]
    public string OrderType { get; set; } = "SALES";

    /// <summary>
    /// Trạng thái: DRAFT, PENDING, CONFIRMED, PROCESSING, READY_TO_SHIP, SHIPPED, DELIVERED, COMPLETED, CANCELLED
    /// </summary>
    [StringLength(50)]
    public string Status { get; set; } = "PENDING";

    #endregion

    #region Giá trị đơn hàng

    /// <summary>
    /// Tổng tiền hàng (chưa VAT, chưa giảm giá)
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal SubTotal { get; set; } = 0;

    /// <summary>
    /// Thuế suất VAT (%)
    /// </summary>
    [Column(TypeName = "decimal(5,2)")]
    public decimal TaxRate { get; set; } = 10;

    /// <summary>
    /// Tiền thuế VAT
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal TaxAmount { get; set; } = 0;

    /// <summary>
    /// Tổng giảm giá
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal DiscountAmount { get; set; } = 0;

    /// <summary>
    /// Phí vận chuyển
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal ShippingFee { get; set; } = 0;

    /// <summary>
    /// Tổng sau thuế, giảm giá
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal TotalAmount { get; set; } = 0;

    /// <summary>
    /// Số tiền phải thanh toán
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal FinalAmount { get; set; } = 0;

    /// <summary>
    /// Loại tiền tệ
    /// </summary>
    [StringLength(10)]
    public string Currency { get; set; } = "VND";

    #endregion

    #region Thanh toán

    /// <summary>
    /// Trạng thái thanh toán: UNPAID, PARTIAL, PAID
    /// </summary>
    [StringLength(50)]
    public string PaymentStatus { get; set; } = "UNPAID";

    /// <summary>
    /// Phương thức: CASH, BANK_TRANSFER, MOMO, CREDIT_CARD, COD
    /// </summary>
    [StringLength(50)]
    public string? PaymentMethod { get; set; }

    /// <summary>
    /// Hạn thanh toán
    /// </summary>
    public DateTime? PaymentDueDate { get; set; }

    /// <summary>
    /// Số tiền đã thanh toán
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal PaidAmount { get; set; } = 0;

    #endregion

    #region Giao hàng

    /// <summary>
    /// Phương thức giao hàng: STORE_PICKUP, DELIVERY, SHIPPING_PARTNER
    /// </summary>
    [StringLength(50)]
    public string? ShippingMethod { get; set; }

    /// <summary>
    /// Tên đơn vị vận chuyển (VD: GHTK, GHN, Viettel Post)
    /// </summary>
    [StringLength(100)]
    public string? ShippingPartner { get; set; }

    /// <summary>
    /// Mã vận đơn
    /// </summary>
    [StringLength(100)]
    public string? TrackingNumber { get; set; }

    /// <summary>
    /// Ngày giao dự kiến
    /// </summary>
    public DateTime? ExpectedDeliveryDate { get; set; }

    /// <summary>
    /// Ngày giao thực tế
    /// </summary>
    public DateTime? ActualDeliveryDate { get; set; }

    #endregion

    #region Địa chỉ giao hàng

    /// <summary>
    /// Tên người nhận
    /// </summary>
    [StringLength(200)]
    public string? ShippingContactName { get; set; }

    /// <summary>
    /// SĐT người nhận
    /// </summary>
    [StringLength(20)]
    public string? ShippingPhone { get; set; }

    /// <summary>
    /// Địa chỉ giao hàng
    /// </summary>
    [StringLength(500)]
    public string? ShippingAddress { get; set; }

    [StringLength(100)]
    public string? ShippingCity { get; set; }

    [StringLength(100)]
    public string? ShippingDistrict { get; set; }

    [StringLength(100)]
    public string? ShippingWard { get; set; }

    /// <summary>
    /// Ghi chú giao hàng
    /// </summary>
    public string? ShippingNotes { get; set; }

    #endregion

    #region Nhân viên

    /// <summary>
    /// FK: Nhân viên bán hàng phụ trách
    /// </summary>
    public Guid? SalesPersonID { get; set; }

    /// <summary>
    /// FK: Người tạo đơn
    /// </summary>
    public Guid? CreatedByUserID { get; set; }

    /// <summary>
    /// FK: Người duyệt đơn
    /// </summary>
    public Guid? ApprovedByUserID { get; set; }

    /// <summary>
    /// Thời điểm duyệt
    /// </summary>
    public DateTime? ApprovedAt { get; set; }

    #endregion

    /// <summary>
    /// Ghi chú (khách thấy)
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Ghi chú nội bộ (khách không thấy)
    /// </summary>
    public string? InternalNotes { get; set; }

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

    [ForeignKey(nameof(SalesPersonID))]
    public virtual User? SalesPerson { get; set; }

    [ForeignKey(nameof(CreatedByUserID))]
    public virtual User? CreatedByUser { get; set; }

    [ForeignKey(nameof(ApprovedByUserID))]
    public virtual User? ApprovedByUser { get; set; }

    public virtual ICollection<SalesOrderDetail> Details { get; set; } = new List<SalesOrderDetail>();

    #endregion
}
