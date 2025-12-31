using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

/// <summary>
/// Repository cho Category
/// </summary>
public class CategoryRepository
{
    private readonly AppDbContext _context;

    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách tất cả danh mục (không bao gồm soft-deleted)
    /// </summary>
    public async Task<List<Category>> GetAllAsync(bool includeDeleted = false)
    {
        var query = _context.Categories
            .Include(c => c.Components)
            .AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(c => c.DeletedAt == null);
        }

        return await query
            .OrderBy(c => c.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy danh mục theo ID
    /// </summary>
    public async Task<Category?> GetByIdAsync(Guid id)
    {
        return await _context.Categories
            .Include(c => c.Components)
            .FirstOrDefaultAsync(c => c.CategoryID == id && c.DeletedAt == null);
    }

    /// <summary>
    /// Lấy danh mục theo tên
    /// </summary>
    public async Task<Category?> GetByNameAsync(string name)
    {
        return await _context.Categories
            .FirstOrDefaultAsync(c => c.CategoryName == name && c.DeletedAt == null);
    }

    /// <summary>
    /// Kiểm tra danh mục có tồn tại không (theo tên)
    /// </summary>
    public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null)
    {
        var query = _context.Categories
            .Where(c => c.CategoryName == name && c.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.CategoryID != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Thêm danh mục mới
    /// </summary>
    public async Task<Category> AddAsync(Category category)
    {
        category.CreatedAt = DateTime.UtcNow;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();

        return category;
    }

    /// <summary>
    /// Cập nhật danh mục
    /// </summary>
    public async Task<Category> UpdateAsync(Category category)
    {
        category.UpdatedAt = DateTime.UtcNow;

        _context.Categories.Update(category);
        await _context.SaveChangesAsync();

        return category;
    }

    /// <summary>
    /// Xóa mềm danh mục
    /// </summary>
    public async Task<bool> SoftDeleteAsync(Guid id)
    {
        var category = await GetByIdAsync(id);
        if (category == null)
        {
            return false;
        }

        category.DeletedAt = DateTime.UtcNow;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Khôi phục danh mục đã xóa
    /// </summary>
    public async Task<bool> RestoreAsync(Guid id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.CategoryID == id);

        if (category == null)
        {
            return false;
        }

        category.DeletedAt = null;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Đếm số lượng danh mục
    /// </summary>
    public async Task<int> CountAsync(bool includeDeleted = false)
    {
        var query = _context.Categories.AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(c => c.DeletedAt == null);
        }

        return await query.CountAsync();
    }

    /// <summary>
    /// Đếm danh mục có sản phẩm
    /// </summary>
    public async Task<int> CountWithComponentsAsync()
    {
        return await _context.Categories
            .Where(c => c.DeletedAt == null && c.Components.Any(comp => comp.DeletedAt == null))
            .CountAsync();
    }

    /// <summary>
    /// Đếm danh mục trống
    /// </summary>
    public async Task<int> CountEmptyAsync()
    {
        return await _context.Categories
            .Where(c => c.DeletedAt == null && !c.Components.Any(comp => comp.DeletedAt == null))
            .CountAsync();
    }

    /// <summary>
    /// Lấy top danh mục có nhiều sản phẩm nhất
    /// </summary>
    public async Task<List<Category>> GetTopCategoriesByComponentCountAsync(int top = 5)
    {
        return await _context.Categories
            .Include(c => c.Components)
            .Where(c => c.DeletedAt == null)
            .OrderByDescending(c => c.Components.Count(comp => comp.DeletedAt == null))
            .Take(top)
            .ToListAsync();
    }

    #endregion

    #region Component Management

    /// <summary>
    /// Đếm số sản phẩm trong danh mục
    /// </summary>
    public async Task<int> CountComponentsAsync(Guid categoryId)
    {
        return await _context.Components
            .Where(c => c.CategoryID == categoryId && c.DeletedAt == null)
            .CountAsync();
    }

    /// <summary>
    /// Kiểm tra danh mục có sản phẩm không
    /// </summary>
    public async Task<bool> HasComponentsAsync(Guid categoryId)
    {
        return await _context.Components
            .AnyAsync(c => c.CategoryID == categoryId && c.DeletedAt == null);
    }

    #endregion
}
