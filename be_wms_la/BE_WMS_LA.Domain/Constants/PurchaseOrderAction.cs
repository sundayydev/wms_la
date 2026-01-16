namespace BE_WMS_LA.Domain.Constants;

/// <summary>
/// Các loại hành động có thể thực hiện trên Purchase Order
/// </summary>
public static class PurchaseOrderAction
{
    /// <summary>
    /// Tạo đơn hàng mới
    /// </summary>
    public const string CREATED = "CREATED";

    /// <summary>
    /// Xác nhận/Duyệt đơn hàng
    /// </summary>
    public const string CONFIRMED = "CONFIRMED";

    /// <summary>
    /// Bắt đầu nhận hàng (mở drawer receiving)
    /// </summary>
    public const string RECEIVING_STARTED = "RECEIVING_STARTED";

    /// <summary>
    /// Nhận một phần hàng
    /// </summary>
    public const string PARTIAL_RECEIVED = "PARTIAL_RECEIVED";

    /// <summary>
    /// Nhận đủ hàng
    /// </summary>
    public const string FULLY_RECEIVED = "FULLY_RECEIVED";

    /// <summary>
    /// Hoàn thành đơn hàng
    /// </summary>
    public const string COMPLETED = "COMPLETED";

    /// <summary>
    /// Hủy đơn hàng
    /// </summary>
    public const string CANCELLED = "CANCELLED";

    /// <summary>
    /// Cập nhật thông tin đơn hàng
    /// </summary>
    public const string UPDATED = "UPDATED";

    /// <summary>
    /// Xuất hóa đơn/In PO
    /// </summary>
    public const string PRINTED = "PRINTED";

    /// <summary>
    /// Gửi email cho supplier
    /// </summary>
    public const string EMAIL_SENT = "EMAIL_SENT";
}
