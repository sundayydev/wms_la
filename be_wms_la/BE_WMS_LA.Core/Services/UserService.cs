using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Core.Repositories;
using BE_WMS_LA.Domain.Constants;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.Common;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.User;
using Isopoh.Cryptography.Argon2;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý người dùng
/// </summary>
public class UserService
{
    private readonly AppDbContext _context;
    private readonly UserRepository _userRepository;

    public UserService(AppDbContext context, UserRepository userRepository)
    {
        _context = context;
        _userRepository = userRepository;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách tất cả người dùng (có phân trang)
    /// </summary>
    public async Task<ApiResponse<List<UserListDto>>> GetAllAsync(
        int page = 1,
        int pageSize = 20,
        string? search = null,
        string? role = null,
        bool? isActive = null)
    {
        var query = _context.Users
            .Include(u => u.Warehouse)
            .Where(u => u.DeletedAt == null)
            .AsQueryable();

        // Lọc theo search
        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(u =>
                u.Username.ToLower().Contains(search) ||
                u.FullName.ToLower().Contains(search) ||
                u.Email.ToLower().Contains(search) ||
                u.PhoneNumber.Contains(search));
        }

        // Lọc theo role
        if (!string.IsNullOrEmpty(role))
        {
            query = query.Where(u => u.Role == role);
        }

        // Lọc theo trạng thái
        if (isActive.HasValue)
        {
            query = query.Where(u => u.IsActive == isActive.Value);
        }

        // Sắp xếp và phân trang
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new UserListDto
            {
                UserID = u.UserID,
                Username = u.Username,
                FullName = u.FullName,
                Email = u.Email,
                PhoneNumber = u.PhoneNumber,
                Role = u.Role,
                WarehouseName = u.Warehouse != null ? u.Warehouse.WarehouseName : null,
                IsActive = u.IsActive,
                IsLocked = u.IsLocked,
                LastLoginAt = u.LastLoginAt,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<UserListDto>>.SuccessResponse(users);
    }

    /// <summary>
    /// Lấy chi tiết người dùng theo ID
    /// </summary>
    public async Task<ApiResponse<UserDetailDto>> GetByIdAsync(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.Warehouse)
            .Include(u => u.UserPermissions)
                .ThenInclude(up => up.Permission)
            .FirstOrDefaultAsync(u => u.UserID == id && u.DeletedAt == null);

        if (user == null)
        {
            return ApiResponse<UserDetailDto>.ErrorResponse("Không tìm thấy người dùng");
        }

        var dto = MapToDetailDto(user);
        return ApiResponse<UserDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Tạo người dùng mới
    /// </summary>
    public async Task<ApiResponse<UserDetailDto>> CreateAsync(CreateUserDto dto)
    {
        // Kiểm tra username đã tồn tại
        var existingUser = await _userRepository.GetByUsernameAsync(dto.Username);
        if (existingUser != null)
        {
            return ApiResponse<UserDetailDto>.ErrorResponse("Tên đăng nhập đã tồn tại");
        }

        // Kiểm tra email đã tồn tại
        var existingEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.DeletedAt == null);
        if (existingEmail != null)
        {
            return ApiResponse<UserDetailDto>.ErrorResponse("Email đã được sử dụng");
        }

        // Tạo user mới
        var user = new User
        {
            UserID = Guid.NewGuid(),
            Username = dto.Username,
            Password = Argon2.Hash(dto.Password),
            FullName = dto.FullName,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            Address = dto.Address,
            Avatar = dto.Avatar,
            Role = dto.Role,
            WarehouseID = dto.WarehouseID,
            IsActive = dto.IsActive,
            IsLocked = false,
            FailedLoginAttempts = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Users.AddAsync(user);

        // Gán quyền mặc định theo role
        await AssignPermissionsByRoleAsync(user.UserID, dto.Role);

        await _context.SaveChangesAsync();

        return await GetByIdAsync(user.UserID);
    }

    /// <summary>
    /// Cập nhật người dùng
    /// </summary>
    public async Task<ApiResponse<UserDetailDto>> UpdateAsync(Guid id, UpdateUserDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == id && u.DeletedAt == null);
        if (user == null)
        {
            return ApiResponse<UserDetailDto>.ErrorResponse("Không tìm thấy người dùng");
        }

        // Kiểm tra email trùng lặp
        if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
        {
            var existingEmail = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.DeletedAt == null && u.UserID != id);
            if (existingEmail != null)
            {
                return ApiResponse<UserDetailDto>.ErrorResponse("Email đã được sử dụng");
            }
        }

