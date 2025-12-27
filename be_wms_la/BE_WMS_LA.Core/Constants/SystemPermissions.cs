using System.Reflection;

namespace BE_WMS_LA.Core.Constants;

/// <summary>
/// Định nghĩa tất cả các quyền trong hệ thống WMS
/// Quy tắc đặt tên: [Module].[Action]
/// </summary>
public static class SystemPermissions
{
    #region Dashboard - Tổng quan

    /// <summary>Xem dashboard tổng quan</summary>
    public const string DashboardView = "Dashboard.View";

    /// <summary>Xem báo cáo thống kê</summary>
    public const string DashboardReports = "Dashboard.Reports";

    #endregion

    #region User Management - Quản lý người dùng

    /// <summary>Xem danh sách người dùng</summary>
    public const string UserView = "User.View";

    /// <summary>Tạo người dùng mới</summary>
    public const string UserCreate = "User.Create";

    /// <summary>Chỉnh sửa thông tin người dùng</summary>
    public const string UserEdit = "User.Edit";

    /// <summary>Xóa người dùng</summary>
    public const string UserDelete = "User.Delete";

    /// <summary>Phân quyền người dùng</summary>
    public const string UserAssignPermission = "User.AssignPermission";

    /// <summary>Reset mật khẩu người dùng</summary>
    public const string UserResetPassword = "User.ResetPassword";

    /// <summary>Khóa/Mở khóa tài khoản</summary>
    public const string UserLockUnlock = "User.LockUnlock";

    #endregion

    #region Warehouse - Quản lý kho

    /// <summary>Xem danh sách kho</summary>
    public const string WarehouseView = "Warehouse.View";

    /// <summary>Tạo kho mới</summary>
    public const string WarehouseCreate = "Warehouse.Create";

    /// <summary>Chỉnh sửa thông tin kho</summary>
    public const string WarehouseEdit = "Warehouse.Edit";

    /// <summary>Xóa kho</summary>
    public const string WarehouseDelete = "Warehouse.Delete";

    /// <summary>Quản lý kho (full quyền)</summary>
    public const string WarehouseManage = "Warehouse.Manage";

    #endregion

    #region Product - Quản lý sản phẩm

    /// <summary>Xem danh sách sản phẩm</summary>
    public const string ProductView = "Product.View";

    /// <summary>Tạo sản phẩm mới</summary>
    public const string ProductCreate = "Product.Create";

    /// <summary>Chỉnh sửa sản phẩm</summary>
    public const string ProductEdit = "Product.Edit";

    /// <summary>Xóa sản phẩm</summary>
    public const string ProductDelete = "Product.Delete";

    /// <summary>Import sản phẩm hàng loạt</summary>
    public const string ProductImport = "Product.Import";

    /// <summary>Export danh sách sản phẩm</summary>
    public const string ProductExport = "Product.Export";

    #endregion

    #region Product Instance - Quản lý đơn vị sản phẩm (Serial/IMEI)

    /// <summary>Xem danh sách đơn vị sản phẩm</summary>
    public const string ProductInstanceView = "ProductInstance.View";

    /// <summary>Tạo đơn vị sản phẩm mới</summary>
    public const string ProductInstanceCreate = "ProductInstance.Create";

    /// <summary>Chỉnh sửa đơn vị sản phẩm</summary>
    public const string ProductInstanceEdit = "ProductInstance.Edit";

    /// <summary>Xóa đơn vị sản phẩm</summary>
    public const string ProductInstanceDelete = "ProductInstance.Delete";

    #endregion

    #region Inventory - Quản lý tồn kho

    /// <summary>Xem tồn kho</summary>
    public const string InventoryView = "Inventory.View";

    /// <summary>Điều chỉnh tồn kho</summary>
    public const string InventoryAdjust = "Inventory.Adjust";

    /// <summary>Kiểm kê kho</summary>
    public const string InventoryStocktake = "Inventory.Stocktake";

    /// <summary>Xem lịch sử tồn kho</summary>
    public const string InventoryHistory = "Inventory.History";

    #endregion

    #region Inbound - Nhập kho

    /// <summary>Xem danh sách phiếu nhập kho</summary>
    public const string InboundView = "Inbound.View";

    /// <summary>Tạo phiếu nhập kho</summary>
    public const string InboundCreate = "Inbound.Create";

    /// <summary>Chỉnh sửa phiếu nhập kho</summary>
    public const string InboundEdit = "Inbound.Edit";

    /// <summary>Xóa phiếu nhập kho</summary>
    public const string InboundDelete = "Inbound.Delete";

    /// <summary>Duyệt phiếu nhập kho</summary>
    public const string InboundApprove = "Inbound.Approve";

