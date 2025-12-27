using System.Security.Claims;
using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Domain.Constants;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý người dùng
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly UserService _userService;
    private readonly PermissionService _permissionService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        UserService userService, 
        PermissionService permissionService,
        ILogger<UsersController> logger)
    {
        _userService = userService;
        _permissionService = permissionService;
        _logger = logger;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách người dùng
    /// </summary>
    /// <param name="page">Trang (mặc định 1)</param>
    /// <param name="pageSize">Số lượng mỗi trang (mặc định 20)</param>
    /// <param name="search">Tìm kiếm theo tên, email, SĐT</param>
    /// <param name="role">Lọc theo vai trò</param>
    /// <param name="isActive">Lọc theo trạng thái</param>
    [HttpGet]
    [EndpointSummary("Danh sách người dùng")]
    [EndpointDescription("Lấy danh sách người dùng có phân trang và bộ lọc")]
    [ProducesResponseType<ApiResponse<List<UserListDto>>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? search = null,
        [FromQuery] string? role = null,
        [FromQuery] bool? isActive = null)
    {
        // Kiểm tra quyền
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.UserView))
        {
            return Forbid();
        }

        var result = await _userService.GetAllAsync(page, pageSize, search, role, isActive);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết người dùng
    /// </summary>
    /// <param name="id">ID người dùng</param>
    [HttpGet("{id:guid}")]
    [EndpointSummary("Chi tiết người dùng")]
    [EndpointDescription("Lấy thông tin chi tiết của một người dùng")]
    [ProducesResponseType<ApiResponse<UserDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.UserView))
        {
            return Forbid();
        }

        var result = await _userService.GetByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Tạo người dùng mới
    /// </summary>
    /// <param name="dto">Thông tin người dùng</param>
    [HttpPost]
    [EndpointSummary("Tạo người dùng")]
    [EndpointDescription("Tạo người dùng mới trong hệ thống")]
    [ProducesResponseType<ApiResponse<UserDetailDto>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<UserDetailDto>>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.UserCreate))
        {
            return Forbid();
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<UserDetailDto>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("Admin {AdminId} đang tạo người dùng mới: {Username}", userId, dto.Username);

        var result = await _userService.CreateAsync(dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        _logger.LogInformation("Đã tạo người dùng {Username} thành công", dto.Username);
        return CreatedAtAction(nameof(GetById), new { id = result.Data?.UserID }, result);
    }

    /// <summary>
    /// Cập nhật người dùng
    /// </summary>
    /// <param name="id">ID người dùng</param>
    /// <param name="dto">Thông tin cập nhật</param>
    [HttpPut("{id:guid}")]
    [EndpointSummary("Cập nhật người dùng")]
    [EndpointDescription("Cập nhật thông tin người dùng")]
    [ProducesResponseType<ApiResponse<UserDetailDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<UserDetailDto>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateUserDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.UserEdit))
        {
            return Forbid();
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(ApiResponse<UserDetailDto>.ErrorResponse("Dữ liệu không hợp lệ", errors));
        }

        _logger.LogInformation("Admin {AdminId} đang cập nhật người dùng: {UserId}", userId, id);

        var result = await _userService.UpdateAsync(id, dto);
        if (!result.Success)
        {
            if (result.Message.Contains("Không tìm thấy"))
                return NotFound(result);
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa người dùng (soft delete)
    /// </summary>
    /// <param name="id">ID người dùng</param>
    [HttpDelete("{id:guid}")]
    [EndpointSummary("Xóa người dùng")]
    [EndpointDescription("Xóa người dùng (soft delete)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.UserDelete))
        {
            return Forbid();
        }

        // Không cho xóa chính mình
        if (userId == id)
        {
            return BadRequest(ApiResponse<bool>.ErrorResponse("Không thể xóa tài khoản của chính mình"));
        }

        _logger.LogInformation("Admin {AdminId} đang xóa người dùng: {UserId}", userId, id);

        var result = await _userService.DeleteAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    #endregion

    #region Account Management

    /// <summary>
    /// Khóa/mở khóa tài khoản
    /// </summary>
    /// <param name="id">ID người dùng</param>
    /// <param name="isLocked">true = khóa, false = mở khóa</param>
    [HttpPatch("{id:guid}/lock")]
    [EndpointSummary("Khóa/mở khóa tài khoản")]
    [EndpointDescription("Khóa hoặc mở khóa tài khoản người dùng")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ToggleLock(Guid id, [FromQuery] bool isLocked)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.UserEdit))
        {
            return Forbid();
        }

        // Không cho khóa chính mình
        if (userId == id)
        {
            return BadRequest(ApiResponse<bool>.ErrorResponse("Không thể khóa tài khoản của chính mình"));
        }

        _logger.LogInformation("Admin {AdminId} đang {Action} tài khoản: {UserId}", 
            userId, isLocked ? "khóa" : "mở khóa", id);

        var result = await _userService.ToggleLockAsync(id, isLocked);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Reset mật khẩu người dùng
    /// </summary>
    /// <param name="id">ID người dùng</param>
    /// <param name="request">Mật khẩu mới</param>
    [HttpPatch("{id:guid}/reset-password")]
    [EndpointSummary("Reset mật khẩu")]
    [EndpointDescription("Reset mật khẩu cho người dùng")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.UserEdit))
        {
            return Forbid();
        }

        if (string.IsNullOrEmpty(request.NewPassword) || request.NewPassword.Length < 6)
        {
            return BadRequest(ApiResponse<bool>.ErrorResponse("Mật khẩu phải có ít nhất 6 ký tự"));
        }

        _logger.LogInformation("Admin {AdminId} đang reset mật khẩu cho: {UserId}", userId, id);

        var result = await _userService.ResetPasswordAsync(id, request.NewPassword);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    #endregion

    #region Permission Management

    /// <summary>
    /// Gán quyền cho người dùng
    /// </summary>
    /// <param name="id">ID người dùng</param>
    /// <param name="dto">Danh sách ID quyền</param>
    [HttpPut("{id:guid}/permissions")]
    [EndpointSummary("Gán quyền cho người dùng")]
    [EndpointDescription("Gán danh sách quyền cho người dùng (thay thế quyền cũ)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignPermissions(Guid id, [FromBody] AssignPermissionsDto dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.UserAssignPermission))
        {
            return Forbid();
        }

        _logger.LogInformation("Admin {AdminId} đang gán quyền cho: {UserId}", userId, id);

        var result = await _permissionService.AssignPermissionsAsync(id, dto.PermissionIDs);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Lấy quyền của người dùng
    /// </summary>
    /// <param name="id">ID người dùng</param>
    [HttpGet("{id:guid}/permissions")]
    [EndpointSummary("Lấy quyền của người dùng")]
    [EndpointDescription("Lấy danh sách quyền của người dùng")]
    [ProducesResponseType<ApiResponse<List<string>>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserPermissions(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.UserView))
        {
            return Forbid();
        }

        var result = await _userService.GetUserPermissionsAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Gán tất cả quyền cho người dùng
    /// </summary>
    /// <param name="id">ID người dùng</param>
    [HttpPost("{id:guid}/permissions/all")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Gán tất cả quyền")]
    [EndpointDescription("Gán tất cả quyền cho người dùng (chỉ Admin)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignAllPermissions(Guid id)
    {
        var userId = GetCurrentUserId();
        _logger.LogInformation("Admin {AdminId} đang gán tất cả quyền cho: {UserId}", userId, id);

        var result = await _permissionService.AssignAllPermissionsAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Xóa tất cả quyền của người dùng
    /// </summary>
    /// <param name="id">ID người dùng</param>
    [HttpDelete("{id:guid}/permissions")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Xóa tất cả quyền")]
    [EndpointDescription("Xóa tất cả quyền của người dùng (chỉ Admin)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveAllPermissions(Guid id)
    {
        var userId = GetCurrentUserId();
        _logger.LogInformation("Admin {AdminId} đang xóa tất cả quyền của: {UserId}", userId, id);

        var result = await _permissionService.RemoveAllPermissionsAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê người dùng
    /// </summary>
    [HttpGet("statistics")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Thống kê người dùng")]
    [EndpointDescription("Lấy thống kê về người dùng trong hệ thống")]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatistics()
    {
        var result = await _userService.GetStatisticsAsync();
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

        // Kiểm tra role Admin
        var role = User.FindFirst("role")?.Value;
        if (role == UserRoles.Admin) return true;

        return await _permissionService.HasPermissionAsync(userId.Value, permissionName);
    }

    #endregion
}

/// <summary>
/// Request reset mật khẩu
/// </summary>
public class ResetPasswordRequest
{
    /// <summary>
    /// Mật khẩu mới
    /// </summary>
    public string NewPassword { get; set; } = string.Empty;
}
