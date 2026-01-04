# 📦 Hướng dẫn sử dụng Supplier-Product Management

## 🎯 Tổng quan

Hệ thống quản lý **mối quan hệ giữa Nhà cung cấp và Sản phẩm** giúp bạn:
- Quản lý sản phẩm mà từng nhà cung cấp có thể cung cấp
- Theo dõi giá nhập từ từng nhà cung cấp
- Thiết lập nhà cung cấp ưu tiên cho từng sản phẩm
- Quản lý điều kiện đặt hàng (MOQ, lead time, bội số)
- So sánh giá giữa các nhà cung cấp

---

## 📁 Files đã tạo

### **Backend (API)**
```
BE_WMS_LA.Core/
├── Repositories/
│   └── SupplierComponentRepository.cs    ✅ Data access layer
├── Services/
│   └── SupplierComponentService.cs       ✅ Business logic
BE_WMS_LA.API/
└── Controllers/
    └── SupplierComponentsController.cs   ✅ REST API endpoints
BE_WMS_LA.Shared/
└── DTOs/
    └── SupplierComponent/
        └── SupplierComponentDtos.cs      ✅ Data transfer objects
```

### **Frontend (React)**
```
web_wms_la/src/
├── services/
│   └── supplierComponents.service.ts     ✅ API client
└── pages/Purchasing/
    ├── SupplierDetail.tsx                ✅ Chi tiết NCC (routing page)
    └── SupplierProducts.tsx              ✅ Component quản lý SP của NCC
```

---

## 🚀 Cách sử dụng

### **1. Thêm route vào App**

Trong file routing của bạn (ví dụ: `App.tsx` hoặc `routes.tsx`), thêm:

```typescript
import SupplierDetail from './pages/Purchasing/SupplierDetail';

// Trong routes config:
{
  path: '/purchasing/suppliers/:id',
  element: <SupplierDetail />
}
```

### **2. Cập nhật SupplierList để navigate**

Trong `SupplierList.tsx`, thay đổi action "Xem chi tiết" để navigate:

```typescript
const handleViewDetail = (record: SupplierListDto) => {
  navigate(`/purchasing/suppliers/${record.supplierID}`);
};
```

### **3. Import service trong index.ts**

File `src/services/index.ts`:

```typescript
export * from './supplierComponents.service';
```

---

## 🎨 Giao diện người dùng

### **A. Trang Chi tiết Nhà cung cấp**

**URL:** `/purchasing/suppliers/:id`

**Tabs có sẵn:**
1. **Sản phẩm** - Quản lý danh sách sản phẩm
2. **Thông tin chi tiết** - Thông tin NCC
3. **Đơn đặt hàng** - Lịch sử PO (chưa làm)
4. **Giao dịch** - Thanh toán (chưa làm)

### **B. Tab Sản phẩm - Các chức năng**

#### **Statistics (Thống kê)**
- Tổng sản phẩm
- Đang cung cấp
- Giá trung bình
- Số sản phẩm ưu tiên

#### **Filters (Bộ lọc)**
- Lọc theo trạng thái (Còn cung cấp / Ngừng)
- Lọc theo mức ưu tiên (Ưu tiên / Không ưu tiên)

#### **Actions (Thao tác)**

**1. Thêm sản phẩm đơn lẻ**
- Click button "Thêm sản phẩm"
- Điền form:
  - Chọn sản phẩm
  - Giá nhập (Unit Cost)
  - Loại tiền (VND/USD/CNY)
  - MOQ (Minimum Order Quantity)
  - Bội số đặt hàng
  - Lead time (ngày)
  - Hiệu lực giá từ - đến
  - Đặt là NCC ưu tiên
  - Mức ưu tiên (0-100, số càng nhỏ càng ưu tiên)
  - Part Number của NCC
  - Ghi chú

**2. Thêm hàng loạt**
- Click "Thêm hàng loạt"
- Chọn nhiều sản phẩm
- Nhập giá mặc định
- Nhập MOQ và bội số mặc định
- Hệ thống sẽ báo cáo kết quả: X/Y sản phẩm đã thêm

**3. Chỉnh sửa**
- Click icon Edit trên từng dòng
- Cập nhật thông tin (không thể đổi sản phẩm)

**4. Xóa**
- Click icon Delete
- Xác nhận xóa

---

## 📊 Bảng dữ liệu

### **Columns (Cột)**

| Cột | Mô tả |
|-----|-------|
| **Sản phẩm** | Tên sản phẩm, SKU, Part Number variant |
| **Giá nhập** | Unit cost + currency + ngày cập nhật giá |
| **MOQ / Bội số** | Số lượng đặt tối thiểu / Bội số đặt hàng |
| **Lead Time** | Thời gian giao hàng (ngày) |
| **Ưu tiên** | Badge hiển thị NCC ưu tiên + mức ưu tiên |
| **Trạng thái** | Còn cung cấp / Ngừng |
| **Actions** | Edit / Delete |

