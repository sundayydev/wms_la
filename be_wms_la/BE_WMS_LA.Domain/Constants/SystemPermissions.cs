namespace BE_WMS_LA.Domain.Constants;

/// <summary>
/// Định nghĩa tất cả các quyền hệ thống cho WMS (Warehouse Management System)
/// </summary>
public static class SystemPermissions
{
    #region Tất cả quyền - Super Admin
    public const string AllPermissions = "All.Permissions";
    #endregion

    #region User Management - Quản lý người dùng
    public const string UserView = "User.View";
    public const string UserCreate = "User.Create";
    public const string UserEdit = "User.Edit";
    public const string UserDelete = "User.Delete";
    public const string UserAssignRole = "User.AssignRole";
    public const string UserAssignPermission = "User.AssignPermission";
    #endregion

    #region Role Management - Quản lý vai trò
    public const string RoleView = "Role.View";
    public const string RoleCreate = "Role.Create";
    public const string RoleEdit = "Role.Edit";
    public const string RoleDelete = "Role.Delete";
    #endregion

    #region Warehouse Management - Quản lý kho
    public const string WarehouseView = "Warehouse.View";
    public const string WarehouseCreate = "Warehouse.Create";
    public const string WarehouseEdit = "Warehouse.Edit";
    public const string WarehouseDelete = "Warehouse.Delete";
    public const string WarehouseManage = "Warehouse.Manage";
    #endregion

    #region Location Management - Quản lý vị trí kho (Zone, Aisle, Rack, Bin)
    public const string LocationView = "Location.View";
    public const string LocationCreate = "Location.Create";
    public const string LocationEdit = "Location.Edit";
    public const string LocationDelete = "Location.Delete";
    #endregion

    #region Product Management - Quản lý sản phẩm
    public const string ProductView = "Product.View";
    public const string ProductCreate = "Product.Create";
    public const string ProductEdit = "Product.Edit";
    public const string ProductDelete = "Product.Delete";
    public const string ProductImport = "Product.Import";
    public const string ProductExport = "Product.Export";
    #endregion

    #region Product Instance - Quản lý từng sản phẩm cụ thể (Serial, IMEI)
    public const string ProductInstanceView = "ProductInstance.View";
    public const string ProductInstanceCreate = "ProductInstance.Create";
    public const string ProductInstanceEdit = "ProductInstance.Edit";
    public const string ProductInstanceDelete = "ProductInstance.Delete";
    #endregion

    #region Inventory Management - Quản lý tồn kho
    public const string InventoryView = "Inventory.View";
    public const string InventoryAdjust = "Inventory.Adjust";
    public const string InventoryTransfer = "Inventory.Transfer";
    public const string InventoryCount = "Inventory.Count";
    #endregion

    #region Inbound (Receiving) - Nhập kho
    public const string InboundView = "Inbound.View";
    public const string InboundCreate = "Inbound.Create";
    public const string InboundEdit = "Inbound.Edit";
    public const string InboundDelete = "Inbound.Delete";
    public const string InboundApprove = "Inbound.Approve";
    public const string InboundReceive = "Inbound.Receive";
    public const string InboundCancel = "Inbound.Cancel";
    #endregion

    #region Outbound (Shipping) - Xuất kho
    public const string OutboundView = "Outbound.View";
    public const string OutboundCreate = "Outbound.Create";
    public const string OutboundEdit = "Outbound.Edit";
    public const string OutboundDelete = "Outbound.Delete";
    public const string OutboundApprove = "Outbound.Approve";
    public const string OutboundPick = "Outbound.Pick";
    public const string OutboundPack = "Outbound.Pack";
    public const string OutboundShip = "Outbound.Ship";
    public const string OutboundCancel = "Outbound.Cancel";
    #endregion

    #region Transfer - Chuyển kho nội bộ
    public const string TransferView = "Transfer.View";
    public const string TransferCreate = "Transfer.Create";
    public const string TransferEdit = "Transfer.Edit";
    public const string TransferApprove = "Transfer.Approve";
    public const string TransferComplete = "Transfer.Complete";
    public const string TransferCancel = "Transfer.Cancel";
    #endregion

    #region Supplier Management - Quản lý nhà cung cấp
    public const string SupplierView = "Supplier.View";
    public const string SupplierCreate = "Supplier.Create";
    public const string SupplierEdit = "Supplier.Edit";
    public const string SupplierDelete = "Supplier.Delete";
    #endregion

    #region Customer Management - Quản lý khách hàng
    public const string CustomerView = "Customer.View";
    public const string CustomerCreate = "Customer.Create";
    public const string CustomerEdit = "Customer.Edit";
    public const string CustomerDelete = "Customer.Delete";
    #endregion

    #region Category Management - Quản lý danh mục
    public const string CategoryView = "Category.View";
    public const string CategoryCreate = "Category.Create";
    public const string CategoryEdit = "Category.Edit";
    public const string CategoryDelete = "Category.Delete";
    #endregion

    #region Report - Báo cáo
    public const string ReportInventory = "Report.Inventory";
    public const string ReportInbound = "Report.Inbound";
    public const string ReportOutbound = "Report.Outbound";
    public const string ReportMovement = "Report.Movement";
    public const string ReportAudit = "Report.Audit";
    public const string ReportExport = "Report.Export";
    #endregion

    #region Audit Log - Nhật ký hệ thống
    public const string AuditLogView = "AuditLog.View";
    public const string AuditLogExport = "AuditLog.Export";
    #endregion

    #region Settings - Cài đặt hệ thống
    public const string SettingsView = "Settings.View";
    public const string SettingsEdit = "Settings.Edit";
    #endregion

    #region Dashboard - Bảng điều khiển
    public const string DashboardView = "Dashboard.View";
    public const string DashboardAdmin = "Dashboard.Admin";
    #endregion

    /// <summary>
    /// Lấy tất cả quyền ra list (dùng để seed database)
    /// </summary>
    public static List<string> GetAll()
    {
        return typeof(SystemPermissions)
            .GetFields(System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.FlattenHierarchy)
            .Where(fi => fi.IsLiteral && !fi.IsInitOnly)
            .Select(x => x.GetRawConstantValue()?.ToString() ?? string.Empty)
            .Where(x => !string.IsNullOrEmpty(x))
            .ToList();
    }

    /// <summary>
    /// Lấy các quyền theo module (prefix)
    /// </summary>
    public static List<string> GetByModule(string module)
    {
        return GetAll().Where(p => p.StartsWith($"{module}.")).ToList();
    }

    /// <summary>
    /// Lấy tất cả tên module
    /// </summary>
    public static List<string> GetAllModules()
    {
        return GetAll()
            .Select(p => p.Split('.')[0])
            .Distinct()
            .OrderBy(x => x)
            .ToList();
    }
}
