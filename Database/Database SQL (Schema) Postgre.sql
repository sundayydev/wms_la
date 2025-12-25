CREATE DATABASE wms_la;

-- User
CREATE TABLE "User" (
    UserID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL, -- Increased for hashed passwords
    Email VARCHAR(100) UNIQUE NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    Role VARCHAR(50) NOT NULL, -- ADMIN, RECEPTIONIST, TECHNICIAN, WAREHOUSE
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL
);

-- Permission || Phân quyền 

CREATE TABLE Permission (
    PermissionID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    PermissionName VARCHAR(100) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL
);

-- UserPermission || Phân quyền người dùng

CREATE TABLE UserPermission (
    UserPermissionID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    UserID UUID NOT NULL,
    PermissionID UUID NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (UserID) REFERENCES "User"(UserID),
    FOREIGN KEY (PermissionID) REFERENCES Permission(PermissionID)
);

-- Category || Loại hàng
CREATE TABLE Categories (
    CategoryID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    CategoryName NVARCHAR(100) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL
);

-- Components || Danh mục Linh kiện/ Sản phẩm
CREATE TABLE Components (
    ComponentID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    SKU VARCHAR(50) UNIQUE NOT NULL, -- Mã hàng (VD: MOBY-M63-V2)
    ComponentName NVARCHAR(200) NOT NULL, -- VD: Máy kiểm kho PDA Mobydata M63 V2
    CategoryID UUID,
    Unit NVARCHAR(20),
    ImageURL VARCHAR(500),
    
    -- Giá cả
    BasePrice DECIMAL(15, 2),
    SellPrice DECIMAL(15, 2),
    
    -- Quản lý kho
    IsSerialized BOOLEAN DEFAULT TRUE, 
    
    -- [MỚI] Lưu thông số kỹ thuật (Dạng Key-Value)
    -- Ví dụ: {"OS": "Android 13", "CPU": "Octa-core 2.0GHz", "IP_Rating": "IP65", "Battery": "5000mAh"}
    Specifications JSONB DEFAULT '{}', 
    
    -- [MỚI] Lưu tài liệu liên quan (Dạng Mảng)
    -- Ví dụ: [{"Type": "Driver", "Name": "USB Driver v1.0", "URL": "link..."}, {"Type": "Manual", "Name": "HDSD", "URL": "link..."}]
    Documents JSONB DEFAULT '[]',

    -- [MỚI] Các đối thủ cạnh tranh (Để so sánh nhanh)
    -- Ví dụ: ["Zebra TC21", "Honeywell EDA51"]
    Competitors JSONB DEFAULT '[]',

    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);



-- Index cho JSONB để tìm kiếm nhanh theo thông số kỹ thuật (Ví dụ tìm máy có Ram 4GB)
CREATE INDEX idx_components_specs ON Components USING GIN (Specifications);
-- Warehouses || Quản lý kho
CREATE TABLE Warehouses (
    WarehouseID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    WarehouseName NVARCHAR(200) NOT NULL,
    Address NVARCHAR(500),
    City NVARCHAR(100),
    District NVARCHAR(100),
    Ward NVARCHAR(100),
    PhoneNumber VARCHAR(20),
    ManagerUserID UUID, -- Người quản lý kho
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (ManagerUserID) REFERENCES "User"(UserID)
);

-- ProductInstances || Quản lý từng thiết bị cụ thể (Serial Number)
CREATE TABLE ProductInstances (
    InstanceID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    ComponentID UUID NOT NULL, -- Link tới bảng danh mục
    WarehouseID UUID, -- Đang nằm ở kho nào
    
    -- Mã định danh duy nhất của từng máy
    SerialNumber VARCHAR(100) NOT NULL, -- Số Serial (BẮT BUỘC - Duy nhất cho mỗi máy)
    PartNumber VARCHAR(100) NULL, -- Mã Part cụ thể (Tùy chọn - nếu quản lý sâu linh kiện)
    IMEI1 VARCHAR(20) NULL, -- Tùy chọn - Quan trọng cho điện thoại
    IMEI2 VARCHAR(20) NULL, -- Tùy chọn - Nếu máy 2 SIM/eSIM
    
    -- Trạng thái của riêng chiếc máy này
    Status VARCHAR(50) DEFAULT 'IN_STOCK', -- IN_STOCK, SOLD, WARRANTY, BROKEN, TRANSFERRING, DEMO
    
    -- Giá nhập thực tế của riêng chiếc này (vì mỗi đợt nhập giá có thể khác nhau)
    ActualImportPrice DECIMAL(15, 2),
    
    ImportDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT, -- Ghi chú (VD: Máy trầy xước nhẹ, hàng trưng bày)
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,

    -- Ràng buộc: Serial Number không được trùng (IMEI chỉ unique nếu có giá trị)
    UNIQUE(SerialNumber),
    
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID)
);

-- Index riêng cho IMEI (chỉ kiểm tra unique với giá trị không NULL)
CREATE UNIQUE INDEX idx_unique_imei1 ON ProductInstances(IMEI1) WHERE IMEI1 IS NOT NULL;

-- Suppliers || Nhà cung cấp
CREATE TABLE Suppliers (
    SupplierID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    SupplierCode VARCHAR(50) UNIQUE NOT NULL,
    SupplierName NVARCHAR(200) NOT NULL,
    ContactPerson NVARCHAR(100),
    PhoneNumber VARCHAR(20),
    Email VARCHAR(100),
    Address NVARCHAR(500),
    City NVARCHAR(100),
    TaxCode VARCHAR(50),
    BankAccount VARCHAR(50),
    BankName NVARCHAR(200),
    Notes TEXT,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL
);

