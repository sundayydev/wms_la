using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Lưu trữ hình ảnh, tài liệu đính kèm cho mọi đối tượng trong hệ thống
/// </summary>
[Table("Attachments")]
public class Attachment
{
    [Key]
    public Guid AttachmentID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// Loại đối tượng: 'PRODUCT', 'REPAIR', 'PAYMENT', 'ORDER'
    /// </summary>
    [Required]
    [StringLength(50)]
    public string EntityType { get; set; } = string.Empty;

    /// <summary>
    /// ID của đối tượng tương ứng
    /// </summary>
    [Required]
    public Guid EntityID { get; set; }

    [StringLength(255)]
    public string? FileName { get; set; }

    /// <summary>
    /// Đường dẫn file trên server/cloud
    /// </summary>
    [Required]
    [StringLength(500)]
    public string FileURL { get; set; } = string.Empty;

    /// <summary>
    /// 'IMAGE', 'PDF', 'DOC'
    /// </summary>
    [StringLength(50)]
    public string? FileType { get; set; }

    public Guid? UploadedByUserID { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    #region Navigation Properties

    [ForeignKey(nameof(UploadedByUserID))]
    public virtual User? UploadedByUser { get; set; }

    #endregion
}