    /// <summary>Hủy phiếu nhập kho</summary>
    public const string InboundCancel = "Inbound.Cancel";

    #endregion

    #region Outbound - Xuất kho

    /// <summary>Xem danh sách phiếu xuất kho</summary>
    public const string OutboundView = "Outbound.View";

    /// <summary>Tạo phiếu xuất kho</summary>
    public const string OutboundCreate = "Outbound.Create";

    /// <summary>Chỉnh sửa phiếu xuất kho</summary>
    public const string OutboundEdit = "Outbound.Edit";

    /// <summary>Xóa phiếu xuất kho</summary>
    public const string OutboundDelete = "Outbound.Delete";

    /// <summary>Duyệt phiếu xuất kho</summary>
    public const string OutboundApprove = "Outbound.Approve";

    /// <summary>Hủy phiếu xuất kho</summary>
    public const string OutboundCancel = "Outbound.Cancel";

    #endregion

    #region Transfer - Chuyển kho

    /// <summary>Xem danh sách phiếu chuyển kho</summary>
    public const string TransferView = "Transfer.View";

    /// <summary>Tạo phiếu chuyển kho</summary>
    public const string TransferCreate = "Transfer.Create";

    /// <summary>Chỉnh sửa phiếu chuyển kho</summary>
    public const string TransferEdit = "Transfer.Edit";

    /// <summary>Xóa phiếu chuyển kho</summary>
    public const string TransferDelete = "Transfer.Delete";

    /// <summary>Duyệt phiếu chuyển kho</summary>
    public const string TransferApprove = "Transfer.Approve";

    /// <summary>Xác nhận nhận hàng chuyển kho</summary>
    public const string TransferReceive = "Transfer.Receive";

    #endregion

    #region Customer - Quản lý khách hàng

    /// <summary>Xem danh sách khách hàng</summary>
    public const string CustomerView = "Customer.View";

    /// <summary>Tạo khách hàng mới</summary>
    public const string CustomerCreate = "Customer.Create";

    /// <summary>Chỉnh sửa thông tin khách hàng</summary>
    public const string CustomerEdit = "Customer.Edit";

    /// <summary>Xóa khách hàng</summary>
    public const string CustomerDelete = "Customer.Delete";

    #endregion

    #region Supplier - Quản lý nhà cung cấp

    /// <summary>Xem danh sách nhà cung cấp</summary>
    public const string SupplierView = "Supplier.View";

    /// <summary>Tạo nhà cung cấp mới</summary>
    public const string SupplierCreate = "Supplier.Create";

    /// <summary>Chỉnh sửa thông tin nhà cung cấp</summary>
    public const string SupplierEdit = "Supplier.Edit";

    /// <summary>Xóa nhà cung cấp</summary>
    public const string SupplierDelete = "Supplier.Delete";

    #endregion

    #region Sales - Quản lý bán hàng

    /// <summary>Xem danh sách đơn hàng</summary>
    public const string SalesView = "Sales.View";

    /// <summary>Tạo đơn hàng mới</summary>
    public const string SalesCreate = "Sales.Create";

    /// <summary>Chỉnh sửa đơn hàng</summary>
    public const string SalesEdit = "Sales.Edit";

    /// <summary>Xóa đơn hàng</summary>
    public const string SalesDelete = "Sales.Delete";

    /// <summary>Duyệt đơn hàng</summary>
    public const string SalesApprove = "Sales.Approve";

    /// <summary>Hủy đơn hàng</summary>
    public const string SalesCancel = "Sales.Cancel";

    #endregion

    #region Warranty - Quản lý bảo hành

    /// <summary>Xem danh sách bảo hành</summary>
    public const string WarrantyView = "Warranty.View";

    /// <summary>Tạo phiếu bảo hành</summary>
    public const string WarrantyCreate = "Warranty.Create";

    /// <summary>Chỉnh sửa phiếu bảo hành</summary>
    public const string WarrantyEdit = "Warranty.Edit";

    /// <summary>Xóa phiếu bảo hành</summary>
    public const string WarrantyDelete = "Warranty.Delete";

    /// <summary>Cập nhật trạng thái bảo hành</summary>
    public const string WarrantyUpdateStatus = "Warranty.UpdateStatus";

    #endregion

    #region Repair - Quản lý sửa chữa

    /// <summary>Xem danh sách sửa chữa</summary>
    public const string RepairView = "Repair.View";

    /// <summary>Tạo phiếu sửa chữa</summary>
    public const string RepairCreate = "Repair.Create";

    /// <summary>Chỉnh sửa phiếu sửa chữa</summary>
    public const string RepairEdit = "Repair.Edit";