-- Customers || Khách hàng
CREATE TABLE Customers (
    CustomerID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    CustomerCode VARCHAR(50) UNIQUE NOT NULL,
    CustomerName NVARCHAR(200) NOT NULL, -- Tên khách hàng hoặc Tên Công ty
    
    -- Phân loại quan trọng
    Type VARCHAR(20) DEFAULT 'INDIVIDUAL', -- 'INDIVIDUAL' (Cá nhân), 'COMPANY' (Công ty)
    CustomerGroup VARCHAR(50) DEFAULT 'RETAIL', -- RETAIL, WHOLESALE, VIP
    
    -- Thông tin liên lạc chính (Của cá nhân hoặc Hotline cty)
    PhoneNumber VARCHAR(20),
    Email VARCHAR(100),
    
    -- Địa chỉ (Trụ sở chính hoặc nhà riêng)
    Address NVARCHAR(500),
    City NVARCHAR(100),
    District NVARCHAR(100),
    Ward NVARCHAR(100),
    
    -- Thông tin định danh
    TaxCode VARCHAR(50), -- Quan trọng cho Công ty
    DateOfBirth DATE,    -- Dành cho khách lẻ
    Gender VARCHAR(10),  -- Dành cho khách lẻ
    
    Notes TEXT,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL
);

CREATE TABLE CustomerContacts (
    ContactID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    CustomerID UUID NOT NULL, -- FK: Liên kết với bảng Customers
    
    ContactName NVARCHAR(200) NOT NULL, -- Tên nhân viên (Vd: Anh A, Chị B)
    Position NVARCHAR(100),             -- Chức vụ (Vd: Thủ kho, Kế toán, Giám đốc)
    Department NVARCHAR(100),           -- Phòng ban (Tùy chọn)
    
    PhoneNumber VARCHAR(20) NOT NULL,   -- SĐT riêng của nhân viên này
    Email VARCHAR(100),                 -- Email riêng của nhân viên này
    
    IsDefaultReceiver BOOLEAN DEFAULT FALSE, -- Đánh dấu ai là người nhận hàng chính
    Note TEXT,                          -- Ghi chú (VD: Chỉ nhận hàng giờ hành chính)
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Tạo khóa ngoại
    CONSTRAINT fk_customer_contact
        FOREIGN KEY(CustomerID) 
        REFERENCES Customers(CustomerID)
        ON DELETE CASCADE
);

-- PurchaseOrders || Đơn đặt hàng nhập
CREATE TABLE PurchaseOrders (
    PurchaseOrderID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    OrderCode VARCHAR(50) UNIQUE NOT NULL,
    SupplierID UUID NOT NULL,
    WarehouseID UUID NOT NULL,
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ExpectedDeliveryDate DATE,
    ActualDeliveryDate DATE,
    Status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, DELIVERED, CANCELLED
    TotalAmount DECIMAL(15, 2) DEFAULT 0,
    DiscountAmount DECIMAL(15, 2) DEFAULT 0,
    FinalAmount DECIMAL(15, 2) DEFAULT 0,
    CreatedByUserID UUID,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID)
);

-- PurchaseOrderDetails || Chi tiết đơn đặt hàng nhập
CREATE TABLE PurchaseOrderDetails (
    PurchaseOrderDetailID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    PurchaseOrderID UUID NOT NULL,
    ComponentID UUID NOT NULL,
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(15, 2) NOT NULL,
    TotalPrice DECIMAL(15, 2) NOT NULL,
    ReceivedQuantity INT DEFAULT 0,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (PurchaseOrderID) REFERENCES PurchaseOrders(PurchaseOrderID),
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID)
);

-- SalesOrders || Đơn bán hàng
CREATE TABLE SalesOrders (
    SalesOrderID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    OrderCode VARCHAR(50) UNIQUE NOT NULL,
    CustomerID UUID NOT NULL,
    WarehouseID UUID NOT NULL,
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, COMPLETED, CANCELLED
    TotalAmount DECIMAL(15, 2) DEFAULT 0,
    DiscountAmount DECIMAL(15, 2) DEFAULT 0,
    FinalAmount DECIMAL(15, 2) DEFAULT 0,
    PaymentStatus VARCHAR(50) DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID
    PaymentMethod VARCHAR(50), -- CASH, BANK_TRANSFER, MOMO, CREDIT_CARD
    CreatedByUserID UUID,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID)
);

-- SalesOrderDetails || Chi tiết đơn bán hàng
CREATE TABLE SalesOrderDetails (
    SalesOrderDetailID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    SalesOrderID UUID NOT NULL,
    ComponentID UUID,
    InstanceID UUID, -- Nếu bán sản phẩm có Serial/IMEI cụ thể
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(15, 2) NOT NULL,
    TotalPrice DECIMAL(15, 2) NOT NULL,
    DiscountPercent DECIMAL(5, 2) DEFAULT 0,
    DiscountAmount DECIMAL(15, 2) DEFAULT 0,
    FinalPrice DECIMAL(15, 2) NOT NULL,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (SalesOrderID) REFERENCES SalesOrders(SalesOrderID),
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID)
);

-- StockTransfers || Chuyển kho
CREATE TABLE StockTransfers (
    TransferID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    TransferCode VARCHAR(50) UNIQUE NOT NULL,
    FromWarehouseID UUID NOT NULL,
    ToWarehouseID UUID NOT NULL,
    TransferDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ExpectedReceiveDate DATE,
    ActualReceiveDate DATE,
    Status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_TRANSIT, RECEIVED, CANCELLED
    CreatedByUserID UUID,
    ReceivedByUserID UUID,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (FromWarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (ToWarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID),
    FOREIGN KEY (ReceivedByUserID) REFERENCES "User"(UserID)
);

-- StockTransferDetails || Chi tiết chuyển kho
CREATE TABLE StockTransferDetails (
    TransferDetailID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    TransferID UUID NOT NULL,
    InstanceID UUID NOT NULL,
    ComponentID UUID NOT NULL,
    Quantity INT NOT NULL,
    ReceivedQuantity INT DEFAULT 0,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (TransferID) REFERENCES StockTransfers(TransferID),
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID),
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID)
);

