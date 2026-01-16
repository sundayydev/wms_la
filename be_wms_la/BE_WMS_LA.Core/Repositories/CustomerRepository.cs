using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

/// <summary>
/// Repository cho Customer - xử lý data access
/// </summary>
public class CustomerRepository
{
    private readonly AppDbContext _context;

    public CustomerRepository(AppDbContext context)
    {
        _context = context;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách khách hàng với filter
    /// </summary>
    public async Task<List<Customer>> GetAllAsync(
        string? search = null,
        string? type = null,
        string? customerGroup = null,
        bool? isActive = null)
    {
        var query = _context.Customers
            .Include(c => c.SalesOrders)
            .Where(c => c.DeletedAt == null)
            .AsQueryable();

        // Lọc theo từ khóa tìm kiếm
        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(c =>
                c.CustomerCode.ToLower().Contains(search) ||
                c.CustomerName.ToLower().Contains(search) ||
                (c.PhoneNumber != null && c.PhoneNumber.Contains(search)) ||
                (c.Email != null && c.Email.ToLower().Contains(search)));
        }

        // Lọc theo loại
        if (!string.IsNullOrEmpty(type))
        {
            query = query.Where(c => c.Type == type);
        }

        // Lọc theo nhóm
        if (!string.IsNullOrEmpty(customerGroup))
        {
            query = query.Where(c => c.CustomerGroup == customerGroup);
        }

        // Lọc theo trạng thái
        if (isActive.HasValue)
        {
            query = query.Where(c => c.IsActive == isActive.Value);
        }

        return await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy danh sách khách hàng active (cho dropdown)
    /// </summary>
    public async Task<List<Customer>> GetAllActiveAsync()
    {
        return await _context.Customers
            .Where(c => c.DeletedAt == null && c.IsActive)
            .OrderBy(c => c.CustomerName)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy khách hàng theo ID với đầy đủ thông tin liên quan
    /// </summary>
    public async Task<Customer?> GetByIdAsync(Guid id)
    {
        return await _context.Customers
            .Include(c => c.Contacts)
            .Include(c => c.SalesOrders.Where(o => o.DeletedAt == null))
            .FirstOrDefaultAsync(c => c.CustomerID == id && c.DeletedAt == null);
    }

    /// <summary>
    /// Lấy khách hàng theo mã
    /// </summary>
    public async Task<Customer?> GetByCodeAsync(string code)
    {
        return await _context.Customers
            .Include(c => c.Contacts)
            .Include(c => c.SalesOrders.Where(o => o.DeletedAt == null))
            .FirstOrDefaultAsync(c => c.CustomerCode == code && c.DeletedAt == null);
    }

    /// <summary>
    /// Kiểm tra mã khách hàng đã tồn tại
    /// </summary>
    public async Task<bool> ExistsByCodeAsync(string code, Guid? excludeId = null)
    {
        var query = _context.Customers
            .Where(c => c.CustomerCode == code && c.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.CustomerID != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Kiểm tra email đã tồn tại
    /// </summary>
    public async Task<bool> ExistsByEmailAsync(string email, Guid? excludeId = null)
    {
        var query = _context.Customers
            .Where(c => c.Email == email && c.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.CustomerID != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Kiểm tra SĐT đã tồn tại
    /// </summary>
    public async Task<bool> ExistsByPhoneAsync(string phone, Guid? excludeId = null)
    {
        var query = _context.Customers
            .Where(c => c.PhoneNumber == phone && c.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(c => c.CustomerID != excludeId.Value);
        }

        return await query.AnyAsync();
    }

    /// <summary>
    /// Thêm khách hàng mới
    /// </summary>
    public async Task<Customer> AddAsync(Customer customer)
    {
        customer.CreatedAt = DateTime.UtcNow;
        customer.UpdatedAt = DateTime.UtcNow;

        await _context.Customers.AddAsync(customer);
        await _context.SaveChangesAsync();

        return customer;
    }

    /// <summary>
    /// Cập nhật khách hàng
    /// </summary>
    public async Task<Customer> UpdateAsync(Customer customer)
    {
        customer.UpdatedAt = DateTime.UtcNow;

        _context.Customers.Update(customer);
        await _context.SaveChangesAsync();

        return customer;
    }

    /// <summary>
    /// Xóa mềm khách hàng
    /// </summary>
    public async Task<bool> SoftDeleteAsync(Guid id)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(c => c.CustomerID == id && c.DeletedAt == null);

        if (customer == null)
        {
            return false;
        }

        customer.DeletedAt = DateTime.UtcNow;
        customer.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Kiểm tra khách hàng có đơn hàng
    /// </summary>
    public async Task<bool> HasOrdersAsync(Guid customerId)
    {
        return await _context.SalesOrders
            .AnyAsync(o => o.CustomerID == customerId && o.DeletedAt == null);
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Đếm tổng số khách hàng
    /// </summary>
    public async Task<int> CountAsync() =>
        await _context.Customers.CountAsync(c => c.DeletedAt == null);

    /// <summary>
    /// Đếm khách hàng active
    /// </summary>
    public async Task<int> CountActiveAsync() =>
        await _context.Customers.CountAsync(c => c.DeletedAt == null && c.IsActive);

    /// <summary>
    /// Đếm theo loại
    /// </summary>
    public async Task<int> CountByTypeAsync(string type) =>
        await _context.Customers.CountAsync(c => c.DeletedAt == null && c.Type == type);

    /// <summary>
    /// Đếm theo nhóm
    /// </summary>
    public async Task<int> CountByGroupAsync(string group) =>
        await _context.Customers.CountAsync(c => c.DeletedAt == null && c.CustomerGroup == group);

    /// <summary>
    /// Đếm khách hàng mới trong tháng
    /// </summary>
    public async Task<int> CountNewThisMonthAsync()
    {
        var now = DateTime.UtcNow;
        var startOfMonth = DateTime.SpecifyKind(new DateTime(now.Year, now.Month, 1), DateTimeKind.Utc);
        return await _context.Customers
            .CountAsync(c => c.DeletedAt == null && c.CreatedAt >= startOfMonth);
    }

    /// <summary>
    /// Lấy mã khách hàng cuối cùng theo prefix
    /// </summary>
    public async Task<string?> GetLastCodeByPrefixAsync(string prefix)
    {
        return await _context.Customers
            .Where(c => c.CustomerCode.StartsWith(prefix))
            .OrderByDescending(c => c.CustomerCode)
            .Select(c => c.CustomerCode)
            .FirstOrDefaultAsync();
    }

    #endregion
}
