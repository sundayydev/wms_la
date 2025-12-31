CREATE DATABASE wms_la;

-- User
CREATE TABLE "User" (
    UserID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL, -- Increased for hashed passwords
    
    -- Thông tin cá nhân
    FullName NVARCHAR(100) NOT NULL, -- Họ và tên đầy đủ
    Avatar VARCHAR(500), -- Đường dẫn ảnh đại diện
    Email VARCHAR(100) UNIQUE NOT NULL,
    PhoneNumber VARCHAR(20) NOT NULL,
    DateOfBirth DATE, -- Ngày sinh
    Gender VARCHAR(10), -- MALE, FEMALE, OTHER
    
    -- Địa chỉ
    Address NVARCHAR(500), -- Địa chỉ chi tiết
    
    -- Phân quyền và gán kho
    Role VARCHAR(50) NOT NULL, -- ADMIN, RECEPTIONIST, TECHNICIAN, WAREHOUSE
    WarehouseID UUID, -- Kho được gán (cho nhân viên kho, kỹ thuật viên)
    
    -- Trạng thái tài khoản
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    IsLocked BOOLEAN NOT NULL DEFAULT FALSE, -- Khóa tài khoản (do đăng nhập sai nhiều lần)
    FailedLoginAttempts INT DEFAULT 0, -- Số lần đăng nhập sai
    LockedUntil TIMESTAMP NULL, -- Khóa đến thời điểm nào
    
    -- Authentication & Session
    LastLoginAt TIMESTAMP, -- Lần đăng nhập cuối
    LastLoginIP VARCHAR(50), -- IP đăng nhập cuối
    PasswordChangedAt TIMESTAMP, -- Lần đổi mật khẩu cuối
    
    -- Audit fields
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

-- Category || Loại hàng (Cấu trúc phân cấp)
CREATE TABLE Categories (
    CategoryID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    CategoryName NVARCHAR(100) NOT NULL,
    CategoryCode VARCHAR(50) UNIQUE, -- Mã danh mục (VD: PDA, PRINTER, ESL)
    
    -- [MỚI] Phân cấp cha-con
    ParentCategoryID UUID, -- FK: Danh mục cha (NULL = danh mục gốc)
    Level INT DEFAULT 1, -- Cấp độ (1 = gốc, 2 = con, 3 = cháu)
    Path VARCHAR(500), -- Đường dẫn phân cấp (VD: /DEVICE/HANDHELD/PDA)
    
    -- Thông tin bổ sung
    Description TEXT,
    IconURL VARCHAR(500), -- Icon hiển thị
    SortOrder INT DEFAULT 0, -- Thứ tự sắp xếp
    
    IsActive BOOLEAN DEFAULT TRUE,
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (ParentCategoryID) REFERENCES Categories(CategoryID)
);

-- Index cho tìm kiếm phân cấp
CREATE INDEX idx_categories_parent ON Categories(ParentCategoryID);
CREATE INDEX idx_categories_path ON Categories(Path);
CREATE INDEX idx_categories_code ON Categories(CategoryCode);

-- Components || Danh mục Linh kiện/ Sản phẩm
CREATE TABLE Components (
    ComponentID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    SKU VARCHAR(50) UNIQUE NOT NULL, -- Mã hàng (VD: MOBY-M63-V2)
    ComponentName NVARCHAR(200) NOT NULL, -- VD: Máy kiểm kho PDA Mobydata M63 V2
    ComponentNameVN NVARCHAR(255); -- Tên tiếng Việt/Tên tờ khai VD: Máy đọc mã vạch
    CategoryID UUID,
    
    -- [MỚI] Phân loại sản phẩm chi tiết
    ProductType VARCHAR(50) NOT NULL DEFAULT 'DEVICE',
    -- Các loại:
    -- 'DEVICE' (Thiết bị chính): PDA, Printer, Scanner, ESL, RFID Reader, NFC Reader
    -- 'ACCESSORY' (Phụ kiện): Ốp lưng, Kính cường lực, Dây đeo, Bao da
    -- 'CONSUMABLE' (Vật tư tiêu hao): Giấy in, Mực in, Tem nhãn
    -- 'SPARE_PART' (Linh kiện thay thế): Pin, Màn hình, Mainboard
    -- 'SOFTWARE' (Phần mềm/License): License app, Phần mềm quản lý
    
    -- [MỚI] Thương hiệu & Model
    Brand NVARCHAR(100), -- VD: Zebra, Honeywell, Mobydata, Datalogic
    Model NVARCHAR(100), -- VD: TC21, M63, DS2208
    
    -- [MỚI] Mã sản phẩm gốc từ nhà sản xuất
    ManufacturerSKU VARCHAR(100), -- Part number gốc từ hãng
    Barcode VARCHAR(100), -- Mã vạch sản phẩm (EAN/UPC)
    
    Unit NVARCHAR(20), -- Đơn vị tính
    ImageURL VARCHAR(500),
    
    -- [MỚI] Gallery ảnh (nhiều ảnh)
    ImageGallery JSONB DEFAULT '[]', -- ["url1", "url2", "url3"]
    
    -- Giá cả
    BasePrice DECIMAL(15, 2), -- Giá nhập
    SellPrice DECIMAL(15, 2), -- Giá bán lẻ
    WholesalePrice DECIMAL(15, 2), -- [MỚI] Giá sỉ
    
    -- Quản lý kho
    IsSerialized BOOLEAN DEFAULT TRUE, -- TRUE: Quản lý theo Serial, FALSE: Quản lý số lượng
    MinStockLevel INT DEFAULT 0, -- [MỚI] Mức tồn kho tối thiểu (cảnh báo)
    MaxStockLevel INT, -- [MỚI] Mức tồn kho tối đa
    
    -- [MỚI] Thông tin bảo hành mặc định
    DefaultWarrantyMonths INT DEFAULT 12, -- Số tháng bảo hành mặc định
    
    -- [MỚI] Thông tin vật lý (quan trọng cho vận chuyển)
    Weight DECIMAL(10, 3), -- Trọng lượng (kg)
    Length DECIMAL(10, 2), -- Chiều dài (cm)
    Width DECIMAL(10, 2), -- Chiều rộng (cm)
    Height DECIMAL(10, 2), -- Chiều cao (cm)
    
    -- Lưu thông số kỹ thuật (Dạng Key-Value)
    --     {
    --   "PERFORMANCE PARAMETER": [
    --     { "k": "OS", "v": "Android 12", "q": 1 },
    --     { "k": "CPU", "v": "Octa Core, 2.0GHz", "q": 1 },
    --     { "k": "RAM / Flash", "v": "3GB / 32GB", "q": 1 },
    --     { "k": "USB Charging", "v": "USB 2.0 OTG,Type-C" }
    --   ],
    --   "PHYSICAL SPECIFICATIONS": [
    --     { "k": "Weight", "v": "274 g (with battery)" },
    --     { "k": "Dimension", "v": "166 mm x 71 mm x 17 mm" },
    --     { "k": "LCD", "v": "4.0 inch IPS 800*480, visible under sunshine", "q": 1 },
    --     { "k": "Touch", "v": "GFF capacitive screen, multi-touch" },
    --     { "k": "Battery", "v": "5100mAh, removable + Built-in battery 80mA", "q": 1 },
    --     { "k": "Standby Time", "v": "42 days" },
    --     { "k": "Charging Time", "v": "Over 65% in 1 hour, fully-charged in 2.5 hours" },
    --     { "k": "Working Hours", "v": "18 hours", "q": 1 },
    --     { "k": "Battery Life", "v": "500 charge and discharge > 80%" },
    --     { "k": "Keypad", "v": "Anti wear 20 key, internally transparent industrial keyboard", "q": 1 },
    --     { "k": "Camera", "v": "Auto focus 13Mega, dual flash LED", "q": 1 },
    --     { "k": "Extend Slot", "v": "Nano SIM, TF 128 GB" }
    --   ],
    --   "ENVIRONMENTAL SPECIFICATIONS": [
    --     { "k": "Storage Temperature", "v": "-30°C to 70°C" },
    --     { "k": "Operation Temperature", "v": "-25°C to +55°C" },
    --     { "k": "ESD", "v": "8K/15K" },
    --     { "k": "IP Rating", "v": "IP67", "q": 1 },
    --     { "k": "Drop", "v": "1.8m on concrete, 3 times each side", "q": 1 },
    --     { "k": "Tumble", "v": "3000 hits of 0.5m tumble, 600 hits of 1m tumble" }
    --   ]
    -- }
    Specifications JSONB DEFAULT '{}', 
    
    -- [MỚI] Tags để tìm kiếm nhanh
    Tags JSONB DEFAULT '[]', -- ["Android", "Bluetooth", "IP65", "2D Scanner"]
    
    -- Lưu tài liệu liên quan (Dạng Mảng)
    Documents JSONB DEFAULT '[]',

    -- Các đối thủ cạnh tranh
    Competitors JSONB DEFAULT '[]',
    
    -- [MỚI] Sản phẩm tương thích (cho phụ kiện)
    -- VD: Ốp lưng M63 tương thích với máy nào
    CompatibleWith JSONB DEFAULT '[]', -- [{"ComponentID": "xxx", "SKU": "MOBY-M63-V2", "Name": "PDA M63"}]
    
    -- [MỚI] Trạng thái sản phẩm
    Status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, DISCONTINUED, COMING_SOON, OUT_OF_STOCK
    
    -- [MỚI] SEO & Marketing
    ShortDescription NVARCHAR(500), -- Mô tả ngắn
    FullDescription TEXT, -- Mô tả đầy đủ (HTML)
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- Indexes mới cho Components
CREATE INDEX idx_components_product_type ON Components(ProductType);
CREATE INDEX idx_components_device_type ON Components(DeviceType);
CREATE INDEX idx_components_brand ON Components(Brand);
CREATE INDEX idx_components_status ON Components(Status);
CREATE INDEX idx_components_tags ON Components USING GIN (Tags);



-- Index cho JSONB để tìm kiếm nhanh theo thông số kỹ thuật (Ví dụ tìm máy có Ram 4GB)
CREATE INDEX idx_components_specs ON Components USING GIN (Specifications);

-- =====================================================
-- ComponentVariants || Biến thể sản phẩm (Part Number)
-- =====================================================
-- Một SKU có thể có nhiều Part Number (biến thể) khác nhau
-- VD: SKU = ZEBRA-TC21, có các Part Number:
--     - TC210K-01A222-A6 (Wifi only, 2GB RAM)
--     - TC210K-01B222-A6 (Wifi + LTE, 2GB RAM)
--     - TC210K-01D242-A6 (Wifi, 4GB RAM, Extended Battery)
CREATE TABLE ComponentVariants (
    VariantID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    ComponentID UUID NOT NULL, -- FK: Link tới sản phẩm chính (SKU)
    
    -- Mã Part Number (Unique trong toàn hệ thống)
    PartNumber VARCHAR(100) NOT NULL, -- VD: TC210K-01A222-A6
    
    -- Thông tin biến thể
    VariantName NVARCHAR(200), -- VD: "TC21 Wifi 2GB" hoặc NULL để dùng tên gốc
    VariantDescription NVARCHAR(500), -- Mô tả ngắn về biến thể này
    
    -- Thông số kỹ thuật khác biệt so với base
    -- Chỉ lưu những specs KHÁC với sản phẩm chính
    VariantSpecs JSONB DEFAULT '{}',
    -- VD: {"connectivity": "Wifi + LTE", "ram": "4GB", "battery": "Extended 5000mAh"}
    
    -- Giá riêng cho biến thể (NULL = dùng giá của Component chính)
    BasePrice DECIMAL(15, 2), -- Giá nhập
    SellPrice DECIMAL(15, 2), -- Giá bán lẻ
    WholesalePrice DECIMAL(15, 2), -- Giá sỉ
    
    -- Mã vạch riêng cho biến thể
    Barcode VARCHAR(100), -- EAN/UPC cho Part Number cụ thể
    
    -- Quản lý tồn kho riêng cho biến thể
    MinStockLevel INT DEFAULT 0,
    MaxStockLevel INT,
    
    -- Trạng thái
    IsActive BOOLEAN DEFAULT TRUE,
    IsDefault BOOLEAN DEFAULT FALSE, -- TRUE = Biến thể mặc định khi không chọn PN
    SortOrder INT DEFAULT 0,
    
    -- Audit
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    -- Ràng buộc
    UNIQUE(PartNumber), -- Part Number phải unique trong toàn hệ thống
    UNIQUE(ComponentID, PartNumber), -- Không trùng PN trong cùng 1 Component
    
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID) ON DELETE CASCADE
);

-- Index cho tìm kiếm nhanh
CREATE INDEX idx_variants_component ON ComponentVariants(ComponentID);
CREATE INDEX idx_variants_partnumber ON ComponentVariants(PartNumber);
CREATE INDEX idx_variants_active ON ComponentVariants(IsActive);

-- =====================================================
-- WarehouseStock || Tồn kho theo Kho + SKU + PartNumber
-- =====================================================
-- Quản lý tồn kho TỔNG HỢP theo cặp (Warehouse, Component, Variant)
-- Dùng cho sản phẩm KHÔNG SERIALIZED (như vật tư tiêu hao, tem nhãn)
-- Sản phẩm SERIALIZED sẽ tính từ ProductInstances
CREATE TABLE WarehouseStock (
    StockID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    WarehouseID UUID NOT NULL,
    ComponentID UUID NOT NULL, -- SKU
    VariantID UUID, -- Part Number (NULL = tất cả biến thể hoặc sản phẩm không có biến thể)
    
    -- Số lượng
    QuantityOnHand INT DEFAULT 0, -- Số lượng thực tế trong kho
    QuantityReserved INT DEFAULT 0, -- Số lượng đã đặt trước (đơn hàng chưa xuất)
    QuantityAvailable INT GENERATED ALWAYS AS (QuantityOnHand - QuantityReserved) STORED, -- Số lượng khả dụng
    
    -- Vị trí mặc định trong kho
    DefaultLocationCode VARCHAR(100), -- VD: A-01-R2-S3
    
    -- Thời gian cập nhật tồn kho
    LastStockUpdate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastCountDate TIMESTAMP, -- Lần kiểm kê cuối
    
    -- Audit
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ràng buộc: Mỗi cặp (Warehouse, Component, Variant) chỉ có 1 record
    UNIQUE(WarehouseID, ComponentID, VariantID),
    
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (VariantID) REFERENCES ComponentVariants(VariantID)
);

-- Index cho truy vấn tồn kho
CREATE INDEX idx_stock_warehouse ON WarehouseStock(WarehouseID);
CREATE INDEX idx_stock_component ON WarehouseStock(ComponentID);
CREATE INDEX idx_stock_variant ON WarehouseStock(VariantID);
CREATE INDEX idx_stock_available ON WarehouseStock(QuantityAvailable);

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
    ComponentID UUID NOT NULL, -- Link tới sản phẩm (SKU)
    VariantID UUID, -- [MỚI] Link tới biến thể (Part Number) - NULL nếu không có biến thể
    WarehouseID UUID, -- Đang nằm ở kho nào
    
    -- Mã định danh duy nhất của từng máy
    SerialNumber VARCHAR(100) NOT NULL, -- Số Serial (BẮT BUỘC - Duy nhất cho mỗi máy)
    ModelNumber VARCHAR(100) NULL, -- MN: Model Number cụ thể của máy (legacy, nay dùng VariantID)
    InboundBoxNumber VARCHAR(50) NULL, -- Mã thùng hàng lúc nhập
    
    -- VD: Zebra TC21 có nhiều PN khác nhau như TC210K-01A222-A6 (Wifi), TC210K-01B222-A6 (Wifi+LTE)
    -- Nay được quản lý qua VariantID thay vì lưu trực tiếp PartNumber
    
    IMEI1 VARCHAR(20) NULL, -- Tùy chọn - Quan trọng cho điện thoại
    IMEI2 VARCHAR(20) NULL, -- Tùy chọn - Nếu máy 2 SIM/eSIM
    MACAddress VARCHAR(17) NULL, -- MAC Address nếu có (VD: AA:BB:CC:DD:EE:FF)
    
    -- Trạng thái của riêng chiếc máy này
    Status VARCHAR(50) DEFAULT 'IN_STOCK', 
    -- Các trạng thái: IN_STOCK, SOLD, WARRANTY, REPAIR, BROKEN, TRANSFERRING, DEMO, SCRAPPED, LOST
    
    -- [MỚI] Vị trí chi tiết trong kho
    LocationCode VARCHAR(100), -- VD: MAIN-A-01-R1-S2-B03 (Khu-Dãy-Kệ-Tầng-Ô)
    Zone VARCHAR(50), -- Khu vực (MAIN, REPAIR, DEMO, QUARANTINE)
    
    -- [MỚI] Thông tin chủ sở hữu hiện tại
    CurrentOwnerType VARCHAR(50) DEFAULT 'COMPANY', -- 'COMPANY', 'CUSTOMER', 'SUPPLIER', 'DEMO_PARTNER'
    CurrentOwnerID UUID, -- CustomerID hoặc SupplierID (NULL nếu COMPANY sở hữu)
    
    -- [MỚI] Thông tin bảo hành
    WarrantyStartDate DATE, -- Ngày bắt đầu bảo hành (thường là ngày bán)
    WarrantyEndDate DATE, -- Ngày hết hạn bảo hành
    WarrantyMonths INT DEFAULT 12, -- Số tháng bảo hành
    
    -- [MỚI] Lịch sử sửa chữa tổng quan
    TotalRepairCount INT DEFAULT 0, -- Tổng số lần sửa chữa
    LastRepairDate TIMESTAMP, -- Lần sửa gần nhất
    
    -- Giá nhập thực tế của riêng chiếc này (vì mỗi đợt nhập giá có thể khác nhau)
    ActualImportPrice DECIMAL(15, 2),
    
    -- [MỚI] Giá bán thực tế (nếu đã bán)
    ActualSellPrice DECIMAL(15, 2),
    SoldDate TIMESTAMP, -- Ngày bán
    SoldToCustomerID UUID, -- FK: Khách hàng mua
    
    ImportDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT, -- Ghi chú (VD: Máy trầy xước nhẹ, hàng trưng bày)
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,

    -- Ràng buộc: Serial Number không được trùng (IMEI chỉ unique nếu có giá trị)
    UNIQUE(SerialNumber),
    
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (VariantID) REFERENCES ComponentVariants(VariantID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID)
);