-- Repairs || Đơn sửa chữa/bảo hành
CREATE TABLE Repairs (
    RepairID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    RepairCode VARCHAR(50) UNIQUE NOT NULL,
    CustomerID UUID NOT NULL,
    InstanceID UUID, -- Sản phẩm cần sửa (nếu có)
    ComponentID UUID, -- Loại sản phẩm
    ProblemDescription TEXT NOT NULL,
    RepairDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ExpectedCompletionDate DATE,
    ActualCompletionDate DATE,
    Status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    TechnicianUserID UUID,
    RepairCost DECIMAL(15, 2) DEFAULT 0,
    PartsCost DECIMAL(15, 2) DEFAULT 0,
    TotalCost DECIMAL(15, 2) DEFAULT 0,
    PaymentStatus VARCHAR(50) DEFAULT 'UNPAID',
    WarrantyType VARCHAR(50), -- IN_WARRANTY, OUT_WARRANTY, EXTENDED_WARRANTY
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID),
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (TechnicianUserID) REFERENCES "User"(UserID)
);

-- RepairParts || Linh kiện thay thế trong sửa chữa
CREATE TABLE RepairParts (
    RepairPartID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    RepairID UUID NOT NULL,
    ComponentID UUID NOT NULL,
    InstanceID UUID, -- Nếu thay linh kiện có serial
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(15, 2) NOT NULL,
    TotalPrice DECIMAL(15, 2) NOT NULL,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (RepairID) REFERENCES Repairs(RepairID),
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID)
);

-- InventoryTransactions || Lịch sử giao dịch kho
CREATE TABLE InventoryTransactions (
    TransactionID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    TransactionCode VARCHAR(50) UNIQUE NOT NULL,
    TransactionType VARCHAR(50) NOT NULL, -- IMPORT, EXPORT, TRANSFER, ADJUSTMENT
    ReferenceID UUID, -- ID của đơn hàng liên quan (Purchase/Sales/Transfer)
    WarehouseID UUID NOT NULL,
    ComponentID UUID NOT NULL,
    InstanceID UUID, -- Nếu là sản phẩm có serial
    Quantity INT NOT NULL, -- + là nhập, - là xuất
    TransactionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedByUserID UUID,
    Notes TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID)
);

CREATE TABLE RepairStatusHistory (
    HistoryID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    RepairID UUID NOT NULL,
    OldStatus VARCHAR(50),
    NewStatus VARCHAR(50) NOT NULL,
    ChangedByUserID UUID,
    ChangeDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Note TEXT, -- Ghi chú lý do chuyển trạng thái
    FOREIGN KEY (RepairID) REFERENCES Repairs(RepairID),
    FOREIGN KEY (ChangedByUserID) REFERENCES "User"(UserID)
);
COMMENT ON TABLE RepairStatusHistory IS 'Theo dõi hành trình sửa chữa chi tiết (Audit log cho quy trình sửa chữa)';

CREATE TABLE Attachments (
    AttachmentID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    EntityType VARCHAR(50) NOT NULL, -- 'PRODUCT', 'REPAIR', 'PAYMENT', 'ORDER'
    EntityID UUID NOT NULL, -- ID của đối tượng tương ứng
    FileName NVARCHAR(255),
    FileURL VARCHAR(500) NOT NULL, -- Đường dẫn file trên server/cloud
    FileType VARCHAR(50), -- 'IMAGE', 'PDF', 'DOC'
    UploadedByUserID UUID,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UploadedByUserID) REFERENCES "User"(UserID)
);
COMMENT ON TABLE Attachments IS 'Lưu trữ hình ảnh, tài liệu đính kèm cho mọi đối tượng trong hệ thống';

-- Payments || Quản lý thanh toán
CREATE TABLE Payments (
    PaymentID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    PaymentCode VARCHAR(50) UNIQUE NOT NULL,
    ReferenceType VARCHAR(50) NOT NULL, -- SALES_ORDER, REPAIR, PURCHASE_ORDER
    ReferenceID UUID NOT NULL, -- ID của đơn hàng liên quan
    CustomerID UUID,
    SupplierID UUID,
    PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PaymentMethod VARCHAR(50) NOT NULL, -- CASH, BANK_TRANSFER, MOMO, CREDIT_CARD
    Amount DECIMAL(15, 2) NOT NULL,
    Status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, REFUNDED
    TransactionID VARCHAR(100), -- Mã giao dịch từ cổng thanh toán
    Notes TEXT,
    CreatedByUserID UUID,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID)
);

-- Notifications || Thông báo (cho Mobile/Web)
CREATE TABLE Notifications (
    NotificationID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    UserID UUID NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Message TEXT NOT NULL,
    NotificationType VARCHAR(50), -- ORDER, PAYMENT, STOCK, SYSTEM
    ReferenceType VARCHAR(50),
    ReferenceID UUID,
    IsRead BOOLEAN DEFAULT FALSE,
    ReadAt TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (UserID) REFERENCES "User"(UserID)
);

CREATE TABLE AuditLogs (
    LogID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    UserID UUID,
    
    -- [MỚI] Quan trọng cho đa chi nhánh
    WarehouseID UUID, 
    
    -- Phân loại hành động
    Action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, IMPORT_EXCEL, SCAN_BARCODE
    EntityType VARCHAR(100), -- User, Product, SalesOrder, Inventory
    EntityID UUID, -- ID của đối tượng bị tác động
    
    -- [NÂNG CẤP] Dùng JSONB để query sự thay đổi cụ thể
    OldValue JSONB, 
    NewValue JSONB, 
    
    -- [MỚI] Trạng thái thực hiện
    Status VARCHAR(20) DEFAULT 'SUCCESS', -- SUCCESS, FAILURE, WARNING
    ErrorMessage TEXT, -- Lưu lỗi nếu Status = FAILURE
    
    -- [MỚI] Nguồn gốc thiết bị
    Source VARCHAR(50), -- WEB_ADMIN, PDA_APP, MOBILE_APP, SYSTEM_JOB (Cronjob)
    RequestID VARCHAR(100), -- Trace ID để gom nhóm log theo request
    
    -- Thông tin môi trường
    IPAddress VARCHAR(50),
    UserAgent TEXT, -- Chứa thông tin OS, Browser, Device Name
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserID) REFERENCES "User"(UserID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID)
);

