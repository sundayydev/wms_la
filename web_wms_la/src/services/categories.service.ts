import apiClient from '../config/api.config';
import type {
    CreateCategoryDto,
    UpdateCategoryDto,
    CategoryListResponse,
    CategoryDetailResponse,
    CategoryDeleteResponse,
    CategoryRestoreResponse,
    CategoryStatisticsResponse,
    CheckNameExistsResponse,
} from '../types/type.category';

const BASE_URL = '/Categories';

/**
 * Lấy danh sách tất cả danh mục
 * @param includeDeleted Bao gồm danh mục đã xóa
 */
export const getAllCategories = async (includeDeleted = false): Promise<CategoryListResponse> => {
    const response = await apiClient.get<CategoryListResponse>(BASE_URL, {
        params: { includeDeleted },
    });
    return response.data;
};

/**
 * Lấy chi tiết danh mục theo ID
 * @param id GUID của danh mục
 */
export const getCategoryById = async (id: string): Promise<CategoryDetailResponse> => {
    const response = await apiClient.get<CategoryDetailResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Tạo danh mục mới
 * @param data DTO tạo danh mục
 */
export const createCategory = async (data: CreateCategoryDto): Promise<CategoryDetailResponse> => {
    const response = await apiClient.post<CategoryDetailResponse>(BASE_URL, data);
    return response.data;
};

/**
 * Cập nhật thông tin danh mục
 * @param id GUID của danh mục
 * @param data DTO cập nhật danh mục
 */
export const updateCategory = async (id: string, data: UpdateCategoryDto): Promise<CategoryDetailResponse> => {
    const response = await apiClient.put<CategoryDetailResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
};

/**
 * Xóa danh mục (soft delete)
 * @param id GUID của danh mục
 */
export const deleteCategory = async (id: string): Promise<CategoryDeleteResponse> => {
    const response = await apiClient.delete<CategoryDeleteResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Khôi phục danh mục đã xóa
 * @param id GUID của danh mục
 */
export const restoreCategory = async (id: string): Promise<CategoryRestoreResponse> => {
    const response = await apiClient.post<CategoryRestoreResponse>(`${BASE_URL}/${id}/restore`);
    return response.data;
};

/**
 * Lấy thống kê danh mục
 */
export const getCategoryStatistics = async (): Promise<CategoryStatisticsResponse> => {
    const response = await apiClient.get<CategoryStatisticsResponse>(`${BASE_URL}/statistics`);
    return response.data;
};

/**
 * Kiểm tra tên danh mục đã tồn tại
 * @param name Tên danh mục cần kiểm tra
 * @param excludeId ID danh mục cần loại trừ (khi cập nhật)
 */
export const checkNameExists = async (name: string, excludeId?: string): Promise<CheckNameExistsResponse> => {
    const response = await apiClient.get<CheckNameExistsResponse>(`${BASE_URL}/check-name`, {
        params: { name, excludeId },
    });
    return response.data;
};

const categoriesService = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
    getCategoryStatistics,
    checkNameExists,
};

export default categoriesService;
