// ====================
// Inventory Types (ProductInstance)
// ====================
// ⚠️ DEPRECATED: This file is deprecated and kept for backward compatibility only.
// Please use ../types/type.productInstance.ts for new code.
// This file re-exports everything from type.productInstance.ts
// ====================

/**
 * @deprecated Import from type.productInstance.ts instead
 */
export * from './type.productInstance';

// Legacy types for backward compatibility (if needed)
import type { ApiResponse } from './api.types';

/**
 * @deprecated Use ProductInstanceFilterParams from type.productInstance.ts
 */
export interface InventoryFilterParams {
    page?: number;
    pageSize?: number;
    search?: string;
    componentId?: string;
    warehouseId?: string;
    status?: string;
}

/**
 * @deprecated Use ProductInstanceStatisticsDto from type.productInstance.ts
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
 * @deprecated No longer used
 */
export interface InventoryByWarehouseDto {
    warehouseID: string;
    warehouseName: string;
    totalStock: number;
    inStockCount: number;
    soldCount: number;
}

/**
 * @deprecated No longer used
 */
export interface BulkCreateResultDto {
    successCount: number;
    failedCount: number;
    failedSerials: string[];
    createdInstances: any[];
}

/**
 * @deprecated No longer used
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
 * @deprecated No longer used
 */
export interface SellInstanceDto {
    customerID: string;
    sellingPrice: number;
    soldDate?: string;
    notes?: string;
}

/**
 * @deprecated No longer used
 */
export interface TransferInstanceDto {
    targetWarehouseID: string;
    notes?: string;
}

/**
 * @deprecated No longer used
 */
export interface UpdateInstanceStatusDto {
    status: string;
    notes?: string;
}

// Response Types - re-export from new types
import type {
    ProductInstanceListResponse,
    ProductInstanceDetailResponse,
    ProductInstanceDeleteResponse,
    ProductInstanceStatisticsResponse,
} from './type.productInstance';

/**
 * @deprecated Use ProductInstanceListResponse
 */
export type InventoryListResponse = ProductInstanceListResponse;

/**
 * @deprecated Use ProductInstanceDetailResponse
 */
export type InventoryDetailResponse = ProductInstanceDetailResponse;

/**
 * @deprecated Use ProductInstanceDetailResponse
 */
export type InventoryCreateResponse = ProductInstanceDetailResponse;

/**
 * @deprecated Use ProductInstanceDetailResponse
 */
export type InventoryBulkCreateResponse = ApiResponse<BulkCreateResultDto>;

/**
 * @deprecated Use ProductInstanceDetailResponse
 */
export type InventoryUpdateResponse = ProductInstanceDetailResponse;

/**
 * @deprecated Use ProductInstanceDeleteResponse
 */
export type InventoryDeleteResponse = ProductInstanceDeleteResponse;

/**
 * @deprecated Use ProductInstanceStatisticsResponse
 */
export type InventoryStatisticsResponse = ApiResponse<InventoryStatistics>;

/**
 * @deprecated No longer used
 */
export type InventoryByWarehouseResponse = ApiResponse<InventoryByWarehouseDto[]>;

/**
 * @deprecated No longer used
 */
export type InventoryCheckSerialResponse = ApiResponse<boolean>;