-- Index cho JSONB (Giúp tìm kiếm lịch sử thay đổi giá/số lượng cực nhanh)
CREATE INDEX idx_audit_oldvalue ON AuditLogs USING GIN (OldValue);
CREATE INDEX idx_audit_newvalue ON AuditLogs USING GIN (NewValue);

-- Index cơ bản
CREATE INDEX idx_audit_user ON AuditLogs(UserID);
CREATE INDEX idx_audit_entity ON AuditLogs(EntityType, EntityID);
CREATE INDEX idx_audit_created ON AuditLogs(CreatedAt);
CREATE INDEX idx_audit_request ON AuditLogs(RequestID);

-- DeviceTokens || Token thiết bị cho push notification (Mobile)
CREATE TABLE DeviceTokens (
    TokenID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    UserID UUID NOT NULL,
    DeviceToken VARCHAR(500) NOT NULL,
    DeviceType VARCHAR(50), -- IOS, ANDROID
    DeviceName NVARCHAR(200),
    IsActive BOOLEAN DEFAULT TRUE,
    LastUsedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserID) REFERENCES "User"(UserID),
    UNIQUE(DeviceToken)
);

-- AppSettings || Cài đặt hệ thống
CREATE TABLE AppSettings (
    SettingID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    SettingKey VARCHAR(100) UNIQUE NOT NULL, -- VD: 'company_email', 'allow_negative_stock'
    SettingValue TEXT,                       -- Giá trị thực tế
    
    -- [MỚI] Phân nhóm để hiển thị Tab trên UI
    Category VARCHAR(50) DEFAULT 'GENERAL',  -- GENERAL, INVENTORY, FINANCE, SYSTEM
    
    -- Mô tả cho người dùng hiểu setting này làm gì
    Description NVARCHAR(500),
    
    -- [MỚI] Định hướng cách hiển thị trên Frontend
    DataType VARCHAR(50) DEFAULT 'STRING',   -- STRING, NUMBER, BOOLEAN, JSON
    InputType VARCHAR(50) DEFAULT 'TEXT',    -- TEXT, TEXTAREA, SWITCH, SELECT, NUMBER, PASSWORD, COLOR
    
    -- [MỚI] Dữ liệu cho Dropdown (nếu InputType = SELECT)
    -- VD: [{"label": "Khổ A4", "value": "A4"}, {"label": "Tem 50x30", "value": "50x30"}]
    Options JSONB DEFAULT NULL,
    
    -- [MỚI] Đánh dấu dữ liệu nhạy cảm (SMTP Pass, API Key) -> Backend sẽ mã hóa khi lưu
    IsEncrypted BOOLEAN DEFAULT FALSE,
    
    IsSystem BOOLEAN DEFAULT FALSE,          -- True: Không cho phép xóa, chỉ cho sửa Value
    
    UpdatedByUserID UUID,                    -- Ai là người sửa cấu hình này lần cuối
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UpdatedByUserID) REFERENCES "User"(UserID)
);

-- Index để query nhanh theo nhóm (khi load trang settings)
CREATE INDEX idx_appsettings_category ON AppSettings(Category);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- User Indexes
CREATE INDEX idx_user_username ON "User"(Username);
CREATE INDEX idx_user_email ON "User"(Email);
CREATE INDEX idx_user_role ON "User"(Role);

-- Components Indexes
CREATE INDEX idx_components_sku ON Components(SKU);
CREATE INDEX idx_components_category ON Components(CategoryID);

-- ProductInstances Indexes
CREATE INDEX idx_instances_serial ON ProductInstances(SerialNumber);
CREATE INDEX idx_instances_imei1 ON ProductInstances(IMEI1);
CREATE INDEX idx_instances_component ON ProductInstances(ComponentID);
CREATE INDEX idx_instances_warehouse ON ProductInstances(WarehouseID);
CREATE INDEX idx_instances_status ON ProductInstances(Status);

-- Orders Indexes
CREATE INDEX idx_purchase_orders_code ON PurchaseOrders(OrderCode);
CREATE INDEX idx_purchase_orders_supplier ON PurchaseOrders(SupplierID);
CREATE INDEX idx_purchase_orders_status ON PurchaseOrders(Status);

CREATE INDEX idx_sales_orders_code ON SalesOrders(OrderCode);
CREATE INDEX idx_sales_orders_customer ON SalesOrders(CustomerID);
CREATE INDEX idx_sales_orders_status ON SalesOrders(Status);

-- Customers & Suppliers Indexes
CREATE INDEX idx_customers_code ON Customers(CustomerCode);
CREATE INDEX idx_customers_phone ON Customers(PhoneNumber);
CREATE INDEX idx_suppliers_code ON Suppliers(SupplierCode);

-- Repairs Indexes
CREATE INDEX idx_repairs_code ON Repairs(RepairCode);
CREATE INDEX idx_repairs_customer ON Repairs(CustomerID);
CREATE INDEX idx_repairs_status ON Repairs(Status);

-- Transactions Indexes
CREATE INDEX idx_inventory_trans_type ON InventoryTransactions(TransactionType);
CREATE INDEX idx_inventory_trans_warehouse ON InventoryTransactions(WarehouseID);
CREATE INDEX idx_inventory_trans_date ON InventoryTransactions(TransactionDate);

-- Notifications Indexes
CREATE INDEX idx_notifications_user ON Notifications(UserID);
CREATE INDEX idx_notifications_read ON Notifications(IsRead);

