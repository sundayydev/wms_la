# Knowledge Base Feature Implementation Plan

## Tổng quan
Triển khai 3 chức năng chính cho Knowledge Base:
1. **Lưu trữ và Preview** (Office to PDF Conversion)
2. **Phân quyền Internal vs Public** (Presigned URLs)
3. **Chia sẻ nâng cao** (Share Token + Download Limit)

---

## 📋 Trạng thái hiện tại

### ✅ Đã có sẵn:
- **Domain Models**: `ProductKnowledgeBase`, `DocumentShare` 
- **Repository**: CRUD Operations, Sharing operations
- **Service**: Upload, Download, Presigned URL, Sharing
- **Controller**: Full REST API endpoints
- **MinIO Integration**: Upload, Download, Delete, Presigned URL
- **DTOs**: Upload, Result, Share, Statistics

### ❌ Cần triển khai thêm:

---

## 🔧 Chức năng 1: Office to PDF Conversion (Background Processing)

### 1.1 Giải pháp kỹ thuật
**Lựa chọn: Gotenberg (Docker Container)**
- Gotenberg là microservice chuyên convert Office → PDF
- Dễ deploy với Docker, API RESTful đơn giản
- Hỗ trợ: .docx, .xlsx, .pptx, .odt, .ods, .odp → PDF

### 1.2 Các file cần tạo/sửa

#### A. Tạo mới: `GotenbergService.cs`
```
Location: BE_WMS_LA.Core/Services/GotenbergService.cs
```
- Kết nối tới Gotenberg API
- Method: `ConvertToPdfAsync(Stream inputStream, string fileName) -> Stream pdfStream`

#### B. Tạo mới: `DocumentConversionBackgroundService.cs`
```
Location: BE_WMS_LA.Core/BackgroundServices/DocumentConversionBackgroundService.cs
```
- Background Hosted Service (IHostedService)
- Poll database cho documents có `ProcessStatus == PENDING`
- Xử lý conversion, upload PDF lên MinIO, cập nhật `PreviewObjectKey`

#### C. Cập nhật: `KnowledgeBaseService.cs`
- Khi upload file Office (.docx, .xlsx), set `ProcessStatus = PENDING`
- Frontend sẽ poll hoặc nhận notification khi xong

#### D. Cập nhật: `KnowledgeBaseController.cs`
- Thêm endpoint `GET /api/knowledgebase/{id}/preview` để lấy presigned URL của file Preview PDF
- Thêm endpoint `GET /api/knowledgebase/{id}/thumbnail` cho ảnh thumbnail

#### E. Cấu hình Docker Compose
```yaml
# docker-compose.yml
services:
  gotenberg:
    image: gotenberg/gotenberg:7
    ports:
      - "3000:3000"
```

### 1.3 Flow xử lý

```
User Upload .docx
       ↓
[1] Lưu file gốc → MinIO (original/file.docx)
       ↓
[2] Insert DB: ProcessStatus = PENDING
       ↓
[3] Background Worker poll DB
       ↓
[4] Gọi Gotenberg API convert → PDF
       ↓
[5] Upload PDF → MinIO (preview/file.pdf)
       ↓
[6] Update DB: PreviewObjectKey, ProcessStatus = READY
       ↓
Frontend hiển thị PDF bằng react-pdf
```

---

## 🔒 Chức năng 2: Phân quyền Internal vs Public

### 2.1 Logic Implementation

#### A. Cập nhật: `KnowledgeBaseController.cs`

**Endpoint: `GET /api/knowledgebase` (Public Documents)**
```csharp
[HttpGet("public")]
[AllowAnonymous]
public async Task<IActionResult> GetPublicDocuments(...)
{
    // Chỉ query Scope == PUBLIC
}
```

**Endpoint hiện tại (Internal)**
```csharp
[HttpGet]
[Authorize]
public async Task<IActionResult> GetAll(...)
{
    // Query tất cả (user đã đăng nhập)
    // Hoặc filter theo Role
}
```

#### B. Cập nhật: `KnowledgeBaseRepository.cs`
- Thêm method: `GetPublicAsync()` - chỉ lấy scope PUBLIC
- Cập nhật `BuildQuery()` để hỗ trợ filter theo User Role

#### C. Presigned URL Strategy

**QUAN TRỌNG**: Không expose MinIO URL trực tiếp!

Flow lấy file:
```
Frontend request → Backend kiểm tra quyền → 
    ✅ OK → Tạo Presigned URL (15 phút) → Return URL
    ❌ FAIL → 403 Forbidden
```

Endpoint mới:
```csharp
[HttpGet("{id}/view")]
public async Task<IActionResult> GetViewUrl(Guid id)
{
    // 1. Kiểm tra quyền (user đăng nhập hoặc document PUBLIC)
    // 2. Tạo presigned URL cho PreviewObjectKey (file PDF)
    // 3. Return { previewUrl, expiresAt }
}
```

---

## 🔗 Chức năng 3: Chia sẻ nâng cao (Share Token Flow)

### 3.1 Cấu trúc đã có
- `DocumentShare` entity với: ShareToken, ExpiryDate, MaxDownloads, TargetUserID, etc.
- Các endpoint: create share, revoke share, get shared file info, download shared file

### 3.2 Cần bổ sung

#### A. Tạo mới: `EmailService.cs`
```
Location: BE_WMS_LA.Core/Services/EmailService.cs
```
- Gửi email chia sẻ với Share Link
- Template: "Bạn đã được chia sẻ tài liệu {Title}. Click vào đây: {ShareURL}"

#### B. Cập nhật: `CreateShareLinkDto`
```csharp
public class CreateShareLinkDto
{
    // Existing fields...
    
    /// <summary>
    /// Gửi email thông báo cho người nhận
    /// </summary>
    public bool SendEmail { get; set; } = false;
}
```

