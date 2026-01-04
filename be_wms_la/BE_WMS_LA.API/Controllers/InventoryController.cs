using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Inventory;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý tồn kho theo Serial/IMEI (ProductInstance)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class InventoryController : ControllerBase
{
    private readonly InventoryService _inventoryService;

    public InventoryController(InventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách tồn kho có phân trang và lọc
    /// </summary>
    /// <param name="page">Trang hiện tại (mặc định: 1)</param>
    /// <param name="pageSize">Số lượng mỗi trang (mặc định: 20)</param>
    /// <param name="search">Từ khóa tìm kiếm (serial, IMEI, SKU, tên)</param>
    /// <param name="componentId">Lọc theo sản phẩm</param>
    /// <param name="warehouseId">Lọc theo kho</param>
    /// <param name="status">Trạng thái: IN_STOCK, SOLD, WARRANTY, REPAIR, etc.</param>
    [HttpGet]
    [EndpointSummary("Danh sách tồn kho")]
    [EndpointDescription("Lấy danh sách tồn kho có phân trang và bộ lọc")]
    [ProducesResponseType<ApiResponse<List<ProductInstanceListDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? componentId = null,
        [FromQuery] Guid? warehouseId = null,
        [FromQuery] string? status = null)
    {
        var result = await _inventoryService.GetAllAsync(
            page, pageSize, search, componentId, warehouseId, status);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết thiết bị theo ID
    /// </summary>
    /// <param name="id">ID thiết bị (ProductInstance)</param>
    [HttpGet("{id:guid}")]
    [EndpointSummary("Chi tiết thiết bị")]
    [EndpointDescription("Lấy thông tin chi tiết của một thiết bị theo serial")]
    [ProducesResponseType<ApiResponse<ProductInstanceDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _inventoryService.GetByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Tìm thiết bị theo Serial Number
    /// </summary>
    /// <param name="serial">Serial Number của thiết bị</param>
    [HttpGet("serial/{serial}")]
    [EndpointSummary("Tìm thiết bị theo Serial")]
    [EndpointDescription("Tìm thiết bị bằng Serial Number")]
    [ProducesResponseType<ApiResponse<ProductInstanceDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBySerial(string serial)
    {
        var result = await _inventoryService.GetBySerialAsync(serial);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Nhập hàng mới (tạo ProductInstance)
    /// </summary>
    /// <param name="dto">Thông tin thiết bị mới</param>
    [HttpPost]
    [EndpointSummary("Nhập hàng mới")]
    [EndpointDescription("Tạo ProductInstance mới - nhập thiết bị vào kho")]
    [ProducesResponseType<ApiResponse<ProductInstanceDetailDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateProductInstanceDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var result = await _inventoryService.CreateAsync(dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.InstanceID }, result);
    }

    /// <summary>
    /// Nhập hàng nhiều serial cùng lúc
    /// </summary>
    /// <param name="dto">Thông tin nhập nhiều thiết bị</param>
    [HttpPost("bulk")]
    [EndpointSummary("Nhập hàng hàng loạt")]
    [EndpointDescription("Nhập nhiều thiết bị cùng lúc vào kho (bulk import)")]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BulkCreate([FromBody] BulkCreateProductInstanceDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var result = await _inventoryService.BulkCreateAsync(dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Cập nhật thông tin thiết bị
    /// </summary>
    /// <param name="id">ID thiết bị</param>
    /// <param name="dto">Thông tin cập nhật</param>
    [HttpPut("{id:guid}")]
    [EndpointSummary("Cập nhật thiết bị")]
    [EndpointDescription("Cập nhật thông tin thiết bị")]
    [ProducesResponseType<ApiResponse<ProductInstanceDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductInstanceDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var result = await _inventoryService.UpdateAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa thiết bị (soft delete)
    /// </summary>
    /// <param name="id">ID thiết bị</param>
    [HttpDelete("{id:guid}")]
    [EndpointSummary("Xóa thiết bị")]
    [EndpointDescription("Xóa thiết bị khỏi hệ thống (soft delete)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _inventoryService.DeleteAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    #endregion

    #region Status & Actions

    /// <summary>
    /// Cập nhật trạng thái thiết bị
    /// </summary>
    /// <remarks>
    /// Các trạng thái hợp lệ: IN_STOCK, SOLD, WARRANTY, REPAIR, BROKEN, TRANSFERRING, DEMO, SCRAPPED, LOST
    /// </remarks>
    [HttpPatch("{id:guid}/status")]
    [EndpointSummary("Cập nhật trạng thái thiết bị")]
    [EndpointDescription("Thay đổi trạng thái thiết bị: IN_STOCK, SOLD, WARRANTY, REPAIR, BROKEN, TRANSFERRING, DEMO, SCRAPPED, LOST")]
    [ProducesResponseType<ApiResponse<ProductInstanceDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateInstanceStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var result = await _inventoryService.UpdateStatusAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Bán thiết bị (chuyển sở hữu cho khách)
    /// </summary>
    /// <param name="id">ID thiết bị</param>
    /// <param name="dto">Thông tin bán hàng</param>
    [HttpPost("{id:guid}/sell")]
    [EndpointSummary("Bán thiết bị")]
    [EndpointDescription("Bán thiết bị - chuyển sở hữu cho khách hàng")]
    [ProducesResponseType<ApiResponse<ProductInstanceDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Sell(Guid id, [FromBody] SellInstanceDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var result = await _inventoryService.SellAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Chuyển kho
    /// </summary>
    /// <param name="id">ID thiết bị</param>
    /// <param name="dto">Thông tin chuyển kho</param>
    [HttpPost("{id:guid}/transfer")]
    [EndpointSummary("Chuyển kho thiết bị")]
    [EndpointDescription("Chuyển thiết bị từ kho này sang kho khác")]
    [ProducesResponseType<ApiResponse<ProductInstanceDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Transfer(Guid id, [FromBody] TransferInstanceDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var result = await _inventoryService.TransferAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê tồn kho
    /// </summary>
    [HttpGet("statistics")]
    [EndpointSummary("Thống kê tồn kho")]
    [EndpointDescription("Lấy thống kê về tồn kho trong hệ thống")]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics()
    {
        var result = await _inventoryService.GetStatisticsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Thống kê tồn kho theo kho
    /// </summary>
    [HttpGet("by-warehouse")]
    [EndpointSummary("Thống kê tồn kho theo kho")]
    [EndpointDescription("Lấy thống kê tồn kho theo từng kho hàng")]
    [ProducesResponseType<ApiResponse<List<object>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStockByWarehouse()
    {
        var result = await _inventoryService.GetStockByWarehouseAsync();
        return Ok(result);
    }

    /// <summary>
    /// Kiểm tra serial đã tồn tại
    /// </summary>
    /// <param name="serial">Serial Number</param>
    /// <param name="excludeId">ID cần loại trừ (dùng khi update)</param>
    [HttpGet("check-serial")]
    [EndpointSummary("Kiểm tra Serial")]
    [EndpointDescription("Kiểm tra xem Serial Number đã tồn tại trong hệ thống chưa")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckSerialExists(
        [FromQuery] string serial,
        [FromQuery] Guid? excludeId = null)
    {
        var result = await _inventoryService.CheckSerialExistsAsync(serial, excludeId);
        return Ok(result);
    }

    #endregion
}
