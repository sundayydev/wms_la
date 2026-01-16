namespace BE_WMS_LA.Shared.DTOs.ComponentCompatibility;

/// <summary>
/// DTO hiển thị thông tin ComponentCompatibility
/// </summary>
public class ComponentCompatibilityDto
{
    /// <summary>
    /// Component ID chính (Source)
    /// </summary>
    public Guid SourceComponentID { get; set; }

    /// <summary>
    /// Tên Component chính
    /// </summary>
    public string SourceComponentName { get; set; } = string.Empty;

    /// <summary>
    /// SKU của Component chính
    /// </summary>
    public string SourceComponentSKU { get; set; } = string.Empty;

    /// <summary>
    /// Hình ảnh của Component chính
    /// </summary>
    public string? SourceComponentImageURL { get; set; }

    /// <summary>
    /// Loại sản phẩm của Component chính
    /// </summary>
    public string? SourceComponentProductType { get; set; }

    /// <summary>
    /// Component ID đích (Target)
    /// </summary>
    public Guid TargetComponentID { get; set; }

    /// <summary>
    /// Tên Component đích
    /// </summary>
    public string TargetComponentName { get; set; } = string.Empty;

    /// <summary>
    /// SKU của Component đích
    /// </summary>
    public string TargetComponentSKU { get; set; } = string.Empty;

    /// <summary>
    /// Hình ảnh của Component đích
    /// </summary>
    public string? TargetComponentImageURL { get; set; }

    /// <summary>
    /// Loại sản phẩm của Component đích
    /// </summary>
    public string? TargetComponentProductType { get; set; }

    /// <summary>
    /// Ghi chú tương thích
    /// </summary>
    public string? Note { get; set; }
}

