// src/layouts/MainLayout.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Button, theme, Dropdown, Avatar, Space, Grid } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
  BellOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';

// Import Component Sidebar vừa tách
import Sidebar from './components/Sidebar';

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [openDrawer, setOpenDrawer] = useState(false);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();

  // Logic kiểm tra mobile
  const isMobile = !screens.md;

  // Tự động đóng Drawer khi chuyển trang (để UX tốt hơn)
  useEffect(() => {
    if (isMobile) {
      setOpenDrawer(false);
    }
  }, [location.pathname, isMobile]);

  // Menu Dropdown của User (Header)
  const userMenu = [
    {
      key: 'profile', label: < Link to="/profile" > Thông tin cá nhân</Link >, icon: <UserOutlined />
    },
    { key: 'settings', label: <Link to="/system/settings">Cài đặt hệ thống</Link>, icon: <SettingOutlined /> },
    { type: 'divider' as const },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        localStorage.removeItem('access_token');
        navigate('/auth/login');
      },
    },
  ];

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

            {!isMobile && <span className="text-gray-600 font-medium">Xin chào, Admin</span>}

            <Dropdown menu={{ items: userMenu }} placement="bottomRight" arrow>
              <Space className="cursor-pointer p-2 rounded-full transition">
                <Avatar className="bg-blue-100 text-blue-600" icon={<UserOutlined />} />
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
          WMS LA Project ©2025 Created by You
        </div>
      </Layout>
    </Layout>
  );
};

export default MainLayout;