using System.Security.Claims;
using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Domain.Constants;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Supplier;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý nhà cung cấp
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class SuppliersController : ControllerBase
{
    private readonly SupplierService _supplierService;
    private readonly PermissionService _permissionService;
    private readonly ILogger<SuppliersController> _logger;

    public SuppliersController(
        SupplierService supplierService,
        PermissionService permissionService,
        ILogger<SuppliersController> logger)
    {
        _supplierService = supplierService;
        _permissionService = permissionService;
        _logger = logger;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách nhà cung cấp
    /// </summary>
    /// <param name="page">Trang (mặc định 1)</param>
    /// <param name="pageSize">Số lượng mỗi trang (mặc định 20)</param>
    /// <param name="search">Tìm kiếm theo mã, tên, người liên hệ, SĐT, email</param>
    /// <param name="isActive">Lọc theo trạng thái</param>
    /// <param name="city">Lọc theo thành phố</param>
    [HttpGet]
    [EndpointSummary("Danh sách nhà cung cấp")]
    [EndpointDescription("Lấy danh sách nhà cung cấp có phân trang và bộ lọc")]
    [ProducesResponseType<ApiResponse<List<SupplierListDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? city = null)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.SupplierView))
        {
            return Forbid();
        }

        var result = await _supplierService.GetAllAsync(page, pageSize, search, isActive, city);
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách nhà cung cấp cho dropdown
    /// </summary>
    [HttpGet("select")]
    [EndpointSummary("Danh sách nhà cung cấp cho dropdown")]
    [EndpointDescription("Lấy danh sách tất cả nhà cung cấp đang hoạt động (dùng cho dropdown selector)")]
    [ProducesResponseType<ApiResponse<List<SupplierListDto>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllForSelect()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Forbid();
        }

        var result = await _supplierService.GetAllForSelectAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết nhà cung cấp
    /// </summary>
    /// <param name="id">ID nhà cung cấp</param>
    [HttpGet("{id:guid}")]
    [EndpointSummary("Chi tiết nhà cung cấp")]
    [EndpointDescription("Lấy thông tin chi tiết của một nhà cung cấp")]
    [ProducesResponseType<ApiResponse<SupplierDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.SupplierView))
        {
            return Forbid();
        }

        var result = await _supplierService.GetByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Tìm nhà cung cấp theo mã
    /// </summary>
    /// <param name="code">Mã nhà cung cấp</param>
    [HttpGet("code/{code}")]
    [EndpointSummary("Tìm nhà cung cấp theo mã")]
    [EndpointDescription("Tìm nhà cung cấp bằng mã nhà cung cấp")]
    [ProducesResponseType<ApiResponse<SupplierDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCode(string code)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.SupplierView))
        {
            return Forbid();
        }

        var result = await _supplierService.GetByCodeAsync(code);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Tạo nhà cung cấp mới
    /// </summary>
    /// <param name="dto">Thông tin nhà cung cấp</param>
    [HttpPost]
    [EndpointSummary("Tạo nhà cung cấp")]
    [EndpointDescription("Tạo nhà cung cấp mới trong hệ thống")]
    [ProducesResponseType<ApiResponse<SupplierDetailDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<SupplierDetailDto>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateSupplierDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.SupplierCreate))
        {
            return Forbid();
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<SupplierDetailDto>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("User {UserId} đang tạo nhà cung cấp mới: {SupplierCode}", userId, dto.SupplierCode);

        var result = await _supplierService.CreateAsync(dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        _logger.LogInformation("Đã tạo nhà cung cấp {SupplierCode} thành công", dto.SupplierCode);
        return CreatedAtAction(nameof(GetById), new { id = result.Data?.SupplierID }, result);
    }

    /// <summary>
    /// Cập nhật nhà cung cấp
    /// </summary>
    /// <param name="id">ID nhà cung cấp</param>
    /// <param name="dto">Thông tin cập nhật</param>
    [HttpPut("{id:guid}")]
    [EndpointSummary("Cập nhật nhà cung cấp")]
    [EndpointDescription("Cập nhật thông tin nhà cung cấp")]
    [ProducesResponseType<ApiResponse<SupplierDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<SupplierDetailDto>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSupplierDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.SupplierEdit))
        {
            return Forbid();
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<SupplierDetailDto>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("User {UserId} đang cập nhật nhà cung cấp: {SupplierId}", userId, id);

        var result = await _supplierService.UpdateAsync(id, dto);
        if (!result.Success)
        {
            if (result.Message.Contains("Không tìm thấy"))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa nhà cung cấp (soft delete)
    /// </summary>
    /// <param name="id">ID nhà cung cấp</param>
    [HttpDelete("{id:guid}")]
    [EndpointSummary("Xóa nhà cung cấp")]
    [EndpointDescription("Xóa nhà cung cấp (soft delete)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.SupplierDelete))
        {
            return Forbid();
        }

        _logger.LogInformation("User {UserId} đang xóa nhà cung cấp: {SupplierId}", userId, id);

        var result = await _supplierService.DeleteAsync(id);
        if (!result.Success)
        {
            if (result.Message.Contains("Không tìm thấy"))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    #endregion

    #region Status Management

    /// <summary>
    /// Kích hoạt/vô hiệu hóa nhà cung cấp
    /// </summary>
    /// <param name="id">ID nhà cung cấp</param>
    /// <param name="isActive">true = kích hoạt, false = vô hiệu hóa</param>
    [HttpPatch("{id:guid}/status")]
    [EndpointSummary("Kích hoạt/vô hiệu hóa nhà cung cấp")]
    [EndpointDescription("Thay đổi trạng thái hoạt động của nhà cung cấp")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleStatus(Guid id, [FromQuery] bool isActive)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.SupplierEdit))
        {
            return Forbid();
        }

        _logger.LogInformation("User {UserId} đang {Action} nhà cung cấp: {SupplierId}",
            userId, isActive ? "kích hoạt" : "vô hiệu hóa", id);

        var result = await _supplierService.ToggleStatusAsync(id, isActive);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    #endregion

    #region Statistics & Validation

    /// <summary>
    /// Thống kê nhà cung cấp
    /// </summary>
    [HttpGet("statistics")]
    [EndpointSummary("Thống kê nhà cung cấp")]
    [EndpointDescription("Lấy thống kê về nhà cung cấp trong hệ thống")]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics()
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.SupplierView))
        {
            return Forbid();
        }

        var result = await _supplierService.GetStatisticsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Kiểm tra mã nhà cung cấp đã tồn tại
    /// </summary>
    /// <param name="code">Mã nhà cung cấp</param>
    /// <param name="excludeId">ID cần loại trừ (dùng khi update)</param>
    [HttpGet("check-code")]
    [EndpointSummary("Kiểm tra mã nhà cung cấp")]
    [EndpointDescription("Kiểm tra xem mã nhà cung cấp đã tồn tại trong hệ thống chưa")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckCodeExists(
        [FromQuery] string code,
        [FromQuery] Guid? excludeId = null)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Forbid();
        }

        var result = await _supplierService.CheckCodeExistsAsync(code, excludeId);
        return Ok(result);
    }

    /// <summary>
    /// Export danh sách nhà cung cấp ra Excel
    /// </summary>
    /// <param name="search">Tìm kiếm</param>
    /// <param name="isActive">Lọc theo trạng thái</param>
    /// <param name="city">Lọc theo thành phố</param>
    [HttpGet("export-excel")]
    [EndpointSummary("Export nhà cung cấp ra Excel")]
    [EndpointDescription("Export danh sách nhà cung cấp ra file Excel với các bộ lọc tùy chọn")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ExportToExcel(
        [FromQuery] string? search = null,
        [FromQuery] bool? isActive = null,
        [FromQuery] string? city = null)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.SupplierView))
        {
            return Forbid();
        }

        _logger.LogInformation("User {UserId} đang export danh sách nhà cung cấp ra Excel", userId);

        var excelData = await _supplierService.ExportToExcelAsync(search, isActive, city);

        var fileName = $"DanhSachNhaCungCap_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";

        return File(
            excelData,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }

    /// <summary>
    /// Import nhà cung cấp từ file Excel
    /// </summary>
    /// <param name="file">File Excel (.xlsx)</param>
    [HttpPost("import-excel")]
    [EndpointSummary("Import nhà cung cấp từ Excel")]
    [EndpointDescription("Upload file Excel để import nhà cung cấp. Nếu mã NCC đã tồn tại sẽ cập nhật, nếu chưa sẽ tạo mới.")]
    [ProducesResponseType<ApiResponse<ImportSupplierResult>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ImportFromExcel(IFormFile file)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.SupplierCreate))
        {
            return Forbid();
        }

        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<ImportSupplierResult>.ErrorResponse("Vui lòng chọn file Excel"));
        }

        // Validate file extension
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (extension != ".xlsx" && extension != ".xls")
        {
            return BadRequest(ApiResponse<ImportSupplierResult>.ErrorResponse("Chỉ hỗ trợ file Excel (.xlsx, .xls)"));
        }

        _logger.LogInformation("User {UserId} đang import nhà cung cấp từ file: {FileName}", userId, file.FileName);

        try
        {
            using var stream = file.OpenReadStream();
            var result = await _supplierService.ImportFromExcelAsync(stream);

            if (!result.Success)
            {
                return BadRequest(result);
            }

            _logger.LogInformation("Import thành công: {Created} tạo mới, {Updated} cập nhật, {Skipped} bỏ qua",
                result.Data?.CreatedCount, result.Data?.UpdatedCount, result.Data?.SkippedCount);

            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi import Excel");
            return BadRequest(ApiResponse<ImportSupplierResult>.ErrorResponse($"Lỗi khi import: {ex.Message}"));
        }
    }

    #endregion

    #region Helper Methods

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst("sub") ?? User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }

    private async Task<bool> HasPermission(string permissionName)
    {
        var userId = GetCurrentUserId();
        if (userId == null) return false;

        // Admin có tất cả quyền
        var role = User.FindFirst("role")?.Value;
        if (role == UserRoles.Admin) return true;

        return await _permissionService.HasPermissionAsync(userId.Value, permissionName);
    }

    #endregion
}
