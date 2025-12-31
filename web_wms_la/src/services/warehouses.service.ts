import apiClient from '../config/api.config';
import type {
    CreateWarehouseDto,
    UpdateWarehouseDto,
    WarehouseStockParams,
    WarehouseListResponse,
    WarehouseDetailResponse,
    WarehouseStockResponse,
    WarehouseDeleteResponse,
    WarehouseRestoreResponse,
} from '../types/type.warehouse';

const BASE_URL = '/Warehouses';

/**
 * Lấy danh sách tất cả kho
 * @param includeInactive Bao gồm kho không hoạt động
 */
export const getAllWarehouses = async (includeInactive = false): Promise<WarehouseListResponse> => {
    const response = await apiClient.get<WarehouseListResponse>(BASE_URL, {
        params: { includeInactive },
    });
    return response.data;
};

/**
 * Lấy chi tiết kho theo ID
 * @param id GUID của kho
 */
export const getWarehouseById = async (id: string): Promise<WarehouseDetailResponse> => {
    const response = await apiClient.get<WarehouseDetailResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Tạo kho mới
 * @param data DTO tạo kho
 */
export const createWarehouse = async (data: CreateWarehouseDto): Promise<WarehouseDetailResponse> => {
    const response = await apiClient.post<WarehouseDetailResponse>(BASE_URL, data);
    return response.data;
};

/**
 * Cập nhật thông tin kho
 * @param id GUID của kho
 * @param data DTO cập nhật kho
 */
export const updateWarehouse = async (id: string, data: UpdateWarehouseDto): Promise<WarehouseDetailResponse> => {
    const response = await apiClient.put<WarehouseDetailResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
};

/**
 * Xóa kho (soft delete)
 * @param id GUID của kho
 */
export const deleteWarehouse = async (id: string): Promise<WarehouseDeleteResponse> => {
    const response = await apiClient.delete<WarehouseDeleteResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Khôi phục kho đã xóa
 * @param id GUID của kho
 */
export const restoreWarehouse = async (id: string): Promise<WarehouseRestoreResponse> => {
    const response = await apiClient.post<WarehouseRestoreResponse>(`${BASE_URL}/${id}/restore`);
    return response.data;
};

/**
 * Lấy tồn kho của một kho cụ thể
 * @param id GUID của kho
 * @param params Tham số tìm kiếm, phân trang
 */
export const getWarehouseStock = async (
    id: string,
    params?: WarehouseStockParams
): Promise<WarehouseStockResponse> => {
    const response = await apiClient.get<WarehouseStockResponse>(`${BASE_URL}/${id}/stock`, {
        params,
    });
    return response.data;
};

const warehousesService = {
    getAllWarehouses,
    getWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    restoreWarehouse,
    getWarehouseStock,
};

export default warehousesService;