-- =====================================================
-- COMMENTS FOR DATABASE DOCUMENTATION (CHI TIẾT)
-- =====================================================

-- ===================== BẢNG USER =====================
COMMENT ON TABLE "User" IS 'Quản lý người dùng hệ thống (Admin, Nhân viên bán hàng, Kỹ thuật viên, Thủ kho)';
COMMENT ON COLUMN "User".UserID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN "User".Username IS 'Tên đăng nhập, duy nhất trong hệ thống';
COMMENT ON COLUMN "User".Password IS 'Mật khẩu đã được mã hóa (BCrypt/Argon2)';
COMMENT ON COLUMN "User".Email IS 'Email người dùng, dùng để khôi phục mật khẩu';
COMMENT ON COLUMN "User".PhoneNumber IS 'Số điện thoại liên hệ';
COMMENT ON COLUMN "User".Role IS 'Vai trò: ADMIN, RECEPTIONIST, TECHNICIAN, WAREHOUSE';
COMMENT ON COLUMN "User".IsActive IS 'Trạng thái hoạt động (TRUE = đang làm việc)';
COMMENT ON COLUMN "User".DeletedAt IS 'Soft delete - ngày xóa (NULL = chưa xóa)';

-- ===================== BẢNG PERMISSION =====================
COMMENT ON TABLE Permission IS 'Định nghĩa các quyền trong hệ thống';
COMMENT ON COLUMN Permission.PermissionName IS 'Tên quyền (VD: VIEW_INVENTORY, EDIT_ORDER, MANAGE_USER)';

-- ===================== BẢNG USER PERMISSION =====================
COMMENT ON TABLE UserPermission IS 'Bảng trung gian để gán quyền cho người dùng (Many-to-Many)';

-- ===================== BẢNG CATEGORIES =====================
COMMENT ON TABLE Categories IS 'Phân loại sản phẩm/linh kiện (VD: Màn hình, Pin, Mainboard, Thiết bị cầm tay)';
COMMENT ON COLUMN Categories.CategoryName IS 'Tên danh mục sản phẩm';

-- ===================== BẢNG COMPONENTS =====================
COMMENT ON TABLE Components IS 'Danh mục sản phẩm/linh kiện chung (Model). Mỗi dòng = 1 loại sản phẩm, không phải từng chiếc';
COMMENT ON COLUMN Components.SKU IS 'Stock Keeping Unit - Mã quản lý kho duy nhất (VD: MOBY-M63-V2)';
COMMENT ON COLUMN Components.ComponentName IS 'Tên đầy đủ của sản phẩm (VD: Máy kiểm kho PDA Mobydata M63 V2)';
COMMENT ON COLUMN Components.CategoryID IS 'FK: Liên kết đến bảng Categories';
COMMENT ON COLUMN Components.Unit IS 'Đơn vị tính (Cái, Chiếc, Bộ, Hộp)';
COMMENT ON COLUMN Components.ImageURL IS 'Đường dẫn ảnh đại diện của sản phẩm';
COMMENT ON COLUMN Components.BasePrice IS 'Giá nhập (giá gốc từ nhà cung cấp)';
COMMENT ON COLUMN Components.SellPrice IS 'Giá bán niêm yết';
COMMENT ON COLUMN Components.IsSerialized IS 'TRUE = Quản lý theo Serial/IMEI (từng chiếc), FALSE = Quản lý theo số lượng';
COMMENT ON COLUMN Components.Specifications IS 'Thông số kỹ thuật dạng JSON (VD: {"OS": "Android 13", "RAM": "4GB"})';
COMMENT ON COLUMN Components.Documents IS 'Tài liệu liên quan dạng JSON Array (Datasheet, Manual, Driver)';
COMMENT ON COLUMN Components.Competitors IS 'Danh sách sản phẩm đối thủ để so sánh (VD: ["Zebra TC21", "Honeywell EDA51"])';

-- ===================== BẢNG WAREHOUSES =====================
COMMENT ON TABLE Warehouses IS 'Danh sách kho hàng trong hệ thống';
COMMENT ON COLUMN Warehouses.WarehouseName IS 'Tên kho (VD: Kho chính HCM, Kho chi nhánh HN)';
COMMENT ON COLUMN Warehouses.Address IS 'Địa chỉ chi tiết của kho';
COMMENT ON COLUMN Warehouses.City IS 'Tỉnh/Thành phố';
COMMENT ON COLUMN Warehouses.District IS 'Quận/Huyện';
COMMENT ON COLUMN Warehouses.Ward IS 'Phường/Xã';
COMMENT ON COLUMN Warehouses.ManagerUserID IS 'FK: Người quản lý kho (User)';
COMMENT ON COLUMN Warehouses.IsActive IS 'Trạng thái hoạt động của kho';

-- ===================== BẢNG PRODUCT INSTANCES =====================
COMMENT ON TABLE ProductInstances IS 'Quản lý TỪNG thiết bị cụ thể theo Serial/IMEI. Mỗi dòng = 1 chiếc máy thực tế';
COMMENT ON COLUMN ProductInstances.ComponentID IS 'FK: Loại sản phẩm (link đến Components)';
COMMENT ON COLUMN ProductInstances.WarehouseID IS 'FK: Kho đang chứa thiết bị này';
COMMENT ON COLUMN ProductInstances.SerialNumber IS 'Số Serial - Duy nhất cho mỗi máy';
COMMENT ON COLUMN ProductInstances.PartNumber IS 'Mã Part Number (nếu quản lý sâu linh kiện bên trong)';
COMMENT ON COLUMN ProductInstances.IMEI1 IS 'Mã IMEI chính (quan trọng cho điện thoại)';
COMMENT ON COLUMN ProductInstances.IMEI2 IS 'Mã IMEI phụ (máy 2 SIM hoặc eSIM)';
COMMENT ON COLUMN ProductInstances.Status IS 'Trạng thái: IN_STOCK, SOLD, WARRANTY, BROKEN, TRANSFERRING, DEMO';
COMMENT ON COLUMN ProductInstances.ActualImportPrice IS 'Giá nhập thực tế của riêng chiếc này (mỗi đợt có thể khác nhau)';
COMMENT ON COLUMN ProductInstances.ImportDate IS 'Ngày nhập kho';
COMMENT ON COLUMN ProductInstances.Notes IS 'Ghi chú riêng cho máy (VD: Trầy xước nhẹ, Hàng trưng bày)';

