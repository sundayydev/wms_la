using BE_WMS_LA.Shared.Configurations;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Storage;
using Microsoft.Extensions.Options;
using Minio;
using Minio.DataModel.Args;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý file storage với MinIO
/// Hỗ trợ upload, download, delete files và tạo presigned URLs
/// </summary>
public class MinioStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly MinioSettings _settings;

    public MinioStorageService(IOptions<MinioSettings> settings)
    {
        _settings = settings.Value;

        _minioClient = new MinioClient()
            .WithEndpoint(_settings.Endpoint)
            .WithCredentials(_settings.AccessKey, _settings.SecretKey)
            .WithSSL(_settings.UseSSL)
            .Build();
    }

    /// <summary>
    /// Constructor với MinioClient được inject (cho testing)
    /// </summary>
    public MinioStorageService(IMinioClient minioClient, IOptions<MinioSettings> settings)
    {
        _minioClient = minioClient;
        _settings = settings.Value;
    }

    #region Bucket Operations

    /// <summary>
    /// Khởi tạo các bucket mặc định
    /// Gọi khi startup application
    /// </summary>
    public async Task InitializeBucketsAsync()
    {
        var buckets = new[]
        {
            _settings.DefaultBucket,
            _settings.ProductImagesBucket,
            _settings.DocumentsBucket,
            _settings.AvatarsBucket
        };

        foreach (var bucketName in buckets)
        {
            await EnsureBucketExistsAsync(bucketName);
        }
    }

    /// <summary>
    /// Đảm bảo bucket tồn tại, tạo mới nếu chưa có
    /// </summary>
    public async Task<bool> EnsureBucketExistsAsync(string bucketName)
    {
        try
        {
            var found = await _minioClient.BucketExistsAsync(
                new BucketExistsArgs().WithBucket(bucketName));

            if (!found)
            {
                await _minioClient.MakeBucketAsync(
                    new MakeBucketArgs().WithBucket(bucketName));
            }

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating bucket {bucketName}: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Kiểm tra bucket có tồn tại không
    /// </summary>
    public async Task<bool> BucketExistsAsync(string bucketName)
    {
        return await _minioClient.BucketExistsAsync(
            new BucketExistsArgs().WithBucket(bucketName));
    }

    #endregion

    #region Upload Operations

    /// <summary>
    /// Upload file từ Stream
    /// </summary>
    /// <param name="stream">Stream chứa nội dung file</param>
    /// <param name="fileName">Tên file gốc</param>
    /// <param name="contentType">MIME type của file</param>
    /// <param name="bucket">Tên bucket (null = dùng default)</param>
    /// <param name="folder">Thư mục trong bucket (optional)</param>
    /// <returns>Kết quả upload</returns>
    public async Task<ApiResponse<FileUploadResultDto>> UploadFileAsync(
        Stream stream,
        string fileName,
        string contentType,
        string? bucket = null,
        string? folder = null)
    {
        try
        {
            var bucketName = bucket ?? _settings.DefaultBucket;
            await EnsureBucketExistsAsync(bucketName);

            // Tạo unique object name
            var objectName = GenerateObjectName(fileName, folder);

            // Upload
            var putObjectArgs = new PutObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName)
                .WithStreamData(stream)
                .WithObjectSize(stream.Length)
                .WithContentType(contentType);

            var response = await _minioClient.PutObjectAsync(putObjectArgs);

            var result = new FileUploadResultDto
            {
                FileName = Path.GetFileName(objectName),
                OriginalFileName = fileName,
                Size = stream.Length,
                ContentType = contentType,
                Bucket = bucketName,
                ObjectName = objectName,
                ETag = response.Etag,
                UploadedAt = DateTime.UtcNow
            };

            // Tạo presigned URL để truy cập
            result.PresignedUrl = await GetPresignedUrlAsync(bucketName, objectName);

            return ApiResponse<FileUploadResultDto>.SuccessResponse(result, "Upload file thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<FileUploadResultDto>.ErrorResponse($"Upload file thất bại: {ex.Message}");
        }
    }

    /// <summary>
    /// Upload file từ byte array
    /// </summary>
    public async Task<ApiResponse<FileUploadResultDto>> UploadFileAsync(
        byte[] data,
        string fileName,
        string contentType,
        string? bucket = null,
        string? folder = null)
    {
        using var stream = new MemoryStream(data);
        return await UploadFileAsync(stream, fileName, contentType, bucket, folder);
    }

    /// <summary>
    /// Upload ảnh sản phẩm
    /// </summary>
    public async Task<ApiResponse<FileUploadResultDto>> UploadProductImageAsync(
        Stream stream,
        string fileName,
        string contentType,
        Guid productId)
    {
        var folder = $"products/{productId}";
        return await UploadFileAsync(stream, fileName, contentType, _settings.ProductImagesBucket, folder);
    }

    /// <summary>
    /// Upload avatar người dùng
    /// </summary>
    public async Task<ApiResponse<FileUploadResultDto>> UploadAvatarAsync(
        Stream stream,
        string fileName,
        string contentType,
        Guid userId)
    {
        var folder = $"users/{userId}";
        return await UploadFileAsync(stream, fileName, contentType, _settings.AvatarsBucket, folder);
    }

    /// <summary>
    /// Upload tài liệu
    /// </summary>
    public async Task<ApiResponse<FileUploadResultDto>> UploadDocumentAsync(
        Stream stream,
        string fileName,
        string contentType,
        string? category = null)
    {
        var folder = category ?? "general";
        return await UploadFileAsync(stream, fileName, contentType, _settings.DocumentsBucket, folder);
    }

    #endregion

    #region Download Operations

    /// <summary>
    /// Download file về Stream
    /// </summary>
    public async Task<ApiResponse<Stream>> DownloadFileAsync(string bucket, string objectName)
    {
        try
        {
            var memoryStream = new MemoryStream();

            var getObjectArgs = new GetObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectName)
                .WithCallbackStream(stream => stream.CopyTo(memoryStream));

            await _minioClient.GetObjectAsync(getObjectArgs);
            memoryStream.Position = 0;

            return ApiResponse<Stream>.SuccessResponse(memoryStream);
        }
        catch (Exception ex)
        {
            return ApiResponse<Stream>.ErrorResponse($"Download file thất bại: {ex.Message}");
        }
    }

    /// <summary>
    /// Download file về byte array
    /// </summary>
    public async Task<ApiResponse<byte[]>> DownloadFileBytesAsync(string bucket, string objectName)
    {
        var result = await DownloadFileAsync(bucket, objectName);
        if (!result.Success || result.Data == null)
        {
            return ApiResponse<byte[]>.ErrorResponse(result.Message);
        }

        using var stream = result.Data;
        using var memoryStream = new MemoryStream();
        await stream.CopyToAsync(memoryStream);
        return ApiResponse<byte[]>.SuccessResponse(memoryStream.ToArray());
    }

    #endregion

    #region URL Operations

    /// <summary>
    /// Tạo presigned URL để truy cập file tạm thời
    /// </summary>
    public async Task<string?> GetPresignedUrlAsync(
        string bucket,
        string objectName,
        int? expirationMinutes = null)
    {
        try
        {
            var expiry = expirationMinutes ?? _settings.PresignedUrlExpirationMinutes;

            var args = new PresignedGetObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectName)
                .WithExpiry(expiry * 60); // Convert to seconds

            return await _minioClient.PresignedGetObjectAsync(args);
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Tạo presigned URL để upload file trực tiếp từ client
    /// </summary>
    public async Task<string?> GetPresignedPutUrlAsync(
        string bucket,
        string objectName,
        int? expirationMinutes = null)
    {
        try
        {
            var expiry = expirationMinutes ?? _settings.PresignedUrlExpirationMinutes;

            var args = new PresignedPutObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectName)
                .WithExpiry(expiry * 60);

            return await _minioClient.PresignedPutObjectAsync(args);
        }
        catch
        {
            return null;
        }
    }

    #endregion

    #region Delete Operations

    /// <summary>
    /// Xóa file
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteFileAsync(string bucket, string objectName)
    {
        try
        {
            var removeObjectArgs = new RemoveObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectName);

            await _minioClient.RemoveObjectAsync(removeObjectArgs);

            return ApiResponse<bool>.SuccessResponse(true, "Xóa file thành công");
        }
        catch (Exception ex)
        {
            return ApiResponse<bool>.ErrorResponse($"Xóa file thất bại: {ex.Message}");
        }
    }

    /// <summary>
    /// Xóa nhiều files
    /// </summary>
    public async Task<ApiResponse<int>> DeleteFilesAsync(string bucket, IEnumerable<string> objectNames)
    {
        try
        {
            var count = 0;
            foreach (var objectName in objectNames)
            {
                var result = await DeleteFileAsync(bucket, objectName);
                if (result.Success) count++;
            }

            return ApiResponse<int>.SuccessResponse(count, $"Đã xóa {count} files");
        }
        catch (Exception ex)
        {
            return ApiResponse<int>.ErrorResponse($"Xóa files thất bại: {ex.Message}");
        }
    }

    #endregion

    #region File Info Operations

    /// <summary>
    /// Lấy thông tin file
    /// </summary>
    public async Task<ApiResponse<FileInfoDto>> GetFileInfoAsync(string bucket, string objectName)
    {
        try
        {
            var statObjectArgs = new StatObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectName);

            var stat = await _minioClient.StatObjectAsync(statObjectArgs);

            var fileInfo = new FileInfoDto
            {
                ObjectName = objectName,
                Bucket = bucket,
                Size = stat.Size,
                ContentType = stat.ContentType,
                LastModified = stat.LastModified,
                ETag = stat.ETag,
                Metadata = stat.MetaData
            };

            return ApiResponse<FileInfoDto>.SuccessResponse(fileInfo);
        }
        catch (Exception ex)
        {
            return ApiResponse<FileInfoDto>.ErrorResponse($"Lấy thông tin file thất bại: {ex.Message}");
        }
    }

    /// <summary>
    /// Kiểm tra file có tồn tại không
    /// </summary>
    public async Task<bool> FileExistsAsync(string bucket, string objectName)
    {
        try
        {
            var statObjectArgs = new StatObjectArgs()
                .WithBucket(bucket)
                .WithObject(objectName);

            await _minioClient.StatObjectAsync(statObjectArgs);
            return true;
        }
        catch
        {
            return false;
        }
    }

    #endregion

    #region Private Methods

    /// <summary>
    /// Tạo object name unique với timestamp
    /// </summary>
    private static string GenerateObjectName(string fileName, string? folder = null)
    {
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var uniqueId = Guid.NewGuid().ToString("N")[..8];
        var extension = Path.GetExtension(fileName);
        var baseName = Path.GetFileNameWithoutExtension(fileName);

        // Sanitize file name
        baseName = SanitizeFileName(baseName);

        var newFileName = $"{baseName}_{timestamp}_{uniqueId}{extension}";

        return string.IsNullOrEmpty(folder)
            ? newFileName
            : $"{folder.TrimEnd('/')}/{newFileName}";
    }

    /// <summary>
    /// Làm sạch tên file (loại bỏ ký tự đặc biệt)
    /// </summary>
    private static string SanitizeFileName(string fileName)
    {
        var invalidChars = Path.GetInvalidFileNameChars();
        var sanitized = new string(fileName
            .Where(c => !invalidChars.Contains(c))
            .ToArray());

        // Replace spaces with underscores
        sanitized = sanitized.Replace(' ', '_');

        // Limit length
        if (sanitized.Length > 50)
            sanitized = sanitized[..50];

        return sanitized;
    }

    #endregion
}
