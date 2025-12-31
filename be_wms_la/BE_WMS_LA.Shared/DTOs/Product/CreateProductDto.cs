using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Product;

/// <summary>
/// DTO tạo mới sản phẩm
/// </summary>
public class CreateProductDto
{
    /// <summary>
    /// Mã SKU (duy nhất)
    /// </summary>
    [Required(ErrorMessage = "Mã SKU là bắt buộc")]
    [StringLength(50, ErrorMessage = "Mã SKU tối đa 50 ký tự")]
    public string SKU { get; set; } = string.Empty;

    /// <summary>
    /// Tên sản phẩm
    /// </summary>
    [Required(ErrorMessage = "Tên sản phẩm là bắt buộc")]
    [StringLength(200, ErrorMessage = "Tên sản phẩm tối đa 200 ký tự")]
    public string ComponentName { get; set; } = string.Empty;

    /// <summary>
    /// Tên tiếng Việt / Tên tờ khai
    /// </summary>
    [StringLength(255, ErrorMessage = "Tên tiếng Việt tối đa 255 ký tự")]
    public string? ComponentNameVN { get; set; }

    /// <summary>
    /// Danh mục
    /// </summary>
    public Guid? CategoryID { get; set; }

    #region Phân loại sản phẩm

    /// <summary>
    /// Phân loại sản phẩm: DEVICE, ACCESSORY, CONSUMABLE, SPARE_PART, SOFTWARE
    /// </summary>
    [StringLength(50)]
    public string ProductType { get; set; } = "DEVICE";

    /// <summary>
    /// Thương hiệu
    /// </summary>
    [StringLength(100)]
    public string? Brand { get; set; }

    /// <summary>
    /// Model
    /// </summary>
    [StringLength(100)]
    public string? Model { get; set; }

    /// <summary>
    /// Mã sản phẩm gốc từ nhà sản xuất
    /// </summary>
    [StringLength(100)]
    public string? ManufacturerSKU { get; set; }

    /// <summary>
    /// Mã vạch (EAN/UPC)
    /// </summary>
    [StringLength(100)]
    public string? Barcode { get; set; }

    #endregion

    /// <summary>
    /// Đơn vị tính
    /// </summary>
    [StringLength(20, ErrorMessage = "Đơn vị tối đa 20 ký tự")]
    public string? Unit { get; set; }

    /// <summary>
    /// Đường dẫn ảnh
    /// </summary>
    [StringLength(500, ErrorMessage = "URL ảnh tối đa 500 ký tự")]
    public string? ImageURL { get; set; }

    /// <summary>
    /// Gallery ảnh (JSON Array)
    /// </summary>
    public string ImageGallery { get; set; } = "[]";

    #region Giá cả

    /// <summary>
    /// Giá nhập
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Giá nhập phải >= 0")]
    public decimal? BasePrice { get; set; }

    /// <summary>
    /// Giá bán
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Giá bán phải >= 0")]
    public decimal? SellPrice { get; set; }

    /// <summary>
    /// Giá sỉ
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Giá sỉ phải >= 0")]
    public decimal? WholesalePrice { get; set; }

    #endregion

    #region Quản lý kho

    /// <summary>
    /// Quản lý theo Serial
    /// </summary>
    public bool IsSerialized { get; set; } = true;

    /// <summary>
    /// Mức tồn kho tối thiểu
    /// </summary>
    [Range(0, int.MaxValue)]
    public int MinStockLevel { get; set; } = 0;

    /// <summary>
    /// Mức tồn kho tối đa
    /// </summary>
    public int? MaxStockLevel { get; set; }

    /// <summary>
    /// Số tháng bảo hành mặc định
    /// </summary>
    [Range(0, 120)]
    public int DefaultWarrantyMonths { get; set; } = 12;

    #endregion

    #region Thông tin vật lý

    /// <summary>
    /// Trọng lượng (kg)
    /// </summary>
    public decimal? Weight { get; set; }

    /// <summary>
    /// Chiều dài (cm)
    /// </summary>
    public decimal? Length { get; set; }

    /// <summary>
    /// Chiều rộng (cm)
    /// </summary>
    public decimal? Width { get; set; }

    /// <summary>
    /// Chiều cao (cm)
    /// </summary>
    public decimal? Height { get; set; }

    #endregion

    #region Thông số & Tài liệu

    /// <summary>
    /// Thông số kỹ thuật (JSON)
    /// </summary>
    public string Specifications { get; set; } = "{}";

    /// <summary>
    /// Tags (JSON Array)
    /// </summary>
    public string Tags { get; set; } = "[]";

    /// <summary>
    /// Tài liệu (JSON)
    /// </summary>
    public string Documents { get; set; } = "[]";

    /// <summary>
    /// Danh sách sản phẩm đối thủ (JSON)
    /// </summary>
    public string Competitors { get; set; } = "[]";

    /// <summary>
    /// Sản phẩm tương thích (JSON)
    /// </summary>
    public string CompatibleWith { get; set; } = "[]";

    #endregion

    #region Trạng thái & SEO

    /// <summary>
    /// Trạng thái: ACTIVE, DISCONTINUED, COMING_SOON, OUT_OF_STOCK
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
}