-- Index riêng cho IMEI (chỉ kiểm tra unique với giá trị không NULL)
CREATE UNIQUE INDEX idx_unique_imei1 ON ProductInstances(IMEI1) WHERE IMEI1 IS NOT NULL;

-- Index cho truy vấn tồn kho theo SKU + PartNumber
CREATE INDEX idx_instances_component ON ProductInstances(ComponentID);
CREATE INDEX idx_instances_variant ON ProductInstances(VariantID);
CREATE INDEX idx_instances_warehouse ON ProductInstances(WarehouseID);
CREATE INDEX idx_instances_status ON ProductInstances(Status);
CREATE INDEX idx_instances_component_variant ON ProductInstances(ComponentID, VariantID);

-- =====================================================
-- ProductLifecycleHistory || Lịch sử vòng đời sản phẩm
-- =====================================================
-- Tracking toàn bộ hành trình của 1 sản phẩm từ nhập kho đến cuối đời
CREATE TABLE ProductLifecycleHistory (
    HistoryID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    InstanceID UUID NOT NULL, -- FK: Sản phẩm được tracking
    
    -- Loại sự kiện
    EventType VARCHAR(50) NOT NULL, 
    -- Các loại sự kiện:
    -- 'IMPORTED' (Nhập kho từ NCC)
    -- 'TRANSFERRED_OUT' (Xuất chuyển kho)
    -- 'TRANSFERRED_IN' (Nhận chuyển kho)
    -- 'SOLD' (Bán cho khách)
    -- 'DELIVERED' (Giao hàng thành công)
    -- 'RETURNED' (Khách trả lại)
    -- 'WARRANTY_RECEIVED' (Nhận bảo hành từ khách)
    -- 'WARRANTY_COMPLETED' (Hoàn thành bảo hành)
    -- 'REPAIR_STARTED' (Bắt đầu sửa chữa)
    -- 'REPAIR_COMPLETED' (Hoàn thành sửa chữa)
    -- 'PART_REPLACED' (Thay linh kiện)
    -- 'INSPECTED' (Kiểm tra QC)
    -- 'LOCATION_CHANGED' (Đổi vị trí trong kho)
    -- 'STATUS_CHANGED' (Đổi trạng thái)
    -- 'DEMO_OUT' (Xuất demo)
    -- 'DEMO_IN' (Nhận lại từ demo)
    -- 'SCRAPPED' (Thanh lý/Hủy)
    -- 'LOST' (Mất/Thất lạc)
    
    -- Thời gian sự kiện
    EventDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Trạng thái trước và sau
    OldStatus VARCHAR(50), -- Trạng thái trước sự kiện
    NewStatus VARCHAR(50), -- Trạng thái sau sự kiện
    
    -- Vị trí trước và sau
    OldWarehouseID UUID, -- Kho trước
    NewWarehouseID UUID, -- Kho sau
    OldLocation VARCHAR(100), -- Vị trí cũ trong kho (VD: A1-01-03 = Kệ A1, Tầng 1, Ô 3)
    NewLocation VARCHAR(100), -- Vị trí mới trong kho
    
    -- Chủ sở hữu trước và sau
    OldOwnerType VARCHAR(50), -- 'COMPANY' (Công ty), 'CUSTOMER' (Khách hàng), 'SUPPLIER' (NCC)
    NewOwnerType VARCHAR(50),
    OldOwnerID UUID, -- ID của Customer/Supplier nếu không phải công ty sở hữu
    NewOwnerID UUID,
    
    -- Liên kết đơn hàng/phiếu liên quan
    ReferenceType VARCHAR(50), -- 'PURCHASE_ORDER', 'SALES_ORDER', 'TRANSFER', 'REPAIR', 'INSPECTION', 'QUOTATION'
    ReferenceID UUID, -- ID của đơn/phiếu liên quan
    ReferenceCode VARCHAR(50), -- Mã đơn/phiếu (để hiển thị nhanh)
    
    -- Chi tiết bổ sung
    Description TEXT, -- Mô tả chi tiết sự kiện
    Metadata JSONB DEFAULT '{}', -- Dữ liệu bổ sung tùy loại sự kiện
    -- VD cho PART_REPLACED: {"old_part": "PIN XYZ", "new_part": "PIN ABC", "reason": "Hết pin"}
    -- VD cho INSPECTED: {"result": "PASSED", "score": 95}
    
    -- Người thực hiện
    PerformedByUserID UUID,
    
    -- GPS Location (nếu cần tracking vị trí thực tế)
    Latitude DECIMAL(10, 8),
    Longitude DECIMAL(11, 8),
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID),
    FOREIGN KEY (OldWarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (NewWarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (PerformedByUserID) REFERENCES "User"(UserID)
);

-- ProductOwnership || Lịch sử sở hữu sản phẩm
CREATE TABLE ProductOwnership (
    OwnershipID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    InstanceID UUID NOT NULL, -- FK: Sản phẩm
    
    -- Thông tin sở hữu
    OwnerType VARCHAR(50) NOT NULL, -- 'COMPANY', 'CUSTOMER', 'SUPPLIER', 'DEMO_PARTNER'
    OwnerID UUID, -- CustomerID hoặc SupplierID (NULL nếu COMPANY)
    
    -- Thời gian sở hữu
    StartDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    EndDate TIMESTAMP, -- NULL nếu đang sở hữu
    
    -- Lý do chuyển đổi
    AcquisitionType VARCHAR(50), -- 'PURCHASE' (Mua), 'SALE' (Bán), 'TRANSFER' (Chuyển), 'WARRANTY' (Bảo hành), 'RETURN' (Trả hàng), 'DEMO' (Demo)
    
    -- Liên kết chứng từ
    ReferenceType VARCHAR(50),
    ReferenceID UUID,
    
    -- Trạng thái
    IsCurrent BOOLEAN DEFAULT TRUE, -- TRUE = Đang sở hữu
    
    Notes TEXT,
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID)
);

-- ProductLocationHistory || Lịch sử vị trí trong kho
CREATE TABLE ProductLocationHistory (
    LocationHistoryID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    InstanceID UUID NOT NULL, -- FK: Sản phẩm
    WarehouseID UUID NOT NULL, -- FK: Kho
    
    -- Vị trí chi tiết trong kho
    Zone VARCHAR(50), -- Khu vực (VD: A, B, C hoặc MAIN, REPAIR, DEMO)
    Aisle VARCHAR(20), -- Dãy/Lối đi (VD: 01, 02)
    Rack VARCHAR(20), -- Kệ (VD: R1, R2)
    Shelf VARCHAR(20), -- Tầng (VD: S1, S2, S3)
    Bin VARCHAR(20), -- Ô/Ngăn (VD: B01, B02)
    
    -- Mã vị trí đầy đủ (tự động tạo hoặc nhập)
    LocationCode VARCHAR(100), -- VD: MAIN-A-01-R1-S2-B03
    
    -- Thời gian
    MovedInAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    MovedOutAt TIMESTAMP, -- NULL nếu còn ở vị trí này
    
    -- Lý do di chuyển
    MoveReason VARCHAR(100), -- 'RECEIVED' (Nhận hàng), 'REORGANIZE' (Sắp xếp lại), 'PICKING' (Lấy hàng xuất), 'REPAIR' (Đưa đi sửa)
    
    -- Người thực hiện
    MovedByUserID UUID,
    
    IsCurrent BOOLEAN DEFAULT TRUE, -- TRUE = Đang ở vị trí này
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (MovedByUserID) REFERENCES "User"(UserID)
);

-- Indexes cho ProductLifecycleHistory
CREATE INDEX idx_lifecycle_instance ON ProductLifecycleHistory(InstanceID);
CREATE INDEX idx_lifecycle_event_type ON ProductLifecycleHistory(EventType);
CREATE INDEX idx_lifecycle_event_date ON ProductLifecycleHistory(EventDate);
CREATE INDEX idx_lifecycle_reference ON ProductLifecycleHistory(ReferenceType, ReferenceID);
CREATE INDEX idx_lifecycle_warehouse ON ProductLifecycleHistory(NewWarehouseID);

-- Indexes cho ProductOwnership
CREATE INDEX idx_ownership_instance ON ProductOwnership(InstanceID);
CREATE INDEX idx_ownership_owner ON ProductOwnership(OwnerType, OwnerID);
CREATE INDEX idx_ownership_current ON ProductOwnership(IsCurrent) WHERE IsCurrent = TRUE;

-- Indexes cho ProductLocationHistory
CREATE INDEX idx_location_history_instance ON ProductLocationHistory(InstanceID);
CREATE INDEX idx_location_history_warehouse ON ProductLocationHistory(WarehouseID);
CREATE INDEX idx_location_history_code ON ProductLocationHistory(LocationCode);
CREATE INDEX idx_location_history_current ON ProductLocationHistory(IsCurrent) WHERE IsCurrent = TRUE;

COMMENT ON TABLE ProductLifecycleHistory IS 'Lịch sử toàn bộ vòng đời sản phẩm - tracking mọi sự kiện từ nhập kho đến cuối đời';
COMMENT ON TABLE ProductOwnership IS 'Lịch sử sở hữu sản phẩm - ai đang giữ máy này';
COMMENT ON TABLE ProductLocationHistory IS 'Lịch sử vị trí sản phẩm trong kho - tracking chi tiết đến từng ô/ngăn';

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

-- =====================================================
-- SupplierProducts || Sản phẩm từ Nhà cung cấp
-- =====================================================
-- Quản lý mối liên hệ giữa Nhà cung cấp và Sản phẩm
-- Một sản phẩm có thể được cung cấp bởi nhiều NCC với giá khác nhau
-- VD: PDA Mobydata M63 có thể mua từ NCC A (giá 5tr) hoặc NCC B (giá 4.8tr)
CREATE TABLE SupplierProducts (
    SupplierProductID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    SupplierID UUID NOT NULL, -- FK: Nhà cung cấp
    ComponentID UUID NOT NULL, -- FK: Sản phẩm (SKU)
    VariantID UUID, -- FK: Biến thể cụ thể (Part Number) - NULL nếu áp dụng cho tất cả biến thể
    
    -- =============== MÃ SẢN PHẨM TỪ NCC ===============
    SupplierSKU VARCHAR(100), -- Mã sản phẩm theo NCC (nếu khác với SKU nội bộ)
    SupplierPartNumber VARCHAR(100), -- Part Number từ NCC
    
    -- =============== GIÁ CẢ ===============
    UnitCost DECIMAL(15, 2) NOT NULL, -- Giá nhập từ NCC (đơn giá)
    Currency VARCHAR(10) DEFAULT 'VND', -- Loại tiền (VND, USD, CNY)
    
    -- Giá theo số lượng (nếu có)
    TierPricing JSONB DEFAULT '[]', -- Bảng giá theo số lượng
    -- VD: [{"minQty": 1, "price": 5000000}, {"minQty": 10, "price": 4800000}, {"minQty": 50, "price": 4500000}]
    
    -- Thời hạn giá
    PriceValidFrom DATE, -- Giá có hiệu lực từ
    PriceValidTo DATE, -- Giá có hiệu lực đến
    LastPriceUpdate TIMESTAMP, -- Lần cập nhật giá gần nhất
    
    -- =============== THÔNG TIN ĐẶT HÀNG ===============
    MinOrderQuantity INT DEFAULT 1, -- Số lượng đặt tối thiểu (MOQ)
    OrderMultiple INT DEFAULT 1, -- Bội số đặt hàng (VD: phải đặt theo lô 10 cái)
    LeadTimeDays INT, -- Thời gian giao hàng dự kiến (số ngày)
    
    -- =============== ƯU TIÊN ===============
    IsPreferred BOOLEAN DEFAULT FALSE, -- TRUE = NCC ưu tiên cho sản phẩm này
    Priority INT DEFAULT 0, -- Mức độ ưu tiên (0 = thấp nhất)
    
    -- =============== CHẤT LƯỢNG & ĐÁNH GIÁ ===============
    QualityRating DECIMAL(3, 2), -- Đánh giá chất lượng (0.00 - 5.00)
    DeliveryRating DECIMAL(3, 2), -- Đánh giá giao hàng đúng hạn
    LastDeliveryDate DATE, -- Lần giao hàng gần nhất
    TotalOrderedQuantity INT DEFAULT 0, -- Tổng số lượng đã đặt
    TotalReceivedQuantity INT DEFAULT 0, -- Tổng số lượng đã nhận
    
    -- =============== TRẠNG THÁI ===============
    IsActive BOOLEAN DEFAULT TRUE,
    DiscontinuedDate DATE, -- Ngày NCC ngừng cung cấp sản phẩm này
    
    -- =============== GHI CHÚ ===============
    Notes TEXT, -- Ghi chú (VD: Chỉ còn hàng cũ, Hàng mới về cuối tháng)
    InternalNotes TEXT, -- Ghi chú nội bộ (VD: NCC hay giao chậm)
    
    -- Audit
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    -- Ràng buộc: Không trùng cặp (NCC, Sản phẩm, Biến thể)
    UNIQUE(SupplierID, ComponentID, VariantID),
    
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID) ON DELETE CASCADE,
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID) ON DELETE CASCADE,
    FOREIGN KEY (VariantID) REFERENCES ComponentVariants(VariantID) ON DELETE SET NULL
);

