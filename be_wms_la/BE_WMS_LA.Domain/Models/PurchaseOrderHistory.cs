using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Lịch sử thay đổi trạng thái và hoạt động của đơn đặt hàng
/// Theo dõi ai tạo, ai duyệt, ai nhận hàng, ai hoàn thành
/// </summary>
[Table("PurchaseOrderHistory")]
public class PurchaseOrderHistory
{
    [Key]
    public Guid HistoryID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK: Đơn đặt hàng
    /// </summary>
    [Required]
    public Guid PurchaseOrderID { get; set; }

    /// <summary>
    /// Loại hành động: CREATED, CONFIRMED, RECEIVING, RECEIVED, PARTIAL_RECEIVED, COMPLETED, CANCELLED, UPDATED
    /// </summary>
    [Required]
    [StringLength(50)]
    public string Action { get; set; } = string.Empty;

    /// <summary>
    /// Trạng thái cũ (null nếu là lần đầu tạo)
    /// </summary>
    [StringLength(50)]
    public string? OldStatus { get; set; }

    /// <summary>
    /// Trạng thái mới
    /// </summary>
    [StringLength(50)]
    public string? NewStatus { get; set; }

    /// <summary>
    /// FK: Người thực hiện hành động
    /// </summary>
    public Guid? PerformedByUserID { get; set; }

    /// <summary>
    /// Thời điểm thực hiện
    /// </summary>
    public DateTime PerformedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Mô tả chi tiết (VD: "Nhận 10/20 sản phẩm", "Duyệt đơn hàng", "Hủy do hết hàng")
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Dữ liệu bổ sung (JSON format) - có thể chứa thông tin như số lượng nhận, sản phẩm nào, v.v.
    /// </summary>
    public string? Metadata { get; set; }

    /// <summary>
    /// Địa chỉ IP của người thực hiện (optional, cho security audit)
    /// </summary>
    [StringLength(45)]
    public string? IpAddress { get; set; }

    /// <summary>
    /// User Agent (browser/app info)
    /// </summary>
    [StringLength(500)]
    public string? UserAgent { get; set; }

    #region Navigation Properties

    [ForeignKey(nameof(PurchaseOrderID))]
    public virtual PurchaseOrder PurchaseOrder { get; set; } = null!;

    [ForeignKey(nameof(PerformedByUserID))]
    public virtual User? PerformedByUser { get; set; }

    #endregion
}
