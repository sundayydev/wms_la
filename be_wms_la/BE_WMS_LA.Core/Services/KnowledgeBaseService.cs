using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Storage;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý Knowledge Base - Kho tri thức sản phẩm
/// </summary>
public class KnowledgeBaseService
{
    private readonly KnowledgeBaseRepository _repository;
    private readonly MinioStorageService _storageService;
    private readonly ILogger<KnowledgeBaseService> _logger;

    private const string KnowledgeBaseBucket = "knowledge-base";

    public KnowledgeBaseService(
        KnowledgeBaseRepository repository,
        MinioStorageService storageService,
        ILogger<KnowledgeBaseService> logger)
    {
        _repository = repository;
        _storageService = storageService;
        _logger = logger;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách Knowledge Base items với phân trang
    /// </summary>
    public async Task<ApiResponse<PagedResult<KnowledgeBaseResultDto>>> GetAllAsync(
        Guid? componentId = null,
        string? contentType = null,
        string? accessLevel = null,
        int page = 1,
        int pageSize = 20)
    {
        var total = await _repository.CountAsync(componentId, contentType, accessLevel);
        var items = await _repository.GetAllAsync(componentId, contentType, accessLevel, page, pageSize);

        var dtos = items.Select(MapToResultDto).ToList();

        var result = new PagedResult<KnowledgeBaseResultDto>
        {
            Items = dtos,
            TotalCount = total,
            PageNumber = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(total / (double)pageSize)
        };

        return ApiResponse<PagedResult<KnowledgeBaseResultDto>>.SuccessResponse(
            result, $"Tìm thấy {total} tài liệu");
    }

    /// <summary>
    /// Lấy chi tiết Knowledge Base item theo ID
    /// </summary>
    public async Task<ApiResponse<KnowledgeBaseResultDto>> GetByIdAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item == null)
        {
            return ApiResponse<KnowledgeBaseResultDto>.ErrorResponse("Không tìm thấy tài liệu");
        }

        var dto = MapToResultDto(item);
        return ApiResponse<KnowledgeBaseResultDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Lấy danh sách Knowledge Base theo Component
    /// </summary>
    public async Task<ApiResponse<List<KnowledgeBaseResultDto>>> GetByComponentIdAsync(Guid componentId)
    {
        var items = await _repository.GetByComponentIdAsync(componentId);
        var dtos = items.Select(MapToResultDto).ToList();

        return ApiResponse<List<KnowledgeBaseResultDto>>.SuccessResponse(
            dtos, $"Tìm thấy {dtos.Count} tài liệu");
    }

