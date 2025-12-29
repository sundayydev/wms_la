using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Lịch sử tất cả giao dịch xuất nhập kho (Audit Trail)
/// </summary>
[Table("InventoryTransactions")]
public class InventoryTransaction
{
    [Key]
    public Guid TransactionID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Mã giao dịch (VD: INV-2024-00001)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string TransactionCode { get; set; } = string.Empty;

    /// <summary>
    /// Loại: IMPORT (Nhập), EXPORT (Xuất), TRANSFER (Chuyển), ADJUSTMENT (Điều chỉnh)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string TransactionType { get; set; } = string.Empty;

    /// <summary>
    /// FK: ID đơn hàng liên quan (Purchase/Sales/Transfer/Repair)
    /// </summary>
    public Guid? ReferenceID { get; set; }

    /// <summary>
    /// FK: Kho thực hiện giao dịch
    /// </summary>
    [Required]
    public Guid WarehouseID { get; set; }

    /// <summary>
    /// FK: Loại sản phẩm
    /// </summary>
    [Required]
    public Guid ComponentID { get; set; }

    /// <summary>
    /// FK: Máy cụ thể (nếu có Serial)
    /// </summary>
    public Guid? InstanceID { get; set; }

    /// <summary>
    /// Số lượng thay đổi: Dương = Nhập, Âm = Xuất
    /// </summary>
    [Required]
    public int Quantity { get; set; }

    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;

    public Guid? CreatedByUserID { get; set; }

    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    #region Navigation Properties

    [ForeignKey(nameof(WarehouseID))]
    public virtual Warehouse Warehouse { get; set; } = null!;

    [ForeignKey(nameof(ComponentID))]
    public virtual Component Component { get; set; } = null!;

    [ForeignKey(nameof(InstanceID))]
    public virtual ProductInstance? Instance { get; set; }

    [ForeignKey(nameof(CreatedByUserID))]
    public virtual User? CreatedByUser { get; set; }

    #endregion
}
