using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;


[Table("DocumentShare")]
public class DocumentShare
{
    [Key]
    public Guid ShareID { get; set; } = Guid.NewGuid();

    public Guid KnowledgeID { get; set; }

    // Token dùng để tạo link chia sẻ: domain.com/share/{ShareToken}
    // Token này giúp ẩn ID thật và dễ dàng thu hồi (revoke)
    [Required, StringLength(100)]
    public string ShareToken { get; set; } = Guid.NewGuid().ToString("N");

    #region Cấu hình chia sẻ

    // Nếu null => Share Public (ai có link cũng vào được)
    // Nếu có giá trị => Chỉ User có Email này (hoặc UserID này) mới xem được
    public Guid? TargetUserID { get; set; }

    [StringLength(200)]
    public string? TargetEmail { get; set; } // Lưu email để hiển thị hoặc gửi mail mời

    public DateTime? ExpiryDate { get; set; } // Thời hạn

    public int? MaxDownloads { get; set; } // Giới hạn lượt tải (Null = vô hạn)

    public int CurrentDownloads { get; set; } = 0; // Đã tải bao nhiêu lần

    public bool IsActive { get; set; } = true; // Thu hồi link nhanh bằng cách set false
    #endregion

    public Guid CreatedByUserID { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(KnowledgeID))]
    public virtual ProductKnowledgeBase KnowledgeBase { get; set; }

    [ForeignKey(nameof(TargetUserID))]
    public virtual User? TargetUser { get; set; }
}