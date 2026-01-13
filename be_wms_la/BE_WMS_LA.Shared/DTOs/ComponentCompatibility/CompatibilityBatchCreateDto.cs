using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.ComponentCompatibility;

/// <summary>
/// DTO tạo nhiều ComponentCompatibility cùng lúc
/// </summary>
public class CompatibilityBatchCreateDto
{
    /// <summary>
    /// Component ID chính (Source) - Ví dụ: Pin
    /// </summary>
    [Required(ErrorMessage = "SourceComponentID là bắt buộc")]
    public Guid SourceComponentID { get; set; }

    /// <summary>
    /// Danh sách Component IDs đích (Target) - Ví dụ: Các máy PDA tương thích
    /// </summary>
    [Required(ErrorMessage = "Danh sách TargetComponentIDs là bắt buộc")]
    [MinLength(1, ErrorMessage = "Phải có ít nhất 1 Component đích")]
    public List<Guid> TargetComponentIDs { get; set; } = new();

    /// <summary>
    /// Ghi chú chung cho tất cả (tùy chọn)
    /// </summary>
    [StringLength(255, ErrorMessage = "Ghi chú không được vượt quá 255 ký tự")]
    public string? Note { get; set; }
}
