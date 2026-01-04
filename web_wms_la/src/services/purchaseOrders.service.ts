import apiClient from '../config/api.config';
import type {
    PurchaseOrderListDto,
    PurchaseOrderDetailDto,
    CreatePurchaseOrderDto,
    UpdatePurchaseOrderDto,
    UpdatePurchaseOrderStatusDto,
    PurchaseOrderFilterParams,
    PurchaseOrderListResponse,
    PurchaseOrderDetailResponse,
    PurchaseOrderCreateResponse,
    PurchaseOrderUpdateResponse,
    PurchaseOrderDeleteResponse,
    PurchaseOrderStatisticsResponse,
} from '../types/type.purchaseOrder';
import type { ApiResponse } from '../types/api.types';

const BASE_URL = '/PurchaseOrders';

// ====================
// CRUD Operations
// ====================

/**
 * Lấy danh sách đơn mua hàng có phân trang và bộ lọc
 */
export const getPurchaseOrders = async (params?: PurchaseOrderFilterParams): Promise<PurchaseOrderListResponse> => {
    const response = await apiClient.get<PurchaseOrderListResponse>(BASE_URL, { params });
    return response.data;
};

/**
 * Lấy chi tiết đơn mua hàng theo ID
 */
export const getPurchaseOrderById = async (id: string): Promise<PurchaseOrderDetailResponse> => {
    const response = await apiClient.get<PurchaseOrderDetailResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Tìm đơn mua hàng theo mã
 */
export const getPurchaseOrderByCode = async (code: string): Promise<PurchaseOrderDetailResponse> => {
    const response = await apiClient.get<PurchaseOrderDetailResponse>(`${BASE_URL}/code/${code}`);
    return response.data;
};

/**
 * Tạo đơn mua hàng mới
 */
export const createPurchaseOrder = async (data: CreatePurchaseOrderDto): Promise<PurchaseOrderCreateResponse> => {
    const response = await apiClient.post<PurchaseOrderCreateResponse>(BASE_URL, data);
    return response.data;
};

/**
 * Cập nhật đơn mua hàng (chỉ khi trạng thái PENDING)
 */
export const updatePurchaseOrder = async (
    id: string,
    data: UpdatePurchaseOrderDto
): Promise<PurchaseOrderUpdateResponse> => {
    const response = await apiClient.put<PurchaseOrderUpdateResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
};

/**
 * Xóa đơn mua hàng (chỉ khi trạng thái PENDING hoặc CANCELLED)
 */
export const deletePurchaseOrder = async (id: string): Promise<PurchaseOrderDeleteResponse> => {
    const response = await apiClient.delete<PurchaseOrderDeleteResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

// ====================
// Status Management
// ====================

/**
 * Cập nhật trạng thái đơn mua hàng
 * @param id ID đơn mua hàng
 * @param data Dữ liệu trạng thái mới
 */
export const updatePurchaseOrderStatus = async (
    id: string,
    data: UpdatePurchaseOrderStatusDto
): Promise<PurchaseOrderUpdateResponse> => {
    const response = await apiClient.patch<PurchaseOrderUpdateResponse>(`${BASE_URL}/${id}/status`, data);
    return response.data;
};

/**
 * Xác nhận đơn mua hàng (chuyển từ PENDING sang CONFIRMED)
 */
export const confirmPurchaseOrder = async (id: string): Promise<PurchaseOrderUpdateResponse> => {
    const response = await apiClient.post<PurchaseOrderUpdateResponse>(`${BASE_URL}/${id}/confirm`);
    return response.data;
};

/**
 * Hủy đơn mua hàng
 * @param id ID đơn mua hàng
 * @param reason Lý do hủy (tùy chọn)
 */
export const cancelPurchaseOrder = async (id: string, reason?: string): Promise<PurchaseOrderUpdateResponse> => {
    const response = await apiClient.post<PurchaseOrderUpdateResponse>(`${BASE_URL}/${id}/cancel`, reason || null);
    return response.data;
};

/**
 * Đánh dấu đã giao hàng
 * @param id ID đơn mua hàng
 * @param deliveryDate Ngày giao hàng thực tế (mặc định: ngày hiện tại)
 */
export const markAsDelivered = async (id: string, deliveryDate?: string): Promise<PurchaseOrderUpdateResponse> => {
    const response = await apiClient.post<PurchaseOrderUpdateResponse>(`${BASE_URL}/${id}/deliver`, null, {
        params: { deliveryDate },
    });
    return response.data;
};

// ====================
// Statistics
// ====================

/**
 * Lấy thống kê đơn mua hàng
 */
export const getPurchaseOrderStatistics = async (): Promise<PurchaseOrderStatisticsResponse> => {
    const response = await apiClient.get<PurchaseOrderStatisticsResponse>(`${BASE_URL}/statistics`);
    return response.data;
};

// Default export
const purchaseOrdersService = {
    getPurchaseOrders,
    getPurchaseOrderById,
    getPurchaseOrderByCode,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    updatePurchaseOrderStatus,
    confirmPurchaseOrder,
    cancelPurchaseOrder,
    markAsDelivered,
    getPurchaseOrderStatistics,
};

export default purchaseOrdersService;
