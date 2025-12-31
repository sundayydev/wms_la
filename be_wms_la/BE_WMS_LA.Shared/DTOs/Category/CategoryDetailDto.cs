namespace BE_WMS_LA.Shared.DTOs.Category;

/// <summary>
/// DTO chi tiết danh mục
/// </summary>
public class CategoryDetailDto
{
    public Guid CategoryID { get; set; }

    /// <summary>
    /// Tên danh mục sản phẩm
    /// </summary>
    public string CategoryName { get; set; } = string.Empty;

    /// <summary>
    /// Số lượng sản phẩm trong danh mục
    /// </summary>
    public int ComponentCount { get; set; }

    /// <summary>
    /// Ngày tạo
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Ngày cập nhật
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Ngày xóa (nếu có)
    /// </summary>
    public DateTime? DeletedAt { get; set; }
}
