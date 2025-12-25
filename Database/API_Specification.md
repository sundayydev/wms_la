# WMS LA - API Endpoints Specification

## 📝 Overview

This document defines the RESTful API endpoints for the WMS LA (Warehouse Management System) application. These endpoints should be implemented in the backend (e.g., .NET Core, Node.js, Python).

## 🔐 Authentication

All endpoints except `/auth/*` require authentication via JWT Bearer token.

### Base URL
```
Development: http://localhost:5000/api
Production: https://api.wmsla.com/api
```

### Headers
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept-Language: vi-VN (or en-US)
```

---

## 📍 Endpoints

### 1. Authentication & Authorization

#### POST /auth/login
Login with username/email and password.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "expiresIn": 3600,
  "user": {
    "userId": "uuid",
    "username": "admin",
    "email": "admin@wmsla.com",
    "role": "ADMIN",
    "fullName": "Administrator"
  }
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

#### POST /auth/logout
Logout and invalidate tokens.

#### POST /auth/register
Register new user account (Admin only).

**Request:**
```json
{
  "username": "newuser",
  "email": "newuser@wmsla.com",
  "password": "password123",
  "phoneNumber": "0912345678",
  "role": "RECEPTIONIST"
}
```

#### GET /auth/me
Get current user information.

---

### 2. User Management

#### GET /users
Get list of users with pagination and filters.

**Query Parameters:**
- `page` (default: 1)
- `pageSize` (default: 20)
- `role` (optional: ADMIN, RECEPTIONIST, TECHNICIAN, WAREHOUSE)
- `isActive` (optional: true/false)
- `search` (optional: search by username/email)

**Response:**
```json
{
  "data": [
    {
      "userId": "uuid",
      "username": "admin",
      "email": "admin@wmsla.com",
      "phoneNumber": "0912345678",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2025-12-19T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalPages": 5,
    "totalItems": 100
  }
}
```

#### GET /users/:id
Get user by ID.

#### PUT /users/:id
Update user information.

#### DELETE /users/:id
Soft delete user.

#### GET /users/:id/permissions
Get user permissions.

#### PUT /users/:id/permissions
Update user permissions.

---

### 3. Categories

#### GET /categories
Get all categories.

#### POST /categories
Create new category.

**Request:**
```json
{
  "categoryName": "iPhone"
}
```

#### PUT /categories/:id
Update category.

#### DELETE /categories/:id
Delete category (soft delete).

---

### 4. Products (Components)

#### GET /products
Get products with pagination and filters.

**Query Parameters:**
- `page`, `pageSize`
- `categoryId` (optional)
- `search` (optional: search by SKU/name)
- `isSerialized` (optional: true/false)

**Response:**
```json
{
  "data": [
    {
      "componentId": "uuid",
      "sku": "IP15PM-256-BLK",
      "componentName": "iPhone 15 Pro Max 256GB Black",
      "category": {
        "categoryId": "uuid",
        "categoryName": "iPhone"
      },
      "basePrice": 28000000,
      "sellPrice": 32000000,
      "isSerialized": true,
      "imageUrl": "/images/ip15pm-black.jpg",
      "stockQuantity": 10
    }
  ],
  "pagination": {...}
}
```

#### GET /products/:id
Get product details.

#### POST /products
Create new product.

**Request:**
```json
{
  "sku": "IP15PM-256-BLK",
  "componentName": "iPhone 15 Pro Max 256GB Black",
  "categoryId": "uuid",
  "unit": "Chiếc",
  "basePrice": 28000000,
  "sellPrice": 32000000,
  "isSerialized": true,
  "imageUrl": "/images/ip15pm-black.jpg"
}
```

#### PUT /products/:id
Update product.

#### DELETE /products/:id
Delete product.

#### GET /products/search
Search products by SKU, serial, IMEI.

**Query Parameters:**
- `q` (query string)
- `type` (sku, serial, imei)

---

### 5. Product Instances

#### GET /products/:productId/instances
Get all instances of a product.

#### POST /products/:productId/instances
Create new product instance (when receiving stock).

**Request:**
```json
{
  "serialNumber": "F9GX3PL92H",
  "imei1": "359876543210987",
  "imei2": "359876543210988",
  "warehouseId": "uuid",
  "actualImportPrice": 27800000,
  "notes": "Máy mới nguyên seal"
}
```

#### GET /instances/:id
Get instance details.

#### PUT /instances/:id
Update instance (e.g., status, warehouse).

#### GET /instances/scan/:barcode
Scan barcode/QR to get instance info (for mobile app).

---

### 6. Warehouses

#### GET /warehouses
Get all warehouses.

**Response:**
```json
{
  "data": [
    {
      "warehouseId": "uuid",
      "warehouseName": "Kho Trung Tâm Hà Nội",
      "address": "123 Đường Láng",
      "city": "Hà Nội",
      "district": "Đống Đa",
      "phoneNumber": "0243456789",
      "manager": {
        "userId": "uuid",
        "username": "admin"
      },
      "isActive": true
    }
  ]
}
```

#### POST /warehouses
Create warehouse.

#### PUT /warehouses/:id
Update warehouse.

#### GET /warehouses/:id/inventory
Get inventory by warehouse.

**Response:**
```json
{
  "warehouseId": "uuid",
  "warehouseName": "Kho Trung Tâm",
  "inventory": [
    {
      "componentId": "uuid",
      "componentName": "iPhone 15 Pro Max",
      "sku": "IP15PM-256-BLK",
      "totalQuantity": 10,
      "inStock": 8,
      "sold": 2,
      "totalValue": 280000000
    }
  ]
}
```

---

### 7. Suppliers

#### GET /suppliers
Get suppliers with pagination.

#### POST /suppliers
Create supplier.

**Request:**
```json
{
  "supplierCode": "SUP001",
  "supplierName": "Apple Authorized Distributor",
  "contactPerson": "Nguyễn Văn A",
  "phoneNumber": "0901234567",
  "email": "contact@appledist.vn",
  "address": "789 Trần Hưng Đạo",
  "city": "Hà Nội",
  "taxCode": "0123456789",
  "bankAccount": "123456789",
  "bankName": "Vietcombank"
}
```

#### GET /suppliers/:id
Get supplier details.

#### PUT /suppliers/:id
Update supplier.

#### DELETE /suppliers/:id
Delete supplier.

---

### 8. Customers

#### GET /customers
Get customers with pagination and filters.

**Query Parameters:**
- `page`, `pageSize`
- `customerType` (RETAIL, WHOLESALE, VIP)
- `search` (name, phone, email)

#### POST /customers
Create customer.

**Request:**
```json
{
  "customerCode": "CUST001",
  "customerName": "Nguyễn Văn An",
  "phoneNumber": "0981234567",
  "email": "nguyenvanan@gmail.com",
  "address": "12 Hoàng Hoa Thám",
  "city": "Hà Nội",
  "district": "Ba Đình",
  "dateOfBirth": "1990-05-15",
  "gender": "MALE",
  "customerType": "VIP"
}
```

#### GET /customers/:id
Get customer details.

#### PUT /customers/:id
Update customer.

#### DELETE /customers/:id
Delete customer.

#### GET /customers/:id/orders
Get customer order history.

#### GET /customers/search
Search by phone number or code.

---

### 9. Purchase Orders

#### GET /purchase-orders
Get purchase orders with filters.

**Query Parameters:**
- `page`, `pageSize`
- `status` (PENDING, CONFIRMED, DELIVERED, CANCELLED)
- `supplierId` (optional)
- `warehouseId` (optional)
- `fromDate`, `toDate` (optional)

#### POST /purchase-orders
Create purchase order.

**Request:**
```json
{
  "orderCode": "PO-2025-001",
  "supplierId": "uuid",
  "warehouseId": "uuid",
  "expectedDeliveryDate": "2025-12-25",
  "notes": "Đơn nhập iPhone",
  "items": [
    {
      "componentId": "uuid",
      "quantity": 10,
      "unitPrice": 28000000
    }
  ]
}
```

#### GET /purchase-orders/:id
Get purchase order details.

#### PUT /purchase-orders/:id/status
Update order status.

**Request:**
```json
{
  "status": "CONFIRMED",
  "notes": "Nhà cung cấp đã xác nhận"
}
```

#### POST /purchase-orders/:id/receive
Receive goods (create product instances).

**Request:**
```json
{
  "actualDeliveryDate": "2025-12-20",
  "items": [
    {
      "purchaseOrderDetailId": "uuid",
      "instances": [
        {
          "serialNumber": "F9GX3PL92H",
          "imei1": "359876543210987",
          "imei2": "359876543210988",
          "actualImportPrice": 27800000
        }
      ]
    }
  ]
}
```

---

### 10. Sales Orders

#### GET /sales-orders
Get sales orders with filters.

**Query Parameters:**
- `page`, `pageSize`
- `status` (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- `paymentStatus` (UNPAID, PARTIAL, PAID)
- `customerId` (optional)
- `fromDate`, `toDate` (optional)

#### POST /sales-orders
Create sales order.

**Request:**
```json
{
  "orderCode": "SO-2025-001",
  "customerId": "uuid",
  "warehouseId": "uuid",
  "paymentMethod": "BANK_TRANSFER",
  "items": [
    {
      "componentId": "uuid",
      "instanceId": "uuid",  // For serialized items
      "quantity": 1,
      "unitPrice": 32000000,
      "discountPercent": 5
    }
  ],
  "notes": "Khách VIP"
}
```

**Response:**
```json
{
  "salesOrderId": "uuid",
  "orderCode": "SO-2025-001",
  "totalAmount": 32000000,
  "discountAmount": 1600000,
  "finalAmount": 30400000,
  "status": "PENDING",
  "paymentStatus": "UNPAID"
}
```

#### GET /sales-orders/:id
Get sales order details.

#### PUT /sales-orders/:id/status
Update order status.

#### POST /sales-orders/:id/payment
Record payment for order.

**Request:**
```json
{
  "paymentMethod": "BANK_TRANSFER",
  "amount": 30400000,
  "transactionId": "TXN123456",
  "notes": "Thanh toán qua Momo"
}
```

#### GET /sales-orders/:id/invoice
Generate invoice PDF.

---

### 11. Stock Transfers

#### GET /stock-transfers
Get stock transfers with filters.

#### POST /stock-transfers
Create stock transfer.

**Request:**
```json
{
  "transferCode": "STK-2025-001",
  "fromWarehouseId": "uuid",
  "toWarehouseId": "uuid",
  "expectedReceiveDate": "2025-12-21",
  "items": [
    {
      "instanceId": "uuid",
      "componentId": "uuid",
      "quantity": 1
    }
  ]
}
```

#### PUT /stock-transfers/:id/status
Update transfer status.

#### POST /stock-transfers/:id/receive
Confirm receipt at destination warehouse.

**Request:**
```json
{
  "actualReceiveDate": "2025-12-21",
  "items": [
    {
      "transferDetailId": "uuid",
      "receivedQuantity": 1,
      "notes": "Đã nhận đủ"
    }
  ]
}
```

---

### 12. Repairs

#### GET /repairs
Get repair orders.

**Query Parameters:**
- `status` (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- `technicianId` (optional)
- `customerId` (optional)

#### POST /repairs
Create repair order.

**Request:**
```json
{
  "repairCode": "RP-2025-001",
  "customerId": "uuid",
  "instanceId": "uuid",  // Optional
  "componentId": "uuid",
  "problemDescription": "Màn hình bị vỡ",
  "expectedCompletionDate": "2025-12-23",
  "warrantyType": "OUT_WARRANTY"
}
```

#### GET /repairs/:id
Get repair details.

#### PUT /repairs/:id
Update repair.

#### POST /repairs/:id/parts
Add replacement parts.

**Request:**
```json
{
  "parts": [
    {
      "componentId": "uuid",
      "instanceId": "uuid",  // Optional
      "quantity": 1,
      "unitPrice": 4500000
    }
  ]
}
```

#### PUT /repairs/:id/status
Update repair status.

#### POST /repairs/:id/complete
Complete repair and calculate cost.

---

### 13. Inventory Transactions

#### GET /inventory-transactions
Get transaction history.

**Query Parameters:**
- `warehouseId` (optional)
- `transactionType` (IMPORT, EXPORT, TRANSFER, ADJUSTMENT)
- `fromDate`, `toDate`

**Response:**
```json
{
  "data": [
    {
      "transactionId": "uuid",
      "transactionCode": "INV-IN-001",
      "transactionType": "IMPORT",
      "warehouseName": "Kho HN",
      "componentName": "iPhone 15 Pro Max",
      "quantity": 10,
      "transactionDate": "2025-12-10T10:00:00Z",
      "createdBy": "admin"
    }
  ]
}
```

---

### 14. Payments

#### GET /payments
Get payment records.

#### POST /payments
Record payment.

**Request:**
```json
{
  "paymentCode": "PAY-2025-001",
  "referenceType": "SALES_ORDER",
  "referenceId": "uuid",
  "customerId": "uuid",
  "paymentMethod": "MOMO",
  "amount": 30400000,
  "transactionId": "MOMO123456"
}
```

#### GET /payments/:id
Get payment details.

---

### 15. Notifications

#### GET /notifications
Get user notifications.

**Query Parameters:**
- `isRead` (optional: true/false)
- `notificationType` (ORDER, PAYMENT, STOCK, SYSTEM)

**Response:**
```json
{
  "data": [
    {
      "notificationId": "uuid",
      "title": "Đơn hàng mới",
      "message": "Có đơn hàng SO-2025-002 cần xử lý",
      "notificationType": "ORDER",
      "isRead": false,
      "createdAt": "2025-12-19T14:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

#### PUT /notifications/:id/read
Mark notification as read.

#### PUT /notifications/read-all
Mark all as read.

#### POST /notifications/register-device
Register device token for push notifications (Mobile).

**Request:**
```json
{
  "deviceToken": "fcm_token_or_apns_token",
  "deviceType": "IOS",  // or ANDROID
  "deviceName": "iPhone 15 Pro Max"
}
```

---

### 16. Reports & Analytics

#### GET /reports/inventory-summary
Get inventory summary across all warehouses.

#### GET /reports/sales-summary
Get sales summary by period.

**Query Parameters:**
- `period` (daily, weekly, monthly, custom)
- `fromDate`, `toDate`

#### GET /reports/top-products
Get top selling products.

#### GET /reports/low-stock
Get products with low stock.

**Query Parameters:**
- `threshold` (default: 5)

#### GET /reports/customer-stats
Get customer statistics.

---

### 17. Settings

#### GET /settings
Get all application settings.

#### PUT /settings/:key
Update setting value.

**Request:**
```json
{
  "settingValue": "10",
  "description": "Ngưỡng cảnh báo tồn kho"
}
```

---

## 🔔 WebSocket Events

### Connection
```
ws://localhost:5000/ws?token={jwt_token}
```

### Events

#### notification:new
New notification received.

```json
{
  "event": "notification:new",
  "data": {
    "notificationId": "uuid",
    "title": "Đơn hàng mới",
    "message": "...",
    "notificationType": "ORDER"
  }
}
```

#### inventory:updated
Inventory quantity updated.

#### order:status-changed
Order status changed.

---

## ⚠️ Error Handling

All endpoints return consistent error format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Validation error details"
    }
  },
  "timestamp": "2025-12-19T10:00:00Z",
  "path": "/api/products"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (duplicate, constraint violation)
- `500` - Internal Server Error

---

## 🔒 Security

### Authentication
- Use JWT with RS256 algorithm
- Access token expiry: 1 hour
- Refresh token expiry: 7 days

### Authorization
Role-based access control (RBAC):
- **ADMIN**: Full access
- **RECEPTIONIST**: Sales, customers, basic inventory view
- **TECHNICIAN**: Repairs, inventory view
- **WAREHOUSE**: Inventory, stock transfers, purchase orders

### Rate Limiting
- Authentication endpoints: 5 requests/minute
- Regular endpoints: 100 requests/minute
- Reports: 10 requests/minute

---

*API Version: 1.0*  
*Last Updated: 2025-12-19*
