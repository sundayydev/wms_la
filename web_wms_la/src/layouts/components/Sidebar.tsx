import React, { useState, useEffect } from 'react';
import { Layout, Menu, Drawer } from 'antd';
import { useLocation, Link } from 'react-router-dom';


// Import Icons (Kết hợp AntD và React Icons cho phong phú)
import {
    MdSpaceDashboard,
    MdInventory,
    MdOutlineShoppingCart,
    MdPointOfSale
} from "react-icons/md";
import {
    FaWarehouse,
    FaTools,
    FaMoneyBillWave,
    FaUserCog
} from "react-icons/fa";
import {
    BsBoxSeam,
    BsUpcScan
} from "react-icons/bs";
import {
    RiExchangeDollarLine,
    RiHistoryFill
} from "react-icons/ri";
import {
    SwapOutlined,
    TagsOutlined,
    TeamOutlined,
    FileTextOutlined,
    SettingOutlined,
    SafetyCertificateOutlined
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
    // VD: /inventory/products -> 'inventory'
    const getParentKeyFromPath = (path: string): string => {
        const segments = path.split('/').filter(Boolean);
        return segments.length > 0 ? segments[0] : '';
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

    // --- CẤU TRÚC MENU MỚI DỰA TRÊN DB (Sử dụng Link để không reload trang) ---
    const menuItems = [
        // 1. DASHBOARD
        {
            key: '/',
            icon: <MdSpaceDashboard className="text-lg" />,
            label: <Link to="/">Tổng quan</Link>,
        },

        // 2. KHO HÀNG (INVENTORY)
        {
            key: 'inventory',
            icon: <MdInventory className="text-lg" />,
            label: 'Quản lý Kho',
            children: [
                {
                    key: '/inventory/products',
                    icon: <BsBoxSeam />,
                    label: <Link to="/inventory/products">Danh sách sản phẩm</Link>,
                },
                {
                    key: '/inventory/instances',
                    icon: <BsUpcScan />,
                    label: <Link to="/inventory/instances">Quản lý Serial/IMEI</Link>,
                },
                {
                    key: '/inventory/categories',
                    icon: <TagsOutlined />,
                    label: <Link to="/inventory/categories">Danh mục hàng</Link>,
                },
                {
                    key: '/inventory/warehouses',
                    icon: <FaWarehouse />,
                    label: <Link to="/inventory/warehouses">Danh sách Kho</Link>,
                },
                {
                    key: '/inventory/transfers',
                    icon: <SwapOutlined />,
                    label: <Link to="/inventory/transfers">Chuyển kho</Link>,
                },
                {
                    key: '/inventory/history',
                    icon: <RiHistoryFill />,
                    label: <Link to="/inventory/history">Lịch sử xuất nhập</Link>,
                },
            ],
        },

        // 3. MUA HÀNG (PURCHASING)
        {
            key: 'purchasing',
            icon: <MdOutlineShoppingCart className="text-lg" />,
            label: 'Nhập hàng',
            children: [
                {
                    key: '/purchasing/orders',
                    label: <Link to="/purchasing/orders">Đơn đặt hàng (PO)</Link>,
                },
                {
                    key: '/purchasing/suppliers',
                    label: <Link to="/purchasing/suppliers">Nhà cung cấp</Link>,
                },
            ],
        },

        // 4. BÁN HÀNG (SALES)
        {
            key: 'sales',
            icon: <MdPointOfSale className="text-lg" />,
            label: 'Bán hàng',
            children: [
                {
                    key: '/sales/create',
                    label: <Link to="/sales/create">Tạo đơn bán (POS)</Link>,
                },
                {
                    key: '/sales/orders',
                    label: <Link to="/sales/orders">Danh sách đơn hàng</Link>,
                },
                {
                    key: '/sales/customers',
                    label: <Link to="/sales/customers">Khách hàng</Link>,
                },
            ],
        },

        // 5. DỊCH VỤ & BẢO HÀNH (REPAIRS)
        {
            key: 'repairs',
            icon: <FaTools className="text-lg" />,
            label: 'Dịch vụ sửa chữa',
            children: [
                {
                    key: '/repairs/list',
                    label: <Link to="/repairs/list">Phiếu tiếp nhận</Link>,
                },
                {
                    key: '/repairs/warranty',
                    label: <Link to="/repairs/warranty">Tra cứu bảo hành</Link>,
                },
            ],
        },

        // 6. TÀI CHÍNH (FINANCE)
        {
            key: 'finance',
            icon: <FaMoneyBillWave className="text-lg" />,
            label: 'Sổ quỹ & Công nợ',
            children: [
                {
                    key: '/finance/payments',
                    label: <Link to="/finance/payments">Phiếu thu chi</Link>,
                },
                {
                    key: '/finance/debts',
                    label: <Link to="/finance/debts">Công nợ đối tác</Link>,
                },
            ],
        },

        // 7. HỆ THỐNG (SYSTEM)
        {
            key: 'system',
            icon: <FaUserCog className="text-lg" />,
            label: 'Hệ thống',
            children: [
                {
                    key: '/system/users',
                    icon: <TeamOutlined />,
                    label: <Link to="/system/users">Nhân viên</Link>,
                },
                {
                    key: '/system/permissions',
                    icon: <SafetyCertificateOutlined />,
                    label: <Link to="/system/permissions">Phân quyền</Link>,
                },
                {
                    key: '/system/audit-logs',
                    icon: <FileTextOutlined />,
                    label: <Link to="/system/audit-logs">Nhật ký hoạt động</Link>,
                },
                {
                    key: '/system/settings',
                    icon: <SettingOutlined />,
                    label: <Link to="/system/settings">Cấu hình chung</Link>,
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