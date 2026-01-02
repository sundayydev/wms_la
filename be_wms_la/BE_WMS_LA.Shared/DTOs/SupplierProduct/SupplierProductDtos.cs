using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.SupplierProduct;

/// <summary>
/// DTO danh sách sản phẩm của nhà cung cấp
/// </summary>
public class SupplierProductDto
{
    public Guid SupplierProductID { get; set; }
    public Guid SupplierID { get; set; }
    public string SupplierCode { get; set; } = string.Empty;
    public string SupplierName { get; set; } = string.Empty;
    public Guid ComponentID { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public Guid? VariantID { get; set; }
    public string? VariantPartNumber { get; set; }

    // Pricing
    public decimal UnitCost { get; set; }
    public string Currency { get; set; } = "VND";
    public DateTime? PriceValidFrom { get; set; }
    public DateTime? PriceValidTo { get; set; }
    public DateTime? LastPriceUpdate { get; set; }

    // Ordering
    public int MinOrderQuantity { get; set; }
    public int OrderMultiple { get; set; }
    public int? LeadTimeDays { get; set; }

    // Preference
    public bool IsPreferred { get; set; }
    public int Priority { get; set; }

    // Quality
    public decimal? QualityRating { get; set; }
    public decimal? DeliveryRating { get; set; }
    public DateTime? LastDeliveryDate { get; set; }
    public int TotalOrderedQuantity { get; set; }
    public int TotalReceivedQuantity { get; set; }

    // Status
    public bool IsActive { get; set; }
    public DateTime? DiscontinuedDate { get; set; }
}

/// <summary>
/// DTO chi tiết sản phẩm của nhà cung cấp
/// </summary>
public class SupplierProductDetailDto : SupplierProductDto
{
    public string? SupplierSKU { get; set; }
    public string? SupplierPartNumber { get; set; }
    public string? TierPricing { get; set; }
    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO tạo sản phẩm cho nhà cung cấp
/// </summary>
public class CreateSupplierProductDto
{
    [Required(ErrorMessage = "Nhà cung cấp không được để trống")]
    public Guid SupplierID { get; set; }

    [Required(ErrorMessage = "Sản phẩm không được để trống")]
    public Guid ComponentID { get; set; }

    public Guid? VariantID { get; set; }

    [StringLength(100)]
    public string? SupplierSKU { get; set; }

    [StringLength(100)]
    public string? SupplierPartNumber { get; set; }

    [Required(ErrorMessage = "Giá nhập không được để trống")]
    [Range(0, double.MaxValue, ErrorMessage = "Giá nhập phải lớn hơn 0")]
    public decimal UnitCost { get; set; }

    [StringLength(10)]
    public string Currency { get; set; } = "VND";

    public string? TierPricing { get; set; }
    public DateTime? PriceValidFrom { get; set; }
    public DateTime? PriceValidTo { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Số lượng đặt tối thiểu phải >= 1")]
    public int MinOrderQuantity { get; set; } = 1;

    [Range(1, int.MaxValue, ErrorMessage = "Bội số đặt hàng phải >= 1")]
    public int OrderMultiple { get; set; } = 1;

    public int? LeadTimeDays { get; set; }

    public bool IsPreferred { get; set; } = false;

    [Range(0, 100)]
    public int Priority { get; set; } = 0;

    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }

    public bool IsActive { get; set; } = true;
}

/// <summary>
/// DTO cập nhật sản phẩm nhà cung cấp
/// </summary>
public class UpdateSupplierProductDto
{
    [StringLength(100)]
    public string? SupplierSKU { get; set; }

    [StringLength(100)]
    public string? SupplierPartNumber { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Giá nhập phải lớn hơn 0")]
    public decimal? UnitCost { get; set; }

    [StringLength(10)]
    public string? Currency { get; set; }

    public string? TierPricing { get; set; }
    public DateTime? PriceValidFrom { get; set; }
    public DateTime? PriceValidTo { get; set; }

    [Range(1, int.MaxValue)]
    public int? MinOrderQuantity { get; set; }

    [Range(1, int.MaxValue)]
    public int? OrderMultiple { get; set; }

    public int? LeadTimeDays { get; set; }

    public bool? IsPreferred { get; set; }

    [Range(0, 100)]
    public int? Priority { get; set; }

    public string? Notes { get; set; }
    public string? InternalNotes { get; set; }

    public bool? IsActive { get; set; }
}

/// <summary>
/// DTO thêm nhiều sản phẩm cho NCC
/// </summary>
public class BulkAddSupplierProductsDto
{
    [Required]
    public List<Guid> ComponentIDs { get; set; } = new();

    [Required]
    [Range(0, double.MaxValue)]
    public decimal DefaultUnitCost { get; set; }

    public string Currency { get; set; } = "VND";
    public int MinOrderQuantity { get; set; } = 1;
    public int OrderMultiple { get; set; } = 1;
}

/// <summary>
/// DTO cập nhật giá hàng loạt
/// </summary>
public class BulkUpdatePricesDto
{
    public List<PriceUpdateItem> PriceUpdates { get; set; } = new();
}

public class PriceUpdateItem
{
    public Guid ComponentID { get; set; }
    public Guid? VariantID { get; set; }
    public decimal NewUnitCost { get; set; }
    public DateTime? ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
}

/// <summary>
/// DTO cập nhật đánh giá
/// </summary>
public class UpdateSupplierRatingDto
{
    [Range(0, 5)]
    public decimal? QualityRating { get; set; }

    [Range(0, 5)]
    public decimal? DeliveryRating { get; set; }

    public string? Notes { get; set; }
}

/// <summary>
/// Kết quả thao tác hàng loạt
/// </summary>
public class BulkOperationResult
{
    public int TotalRequested { get; set; }
    public int SuccessCount { get; set; }
    public int FailureCount { get; set; }
    public List<string> Errors { get; set; } = new();
    public List<Guid> SuccessfulIDs { get; set; } = new();
}

/// <summary>
/// Thống kê sản phẩm của nhà cung cấp
/// </summary>
public class SupplierProductStatistics
{
    public Guid SupplierID { get; set; }
    public string SupplierName { get; set; } = string.Empty;
    public int TotalProducts { get; set; }
    public int ActiveProducts { get; set; }
    public int PreferredProducts { get; set; }
    public int DiscontinuedProducts { get; set; }
    public decimal AverageQualityRating { get; set; }
    public decimal AverageDeliveryRating { get; set; }
    public int TotalOrderedQuantity { get; set; }
    public int TotalReceivedQuantity { get; set; }
    public decimal? LowestPrice { get; set; }
    public decimal? HighestPrice { get; set; }
    public decimal? AveragePrice { get; set; }
}