-- ===================== BẢNG SUPPLIERS =====================
COMMENT ON TABLE Suppliers IS 'Quản lý nhà cung cấp';
COMMENT ON COLUMN Suppliers.SupplierCode IS 'Mã nhà cung cấp (duy nhất)';
COMMENT ON COLUMN Suppliers.SupplierName IS 'Tên công ty nhà cung cấp';
COMMENT ON COLUMN Suppliers.ContactPerson IS 'Tên người liên hệ chính';
COMMENT ON COLUMN Suppliers.TaxCode IS 'Mã số thuế doanh nghiệp';
COMMENT ON COLUMN Suppliers.BankAccount IS 'Số tài khoản ngân hàng';
COMMENT ON COLUMN Suppliers.BankName IS 'Tên ngân hàng';

-- ===================== BẢNG CUSTOMERS =====================
COMMENT ON TABLE Customers IS 'Quản lý khách hàng (Cá nhân hoặc Công ty)';
COMMENT ON COLUMN Customers.CustomerCode IS 'Mã khách hàng (duy nhất, tự động tạo)';
COMMENT ON COLUMN Customers.CustomerName IS 'Tên khách hàng hoặc Tên Công ty';
COMMENT ON COLUMN Customers.Type IS 'Loại KH: INDIVIDUAL (Cá nhân), COMPANY (Doanh nghiệp)';
COMMENT ON COLUMN Customers.CustomerGroup IS 'Nhóm KH: RETAIL (Lẻ), WHOLESALE (Sỉ), VIP';
COMMENT ON COLUMN Customers.PhoneNumber IS 'SĐT liên hệ chính (cá nhân) hoặc Hotline (công ty)';
COMMENT ON COLUMN Customers.TaxCode IS 'Mã số thuế (bắt buộc cho khách công ty)';
COMMENT ON COLUMN Customers.DateOfBirth IS 'Ngày sinh (dành cho khách cá nhân)';
COMMENT ON COLUMN Customers.Gender IS 'Giới tính: MALE, FEMALE, OTHER (dành cho khách cá nhân)';

-- ===================== BẢNG CUSTOMER CONTACTS =====================
COMMENT ON TABLE CustomerContacts IS 'Danh sách nhân viên liên hệ của khách hàng công ty';
COMMENT ON COLUMN CustomerContacts.CustomerID IS 'FK: Khách hàng công ty';
COMMENT ON COLUMN CustomerContacts.ContactName IS 'Tên nhân viên liên hệ';
COMMENT ON COLUMN CustomerContacts.Position IS 'Chức vụ (Thủ kho, Kế toán, Giám đốc...)';
COMMENT ON COLUMN CustomerContacts.Department IS 'Phòng ban';
COMMENT ON COLUMN CustomerContacts.IsDefaultReceiver IS 'Đánh dấu người nhận hàng chính';
COMMENT ON COLUMN CustomerContacts.Note IS 'Ghi chú (VD: Chỉ nhận hàng giờ hành chính)';

-- ===================== BẢNG PURCHASE ORDERS =====================
COMMENT ON TABLE PurchaseOrders IS 'Đơn đặt hàng nhập từ nhà cung cấp';
COMMENT ON COLUMN PurchaseOrders.OrderCode IS 'Mã đơn nhập (VD: PO-2024-001)';
COMMENT ON COLUMN PurchaseOrders.SupplierID IS 'FK: Nhà cung cấp';
COMMENT ON COLUMN PurchaseOrders.WarehouseID IS 'FK: Kho nhận hàng';
COMMENT ON COLUMN PurchaseOrders.ExpectedDeliveryDate IS 'Ngày dự kiến giao hàng';
COMMENT ON COLUMN PurchaseOrders.ActualDeliveryDate IS 'Ngày thực tế nhận hàng';
COMMENT ON COLUMN PurchaseOrders.Status IS 'Trạng thái: PENDING, CONFIRMED, DELIVERED, CANCELLED';
COMMENT ON COLUMN PurchaseOrders.TotalAmount IS 'Tổng tiền chưa chiết khấu';
COMMENT ON COLUMN PurchaseOrders.DiscountAmount IS 'Số tiền chiết khấu';
COMMENT ON COLUMN PurchaseOrders.FinalAmount IS 'Số tiền thực trả = Total - Discount';
COMMENT ON COLUMN PurchaseOrders.CreatedByUserID IS 'FK: Người tạo đơn';

-- ===================== BẢNG PURCHASE ORDER DETAILS =====================
COMMENT ON TABLE PurchaseOrderDetails IS 'Chi tiết từng dòng sản phẩm trong đơn nhập';
COMMENT ON COLUMN PurchaseOrderDetails.ComponentID IS 'FK: Sản phẩm nhập';
COMMENT ON COLUMN PurchaseOrderDetails.Quantity IS 'Số lượng đặt';
COMMENT ON COLUMN PurchaseOrderDetails.UnitPrice IS 'Đơn giá';
COMMENT ON COLUMN PurchaseOrderDetails.TotalPrice IS 'Thành tiền = Quantity x UnitPrice';
COMMENT ON COLUMN PurchaseOrderDetails.ReceivedQuantity IS 'Số lượng đã nhận thực tế';

