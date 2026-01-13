// ====================
// Supplier Types
// ====================

import type { ApiResponse, PaginatedResponse } from './api.types';

/**
 * DTO hiển thị danh sách nhà cung cấp
 */
export interface SupplierListDto {
    supplierID: string;
    supplierCode: string;
    supplierName: string;
    brandName?: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    city?: string;
    logoUrl?: string;
    isActive: boolean;
    createdAt: string;
}

/**
 * DTO chi tiết nhà cung cấp
 */
export interface SupplierDetailDto {
    supplierID: string;
    supplierCode: string;
    supplierName: string;
    brandName?: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    city?: string;
    taxCode?: string;
    bankAccount?: string;
    bankName?: string;
    notes?: string;
    logoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    productCount: number;
    purchaseOrderCount: number;
}

/**
 * DTO tạo mới nhà cung cấp
 */
export interface CreateSupplierDto {
    supplierCode: string;
    supplierName: string;
    brandName?: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    city?: string;
    taxCode?: string;
    bankAccount?: string;
    bankName?: string;
    notes?: string;
    logoUrl?: string;
    isActive?: boolean;
}

/**
 * DTO cập nhật nhà cung cấp
 */
export interface UpdateSupplierDto {
    supplierName?: string;
    brandName?: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    city?: string;
    taxCode?: string;
    bankAccount?: string;
    bankName?: string;
    notes?: string;
    logoUrl?: string;
    isActive?: boolean;
}

/**
 * Tham số bộ lọc danh sách nhà cung cấp
 */
export interface SupplierFilterParams {
    page?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
    city?: string;
}

/**
 * Thống kê nhà cung cấp
 */
export interface SupplierStatistics {
    totalSuppliers: number;
    activeSuppliers: number;
    inactiveSuppliers: number;
    suppliersByCity: Record<string, number>;
}

/**
 * Kết quả import suppliers từ Excel
 */
export interface ImportSupplierResult {
    success: boolean;
    message: string;
    totalProcessed: number;
    createdCount: number;
    updatedCount: number;
    skippedCount: number;
    errors: string[];
}

// Response Types
export type SupplierListResponse = PaginatedResponse<SupplierListDto>;
export type SupplierDetailResponse = ApiResponse<SupplierDetailDto>;
export type SupplierCreateResponse = ApiResponse<SupplierDetailDto>;
export type SupplierUpdateResponse = ApiResponse<SupplierDetailDto>;
export type SupplierDeleteResponse = ApiResponse<boolean>;
export type SupplierStatisticsResponse = ApiResponse<SupplierStatistics>;
export type SupplierCheckCodeResponse = ApiResponse<boolean>;
export type ImportSupplierResponse = ApiResponse<ImportSupplierResult>;
