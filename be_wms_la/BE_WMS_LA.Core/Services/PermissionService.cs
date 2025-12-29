using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Constants;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Permission;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý quyền hệ thống
/// </summary>
public class PermissionService
{
    private readonly AppDbContext _context;

    public PermissionService(AppDbContext context)
    {
        _context = context;
    }

    #region Permission CRUD

    /// <summary>
    /// Lấy tất cả quyền
    /// </summary>
    public async Task<ApiResponse<List<PermissionDto>>> GetAllAsync()
    {
        var permissions = await _context.Permissions
            .Where(p => p.DeletedAt == null)
            .OrderBy(p => p.PermissionName)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return ApiResponse<List<PermissionDto>>.SuccessResponse(permissions);
    }

    /// <summary>
    /// Lấy quyền theo ID
    /// </summary>
    public async Task<ApiResponse<PermissionDto>> GetByIdAsync(Guid id)
    {
        var permission = await _context.Permissions
            .FirstOrDefaultAsync(p => p.PermissionID == id && p.DeletedAt == null);

        if (permission == null)
        {
            return ApiResponse<PermissionDto>.ErrorResponse("Không tìm thấy quyền");
        }

        return ApiResponse<PermissionDto>.SuccessResponse(MapToDto(permission));
    }

    /// <summary>
    /// Lấy quyền nhóm theo module
    /// </summary>
    public async Task<ApiResponse<List<PermissionGroupDto>>> GetGroupedByModuleAsync()
    {
        var permissions = await _context.Permissions
            .Where(p => p.DeletedAt == null)
            .OrderBy(p => p.PermissionName)
            .ToListAsync();

        var grouped = permissions
            .GroupBy(p => p.PermissionName.Split('.')[0])
            .Select(g => new PermissionGroupDto
            {
                Module = g.Key,
                Permissions = g.Select(p => MapToDto(p)).ToList()
            })
            .OrderBy(g => g.Module)
            .ToList();

        return ApiResponse<List<PermissionGroupDto>>.SuccessResponse(grouped);
    }

    /// <summary>
    /// Lấy danh sách tên module
    /// </summary>
    public async Task<ApiResponse<List<string>>> GetModulesAsync()
    {
        var modules = await _context.Permissions
            .Where(p => p.DeletedAt == null)
            .Select(p => p.PermissionName)
            .ToListAsync();

        var moduleNames = modules
            .Select(p => p.Split('.')[0])
            .Distinct()
            .OrderBy(m => m)
            .ToList();

        return ApiResponse<List<string>>.SuccessResponse(moduleNames);
    }

    /// <summary>
    /// Lấy quyền theo module
    /// </summary>
    public async Task<ApiResponse<List<PermissionDto>>> GetByModuleAsync(string module)
    {
        var permissions = await _context.Permissions
            .Where(p => p.DeletedAt == null && p.PermissionName.StartsWith(module + "."))
            .OrderBy(p => p.PermissionName)
            .Select(p => MapToDto(p))
            .ToListAsync();

        return ApiResponse<List<PermissionDto>>.SuccessResponse(permissions);
    }

    #endregion

    #region User Permission Management

