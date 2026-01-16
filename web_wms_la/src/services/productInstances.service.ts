import apiClient from '../config/api.config';
import type {
    ProductInstanceListDto,
    ProductInstanceDetailDto,
    CreateProductInstanceDto,
    UpdateProductInstanceDto,
    UpdateProductInstanceStatusDto,
    ProductInstanceStatisticsDto,
    ProductInstanceFilterParams,
    ProductInstanceListResponse,
    ProductInstanceDetailResponse,
    ProductInstanceCreateResponse,
    ProductInstanceUpdateResponse,
    ProductInstanceDeleteResponse,
    ProductInstanceStatisticsResponse,
    ProductInstanceHistoryApiResponse,
} from '../types/type.productInstance';

const BASE_URL = '/ProductInstances';

// ====================
// CRUD Operations
// ====================

/**
 * Lấy danh sách ProductInstance có phân trang và bộ lọc
 */
export const getProductInstances = async (
    params?: ProductInstanceFilterParams
): Promise<ProductInstanceListResponse> => {
    const response = await apiClient.get<ProductInstanceListResponse>(BASE_URL, { params });
    return response.data;
};

/**
 * Lấy chi tiết ProductInstance theo ID
 */
export const getProductInstanceById = async (id: string): Promise<ProductInstanceDetailResponse> => {
    const response = await apiClient.get<ProductInstanceDetailResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Tìm ProductInstance theo Serial Number
 */
export const getProductInstanceBySerial = async (serialNumber: string): Promise<ProductInstanceDetailResponse> => {
    const response = await apiClient.get<ProductInstanceDetailResponse>(`${BASE_URL}/serial/${serialNumber}`);
    return response.data;
};

/**
 * Cập nhật ProductInstance
 */
export const updateProductInstance = async (
    id: string,
    data: UpdateProductInstanceDto
): Promise<ProductInstanceUpdateResponse> => {
    const response = await apiClient.put<ProductInstanceUpdateResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
};

/**
 * Cập nhật trạng thái ProductInstance
 */
export const updateProductInstanceStatus = async (
    id: string,
    data: UpdateProductInstanceStatusDto
): Promise<ProductInstanceUpdateResponse> => {
    const response = await apiClient.patch<ProductInstanceUpdateResponse>(`${BASE_URL}/${id}/status`, data);
    return response.data;
};

/**
 * Xóa ProductInstance (soft delete)
 */
export const deleteProductInstance = async (id: string): Promise<ProductInstanceDeleteResponse> => {
    const response = await apiClient.delete<ProductInstanceDeleteResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

// ====================
// History & Lifecycle
// ====================

/**
 * Lấy lịch sử vòng đời của ProductInstance
 */
export const getProductInstanceHistory = async (id: string): Promise<ProductInstanceHistoryApiResponse> => {
    const response = await apiClient.get<ProductInstanceHistoryApiResponse>(`${BASE_URL}/${id}/history`);
    return response.data;
};

// ====================
// Statistics
// ====================

/**
 * Lấy thống kê ProductInstance
 */
export const getProductInstanceStatistics = async (): Promise<ProductInstanceStatisticsResponse> => {
    const response = await apiClient.get<ProductInstanceStatisticsResponse>(`${BASE_URL}/statistics`);
    return response.data;
};

// ====================
// Default Export
// ====================

const productInstancesService = {
    getProductInstances,
    getProductInstanceById,
    getProductInstanceBySerial,
    updateProductInstance,
    updateProductInstanceStatus,
    deleteProductInstance,
    getProductInstanceHistory,
    getProductInstanceStatistics,
};

export default productInstancesService;
