using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

/// <summary>
/// Repository cho ComponentCompatibility
/// </summary>
public class ComponentCompatibilityRepository
{
    private readonly AppDbContext _context;

    public ComponentCompatibilityRepository(AppDbContext context)
    {
        _context = context;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy tất cả compatibility relationships
    /// </summary>
    public async Task<List<ComponentCompatibility>> GetAllAsync()
    {
        return await _context.ComponentCompatibilities
            .Include(c => c.SourceComponent)
            .Include(c => c.TargetComponent)
            .OrderBy(c => c.SourceComponent.ComponentName)
            .ThenBy(c => c.TargetComponent.ComponentName)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy danh sách các thiết bị tương thích với một Component (Source -> Targets)
    /// Ví dụ: Pin này sử dụng được cho máy PDA nào?
    /// </summary>
    public async Task<List<ComponentCompatibility>> GetCompatibleTargetsAsync(Guid sourceComponentId)
    {
        return await _context.ComponentCompatibilities
            .Include(c => c.TargetComponent)
                .ThenInclude(t => t.Category)
            .Include(c => c.TargetComponent)
                .ThenInclude(t => t.Supplier)
            .Where(c => c.SourceComponentID == sourceComponentId)
            .OrderBy(c => c.TargetComponent.ComponentName)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy danh sách các phụ kiện tương thích với một thiết bị (Target <- Sources)
    /// Ví dụ: Máy PDA này sử dụng được pin/phụ kiện nào?
    /// </summary>
    public async Task<List<ComponentCompatibility>> GetCompatibleAccessoriesAsync(Guid targetComponentId)
    {
        return await _context.ComponentCompatibilities
            .Include(c => c.SourceComponent)
                .ThenInclude(s => s.Category)
            .Include(c => c.SourceComponent)
                .ThenInclude(s => s.Supplier)
            .Where(c => c.TargetComponentID == targetComponentId)
            .OrderBy(c => c.SourceComponent.ComponentName)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy một compatibility record cụ thể
    /// </summary>
    public async Task<ComponentCompatibility?> GetByIdsAsync(Guid sourceId, Guid targetId)
    {
        return await _context.ComponentCompatibilities
            .Include(c => c.SourceComponent)
            .Include(c => c.TargetComponent)
            .FirstOrDefaultAsync(c =>
                c.SourceComponentID == sourceId &&
                c.TargetComponentID == targetId);
    }

    /// <summary>
    /// Kiểm tra xem một compatibility đã tồn tại chưa
    /// </summary>
    public async Task<bool> ExistsAsync(Guid sourceId, Guid targetId)
    {
        return await _context.ComponentCompatibilities
            .AnyAsync(c =>
                c.SourceComponentID == sourceId &&
                c.TargetComponentID == targetId);
    }

    /// <summary>
    /// Thêm một compatibility mới
    /// </summary>
    public async Task<ComponentCompatibility> AddAsync(ComponentCompatibility compatibility)
    {
        await _context.ComponentCompatibilities.AddAsync(compatibility);
        await _context.SaveChangesAsync();
        return compatibility;
    }

    /// <summary>
    /// Thêm nhiều compatibilities cùng lúc
    /// </summary>
    public async Task<List<ComponentCompatibility>> AddRangeAsync(List<ComponentCompatibility> compatibilities)
    {
        await _context.ComponentCompatibilities.AddRangeAsync(compatibilities);
        await _context.SaveChangesAsync();
        return compatibilities;
    }

    /// <summary>
    /// Cập nhật compatibility
    /// </summary>
    public async Task<ComponentCompatibility> UpdateAsync(ComponentCompatibility compatibility)
    {
        _context.ComponentCompatibilities.Update(compatibility);
        await _context.SaveChangesAsync();
        return compatibility;
    }

    /// <summary>
    /// Xóa một compatibility (hard delete vì không có audit fields)
    /// </summary>
    public async Task<bool> DeleteAsync(Guid sourceId, Guid targetId)
    {
        var compatibility = await GetByIdsAsync(sourceId, targetId);
        if (compatibility == null)
        {
            return false;
        }

        _context.ComponentCompatibilities.Remove(compatibility);
        await _context.SaveChangesAsync();
        return true;
    }

    /// <summary>
    /// Xóa tất cả compatibilities của một Source Component
    /// </summary>
    public async Task<int> DeleteBySourceAsync(Guid sourceComponentId)
    {
        var compatibilities = await _context.ComponentCompatibilities
            .Where(c => c.SourceComponentID == sourceComponentId)
            .ToListAsync();

        _context.ComponentCompatibilities.RemoveRange(compatibilities);
        await _context.SaveChangesAsync();
        return compatibilities.Count;
    }

    /// <summary>
    /// Xóa tất cả compatibilities của một Target Component
    /// </summary>
    public async Task<int> DeleteByTargetAsync(Guid targetComponentId)
    {
        var compatibilities = await _context.ComponentCompatibilities
            .Where(c => c.TargetComponentID == targetComponentId)
            .ToListAsync();

        _context.ComponentCompatibilities.RemoveRange(compatibilities);
        await _context.SaveChangesAsync();
        return compatibilities.Count;
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Đếm số lượng Target Devices của một Source Component
    /// </summary>
    public async Task<int> CountTargetsAsync(Guid sourceComponentId)
    {
        return await _context.ComponentCompatibilities
            .CountAsync(c => c.SourceComponentID == sourceComponentId);
    }

    /// <summary>
    /// Đếm số lượng Source Accessories của một Target Device
    /// </summary>
    public async Task<int> CountAccessoriesAsync(Guid targetComponentId)
    {
        return await _context.ComponentCompatibilities
            .CountAsync(c => c.TargetComponentID == targetComponentId);
    }

    #endregion
}
