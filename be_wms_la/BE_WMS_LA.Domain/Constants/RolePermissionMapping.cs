namespace BE_WMS_LA.Domain.Constants;

/// <summary>
/// Định nghĩa mapping quyền mặc định cho từng vai trò trong hệ thống WMS
/// Dựa theo tài liệu phân quyền RolePermission.md
/// </summary>
public static class RolePermissionMapping
{
    /// <summary>
    /// Lấy danh sách quyền mặc định theo role
    /// </summary>
    /// <param name="role">Tên vai trò (ADMIN, WAREHOUSE, RECEPTIONIST, TECHNICIAN)</param>
    /// <returns>Danh sách các permission tương ứng</returns>
    public static List<string> GetPermissionsByRole(string role)
    {
        return role?.ToUpper() switch
        {
            "ADMIN" => GetAdminPermissions(),
            "WAREHOUSE" => GetWarehousePermissions(),
            "RECEPTIONIST" => GetReceptionistPermissions(),
            "TECHNICIAN" => GetTechnicianPermissions(),
            _ => new List<string>()
        };
    }

    /// <summary>
    /// Quyền của ADMIN - Có tất cả quyền trong hệ thống
    /// </summary>
    private static List<string> GetAdminPermissions()
    {
        // Admin có tất cả quyền
        return SystemPermissions.GetAll();
    }

    /// <summary>
    /// Quyền của WAREHOUSE (Quản lý kho)
    /// Trưởng kho hoặc người quản lý vận hành. Có quyền duyệt phiếu và quản lý dữ liệu kho.
    /// </summary>
    private static List<string> GetWarehousePermissions()
    {
        return new List<string>
        {
            // Dashboard & Báo cáo
            SystemPermissions.DashboardView,
            SystemPermissions.ReportInventory,
            SystemPermissions.ReportInbound,
            SystemPermissions.ReportOutbound,
            SystemPermissions.ReportMovement,
            SystemPermissions.ReportAudit,
            SystemPermissions.ReportExport,

            // Quản lý Sản phẩm & Danh mục
            SystemPermissions.CategoryView,
            SystemPermissions.CategoryCreate,
            SystemPermissions.CategoryEdit,
            SystemPermissions.ProductView,
            SystemPermissions.ProductCreate,
            SystemPermissions.ProductEdit,
            SystemPermissions.ProductImport,
            SystemPermissions.ProductExport,
            SystemPermissions.ProductInstanceView,
            SystemPermissions.ProductInstanceCreate,
            SystemPermissions.ProductInstanceEdit,

            // Nhập kho (Inbound)
            SystemPermissions.InboundView,
            SystemPermissions.InboundCreate,
            SystemPermissions.InboundEdit,
            SystemPermissions.InboundApprove,
            SystemPermissions.InboundReceive,
            SystemPermissions.InboundCancel,

            // Xuất kho (Outbound)
            SystemPermissions.OutboundView,
            SystemPermissions.OutboundCreate,
            SystemPermissions.OutboundEdit,
            SystemPermissions.OutboundApprove,
            SystemPermissions.OutboundCancel,

            // Tồn kho & Vị trí
            SystemPermissions.InventoryView,
            SystemPermissions.InventoryCount,
            SystemPermissions.InventoryAdjust,
            SystemPermissions.InventoryTransfer,
            SystemPermissions.LocationView,
            SystemPermissions.LocationCreate,
            SystemPermissions.LocationEdit,
            SystemPermissions.LocationDelete,
            SystemPermissions.WarehouseView,
            SystemPermissions.WarehouseManage,

            // Đối tác
            SystemPermissions.SupplierView,
            SystemPermissions.SupplierCreate,
            SystemPermissions.SupplierEdit,
            SystemPermissions.CustomerView,
            SystemPermissions.CustomerCreate,
            SystemPermissions.CustomerEdit
        };
    }

    /// <summary>
    /// Quyền của RECEPTIONIST (Tiếp nhận/Lễ tân)
    /// Nhân viên văn phòng kho hoặc lễ tân, chuyên xử lý giấy tờ đầu vào.
    /// </summary>
    private static List<string> GetReceptionistPermissions()
    {
        return new List<string>
        {
            // Nhập hàng & Đối tác
            SystemPermissions.InboundView,
            SystemPermissions.InboundCreate,
            SystemPermissions.InboundEdit,
            SystemPermissions.InboundReceive,
            SystemPermissions.SupplierView,
            SystemPermissions.SupplierCreate,
            SystemPermissions.SupplierEdit,

            // Khách hàng (Hỗ trợ)
            SystemPermissions.CustomerView,
            SystemPermissions.CustomerCreate,
            SystemPermissions.CustomerEdit,

            // Tra cứu thông tin
            SystemPermissions.DashboardView,
            SystemPermissions.ProductView,
            SystemPermissions.WarehouseView,
            SystemPermissions.InventoryView
        };
    }

    /// <summary>
    /// Quyền của TECHNICIAN (Kỹ thuật viên)
    /// Nhân viên kho thực địa, sử dụng máy quét hoặc App để thao tác.
    /// </summary>
    private static List<string> GetTechnicianPermissions()
    {
        return new List<string>
        {
            // Xuất hàng
            SystemPermissions.OutboundView,
            SystemPermissions.OutboundPick,
            SystemPermissions.OutboundPack,
            SystemPermissions.OutboundShip,

            // Nhập hàng
            SystemPermissions.InboundView,
            SystemPermissions.InboundReceive,

            // Kho bãi
            SystemPermissions.InventoryView,
            SystemPermissions.InventoryCount,
            SystemPermissions.InventoryTransfer,

            // Tra cứu
            SystemPermissions.DashboardView,
            SystemPermissions.ProductView,
            SystemPermissions.LocationView
        };
    }

    /// <summary>
    /// Kiểm tra xem role có hợp lệ không
    /// </summary>
    public static bool IsValidRole(string role)
    {
        var validRoles = new[] { "ADMIN", "WAREHOUSE", "RECEPTIONIST", "TECHNICIAN" };
        return validRoles.Contains(role?.ToUpper());
    }

    /// <summary>
    /// Lấy danh sách tất cả roles
    /// </summary>
    public static List<string> GetAllRoles()
    {
        return new List<string> { "ADMIN", "WAREHOUSE", "RECEPTIONIST", "TECHNICIAN" };
    }
}