-- ===================== BẢNG SALES ORDERS =====================
COMMENT ON TABLE SalesOrders IS 'Đơn bán hàng cho khách';
COMMENT ON COLUMN SalesOrders.OrderCode IS 'Mã đơn bán (VD: SO-2024-001)';
COMMENT ON COLUMN SalesOrders.CustomerID IS 'FK: Khách hàng';
COMMENT ON COLUMN SalesOrders.WarehouseID IS 'FK: Kho xuất hàng';
COMMENT ON COLUMN SalesOrders.Status IS 'Trạng thái đơn: PENDING, CONFIRMED, COMPLETED, CANCELLED';
COMMENT ON COLUMN SalesOrders.PaymentStatus IS 'Trạng thái thanh toán: UNPAID, PARTIAL, PAID';
COMMENT ON COLUMN SalesOrders.PaymentMethod IS 'Phương thức: CASH, BANK_TRANSFER, MOMO, CREDIT_CARD';

-- ===================== BẢNG SALES ORDER DETAILS =====================
COMMENT ON TABLE SalesOrderDetails IS 'Chi tiết từng dòng sản phẩm trong đơn bán';
COMMENT ON COLUMN SalesOrderDetails.ComponentID IS 'FK: Loại sản phẩm';
COMMENT ON COLUMN SalesOrderDetails.InstanceID IS 'FK: Máy cụ thể (nếu có Serial)';
COMMENT ON COLUMN SalesOrderDetails.DiscountPercent IS 'Phần trăm chiết khấu';
COMMENT ON COLUMN SalesOrderDetails.DiscountAmount IS 'Số tiền chiết khấu';
COMMENT ON COLUMN SalesOrderDetails.FinalPrice IS 'Giá sau chiết khấu';

-- ===================== BẢNG STOCK TRANSFERS =====================
COMMENT ON TABLE StockTransfers IS 'Quản lý phiếu chuyển kho';
COMMENT ON COLUMN StockTransfers.TransferCode IS 'Mã phiếu chuyển (VD: TF-2024-001)';
COMMENT ON COLUMN StockTransfers.FromWarehouseID IS 'FK: Kho xuất';
COMMENT ON COLUMN StockTransfers.ToWarehouseID IS 'FK: Kho nhận';
COMMENT ON COLUMN StockTransfers.Status IS 'Trạng thái: PENDING, IN_TRANSIT, RECEIVED, CANCELLED';
COMMENT ON COLUMN StockTransfers.CreatedByUserID IS 'FK: Người tạo phiếu (Kho xuất)';
COMMENT ON COLUMN StockTransfers.ReceivedByUserID IS 'FK: Người nhận hàng (Kho nhận)';

-- ===================== BẢNG STOCK TRANSFER DETAILS =====================
COMMENT ON TABLE StockTransferDetails IS 'Chi tiết từng máy/sản phẩm được chuyển kho';
COMMENT ON COLUMN StockTransferDetails.InstanceID IS 'FK: Máy cụ thể được chuyển';
COMMENT ON COLUMN StockTransferDetails.Quantity IS 'Số lượng chuyển';
COMMENT ON COLUMN StockTransferDetails.ReceivedQuantity IS 'Số lượng thực nhận';

-- ===================== BẢNG REPAIRS =====================
COMMENT ON TABLE Repairs IS 'Quản lý đơn sửa chữa / bảo hành';
COMMENT ON COLUMN Repairs.RepairCode IS 'Mã phiếu sửa chữa (VD: RP-2024-001)';
COMMENT ON COLUMN Repairs.CustomerID IS 'FK: Khách hàng mang máy đến sửa';
COMMENT ON COLUMN Repairs.InstanceID IS 'FK: Máy cụ thể cần sửa (nếu có trong hệ thống)';
COMMENT ON COLUMN Repairs.ComponentID IS 'FK: Loại sản phẩm (nếu máy ngoài hệ thống)';
COMMENT ON COLUMN Repairs.ProblemDescription IS 'Mô tả lỗi/triệu chứng do khách báo';
COMMENT ON COLUMN Repairs.Status IS 'Trạng thái: PENDING, IN_PROGRESS, COMPLETED, CANCELLED, AWAITING_PARTS';
COMMENT ON COLUMN Repairs.TechnicianUserID IS 'FK: Kỹ thuật viên phụ trách';
COMMENT ON COLUMN Repairs.RepairCost IS 'Chi phí công sửa chữa';
COMMENT ON COLUMN Repairs.PartsCost IS 'Chi phí linh kiện thay thế';
COMMENT ON COLUMN Repairs.TotalCost IS 'Tổng chi phí = RepairCost + PartsCost';
COMMENT ON COLUMN Repairs.WarrantyType IS 'Loại BH: IN_WARRANTY, OUT_WARRANTY, EXTENDED_WARRANTY';

-- ===================== BẢNG REPAIR PARTS =====================
COMMENT ON TABLE RepairParts IS 'Linh kiện thay thế trong quá trình sửa chữa';
COMMENT ON COLUMN RepairParts.RepairID IS 'FK: Đơn sửa chữa';
COMMENT ON COLUMN RepairParts.ComponentID IS 'FK: Loại linh kiện thay';
COMMENT ON COLUMN RepairParts.InstanceID IS 'FK: Linh kiện cụ thể (nếu có Serial)';
COMMENT ON COLUMN RepairParts.Quantity IS 'Số lượng sử dụng';
COMMENT ON COLUMN RepairParts.UnitPrice IS 'Đơn giá linh kiện';

