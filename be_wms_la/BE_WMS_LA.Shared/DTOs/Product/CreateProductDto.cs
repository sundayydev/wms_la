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
    /// Danh mục
    /// </summary>
    public Guid? CategoryID { get; set; }

    /// <summary>
    /// Đơn vị tính
    /// </summary>
    [StringLength(20, ErrorMessage = "Đơn vị tối đa 20 ký tự")]
    public string? Unit { get; set; }

    /// <summary>
    /// Đường dẫn ảnh
    /// </summary>
    [StringLength(500, ErrorMessage = "URL ảnh tối đa 500 ký tự")]
    [Url(ErrorMessage = "URL ảnh không hợp lệ")]
    public string? ImageURL { get; set; }

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
    /// Quản lý theo Serial
    /// </summary>
    public bool IsSerialized { get; set; } = true;

    /// <summary>
    /// Thông số kỹ thuật (JSON)
    /// </summary>
    public string Specifications { get; set; } = "{}";

    /// <summary>
    /// Tài liệu (JSON)
    /// </summary>
    public string Documents { get; set; } = "[]";

    /// <summary>
    /// Danh sách sản phẩm đối thủ (JSON)
    /// </summary>
    public string Competitors { get; set; } = "[]";
}