#### C. Cập nhật: `KnowledgeBaseService.cs`
```csharp
public async Task<ApiResponse<ShareLinkResultDto>> CreateShareLinkAsync(...)
{
    // 1. Tạo DocumentShare (đã có)
    // 2. Nếu SendEmail = true, gọi EmailService
    // 3. Return ShareLinkResultDto với đầy đủ URL
}
```

#### D. Cập nhật: `KnowledgeBaseController.cs` - Share với Target User Check

**Endpoint: `GET /shared/{shareToken}/download`**
```csharp
[HttpGet("shared/{shareToken}/download")]
[AllowAnonymous]
public async Task<IActionResult> DownloadSharedFile(string shareToken)
{
    // 1. Get share by token
    // 2. Check IsActive
    // 3. Check ExpiryDate
    // 4. Check TargetUserID (nếu có)
    //    - Nếu share dành cho user cụ thể → yêu cầu đăng nhập
    //    - So sánh User.Identity với TargetUserID
    // 5. Check MaxDownloads
    // 6. Increment CurrentDownloads
    // 7. Return Presigned URL (với content-disposition: attachment)
}
```

#### E. Tạo endpoint mới cho Presigned Download URL
Thay vì return file stream trực tiếp, trả về presigned URL:

```csharp
[HttpPost("shared/{shareToken}/request-download")]
[AllowAnonymous]
public async Task<IActionResult> RequestSharedDownload(string shareToken)
{
    // Validate share...
    // Increment download count
    // Return { downloadUrl, fileName, expiresAt }
}
```

### 3.3 Share Flow hoàn chỉnh

```
[Admin tạo Share]
Admin → POST /api/knowledgebase/{id}/share
     → Body: { expirationMinutes, maxDownloads, targetEmail, sendEmail }
     → Response: { shareToken, shareURL }
     → (Optional) Gửi email

[Người nhận truy cập]
User → GET /api/knowledgebase/shared/{token}/info
     → Check validity
     → Response: { title, fileSize, remainingDownloads, expiresAt, isExpired, isLimitReached }

[Người nhận download]
User → POST /api/knowledgebase/shared/{token}/request-download
     → Backend validate all conditions
     → Increment download count
     → Generate Presigned URL với attachment header
     → Response: { downloadUrl, expiresIn: 300 } // 5 phút
     
Browser → GET {downloadUrl}
        → MinIO trả file với Content-Disposition: attachment
```

---

## 📁 Danh sách file cần tạo/sửa

### Tạo mới:
1. `BE_WMS_LA.Core/Services/GotenbergService.cs` - Gotenberg API client
2. `BE_WMS_LA.Core/BackgroundServices/DocumentConversionBackgroundService.cs` - Background worker
3. `BE_WMS_LA.Core/Services/EmailService.cs` - Email notification
4. `BE_WMS_LA.Shared/Configurations/GotenbergSettings.cs` - Cấu hình Gotenberg
5. `docker-compose.yml` (cập nhật) - Thêm Gotenberg service

### Cập nhật:
1. `BE_WMS_LA.Core/Services/KnowledgeBaseService.cs`
   - Set ProcessStatus khi upload Office file
   - Thêm logic email notification
   - Thêm method GetPreviewUrlAsync, GetThumbnailUrlAsync

2. `BE_WMS_LA.Core/Repositories/KnowledgeBaseRepository.cs`
   - GetPublicAsync()
   - GetByProcessStatusAsync(FileStatus status)

3. `BE_WMS_LA.API/Controllers/KnowledgeBaseController.cs`
   - GET /public - Public documents
   - GET /{id}/preview - Presigned URL cho preview
   - GET /{id}/thumbnail - Presigned URL cho thumbnail
   - POST /shared/{token}/request-download - Request download URL

4. `BE_WMS_LA.Shared/DTOs/Storage/KnowledgeBaseDto.cs`
   - Thêm PreviewUrlDto, ThumbnailUrlDto
   - Cập nhật CreateShareLinkDto với SendEmail

5. `BE_WMS_LA.API/Program.cs`
   - Đăng ký GotenbergService, EmailService
   - Thêm BackgroundService

6. `appsettings.json`
   - Gotenberg configuration
   - Email configuration

---

## 🚀 Thứ tự triển khai đề xuất

### Phase 1: Background Conversion (3-4 hours)
1. Setup Docker Compose với Gotenberg
2. Tạo GotenbergService
3. Tạo BackgroundService cho conversion
4. Cập nhật Upload flow
5. Test conversion flow

### Phase 2: Access Control (2 hours)
1. Thêm public endpoints
2. Cập nhật Repository với filter methods
3. Cập nhật presigned URL logic
4. Test phân quyền

### Phase 3: Enhanced Sharing (2-3 hours)
1. Tạo EmailService
2. Cập nhật sharing flow
3. Thêm TargetUser validation
4. Tạo request-download endpoint
5. Test full sharing flow

---

## ⚠️ Lưu ý quan trọng

1. **Gotenberg cần Docker**: Server phải có Docker installed
2. **MinIO không public**: Luôn dùng Presigned URL với expiration
3. **Email Service**: Cần SMTP configuration (hoặc dùng SendGrid, etc.)
4. **Background Service**: Cần mechanism retry nếu conversion fail
5. **Large Files**: Conversion Office lớn có thể timeout → cần queue (optional: RabbitMQ)

---

## 🔄 Bắt đầu triển khai?

Bạn muốn tôi bắt đầu triển khai chức năng nào trước?
1. **Office to PDF Conversion** (Background Processing)
2. **Phân quyền Internal vs Public**  
3. **Chia sẻ nâng cao với Email**

Hoặc tôi có thể triển khai tuần tự tất cả các chức năng.
