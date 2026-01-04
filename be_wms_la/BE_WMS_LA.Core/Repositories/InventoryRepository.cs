using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

/// <summary>
/// Repository cho ProductInstance (Inventory) - xử lý data access
/// </summary>
public class InventoryRepository
{
    private readonly AppDbContext _context;

    public InventoryRepository(AppDbContext context)
    {
        _context = context;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách tồn kho với filter
    /// </summary>
    public async Task<List<ProductInstance>> GetAllAsync(
        string? search = null,
        Guid? componentId = null,
        Guid? warehouseId = null,
        string? status = null)
    {
        var query = _context.ProductInstances
            .Include(pi => pi.Component)
            .Include(pi => pi.Variant)
            .Include(pi => pi.Warehouse)
            .Where(pi => pi.DeletedAt == null)
            .AsQueryable();

        // Tìm kiếm theo từ khóa (serial, IMEI, SKU, tên)
        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(pi =>
                pi.SerialNumber.ToLower().Contains(search) ||
                (pi.IMEI1 != null && pi.IMEI1.Contains(search)) ||
                (pi.IMEI2 != null && pi.IMEI2.Contains(search)) ||
                pi.Component.SKU.ToLower().Contains(search) ||
                pi.Component.ComponentName.ToLower().Contains(search));
        }

        // Lọc theo sản phẩm
        if (componentId.HasValue)
        {
            query = query.Where(pi => pi.ComponentID == componentId.Value);
        }

        // Lọc theo kho
        if (warehouseId.HasValue)
        {
            query = query.Where(pi => pi.WarehouseID == warehouseId.Value);
        }

        // Lọc theo trạng thái
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(pi => pi.Status == status);
        }

