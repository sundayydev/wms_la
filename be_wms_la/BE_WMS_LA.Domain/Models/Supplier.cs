using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Quản lý nhà cung cấp
/// </summary>
[Table("Suppliers")]
public class Supplier
{
    [Key]
    public Guid SupplierID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Mã nhà cung cấp (duy nhất)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string SupplierCode { get; set; } = string.Empty;

    /// <summary>
    /// Tên công ty nhà cung cấp
    /// </summary>
    [Required]
    [StringLength(200)]
    public string SupplierName { get; set; } = string.Empty;

    /// <summary>
    /// Tên người liên hệ chính
    /// </summary>
    [StringLength(100)]
    public string? ContactPerson { get; set; }

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [StringLength(100)]
    public string? Email { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    /// <summary>
    /// Mã số thuế doanh nghiệp
    /// </summary>
    [StringLength(50)]
    public string? TaxCode { get; set; }

    /// <summary>
    /// Số tài khoản ngân hàng
    /// </summary>
    [StringLength(50)]
    public string? BankAccount { get; set; }

    /// <summary>
    /// Tên ngân hàng
    /// </summary>
    [StringLength(200)]
    public string? BankName { get; set; }

    public string? Notes { get; set; }

    /// <summary>
    /// URL logo của nhà cung cấp
    /// </summary>
    [StringLength(500)]
    public string? LogoUrl { get; set; }

    public bool IsActive { get; set; } = true;

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    public virtual ICollection<PurchaseOrder> PurchaseOrders { get; set; } = new List<PurchaseOrder>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public virtual ICollection<SupplierProduct> SupplierProducts { get; set; } = new List<SupplierProduct>();

    #endregion
}
