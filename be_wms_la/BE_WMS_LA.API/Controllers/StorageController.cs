using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý file storage (MinIO)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class StorageController : ControllerBase
{
    private readonly MinioStorageService _storageService;
    private readonly ILogger<StorageController> _logger;

    // Allowed file extensions
    private static readonly string[] AllowedImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    private static readonly string[] AllowedDocumentExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv"];
    private const long MaxImageSize = 10 * 1024 * 1024; // 10MB
    private const long MaxDocumentSize = 50 * 1024 * 1024; // 50MB

    public StorageController(MinioStorageService storageService, ILogger<StorageController> logger)
    {
        _storageService = storageService;
        _logger = logger;
    }

    #region Upload Endpoints

    /// <summary>
    /// Upload file chung
    /// </summary>
    [HttpPost("upload")]
    [EndpointSummary("Upload file")]
    [EndpointDescription("Upload file lên storage. Trả về thông tin file đã upload bao gồm presigned URL để truy cập.")]
    [ProducesResponseType<ApiResponse<FileUploadResultDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<FileUploadResultDto>>(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB limit
    public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string? folder = null)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<FileUploadResultDto>.ErrorResponse("Không có file được upload"));
        }

        _logger.LogInformation("Upload file: {FileName}, Size: {Size} bytes", file.FileName, file.Length);

        using var stream = file.OpenReadStream();
        var result = await _storageService.UploadFileAsync(
            stream,
            file.FileName,
            file.ContentType,
            folder: folder);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Upload ảnh sản phẩm
    /// </summary>
    [HttpPost("products/{productId}/images")]
    [EndpointSummary("Upload ảnh sản phẩm")]
    [EndpointDescription("Upload ảnh cho sản phẩm. Chỉ chấp nhận file ảnh (jpg, png, gif, webp).")]
    [ProducesResponseType<ApiResponse<FileUploadResultDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<FileUploadResultDto>>(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10MB limit
    public async Task<IActionResult> UploadProductImage(Guid productId, IFormFile file)
    {
        var validationResult = ValidateImageFile(file);
        if (validationResult != null) return validationResult;

        _logger.LogInformation("Upload product image for product: {ProductId}, File: {FileName}",
            productId, file.FileName);

        using var stream = file.OpenReadStream();
        var result = await _storageService.UploadProductImageAsync(
            stream,
            file.FileName,
            file.ContentType,
            productId);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Upload nhiều ảnh sản phẩm
    /// </summary>
    [HttpPost("products/{productId}/images/batch")]
    [EndpointSummary("Upload nhiều ảnh sản phẩm")]
    [EndpointDescription("Upload nhiều ảnh cho sản phẩm cùng lúc.")]
    [ProducesResponseType<ApiResponse<List<FileUploadResultDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<List<FileUploadResultDto>>>(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB total limit
    public async Task<IActionResult> UploadProductImages(Guid productId, List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
        {
            return BadRequest(ApiResponse<List<FileUploadResultDto>>.ErrorResponse("Không có file được upload"));
        }

        var results = new List<FileUploadResultDto>();
        var errors = new List<string>();

        foreach (var file in files)
        {
            var validationResult = ValidateImageFile(file);
            if (validationResult != null)
            {
                errors.Add($"{file.FileName}: File không hợp lệ");
                continue;
            }

            using var stream = file.OpenReadStream();
            var result = await _storageService.UploadProductImageAsync(
                stream,
                file.FileName,
                file.ContentType,
                productId);

            if (result.Success && result.Data != null)
            {
                results.Add(result.Data);
            }
            else
            {
                errors.Add($"{file.FileName}: {result.Message}");
            }
        }

        if (results.Count == 0)
        {
            return BadRequest(ApiResponse<List<FileUploadResultDto>>.ErrorResponse(
                "Không thể upload file nào", errors));
        }

        return Ok(ApiResponse<List<FileUploadResultDto>>.SuccessResponse(
            results, $"Đã upload {results.Count}/{files.Count} files"));
    }

    /// <summary>
    /// Upload avatar người dùng
    /// </summary>
    [HttpPost("users/{userId}/avatar")]
    [EndpointSummary("Upload avatar")]
    [EndpointDescription("Upload ảnh đại diện cho người dùng.")]
    [ProducesResponseType<ApiResponse<FileUploadResultDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<FileUploadResultDto>>(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(5 * 1024 * 1024)] // 5MB limit for avatars
    public async Task<IActionResult> UploadAvatar(Guid userId, IFormFile file)
    {
        var validationResult = ValidateImageFile(file);
        if (validationResult != null) return validationResult;

        _logger.LogInformation("Upload avatar for user: {UserId}", userId);

        using var stream = file.OpenReadStream();
        var result = await _storageService.UploadAvatarAsync(
            stream,
            file.FileName,
            file.ContentType,
            userId);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Upload tài liệu
    /// </summary>
    [HttpPost("documents")]
    [EndpointSummary("Upload tài liệu")]
    [EndpointDescription("Upload tài liệu (PDF, Word, Excel, etc.).")]
    [ProducesResponseType<ApiResponse<FileUploadResultDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<FileUploadResultDto>>(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(50 * 1024 * 1024)] // 50MB limit
    public async Task<IActionResult> UploadDocument(IFormFile file, [FromQuery] string? category = null)
    {
        var validationResult = ValidateDocumentFile(file);
        if (validationResult != null) return validationResult;

        _logger.LogInformation("Upload document: {FileName}, Category: {Category}",
            file.FileName, category);

        using var stream = file.OpenReadStream();
        var result = await _storageService.UploadDocumentAsync(
            stream,
            file.FileName,
            file.ContentType,
            category);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    #endregion

    #region Download Endpoints

    /// <summary>
    /// Download file
    /// </summary>
    [HttpGet("download")]
    [AllowAnonymous] // Có thể bỏ nếu muốn yêu cầu xác thực
    [EndpointSummary("Download file")]
    [EndpointDescription("Download file từ storage.")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download([FromQuery] string bucket, [FromQuery] string objectName)
    {
        if (string.IsNullOrEmpty(bucket) || string.IsNullOrEmpty(objectName))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Bucket và object name là bắt buộc"));
        }

        // Get file info first
        var fileInfo = await _storageService.GetFileInfoAsync(bucket, objectName);
        if (!fileInfo.Success || fileInfo.Data == null)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("File không tồn tại"));
        }

        var result = await _storageService.DownloadFileAsync(bucket, objectName);
        if (!result.Success || result.Data == null)
        {
            return NotFound(result);
        }

        var fileName = Path.GetFileName(objectName);
        return File(result.Data, fileInfo.Data.ContentType, fileName);
    }

    /// <summary>
    /// Lấy presigned URL để truy cập file
    /// </summary>
    [HttpGet("presigned-url")]
    [EndpointSummary("Lấy presigned URL")]
    [EndpointDescription("Tạo URL tạm thời để truy cập file.")]
    [ProducesResponseType<ApiResponse<string>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<string>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPresignedUrl(
        [FromQuery] string bucket,
        [FromQuery] string objectName,
        [FromQuery] int expirationMinutes = 60)
    {
        if (string.IsNullOrEmpty(bucket) || string.IsNullOrEmpty(objectName))
        {
            return BadRequest(ApiResponse<string>.ErrorResponse("Bucket và object name là bắt buộc"));
        }

        // Check if file exists
        var exists = await _storageService.FileExistsAsync(bucket, objectName);
        if (!exists)
        {
            return NotFound(ApiResponse<string>.ErrorResponse("File không tồn tại"));
        }

        var url = await _storageService.GetPresignedUrlAsync(bucket, objectName, expirationMinutes);
        if (url == null)
        {
            return NotFound(ApiResponse<string>.ErrorResponse("Không thể tạo presigned URL"));
        }

        return Ok(ApiResponse<string>.SuccessResponse(url));
    }

    #endregion

    #region Delete Endpoints

    /// <summary>
    /// Xóa file
    /// </summary>
    [HttpDelete]
    [EndpointSummary("Xóa file")]
    [EndpointDescription("Xóa file khỏi storage.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete([FromQuery] string bucket, [FromQuery] string objectName)
    {
        if (string.IsNullOrEmpty(bucket) || string.IsNullOrEmpty(objectName))
        {
            return BadRequest(ApiResponse<bool>.ErrorResponse("Bucket và object name là bắt buộc"));
        }

        _logger.LogInformation("Delete file: {Bucket}/{ObjectName}", bucket, objectName);

        var result = await _storageService.DeleteFileAsync(bucket, objectName);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    #endregion

    #region Info Endpoints

    /// <summary>
    /// Lấy thông tin file
    /// </summary>
    [HttpGet("info")]
    [EndpointSummary("Thông tin file")]
    [EndpointDescription("Lấy thông tin chi tiết của file.")]
    [ProducesResponseType<ApiResponse<FileInfoDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<FileInfoDto>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetFileInfo([FromQuery] string bucket, [FromQuery] string objectName)
    {
        if (string.IsNullOrEmpty(bucket) || string.IsNullOrEmpty(objectName))
        {
            return BadRequest(ApiResponse<FileInfoDto>.ErrorResponse("Bucket và object name là bắt buộc"));
        }

        var result = await _storageService.GetFileInfoAsync(bucket, objectName);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Kiểm tra file có tồn tại không
    /// </summary>
    [HttpGet("exists")]
    [EndpointSummary("Kiểm tra file tồn tại")]
    [EndpointDescription("Kiểm tra xem file có tồn tại trong storage không.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> FileExists([FromQuery] string bucket, [FromQuery] string objectName)
    {
        if (string.IsNullOrEmpty(bucket) || string.IsNullOrEmpty(objectName))
        {
            return BadRequest(ApiResponse<bool>.ErrorResponse("Bucket và object name là bắt buộc"));
        }

        var exists = await _storageService.FileExistsAsync(bucket, objectName);
        return Ok(ApiResponse<bool>.SuccessResponse(exists));
    }

    #endregion

    #region Validation Helpers

    private IActionResult? ValidateImageFile(IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<FileUploadResultDto>.ErrorResponse("Không có file được upload"));
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedImageExtensions.Contains(extension))
        {
            return BadRequest(ApiResponse<FileUploadResultDto>.ErrorResponse(
                $"Định dạng file không được hỗ trợ. Chỉ chấp nhận: {string.Join(", ", AllowedImageExtensions)}"));
        }

        if (file.Length > MaxImageSize)
        {
            return BadRequest(ApiResponse<FileUploadResultDto>.ErrorResponse(
                $"Kích thước file vượt quá giới hạn ({MaxImageSize / 1024 / 1024}MB)"));
        }

        return null;
    }

    private IActionResult? ValidateDocumentFile(IFormFile? file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<FileUploadResultDto>.ErrorResponse("Không có file được upload"));
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedDocumentExtensions.Contains(extension))
        {
            return BadRequest(ApiResponse<FileUploadResultDto>.ErrorResponse(
                $"Định dạng file không được hỗ trợ. Chỉ chấp nhận: {string.Join(", ", AllowedDocumentExtensions)}"));
        }

        if (file.Length > MaxDocumentSize)
        {
            return BadRequest(ApiResponse<FileUploadResultDto>.ErrorResponse(
                $"Kích thước file vượt quá giới hạn ({MaxDocumentSize / 1024 / 1024}MB)"));
        }

        return null;
    }

    #endregion
}
