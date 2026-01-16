using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.PurchaseOrder;

#region List & Detail DTOs

/// <summary>
/// DTO danh sách đơn mua hàng
/// </summary>
public class PurchaseOrderListDto
{
    public Guid PurchaseOrderID { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public Guid SupplierID { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public Guid WarehouseID { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public DateOnly? ExpectedDeliveryDate { get; set; }
    public string Status { get; set; } = "PENDING";
    public decimal TotalAmount { get; set; }
    public decimal FinalAmount { get; set; }

    // Item counts
    public int ItemCount { get; set; }
    public int ReceivedItemCount { get; set; }

    // Quantity totals
    public int TotalQuantity { get; set; }
    public int ReceivedQuantity { get; set; }

    public string? CreatedByName { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO chi tiết đơn mua hàng
/// </summary>
public class PurchaseOrderDetailDto
{
    public Guid PurchaseOrderID { get; set; }
    public string OrderCode { get; set; } = string.Empty;

    // Supplier info
    public Guid SupplierID { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public string? SupplierCode { get; set; }
    public string? SupplierPhone { get; set; }
    public string? SupplierEmail { get; set; }

    // Warehouse info
    public Guid WarehouseID { get; set; }
    public string WarehouseName { get; set; } = string.Empty;

    // Dates
    public DateTime OrderDate { get; set; }
    public DateOnly? ExpectedDeliveryDate { get; set; }
    public DateOnly? ActualDeliveryDate { get; set; }

    // Status & Amounts
    public string Status { get; set; } = "PENDING";
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal FinalAmount { get; set; }

    // User info
    public Guid? CreatedByUserID { get; set; }
    public string? CreatedByName { get; set; }

    public string? Notes { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Details
    public List<PurchaseOrderDetailItemDto> Items { get; set; } = new();
}

/// <summary>
/// DTO chi tiết từng dòng sản phẩm trong đơn
/// </summary>
public class PurchaseOrderDetailItemDto
{
    public Guid PurchaseOrderDetailID { get; set; }
    public Guid ComponentID { get; set; }
    public string ComponentSKU { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public string? ImageURL { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public int ReceivedQuantity { get; set; }
    public string? Notes { get; set; }

    /// <summary>
    /// TRUE = Quản lý theo Serial/IMEI (từng chiếc), FALSE = Quản lý theo số lượng
    /// </summary>
    public bool IsSerialized { get; set; }
}

#endregion

#region Create & Update DTOs

/// <summary>
/// DTO tạo đơn mua hàng mới
/// </summary>
public class CreatePurchaseOrderDto
{
    /// <summary>
    /// Mã đơn (nếu không nhập sẽ tự sinh)
    /// </summary>
    [StringLength(50)]
    public string? OrderCode { get; set; }

    /// <summary>
    /// Nhà cung cấp
    /// </summary>
    [Required(ErrorMessage = "Nhà cung cấp là bắt buộc")]
    public Guid SupplierID { get; set; }

    /// <summary>
    /// Kho nhận hàng
    /// </summary>
    [Required(ErrorMessage = "Kho nhận hàng là bắt buộc")]
    public Guid WarehouseID { get; set; }

    /// <summary>
    /// Ngày đặt hàng
    /// </summary>
    public DateTime? OrderDate { get; set; }

    /// <summary>
    /// Ngày dự kiến giao
    /// </summary>
    public DateOnly? ExpectedDeliveryDate { get; set; }

    /// <summary>
    /// Số tiền chiết khấu
    /// </summary>
    public decimal DiscountAmount { get; set; } = 0;

    public string? Notes { get; set; }

    /// <summary>
    /// Chi tiết sản phẩm
    /// </summary>
    [Required(ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm")]
    [MinLength(1, ErrorMessage = "Đơn hàng phải có ít nhất 1 sản phẩm")]
    public List<CreatePurchaseOrderDetailDto> Items { get; set; } = new();
}

/// <summary>
/// DTO chi tiết sản phẩm khi tạo đơn
/// </summary>
public class CreatePurchaseOrderDetailDto
{
    [Required(ErrorMessage = "Sản phẩm là bắt buộc")]
    public Guid ComponentID { get; set; }

    [Required(ErrorMessage = "Số lượng là bắt buộc")]
    [Range(1, int.MaxValue, ErrorMessage = "Số lượng phải >= 1")]
    public int Quantity { get; set; }

    [Required(ErrorMessage = "Đơn giá là bắt buộc")]
    [Range(0, double.MaxValue, ErrorMessage = "Đơn giá phải >= 0")]
    public decimal UnitPrice { get; set; }

    public string? Notes { get; set; }
}

/// <summary>
/// DTO cập nhật đơn mua hàng
/// </summary>
public class UpdatePurchaseOrderDto
{
    public DateOnly? ExpectedDeliveryDate { get; set; }
    public decimal? DiscountAmount { get; set; }
    public string? Notes { get; set; }

    /// <summary>
    /// Cập nhật danh sách sản phẩm (thay thế hoàn toàn)
    /// </summary>
    public List<CreatePurchaseOrderDetailDto>? Items { get; set; }
}

/// <summary>
/// DTO cập nhật trạng thái đơn
/// </summary>
public class UpdatePurchaseOrderStatusDto
{
    [Required]
    [StringLength(50)]
    public string Status { get; set; } = string.Empty;

    public DateOnly? ActualDeliveryDate { get; set; }
    public string? Notes { get; set; }
}

#endregion

#region Statistics

/// <summary>
/// Thống kê đơn mua hàng
/// </summary>
public class PurchaseOrderStatisticsDto
{
    public int TotalOrders { get; set; }
    public int PendingOrders { get; set; }
    public int ConfirmedOrders { get; set; }
    public int DeliveredOrders { get; set; }
    public int CancelledOrders { get; set; }
    public decimal TotalAmountThisMonth { get; set; }
    public decimal TotalAmountThisYear { get; set; }
    public int OrdersThisMonth { get; set; }
}

#endregion
