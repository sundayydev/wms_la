using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Thông báo đẩy cho người dùng (Mobile/Web)
/// </summary>
[Table("Notifications")]
public class Notification
{
    [Key]
    public Guid NotificationID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK: Người nhận thông báo
    /// </summary>
    [Required]
    public Guid UserID { get; set; }

    /// <summary>
    /// Tiêu đề thông báo
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Nội dung chi tiết
    /// </summary>
    [Required]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Loại: ORDER, PAYMENT, STOCK (cảnh báo tồn kho), SYSTEM
    /// </summary>
    [StringLength(50)]
    public string? NotificationType { get; set; }

    /// <summary>
    /// Loại đối tượng liên quan (Order, Repair...)
    /// </summary>
    [StringLength(50)]
    public string? ReferenceType { get; set; }

    /// <summary>
    /// ID đối tượng để link khi tap vào thông báo
    /// </summary>
    public Guid? ReferenceID { get; set; }

    /// <summary>
    /// Đã đọc chưa
    /// </summary>
    public bool IsRead { get; set; } = false;

    /// <summary>
    /// Thời điểm đọc
    /// </summary>
    public DateTime? ReadAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? DeletedAt { get; set; }

    #region Navigation Properties

    [ForeignKey(nameof(UserID))]
    public virtual User User { get; set; } = null!;

    #endregion
}