---

## 💡 Use Cases

### **UC1: Thêm sản phẩm mới cho NCC**

**Kịch bản:** Bạn tìm được nhà cung cấp mới cho sản phẩm "Máy kiểm kho PDA M63"

**Các bước:**
1. Vào trang **Nhà cung cấp**
2. Click vào NCC cần thêm
3. Tab **Sản phẩm** → Click "Thêm sản phẩm"
4. Chọn sản phẩm "MOBY-M63-V2"
5. Nhập giá: 5,000,000 VND
6. MOQ: 10
7. Lead time: 7 ngày
8. Đánh dấu "Ưu tiên" nếu là NCC chính
9. Save

**Kết quả:** Sản phẩm được thêm vào danh sách, giờ bạn có thể đặt hàng từ NCC này.

---

### **UC2: So sánh giá giữa các nhà cung cấp**

**Kịch bản:** Bạn muốn tìm NCC rẻ nhất cho sản phẩm "Máy quét Honeywell"

**Cách làm:**

**Phương án 1:** Qua từng trang NCC
- Vào từng NCC
- Tab "Sản phẩm"
- Tìm sản phẩm cần so sánh
- Ghi chú giá

**Phương án 2:** Qua trang Sản phẩm (nếu đã làm)
- Vào trang Products
- Click vào sản phẩm cần xem
- Tab "Nhà cung cấp" sẽ show tất cả NCC và giá

**Kết quả:** Chọn NCC có giá tốt nhất và đánh dấu "Ưu tiên".

---

### **UC3: Cập nhật giá theo mùa**

**Kịch bản:** NCC thông báo tăng giá 5% từ ngày 1/2

**Các bước:**
1. Vào trang NCC
2. Tab "Sản phẩm"
3. Click Edit từng sản phẩm cần cập nhật
4. Nhập giá mới
5. Set "Giá có HHL từ": 01/02/2025
6. Save

**Hoặc dùng Bulk Update:**
- Coming soon - API đã có sẵn!

---

### **UC4: Thiết lập NCC ưu tiên**

**Kịch bản:** Có 3 NCC cung cấp cùng 1 sản phẩm, bạn muốn hệ thống ưu tiên đặt từ NCC A

**Các bước:**
1. Vào trang **Nhà cung cấp A**
2. Tab "Sản phẩm" → Tìm sản phẩm cần set
3. Edit → Bật "Nhà cung cấp ưu tiên"
4. Nhập mức ưu tiên: **1** (số càng nhỏ càng ưu tiên)
5. Save

6. Vào các NCC khác → Tắt "Ưu tiên" hoặc set priority cao hơn

**Kết quả:** Khi tạo Purchase Order, hệ thống sẽ gợi ý NCC A đầu tiên.

---

## 🔍 Tips & Tricks

### **1. Tìm kiếm nhanh**
- Dùng Search trong Select component khi chọn sản phẩm
- Gõ SKU hoặc tên sản phẩm

### **2. Quản lý giá**
- Luôn set "Giá có HHL từ - đến" để tracking lịch sử
- Dùng field "lastPriceUpdate" để biết lần cập nhật gần nhất

### **3. Priority vs Preferred**
- **isPreferred**: TRUE/FALSE - có phải NCC ưu tiên không
- **priority**: 0-100 - mức độ ưu tiên (nếu có nhiều NCC ưu tiên)

### **4. Part Number**
- Lưu mã sản phẩm theo catalog của NCC
- Dùng khi đặt hàng để tránh nhầm lẫn

---

## 🚧 Chức năng đang phát triển

- [ ] **Bulk Price Update** - UI cho việc cập nhật giá hàng loạt
- [ ] **Price History** - Xem lịch sử thay đổi giá
- [ ] **Comparison View** - So sánh giá giữa các NCC cho cùng 1 SP
- [ ] **Import/Export** Excel
- [ ] **Price Alert** - Cảnh báo khi giá thay đổi > X%

---

## 📞 Liên hệ

Nếu có vấn đề kỹ thuật, liên hệ:
- Developer: Antigravity AI
- Created: 31/12/2025

---

## ✅ Checklist triển khai

- [x] Backend API hoàn chỉnh
- [x] Frontend Service layer
- [x] SupplierProducts component
- [x] SupplierDetail page
- [ ] Add route vào App
- [ ] Update SupplierList navigation
- [ ] Test toàn bộ flow
- [ ] Import service vào index.ts

**Hệ thống đã sẵn sàng, chỉ cần thêm routing!** 🚀
