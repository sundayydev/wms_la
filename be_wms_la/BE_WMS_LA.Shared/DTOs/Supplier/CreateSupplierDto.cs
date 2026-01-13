using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Supplier;

/// <summary>
/// DTO tạo mới nhà cung cấp
/// </summary>
public class CreateSupplierDto
{
    /// <summary>
    /// Mã nhà cung cấp (duy nhất)
    /// </summary>
    [Required(ErrorMessage = "Mã nhà cung cấp là bắt buộc")]
    [StringLength(50, ErrorMessage = "Mã nhà cung cấp tối đa 50 ký tự")]
    public string SupplierCode { get; set; } = string.Empty;

    /// <summary>
    /// Tên nhà cung cấp
    /// </summary>
    [Required(ErrorMessage = "Tên nhà cung cấp là bắt buộc")]
    [StringLength(200, ErrorMessage = "Tên nhà cung cấp tối đa 200 ký tự")]
    public string SupplierName { get; set; } = string.Empty;

    /// <summary>
    /// Tên thương hiệu (Marketing Name)
    /// Ví dụ: "SAMSUNG", "PANASONIC"
    /// </summary>
    [StringLength(100, ErrorMessage = "Tên thương hiệu tối đa 100 ký tự")]
    public string? BrandName { get; set; }

    /// <summary>
    /// Người liên hệ
    /// </summary>
    [StringLength(100, ErrorMessage = "Tên người liên hệ tối đa 100 ký tự")]
    public string? ContactPerson { get; set; }

    /// <summary>
    /// Số điện thoại
    /// </summary>
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(20, ErrorMessage = "Số điện thoại tối đa 20 ký tự")]
    public string? PhoneNumber { get; set; }

    /// <summary>
    /// Email
    /// </summary>
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
    [StringLength(100, ErrorMessage = "Email tối đa 100 ký tự")]
    public string? Email { get; set; }

    /// <summary>
    /// Địa chỉ
    /// </summary>
    [StringLength(500, ErrorMessage = "Địa chỉ tối đa 500 ký tự")]
    public string? Address { get; set; }

    /// <summary>
    /// Thành phố
    /// </summary>
    [StringLength(100, ErrorMessage = "Tên thành phố tối đa 100 ký tự")]
    public string? City { get; set; }

    /// <summary>
    /// Mã số thuế
    /// </summary>
    [StringLength(50, ErrorMessage = "Mã số thuế tối đa 50 ký tự")]
    public string? TaxCode { get; set; }

    /// <summary>
    /// Số tài khoản ngân hàng
    /// </summary>
    [StringLength(50, ErrorMessage = "Số tài khoản tối đa 50 ký tự")]
    public string? BankAccount { get; set; }

    /// <summary>
    /// Tên ngân hàng
    /// </summary>
    [StringLength(200, ErrorMessage = "Tên ngân hàng tối đa 200 ký tự")]
    public string? BankName { get; set; }

    /// <summary>
    /// Ghi chú
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// URL logo nhà cung cấp
    /// </summary>
    [StringLength(500, ErrorMessage = "URL logo tối đa 500 ký tự")]
    [Url(ErrorMessage = "URL logo không hợp lệ")]
    public string? LogoUrl { get; set; }

    /// <summary>
    /// Trạng thái hoạt động (mặc định true)
    /// </summary>
    public bool IsActive { get; set; } = true;
}