-- Index cho truy vấn nhanh
CREATE INDEX idx_supplier_products_supplier ON SupplierProducts(SupplierID);
CREATE INDEX idx_supplier_products_component ON SupplierProducts(ComponentID);
CREATE INDEX idx_supplier_products_variant ON SupplierProducts(VariantID);
CREATE INDEX idx_supplier_products_preferred ON SupplierProducts(IsPreferred) WHERE IsPreferred = TRUE;
CREATE INDEX idx_supplier_products_active ON SupplierProducts(IsActive) WHERE IsActive = TRUE;

COMMENT ON TABLE SupplierProducts IS 'Quản lý mối liên hệ giữa Nhà cung cấp và Sản phẩm - NCC nào cung cấp sản phẩm gì với giá bao nhiêu';

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
    OrderCode VARCHAR(50) UNIQUE NOT NULL, -- Mã đơn hàng nội bộ (VD: SO-2024-001)
    CustomerID UUID NOT NULL,
    WarehouseID UUID NOT NULL, -- Kho xuất hàng
    
    -- =============== MÃ ĐƠN HÀNG TỪ KHÁCH HÀNG ===============
    CustomerPONumber VARCHAR(100), -- Mã PO của khách hàng (VD: PO-ABC-2024-123)
    CustomerPODate DATE, -- Ngày PO của khách hàng
    CustomerReference VARCHAR(200), -- Thông tin tham chiếu khác từ khách (VD: Số hợp đồng)
    
    -- =============== LIÊN KẾT BÁO GIÁ ===============
    QuotationID UUID, -- FK: Báo giá đã được chấp nhận (nếu có)
    
    -- =============== THÔNG TIN ĐƠN HÀNG ===============
    OrderDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    OrderType VARCHAR(50) DEFAULT 'SALES', -- 'SALES' (Bán), 'DEMO' (Xuất demo), 'CONSIGNMENT' (Ký gửi)
    Status VARCHAR(50) DEFAULT 'PENDING', 
    -- Các trạng thái: DRAFT, PENDING, CONFIRMED, PROCESSING, READY_TO_SHIP, SHIPPED, DELIVERED, COMPLETED, CANCELLED
    
    -- =============== GIÁ TRỊ ĐƠN HÀNG ===============
    SubTotal DECIMAL(15, 2) DEFAULT 0, -- Tổng tiền hàng (chưa VAT, chưa giảm giá)
    TaxRate DECIMAL(5, 2) DEFAULT 10, -- Thuế suất VAT (%)
    TaxAmount DECIMAL(15, 2) DEFAULT 0, -- Tiền thuế VAT
    DiscountAmount DECIMAL(15, 2) DEFAULT 0, -- Tổng giảm giá
    ShippingFee DECIMAL(15, 2) DEFAULT 0, -- Phí vận chuyển
    TotalAmount DECIMAL(15, 2) DEFAULT 0, -- Tổng sau thuế, giảm giá (= SubTotal + TaxAmount - DiscountAmount + ShippingFee)
    FinalAmount DECIMAL(15, 2) DEFAULT 0, -- Số tiền phải thanh toán (có thể khác TotalAmount nếu có điều chỉnh)
    Currency VARCHAR(10) DEFAULT 'VND',
    
    -- =============== THANH TOÁN ===============
    PaymentStatus VARCHAR(50) DEFAULT 'UNPAID', -- UNPAID, PARTIAL, PAID
    PaymentMethod VARCHAR(50), -- CASH, BANK_TRANSFER, MOMO, CREDIT_CARD, COD
    PaymentDueDate DATE, -- Hạn thanh toán
    PaidAmount DECIMAL(15, 2) DEFAULT 0, -- Số tiền đã thanh toán
    
    -- =============== GIAO HÀNG ===============
    ShippingMethod VARCHAR(50), -- 'STORE_PICKUP' (Nhận tại cửa hàng), 'DELIVERY' (Giao hàng), 'SHIPPING_PARTNER' (Đơn vị vận chuyển)
    ShippingPartner VARCHAR(100), -- Tên đơn vị vận chuyển (VD: GHTK, GHN, Viettel Post)
    TrackingNumber VARCHAR(100), -- Mã vận đơn
    ExpectedDeliveryDate DATE, -- Ngày giao dự kiến
    ActualDeliveryDate DATE, -- Ngày giao thực tế
    
    -- =============== ĐỊA CHỈ GIAO HÀNG ===============
    ShippingContactName NVARCHAR(200), -- Tên người nhận
    ShippingPhone VARCHAR(20), -- SĐT người nhận
    ShippingAddress NVARCHAR(500), -- Địa chỉ giao hàng
    ShippingCity NVARCHAR(100),
    ShippingDistrict NVARCHAR(100),
    ShippingWard NVARCHAR(100),
    ShippingNotes TEXT, -- Ghi chú giao hàng
    
    -- =============== NHÂN VIÊN ===============
    SalesPersonID UUID, -- Nhân viên bán hàng phụ trách
    CreatedByUserID UUID, -- Người tạo đơn
    ApprovedByUserID UUID, -- Người duyệt đơn
    ApprovedAt TIMESTAMP, -- Thời điểm duyệt
    
    Notes TEXT,
    InternalNotes TEXT, -- Ghi chú nội bộ (khách không thấy)
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (SalesPersonID) REFERENCES "User"(UserID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID),
    FOREIGN KEY (ApprovedByUserID) REFERENCES "User"(UserID)
);

-- Index cho tìm kiếm nhanh
CREATE INDEX idx_sales_orders_customer_po ON SalesOrders(CustomerPONumber);
CREATE INDEX idx_sales_orders_customer ON SalesOrders(CustomerID);
CREATE INDEX idx_sales_orders_status ON SalesOrders(Status);
CREATE INDEX idx_sales_orders_date ON SalesOrders(OrderDate);
CREATE INDEX idx_sales_orders_sales_person ON SalesOrders(SalesPersonID);

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

