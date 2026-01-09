using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Storage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý Knowledge Base - Kho tri thức sản phẩm
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class KnowledgeBaseController : ControllerBase
{
    private readonly KnowledgeBaseService _knowledgeBaseService;
    private readonly ILogger<KnowledgeBaseController> _logger;

    public KnowledgeBaseController(
        KnowledgeBaseService knowledgeBaseService,
        ILogger<KnowledgeBaseController> logger)
    {
        _knowledgeBaseService = knowledgeBaseService;
        _logger = logger;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        throw new UnauthorizedAccessException("Không thể xác định người dùng");
    }

    #region CRUD Endpoints

    /// <summary>
    /// Upload tài liệu vào Knowledge Base
    /// </summary>
    [HttpPost("upload")]
    [EndpointSummary("Upload vào Knowledge Base")]
    [EndpointDescription("Upload tài liệu (PDF, Video link, Driver, Firmware) vào kho tri thức sản phẩm.")]
    [ProducesResponseType<ApiResponse<KnowledgeBaseResultDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<KnowledgeBaseResultDto>>(StatusCodes.Status400BadRequest)]
    [RequestSizeLimit(500 * 1024 * 1024)] // 500MB limit for firmware
    public async Task<IActionResult> Upload(
        IFormFile? file,
        [FromForm] KnowledgeBaseUploadDto dto)
    {
        var userId = GetCurrentUserId();
        _logger.LogInformation("Upload to Knowledge Base: {Title}, Type: {ContentType}, User: {UserId}",
            dto.Title, dto.ContentType, userId);

        // Nếu là VIDEO type, sử dụng VideoURL thay vì upload file
        if (dto.ContentType == KnowledgeType.VIDEO)
        {
            if (string.IsNullOrEmpty(dto.VideoURL))
            {
                return BadRequest(ApiResponse<KnowledgeBaseResultDto>.ErrorResponse("Vui lòng nhập link video (YouTube, Vimeo, ...)"));
            }

            // Tạo record với VideoURL
            var result = await _knowledgeBaseService.CreateFromVideoUrlAsync(dto, userId);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            return Ok(result);
        }

        // Với các loại khác (DOCUMENT, DRIVER, FIRMWARE), yêu cầu file
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<KnowledgeBaseResultDto>.ErrorResponse("Không có file được upload"));
        }

        using var stream = file.OpenReadStream();
        var uploadResult = await _knowledgeBaseService.CreateAsync(
            stream,
            file.FileName,
            file.ContentType,
            dto,
            userId);

        if (!uploadResult.Success)
        {
            return BadRequest(uploadResult);
        }

        return Ok(uploadResult);
    }

    /// <summary>
    /// Lấy danh sách Knowledge Base
    /// </summary>
    [HttpGet]
    [EndpointSummary("Danh sách Knowledge Base")]
    [EndpointDescription("Lấy danh sách tài liệu trong kho tri thức. Có thể lọc theo ComponentID.")]
    [ProducesResponseType<ApiResponse<PagedResult<KnowledgeBaseResultDto>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? componentId = null,
        [FromQuery] KnowledgeType? contentType = null,
        [FromQuery] AccessScope? scope = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _knowledgeBaseService.GetAllAsync(
            componentId, contentType, scope, page, pageSize);

        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách tài liệu công khai (không cần đăng nhập)
    /// </summary>
    [HttpGet("public")]
    [AllowAnonymous]
    [EndpointSummary("Danh sách tài liệu công khai")]
    [EndpointDescription("Lấy danh sách tài liệu PUBLIC. Không yêu cầu đăng nhập.")]
    [ProducesResponseType<ApiResponse<PagedResult<KnowledgeBaseResultDto>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublic(
        [FromQuery] Guid? componentId = null,
        [FromQuery] KnowledgeType? contentType = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _knowledgeBaseService.GetPublicAsync(
            componentId, contentType, page, pageSize);

        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết Knowledge Base item
    /// </summary>
    [HttpGet("{id}")]
    [EndpointSummary("Chi tiết Knowledge Base")]
    [EndpointDescription("Lấy thông tin chi tiết của một tài liệu trong kho tri thức.")]
    [ProducesResponseType<ApiResponse<KnowledgeBaseResultDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<KnowledgeBaseResultDto>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _knowledgeBaseService.GetByIdAsync(id);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách Knowledge Base theo Component
    /// </summary>
    [HttpGet("by-component/{componentId}")]
    [EndpointSummary("Knowledge Base theo sản phẩm")]
    [EndpointDescription("Lấy danh sách tài liệu của một sản phẩm cụ thể.")]
    [ProducesResponseType<ApiResponse<List<KnowledgeBaseResultDto>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByComponentId(Guid componentId)
    {
        var result = await _knowledgeBaseService.GetByComponentIdAsync(componentId);
        return Ok(result);
    }

    /// <summary>
    /// Cập nhật thông tin Knowledge Base
    /// </summary>
    [HttpPut("{id}")]
    [EndpointSummary("Cập nhật Knowledge Base")]
    [EndpointDescription("Cập nhật thông tin tài liệu (không cập nhật file).")]
    [ProducesResponseType<ApiResponse<KnowledgeBaseResultDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<KnowledgeBaseResultDto>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] KnowledgeBaseUploadDto dto)
    {
        var userId = GetCurrentUserId();
        var result = await _knowledgeBaseService.UpdateAsync(id, dto, userId);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa tài liệu khỏi Knowledge Base
    /// </summary>
    [HttpDelete("{id}")]
    [EndpointSummary("Xóa tài liệu")]
    [EndpointDescription("Xóa tài liệu khỏi Knowledge Base và MinIO storage.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Deleting Knowledge Base item: {KnowledgeID}", id);

        var result = await _knowledgeBaseService.DeleteAsync(id);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    #endregion

    #region Sharing Endpoints

    /// <summary>
    /// Tạo share link cho tài liệu
    /// </summary>
    [HttpPost("{id}/share")]
    [EndpointSummary("Tạo share link")]
    [EndpointDescription("Tạo link chia sẻ tài liệu với thời hạn và giới hạn download.")]
    [ProducesResponseType<ApiResponse<ShareLinkResultDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<ShareLinkResultDto>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateShareLink(Guid id, [FromBody] CreateShareLinkDto dto)
    {
        var userId = GetCurrentUserId();
        var result = await _knowledgeBaseService.CreateShareLinkAsync(id, dto, userId);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Hủy share link cụ thể
    /// </summary>
    [HttpDelete("share/{shareId}")]
    [EndpointSummary("Hủy share link")]
    [EndpointDescription("Hủy link chia sẻ cụ thể.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RevokeShareLink(Guid shareId)
    {
        var result = await _knowledgeBaseService.RevokeShareLinkAsync(shareId);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Hủy tất cả share links của một tài liệu
    /// </summary>
    [HttpDelete("{id}/shares")]
    [EndpointSummary("Hủy tất cả share links")]
    [EndpointDescription("Hủy tất cả link chia sẻ của tài liệu.")]
    [ProducesResponseType<ApiResponse<int>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> RevokeAllShareLinks(Guid id)
    {
        var result = await _knowledgeBaseService.RevokeAllShareLinksAsync(id);
        return Ok(result);
    }

    /// <summary>
    /// Lấy thông tin file được chia sẻ qua token
    /// </summary>
    [HttpGet("shared/{shareToken}/info")]
    [AllowAnonymous]
    [EndpointSummary("Thông tin file chia sẻ")]
    [EndpointDescription("Lấy thông tin file được chia sẻ. Không cần xác thực.")]
    [ProducesResponseType<ApiResponse<ShareInfoDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<ShareInfoDto>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetSharedFileInfo(string shareToken)
    {
        var result = await _knowledgeBaseService.GetSharedFileInfoAsync(shareToken);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Download file qua share token
    /// </summary>
    [HttpGet("shared/{shareToken}/download")]
    [AllowAnonymous]
    [EndpointSummary("Download file chia sẻ")]
    [EndpointDescription("Download file được chia sẻ qua token. Không cần xác thực.")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status410Gone)]
    public async Task<IActionResult> DownloadSharedFile(string shareToken)
    {
        var result = await _knowledgeBaseService.DownloadSharedFileAsync(shareToken);

        if (!result.Success)
        {
            // Check if it's an expiry or limit error
            if (result.Message?.Contains("hết hạn") == true || result.Message?.Contains("giới hạn") == true)
            {
                return StatusCode(StatusCodes.Status410Gone,
                    ApiResponse<object>.ErrorResponse(result.Message));
            }

            return NotFound(ApiResponse<object>.ErrorResponse(result.Message ?? "Không thể download file"));
        }

        var (fileStream, fileName, contentType) = result.Data;
        return File(fileStream, contentType, fileName);
    }

    #endregion

    #region Download Endpoints

    /// <summary>
    /// Download file trực tiếp (yêu cầu xác thực)
    /// </summary>
    [HttpGet("{id}/download")]
    [EndpointSummary("Download file")]
    [EndpointDescription("Download file từ Knowledge Base. Yêu cầu xác thực.")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Download(Guid id)
    {
        _logger.LogInformation("Downloading file: {KnowledgeID}, User: {UserId}",
            id, GetCurrentUserId());

        var result = await _knowledgeBaseService.DownloadAsync(id);

        if (!result.Success)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(result.Message ?? "Không thể download file"));
        }

        var (fileStream, fileName, contentType) = result.Data;
        return File(fileStream, contentType, fileName);
    }

    /// <summary>
    /// Lấy presigned URL để download
    /// </summary>
    [HttpGet("{id}/presigned-url")]
    [EndpointSummary("Lấy presigned URL")]
    [EndpointDescription("Tạo URL tạm thời để download file.")]
    [ProducesResponseType<ApiResponse<string>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<string>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPresignedUrl(Guid id, [FromQuery] int expirationMinutes = 60)
    {
        var result = await _knowledgeBaseService.GetPresignedUrlAsync(id, expirationMinutes);

        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Lấy URL xem trước tài liệu (Preview) với kiểm tra quyền
    /// </summary>
    /// <remarks>
    /// - Với tài liệu PUBLIC: Cho phép anonymous access
    /// - Với tài liệu INTERNAL: Yêu cầu đăng nhập
    /// - Với video YouTube: Trả về URL video trực tiếp
    /// - Với file Office đã convert: Trả về presigned URL của file PDF
    /// </remarks>
    [HttpGet("{id}/preview")]
    [AllowAnonymous]
    [EndpointSummary("Lấy Preview URL")]
    [EndpointDescription("Lấy URL để xem trước tài liệu. Hỗ trợ cả anonymous (PUBLIC) và authenticated (INTERNAL) access.")]
    [ProducesResponseType<ApiResponse<PreviewUrlResultDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<PreviewUrlResultDto>>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ApiResponse<PreviewUrlResultDto>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetPreviewUrl(
        Guid id,
        [FromQuery] int expirationMinutes = 15)
    {
        // Lấy userId nếu user đã đăng nhập, null nếu anonymous
        Guid? userId = null;
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var parsedUserId))
        {
            userId = parsedUserId;
        }

        var result = await _knowledgeBaseService.GetPreviewUrlAsync(id, userId, expirationMinutes);

        if (!result.Success)
        {
            // Phân biệt lỗi không tìm thấy và lỗi không có quyền
            if (result.Message?.Contains("không có quyền") == true)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result);
            }
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Lấy URL thumbnail của tài liệu với kiểm tra quyền
    /// </summary>
    [HttpGet("{id}/thumbnail")]
    [AllowAnonymous]
    [EndpointSummary("Lấy Thumbnail URL")]
    [EndpointDescription("Lấy URL thumbnail của tài liệu. Hỗ trợ cả anonymous (PUBLIC) và authenticated (INTERNAL) access.")]
    [ProducesResponseType<ApiResponse<ThumbnailUrlResultDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<ThumbnailUrlResultDto>>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ApiResponse<ThumbnailUrlResultDto>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetThumbnailUrl(
        Guid id,
        [FromQuery] int expirationMinutes = 60)
    {
        Guid? userId = null;
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var parsedUserId))
        {
            userId = parsedUserId;
        }

        var result = await _knowledgeBaseService.GetThumbnailUrlAsync(id, userId, expirationMinutes);

        if (!result.Success)
        {
            if (result.Message?.Contains("không có quyền") == true)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result);
            }
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Lấy Download URL với kiểm tra quyền đầy đủ
    /// </summary>
    /// <remarks>
    /// Endpoint này trả về presigned URL thay vì stream file trực tiếp.
    /// Thuận tiện cho frontend khi cần hiển thị progress download hoặc mở trong tab mới.
    /// </remarks>
    [HttpGet("{id}/download-url")]
    [AllowAnonymous]
    [EndpointSummary("Lấy Download URL")]
    [EndpointDescription("Lấy presigned URL để download file với kiểm tra quyền.")]
    [ProducesResponseType<ApiResponse<DownloadUrlResultDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<DownloadUrlResultDto>>(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ApiResponse<DownloadUrlResultDto>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDownloadUrl(
        Guid id,
        [FromQuery] int expirationMinutes = 15)
    {
        Guid? userId = null;
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(userIdClaim, out var parsedUserId))
        {
            userId = parsedUserId;
        }

        var result = await _knowledgeBaseService.GetDownloadUrlWithAccessCheckAsync(id, userId, expirationMinutes);

        if (!result.Success)
        {
            if (result.Message?.Contains("không có quyền") == true)
            {
                return StatusCode(StatusCodes.Status403Forbidden, result);
            }
            return NotFound(result);
        }

        return Ok(result);
    }

    #endregion

    #region Statistics Endpoints

    /// <summary>
    /// Thống kê Knowledge Base
    /// </summary>
    [HttpGet("statistics")]
    [EndpointSummary("Thống kê Knowledge Base")]
    [EndpointDescription("Lấy thống kê tổng quan về kho tri thức.")]
    [ProducesResponseType<ApiResponse<KnowledgeBaseStatisticsDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics()
    {
        var result = await _knowledgeBaseService.GetStatisticsAsync();
        return Ok(result);
    }

    #endregion
}
