import type { ApiResponse } from './api.types';

// ============================================================================
// DTOs
// ============================================================================

/**
 * DTO tạo mới danh mục
 */
export interface CreateCategoryDto {
    categoryName: string;
}

/**
 * DTO cập nhật danh mục
 */
export interface UpdateCategoryDto {
    categoryName: string;
}

/**
 * DTO hiển thị danh sách danh mục
 */
export interface CategoryListDto {
    categoryID: string;
    categoryName: string;
    componentCount: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

/**
 * DTO chi tiết danh mục
 */
export interface CategoryDetailDto {
    categoryID: string;
    categoryName: string;
    componentCount: number;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;
}

/**
 * Thống kê danh mục
 */
export interface CategoryStatistics {
    totalCategories: number;
    activeCategories: number;
    deletedCategories: number;
    totalComponents: number;
    categoriesWithMostComponents: CategoryListDto[];
}

// ============================================================================
// API Responses
// ============================================================================

export type CategoryListResponse = ApiResponse<CategoryListDto[]>;
export type CategoryDetailResponse = ApiResponse<CategoryDetailDto>;
export type CategoryDeleteResponse = ApiResponse<boolean>;
export type CategoryRestoreResponse = ApiResponse<boolean>;
export type CategoryStatisticsResponse = ApiResponse<CategoryStatistics>;
export type CheckNameExistsResponse = ApiResponse<boolean>;
