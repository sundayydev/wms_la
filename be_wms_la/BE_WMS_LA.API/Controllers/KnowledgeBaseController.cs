using BE_WMS_LA.Core.Services;
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

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdClaim, out var userId) ? userId : null;
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
        IFormFile file,
        [FromForm] KnowledgeBaseUploadDto dto)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<KnowledgeBaseResultDto>.ErrorResponse("Không có file được upload"));
        }

        var userId = GetCurrentUserId();
        _logger.LogInformation("Upload to Knowledge Base: {Title}, File: {FileName}, User: {UserId}",
            dto.Title, file.FileName, userId);

        using var stream = file.OpenReadStream();
        var result = await _knowledgeBaseService.CreateAsync(
            stream,
            file.FileName,
            file.ContentType,
            dto,
            userId);

        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
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
        [FromQuery] string? contentType = null,
        [FromQuery] string? accessLevel = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _knowledgeBaseService.GetAllAsync(
            componentId, contentType, accessLevel, page, pageSize);

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
        var result = await _knowledgeBaseService.UpdateAsync(id, dto);

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
    /// Hủy share link
    /// </summary>
    [HttpDelete("{id}/share")]
    [EndpointSummary("Hủy share link")]
    [EndpointDescription("Hủy link chia sẻ của tài liệu.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RevokeShareLink(Guid id)
    {
        var result = await _knowledgeBaseService.RevokeShareLinkAsync(id);

        if (!result.Success)
        {
            return NotFound(result);
        }

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
