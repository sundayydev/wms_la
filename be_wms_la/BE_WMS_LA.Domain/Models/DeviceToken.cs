using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Lưu token thiết bị để gửi Push Notification
/// </summary>
[Table("DeviceTokens")]
public class DeviceToken
{
    [Key]
    public Guid TokenID { get; set; } = Guid.NewGuid();

    [Required]
    public Guid UserID { get; set; }

    /// <summary>
    /// FCM/APNs token của thiết bị
    /// </summary>
    [Required]
    [StringLength(500)]
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Loại: IOS, ANDROID
    /// </summary>
    [StringLength(50)]
    public string? DeviceType { get; set; }

    /// <summary>
    /// Tên thiết bị (VD: iPhone 15 Pro)
    /// </summary>
    [StringLength(200)]
    public string? DeviceName { get; set; }

    /// <summary>
    /// Token còn hoạt động hay đã revoke
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Lần cuối sử dụng (để dọn token cũ)
    /// </summary>
    public DateTime LastUsedAt { get; set; } = DateTime.UtcNow;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    #region Navigation Properties

    [ForeignKey(nameof(UserID))]
    public virtual User User { get; set; } = null!;

    #endregion
}
