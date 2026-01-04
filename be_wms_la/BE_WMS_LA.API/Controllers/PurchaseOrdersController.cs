using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.PurchaseOrder;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý đơn mua hàng (nhập kho từ NCC)
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class PurchaseOrdersController : ControllerBase
{
    private readonly PurchaseOrderService _purchaseOrderService;

    public PurchaseOrdersController(PurchaseOrderService purchaseOrderService)
    {
        _purchaseOrderService = purchaseOrderService;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách đơn mua hàng có phân trang và lọc
    /// </summary>
    /// <param name="page">Trang hiện tại (mặc định: 1)</param>
    /// <param name="pageSize">Số lượng mỗi trang (mặc định: 20)</param>
    /// <param name="search">Từ khóa tìm kiếm (mã đơn, tên NCC)</param>
    /// <param name="supplierId">Lọc theo nhà cung cấp</param>
    /// <param name="warehouseId">Lọc theo kho</param>
    /// <param name="status">Trạng thái: PENDING, CONFIRMED, DELIVERED, CANCELLED</param>
    /// <param name="fromDate">Từ ngày</param>
    /// <param name="toDate">Đến ngày</param>
    [HttpGet]
    [EndpointSummary("Danh sách đơn mua hàng")]
    [EndpointDescription("Lấy danh sách đơn mua hàng có phân trang và bộ lọc")]
    [ProducesResponseType<ApiResponse<List<PurchaseOrderListDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] Guid? warehouseId = null,
        [FromQuery] string? status = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await _purchaseOrderService.GetAllAsync(
            page, pageSize, search, supplierId, warehouseId, status, fromDate, toDate);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết đơn mua hàng theo ID
    /// </summary>
    /// <param name="id">ID đơn mua hàng</param>
    [HttpGet("{id:guid}")]
    [EndpointSummary("Chi tiết đơn mua hàng")]
    [EndpointDescription("Lấy thông tin chi tiết của một đơn mua hàng")]
    [ProducesResponseType<ApiResponse<PurchaseOrderDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _purchaseOrderService.GetByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Tìm đơn mua hàng theo mã
    /// </summary>
    /// <param name="code">Mã đơn mua hàng</param>
    [HttpGet("code/{code}")]
    [EndpointSummary("Tìm đơn mua hàng theo mã")]
    [EndpointDescription("Tìm đơn mua hàng bằng mã đơn hàng")]
    [ProducesResponseType<ApiResponse<PurchaseOrderDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCode(string code)
    {
        var result = await _purchaseOrderService.GetByCodeAsync(code);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Tạo đơn mua hàng mới
    /// </summary>
    /// <param name="dto">Thông tin đơn mua hàng</param>
    [HttpPost]
    [EndpointSummary("Tạo đơn mua hàng")]
    [EndpointDescription("Tạo đơn mua hàng mới trong hệ thống")]
    [ProducesResponseType<ApiResponse<PurchaseOrderDetailDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePurchaseOrderDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        // Lấy user ID từ claims
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        Guid? userId = null;
        if (Guid.TryParse(userIdClaim, out var parsedUserId))
        {
            userId = parsedUserId;
        }

        var result = await _purchaseOrderService.CreateAsync(dto, userId);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.PurchaseOrderID }, result);
    }

    /// <summary>
    /// Cập nhật đơn mua hàng (chỉ khi PENDING)
    /// </summary>
    /// <param name="id">ID đơn mua hàng</param>
    /// <param name="dto">Thông tin cập nhật</param>
    [HttpPut("{id:guid}")]
    [EndpointSummary("Cập nhật đơn mua hàng")]
    [EndpointDescription("Cập nhật thông tin đơn mua hàng (chỉ khi trạng thái PENDING)")]
    [ProducesResponseType<ApiResponse<PurchaseOrderDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePurchaseOrderDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var result = await _purchaseOrderService.UpdateAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa đơn mua hàng (chỉ khi PENDING hoặc CANCELLED)
    /// </summary>
    /// <param name="id">ID đơn mua hàng</param>
    [HttpDelete("{id:guid}")]
    [EndpointSummary("Xóa đơn mua hàng")]
    [EndpointDescription("Xóa đơn mua hàng (chỉ khi trạng thái PENDING hoặc CANCELLED)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _purchaseOrderService.DeleteAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    #endregion

    #region Status Management

    /// <summary>
    /// Cập nhật trạng thái đơn mua hàng
    /// </summary>
    /// <remarks>
    /// Các trạng thái hợp lệ:
    /// - PENDING -> CONFIRMED, CANCELLED
    /// - CONFIRMED -> DELIVERED, CANCELLED
    /// </remarks>
    [HttpPatch("{id:guid}/status")]
    [EndpointSummary("Cập nhật trạng thái đơn mua hàng")]
    [EndpointDescription("Chuyển đổi trạng thái đơn mua hàng theo quy tắc: PENDING -> CONFIRMED/CANCELLED, CONFIRMED -> DELIVERED/CANCELLED")]
    [ProducesResponseType<ApiResponse<PurchaseOrderDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdatePurchaseOrderStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var result = await _purchaseOrderService.UpdateStatusAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xác nhận đơn mua hàng
    /// </summary>
    /// <param name="id">ID đơn mua hàng</param>
    [HttpPost("{id:guid}/confirm")]
    [EndpointSummary("Xác nhận đơn mua hàng")]
    [EndpointDescription("Xác nhận đơn mua hàng (chuyển từ PENDING sang CONFIRMED)")]
    [ProducesResponseType<ApiResponse<PurchaseOrderDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Confirm(Guid id)
    {
        var dto = new UpdatePurchaseOrderStatusDto { Status = "CONFIRMED" };
        var result = await _purchaseOrderService.UpdateStatusAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Hủy đơn mua hàng
    /// </summary>
    /// <param name="id">ID đơn mua hàng</param>
    /// <param name="reason">Lý do hủy đơn (tùy chọn)</param>
    [HttpPost("{id:guid}/cancel")]
    [EndpointSummary("Hủy đơn mua hàng")]
    [EndpointDescription("Hủy đơn mua hàng (chuyển sang trạng thái CANCELLED)")]
    [ProducesResponseType<ApiResponse<PurchaseOrderDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] string? reason = null)
    {
        var dto = new UpdatePurchaseOrderStatusDto
        {
            Status = "CANCELLED",
            Notes = reason
        };
        var result = await _purchaseOrderService.UpdateStatusAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Đánh dấu đã giao hàng
    /// </summary>
    /// <param name="id">ID đơn mua hàng</param>
    /// <param name="deliveryDate">Ngày giao hàng thực tế (mặc định: ngày hiện tại)</param>
    [HttpPost("{id:guid}/deliver")]
    [EndpointSummary("Đánh dấu đã giao hàng")]
    [EndpointDescription("Đánh dấu đơn mua hàng đã giao hàng (chuyển sang trạng thái DELIVERED)")]
    [ProducesResponseType<ApiResponse<PurchaseOrderDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> MarkAsDelivered(Guid id, [FromQuery] DateOnly? deliveryDate = null)
    {
        var dto = new UpdatePurchaseOrderStatusDto
        {
            Status = "DELIVERED",
            ActualDeliveryDate = deliveryDate ?? DateOnly.FromDateTime(DateTime.UtcNow)
        };
        var result = await _purchaseOrderService.UpdateStatusAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê đơn mua hàng
    /// </summary>
    [HttpGet("statistics")]
    [EndpointSummary("Thống kê đơn mua hàng")]
    [EndpointDescription("Lấy thống kê về đơn mua hàng trong hệ thống")]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics()
    {
        var result = await _purchaseOrderService.GetStatisticsAsync();
        return Ok(result);
    }

    #endregion
}
