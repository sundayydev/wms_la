namespace BE_WMS_LA.Shared.DTOs.Product;

/// <summary>
/// DTO hiển thị danh sách sản phẩm
/// </summary>
public class ProductListDto
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
    /// Danh mục sản phẩm
    /// </summary>
    public string? CategoryName { get; set; }

    /// <summary>
    /// Đường dẫn ảnh
    /// </summary>
    public string? ImageURL { get; set; }

    /// <summary>
    /// Đơn vị tính
    /// </summary>
    public string? Unit { get; set; }

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
    /// Số lượng biến thể
    /// </summary>
    public int VariantCount { get; set; }

    /// <summary>
    /// Tổng tồn kho
    /// </summary>
    public int TotalStock { get; set; }

    /// <summary>
    /// Ngày tạo
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
