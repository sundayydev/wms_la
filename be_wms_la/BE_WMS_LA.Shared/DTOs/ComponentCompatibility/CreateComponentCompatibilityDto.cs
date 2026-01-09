using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.ComponentCompatibility;

/// <summary>
/// DTO tạo mới ComponentCompatibility
/// </summary>
public class CreateComponentCompatibilityDto
{
    /// <summary>
    /// Component ID chính (Source) - Ví dụ: Pin, Phụ kiện
    /// </summary>
    [Required(ErrorMessage = "SourceComponentID là bắt buộc")]
    public Guid SourceComponentID { get; set; }

    /// <summary>
    /// Component ID đích (Target) - Ví dụ: Máy PDA, Máy in
    /// </summary>
    [Required(ErrorMessage = "TargetComponentID là bắt buộc")]
    public Guid TargetComponentID { get; set; }

    /// <summary>
    /// Ghi chú thêm (tùy chọn)
    /// </summary>
    [StringLength(255, ErrorMessage = "Ghi chú không được vượt quá 255 ký tự")]
    public string? Note { get; set; }
}
