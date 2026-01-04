using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

/// <summary>
/// Repository cho PurchaseOrder - xử lý data access
/// </summary>
public class PurchaseOrderRepository
{
    private readonly AppDbContext _context;

    public PurchaseOrderRepository(AppDbContext context)
    {
        _context = context;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách đơn mua hàng với filter
    /// </summary>
    public async Task<List<PurchaseOrder>> GetAllAsync(
        string? search = null,
        Guid? supplierId = null,
        Guid? warehouseId = null,
        string? status = null,
        DateTime? fromDate = null,
        DateTime? toDate = null)
    {
        var query = _context.PurchaseOrders
            .Include(po => po.Supplier)
            .Include(po => po.Warehouse)
            .Include(po => po.Details)
            .Include(po => po.CreatedByUser)
            .Where(po => po.DeletedAt == null)
            .AsQueryable();

        // Tìm kiếm theo từ khóa
        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(po =>
                po.OrderCode.ToLower().Contains(search) ||
                po.Supplier.SupplierName.ToLower().Contains(search));
        }

        // Lọc theo nhà cung cấp
        if (supplierId.HasValue)
        {
            query = query.Where(po => po.SupplierID == supplierId.Value);
        }

        // Lọc theo kho
        if (warehouseId.HasValue)
        {
            query = query.Where(po => po.WarehouseID == warehouseId.Value);
        }

        // Lọc theo trạng thái
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(po => po.Status == status);
        }

        // Lọc theo ngày
        if (fromDate.HasValue)
        {
            query = query.Where(po => po.OrderDate >= fromDate.Value);
        }
        if (toDate.HasValue)
        {
            query = query.Where(po => po.OrderDate <= toDate.Value);
        }

        return await query
            .OrderByDescending(po => po.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy đơn theo ID với đầy đủ thông tin
    /// </summary>
    public async Task<PurchaseOrder?> GetByIdAsync(Guid id)
    {
        return await _context.PurchaseOrders
            .Include(po => po.Supplier)
            .Include(po => po.Warehouse)
            .Include(po => po.CreatedByUser)
            .Include(po => po.Details.Where(d => d.DeletedAt == null))
                .ThenInclude(d => d.Component)
            .FirstOrDefaultAsync(po => po.PurchaseOrderID == id && po.DeletedAt == null);
    }

    /// <summary>
    /// Lấy đơn theo mã
    /// </summary>
    public async Task<PurchaseOrder?> GetByCodeAsync(string code)
    {
        return await _context.PurchaseOrders
            .Include(po => po.Supplier)
            .Include(po => po.Warehouse)
            .Include(po => po.CreatedByUser)
            .Include(po => po.Details.Where(d => d.DeletedAt == null))
                .ThenInclude(d => d.Component)
            .FirstOrDefaultAsync(po => po.OrderCode == code && po.DeletedAt == null);
    }

    /// <summary>
    /// Kiểm tra mã đơn hàng đã tồn tại
    /// </summary>
    public async Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null)
    {
        var query = _context.PurchaseOrders
            .Where(po => po.OrderCode == code && po.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(po => po.PurchaseOrderID != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Thêm đơn mới
    /// </summary>
    public async Task<PurchaseOrder> AddAsync(PurchaseOrder order)
    {
        order.CreatedAt = DateTime.UtcNow;
        order.UpdatedAt = DateTime.UtcNow;

        await _context.PurchaseOrders.AddAsync(order);
        await _context.SaveChangesAsync();

        return order;
    }

    /// <summary>
    /// Cập nhật đơn
    /// </summary>
    public async Task<PurchaseOrder> UpdateAsync(PurchaseOrder order)
    {
        order.UpdatedAt = DateTime.UtcNow;

        _context.PurchaseOrders.Update(order);
        await _context.SaveChangesAsync();

        return order;
    }

    /// <summary>
    /// Xóa mềm đơn
    /// </summary>
    public async Task<bool> SoftDeleteAsync(Guid id)
    {
        var order = await _context.PurchaseOrders
            .FirstOrDefaultAsync(po => po.PurchaseOrderID == id && po.DeletedAt == null);

        if (order == null)
        {
            return false;
        }

        order.DeletedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Lấy mã đơn hàng cuối cùng theo prefix
    /// </summary>
    public async Task<string?> GetLastCodeByPrefixAsync(string prefix)
    {
        return await _context.PurchaseOrders
            .Where(po => po.OrderCode.StartsWith(prefix))
            .OrderByDescending(po => po.OrderCode)
            .Select(po => po.OrderCode)
            .FirstOrDefaultAsync();
    }

    #endregion

    #region Validation

    /// <summary>
    /// Kiểm tra Supplier tồn tại
    /// </summary>
    public async Task<bool> SupplierExistsAsync(Guid supplierId)
    {
        return await _context.Suppliers
            .AnyAsync(s => s.SupplierID == supplierId && s.DeletedAt == null);
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
    /// Kiểm tra danh sách ComponentIDs tồn tại
    /// </summary>
    public async Task<List<Guid>> GetExistingComponentIdsAsync(List<Guid> componentIds)
    {
        return await _context.Components
            .Where(c => componentIds.Contains(c.ComponentID) && c.DeletedAt == null)
            .Select(c => c.ComponentID)
            .ToListAsync();
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Đếm tổng số đơn
    /// </summary>
    public async Task<int> CountAsync() =>
        await _context.PurchaseOrders.CountAsync(po => po.DeletedAt == null);

    /// <summary>
    /// Đếm theo trạng thái
    /// </summary>
    public async Task<int> CountByStatusAsync(string status) =>
        await _context.PurchaseOrders.CountAsync(po => po.DeletedAt == null && po.Status == status);

    /// <summary>
    /// Tổng giá trị đơn trong khoảng thời gian
    /// </summary>
    public async Task<decimal> GetTotalAmountAsync(DateTime fromDate, DateTime? toDate = null)
    {
        var query = _context.PurchaseOrders
            .Where(po => po.DeletedAt == null && po.Status != "CANCELLED" && po.OrderDate >= fromDate);

        if (toDate.HasValue)
        {
            query = query.Where(po => po.OrderDate <= toDate.Value);
        }

        return await query.SumAsync(po => po.FinalAmount);
    }

    /// <summary>
    /// Đếm đơn mới trong tháng
    /// </summary>
    public async Task<int> CountNewThisMonthAsync()
    {
        var startOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        return await _context.PurchaseOrders
            .CountAsync(po => po.DeletedAt == null && po.CreatedAt >= startOfMonth);
    }

    #endregion
}
