using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

/// <summary>
/// Repository for PurchaseOrderHistory - quản lý lịch sử thay đổi trạng thái đơn hàng
/// </summary>
public class PurchaseOrderHistoryRepository
{
    private readonly AppDbContext _context;

    public PurchaseOrderHistoryRepository(AppDbContext context)
    {
        _context = context;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách lịch sử theo PurchaseOrderID
    /// </summary>
    public async Task<List<PurchaseOrderHistory>> GetByPurchaseOrderIdAsync(Guid purchaseOrderId)
    {
        return await _context.PurchaseOrderHistories
            .Include(h => h.PerformedByUser)
            .Where(h => h.PurchaseOrderID == purchaseOrderId)
            .OrderByDescending(h => h.PerformedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy lịch sử theo ID
    /// </summary>
    public async Task<PurchaseOrderHistory?> GetByIdAsync(Guid historyId)
    {
        return await _context.PurchaseOrderHistories
            .Include(h => h.PerformedByUser)
            .Include(h => h.PurchaseOrder)
            .FirstOrDefaultAsync(h => h.HistoryID == historyId);
    }

    /// <summary>
    /// Tạo record lịch sử mới
    /// </summary>
    public async Task<PurchaseOrderHistory> AddAsync(PurchaseOrderHistory history)
    {
        history.PerformedAt = DateTime.UtcNow;
        await _context.PurchaseOrderHistories.AddAsync(history);
        await _context.SaveChangesAsync();
        return history;
    }

    /// <summary>
    /// Tạo nhiều records lịch sử cùng lúc
    /// </summary>
    public async Task<List<PurchaseOrderHistory>> AddRangeAsync(List<PurchaseOrderHistory> histories)
    {
        foreach (var history in histories)
        {
            history.PerformedAt = DateTime.UtcNow;
        }

        await _context.PurchaseOrderHistories.AddRangeAsync(histories);
        await _context.SaveChangesAsync();
        return histories;
    }

    #endregion

    #region Query Operations

    /// <summary>
    /// Lấy lịch sử cuối cùng của đơn hàng
    /// </summary>
    public async Task<PurchaseOrderHistory?> GetLatestByPurchaseOrderIdAsync(Guid purchaseOrderId)
    {
        return await _context.PurchaseOrderHistories
            .Include(h => h.PerformedByUser)
            .Where(h => h.PurchaseOrderID == purchaseOrderId)
            .OrderByDescending(h => h.PerformedAt)
            .FirstOrDefaultAsync();
    }

    /// <summary>
    /// Lấy lịch sử theo action type
    /// </summary>
    public async Task<List<PurchaseOrderHistory>> GetByActionAsync(Guid purchaseOrderId, string action)
    {
        return await _context.PurchaseOrderHistories
            .Include(h => h.PerformedByUser)
            .Where(h => h.PurchaseOrderID == purchaseOrderId && h.Action == action)
            .OrderByDescending(h => h.PerformedAt)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy lịch sử theo người thực hiện
    /// </summary>
    public async Task<List<PurchaseOrderHistory>> GetByUserAsync(Guid userId, int take = 50)
    {
        return await _context.PurchaseOrderHistories
            .Include(h => h.PurchaseOrder)
            .Where(h => h.PerformedByUserID == userId)
            .OrderByDescending(h => h.PerformedAt)
            .Take(take)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy tất cả lịch sử trong khoảng thời gian
    /// </summary>
    public async Task<List<PurchaseOrderHistory>> GetByDateRangeAsync(DateTime fromDate, DateTime toDate)
    {
        return await _context.PurchaseOrderHistories
            .Include(h => h.PerformedByUser)
            .Include(h => h.PurchaseOrder)
            .Where(h => h.PerformedAt >= fromDate && h.PerformedAt <= toDate)
            .OrderByDescending(h => h.PerformedAt)
            .ToListAsync();
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Đếm số lượng hành động theo loại
    /// </summary>
    public async Task<Dictionary<string, int>> GetActionCountsAsync(Guid purchaseOrderId)
    {
        return await _context.PurchaseOrderHistories
            .Where(h => h.PurchaseOrderID == purchaseOrderId)
            .GroupBy(h => h.Action)
            .Select(g => new { Action = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Action, x => x.Count);
    }

    /// <summary>
    /// Đếm tổng số thay đổi của đơn hàng
    /// </summary>
    public async Task<int> CountByPurchaseOrderIdAsync(Guid purchaseOrderId)
    {
        return await _context.PurchaseOrderHistories
            .CountAsync(h => h.PurchaseOrderID == purchaseOrderId);
    }

    #endregion
}
