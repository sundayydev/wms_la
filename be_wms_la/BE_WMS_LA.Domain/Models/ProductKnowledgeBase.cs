using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BE_WMS_LA.Shared.Common;

namespace BE_WMS_LA.Domain.Models;

[Table("ProductKnowledgeBase")]
public class ProductKnowledgeBase
{
    [Key]
    public Guid KnowledgeID { get; set; } = Guid.NewGuid();

    public Guid? ComponentID { get; set; } // Link tới sản phẩm (nếu có)

    #region Thông tin hiển thị
    [Required, StringLength(200)]
    public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    // Loại nội dung: DOCUMENT, VIDEO...
    public KnowledgeType ContentType { get; set; } = KnowledgeType.DOCUMENT;

    // Phạm vi truy cập gốc: PUBLIC (khách xem được), INTERNAL (chỉ nhân viên)
    public AccessScope Scope { get; set; } = AccessScope.INTERNAL;
    #endregion

    #region MinIO & File Gốc
    [StringLength(100)]
    public string BucketName { get; set; } = "knowledge-base";

    [StringLength(500)]
    public string ObjectKey { get; set; } = string.Empty; // Đường dẫn file gốc (docx, xlsx, mp4...)

    [StringLength(255)]
    public string? OriginalFileName { get; set; }

    public long FileSize { get; set; }

    [StringLength(100)]
    public string? MimeType { get; set; }
    #endregion

    #region Preview & Media Info (Quan trọng cho React/Flutter)

    // Trạng thái xử lý (VD: Đang convert docx sang pdf để preview)
    public FileStatus ProcessStatus { get; set; } = FileStatus.READY;

    // Đường dẫn file PDF được convert từ Docx/Excel để xem preview trên web/app
    [StringLength(500)]
    public string? PreviewObjectKey { get; set; }

    // Ảnh thumbnail (nếu là video hoặc trang đầu của tài liệu)
    [StringLength(500)]
    public string? ThumbnailObjectKey { get; set; }

    // Nếu là Youtube/Vimeo thì lưu link ở đây, bỏ qua ObjectKey
    [StringLength(500)]
    public string? ExternalVideoURL { get; set; }
    #endregion

    #region Audit (Người tạo/sửa)
    public Guid CreatedByUserID { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Guid? UpdatedByUserID { get; set; }
    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(CreatedByUserID))]
    public virtual User? CreatedByUser { get; set; }

    [ForeignKey(nameof(UpdatedByUserID))]
    public virtual User? UpdatedByUser { get; set; }
    #endregion

    // Navigation tới bảng Share
    public virtual ICollection<DocumentShare> Shares { get; set; } = new List<DocumentShare>();
}