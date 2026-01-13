using BE_WMS_LA.Core.Configurations;
using BE_WMS_LA.Domain.Models;
using BE_WMS_LA.Shared.DTOs.Common;
using BE_WMS_LA.Shared.DTOs.Supplier;
using Microsoft.EntityFrameworkCore;
using MiniExcelLibs;

namespace BE_WMS_LA.Core.Services;

/// <summary>
/// Service quản lý nhà cung cấp
/// </summary>
public class SupplierService
{
    private readonly AppDbContext _context;

    public SupplierService(AppDbContext context)
    {
        _context = context;
    }

    #region CRUD Operations

    /// <summary>
    /// Lấy danh sách nhà cung cấp có phân trang và lọc
    /// </summary>
    public async Task<ApiResponse<List<SupplierListDto>>> GetAllAsync(
        int page = 1,
        int pageSize = 20,
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
                (s.BrandName != null && s.BrandName.ToLower().Contains(search)) ||
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

        // Đếm tổng số lượng
        var totalItems = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        // Sắp xếp và phân trang
        var suppliers = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(s => new SupplierListDto
            {
                SupplierID = s.SupplierID,
                SupplierCode = s.SupplierCode,
                SupplierName = s.SupplierName,
                BrandName = s.BrandName,
                ContactPerson = s.ContactPerson,
                PhoneNumber = s.PhoneNumber,
                Email = s.Email,
                City = s.City,
                LogoUrl = s.LogoUrl,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<SupplierListDto>>.SuccessResponse(suppliers, $"Lấy danh sách thành công ({totalItems} kết quả)");
    }

    /// <summary>
    /// Lấy danh sách tất cả nhà cung cấp (cho dropdown selector)
    /// </summary>
    public async Task<ApiResponse<List<SupplierListDto>>> GetAllForSelectAsync()
    {
        var suppliers = await _context.Suppliers
            .Where(s => s.DeletedAt == null && s.IsActive)
            .OrderBy(s => s.SupplierName)
            .Select(s => new SupplierListDto
            {
                SupplierID = s.SupplierID,
                SupplierCode = s.SupplierCode,
                SupplierName = s.SupplierName,
                BrandName = s.BrandName,
                ContactPerson = s.ContactPerson,
                PhoneNumber = s.PhoneNumber,
                Email = s.Email,
                City = s.City,
                LogoUrl = s.LogoUrl,
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();

        return ApiResponse<List<SupplierListDto>>.SuccessResponse(suppliers);
    }

    /// <summary>
    /// Lấy chi tiết nhà cung cấp
    /// </summary>
    public async Task<ApiResponse<SupplierDetailDto>> GetByIdAsync(Guid id)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.Components)
            .Include(s => s.PurchaseOrders)
            .FirstOrDefaultAsync(s => s.SupplierID == id && s.DeletedAt == null);

        if (supplier == null)
        {
            return ApiResponse<SupplierDetailDto>.ErrorResponse("Không tìm thấy nhà cung cấp");
        }

        var dto = MapToDetailDto(supplier);
        return ApiResponse<SupplierDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Tìm nhà cung cấp theo mã
    /// </summary>
    public async Task<ApiResponse<SupplierDetailDto>> GetByCodeAsync(string code)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.Components)
            .Include(s => s.PurchaseOrders)
            .FirstOrDefaultAsync(s => s.SupplierCode == code && s.DeletedAt == null);

        if (supplier == null)
        {
            return ApiResponse<SupplierDetailDto>.ErrorResponse("Không tìm thấy nhà cung cấp");
        }

        var dto = MapToDetailDto(supplier);
        return ApiResponse<SupplierDetailDto>.SuccessResponse(dto);
    }

    /// <summary>
    /// Tạo nhà cung cấp mới
    /// </summary>
    public async Task<ApiResponse<SupplierDetailDto>> CreateAsync(CreateSupplierDto dto)
    {
        // Kiểm tra mã nhà cung cấp đã tồn tại
        var existingCode = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.SupplierCode == dto.SupplierCode && s.DeletedAt == null);

        if (existingCode != null)
        {
            return ApiResponse<SupplierDetailDto>.ErrorResponse("Mã nhà cung cấp đã tồn tại");
        }

        // Kiểm tra email đã tồn tại (nếu có)
        if (!string.IsNullOrEmpty(dto.Email))
        {
            var existingEmail = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Email == dto.Email && s.DeletedAt == null);

            if (existingEmail != null)
            {
                return ApiResponse<SupplierDetailDto>.ErrorResponse("Email đã được sử dụng");
            }
        }