-- =====================================================
-- DraftOrders || Phiếu nháp đa năng (Bán/Xuất Demo/Nhập/Chuyển kho)
-- =====================================================
-- Dùng để tạo phiếu trước trên PDA/Website, quét mã sản phẩm realtime
-- Sau khi hoàn tất sẽ chuyển thành phiếu chính thức tương ứng
CREATE TABLE DraftOrders (
    DraftID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    DraftCode VARCHAR(50) UNIQUE NOT NULL, -- VD: DRAFT-SALES-20241229-001, DRAFT-IN-20241229-001
    
    -- =============== LOẠI PHIẾU ===============
    DraftType VARCHAR(50) NOT NULL,
    -- Các loại phiếu:
    -- 'SALES' (Phiếu bán hàng) → Chuyển thành SalesOrder
    -- 'DEMO' (Phiếu xuất demo) → Chuyển thành SalesOrder (type=DEMO)
    -- 'INBOUND' (Phiếu nhập kho từ đơn mua) → Chuyển thành InventoryTransaction
    -- 'TRANSFER' (Phiếu chuyển kho) → Chuyển thành StockTransfer
    -- 'WARRANTY_OUT' (Xuất máy bảo hành cho khách) → Chuyển thành Repair
    -- 'WARRANTY_IN' (Nhận máy bảo hành từ khách) → Chuyển thành Repair
    -- 'RETURN' (Phiếu trả hàng từ khách) → Chuyển thành Return
    
    -- =============== ĐỒNG BỘ REALTIME ===============
    SessionID VARCHAR(100) NOT NULL, -- ID session để sync giữa PDA/Web (SignalR group)
    
    -- Nguồn tạo phiếu
    CreatedFrom VARCHAR(50) NOT NULL, -- 'PDA', 'WEB', 'MOBILE_APP'
    DeviceInfo JSONB, -- {"deviceId": "...", "deviceName": "PDA M63", "os": "Android 13"}
    
    -- =============== KHO HÀNG ===============
    -- Kho nguồn (kho xuất / kho nhận hàng về)
    WarehouseID UUID NOT NULL, -- FK: Kho chính thao tác
    
    -- Kho đích (chỉ dùng cho TRANSFER - chuyển kho)
    ToWarehouseID UUID, -- FK: Kho nhận (khi DraftType = 'TRANSFER')
    
    -- =============== ĐỐI TÁC ===============
    -- Khách hàng (cho SALES, DEMO, WARRANTY, RETURN)
    CustomerID UUID, -- FK: Khách hàng
    CustomerName NVARCHAR(200), -- Tên khách ghi nhanh (nếu chưa có trong hệ thống)
    
    -- Nhà cung cấp (cho INBOUND - nhập hàng)
    SupplierID UUID, -- FK: Nhà cung cấp (khi DraftType = 'INBOUND')
    
    -- =============== LIÊN KẾT ĐƠN GỐC ===============
    -- Đơn mua hàng (cho INBOUND - nhập kho theo PO)
    PurchaseOrderID UUID, -- FK: Đơn mua hàng đang nhập
    
    -- Đơn sửa chữa (cho WARRANTY_IN/OUT)
    RepairID UUID, -- FK: Đơn sửa chữa liên quan
    
    -- =============== THÔNG TIN CHUNG ===============
    Title NVARCHAR(500), -- Tiêu đề nhanh (VD: "Nhập hàng từ NCC ABC", "Chuyển kho HCM-HN")
    Notes TEXT,
    
    -- =============== TỔNG HỢP ===============
    TotalItems INT DEFAULT 0, -- Tổng số dòng sản phẩm
    TotalQuantity INT DEFAULT 0, -- Tổng số lượng
    TotalScannedQuantity INT DEFAULT 0, -- Số lượng đã quét (cho INBOUND - so với Expected)
    SubTotal DECIMAL(15, 2) DEFAULT 0, -- Tổng tiền (nếu có)
    
    -- =============== TRẠNG THÁI ===============
    Status VARCHAR(50) DEFAULT 'OPEN', 
    -- 'OPEN' (Đang mở, có thể thêm/quét sản phẩm)
    -- 'SCANNING' (Đang quét mã trên PDA)
    -- 'LOCKED' (Đang bị lock bởi user khác)
    -- 'PENDING_REVIEW' (Chờ xem xét/phê duyệt trước khi chốt)
    -- 'APPROVED' (Đã được phê duyệt, chờ chuyển đổi)
    -- 'COMPLETED' (Đã chuyển thành phiếu chính thức)
    -- 'CANCELLED' (Đã hủy)
    -- 'EXPIRED' (Hết hạn - quá lâu không thao tác)
    
    -- =============== LOCK MECHANISM ===============
    LockedByUserID UUID, -- User đang lock phiếu này
    LockedAt TIMESTAMP,
    LockExpiresAt TIMESTAMP, -- Lock tự động hết hạn
    
    -- =============== CHUYỂN ĐỔI ===============
    -- Sau khi chốt phiếu, lưu ID phiếu chính thức đã tạo
    ConvertedToType VARCHAR(50), -- 'SALES_ORDER', 'STOCK_TRANSFER', 'INVENTORY_TRANSACTION', 'REPAIR'
    ConvertedToID UUID, -- ID của phiếu chính thức
    ConvertedToCode VARCHAR(50), -- Mã phiếu chính thức (để hiển thị)
    ConvertedAt TIMESTAMP,
    ConvertedByUserID UUID,
    
    -- =============== THỜI GIAN ===============
    ExpiresAt TIMESTAMP, -- Phiếu tự động hết hạn (NULL = không hết hạn)
    LastActivityAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Lần cuối thao tác
    
    -- =============== PHÊ DUYỆT (nếu cần) ===============
    RequiresApproval BOOLEAN DEFAULT FALSE, -- Có cần phê duyệt không
    ApprovedByUserID UUID,
    ApprovedAt TIMESTAMP,
    ApprovalNote TEXT,
    
    -- =============== AUDIT ===============
    CreatedByUserID UUID,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (WarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (ToWarehouseID) REFERENCES Warehouses(WarehouseID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (SupplierID) REFERENCES Suppliers(SupplierID),
    FOREIGN KEY (PurchaseOrderID) REFERENCES PurchaseOrders(PurchaseOrderID),
    FOREIGN KEY (RepairID) REFERENCES Repairs(RepairID),
    FOREIGN KEY (LockedByUserID) REFERENCES "User"(UserID),
    FOREIGN KEY (ConvertedByUserID) REFERENCES "User"(UserID),
    FOREIGN KEY (ApprovedByUserID) REFERENCES "User"(UserID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID)
);

-- DraftOrderItems || Chi tiết sản phẩm trong phiếu nháp
CREATE TABLE DraftOrderItems (
    DraftItemID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    DraftID UUID NOT NULL, -- FK: Phiếu nháp
    
    -- =============== SẢN PHẨM ===============
    ComponentID UUID NOT NULL, -- FK: Loại sản phẩm
    InstanceID UUID, -- FK: Máy cụ thể (nếu có Serial - đã quét)
    
    -- =============== SỐ LƯỢNG ===============
    -- Cho INBOUND (nhập kho theo PO): ExpectedQuantity từ PO, Quantity là số đã quét
    ExpectedQuantity INT, -- Số lượng cần nhập (từ PurchaseOrderDetails)
    Quantity INT NOT NULL DEFAULT 1, -- Số lượng thực tế (đã quét / đã xác nhận)
    
    -- =============== GIÁ CẢ ===============
    UnitPrice DECIMAL(15, 2) DEFAULT 0, -- Đơn giá (có thể NULL cho TRANSFER)
    DiscountPercent DECIMAL(5, 2) DEFAULT 0,
    DiscountAmount DECIMAL(15, 2) DEFAULT 0,
    LineTotal DECIMAL(15, 2) DEFAULT 0, -- Thành tiền
    
    -- =============== QUÉT MÃ ===============
    ScannedBarcode VARCHAR(200), -- Mã vạch/QR đã quét
    ScannedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Thời điểm quét
    ScannedFrom VARCHAR(50), -- Thiết bị quét: 'PDA', 'WEB', 'MOBILE'
    ScannedByUserID UUID, -- Người quét
    
    -- =============== THÔNG TIN CACHE ===============
    -- Cache để hiển thị nhanh, không cần query lại
    ProductInfo JSONB, 
    -- {
    --   "sku": "MOBY-M63-V2",
    --   "name": "Máy kiểm kho PDA M63",
    --   "serialNumber": "SN123456",
    --   "imei1": "359876...",
    --   "image": "https://...",
    --   "brand": "Mobydata",
    --   "model": "M63 V2"
    -- }
    
    -- =============== TRẠNG THÁI ===============
    Status VARCHAR(50) DEFAULT 'PENDING',
    -- Chung:
    -- 'PENDING' (Chờ xác nhận)
    -- 'CONFIRMED' (Đã xác nhận)
    -- 'REMOVED' (Đã xóa khỏi phiếu)
    
    -- Cho SALES/DEMO (Xuất):
    -- 'RESERVED' (Đã giữ hàng - chờ xuất)
    -- 'OUT_OF_STOCK' (Hết hàng)
    -- 'PICKED' (Đã lấy hàng từ kệ)
    
    -- Cho INBOUND (Nhập):
    -- 'RECEIVED' (Đã nhận)
    -- 'DAMAGED' (Hàng hỏng/không đạt)
    -- 'MISSING' (Thiếu hàng so với PO)
    -- 'EXCESS' (Thừa hàng so với PO)
    
    -- Cho TRANSFER (Chuyển):
    -- 'IN_TRANSIT' (Đang vận chuyển)
    -- 'DELIVERED' (Đã đến kho đích)
    
    -- =============== LỖI ===============
    ErrorCode VARCHAR(50), 
    -- 'ALREADY_SOLD', 'NOT_FOUND', 'WRONG_WAREHOUSE', 'DUPLICATE', 
    -- 'SERIAL_MISMATCH', 'DAMAGED', 'QUANTITY_EXCEEDED'
    ErrorMessage TEXT,
    
    -- =============== VỊ TRÍ KHO ===============
    LocationCode VARCHAR(100), -- Vị trí sản phẩm trong kho (để lấy/đặt hàng)
    ToLocationCode VARCHAR(100), -- Vị trí đích (cho TRANSFER hoặc INBOUND)
    
    -- =============== KIỂM TRA CHẤT LƯỢNG ===============
    -- Cho INBOUND: kiểm tra hàng nhập
    QualityStatus VARCHAR(50), -- 'NOT_CHECKED', 'PASSED', 'FAILED', 'CONDITIONAL'
    QualityNote TEXT, -- Ghi chú kiểm tra chất lượng
    
    -- =============== GHI CHÚ ===============
    Notes TEXT,
    
    -- =============== THỨ TỰ ===============
    ScanOrder INT DEFAULT 0, -- Thứ tự quét (để sort theo thứ tự quét)
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (DraftID) REFERENCES DraftOrders(DraftID) ON DELETE CASCADE,
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID),
    FOREIGN KEY (ScannedByUserID) REFERENCES "User"(UserID)
);

-- DraftSyncLog || Log đồng bộ realtime
CREATE TABLE DraftSyncLog (
    SyncLogID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    DraftID UUID NOT NULL, -- FK: Phiếu nháp
    
    -- Loại action
    ActionType VARCHAR(50) NOT NULL, -- 'ITEM_ADDED', 'ITEM_REMOVED', 'ITEM_UPDATED', 'STATUS_CHANGED', 'LOCKED', 'UNLOCKED', 'APPROVED'
    
    -- Dữ liệu thay đổi
    ActionData JSONB, -- Chi tiết thay đổi
    
    -- Thiết bị thực hiện
    SourceDevice VARCHAR(50), -- 'PDA', 'WEB'
    SourceDeviceID VARCHAR(100), -- ID thiết bị cụ thể
    
    -- User thực hiện
    PerformedByUserID UUID,
    
    -- Đã sync đến các thiết bị khác chưa
    SyncedToDevices JSONB DEFAULT '[]', -- ["deviceId1", "deviceId2"]
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (DraftID) REFERENCES DraftOrders(DraftID) ON DELETE CASCADE,
    FOREIGN KEY (PerformedByUserID) REFERENCES "User"(UserID)
);

-- Indexes cho DraftOrders
CREATE INDEX idx_draft_orders_code ON DraftOrders(DraftCode);
CREATE INDEX idx_draft_orders_type ON DraftOrders(DraftType);
CREATE INDEX idx_draft_orders_session ON DraftOrders(SessionID);
CREATE INDEX idx_draft_orders_status ON DraftOrders(Status);
CREATE INDEX idx_draft_orders_warehouse ON DraftOrders(WarehouseID);
CREATE INDEX idx_draft_orders_to_warehouse ON DraftOrders(ToWarehouseID);
CREATE INDEX idx_draft_orders_customer ON DraftOrders(CustomerID);
CREATE INDEX idx_draft_orders_supplier ON DraftOrders(SupplierID);
CREATE INDEX idx_draft_orders_po ON DraftOrders(PurchaseOrderID);
CREATE INDEX idx_draft_orders_created_by ON DraftOrders(CreatedByUserID);
CREATE INDEX idx_draft_orders_activity ON DraftOrders(LastActivityAt);
CREATE INDEX idx_draft_orders_expires ON DraftOrders(ExpiresAt) WHERE ExpiresAt IS NOT NULL;

-- Indexes cho DraftOrderItems
CREATE INDEX idx_draft_items_draft ON DraftOrderItems(DraftID);
CREATE INDEX idx_draft_items_component ON DraftOrderItems(ComponentID);
CREATE INDEX idx_draft_items_instance ON DraftOrderItems(InstanceID);
CREATE INDEX idx_draft_items_barcode ON DraftOrderItems(ScannedBarcode);
CREATE INDEX idx_draft_items_status ON DraftOrderItems(Status);
CREATE INDEX idx_draft_items_scanned_at ON DraftOrderItems(ScannedAt);

-- Indexes cho DraftSyncLog
CREATE INDEX idx_draft_sync_draft ON DraftSyncLog(DraftID);
CREATE INDEX idx_draft_sync_action ON DraftSyncLog(ActionType);
CREATE INDEX idx_draft_sync_created ON DraftSyncLog(CreatedAt);

COMMENT ON TABLE DraftOrders IS 'Phiếu nháp đa năng: Bán hàng, Xuất demo, Nhập kho, Chuyển kho - PDA/Web quét mã realtime, đồng bộ giữa thiết bị';
COMMENT ON TABLE DraftOrderItems IS 'Chi tiết sản phẩm trong phiếu nháp - tracking từng lần quét mã, hỗ trợ kiểm tra chất lượng';
COMMENT ON TABLE DraftSyncLog IS 'Log đồng bộ realtime giữa các thiết bị - dùng cho SignalR/WebSocket';

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

-- =====================================================
-- LabelTemplates || Mẫu nhãn in sản phẩm
-- =====================================================
CREATE TABLE LabelTemplates (
    TemplateID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    TemplateName NVARCHAR(200) NOT NULL, -- VD: Nhãn sản phẩm PDA, Nhãn tem bảo hành
    TemplateCode VARCHAR(50) UNIQUE NOT NULL, -- VD: LABEL_PRODUCT, LABEL_WARRANTY, LABEL_SHIPPING
    
    -- Loại nhãn
    LabelType VARCHAR(50) NOT NULL, -- 'PRODUCT' (Nhãn sản phẩm), 'WARRANTY' (Tem bảo hành), 'SHIPPING' (Nhãn giao hàng), 'ASSET' (Tem tài sản), 'BARCODE' (Mã vạch đơn giản)
    
    -- Kích thước nhãn (mm)
    LabelWidth DECIMAL(10, 2) NOT NULL, -- Chiều rộng (VD: 50mm)
    LabelHeight DECIMAL(10, 2) NOT NULL, -- Chiều cao (VD: 30mm)
    
    -- Cấu hình hiển thị - Các trường nào hiển thị trên nhãn
    DisplayFields JSONB NOT NULL DEFAULT '{}',
    -- Ví dụ:
    -- {
    --   "showLogo": true,
    --   "logoPosition": "top-left",
    --   "logoSize": {"width": 15, "height": 15},
    --   "showCompanyName": true,
    --   "showProductName": true,
    --   "showModel": true,
    --   "showSKU": true,
    --   "showSerialNumber": true,
    --   "showIMEI": true,
    --   "showBarcode": true,
    --   "barcodeType": "CODE128",
    --   "showQRCode": true,
    --   "qrCodeContent": "serial",
    --   "showWarrantyInfo": true,
    --   "showManufactureDate": true,
    --   "showAccessories": true,
    --   "showPrice": false,
    --   "customFields": [
    --     {"label": "Xuất xứ", "value": "{{origin}}"},
    --     {"label": "Hotline", "value": "1900-xxxx"}
    --   ]
    -- }
    
    -- Layout/Bố cục nhãn (JSON mô tả vị trí từng phần tử)
    LayoutConfig JSONB DEFAULT '{}',
    -- Ví dụ:
    -- {
    --   "elements": [
    --     {"type": "logo", "x": 2, "y": 2, "width": 12, "height": 12},
    --     {"type": "text", "field": "companyName", "x": 16, "y": 2, "fontSize": 8, "fontWeight": "bold"},
    --     {"type": "text", "field": "productName", "x": 2, "y": 15, "fontSize": 10, "fontWeight": "bold"},
    --     {"type": "text", "field": "model", "x": 2, "y": 20, "fontSize": 8},
    --     {"type": "barcode", "field": "serialNumber", "x": 2, "y": 25, "width": 46, "height": 8, "barcodeType": "CODE128"},
    --     {"type": "text", "field": "serialNumber", "x": 2, "y": 34, "fontSize": 7, "align": "center"}
    --   ],
    --   "orientation": "landscape",
    --   "margin": {"top": 2, "right": 2, "bottom": 2, "left": 2}
    -- }
    
    -- Style mặc định
    DefaultStyle JSONB DEFAULT '{}',
    -- Ví dụ:
    -- {
    --   "fontFamily": "Arial",
    --   "fontSize": 9,
    --   "fontColor": "#000000",
    --   "backgroundColor": "#FFFFFF",
    --   "borderWidth": 0,
    --   "borderColor": "#000000"
    -- }
    
    -- Áp dụng cho loại sản phẩm nào (NULL = tất cả)
    CategoryID UUID, -- FK: Áp dụng cho danh mục
    ProductType VARCHAR(50), -- Áp dụng cho ProductType cụ thể
    DeviceType VARCHAR(50), -- Áp dụng cho DeviceType cụ thể
    
    -- Mẫu in ZPL/EPL (cho máy in Zebra và tương thích)
    ZPLTemplate TEXT, -- Mã ZPL có placeholder như {{productName}}, {{serialNumber}}
    
    -- Preview image (ảnh mẫu nhãn)
    PreviewImageURL VARCHAR(500),
    
    -- Trạng thái
    IsDefault BOOLEAN DEFAULT FALSE, -- Mẫu mặc định cho loại nhãn này
    IsActive BOOLEAN DEFAULT TRUE,
    
    -- Audit
    CreatedByUserID UUID,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID)
);

-- LabelPrintJobs || Lịch sử / Hàng đợi in nhãn
CREATE TABLE LabelPrintJobs (
    PrintJobID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    PrintJobCode VARCHAR(50) UNIQUE NOT NULL, -- VD: PJ-20241229-001
    
    -- Mẫu nhãn sử dụng
    TemplateID UUID NOT NULL, -- FK: Mẫu nhãn
    
    -- Nguồn in (in từ đâu)
    SourceType VARCHAR(50) NOT NULL, -- 'PRODUCT_INSTANCE' (In cho 1 máy), 'BATCH' (In hàng loạt), 'SALES_ORDER' (In cho đơn hàng), 'PURCHASE_ORDER' (In khi nhập hàng)
    SourceID UUID, -- ID của nguồn (InstanceID, SalesOrderID, PurchaseOrderID)
    
    -- Dữ liệu in (JSON chứa tất cả thông tin cần in)
    PrintData JSONB NOT NULL,
    -- Ví dụ cho 1 sản phẩm:
    -- {
    --   "companyLogo": "https://...", (lấy từ AppSettings)
    --   "companyName": "Công ty ABC", (lấy từ AppSettings)
    --   "productName": "Máy kiểm kho PDA Mobydata M63 V2",
    --   "model": "M63 V2",
    --   "sku": "MOBY-M63-V2",
    --   "serialNumber": "SN123456789",
    --   "imei1": "359876543210987",
    --   "imei2": null,
    --   "warrantyMonths": 12,
    --   "warrantyEndDate": "2025-12-29",
    --   "manufactureDate": "2024-06-15",
    --   "accessories": ["Pin 5000mAh", "Dây sạc USB-C", "Dây đeo tay"],
    --   "barcode": "SN123456789",
    --   "qrCodeData": "https://warranty.company.com/check?sn=SN123456789"
    -- }
    
    -- Ví dụ cho in hàng loạt:
    -- {
    --   "items": [
    --     {"serialNumber": "SN001", "productName": "...", ...},
    --     {"serialNumber": "SN002", "productName": "...", ...}
    --   ]
    -- }
    
    -- Số lượng
    Quantity INT DEFAULT 1, -- Số lượng nhãn cần in
    Copies INT DEFAULT 1, -- Số bản sao mỗi nhãn
    
    -- Máy in
    PrinterName VARCHAR(200), -- Tên máy in được chọn
    PrinterIP VARCHAR(50), -- IP máy in (nếu in qua mạng)
    
    -- Trạng thái job
    Status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING' (Chờ in), 'PRINTING' (Đang in), 'COMPLETED' (Đã in), 'FAILED' (Lỗi), 'CANCELLED' (Hủy)
    
    -- Thời gian
    ScheduledAt TIMESTAMP, -- Thời gian lên lịch in (NULL = in ngay)
    StartedAt TIMESTAMP, -- Thời gian bắt đầu in
    CompletedAt TIMESTAMP, -- Thời gian hoàn thành
    
    -- Thông tin lỗi (nếu có)
    ErrorMessage TEXT,
    RetryCount INT DEFAULT 0, -- Số lần thử lại
    
    -- Audit
    CreatedByUserID UUID,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (TemplateID) REFERENCES LabelTemplates(TemplateID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID)
);

-- LabelPrintHistory || Chi tiết lịch sử in từng nhãn
CREATE TABLE LabelPrintHistory (
    HistoryID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    PrintJobID UUID NOT NULL, -- FK: Job in
    
    -- Sản phẩm được in nhãn
    InstanceID UUID, -- FK: ProductInstance (nếu in cho máy cụ thể)
    ComponentID UUID, -- FK: Component (loại sản phẩm)
    
    -- Dữ liệu đã in cho nhãn này
    LabelData JSONB NOT NULL, -- Dữ liệu cụ thể của nhãn này
    
    -- Kết quả
    PrintedSuccessfully BOOLEAN DEFAULT TRUE,
    ErrorMessage TEXT,
    
    -- Thời gian
    PrintedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (PrintJobID) REFERENCES LabelPrintJobs(PrintJobID),
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID),
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID)
);

-- Indexes cho LabelTemplates
CREATE INDEX idx_label_templates_code ON LabelTemplates(TemplateCode);
CREATE INDEX idx_label_templates_type ON LabelTemplates(LabelType);
CREATE INDEX idx_label_templates_category ON LabelTemplates(CategoryID);
CREATE INDEX idx_label_templates_default ON LabelTemplates(IsDefault) WHERE IsDefault = TRUE;

-- Indexes cho LabelPrintJobs
CREATE INDEX idx_print_jobs_code ON LabelPrintJobs(PrintJobCode);
CREATE INDEX idx_print_jobs_template ON LabelPrintJobs(TemplateID);
CREATE INDEX idx_print_jobs_status ON LabelPrintJobs(Status);
CREATE INDEX idx_print_jobs_source ON LabelPrintJobs(SourceType, SourceID);
CREATE INDEX idx_print_jobs_created ON LabelPrintJobs(CreatedAt);

