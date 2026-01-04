// ====================
// Inventory Types (ProductInstance)
// ====================

import type { ApiResponse, PaginatedResponse } from './api.types';

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

/**
 * DTO hiển thị danh sách tồn kho
 */
export interface ProductInstanceListDto {
    instanceID: string;
    serialNumber: string;
    imei?: string;
    componentID: string;
    componentName: string;
    sku: string;
    warehouseID: string;
    warehouseName: string;
    status: InstanceStatus;
    purchasePrice?: number;
    warrantyEndDate?: string;
    customerID?: string;
    customerName?: string;
    createdAt: string;
}

/**
 * DTO chi tiết thiết bị
 */
export interface ProductInstanceDetailDto {
    instanceID: string;
    serialNumber: string;
    imei?: string;
    componentID: string;
    componentName: string;
    sku: string;
    warehouseID: string;
    warehouseName: string;
    status: InstanceStatus;
    purchasePrice?: number;
    sellingPrice?: number;
    warrantyStartDate?: string;
    warrantyEndDate?: string;
    purchaseOrderID?: string;
    purchaseOrderCode?: string;
    customerID?: string;
    customerName?: string;
    soldDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * DTO tạo mới thiết bị (nhập kho)
 */
export interface CreateProductInstanceDto {
    serialNumber: string;
    imei?: string;
    componentID: string;
    warehouseID: string;
    purchasePrice?: number;
    warrantyMonths?: number;
    purchaseOrderID?: string;
    notes?: string;
}

/**
 * DTO nhập hàng hàng loạt
 */
export interface BulkCreateProductInstanceDto {
    serialNumbers: string[];
    componentID: string;
    warehouseID: string;
    purchasePrice?: number;
    warrantyMonths?: number;
    purchaseOrderID?: string;
}

/**
 * DTO cập nhật thiết bị
 */
export interface UpdateProductInstanceDto {
    imei?: string;
    warehouseID?: string;
    purchasePrice?: number;
    warrantyEndDate?: string;
    notes?: string;
}

/**
 * DTO cập nhật trạng thái thiết bị
 */
export interface UpdateInstanceStatusDto {
    status: InstanceStatus;
    notes?: string;
}

/**
 * DTO bán thiết bị
 */
export interface SellInstanceDto {
    customerID: string;
    sellingPrice: number;
    soldDate?: string;
    notes?: string;
}

/**
 * DTO chuyển kho
 */
export interface TransferInstanceDto {
    targetWarehouseID: string;
    notes?: string;
}

/**
 * Tham số bộ lọc danh sách tồn kho
 */
export interface InventoryFilterParams {
    page?: number;
    pageSize?: number;
    search?: string;
    componentId?: string;
    warehouseId?: string;
    status?: InstanceStatus;
}

/**
 * Thống kê tồn kho
 */
export interface InventoryStatistics {
    totalInstances: number;
    inStockCount: number;
    soldCount: number;
    warrantyCount: number;
    repairCount: number;
    otherCount: number;
    instancesByStatus: Record<string, number>;
}

/**
 * Thống kê tồn kho theo kho (Inventory view)
 */
export interface InventoryByWarehouseDto {
    warehouseID: string;
    warehouseName: string;
    totalStock: number;
    inStockCount: number;
    soldCount: number;
}

/**
 * Kết quả nhập hàng hàng loạt
 */
export interface BulkCreateResultDto {
    successCount: number;
    failedCount: number;
    failedSerials: string[];
    createdInstances: ProductInstanceDetailDto[];
}

// Response Types
export type InventoryListResponse = PaginatedResponse<ProductInstanceListDto>;
export type InventoryDetailResponse = ApiResponse<ProductInstanceDetailDto>;
export type InventoryCreateResponse = ApiResponse<ProductInstanceDetailDto>;
export type InventoryBulkCreateResponse = ApiResponse<BulkCreateResultDto>;
export type InventoryUpdateResponse = ApiResponse<ProductInstanceDetailDto>;
export type InventoryDeleteResponse = ApiResponse<boolean>;
export type InventoryStatisticsResponse = ApiResponse<InventoryStatistics>;
export type InventoryByWarehouseResponse = ApiResponse<InventoryByWarehouseDto[]>;
export type InventoryCheckSerialResponse = ApiResponse<boolean>;
