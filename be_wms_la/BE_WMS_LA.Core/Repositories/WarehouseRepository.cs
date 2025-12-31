using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

/// <summary>
/// Repository cho Warehouse
/// </summary>
public class WarehouseRepository
{
    private readonly AppDbContext _context;

    public WarehouseRepository(AppDbContext context)
    {
        _context = context;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách tất cả kho (không bao gồm soft-deleted)
    /// </summary>
    public async Task<List<Warehouse>> GetAllAsync(bool includeInactive = false)
    {
        var query = _context.Warehouses
            .Include(w => w.Manager)
            .Include(w => w.Users)
            .Where(w => w.DeletedAt == null);

        if (!includeInactive)
        {
            query = query.Where(w => w.IsActive);
        }

        return await query
            .OrderByDescending(w => w.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy kho theo ID
    /// </summary>
    public async Task<Warehouse?> GetByIdAsync(Guid id)
    {
        return await _context.Warehouses
            .Include(w => w.Manager)
            .Include(w => w.Users)
            .FirstOrDefaultAsync(w => w.WarehouseID == id && w.DeletedAt == null);
    }

    /// <summary>
    /// Lấy kho theo tên
    /// </summary>
    public async Task<Warehouse?> GetByNameAsync(string name)
    {
        return await _context.Warehouses
            .FirstOrDefaultAsync(w => w.WarehouseName == name && w.DeletedAt == null);
    }

    /// <summary>
    /// Kiểm tra kho có tồn tại không (theo tên)
    /// </summary>
    public async Task<bool> ExistsByNameAsync(string name, Guid? excludeId = null)
    {
        var query = _context.Warehouses
            .Where(w => w.WarehouseName == name && w.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(w => w.WarehouseID != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Thêm kho mới
    /// </summary>
    public async Task<Warehouse> AddAsync(Warehouse warehouse)
    {
        warehouse.CreatedAt = DateTime.UtcNow;
        warehouse.UpdatedAt = DateTime.UtcNow;

        await _context.Warehouses.AddAsync(warehouse);
        await _context.SaveChangesAsync();

        return warehouse;
    }

    /// <summary>
    /// Cập nhật kho
    /// </summary>
    public async Task<Warehouse> UpdateAsync(Warehouse warehouse)
    {
        warehouse.UpdatedAt = DateTime.UtcNow;

        _context.Warehouses.Update(warehouse);
        await _context.SaveChangesAsync();

        return warehouse;
    }

    /// <summary>
    /// Xóa mềm kho
    /// </summary>
    public async Task<bool> SoftDeleteAsync(Guid id)
    {
        var warehouse = await GetByIdAsync(id);
        if (warehouse == null)
        {
            return false;
        }

        warehouse.DeletedAt = DateTime.UtcNow;
        warehouse.UpdatedAt = DateTime.UtcNow;
        warehouse.IsActive = false;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Khôi phục kho đã xóa
    /// </summary>
    public async Task<bool> RestoreAsync(Guid id)
    {
        var warehouse = await _context.Warehouses
            .FirstOrDefaultAsync(w => w.WarehouseID == id);

        if (warehouse == null)
        {
            return false;
        }

        warehouse.DeletedAt = null;
        warehouse.IsActive = true;
        warehouse.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Stock Operations

    /// <summary>
    /// Lấy tồn kho theo warehouse
    /// </summary>
    public async Task<List<WarehouseStock>> GetStockByWarehouseAsync(Guid warehouseId)
    {
        return await _context.WarehouseStocks
            .Include(ws => ws.Warehouse)
            .Include(ws => ws.Component)
            .Include(ws => ws.Variant)
            .Where(ws => ws.WarehouseID == warehouseId)
            .OrderBy(ws => ws.Component.SKU)
            .ToListAsync();
    }

    /// <summary>
    /// Tìm kiếm tồn kho
    /// </summary>
    public async Task<List<WarehouseStock>> SearchStockAsync(
        Guid warehouseId,
        string? searchTerm = null,
        bool? lowStock = null,
        int? minQuantity = null)
    {
        var query = _context.WarehouseStocks
            .Include(ws => ws.Warehouse)
            .Include(ws => ws.Component)
            .Include(ws => ws.Variant)
            .Where(ws => ws.WarehouseID == warehouseId);

        // Tìm kiếm theo SKU hoặc tên sản phẩm
        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(ws =>
                ws.Component.SKU.Contains(searchTerm) ||
                ws.Component.ComponentName.Contains(searchTerm) ||
                (ws.Variant != null && ws.Variant.PartNumber.Contains(searchTerm))
            );
        }

        // Lọc sản phẩm sắp hết hàng
        if (lowStock.HasValue && lowStock.Value)
        {
            query = query.Where(ws => ws.QuantityAvailable <= 10);
        }

        // Lọc theo số lượng tối thiểu
        if (minQuantity.HasValue)
        {
            query = query.Where(ws => ws.QuantityAvailable >= minQuantity.Value);
        }

        return await query
            .OrderBy(ws => ws.Component.SKU)
            .ToListAsync();
    }

    /// <summary>
    /// Đếm tổng số SKU trong kho
    /// </summary>
    public async Task<int> CountDistinctSKUsAsync(Guid warehouseId)
    {
        return await _context.WarehouseStocks
            .Where(ws => ws.WarehouseID == warehouseId)
            .Select(ws => ws.ComponentID)
            .Distinct()
            .CountAsync();
    }

    /// <summary>
    /// Đếm tổng số sản phẩm (bao gồm variants)
    /// </summary>
    public async Task<int> CountTotalProductsAsync(Guid warehouseId)
    {
        return await _context.WarehouseStocks
            .Where(ws => ws.WarehouseID == warehouseId)
            .CountAsync();
    }

    /// <summary>
    /// Tính tổng số lượng tồn kho
    /// </summary>
    public async Task<int> GetTotalQuantityAsync(Guid warehouseId)
    {
        return await _context.WarehouseStocks
            .Where(ws => ws.WarehouseID == warehouseId)
            .SumAsync(ws => ws.QuantityOnHand);
    }

    /// <summary>
    /// Tính tổng số lượng khả dụng
    /// </summary>
    public async Task<int> GetTotalAvailableAsync(Guid warehouseId)
    {
        var stocks = await _context.WarehouseStocks
            .Where(ws => ws.WarehouseID == warehouseId)
            .ToListAsync();

        return stocks.Sum(ws => ws.QuantityAvailable);
    }

    /// <summary>
    /// Tính tổng số lượng đã đặt trước
    /// </summary>
    public async Task<int> GetTotalReservedAsync(Guid warehouseId)
    {
        return await _context.WarehouseStocks
            .Where(ws => ws.WarehouseID == warehouseId)
            .SumAsync(ws => ws.QuantityReserved);
    }

    #endregion

    #region User Management

    /// <summary>
    /// Đếm số nhân viên trong kho
    /// </summary>
    public async Task<int> CountUsersAsync(Guid warehouseId)
    {
        return await _context.Users
            .Where(u => u.WarehouseID == warehouseId && u.DeletedAt == null)
            .CountAsync();
    }

    /// <summary>
    /// Lấy danh sách nhân viên trong kho
    /// </summary>
    public async Task<List<User>> GetUsersAsync(Guid warehouseId)
    {
        return await _context.Users
            .Where(u => u.WarehouseID == warehouseId && u.DeletedAt == null)
            .OrderBy(u => u.FullName)
            .ToListAsync();
    }

    #endregion
}
