using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.ProductInstance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý ProductInstance (Sản phẩm theo Serial/IMEI)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class ProductInstancesController : ControllerBase
{
    private readonly ProductInstanceService _productInstanceService;

    public ProductInstancesController(ProductInstanceService productInstanceService)
    {
        _productInstanceService = productInstanceService;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách ProductInstance có phân trang và lọc
    /// </summary>
    /// <param name="page">Trang hiện tại (mặc định: 1)</param>
    /// <param name="pageSize">Số lượng mỗi trang (mặc định: 20)</param>
    /// <param name="search">Từ khóa tìm kiếm (Serial, IMEI, SKU)</param>
    /// <param name="componentId">Lọc theo sản phẩm</param>
    /// <param name="warehouseId">Lọc theo kho</param>
    /// <param name="status">Lọc theo trạng thái</param>
    [HttpGet]
    [EndpointSummary("Danh sách ProductInstance")]
    [EndpointDescription("Lấy danh sách sản phẩm theo serial/IMEI với phân trang và bộ lọc")]
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
        var result = await _productInstanceService.GetAllAsync(
            page, pageSize, search, componentId, warehouseId, status);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết ProductInstance theo ID
    /// </summary>
    /// <param name="id">ID của ProductInstance</param>
    [HttpGet("{id:guid}")]
    [EndpointSummary("Chi tiết ProductInstance")]
    [EndpointDescription("Lấy thông tin chi tiết của một sản phẩm")]
    [ProducesResponseType<ApiResponse<ProductInstanceDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _productInstanceService.GetByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Tìm ProductInstance theo Serial Number
    /// </summary>
    /// <param name="serialNumber">Serial Number cần tìm</param>
    [HttpGet("serial/{serialNumber}")]
    [EndpointSummary("Tìm theo Serial Number")]
    [EndpointDescription("Tìm sản phẩm bằng Serial Number")]
    [ProducesResponseType<ApiResponse<ProductInstanceDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBySerial(string serialNumber)
    {
        var result = await _productInstanceService.GetBySerialAsync(serialNumber);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Cập nhật ProductInstance
    /// </summary>
    /// <param name="id">ID của ProductInstance</param>
    /// <param name="dto">Thông tin cập nhật</param>
    [HttpPut("{id:guid}")]
    [EndpointSummary("Cập nhật ProductInstance")]
    [EndpointDescription("Cập nhật thông tin sản phẩm (vị trí, trạng thái, giá...)")]
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

        var result = await _productInstanceService.UpdateAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Cập nhật trạng thái ProductInstance
    /// </summary>
    /// <param name="id">ID của ProductInstance</param>
    /// <param name="dto">Trạng thái mới</param>
    [HttpPatch("{id:guid}/status")]
    [EndpointSummary("Cập nhật trạng thái")]
    [EndpointDescription("Chuyển đổi trạng thái sản phẩm (IN_STOCK, SOLD, WARRANTY, REPAIR, BROKEN, etc.)")]
    [ProducesResponseType<ApiResponse<ProductInstanceDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateProductInstanceStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var result = await _productInstanceService.UpdateStatusAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa ProductInstance
    /// </summary>
    /// <param name="id">ID của ProductInstance</param>
    [HttpDelete("{id:guid}")]
    [EndpointSummary("Xóa ProductInstance")]
    [EndpointDescription("Xóa sản phẩm (chỉ khi chưa bán)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _productInstanceService.DeleteAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê ProductInstance
    /// </summary>
    [HttpGet("statistics")]
    [EndpointSummary("Thống kê ProductInstance")]
    [EndpointDescription("Lấy thống kê về sản phẩm theo serial: tổng số, đã bán, trong kho, bảo hành, sửa chữa...")]
    [ProducesResponseType<ApiResponse<ProductInstanceStatisticsDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics()
    {
        var result = await _productInstanceService.GetStatisticsAsync();
        return Ok(result);
    }

    #endregion

    #region History & Lifecycle

    /// <summary>
    /// Lấy lịch sử vòng đời của ProductInstance
    /// </summary>
    /// <param name="id">ID của ProductInstance</param>
    [HttpGet("{id:guid}/history")]
    [EndpointSummary("Lịch sử vòng đời")]
    [EndpointDescription("Lấy lịch sử đầy đủ về sản phẩm: nhập kho, chuyển kho, sửa chữa, bán hàng, thay đổi trạng thái...")]
    [ProducesResponseType<ApiResponse<ProductInstanceHistoryResponseDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetHistory(Guid id)
    {
        var result = await _productInstanceService.GetInstanceHistoryAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    #endregion
}
