# WMS LA - Database Setup Guide

## 📋 Tổng quan

Hệ thống Database cho **WMS LA (Warehouse Management System)** được thiết kế để quản lý kho hàng điện tử (điện thoại, máy tính bảng, linh kiện) với khả năng tracking theo Serial/IMEI. Hỗ trợ cả **Mobile App** và **Web Application**.

## 📁 Cấu trúc Files

```
Database/
├── Database SQL (Schema) Postgre.sql    # Schema chính (CREATE TABLES)
├── Sample_Data.sql                      # Dữ liệu mẫu để test
├── Database_Schema_Documentation.md     # Tài liệu chi tiết về schema
├── Database_ERD.md                      # ERD diagrams và workflows
└── README.md                            # File này
```

## 🚀 Hướng dẫn Setup

### Bước 1: Cài đặt PostgreSQL

Yêu cầu: **PostgreSQL 13+**

**Windows:**
```bash
# Download và cài đặt từ: https://www.postgresql.org/download/windows/
# Hoặc dùng Chocolatey:
choco install postgresql
```

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Bước 2: Tạo Database

```bash
# Kết nối vào PostgreSQL
psql -U postgres

# Trong PostgreSQL shell:
CREATE DATABASE wms_la;
\c wms_la

# Hoặc dùng command line trực tiếp:
createdb -U postgres wms_la
```

### Bước 3: Chạy Schema

```bash
# Từ thư mục Database/
psql -U postgres -d wms_la -f "Database SQL (Schema) Postgre.sql"
```

### Bước 4: Import Sample Data (Optional)

```bash
psql -U postgres -d wms_la -f Sample_Data.sql
```

### Bước 5: Verify

```bash
psql -U postgres -d wms_la

# Kiểm tra các bảng:
\dt

# Kiểm tra dữ liệu:
SELECT * FROM "User";
SELECT * FROM Components;
SELECT * FROM ProductInstances;
```

## 📊 Database Statistics

| Thông tin | Giá trị |
|-----------|---------|
| **Tổng số bảng** | 24 tables |
| **Core tables** | 6 (User, Permission, Categories, Components, ProductInstances, Warehouses) |
| **Business tables** | 12 (Orders, Transfers, Repairs, etc.) |
| **Support tables** | 6 (Notifications, Settings, Logs, etc.) |
| **Indexes** | 20+ indexes |
| **Foreign Keys** | 40+ relationships |

## 🗂️ Các Bảng Chính

### 1. **Quản lý Người dùng**
- `User` - Tài khoản người dùng
- `Permission` - Phân quyền
- `UserPermission` - Gán quyền cho user

### 2. **Quản lý Sản phẩm**
- `Categories` - Danh mục sản phẩm
- `Components` - Model/SKU sản phẩm
- `ProductInstances` - Từng máy cụ thể (Serial/IMEI)

### 3. **Quản lý Kho**
- `Warehouses` - Danh sách kho
- `StockTransfers` - Phiếu chuyển kho
- `InventoryTransactions` - Lịch sử giao dịch

### 4. **Mua bán**
- `Suppliers` - Nhà cung cấp
- `Customers` - Khách hàng
- `PurchaseOrders` - Đơn nhập hàng
- `SalesOrders` - Đơn bán hàng

### 5. **Sửa chữa**
- `Repairs` - Đơn sửa chữa/bảo hành
- `RepairParts` - Linh kiện thay thế

### 6. **Mobile/Web Support**
- `Notifications` - Thông báo
- `DeviceTokens` - Push notification tokens
- `AuditLogs` - Nhật ký hệ thống

## 🔧 Cấu hình Connection String

### .NET Core (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=wms_la;Username=postgres;Password=your_password"
  }
}
```

### Node.js (pg)
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'wms_la',
  user: 'postgres',
  password: 'your_password',
  max: 20,
  idleTimeoutMillis: 30000,
});
```

### Python (psycopg2)
```python
import psycopg2

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    database="wms_la",
    user="postgres",
    password="your_password"
)
```

## 📱 API Endpoints (Suggested)

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/refresh` - Refresh token

### Products
- `GET /api/products` - Danh sách sản phẩm
- `GET /api/products/{id}` - Chi tiết sản phẩm
- `GET /api/products/search?q={query}` - Tìm kiếm
- `GET /api/products/by-serial/{serial}` - Tìm theo serial

### Inventory
- `GET /api/inventory` - Tồn kho tổng quan
- `GET /api/inventory/warehouse/{id}` - Theo kho
- `POST /api/inventory/transfer` - Chuyển kho

### Sales
- `POST /api/sales` - Tạo đơn bán
- `GET /api/sales/{id}` - Chi tiết đơn
- `PUT /api/sales/{id}/status` - Cập nhật trạng thái

### Repairs
- `POST /api/repairs` - Tạo đơn sửa chữa
- `GET /api/repairs` - Danh sách đơn
- `PUT /api/repairs/{id}` - Cập nhật

### Notifications
- `GET /api/notifications` - Lấy thông báo
- `PUT /api/notifications/{id}/read` - Đánh dấu đã đọc
- `POST /api/notifications/register-device` - Đăng ký device token

## 🔐 Security Best Practices

### 1. Password Hashing
```sql
-- Sử dụng bcrypt hoặc argon2
-- KHÔNG LƯU plain text password!
-- Cost factor: 10-12 cho bcrypt
```

### 2. SQL Injection Prevention
```csharp
// ✅ ĐÚNG - Dùng parameterized queries
var query = "SELECT * FROM \"User\" WHERE Username = @username";
// ❌ SAI - String concatenation
var query = "SELECT * FROM User WHERE Username = '" + username + "'";
```

### 3. Row-Level Security (RLS)
```sql
-- Enable RLS cho bảng nhạy cảm
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Tạo policy
CREATE POLICY user_isolation_policy ON "User"
  USING (UserID = current_setting('app.current_user_id')::uuid);
