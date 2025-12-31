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
    /// Tên tiếng Việt/Tên tờ khai (VD: Máy đọc mã vạch)
    /// </summary>
    [StringLength(255)]
    public string? ComponentNameVN { get; set; }

    /// <summary>
    /// FK: Liên kết đến bảng Categories
    /// </summary>
    public Guid? CategoryID { get; set; }

    #region Phân loại sản phẩm

    /// <summary>
    /// Phân loại sản phẩm: DEVICE, ACCESSORY, CONSUMABLE, SPARE_PART, SOFTWARE
    /// </summary>
    [StringLength(50)]
    public string ProductType { get; set; } = "DEVICE";

    /// <summary>
    /// Thương hiệu (VD: Zebra, Honeywell, Mobydata, Datalogic)
    /// </summary>
    [StringLength(100)]
    public string? Brand { get; set; }

    /// <summary>
    /// Model (VD: TC21, M63, DS2208)
    /// </summary>
    [StringLength(100)]
    public string? Model { get; set; }

    /// <summary>
    /// Mã sản phẩm gốc từ nhà sản xuất
    /// </summary>
    [StringLength(100)]
    public string? ManufacturerSKU { get; set; }

    /// <summary>
    /// Mã vạch sản phẩm (EAN/UPC)
    /// </summary>
    [StringLength(100)]
    public string? Barcode { get; set; }

    #endregion

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

    /// <summary>
    /// Gallery ảnh dạng JSON Array (["url1", "url2", "url3"])
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string ImageGallery { get; set; } = "[]";

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

    /// <summary>
    /// Giá sỉ
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal? WholesalePrice { get; set; }

    #endregion

    #region Quản lý kho

    /// <summary>
    /// TRUE = Quản lý theo Serial/IMEI (từng chiếc), FALSE = Quản lý theo số lượng
    /// </summary>
    public bool IsSerialized { get; set; } = true;

    /// <summary>
    /// Mức tồn kho tối thiểu (cảnh báo)
    /// </summary>
    public int MinStockLevel { get; set; } = 0;

    /// <summary>
    /// Mức tồn kho tối đa
    /// </summary>
    public int? MaxStockLevel { get; set; }

    /// <summary>
    /// Số tháng bảo hành mặc định
    /// </summary>
    public int DefaultWarrantyMonths { get; set; } = 12;

    #endregion

    #region Thông tin vật lý

    /// <summary>
    /// Trọng lượng (kg)
    /// </summary>
    [Column(TypeName = "decimal(10,3)")]
    public decimal? Weight { get; set; }

    /// <summary>
    /// Chiều dài (cm)
    /// </summary>
    [Column(TypeName = "decimal(10,2)")]
    public decimal? Length { get; set; }

    /// <summary>
    /// Chiều rộng (cm)
    /// </summary>
    [Column(TypeName = "decimal(10,2)")]
    public decimal? Width { get; set; }

    /// <summary>
    /// Chiều cao (cm)
    /// </summary>
    [Column(TypeName = "decimal(10,2)")]
    public decimal? Height { get; set; }

    #endregion

    #region Thông số & Tài liệu

    /// <summary>
    /// Thông số kỹ thuật dạng JSON (Grouped format with k, v, q)
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string Specifications { get; set; } = "{}";

    /// <summary>
    /// Tags để tìm kiếm nhanh (VD: ["Android", "Bluetooth", "IP65", "2D Scanner"])
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string Tags { get; set; } = "[]";

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

    /// <summary>
    /// Sản phẩm tương thích (cho phụ kiện)
    /// VD: [{"ComponentID": "xxx", "SKU": "MOBY-M63-V2", "Name": "PDA M63"}]
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string CompatibleWith { get; set; } = "[]";

    #endregion

    #region Trạng thái & SEO

    /// <summary>
    /// Trạng thái sản phẩm: ACTIVE, DISCONTINUED, COMING_SOON, OUT_OF_STOCK
    /// </summary>
    [StringLength(50)]
    public string Status { get; set; } = "ACTIVE";

    /// <summary>
    /// Mô tả ngắn
    /// </summary>
    [StringLength(500)]
    public string? ShortDescription { get; set; }

    /// <summary>
    /// Mô tả đầy đủ (HTML)
    /// </summary>
    public string? FullDescription { get; set; }

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

    /// <summary>
    /// Danh sách các biến thể (Part Number) của sản phẩm này
    /// </summary>
    public virtual ICollection<ComponentVariant> Variants { get; set; } = new List<ComponentVariant>();

    /// <summary>
    /// Danh sách NCC cung cấp sản phẩm này
    /// </summary>
    public virtual ICollection<SupplierProduct> SupplierProducts { get; set; } = new List<SupplierProduct>();

    #endregion
}