    /// <summary>
    /// Upload và tạo Knowledge Base item mới
    /// </summary>
    public async Task<ApiResponse<KnowledgeBaseResultDto>> CreateAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        KnowledgeBaseUploadDto dto,
        Guid? uploadedByUserId)
    {
        _logger.LogInformation("Creating Knowledge Base item: {Title}, File: {FileName}, User: {UserId}",
            dto.Title, fileName, uploadedByUserId);

        // Upload to MinIO
        var folder = dto.ComponentID.HasValue
            ? $"products/{dto.ComponentID}/files"
            : "general";

        var uploadResult = await _storageService.UploadFileAsync(
            fileStream,
            fileName,
            contentType,
            bucket: KnowledgeBaseBucket,
            folder: folder);

        if (!uploadResult.Success || uploadResult.Data == null)
        {
            return ApiResponse<KnowledgeBaseResultDto>.ErrorResponse(
                uploadResult.Message ?? "Không thể upload file");
        }

        // Create Knowledge Base record
        var item = new ProductKnowledgeBase
        {
            ComponentID = dto.ComponentID,
            Title = dto.Title,
            Description = dto.Description,
            ContentType = dto.ContentType,
            ContentURL = uploadResult.Data.PresignedUrl ?? uploadResult.Data.PublicUrl ?? "",
            AccessLevel = dto.AccessLevel,
            AllowedRoles = dto.AllowedRoles != null ? JsonSerializer.Serialize(dto.AllowedRoles) : "[]",

            // MinIO Storage Info
            BucketName = uploadResult.Data.Bucket,
            ObjectKey = uploadResult.Data.ObjectName,
            ETag = uploadResult.Data.ETag,
            FileSize = uploadResult.Data.Size,
            MimeType = contentType,
            OriginalFileName = fileName,

            // Metadata
            UploadedByUserID = uploadedByUserId
        };

        await _repository.AddAsync(item);

        _logger.LogInformation("Knowledge Base item created: {KnowledgeID}", item.KnowledgeID);

        var result = MapToResultDto(item);
        return ApiResponse<KnowledgeBaseResultDto>.SuccessResponse(result, "Upload thành công");
    }

    /// <summary>
    /// Cập nhật thông tin Knowledge Base item (không cập nhật file)
    /// </summary>
    public async Task<ApiResponse<KnowledgeBaseResultDto>> UpdateAsync(Guid id, KnowledgeBaseUploadDto dto)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item == null)
        {
            return ApiResponse<KnowledgeBaseResultDto>.ErrorResponse("Không tìm thấy tài liệu");
        }

        // Update fields
        item.Title = dto.Title;
        item.Description = dto.Description;
        item.ContentType = dto.ContentType;
        item.AccessLevel = dto.AccessLevel;
        item.AllowedRoles = dto.AllowedRoles != null ? JsonSerializer.Serialize(dto.AllowedRoles) : "[]";

        await _repository.UpdateAsync(item);

        _logger.LogInformation("Knowledge Base item updated: {KnowledgeID}", id);

        var result = MapToResultDto(item);
        return ApiResponse<KnowledgeBaseResultDto>.SuccessResponse(result, "Cập nhật thành công");
    }

    /// <summary>
    /// Xóa Knowledge Base item (bao gồm file trên MinIO)
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy tài liệu");
        }

        // Delete from MinIO
        if (!string.IsNullOrEmpty(item.BucketName) && !string.IsNullOrEmpty(item.ObjectKey))
        {
            var deleteResult = await _storageService.DeleteFileAsync(item.BucketName, item.ObjectKey);
            if (!deleteResult.Success)
            {
                _logger.LogWarning("Failed to delete file from MinIO: {Bucket}/{ObjectKey}",
                    item.BucketName, item.ObjectKey);
            }
        }

        // Delete from database
        await _repository.DeleteAsync(item);

        _logger.LogInformation("Knowledge Base item deleted: {KnowledgeID}", id);

        return ApiResponse<bool>.SuccessResponse(true, "Đã xóa tài liệu");
    }

    #endregion

    #region Sharing Operations

    /// <summary>
    /// Tạo share link cho tài liệu
    /// </summary>
    public async Task<ApiResponse<ShareLinkResultDto>> CreateShareLinkAsync(
        Guid id,
        CreateShareLinkDto dto,
        Guid? sharedByUserId)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item == null)
        {
            return ApiResponse<ShareLinkResultDto>.ErrorResponse("Không tìm thấy tài liệu");
        }

        var shareToken = Guid.NewGuid().ToString("N");
        var expiry = DateTime.UtcNow.AddMinutes(dto.ExpirationMinutes);

        // Generate presigned URL from MinIO
        string? presignedUrl = null;
        if (!string.IsNullOrEmpty(item.BucketName) && !string.IsNullOrEmpty(item.ObjectKey))
        {
            presignedUrl = await _storageService.GetPresignedUrlAsync(
                item.BucketName,
                item.ObjectKey,
                dto.ExpirationMinutes);
        }

        // Update sharing info
        await _repository.UpdateSharingAsync(
            id,
            shareToken,
            presignedUrl,
            expiry,
            dto.MaxDownloads,
            sharedByUserId);

        var result = new ShareLinkResultDto
        {
            KnowledgeID = id,
            ShareToken = shareToken,
            SharedURL = presignedUrl ?? $"/api/knowledgebase/shared/{shareToken}/download",
            SharedExpiry = expiry,
            MaxDownloads = dto.MaxDownloads,
            SharedAt = DateTime.UtcNow,
            SharedByUserID = sharedByUserId
        };

        _logger.LogInformation("Share link created for Knowledge Base {KnowledgeID} by User {UserId}",
            id, sharedByUserId);

        return ApiResponse<ShareLinkResultDto>.SuccessResponse(result, "Tạo link chia sẻ thành công");
    }

    /// <summary>
    /// Hủy share link
    /// </summary>
    public async Task<ApiResponse<bool>> RevokeShareLinkAsync(Guid id)
    {
        var success = await _repository.RevokeSharingAsync(id);

        if (!success)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy tài liệu");
        }

        _logger.LogInformation("Share link revoked for Knowledge Base {KnowledgeID}", id);

        return ApiResponse<bool>.SuccessResponse(true, "Đã hủy link chia sẻ");
    }

    /// <summary>
    /// Lấy thông tin file được chia sẻ qua token
    /// </summary>
    public async Task<ApiResponse<ShareInfoDto>> GetSharedFileInfoAsync(string shareToken)
    {
        var item = await _repository.GetByShareTokenAsync(shareToken);

        if (item == null)
        {
            return ApiResponse<ShareInfoDto>.ErrorResponse("Link không hợp lệ hoặc đã bị xóa");
        }

        var isExpired = item.SharedExpiry.HasValue && item.SharedExpiry < DateTime.UtcNow;
        var isDownloadLimitReached = item.MaxDownloads.HasValue && item.DownloadCount >= item.MaxDownloads;

        var result = new ShareInfoDto
        {
            KnowledgeID = item.KnowledgeID,
            Title = item.Title,
            Description = item.Description,
            ContentType = item.ContentType,
            FileSize = item.FileSize,
            MimeType = item.MimeType,
            OriginalFileName = item.OriginalFileName,
            IsExpired = isExpired,
            IsDownloadLimitReached = isDownloadLimitReached,
            RemainingDownloads = item.MaxDownloads.HasValue
                ? item.MaxDownloads.Value - item.DownloadCount
                : null,
            ExpiresAt = item.SharedExpiry
        };

        return ApiResponse<ShareInfoDto>.SuccessResponse(result);
    }

    /// <summary>
    /// Validate và lấy file để download qua share token
    /// </summary>
    public async Task<ApiResponse<(Stream FileStream, string FileName, string ContentType)>> DownloadSharedFileAsync(string shareToken)
    {
        var item = await _repository.GetByShareTokenAsync(shareToken);

        if (item == null)
        {
            return ApiResponse<(Stream, string, string)>.ErrorResponse("Link không hợp lệ hoặc đã bị xóa");
        }

        // Check if expired
        if (item.SharedExpiry.HasValue && item.SharedExpiry < DateTime.UtcNow)
        {
            return ApiResponse<(Stream, string, string)>.ErrorResponse("Link đã hết hạn");
        }

        // Check download limit
        if (item.MaxDownloads.HasValue && item.DownloadCount >= item.MaxDownloads)
        {
            return ApiResponse<(Stream, string, string)>.ErrorResponse("Đã đạt giới hạn download");
        }

        // Get file from MinIO
        if (string.IsNullOrEmpty(item.BucketName) || string.IsNullOrEmpty(item.ObjectKey))
        {
            return ApiResponse<(Stream, string, string)>.ErrorResponse("File không tồn tại trên storage");
        }

        var result = await _storageService.DownloadFileAsync(item.BucketName, item.ObjectKey);
        if (!result.Success || result.Data == null)
        {
            return ApiResponse<(Stream, string, string)>.ErrorResponse("Không thể download file");
        }

        // Increment download count
        await _repository.IncrementDownloadCountAsync(item.KnowledgeID);

        _logger.LogInformation("Shared file downloaded: {ShareToken}, Count: {DownloadCount}",
            shareToken, item.DownloadCount + 1);

        var fileName = item.OriginalFileName ?? Path.GetFileName(item.ObjectKey);
        var contentType = item.MimeType ?? "application/octet-stream";

        return ApiResponse<(Stream, string, string)>.SuccessResponse((result.Data, fileName, contentType));
    }

    #endregion

    #region Download Operations

    /// <summary>
    /// Download file từ Knowledge Base (yêu cầu xác thực)
    /// </summary>
    public async Task<ApiResponse<(Stream FileStream, string FileName, string ContentType)>> DownloadAsync(Guid id)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item == null)
        {
            return ApiResponse<(Stream, string, string)>.ErrorResponse("Không tìm thấy tài liệu");
        }

        // Get file from MinIO
        if (string.IsNullOrEmpty(item.BucketName) || string.IsNullOrEmpty(item.ObjectKey))
        {
            return ApiResponse<(Stream, string, string)>.ErrorResponse("File không tồn tại trên storage");
        }

        var result = await _storageService.DownloadFileAsync(item.BucketName, item.ObjectKey);
        if (!result.Success || result.Data == null)
        {
            return ApiResponse<(Stream, string, string)>.ErrorResponse("Không thể download file");
        }

        var fileName = item.OriginalFileName ?? Path.GetFileName(item.ObjectKey);
        var contentType = item.MimeType ?? "application/octet-stream";

        return ApiResponse<(Stream, string, string)>.SuccessResponse((result.Data, fileName, contentType));
    }

    /// <summary>
    /// Lấy presigned URL để download
    /// </summary>
    public async Task<ApiResponse<string>> GetPresignedUrlAsync(Guid id, int expirationMinutes = 60)
    {
        var item = await _repository.GetByIdAsync(id);

        if (item == null)
        {
            return ApiResponse<string>.ErrorResponse("Không tìm thấy tài liệu");
        }

        if (string.IsNullOrEmpty(item.BucketName) || string.IsNullOrEmpty(item.ObjectKey))
        {
            return ApiResponse<string>.ErrorResponse("File không tồn tại trên storage");
        }

        var url = await _storageService.GetPresignedUrlAsync(
            item.BucketName,
            item.ObjectKey,
            expirationMinutes);

        if (url == null)
        {
            return ApiResponse<string>.ErrorResponse("Không thể tạo presigned URL");
        }

        return ApiResponse<string>.SuccessResponse(url);
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê Knowledge Base
    /// </summary>
    public async Task<ApiResponse<KnowledgeBaseStatisticsDto>> GetStatisticsAsync()
    {
        var total = await _repository.CountTotalAsync();
        var byContentType = await _repository.CountByContentTypeAsync();
        var sharedCount = await _repository.CountSharedAsync();
        var totalFileSize = await _repository.GetTotalFileSizeAsync();
        var topDownloaded = await _repository.GetTopDownloadedAsync(5);

        var stats = new KnowledgeBaseStatisticsDto
        {
            TotalItems = total,
            TotalFileSizeBytes = totalFileSize,
            SharedItemsCount = sharedCount,
            ByContentType = byContentType,
            TopDownloaded = topDownloaded.Select(item => new TopDownloadedItemDto
            {
                KnowledgeID = item.KnowledgeID,
                Title = item.Title,
                DownloadCount = item.DownloadCount
            }).ToList()
        };

        return ApiResponse<KnowledgeBaseStatisticsDto>.SuccessResponse(stats);
    }

    #endregion

    #region Helpers

    private static KnowledgeBaseResultDto MapToResultDto(ProductKnowledgeBase item)
    {
        List<string>? allowedRoles = null;
        try
        {
            if (!string.IsNullOrEmpty(item.AllowedRoles) && item.AllowedRoles != "[]")
            {
                allowedRoles = JsonSerializer.Deserialize<List<string>>(item.AllowedRoles);
            }
        }
        catch { /* Ignore JSON parse errors */ }

        return new KnowledgeBaseResultDto
        {
            KnowledgeID = item.KnowledgeID,
            ComponentID = item.ComponentID,
            Title = item.Title,
            Description = item.Description,
            ContentType = item.ContentType,
            ContentURL = item.ContentURL,
            ThumbnailURL = item.ThumbnailURL,

            // MinIO Storage Info
            BucketName = item.BucketName,
            ObjectKey = item.ObjectKey,
            ETag = item.ETag,
            VersionID = item.VersionID,
            FileSize = item.FileSize,
            MimeType = item.MimeType,
            OriginalFileName = item.OriginalFileName,

            // Sharing Info
            ShareToken = item.ShareToken,
            SharedURL = item.SharedURL,
            SharedExpiry = item.SharedExpiry,
            IsShared = item.IsShared,
            MaxDownloads = item.MaxDownloads,
            DownloadCount = item.DownloadCount,

            // Access Control
            AccessLevel = item.AccessLevel,
            AllowedRoles = allowedRoles,

            // Metadata
            UploadedByUserID = item.UploadedByUserID,
            UploadedByUserName = item.UploadedByUser?.Username,
            CreatedAt = item.CreatedAt,
            UpdatedAt = item.UpdatedAt
        };
    }

    #endregion
}

/// <summary>
/// DTO thống kê Knowledge Base
/// </summary>
public class KnowledgeBaseStatisticsDto
{
    public int TotalItems { get; set; }
    public long TotalFileSizeBytes { get; set; }
    public int SharedItemsCount { get; set; }
    public Dictionary<string, int> ByContentType { get; set; } = new();
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
/// DTO cho kết quả phân trang
/// </summary>
public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;
}
