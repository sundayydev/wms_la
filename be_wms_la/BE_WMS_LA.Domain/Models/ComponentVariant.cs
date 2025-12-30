using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Biến thể sản phẩm (Part Number) - Một SKU có thể có nhiều Part Number khác nhau
/// VD: SKU = ZEBRA-TC21, có các Part Number:
///     - TC210K-01A222-A6 (Wifi only, 2GB RAM)
///     - TC210K-01B222-A6 (Wifi + LTE, 2GB RAM)
/// </summary>
[Table("ComponentVariants")]
public class ComponentVariant
{
    [Key]
    public Guid VariantID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK: Link tới sản phẩm chính (SKU)
    /// </summary>
    [Required]
    public Guid ComponentID { get; set; }

    /// <summary>
    /// Mã Part Number (VD: TC210K-01A222-A6)
    /// </summary>
    [Required]
    [StringLength(100)]
    public string PartNumber { get; set; } = string.Empty;

    /// <summary>
    /// Tên biến thể (VD: "TC21 Wifi 2GB" hoặc NULL để dùng tên gốc)
    /// </summary>
    [StringLength(200)]
    public string? VariantName { get; set; }

    /// <summary>
    /// Mô tả ngắn về biến thể này
    /// </summary>
    [StringLength(500)]
    public string? VariantDescription { get; set; }

    /// <summary>
    /// Thông số kỹ thuật khác biệt so với base (JSON)
    /// VD: {"connectivity": "Wifi + LTE", "ram": "4GB", "battery": "Extended 5000mAh"}
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? VariantSpecs { get; set; }

    #region Giá riêng cho biến thể (NULL = dùng giá của Component chính)

    /// <summary>
    /// Giá nhập
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal? BasePrice { get; set; }

    /// <summary>
    /// Giá bán lẻ
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal? SellPrice { get; set; }

    /// <summary>
    /// Giá sỉ
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal? WholesalePrice { get; set; }

    #endregion

    /// <summary>
    /// Mã vạch riêng cho biến thể (EAN/UPC)
    /// </summary>
    [StringLength(100)]
    public string? Barcode { get; set; }

    #region Quản lý tồn kho riêng cho biến thể

    /// <summary>
    /// Mức tồn kho tối thiểu
    /// </summary>
    public int MinStockLevel { get; set; } = 0;

    /// <summary>
    /// Mức tồn kho tối đa
    /// </summary>
    public int? MaxStockLevel { get; set; }

    #endregion

    #region Trạng thái

    public bool IsActive { get; set; } = true;

    /// <summary>
    /// TRUE = Biến thể mặc định khi không chọn PN
    /// </summary>
    public bool IsDefault { get; set; } = false;

    /// <summary>
    /// Thứ tự sắp xếp
    /// </summary>
    public int SortOrder { get; set; } = 0;

    #endregion

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(ComponentID))]
    public virtual Component Component { get; set; } = null!;

    public virtual ICollection<ProductInstance> ProductInstances { get; set; } = new List<ProductInstance>();
    public virtual ICollection<SupplierProduct> SupplierProducts { get; set; } = new List<SupplierProduct>();

    #endregion
}
