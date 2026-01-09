using BE_WMS_LA.Shared.Common;

namespace BE_WMS_LA.Shared.DTOs.Storage;

/// <summary>
/// DTO để upload tài liệu vào Knowledge Base
/// </summary>
public class KnowledgeBaseUploadDto
{
    /// <summary>
    /// FK: Link tới sản phẩm nào (NULL = tài liệu chung)
    /// </summary>
    public Guid? ComponentID { get; set; }

    /// <summary>
    /// Tiêu đề tài liệu
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Mô tả chi tiết
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Loại nội dung: DOCUMENT, VIDEO, DRIVER, FIRMWARE
    /// </summary>
    public KnowledgeType ContentType { get; set; } = KnowledgeType.DOCUMENT;

    /// <summary>
    /// Phạm vi truy cập: PUBLIC, INTERNAL
    /// </summary>
    public AccessScope Scope { get; set; } = AccessScope.INTERNAL;

    /// <summary>
    /// URL video (YouTube, Vimeo, etc.) - Dành cho ContentType = VIDEO
    /// </summary>
    public string? VideoURL { get; set; }
}

/// <summary>
/// DTO kết quả upload Knowledge Base
/// </summary>
public class KnowledgeBaseResultDto
{
    public Guid KnowledgeID { get; set; }
    public Guid? ComponentID { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public KnowledgeType ContentType { get; set; }
    public AccessScope Scope { get; set; }
    public FileStatus ProcessStatus { get; set; }

    // MinIO Storage Info
    public string BucketName { get; set; } = string.Empty;
    public string ObjectKey { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string? MimeType { get; set; }
    public string? OriginalFileName { get; set; }

    // Preview & Media
    public string? PreviewObjectKey { get; set; }
    public string? ThumbnailObjectKey { get; set; }
    public string? ExternalVideoURL { get; set; }

    // Metadata
    public Guid CreatedByUserID { get; set; }
    public string? CreatedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid? UpdatedByUserID { get; set; }
    public string? UpdatedByUserName { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Sharing info (aggregated from DocumentShare)
    public int ShareCount { get; set; }
    public int TotalDownloads { get; set; }
}

/// <summary>
/// DTO để tạo share link
/// </summary>
public class CreateShareLinkDto
{
    /// <summary>
    /// Thời gian hết hạn (phút). Default = 7 ngày
    /// </summary>
    public int ExpirationMinutes { get; set; } = 7 * 24 * 60;

    /// <summary>
    /// Số lần download tối đa (NULL = không giới hạn)
    /// </summary>
    public int? MaxDownloads { get; set; }

    /// <summary>
    /// Email người được chia sẻ (optional - nếu muốn share cho user cụ thể)
    /// </summary>
    public string? TargetEmail { get; set; }

    /// <summary>
    /// ID người được chia sẻ (optional)
    /// </summary>
    public Guid? TargetUserID { get; set; }
}

/// <summary>
/// DTO kết quả tạo share link
/// </summary>
public class ShareLinkResultDto
{
    public Guid ShareID { get; set; }
    public Guid KnowledgeID { get; set; }
    public string ShareToken { get; set; } = string.Empty;
    public string ShareURL { get; set; } = string.Empty;
    public DateTime? ExpiryDate { get; set; }
    public int? MaxDownloads { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedByUserID { get; set; }
}

/// <summary>
/// DTO thông tin share link
/// </summary>
public class ShareInfoDto
{
    public Guid KnowledgeID { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public KnowledgeType ContentType { get; set; }
    public long FileSize { get; set; }
    public string? MimeType { get; set; }
    public string? OriginalFileName { get; set; }
    public bool IsExpired { get; set; }
    public bool IsDownloadLimitReached { get; set; }
    public int? RemainingDownloads { get; set; }
    public DateTime? ExpiresAt { get; set; }
}

/// <summary>
/// DTO thống kê Knowledge Base
/// </summary>
public class KnowledgeBaseStatisticsDto
{
    public int TotalItems { get; set; }
    public long TotalFileSizeBytes { get; set; }
    public int SharedItemsCount { get; set; }
    public Dictionary<KnowledgeType, int> ByContentType { get; set; } = new();
    public List<TopDownloadedItemDto> TopDownloaded { get; set; } = new();
}

/// <summary>
/// DTO cho top downloaded item
/// </summary>
public class TopDownloadedItemDto
{
    public Guid KnowledgeID { get; set; }
    public string Title { get; set; } = string.Empty;
    public int DownloadCount { get; set; }
}

/// <summary>
/// DTO kết quả lấy Preview URL (cho xem file trên web/app)
/// </summary>
public class PreviewUrlResultDto
{
    /// <summary>
    /// ID của Knowledge Base item
    /// </summary>
    public Guid KnowledgeID { get; set; }

    /// <summary>
    /// Loại nội dung
    /// </summary>
    public KnowledgeType ContentType { get; set; }

    /// <summary>
    /// URL để preview file (presigned URL của MinIO hoặc YouTube URL)
    /// </summary>
    public string PreviewUrl { get; set; } = string.Empty;

    /// <summary>
    /// Tên file gốc
    /// </summary>
    public string? OriginalFileName { get; set; }

    /// <summary>
    /// MIME type của file preview (thường là application/pdf nếu đã convert)
    /// </summary>
    public string? MimeType { get; set; }

    /// <summary>
    /// Trạng thái xử lý file (PENDING = đang convert, READY = sẵn sàng)
    /// </summary>
    public FileStatus ProcessStatus { get; set; }

    /// <summary>
    /// True nếu là video external (YouTube, Vimeo)
    /// </summary>
    public bool IsExternalVideo { get; set; }

    /// <summary>
    /// Thời điểm URL hết hạn (null với video external)
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
}

/// <summary>
/// DTO kết quả lấy Thumbnail URL
/// </summary>
public class ThumbnailUrlResultDto
{
    public Guid KnowledgeID { get; set; }

    /// <summary>
    /// URL của thumbnail
    /// </summary>
    public string ThumbnailUrl { get; set; } = string.Empty;

    /// <summary>
    /// True nếu là URL external (ví dụ: YouTube thumbnail)
    /// </summary>
    public bool IsExternalUrl { get; set; }

    /// <summary>
    /// Thời điểm URL hết hạn (null với external URL)
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
}

/// <summary>
/// DTO kết quả lấy Download URL với kiểm tra quyền
/// </summary>
public class DownloadUrlResultDto
{
    public Guid KnowledgeID { get; set; }

    /// <summary>
    /// Presigned URL để download file
    /// </summary>
    public string DownloadUrl { get; set; } = string.Empty;

    /// <summary>
    /// Tên file để lưu
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Kích thước file (bytes)
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// MIME type của file
    /// </summary>
    public string MimeType { get; set; } = string.Empty;

    /// <summary>
    /// Thời điểm URL hết hạn
    /// </summary>
    public DateTime ExpiresAt { get; set; }
}

