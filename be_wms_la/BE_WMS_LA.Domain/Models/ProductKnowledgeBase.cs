using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BE_WMS_LA.Domain.Models;

/// <summary>
/// Kho tri thức sản phẩm - Lưu trữ tài liệu, video hướng dẫn, driver, firmware
/// </summary>
[Table("ProductKnowledgeBase")]
public class ProductKnowledgeBase
{
    /// <summary>
    /// Khóa chính UUID
    /// </summary>
    [Key]
    public Guid KnowledgeID { get; set; } = Guid.NewGuid();

    /// <summary>
    /// FK: Link tới sản phẩm nào (NULL = tài liệu chung)
    /// </summary>
    public Guid? ComponentID { get; set; }

    #region Thông tin cơ bản

    /// <summary>
    /// Tiêu đề tài liệu (VD: Hướng dẫn cài đặt Wifi, Cách thay pin)
    /// </summary>
    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Mô tả chi tiết về tài liệu
    /// </summary>
    public string? Description { get; set; }

    #endregion

    #region Loại tài liệu

    /// <summary>
    /// Loại nội dung: 'DOCUMENT' (PDF, Doc), 'VIDEO' (Youtube, Vimeo), 'DRIVER', 'FIRMWARE'
    /// </summary>
    [Required]
    [StringLength(50)]
    public string ContentType { get; set; } = "DOCUMENT";

    /// <summary>
    /// Đường dẫn file hoặc link video (Youtube, Vimeo, ...)
    /// </summary>
    [Required]
    [StringLength(500)]
    public string ContentURL { get; set; } = string.Empty;

    /// <summary>
    /// Ảnh thumbnail cho video
    /// </summary>
    [StringLength(500)]
    public string? ThumbnailURL { get; set; }

    #endregion

    #region MinIO Storage

    /// <summary>
    /// Tên bucket trong MinIO (VD: knowledge-base, documents, firmware)
    /// </summary>
    [StringLength(100)]
    public string? BucketName { get; set; }

    /// <summary>
    /// Object Key - Đường dẫn file trong bucket MinIO
    /// VD: products/{ComponentID}/documents/{filename}
    /// </summary>
    [StringLength(500)]
    public string? ObjectKey { get; set; }

    /// <summary>
    /// ETag từ MinIO - Dùng để verify integrity và caching
    /// </summary>
    [StringLength(100)]
    public string? ETag { get; set; }

    /// <summary>
    /// Version ID từ MinIO (nếu bật versioning)
    /// </summary>
    [StringLength(100)]
    public string? VersionID { get; set; }

    /// <summary>
    /// Kích thước file (bytes)
    /// </summary>
    public long? FileSize { get; set; }

    /// <summary>
    /// MIME Type của file (VD: application/pdf, video/mp4, application/octet-stream)
    /// </summary>
    [StringLength(100)]
    public string? MimeType { get; set; }

    /// <summary>
    /// Tên file gốc khi upload (VD: Hướng dẫn sử dụng M63.pdf)
    /// </summary>
    [StringLength(255)]
    public string? OriginalFileName { get; set; }

    #endregion

    #region Sharing Features

    /// <summary>
    /// Token duy nhất để chia sẻ file (dùng cho presigned URL hoặc public link)
    /// </summary>
    [StringLength(100)]
    public string? ShareToken { get; set; }

    /// <summary>
    /// URL chia sẻ đã được generate (presigned URL từ MinIO)
    /// Có thể null nếu chưa được share hoặc đã hết hạn
    /// </summary>
    [StringLength(1000)]
    public string? SharedURL { get; set; }

    /// <summary>
    /// Thời điểm hết hạn của link chia sẻ
    /// </summary>
    public DateTime? SharedExpiry { get; set; }

    /// <summary>
    /// TRUE = File đang được chia sẻ public, FALSE = Cần xác thực
    /// </summary>
    public bool IsShared { get; set; } = false;

    /// <summary>
    /// Số lần download tối đa cho phép (NULL = không giới hạn)
    /// </summary>
    public int? MaxDownloads { get; set; }

    /// <summary>
    /// Số lần đã download
    /// </summary>
    public int DownloadCount { get; set; } = 0;

    /// <summary>
    /// FK: Người chia sẻ file
    /// </summary>
    public Guid? SharedByUserID { get; set; }

    /// <summary>
    /// Thời điểm chia sẻ
    /// </summary>
    public DateTime? SharedAt { get; set; }

    #endregion

    #region Phân quyền truy cập

    /// <summary>
    /// Mức độ truy cập: 'PUBLIC' (Ai cũng xem được), 'INTERNAL' (Nội bộ), 'RESTRICTED' (Theo role cụ thể)
    /// </summary>
    [StringLength(50)]
    public string AccessLevel { get; set; } = "PUBLIC";

    /// <summary>
    /// Danh sách Role được phép xem (Nếu AccessLevel = RESTRICTED)
    /// VD: ["TECHNICIAN", "ADMIN"] -> Chỉ kỹ thuật và admin thấy tài liệu sửa mainboard
    /// </summary>
    [Column(TypeName = "jsonb")]
    public string AllowedRoles { get; set; } = "[]";

    #endregion

    #region Metadata

    /// <summary>
    /// FK: Người upload tài liệu
    /// </summary>
    public Guid? UploadedByUserID { get; set; }

    /// <summary>
    /// Thời gian tạo
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Thời gian cập nhật
    /// </summary>
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    #endregion

    #region Navigation Properties

    /// <summary>
    /// Sản phẩm liên quan
    /// </summary>
    [ForeignKey(nameof(ComponentID))]
    public virtual Component? Component { get; set; }

    /// <summary>
    /// Người upload
    /// </summary>
    [ForeignKey(nameof(UploadedByUserID))]
    public virtual User? UploadedByUser { get; set; }

    /// <summary>
    /// Người chia sẻ file
    /// </summary>
    [ForeignKey(nameof(SharedByUserID))]
    public virtual User? SharedByUser { get; set; }

    #endregion
}
