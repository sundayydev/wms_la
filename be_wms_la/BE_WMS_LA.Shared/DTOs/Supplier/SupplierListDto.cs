using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Supplier;

/// <summary>
/// DTO hiển thị danh sách nhà cung cấp
/// </summary>
public class SupplierListDto
{
    public Guid SupplierID { get; set; }

    /// <summary>
    /// Mã nhà cung cấp
    /// </summary>
    public string SupplierCode { get; set; } = string.Empty;

    /// <summary>
    /// Tên nhà cung cấp
    /// </summary>
    public string SupplierName { get; set; } = string.Empty;

    /// <summary>
    /// Tên thương hiệu (Marketing Name)
    /// Ví dụ: "SAMSUNG", "PANASONIC"
    /// </summary>
    public string? BrandName { get; set; }

    /// <summary>
    /// Người liên hệ
    /// </summary>
    public string? ContactPerson { get; set; }

    /// <summary>
    /// Số điện thoại
    /// </summary>
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Email
    /// </summary>
    public string? Email { get; set; }

    /// <summary>
    /// Thành phố
    /// </summary>
    public string? City { get; set; }

    /// <summary>
    /// URL logo nhà cung cấp
    /// </summary>
    public string? LogoUrl { get; set; }

    /// <summary>
    /// Trạng thái hoạt động
    /// </summary>
    public bool IsActive { get; set; }

    /// <summary>
    /// Ngày tạo
    /// </summary>
    public DateTime CreatedAt { get; set; }
}