-- Indexes cho LabelPrintHistory
CREATE INDEX idx_print_history_job ON LabelPrintHistory(PrintJobID);
CREATE INDEX idx_print_history_instance ON LabelPrintHistory(InstanceID);
CREATE INDEX idx_print_history_date ON LabelPrintHistory(PrintedAt);

COMMENT ON TABLE LabelTemplates IS 'Mẫu nhãn in sản phẩm - cấu hình layout, các trường hiển thị, hỗ trợ ZPL';
COMMENT ON TABLE LabelPrintJobs IS 'Hàng đợi/Lịch sử job in nhãn - chứa dữ liệu in và trạng thái';
COMMENT ON TABLE LabelPrintHistory IS 'Chi tiết lịch sử từng nhãn đã in - tracking theo sản phẩm';

-- =====================================================
-- Quotations || Báo giá (Sửa chữa/Bảo hành & Bán hàng)
-- =====================================================
CREATE TABLE Quotations (
    QuotationID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    QuotationCode VARCHAR(50) UNIQUE NOT NULL, -- VD: QT-2024-001, QTR-2024-001
    
    -- Loại báo giá
    QuotationType VARCHAR(50) NOT NULL, -- 'REPAIR' (Sửa chữa/Bảo hành), 'SALES' (Bán hàng)
    
    -- Khách hàng nhận báo giá
    CustomerID UUID NOT NULL,
    ContactPersonName NVARCHAR(200), -- Tên người liên hệ cụ thể
    ContactEmail VARCHAR(100), -- Email để gửi báo giá
    ContactPhone VARCHAR(20), -- SĐT liên hệ
    
    -- Link đến đơn sửa chữa (nếu là báo giá REPAIR)
    RepairID UUID, -- FK: Chỉ có giá trị khi QuotationType = 'REPAIR'
    
    -- Thông tin báo giá
    Title NVARCHAR(500), -- Tiêu đề báo giá (VD: Báo giá sửa chữa màn hình PDA M63)
    Description TEXT, -- Mô tả chi tiết công việc/sản phẩm
    
    -- Điều khoản
    ValidUntil DATE, -- Báo giá có hiệu lực đến ngày
    PaymentTerms NVARCHAR(500), -- Điều khoản thanh toán (VD: Thanh toán 50% trước khi sửa)
    DeliveryTerms NVARCHAR(500), -- Điều kiện giao hàng/hoàn thành
    WarrantyTerms NVARCHAR(500), -- Điều khoản bảo hành sau sửa/bán
    
    -- Tổng tiền
    SubTotal DECIMAL(15, 2) DEFAULT 0, -- Tổng tiền chưa thuế/chiết khấu
    DiscountPercent DECIMAL(5, 2) DEFAULT 0, -- Phần trăm chiết khấu
    DiscountAmount DECIMAL(15, 2) DEFAULT 0, -- Số tiền chiết khấu
    TaxPercent DECIMAL(5, 2) DEFAULT 10, -- Thuế VAT (mặc định 10%)
    TaxAmount DECIMAL(15, 2) DEFAULT 0, -- Số tiền thuế
    TotalAmount DECIMAL(15, 2) DEFAULT 0, -- Tổng cuối cùng
    Currency VARCHAR(10) DEFAULT 'VND', -- Đơn vị tiền tệ
    
    -- Trạng thái
    Status VARCHAR(50) DEFAULT 'DRAFT', -- DRAFT, PENDING, SENT, APPROVED, REJECTED, EXPIRED, CONVERTED
    
    -- Tracking gửi email
    SentAt TIMESTAMP, -- Thời điểm gửi báo giá
    SentByUserID UUID, -- Người gửi báo giá
    SentToEmails TEXT, -- Danh sách email đã gửi (có thể gửi nhiều người)
    
    -- Phản hồi từ khách
    CustomerResponseAt TIMESTAMP, -- Thời điểm khách phản hồi
    CustomerResponseNote TEXT, -- Ghi chú phản hồi từ khách
    
    -- Chuyển đổi thành đơn hàng
    ConvertedToOrderID UUID, -- ID của SalesOrder/Repair sau khi khách đồng ý
    ConvertedAt TIMESTAMP, -- Thời điểm chuyển đổi
    
    -- Thông tin file báo giá (PDF)
    QuotationFileURL VARCHAR(500), -- Link file PDF báo giá đã xuất
    
    -- Audit
    CreatedByUserID UUID,
    ApprovedByUserID UUID, -- Người duyệt báo giá (nếu cần phê duyệt nội bộ)
    ApprovedAt TIMESTAMP,
    Notes TEXT,
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (RepairID) REFERENCES Repairs(RepairID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID),
    FOREIGN KEY (SentByUserID) REFERENCES "User"(UserID),
    FOREIGN KEY (ApprovedByUserID) REFERENCES "User"(UserID)
);

-- QuotationDetails || Chi tiết báo giá
CREATE TABLE QuotationDetails (
    QuotationDetailID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    QuotationID UUID NOT NULL,
    
    -- Sản phẩm/Dịch vụ
    ItemType VARCHAR(50) NOT NULL, -- 'PRODUCT' (Sản phẩm), 'SERVICE' (Dịch vụ sửa chữa), 'PART' (Linh kiện thay thế)
    ComponentID UUID, -- FK: Sản phẩm/Linh kiện (nếu có trong hệ thống)
    
    -- Thông tin item (cho trường hợp không có trong hệ thống hoặc tùy chỉnh)
    ItemName NVARCHAR(500) NOT NULL, -- Tên sản phẩm/dịch vụ
    ItemDescription TEXT, -- Mô tả chi tiết
    ItemSKU VARCHAR(100), -- Mã SKU (nếu có)
    
    -- Số lượng & Đơn giá
    Quantity INT NOT NULL DEFAULT 1,
    Unit NVARCHAR(50) DEFAULT 'Cái', -- Đơn vị tính
    UnitPrice DECIMAL(15, 2) NOT NULL, -- Đơn giá
    
    -- Chiết khấu riêng cho dòng
    DiscountPercent DECIMAL(5, 2) DEFAULT 0,
    DiscountAmount DECIMAL(15, 2) DEFAULT 0,
    
    -- Thành tiền
    LineTotal DECIMAL(15, 2) NOT NULL, -- = (Quantity * UnitPrice) - DiscountAmount
    
    -- Ghi chú
    Notes TEXT, -- VD: Hàng zin chính hãng, Bảo hành 6 tháng
    
    -- Thứ tự hiển thị
    SortOrder INT DEFAULT 0,
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (QuotationID) REFERENCES Quotations(QuotationID) ON DELETE CASCADE,
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID)
);

-- Indexes cho Quotations
CREATE INDEX idx_quotations_code ON Quotations(QuotationCode);
CREATE INDEX idx_quotations_customer ON Quotations(CustomerID);
CREATE INDEX idx_quotations_type ON Quotations(QuotationType);
CREATE INDEX idx_quotations_status ON Quotations(Status);
CREATE INDEX idx_quotations_repair ON Quotations(RepairID);
CREATE INDEX idx_quotations_valid ON Quotations(ValidUntil);

-- Indexes cho QuotationDetails
CREATE INDEX idx_quotation_details_quotation ON QuotationDetails(QuotationID);
CREATE INDEX idx_quotation_details_component ON QuotationDetails(ComponentID);

COMMENT ON TABLE Quotations IS 'Báo giá: Hỗ trợ 2 loại - REPAIR (sửa chữa/bảo hành) và SALES (bán sản phẩm). Có thể xuất PDF và gửi email';
COMMENT ON TABLE QuotationDetails IS 'Chi tiết từng dòng sản phẩm/dịch vụ trong báo giá';

-- =====================================================
-- TechnicalInspections || Kiểm tra kỹ thuật trước xuất hàng (QC)
-- =====================================================
CREATE TABLE TechnicalInspections (
    InspectionID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    InspectionCode VARCHAR(50) UNIQUE NOT NULL, -- VD: QC-2024-001
    
    -- Loại kiểm tra
    InspectionType VARCHAR(50) NOT NULL, -- 'PRE_DELIVERY' (Trước giao hàng), 'POST_REPAIR' (Sau sửa chữa), 'INBOUND' (Kiểm nhập), 'RANDOM' (Kiểm ngẫu nhiên)
    
    -- Liên kết đơn hàng/sửa chữa
    SalesOrderID UUID, -- FK: Kiểm tra trước khi giao đơn bán
    RepairID UUID, -- FK: Kiểm tra sau khi sửa chữa xong
    PurchaseOrderID UUID, -- FK: Kiểm tra hàng nhập về
    
    -- Sản phẩm được kiểm tra
    InstanceID UUID, -- FK: Máy cụ thể đang kiểm (có Serial)
    ComponentID UUID NOT NULL, -- FK: Loại sản phẩm
    
    -- Thông tin kiểm tra
    InspectionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    InspectorUserID UUID NOT NULL, -- Người thực hiện kiểm tra (Kỹ thuật viên)
    
    -- Kết quả tổng thể
    OverallResult VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'PASSED', 'FAILED', 'CONDITIONAL' (Đạt có điều kiện)
    
    -- Điểm số (nếu dùng thang điểm)
    TotalScore INT, -- Tổng điểm đạt được
    MaxScore INT, -- Điểm tối đa
    PassingScore INT, -- Điểm đạt yêu cầu
    
    -- Thông tin bổ sung
    Remarks TEXT, -- Nhận xét tổng thể
    FailureReason TEXT, -- Lý do không đạt (nếu FAILED)
    RecommendedAction TEXT, -- Đề xuất xử lý (VD: Cần thay pin, Calibrate lại scanner)
    
    -- Ảnh/Video bằng chứng
    EvidenceURLs JSONB DEFAULT '[]', -- Danh sách link ảnh/video kiểm tra
    
    -- Xác nhận & Phê duyệt
    VerifiedByUserID UUID, -- Người xác nhận kết quả (Quản lý)
    VerifiedAt TIMESTAMP,
    VerificationNote TEXT,
    
    -- Trạng thái
    Status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'RE_INSPECTION'
    
    -- Kiểm tra lại (nếu lần đầu không đạt)
    ParentInspectionID UUID, -- FK: Link đến lần kiểm tra trước (nếu là re-inspection)
    RetryCount INT DEFAULT 0, -- Số lần kiểm tra lại
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DeletedAt TIMESTAMP NULL,
    
    FOREIGN KEY (SalesOrderID) REFERENCES SalesOrders(SalesOrderID),
    FOREIGN KEY (RepairID) REFERENCES Repairs(RepairID),
    FOREIGN KEY (PurchaseOrderID) REFERENCES PurchaseOrders(PurchaseOrderID),
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID),
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (InspectorUserID) REFERENCES "User"(UserID),
    FOREIGN KEY (VerifiedByUserID) REFERENCES "User"(UserID),
    FOREIGN KEY (ParentInspectionID) REFERENCES TechnicalInspections(InspectionID)
);

-- TechnicalInspectionItems || Checklist chi tiết kiểm tra
CREATE TABLE TechnicalInspectionItems (
    InspectionItemID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    InspectionID UUID NOT NULL,
    
    -- Hạng mục kiểm tra
    ItemCategory VARCHAR(100) NOT NULL, -- 'APPEARANCE' (Ngoại quan), 'FUNCTION' (Chức năng), 'ACCESSORY' (Phụ kiện), 'SOFTWARE' (Phần mềm)
    ItemName NVARCHAR(200) NOT NULL, -- VD: Kiểm tra màn hình, Kiểm tra Scanner, Kiểm tra Wifi
    ItemDescription TEXT, -- Mô tả chi tiết cách kiểm tra
    
    -- Kết quả
    Result VARCHAR(50) DEFAULT 'NOT_CHECKED', -- 'NOT_CHECKED', 'PASSED', 'FAILED', 'NOT_APPLICABLE'
    Score INT, -- Điểm cho hạng mục này (nếu dùng thang điểm)
    
    -- Chi tiết kết quả
    ActualValue VARCHAR(500), -- Giá trị đo được (VD: Pin 85%, Độ sáng 300 nits)
    ExpectedValue VARCHAR(500), -- Giá trị kỳ vọng (VD: Pin >= 80%, Độ sáng >= 250 nits)
    
    -- Vấn đề phát hiện
    IssueFound TEXT, -- Mô tả lỗi phát hiện (nếu có)
    IssueSeverity VARCHAR(50), -- 'CRITICAL' (Nghiêm trọng), 'MAJOR' (Lớn), 'MINOR' (Nhỏ), 'COSMETIC' (Thẩm mỹ)
    
    -- Ảnh bằng chứng cho hạng mục này
    EvidenceURL VARCHAR(500), -- Link ảnh/video
    
    -- Ghi chú
    Notes TEXT,
    
    -- Thứ tự kiểm tra
    SortOrder INT DEFAULT 0,
    
    -- Bắt buộc phải kiểm tra
    IsMandatory BOOLEAN DEFAULT TRUE,
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (InspectionID) REFERENCES TechnicalInspections(InspectionID) ON DELETE CASCADE
);

-- InspectionTemplates || Mẫu checklist kiểm tra theo loại sản phẩm
CREATE TABLE InspectionTemplates (
    TemplateID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    TemplateName NVARCHAR(200) NOT NULL, -- VD: Checklist kiểm tra PDA, Checklist kiểm tra Máy in
    
    -- Áp dụng cho loại sản phẩm nào
    CategoryID UUID, -- FK: Danh mục sản phẩm (NULL = áp dụng chung)
    ComponentID UUID, -- FK: Sản phẩm cụ thể (NULL = áp dụng cho cả danh mục)
    
    -- Loại kiểm tra áp dụng
    InspectionType VARCHAR(50), -- 'PRE_DELIVERY', 'POST_REPAIR', 'INBOUND', 'ALL'
    
    -- Danh sách hạng mục kiểm tra (Template)
    -- VD: [{"category": "FUNCTION", "name": "Kiểm tra màn hình", "mandatory": true}, ...]
    ChecklistItems JSONB NOT NULL DEFAULT '[]',
    
    -- Điểm đạt yêu cầu (nếu dùng thang điểm)
    PassingScore INT,
    
    IsActive BOOLEAN DEFAULT TRUE,
    
    CreatedByUserID UUID,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID)
);

-- Indexes cho TechnicalInspections
CREATE INDEX idx_inspections_code ON TechnicalInspections(InspectionCode);
CREATE INDEX idx_inspections_type ON TechnicalInspections(InspectionType);
CREATE INDEX idx_inspections_sales_order ON TechnicalInspections(SalesOrderID);
CREATE INDEX idx_inspections_repair ON TechnicalInspections(RepairID);
CREATE INDEX idx_inspections_instance ON TechnicalInspections(InstanceID);
CREATE INDEX idx_inspections_result ON TechnicalInspections(OverallResult);
CREATE INDEX idx_inspections_status ON TechnicalInspections(Status);
CREATE INDEX idx_inspections_inspector ON TechnicalInspections(InspectorUserID);
CREATE INDEX idx_inspections_date ON TechnicalInspections(InspectionDate);

-- Indexes cho TechnicalInspectionItems
CREATE INDEX idx_inspection_items_inspection ON TechnicalInspectionItems(InspectionID);
CREATE INDEX idx_inspection_items_result ON TechnicalInspectionItems(Result);
CREATE INDEX idx_inspection_items_severity ON TechnicalInspectionItems(IssueSeverity);

