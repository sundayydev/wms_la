---
trigger: always_on
---

# PROJECT CONTEXT: WMS_LA (Warehouse Management System)

## 1. Project Architecture (Monorepo)
Dự án bao gồm 3 thành phần chính:
- **Backend**: .NET 10, Clean Architecture (API -> Core -> Domain -> Shared).
- **Web**: React (Vite), TypeScript, TailwindCSS.
- **Mobile**: Flutter.
- **Database**: PostgreSQL.

---

## 2. Backend Rules (folder: `be_wms_la`)
**Tech Stack**: .NET 10 Web API, Entity Framework Core, PostgreSQL.

### Coding Standards:
- **Architecture**:
  - `API`: Chỉ chứa Controllers và cấu hình DI.
  - `Core`: Chứa Business Logic (Services), Interfaces (Repositories), Mappings.
  - `Domain`: Chỉ chứa Entities và Enums (POCO classes). Không phụ thuộc vào layer nào khác.
  - `Shared`: Chứa DTOs, Constants, Common Utilities.
- **Controller**: Trả về `IActionResult`. Luôn sử dụng `ApiResponse<T>` từ `BE_WMS_LA.Shared` để bao bọc dữ liệu trả về.
- **Service**: Logic nghiệp vụ nằm ở đây. Không viết logic trong Controller.
- **Async/Await**: Bắt buộc sử dụng cho mọi thao tác Database/IO.
- **Naming**: 
  - Interface bắt đầu bằng `I` (ví dụ: `IProductRepository`).
  - DTO phải có hậu tố `Dto` (ví dụ: `ProductDetailDto`).

### Database:
- Không sửa trực tiếp file Migration cũ. Tạo migration mới khi thay đổi Schema.
- Khóa chính luôn là `Id` (Guid hoặc int tùy bảng).

---

## 3. Web Client Rules (folder: `web_wms_la`)
**Tech Stack**: React 18+, TypeScript, Vite, TailwindCSS.

### Coding Standards:
- **Structure**:
  - `src/pages`: Màn hình chính.
  - `src/components`: UI components tái sử dụng (Button, Input...).
  - `src/services`: Gọi API (axios). Map 1-1 với Controller của Backend.
  - `src/types`: TypeScript definitions (phải khớp với DTO bên Backend).
- **Styling**: Sử dụng TailwindCSS utility classes. Hạn chế viết CSS thuần.
- **State Management**: Sử dụng React Context (như `AuthContext`) hoặc Hooks.
- **Naming**:
  - Components: PascalCase (e.g., `ProductList.tsx`).
  - Functions/Variables: camelCase (e.g., `handleCreateProduct`).
- **Error Handling**: Sử dụng try-catch khi gọi API và hiển thị Toast notification.

---

## 4. Mobile App Rules (folder: `mobile_wms_la`)
**Tech Stack**: Flutter (Dart).

### Coding Standards:
- **Structure**:
  - `lib/features`: Chia theo tính năng (Auth, Inventory, Orders).
  - `lib/core`: Constants, Theme, Utilities.
  - `lib/data`: Models và Services.
- **Widgets**: Tách nhỏ Widget để dễ đọc. Ưu tiên `const` constructor.
- **Async**: Sử dụng `FutureBuilder` hoặc `async/await` pattern sạch sẽ.
- **Naming**: 
  - File: snake_case (e.g., `login_screen.dart`).
  - Class: PascalCase (e.g., `LoginScreen`).

---

## 5. General Workflow Rules cho AI
1. **Trước khi code**:
   - Phải xác định rõ đang làm việc ở folder nào (`be`, `web`, hay `mobile`).
   - Đọc các file DTO/Model liên quan trước khi sửa logic.
   - Nếu sửa API Backend, hãy nhắc người dùng cập nhật cả interface bên Web và Mobile.

2. **Khi tạo file mới**:
   - Luôn đặt đúng thư mục theo cấu trúc đã định nghĩa ở trên.
   - Backend: Nhớ đăng ký Dependency Injection trong `Program.cs`.
   - Web: Nhớ thêm route trong `routes/index.tsx`.

3. **Database Docs**:
   - Khi cần hiểu logic nghiệp vụ phức tạp, hãy tham khảo thư mục `Database/` (đặc biệt là file `API_Specification.md` và `Database_ERD.md`).