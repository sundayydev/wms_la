namespace BE_WMS_LA.Shared.DTOs.Supplier;

/// <summary>
/// DTO cho import Excel (Column names phải khớp với header Excel)
/// </summary>
public class SupplierImportDto
{
    public string? MaNCC { get; set; }
    public string? TenNhaCungCap { get; set; }
    public string? TenThuongHieu { get; set; }
    public string? NguoiLienHe { get; set; }
    public string? SoDienThoai { get; set; }
    public string? Email { get; set; }
    public string? DiaChi { get; set; }
    public string? ThanhPho { get; set; }
    public string? MaSoThue { get; set; }
    public string? NgânHang { get; set; }
    public string? SoTaiKhoan { get; set; }
    public string? TrangThai { get; set; }
}
