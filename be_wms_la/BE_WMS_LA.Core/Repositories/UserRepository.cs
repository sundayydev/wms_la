using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

public class UserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lấy User theo id
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns> 
    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .Include(u => u.Warehouse)
            .FirstOrDefaultAsync(u => u.UserID == id);
    }

    /// <summary>
    /// Lấy User theo username
    /// </summary>
    /// <param name="username"></param>
    /// <returns></returns> 
    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    /// <summary>
    /// Lấy tất cả User
    /// </summary>
    /// <returns>List<User></returns> 
    public async Task<List<User>> GetAllAsync()
    {
        return await _context.Users.ToListAsync();
    }

    /// <summary>
    /// Thêm User
    /// </summary>
    /// <param name="user"></param>
    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Cập nhật User
    /// </summary>
    /// <param name="user"></param>
    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Xóa User
    /// </summary>
    /// <param name="user"></param>
    /// <returns></returns> 
    public async Task DeleteAsync(User user)
    {
        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Lấy danh sách permission names của user
    /// </summary>
    /// <param name="userId">ID của user</param>
    /// <returns>Danh sách tên permission</returns>
    public async Task<List<string>> GetUserPermissionsAsync(Guid userId)
    {
        return await _context.UserPermissions
            .Where(up => up.UserID == userId)
            .Select(up => up.Permission!.PermissionName)
            .ToListAsync();
    }
}
