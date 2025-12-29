using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Quản lý khách hàng (Cá nhân hoặc Công ty)
/// </summary>
[Table("Customers")]
public class Customer
{
    [Key]
    public Guid CustomerID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Mã khách hàng (duy nhất, tự động tạo)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string CustomerCode { get; set; } = string.Empty;

    /// <summary>
    /// Tên khách hàng hoặc Tên Công ty
    /// </summary>
    [Required]
    [StringLength(200)]
    public string CustomerName { get; set; } = string.Empty;

    /// <summary>
    /// Loại KH: INDIVIDUAL (Cá nhân), COMPANY (Doanh nghiệp)
    /// </summary>
    [StringLength(20)]
    public string Type { get; set; } = "INDIVIDUAL";

    /// <summary>
    /// Nhóm KH: RETAIL (Lẻ), WHOLESALE (Sỉ), VIP
    /// </summary>
    [StringLength(50)]
    public string CustomerGroup { get; set; } = "RETAIL";

    /// <summary>
    /// SĐT liên hệ chính (cá nhân) hoặc Hotline (công ty)
    /// </summary>
    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [StringLength(100)]
    public string? Email { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? District { get; set; }

    [StringLength(100)]
    public string? Ward { get; set; }

    /// <summary>
    /// Mã số thuế (bắt buộc cho khách công ty)
    /// </summary>
    [StringLength(50)]
    public string? TaxCode { get; set; }

    /// <summary>
    /// Ngày sinh (dành cho khách cá nhân)
    /// </summary>
    public DateOnly? DateOfBirth { get; set; }

    /// <summary>
    /// Giới tính: MALE, FEMALE, OTHER (dành cho khách cá nhân)
    /// </summary>
    [StringLength(10)]
    public string? Gender { get; set; }

    public string? Notes { get; set; }

    public bool IsActive { get; set; } = true;

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    /// <summary>
    /// Danh sách người liên hệ của khách hàng công ty
    /// </summary>
    public virtual ICollection<CustomerContact> Contacts { get; set; } = new List<CustomerContact>();

    public virtual ICollection<SalesOrder> SalesOrders { get; set; } = new List<SalesOrder>();
    public virtual ICollection<Repair> Repairs { get; set; } = new List<Repair>();
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();

    #endregion
}