-- ===================== BẢNG INVENTORY TRANSACTIONS =====================
COMMENT ON TABLE InventoryTransactions IS 'Lịch sử tất cả giao dịch xuất nhập kho (Audit Trail)';
COMMENT ON COLUMN InventoryTransactions.TransactionCode IS 'Mã giao dịch (VD: INV-2024-00001)';
COMMENT ON COLUMN InventoryTransactions.TransactionType IS 'Loại: IMPORT (Nhập), EXPORT (Xuất), TRANSFER (Chuyển), ADJUSTMENT (Điều chỉnh)';
COMMENT ON COLUMN InventoryTransactions.ReferenceID IS 'FK: ID đơn hàng liên quan (Purchase/Sales/Transfer/Repair)';
COMMENT ON COLUMN InventoryTransactions.WarehouseID IS 'FK: Kho thực hiện giao dịch';
COMMENT ON COLUMN InventoryTransactions.ComponentID IS 'FK: Loại sản phẩm';
COMMENT ON COLUMN InventoryTransactions.InstanceID IS 'FK: Máy cụ thể (nếu có Serial)';
COMMENT ON COLUMN InventoryTransactions.Quantity IS 'Số lượng thay đổi: Dương = Nhập, Âm = Xuất';

-- ===================== BẢNG REPAIR STATUS HISTORY =====================
-- (Comment đã có trong schema)

-- ===================== BẢNG ATTACHMENTS =====================
-- (Comment đã có trong schema)

-- ===================== BẢNG PAYMENTS =====================
COMMENT ON TABLE Payments IS 'Quản lý tất cả giao dịch thanh toán';
COMMENT ON COLUMN Payments.PaymentCode IS 'Mã thanh toán (VD: PAY-2024-001)';
COMMENT ON COLUMN Payments.ReferenceType IS 'Loại: SALES_ORDER, REPAIR, PURCHASE_ORDER';
COMMENT ON COLUMN Payments.ReferenceID IS 'FK: ID đơn hàng được thanh toán';
COMMENT ON COLUMN Payments.CustomerID IS 'FK: Khách hàng (nếu thu tiền)';
COMMENT ON COLUMN Payments.SupplierID IS 'FK: Nhà cung cấp (nếu trả tiền)';
COMMENT ON COLUMN Payments.PaymentMethod IS 'Phương thức: CASH, BANK_TRANSFER, MOMO, CREDIT_CARD';
COMMENT ON COLUMN Payments.Amount IS 'Số tiền thanh toán';
COMMENT ON COLUMN Payments.Status IS 'Trạng thái: PENDING, COMPLETED, FAILED, REFUNDED';
COMMENT ON COLUMN Payments.TransactionID IS 'Mã giao dịch từ cổng thanh toán (VNPay, Momo...)';

-- ===================== BẢNG NOTIFICATIONS =====================
COMMENT ON TABLE Notifications IS 'Thông báo đẩy cho người dùng (Mobile/Web)';
COMMENT ON COLUMN Notifications.UserID IS 'FK: Người nhận thông báo';
COMMENT ON COLUMN Notifications.Title IS 'Tiêu đề thông báo';
COMMENT ON COLUMN Notifications.Message IS 'Nội dung chi tiết';
COMMENT ON COLUMN Notifications.NotificationType IS 'Loại: ORDER, PAYMENT, STOCK (cảnh báo tồn kho), SYSTEM';
COMMENT ON COLUMN Notifications.ReferenceType IS 'Loại đối tượng liên quan (Order, Repair...)';
COMMENT ON COLUMN Notifications.ReferenceID IS 'ID đối tượng để link khi tap vào thông báo';
COMMENT ON COLUMN Notifications.IsRead IS 'Đã đọc chưa';
COMMENT ON COLUMN Notifications.ReadAt IS 'Thời điểm đọc';

-- ===================== BẢNG AUDIT LOGS =====================
COMMENT ON TABLE AuditLogs IS 'Nhật ký mọi hoạt động trong hệ thống (Security Audit)';
COMMENT ON COLUMN AuditLogs.UserID IS 'FK: Người thực hiện (NULL nếu là hệ thống)';
COMMENT ON COLUMN AuditLogs.Action IS 'Hành động: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, EXPORT';
COMMENT ON COLUMN AuditLogs.EntityType IS 'Loại đối tượng: User, Product, Order...';
COMMENT ON COLUMN AuditLogs.EntityID IS 'ID của đối tượng bị thay đổi';
COMMENT ON COLUMN AuditLogs.OldValue IS 'Giá trị cũ (JSON) - để rollback nếu cần';
COMMENT ON COLUMN AuditLogs.NewValue IS 'Giá trị mới (JSON)';
COMMENT ON COLUMN AuditLogs.IPAddress IS 'Địa chỉ IP của người thực hiện';
COMMENT ON COLUMN AuditLogs.UserAgent IS 'Thông tin trình duyệt/thiết bị';

-- ===================== BẢNG DEVICE TOKENS =====================
COMMENT ON TABLE DeviceTokens IS 'Lưu token thiết bị để gửi Push Notification';
COMMENT ON COLUMN DeviceTokens.DeviceToken IS 'FCM/APNs token của thiết bị';
COMMENT ON COLUMN DeviceTokens.DeviceType IS 'Loại: IOS, ANDROID';
COMMENT ON COLUMN DeviceTokens.DeviceName IS 'Tên thiết bị (VD: iPhone 15 Pro)';
COMMENT ON COLUMN DeviceTokens.IsActive IS 'Token còn hoạt động hay đã revoke';
COMMENT ON COLUMN DeviceTokens.LastUsedAt IS 'Lần cuối sử dụng (để dọn token cũ)';

-- ===================== BẢNG APP SETTINGS =====================
COMMENT ON TABLE AppSettings IS 'Cấu hình hệ thống (lưu dạng Key-Value)';
COMMENT ON COLUMN AppSettings.SettingKey IS 'Khóa cài đặt (VD: COMPANY_NAME, TAX_RATE, MAX_DISCOUNT)';
COMMENT ON COLUMN AppSettings.SettingValue IS 'Giá trị cài đặt';
COMMENT ON COLUMN AppSettings.Description IS 'Mô tả ý nghĩa của cài đặt';
COMMENT ON COLUMN AppSettings.DataType IS 'Kiểu dữ liệu: STRING, NUMBER, BOOLEAN, JSON';
COMMENT ON COLUMN AppSettings.IsSystem IS 'TRUE = Cài đặt hệ thống, không cho phép xóa';