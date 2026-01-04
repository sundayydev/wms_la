using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Customer;

#region List & Detail DTOs

/// <summary>
/// DTO danh sách khách hàng
/// </summary>
public class CustomerListDto
{
    public Guid CustomerID { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Type { get; set; } = "INDIVIDUAL";
    public string CustomerGroup { get; set; } = "RETAIL";
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? City { get; set; }
    public bool IsActive { get; set; }
    public int OrderCount { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO chi tiết khách hàng
/// </summary>
public class CustomerDetailDto
{
    public Guid CustomerID { get; set; }
    public string CustomerCode { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string Type { get; set; } = "INDIVIDUAL";
    public string CustomerGroup { get; set; } = "RETAIL";
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? District { get; set; }
    public string? Ward { get; set; }
    public string? TaxCode { get; set; }
    public DateOnly? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Aggregate fields
    public int OrderCount { get; set; }
    public decimal TotalSpent { get; set; }

    // Related data
    public List<CustomerContactDto> Contacts { get; set; } = new();
}

/// <summary>
/// DTO người liên hệ của khách hàng
/// </summary>
public class CustomerContactDto
{
    public Guid ContactID { get; set; }
    public string ContactName { get; set; } = string.Empty;
    public string? Position { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Email { get; set; }
    public bool IsPrimary { get; set; }
}

#endregion

#region Create & Update DTOs

/// <summary>
/// DTO tạo khách hàng mới
/// </summary>
public class CreateCustomerDto
{
    /// <summary>
    /// Mã khách hàng (nếu không nhập sẽ tự sinh)
    /// </summary>
    [StringLength(50)]
    public string? CustomerCode { get; set; }

    /// <summary>
    /// Tên khách hàng hoặc Công ty
    /// </summary>
    [Required(ErrorMessage = "Tên khách hàng là bắt buộc")]
    [StringLength(200, ErrorMessage = "Tên tối đa 200 ký tự")]
    public string CustomerName { get; set; } = string.Empty;

    /// <summary>
    /// Loại: INDIVIDUAL, COMPANY
    /// </summary>
    [StringLength(20)]
    public string Type { get; set; } = "INDIVIDUAL";

    /// <summary>
    /// Nhóm: RETAIL, WHOLESALE, VIP
    /// </summary>
    [StringLength(50)]
    public string CustomerGroup { get; set; } = "RETAIL";

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [StringLength(100)]
    [EmailAddress(ErrorMessage = "Email không hợp lệ")]
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

    public DateOnly? DateOfBirth { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

    public string? Notes { get; set; }
}

/// <summary>
/// DTO cập nhật khách hàng
/// </summary>
public class UpdateCustomerDto
{
    [StringLength(200)]
    public string? CustomerName { get; set; }

    [StringLength(20)]
    public string? Type { get; set; }

    [StringLength(50)]
    public string? CustomerGroup { get; set; }

    [StringLength(20)]
    public string? PhoneNumber { get; set; }

    [StringLength(100)]
    [EmailAddress]
    public string? Email { get; set; }

    [StringLength(500)]
    public string? Address { get; set; }

    [StringLength(100)]
    public string? City { get; set; }

    [StringLength(100)]
    public string? District { get; set; }

    [StringLength(100)]
    public string? Ward { get; set; }

    [StringLength(50)]
    public string? TaxCode { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

    public string? Notes { get; set; }
}

#endregion

#region Statistics

/// <summary>
/// Thống kê khách hàng
/// </summary>
public class CustomerStatisticsDto
{
    public int TotalCustomers { get; set; }
    public int ActiveCustomers { get; set; }
    public int IndividualCustomers { get; set; }
    public int CompanyCustomers { get; set; }
    public int RetailCustomers { get; set; }
    public int WholesaleCustomers { get; set; }
    public int VIPCustomers { get; set; }
    public int NewCustomersThisMonth { get; set; }
}

#endregion
