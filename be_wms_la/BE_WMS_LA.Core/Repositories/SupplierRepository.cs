using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

/// <summary>
/// Repository cho Supplier
/// </summary>
public class SupplierRepository
{
    private readonly AppDbContext _context;

    public SupplierRepository(AppDbContext context)
    {
        _context = context;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách nhà cung cấp với filter
    /// </summary>
    public async Task<List<Supplier>> GetAllAsync(
        string? search = null,
        bool? isActive = null,
        string? city = null)
    {
        var query = _context.Suppliers
            .Where(s => s.DeletedAt == null)
            .AsQueryable();

        // Lọc theo từ khóa tìm kiếm
        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(s =>
                s.SupplierCode.ToLower().Contains(search) ||
                s.SupplierName.ToLower().Contains(search) ||
                (s.ContactPerson != null && s.ContactPerson.ToLower().Contains(search)) ||
                (s.PhoneNumber != null && s.PhoneNumber.Contains(search)) ||
                (s.Email != null && s.Email.ToLower().Contains(search)));
        }

        // Lọc theo trạng thái
        if (isActive.HasValue)
        {
            query = query.Where(s => s.IsActive == isActive.Value);
        }

        // Lọc theo thành phố
        if (!string.IsNullOrEmpty(city))
        {
            query = query.Where(s => s.City != null && s.City.ToLower().Contains(city.ToLower()));
        }

        return await query
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy danh sách nhà cung cấp active (cho dropdown)
    /// </summary>
    public async Task<List<Supplier>> GetAllActiveAsync()
    {
        return await _context.Suppliers
            .Where(s => s.DeletedAt == null && s.IsActive)
            .OrderBy(s => s.SupplierName)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy nhà cung cấp theo ID
    /// </summary>
    public async Task<Supplier?> GetByIdAsync(Guid id)
    {
        return await _context.Suppliers
            .Include(s => s.Components)
            .Include(s => s.PurchaseOrders)
            .FirstOrDefaultAsync(s => s.SupplierID == id && s.DeletedAt == null);
    }

    /// <summary>
    /// Lấy nhà cung cấp theo mã
    /// </summary>
    public async Task<Supplier?> GetByCodeAsync(string code)
    {
        return await _context.Suppliers
            .Include(s => s.Components)
            .Include(s => s.PurchaseOrders)
            .FirstOrDefaultAsync(s => s.SupplierCode == code && s.DeletedAt == null);
    }

    /// <summary>
    /// Kiểm tra mã nhà cung cấp đã tồn tại
    /// </summary>
    public async Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null)
    {
        var query = _context.Suppliers
            .Where(s => s.SupplierCode == code && s.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(s => s.SupplierID != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Kiểm tra email đã tồn tại
    /// </summary>
    public async Task<bool> ExistsByEmailAsync(string email, Guid? excludeId = null)
    {
        var query = _context.Suppliers
            .Where(s => s.Email == email && s.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(s => s.SupplierID != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Thêm nhà cung cấp mới
    /// </summary>
    public async Task<Supplier> AddAsync(Supplier supplier)
    {
        supplier.CreatedAt = DateTime.UtcNow;
        supplier.UpdatedAt = DateTime.UtcNow;

        await _context.Suppliers.AddAsync(supplier);
        await _context.SaveChangesAsync();

        return supplier;
    }

    /// <summary>
    /// Cập nhật nhà cung cấp
    /// </summary>
    public async Task<Supplier> UpdateAsync(Supplier supplier)
    {
        supplier.UpdatedAt = DateTime.UtcNow;

        _context.Suppliers.Update(supplier);
        await _context.SaveChangesAsync();

        return supplier;
    }

    /// <summary>
    /// Xóa mềm nhà cung cấp
    /// </summary>
    public async Task<bool> SoftDeleteAsync(Guid id)
    {
        var supplier = await GetByIdAsync(id);
        if (supplier == null)
        {
            return false;
        }

        supplier.DeletedAt = DateTime.UtcNow;
        supplier.IsActive = false;
        supplier.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Đếm tổng số nhà cung cấp
    /// </summary>
    public async Task<int> CountAsync(bool includeDeleted = false)
    {
        var query = _context.Suppliers.AsQueryable();

        if (!includeDeleted)
        {
            query = query.Where(s => s.DeletedAt == null);
        }

        return await query.CountAsync();
    }

    /// <summary>
    /// Đếm nhà cung cấp active
    /// </summary>
    public async Task<int> CountActiveAsync()
    {
        return await _context.Suppliers
            .CountAsync(s => s.IsActive && s.DeletedAt == null);
    }

    /// <summary>
    /// Đếm nhà cung cấp inactive
    /// </summary>
    public async Task<int> CountInactiveAsync()
    {
        return await _context.Suppliers
            .CountAsync(s => !s.IsActive && s.DeletedAt == null);
    }

    /// <summary>
    /// Thống kê theo thành phố
    /// </summary>
    public async Task<List<(string City, int Count)>> GetSuppliersByCityAsync(int top = 10)
    {
        return await _context.Suppliers
            .Where(s => s.DeletedAt == null && s.City != null)
            .GroupBy(s => s.City)
            .Select(g => new ValueTuple<string, int>(g.Key!, g.Count()))
            .OrderByDescending(x => x.Item2)
            .Take(top)
            .ToListAsync();
    }

    /// <summary>
    /// Đếm nhà cung cấp mới trong 30 ngày
    /// </summary>
    public async Task<int> CountRecentlyAddedAsync(int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days);
        return await _context.Suppliers
            .Where(s => s.DeletedAt == null && s.CreatedAt >= startDate)
            .CountAsync();
    }

    #endregion

    #region Purchase Orders

    /// <summary>
    /// Kiểm tra nhà cung cấp có đơn hàng đang pending
    /// </summary>
    public async Task<bool> HasPendingOrdersAsync(Guid supplierId)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.PurchaseOrders)
            .FirstOrDefaultAsync(s => s.SupplierID == supplierId);

        if (supplier == null)
        {
            return false;
        }

        return supplier.PurchaseOrders
            .Any(po => po.Status != "Completed" && po.Status != "Cancelled");
    }

    #endregion
}