```

### 4. Audit Logging
Tất cả các thao tác quan trọng nên ghi log vào `AuditLogs`:
- CREATE/UPDATE/DELETE records
- Login/Logout
- Permission changes
- Sensitive data access

## 📈 Performance Optimization

### 1. Indexes
Schema đã có sẵn indexes cho:
- Username, Email lookups
- Serial/IMEI searches
- Order code searches
- Date-based queries

### 2. Connection Pooling
- **Min connections:** 5
- **Max connections:** 20
- **Idle timeout:** 30 seconds

### 3. Query Optimization
```sql
-- Sử dụng EXPLAIN ANALYZE để kiểm tra
EXPLAIN ANALYZE
SELECT * FROM ProductInstances WHERE SerialNumber = 'F9GX3PL92H';

-- Tạo composite index nếu cần
CREATE INDEX idx_custom ON table_name (column1, column2);
```

### 4. Partitioning (cho bảng lớn)
```sql
-- Partition AuditLogs theo tháng
CREATE TABLE AuditLogs_2025_12 PARTITION OF AuditLogs
FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');
```

## 🧪 Testing

### Unit Tests
- Test CRUD operations cho từng bảng
- Test foreign key constraints
- Test unique constraints
- Test soft delete functionality

### Integration Tests
- Test complete workflows (Purchase → Inventory → Sales)
- Test stock transfer flow
- Test repair process
- Test payment recording

### Sample Test Data
File `Sample_Data.sql` chứa:
- 4 users (admin, receptionist, technician, warehouse)
- 5 categories
- 6 products (components)
- 5 product instances with serial/IMEI
- 2 warehouses
- 2 suppliers
- 3 customers
- 2 purchase orders
- 2 sales orders
- 1 repair order
- Inventory transactions
- Notifications

## 📚 Documentation

### 1. Database_Schema_Documentation.md
- Chi tiết về từng bảng
- Use cases
- Best practices
- Security guidelines

### 2. Database_ERD.md
- Entity Relationship Diagram (Mermaid)
- Workflow diagrams
- Table relationships
- Index summary

## 🔄 Migration Strategy

### Version Control
```
migrations/
├── v1.0.0/
│   ├── 001_create_users.sql
│   ├── 002_create_products.sql
│   └── ...
├── v1.1.0/
│   ├── 010_add_customer_loyalty.sql
│   └── ...
```

### Migration Tools
- **Flyway** (Java)
- **migrate** (Go)
- **Alembic** (Python)
- **Entity Framework Migrations** (.NET)

### Rollback Plan
Mỗi migration nên có rollback script:
```sql
-- UP (migration)
ALTER TABLE Components ADD COLUMN NewField VARCHAR(100);

-- DOWN (rollback)
ALTER TABLE Components DROP COLUMN NewField;
```

## 🐛 Troubleshooting

### Lỗi: "relation does not exist"
```sql
-- Kiểm tra bảng tồn tại chưa
\dt

-- Kiểm tra schema
SELECT * FROM information_schema.tables WHERE table_name = 'User';

-- Lưu ý: Table name "User" phải wrap trong double quotes
SELECT * FROM "User";
```

### Lỗi: Foreign key violation
```sql
-- Kiểm tra thứ tự tạo bảng
-- Phải tạo parent tables trước child tables
-- VD: Tạo User trước UserPermission
```

### Lỗi: Duplicate key
```sql
-- Kiểm tra UNIQUE constraints
SELECT * FROM ProductInstances WHERE SerialNumber = 'ABC123';

-- Xóa duplicates nếu có
DELETE FROM ProductInstances 
WHERE InstanceID NOT IN (
  SELECT MIN(InstanceID) FROM ProductInstances GROUP BY SerialNumber
);
```

## 📞 Support & Contact

### Tài liệu tham khảo
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)
- [Prisma PostgreSQL Guide](https://www.prisma.io/docs/orm/overview/databases/postgresql)

### Công cụ hữu ích
- **pgAdmin** - GUI cho PostgreSQL
- **DBeaver** - Universal database tool
- **TablePlus** - Modern database client
- **DataGrip** - JetBrains database IDE

## 📝 Checklist Setup

- [ ] PostgreSQL được cài đặt (version 13+)
- [ ] Database `wms_la` được tạo
- [ ] Schema được import thành công
- [ ] Sample data được load (optional)
- [ ] Connection string được cấu hình
- [ ] Indexes được tạo
- [ ] Foreign keys hoạt động đúng
- [ ] Test queries chạy thành công
- [ ] Backup schedule được setup
- [ ] Monitoring được cấu hình

## 🎯 Next Steps

1. **Backend API Development**
   - Tạo REST API với .NET Core / Node.js / Python
   - Implement authentication & authorization
   - Add validation layers

2. **Mobile App**
   - React Native / Flutter
   - Offline sync capability
   - Push notifications

3. **Web Dashboard**
   - React / Vue / Angular
   - Real-time updates (WebSocket)
   - Reporting & analytics

4. **DevOps**
   - CI/CD pipeline
   - Docker containerization
   - Kubernetes deployment
   - Database backup automation

---

**Version:** 1.0.0  
**Last Updated:** 2025-12-19  
**Database:** PostgreSQL 13+  
**License:** Proprietary

