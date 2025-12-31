using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Warehouse;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý kho hàng
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize] // Yêu cầu đăng nhập cho tất cả endpoints
public class WarehousesController : ControllerBase
{
    private readonly WarehouseService _warehouseService;
    private readonly ILogger<WarehousesController> _logger;

    public WarehousesController(
        WarehouseService warehouseService,
        ILogger<WarehousesController> logger)
    {
        _warehouseService = warehouseService;
        _logger = logger;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách tất cả kho
    /// </summary>
    /// <param name="includeInactive">Bao gồm kho không hoạt động</param>
    /// <returns>Danh sách kho</returns>
    [HttpGet]
    [EndpointSummary("Lấy danh sách kho")]
    [EndpointDescription("Lấy danh sách tất cả kho hàng trong hệ thống. Có thể filter theo trạng thái hoạt động.")]
    [ProducesResponseType<ApiResponse<List<WarehouseListDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<List<WarehouseListDto>>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll([FromQuery] bool includeInactive = false)
    {
        _logger.LogInformation("Getting all warehouses. IncludeInactive: {IncludeInactive}", includeInactive);

        var result = await _warehouseService.GetAllWarehousesAsync(includeInactive);

        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Lấy chi tiết kho theo ID
    /// </summary>
    /// <param name="id">ID của kho</param>
    /// <returns>Thông tin chi tiết kho</returns>
    [HttpGet("{id}")]
    [EndpointSummary("Chi tiết kho")]
    [EndpointDescription("Lấy thông tin chi tiết của một kho bao gồm danh sách nhân viên và thống kê tồn kho.")]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting warehouse details for ID: {WarehouseId}", id);

        var result = await _warehouseService.GetWarehouseByIdAsync(id);

        if (result.Success)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// Tạo kho mới
    /// </summary>
    /// <param name="dto">Thông tin kho mới</param>
    /// <returns>Thông tin kho vừa tạo</returns>
    [HttpPost]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Tạo kho mới")]
    [EndpointDescription("Tạo kho hàng mới trong hệ thống. Chỉ Admin và Manager mới có quyền.")]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateWarehouseDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<WarehouseDetailDto>.ErrorResponse(
                "Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("Creating new warehouse: {WarehouseName}", dto.WarehouseName);

        var result = await _warehouseService.CreateWarehouseAsync(dto);

        if (result.Success)
        {
            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Data!.WarehouseID },
                result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Cập nhật thông tin kho
    /// </summary>
    /// <param name="id">ID của kho</param>
    /// <param name="dto">Thông tin cập nhật</param>
    /// <returns>Thông tin kho sau khi cập nhật</returns>
    [HttpPut("{id}")]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Manager}")]
    [EndpointSummary("Cập nhật kho")]
    [EndpointDescription("Cập nhật thông tin của một kho. Chỉ Admin và Manager mới có quyền.")]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ApiResponse<WarehouseDetailDto>>(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateWarehouseDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<WarehouseDetailDto>.ErrorResponse(
                "Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("Updating warehouse ID: {WarehouseId}", id);

        var result = await _warehouseService.UpdateWarehouseAsync(id, dto);

        if (result.Success)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// Xóa kho (soft delete)
    /// </summary>
    /// <param name="id">ID của kho</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("{id}")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Xóa kho")]
    [EndpointDescription("Xóa mềm một kho khỏi hệ thống. Chỉ Admin mới có quyền. Không thể xóa nếu còn nhân viên hoặc tồn kho.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Deleting warehouse ID: {WarehouseId}", id);

        var result = await _warehouseService.DeleteWarehouseAsync(id);

        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Khôi phục kho đã xóa
    /// </summary>
    /// <param name="id">ID của kho</param>
    /// <returns>Kết quả khôi phục</returns>
    [HttpPost("{id}/restore")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Khôi phục kho")]
    [EndpointDescription("Khôi phục kho đã bị xóa mềm. Chỉ Admin mới có quyền.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Restore(Guid id)
    {
        _logger.LogInformation("Restoring warehouse ID: {WarehouseId}", id);

        var result = await _warehouseService.RestoreWarehouseAsync(id);

        if (result.Success)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    #endregion

    #region Stock Operations

    /// <summary>
    /// Lấy tồn kho theo kho
    /// </summary>
    /// <param name="id">ID của kho</param>
    /// <param name="searchTerm">Từ khóa tìm kiếm (SKU, tên sản phẩm)</param>
    /// <param name="lowStock">Chỉ lấy sản phẩm sắp hết hàng</param>
    /// <param name="minQuantity">Số lượng tối thiểu</param>
    /// <param name="pageNumber">Số trang</param>
    /// <param name="pageSize">Kích thước trang</param>
    /// <returns>Danh sách tồn kho</returns>
    [HttpGet("{id}/stock")]
    [EndpointSummary("Tồn kho theo kho")]
    [EndpointDescription("Lấy danh sách tồn kho của một kho cụ thể. Hỗ trợ tìm kiếm và filter.")]
    [ProducesResponseType<ApiResponse<List<WarehouseStockDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<List<WarehouseStockDto>>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApiResponse<List<WarehouseStockDto>>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStock(
        Guid id,
        [FromQuery] string? searchTerm = null,
        [FromQuery] bool? lowStock = null,
        [FromQuery] int? minQuantity = null,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20)
    {
        _logger.LogInformation(
            "Getting stock for warehouse ID: {WarehouseId}, Search: {SearchTerm}",
            id, searchTerm ?? "None");

        var request = new GetWarehouseStockRequest
        {
            WarehouseID = id,
            SearchTerm = searchTerm,
            LowStock = lowStock,
            MinQuantity = minQuantity,
            PageNumber = pageNumber,
            PageSize = pageSize
        };

        var result = await _warehouseService.GetWarehouseStockAsync(request);

        if (result.Success)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    #endregion
}
