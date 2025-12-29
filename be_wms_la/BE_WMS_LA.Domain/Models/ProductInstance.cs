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
    /// Mã Part Number (nếu quản lý sâu linh kiện bên trong)
    /// </summary>
    [StringLength(100)]
    public string? PartNumber { get; set; }

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
    /// Trạng thái: IN_STOCK, SOLD, WARRANTY, BROKEN, TRANSFERRING, DEMO
    /// </summary>
    [StringLength(50)]
    public string Status { get; set; } = "IN_STOCK";

    /// <summary>
    /// Giá nhập thực tế của riêng chiếc này (mỗi đợt có thể khác nhau)
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal? ActualImportPrice { get; set; }

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
    /// Kho chứa
    /// </summary>
    [ForeignKey(nameof(WarehouseID))]
    public virtual Warehouse? Warehouse { get; set; }

    #endregion
}
