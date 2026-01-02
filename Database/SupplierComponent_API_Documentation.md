# SupplierComponent API Documentation

API để quản lý mối quan hệ giữa Nhà cung cấp (Supplier) và Sản phẩm (Component/ComponentVariant).

## 📋 Tổng quan

**SupplierComponent** là bảng trung gian (junction table) quản lý:
- Nhà cung cấp nào cung cấp sản phẩm gì
- Giá nhập từ từng nhà cung cấp
- Điều kiện đặt hàng (MOQ, lead time, etc.)
- Ưu tiên nhà cung cấp

---

## 🔑 Endpoints

### 1. Query Operations

#### GET `/api/supplier-components/by-supplier/{supplierId}`
Lấy danh sách components của một supplier

**Parameters:**
- `supplierId` (path, required): ID nhà cung cấp
- `isActive` (query, optional): Lọc theo trạng thái
- `isPreferred` (query, optional): Lọc nhà cung cấp ưu tiên

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách thành công (10 kết quả)",
  "data": [
    {
      "supplierComponentID": "uuid",
      "supplierID": "uuid",
      "supplierCode": "SUP001",
      "supplierName": "Apple Authorized Distributor",
      "componentID": "uuid",
      "sku": "MOBY-M63-V2",
      "componentName": "Máy kiểm kho PDA Mobydata M63 V2",
      "variantID": null,
      "variantPartNumber": null,
      "unitCost": 5000000,
      "currency": "VND",
      "minOrderQuantity": 10,
      "orderMultiple": 1,
      "leadTimeDays": 7,
      "isPreferred": true,
      "priority": 1,
      "isActive": true
    }
  ]
}
```

---

#### GET `/api/supplier-components/by-component/{componentId}`
Lấy danh sách suppliers của một component

**Parameters:**
- `componentId` (path, required): ID sản phẩm
- `variantId` (query, optional): ID biến thể
- `isActive` (query, optional): Lọc theo trạng thái

---

#### GET `/api/supplier-components`
Lấy tất cả mối quan hệ (có filter)

**Parameters:**
- `supplierId` (query, optional)
- `componentID` (query, optional)
- `variantId` (query, optional)  
- `isActive` (query, optional)
- `isPreferred` (query, optional)

---

#### GET `/api/supplier-components/{id}`
Lấy chi tiết một mối quan hệ

**Response:**
```json
{
  "success": true,
  "data": {
    "supplierComponentID": "uuid",
    "supplierID": "uuid",
    "supplierCode": "SUP001",
    "supplierName": "Apple Authorized Distributor",
    "componentID": "uuid",
    "sku": "MOBY-M63-V2",
    "componentName": "Máy kiểm kho PDA Mobydata M63 V2",
    "partNumber": "M63-V2-BASIC",
    "unitCost": 5000000,
    "currency": "VND",
    "tierPricing": "[{\"minQty\": 10, \"price\": 4800000}]",
    "priceValidFrom": "2025-01-01T00:00:00Z",
    "priceValidTo": "2025-12-31T00:00:00Z",
    "minOrderQuantity": 10,
    "orderMultiple": 1,
    "leadTimeDays": 7,
    "isPreferred": true,
    "priority": 1,
    "notes": "Nhà cung cấp chính hãng",
    "internalNotes": "Giao hàng đúng hẹn",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-15T00:00:00Z"
  }
}
```

---

### 2. CRUD Operations

#### POST `/api/supplier-components`
Tạo mối quan hệ mới

**Request Body:**
```json
{
  "supplierID": "uuid",
  "componentID": "uuid",
  "variantID": null,
  "partNumber": "M63-V2-BASIC",
  "unitCost": 5000000,
  "currency": "VND",
  "tierPricing": "[{\"minQty\": 10, \"price\": 4800000}]",
  "priceValidFrom": "2025-01-01",
  "priceValidTo": "2025-12-31",
  "minOrderQuantity": 10,
  "orderMultiple": 1,
  "leadTimeDays": 7,
  "isPreferred": true,
  "priority": 1,
  "notes": "Nhà cung cấp chính hãng",
  "isActive": true
}
```

---

#### PUT `/api/supplier-components/{id}`
Cập nhật thông tin

**Request Body:**
```json
{
  "unitCost": 4900000,
  "priceValidFrom": "2025-02-01",
  "minOrderQuantity": 5,
  "isPreferred": false
}
```

---

#### DELETE `/api/supplier-components/{id}`
Xóa mối quan hệ (soft delete)

---

### 3. Bulk Operations

#### POST `/api/supplier-components/suppliers/{supplierId}/bulk-add`
Thêm nhiều components cho một supplier

**Request Body:**
```json
{
  "componentIDs": [
    "uuid-1",
    "uuid-2",
    "uuid-3"
  ],
  "defaultUnitCost": 5000000,
  "currency": "VND",
  "minOrderQuantity": 10,
  "orderMultiple": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thêm thành công 3/3 sản phẩm",
  "data": {
    "totalRequested": 3,
    "successCount": 3,
    "failureCount": 0,
    "errors": [],
    "successfulIDs": ["uuid-1", "uuid-2", "uuid-3"]
  }
}
```

---

#### PUT `/api/supplier-components/suppliers/{supplierId}/bulk-update-prices`
Cập nhật giá hàng loạt

**Request Body:**
```json
{
  "priceUpdates": [
    {
      "componentID": "uuid-1",
      "variantID": null,
      "newUnitCost": 4900000,
      "validFrom": "2025-02-01",
      "validTo": "2025-12-31"
    },
    {
      "componentID": "uuid-2",
      "variantID": "uuid-variant",
      "newUnitCost": 5100000
    }
  ]
}
```

---

### 4. Statistics

#### GET `/api/supplier-components/suppliers/{supplierId}/statistics`
Thống kê sản phẩm của supplier

**Response:**
```json
{
  "success": true,
  "data": {
    "supplierID": "uuid",
    "supplierName": "Apple Authorized Distributor",
    "totalProducts": 50,
    "activeProducts": 45,
    "preferredProducts": 10,
    "discontinuedProducts": 5,
    "totalOrderedQuantity": 1000,
    "totalReceivedQuantity": 950,
    "lowestPrice": 100000,
    "highestPrice": 50000000,
    "averagePrice": 5000000
  }
}
```

---

## 📝 DTOs

### CreateSupplierComponentDto
```csharp
{
  SupplierID: Guid (required)
  ComponentID: Guid (required)
  VariantID?: Guid (optional)
  PartNumber?: string (max 100)
  UnitCost: decimal (required, >= 0)
  Currency: string (default "VND", max 10)
  TierPricing?: string (JSON format)
  PriceValidFrom?: DateTime
  PriceValidTo?: DateTime
  MinOrderQuantity: int (>= 1, default 1)
  OrderMultiple: int (>= 1, default 1)
  LeadTimeDays?: int
  IsPreferred: bool (default false)
  Priority: int (0-100, default 0)
  Notes?: string
  InternalNotes?: string
  IsActive: bool (default true)
}
```

### UpdateSupplierComponentDto
Tất cả fields đều optional (nullable).

---

## ⚡ Use Cases

### 1. Thêm nhà cung cấp mới cho sản phẩm
```http
POST /api/supplier-components
```

### 2. Tìm nhà cung cấp rẻ nhất cho sản phẩm
```http
GET /api/supplier-components/by-component/{componentId}?isActive=true
```
Sau đó sắp xếp theo `unitCost` ASC

### 3. Cập nhật giá mùa
```http
PUT /api/supplier-components/suppliers/{supplierId}/bulk-update-prices
```

### 4. Thêm nhiều sản phẩm cho NCC mới
```http
POST /api/supplier-components/suppliers/{supplierId}/bulk-add
```

---

## 🔐 Authorization
Tất cả endpoints yêu cầu JWT Bearer token trong header:
```
Authorization: Bearer <token>
```

---

## ✅ Validation Rules

1. **Unique Constraint**: Một supplier chỉ có duy nhất 1 mối quan hệ với 1 component/variant
2. **UnitCost**: Phải >= 0
3. **MinOrderQuantity**: Phải >= 1
4. **OrderMultiple**: Phải >= 1
5. **Priority**: 0-100
6. **Currency**: VND, USD, CNY (max 10 chars)

---

## 🚀 **Đã tạo thành công!**

Các file đã được tạo:
1. ✅ `SupplierComponentRepository.cs` - Data access layer
2. ✅ `SupplierComponentService.cs` - Business logic layer
3. ✅ `SupplierComponentsController.cs` - API endpoints
4. ✅ `SupplierComponentDtos.cs` - Data transfer objects
5. ✅ Đã đăng ký trong `Program.cs`
