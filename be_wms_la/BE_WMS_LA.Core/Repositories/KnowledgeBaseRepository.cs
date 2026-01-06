using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

/// <summary>
/// Repository cho ProductKnowledgeBase - Kho tri thức sản phẩm
/// </summary>
public class KnowledgeBaseRepository
{
    private readonly AppDbContext _context;

    public KnowledgeBaseRepository(AppDbContext context)
    {
        _context = context;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách tất cả Knowledge Base items
    /// </summary>
    public async Task<List<ProductKnowledgeBase>> GetAllAsync(
        Guid? componentId = null,
        string? contentType = null,
        string? accessLevel = null,
        int page = 1,
        int pageSize = 20)
    {
        var query = BuildQuery(componentId, contentType, accessLevel);

        return await query
            .OrderByDescending(kb => kb.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    /// <summary>
    /// Đếm tổng số Knowledge Base items theo filter
    /// </summary>
    public async Task<int> CountAsync(
        Guid? componentId = null,
        string? contentType = null,
        string? accessLevel = null)
    {
        var query = BuildQuery(componentId, contentType, accessLevel);
        return await query.CountAsync();
    }

    /// <summary>
    /// Lấy Knowledge Base item theo ID
    /// </summary>
    public async Task<ProductKnowledgeBase?> GetByIdAsync(Guid id)
    {
        return await _context.ProductKnowledgeBases
            .Include(kb => kb.UploadedByUser)
            .Include(kb => kb.SharedByUser)
            .Include(kb => kb.Component)
            .FirstOrDefaultAsync(kb => kb.KnowledgeID == id);
    }

    /// <summary>
    /// Lấy Knowledge Base item theo Share Token
    /// </summary>
    public async Task<ProductKnowledgeBase?> GetByShareTokenAsync(string shareToken)
    {
        return await _context.ProductKnowledgeBases
            .FirstOrDefaultAsync(kb => kb.ShareToken == shareToken);
    }

    /// <summary>
    /// Lấy danh sách Knowledge Base theo Component ID
    /// </summary>
    public async Task<List<ProductKnowledgeBase>> GetByComponentIdAsync(Guid componentId)
    {
        return await _context.ProductKnowledgeBases
            .Include(kb => kb.UploadedByUser)
            .Where(kb => kb.ComponentID == componentId)
            .OrderByDescending(kb => kb.CreatedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Thêm Knowledge Base item mới
    /// </summary>
    public async Task<ProductKnowledgeBase> AddAsync(ProductKnowledgeBase item)
    {
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.ProductKnowledgeBases.AddAsync(item);
        await _context.SaveChangesAsync();

        return item;
    }

    /// <summary>
    /// Cập nhật Knowledge Base item
    /// </summary>
    public async Task<ProductKnowledgeBase> UpdateAsync(ProductKnowledgeBase item)
    {
        item.UpdatedAt = DateTime.UtcNow;

        _context.ProductKnowledgeBases.Update(item);
        await _context.SaveChangesAsync();

        return item;
    }

    /// <summary>
    /// Xóa Knowledge Base item (hard delete)
    /// </summary>
    public async Task<bool> DeleteAsync(Guid id)
    {
        var item = await _context.ProductKnowledgeBases
            .FirstOrDefaultAsync(kb => kb.KnowledgeID == id);

        if (item == null)
        {
            return false;
        }

        _context.ProductKnowledgeBases.Remove(item);
        await _context.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Xóa Knowledge Base item
    /// </summary>
    public async Task<bool> DeleteAsync(ProductKnowledgeBase item)
    {
        _context.ProductKnowledgeBases.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    #endregion

    #region Sharing Operations

    /// <summary>
    /// Cập nhật thông tin sharing
    /// </summary>
    public async Task<ProductKnowledgeBase?> UpdateSharingAsync(
        Guid id,
        string shareToken,
        string? sharedUrl,
        DateTime expiry,
        int? maxDownloads,
        Guid? sharedByUserId)
    {
        var item = await _context.ProductKnowledgeBases
            .FirstOrDefaultAsync(kb => kb.KnowledgeID == id);

        if (item == null)
        {
            return null;
        }

        item.ShareToken = shareToken;
        item.SharedURL = sharedUrl;
        item.SharedExpiry = expiry;
        item.IsShared = true;
        item.MaxDownloads = maxDownloads;
        item.DownloadCount = 0;
        item.SharedByUserID = sharedByUserId;
        item.SharedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return item;
    }

    /// <summary>
    /// Hủy sharing
    /// </summary>
    public async Task<bool> RevokeSharingAsync(Guid id)
    {
        var item = await _context.ProductKnowledgeBases
            .FirstOrDefaultAsync(kb => kb.KnowledgeID == id);

        if (item == null)
        {
            return false;
        }

        item.ShareToken = null;
        item.SharedURL = null;
        item.SharedExpiry = null;
        item.IsShared = false;
        item.MaxDownloads = null;
        item.SharedByUserID = null;
        item.SharedAt = null;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Tăng số lần download
    /// </summary>
    public async Task<bool> IncrementDownloadCountAsync(Guid id)
    {
        var item = await _context.ProductKnowledgeBases
            .FirstOrDefaultAsync(kb => kb.KnowledgeID == id);

        if (item == null)
        {
            return false;
        }

        item.DownloadCount++;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Lấy danh sách items đang được share
    /// </summary>
    public async Task<List<ProductKnowledgeBase>> GetSharedItemsAsync()
    {
        return await _context.ProductKnowledgeBases
            .Include(kb => kb.SharedByUser)
            .Where(kb => kb.IsShared)
            .OrderByDescending(kb => kb.SharedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy danh sách items đã hết hạn share
    /// </summary>
    public async Task<List<ProductKnowledgeBase>> GetExpiredSharedItemsAsync()
    {
        return await _context.ProductKnowledgeBases
            .Where(kb => kb.IsShared && kb.SharedExpiry.HasValue && kb.SharedExpiry < DateTime.UtcNow)
            .ToListAsync();
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Đếm tổng số Knowledge Base items
    /// </summary>
    public async Task<int> CountTotalAsync()
    {
        return await _context.ProductKnowledgeBases.CountAsync();
    }

    /// <summary>
    /// Đếm số items theo Content Type
    /// </summary>
    public async Task<Dictionary<string, int>> CountByContentTypeAsync()
    {
        return await _context.ProductKnowledgeBases
            .GroupBy(kb => kb.ContentType)
            .Select(g => new { ContentType = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ContentType, x => x.Count);
    }

    /// <summary>
    /// Đếm số items đang được share
    /// </summary>
    public async Task<int> CountSharedAsync()
    {
        return await _context.ProductKnowledgeBases
            .Where(kb => kb.IsShared)
            .CountAsync();
    }

    /// <summary>
    /// Tính tổng dung lượng file
    /// </summary>
    public async Task<long> GetTotalFileSizeAsync()
    {
        return await _context.ProductKnowledgeBases
            .Where(kb => kb.FileSize.HasValue)
            .SumAsync(kb => kb.FileSize!.Value);
    }

    /// <summary>
    /// Lấy top files được download nhiều nhất
    /// </summary>
    public async Task<List<ProductKnowledgeBase>> GetTopDownloadedAsync(int top = 10)
    {
        return await _context.ProductKnowledgeBases
            .OrderByDescending(kb => kb.DownloadCount)
            .Take(top)
            .ToListAsync();
    }

    #endregion

    #region Helpers

    private IQueryable<ProductKnowledgeBase> BuildQuery(
        Guid? componentId = null,
        string? contentType = null,
        string? accessLevel = null)
    {
        var query = _context.ProductKnowledgeBases
            .Include(kb => kb.UploadedByUser)
            .AsQueryable();

        if (componentId.HasValue)
        {
            query = query.Where(kb => kb.ComponentID == componentId);
        }

        if (!string.IsNullOrEmpty(contentType))
        {
            query = query.Where(kb => kb.ContentType == contentType);
        }

        if (!string.IsNullOrEmpty(accessLevel))
        {
            query = query.Where(kb => kb.AccessLevel == accessLevel);
        }

        return query;
    }

    #endregion
}
