using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.SalesOrder;

#region List & Detail DTOs

/// <summary>
/// DTO danh sách đơn bán hàng
/// </summary>
public class SalesOrderListDto
{
    public Guid SalesOrderID { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public Guid CustomerID { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerPONumber { get; set; }
    public Guid WarehouseID { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public string OrderType { get; set; } = "SALES";
    public string Status { get; set; } = "PENDING";
    public string PaymentStatus { get; set; } = "UNPAID";
    public decimal SubTotal { get; set; }
    public decimal FinalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public int ItemCount { get; set; }
    public string? SalesPersonName { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO chi tiết đơn bán hàng
/// </summary>
public class SalesOrderDetailDto
{
    public Guid SalesOrderID { get; set; }
    public string OrderCode { get; set; } = string.Empty;

    // Customer info
    public Guid CustomerID { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerCode { get; set; }
    public string? CustomerPhone { get; set; }
    public string? CustomerEmail { get; set; }

    // Customer PO
    public string? CustomerPONumber { get; set; }
    public DateTime? CustomerPODate { get; set; }
    public string? CustomerReference { get; set; }

    // Warehouse
    public Guid WarehouseID { get; set; }
    public string WarehouseName { get; set; } = string.Empty;

    // Order info
    public DateTime OrderDate { get; set; }
    public string OrderType { get; set; } = "SALES";
    public string Status { get; set; } = "PENDING";

    // Amount
    public decimal SubTotal { get; set; }
    public decimal TaxRate { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal FinalAmount { get; set; }
    public string Currency { get; set; } = "VND";

    // Payment
    public string PaymentStatus { get; set; } = "UNPAID";
    public string? PaymentMethod { get; set; }
    public DateTime? PaymentDueDate { get; set; }
    public decimal PaidAmount { get; set; }

    // Shipping
    public string? ShippingMethod { get; set; }
    public string? ShippingPartner { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? ExpectedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }

    // Shipping address
    public string? ShippingContactName { get; set; }
    public string? ShippingPhone { get; set; }
    public string? ShippingAddress { get; set; }
    public string? ShippingCity { get; set; }
    public string? ShippingDistrict { get; set; }
    public string? ShippingWard { get; set; }
    public string? ShippingNotes { get; set; }

    // Staff
    public Guid? SalesPersonID { get; set; }
    public string? SalesPersonName { get; set; }
    public Guid? CreatedByUserID { get; set; }
    public string? CreatedByName { get; set; }
    public Guid? ApprovedByUserID { get; set; }
    public string? ApprovedByName { get; set; }
    public DateTime? ApprovedAt { get; set; }

    // Notes
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Details
    public List<SalesOrderDetailItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO chi tiết từng dòng sản phẩm trong đơn bán
/// </summary>
public class SalesOrderDetailItemDto
{
    public Guid SalesOrderDetailID { get; set; }
    public Guid ComponentID { get; set; }
    public string ComponentSKU { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public string? ImageURL { get; set; }
    public Guid? VariantID { get; set; }
    public string? PartNumber { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal TotalPrice { get; set; }
    public int WarrantyMonths { get; set; }
    public string? Notes { get; set; }
    public List<string>? SerialNumbers { get; set; }
}

#endregion

#region Create & Update DTOs

/// <summary>
/// DTO tạo đơn bán hàng mới
/// </summary>
public class CreateSalesOrderDto
{
    [StringLength(50)]
    public string? OrderCode { get; set; }

    [Required(ErrorMessage = "Khách hàng là bắt buộc")]
    public Guid CustomerID { get; set; }

    [Required(ErrorMessage = "Kho xuất là bắt buộc")]
    public Guid WarehouseID { get; set; }

    [StringLength(100)]
    public string? CustomerPONumber { get; set; }

    public DateTime? CustomerPODate { get; set; }

    [StringLength(200)]
    public string? CustomerReference { get; set; }

    public DateTime? OrderDate { get; set; }

    [StringLength(50)]
    public string OrderType { get; set; } = "SALES";

    public decimal TaxRate { get; set; } = 10;
    public decimal DiscountAmount { get; set; } = 0;
    public decimal ShippingFee { get; set; } = 0;

    [StringLength(10)]
    public string Currency { get; set; } = "VND";

    [StringLength(50)]
    public string? PaymentMethod { get; set; }

    public DateTime? PaymentDueDate { get; set; }

    // Shipping
    [StringLength(50)]
    public string? ShippingMethod { get; set; }

    [StringLength(200)]
    public string? ShippingContactName { get; set; }

    [StringLength(20)]
    public string? ShippingPhone { get; set; }

    [StringLength(500)]
    public string? ShippingAddress { get; set; }

    [StringLength(100)]
    public string? ShippingCity { get; set; }

    [StringLength(100)]
    public string? ShippingDistrict { get; set; }

    [StringLength(100)]
    public string? ShippingWard { get; set; }

    public string? ShippingNotes { get; set; }

    // Staff
    public Guid? SalesPersonID { get; set; }

    // Notes
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }

    [Required(ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm")]
    [MinLength(1, ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm")]
    public List<CreateSalesOrderDetailDto> Items { get; set; } = new();
}

/// <summary>
/// DTO chi tiết sản phẩm khi tạo đơn bán
/// </summary>
public class CreateSalesOrderDetailDto
{
    [Required]
    public Guid ComponentID { get; set; }

    public Guid? VariantID { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    [Range(0, double.MaxValue)]
    public decimal UnitPrice { get; set; }

    public decimal DiscountAmount { get; set; } = 0;

    public int WarrantyMonths { get; set; } = 12;

    public string? Notes { get; set; }

    /// <summary>
    /// Danh sách serial (cho sản phẩm quản lý theo serial)
    /// </summary>
    public List<string>? SerialNumbers { get; set; }
}

/// <summary>
/// DTO cập nhật đơn bán hàng
/// </summary>
public class UpdateSalesOrderDto
{
    public decimal? TaxRate { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? ShippingFee { get; set; }

    [StringLength(50)]
    public string? PaymentMethod { get; set; }

    public DateTime? PaymentDueDate { get; set; }

    // Shipping
    [StringLength(50)]
    public string? ShippingMethod { get; set; }

    [StringLength(200)]
    public string? ShippingContactName { get; set; }

    [StringLength(20)]
    public string? ShippingPhone { get; set; }

    [StringLength(500)]
    public string? ShippingAddress { get; set; }

    [StringLength(100)]
    public string? ShippingCity { get; set; }

    public string? ShippingNotes { get; set; }

    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }

    public List<CreateSalesOrderDetailDto>? Items { get; set; }
}

/// <summary>
/// DTO cập nhật trạng thái đơn bán
/// </summary>
public class UpdateSalesOrderStatusDto
{
    [Required]
    [StringLength(50)]
    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}

/// <summary>
/// DTO thêm thanh toán
/// </summary>
public class AddPaymentDto
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Số tiền phải > 0")]
    public decimal Amount { get; set; }

    [StringLength(50)]
    public string? PaymentMethod { get; set; }

    public DateTime? PaymentDate { get; set; }

    public string? Notes { get; set; }
}

#endregion

#region Statistics

/// <summary>
/// Thống kê đơn bán hàng
/// </summary>
public class SalesOrderStatisticsDto
{
    public int TotalOrders { get; set; }
    public int DraftOrders { get; set; }
    public int PendingOrders { get; set; }
    public int ConfirmedOrders { get; set; }
    public int ShippedOrders { get; set; }
    public int DeliveredOrders { get; set; }
    public int CompletedOrders { get; set; }
    public int CancelledOrders { get; set; }

    public int UnpaidOrders { get; set; }
    public int PartialPaidOrders { get; set; }
    public int PaidOrders { get; set; }

    public decimal TotalRevenueThisMonth { get; set; }
    public decimal TotalRevenueThisYear { get; set; }
    public int OrdersThisMonth { get; set; }
}

#endregion
