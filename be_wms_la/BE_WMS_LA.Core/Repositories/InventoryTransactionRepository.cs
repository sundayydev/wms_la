using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using Microsoft.EntityFrameworkCore;

namespace BE_WMS_LA.Core.Repositories;

/// <summary>
/// Repository cho InventoryTransaction - quản lý lịch sử giao dịch kho
/// </summary>
public class InventoryTransactionRepository
{
    private readonly AppDbContext _context;

    public InventoryTransactionRepository(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Tạo transaction code tự động
    /// </summary>
    public async Task<string> GenerateTransactionCodeAsync()
    {
        var year = DateTime.UtcNow.Year;
        var prefix = $"INV-{year}";

        var lastCode = await _context.InventoryTransactions
            .Where(t => t.TransactionCode.StartsWith(prefix))
            .OrderByDescending(t => t.TransactionCode)
            .Select(t => t.TransactionCode)
            .FirstOrDefaultAsync();

        int nextNumber = 1;
        if (!string.IsNullOrEmpty(lastCode))
        {
            var parts = lastCode.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"{prefix}-{nextNumber:D5}";
    }

    /// <summary>
    /// Thêm transaction mới
    /// </summary>
    public async Task<InventoryTransaction> AddAsync(InventoryTransaction transaction)
    {
        // Generate code if empty
        if (string.IsNullOrEmpty(transaction.TransactionCode))
        {
            transaction.TransactionCode = await GenerateTransactionCodeAsync();
        }

        transaction.CreatedAt = DateTime.UtcNow;
        transaction.TransactionDate = transaction.TransactionDate == default
            ? DateTime.UtcNow
            : transaction.TransactionDate;

        await _context.InventoryTransactions.AddAsync(transaction);
        await _context.SaveChangesAsync();

        return transaction;
    }

    /// <summary>
    /// Thêm nhiều transactions
    /// </summary>
    public async Task<List<InventoryTransaction>> AddRangeAsync(List<InventoryTransaction> transactions)
    {
        // Get the starting number for batch generation
        var year = DateTime.UtcNow.Year;
        var prefix = $"INV-{year}";

        var lastCode = await _context.InventoryTransactions
            .Where(t => t.TransactionCode.StartsWith(prefix))
            .OrderByDescending(t => t.TransactionCode)
            .Select(t => t.TransactionCode)
            .FirstOrDefaultAsync();

        int nextNumber = 1;
        if (!string.IsNullOrEmpty(lastCode))
        {
            var parts = lastCode.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        foreach (var transaction in transactions)
        {
            if (string.IsNullOrEmpty(transaction.TransactionCode))
            {
                transaction.TransactionCode = $"{prefix}-{nextNumber:D5}";
                nextNumber++; // Increment for next transaction in batch
            }

            transaction.CreatedAt = DateTime.UtcNow;
            transaction.TransactionDate = transaction.TransactionDate == default
                ? DateTime.UtcNow
                : transaction.TransactionDate;
        }

        await _context.InventoryTransactions.AddRangeAsync(transactions);
        await _context.SaveChangesAsync();

        return transactions;
    }

    /// <summary>
    /// Lấy transactions theo reference (PO, SO, ...)
    /// </summary>
    public async Task<List<InventoryTransaction>> GetByReferenceAsync(Guid referenceId)
    {
        return await _context.InventoryTransactions
            .Include(t => t.Warehouse)
            .Include(t => t.Component)
            .Include(t => t.Instance)
            .Include(t => t.CreatedByUser)
            .Where(t => t.ReferenceID == referenceId)
            .OrderByDescending(t => t.TransactionDate)
            .ToListAsync();
    }

    /// <summary>
    /// Lấy lịch sử của một instance
    /// </summary>
    public async Task<List<InventoryTransaction>> GetByInstanceAsync(Guid instanceId)
    {
        return await _context.InventoryTransactions
            .Include(t => t.Warehouse)
            .Include(t => t.Component)
            .Include(t => t.CreatedByUser)
            .Where(t => t.InstanceID == instanceId)
            .OrderByDescending(t => t.TransactionDate)
            .ToListAsync();
    }
}
