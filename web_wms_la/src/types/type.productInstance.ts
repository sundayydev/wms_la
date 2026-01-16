// ====================
// ProductInstance Types
// Map 1-1 với DTOs trong BE_WMS_LA.Shared.DTOs.ProductInstance
// ====================

import type { ApiResponse } from './api.types';

export type InstanceStatus =
    | 'IN_STOCK'
    | 'SOLD'
    | 'WARRANTY'
    | 'REPAIR'
    | 'BROKEN'
    | 'TRANSFERRING'
    | 'DEMO'
    | 'SCRAPPED'
    | 'LOST';

export type OwnerType = 'COMPANY' | 'CUSTOMER' | 'SUPPLIER' | 'DEMO_PARTNER';

// ====================
// List & Detail DTOs
// ====================

/**
 * ProductInstanceListDto - Hiển thị trong bảng danh sách
 */
export interface ProductInstanceListDto {
    instanceID: string;
    serialNumber: string;

    // Component info
    componentID: string;
    componentSKU: string;
    componentName: string;
    imageURL?: string;

    // Variant info
    variantID?: string;
    partNumber?: string;
    variantName?: string;

    // Warehouse info
    warehouseID?: string;
    warehouseName?: string;
    locationCode?: string;
    zone?: string;

    // Status & Owner
    status: InstanceStatus;
    currentOwnerType: OwnerType;

    // IMEI & MAC
    imei1?: string;
    imei2?: string;
    macAddress?: string;

    // Price & Dates
    actualImportPrice?: number;
    actualSellPrice?: number;
    importDate: string;
    soldDate?: string;

    // Warranty
    warrantyStartDate?: string;
    warrantyEndDate?: string;
    warrantyMonths: number;

    // Repair info
    totalRepairCount: number;
    lastRepairDate?: string;

    createdAt: string;
}

/**
 * ProductInstanceDetailDto - Chi tiết một ProductInstance
 */
export interface ProductInstanceDetailDto {
    instanceID: string;
    serialNumber: string;
    modelNumber?: string;
    inboundBoxNumber?: string;

    // Component info
    componentID: string;
    componentSKU: string;
    componentName: string;
    componentDescription?: string;
    imageURL?: string;
    isSerialized: boolean;

    // Variant info
    variantID?: string;
    partNumber?: string;
    variantName?: string;
    variantDescription?: string;

    // Warehouse info
    warehouseID?: string;
    warehouseName?: string;
    locationCode?: string;
    zone?: string;

    // Status & Owner
    status: InstanceStatus;
    currentOwnerType: OwnerType;
    currentOwnerID?: string;

    // IMEI & MAC
    imei1?: string;
    imei2?: string;
    macAddress?: string;

    // Warranty
    warrantyStartDate?: string;
    warrantyEndDate?: string;
    warrantyMonths: number;
    isUnderWarranty: boolean;
    warrantyDaysRemaining?: number;

    // Repair info
    totalRepairCount: number;
    lastRepairDate?: string;

    // Price
    actualImportPrice?: number;
    actualSellPrice?: number;
    profitAmount?: number;

    // Dates
    importDate: string;
    soldDate?: string;
    soldToCustomerID?: string;
    soldToCustomerName?: string;

    // Notes
    notes?: string;

    // Audit
    createdAt: string;
    updatedAt: string;
}

// ====================
// Create & Update DTOs
// ====================

/**
 * CreateProductInstanceDto - Tạo mới ProductInstance
 */
export interface CreateProductInstanceDto {
    componentID: string;
    variantID?: string;
    warehouseID: string;
    serialNumber: string;
    modelNumber?: string;
    inboundBoxNumber?: string;
    imei1?: string;
    imei2?: string;
    macAddress?: string;
    locationCode?: string;
    zone?: string;
    actualImportPrice?: number;
    warrantyStartDate?: string;
    warrantyMonths?: number;
    notes?: string;
}

/**
 * UpdateProductInstanceDto - Cập nhật ProductInstance
 */
export interface UpdateProductInstanceDto {
    warehouseID?: string;
    locationCode?: string;
    zone?: string;
    status?: InstanceStatus;
    actualImportPrice?: number;
    actualSellPrice?: number;
    notes?: string;
}

