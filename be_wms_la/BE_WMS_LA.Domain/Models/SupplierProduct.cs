using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Sản phẩm từ Nhà cung cấp - Quản lý NCC nào cung cấp sản phẩm gì
/// </summary>
[Table("SupplierProducts")]
public class SupplierProduct
{
    [Key]
    public Guid SupplierProductID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK: Nhà cung cấp
    /// </summary>
    [Required]
    public Guid SupplierID { get; set; }

    /// <summary>
    /// FK: Sản phẩm (SKU)
    /// </summary>
    [Required]
    public Guid ComponentID { get; set; }

    /// <summary>
    /// FK: Biến thể cụ thể (Part Number) - NULL nếu áp dụng cho tất cả biến thể
    /// </summary>
    public Guid? VariantID { get; set; }

    #region Mã sản phẩm từ NCC

    /// <summary>
    /// Mã sản phẩm theo NCC (nếu khác với SKU nội bộ)
    /// </summary>
    [StringLength(100)]
    public string? SupplierSKU { get; set; }

    /// <summary>
    /// Part Number từ NCC
    /// </summary>
    [StringLength(100)]
    public string? SupplierPartNumber { get; set; }

    #endregion

    #region Giá cả

    /// <summary>
    /// Giá nhập từ NCC (đơn giá)
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal UnitCost { get; set; }

    /// <summary>
    /// Loại tiền (VND, USD, CNY)
    /// </summary>
    [StringLength(10)]
    public string Currency { get; set; } = "VND";

    /// <summary>
    /// Bảng giá theo số lượng (JSON)
    /// VD: [{"minQty": 1, "price": 5000000}, {"minQty": 10, "price": 4800000}]
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string? TierPricing { get; set; }

    /// <summary>
    /// Giá có hiệu lực từ
    /// </summary>
    public DateTime? PriceValidFrom { get; set; }

    /// <summary>
    /// Giá có hiệu lực đến
    /// </summary>
    public DateTime? PriceValidTo { get; set; }

    /// <summary>
    /// Lần cập nhật giá gần nhất
    /// </summary>
    public DateTime? LastPriceUpdate { get; set; }

    #endregion

    #region Thông tin đặt hàng

    /// <summary>
    /// Số lượng đặt tối thiểu (MOQ)
    /// </summary>
    public int MinOrderQuantity { get; set; } = 1;

    /// <summary>
    /// Bội số đặt hàng (VD: phải đặt theo lô 10 cái)
    /// </summary>
    public int OrderMultiple { get; set; } = 1;

    /// <summary>
    /// Thời gian giao hàng dự kiến (số ngày)
    /// </summary>
    public int? LeadTimeDays { get; set; }

    #endregion

    #region Ưu tiên

    /// <summary>
    /// TRUE = NCC ưu tiên cho sản phẩm này
    /// </summary>
    public bool IsPreferred { get; set; } = false;

    /// <summary>
    /// Mức độ ưu tiên (0 = thấp nhất)
    /// </summary>
    public int Priority { get; set; } = 0;

    #endregion

    #region Chất lượng & Đánh giá

    /// <summary>
    /// Đánh giá chất lượng (0.00 - 5.00)
    /// </summary>
    [Column(TypeName = "decimal(3,2)")]
    public decimal? QualityRating { get; set; }

    /// <summary>
    /// Đánh giá giao hàng đúng hạn
    /// </summary>
    [Column(TypeName = "decimal(3,2)")]
    public decimal? DeliveryRating { get; set; }

    /// <summary>
    /// Lần giao hàng gần nhất
    /// </summary>
    public DateTime? LastDeliveryDate { get; set; }

    /// <summary>
    /// Tổng số lượng đã đặt
    /// </summary>
    public int TotalOrderedQuantity { get; set; } = 0;

    /// <summary>
    /// Tổng số lượng đã nhận
    /// </summary>
    public int TotalReceivedQuantity { get; set; } = 0;

    #endregion

    #region Trạng thái

    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Ngày NCC ngừng cung cấp sản phẩm này
    /// </summary>
    public DateTime? DiscontinuedDate { get; set; }

    #endregion

    #region Ghi chú

    /// <summary>
    /// Ghi chú (VD: Chỉ còn hàng cũ, Hàng mới về cuối tháng)
    /// </summary>
    public string? Notes { get; set; }

    /// <summary>
    /// Ghi chú nội bộ (VD: NCC hay giao chậm)
    /// </summary>
    public string? InternalNotes { get; set; }

    #endregion

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(SupplierID))]
    public virtual Supplier Supplier { get; set; } = null!;

    [ForeignKey(nameof(ComponentID))]
    public virtual Component Component { get; set; } = null!;

    [ForeignKey(nameof(VariantID))]
    public virtual ComponentVariant? Variant { get; set; }

    #endregion
}
