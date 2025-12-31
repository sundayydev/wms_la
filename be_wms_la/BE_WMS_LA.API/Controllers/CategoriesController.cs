using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.DTOs.Category;
using BE_WMS_LA.Shared.DTOs.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý danh mục sản phẩm
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize] // Yêu cầu đăng nhập cho tất cả endpoints
public class CategoriesController : ControllerBase
{
    private readonly CategoryService _categoryService;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(
        CategoryService categoryService,
        ILogger<CategoriesController> logger)
    {
        _categoryService = categoryService;
        _logger = logger;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách tất cả danh mục
    /// </summary>
    /// <param name="includeDeleted">Bao gồm danh mục đã xóa</param>
    /// <returns>Danh sách danh mục</returns>
    [HttpGet]
    [EndpointSummary("Lấy danh sách danh mục")]
    [EndpointDescription("Lấy danh sách tất cả danh mục sản phẩm trong hệ thống.")]
    [ProducesResponseType<ApiResponse<List<CategoryListDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<List<CategoryListDto>>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetAll([FromQuery] bool includeDeleted = false)
    {
        _logger.LogInformation("Getting all categories. IncludeDeleted: {IncludeDeleted}", includeDeleted);

        var result = await _categoryService.GetAllAsync(includeDeleted);

        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Lấy chi tiết danh mục theo ID
    /// </summary>
    /// <param name="id">ID của danh mục</param>
    /// <returns>Thông tin chi tiết danh mục</returns>
    [HttpGet("{id}")]
    [EndpointSummary("Chi tiết danh mục")]
    [EndpointDescription("Lấy thông tin chi tiết của một danh mục bao gồm số lượng sản phẩm.")]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetById(Guid id)
    {
        _logger.LogInformation("Getting category details for ID: {CategoryId}", id);

        var result = await _categoryService.GetByIdAsync(id);

        if (result.Success)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// Tạo danh mục mới
    /// </summary>
    /// <param name="dto">Thông tin danh mục mới</param>
    /// <returns>Thông tin danh mục vừa tạo</returns>
    [HttpPost]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Manager}")]
    [EndpointSummary("Tạo danh mục mới")]
    [EndpointDescription("Tạo danh mục sản phẩm mới trong hệ thống. Chỉ Admin và Manager mới có quyền.")]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateCategoryDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<CategoryDetailDto>.ErrorResponse(
                "Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("Creating new category: {CategoryName}", dto.CategoryName);

        var result = await _categoryService.CreateAsync(dto);

        if (result.Success)
        {
            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Data!.CategoryID },
                result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Cập nhật thông tin danh mục
    /// </summary>
    /// <param name="id">ID của danh mục</param>
    /// <param name="dto">Thông tin cập nhật</param>
    /// <returns>Thông tin danh mục sau khi cập nhật</returns>
    [HttpPut("{id}")]
    [Authorize(Roles = $"{UserRoles.Admin},{UserRoles.Manager}")]
    [EndpointSummary("Cập nhật danh mục")]
    [EndpointDescription("Cập nhật thông tin của một danh mục. Chỉ Admin và Manager mới có quyền.")]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ApiResponse<CategoryDetailDto>>(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<CategoryDetailDto>.ErrorResponse(
                "Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("Updating category ID: {CategoryId}", id);

        var result = await _categoryService.UpdateAsync(id, dto);

        if (result.Success)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    /// <summary>
    /// Xóa danh mục (soft delete)
    /// </summary>
    /// <param name="id">ID của danh mục</param>
    /// <returns>Kết quả xóa</returns>
    [HttpDelete("{id}")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Xóa danh mục")]
    [EndpointDescription("Xóa mềm một danh mục khỏi hệ thống. Chỉ Admin mới có quyền. Không thể xóa nếu còn sản phẩm.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(Guid id)
    {
        _logger.LogInformation("Deleting category ID: {CategoryId}", id);

        var result = await _categoryService.DeleteAsync(id);

        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    /// <summary>
    /// Khôi phục danh mục đã xóa
    /// </summary>
    /// <param name="id">ID của danh mục</param>
    /// <returns>Kết quả khôi phục</returns>
    [HttpPost("{id}/restore")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Khôi phục danh mục")]
    [EndpointDescription("Khôi phục danh mục đã bị xóa mềm. Chỉ Admin mới có quyền.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Restore(Guid id)
    {
        _logger.LogInformation("Restoring category ID: {CategoryId}", id);

        var result = await _categoryService.RestoreAsync(id);

        if (result.Success)
        {
            return Ok(result);
        }

        return NotFound(result);
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê danh mục
    /// </summary>
    /// <returns>Thống kê tổng quan về danh mục</returns>
    [HttpGet("statistics")]
    [EndpointSummary("Thống kê danh mục")]
    [EndpointDescription("Lấy thống kê tổng quan về danh mục sản phẩm.")]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetStatistics()
    {
        _logger.LogInformation("Getting category statistics");

        var result = await _categoryService.GetStatisticsAsync();

        if (result.Success)
        {
            return Ok(result);
        }

        return BadRequest(result);
    }

    #endregion

    #region Validation

    /// <summary>
    /// Kiểm tra tên danh mục đã tồn tại
    /// </summary>
    /// <param name="name">Tên danh mục cần kiểm tra</param>
    /// <param name="excludeId">ID danh mục cần loại trừ (khi cập nhật)</param>
    /// <returns>True nếu tên đã tồn tại</returns>
    [HttpGet("check-name")]
    [EndpointSummary("Kiểm tra tên danh mục")]
    [EndpointDescription("Kiểm tra xem tên danh mục đã tồn tại trong hệ thống chưa.")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CheckNameExists([FromQuery] string name, [FromQuery] Guid? excludeId = null)
    {
        _logger.LogInformation("Checking if category name exists: {Name}", name);

        var result = await _categoryService.CheckNameExistsAsync(name, excludeId);

        return Ok(result);
    }

    #endregion
}
