using System.Security.Claims;
using BE_WMS_LA.Core.Services;
using BE_WMS_LA.Domain.Constants;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Permission;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BE_WMS_LA.API.Controllers;

/// <summary>
/// Controller quản lý quyền hệ thống
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly PermissionService _permissionService;
    private readonly ILogger<PermissionsController> _logger;

    public PermissionsController(
        PermissionService permissionService,
        ILogger<PermissionsController> logger)
    {
        _permissionService = permissionService;
        _logger = logger;
    }

    #region Permission List

    /// <summary>
    /// Lấy tất cả quyền
    /// </summary>
    [HttpGet]
    [EndpointSummary("Danh sách quyền")]
    [EndpointDescription("Lấy danh sách tất cả quyền trong hệ thống")]
    [ProducesResponseType<ApiResponse<List<PermissionDto>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.RoleView))
        {
            return Forbid();
        }

        var result = await _permissionService.GetAllAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy quyền theo ID
    /// </summary>
    /// <param name="id">ID quyền</param>
    [HttpGet("{id:guid}")]
    [EndpointSummary("Chi tiết quyền")]
    [EndpointDescription("Lấy thông tin chi tiết của một quyền")]
    [ProducesResponseType<ApiResponse<PermissionDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.RoleView))
        {
            return Forbid();
        }

        var result = await _permissionService.GetByIdAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Lấy quyền nhóm theo module
    /// </summary>
    [HttpGet("grouped")]
    [EndpointSummary("Quyền nhóm theo module")]
    [EndpointDescription("Lấy danh sách quyền được nhóm theo module")]
    [ProducesResponseType<ApiResponse<List<PermissionGroupDto>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetGrouped()
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.RoleView))
        {
            return Forbid();
        }

        var result = await _permissionService.GetGroupedByModuleAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy danh sách module
    /// </summary>
    [HttpGet("modules")]
    [EndpointSummary("Danh sách module")]
    [EndpointDescription("Lấy danh sách tên các module quyền")]
    [ProducesResponseType<ApiResponse<List<string>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetModules()
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.RoleView))
        {
            return Forbid();
        }

        var result = await _permissionService.GetModulesAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy quyền theo module
    /// </summary>
    /// <param name="module">Tên module</param>
    [HttpGet("module/{module}")]
    [EndpointSummary("Quyền theo module")]
    [EndpointDescription("Lấy danh sách quyền thuộc một module cụ thể")]
    [ProducesResponseType<ApiResponse<List<PermissionDto>>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByModule(string module)
    {
        var userId = GetCurrentUserId();
        if (userId == null || !await HasPermission(SystemPermissions.RoleView))
        {
            return Forbid();
        }

        var result = await _permissionService.GetByModuleAsync(module);
        return Ok(result);
    }

    #endregion

    #region User Permissions

    /// <summary>
    /// Lấy quyền của người dùng
    /// </summary>
    /// <param name="userId">ID người dùng</param>
    [HttpGet("user/{userId:guid}")]
    [EndpointSummary("Quyền của người dùng")]
    [EndpointDescription("Lấy danh sách quyền của một người dùng cụ thể")]
    [ProducesResponseType<ApiResponse<UserPermissionDto>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserPermissions(Guid userId)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null || !await HasPermission(SystemPermissions.UserView))
        {
            return Forbid();
        }

        var result = await _permissionService.GetUserPermissionsAsync(userId);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Gán quyền cho người dùng
    /// </summary>
    /// <param name="userId">ID người dùng</param>
    /// <param name="permissionIds">Danh sách ID quyền</param>
    [HttpPut("user/{userId:guid}")]
    [EndpointSummary("Gán quyền cho người dùng")]
    [EndpointDescription("Gán danh sách quyền cho người dùng (thay thế quyền cũ)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignPermissions(Guid userId, [FromBody] List<Guid> permissionIds)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null || !await HasPermission(SystemPermissions.UserAssignPermission))
        {
            return Forbid();
        }

        _logger.LogInformation("User {AdminId} đang gán quyền cho: {UserId}", currentUserId, userId);

        var result = await _permissionService.AssignPermissionsAsync(userId, permissionIds);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Thêm quyền cho người dùng
    /// </summary>
    /// <param name="userId">ID người dùng</param>
    /// <param name="permissionIds">Danh sách ID quyền cần thêm</param>
    [HttpPost("user/{userId:guid}/add")]
    [EndpointSummary("Thêm quyền cho người dùng")]
    [EndpointDescription("Thêm quyền mới cho người dùng (không xóa quyền cũ)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddPermissions(Guid userId, [FromBody] List<Guid> permissionIds)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null || !await HasPermission(SystemPermissions.UserAssignPermission))
        {
            return Forbid();
        }

        _logger.LogInformation("User {AdminId} đang thêm quyền cho: {UserId}", currentUserId, userId);

        var result = await _permissionService.AddPermissionsAsync(userId, permissionIds);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Xóa quyền của người dùng
    /// </summary>
    /// <param name="userId">ID người dùng</param>
    /// <param name="permissionIds">Danh sách ID quyền cần xóa</param>
    [HttpPost("user/{userId:guid}/remove")]
    [EndpointSummary("Xóa quyền của người dùng")]
    [EndpointDescription("Xóa một số quyền của người dùng")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemovePermissions(Guid userId, [FromBody] List<Guid> permissionIds)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId == null || !await HasPermission(SystemPermissions.UserAssignPermission))
        {
            return Forbid();
        }

        _logger.LogInformation("User {AdminId} đang xóa quyền của: {UserId}", currentUserId, userId);

        var result = await _permissionService.RemovePermissionsAsync(userId, permissionIds);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Gán tất cả quyền cho người dùng
    /// </summary>
    /// <param name="userId">ID người dùng</param>
    [HttpPost("user/{userId:guid}/all")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Gán tất cả quyền")]
    [EndpointDescription("Gán tất cả quyền cho người dùng (chỉ Admin)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AssignAllPermissions(Guid userId)
    {
        var currentUserId = GetCurrentUserId();
        _logger.LogInformation("Admin {AdminId} đang gán tất cả quyền cho: {UserId}", currentUserId, userId);

        var result = await _permissionService.AssignAllPermissionsAsync(userId);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    /// <summary>
    /// Xóa tất cả quyền của người dùng
    /// </summary>
    /// <param name="userId">ID người dùng</param>
    [HttpDelete("user/{userId:guid}/all")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Xóa tất cả quyền")]
    [EndpointDescription("Xóa tất cả quyền của người dùng (chỉ Admin)")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveAllPermissions(Guid userId)
    {
        var currentUserId = GetCurrentUserId();
        _logger.LogInformation("Admin {AdminId} đang xóa tất cả quyền của: {UserId}", currentUserId, userId);

        var result = await _permissionService.RemoveAllPermissionsAsync(userId);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    #endregion

    #region My Permissions

    /// <summary>
    /// Lấy quyền của tôi
    /// </summary>
    [HttpGet("me")]
    [EndpointSummary("Quyền của tôi")]
    [EndpointDescription("Lấy danh sách quyền của người dùng hiện tại")]
    [ProducesResponseType<ApiResponse<UserPermissionDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyPermissions()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var result = await _permissionService.GetUserPermissionsAsync(userId.Value);
        return Ok(result);
    }

    /// <summary>
    /// Kiểm tra quyền của tôi
    /// </summary>
    /// <param name="permissionName">Tên quyền cần kiểm tra</param>
    [HttpGet("me/check")]
    [EndpointSummary("Kiểm tra quyền")]
    [EndpointDescription("Kiểm tra xem người dùng hiện tại có quyền cụ thể không")]
    [ProducesResponseType<ApiResponse<bool>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> CheckMyPermission([FromQuery] string permissionName)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var hasPermission = await _permissionService.HasPermissionAsync(userId.Value, permissionName);
        return Ok(ApiResponse<bool>.SuccessResponse(hasPermission));
    }

    #endregion

    #region Admin Operations

    /// <summary>
    /// Đồng bộ quyền từ code vào database
    /// </summary>
    [HttpPost("sync")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Đồng bộ quyền")]
    [EndpointDescription("Đồng bộ quyền từ SystemPermissions vào database (chỉ Admin)")]
    [ProducesResponseType<ApiResponse<int>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> SyncPermissions()
    {
        var userId = GetCurrentUserId();
        _logger.LogInformation("Admin {AdminId} đang đồng bộ quyền", userId);

        var result = await _permissionService.SyncPermissionsAsync();
        return Ok(result);
    }

    /// <summary>
    /// Lấy tất cả quyền từ SystemPermissions
    /// </summary>
    [HttpGet("system")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Quyền hệ thống")]
    [EndpointDescription("Lấy danh sách tất cả quyền được định nghĩa trong SystemPermissions")]
    [ProducesResponseType<ApiResponse<List<string>>>(StatusCodes.Status200OK)]
    public IActionResult GetSystemPermissions()
    {
        var permissions = SystemPermissions.GetAll();
        return Ok(ApiResponse<List<string>>.SuccessResponse(permissions));
    }

    /// <summary>
    /// Lấy quyền hệ thống theo module
    /// </summary>
    /// <param name="module">Tên module</param>
    [HttpGet("system/module/{module}")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Quyền hệ thống theo module")]
    [EndpointDescription("Lấy danh sách quyền hệ thống theo module")]
    [ProducesResponseType<ApiResponse<List<string>>>(StatusCodes.Status200OK)]
    public IActionResult GetSystemPermissionsByModule(string module)
    {
        var permissions = SystemPermissions.GetByModule(module);
        return Ok(ApiResponse<List<string>>.SuccessResponse(permissions));
    }

    /// <summary>
    /// Lấy danh sách module hệ thống
    /// </summary>
    [HttpGet("system/modules")]
    [Authorize(Roles = UserRoles.Admin)]
    [EndpointSummary("Module hệ thống")]
    [EndpointDescription("Lấy danh sách tất cả module quyền từ SystemPermissions")]
    [ProducesResponseType<ApiResponse<List<string>>>(StatusCodes.Status200OK)]
    public IActionResult GetSystemModules()
    {
        var modules = SystemPermissions.GetAllModules();
        return Ok(ApiResponse<List<string>>.SuccessResponse(modules));
    }

    /// <summary>
    /// Lấy danh sách tất cả roles
    /// </summary>
    [HttpGet("roles")]
    [EndpointSummary("Danh sách roles")]
    [EndpointDescription("Lấy danh sách tất cả vai trò trong hệ thống")]
    [ProducesResponseType<ApiResponse<List<string>>>(StatusCodes.Status200OK)]
    public IActionResult GetAllRoles()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Forbid();
        }

        var roles = RolePermissionMapping.GetAllRoles();
        return Ok(ApiResponse<List<string>>.SuccessResponse(roles));
    }

    /// <summary>
    /// Lấy quyền mặc định theo role
    /// </summary>
    /// <param name="role">Tên vai trò</param>
    [HttpGet("roles/{role}/permissions")]
    [EndpointSummary("Quyền mặc định theo role")]
    [EndpointDescription("Lấy danh sách quyền mặc định của một vai trò")]
    [ProducesResponseType<ApiResponse<List<string>>>(StatusCodes.Status200OK)]
    public IActionResult GetPermissionsByRole(string role)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Forbid();
        }

        if (!RolePermissionMapping.IsValidRole(role))
        {
            return BadRequest(ApiResponse<List<string>>.ErrorResponse($"Vai trò '{role}' không hợp lệ"));
        }

        var permissions = RolePermissionMapping.GetPermissionsByRole(role);
        return Ok(ApiResponse<List<string>>.SuccessResponse(permissions));
    }

    /// <summary>
    /// Lấy toàn bộ mapping quyền theo role
    /// </summary>
    [HttpGet("roles/mappings")]
    [EndpointSummary("Mapping quyền theo role")]
    [EndpointDescription("Lấy toàn bộ mapping quyền mặc định của tất cả vai trò")]
    [ProducesResponseType<ApiResponse<Dictionary<string, List<string>>>>(StatusCodes.Status200OK)]
    public IActionResult GetAllRolePermissionMappings()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Forbid();
        }

        var mappings = new Dictionary<string, List<string>>();
        foreach (var role in RolePermissionMapping.GetAllRoles())
        {
            mappings[role] = RolePermissionMapping.GetPermissionsByRole(role);
        }

        return Ok(ApiResponse<Dictionary<string, List<string>>>.SuccessResponse(mappings));
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