-- Indexes cho InspectionTemplates
CREATE INDEX idx_inspection_templates_category ON InspectionTemplates(CategoryID);
CREATE INDEX idx_inspection_templates_component ON InspectionTemplates(ComponentID);
CREATE INDEX idx_inspection_templates_type ON InspectionTemplates(InspectionType);

COMMENT ON TABLE TechnicalInspections IS 'Kiểm tra kỹ thuật/QC trước xuất hàng, sau sửa chữa hoặc khi nhập hàng';
COMMENT ON TABLE TechnicalInspectionItems IS 'Chi tiết từng hạng mục kiểm tra trong phiếu QC';
COMMENT ON TABLE InspectionTemplates IS 'Mẫu checklist kiểm tra theo loại sản phẩm - tự động tạo các hạng mục khi tạo phiếu QC';

-- =====================================================
-- ProductCommonIssues || Danh sách lỗi phổ biến theo sản phẩm
-- =====================================================
CREATE TABLE ProductCommonIssues (
    IssueID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    IssueCode VARCHAR(50) UNIQUE NOT NULL, -- VD: ISS-PDA-001, ISS-SCANNER-002
    
    -- Sản phẩm liên quan
    ComponentID UUID NOT NULL, -- FK: Sản phẩm gặp lỗi này
    CategoryID UUID, -- FK: Hoặc áp dụng cho cả danh mục (NULL = chỉ sản phẩm cụ thể)
    
    -- Thông tin lỗi
    IssueName NVARCHAR(200) NOT NULL, -- VD: Màn hình không hiển thị, Scanner không đọc được barcode
    IssueDescription TEXT, -- Mô tả chi tiết triệu chứng lỗi
    
    -- Phân loại lỗi
    IssueCategory VARCHAR(100) NOT NULL, -- 'HARDWARE' (Phần cứng), 'SOFTWARE' (Phần mềm), 'CONNECTIVITY' (Kết nối), 'BATTERY' (Pin), 'DISPLAY' (Màn hình), 'INPUT' (Bàn phím/Touch)
    Severity VARCHAR(50) DEFAULT 'MEDIUM', -- 'CRITICAL' (Nghiêm trọng), 'HIGH', 'MEDIUM', 'LOW'
    
    -- Nguyên nhân phổ biến
    CommonCauses JSONB DEFAULT '[]', -- VD: ["Rơi vỡ", "Vào nước", "Lỗi firmware", "Hết pin"]
    
    -- Từ khóa tìm kiếm (giúp tìm nhanh khi khách mô tả lỗi)
    SearchKeywords JSONB DEFAULT '[]', -- VD: ["đen màn hình", "không lên nguồn", "treo logo"]
    
    -- Tần suất gặp phải (để ưu tiên hiển thị)
    OccurrenceCount INT DEFAULT 0, -- Số lần gặp lỗi này
    LastOccurrenceDate TIMESTAMP, -- Lần cuối gặp
    
    -- Thời gian sửa chữa trung bình
    AvgRepairTimeMinutes INT, -- Thời gian sửa trung bình (phút)
    
    -- Chi phí sửa chữa ước tính
    EstimatedRepairCostMin DECIMAL(15, 2), -- Giá thấp nhất
    EstimatedRepairCostMax DECIMAL(15, 2), -- Giá cao nhất
    
    -- Phân quyền xem
    IsPublic BOOLEAN DEFAULT FALSE, -- TRUE: Khách hàng có thể xem, FALSE: Chỉ nội bộ
    
    -- Trạng thái
    IsActive BOOLEAN DEFAULT TRUE,
    
    CreatedByUserID UUID,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID)
);

-- CommonIssueSolutions || Giải pháp khắc phục cho từng lỗi
CREATE TABLE CommonIssueSolutions (
    SolutionID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    IssueID UUID NOT NULL, -- FK: Lỗi cần giải quyết
    
    -- Thông tin giải pháp
    SolutionTitle NVARCHAR(200) NOT NULL, -- VD: Khởi động lại máy, Reset factory, Thay màn hình
    SolutionDescription TEXT, -- Mô tả chi tiết các bước thực hiện
    
    -- Phân loại giải pháp
    SolutionType VARCHAR(50) NOT NULL, -- 'SELF_SERVICE' (Khách tự làm), 'TECHNICIAN' (Cần KTV), 'WARRANTY' (Bảo hành), 'REPLACEMENT' (Thay thế)
    
    -- Độ khó thực hiện (cho khách tự sửa)
    DifficultyLevel INT DEFAULT 1, -- 1-5: 1=Rất dễ (ai cũng làm được), 5=Rất khó (cần chuyên gia)
    
    -- Link tới tài liệu hướng dẫn (từ ProductKnowledgeBase)
    KnowledgeBaseID UUID, -- FK: Tài liệu/Video hướng dẫn
    
    -- Hoặc link trực tiếp (nếu không có trong KnowledgeBase)
    DocumentURL VARCHAR(500), -- Link tài liệu PDF
    VideoURL VARCHAR(500), -- Link video Youtube/Vimeo
    
    -- Công cụ cần thiết
    RequiredTools JSONB DEFAULT '[]', -- VD: ["Tua vít T5", "Nhíp", "Súng khò"]
    
    -- Linh kiện cần thay (nếu có)
    RequiredPartID UUID, -- FK: Linh kiện từ bảng Components
    
    -- Tỷ lệ thành công
    SuccessRate DECIMAL(5, 2), -- VD: 95.50 (%)
    SuccessCount INT DEFAULT 0, -- Số lần thành công
    AttemptCount INT DEFAULT 0, -- Tổng số lần thử
    
    -- Chi phí (nếu tự sửa)
    EstimatedCost DECIMAL(15, 2) DEFAULT 0, -- Chi phí linh kiện (nếu tự mua)
    
    -- Thời gian thực hiện
    EstimatedTimeMinutes INT, -- Thời gian thực hiện (phút)
    
    -- Cảnh báo/Lưu ý quan trọng
    Warnings TEXT, -- VD: "Thao tác này sẽ xóa toàn bộ dữ liệu"
    
    -- Phân quyền
    IsPublic BOOLEAN DEFAULT FALSE, -- TRUE: Khách hàng có thể xem
    RequiredRole VARCHAR(50), -- NULL: Ai cũng xem được, 'TECHNICIAN': Chỉ KTV, 'ADMIN': Chỉ Admin
    
    -- Thứ tự ưu tiên (thử giải pháp đơn giản trước)
    Priority INT DEFAULT 0, -- 0 = thử đầu tiên, số lớn = thử sau
    
    -- Trạng thái
    IsActive BOOLEAN DEFAULT TRUE,
    
    CreatedByUserID UUID,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (IssueID) REFERENCES ProductCommonIssues(IssueID) ON DELETE CASCADE,
    FOREIGN KEY (KnowledgeBaseID) REFERENCES ProductKnowledgeBase(KnowledgeID),
    FOREIGN KEY (RequiredPartID) REFERENCES Components(ComponentID),
    FOREIGN KEY (CreatedByUserID) REFERENCES "User"(UserID)
);

-- IssueReportHistory || Lịch sử báo cáo lỗi (tracking tần suất)
CREATE TABLE IssueReportHistory (
    ReportID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    IssueID UUID NOT NULL, -- FK: Lỗi được báo cáo
    
    -- Nguồn báo cáo
    ReportSource VARCHAR(50) NOT NULL, -- 'REPAIR' (Từ đơn sửa chữa), 'INSPECTION' (Từ QC), 'CUSTOMER' (Khách feedback), 'INTERNAL' (Nội bộ phát hiện)
    
    -- Liên kết nguồn
    RepairID UUID, -- FK: Đơn sửa chữa (nếu từ Repair)
    InspectionID UUID, -- FK: Phiếu QC (nếu từ Inspection)
    InstanceID UUID, -- FK: Máy cụ thể gặp lỗi
    
    -- Giải pháp đã áp dụng
    SolutionID UUID, -- FK: Giải pháp đã dùng
    WasSuccessful BOOLEAN, -- Giải pháp có thành công không
    
    -- Ghi chú
    Notes TEXT,
    
    ReportedByUserID UUID,
    ReportedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (IssueID) REFERENCES ProductCommonIssues(IssueID),
    FOREIGN KEY (RepairID) REFERENCES Repairs(RepairID),
    FOREIGN KEY (InspectionID) REFERENCES TechnicalInspections(InspectionID),
    FOREIGN KEY (InstanceID) REFERENCES ProductInstances(InstanceID),
    FOREIGN KEY (SolutionID) REFERENCES CommonIssueSolutions(SolutionID),
    FOREIGN KEY (ReportedByUserID) REFERENCES "User"(UserID)
);

-- Indexes cho ProductCommonIssues
CREATE INDEX idx_common_issues_code ON ProductCommonIssues(IssueCode);
CREATE INDEX idx_common_issues_component ON ProductCommonIssues(ComponentID);
CREATE INDEX idx_common_issues_category ON ProductCommonIssues(CategoryID);
CREATE INDEX idx_common_issues_type ON ProductCommonIssues(IssueCategory);
CREATE INDEX idx_common_issues_severity ON ProductCommonIssues(Severity);
CREATE INDEX idx_common_issues_public ON ProductCommonIssues(IsPublic);
CREATE INDEX idx_common_issues_occurrence ON ProductCommonIssues(OccurrenceCount DESC);

-- Index cho tìm kiếm theo từ khóa (GIN index cho JSONB)
CREATE INDEX idx_common_issues_keywords ON ProductCommonIssues USING GIN (SearchKeywords);
CREATE INDEX idx_common_issues_causes ON ProductCommonIssues USING GIN (CommonCauses);

-- Indexes cho CommonIssueSolutions
CREATE INDEX idx_solutions_issue ON CommonIssueSolutions(IssueID);
CREATE INDEX idx_solutions_type ON CommonIssueSolutions(SolutionType);
CREATE INDEX idx_solutions_difficulty ON CommonIssueSolutions(DifficultyLevel);
CREATE INDEX idx_solutions_public ON CommonIssueSolutions(IsPublic);
CREATE INDEX idx_solutions_priority ON CommonIssueSolutions(Priority);
CREATE INDEX idx_solutions_knowledge ON CommonIssueSolutions(KnowledgeBaseID);

-- Indexes cho IssueReportHistory
CREATE INDEX idx_issue_reports_issue ON IssueReportHistory(IssueID);
CREATE INDEX idx_issue_reports_repair ON IssueReportHistory(RepairID);
CREATE INDEX idx_issue_reports_date ON IssueReportHistory(ReportedAt);

COMMENT ON TABLE ProductCommonIssues IS 'Danh sách lỗi phổ biến theo sản phẩm - dùng để chẩn đoán nhanh và tracking tần suất';
COMMENT ON TABLE CommonIssueSolutions IS 'Giải pháp khắc phục cho từng lỗi - hỗ trợ tự sửa tại nhà hoặc hướng dẫn KTV';
COMMENT ON TABLE IssueReportHistory IS 'Lịch sử báo cáo lỗi - tracking tần suất và hiệu quả giải pháp';

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
-- ProductKnowledgeBase || Kho tri thức sản phẩm
-- =====================================================
CREATE TABLE ProductKnowledgeBase (
    KnowledgeID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    ComponentID UUID NOT NULL, -- Link tới sản phẩm nào
    
    -- Thông tin cơ bản
    Title NVARCHAR(200) NOT NULL, -- VD: Hướng dẫn cài đặt Wifi, Cách thay pin
    Description TEXT,
    
    -- Loại tài liệu
    ContentType VARCHAR(50) NOT NULL, -- 'DOCUMENT' (PDF, Doc), 'VIDEO' (Youtube, Vimeo), 'DRIVER', 'FIRMWARE'
    ContentURL VARCHAR(500) NOT NULL, -- Link file hoặc Link Youtube
    ThumbnailURL VARCHAR(500), -- Ảnh thumb cho video
    
    -- Phân quyền truy cập
    AccessLevel VARCHAR(50) DEFAULT 'PUBLIC', -- 'PUBLIC' (Ai cũng xem được), 'INTERNAL' (Nội bộ), 'RESTRICTED' (Theo role cụ thể)
    
    -- Danh sách Role được phép xem (Nếu AccessLevel = RESTRICTED)
    -- VD: ["TECHNICIAN", "ADMIN"] -> Chỉ kỹ thuật và admin thấy tài liệu sửa mainboard
    AllowedRoles JSONB DEFAULT '[]', 
    
    -- Metadata
    UploadedByUserID UUID,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (UploadedByUserID) REFERENCES "User"(UserID)
);

-- Index tìm kiếm nhanh theo sản phẩm và loại
CREATE INDEX idx_knowledge_component ON ProductKnowledgeBase(ComponentID);
CREATE INDEX idx_knowledge_type ON ProductKnowledgeBase(ContentType);

COMMENT ON TABLE ProductKnowledgeBase IS 'Kho tri thức: Tài liệu, Video hướng dẫn, Firmware cho sản phẩm';

-- =====================================================
-- ProductBundles || Đóng gói sản phẩm (BOM)
-- =====================================================
CREATE TABLE ProductBundles (
    BundleID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    ParentComponentID UUID NOT NULL, -- Sản phẩm chính (VD: Máy PDA M63)
    ChildComponentID UUID NOT NULL,  -- Phụ kiện đi kèm (VD: Pin 5000mAh, Dây đeo)
    
    Quantity INT DEFAULT 1, -- Số lượng đi kèm trong hộp
    IsOptional BOOLEAN DEFAULT FALSE, -- FALSE: Mặc định có, TRUE: Tùy chọn (Option thêm)
    
    Notes TEXT, -- VD: Chỉ áp dụng cho lô hàng 2024
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ParentComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (ChildComponentID) REFERENCES Components(ComponentID),
    
    -- Đảm bảo không trùng lặp cặp cha-con
    UNIQUE(ParentComponentID, ChildComponentID)
);

-- Index để tìm nhanh các phụ kiện của sản phẩm
CREATE INDEX idx_bundles_parent ON ProductBundles(ParentComponentID);
CREATE INDEX idx_bundles_child ON ProductBundles(ChildComponentID);

COMMENT ON TABLE ProductBundles IS 'Định nghĩa thành phần đóng gói (BOM): Mua 1 máy kèm theo những phụ kiện gì';

-- =====================================================
-- ProductSpareParts || Linh kiện thay thế tương thích
-- =====================================================
CREATE TABLE ProductSpareParts (
    CompatibilityID UUID PRIMARY KEY DEFAULT GEN_RANDOM_UUID(),
    ProductComponentID UUID NOT NULL, -- Sản phẩm cần sửa (VD: Máy PDA M63)
    PartComponentID UUID NOT NULL,    -- Linh kiện thay thế (VD: Màn hình M63 Zin)
    
    -- Phân loại linh kiện
    PartType VARCHAR(50) NOT NULL, -- 'SCREEN', 'BATTERY', 'MAINBOARD', 'SCANNER_ENGINE', 'KEYPAD', 'HOUSING'
    
    IsCompatible BOOLEAN DEFAULT TRUE, -- Đánh dấu còn tương thích hay không
    IsOriginal BOOLEAN DEFAULT TRUE,   -- TRUE: Hàng zin, FALSE: Hàng for/bên thứ 3
    
    DifficultyLevel INT DEFAULT 1, -- Độ khó thay thế (1-5) để assign kỹ thuật viên phù hợp
    EstimatedReplaceTime INT, -- Thời gian thay thế dự kiến (phút)
    
    Notes TEXT, -- VD: Cần tool chuyên dụng T5
    
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (ProductComponentID) REFERENCES Components(ComponentID),
    FOREIGN KEY (PartComponentID) REFERENCES Components(ComponentID)
);

