using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Inventory;

#region List & Detail DTOs

/// <summary>
/// DTO danh sách ProductInstance (hàng tồn kho theo serial)
/// </summary>
public class ProductInstanceListDto
{
    public Guid InstanceID { get; set; }
    public Guid ComponentID { get; set; }
    public string ComponentSKU { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public string? ImageURL { get; set; }
    public Guid? VariantID { get; set; }
    public string? PartNumber { get; set; }
    public string SerialNumber { get; set; } = string.Empty;
    public string? IMEI1 { get; set; }
    public Guid? WarehouseID { get; set; }
    public string? WarehouseName { get; set; }
    public string? LocationCode { get; set; }
    public string Status { get; set; } = "IN_STOCK";
    public string CurrentOwnerType { get; set; } = "COMPANY";
    public DateTime? WarrantyEndDate { get; set; }
    public decimal? ActualImportPrice { get; set; }
    public DateTime ImportDate { get; set; }
}

/// <summary>
/// DTO chi tiết ProductInstance
/// </summary>
public class ProductInstanceDetailDto
{
    public Guid InstanceID { get; set; }

    // Component info
    public Guid ComponentID { get; set; }
    public string ComponentSKU { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public string? ImageURL { get; set; }
    public string? Brand { get; set; }
    public string? Model { get; set; }

    // Variant info
    public Guid? VariantID { get; set; }
    public string? PartNumber { get; set; }
    public string? VariantName { get; set; }

    // Warehouse info
    public Guid? WarehouseID { get; set; }
    public string? WarehouseName { get; set; }

    // Serial & identifiers
    public string SerialNumber { get; set; } = string.Empty;
    public string? ModelNumber { get; set; }
    public string? InboundBoxNumber { get; set; }
    public string? IMEI1 { get; set; }
    public string? IMEI2 { get; set; }
    public string? MACAddress { get; set; }

    // Status & Location
    public string Status { get; set; } = "IN_STOCK";
    public string? LocationCode { get; set; }
    public string? Zone { get; set; }

    // Ownership
    public string CurrentOwnerType { get; set; } = "COMPANY";
    public Guid? CurrentOwnerID { get; set; }
    public string? OwnerName { get; set; }

    // Warranty
    public DateTime? WarrantyStartDate { get; set; }
    public DateTime? WarrantyEndDate { get; set; }
    public int WarrantyMonths { get; set; }
    public bool IsUnderWarranty { get; set; }

    // Repair history
    public int TotalRepairCount { get; set; }
    public DateTime? LastRepairDate { get; set; }

    // Pricing
    public decimal? ActualImportPrice { get; set; }
    public decimal? ActualSellPrice { get; set; }

    // Sales info
    public DateTime? SoldDate { get; set; }
    public Guid? SoldToCustomerID { get; set; }
    public string? SoldToCustomerName { get; set; }

    // Import info
    public DateTime ImportDate { get; set; }
    public string? Notes { get; set; }

    // Audit
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

#endregion

#region Create & Update DTOs

/// <summary>
/// DTO nhập hàng mới (tạo ProductInstance)
/// </summary>
public class CreateProductInstanceDto
{
    [Required(ErrorMessage = "Sản phẩm là bắt buộc")]
    public Guid ComponentID { get; set; }

    public Guid? VariantID { get; set; }

    [Required(ErrorMessage = "Kho là bắt buộc")]
    public Guid WarehouseID { get; set; }

    [Required(ErrorMessage = "Số Serial là bắt buộc")]
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

    public int WarrantyMonths { get; set; } = 12;

    public decimal? ActualImportPrice { get; set; }

    public DateTime? ImportDate { get; set; }

    public string? Notes { get; set; }
}

/// <summary>
/// DTO nhập nhiều serial cùng lúc
/// </summary>
public class BulkCreateProductInstanceDto
{
    [Required]
    public Guid ComponentID { get; set; }

    public Guid? VariantID { get; set; }

    [Required]
    public Guid WarehouseID { get; set; }

    [Required]
    [MinLength(1, ErrorMessage = "Phải có ít nhất 1 serial")]
    public List<string> SerialNumbers { get; set; } = new();

    [StringLength(50)]
    public string? InboundBoxNumber { get; set; }

    [StringLength(100)]
    public string? LocationCode { get; set; }

    public int WarrantyMonths { get; set; } = 12;

    public decimal? ActualImportPrice { get; set; }

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

    [StringLength(20)]
    public string? IMEI1 { get; set; }

    [StringLength(20)]
    public string? IMEI2 { get; set; }

    [StringLength(17)]
    public string? MACAddress { get; set; }

    public string? Notes { get; set; }
}

/// <summary>
/// DTO cập nhật trạng thái
/// </summary>
public class UpdateInstanceStatusDto
{
    [Required]
    [StringLength(50)]
    public string Status { get; set; } = string.Empty;

    public string? Notes { get; set; }
}

/// <summary>
/// DTO bán hàng (chuyển sở hữu cho khách)
/// </summary>
public class SellInstanceDto
{
    [Required]
    public Guid CustomerID { get; set; }

    public decimal? ActualSellPrice { get; set; }

    public DateTime? SoldDate { get; set; }

    public string? Notes { get; set; }
}

/// <summary>
/// DTO chuyển kho
/// </summary>
public class TransferInstanceDto
{
    [Required]
    public Guid ToWarehouseID { get; set; }

    [StringLength(100)]
    public string? NewLocationCode { get; set; }

    public string? Notes { get; set; }
}

#endregion

#region Statistics

/// <summary>
/// Thống kê tồn kho
/// </summary>
public class InventoryStatisticsDto
{
    public int TotalInstances { get; set; }
    public int InStock { get; set; }
    public int Sold { get; set; }
    public int InWarranty { get; set; }
    public int InRepair { get; set; }
    public int Transferring { get; set; }
    public int Demo { get; set; }
    public int Scrapped { get; set; }
    public int Lost { get; set; }
    public decimal TotalImportValue { get; set; }
    public decimal TotalSoldValue { get; set; }
}

/// <summary>
/// Tồn kho theo kho
/// </summary>
public class WarehouseStockSummaryDto
{
    public Guid WarehouseID { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int TotalInstances { get; set; }
    public int InStock { get; set; }
    public decimal TotalValue { get; set; }
}

#endregion
