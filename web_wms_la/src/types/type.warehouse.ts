import type { ApiResponse, PaginatedResponse } from './api.types';

export interface WarehouseListDto {
    warehouseID: string;
    warehouseName: string;
    address?: string;
    phoneNumber?: string;
    managerUserID?: string;
    managerName?: string;
    isActive: boolean;
    totalUsers: number;
    totalProducts: number;
    createdAt: string;
    updatedAt: string;
}

export interface WarehouseUserDto {
    userID: string;
    username: string;
    fullName: string;
    role: string;
    isActive: boolean;
}

export interface WarehouseStockSummaryDto {
    totalSKUs: number;
    totalProducts: number;
    totalQuantity: number;
    totalAvailable: number;
    totalReserved: number;
}

export interface WarehouseDetailDto {
    warehouseID: string;
    warehouseName: string;
    address?: string;
    phoneNumber?: string;
    managerUserID?: string;
    managerName?: string;
    managerUsername?: string;
    isActive: boolean;
    users: WarehouseUserDto[];
    stockSummary: WarehouseStockSummaryDto;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWarehouseDto {
    warehouseName: string;
    address?: string;
    phoneNumber?: string;
    managerUserID?: string;
}

export interface UpdateWarehouseDto {
    warehouseName: string;
    address?: string;
    phoneNumber?: string;
    managerUserID?: string;
    isActive: boolean;
}

export interface WarehouseStockDto {
    stockID: string;
    warehouseID: string;
    warehouseName: string;
    componentID: string;
    sku: string;
    componentName: string;
    variantID?: string;
    partNumber?: string;
    variantName?: string;
    quantityOnHand: number;
    quantityReserved: number;
    quantityAvailable: number;
    defaultLocationCode?: string;
    lastStockUpdate: string;
    lastCountDate?: string;
}

export interface WarehouseStockParams {
    searchTerm?: string;
    lowStock?: boolean;
    minQuantity?: number;
    pageNumber?: number;
    pageSize?: number;
}

// Response Types
export type WarehouseListResponse = ApiResponse<WarehouseListDto[]>;
export type WarehouseDetailResponse = ApiResponse<WarehouseDetailDto>;
export type WarehouseStockResponse = ApiResponse<WarehouseStockDto[]>; // Note: Backend returns List, not PaginatedResponse in the controller but uses Paging in Service. I should follow the controller's return type.
export type WarehouseDeleteResponse = ApiResponse<boolean>;
export type WarehouseRestoreResponse = ApiResponse<boolean>;