        // Tạo nhà cung cấp mới
        var supplier = new Supplier
        {
            SupplierID = Guid.NewGuid(),
            SupplierCode = dto.SupplierCode,
            SupplierName = dto.SupplierName,
            BrandName = dto.BrandName,
            ContactPerson = dto.ContactPerson,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            Address = dto.Address,
            City = dto.City,
            TaxCode = dto.TaxCode,
            BankAccount = dto.BankAccount,
            BankName = dto.BankName,
            Notes = dto.Notes,
            LogoUrl = dto.LogoUrl,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Suppliers.AddAsync(supplier);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(supplier.SupplierID);
    }

    /// <summary>
    /// Cập nhật nhà cung cấp
    /// </summary>
    public async Task<ApiResponse<SupplierDetailDto>> UpdateAsync(Guid id, UpdateSupplierDto dto)
    {
        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.SupplierID == id && s.DeletedAt == null);

        if (supplier == null)
        {
            return ApiResponse<SupplierDetailDto>.ErrorResponse("Không tìm thấy nhà cung cấp");
        }

        // Kiểm tra email trùng lặp (nếu có thay đổi)
        if (!string.IsNullOrEmpty(dto.Email) && dto.Email != supplier.Email)
        {
            var existingEmail = await _context.Suppliers
                .FirstOrDefaultAsync(s => s.Email == dto.Email && s.DeletedAt == null && s.SupplierID != id);

            if (existingEmail != null)
            {
                return ApiResponse<SupplierDetailDto>.ErrorResponse("Email đã được sử dụng");
            }
        }

        // Cập nhật các trường
        if (!string.IsNullOrEmpty(dto.SupplierName)) supplier.SupplierName = dto.SupplierName;
        if (dto.BrandName != null) supplier.BrandName = dto.BrandName;
        if (dto.ContactPerson != null) supplier.ContactPerson = dto.ContactPerson;
        if (dto.PhoneNumber != null) supplier.PhoneNumber = dto.PhoneNumber;
        if (dto.Email != null) supplier.Email = dto.Email;
        if (dto.Address != null) supplier.Address = dto.Address;
        if (dto.City != null) supplier.City = dto.City;
        if (dto.TaxCode != null) supplier.TaxCode = dto.TaxCode;
        if (dto.BankAccount != null) supplier.BankAccount = dto.BankAccount;
        if (dto.BankName != null) supplier.BankName = dto.BankName;
        if (dto.Notes != null) supplier.Notes = dto.Notes;
        if (dto.LogoUrl != null) supplier.LogoUrl = dto.LogoUrl;
        if (dto.IsActive.HasValue) supplier.IsActive = dto.IsActive.Value;