-- Index để khi sửa máy, query nhanh ra danh sách linh kiện phù hợp
CREATE INDEX idx_spareparts_product ON ProductSpareParts(ProductComponentID);
CREATE INDEX idx_spareparts_type ON ProductSpareParts(PartType);

COMMENT ON TABLE ProductSpareParts IS 'Danh sách linh kiện tương thích để sửa chữa cho từng model máy';

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
COMMENT ON COLUMN "User".FullName IS 'Họ và tên đầy đủ của người dùng';
COMMENT ON COLUMN "User".Avatar IS 'Đường dẫn ảnh đại diện (URL)';
COMMENT ON COLUMN "User".Email IS 'Email người dùng, dùng để khôi phục mật khẩu';
COMMENT ON COLUMN "User".PhoneNumber IS 'Số điện thoại liên hệ';
COMMENT ON COLUMN "User".DateOfBirth IS 'Ngày sinh của người dùng';
COMMENT ON COLUMN "User".Gender IS 'Giới tính: MALE, FEMALE, OTHER';
COMMENT ON COLUMN "User".Address IS 'Địa chỉ chi tiết';
COMMENT ON COLUMN "User".Role IS 'Vai trò: ADMIN, RECEPTIONIST, TECHNICIAN, WAREHOUSE';
COMMENT ON COLUMN "User".WarehouseID IS 'FK: Kho được gán cho nhân viên (nullable cho Admin)';
COMMENT ON COLUMN "User".IsActive IS 'Trạng thái hoạt động (TRUE = đang làm việc)';
COMMENT ON COLUMN "User".IsLocked IS 'Tài khoản bị khóa (do đăng nhập sai quá nhiều lần)';
COMMENT ON COLUMN "User".FailedLoginAttempts IS 'Số lần đăng nhập sai liên tiếp';
COMMENT ON COLUMN "User".LockedUntil IS 'Thời điểm hết khóa tài khoản';
COMMENT ON COLUMN "User".LastLoginAt IS 'Thời điểm đăng nhập gần nhất';
COMMENT ON COLUMN "User".LastLoginIP IS 'Địa chỉ IP lần đăng nhập cuối';
COMMENT ON COLUMN "User".PasswordChangedAt IS 'Thời điểm thay đổi mật khẩu gần nhất';
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

-- ===================== BẢNG PRODUCT KNOWLEDGE BASE =====================
COMMENT ON COLUMN ProductKnowledgeBase.KnowledgeID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN ProductKnowledgeBase.ComponentID IS 'FK: Sản phẩm liên quan đến tài liệu này';
COMMENT ON COLUMN ProductKnowledgeBase.Title IS 'Tiêu đề tài liệu (VD: Hướng dẫn cài đặt Wifi)';
COMMENT ON COLUMN ProductKnowledgeBase.Description IS 'Mô tả chi tiết nội dung tài liệu';
COMMENT ON COLUMN ProductKnowledgeBase.ContentType IS 'Loại nội dung: DOCUMENT, VIDEO, DRIVER, FIRMWARE';
COMMENT ON COLUMN ProductKnowledgeBase.ContentURL IS 'Đường dẫn file hoặc link video (Youtube, Vimeo...)';
COMMENT ON COLUMN ProductKnowledgeBase.ThumbnailURL IS 'Ảnh thumbnail cho video';
COMMENT ON COLUMN ProductKnowledgeBase.AccessLevel IS 'Quyền truy cập: PUBLIC, INTERNAL, RESTRICTED';
COMMENT ON COLUMN ProductKnowledgeBase.AllowedRoles IS 'Danh sách role được phép xem (JSON Array) - áp dụng khi AccessLevel = RESTRICTED';
COMMENT ON COLUMN ProductKnowledgeBase.UploadedByUserID IS 'FK: Người upload tài liệu';

-- ===================== BẢNG PRODUCT BUNDLES =====================
COMMENT ON COLUMN ProductBundles.BundleID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN ProductBundles.ParentComponentID IS 'FK: Sản phẩm chính (VD: Máy PDA)';
COMMENT ON COLUMN ProductBundles.ChildComponentID IS 'FK: Phụ kiện đi kèm (VD: Pin, Dây đeo)';
COMMENT ON COLUMN ProductBundles.Quantity IS 'Số lượng phụ kiện đi kèm trong 1 hộp/bộ';
COMMENT ON COLUMN ProductBundles.IsOptional IS 'FALSE: Mặc định có trong hộp, TRUE: Tùy chọn thêm';
COMMENT ON COLUMN ProductBundles.Notes IS 'Ghi chú (VD: Chỉ áp dụng lô hàng 2024)';

-- ===================== BẢNG PRODUCT SPARE PARTS =====================
COMMENT ON COLUMN ProductSpareParts.CompatibilityID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN ProductSpareParts.ProductComponentID IS 'FK: Sản phẩm cần sửa chữa';
COMMENT ON COLUMN ProductSpareParts.PartComponentID IS 'FK: Linh kiện thay thế phù hợp';
COMMENT ON COLUMN ProductSpareParts.PartType IS 'Loại linh kiện: SCREEN, BATTERY, MAINBOARD, SCANNER_ENGINE, KEYPAD, HOUSING';
COMMENT ON COLUMN ProductSpareParts.IsCompatible IS 'Đánh dấu còn tương thích hay đã ngừng hỗ trợ';
COMMENT ON COLUMN ProductSpareParts.IsOriginal IS 'TRUE: Linh kiện chính hãng/zin, FALSE: Hàng for/OEM';
COMMENT ON COLUMN ProductSpareParts.DifficultyLevel IS 'Độ khó thay thế (1-5): 1=Dễ, 5=Rất khó - để assign kỹ thuật viên phù hợp';
COMMENT ON COLUMN ProductSpareParts.EstimatedReplaceTime IS 'Thời gian thay thế dự kiến (đơn vị: phút)';
COMMENT ON COLUMN ProductSpareParts.Notes IS 'Ghi chú kỹ thuật (VD: Cần tool chuyên dụng T5)';

-- ===================== BẢNG QUOTATIONS =====================
COMMENT ON COLUMN Quotations.QuotationID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN Quotations.QuotationCode IS 'Mã báo giá duy nhất (VD: QT-2024-001)';
COMMENT ON COLUMN Quotations.QuotationType IS 'Loại báo giá: REPAIR (Sửa chữa/Bảo hành), SALES (Bán sản phẩm)';
COMMENT ON COLUMN Quotations.CustomerID IS 'FK: Khách hàng nhận báo giá';
COMMENT ON COLUMN Quotations.ContactPersonName IS 'Tên người liên hệ cụ thể tại công ty khách hàng';
COMMENT ON COLUMN Quotations.ContactEmail IS 'Email để gửi báo giá';
COMMENT ON COLUMN Quotations.ContactPhone IS 'Số điện thoại liên hệ';
COMMENT ON COLUMN Quotations.RepairID IS 'FK: Đơn sửa chữa liên quan (chỉ có khi QuotationType = REPAIR)';
COMMENT ON COLUMN Quotations.Title IS 'Tiêu đề báo giá (VD: Báo giá sửa chữa màn hình PDA M63)';
COMMENT ON COLUMN Quotations.Description IS 'Mô tả chi tiết công việc/sản phẩm trong báo giá';
COMMENT ON COLUMN Quotations.ValidUntil IS 'Ngày hết hạn báo giá';
COMMENT ON COLUMN Quotations.PaymentTerms IS 'Điều khoản thanh toán (VD: Thanh toán 50% trước khi sửa)';
COMMENT ON COLUMN Quotations.DeliveryTerms IS 'Điều kiện giao hàng hoặc thời gian hoàn thành';
COMMENT ON COLUMN Quotations.WarrantyTerms IS 'Điều khoản bảo hành sau sửa chữa/bán hàng';
COMMENT ON COLUMN Quotations.SubTotal IS 'Tổng tiền chưa tính thuế và chiết khấu';
COMMENT ON COLUMN Quotations.DiscountPercent IS 'Phần trăm chiết khấu tổng đơn';
COMMENT ON COLUMN Quotations.DiscountAmount IS 'Số tiền chiết khấu';
COMMENT ON COLUMN Quotations.TaxPercent IS 'Phần trăm thuế VAT (mặc định 10%)';
COMMENT ON COLUMN Quotations.TaxAmount IS 'Số tiền thuế';
COMMENT ON COLUMN Quotations.TotalAmount IS 'Tổng tiền cuối cùng khách cần thanh toán';
COMMENT ON COLUMN Quotations.Currency IS 'Đơn vị tiền tệ (mặc định VND)';
COMMENT ON COLUMN Quotations.Status IS 'Trạng thái: DRAFT, PENDING, SENT, APPROVED, REJECTED, EXPIRED, CONVERTED';
COMMENT ON COLUMN Quotations.SentAt IS 'Thời điểm gửi báo giá qua email';
COMMENT ON COLUMN Quotations.SentByUserID IS 'FK: Nhân viên gửi báo giá';
COMMENT ON COLUMN Quotations.SentToEmails IS 'Danh sách email đã gửi (có thể gửi cho nhiều người)';
COMMENT ON COLUMN Quotations.CustomerResponseAt IS 'Thời điểm khách hàng phản hồi';
COMMENT ON COLUMN Quotations.CustomerResponseNote IS 'Ghi chú phản hồi từ khách hàng';
COMMENT ON COLUMN Quotations.ConvertedToOrderID IS 'ID đơn hàng/sửa chữa sau khi khách đồng ý báo giá';
COMMENT ON COLUMN Quotations.ConvertedAt IS 'Thời điểm chuyển đổi thành đơn hàng';
COMMENT ON COLUMN Quotations.QuotationFileURL IS 'Đường dẫn file PDF báo giá đã xuất';
COMMENT ON COLUMN Quotations.CreatedByUserID IS 'FK: Người tạo báo giá';
COMMENT ON COLUMN Quotations.ApprovedByUserID IS 'FK: Người duyệt báo giá (nếu cần phê duyệt nội bộ)';
COMMENT ON COLUMN Quotations.ApprovedAt IS 'Thời điểm phê duyệt báo giá';

-- ===================== BẢNG QUOTATION DETAILS =====================
COMMENT ON COLUMN QuotationDetails.QuotationDetailID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN QuotationDetails.QuotationID IS 'FK: Báo giá chứa dòng chi tiết này';
COMMENT ON COLUMN QuotationDetails.ItemType IS 'Loại item: PRODUCT (Sản phẩm), SERVICE (Dịch vụ), PART (Linh kiện)';
COMMENT ON COLUMN QuotationDetails.ComponentID IS 'FK: Sản phẩm/Linh kiện trong hệ thống (nullable)';
COMMENT ON COLUMN QuotationDetails.ItemName IS 'Tên sản phẩm/dịch vụ hiển thị trên báo giá';
COMMENT ON COLUMN QuotationDetails.ItemDescription IS 'Mô tả chi tiết sản phẩm/dịch vụ';
COMMENT ON COLUMN QuotationDetails.ItemSKU IS 'Mã SKU sản phẩm (nếu có)';
COMMENT ON COLUMN QuotationDetails.Quantity IS 'Số lượng';
COMMENT ON COLUMN QuotationDetails.Unit IS 'Đơn vị tính (Cái, Chiếc, Bộ...)';
COMMENT ON COLUMN QuotationDetails.UnitPrice IS 'Đơn giá';
COMMENT ON COLUMN QuotationDetails.DiscountPercent IS 'Phần trăm chiết khấu riêng cho dòng';
COMMENT ON COLUMN QuotationDetails.DiscountAmount IS 'Số tiền chiết khấu riêng cho dòng';
COMMENT ON COLUMN QuotationDetails.LineTotal IS 'Thành tiền = (Quantity * UnitPrice) - DiscountAmount';
COMMENT ON COLUMN QuotationDetails.Notes IS 'Ghi chú cho dòng (VD: Hàng zin, Bảo hành 6 tháng)';
COMMENT ON COLUMN QuotationDetails.SortOrder IS 'Thứ tự hiển thị trên báo giá';

-- ===================== BẢNG TECHNICAL INSPECTIONS =====================
COMMENT ON COLUMN TechnicalInspections.InspectionID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN TechnicalInspections.InspectionCode IS 'Mã phiếu kiểm tra (VD: QC-2024-001)';
COMMENT ON COLUMN TechnicalInspections.InspectionType IS 'Loại kiểm tra: PRE_DELIVERY, POST_REPAIR, INBOUND, RANDOM';
COMMENT ON COLUMN TechnicalInspections.SalesOrderID IS 'FK: Đơn bán hàng liên quan (kiểm tra trước giao)';
COMMENT ON COLUMN TechnicalInspections.RepairID IS 'FK: Đơn sửa chữa liên quan (kiểm tra sau sửa)';
COMMENT ON COLUMN TechnicalInspections.PurchaseOrderID IS 'FK: Đơn nhập hàng liên quan (kiểm tra hàng nhập)';
COMMENT ON COLUMN TechnicalInspections.InstanceID IS 'FK: Máy cụ thể đang kiểm tra (có Serial)';
COMMENT ON COLUMN TechnicalInspections.ComponentID IS 'FK: Loại sản phẩm đang kiểm tra';
COMMENT ON COLUMN TechnicalInspections.InspectionDate IS 'Ngày thực hiện kiểm tra';
COMMENT ON COLUMN TechnicalInspections.InspectorUserID IS 'FK: Kỹ thuật viên thực hiện kiểm tra';
COMMENT ON COLUMN TechnicalInspections.OverallResult IS 'Kết quả tổng thể: PENDING, PASSED, FAILED, CONDITIONAL';
COMMENT ON COLUMN TechnicalInspections.TotalScore IS 'Tổng điểm đạt được (nếu dùng thang điểm)';
COMMENT ON COLUMN TechnicalInspections.MaxScore IS 'Điểm tối đa có thể đạt';
COMMENT ON COLUMN TechnicalInspections.PassingScore IS 'Điểm tối thiểu để đạt yêu cầu';
COMMENT ON COLUMN TechnicalInspections.Remarks IS 'Nhận xét tổng thể của người kiểm tra';
COMMENT ON COLUMN TechnicalInspections.FailureReason IS 'Lý do không đạt (nếu FAILED)';
COMMENT ON COLUMN TechnicalInspections.RecommendedAction IS 'Đề xuất xử lý (VD: Thay pin, Calibrate scanner)';
COMMENT ON COLUMN TechnicalInspections.EvidenceURLs IS 'Danh sách link ảnh/video bằng chứng (JSON Array)';
COMMENT ON COLUMN TechnicalInspections.VerifiedByUserID IS 'FK: Quản lý xác nhận kết quả';
COMMENT ON COLUMN TechnicalInspections.VerifiedAt IS 'Thời điểm xác nhận';
COMMENT ON COLUMN TechnicalInspections.VerificationNote IS 'Ghi chú khi xác nhận';
COMMENT ON COLUMN TechnicalInspections.Status IS 'Trạng thái: IN_PROGRESS, COMPLETED, CANCELLED, RE_INSPECTION';
COMMENT ON COLUMN TechnicalInspections.ParentInspectionID IS 'FK: Lần kiểm tra trước (nếu là kiểm tra lại)';
COMMENT ON COLUMN TechnicalInspections.RetryCount IS 'Số lần đã kiểm tra lại';

