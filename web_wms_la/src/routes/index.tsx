import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense, type ComponentType } from 'react';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import SettingsPage from '../pages/System/SettingsPage';
import AuditLogs from '../pages/System/AuditLogsPage';
import PermissionsPage from '../pages/System/Permissions';
import UserList from '../pages/System/UserList';
import CategoryList from '../pages/Inventory/CategoryList';
import InventoryHistory from '../pages/Inventory/InventoryHistory';
import PurchaseOrderList from '../pages/purchasing/PurchaseOrderList';
import RepairList from '../pages/Repair/RepairList';
import PaymentList from '../pages/Finance/PaymentList';
import DebtList from '../pages/Finance/DebtList';
import WarrantyCheck from '../pages/Repair/WarrantyCheck';
import RepairCreate from '../pages/Repair/RepairCreate';
import InstanceList from '../pages/Inventory/InstanceList';
import SalesOrderList from '../pages/Sales/SalesOrderList';
import SalesOrderCreate from '../pages/Sales/SalesOrderCreate';
import OutboundCreate from '../pages/Warehouses/OutboundCreate';
import InboundCreate from '../pages/Warehouses/InboundCreate';
import AuditLogsPage from '../pages/System/AuditLogsPage';

// ============================================================================
// 1. TIỆN ÍCH HỖ TRỢ (UTILS)
// ============================================================================

// Component Loading
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

// HOC: Tự động bọc Suspense cho các trang Lazy Load
// Giúp code router sạch hơn, không cần lặp lại <Suspense> nhiều lần
const Loadable = (Component: React.LazyExoticComponent<ComponentType<any>>) => (props: any) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component {...props} />
  </Suspense>
);

// ============================================================================
// 2. KHAI BÁO CÁC TRANG (LAZY LOAD)
// ============================================================================

// Auth
const Login = Loadable(lazy(() => import('../pages/Auth/Login')));

// Core
const Dashboard = Loadable(lazy(() => import('../pages/Dashboard/Dashboard')));
const UserProfile = Loadable(lazy(() => import('../pages/User/UserProfile')));
const NotFound = Loadable(lazy(() => import('../pages/Exception/NotFound')));

// Inventory & Warehouse
const ProductList = Loadable(lazy(() => import('../pages/Inventory/ProductList')));
const ProductCreate = Loadable(lazy(() => import('../pages/Inventory/ProductCreate')));
const WarehouseList = Loadable(lazy(() => import('../pages/Warehouses/WarehouseList')));

// Partners & Customers
const SupplierList = Loadable(lazy(() => import('../pages/purchasing/SupplierList')));
const CustomerList = Loadable(lazy(() => import('../pages/Customers/CustomerList')));

// ============================================================================
// 3. CẤU HÌNH BẢO MẬT
// ============================================================================

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('access_token') !== null;
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  return children;
};

// ============================================================================
// 4. ĐỊNH NGHĨA ROUTER CHÍNH
// ============================================================================

export const router = createBrowserRouter([
  // --- NHÓM 1: PUBLIC ROUTES (Login, Register...) ---
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: '', element: <Navigate to="login" /> }, // Mặc định về login
    ],
  },

  // --- NHÓM 2: PROTECTED ROUTES (Cần đăng nhập) ---
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      // Dashboard
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },

      // User Profile
      { path: 'profile', element: <UserProfile /> },

      // Module: Inventory (Kho hàng & Sản phẩm)
      {
        path: 'inventory',
        children: [
          { path: 'products', element: <ProductList /> },    // /inventory/products
          { path: 'create', element: <ProductCreate /> },// /inventory/products/create
          { path: '', element: <Navigate to="products" /> }, // Mặc định về products
          { path: 'categories', element: <CategoryList /> }, // /inventory/categories
          { path: 'warehouses', element: <WarehouseList /> }, // /inventory/warehouses
          { path: 'history', element: <InventoryHistory /> }, // /inventory/history
          { path: 'instances', element: <InstanceList /> }, // /inventory/instances
        ],
      },
      // Module: Sales (Bán hàng)
      {
        path: 'sales',
        children: [
          { path: 'customers', element: <CustomerList /> },
          { path: '', element: <Navigate to="customers" /> },
          { path: 'orders', element: <SalesOrderList /> },
          { path: 'create', element: <SalesOrderCreate /> },
        ],
      },
      // Module: Purchase (Mua hàng)
      {
        path: 'repairs',
        children: [
          { path: 'list', element: <RepairList /> },
          { path: 'create', element: <RepairCreate /> },
          { path: 'warranty', element: <WarrantyCheck /> },
          { path: '', element: <Navigate to="list" /> },
        ],
      },
      {
        path: 'finance',
        children: [
          { path: 'payments', element: <PaymentList /> },
          { path: 'debts', element: <DebtList /> },
          { path: '', element: <Navigate to="payments" /> },
        ],
      },
      // Module: Purchasing (Đối tác - NCC, Khách hàng)
      {
        path: 'purchasing',
        children: [
          { path: 'suppliers', element: <SupplierList /> }, // /partners/suppliers
          { path: 'customers', element: <CustomerList /> }, // /partners/customers
          { path: '', element: <Navigate to="customers" /> }, // Mặc định về customers
          { path: 'orders', element: <PurchaseOrderList /> }, // /partners/orders 
        ]
      },

      // Module: Settings (Cài đặt hệ thống)
      {
        path: 'system',
        children: [
          { path: 'settings', element: <SettingsPage /> },
          { path: '', element: <Navigate to="settings" /> },
          { path: 'audit-logs', element: <AuditLogsPage /> },
          { path: 'permissions', element: <PermissionsPage /> },
          { path: 'users', element: <UserList /> },
        ]
      },

      // Module: Customers (Shortcut)
      { path: 'customers', element: <CustomerList /> },
      { path: 'outbound', element: <OutboundCreate /> },
      { path: 'inbound', element: <InboundCreate /> },
    ],
  },

  // --- NHÓM 3: EXCEPTION (404) ---
  { path: '*', element: <NotFound /> },
]);