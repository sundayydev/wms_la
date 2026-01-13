namespace BE_WMS_LA.Shared.DTOs.Supplier;

/// <summary>
/// Kết quả import suppliers từ Excel
/// </summary>
public class ImportSupplierResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public int TotalProcessed { get; set; }
    public int CreatedCount { get; set; }
    public int UpdatedCount { get; set; }
    public int SkippedCount { get; set; }
    public List<string> Errors { get; set; } = new();
}