    /// <summary>Xóa phiếu sửa chữa</summary>
    public const string RepairDelete = "Repair.Delete";

    /// <summary>Cập nhật trạng thái sửa chữa</summary>
    public const string RepairUpdateStatus = "Repair.UpdateStatus";

    #endregion

    #region Report - Báo cáo

    /// <summary>Xem báo cáo nhập xuất tồn</summary>
    public const string ReportInventory = "Report.Inventory";

    /// <summary>Xem báo cáo doanh thu</summary>
    public const string ReportRevenue = "Report.Revenue";

    /// <summary>Xem báo cáo sản phẩm</summary>
    public const string ReportProduct = "Report.Product";

    /// <summary>Xuất báo cáo</summary>
    public const string ReportExport = "Report.Export";

    #endregion

    #region AuditLog - Nhật ký hệ thống

    /// <summary>Xem nhật ký hệ thống</summary>
    public const string AuditLogView = "AuditLog.View";

    /// <summary>Xuất nhật ký hệ thống</summary>
    public const string AuditLogExport = "AuditLog.Export";

    #endregion

    #region Settings - Cài đặt hệ thống

    /// <summary>Xem cài đặt hệ thống</summary>
    public const string SettingsView = "Settings.View";

    /// <summary>Chỉnh sửa cài đặt hệ thống</summary>
    public const string SettingsEdit = "Settings.Edit";

    #endregion

    #region Permission - Quản lý quyền

    /// <summary>Xem danh sách quyền</summary>
    public const string PermissionView = "Permission.View";

    /// <summary>Quản lý quyền (tạo, sửa, xóa)</summary>
    public const string PermissionManage = "Permission.Manage";

    #endregion

    #region Helper Methods

    /// <summary>
    /// Lấy tất cả các quyền trong hệ thống (dùng để seed database)
    /// </summary>
    /// <returns>Danh sách tất cả các quyền</returns>
    public static List<string> GetAll()
    {
        return typeof(SystemPermissions)
            .GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)
            .Where(fi => fi.IsLiteral && !fi.IsInitOnly)
            .Select(x => x.GetRawConstantValue()?.ToString() ?? string.Empty)
            .Where(x => !string.IsNullOrEmpty(x))
            .ToList();
    }

    /// <summary>
    /// Lấy tất cả quyền theo module
    /// </summary>
    /// <param name="module">Tên module (User, Warehouse, Product, ...)</param>
    /// <returns>Danh sách quyền của module</returns>
    public static List<string> GetByModule(string module)
    {
        return GetAll()
            .Where(p => p.StartsWith($"{module}.", StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    /// <summary>
    /// Lấy danh sách tất cả các module
    /// </summary>
    /// <returns>Danh sách tên module</returns>
    public static List<string> GetAllModules()
    {
        return GetAll()
            .Select(p => p.Split('.')[0])
            .Distinct()
            .OrderBy(m => m)
            .ToList();
    }

    /// <summary>
    /// Lấy quyền mặc định cho Admin (tất cả quyền)
    /// </summary>
    public static List<string> GetAdminPermissions() => GetAll();

    /// <summary>
    /// Lấy quyền mặc định cho nhân viên bán hàng (Receptionist)
    /// </summary>
    public static List<string> GetReceptionistPermissions()
    {
        return new List<string>
        {
            DashboardView,
            CustomerView, CustomerCreate, CustomerEdit,
            ProductView,
            ProductInstanceView,
            SalesView, SalesCreate, SalesEdit,
            WarrantyView, WarrantyCreate,
            RepairView, RepairCreate,
            InventoryView
        };
    }

    /// <summary>
    /// Lấy quyền mặc định cho kỹ thuật viên (Technician)
    /// </summary>
    public static List<string> GetTechnicianPermissions()
    {
        return new List<string>
        {
            DashboardView,
            ProductView,
            ProductInstanceView,
            WarrantyView, WarrantyEdit, WarrantyUpdateStatus,
            RepairView, RepairEdit, RepairUpdateStatus,
            InventoryView
        };
    }

    /// <summary>
    /// Lấy quyền mặc định cho thủ kho (Warehouse Staff)
    /// </summary>
    public static List<string> GetWarehouseStaffPermissions()
    {
        return new List<string>
        {
            DashboardView,
            WarehouseView,
            ProductView,
            ProductInstanceView, ProductInstanceCreate, ProductInstanceEdit,
            InventoryView, InventoryAdjust, InventoryStocktake, InventoryHistory,
            InboundView, InboundCreate, InboundEdit,
            OutboundView, OutboundCreate, OutboundEdit,
            TransferView, TransferCreate, TransferEdit, TransferReceive
        };
    }

    #endregion
}