        // Cập nhật thông tin
        if (!string.IsNullOrEmpty(dto.FullName)) user.FullName = dto.FullName;
        if (!string.IsNullOrEmpty(dto.Email)) user.Email = dto.Email;
        if (!string.IsNullOrEmpty(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber;
        if (dto.DateOfBirth.HasValue) user.DateOfBirth = dto.DateOfBirth;
        if (dto.Gender != null) user.Gender = dto.Gender;
        if (dto.Address != null) user.Address = dto.Address;
        if (dto.Avatar != null) user.Avatar = dto.Avatar;
        if (dto.WarehouseID.HasValue) user.WarehouseID = dto.WarehouseID;
        if (dto.IsActive.HasValue) user.IsActive = dto.IsActive.Value;

        // Cập nhật role và quyền nếu cần
        if (!string.IsNullOrEmpty(dto.Role) && dto.Role != user.Role)
        {
            user.Role = dto.Role;

            // Xóa quyền cũ và gán quyền mới theo role
            await AssignPermissionsByRoleAsync(user.UserID, dto.Role);
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return await GetByIdAsync(user.UserID);
    }

    /// <summary>
    /// Xóa người dùng (soft delete)
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == id);
        if (user == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy người dùng");
        }

        // Không cho xóa chính mình
        user.DeletedAt = DateTime.UtcNow;
        user.IsActive = false;
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Xóa người dùng thành công");
    }

