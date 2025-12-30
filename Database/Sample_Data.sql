-- =====================================================
-- WMS LA - Sample Data for Testing
-- =====================================================
-- This file contains sample data for testing the database
-- Run this AFTER creating the schema
-- =====================================================

-- =====================================================
-- 1. USERS & PERMISSIONS
-- =====================================================

-- Insert Admin User (Password: admin123 - MUST BE HASHED IN PRODUCTION!)
INSERT INTO "User" (UserID, Username, Password, Email, PhoneNumber, Role, IsActive, CreatedAt, UpdatedAt)
VALUES 
    (GEN_RANDOM_UUID(), 'admin', '$2a$10$rYwYx8LKSJtAyPOZ1QZJ0.hKJXe9pDXj8z9Yy8ZvXmD8xKjL0oC8m', 'admin@wmsla.com', '0912345678', 'ADMIN', TRUE, NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'receptionist1', '$2a$10$rYwYx8LKSJtAyPOZ1QZJ0.hKJXe9pDXj8z9Yy8ZvXmD8xKjL0oC8m', 'reception@wmsla.com', '0912345679', 'RECEPTIONIST', TRUE, NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'tech1', '$2a$10$rYwYx8LKSJtAyPOZ1QZJ0.hKJXe9pDXj8z9Yy8ZvXmD8xKjL0oC8m', 'tech@wmsla.com', '0912345680', 'TECHNICIAN', TRUE, NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'warehouse1', '$2a$10$rYwYx8LKSJtAyPOZ1QZJ0.hKJXe9pDXj8z9Yy8ZvXmD8xKjL0oC8m', 'warehouse@wmsla.com', '0912345681', 'WAREHOUSE', TRUE, NOW(), NOW());

-- Insert Permissions
INSERT INTO Permission (PermissionID, PermissionName, CreatedAt, UpdatedAt)
VALUES 
    (GEN_RANDOM_UUID(), 'VIEW_INVENTORY', NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'CREATE_SALES_ORDER', NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'CREATE_PURCHASE_ORDER', NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'MANAGE_USERS', NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'VIEW_REPORTS', NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'MANAGE_REPAIRS', NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'TRANSFER_STOCK', NOW(), NOW());

-- =====================================================
-- 2. CATEGORIES & PRODUCTS
-- =====================================================

-- Insert Categories
INSERT INTO Categories (CategoryID, CategoryName, CreatedAt, UpdatedAt)
VALUES 
    (GEN_RANDOM_UUID(), 'iPhone', NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'Samsung Galaxy', NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'iPad', NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'Linh kiện màn hình', NOW(), NOW()),
    (GEN_RANDOM_UUID(), 'Phụ kiện', NOW(), NOW());

