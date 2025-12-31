using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Category;

/// <summary>
/// DTO tạo mới danh mục
/// </summary>
public class CreateCategoryDto
{
    /// <summary>
    /// Tên danh mục sản phẩm
    /// </summary>
    [Required(ErrorMessage = "Tên danh mục là bắt buộc")]
    [StringLength(100, ErrorMessage = "Tên danh mục tối đa 100 ký tự")]
    public string CategoryName { get; set; } = string.Empty;
}
