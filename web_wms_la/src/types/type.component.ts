// Types cho bảng Components dựa trên Database Schema

export interface SpecificationItem {
    k: string;  // key - tên thông số
    v: string;  // value - giá trị
    q?: boolean | number; // showOnQuote - hiển thị khi báo giá
}

export interface SpecificationGroup {
    groupName: string;
    items: SpecificationItem[];
}

// Phân loại sản phẩm
export type ProductType = 'DEVICE' | 'ACCESSORY' | 'CONSUMABLE' | 'SPARE_PART' | 'SOFTWARE';

// Phân loại thiết bị (cho ProductType = DEVICE)
export type DeviceType =
    | 'PDA'
    | 'PRINTER'
    | 'SCANNER'
    | 'ESL'
    | 'RFID_READER'
    | 'NFC_READER'
    | 'KIOSK'
    | 'TERMINAL'
    | 'GATEWAY'
    | 'OTHER';

// Trạng thái sản phẩm
export type ComponentStatus = 'ACTIVE' | 'DISCONTINUED' | 'COMING_SOON' | 'OUT_OF_STOCK';

// Interface Category (liên kết)
export interface Category {
    categoryId: string;
    categoryName: string;
    categoryCode?: string;
    parentCategoryId?: string;
    level?: number;
    path?: string;
}

// Interface chính cho Component/Product
export interface Component {
    componentId: string;
    sku: string;
    componentName: string;
    componentNameVN?: string;
    categoryId?: string;
    category?: Category;
    supplierId?: string;
    supplier?: {
        supplierId: string;
        supplierName: string;
        supplierCode?: string;
    };

    // Phân loại
    productType: ProductType;
    deviceType?: DeviceType;

    // Thương hiệu & Model
    brand?: string;
    model?: string;

    // Mã sản phẩm
    manufacturerSKU?: string;
    barcode?: string;

    // Đơn vị & Hình ảnh
    unit?: string;
    imageUrl?: string;
    imageGallery?: string[];

    // Giá cả
    basePrice?: number;
    sellPrice?: number;
    wholesalePrice?: number;

    // Quản lý kho
    isSerialized: boolean;
    minStockLevel?: number;
    maxStockLevel?: number;
    currentStock?: number; // Computed field từ ProductInstances

    // Bảo hành
    defaultWarrantyMonths?: number;

    // Thông tin vật lý
    weight?: number;
    length?: number;
    width?: number;
    height?: number;

    // JSONB fields
    specifications?: Record<string, any>;
    tags?: string[];
    documents?: DocumentItem[];
    competitors?: CompetitorItem[];
    compatibleWith?: CompatibleItem[];

    // Trạng thái & SEO
    status: ComponentStatus;
    shortDescription?: string;
    fullDescription?: string;

    // Audit
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;

    // Relations
    variants?: Variant[];
}

export interface Variant {
    variantId: string;
    partNumber: string;
    variantName?: string;
    variantDescription?: string;
    variantSpecs?: string;
    basePrice?: number;
    sellPrice?: number;
    wholesalePrice?: number;
    barcode?: string;
    minStockLevel: number;
    maxStockLevel?: number;
    isActive: boolean;
    isDefault: boolean;
    sortOrder: number;
    stockCount: number;
}

// Interface cho Documents
export interface DocumentItem {
    type: 'USER_MANUAL' | 'DATASHEET' | 'QUICK_START' | 'FIRMWARE' | 'DRIVER' | 'VIDEO' | 'WARRANTY_CARD' | 'OTHER';
    title: string;
    url: string;
    fileType?: string;
    version?: string;
    uploadedAt?: string;
}

// Interface cho Competitors
export interface CompetitorItem {
    brand: string;
    model: string;
    price?: number;
    notes?: string;
}

// Interface cho Compatible Products
export interface CompatibleItem {
    componentId: string;
    sku: string;
    name: string;
}

// Config cho ProductType
export const PRODUCT_TYPE_CONFIG: Record<ProductType, { label: string; color: string; icon?: string }> = {
    DEVICE: { label: 'Thiết bị', color: 'blue' },
    ACCESSORY: { label: 'Phụ kiện', color: 'cyan' },
    CONSUMABLE: { label: 'Vật tư tiêu hao', color: 'orange' },
    SPARE_PART: { label: 'Linh kiện thay thế', color: 'purple' },
    SOFTWARE: { label: 'Phần mềm/License', color: 'geekblue' },
};

// Config cho DeviceType
export const DEVICE_TYPE_CONFIG: Record<DeviceType, { label: string; icon?: string }> = {
    PDA: { label: 'Máy kiểm kho (PDA)' },
    PRINTER: { label: 'Máy in' },
    SCANNER: { label: 'Máy quét mã vạch' },
    ESL: { label: 'Nhãn giá điện tử (ESL)' },
    RFID_READER: { label: 'Đầu đọc RFID' },
    NFC_READER: { label: 'Đầu đọc NFC' },
    KIOSK: { label: 'Máy Kiosk' },
    TERMINAL: { label: 'Máy POS/Terminal' },
    GATEWAY: { label: 'Gateway/Access Point' },
    OTHER: { label: 'Khác' },
};

// Config cho Status
export const STATUS_CONFIG: Record<ComponentStatus, { label: string; color: string; badge: 'success' | 'error' | 'warning' | 'processing' | 'default' }> = {
    ACTIVE: { label: 'Đang bán', color: 'green', badge: 'success' },
    DISCONTINUED: { label: 'Ngừng kinh doanh', color: 'red', badge: 'error' },
    COMING_SOON: { label: 'Sắp ra mắt', color: 'blue', badge: 'processing' },
    OUT_OF_STOCK: { label: 'Hết hàng', color: 'orange', badge: 'warning' },
};

// Filter params
export interface ComponentFilterParams {
    search?: string;
    categoryId?: string;
    productType?: ProductType;
    deviceType?: DeviceType;
    status?: ComponentStatus;
    brand?: string;
    isSerialized?: boolean;
    page?: number;
    pageSize?: number;
}

// Response từ API
export interface ComponentListResponse {
    data: Component[];
    total: number;
    page: number;
    pageSize: number;
}
