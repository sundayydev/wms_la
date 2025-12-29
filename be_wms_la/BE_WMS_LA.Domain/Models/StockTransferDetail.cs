using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Chi tiết từng máy/sản phẩm được chuyển kho
/// </summary>
[Table("StockTransferDetails")]
public class StockTransferDetail
{
    [Key]
    public Guid TransferDetailID { get; set; } = Guid.NewGuid();

    [Required]
    public Guid TransferID { get; set; }

    /// <summary>
    /// FK: Máy cụ thể được chuyển
    /// </summary>
    [Required]
    public Guid InstanceID { get; set; }

    [Required]
    public Guid ComponentID { get; set; }

    /// <summary>
    /// Số lượng chuyển
    /// </summary>
    [Required]
    public int Quantity { get; set; }

    /// <summary>
    /// Số lượng thực nhận
    /// </summary>
    public int ReceivedQuantity { get; set; } = 0;

    public string? Notes { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(TransferID))]
    public virtual StockTransfer StockTransfer { get; set; } = null!;

    [ForeignKey(nameof(InstanceID))]
    public virtual ProductInstance Instance { get; set; } = null!;

    [ForeignKey(nameof(ComponentID))]
    public virtual Component Component { get; set; } = null!;

    #endregion
}
