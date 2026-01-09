using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Storage;
using Microsoft.Extensions.Logging;

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
        KnowledgeType? contentType = null,
        AccessScope? scope = null,
        int page = 1,
        int pageSize = 20)
    {
        var total = await _repository.CountAsync(componentId, contentType, scope);
        var items = await _repository.GetAllAsync(componentId, contentType, scope, page, pageSize);

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
    /// Lấy danh sách tài liệu PUBLIC (không cần đăng nhập)
    /// </summary>
    public async Task<ApiResponse<PagedResult<KnowledgeBaseResultDto>>> GetPublicAsync(
        Guid? componentId = null,
        KnowledgeType? contentType = null,
        int page = 1,
        int pageSize = 20)
    {
        var total = await _repository.CountPublicAsync(componentId, contentType);
        var items = await _repository.GetPublicAsync(componentId, contentType, page, pageSize);

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
            result, $"Tìm thấy {total} tài liệu công khai");
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
        string mimeType,
        KnowledgeBaseUploadDto dto,
        Guid createdByUserId)
    {
        _logger.LogInformation("Creating Knowledge Base item: {Title}, File: {FileName}, User: {UserId}",
            dto.Title, fileName, createdByUserId);

        // Upload to MinIO
        var folder = dto.ComponentID.HasValue
            ? $"products/{dto.ComponentID}/files"
            : "general";

        var uploadResult = await _storageService.UploadFileAsync(
            fileStream,
            fileName,
            mimeType,
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
            Scope = dto.Scope,

            // MinIO Storage Info
            BucketName = uploadResult.Data.Bucket,
            ObjectKey = uploadResult.Data.ObjectName,
            FileSize = uploadResult.Data.Size,
            MimeType = mimeType,
            OriginalFileName = fileName,

            // Metadata
            CreatedByUserID = createdByUserId
        };

        await _repository.AddAsync(item);

        _logger.LogInformation("Knowledge Base item created: {KnowledgeID}", item.KnowledgeID);

        var result = MapToResultDto(item);
        return ApiResponse<KnowledgeBaseResultDto>.SuccessResponse(result, "Upload thành công");
    }

    /// <summary>
    /// Tạo Knowledge Base item từ Video URL (YouTube, Vimeo, etc.)
    /// </summary>
    public async Task<ApiResponse<KnowledgeBaseResultDto>> CreateFromVideoUrlAsync(
        KnowledgeBaseUploadDto dto,
        Guid createdByUserId)
    {
        _logger.LogInformation("Creating Knowledge Base video item: {Title}, URL: {VideoURL}, User: {UserId}",
            dto.Title, dto.VideoURL, createdByUserId);

        if (string.IsNullOrEmpty(dto.VideoURL))
        {
            return ApiResponse<KnowledgeBaseResultDto>.ErrorResponse("Video URL không được để trống");
        }

        // Extract video ID and generate thumbnail for YouTube
        string? thumbnailObjectKey = null;
        if (dto.VideoURL.Contains("youtube.com") || dto.VideoURL.Contains("youtu.be"))
        {
            var videoId = ExtractYouTubeVideoId(dto.VideoURL);
            if (!string.IsNullOrEmpty(videoId))
            {
                // Lưu thumbnail URL tạm, có thể download về MinIO sau nếu cần
                thumbnailObjectKey = $"https://img.youtube.com/vi/{videoId}/maxresdefault.jpg";
            }
        }

        // Create Knowledge Base record
        var item = new ProductKnowledgeBase
        {
            ComponentID = dto.ComponentID,
            Title = dto.Title,
            Description = dto.Description,
            ContentType = KnowledgeType.VIDEO,
            Scope = dto.Scope,
            ExternalVideoURL = dto.VideoURL,
            ThumbnailObjectKey = thumbnailObjectKey,

            // Metadata
            CreatedByUserID = createdByUserId
        };

        await _repository.AddAsync(item);

        _logger.LogInformation("Knowledge Base video item created: {KnowledgeID}", item.KnowledgeID);

        var result = MapToResultDto(item);
        return ApiResponse<KnowledgeBaseResultDto>.SuccessResponse(result, "Thêm video thành công");
    }

    /// <summary>
    /// Cập nhật thông tin Knowledge Base item (không cập nhật file)
    /// </summary>
    public async Task<ApiResponse<KnowledgeBaseResultDto>> UpdateAsync(Guid id, KnowledgeBaseUploadDto dto, Guid updatedByUserId)
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
        item.Scope = dto.Scope;
        item.UpdatedByUserID = updatedByUserId;

        // Cập nhật VideoURL nếu là video
        if (dto.ContentType == KnowledgeType.VIDEO && !string.IsNullOrEmpty(dto.VideoURL))
        {
            item.ExternalVideoURL = dto.VideoURL;
        }

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
        Guid knowledgeId,
        CreateShareLinkDto dto,
        Guid sharedByUserId)
    {
        var item = await _repository.GetByIdAsync(knowledgeId);

        if (item == null)
        {
            return ApiResponse<ShareLinkResultDto>.ErrorResponse("Không tìm thấy tài liệu");
        }

        var share = new DocumentShare
        {
            KnowledgeID = knowledgeId,
            ShareToken = Guid.NewGuid().ToString("N"),
            ExpiryDate = dto.ExpirationMinutes > 0 ? DateTime.UtcNow.AddMinutes(dto.ExpirationMinutes) : null,
            MaxDownloads = dto.MaxDownloads,
            TargetEmail = dto.TargetEmail,
            TargetUserID = dto.TargetUserID,
            CreatedByUserID = sharedByUserId,
            IsActive = true
        };

        await _repository.CreateShareAsync(share);

        var result = new ShareLinkResultDto
        {
            ShareID = share.ShareID,
            KnowledgeID = knowledgeId,
            ShareToken = share.ShareToken,
            ShareURL = $"/api/knowledgebase/shared/{share.ShareToken}/download",
            ExpiryDate = share.ExpiryDate,
            MaxDownloads = share.MaxDownloads,
            CreatedAt = share.CreatedAt,
            CreatedByUserID = sharedByUserId
        };

        _logger.LogInformation("Share link created for Knowledge Base {KnowledgeID} by User {UserId}",
            knowledgeId, sharedByUserId);

        return ApiResponse<ShareLinkResultDto>.SuccessResponse(result, "Tạo link chia sẻ thành công");
    }

    /// <summary>
    /// Hủy share link
    /// </summary>
    public async Task<ApiResponse<bool>> RevokeShareLinkAsync(Guid shareId)
    {
        var success = await _repository.RevokeShareAsync(shareId);

        if (!success)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy share link");
        }

        _logger.LogInformation("Share link revoked: {ShareID}", shareId);

        return ApiResponse<bool>.SuccessResponse(true, "Đã hủy link chia sẻ");
    }

    /// <summary>
    /// Hủy tất cả share links của một tài liệu
    /// </summary>
    public async Task<ApiResponse<int>> RevokeAllShareLinksAsync(Guid knowledgeId)
    {
        var count = await _repository.RevokeAllSharesAsync(knowledgeId);

        _logger.LogInformation("Revoked {Count} share links for Knowledge Base {KnowledgeID}",
            count, knowledgeId);

        return ApiResponse<int>.SuccessResponse(count, $"Đã hủy {count} link chia sẻ");
    }

    /// <summary>
    /// Lấy thông tin file được chia sẻ qua token
    /// </summary>
    public async Task<ApiResponse<ShareInfoDto>> GetSharedFileInfoAsync(string shareToken)
    {
        var share = await _repository.GetShareByTokenAsync(shareToken);

        if (share == null || share.KnowledgeBase == null)
        {
            return ApiResponse<ShareInfoDto>.ErrorResponse("Link không hợp lệ hoặc đã bị hủy");
        }

        var isExpired = share.ExpiryDate.HasValue && share.ExpiryDate < DateTime.UtcNow;
        var isDownloadLimitReached = share.MaxDownloads.HasValue && share.CurrentDownloads >= share.MaxDownloads;

        var result = new ShareInfoDto
        {
            KnowledgeID = share.KnowledgeBase.KnowledgeID,
            Title = share.KnowledgeBase.Title,
            Description = share.KnowledgeBase.Description,
            ContentType = share.KnowledgeBase.ContentType,
            FileSize = share.KnowledgeBase.FileSize,
            MimeType = share.KnowledgeBase.MimeType,
            OriginalFileName = share.KnowledgeBase.OriginalFileName,
            IsExpired = isExpired,
            IsDownloadLimitReached = isDownloadLimitReached,
            RemainingDownloads = share.MaxDownloads.HasValue
                ? share.MaxDownloads.Value - share.CurrentDownloads
                : null,
            ExpiresAt = share.ExpiryDate
        };

        return ApiResponse<ShareInfoDto>.SuccessResponse(result);
    }

    /// <summary>
    /// Validate và lấy file để download qua share token
    /// </summary>
    public async Task<ApiResponse<(Stream FileStream, string FileName, string ContentType)>> DownloadSharedFileAsync(string shareToken)
    {
        var share = await _repository.GetShareByTokenAsync(shareToken);

        if (share == null || share.KnowledgeBase == null)
        {
            return ApiResponse<(Stream, string, string)>.ErrorResponse("Link không hợp lệ hoặc đã bị hủy");
        }

        // Check if expired
        if (share.ExpiryDate.HasValue && share.ExpiryDate < DateTime.UtcNow)
        {
            return ApiResponse<(Stream, string, string)>.ErrorResponse("Link đã hết hạn");
        }

        // Check download limit
        if (share.MaxDownloads.HasValue && share.CurrentDownloads >= share.MaxDownloads)
        {
            return ApiResponse<(Stream, string, string)>.ErrorResponse("Đã đạt giới hạn download");
        }

        var item = share.KnowledgeBase;

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
        await _repository.IncrementDownloadCountAsync(share.ShareID);

        _logger.LogInformation("Shared file downloaded: {ShareToken}, Count: {DownloadCount}",
            shareToken, share.CurrentDownloads + 1);

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

    /// <summary>
    /// Lấy presigned URL cho file Preview (PDF) với kiểm tra quyền
    /// </summary>
    public async Task<ApiResponse<PreviewUrlResultDto>> GetPreviewUrlAsync(
        Guid id,
        Guid? userId = null,
        int expirationMinutes = 15)
    {
        // Kiểm tra quyền truy cập
        var (hasAccess, item) = await _repository.CheckAccessAsync(id, userId);

        if (item == null)
        {
            return ApiResponse<PreviewUrlResultDto>.ErrorResponse("Không tìm thấy tài liệu");
        }

        if (!hasAccess)
        {
            return ApiResponse<PreviewUrlResultDto>.ErrorResponse("Bạn không có quyền xem tài liệu này");
        }

        // Nếu là VIDEO, trả về ExternalVideoURL
        if (item.ContentType == KnowledgeType.VIDEO && !string.IsNullOrEmpty(item.ExternalVideoURL))
        {
            return ApiResponse<PreviewUrlResultDto>.SuccessResponse(new PreviewUrlResultDto
            {
                KnowledgeID = id,
                ContentType = item.ContentType,
                PreviewUrl = item.ExternalVideoURL,
                IsExternalVideo = true,
                ExpiresAt = null // Video URL không hết hạn
            });
        }

        // Kiểm tra có PreviewObjectKey không (file PDF đã được convert)
        var objectKeyToUse = !string.IsNullOrEmpty(item.PreviewObjectKey)
            ? item.PreviewObjectKey
            : item.ObjectKey; // Fallback về file gốc nếu chưa có preview

        if (string.IsNullOrEmpty(item.BucketName) || string.IsNullOrEmpty(objectKeyToUse))
        {
            return ApiResponse<PreviewUrlResultDto>.ErrorResponse("File không tồn tại trên storage");
        }

        var url = await _storageService.GetPresignedUrlAsync(
            item.BucketName,
            objectKeyToUse,
            expirationMinutes);

        if (url == null)
        {
            return ApiResponse<PreviewUrlResultDto>.ErrorResponse("Không thể tạo presigned URL");
        }

        var result = new PreviewUrlResultDto
        {
            KnowledgeID = id,
            ContentType = item.ContentType,
            PreviewUrl = url,
            OriginalFileName = item.OriginalFileName,
            MimeType = !string.IsNullOrEmpty(item.PreviewObjectKey) ? "application/pdf" : item.MimeType,
            ProcessStatus = item.ProcessStatus,
            IsExternalVideo = false,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes)
        };

        return ApiResponse<PreviewUrlResultDto>.SuccessResponse(result);
    }

    /// <summary>
    /// Lấy presigned URL cho Thumbnail với kiểm tra quyền
    /// </summary>
    public async Task<ApiResponse<ThumbnailUrlResultDto>> GetThumbnailUrlAsync(
        Guid id,
        Guid? userId = null,
        int expirationMinutes = 60)
    {
        // Kiểm tra quyền truy cập
        var (hasAccess, item) = await _repository.CheckAccessAsync(id, userId);

        if (item == null)
        {
            return ApiResponse<ThumbnailUrlResultDto>.ErrorResponse("Không tìm thấy tài liệu");
        }

        if (!hasAccess)
        {
            return ApiResponse<ThumbnailUrlResultDto>.ErrorResponse("Bạn không có quyền xem tài liệu này");
        }

        // Nếu là VIDEO YouTube, thumbnail có thể là URL external
        if (item.ContentType == KnowledgeType.VIDEO &&
            !string.IsNullOrEmpty(item.ThumbnailObjectKey) &&
            item.ThumbnailObjectKey.StartsWith("http"))
        {
            return ApiResponse<ThumbnailUrlResultDto>.SuccessResponse(new ThumbnailUrlResultDto
            {
                KnowledgeID = id,
                ThumbnailUrl = item.ThumbnailObjectKey,
                IsExternalUrl = true,
                ExpiresAt = null
            });
        }

        // Nếu không có thumbnail
        if (string.IsNullOrEmpty(item.ThumbnailObjectKey))
        {
            return ApiResponse<ThumbnailUrlResultDto>.ErrorResponse("Tài liệu chưa có thumbnail");
        }

        var url = await _storageService.GetPresignedUrlAsync(
            item.BucketName,
            item.ThumbnailObjectKey,
            expirationMinutes);

        if (url == null)
        {
            return ApiResponse<ThumbnailUrlResultDto>.ErrorResponse("Không thể tạo presigned URL cho thumbnail");
        }

        return ApiResponse<ThumbnailUrlResultDto>.SuccessResponse(new ThumbnailUrlResultDto
        {
            KnowledgeID = id,
            ThumbnailUrl = url,
            IsExternalUrl = false,
            ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes)
        });
    }

    /// <summary>
    /// Lấy presigned URL để download với kiểm tra quyền đầy đủ
    /// </summary>
    public async Task<ApiResponse<DownloadUrlResultDto>> GetDownloadUrlWithAccessCheckAsync(
        Guid id,
        Guid? userId = null,
        int expirationMinutes = 15)
    {
        // Kiểm tra quyền truy cập
        var (hasAccess, item) = await _repository.CheckAccessAsync(id, userId);

        if (item == null)
        {
            return ApiResponse<DownloadUrlResultDto>.ErrorResponse("Không tìm thấy tài liệu");
        }

        if (!hasAccess)
        {
            return ApiResponse<DownloadUrlResultDto>.ErrorResponse("Bạn không có quyền tải tài liệu này");
        }

        // Nếu là VIDEO external, không cho download
        if (item.ContentType == KnowledgeType.VIDEO && !string.IsNullOrEmpty(item.ExternalVideoURL))
        {
            return ApiResponse<DownloadUrlResultDto>.ErrorResponse("Video YouTube không hỗ trợ tải xuống");
        }

        if (string.IsNullOrEmpty(item.BucketName) || string.IsNullOrEmpty(item.ObjectKey))
        {
            return ApiResponse<DownloadUrlResultDto>.ErrorResponse("File không tồn tại trên storage");
        }

        var url = await _storageService.GetPresignedUrlAsync(
            item.BucketName,
            item.ObjectKey,
            expirationMinutes);

        if (url == null)
        {
            return ApiResponse<DownloadUrlResultDto>.ErrorResponse("Không thể tạo download URL");
        }

        return ApiResponse<DownloadUrlResultDto>.SuccessResponse(new DownloadUrlResultDto
        {
            KnowledgeID = id,
            DownloadUrl = url,
            FileName = item.OriginalFileName ?? Path.GetFileName(item.ObjectKey),
            FileSize = item.FileSize,
            MimeType = item.MimeType ?? "application/octet-stream",
            ExpiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes)
        });
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
            TopDownloaded = topDownloaded.Select(x => new TopDownloadedItemDto
            {
                KnowledgeID = x.Item.KnowledgeID,
                Title = x.Item.Title,
                DownloadCount = x.TotalDownloads
            }).ToList()
        };

        return ApiResponse<KnowledgeBaseStatisticsDto>.SuccessResponse(stats);
    }

    #endregion

    #region Helpers

    private static KnowledgeBaseResultDto MapToResultDto(ProductKnowledgeBase item)
    {
        return new KnowledgeBaseResultDto
        {
            KnowledgeID = item.KnowledgeID,
            ComponentID = item.ComponentID,
            Title = item.Title,
            Description = item.Description,
            ContentType = item.ContentType,
            Scope = item.Scope,
            ProcessStatus = item.ProcessStatus,

            // MinIO Storage Info
            BucketName = item.BucketName,
            ObjectKey = item.ObjectKey,
            FileSize = item.FileSize,
            MimeType = item.MimeType,
            OriginalFileName = item.OriginalFileName,

            // Preview & Media
            PreviewObjectKey = item.PreviewObjectKey,
            ThumbnailObjectKey = item.ThumbnailObjectKey,
            ExternalVideoURL = item.ExternalVideoURL,

            // Metadata
            CreatedByUserID = item.CreatedByUserID,
            CreatedByUserName = item.CreatedByUser?.Username,
            CreatedAt = item.CreatedAt,
            UpdatedByUserID = item.UpdatedByUserID,
            UpdatedByUserName = item.UpdatedByUser?.Username,
            UpdatedAt = item.UpdatedAt,

            // Sharing stats (aggregated)
            ShareCount = item.Shares?.Count(s => s.IsActive) ?? 0,
            TotalDownloads = item.Shares?.Sum(s => s.CurrentDownloads) ?? 0
        };
    }

    /// <summary>
    /// Extract YouTube video ID from various YouTube URL formats
    /// </summary>
    private static string? ExtractYouTubeVideoId(string url)
    {
        try
        {
            // Handle youtu.be short links
            if (url.Contains("youtu.be/"))
            {
                var parts = url.Split("youtu.be/");
                if (parts.Length > 1)
                {
                    var videoId = parts[1].Split('?')[0].Split('&')[0];
                    return videoId;
                }
            }

            // Handle youtube.com watch links
            if (url.Contains("youtube.com/watch"))
            {
                var uri = new Uri(url);
                var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
                return query["v"];
            }

            // Handle youtube.com embed links
            if (url.Contains("youtube.com/embed/"))
            {
                var parts = url.Split("youtube.com/embed/");
                if (parts.Length > 1)
                {
                    var videoId = parts[1].Split('?')[0].Split('&')[0];
                    return videoId;
                }
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    #endregion
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