-- ===================== BẢNG TECHNICAL INSPECTION ITEMS =====================
COMMENT ON COLUMN TechnicalInspectionItems.InspectionItemID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN TechnicalInspectionItems.InspectionID IS 'FK: Phiếu kiểm tra chứa hạng mục này';
COMMENT ON COLUMN TechnicalInspectionItems.ItemCategory IS 'Nhóm: APPEARANCE (Ngoại quan), FUNCTION (Chức năng), ACCESSORY, SOFTWARE';
COMMENT ON COLUMN TechnicalInspectionItems.ItemName IS 'Tên hạng mục (VD: Kiểm tra màn hình)';
COMMENT ON COLUMN TechnicalInspectionItems.ItemDescription IS 'Mô tả chi tiết cách kiểm tra';
COMMENT ON COLUMN TechnicalInspectionItems.Result IS 'Kết quả: NOT_CHECKED, PASSED, FAILED, NOT_APPLICABLE';
COMMENT ON COLUMN TechnicalInspectionItems.Score IS 'Điểm cho hạng mục (nếu dùng thang điểm)';
COMMENT ON COLUMN TechnicalInspectionItems.ActualValue IS 'Giá trị đo được (VD: Pin 85%)';
COMMENT ON COLUMN TechnicalInspectionItems.ExpectedValue IS 'Giá trị kỳ vọng (VD: Pin >= 80%)';
COMMENT ON COLUMN TechnicalInspectionItems.IssueFound IS 'Mô tả lỗi phát hiện';
COMMENT ON COLUMN TechnicalInspectionItems.IssueSeverity IS 'Mức độ lỗi: CRITICAL, MAJOR, MINOR, COSMETIC';
COMMENT ON COLUMN TechnicalInspectionItems.EvidenceURL IS 'Link ảnh/video bằng chứng';
COMMENT ON COLUMN TechnicalInspectionItems.SortOrder IS 'Thứ tự hiển thị';
COMMENT ON COLUMN TechnicalInspectionItems.IsMandatory IS 'Bắt buộc phải kiểm tra hay không';

-- ===================== BẢNG INSPECTION TEMPLATES =====================
COMMENT ON COLUMN InspectionTemplates.TemplateID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN InspectionTemplates.TemplateName IS 'Tên mẫu checklist (VD: Checklist kiểm tra PDA)';
COMMENT ON COLUMN InspectionTemplates.CategoryID IS 'FK: Áp dụng cho danh mục sản phẩm (NULL = chung)';
COMMENT ON COLUMN InspectionTemplates.ComponentID IS 'FK: Áp dụng cho sản phẩm cụ thể (NULL = cả danh mục)';
COMMENT ON COLUMN InspectionTemplates.InspectionType IS 'Loại kiểm tra áp dụng: PRE_DELIVERY, POST_REPAIR, INBOUND, ALL';
COMMENT ON COLUMN InspectionTemplates.ChecklistItems IS 'Danh sách hạng mục kiểm tra (JSON Array)';
COMMENT ON COLUMN InspectionTemplates.PassingScore IS 'Điểm tối thiểu để đạt (nếu dùng thang điểm)';
COMMENT ON COLUMN InspectionTemplates.IsActive IS 'Template còn sử dụng hay không';
COMMENT ON COLUMN InspectionTemplates.CreatedByUserID IS 'FK: Người tạo template';

-- ===================== BẢNG PRODUCT COMMON ISSUES =====================
COMMENT ON COLUMN ProductCommonIssues.IssueID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN ProductCommonIssues.IssueCode IS 'Mã lỗi duy nhất (VD: ISS-PDA-001)';
COMMENT ON COLUMN ProductCommonIssues.ComponentID IS 'FK: Sản phẩm gặp lỗi này';
COMMENT ON COLUMN ProductCommonIssues.CategoryID IS 'FK: Danh mục sản phẩm (áp dụng chung cho cả danh mục)';
COMMENT ON COLUMN ProductCommonIssues.IssueName IS 'Tên lỗi (VD: Màn hình không hiển thị)';
COMMENT ON COLUMN ProductCommonIssues.IssueDescription IS 'Mô tả chi tiết triệu chứng lỗi';
COMMENT ON COLUMN ProductCommonIssues.IssueCategory IS 'Phân loại: HARDWARE, SOFTWARE, CONNECTIVITY, BATTERY, DISPLAY, INPUT';
COMMENT ON COLUMN ProductCommonIssues.Severity IS 'Mức độ: CRITICAL, HIGH, MEDIUM, LOW';
COMMENT ON COLUMN ProductCommonIssues.CommonCauses IS 'Nguyên nhân phổ biến (JSON Array)';
COMMENT ON COLUMN ProductCommonIssues.SearchKeywords IS 'Từ khóa tìm kiếm - giúp khách mô tả lỗi dễ dàng';
COMMENT ON COLUMN ProductCommonIssues.OccurrenceCount IS 'Số lần gặp lỗi này - dùng để sắp xếp ưu tiên';
COMMENT ON COLUMN ProductCommonIssues.LastOccurrenceDate IS 'Lần cuối gặp lỗi này';
COMMENT ON COLUMN ProductCommonIssues.AvgRepairTimeMinutes IS 'Thời gian sửa chữa trung bình (phút)';
COMMENT ON COLUMN ProductCommonIssues.EstimatedRepairCostMin IS 'Chi phí sửa chữa ước tính - thấp nhất';
COMMENT ON COLUMN ProductCommonIssues.EstimatedRepairCostMax IS 'Chi phí sửa chữa ước tính - cao nhất';
COMMENT ON COLUMN ProductCommonIssues.IsPublic IS 'TRUE: Khách hàng có thể xem trên website/app';

-- ===================== BẢNG COMMON ISSUE SOLUTIONS =====================
COMMENT ON COLUMN CommonIssueSolutions.SolutionID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN CommonIssueSolutions.IssueID IS 'FK: Lỗi cần giải quyết';
COMMENT ON COLUMN CommonIssueSolutions.SolutionTitle IS 'Tiêu đề giải pháp (VD: Khởi động lại máy)';
COMMENT ON COLUMN CommonIssueSolutions.SolutionDescription IS 'Mô tả chi tiết các bước thực hiện';
COMMENT ON COLUMN CommonIssueSolutions.SolutionType IS 'Loại: SELF_SERVICE (Tự sửa), TECHNICIAN (Cần KTV), WARRANTY, REPLACEMENT';
COMMENT ON COLUMN CommonIssueSolutions.DifficultyLevel IS 'Độ khó 1-5: 1=Rất dễ, 5=Cần chuyên gia';
COMMENT ON COLUMN CommonIssueSolutions.KnowledgeBaseID IS 'FK: Link tới tài liệu/video hướng dẫn từ KnowledgeBase';
COMMENT ON COLUMN CommonIssueSolutions.DocumentURL IS 'Link tài liệu PDF trực tiếp';
COMMENT ON COLUMN CommonIssueSolutions.VideoURL IS 'Link video Youtube/Vimeo hướng dẫn';
COMMENT ON COLUMN CommonIssueSolutions.RequiredTools IS 'Công cụ cần thiết (JSON Array)';
COMMENT ON COLUMN CommonIssueSolutions.RequiredPartID IS 'FK: Linh kiện cần thay (nếu có)';
COMMENT ON COLUMN CommonIssueSolutions.SuccessRate IS 'Tỷ lệ thành công (%)';
COMMENT ON COLUMN CommonIssueSolutions.SuccessCount IS 'Số lần áp dụng thành công';
COMMENT ON COLUMN CommonIssueSolutions.AttemptCount IS 'Tổng số lần thử giải pháp này';
COMMENT ON COLUMN CommonIssueSolutions.EstimatedCost IS 'Chi phí ước tính nếu tự mua linh kiện';
COMMENT ON COLUMN CommonIssueSolutions.EstimatedTimeMinutes IS 'Thời gian thực hiện (phút)';
COMMENT ON COLUMN CommonIssueSolutions.Warnings IS 'Cảnh báo quan trọng (VD: Mất dữ liệu)';
COMMENT ON COLUMN CommonIssueSolutions.IsPublic IS 'TRUE: Khách hàng có thể xem và tự thực hiện';
COMMENT ON COLUMN CommonIssueSolutions.RequiredRole IS 'Role cần thiết để xem: NULL=Tất cả, TECHNICIAN, ADMIN';
COMMENT ON COLUMN CommonIssueSolutions.Priority IS 'Thứ tự ưu tiên: 0=thử đầu tiên';

-- ===================== BẢNG ISSUE REPORT HISTORY =====================
COMMENT ON COLUMN IssueReportHistory.ReportID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN IssueReportHistory.IssueID IS 'FK: Lỗi được báo cáo';
COMMENT ON COLUMN IssueReportHistory.ReportSource IS 'Nguồn: REPAIR, INSPECTION, CUSTOMER, INTERNAL';
COMMENT ON COLUMN IssueReportHistory.RepairID IS 'FK: Đơn sửa chữa liên quan';
COMMENT ON COLUMN IssueReportHistory.InspectionID IS 'FK: Phiếu QC liên quan';
COMMENT ON COLUMN IssueReportHistory.InstanceID IS 'FK: Máy cụ thể gặp lỗi';
COMMENT ON COLUMN IssueReportHistory.SolutionID IS 'FK: Giải pháp đã áp dụng';
COMMENT ON COLUMN IssueReportHistory.WasSuccessful IS 'Giải pháp có thành công không';
COMMENT ON COLUMN IssueReportHistory.ReportedByUserID IS 'FK: Người báo cáo';
COMMENT ON COLUMN IssueReportHistory.ReportedAt IS 'Thời điểm báo cáo';

-- ===================== BẢNG PRODUCT LIFECYCLE HISTORY =====================
COMMENT ON COLUMN ProductLifecycleHistory.HistoryID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN ProductLifecycleHistory.InstanceID IS 'FK: Sản phẩm được tracking';
COMMENT ON COLUMN ProductLifecycleHistory.EventType IS 'Loại sự kiện: IMPORTED, SOLD, TRANSFERRED, WARRANTY, REPAIR, INSPECTED, SCRAPPED...';
COMMENT ON COLUMN ProductLifecycleHistory.EventDate IS 'Thời điểm xảy ra sự kiện';
COMMENT ON COLUMN ProductLifecycleHistory.OldStatus IS 'Trạng thái trước sự kiện';
COMMENT ON COLUMN ProductLifecycleHistory.NewStatus IS 'Trạng thái sau sự kiện';
COMMENT ON COLUMN ProductLifecycleHistory.OldWarehouseID IS 'FK: Kho trước khi di chuyển';
COMMENT ON COLUMN ProductLifecycleHistory.NewWarehouseID IS 'FK: Kho sau khi di chuyển';
COMMENT ON COLUMN ProductLifecycleHistory.OldLocation IS 'Vị trí cũ trong kho (VD: A1-01-03)';
COMMENT ON COLUMN ProductLifecycleHistory.NewLocation IS 'Vị trí mới trong kho';
COMMENT ON COLUMN ProductLifecycleHistory.OldOwnerType IS 'Loại chủ sở hữu cũ: COMPANY, CUSTOMER, SUPPLIER';
COMMENT ON COLUMN ProductLifecycleHistory.NewOwnerType IS 'Loại chủ sở hữu mới';
COMMENT ON COLUMN ProductLifecycleHistory.OldOwnerID IS 'ID chủ sở hữu cũ';
COMMENT ON COLUMN ProductLifecycleHistory.NewOwnerID IS 'ID chủ sở hữu mới';
COMMENT ON COLUMN ProductLifecycleHistory.ReferenceType IS 'Loại chứng từ: PURCHASE_ORDER, SALES_ORDER, TRANSFER, REPAIR...';
COMMENT ON COLUMN ProductLifecycleHistory.ReferenceID IS 'ID chứng từ liên quan';
COMMENT ON COLUMN ProductLifecycleHistory.ReferenceCode IS 'Mã chứng từ (hiển thị nhanh)';
COMMENT ON COLUMN ProductLifecycleHistory.Description IS 'Mô tả chi tiết sự kiện';
COMMENT ON COLUMN ProductLifecycleHistory.Metadata IS 'Dữ liệu bổ sung dạng JSON';
COMMENT ON COLUMN ProductLifecycleHistory.PerformedByUserID IS 'FK: Người thực hiện';
COMMENT ON COLUMN ProductLifecycleHistory.Latitude IS 'Vĩ độ GPS (nếu tracking vị trí thực)';
COMMENT ON COLUMN ProductLifecycleHistory.Longitude IS 'Kinh độ GPS';

-- ===================== BẢNG PRODUCT OWNERSHIP =====================
COMMENT ON COLUMN ProductOwnership.OwnershipID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN ProductOwnership.InstanceID IS 'FK: Sản phẩm';
COMMENT ON COLUMN ProductOwnership.OwnerType IS 'Loại chủ: COMPANY, CUSTOMER, SUPPLIER, DEMO_PARTNER';
COMMENT ON COLUMN ProductOwnership.OwnerID IS 'ID chủ sở hữu (CustomerID/SupplierID)';
COMMENT ON COLUMN ProductOwnership.StartDate IS 'Ngày bắt đầu sở hữu';
COMMENT ON COLUMN ProductOwnership.EndDate IS 'Ngày kết thúc sở hữu (NULL nếu còn sở hữu)';
COMMENT ON COLUMN ProductOwnership.AcquisitionType IS 'Cách thức: PURCHASE, SALE, TRANSFER, WARRANTY, RETURN, DEMO';
COMMENT ON COLUMN ProductOwnership.IsCurrent IS 'TRUE nếu đang sở hữu hiện tại';

-- ===================== BẢNG PRODUCT LOCATION HISTORY =====================
COMMENT ON COLUMN ProductLocationHistory.LocationHistoryID IS 'Khóa chính UUID, tự động tạo';
COMMENT ON COLUMN ProductLocationHistory.InstanceID IS 'FK: Sản phẩm';
COMMENT ON COLUMN ProductLocationHistory.WarehouseID IS 'FK: Kho';
COMMENT ON COLUMN ProductLocationHistory.Zone IS 'Khu vực: MAIN, REPAIR, DEMO, QUARANTINE';
COMMENT ON COLUMN ProductLocationHistory.Aisle IS 'Dãy/Lối đi (VD: 01, 02)';
COMMENT ON COLUMN ProductLocationHistory.Rack IS 'Kệ (VD: R1, R2)';
COMMENT ON COLUMN ProductLocationHistory.Shelf IS 'Tầng (VD: S1, S2)';
COMMENT ON COLUMN ProductLocationHistory.Bin IS 'Ô/Ngăn (VD: B01, B02)';
COMMENT ON COLUMN ProductLocationHistory.LocationCode IS 'Mã vị trí đầy đủ (VD: MAIN-A-01-R1-S2-B03)';
COMMENT ON COLUMN ProductLocationHistory.MovedInAt IS 'Thời điểm đến vị trí này';
COMMENT ON COLUMN ProductLocationHistory.MovedOutAt IS 'Thời điểm rời vị trí (NULL nếu còn ở đây)';
COMMENT ON COLUMN ProductLocationHistory.MoveReason IS 'Lý do: RECEIVED, REORGANIZE, PICKING, REPAIR';
COMMENT ON COLUMN ProductLocationHistory.MovedByUserID IS 'FK: Người thực hiện di chuyển';
COMMENT ON COLUMN ProductLocationHistory.IsCurrent IS 'TRUE nếu đang ở vị trí này';