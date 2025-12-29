using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Danh mục sản phẩm/linh kiện chung (Model). Mỗi dòng = 1 loại sản phẩm, không phải từng chiếc
/// </summary>
[Table("Components")]
public class Component
{
    /// <summary>
    /// Khóa chính UUID, tự động tạo
    /// </summary>
    [Key]
    public Guid ComponentID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Stock Keeping Unit - Mã quản lý kho duy nhất (VD: MOBY-M63-V2)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string SKU { get; set; } = string.Empty;

    /// <summary>
    /// Tên đầy đủ của sản phẩm (VD: Máy kiểm kho PDA Mobydata M63 V2)
    /// </summary>
    [Required]
    [StringLength(200)]
    public string ComponentName { get; set; } = string.Empty;

    /// <summary>
    /// FK: Liên kết đến bảng Categories
    /// </summary>
    public Guid? CategoryID { get; set; }

    /// <summary>
    /// Đơn vị tính (Cái, Chiếc, Bộ, Hộp)
    /// </summary>
    [StringLength(20)]
    public string? Unit { get; set; }

    /// <summary>
    /// Đường dẫn ảnh đại diện của sản phẩm
    /// </summary>
    [StringLength(500)]
    public string? ImageURL { get; set; }

    #region Giá cả

    /// <summary>
    /// Giá nhập (giá gốc từ nhà cung cấp)
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal? BasePrice { get; set; }

    /// <summary>
    /// Giá bán niêm yết
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal? SellPrice { get; set; }

    #endregion

    #region Quản lý kho

    /// <summary>
    /// TRUE = Quản lý theo Serial/IMEI (từng chiếc), FALSE = Quản lý theo số lượng
    /// </summary>
    public bool IsSerialized { get; set; } = true;

    /// <summary>
    /// Thông số kỹ thuật dạng JSON (VD: {"OS": "Android 13", "RAM": "4GB"})
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string Specifications { get; set; } = "{}";

    /// <summary>
    /// Tài liệu liên quan dạng JSON Array (Datasheet, Manual, Driver)
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string Documents { get; set; } = "[]";

    /// <summary>
    /// Danh sách sản phẩm đối thủ để so sánh (VD: ["Zebra TC21", "Honeywell EDA51"])
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string Competitors { get; set; } = "[]";

    #endregion

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    /// <summary>
    /// Danh mục sản phẩm
    /// </summary>
    [ForeignKey(nameof(CategoryID))]
    public virtual Category? Category { get; set; }

    /// <summary>
    /// Danh sách các instance (chiếc máy cụ thể) của sản phẩm này
    /// </summary>
    public virtual ICollection<ProductInstance> ProductInstances { get; set; } = new List<ProductInstance>();

    #endregion
}
