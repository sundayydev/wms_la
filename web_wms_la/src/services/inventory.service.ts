import apiClient from '../config/api.config';
import type {
    ProductInstanceDetailDto,
    CreateProductInstanceDto,
    BulkCreateProductInstanceDto,
    UpdateProductInstanceDto,
    UpdateInstanceStatusDto,
    SellInstanceDto,
    TransferInstanceDto,
    InventoryFilterParams,
    InventoryListResponse,
    InventoryDetailResponse,
    InventoryCreateResponse,
    InventoryBulkCreateResponse,
    InventoryUpdateResponse,
    InventoryDeleteResponse,
    InventoryStatisticsResponse,
    InventoryByWarehouseResponse,
    InventoryCheckSerialResponse,
} from '../types/type.inventory';
import type { ApiResponse } from '../types/api.types';

const BASE_URL = '/Inventory';

// ====================
// CRUD Operations
// ====================

/**
 * Lấy danh sách tồn kho có phân trang và bộ lọc
 */
export const getInventory = async (params?: InventoryFilterParams): Promise<InventoryListResponse> => {
    const response = await apiClient.get<InventoryListResponse>(BASE_URL, { params });
    return response.data;
};

/**
 * Lấy chi tiết thiết bị theo ID
 */
export const getInventoryById = async (id: string): Promise<InventoryDetailResponse> => {
    const response = await apiClient.get<InventoryDetailResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Tìm thiết bị theo Serial Number
 */
export const getInventoryBySerial = async (serial: string): Promise<InventoryDetailResponse> => {
    const response = await apiClient.get<InventoryDetailResponse>(`${BASE_URL}/serial/${serial}`);
    return response.data;
};

/**
 * Nhập hàng mới (tạo ProductInstance)
 */
export const createInventory = async (data: CreateProductInstanceDto): Promise<InventoryCreateResponse> => {
    const response = await apiClient.post<InventoryCreateResponse>(BASE_URL, data);
    return response.data;
};

/**
 * Nhập hàng hàng loạt (bulk import)
 */
export const bulkCreateInventory = async (data: BulkCreateProductInstanceDto): Promise<InventoryBulkCreateResponse> => {
    const response = await apiClient.post<InventoryBulkCreateResponse>(`${BASE_URL}/bulk`, data);
    return response.data;
};

/**
 * Cập nhật thông tin thiết bị
 */
export const updateInventory = async (id: string, data: UpdateProductInstanceDto): Promise<InventoryUpdateResponse> => {
    const response = await apiClient.put<InventoryUpdateResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
};

/**
 * Xóa thiết bị (soft delete)
 */
export const deleteInventory = async (id: string): Promise<InventoryDeleteResponse> => {
    const response = await apiClient.delete<InventoryDeleteResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

// ====================
// Status & Actions
// ====================

/**
 * Cập nhật trạng thái thiết bị
 * @param id ID thiết bị
 * @param data Dữ liệu trạng thái mới
 */
export const updateInventoryStatus = async (
    id: string,
    data: UpdateInstanceStatusDto
): Promise<InventoryUpdateResponse> => {
    const response = await apiClient.patch<InventoryUpdateResponse>(`${BASE_URL}/${id}/status`, data);
    return response.data;
};

/**
 * Bán thiết bị (chuyển sở hữu cho khách hàng)
 */
export const sellInventory = async (id: string, data: SellInstanceDto): Promise<InventoryUpdateResponse> => {
    const response = await apiClient.post<InventoryUpdateResponse>(`${BASE_URL}/${id}/sell`, data);
    return response.data;
};

/**
 * Chuyển kho thiết bị
 */
export const transferInventory = async (id: string, data: TransferInstanceDto): Promise<InventoryUpdateResponse> => {
    const response = await apiClient.post<InventoryUpdateResponse>(`${BASE_URL}/${id}/transfer`, data);
    return response.data;
};

// ====================
// Statistics & Validation
// ====================

/**
 * Lấy thống kê tồn kho
 */
export const getInventoryStatistics = async (): Promise<InventoryStatisticsResponse> => {
    const response = await apiClient.get<InventoryStatisticsResponse>(`${BASE_URL}/statistics`);
    return response.data;
};

/**
 * Lấy thống kê tồn kho theo kho
 */
export const getStockByWarehouse = async (): Promise<InventoryByWarehouseResponse> => {
    const response = await apiClient.get<InventoryByWarehouseResponse>(`${BASE_URL}/by-warehouse`);
    return response.data;
};

/**
 * Kiểm tra Serial Number đã tồn tại
 * @param serial Serial Number cần kiểm tra
 * @param excludeId ID cần loại trừ (dùng khi update)
 * @returns true nếu serial đã tồn tại, false nếu chưa
 */
export const checkSerialExists = async (
    serial: string,
    excludeId?: string
): Promise<InventoryCheckSerialResponse> => {
    const response = await apiClient.get<InventoryCheckSerialResponse>(`${BASE_URL}/check-serial`, {
        params: { serial, excludeId },
    });
    return response.data;
};

// Default export
const inventoryService = {
    getInventory,
    getInventoryById,
    getInventoryBySerial,
    createInventory,
    bulkCreateInventory,
    updateInventory,
    deleteInventory,
    updateInventoryStatus,
    sellInventory,
    transferInventory,
    getInventoryStatistics,
    getStockByWarehouse,
    checkSerialExists,
};

export default inventoryService;
