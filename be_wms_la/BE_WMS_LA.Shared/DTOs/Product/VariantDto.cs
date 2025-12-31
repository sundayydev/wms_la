using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Product;

/// <summary>
/// DTO tạo mới biến thể sản phẩm
/// </summary>
public class CreateVariantDto
{
    /// <summary>
    /// ID sản phẩm chính
    /// </summary>
    [Required(ErrorMessage = "ComponentID là bắt buộc")]
    public Guid ComponentID { get; set; }

    /// <summary>
    /// Mã Part Number
    /// </summary>
    [Required(ErrorMessage = "Part Number là bắt buộc")]
    [StringLength(100, ErrorMessage = "Part Number tối đa 100 ký tự")]
    public string PartNumber { get; set; } = string.Empty;

    /// <summary>
    /// Tên biến thể
    /// </summary>
    [StringLength(200, ErrorMessage = "Tên biến thể tối đa 200 ký tự")]
    public string? VariantName { get; set; }

    /// <summary>
    /// Mô tả biến thể
    /// </summary>
    [StringLength(500, ErrorMessage = "Mô tả tối đa 500 ký tự")]
    public string? VariantDescription { get; set; }

    /// <summary>
    /// Thông số kỹ thuật riêng (JSON)
    /// </summary>
    public string? VariantSpecs { get; set; }

    /// <summary>
    /// Giá nhập
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Giá nhập phải >= 0")]
    public decimal? BasePrice { get; set; }

    /// <summary>
    /// Giá bán lẻ
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Giá bán phải >= 0")]
    public decimal? SellPrice { get; set; }

    /// <summary>
    /// Giá sỉ
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Giá sỉ phải >= 0")]
    public decimal? WholesalePrice { get; set; }

    /// <summary>
    /// Mã vạch
    /// </summary>
    [StringLength(100, ErrorMessage = "Mã vạch tối đa 100 ký tự")]
    public string? Barcode { get; set; }

    /// <summary>
    /// Mức tồn kho tối thiểu
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "Mức tồn kho tối thiểu phải >= 0")]
    public int MinStockLevel { get; set; } = 0;

    /// <summary>
    /// Mức tồn kho tối đa
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "Mức tồn kho tối đa phải >= 0")]
    public int? MaxStockLevel { get; set; }

    /// <summary>
    /// Trạng thái
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Là biến thể mặc định
    /// </summary>
    public bool IsDefault { get; set; } = false;
}

/// <summary>
/// DTO cập nhật biến thể sản phẩm
/// </summary>
public class UpdateVariantDto
{
    /// <summary>
    /// Tên biến thể
    /// </summary>
    [StringLength(200, ErrorMessage = "Tên biến thể tối đa 200 ký tự")]
    public string? VariantName { get; set; }

    /// <summary>
    /// Mô tả biến thể
    /// </summary>
    [StringLength(500, ErrorMessage = "Mô tả tối đa 500 ký tự")]
    public string? VariantDescription { get; set; }

    /// <summary>
    /// Thông số kỹ thuật riêng (JSON)
    /// </summary>
    public string? VariantSpecs { get; set; }

    /// <summary>
    /// Giá nhập
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Giá nhập phải >= 0")]
    public decimal? BasePrice { get; set; }

    /// <summary>
    /// Giá bán lẻ
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Giá bán phải >= 0")]
    public decimal? SellPrice { get; set; }

    /// <summary>
    /// Giá sỉ
    /// </summary>
    [Range(0, double.MaxValue, ErrorMessage = "Giá sỉ phải >= 0")]
    public decimal? WholesalePrice { get; set; }

    /// <summary>
    /// Mã vạch
    /// </summary>
    [StringLength(100, ErrorMessage = "Mã vạch tối đa 100 ký tự")]
    public string? Barcode { get; set; }

    /// <summary>
    /// Mức tồn kho tối thiểu
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "Mức tồn kho tối thiểu phải >= 0")]
    public int? MinStockLevel { get; set; }

    /// <summary>
    /// Mức tồn kho tối đa
    /// </summary>
    [Range(0, int.MaxValue, ErrorMessage = "Mức tồn kho tối đa phải >= 0")]
    public int? MaxStockLevel { get; set; }

    /// <summary>
    /// Trạng thái
    /// </summary>
    public bool? IsActive { get; set; }

    /// <summary>
    /// Là biến thể mặc định
    /// </summary>
    public bool? IsDefault { get; set; }
}
