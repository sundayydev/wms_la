using System.ComponentModel.DataAnnotations;

namespace BE_WMS_LA.Shared.DTOs.Warehouse;

/// <summary>
/// DTO cho danh sách kho (Grid View)
/// </summary>
public class WarehouseListDto
{
    public Guid WarehouseID { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public Guid? ManagerUserID { get; set; }
    public string? ManagerName { get; set; } // Tên người quản lý
    public bool IsActive { get; set; }
    public int TotalUsers { get; set; } // Số nhân viên trong kho
    public int TotalProducts { get; set; } // Số loại sản phẩm tồn kho
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO chi tiết kho
/// </summary>
public class WarehouseDetailDto
{
    public Guid WarehouseID { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PhoneNumber { get; set; }
    public Guid? ManagerUserID { get; set; }
    public string? ManagerName { get; set; }
    public string? ManagerUsername { get; set; }
    public bool IsActive { get; set; }
    
    // Danh sách nhân viên trong kho
    public List<WarehouseUserDto> Users { get; set; } = new();
    
    // Thống kê tồn kho
    public WarehouseStockSummaryDto StockSummary { get; set; } = new();
    
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO nhân viên trong kho
/// </summary>
public class WarehouseUserDto
{
    public Guid UserID { get; set; }
    public string Username { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO tóm tắt tồn kho
/// </summary>
public class WarehouseStockSummaryDto
{
    public int TotalSKUs { get; set; } // Tổng số SKU trong kho
    public int TotalProducts { get; set; } // Tổng số sản phẩm (bao gồm variants)
    public int TotalQuantity { get; set; } // Tổng số lượng tất cả sản phẩm
    public int TotalAvailable { get; set; } // Tổng số lượng khả dụng
    public int TotalReserved { get; set; } // Tổng số lượng đã đặt trước
}

/// <summary>
/// DTO tạo mới kho
/// </summary>
public class CreateWarehouseDto
{
    [Required(ErrorMessage = "Tên kho là bắt buộc")]
    [StringLength(200, ErrorMessage = "Tên kho không được vượt quá 200 ký tự")]
    public string WarehouseName { get; set; } = string.Empty;
    
    [StringLength(500, ErrorMessage = "Địa chỉ không được vượt quá 500 ký tự")]
    public string? Address { get; set; }
    
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
    public string? PhoneNumber { get; set; }
    
    public Guid? ManagerUserID { get; set; }
}

/// <summary>
/// DTO cập nhật kho
/// </summary>
public class UpdateWarehouseDto
{
    [Required(ErrorMessage = "Tên kho là bắt buộc")]
    [StringLength(200, ErrorMessage = "Tên kho không được vượt quá 200 ký tự")]
    public string WarehouseName { get; set; } = string.Empty;
    
    [StringLength(500, ErrorMessage = "Địa chỉ không được vượt quá 500 ký tự")]
    public string? Address { get; set; }
    
    [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
    [StringLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự")]
    public string? PhoneNumber { get; set; }
    
    public Guid? ManagerUserID { get; set; }
    
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO cho tồn kho theo kho
/// </summary>
public class WarehouseStockDto
{
    public Guid StockID { get; set; }
    public Guid WarehouseID { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public Guid ComponentID { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string ComponentName { get; set; } = string.Empty;
    public Guid? VariantID { get; set; }
    public string? PartNumber { get; set; }
    public string? VariantName { get; set; }
    
    public int QuantityOnHand { get; set; }
    public int QuantityReserved { get; set; }
    public int QuantityAvailable { get; set; }
    
    public string? DefaultLocationCode { get; set; }
    public DateTime LastStockUpdate { get; set; }
    public DateTime? LastCountDate { get; set; }
}

/// <summary>
/// DTO request lấy tồn kho theo kho
/// </summary>
public class GetWarehouseStockRequest
{
    public Guid WarehouseID { get; set; }
    public string? SearchTerm { get; set; } // Tìm kiếm theo SKU, tên sản phẩm
    public bool? LowStock { get; set; } // Chỉ lấy sản phẩm sắp hết hàng
    public int? MinQuantity { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
