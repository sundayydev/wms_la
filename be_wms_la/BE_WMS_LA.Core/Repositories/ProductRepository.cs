using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

/// <summary>
/// Repository cho Product/Component
/// </summary>
public class ProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách sản phẩm với filter
    /// </summary>
    public async Task<List<Component>> GetAllAsync(
        string? search = null,
        Guid? categoryId = null,
        Guid? supplierId = null)
    {
        var query = _context.Components
            .Include(c => c.Category)
            .Include(c => c.Variants)
            .Include(c => c.Supplier)
            .Where(c => c.DeletedAt == null)
            .AsQueryable();

        // Lọc theo từ khóa tìm kiếm
        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(c =>
                c.SKU.ToLower().Contains(search) ||
                c.ComponentName.ToLower().Contains(search));
        }

        // Lọc theo danh mục
        if (categoryId.HasValue)
        {
            query = query.Where(c => c.CategoryID == categoryId.Value);
        }

        // Lọc theo nhà cung cấp (Manufacturer)
        if (supplierId.HasValue)
        {
            query = query.Where(c => c.SupplierID == supplierId.Value);
        }

        return await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy sản phẩm theo ID
    /// </summary>
    public async Task<Component?> GetByIdAsync(Guid id)
    {
        return await _context.Components
            .Include(c => c.Category)
            .Include(c => c.Variants)
            .Include(c => c.Supplier)
            .FirstOrDefaultAsync(c => c.ComponentID == id && c.DeletedAt == null);
    }

    /// <summary>
    /// Lấy sản phẩm theo SKU
    /// </summary>
    public async Task<Component?> GetBySKUAsync(string sku)
    {
        return await _context.Components
            .Include(c => c.Category)
            .Include(c => c.Variants)
            .Include(c => c.Supplier)
            .FirstOrDefaultAsync(c => c.SKU == sku && c.DeletedAt == null);
    }

    /// <summary>
    /// Kiểm tra SKU đã tồn tại
    /// </summary>
    public async Task<bool> ExistsBySKUAsync(string sku, Guid? excludeId = null)
    {
        var query = _context.Components
            .Where(c => c.SKU == sku && c.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.ComponentID != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Thêm sản phẩm mới
    /// </summary>
    public async Task<Component> AddAsync(Component component)
    {
        component.CreatedAt = DateTime.UtcNow;
        component.UpdatedAt = DateTime.UtcNow;

        await _context.Components.AddAsync(component);
        await _context.SaveChangesAsync();

        return component;
    }

    /// <summary>
    /// Cập nhật sản phẩm
    /// </summary>
    public async Task<Component> UpdateAsync(Component component)
    {
        component.UpdatedAt = DateTime.UtcNow;

        _context.Components.Update(component);
        await _context.SaveChangesAsync();

        return component;
    }

    /// <summary>
    /// Xóa mềm sản phẩm
    /// </summary>
    public async Task<bool> SoftDeleteAsync(Guid id)
    {
        var component = await GetByIdAsync(id);
        if (component == null)
        {
            return false;
        }

        component.DeletedAt = DateTime.UtcNow;
        component.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Khôi phục sản phẩm đã xóa
    /// </summary>
    public async Task<bool> RestoreAsync(Guid id)
    {
        var component = await _context.Components
            .FirstOrDefaultAsync(c => c.ComponentID == id);

        if (component == null)
        {
            return false;
        }

        component.DeletedAt = null;
        component.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Đếm tổng số sản phẩm
    /// </summary>
    public async Task<int> CountAsync(bool includeDeleted = false)
    {
        var query = _context.Components.AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(c => c.DeletedAt == null);
        }

        return await query.CountAsync();
    }

    /// <summary>
    /// Đếm số sản phẩm theo danh mục
    /// </summary>
    public async Task<int> CountByCategoryAsync(Guid categoryId)
    {
        return await _context.Components
            .CountAsync(c => c.CategoryID == categoryId && c.DeletedAt == null);
    }

    /// <summary>
    /// Đếm số sản phẩm theo nhà sản xuất (Manufacturer)
    /// </summary>
    public async Task<int> CountBySupplierAsync(Guid supplierId)
    {
        return await _context.Components
            .CountAsync(c => c.SupplierID == supplierId && c.DeletedAt == null);
    }

    /// <summary>
    /// Thống kê sản phẩm theo danh mục
    /// </summary>
    public async Task<List<(string CategoryName, int Count)>> GetProductsByCategoryAsync()
    {
        return await _context.Components
            .Include(c => c.Category)
            .Where(c => c.DeletedAt == null)
            .GroupBy(c => c.Category!.CategoryName)
            .Select(g => new ValueTuple<string, int>(g.Key, g.Count()))
            .OrderByDescending(x => x.Item2)
            .ToListAsync();
    }

    /// <summary>
    /// Đếm sản phẩm mới trong khoảng thời gian
    /// </summary>
    public async Task<int> CountRecentlyAddedAsync(int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);
        return await _context.Components
            .Where(c => c.DeletedAt == null && c.CreatedAt >= startDate)
            .CountAsync();
    }

    #endregion

    #region Variants

    /// <summary>
    /// Lấy variants của sản phẩm
    /// </summary>
    public async Task<List<ComponentVariant>> GetVariantsAsync(Guid componentId)
    {
        return await _context.ComponentVariants
            .Where(v => v.ComponentID == componentId && v.DeletedAt == null)
            .OrderBy(v => v.PartNumber)
            .ToListAsync();
    }

    /// <summary>
    /// Đếm variants của sản phẩm
    /// </summary>
    public async Task<int> CountVariantsAsync(Guid componentId)
    {
        return await _context.ComponentVariants
            .CountAsync(v => v.ComponentID == componentId && v.DeletedAt == null);
    }

    #endregion

    #region Inventory

    /// <summary>
    /// Kiểm tra sản phẩm có tồn kho không
    /// </summary>
    public async Task<bool> HasInventoryAsync(Guid componentId)
    {
        return await _context.WarehouseStocks
            .AnyAsync(ws => ws.ComponentID == componentId && ws.QuantityOnHand > 0);
    }

    /// <summary>
    /// Lấy tổng tồn kho của sản phẩm
    /// </summary>
    public async Task<int> GetTotalStockAsync(Guid componentId)
    {
        return await _context.WarehouseStocks
            .Where(ws => ws.ComponentID == componentId)
            .SumAsync(ws => ws.QuantityOnHand);
    }

    #endregion
}
