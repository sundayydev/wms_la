using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Quản lý tất cả giao dịch thanh toán
/// </summary>
[Table("Payments")]
public class Payment
{
    [Key]
    public Guid PaymentID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Mã thanh toán (VD: PAY-2024-001)
    /// </summary>
    [Required]
    [StringLength(50)]
    public string PaymentCode { get; set; } = string.Empty;

    /// <summary>
    /// Loại: SALES_ORDER, REPAIR, PURCHASE_ORDER
    /// </summary>
    [Required]
    [StringLength(50)]
    public string ReferenceType { get; set; } = string.Empty;

    /// <summary>
    /// FK: ID đơn hàng được thanh toán
    /// </summary>
    [Required]
    public Guid ReferenceID { get; set; }

    /// <summary>
    /// FK: Khách hàng (nếu thu tiền)
    /// </summary>
    public Guid? CustomerID { get; set; }

    /// <summary>
    /// FK: Nhà cung cấp (nếu trả tiền)
    /// </summary>
    public Guid? SupplierID { get; set; }

    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Phương thức: CASH, BANK_TRANSFER, MOMO, CREDIT_CARD
    /// </summary>
    [Required]
    [StringLength(50)]
    public string PaymentMethod { get; set; } = string.Empty;

    /// <summary>
    /// Số tiền thanh toán
    /// </summary>
    [Required]
    [Column(TypeName = "decimal(15,2)")]
    public decimal Amount { get; set; }

    /// <summary>
    /// Trạng thái: PENDING, COMPLETED, FAILED, REFUNDED
    /// </summary>
    [StringLength(50)]
    public string Status { get; set; } = "PENDING";

    /// <summary>
    /// Mã giao dịch từ cổng thanh toán (VNPay, Momo...)
    /// </summary>
    [StringLength(100)]
    public string? TransactionID { get; set; }

    public string? Notes { get; set; }

    public Guid? CreatedByUserID { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(CustomerID))]
    public virtual Customer? Customer { get; set; }

    [ForeignKey(nameof(SupplierID))]
    public virtual Supplier? Supplier { get; set; }

    [ForeignKey(nameof(CreatedByUserID))]
    public virtual User? CreatedByUser { get; set; }

    #endregion
}
