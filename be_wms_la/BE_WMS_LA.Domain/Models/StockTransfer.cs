using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Quản lý phiếu chuyển kho
/// </summary>
[Table("StockTransfers")]
public class StockTransfer
{
    [Key]
    public Guid TransferID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Mã phiếu chuyển (VD: TF-2024-001)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string TransferCode { get; set; } = string.Empty;

    /// <summary>
    /// FK: Kho xuất
    /// </summary>
    [Required]
    public Guid FromWarehouseID { get; set; }

    /// <summary>
    /// FK: Kho nhận
    /// </summary>
    [Required]
    public Guid ToWarehouseID { get; set; }

    public DateTime TransferDate { get; set; } = DateTime.UtcNow;

    public DateOnly? ExpectedReceiveDate { get; set; }

    public DateOnly? ActualReceiveDate { get; set; }

    /// <summary>
    /// Trạng thái: PENDING, IN_TRANSIT, RECEIVED, CANCELLED
    /// </summary>
    [StringLength(50)]
    public string Status { get; set; } = "PENDING";

    /// <summary>
    /// FK: Người tạo phiếu (Kho xuất)
    /// </summary>
    public Guid? CreatedByUserID { get; set; }

    /// <summary>
    /// FK: Người nhận hàng (Kho nhận)
    /// </summary>
    public Guid? ReceivedByUserID { get; set; }

    public string? Notes { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(FromWarehouseID))]
    public virtual Warehouse FromWarehouse { get; set; } = null!;

    [ForeignKey(nameof(ToWarehouseID))]
    public virtual Warehouse ToWarehouse { get; set; } = null!;

    [ForeignKey(nameof(CreatedByUserID))]
    public virtual User? CreatedByUser { get; set; }

    [ForeignKey(nameof(ReceivedByUserID))]
    public virtual User? ReceivedByUser { get; set; }

    public virtual ICollection<StockTransferDetail> Details { get; set; } = new List<StockTransferDetail>();

    #endregion
}
