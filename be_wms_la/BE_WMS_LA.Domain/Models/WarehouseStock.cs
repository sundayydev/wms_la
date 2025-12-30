using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Tồn kho theo Kho + SKU + PartNumber
/// Quản lý tồn kho TỔNG HỢP theo cặp (Warehouse, Component, Variant)
/// Dùng cho sản phẩm KHÔNG SERIALIZED (như vật tư tiêu hao, tem nhãn)
/// </summary>
[Table("WarehouseStock")]
public class WarehouseStock
{
    [Key]
    public Guid StockID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK: Kho
    /// </summary>
    [Required]
    public Guid WarehouseID { get; set; }

    /// <summary>
    /// FK: SKU
    /// </summary>
    [Required]
    public Guid ComponentID { get; set; }

    /// <summary>
    /// FK: Part Number (NULL = tất cả biến thể hoặc sản phẩm không có biến thể)
    /// </summary>
    public Guid? VariantID { get; set; }

    #region Số lượng

    /// <summary>
    /// Số lượng thực tế trong kho
    /// </summary>
    public int QuantityOnHand { get; set; } = 0;

    /// <summary>
    /// Số lượng đã đặt trước (đơn hàng chưa xuất)
    /// </summary>
    public int QuantityReserved { get; set; } = 0;

    /// <summary>
    /// Số lượng khả dụng (computed: OnHand - Reserved)
    /// </summary>
    [NotMapped]
    public int QuantityAvailable => QuantityOnHand - QuantityReserved;

    #endregion

    /// <summary>
    /// Vị trí mặc định trong kho (VD: A-01-R2-S3)
    /// </summary>
    [StringLength(100)]
    public string? DefaultLocationCode { get; set; }

    /// <summary>
    /// Thời gian cập nhật tồn kho
    /// </summary>
    public DateTime LastStockUpdate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Lần kiểm kê cuối
    /// </summary>
    public DateTime? LastCountDate { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(WarehouseID))]
    public virtual Warehouse Warehouse { get; set; } = null!;

    [ForeignKey(nameof(ComponentID))]
    public virtual Component Component { get; set; } = null!;

    [ForeignKey(nameof(VariantID))]
    public virtual ComponentVariant? Variant { get; set; }

    #endregion
}