    /// <summary>
    /// Khóa/mở khóa tài khoản
    /// </summary>
    public async Task<ApiResponse<bool>> ToggleLockAsync(Guid id, bool isLocked)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == id && u.DeletedAt == null);
        if (user == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy người dùng");
        }

        user.IsLocked = isLocked;
        if (!isLocked)
        {
            user.LockedUntil = null;
            user.FailedLoginAttempts = 0;
        }
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var message = isLocked ? "Khóa tài khoản thành công" : "Mở khóa tài khoản thành công";
        return ApiResponse<bool>.SuccessResponse(true, message);
    }

    /// <summary>
    /// Reset mật khẩu
    /// </summary>
    public async Task<ApiResponse<bool>> ResetPasswordAsync(Guid id, string newPassword)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.UserID == id && u.DeletedAt == null);
        if (user == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy người dùng");
        }

        user.Password = Argon2.Hash(newPassword);
        user.PasswordChangedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Reset mật khẩu thành công");
    }

    #endregion

    #region Permission Management

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
        foreach (var permissionId in permissionIds)
        {
            var permission = await _context.Permissions.FirstOrDefaultAsync(p => p.PermissionID == permissionId);
            if (permission != null)
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
        }

        await _context.SaveChangesAsync();
        return ApiResponse<bool>.SuccessResponse(true, "Gán quyền thành công");
    }

    /// <summary>
    /// Lấy danh sách quyền của người dùng
    /// </summary>
    public async Task<ApiResponse<List<string>>> GetUserPermissionsAsync(Guid userId)
    {
        var user = await _context.Users
            .Include(u => u.UserPermissions)
                .ThenInclude(up => up.Permission)
            .FirstOrDefaultAsync(u => u.UserID == userId && u.DeletedAt == null);

        if (user == null)
        {
            return ApiResponse<List<string>>.ErrorResponse("Không tìm thấy người dùng");
        }

        // Admin có tất cả quyền
        if (user.Role == UserRoles.Admin)
        {
            var allPermissions = SystemPermissions.GetAll();
            return ApiResponse<List<string>>.SuccessResponse(allPermissions);
        }

        var permissions = user.UserPermissions
            .Where(up => up.Permission != null && up.DeletedAt == null)
            .Select(up => up.Permission!.PermissionName)
            .ToList();

        return ApiResponse<List<string>>.SuccessResponse(permissions);
    }

    /// <summary>
    /// Gán quyền mặc định theo role cho người dùng
    /// Dựa theo tài liệu phân quyền RolePermission.md
    /// </summary>
    /// <param name="userId">ID người dùng</param>
    /// <param name="role">Vai trò (ADMIN, WAREHOUSE, RECEPTIONIST, TECHNICIAN)</param>
    private async Task AssignPermissionsByRoleAsync(Guid userId, string role)
    {
        // Xóa tất cả quyền hiện tại của user
        var currentPermissions = await _context.UserPermissions
            .Where(up => up.UserID == userId)
            .ToListAsync();
        _context.UserPermissions.RemoveRange(currentPermissions);

        // Lấy danh sách permission names theo role từ mapping
        var permissionNames = RolePermissionMapping.GetPermissionsByRole(role);

        if (permissionNames.Count == 0)
        {
            return;
        }

        // Lấy các permission từ database theo tên
        var permissions = await _context.Permissions
            .Where(p => permissionNames.Contains(p.PermissionName) && p.DeletedAt == null)
            .ToListAsync();

        // Gán quyền cho user
        foreach (var permission in permissions)
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
    }

    /// <summary>
    /// Gán tất cả quyền cho người dùng (dành cho Admin)
    /// </summary>
    private async Task AssignAllPermissionsToUser(Guid userId)
    {
        // Lấy tất cả permission từ database
        var allPermissions = await _context.Permissions
            .Where(p => p.DeletedAt == null)
            .ToListAsync();

        // Xóa quyền hiện tại
        var currentPermissions = await _context.UserPermissions
            .Where(up => up.UserID == userId)
            .ToListAsync();
        _context.UserPermissions.RemoveRange(currentPermissions);

        // Gán tất cả quyền
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
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê người dùng
    /// </summary>
    public async Task<ApiResponse<object>> GetStatisticsAsync()
    {
        var stats = new
        {
            Total = await _context.Users.CountAsync(u => u.DeletedAt == null),
            Active = await _context.Users.CountAsync(u => u.IsActive && u.DeletedAt == null),
            Inactive = await _context.Users.CountAsync(u => !u.IsActive && u.DeletedAt == null),
            Locked = await _context.Users.CountAsync(u => u.IsLocked && u.DeletedAt == null),
            ByRole = await _context.Users
                .Where(u => u.DeletedAt == null)
                .GroupBy(u => u.Role)
                .Select(g => new { Role = g.Key, Count = g.Count() })
                .ToListAsync()
        };

        return ApiResponse<object>.SuccessResponse(stats);
    }

    #endregion

    #region Private Methods

    private static UserDetailDto MapToDetailDto(User user)
    {
        return new UserDetailDto
        {
            UserID = user.UserID,
            Username = user.Username,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            DateOfBirth = user.DateOfBirth.HasValue
                ? user.DateOfBirth.Value.ToDateTime(TimeOnly.MinValue)
                : null,
            Gender = user.Gender,
            Address = user.Address,
            Avatar = user.Avatar,
            Role = user.Role,
            WarehouseID = user.WarehouseID,
            WarehouseName = user.Warehouse?.WarehouseName,
            IsActive = user.IsActive,
            IsLocked = user.IsLocked,
            LastLoginAt = user.LastLoginAt,
            LastLoginIP = user.LastLoginIP,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            Permissions = user.UserPermissions
                .Where(up => up.Permission != null && up.DeletedAt == null)
                .Select(up => up.Permission!.PermissionName)
                .ToList()
        };
    }

    #endregion
}
