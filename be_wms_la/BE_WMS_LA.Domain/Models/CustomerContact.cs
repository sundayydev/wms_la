using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Danh sách nhân viên liên hệ của khách hàng công ty
/// </summary>
[Table("CustomerContacts")]
public class CustomerContact
{
    [Key]
    public Guid ContactID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK: Khách hàng công ty
    /// </summary>
    [Required]
    public Guid CustomerID { get; set; }

    /// <summary>
    /// Tên nhân viên liên hệ
    /// </summary>
    [Required]
    [StringLength(200)]
    public string ContactName { get; set; } = string.Empty;

    /// <summary>
    /// Chức vụ (Thủ kho, Kế toán, Giám đốc...)
    /// </summary>
    [StringLength(100)]
    public string? Position { get; set; }

    /// <summary>
    /// Phòng ban
    /// </summary>
    [StringLength(100)]
    public string? Department { get; set; }

    /// <summary>
    /// SĐT riêng của nhân viên này
    /// </summary>
    [Required]
    [StringLength(20)]
    public string PhoneNumber { get; set; } = string.Empty;

    [StringLength(100)]
    public string? Email { get; set; }

    /// <summary>
    /// Đánh dấu người nhận hàng chính
    /// </summary>
    public bool IsDefaultReceiver { get; set; } = false;

    /// <summary>
    /// Ghi chú (VD: Chỉ nhận hàng giờ hành chính)
    /// </summary>
    public string? Note { get; set; }

    #region Audit fields

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    #endregion

    #region Navigation Properties

    [ForeignKey(nameof(CustomerID))]
    public virtual Customer Customer { get; set; } = null!;

    #endregion
}