        return await query
            .OrderByDescending(pi => pi.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy theo ID
    /// </summary>
    public async Task<ProductInstance?> GetByIdAsync(Guid id)
    {
        return await _context.ProductInstances
            .Include(pi => pi.Component)
            .Include(pi => pi.Variant)
            .Include(pi => pi.Warehouse)
            .FirstOrDefaultAsync(pi => pi.InstanceID == id && pi.DeletedAt == null);
    }

    /// <summary>
    /// Tìm theo Serial Number
    /// </summary>
    public async Task<ProductInstance?> GetBySerialAsync(string serial)
    {
        return await _context.ProductInstances
            .Include(pi => pi.Component)
            .Include(pi => pi.Variant)
            .Include(pi => pi.Warehouse)
            .FirstOrDefaultAsync(pi => pi.SerialNumber == serial && pi.DeletedAt == null);
    }

    /// <summary>
    /// Kiểm tra serial đã tồn tại
    /// </summary>
    public async Task<bool> ExistsBySerialAsync(string serial, Guid? excludeId = null)
    {
        var query = _context.ProductInstances
            .Where(pi => pi.SerialNumber == serial && pi.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(pi => pi.InstanceID != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Kiểm tra IMEI đã tồn tại
    /// </summary>
    public async Task<bool> ExistsByImeiAsync(string imei, Guid? excludeId = null)
    {
        var query = _context.ProductInstances
            .Where(pi => pi.IMEI1 == imei && pi.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(pi => pi.InstanceID != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Lấy danh sách serial đã tồn tại trong danh sách cho trước
    /// </summary>
    public async Task<List<string>> GetExistingSerialsAsync(List<string> serials)
    {
        return await _context.ProductInstances
            .Where(pi => serials.Contains(pi.SerialNumber) && pi.DeletedAt == null)
            .Select(pi => pi.SerialNumber)
            .ToListAsync();
    }

    /// <summary>
    /// Thêm mới
    /// </summary>
    public async Task<ProductInstance> AddAsync(ProductInstance instance)
    {
        instance.CreatedAt = DateTime.UtcNow;
        instance.UpdatedAt = DateTime.UtcNow;

        await _context.ProductInstances.AddAsync(instance);
        await _context.SaveChangesAsync();

        return instance;
    }

    /// <summary>
    /// Thêm nhiều
    /// </summary>
    public async Task<List<ProductInstance>> AddRangeAsync(List<ProductInstance> instances)
    {
        foreach (var instance in instances)
        {
            instance.CreatedAt = DateTime.UtcNow;
            instance.UpdatedAt = DateTime.UtcNow;
        }

        await _context.ProductInstances.AddRangeAsync(instances);
        await _context.SaveChangesAsync();

        return instances;
    }

    /// <summary>
    /// Cập nhật
    /// </summary>
    public async Task<ProductInstance> UpdateAsync(ProductInstance instance)
    {
        instance.UpdatedAt = DateTime.UtcNow;

        _context.ProductInstances.Update(instance);
        await _context.SaveChangesAsync();

        return instance;
    }

    /// <summary>
    /// Xóa mềm
    /// </summary>
    public async Task<bool> SoftDeleteAsync(Guid id)
    {
        var instance = await _context.ProductInstances
            .FirstOrDefaultAsync(pi => pi.InstanceID == id && pi.DeletedAt == null);

        if (instance == null)
        {
            return false;
        }

        instance.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Validation

    /// <summary>
    /// Kiểm tra Component tồn tại
    /// </summary>
    public async Task<Component?> GetComponentAsync(Guid componentId)
    {
        return await _context.Components
            .FirstOrDefaultAsync(c => c.ComponentID == componentId && c.DeletedAt == null);
    }

    /// <summary>
    /// Kiểm tra Warehouse tồn tại
    /// </summary>
    public async Task<bool> WarehouseExistsAsync(Guid warehouseId)
    {
        return await _context.Warehouses
            .AnyAsync(w => w.WarehouseID == warehouseId && w.DeletedAt == null);
    }

    /// <summary>
    /// Kiểm tra Variant tồn tại
    /// </summary>
    public async Task<bool> VariantExistsAsync(Guid variantId)
    {
        return await _context.ComponentVariants
            .AnyAsync(v => v.VariantID == variantId && v.DeletedAt == null);
    }

    /// <summary>
    /// Kiểm tra Customer tồn tại
    /// </summary>
    public async Task<Customer?> GetCustomerAsync(Guid customerId)
    {
        return await _context.Customers
            .FirstOrDefaultAsync(c => c.CustomerID == customerId && c.DeletedAt == null);
    }

    /// <summary>
    /// Lấy Warehouse
    /// </summary>
    public async Task<Warehouse?> GetWarehouseAsync(Guid warehouseId)
    {
        return await _context.Warehouses
            .FirstOrDefaultAsync(w => w.WarehouseID == warehouseId && w.DeletedAt == null);
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Đếm tổng số
    /// </summary>
    public async Task<int> CountAsync() =>
        await _context.ProductInstances.CountAsync(pi => pi.DeletedAt == null);

    /// <summary>
    /// Đếm theo trạng thái
    /// </summary>
    public async Task<int> CountByStatusAsync(string status) =>
        await _context.ProductInstances.CountAsync(pi => pi.DeletedAt == null && pi.Status == status);

    /// <summary>
    /// Tổng giá trị nhập
    /// </summary>
    public async Task<decimal> GetTotalImportValueAsync()
    {
        return await _context.ProductInstances
            .Where(pi => pi.DeletedAt == null && pi.ActualImportPrice.HasValue)
            .SumAsync(pi => pi.ActualImportPrice!.Value);
    }

    /// <summary>
    /// Tổng giá trị bán
    /// </summary>
    public async Task<decimal> GetTotalSoldValueAsync()
    {
        return await _context.ProductInstances
            .Where(pi => pi.DeletedAt == null && pi.Status == "SOLD" && pi.ActualSellPrice.HasValue)
            .SumAsync(pi => pi.ActualSellPrice!.Value);
    }

    /// <summary>
    /// Thống kê theo kho
    /// </summary>
    public async Task<List<(Guid WarehouseId, string WarehouseName, int TotalCount, int InStockCount, decimal TotalValue)>> GetStockByWarehouseAsync()
    {
        var result = await _context.ProductInstances
            .Where(pi => pi.DeletedAt == null && pi.WarehouseID != null)
            .Include(pi => pi.Warehouse)
            .GroupBy(pi => new { pi.WarehouseID, pi.Warehouse!.WarehouseName })
            .Select(g => new
            {
                WarehouseId = g.Key.WarehouseID!.Value,
                WarehouseName = g.Key.WarehouseName,
                TotalCount = g.Count(),
                InStockCount = g.Count(pi => pi.Status == "IN_STOCK"),
                TotalValue = g.Where(pi => pi.ActualImportPrice.HasValue).Sum(pi => pi.ActualImportPrice!.Value)
            })
            .OrderByDescending(x => x.TotalCount)
            .ToListAsync();

        return result.Select(x => (x.WarehouseId, x.WarehouseName, x.TotalCount, x.InStockCount, x.TotalValue)).ToList();
    }

    #endregion
}