    /// <summary>
    /// Lấy quyền của người dùng
    /// </summary>
    public async Task<ApiResponse<UserPermissionDto>> GetUserPermissionsAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.UserPermissions)
                .ThenInclude(up => up.Permission)
            .FirstOrDefaultAsync(u => u.UserID == userId && u.DeletedAt == null);

        if (user == null)
        {
            return ApiResponse<UserPermissionDto>.ErrorResponse("Không tìm thấy người dùng");
        }

        var isAdmin = user.Role == UserRoles.Admin;
        List<PermissionDto> permissions;

        if (isAdmin)
        {
            // Admin có tất cả quyền
            permissions = await _context.Permissions
                .Where(p => p.DeletedAt == null)
                .Select(p => MapToDto(p))
                .ToListAsync();
        }
        else
        {
            permissions = user.UserPermissions
                .Where(up => up.Permission != null && up.DeletedAt == null)
                .Select(up => MapToDto(up.Permission!))
                .ToList();
        }

        var dto = new UserPermissionDto
        {
            UserID = user.UserID,
            Username = user.Username,
            FullName = user.FullName,
            Role = user.Role,
            Permissions = permissions,
            IsAdmin = isAdmin
        };

        return ApiResponse<UserPermissionDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Gán quyền cho người dùng
    /// </summary>
    public async Task<ApiResponse<bool>> AssignPermissionsAsync(Guid userId, List<Guid> permissionIds)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId && u.DeletedAt == null);
        if (user == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy người dùng");
        }

        // Xóa tất cả quyền hiện tại
        var currentPermissions = await _context.UserPermissions
            .Where(up => up.UserID == userId)
            .ToListAsync();
        _context.UserPermissions.RemoveRange(currentPermissions);

        // Thêm quyền mới
        var validPermissions = await _context.Permissions
            .Where(p => permissionIds.Contains(p.PermissionID) && p.DeletedAt == null)
            .Select(p => p.PermissionID)
            .ToListAsync();

        foreach (var permissionId in validPermissions)
        {
            await _context.UserPermissions.AddAsync(new UserPermission
            {
                UserPermissionID = Guid.NewGuid(),
                UserID = userId,
                PermissionID = permissionId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, $"Đã gán {validPermissions.Count} quyền cho người dùng");
    }

    /// <summary>
    /// Thêm quyền cho người dùng (không xóa quyền cũ)
    /// </summary>
    public async Task<ApiResponse<bool>> AddPermissionsAsync(Guid userId, List<Guid> permissionIds)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId && u.DeletedAt == null);
        if (user == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy người dùng");
        }

        // Lấy các quyền đã có
        var existingPermissionIds = await _context.UserPermissions
            .Where(up => up.UserID == userId)
            .Select(up => up.PermissionID)
            .ToListAsync();

        // Lấy các quyền hợp lệ và chưa được gán
        var newPermissionIds = await _context.Permissions
            .Where(p => permissionIds.Contains(p.PermissionID)
                && p.DeletedAt == null
                && !existingPermissionIds.Contains(p.PermissionID))
            .Select(p => p.PermissionID)
            .ToListAsync();

        foreach (var permissionId in newPermissionIds)
        {
            await _context.UserPermissions.AddAsync(new UserPermission
            {
                UserPermissionID = Guid.NewGuid(),
                UserID = userId,
                PermissionID = permissionId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, $"Đã thêm {newPermissionIds.Count} quyền cho người dùng");
    }

    /// <summary>
    /// Xóa quyền của người dùng
    /// </summary>
    public async Task<ApiResponse<bool>> RemovePermissionsAsync(Guid userId, List<Guid> permissionIds)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId && u.DeletedAt == null);
        if (user == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy người dùng");
        }

        var permissionsToRemove = await _context.UserPermissions
            .Where(up => up.UserID == userId && permissionIds.Contains(up.PermissionID))
            .ToListAsync();

        _context.UserPermissions.RemoveRange(permissionsToRemove);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, $"Đã xóa {permissionsToRemove.Count} quyền của người dùng");
    }

    /// <summary>
    /// Gán tất cả quyền cho người dùng (thường dùng cho Admin)
    /// </summary>
    public async Task<ApiResponse<bool>> AssignAllPermissionsAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId && u.DeletedAt == null);
        if (user == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy người dùng");
        }

        // Xóa tất cả quyền hiện tại
        var currentPermissions = await _context.UserPermissions
            .Where(up => up.UserID == userId)
            .ToListAsync();
        _context.UserPermissions.RemoveRange(currentPermissions);

        // Lấy tất cả quyền
        var allPermissions = await _context.Permissions
            .Where(p => p.DeletedAt == null)
            .ToListAsync();

        // Gán tất cả
        foreach (var permission in allPermissions)
        {
            await _context.UserPermissions.AddAsync(new UserPermission
            {
                UserPermissionID = Guid.NewGuid(),
                UserID = userId,
                PermissionID = permission.PermissionID,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }

        await _context.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, $"Đã gán tất cả {allPermissions.Count} quyền cho người dùng");
    }

    /// <summary>
    /// Xóa tất cả quyền của người dùng
    /// </summary>
    public async Task<ApiResponse<bool>> RemoveAllPermissionsAsync(Guid userId)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == userId && u.DeletedAt == null);
        if (user == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy người dùng");
        }

        var currentPermissions = await _context.UserPermissions
            .Where(up => up.UserID == userId)
            .ToListAsync();

        _context.UserPermissions.RemoveRange(currentPermissions);
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, $"Đã xóa tất cả {currentPermissions.Count} quyền của người dùng");
    }

    #endregion

    #region Permission Check

    /// <summary>
    /// Kiểm tra người dùng có quyền không
    /// </summary>
    public async Task<bool> HasPermissionAsync(Guid userId, string permissionName)
    {
        var user = await _context.Users
            .Include(u => u.UserPermissions)
                .ThenInclude(up => up.Permission)
            .FirstOrDefaultAsync(u => u.UserID == userId && u.DeletedAt == null);

        if (user == null) return false;

        // Admin có tất cả quyền
        if (user.Role == UserRoles.Admin) return true;

        // Kiểm tra quyền All.Permissions
        if (user.UserPermissions.Any(up =>
            up.Permission != null &&
            up.Permission.PermissionName == SystemPermissions.AllPermissions &&
            up.DeletedAt == null))
        {
            return true;
        }

        // Kiểm tra quyền cụ thể
        return user.UserPermissions.Any(up =>
            up.Permission != null &&
            up.Permission.PermissionName == permissionName &&
            up.DeletedAt == null);
    }

    /// <summary>
    /// Kiểm tra người dùng có một trong các quyền không
    /// </summary>
    public async Task<bool> HasAnyPermissionAsync(Guid userId, params string[] permissionNames)
    {
        var user = await _context.Users
            .Include(u => u.UserPermissions)
                .ThenInclude(up => up.Permission)
            .FirstOrDefaultAsync(u => u.UserID == userId && u.DeletedAt == null);

        if (user == null) return false;

        // Admin có tất cả quyền
        if (user.Role == UserRoles.Admin) return true;

        // Kiểm tra quyền All.Permissions
        if (user.UserPermissions.Any(up =>
            up.Permission != null &&
            up.Permission.PermissionName == SystemPermissions.AllPermissions &&
            up.DeletedAt == null))
        {
            return true;
        }

        // Kiểm tra các quyền cụ thể
        return user.UserPermissions.Any(up =>
            up.Permission != null &&
            permissionNames.Contains(up.Permission.PermissionName) &&
            up.DeletedAt == null);
    }

    #endregion

    #region Sync Permissions

    /// <summary>
    /// Đồng bộ quyền từ SystemPermissions vào database
    /// </summary>
    public async Task<ApiResponse<int>> SyncPermissionsAsync()
    {
        var systemPermissions = SystemPermissions.GetAll();
        var existingPermissions = await _context.Permissions.ToListAsync();
        var existingNames = existingPermissions.Select(p => p.PermissionName).ToHashSet();

        var newCount = 0;

        foreach (var permissionName in systemPermissions)
        {
            if (!existingNames.Contains(permissionName))
            {
                await _context.Permissions.AddAsync(new Permission
                {
                    PermissionID = GenerateDeterministicGuid(permissionName),
                    PermissionName = permissionName,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
                newCount++;
            }
        }

        if (newCount > 0)
        {
            await _context.SaveChangesAsync();
        }

        return ApiResponse<int>.SuccessResponse(newCount, $"Đã thêm {newCount} quyền mới vào database");
    }

    #endregion

    #region Private Methods

    private static PermissionDto MapToDto(Permission permission)
    {
        var parts = permission.PermissionName.Split('.');
        return new PermissionDto
        {
            PermissionID = permission.PermissionID,
            PermissionName = permission.PermissionName,
            Module = parts.Length > 0 ? parts[0] : string.Empty,
            Action = parts.Length > 1 ? parts[1] : string.Empty,
            CreatedAt = permission.CreatedAt
        };
    }

    private static Guid GenerateDeterministicGuid(string input)
    {
        using var md5 = System.Security.Cryptography.MD5.Create();
        var hash = md5.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input));
        return new Guid(hash);
    }

    #endregion
}
