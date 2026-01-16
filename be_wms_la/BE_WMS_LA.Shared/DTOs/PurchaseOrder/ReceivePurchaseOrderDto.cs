namespace BE_WMS_LA.Shared.DTOs.PurchaseOrder;

/// <summary>
/// DTO để nhận hàng từ Purchase Order
/// </summary>
public class ReceivePurchaseOrderDto
{
    /// <summary>
    /// Danh sách items đang nhận
    /// </summary>
    public List<ReceiveItemDto> Items { get; set; } = new();

    /// <summary>
    /// Ngày nhận hàng (mặc định: ngày hiện tại)
    /// </summary>
    public DateTime? ReceivedDate { get; set; }

    /// <summary>
    /// Ghi chú chung cho lần nhận hàng này
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// DTO cho mỗi item được nhận
/// </summary>
public class ReceiveItemDto
{
    /// <summary>
    /// ID của PurchaseOrderDetail (item trong PO)
    /// </summary>
    public Guid PurchaseOrderDetailID { get; set; }

    /// <summary>
    /// Số lượng nhận (cho vật tư không có serial)
    /// </summary>
    public int Quantity { get; set; } = 1;

    /// <summary>
    /// Serial Number (bắt buộc cho thiết bị có serial)
    /// </summary>
    public string? SerialNumber { get; set; }

    /// <summary>
    /// Model Number (legacy field)
    /// </summary>
    public string? ModelNumber { get; set; }

    /// <summary>
    /// Mã thùng hàng
    /// </summary>
    public string? InboundBoxNumber { get; set; }

    /// <summary>
    /// Part Number / VariantID
    /// </summary>
    public Guid? VariantID { get; set; }

    /// <summary>
    /// IMEI chính (cho điện thoại, PDA)
    /// </summary>
    public string? IMEI1 { get; set; }

    /// <summary>
    /// IMEI phụ (máy 2 SIM)
    /// </summary>
    public string? IMEI2 { get; set; }

    /// <summary>
    /// MAC Address
    /// </summary>
    public string? MACAddress { get; set; }

    /// <summary>
    /// Vị trí trong kho
    /// </summary>
    public string? LocationCode { get; set; }

    /// <summary>
    /// Khu vực (MAIN, REPAIR, DEMO, QUARANTINE)
    /// </summary>
    public string? Zone { get; set; }

    /// <summary>
    /// Giá nhập thực tế (nếu khác giá đơn hàng)
    /// </summary>
    public decimal? ActualImportPrice { get; set; }

    /// <summary>
    /// Số tháng bảo hành
    /// </summary>
    public int? WarrantyMonths { get; set; }

    /// <summary>
    /// Ghi chú riêng cho item này
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// Response sau khi nhận hàng thành công
/// </summary>
public class ReceiveResultDto
{
    public Guid PurchaseOrderID { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public int ReceivedItemsCount { get; set; }
    public string NewStatus { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Danh sách serial numbers đã nhận thành công
    /// </summary>
    public List<string> ReceivedSerials { get; set; } = new();
}

/// <summary>
/// DTO trả về danh sách ProductInstance đã nhận cho một PurchaseOrderDetail
/// </summary>
public class ReceivedInstanceDto
{
    public Guid InstanceID { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? IMEI1 { get; set; }
    public string? IMEI2 { get; set; }
    public string? MACAddress { get; set; }
    public string Status { get; set; } = "IN_STOCK";
    public string? LocationCode { get; set; }
    public string? Zone { get; set; }
    public DateTime ImportDate { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// DTO chi tiết các item đã nhận cho một PO, bao gồm danh sách serial (nếu có)
/// </summary>
public class ReceivedItemDetailDto
{
    public Guid PurchaseOrderDetailID { get; set; }
    public Guid ComponentID { get; set; }
    public string ComponentSKU { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public string? ImageURL { get; set; }
    public bool IsSerialized { get; set; }
    public int OrderedQuantity { get; set; }
    public int ReceivedQuantity { get; set; }
    public decimal UnitPrice { get; set; }

    /// <summary>
    /// Danh sách serial đã nhận (chỉ có khi IsSerialized = true)
    /// </summary>
    public List<ReceivedInstanceDto> Instances { get; set; } = new();
}

/// <summary>
/// Response chứa tất cả thông tin hàng đã nhập cho một PO
/// </summary>
public class ReceivedItemsResponseDto
{
    public Guid PurchaseOrderID { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string WarehouseName { get; set; } = string.Empty;
    public int TotalReceivedQuantity { get; set; }
    public int TotalSerializedItems { get; set; }
    public int TotalNonSerializedItems { get; set; }
    public List<ReceivedItemDetailDto> Items { get; set; } = new();
}
