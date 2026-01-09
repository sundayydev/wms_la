using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.ComponentCompatibility;

/// <summary>
/// DTO cập nhật ComponentCompatibility
/// </summary>
public class UpdateComponentCompatibilityDto
{
    /// <summary>
    /// Ghi chú thêm (tùy chọn)
    /// </summary>
    [StringLength(255, ErrorMessage = "Ghi chú không được vượt quá 255 ký tự")]
    public string? Note { get; set; }
}
