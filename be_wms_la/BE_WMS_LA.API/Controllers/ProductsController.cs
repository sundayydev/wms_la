using System.Security.Claims;
using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Domain.Constants;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Product;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý sản phẩm
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly ProductService _productService;
    private readonly PermissionService _permissionService;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(
        ProductService productService,
        PermissionService permissionService,
        ILogger<ProductsController> logger)
    {
        _productService = productService;
        _permissionService = permissionService;
        _logger = logger;
    }

    #region Product CRUD

    /// <summary>
    /// Lấy danh sách sản phẩm
    /// </summary>
    /// <param name="page">Trang (mặc định 1)</param>
    /// <param name="pageSize">Số lượng mỗi trang (mặc định 20)</param>
    /// <param name="search">Tìm kiếm theo SKU, tên sản phẩm</param>
    /// <param name="categoryId">Lọc theo danh mục</param>
    /// <param name="isSerialized">Lọc theo loại quản lý (serial/số lượng)</param>
    [HttpGet]
    [EndpointSummary("Danh sách sản phẩm")]
    [EndpointDescription("Lấy danh sách sản phẩm có phân trang và bộ lọc")]
    [ProducesResponseType<ApiResponse<List<ProductListDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] bool? isSerialized = null)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductView))
        {
            return Forbid();
        }

        var result = await _productService.GetAllAsync(page, pageSize, search, categoryId, isSerialized);
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách sản phẩm cho dropdown
    /// </summary>
    [HttpGet("select")]
    [EndpointSummary("Danh sách sản phẩm cho dropdown")]
    [EndpointDescription("Lấy danh sách tất cả sản phẩm (dùng cho dropdown selector)")]
    [ProducesResponseType<ApiResponse<List<ProductListDto>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllForSelect()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Forbid();
        }

        var result = await _productService.GetAllForSelectAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết sản phẩm
    /// </summary>
    /// <param name="id">ID sản phẩm</param>
    [HttpGet("{id:guid}")]
    [EndpointSummary("Chi tiết sản phẩm")]
    [EndpointDescription("Lấy thông tin chi tiết của sản phẩm bao gồm danh sách biến thể")]
    [ProducesResponseType<ApiResponse<ProductDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductView))
        {
            return Forbid();
        }

        var result = await _productService.GetByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Tìm sản phẩm theo SKU
    /// </summary>
    /// <param name="sku">Mã SKU</param>
    [HttpGet("sku/{sku}")]
    [EndpointSummary("Tìm sản phẩm theo SKU")]
    [EndpointDescription("Tìm sản phẩm bằng mã SKU")]
    [ProducesResponseType<ApiResponse<ProductDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetBySKU(string sku)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductView))
        {
            return Forbid();
        }

        var result = await _productService.GetBySKUAsync(sku);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Tạo sản phẩm mới
    /// </summary>
    /// <param name="dto">Thông tin sản phẩm</param>
    [HttpPost]
    [EndpointSummary("Tạo sản phẩm")]
    [EndpointDescription("Tạo sản phẩm mới trong hệ thống")]
    [ProducesResponseType<ApiResponse<ProductDetailDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<ProductDetailDto>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateProductDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductCreate))
        {
            return Forbid();
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<ProductDetailDto>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("User {UserId} đang tạo sản phẩm mới: {SKU}", userId, dto.SKU);

        var result = await _productService.CreateAsync(dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        _logger.LogInformation("Đã tạo sản phẩm {SKU} thành công", dto.SKU);
        return CreatedAtAction(nameof(GetById), new { id = result.Data?.ComponentID }, result);
    }

    /// <summary>
    /// Cập nhật sản phẩm
    /// </summary>
    /// <param name="id">ID sản phẩm</param>
    /// <param name="dto">Thông tin cập nhật</param>
    [HttpPut("{id:guid}")]
    [EndpointSummary("Cập nhật sản phẩm")]
    [EndpointDescription("Cập nhật thông tin sản phẩm")]
    [ProducesResponseType<ApiResponse<ProductDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<ProductDetailDto>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductEdit))
        {
            return Forbid();
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<ProductDetailDto>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("User {UserId} đang cập nhật sản phẩm: {ProductId}", userId, id);

        var result = await _productService.UpdateAsync(id, dto);
        if (!result.Success)
        {
            if (result.Message.Contains("Không tìm thấy"))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa sản phẩm (soft delete)
    /// </summary>
    /// <param name="id">ID sản phẩm</param>
    [HttpDelete("{id:guid}")]
    [EndpointSummary("Xóa sản phẩm")]
    [EndpointDescription("Xóa sản phẩm (soft delete)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductDelete))
        {
            return Forbid();
        }

        _logger.LogInformation("User {UserId} đang xóa sản phẩm: {ProductId}", userId, id);

        var result = await _productService.DeleteAsync(id);
        if (!result.Success)
        {
            if (result.Message.Contains("Không tìm thấy"))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    #endregion

    #region Variant CRUD

    /// <summary>
    /// Tạo biến thể sản phẩm
    /// </summary>
    /// <param name="dto">Thông tin biến thể</param>
    [HttpPost("variants")]
    [EndpointSummary("Tạo biến thể")]
    [EndpointDescription("Tạo biến thể (Part Number) mới cho sản phẩm")]
    [ProducesResponseType<ApiResponse<ProductVariantDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<ProductVariantDto>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateVariant([FromBody] CreateVariantDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductCreate))
        {
            return Forbid();
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<ProductVariantDto>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("User {UserId} đang tạo biến thể mới: {PartNumber}", userId, dto.PartNumber);

        var result = await _productService.CreateVariantAsync(dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return CreatedAtAction(nameof(GetById), new { id = dto.ComponentID }, result);
    }

    /// <summary>
    /// Cập nhật biến thể
    /// </summary>
    /// <param name="variantId">ID biến thể</param>
    /// <param name="dto">Thông tin cập nhật</param>
    [HttpPut("variants/{variantId:guid}")]
    [EndpointSummary("Cập nhật biến thể")]
    [EndpointDescription("Cập nhật thông tin biến thể sản phẩm")]
    [ProducesResponseType<ApiResponse<ProductVariantDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<ProductVariantDto>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateVariant(Guid variantId, [FromBody] UpdateVariantDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductEdit))
        {
            return Forbid();
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<ProductVariantDto>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("User {UserId} đang cập nhật biến thể: {VariantId}", userId, variantId);

        var result = await _productService.UpdateVariantAsync(variantId, dto);
        if (!result.Success)
        {
            if (result.Message.Contains("Không tìm thấy"))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa biến thể (soft delete)
    /// </summary>
    /// <param name="variantId">ID biến thể</param>
    [HttpDelete("variants/{variantId:guid}")]
    [EndpointSummary("Xóa biến thể")]
    [EndpointDescription("Xóa biến thể sản phẩm (soft delete)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteVariant(Guid variantId)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductDelete))
        {
            return Forbid();
        }

        _logger.LogInformation("User {UserId} đang xóa biến thể: {VariantId}", userId, variantId);

        var result = await _productService.DeleteVariantAsync(variantId);
        if (!result.Success)
        {
            if (result.Message.Contains("Không tìm thấy"))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    #endregion

    #region Statistics & Validation

    /// <summary>
    /// Thống kê sản phẩm
    /// </summary>
    [HttpGet("statistics")]
    [EndpointSummary("Thống kê sản phẩm")]
    [EndpointDescription("Lấy thống kê về sản phẩm trong hệ thống")]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics()
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductView))
        {
            return Forbid();
        }

        var result = await _productService.GetStatisticsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Kiểm tra SKU đã tồn tại
    /// </summary>
    /// <param name="sku">Mã SKU</param>
    /// <param name="excludeId">ID cần loại trừ (dùng khi update)</param>
    [HttpGet("check-sku")]
    [EndpointSummary("Kiểm tra SKU")]
    [EndpointDescription("Kiểm tra xem mã SKU đã tồn tại trong hệ thống chưa")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckSKUExists(
        [FromQuery] string sku,
        [FromQuery] Guid? excludeId = null)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Forbid();
        }

        var result = await _productService.CheckSKUExistsAsync(sku, excludeId);
        return Ok(result);
    }

    /// <summary>
    /// Kiểm tra Part Number đã tồn tại
    /// </summary>
    /// <param name="partNumber">Mã Part Number</param>
    /// <param name="excludeId">ID cần loại trừ (dùng khi update)</param>
    [HttpGet("check-partnumber")]
    [EndpointSummary("Kiểm tra Part Number")]
    [EndpointDescription("Kiểm tra xem mã Part Number đã tồn tại trong hệ thống chưa")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckPartNumberExists(
        [FromQuery] string partNumber,
        [FromQuery] Guid? excludeId = null)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Forbid();
        }

        var result = await _productService.CheckPartNumberExistsAsync(partNumber, excludeId);
        return Ok(result);
    }

    #endregion

    #region Categories

    /// <summary>
    /// Lấy danh sách danh mục sản phẩm
    /// </summary>
    [HttpGet("categories")]
    [EndpointSummary("Danh sách danh mục")]
    [EndpointDescription("Lấy danh sách tất cả danh mục sản phẩm")]
    [ProducesResponseType<ApiResponse<List<CategoryDto>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetCategories()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Forbid();
        }

        var result = await _productService.GetCategoriesAsync();
        return Ok(result);
    }

    #endregion

    #region Compatible Products

    /// <summary>
    /// Lấy danh sách sản phẩm tương thích
    /// </summary>
    /// <param name="id">ID sản phẩm</param>
    [HttpGet("{id:guid}/compatible")]
    [EndpointSummary("Danh sách sản phẩm tương thích")]
    [EndpointDescription("Lấy danh sách các sản phẩm tương thích với sản phẩm này (VD: phụ kiện tương thích với thiết bị)")]
    [ProducesResponseType<ApiResponse<List<CompatibleProductDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCompatibleProducts(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductView))
        {
            return Forbid();
        }

        var result = await _productService.GetCompatibleProductsAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Thêm một sản phẩm vào danh sách tương thích
    /// </summary>
    /// <param name="id">ID sản phẩm gốc</param>
    /// <param name="request">Thông tin sản phẩm cần thêm</param>
    [HttpPost("{id:guid}/compatible")]
    [EndpointSummary("Thêm sản phẩm tương thích")]
    [EndpointDescription("Thêm một sản phẩm vào danh sách tương thích")]
    [ProducesResponseType<ApiResponse<List<CompatibleProductDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<List<CompatibleProductDto>>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddCompatibleProduct(Guid id, [FromBody] AddCompatibleProductRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductEdit))
        {
            return Forbid();
        }

        _logger.LogInformation("User {UserId} thêm sản phẩm tương thích {CompatibleId} vào {ProductId}",
            userId, request.ComponentID, id);

        var result = await _productService.AddCompatibleProductAsync(id, request.ComponentID);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Thêm nhiều sản phẩm vào danh sách tương thích
    /// </summary>
    /// <param name="id">ID sản phẩm gốc</param>
    /// <param name="request">Danh sách sản phẩm cần thêm</param>
    [HttpPost("{id:guid}/compatible/bulk")]
    [EndpointSummary("Thêm nhiều sản phẩm tương thích")]
    [EndpointDescription("Thêm nhiều sản phẩm vào danh sách tương thích cùng lúc")]
    [ProducesResponseType<ApiResponse<List<CompatibleProductDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<List<CompatibleProductDto>>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddCompatibleProducts(Guid id, [FromBody] AddCompatibleProductsRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductEdit))
        {
            return Forbid();
        }

        _logger.LogInformation("User {UserId} thêm {Count} sản phẩm tương thích vào {ProductId}",
            userId, request.ComponentIDs.Count, id);

        var result = await _productService.AddCompatibleProductsAsync(id, request.ComponentIDs);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Xóa một sản phẩm khỏi danh sách tương thích
    /// </summary>
    /// <param name="id">ID sản phẩm gốc</param>
    /// <param name="compatibleId">ID sản phẩm cần xóa</param>
    [HttpDelete("{id:guid}/compatible/{compatibleId:guid}")]
    [EndpointSummary("Xóa sản phẩm tương thích")]
    [EndpointDescription("Xóa một sản phẩm khỏi danh sách tương thích")]
    [ProducesResponseType<ApiResponse<List<CompatibleProductDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<List<CompatibleProductDto>>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RemoveCompatibleProduct(Guid id, Guid compatibleId)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductEdit))
        {
            return Forbid();
        }

        _logger.LogInformation("User {UserId} xóa sản phẩm tương thích {CompatibleId} khỏi {ProductId}",
            userId, compatibleId, id);

        var result = await _productService.RemoveCompatibleProductAsync(id, compatibleId);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Cập nhật toàn bộ danh sách sản phẩm tương thích
    /// </summary>
    /// <param name="id">ID sản phẩm gốc</param>
    /// <param name="request">Danh sách sản phẩm tương thích mới (thay thế hoàn toàn)</param>
    [HttpPut("{id:guid}/compatible")]
    [EndpointSummary("Cập nhật danh sách tương thích")]
    [EndpointDescription("Thay thế toàn bộ danh sách sản phẩm tương thích bằng danh sách mới")]
    [ProducesResponseType<ApiResponse<List<CompatibleProductDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<List<CompatibleProductDto>>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateCompatibleProducts(Guid id, [FromBody] UpdateCompatibleProductsRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.ProductEdit))
        {
            return Forbid();
        }

        _logger.LogInformation("User {UserId} cập nhật danh sách tương thích của {ProductId} với {Count} sản phẩm",
            userId, id, request.ComponentIDs.Count);

        var result = await _productService.UpdateCompatibleProductsAsync(id, request.ComponentIDs);
        if (!result.Success)
        {
            return BadRequest(result);
        }
        return Ok(result);
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
