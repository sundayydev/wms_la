import React, { useState, useEffect } from 'react';
import { Layout, Menu, Drawer } from 'antd';
import { useLocation, Link } from 'react-router-dom';


// Import Icons (Kết hợp AntD và React Icons cho phong phú)
import {
    MdSpaceDashboard,
    MdInventory,
    MdOutlineShoppingCart,
    MdPointOfSale,
    MdOutlineQrCodeScanner,
    MdOutlinePrint,
    MdOutlineAssignment,
    MdOutlineLocalShipping
} from "react-icons/md";
import {
    FaWarehouse,
    FaTools,
    FaMoneyBillWave,
    FaUserCog,
    FaFileInvoiceDollar,
    FaClipboardCheck,
    FaBookOpen,
    FaBoxes
} from "react-icons/fa";
import {
    BsBoxSeam,
    BsUpcScan,
    BsClipboard2Check,
    BsCart4,
    BsGear,
    BsPrinter
} from "react-icons/bs";
import {
    RiExchangeDollarLine,
    RiHistoryFill,
    RiFileListLine,
    RiCustomerService2Line,
    RiExchangeLine
} from "react-icons/ri";
import {
    HiOutlineDocumentReport,
    HiOutlineClipboardList,
    HiOutlineDocumentDuplicate
} from "react-icons/hi";
import {
    AiOutlineBarcode,
    AiOutlineTool,
    AiOutlineSafety,
    AiOutlineAppstore
} from "react-icons/ai";
import {
    BiPackage,
    BiTransfer,
    BiCategoryAlt
} from "react-icons/bi";
import {
    SwapOutlined,
    TagsOutlined,
    TeamOutlined,
    FileTextOutlined,
    SettingOutlined,
    SafetyCertificateOutlined,
    BellOutlined,
    ShopOutlined,
    UserOutlined,
    SolutionOutlined,
    DatabaseOutlined,
    FileDoneOutlined,
    ToolOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    FileSearchOutlined,
    QrcodeOutlined,
    PrinterOutlined,
    ScheduleOutlined,
    AuditOutlined,
    BookOutlined,
    ContainerOutlined,
    ReconciliationOutlined,
    NodeIndexOutlined,
    PartitionOutlined
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
    collapsed: boolean;
    isMobile: boolean;
    openDrawer: boolean;
    setOpenDrawer: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    collapsed,
    isMobile,
    openDrawer,
    setOpenDrawer
}) => {
    const location = useLocation();

    // Tự động tính parent key từ URL path
    // VD: /admin/inventory/products -> 'inventory'
    const getParentKeyFromPath = (path: string): string => {
        const segments = path.split('/').filter(Boolean);
        // Skip 'admin' prefix if present
        const startIndex = segments[0] === 'admin' ? 1 : 0;
        return segments.length > startIndex ? segments[startIndex] : '';
    };

    // State quản lý các submenu đang mở
    const [openKeys, setOpenKeys] = useState<string[]>(() => {
        const parentKey = getParentKeyFromPath(location.pathname);
        return parentKey ? [parentKey] : [];
    });

    // Khi URL thay đổi, tự động mở submenu tương ứng
    useEffect(() => {
        const parentKey = getParentKeyFromPath(location.pathname);
        if (parentKey && !openKeys.includes(parentKey)) {
            setOpenKeys(prev => [...prev, parentKey]);
        }
    }, [location.pathname]);

    // Handler khi user click mở/đóng submenu
    const handleOpenChange = (keys: string[]) => {
        setOpenKeys(keys);
    };

    // --- CẤU TRÚC MENU ĐẦY ĐỦ DỰA TRÊN DATABASE ---
    const menuItems = [
        // ============================================================
        // 1. TỔNG QUAN (DASHBOARD)
        // ============================================================
        {
            key: '/admin/dashboard',
            icon: <MdSpaceDashboard className="text-lg" />,
            label: <Link to="/admin/dashboard">Tổng quan</Link>,
        },

        // ============================================================
        // 2. QUẢN LÝ KHO (INVENTORY)
        // Tables: Components, Categories, ProductInstances, Warehouses,
        //         InventoryTransactions, StockTransfers, ProductLifecycleHistory
        // ============================================================
        {
            key: 'inventory',
            icon: <MdInventory className="text-lg" />,
            label: 'Quản lý Kho',
            children: [
                {
                    key: '/admin/inventory/products',
                    icon: <BsBoxSeam />,
                    label: <Link to="/admin/inventory/products">Sản phẩm</Link>,
                },
                {
                    key: '/admin/inventory/instances',
                    icon: <BsUpcScan />,
                    label: <Link to="/admin/inventory/instances">Quản lý Serial/IMEI</Link>,
                },
                {
                    key: '/admin/inventory/categories',
                    icon: <BiCategoryAlt />,
                    label: <Link to="/admin/inventory/categories">Danh mục sản phẩm</Link>,
                },
                {
                    key: '/admin/inventory/warehouses',
                    icon: <FaWarehouse />,
                    label: <Link to="/admin/inventory/warehouses">Kho hàng</Link>,
                },
                {
                    key: '/admin/inventory/transfers',
                    icon: <BiTransfer />,
                    label: <Link to="/admin/inventory/transfers">Chuyển kho</Link>,
                },
                {
                    key: '/admin/inventory/transactions',
                    icon: <RiHistoryFill />,
                    label: <Link to="/admin/inventory/transactions">Lịch sử xuất nhập</Link>,
                },
                {
                    key: '/admin/inventory/lifecycle',
                    icon: <NodeIndexOutlined />,
                    label: <Link to="/admin/inventory/lifecycle">Vòng đời sản phẩm</Link>,
                },
            ],
        },

        // ============================================================
        // 3. DANH MỤC SẢN PHẨM (PRODUCT CATALOG)
        // Tables: ProductKnowledgeBase, ProductBundles, ProductSpareParts, 
        //         ProductCommonIssues, CommonIssueSolutions
        // ============================================================
        {
            key: 'catalog',
            icon: <FaBookOpen className="text-lg" />,
            label: 'Thông tin sản phẩm',
            children: [
                {
                    key: '/admin/catalog/knowledge-base',
                    icon: <BookOutlined />,
                    label: <Link to="/admin/catalog/knowledge-base">Kho tri thức</Link>,
                },
                {
                    key: '/admin/catalog/bundles',
                    icon: <FaBoxes />,
                    label: <Link to="/admin/catalog/bundles">Đóng gói sản phẩm</Link>,
                },
                {
                    key: '/admin/catalog/spare-parts',
                    icon: <AiOutlineTool />,
                    label: <Link to="/admin/catalog/spare-parts">Linh kiện thay thế</Link>,
                },
                {
                    key: '/admin/catalog/common-issues',
                    icon: <ExclamationCircleOutlined />,
                    label: <Link to="/admin/catalog/common-issues">Lỗi phổ biến</Link>,
                },
            ],
        },

        // ============================================================
        // 4. MUA HÀNG / NHẬP KHO (PURCHASING)
        // Tables: Suppliers, PurchaseOrders, PurchaseOrderDetails, DraftOrders (INBOUND)
        // ============================================================
        {
            key: 'purchasing',
            icon: <MdOutlineShoppingCart className="text-lg" />,
            label: 'Nhập hàng',
            children: [
                {
                    key: '/admin/purchasing/create',
                    icon: <MdOutlineQrCodeScanner />,
                    label: <Link to="/admin/purchasing/create">Phiếu nhập mới</Link>,
                },
                {
                    key: '/admin/purchasing/orders',
                    icon: <ContainerOutlined />,
                    label: <Link to="/admin/purchasing/orders">Đơn đặt hàng (PO)</Link>,
                },
                {
                    key: '/admin/purchasing/receiving',
                    icon: <BiPackage />,
                    label: <Link to="/admin/purchasing/receiving">Nhận hàng theo PO</Link>,
                },
                {
                    key: '/admin/purchasing/suppliers',
                    icon: <ShopOutlined />,
                    label: <Link to="/admin/purchasing/suppliers">Nhà cung cấp</Link>,
                },
            ],
        },

        // ============================================================
        // 5. BÁN HÀNG (SALES)
        // Tables: Customers, CustomerContacts, SalesOrders, SalesOrderDetails, 
        //         DraftOrders (SALES, DEMO)
        // ============================================================
        {
            key: 'sales',
            icon: <MdPointOfSale className="text-lg" />,
            label: 'Bán hàng',
            children: [
                {
                    key: '/admin/sales/draft',
                    icon: <MdOutlineQrCodeScanner />,
                    label: <Link to="/admin/sales/draft">Tạo phiếu xuất</Link>,
                },
                {
                    key: '/admin/sales/orders',
                    icon: <ReconciliationOutlined />,
                    label: <Link to="/admin/sales/orders">Đơn hàng</Link>,
                },
                {
                    key: '/admin/sales/demo',
                    icon: <MdOutlineAssignment />,
                    label: <Link to="/admin/sales/demo">Xuất Demo</Link>,
                },
                {
                    key: '/admin/sales/customers',
                    icon: <TeamOutlined />,
                    label: <Link to="/admin/sales/customers">Khách hàng</Link>,
                },
            ],
        },

        // ============================================================
        // 6. BÁO GIÁ (QUOTATIONS)
        // Tables: Quotations, QuotationDetails
        // ============================================================
        {
            key: 'quotations',
            icon: <FaFileInvoiceDollar className="text-lg" />,
            label: 'Báo giá',
            children: [
                {
                    key: '/admin/quotations/create',
                    icon: <HiOutlineDocumentDuplicate />,
                    label: <Link to="/admin/quotations/create">Tạo báo giá</Link>,
                },
                {
                    key: '/admin/quotations/list',
                    icon: <RiFileListLine />,
                    label: <Link to="/admin/quotations/list">Danh sách báo giá</Link>,
                },
            ],
        },

        // ============================================================
        // 7. SỬA CHỮA & BẢO HÀNH (REPAIRS)
        // Tables: Repairs, RepairParts, RepairStatusHistory
        // ============================================================
        {
            key: 'repairs',
            icon: <FaTools className="text-lg" />,
            label: 'Sửa chữa & Bảo hành',
            children: [
                {
                    key: '/admin/repairs/receive',
                    icon: <SolutionOutlined />,
                    label: <Link to="/admin/repairs/receive">Tiếp nhận máy</Link>,
                },
                {
                    key: '/admin/repairs/list',
                    icon: <ToolOutlined />,
                    label: <Link to="/admin/repairs/list">Phiếu sửa chữa</Link>,
                },
                {
                    key: '/admin/repairs/warranty-check',
                    icon: <FileSearchOutlined />,
                    label: <Link to="/admin/repairs/warranty-check">Tra cứu bảo hành</Link>,
                },
                {
                    key: '/admin/repairs/parts',
                    icon: <AiOutlineTool />,
                    label: <Link to="/admin/repairs/parts">Linh kiện đã thay</Link>,
                },
            ],
        },

        // ============================================================
        // 8. KIỂM TRA CHẤT LƯỢNG (QC / INSPECTION)
        // Tables: TechnicalInspections, TechnicalInspectionItems, InspectionTemplates
        // ============================================================
        {
            key: 'inspection',
            icon: <FaClipboardCheck className="text-lg" />,
            label: 'Kiểm tra QC',
            children: [
                {
                    key: '/admin/inspection/create',
                    icon: <BsClipboard2Check />,
                    label: <Link to="/admin/inspection/create">Tạo phiếu kiểm tra</Link>,
                },
                {
                    key: '/admin/inspection/list',
                    icon: <HiOutlineClipboardList />,
                    label: <Link to="/admin/inspection/list">Danh sách phiếu QC</Link>,
                },
                {
                    key: '/admin/inspection/templates',
                    icon: <ScheduleOutlined />,
                    label: <Link to="/admin/inspection/templates">Mẫu checklist</Link>,
                },
            ],
        },

        // ============================================================
        // 9. IN NHÃN (LABEL PRINTING)
        // Tables: LabelTemplates, LabelPrintJobs, LabelPrintHistory
        // ============================================================
        {
            key: 'labels',
            icon: <MdOutlinePrint className="text-lg" />,
            label: 'In nhãn',
            children: [
                {
                    key: '/admin/labels/print',
                    icon: <PrinterOutlined />,
                    label: <Link to="/admin/labels/print">In nhãn sản phẩm</Link>,
                },
                {
                    key: '/admin/labels/templates',
                    icon: <QrcodeOutlined />,
                    label: <Link to="/admin/labels/templates">Mẫu nhãn</Link>,
                },
                {
                    key: '/admin/labels/history',
                    icon: <RiHistoryFill />,
                    label: <Link to="/admin/labels/history">Lịch sử in</Link>,
                },
            ],
        },

        // ============================================================
        // 10. TÀI CHÍNH (FINANCE)
        // Tables: Payments
        // ============================================================
        {
            key: 'finance',
            icon: <FaMoneyBillWave className="text-lg" />,
            label: 'Tài chính',
            children: [
                {
                    key: '/admin/finance/payments',
                    icon: <RiExchangeDollarLine />,
                    label: <Link to="/admin/finance/payments">Phiếu thu chi</Link>,
                },
                {
                    key: '/admin/finance/customer-debts',
                    icon: <FileDoneOutlined />,
                    label: <Link to="/admin/finance/customer-debts">Công nợ khách hàng</Link>,
                },
                {
                    key: '/admin/finance/supplier-debts',
                    icon: <FileDoneOutlined />,
                    label: <Link to="/admin/finance/supplier-debts">Công nợ nhà cung cấp</Link>,
                },
            ],
        },

        // ============================================================
        // 11. BÁO CÁO (REPORTS)
        // ============================================================
        {
            key: 'reports',
            icon: <HiOutlineDocumentReport className="text-lg" />,
            label: 'Báo cáo',
            children: [
                {
                    key: '/admin/reports/inventory',
                    icon: <DatabaseOutlined />,
                    label: <Link to="/admin/reports/inventory">Tồn kho</Link>,
                },
                {
                    key: '/admin/reports/sales',
                    icon: <MdPointOfSale />,
                    label: <Link to="/admin/reports/sales">Doanh thu</Link>,
                },
                {
                    key: '/admin/reports/repairs',
                    icon: <FaTools />,
                    label: <Link to="/admin/reports/repairs">Sửa chữa</Link>,
                },
                {
                    key: '/admin/reports/products',
                    icon: <AiOutlineBarcode />,
                    label: <Link to="/admin/reports/products">Sản phẩm</Link>,
                },
            ],
        },

        // ============================================================
        // 12. HỆ THỐNG (SYSTEM)
        // Tables: User, Permission, UserPermission, Roles, RolePermissions,
        //         AuditLogs, AppSettings, Notifications, DeviceTokens
        // ============================================================
        {
            key: 'system',
            icon: <FaUserCog className="text-lg" />,
            label: 'Hệ thống',
            children: [
                {
                    key: '/admin/system/users',
                    icon: <TeamOutlined />,
                    label: <Link to="/admin/system/users">Nhân viên</Link>,
                },
                {
                    key: '/admin/system/permissions',
                    icon: <SafetyCertificateOutlined />,
                    label: <Link to="/admin/system/permissions">Phân quyền</Link>,
                },
                {
                    key: '/admin/system/audit-logs',
                    icon: <AuditOutlined />,
                    label: <Link to="/admin/system/audit-logs">Nhật ký hoạt động</Link>,
                },
                {
                    key: '/admin/system/notifications',
                    icon: <BellOutlined />,
                    label: <Link to="/admin/system/notifications">Thông báo</Link>,
                },
                {
                    key: '/admin/system/settings',
                    icon: <SettingOutlined />,
                    label: <Link to="/admin/system/settings">Cấu hình</Link>,
                },
            ],
        },
    ];

    // Component Logo
    const BrandLogo = () => (
        <div className="h-16 flex items-center justify-center border-b border-gray-100 bg-white">
            <div className="flex items-center gap-2">
                {/* Giả lập Logo */}
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    LA
                </div>
                {(!collapsed || isMobile) && (
                    <h1 className="font-bold text-xl text-gray-800 m-0 tracking-tight">
                        WMS <span className="text-blue-600">LA</span>
                    </h1>
                )}
            </div>
        </div>
    );

    // Component Menu
    const MainMenu = () => (
        <Menu
            theme="light"
            mode="inline"
            openKeys={openKeys}
            onOpenChange={handleOpenChange}
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="border-none font-medium text-gray-600 custom-scrollbar"
            style={{ background: 'transparent', height: 'calc(100vh - 64px)', overflowY: 'auto' }}
            onClick={() => isMobile && setOpenDrawer(false)}
        />
    );

    return (
        <>
            {/* SIDEBAR DESKTOP */}
            {!isMobile && (
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={260} // Rộng hơn chút để chứa tên menu dài
                    theme="light"
                    className="shadow-sm border-r border-gray-200 z-20 h-screen fixed left-0 top-0"
                >
                    <BrandLogo />
                    <MainMenu />
                </Sider>
            )}

            {/* DRAWER MOBILE */}
            <Drawer
                title={<span className="text-blue-600 font-bold text-xl">WMS LA</span>}
                placement="left"
                onClose={() => setOpenDrawer(false)}
                open={openDrawer}
                width={260}
                styles={{ body: { padding: 0 } }}
            >
                <MainMenu />
            </Drawer>
        </>
    );
};

export default React.memo(Sidebar);