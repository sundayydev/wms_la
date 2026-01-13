namespace BE_WMS_LA.Shared.DTOs.Supplier;

/// <summary>
/// DTO chi tiết nhà cung cấp
/// </summary>
public class SupplierDetailDto
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
    /// Địa chỉ
    /// </summary>
    public string? Address { get; set; }

    /// <summary>
    /// Thành phố
    /// </summary>
    public string? City { get; set; }

    /// <summary>
    /// Mã số thuế
    /// </summary>
    public string? TaxCode { get; set; }

    /// <summary>
    /// Số tài khoản ngân hàng
    /// </summary>
    public string? BankAccount { get; set; }

    /// <summary>
    /// Tên ngân hàng
    /// </summary>
    public string? BankName { get; set; }

    /// <summary>
    /// Ghi chú
    /// </summary>
    public string? Notes { get; set; }

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

    /// <summary>
    /// Ngày cập nhật
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    /// <summary>
    /// Số lượng sản phẩm đang cung cấp
    /// </summary>
    public int ProductCount { get; set; }

    /// <summary>
    /// Số lượng đơn đặt hàng
    /// </summary>
    public int PurchaseOrderCount { get; set; }
}
