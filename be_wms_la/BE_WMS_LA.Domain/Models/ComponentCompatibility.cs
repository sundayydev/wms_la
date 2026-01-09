using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Bảng trung gian xác định sự tương thích giữa 2 Component.
/// Ví dụ: Component A (Pin) tương thích với Component B (Máy PDA).
/// </summary>
[Table("ComponentCompatibilities")]
public class ComponentCompatibility
{
    /// <summary>
    /// Component chính (Ví dụ: Phụ kiện, Pin, Sạc...)
    /// </summary>
    [Key]
    [Column(Order = 0)]
    public Guid SourceComponentID { get; set; }

    /// <summary>
    /// Component đích mà nó tương thích (Ví dụ: Máy PDA, Máy in...)
    /// </summary>
    [Key]
    [Column(Order = 1)]
    public Guid TargetComponentID { get; set; }

    /// <summary>
    /// Ghi chú thêm (tùy chọn). VD: "Cần update firmware mới dùng được"
    /// </summary>
    [StringLength(255)]
    public string? Note { get; set; }

    // Navigation Properties

    [ForeignKey(nameof(SourceComponentID))]
    public virtual Component SourceComponent { get; set; } = null!;

    [ForeignKey(nameof(TargetComponentID))]
    public virtual Component TargetComponent { get; set; } = null!;
}