/**
 * UpdateProductInstanceStatusDto - Chuyển trạng thái
 */
export interface UpdateProductInstanceStatusDto {
    status: InstanceStatus;
    notes?: string;
}

// ====================
// Statistics
// ====================

/**
 * ProductInstanceStatisticsDto - Thống kê ProductInstance
 */
export interface ProductInstanceStatisticsDto {
    totalInstances: number;
    inStock: number;
    sold: number;
    underWarranty: number;
    inRepair: number;
    broken: number;
    totalInventoryValue: number;
    totalSoldValue: number;
    totalProfit: number;
}

// ====================
// Query Parameters
// ====================

/**
 * Tham số lọc danh sách ProductInstance
 */
export interface ProductInstanceFilterParams {
    page?: number;
    pageSize?: number;
    search?: string;
    componentId?: string;
    warehouseId?: string;
    status?: InstanceStatus;
}

// ====================
// History & Lifecycle
// ====================

/**
 * Loại sự kiện trong vòng đời ProductInstance
 */
export const ProductInstanceEventType = {
    // Nhập kho
    IMPORTED: 'IMPORTED',
    RECEIVED_FROM_PO: 'RECEIVED_FROM_PO',

    // Xuất kho
    SOLD: 'SOLD',
    EXPORTED: 'EXPORTED',

    // Chuyển kho
    TRANSFER_OUT: 'TRANSFER_OUT',
    TRANSFER_IN: 'TRANSFER_IN',

    // Sửa chữa / Bảo hành
    REPAIR_STARTED: 'REPAIR_STARTED',
    REPAIR_COMPLETED: 'REPAIR_COMPLETED',
    WARRANTY_CLAIMED: 'WARRANTY_CLAIMED',
    WARRANTY_COMPLETED: 'WARRANTY_COMPLETED',

    // Thay đổi trạng thái
    STATUS_CHANGED: 'STATUS_CHANGED',
    LOCATION_CHANGED: 'LOCATION_CHANGED',

    // Kiểm tra chất lượng
    QC_PASSED: 'QC_PASSED',
    QC_FAILED: 'QC_FAILED',

    // Khác
    CREATED: 'CREATED',
    UPDATED: 'UPDATED',
    RETURNED: 'RETURNED',
} as const;

export type ProductInstanceEventTypeValue = typeof ProductInstanceEventType[keyof typeof ProductInstanceEventType];

/**
 * Một sự kiện trong vòng đời của ProductInstance
 */
export interface ProductInstanceLifecycleEvent {
    eventID: string;
    eventType: string;
    eventDate: string;
    title: string;
    description?: string;

    // Thay đổi trạng thái
    oldStatus?: string;
    newStatus?: string;

    // Thay đổi kho
    oldWarehouseID?: string;
    oldWarehouseName?: string;
    newWarehouseID?: string;
    newWarehouseName?: string;

    // Người thực hiện
    performedByUserID?: string;
    performedByUserName?: string;

    // Tham chiếu
    referenceCode?: string;
    referenceType?: string;
    referenceID?: string;

    // Metadata (JSON string)
    metadata?: string;

    // UI hints
    iconType: string;
    colorType: string;
}

/**
 * Response lịch sử vòng đời ProductInstance
 */
export interface ProductInstanceHistoryResponse {
    instanceID: string;
    serialNumber: string;
    componentName: string;
    currentStatus: string;
    events: ProductInstanceLifecycleEvent[];
    totalEvents: number;
    createdAt: string;
}

// ====================
// Response Types
// ====================

export type ProductInstanceListResponse = ApiResponse<ProductInstanceListDto[]>;
export type ProductInstanceDetailResponse = ApiResponse<ProductInstanceDetailDto>;
export type ProductInstanceCreateResponse = ApiResponse<ProductInstanceDetailDto>;
export type ProductInstanceUpdateResponse = ApiResponse<ProductInstanceDetailDto>;
export type ProductInstanceDeleteResponse = ApiResponse<boolean>;
export type ProductInstanceStatisticsResponse = ApiResponse<ProductInstanceStatisticsDto>;
export type ProductInstanceHistoryApiResponse = ApiResponse<ProductInstanceHistoryResponse>;
