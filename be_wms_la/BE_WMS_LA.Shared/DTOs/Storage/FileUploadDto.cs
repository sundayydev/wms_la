namespace BE_WMS_LA.Shared.DTOs.Storage;

/// <summary>
/// DTO kết quả upload file
/// </summary>
public class FileUploadResultDto
{
    /// <summary>
    /// Tên file đã lưu (có thể khác tên gốc)
    /// </summary>
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// Tên file gốc
    /// </summary>
    public string OriginalFileName { get; set; } = string.Empty;

    /// <summary>
    /// Kích thước file (bytes)
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// Content type của file
    /// </summary>
    public string ContentType { get; set; } = string.Empty;

    /// <summary>
    /// Bucket chứa file
    /// </summary>
    public string Bucket { get; set; } = string.Empty;

    /// <summary>
    /// Object name (path) trong bucket
    /// </summary>
    public string ObjectName { get; set; } = string.Empty;

    /// <summary>
    /// URL công khai để truy cập file (nếu bucket public)
    /// </summary>
    public string? PublicUrl { get; set; }

    /// <summary>
    /// URL tạm thời có chữ ký (presigned URL)
    /// </summary>
    public string? PresignedUrl { get; set; }

    /// <summary>
    /// Thời gian upload
    /// </summary>
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// ETag của file (dùng để verify)
    /// </summary>
    public string? ETag { get; set; }
}

/// <summary>
/// DTO thông tin file
/// </summary>
public class FileInfoDto
{
    public string ObjectName { get; set; } = string.Empty;
    public string Bucket { get; set; } = string.Empty;
    public long Size { get; set; }
    public string ContentType { get; set; } = string.Empty;
    public DateTime LastModified { get; set; }
    public string? ETag { get; set; }
    public Dictionary<string, string>? Metadata { get; set; }
}

/// <summary>
/// Request tạo presigned URL
/// </summary>
public class PresignedUrlRequestDto
{
    /// <summary>
    /// Tên bucket
    /// </summary>
    public string Bucket { get; set; } = string.Empty;

    /// <summary>
    /// Object name (path) trong bucket
    /// </summary>
    public string ObjectName { get; set; } = string.Empty;

    /// <summary>
    /// Thời gian hết hạn (phút)
    /// </summary>
    public int ExpirationMinutes { get; set; } = 60;
}
