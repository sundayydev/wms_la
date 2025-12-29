using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Chi tiết từng dòng sản phẩm trong đơn bán
/// </summary>
[Table("SalesOrderDetails")]
public class SalesOrderDetail
{
    [Key]
    public Guid SalesOrderDetailID { get; set; } = Guid.NewGuid();

    [Required]
    public Guid SalesOrderID { get; set; }

    /// <summary>
    /// FK: Loại sản phẩm
    /// </summary>
    public Guid? ComponentID { get; set; }

    /// <summary>
    /// FK: Máy cụ thể (nếu có Serial)
    /// </summary>
    public Guid? InstanceID { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal UnitPrice { get; set; }

    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal TotalPrice { get; set; }

    /// <summary>
    /// Phần trăm chiết khấu
    /// </summary>
    [Column(TypeName = "decimal(5,2)")]
    public decimal DiscountPercent { get; set; } = 0;

    /// <summary>
    /// Số tiền chiết khấu
    /// </summary>
    [Column(TypeName = "decimal(15,2)")]
    public decimal DiscountAmount { get; set; } = 0;

    /// <summary>
    /// Giá sau chiết khấu
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal FinalPrice { get; set; }

    public string? Notes { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(SalesOrderID))]
    public virtual SalesOrder SalesOrder { get; set; } = null!;

    [ForeignKey(nameof(ComponentID))]
    public virtual Component? Component { get; set; }

    [ForeignKey(nameof(InstanceID))]
    public virtual ProductInstance? Instance { get; set; }

    #endregion
}
