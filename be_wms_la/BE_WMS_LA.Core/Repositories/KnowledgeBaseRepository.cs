using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.Common;
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
        KnowledgeType? contentType = null,
        AccessScope? scope = null,
        int page = 1,
        int pageSize = 20)
    {
        var query = BuildQuery(componentId, contentType, scope);

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
        KnowledgeType? contentType = null,
        AccessScope? scope = null)
    {
        var query = BuildQuery(componentId, contentType, scope);
        return await query.CountAsync();
    }

    /// <summary>
    /// Lấy Knowledge Base item theo ID
    /// </summary>
    public async Task<ProductKnowledgeBase?> GetByIdAsync(Guid id)
    {
        return await _context.ProductKnowledgeBases
            .Include(kb => kb.CreatedByUser)
            .Include(kb => kb.UpdatedByUser)
            .Include(kb => kb.Shares)
            .FirstOrDefaultAsync(kb => kb.KnowledgeID == id);
    }

    /// <summary>
    /// Lấy danh sách Knowledge Base theo Component ID
    /// </summary>
    public async Task<List<ProductKnowledgeBase>> GetByComponentIdAsync(Guid componentId)
    {
        return await _context.ProductKnowledgeBases
            .Include(kb => kb.CreatedByUser)
            .Include(kb => kb.Shares)
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

    #region DocumentShare Operations

    /// <summary>
    /// Lấy DocumentShare theo ShareToken
    /// </summary>
    public async Task<DocumentShare?> GetShareByTokenAsync(string shareToken)
    {
        return await _context.DocumentShares
            .Include(ds => ds.KnowledgeBase)
            .FirstOrDefaultAsync(ds => ds.ShareToken == shareToken && ds.IsActive);
    }

    /// <summary>
    /// Tạo share link mới
    /// </summary>
    public async Task<DocumentShare> CreateShareAsync(DocumentShare share)
    {
        share.CreatedAt = DateTime.UtcNow;

        await _context.DocumentShares.AddAsync(share);
        await _context.SaveChangesAsync();

        return share;
    }

    /// <summary>
    /// Hủy share link (soft delete)
    /// </summary>
    public async Task<bool> RevokeShareAsync(Guid shareId)
    {
        var share = await _context.DocumentShares
            .FirstOrDefaultAsync(ds => ds.ShareID == shareId);

        if (share == null)
        {
            return false;
        }

        share.IsActive = false;
        await _context.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Hủy tất cả share links của một Knowledge Base item
    /// </summary>
    public async Task<int> RevokeAllSharesAsync(Guid knowledgeId)
    {
        var shares = await _context.DocumentShares
            .Where(ds => ds.KnowledgeID == knowledgeId && ds.IsActive)
            .ToListAsync();

        foreach (var share in shares)
        {
            share.IsActive = false;
        }

        await _context.SaveChangesAsync();
        return shares.Count;
    }

    /// <summary>
    /// Tăng số lần download của share
    /// </summary>
    public async Task<bool> IncrementDownloadCountAsync(Guid shareId)
    {
        var share = await _context.DocumentShares
            .FirstOrDefaultAsync(ds => ds.ShareID == shareId);

        if (share == null)
        {
            return false;
        }

        share.CurrentDownloads++;
        await _context.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Lấy danh sách share links của một Knowledge Base item
    /// </summary>
    public async Task<List<DocumentShare>> GetSharesByKnowledgeIdAsync(Guid knowledgeId)
    {
        return await _context.DocumentShares
            .Where(ds => ds.KnowledgeID == knowledgeId && ds.IsActive)
            .OrderByDescending(ds => ds.CreatedAt)
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
    public async Task<Dictionary<KnowledgeType, int>> CountByContentTypeAsync()
    {
        return await _context.ProductKnowledgeBases
            .GroupBy(kb => kb.ContentType)
            .Select(g => new { ContentType = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ContentType, x => x.Count);
    }

    /// <summary>
    /// Đếm số items đang được share (có share active)
    /// </summary>
    public async Task<int> CountSharedAsync()
    {
        return await _context.ProductKnowledgeBases
            .Where(kb => kb.Shares.Any(s => s.IsActive))
            .CountAsync();
    }

    /// <summary>
    /// Tính tổng dung lượng file
    /// </summary>
    public async Task<long> GetTotalFileSizeAsync()
    {
        return await _context.ProductKnowledgeBases
            .SumAsync(kb => kb.FileSize);
    }

    /// <summary>
    /// Lấy top files được download nhiều nhất
    /// </summary>
    public async Task<List<(ProductKnowledgeBase Item, int TotalDownloads)>> GetTopDownloadedAsync(int top = 10)
    {
        return await _context.ProductKnowledgeBases
            .Include(kb => kb.Shares)
            .Select(kb => new
            {
                Item = kb,
                TotalDownloads = kb.Shares.Sum(s => s.CurrentDownloads)
            })
            .OrderByDescending(x => x.TotalDownloads)
            .Take(top)
            .Select(x => new ValueTuple<ProductKnowledgeBase, int>(x.Item, x.TotalDownloads))
            .ToListAsync();
    }

    #endregion

    #region Public Access Operations

    /// <summary>
    /// Lấy danh sách tài liệu PUBLIC (không cần đăng nhập)
    /// </summary>
    public async Task<List<ProductKnowledgeBase>> GetPublicAsync(
        Guid? componentId = null,
        KnowledgeType? contentType = null,
        int page = 1,
        int pageSize = 20)
    {
        var query = BuildQuery(componentId, contentType, AccessScope.PUBLIC);

        return await query
            .OrderByDescending(kb => kb.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    /// <summary>
    /// Đếm số tài liệu PUBLIC
    /// </summary>
    public async Task<int> CountPublicAsync(
        Guid? componentId = null,
        KnowledgeType? contentType = null)
    {
        var query = BuildQuery(componentId, contentType, AccessScope.PUBLIC);
        return await query.CountAsync();
    }

    /// <summary>
    /// Lấy danh sách tài liệu theo ProcessStatus (cho background worker)
    /// </summary>
    public async Task<List<ProductKnowledgeBase>> GetByProcessStatusAsync(
        FileStatus status,
        int limit = 10)
    {
        return await _context.ProductKnowledgeBases
            .Where(kb => kb.ProcessStatus == status)
            .OrderBy(kb => kb.CreatedAt)
            .Take(limit)
            .ToListAsync();
    }

    /// <summary>
    /// Cập nhật ProcessStatus và PreviewObjectKey
    /// </summary>
    public async Task<bool> UpdateProcessStatusAsync(
        Guid knowledgeId,
        FileStatus status,
        string? previewObjectKey = null,
        string? thumbnailObjectKey = null)
    {
        var item = await _context.ProductKnowledgeBases
            .FirstOrDefaultAsync(kb => kb.KnowledgeID == knowledgeId);

        if (item == null)
        {
            return false;
        }

        item.ProcessStatus = status;

        if (!string.IsNullOrEmpty(previewObjectKey))
        {
            item.PreviewObjectKey = previewObjectKey;
        }

        if (!string.IsNullOrEmpty(thumbnailObjectKey))
        {
            item.ThumbnailObjectKey = thumbnailObjectKey;
        }

        item.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    /// <summary>
    /// Kiểm tra quyền truy cập tài liệu
    /// </summary>
    public async Task<(bool HasAccess, ProductKnowledgeBase? Item)> CheckAccessAsync(
        Guid knowledgeId,
        Guid? userId = null)
    {
        var item = await _context.ProductKnowledgeBases
            .Include(kb => kb.CreatedByUser)
            .FirstOrDefaultAsync(kb => kb.KnowledgeID == knowledgeId);

        if (item == null)
        {
            return (false, null);
        }

        // PUBLIC documents: ai cũng access được
        if (item.Scope == AccessScope.PUBLIC)
        {
            return (true, item);
        }

        // INTERNAL documents: chỉ user đăng nhập
        if (item.Scope == AccessScope.INTERNAL)
        {
            // Nếu không có userId (anonymous), không cho access
            if (!userId.HasValue)
            {
                return (false, item);
            }

            // User đã đăng nhập => cho phép
            return (true, item);
        }

        return (false, item);
    }

    #endregion

    #region Helpers

    private IQueryable<ProductKnowledgeBase> BuildQuery(
        Guid? componentId = null,
        KnowledgeType? contentType = null,
        AccessScope? scope = null)
    {
        var query = _context.ProductKnowledgeBases
            .Include(kb => kb.CreatedByUser)
            .Include(kb => kb.Shares)
            .AsQueryable();

        if (componentId.HasValue)
        {
            query = query.Where(kb => kb.ComponentID == componentId);
        }

        if (contentType.HasValue)
        {
            query = query.Where(kb => kb.ContentType == contentType);
        }

        if (scope.HasValue)
        {
            query = query.Where(kb => kb.Scope == scope);
        }

        return query;
    }

    #endregion
}
