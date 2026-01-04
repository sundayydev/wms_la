namespace BE_WMS_LA.Shared.Configurations;

/// <summary>
/// Cấu hình MinIO Object Storage
/// </summary>
public class MinioSettings
{
    /// <summary>
    /// Endpoint của MinIO server (vd: localhost:9000)
    /// </summary>
    public string Endpoint { get; set; } = "localhost:9000";

    /// <summary>
    /// Access Key (username)
    /// </summary>
    public string AccessKey { get; set; } = "admin";

    /// <summary>
    /// Secret Key (password)
    /// </summary>
    public string SecretKey { get; set; } = "adminerpla";

    /// <summary>
    /// Sử dụng SSL hay không
    /// </summary>
    public bool UseSSL { get; set; } = false;

    /// <summary>
    /// Tên bucket mặc định
    /// </summary>
    public string DefaultBucket { get; set; } = "la-files";

    /// <summary>
    /// Bucket cho ảnh sản phẩm
    /// </summary>
    public string ProductImagesBucket { get; set; } = "product-images";

    /// <summary>
    /// Bucket cho tài liệu
    /// </summary>
    public string DocumentsBucket { get; set; } = "documents";

    /// <summary>
    /// Bucket cho avatar người dùng
    /// </summary>
    public string AvatarsBucket { get; set; } = "avatars";

    /// <summary>
    /// Thời gian hết hạn URL tạm (phút) - dùng cho presigned URL
    /// </summary>
    public int PresignedUrlExpirationMinutes { get; set; } = 60;
}
