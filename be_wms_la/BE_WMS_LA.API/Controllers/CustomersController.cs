using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Customer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý khách hàng
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly CustomerService _customerService;

    public CustomersController(CustomerService customerService)
    {
        _customerService = customerService;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách khách hàng có phân trang và lọc
    /// </summary>
    /// <param name="page">Trang hiện tại (mặc định: 1)</param>
    /// <param name="pageSize">Số lượng mỗi trang (mặc định: 20)</param>
    /// <param name="search">Từ khóa tìm kiếm (mã, tên, SĐT, email)</param>
    /// <param name="type">Loại khách hàng: INDIVIDUAL, COMPANY</param>
    /// <param name="customerGroup">Nhóm: RETAIL, WHOLESALE, VIP</param>
    /// <param name="isActive">Trạng thái hoạt động</param>
    [HttpGet]
    [EndpointSummary("Danh sách khách hàng")]
    [EndpointDescription("Lấy danh sách khách hàng có phân trang và bộ lọc")]
    [ProducesResponseType<ApiResponse<List<CustomerListDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? type = null,
        [FromQuery] string? customerGroup = null,
        [FromQuery] bool? isActive = null)
    {
        var result = await _customerService.GetAllAsync(page, pageSize, search, type, customerGroup, isActive);
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách khách hàng cho dropdown (chỉ khách đang hoạt động)
    /// </summary>
    [HttpGet("select")]
    [EndpointSummary("Danh sách khách hàng cho dropdown")]
    [EndpointDescription("Lấy danh sách tất cả khách hàng đang hoạt động (dùng cho dropdown selector)")]
    [ProducesResponseType<ApiResponse<List<CustomerListDto>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllForSelect()
    {
        var result = await _customerService.GetAllForSelectAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết khách hàng theo ID
    /// </summary>
    /// <param name="id">ID khách hàng</param>
    [HttpGet("{id:guid}")]
    [EndpointSummary("Chi tiết khách hàng")]
    [EndpointDescription("Lấy thông tin chi tiết của một khách hàng")]
    [ProducesResponseType<ApiResponse<CustomerDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _customerService.GetByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Tìm khách hàng theo mã
    /// </summary>
    /// <param name="code">Mã khách hàng</param>
    [HttpGet("code/{code}")]
    [EndpointSummary("Tìm khách hàng theo mã")]
    [EndpointDescription("Tìm khách hàng bằng mã khách hàng")]
    [ProducesResponseType<ApiResponse<CustomerDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByCode(string code)
    {
        var result = await _customerService.GetByCodeAsync(code);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Tạo khách hàng mới
    /// </summary>
    /// <param name="dto">Thông tin khách hàng</param>
    [HttpPost]
    [EndpointSummary("Tạo khách hàng")]
    [EndpointDescription("Tạo khách hàng mới trong hệ thống")]
    [ProducesResponseType<ApiResponse<CustomerDetailDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateCustomerDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var result = await _customerService.CreateAsync(dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { id = result.Data!.CustomerID }, result);
    }

    /// <summary>
    /// Cập nhật khách hàng
    /// </summary>
    /// <param name="id">ID khách hàng</param>
    /// <param name="dto">Thông tin cập nhật</param>
    [HttpPut("{id:guid}")]
    [EndpointSummary("Cập nhật khách hàng")]
    [EndpointDescription("Cập nhật thông tin khách hàng")]
    [ProducesResponseType<ApiResponse<CustomerDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCustomerDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<object>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        var result = await _customerService.UpdateAsync(id, dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa khách hàng (soft delete)
    /// </summary>
    /// <param name="id">ID khách hàng</param>
    [HttpDelete("{id:guid}")]
    [EndpointSummary("Xóa khách hàng")]
    [EndpointDescription("Xóa khách hàng (soft delete)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _customerService.DeleteAsync(id);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    #endregion

    #region Status Management

    /// <summary>
    /// Bật/tắt trạng thái hoạt động
    /// </summary>
    /// <param name="id">ID khách hàng</param>
    /// <param name="isActive">true = kích hoạt, false = vô hiệu hóa</param>
    [HttpPatch("{id:guid}/status")]
    [EndpointSummary("Kích hoạt/vô hiệu hóa khách hàng")]
    [EndpointDescription("Thay đổi trạng thái hoạt động của khách hàng")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleStatus(Guid id, [FromQuery] bool isActive)
    {
        var result = await _customerService.ToggleStatusAsync(id, isActive);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    #endregion

    #region Statistics & Validation

    /// <summary>
    /// Thống kê khách hàng
    /// </summary>
    [HttpGet("statistics")]
    [EndpointSummary("Thống kê khách hàng")]
    [EndpointDescription("Lấy thống kê về khách hàng trong hệ thống")]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics()
    {
        var result = await _customerService.GetStatisticsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Kiểm tra mã khách hàng đã tồn tại
    /// </summary>
    /// <param name="code">Mã khách hàng</param>
    /// <param name="excludeId">ID cần loại trừ (dùng khi update)</param>
    [HttpGet("check-code")]
    [EndpointSummary("Kiểm tra mã khách hàng")]
    [EndpointDescription("Kiểm tra xem mã khách hàng đã tồn tại trong hệ thống chưa")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckCodeExists(
        [FromQuery] string code,
        [FromQuery] Guid? excludeId = null)
    {
        var result = await _customerService.CheckCodeExistsAsync(code, excludeId);
        return Ok(result);
    }

    #endregion
}
