import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { lazy, Suspense, type ComponentType } from 'react';
import { tokenManager } from '../config/api.config';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import PublicLayout from '../layouts/PublicLayout';
import SettingsPage from '../pages/System/SettingsPage';
import AuditLogs from '../pages/System/AuditLogsPage';
import PermissionsPage from '../pages/System/Permissions';
import UserList from '../pages/System/UserList';
import CategoryList from '../pages/Inventory/CategoryList';
import InventoryHistory from '../pages/Inventory/InventoryHistory';
import PurchaseOrderList from '../pages/purchasing/PurchaseOrderList';
import PurchaseOrderCreate from '../pages/purchasing/PurchaseOrderCreate';
import Receiving from '../pages/purchasing/Receiving';
import RepairList from '../pages/Repair/RepairList';
import PaymentList from '../pages/Finance/PaymentList';
import DebtList from '../pages/Finance/DebtList';
import WarrantyCheck from '../pages/Repair/WarrantyCheck';
import RepairCreate from '../pages/Repair/RepairCreate';
import InstanceList from '../pages/Inventory/InstanceList';
import InstanceImport from '../pages/Inventory/InstanceImport';
import SalesOrderList from '../pages/Sales/SalesOrderList';
import SalesOrderCreate from '../pages/Sales/SalesOrderCreate';
import OutboundCreate from '../pages/Warehouses/OutboundCreate';
import InboundCreate from '../pages/Warehouses/InboundCreate';
import AuditLogsPage from '../pages/System/AuditLogsPage';
import KnowledgeBase from '../pages/Catalog/KnowledgeBase';
import SpareParts from '../pages/Catalog/SpareParts';
import ProductBundles from '../pages/Catalog/ProductBundles';

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

// Public Pages
const PublicHome = Loadable(lazy(() => import('../pages/Public/PublicHome')));
const WarrantyLookup = Loadable(lazy(() => import('../pages/Public/WarrantyLookup')));
const OrderLookup = Loadable(lazy(() => import('../pages/Public/OrderLookup')));
const Contact = Loadable(lazy(() => import('../pages/Public/Contact')));
const ErrorDiagnosis = Loadable(lazy(() => import('../pages/Public/ErrorDiagnosis')));

// ============================================================================
// 3. CẤU HÌNH BẢO MẬT
// ============================================================================

/**
 * ProtectedRoute - Bảo vệ các route cần đăng nhập
 * Sử dụng tokenManager để kiểm tra authentication (hỗ trợ HttpOnly Cookie flow)
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Sử dụng tokenManager thay vì đọc trực tiếp localStorage
  const isAuthenticated = tokenManager.isAuthenticated();

  if (!isAuthenticated) {
    // Chuyển hướng về trang login với return URL
    const currentPath = window.location.pathname;
    const returnUrl = currentPath !== '/' ? `?returnUrl=${encodeURIComponent(currentPath)}` : '';
    return <Navigate to={`/auth/login${returnUrl}`} replace />;
  }

  return children;
};

// ============================================================================
// 4. ĐỊNH NGHĨA ROUTER CHÍNH
// ============================================================================

export const router = createBrowserRouter([
  // --- NHÓM 0: PUBLIC PAGES (Trang công khai cho khách hàng) ---
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <PublicHome /> },
      { path: 'warranty-lookup', element: <WarrantyLookup /> },
      { path: 'order-lookup', element: <OrderLookup /> },
      { path: 'contact', element: <Contact /> },
      { path: 'error-diagnosis', element: <ErrorDiagnosis /> },
    ],
  },

  // --- NHÓM 1: AUTH ROUTES (Login, Register...) ---
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
    path: '/admin',
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
          { path: 'products', element: <ProductList /> },    // /admin/inventory/products
          { path: 'products/create', element: <ProductCreate /> }, // /admin/inventory/products/create
          { path: 'products/:id/edit', element: <ProductCreate /> }, // /admin/inventory/products/:id/edit
          { path: '', element: <Navigate to="products" /> }, // Mặc định về products
          { path: 'categories', element: <CategoryList /> }, // /inventory/categories
          { path: 'warehouses', element: <WarehouseList /> }, // /inventory/warehouses
          { path: 'history', element: <InventoryHistory /> }, // /inventory/history
          { path: 'instances', element: <InstanceList /> }, // /admin/inventory/instances
          { path: 'instances/import', element: <InstanceImport /> }, // /admin/inventory/instances/import
        ],
      },
      // Module: Catalog (Thông tin sản phẩm)
      {
        path: 'catalog',
        children: [
          { path: 'knowledge-base', element: <KnowledgeBase /> }, // /admin/catalog/knowledge-base
          { path: 'spare-parts', element: <SpareParts /> }, // /admin/catalog/spare-parts
          { path: 'bundles', element: <ProductBundles /> }, // /admin/catalog/bundles
          { path: '', element: <Navigate to="knowledge-base" /> },
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
      {
        path: 'purchasing',
        children: [
          { path: 'suppliers', element: <SupplierList /> }, // /admin/purchasing/suppliers
          { path: 'customers', element: <CustomerList /> }, // /admin/purchasing/customers
          { path: '', element: <Navigate to="orders" /> }, // Mặc định về orders
          { path: 'orders', element: <PurchaseOrderList /> }, // /admin/purchasing/orders
          { path: 'create', element: <PurchaseOrderCreate /> }, // /admin/purchasing/create
          { path: 'receiving', element: <Receiving /> }, // /admin/purchasing/receiving
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