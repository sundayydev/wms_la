namespace BE_WMS_LA.Shared.DTOs.Product;

/// <summary>
/// DTO đại diện cho một sản phẩm tương thích
/// VD: Pin sạc tương thích với PDA M63, TC21, etc.
/// </summary>
public class CompatibleProductDto
{
    /// <summary>
    /// ID của sản phẩm tương thích
    /// </summary>
    public Guid ComponentID { get; set; }

    /// <summary>
    /// Mã SKU của sản phẩm
    /// </summary>
    public string SKU { get; set; } = string.Empty;

    /// <summary>
    /// Tên sản phẩm
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// URL ảnh đại diện (optional)
    /// </summary>
    public string? ImageURL { get; set; }

    /// <summary>
    /// Loại sản phẩm (DEVICE, ACCESSORY, etc.)
    /// </summary>
    public string? ProductType { get; set; }
}

/// <summary>
/// Request DTO để thêm sản phẩm tương thích
/// </summary>
public class AddCompatibleProductRequest
{
    /// <summary>
    /// ID của sản phẩm cần thêm vào danh sách tương thích
    /// </summary>
    public Guid ComponentID { get; set; }
}

/// <summary>
/// Request DTO để thêm nhiều sản phẩm tương thích cùng lúc
/// </summary>
public class AddCompatibleProductsRequest
{
    /// <summary>
    /// Danh sách ID các sản phẩm cần thêm
    /// </summary>
    public List<Guid> ComponentIDs { get; set; } = new();
}

/// <summary>
/// Request DTO để cập nhật toàn bộ danh sách sản phẩm tương thích
/// </summary>
public class UpdateCompatibleProductsRequest
{
    /// <summary>
    /// Danh sách ID các sản phẩm tương thích (replace toàn bộ)
    /// </summary>
    public List<Guid> ComponentIDs { get; set; } = new();
}
