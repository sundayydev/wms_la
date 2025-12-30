using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Quản lý TỪNG thiết bị cụ thể theo Serial/IMEI. Mỗi dòng = 1 chiếc máy thực tế
/// </summary>
[Table("ProductInstances")]
public class ProductInstance
{
    /// <summary>
    /// Khóa chính UUID
    /// </summary>
    [Key]
    public Guid InstanceID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK: Loại sản phẩm (link đến Components)
    /// </summary>
    [Required]
    public Guid ComponentID { get; set; }

    /// <summary>
    /// FK: Biến thể sản phẩm (Part Number) - NULL nếu không có biến thể
    /// </summary>
    public Guid? VariantID { get; set; }

    /// <summary>
    /// FK: Kho đang chứa thiết bị này
    /// </summary>
    public Guid? WarehouseID { get; set; }

    /// <summary>
    /// Số Serial - Duy nhất cho mỗi máy
    /// </summary>
    [Required]
    [StringLength(100)]
    public string SerialNumber { get; set; } = string.Empty;

    /// <summary>
    /// Model Number cụ thể của máy (legacy)
    /// </summary>
    [StringLength(100)]
    public string? ModelNumber { get; set; }

    /// <summary>
    /// Mã thùng hàng lúc nhập
    /// </summary>
    [StringLength(50)]
    public string? InboundBoxNumber { get; set; }

    /// <summary>
    /// Mã IMEI chính (quan trọng cho điện thoại)
    /// </summary>
    [StringLength(20)]
    public string? IMEI1 { get; set; }

    /// <summary>
    /// Mã IMEI phụ (máy 2 SIM hoặc eSIM)
    /// </summary>
    [StringLength(20)]
    public string? IMEI2 { get; set; }

    /// <summary>
    /// MAC Address nếu có (VD: AA:BB:CC:DD:EE:FF)
    /// </summary>
    [StringLength(17)]
    public string? MACAddress { get; set; }

    /// <summary>
    /// Trạng thái: IN_STOCK, SOLD, WARRANTY, REPAIR, BROKEN, TRANSFERRING, DEMO, SCRAPPED, LOST
    /// </summary>
    [StringLength(50)]
    public string Status { get; set; } = "IN_STOCK";

    /// <summary>
    /// Vị trí chi tiết trong kho (VD: MAIN-A-01-R1-S2-B03)
    /// </summary>
    [StringLength(100)]
    public string? LocationCode { get; set; }

    /// <summary>
    /// Khu vực (MAIN, REPAIR, DEMO, QUARANTINE)
    /// </summary>
    [StringLength(50)]
    public string? Zone { get; set; }

    /// <summary>
    /// Loại chủ sở hữu hiện tại: COMPANY, CUSTOMER, SUPPLIER, DEMO_PARTNER
    /// </summary>
    [StringLength(50)]
    public string CurrentOwnerType { get; set; } = "COMPANY";

    /// <summary>
    /// CustomerID hoặc SupplierID (NULL nếu COMPANY sở hữu)
    /// </summary>
    public Guid? CurrentOwnerID { get; set; }

    #region Bảo hành

    public DateTime? WarrantyStartDate { get; set; }
    public DateTime? WarrantyEndDate { get; set; }
    public int WarrantyMonths { get; set; } = 12;

    #endregion

    #region Sửa chữa

    public int TotalRepairCount { get; set; } = 0;
    public DateTime? LastRepairDate { get; set; }

    #endregion

    /// <summary>
    /// Giá nhập thực tế của riêng chiếc này (mỗi đợt có thể khác nhau)
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal? ActualImportPrice { get; set; }

    /// <summary>
    /// Giá bán thực tế (nếu đã bán)
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal? ActualSellPrice { get; set; }

    public DateTime? SoldDate { get; set; }
    public Guid? SoldToCustomerID { get; set; }

    /// <summary>
    /// Ngày nhập kho
    /// </summary>
    public DateTime ImportDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Ghi chú riêng cho máy (VD: Trầy xước nhẹ, Hàng trưng bày)
    /// </summary>
    public string? Notes { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    /// <summary>
    /// Loại sản phẩm
    /// </summary>
    [ForeignKey(nameof(ComponentID))]
    public virtual Component Component { get; set; } = null!;

    /// <summary>
    /// Biến thể sản phẩm (Part Number)
    /// </summary>
    [ForeignKey(nameof(VariantID))]
    public virtual ComponentVariant? Variant { get; set; }

    /// <summary>
    /// Kho chứa
    /// </summary>
    [ForeignKey(nameof(WarehouseID))]
    public virtual Warehouse? Warehouse { get; set; }

    #endregion
}