        supplier.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(supplier.SupplierID);
    }

    /// <summary>
    /// Xóa nhà cung cấp (soft delete)
    /// </summary>
    public async Task<ApiResponse<bool>> DeleteAsync(Guid id)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.PurchaseOrders)
            .FirstOrDefaultAsync(s => s.SupplierID == id);

        if (supplier == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy nhà cung cấp");
        }

        // Kiểm tra xem có đơn hàng liên quan không
        var hasPendingOrders = supplier.PurchaseOrders
            .Any(po => po.Status != "Completed" && po.Status != "Cancelled");

        if (hasPendingOrders)
        {
            return ApiResponse<bool>.ErrorResponse("Không thể xóa nhà cung cấp đang có đơn đặt hàng chưa hoàn thành");
        }

        supplier.DeletedAt = DateTime.UtcNow;
        supplier.IsActive = false;

        await _context.SaveChangesAsync();

        return ApiResponse<bool>.SuccessResponse(true, "Xóa nhà cung cấp thành công");
    }

    /// <summary>
    /// Kích hoạt/vô hiệu hóa nhà cung cấp
    /// </summary>
    public async Task<ApiResponse<bool>> ToggleStatusAsync(Guid id, bool isActive)
    {
        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.SupplierID == id && s.DeletedAt == null);

        if (supplier == null)
        {
            return ApiResponse<bool>.ErrorResponse("Không tìm thấy nhà cung cấp");
        }

        supplier.IsActive = isActive;
        supplier.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var message = isActive ? "Kích hoạt nhà cung cấp thành công" : "Vô hiệu hóa nhà cung cấp thành công";
        return ApiResponse<bool>.SuccessResponse(true, message);
    }

    #endregion

    #region Statistics

    /// <summary>
    /// Thống kê nhà cung cấp
    /// </summary>
    public async Task<ApiResponse<object>> GetStatisticsAsync()
    {
        var stats = new
        {
            Total = await _context.Suppliers.CountAsync(s => s.DeletedAt == null),
            Active = await _context.Suppliers.CountAsync(s => s.IsActive && s.DeletedAt == null),
            Inactive = await _context.Suppliers.CountAsync(s => !s.IsActive && s.DeletedAt == null),
            ByCity = await _context.Suppliers
                .Where(s => s.DeletedAt == null && s.City != null)
                .GroupBy(s => s.City)
                .Select(g => new { City = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(10)
                .ToListAsync(),
            RecentlyAdded = await _context.Suppliers
                .Where(s => s.DeletedAt == null && s.CreatedAt >= DateTime.UtcNow.AddDays(-30))
                .CountAsync()
        };

        return ApiResponse<object>.SuccessResponse(stats);
    }

    #endregion

    #region Kiểm tra tồn tại

    /// <summary>
    /// Kiểm tra mã nhà cung cấp đã tồn tại
    /// </summary>
    public async Task<ApiResponse<bool>> CheckCodeExistsAsync(string code, Guid? excludeId = null)
    {
        var query = _context.Suppliers
            .Where(s => s.SupplierCode == code && s.DeletedAt == null);

        if (excludeId.HasValue)
        {
            query = query.Where(s => s.SupplierID != excludeId.Value);
        }

        var exists = await query.AnyAsync();
        return ApiResponse<bool>.SuccessResponse(exists);
    }

    /// <summary>
    /// Export danh sách nhà cung cấp ra Excel (sử dụng MiniExcel)
    /// </summary>
    public async Task<byte[]> ExportToExcelAsync(string? search = null, bool? isActive = null, string? city = null)
    {
        // Get data
        var query = _context.Suppliers
            .Where(s => s.DeletedAt == null)
            .AsQueryable();

        if (!string.IsNullOrEmpty(search))
        {
            search = search.ToLower();
            query = query.Where(s =>
                s.SupplierCode.ToLower().Contains(search) ||
                s.SupplierName.ToLower().Contains(search) ||
                (s.BrandName != null && s.BrandName.ToLower().Contains(search)) ||
                (s.ContactPerson != null && s.ContactPerson.ToLower().Contains(search)) ||
                (s.PhoneNumber != null && s.PhoneNumber.Contains(search)) ||
                (s.Email != null && s.Email.ToLower().Contains(search)));
        }

        if (isActive.HasValue)
        {
            query = query.Where(s => s.IsActive == isActive.Value);
        }

        if (!string.IsNullOrEmpty(city))
        {
            query = query.Where(s => s.City != null && s.City.ToLower().Contains(city.ToLower()));
        }

        var suppliers = await query
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        // Prepare data for MiniExcel
        var excelData = suppliers.Select((s, index) => new
        {
            STT = index + 1,
            MaNCC = s.SupplierCode,
            TenNhaCungCap = s.SupplierName,
            TenThuongHieu = s.BrandName ?? "",
            NguoiLienHe = s.ContactPerson ?? "",
            SoDienThoai = s.PhoneNumber ?? "",
            Email = s.Email ?? "",
            DiaChi = s.Address ?? "",
            ThanhPho = s.City ?? "",
            MaSoThue = s.TaxCode ?? "",
            NgânHang = s.BankName ?? "",
            SoTaiKhoan = s.BankAccount ?? "",
            TrangThai = s.IsActive ? "Hoạt động" : "Ngừng GD",
            NgayTao = s.CreatedAt.ToString("dd/MM/yyyy")
        }).ToList();

        // Generate Excel using MiniExcel
        using var stream = new MemoryStream();
        stream.SaveAs(excelData, sheetName: "Nhà cung cấp", excelType: MiniExcelLibs.ExcelType.XLSX);
        return stream.ToArray();
    }

    /// <summary>
    /// Import nhà cung cấp từ Excel (Update nếu mã NCC đã tồn tại, Create nếu chưa)
    /// </summary>
    public async Task<ApiResponse<ImportSupplierResult>> ImportFromExcelAsync(Stream excelStream)
    {
        var result = new ImportSupplierResult();

        try
        {
            // Read Excel using MiniExcel (automatically uses first row as header)
            var rows = excelStream.Query<SupplierImportDto>().ToList();

            if (!rows.Any())
            {
                return ApiResponse<ImportSupplierResult>.ErrorResponse("File Excel không có dữ liệu");
            }

            foreach (var row in rows)
            {
                try
                {
                    // Validate required fields
                    if (string.IsNullOrWhiteSpace(row.MaNCC) || string.IsNullOrWhiteSpace(row.TenNhaCungCap))
                    {
                        result.Errors.Add($"Dòng bị bỏ qua: Thiếu Mã NCC hoặc Tên NCC");
                        result.SkippedCount++;
                        continue;
                    }

                    // Check if supplier code exists
                    var existingSupplier = await _context.Suppliers
                        .FirstOrDefaultAsync(s => s.SupplierCode == row.MaNCC && s.DeletedAt == null);

                    if (existingSupplier != null)
                    {
                        // UPDATE existing supplier
                        existingSupplier.SupplierName = row.TenNhaCungCap;
                        existingSupplier.BrandName = row.TenThuongHieu;
                        existingSupplier.ContactPerson = row.NguoiLienHe;
                        existingSupplier.PhoneNumber = row.SoDienThoai;
                        existingSupplier.Email = row.Email;
                        existingSupplier.Address = row.DiaChi;
                        existingSupplier.City = row.ThanhPho;
                        existingSupplier.TaxCode = row.MaSoThue;
                        existingSupplier.BankName = row.NgânHang;
                        existingSupplier.BankAccount = row.SoTaiKhoan;
                        existingSupplier.IsActive = row.TrangThai?.Equals("Hoạt động", StringComparison.OrdinalIgnoreCase) ?? true;
                        existingSupplier.UpdatedAt = DateTime.UtcNow;

                        _context.Suppliers.Update(existingSupplier);
                        result.UpdatedCount++;
                    }
                    else
                    {
                        // CREATE new supplier
                        var newSupplier = new Supplier
                        {
                            SupplierID = Guid.NewGuid(),
                            SupplierCode = row.MaNCC,
                            SupplierName = row.TenNhaCungCap,
                            BrandName = row.TenThuongHieu,
                            ContactPerson = row.NguoiLienHe,
                            PhoneNumber = row.SoDienThoai,
                            Email = row.Email,
                            Address = row.DiaChi,
                            City = row.ThanhPho,
                            TaxCode = row.MaSoThue,
                            BankName = row.NgânHang,
                            BankAccount = row.SoTaiKhoan,
                            IsActive = row.TrangThai?.Equals("Hoạt động", StringComparison.OrdinalIgnoreCase) ?? true,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };

                        await _context.Suppliers.AddAsync(newSupplier);
                        result.CreatedCount++;
                    }
                }
                catch (Exception ex)
                {
                    result.Errors.Add($"Lỗi khi xử lý Mã NCC '{row.MaNCC}': {ex.Message}");
                    result.SkippedCount++;
                }
            }

            // Save changes
            await _context.SaveChangesAsync();

            result.TotalProcessed = result.CreatedCount + result.UpdatedCount + result.SkippedCount;
            result.Success = true;
            result.Message = $"Đã import thành công: {result.CreatedCount} tạo mới, {result.UpdatedCount} cập nhật, {result.SkippedCount} bỏ qua";

            return ApiResponse<ImportSupplierResult>.SuccessResponse(result, result.Message);
        }
        catch (Exception ex)
        {
            return ApiResponse<ImportSupplierResult>.ErrorResponse($"Lỗi khi import: {ex.Message}");
        }
    }

    #endregion

    #region Private Methods

    private static SupplierDetailDto MapToDetailDto(Supplier supplier)
    {
        return new SupplierDetailDto
        {
            SupplierID = supplier.SupplierID,
            SupplierCode = supplier.SupplierCode,
            SupplierName = supplier.SupplierName,
            BrandName = supplier.BrandName,
            ContactPerson = supplier.ContactPerson,
            PhoneNumber = supplier.PhoneNumber,
            Email = supplier.Email,
            Address = supplier.Address,
            City = supplier.City,
            TaxCode = supplier.TaxCode,
            BankAccount = supplier.BankAccount,
            BankName = supplier.BankName,
            Notes = supplier.Notes,
            LogoUrl = supplier.LogoUrl,
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedAt,
            UpdatedAt = supplier.UpdatedAt,
            ProductCount = supplier.Components?.Count ?? 0,
            PurchaseOrderCount = supplier.PurchaseOrders?.Count ?? 0
        };
    }

    #endregion
}
