namespace BE_WMS_LA.Shared.DTOs.Product;

/// <summary>
/// DTO chi tiết sản phẩm
/// </summary>
public class ProductDetailDto
{
    public Guid ComponentID { get; set; }

    /// <summary>
    /// Mã SKU
    /// </summary>
    public string SKU { get; set; } = string.Empty;

    /// <summary>
    /// Tên sản phẩm
    /// </summary>
    public string ComponentName { get; set; } = string.Empty;

    /// <summary>
    /// Tên tiếng Việt / Tên tờ khai
    /// </summary>
    public string? ComponentNameVN { get; set; }

    /// <summary>
    /// Danh mục
    /// </summary>
    public Guid? CategoryID { get; set; }
    public string? CategoryName { get; set; }

    #region Phân loại sản phẩm

    /// <summary>
    /// Phân loại sản phẩm
    /// </summary>
    public string ProductType { get; set; } = "DEVICE";

    /// <summary>
    /// Thương hiệu
    /// </summary>
    public string? Brand { get; set; }

    /// <summary>
    /// Model
    /// </summary>
    public string? Model { get; set; }

    /// <summary>
    /// Mã sản phẩm từ nhà sản xuất
    /// </summary>
    public string? ManufacturerSKU { get; set; }

    /// <summary>
    /// Mã vạch
    /// </summary>
    public string? Barcode { get; set; }

    #endregion

    /// <summary>
    /// Đơn vị tính
    /// </summary>
    public string? Unit { get; set; }

    /// <summary>
    /// Đường dẫn ảnh đại diện
    /// </summary>
    public string? ImageURL { get; set; }

    /// <summary>
    /// Gallery ảnh (JSON)
    /// </summary>
    public string ImageGallery { get; set; } = "[]";

    #region Giá cả

    /// <summary>
    /// Giá nhập
    /// </summary>
    public decimal? BasePrice { get; set; }

    /// <summary>
    /// Giá bán
    /// </summary>
    public decimal? SellPrice { get; set; }

    /// <summary>
    /// Giá sỉ
    /// </summary>
    public decimal? WholesalePrice { get; set; }

    #endregion

    #region Quản lý kho

    /// <summary>
    /// Quản lý theo Serial
    /// </summary>
    public bool IsSerialized { get; set; }

    /// <summary>
    /// Mức tồn kho tối thiểu
    /// </summary>
    public int MinStockLevel { get; set; }

    /// <summary>
    /// Mức tồn kho tối đa
    /// </summary>
    public int? MaxStockLevel { get; set; }

    /// <summary>
    /// Số tháng bảo hành mặc định
    /// </summary>
    public int DefaultWarrantyMonths { get; set; }

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
    /// Tags (JSON)
    /// </summary>
    public string Tags { get; set; } = "[]";

    /// <summary>
    /// Tài liệu (JSON)
    /// </summary>
    public string Documents { get; set; } = "[]";

    /// <summary>
    /// Sản phẩm đối thủ (JSON)
    /// </summary>
    public string Competitors { get; set; } = "[]";

    /// <summary>
    /// Sản phẩm tương thích (JSON)
    /// </summary>
    public string CompatibleWith { get; set; } = "[]";

    #endregion

    #region Trạng thái & SEO

    /// <summary>
    /// Trạng thái sản phẩm
    /// </summary>
    public string Status { get; set; } = "ACTIVE";

    /// <summary>
    /// Mô tả ngắn
    /// </summary>
    public string? ShortDescription { get; set; }

    /// <summary>
    /// Mô tả đầy đủ (HTML)
    /// </summary>
    public string? FullDescription { get; set; }

    #endregion

    #region Audit & Aggregate

    /// <summary>
    /// Ngày tạo
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Ngày cập nhật
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Số lượng biến thể
    /// </summary>
    public int VariantCount { get; set; }

    /// <summary>
    /// Tổng tồn kho
    /// </summary>
    public int TotalStock { get; set; }

    /// <summary>
    /// Danh sách biến thể
    /// </summary>
    public List<ProductVariantDto> Variants { get; set; } = new();

    #endregion
}

/// <summary>
/// DTO biến thể sản phẩm
/// </summary>
public class ProductVariantDto
{
    public Guid VariantID { get; set; }
    public string PartNumber { get; set; } = string.Empty;
    public string? VariantName { get; set; }
    public string? VariantDescription { get; set; }
    public string? VariantSpecs { get; set; }
    public decimal? BasePrice { get; set; }
    public decimal? SellPrice { get; set; }
    public decimal? WholesalePrice { get; set; }
    public string? Barcode { get; set; }
    public int MinStockLevel { get; set; }
    public int? MaxStockLevel { get; set; }
    public bool IsActive { get; set; }
    public bool IsDefault { get; set; }
    public int SortOrder { get; set; }
    public int StockCount { get; set; }
}
