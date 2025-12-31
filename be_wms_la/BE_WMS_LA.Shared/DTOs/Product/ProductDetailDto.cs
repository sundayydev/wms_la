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
    /// Danh mục
    /// </summary>
    public Guid? CategoryID { get; set; }
    public string? CategoryName { get; set; }

    /// <summary>
    /// Đơn vị tính
    /// </summary>
    public string? Unit { get; set; }

    /// <summary>
    /// Đường dẫn ảnh
    /// </summary>
    public string? ImageURL { get; set; }

    /// <summary>
    /// Giá nhập
    /// </summary>
    public decimal? BasePrice { get; set; }

    /// <summary>
    /// Giá bán
    /// </summary>
    public decimal? SellPrice { get; set; }

    /// <summary>
    /// Quản lý theo Serial
    /// </summary>
    public bool IsSerialized { get; set; }

    /// <summary>
    /// Thông số kỹ thuật (JSON)
    /// </summary>
    public string Specifications { get; set; } = "{}";

    /// <summary>
    /// Tài liệu (JSON)
    /// </summary>
    public string Documents { get; set; } = "[]";

    /// <summary>
    /// Sản phẩm đối thủ (JSON)
    /// </summary>
    public string Competitors { get; set; } = "[]";

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
