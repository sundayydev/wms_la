// src/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Button, theme, Dropdown, Avatar, Space, Grid, message, Modal } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
  BellOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';

// Import Component Sidebar và Auth Service
import Sidebar from './components/Sidebar';
import { logout, getCurrentUser } from '../services/auth.service';
import type { UserInfo } from '../types/api.types';

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;
const { confirm } = Modal;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  // Logic kiểm tra mobile
  const isMobile = !screens.md;

  // Lấy thông tin user khi component mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = await getCurrentUser();
        setUserInfo(user);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        // Nếu lỗi 401, có thể redirect về login
        if (error instanceof Error && error.message.includes('401')) {
          navigate('/auth/login');
        }
      }
    };

    fetchUserInfo();
  }, [navigate]);

  // Tự động đóng Drawer khi chuyển trang (để UX tốt hơn)
  useEffect(() => {
    if (isMobile) {
      setOpenDrawer(false);
    }
  }, [location.pathname, isMobile]);

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    confirm({
      title: 'Xác nhận đăng xuất',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
      okText: 'Đăng xuất',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        setLoggingOut(true);
        try {
          await logout();
          message.success('Đăng xuất thành công');
          navigate('/auth/login');
        } catch (error) {
          message.error('Đăng xuất thất bại. Vui lòng thử lại.');
          console.error('Logout error:', error);
        } finally {
          setLoggingOut(false);
        }
      },
    });
  };

  // Menu Dropdown của User (Header)
  const userMenu = [
    {
      key: 'profile',
      label: <Link to="/admin/profile">Thông tin cá nhân</Link>,
      icon: <UserOutlined />
    },
    {
      key: 'settings',
      label: <Link to="/admin/system/settings">Cài đặt hệ thống</Link>,
      icon: <SettingOutlined />
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: loggingOut ? 'Đang đăng xuất...' : 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      disabled: loggingOut,
      onClick: handleLogout,
    },
  ];

  // Lấy tên hiển thị từ userInfo
  const displayName = userInfo?.fullName || userInfo?.username || 'User';
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <Layout className="min-h-screen">

      {/* Gọi Component Sidebar và truyền Props vào */}
      <Sidebar
        collapsed={collapsed}
        isMobile={isMobile}
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
      />

      {/* PHẦN NỘI DUNG CHÍNH (Bên phải) */}
      <Layout
        style={{
          // Nếu Sidebar mở: margin = 260px (bằng width của Sidebar)
          // Nếu Sidebar đóng: margin = 80px (bằng collapsedWidth mặc định)
          // Nếu Mobile: margin = 0
          marginLeft: !isMobile ? (collapsed ? 80 : 260) : 0,
          transition: 'all 0.2s ease-in-out'
        }}
      >
        <Header
          style={{ padding: 0, background: colorBgContainer }}
          className="flex justify-between items-center px-4 shadow-sm sticky top-0 z-10"
        >
          {/* Nút Toggle Sidebar/Drawer */}
          <Button
            type="text"
            icon={isMobile ? <MenuOutlined /> : (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            onClick={() => isMobile ? setOpenDrawer(true) : setCollapsed(!collapsed)}
            className="text-lg w-16 h-16 hover:bg-gray-100 text-gray-600"
          />

          {/* User Actions & Notification */}
          <div className="flex items-center gap-4 pr-4">
            <Button
              type="text"
              icon={<BellOutlined />}
              className="text-lg rounded-full text-gray-600"
            />

            {!isMobile && (
              <span className="text-gray-600 font-medium">
                Xin chào, {displayName}
              </span>
            )}

            <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
              <Space className="cursor-pointer p-2 rounded-full hover:bg-gray-100 transition">
                <Avatar
                  className="bg-blue-100 text-blue-600"
                  src={userInfo?.avatar}
                  icon={!userInfo?.avatar && <UserOutlined />}
                >
                  {!userInfo?.avatar && userInitial}
                </Avatar>
              </Space>
            </Dropdown>
          </div>
        </Header>

        <Content className="m-4 mx-4 md:mx-6 my-6 overflow-initial">
          <div
            style={{
              padding: 24,
              minHeight: 360,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
            className="shadow-sm"
          >
            <Outlet />
          </div>
        </Content>

        <div className="text-center pb-4 text-gray-400 text-xs md:text-sm">
          WMS LA Project ©2025 Created by SundayyDev
        </div>
      </Layout>
    </Layout>
  );
};

export default MainLayout;