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
    /// Loại nội dung: 'DOCUMENT', 'VIDEO', 'DRIVER', 'FIRMWARE'
    /// </summary>
    public string ContentType { get; set; } = "DOCUMENT";

    /// <summary>
    /// Mức độ truy cập: 'PUBLIC', 'INTERNAL', 'RESTRICTED'
    /// </summary>
    public string AccessLevel { get; set; } = "PUBLIC";

    /// <summary>
    /// Danh sách Role được phép xem (Nếu AccessLevel = RESTRICTED)
    /// </summary>
    public List<string>? AllowedRoles { get; set; }
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
    public string ContentType { get; set; } = string.Empty;
    public string ContentURL { get; set; } = string.Empty;
    public string? ThumbnailURL { get; set; }

    // MinIO Storage Info
    public string? BucketName { get; set; }
    public string? ObjectKey { get; set; }
    public string? ETag { get; set; }
    public string? VersionID { get; set; }
    public long? FileSize { get; set; }
    public string? MimeType { get; set; }
    public string? OriginalFileName { get; set; }

    // Sharing Info
    public string? ShareToken { get; set; }
    public string? SharedURL { get; set; }
    public DateTime? SharedExpiry { get; set; }
    public bool IsShared { get; set; }
    public int? MaxDownloads { get; set; }
    public int DownloadCount { get; set; }

    // Access Control
    public string AccessLevel { get; set; } = "PUBLIC";
    public List<string>? AllowedRoles { get; set; }

    // Metadata
    public Guid? UploadedByUserID { get; set; }
    public string? UploadedByUserName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO để tạo share link
/// </summary>
public class CreateShareLinkDto
{
    /// <summary>
    /// ID của Knowledge Base item
    /// </summary>
    public Guid KnowledgeID { get; set; }

    /// <summary>
    /// Thời gian hết hạn (phút). Default = 7 ngày
    /// </summary>
    public int ExpirationMinutes { get; set; } = 7 * 24 * 60;

    /// <summary>
    /// Số lần download tối đa (NULL = không giới hạn)
    /// </summary>
    public int? MaxDownloads { get; set; }
}

/// <summary>
/// DTO kết quả tạo share link
/// </summary>
public class ShareLinkResultDto
{
    public Guid KnowledgeID { get; set; }
    public string ShareToken { get; set; } = string.Empty;
    public string SharedURL { get; set; } = string.Empty;
    public DateTime SharedExpiry { get; set; }
    public int? MaxDownloads { get; set; }
    public DateTime SharedAt { get; set; }
    public Guid? SharedByUserID { get; set; }
}

/// <summary>
/// DTO để download qua share token
/// </summary>
public class SharedDownloadDto
{
    public string ShareToken { get; set; } = string.Empty;
}

/// <summary>
/// DTO thông tin share link
/// </summary>
public class ShareInfoDto
{
    public Guid KnowledgeID { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public long? FileSize { get; set; }
    public string? MimeType { get; set; }
    public string? OriginalFileName { get; set; }
    public bool IsExpired { get; set; }
    public bool IsDownloadLimitReached { get; set; }
    public int? RemainingDownloads { get; set; }
    public DateTime? ExpiresAt { get; set; }
}
