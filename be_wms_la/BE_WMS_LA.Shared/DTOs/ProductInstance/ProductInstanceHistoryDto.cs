namespace BE_WMS_LA.Shared.DTOs.ProductInstance;

/// <summary>
/// DTO lịch sử vòng đời của ProductInstance
/// Tổng hợp từ: InventoryTransactions, PurchaseOrders, SalesOrders, StockTransfers, Repairs, AuditLogs
/// </summary>
public class ProductInstanceLifecycleEventDto
{
    /// <summary>
    /// ID của event (có thể là TransactionID, RepairID, OrderID...)
    /// </summary>
    public Guid EventID { get; set; }

    /// <summary>
    /// Loại sự kiện
    /// </summary>
    public string EventType { get; set; } = string.Empty;

    /// <summary>
    /// Thời điểm xảy ra sự kiện
    /// </summary>
    public DateTime EventDate { get; set; }

    /// <summary>
    /// Tiêu đề sự kiện (VD: "Nhập kho", "Bán hàng", "Chuyển kho")
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Mô tả chi tiết sự kiện
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Trạng thái cũ (nếu có)
    /// </summary>
    public string? OldStatus { get; set; }

    /// <summary>
    /// Trạng thái mới (nếu có)
    /// </summary>
    public string? NewStatus { get; set; }

    /// <summary>
    /// Kho cũ (cho event chuyển kho)
    /// </summary>
    public Guid? OldWarehouseID { get; set; }
    public string? OldWarehouseName { get; set; }

    /// <summary>
    /// Kho mới (cho event chuyển kho hoặc nhập hàng)
    /// </summary>
    public Guid? NewWarehouseID { get; set; }
    public string? NewWarehouseName { get; set; }

    /// <summary>
    /// Người thực hiện hành động
    /// </summary>
    public Guid? PerformedByUserID { get; set; }
    public string? PerformedByUserName { get; set; }

    /// <summary>
    /// Mã tham chiếu (PO Code, SO Code, Transfer Code, Repair Code...)
    /// </summary>
    public string? ReferenceCode { get; set; }

    /// <summary>
    /// Loại tham chiếu (PURCHASE_ORDER, SALES_ORDER, STOCK_TRANSFER, REPAIR, MANUAL)
    /// </summary>
    public string? ReferenceType { get; set; }

    /// <summary>
    /// ID của đối tượng tham chiếu
    /// </summary>
    public Guid? ReferenceID { get; set; }

    /// <summary>
    /// Dữ liệu bổ sung (JSON)
    /// VD: { "customerName": "ABC Corp", "price": 15000000 }
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Icon gợi ý cho UI (IMPORT, EXPORT, TRANSFER, REPAIR, SOLD, STATUS_CHANGE...)
    /// </summary>
    public string IconType { get; set; } = string.Empty;

    /// <summary>
    /// Màu gợi ý cho UI (success, warning, error, info, default)
    /// </summary>
    public string ColorType { get; set; } = "default";
}

/// <summary>
/// Các loại sự kiện trong vòng đời ProductInstance
/// </summary>
public static class ProductInstanceEventType
{
    // Nhập kho
    public const string IMPORTED = "IMPORTED";
    public const string RECEIVED_FROM_PO = "RECEIVED_FROM_PO";

    // Xuất kho
    public const string SOLD = "SOLD";
    public const string EXPORTED = "EXPORTED";

    // Chuyển kho
    public const string TRANSFER_OUT = "TRANSFER_OUT";
    public const string TRANSFER_IN = "TRANSFER_IN";

    // Sửa chữa / Bảo hành
    public const string REPAIR_STARTED = "REPAIR_STARTED";
    public const string REPAIR_COMPLETED = "REPAIR_COMPLETED";
    public const string WARRANTY_CLAIMED = "WARRANTY_CLAIMED";
    public const string WARRANTY_COMPLETED = "WARRANTY_COMPLETED";

    // Thay đổi trạng thái
    public const string STATUS_CHANGED = "STATUS_CHANGED";
    public const string LOCATION_CHANGED = "LOCATION_CHANGED";

    // Kiểm tra chất lượng
    public const string QC_PASSED = "QC_PASSED";
    public const string QC_FAILED = "QC_FAILED";

    // Khác
    public const string CREATED = "CREATED";
    public const string UPDATED = "UPDATED";
    public const string RETURNED = "RETURNED";
}

/// <summary>
/// Response trả về danh sách lịch sử
/// </summary>
public class ProductInstanceHistoryResponseDto
{
    public Guid InstanceID { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public string CurrentStatus { get; set; } = string.Empty;

    /// <summary>
    /// Danh sách sự kiện, sắp xếp theo thời gian giảm dần (mới nhất trước)
    /// </summary>
    public List<ProductInstanceLifecycleEventDto> Events { get; set; } = new();

    /// <summary>
    /// Tổng số sự kiện
    /// </summary>
    public int TotalEvents { get; set; }

    /// <summary>
    /// Ngày tạo ProductInstance
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
