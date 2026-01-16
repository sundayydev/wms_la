using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.ProductInstance;

#region List & Detail DTOs

/// <summary>
/// DTO danh sách ProductInstance (hiển thị trong bảng)
/// </summary>
public class ProductInstanceListDto
{
    public Guid InstanceID { get; set; }
    public string SerialNumber { get; set; } = string.Empty;

    // Component info
    public Guid ComponentID { get; set; }
    public string ComponentSKU { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public string? ImageURL { get; set; }

    // Variant info
    public Guid? VariantID { get; set; }
    public string? PartNumber { get; set; }
    public string? VariantName { get; set; }

    // Warehouse info
    public Guid? WarehouseID { get; set; }
    public string? WarehouseName { get; set; }
    public string? LocationCode { get; set; }
    public string? Zone { get; set; }

    // Status & Owner
    public string Status { get; set; } = "IN_STOCK";
    public string CurrentOwnerType { get; set; } = "COMPANY";

    // IMEI & MAC
    public string? IMEI1 { get; set; }
    public string? IMEI2 { get; set; }
    public string? MACAddress { get; set; }

    // Price & Dates
    public decimal? ActualImportPrice { get; set; }
    public decimal? ActualSellPrice { get; set; }
    public DateTime ImportDate { get; set; }
    public DateTime? SoldDate { get; set; }

    // Warranty
    public DateTime? WarrantyStartDate { get; set; }
    public DateTime? WarrantyEndDate { get; set; }
    public int WarrantyMonths { get; set; }

    // Repair info
    public int TotalRepairCount { get; set; }
    public DateTime? LastRepairDate { get; set; }

    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO chi tiết một ProductInstance
/// </summary>
public class ProductInstanceDetailDto
{
    public Guid InstanceID { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? ModelNumber { get; set; }
    public string? InboundBoxNumber { get; set; }

    // Component info
    public Guid ComponentID { get; set; }
    public string ComponentSKU { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public string? ComponentDescription { get; set; }
    public string? ImageURL { get; set; }
    public bool IsSerialized { get; set; }

    // Variant info
    public Guid? VariantID { get; set; }
    public string? PartNumber { get; set; }
    public string? VariantName { get; set; }
    public string? VariantDescription { get; set; }

    // Warehouse info
    public Guid? WarehouseID { get; set; }
    public string? WarehouseName { get; set; }
    public string? LocationCode { get; set; }
    public string? Zone { get; set; }

    // Status & Owner
    public string Status { get; set; } = "IN_STOCK";
    public string CurrentOwnerType { get; set; } = "COMPANY";
    public Guid? CurrentOwnerID { get; set; }

    // IMEI & MAC
    public string? IMEI1 { get; set; }
    public string? IMEI2 { get; set; }
    public string? MACAddress { get; set; }

    // Warranty
    public DateTime? WarrantyStartDate { get; set; }
    public DateTime? WarrantyEndDate { get; set; }
    public int WarrantyMonths { get; set; }
    public bool IsUnderWarranty { get; set; }
    public int? WarrantyDaysRemaining { get; set; }

    // Repair info
    public int TotalRepairCount { get; set; }
    public DateTime? LastRepairDate { get; set; }

    // Price
    public decimal? ActualImportPrice { get; set; }
    public decimal? ActualSellPrice { get; set; }
    public decimal? ProfitAmount { get; set; }

    // Dates
    public DateTime ImportDate { get; set; }
    public DateTime? SoldDate { get; set; }
    public Guid? SoldToCustomerID { get; set; }
    public string? SoldToCustomerName { get; set; }

    // Notes
    public string? Notes { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

#endregion

#region Create & Update DTOs

/// <summary>
/// DTO tạo mới ProductInstance
/// </summary>
public class CreateProductInstanceDto
{
    [Required(ErrorMessage = "ComponentID là bắt buộc")]
    public Guid ComponentID { get; set; }

    public Guid? VariantID { get; set; }

    [Required(ErrorMessage = "WarehouseID là bắt buộc")]
    public Guid WarehouseID { get; set; }

    [Required(ErrorMessage = "SerialNumber là bắt buộc")]
    [StringLength(100)]
    public string SerialNumber { get; set; } = string.Empty;

    [StringLength(100)]
    public string? ModelNumber { get; set; }

    [StringLength(50)]
    public string? InboundBoxNumber { get; set; }

    [StringLength(20)]
    public string? IMEI1 { get; set; }

    [StringLength(20)]
    public string? IMEI2 { get; set; }

    [StringLength(17)]
    public string? MACAddress { get; set; }

    [StringLength(100)]
    public string? LocationCode { get; set; }

    [StringLength(50)]
    public string? Zone { get; set; }

    public decimal? ActualImportPrice { get; set; }

    public DateTime? WarrantyStartDate { get; set; }

    public int WarrantyMonths { get; set; } = 12;

    public string? Notes { get; set; }
}

/// <summary>
/// DTO cập nhật ProductInstance
/// </summary>
public class UpdateProductInstanceDto
{
    public Guid? WarehouseID { get; set; }

    [StringLength(100)]
    public string? LocationCode { get; set; }

    [StringLength(50)]
    public string? Zone { get; set; }

    [StringLength(50)]
    public string? Status { get; set; }

    public decimal? ActualImportPrice { get; set; }
    public decimal? ActualSellPrice { get; set; }

    public string? Notes { get; set; }
}

/// <summary>
/// DTO chuyển trạng thái ProductInstance
/// </summary>
public class UpdateProductInstanceStatusDto
{
    [Required]
    [StringLength(50)]
    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}

#endregion

#region Statistics

/// <summary>
/// Thống kê ProductInstance
/// </summary>
public class ProductInstanceStatisticsDto
{
    public int TotalInstances { get; set; }
    public int InStock { get; set; }
    public int Sold { get; set; }
    public int UnderWarranty { get; set; }
    public int InRepair { get; set; }
    public int Broken { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public decimal TotalSoldValue { get; set; }
    public decimal TotalProfit { get; set; }
}

#endregion