-- Get CategoryID for iPhone (you'll need to replace with actual UUID after running above)
-- For this example, we'll use temp variables

DO $$
DECLARE
    cat_iphone UUID;
    cat_samsung UUID;
    cat_ipad UUID;
    cat_linhkien UUID;
    cat_phukien UUID;
    wh_main UUID;
    wh_branch UUID;
    sup_apple UUID;
    sup_samsung UUID;
    cust_john UUID;
    cust_mary UUID;
    comp_ip15pm UUID;
    comp_s24ultra UUID;
    user_admin UUID;
BEGIN
    -- Get Category IDs
    SELECT CategoryID INTO cat_iphone FROM Categories WHERE CategoryName = 'iPhone' LIMIT 1;
    SELECT CategoryID INTO cat_samsung FROM Categories WHERE CategoryName = 'Samsung Galaxy' LIMIT 1;
    SELECT CategoryID INTO cat_ipad FROM Categories WHERE CategoryName = 'iPad' LIMIT 1;
    SELECT CategoryID INTO cat_linhkien FROM Categories WHERE CategoryName = 'Linh kiện màn hình' LIMIT 1;
    SELECT CategoryID INTO cat_phukien FROM Categories WHERE CategoryName = 'Phụ kiện' LIMIT 1;
    
    -- Get Admin User
    SELECT UserID INTO user_admin FROM "User" WHERE Username = 'admin' LIMIT 1;

    -- =====================================================
    -- 3. WAREHOUSES
    -- =====================================================
    
    INSERT INTO Warehouses (WarehouseID, WarehouseName, Address, City, District, Ward, PhoneNumber, ManagerUserID, IsActive, CreatedAt, UpdatedAt)
    VALUES 
        (GEN_RANDOM_UUID(), 'Kho Trung Tâm Hà Nội', '123 Đường Láng', 'Hà Nội', 'Đống Đa', 'Láng Hạ', '0243456789', user_admin, TRUE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'Chi nhánh TP.HCM', '456 Nguyễn Văn Linh', 'TP.HCM', 'Quận 7', 'Tân Phú', '0283456789', user_admin, TRUE, NOW(), NOW())
    RETURNING WarehouseID INTO wh_main;
    
    SELECT WarehouseID INTO wh_main FROM Warehouses WHERE WarehouseName = 'Kho Trung Tâm Hà Nội' LIMIT 1;
    SELECT WarehouseID INTO wh_branch FROM Warehouses WHERE WarehouseName = 'Chi nhánh TP.HCM' LIMIT 1;

    -- =====================================================
    -- 4. SUPPLIERS
    -- =====================================================
    
    INSERT INTO Suppliers (SupplierID, SupplierCode, SupplierName, ContactPerson, PhoneNumber, Email, Address, City, TaxCode, BankAccount, BankName, IsActive, CreatedAt, UpdatedAt)
    VALUES 
        (GEN_RANDOM_UUID(), 'SUP001', 'Apple Authorized Distributor', 'Nguyễn Văn A', '0901234567', 'contact@appledist.vn', '789 Trần Hưng Đạo', 'Hà Nội', '0123456789', '123456789', 'Vietcombank', TRUE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'SUP002', 'Samsung Vietnam', 'Trần Thị B', '0907654321', 'sales@samsung.vn', '321 Lê Lợi', 'TP.HCM', '9876543210', '987654321', 'Techcombank', TRUE, NOW(), NOW())
    RETURNING SupplierID INTO sup_apple;
    
    SELECT SupplierID INTO sup_apple FROM Suppliers WHERE SupplierCode = 'SUP001' LIMIT 1;
    SELECT SupplierID INTO sup_samsung FROM Suppliers WHERE SupplierCode = 'SUP002' LIMIT 1;

    -- =====================================================
    -- 5. CUSTOMERS
    -- =====================================================
    
    INSERT INTO Customers (CustomerID, CustomerCode, CustomerName, PhoneNumber, Email, Address, City, District, Ward, DateOfBirth, Gender, CustomerType, IsActive, CreatedAt, UpdatedAt)
    VALUES 
        (GEN_RANDOM_UUID(), 'CUST001', 'Nguyễn Văn An', '0981234567', 'nguyenvanan@gmail.com', '12 Hoàng Hoa Thám', 'Hà Nội', 'Ba Đình', 'Ngọc Hà', '1990-05-15', 'MALE', 'VIP', TRUE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'CUST002', 'Trần Thị Mai', '0987654321', 'tranthi.mai@gmail.com', '45 Hai Bà Trưng', 'TP.HCM', 'Quận 1', 'Bến Nghé', '1995-08-20', 'FEMALE', 'RETAIL', TRUE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'CUST003', 'Công ty ABC', '0243567890', 'info@abc.com.vn', '100 Kim Mã', 'Hà Nội', 'Ba Đình', 'Kim Mã', NULL, 'OTHER', 'WHOLESALE', TRUE, NOW(), NOW())
    RETURNING CustomerID INTO cust_john;
    
    SELECT CustomerID INTO cust_john FROM Customers WHERE CustomerCode = 'CUST001' LIMIT 1;
    SELECT CustomerID INTO cust_mary FROM Customers WHERE CustomerCode = 'CUST002' LIMIT 1;

    -- =====================================================
    -- 6. COMPONENTS (PRODUCTS)
    -- =====================================================
    
    INSERT INTO Components (ComponentID, SKU, ComponentName, CategoryID, Unit, ImageURL, BasePrice, SellPrice, IsSerialized, CreatedAt, UpdatedAt)
    VALUES 
        (GEN_RANDOM_UUID(), 'IP15PM-256-BLK', 'iPhone 15 Pro Max 256GB Black Titanium', cat_iphone, 'Chiếc', '/images/ip15pm-black.jpg', 28000000, 32000000, TRUE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'IP15PM-256-BLU', 'iPhone 15 Pro Max 256GB Blue Titanium', cat_iphone, 'Chiếc', '/images/ip15pm-blue.jpg', 28000000, 32000000, TRUE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'S24U-512-BLK', 'Samsung Galaxy S24 Ultra 512GB Black', cat_samsung, 'Chiếc', '/images/s24u-black.jpg', 26000000, 30000000, TRUE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'IPAD-AIR-256', 'iPad Air 11 inch M2 256GB', cat_ipad, 'Chiếc', '/images/ipad-air.jpg', 16000000, 18000000, TRUE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'LCD-IP15PM', 'Màn hình iPhone 15 Pro Max OLED', cat_linhkien, 'Cái', '/images/lcd-ip15pm.jpg', 3500000, 4500000, FALSE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'CASE-IP15PM', 'Ốp lưng Apple iPhone 15 Pro Max MagSafe', cat_phukien, 'Cái', '/images/case-ip15pm.jpg', 450000, 650000, FALSE, NOW(), NOW())
    RETURNING ComponentID INTO comp_ip15pm;
    
    SELECT ComponentID INTO comp_ip15pm FROM Components WHERE SKU = 'IP15PM-256-BLK' LIMIT 1;
    SELECT ComponentID INTO comp_s24ultra FROM Components WHERE SKU = 'S24U-512-BLK' LIMIT 1;

    -- =====================================================
    -- 7. PRODUCT INSTANCES (SPECIFIC DEVICES WITH SERIAL/IMEI)
    -- =====================================================
    
    INSERT INTO ProductInstances (InstanceID, ComponentID, WarehouseID, SerialNumber, IMEI1, IMEI2, Status, ActualImportPrice, ImportDate, Notes, CreatedAt, UpdatedAt)
    VALUES 
        -- iPhone 15 Pro Max Black
        (GEN_RANDOM_UUID(), comp_ip15pm, wh_main, 'F9GX3PL92H', '359876543210987', '359876543210988', 'IN_STOCK', 27800000, NOW() - INTERVAL '10 days', 'Máy mới nguyên seal', NOW(), NOW()),
        (GEN_RANDOM_UUID(), comp_ip15pm, wh_main, 'F9GX3PL93H', '359876543210989', '359876543210990', 'IN_STOCK', 27800000, NOW() - INTERVAL '10 days', 'Máy mới nguyên seal', NOW(), NOW()),
        (GEN_RANDOM_UUID(), comp_ip15pm, wh_main, 'F9GX3PL94H', '359876543210991', '359876543210992', 'SOLD', 27800000, NOW() - INTERVAL '10 days', 'Đã bán cho khách VIP', NOW(), NOW()),
        
        -- Samsung S24 Ultra
        (GEN_RANDOM_UUID(), comp_s24ultra, wh_branch, 'R3GN8TL45K', '351234567890123', '351234567890124', 'IN_STOCK', 25800000, NOW() - INTERVAL '5 days', 'Máy mới chính hãng', NOW(), NOW()),
        (GEN_RANDOM_UUID(), comp_s24ultra, wh_branch, 'R3GN8TL46K', '351234567890125', '351234567890126', 'IN_STOCK', 25800000, NOW() - INTERVAL '5 days', 'Máy mới chính hãng', NOW(), NOW());

    -- =====================================================
    -- 8. PURCHASE ORDERS
    -- =====================================================
    
    INSERT INTO PurchaseOrders (PurchaseOrderID, OrderCode, SupplierID, WarehouseID, OrderDate, ExpectedDeliveryDate, ActualDeliveryDate, Status, TotalAmount, DiscountAmount, FinalAmount, CreatedByUserID, Notes, CreatedAt, UpdatedAt)
    VALUES 
        (GEN_RANDOM_UUID(), 'PO-2025-001', sup_apple, wh_main, NOW() - INTERVAL '15 days', (NOW() - INTERVAL '10 days')::date, (NOW() - INTERVAL '10 days')::date, 'DELIVERED', 84000000, 1000000, 83000000, user_admin, 'Đơn nhập iPhone 15 Pro Max đợt 1', NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'PO-2025-002', sup_samsung, wh_branch, NOW() - INTERVAL '7 days', (NOW() - INTERVAL '3 days')::date, (NOW() - INTERVAL '5 days')::date, 'DELIVERED', 52000000, 500000, 51500000, user_admin, 'Đơn nhập Samsung S24 Ultra', NOW(), NOW());

    -- =====================================================
    -- 9. SALES ORDERS
    -- =====================================================
    
    INSERT INTO SalesOrders (SalesOrderID, OrderCode, CustomerID, WarehouseID, OrderDate, Status, TotalAmount, DiscountAmount, FinalAmount, PaymentStatus, PaymentMethod, CreatedByUserID, Notes, CreatedAt, UpdatedAt)
    VALUES 
        (GEN_RANDOM_UUID(), 'SO-2025-001', cust_john, wh_main, NOW() - INTERVAL '2 days', 'COMPLETED', 32000000, 500000, 31500000, 'PAID', 'BANK_TRANSFER', user_admin, 'Khách VIP mua iPhone 15 Pro Max', NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'SO-2025-002', cust_mary, wh_main, NOW(), 'PENDING', 650000, 0, 650000, 'UNPAID', 'CASH', user_admin, 'Mua ốp lưng', NOW(), NOW());

    -- =====================================================
    -- 10. REPAIRS
    -- =====================================================
    
    INSERT INTO Repairs (RepairID, RepairCode, CustomerID, InstanceID, ComponentID, ProblemDescription, RepairDate, ExpectedCompletionDate, Status, TechnicianUserID, RepairCost, PartsCost, TotalCost, PaymentStatus, WarrantyType, Notes, CreatedAt, UpdatedAt)
    VALUES 
        (GEN_RANDOM_UUID(), 
         'RP-2025-001', 
         cust_mary, 
         NULL, 
         comp_ip15pm, 
         'Màn hình bị vỡ, cần thay màn hình mới', 
         NOW() - INTERVAL '1 day', 
         (NOW() + INTERVAL '2 days')::date, 
         'IN_PROGRESS', 
         (SELECT UserID FROM "User" WHERE Username = 'tech1' LIMIT 1),
         500000, 
         4500000, 
         5000000, 
         'UNPAID', 
         'OUT_WARRANTY', 
         'Khách làm rơi máy, vỡ màn hình', 
         NOW(), 
         NOW());

    -- =====================================================
    -- 11. INVENTORY TRANSACTIONS
    -- =====================================================
    
    INSERT INTO InventoryTransactions (TransactionID, TransactionCode, TransactionType, ReferenceID, WarehouseID, ComponentID, InstanceID, Quantity, TransactionDate, CreatedByUserID, Notes, CreatedAt)
    VALUES 
        (GEN_RANDOM_UUID(), 'INV-IN-001', 'IMPORT', NULL, wh_main, comp_ip15pm, NULL, 3, NOW() - INTERVAL '10 days', user_admin, 'Nhập kho từ PO-2025-001', NOW()),
        (GEN_RANDOM_UUID(), 'INV-IN-002', 'IMPORT', NULL, wh_branch, comp_s24ultra, NULL, 2, NOW() - INTERVAL '5 days', user_admin, 'Nhập kho từ PO-2025-002', NOW()),
        (GEN_RANDOM_UUID(), 'INV-OUT-001', 'EXPORT', NULL, wh_main, comp_ip15pm, NULL, -1, NOW() - INTERVAL '2 days', user_admin, 'Xuất kho bán cho khách', NOW());

    -- =====================================================
    -- 12. NOTIFICATIONS
    -- =====================================================
    
    INSERT INTO Notifications (NotificationID, UserID, Title, Message, NotificationType, ReferenceType, ReferenceID, IsRead, CreatedAt)
    VALUES 
        (GEN_RANDOM_UUID(), user_admin, 'Đơn hàng mới', 'Có đơn hàng mới SO-2025-002 cần xử lý', 'ORDER', 'SALES_ORDER', NULL, FALSE, NOW()),
        (GEN_RANDOM_UUID(), user_admin, 'Tồn kho thấp', 'Sản phẩm iPhone 15 Pro Max sắp hết hàng', 'STOCK', NULL, NULL, FALSE, NOW() - INTERVAL '1 hour'),
        (GEN_RANDOM_UUID(), (SELECT UserID FROM "User" WHERE Username = 'tech1' LIMIT 1), 'Đơn sửa chữa mới', 'Có đơn sửa chữa RP-2025-001 được gán cho bạn', 'ORDER', 'REPAIR', NULL, FALSE, NOW() - INTERVAL '1 day');

    -- =====================================================
    -- 13. APP SETTINGS
    -- =====================================================
    
    INSERT INTO AppSettings (SettingID, SettingKey, SettingValue, Description, DataType, IsSystem, CreatedAt, UpdatedAt)
    VALUES 
        (GEN_RANDOM_UUID(), 'COMPANY_NAME', 'WMS LA', 'Tên công ty', 'STRING', FALSE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'CURRENCY', 'VND', 'Đơn vị tiền tệ', 'STRING', FALSE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'LOW_STOCK_THRESHOLD', '5', 'Ngưỡng cảnh báo tồn kho thấp', 'NUMBER', FALSE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'ENABLE_NOTIFICATIONS', 'true', 'Bật/tắt thông báo push', 'BOOLEAN', FALSE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'TAX_RATE', '0.1', 'Thuế VAT (10%)', 'NUMBER', FALSE, NOW(), NOW()),
        (GEN_RANDOM_UUID(), 'SYSTEM_VERSION', '1.0.0', 'Phiên bản hệ thống', 'STRING', TRUE, NOW(), NOW());

END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check Users
SELECT Username, Email, Role FROM "User" ORDER BY Role;

-- Check Warehouses
SELECT WarehouseName, City, District FROM Warehouses;

-- Check Products
SELECT c.CategoryName, co.SKU, co.ComponentName, co.SellPrice
FROM Components co
JOIN Categories c ON c.CategoryID = co.CategoryID
ORDER BY c.CategoryName, co.ComponentName;

-- Check Product Instances
SELECT 
    c.ComponentName,
    pi.SerialNumber,
    pi.IMEI1,
    w.WarehouseName,
    pi.Status
FROM ProductInstances pi
JOIN Components c ON c.ComponentID = pi.ComponentID
LEFT JOIN Warehouses w ON w.WarehouseID = pi.WarehouseID
ORDER BY c.ComponentName;

-- Check Inventory Summary
SELECT 
    w.WarehouseName,
    c.ComponentName,
    COUNT(pi.InstanceID) as TotalUnits,
    SUM(CASE WHEN pi.Status = 'IN_STOCK' THEN 1 ELSE 0 END) as InStock,
    SUM(CASE WHEN pi.Status = 'SOLD' THEN 1 ELSE 0 END) as Sold
FROM Warehouses w
JOIN ProductInstances pi ON pi.WarehouseID = w.WarehouseID
JOIN Components c ON c.ComponentID = pi.ComponentID
GROUP BY w.WarehouseName, c.ComponentName
ORDER BY w.WarehouseName, c.ComponentName;

-- Check Recent Sales
SELECT 
    so.OrderCode,
    cu.CustomerName,
    so.OrderDate,
    so.Status,
    so.FinalAmount,
    so.PaymentStatus
FROM SalesOrders so
JOIN Customers cu ON cu.CustomerID = so.CustomerID
ORDER BY so.OrderDate DESC;

-- Check Notifications
SELECT 
    u.Username,
    n.Title,
    n.Message,
    n.IsRead,
    n.CreatedAt
FROM Notifications n
JOIN "User" u ON u.UserID = n.UserID
ORDER BY n.CreatedAt DESC;

-- =====================================================
-- END OF SAMPLE DATA
-- =====================================================

-- =====================================================
-- DỮ LIỆU MẪU CHO CATEGORIES (Cấu trúc phân cấp)
-- =====================================================
-- Lưu ý: Chạy các INSERT này sau khi tạo bảng để có dữ liệu mẫu

/*
-- Cấp 1: Danh mục gốc
INSERT INTO Categories (CategoryCode, CategoryName, ParentCategoryID, Level, Path, Description) VALUES
('DEVICE', 'Thiết bị', NULL, 1, '/DEVICE', 'Các thiết bị điện tử chính'),
('ACCESSORY', 'Phụ kiện', NULL, 1, '/ACCESSORY', 'Phụ kiện đi kèm thiết bị'),
('CONSUMABLE', 'Vật tư tiêu hao', NULL, 1, '/CONSUMABLE', 'Vật tư cần thay thế định kỳ'),
('SPARE_PART', 'Linh kiện thay thế', NULL, 1, '/SPARE_PART', 'Linh kiện sửa chữa');

-- Cấp 2: Thiết bị cầm tay
INSERT INTO Categories (CategoryCode, CategoryName, ParentCategoryID, Level, Path, Description) VALUES
('PDA', 'Máy kiểm kho PDA', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'DEVICE'), 2, '/DEVICE/PDA', 'Máy tính cầm tay kiểm kho'),
('SCANNER', 'Máy quét mã vạch', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'DEVICE'), 2, '/DEVICE/SCANNER', 'Máy quét barcode cầm tay'),
('PRINTER', 'Máy in', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'DEVICE'), 2, '/DEVICE/PRINTER', 'Máy in tem nhãn, hóa đơn'),
('ESL', 'Nhãn giá điện tử', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'DEVICE'), 2, '/DEVICE/ESL', 'Electronic Shelf Label'),
('RFID_READER', 'Đầu đọc RFID', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'DEVICE'), 2, '/DEVICE/RFID_READER', 'Thiết bị đọc thẻ RFID'),
('NFC_READER', 'Đầu đọc NFC', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'DEVICE'), 2, '/DEVICE/NFC_READER', 'Thiết bị đọc NFC');

-- Cấp 2: Phụ kiện
INSERT INTO Categories (CategoryCode, CategoryName, ParentCategoryID, Level, Path, Description) VALUES
('CASE', 'Ốp lưng & Bao da', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'ACCESSORY'), 2, '/ACCESSORY/CASE', 'Ốp bảo vệ thiết bị'),
('SCREEN_PROTECTOR', 'Kính cường lực', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'ACCESSORY'), 2, '/ACCESSORY/SCREEN_PROTECTOR', 'Miếng dán bảo vệ màn hình'),
('STRAP', 'Dây đeo & Dây cầm', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'ACCESSORY'), 2, '/ACCESSORY/STRAP', 'Dây đeo tay, dây đeo vai'),
('CHARGER', 'Sạc & Dock sạc', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'ACCESSORY'), 2, '/ACCESSORY/CHARGER', 'Sạc pin, dock sạc đa năng'),
('HOLSTER', 'Bao súng & Belt clip', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'ACCESSORY'), 2, '/ACCESSORY/HOLSTER', 'Bao đựng thiết bị gắn thắt lưng');

-- Cấp 2: Vật tư tiêu hao
INSERT INTO Categories (CategoryCode, CategoryName, ParentCategoryID, Level, Path, Description) VALUES
('LABEL', 'Tem nhãn', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'CONSUMABLE'), 2, '/CONSUMABLE/LABEL', 'Cuộn tem in nhãn'),
('RIBBON', 'Ribbon mực in', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'CONSUMABLE'), 2, '/CONSUMABLE/RIBBON', 'Mực in nhiệt'),
('PAPER', 'Giấy in', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'CONSUMABLE'), 2, '/CONSUMABLE/PAPER', 'Giấy in hóa đơn, giấy in nhiệt');

-- Cấp 2: Linh kiện thay thế
INSERT INTO Categories (CategoryCode, CategoryName, ParentCategoryID, Level, Path, Description) VALUES
('BATTERY', 'Pin', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'SPARE_PART'), 2, '/SPARE_PART/BATTERY', 'Pin thay thế'),
('SCREEN', 'Màn hình', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'SPARE_PART'), 2, '/SPARE_PART/SCREEN', 'Màn hình LCD/OLED'),
('KEYPAD', 'Bàn phím', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'SPARE_PART'), 2, '/SPARE_PART/KEYPAD', 'Bàn phím vật lý'),
('SCANNER_ENGINE', 'Đầu đọc Scanner', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'SPARE_PART'), 2, '/SPARE_PART/SCANNER_ENGINE', 'Module scanner 1D/2D');
*/

-- =====================================================
-- VÍ DỤ SẢN PHẨM THEO TỪNG LOẠI
-- =====================================================
/*
-- 1. PDA (Máy kiểm kho cầm tay)
INSERT INTO Components (SKU, ComponentName, CategoryID, ProductType, DeviceType, Brand, Model, IsSerialized, DefaultWarrantyMonths, Specifications) VALUES
('MOBY-M63-V2', 'Máy kiểm kho PDA Mobydata M63 V2', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'PDA'), 'DEVICE', 'PDA', 'Mobydata', 'M63 V2', TRUE, 12,
 '{"OS": "Android 13", "CPU": "Octa-core 2.0GHz", "RAM": "4GB", "ROM": "64GB", "Display": "5.5inch HD+", "Scanner": "2D Honeywell N6703", "IP_Rating": "IP65", "Battery": "5000mAh", "NFC": "Yes", "Wifi": "802.11 a/b/g/n/ac"}');

-- 2. Máy in (Printer)
INSERT INTO Components (SKU, ComponentName, CategoryID, ProductType, DeviceType, Brand, Model, IsSerialized, DefaultWarrantyMonths, Specifications) VALUES
('ZEBRA-ZD421', 'Máy in tem nhãn Zebra ZD421', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'PRINTER'), 'DEVICE', 'PRINTER', 'Zebra', 'ZD421', TRUE, 12,
 '{"Print_Method": "Direct Thermal/Thermal Transfer", "Resolution": "203dpi/300dpi", "Print_Width": "104mm", "Print_Speed": "152mm/s", "Interface": "USB, Ethernet, Bluetooth, Wifi"}');

-- 3. ESL (Nhãn giá điện tử)
INSERT INTO Components (SKU, ComponentName, CategoryID, ProductType, DeviceType, Brand, Model, IsSerialized, DefaultWarrantyMonths, Specifications) VALUES
('ESL-29-BW', 'Nhãn giá điện tử 2.9 inch', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'ESL'), 'DEVICE', 'ESL', 'SoluM', 'Newton 2.9', TRUE, 24,
 '{"Display_Size": "2.9inch", "Display_Type": "E-ink", "Resolution": "296x128", "Colors": "Black/White/Red", "Protocol": "RF 2.4GHz", "Battery_Life": "5 years", "Temperature": "-20°C to 50°C"}');

-- 4. Máy quét Barcode (Scanner)
INSERT INTO Components (SKU, ComponentName, CategoryID, ProductType, DeviceType, Brand, Model, IsSerialized, DefaultWarrantyMonths, Specifications) VALUES
('HONEY-1902', 'Máy quét mã vạch Honeywell Voyager 1902g', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'SCANNER'), 'DEVICE', 'SCANNER', 'Honeywell', 'Voyager 1902g', TRUE, 12,
 '{"Scan_Type": "2D Imager", "Wireless": "Bluetooth 2.1", "Range": "10m", "Battery": "2200mAh", "IP_Rating": "IP42", "Drop_Spec": "1.5m"}');

-- 5. RFID Reader
INSERT INTO Components (SKU, ComponentName, CategoryID, ProductType, DeviceType, Brand, Model, IsSerialized, DefaultWarrantyMonths, Specifications) VALUES
('ZEBRA-RFD40', 'Đầu đọc RFID Zebra RFD40', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'RFID_READER'), 'DEVICE', 'RFID_READER', 'Zebra', 'RFD40', TRUE, 12,
 '{"RFID_Standard": "UHF RAIN RFID", "Frequency": "865-928 MHz", "Read_Range": "7m", "Read_Rate": "1300 tags/sec", "Interface": "Bluetooth 5.0, USB-C"}');

-- 6. Phụ kiện - Ốp lưng (ACCESSORY - Không có Serial)
INSERT INTO Components (SKU, ComponentName, CategoryID, ProductType, Brand, IsSerialized, CompatibleWith) VALUES
('CASE-M63-BLK', 'Ốp lưng bảo vệ PDA M63 - Màu đen', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'CASE'), 'ACCESSORY', 'Mobydata', FALSE,
 '[{"SKU": "MOBY-M63-V2", "Name": "PDA Mobydata M63 V2"}]');

-- 7. Phụ kiện - Kính cường lực
INSERT INTO Components (SKU, ComponentName, CategoryID, ProductType, Brand, IsSerialized, CompatibleWith) VALUES
('GLASS-M63', 'Kính cường lực PDA M63', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'SCREEN_PROTECTOR'), 'ACCESSORY', 'Generic', FALSE,
 '[{"SKU": "MOBY-M63-V2", "Name": "PDA Mobydata M63 V2"}]');

-- 8. Phụ kiện - Dây đeo tay
INSERT INTO Components (SKU, ComponentName, CategoryID, ProductType, Brand, IsSerialized) VALUES
('STRAP-HAND-UNI', 'Dây đeo tay Universal', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'STRAP'), 'ACCESSORY', 'Generic', FALSE);

-- 9. Vật tư tiêu hao - Tem nhãn
INSERT INTO Components (SKU, ComponentName, CategoryID, ProductType, Brand, IsSerialized, Unit, Specifications) VALUES
('LABEL-50X30-1000', 'Tem nhãn 50x30mm - Cuộn 1000 tem', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'LABEL'), 'CONSUMABLE', 'Generic', FALSE, 'Cuộn',
 '{"Size": "50x30mm", "Quantity": "1000 tem/cuộn", "Material": "Decal giấy", "Adhesive": "Permanent"}');

-- 10. Linh kiện thay thế - Pin (Có Serial để tracking)
INSERT INTO Components (SKU, ComponentName, CategoryID, ProductType, Brand, IsSerialized, CompatibleWith, Specifications) VALUES
('BAT-M63-5000', 'Pin PDA M63 5000mAh', (SELECT CategoryID FROM Categories WHERE CategoryCode = 'BATTERY'), 'SPARE_PART', 'Mobydata', TRUE,
 '[{"SKU": "MOBY-M63-V2", "Name": "PDA Mobydata M63 V2"}]',
 '{"Capacity": "5000mAh", "Voltage": "3.8V", "Type": "Li-Polymer"}');
*/