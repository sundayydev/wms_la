# Tài liệu Phân quyền Hệ thống WMS

Tài liệu này mô tả chi tiết việc phân chia quyền hạn (Permissions) cho các vai trò (Roles) trong hệ thống Quản lý Kho (WMS).

## Danh sách Vai trò (Roles)

1.  **ADMIN (Quản trị viên):** Có quyền truy cập toàn bộ hệ thống, quản lý người dùng, cấu hình và dữ liệu master.
2.  **WAREHOUSE (Quản lý kho):** Chịu trách nhiệm vận hành kho, quản lý hàng hóa, phê duyệt phiếu và xem báo cáo.
3.  **RECEPTIONIST (Lễ tân / Tiếp nhận):** Chuyên trách mảng nhập hàng (Inbound), làm việc với nhà cung cấp và khách hàng.
4.  **TECHNICIAN (Kỹ thuật viên):** Nhân viên kho thực thi các tác vụ vật lý (lấy hàng, đóng gói, kiểm kê).

---

## 🔐 Chi tiết Phân quyền

### 1. Vai trò: ADMIN
**Mô tả:** Người nắm giữ quyền lực cao nhất hệ thống.

* **Quyền gốc:** `All.Permissions`
* **Các quyền quản trị cốt lõi:**
    * `User.View`, `User.Create`, `User.Edit`, `User.Delete`
    * `User.AssignPermission`, `User.AssignRole`
    * `Role.View`, `Role.Create`, `Role.Edit`, `Role.Delete`
    * `Settings.View`, `Settings.Edit`
    * `AuditLog.View`, `AuditLog.Export`
    * `Dashboard.Admin`, `Dashboard.View`
    * *Và tất cả các quyền của các vai trò khác.*

---

### 2. Vai trò: WAREHOUSE (Quản lý kho)
**Mô tả:** Trưởng kho hoặc người quản lý vận hành. Có quyền duyệt phiếu và quản lý dữ liệu kho.

#### 📊 Dashboard & Báo cáo
* `Dashboard.View`
* `Report.Inventory`, `Report.Inbound`, `Report.Outbound`, `Report.Movement`, `Report.Audit`, `Report.Export`

#### 📦 Quản lý Sản phẩm & Danh mục
* `Category.View`, `Category.Create`, `Category.Edit`
* `Product.View`, `Product.Create`, `Product.Edit`, `Product.Import`, `Product.Export`
* `ProductInstance.View`, `ProductInstance.Create`, `ProductInstance.Edit`

#### 📥 Nhập kho (Inbound)
* `Inbound.View`
* `Inbound.Create`, `Inbound.Edit`
* `Inbound.Approve` (Quyền phê duyệt)
* `Inbound.Receive`, `Inbound.Cancel`

#### 📤 Xuất kho (Outbound)
* `Outbound.View`
* `Outbound.Create`, `Outbound.Edit`
* `Outbound.Approve` (Quyền phê duyệt)
* `Outbound.Cancel`

#### 🏭 Tồn kho & Vị trí
* `Inventory.View`, `Inventory.Count`
* `Inventory.Adjust` (Quyền điều chỉnh tồn kho khi sai lệch)
* `Inventory.Transfer`
* `Location.View`, `Location.Create`, `Location.Edit`, `Location.Delete`
* `Warehouse.View`, `Warehouse.Manage`

#### 👥 Đối tác
* `Supplier.View`, `Supplier.Create`, `Supplier.Edit`
* `Customer.View`, `Customer.Create`, `Customer.Edit`

---

### 3. Vai trò: RECEPTIONIST (Tiếp nhận)
**Mô tả:** Nhân viên văn phòng kho hoặc lễ tân, chuyên xử lý giấy tờ đầu vào.

#### 📥 Nhập hàng & Đối tác
* `Inbound.View`
* `Inbound.Create` (Tạo phiếu chờ nhập)
* `Inbound.Edit` (Cập nhật thông tin phiếu)
* `Inbound.Receive` (Xác nhận hàng đã về)
* `Supplier.View`, `Supplier.Create`, `Supplier.Edit` (Quản lý NCC)

#### 📤 Khách hàng (Hỗ trợ)
* `Customer.View`, `Customer.Create`, `Customer.Edit`

#### 📦 Tra cứu thông tin
* `Dashboard.View`
* `Product.View`
* `Warehouse.View`
* `Inventory.View` (Kiểm tra chỗ trống)

---

### 4. Vai trò: TECHNICIAN (Kỹ thuật viên)
**Mô tả:** Nhân viên kho thực địa, sử dụng máy quét hoặc App để thao tác.

#### 🛠️ Tác vụ Thực thi (Action-based)
* **Xuất hàng:**
    * `Outbound.View` (Xem danh sách cần xuất)
    * `Outbound.Pick` (Đi lấy hàng)
    * `Outbound.Pack` (Đóng gói)
    * `Outbound.Ship` (Giao hàng/Bàn giao vận chuyển)
* **Nhập hàng:**
    * `Inbound.View`
    * `Inbound.Receive` (Quét mã nhận hàng)
* **Kho bãi:**
    * `Inventory.View`
    * `Inventory.Count` (Thực hiện kiểm kê định kỳ)
    * `Inventory.Transfer` (Di chuyển hàng giữa các vị trí/kệ)

#### 📦 Tra cứu
* `Dashboard.View`
* `Product.View`
* `Location.View`

---

## 📌 Bảng Ma trận Phân quyền Tóm tắt

| Module | Action | 🔴 ADMIN | 🟠 WAREHOUSE | 🟡 RECEPTIONIST | 🔵 TECHNICIAN |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **System** | Admin/Settings | ✅ | ❌ | ❌ | ❌ |
| **User/Role** | CRUD | ✅ | ❌ | ❌ | ❌ |
| **Product** | Create/Edit | ✅ | ✅ | ❌ | ❌ |
| **Product** | View | ✅ | ✅ | ✅ | ✅ |
| **Inbound** | Create/Edit | ✅ | ✅ | ✅ | ❌ |
| **Inbound** | Approve | ✅ | ✅ | ❌ | ❌ |
| **Inbound** | Receive | ✅ | ✅ | ✅ | ✅ |
| **Outbound** | Create/Edit | ✅ | ✅ | ❌ | ❌ |
| **Outbound** | Pick/Pack | ✅ | ✅ | ❌ | ✅ |
| **Inventory** | Adjust | ✅ | ✅ | ❌ | ❌ |
| **Inventory** | Count | ✅ | ✅ | ❌ | ✅ |
| **Report** | View/Export | ✅ | ✅ | ❌ | ❌ |

---
*Document generated for WMS Project - 2025*