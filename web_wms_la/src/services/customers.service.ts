import apiClient from '../config/api.config';
import type {
    CustomerListDto,
    CreateCustomerDto,
    UpdateCustomerDto,
    CustomerFilterParams,
    CustomerListResponse,
    CustomerDetailResponse,
    CustomerCreateResponse,
    CustomerUpdateResponse,
    CustomerDeleteResponse,
    CustomerStatisticsResponse,
    CustomerCheckCodeResponse,
} from '../types/type.customer';
import type { ApiResponse } from '../types/api.types';

const BASE_URL = '/Customers';

// ====================
// CRUD Operations
// ====================

/**
 * Lấy danh sách khách hàng có phân trang và bộ lọc
 */
export const getCustomers = async (params?: CustomerFilterParams): Promise<CustomerListResponse> => {
    const response = await apiClient.get<CustomerListResponse>(BASE_URL, { params });
    return response.data;
};

/**
 * Lấy danh sách khách hàng cho dropdown (chỉ khách hàng đang hoạt động)
 */
export const getCustomersForSelect = async (): Promise<ApiResponse<CustomerListDto[]>> => {
    const response = await apiClient.get<ApiResponse<CustomerListDto[]>>(`${BASE_URL}/select`);
    return response.data;
};

/**
 * Lấy chi tiết khách hàng theo ID
 */
export const getCustomerById = async (id: string): Promise<CustomerDetailResponse> => {
    const response = await apiClient.get<CustomerDetailResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Tìm khách hàng theo mã
 */
export const getCustomerByCode = async (code: string): Promise<CustomerDetailResponse> => {
    const response = await apiClient.get<CustomerDetailResponse>(`${BASE_URL}/code/${code}`);
    return response.data;
};

/**
 * Tạo khách hàng mới
 */
export const createCustomer = async (data: CreateCustomerDto): Promise<CustomerCreateResponse> => {
    const response = await apiClient.post<CustomerCreateResponse>(BASE_URL, data);
    return response.data;
};

/**
 * Cập nhật khách hàng
 */
export const updateCustomer = async (id: string, data: UpdateCustomerDto): Promise<CustomerUpdateResponse> => {
    const response = await apiClient.put<CustomerUpdateResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
};

/**
 * Xóa khách hàng (soft delete)
 */
export const deleteCustomer = async (id: string): Promise<CustomerDeleteResponse> => {
    const response = await apiClient.delete<CustomerDeleteResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

// ====================
// Status Management
// ====================

/**
 * Kích hoạt/vô hiệu hóa khách hàng
 */
export const toggleCustomerStatus = async (id: string, isActive: boolean): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.patch<ApiResponse<boolean>>(`${BASE_URL}/${id}/status`, null, {
        params: { isActive },
    });
    return response.data;
};

// ====================
// Statistics & Validation
// ====================

/**
 * Lấy thống kê khách hàng
 */
export const getCustomerStatistics = async (): Promise<CustomerStatisticsResponse> => {
    const response = await apiClient.get<CustomerStatisticsResponse>(`${BASE_URL}/statistics`);
    return response.data;
};

/**
 * Kiểm tra mã khách hàng đã tồn tại
 * @param code Mã khách hàng cần kiểm tra
 * @param excludeId ID cần loại trừ (dùng khi update)
 * @returns true nếu mã đã tồn tại, false nếu chưa
 */
export const checkCustomerCodeExists = async (
    code: string,
    excludeId?: string
): Promise<CustomerCheckCodeResponse> => {
    const response = await apiClient.get<CustomerCheckCodeResponse>(`${BASE_URL}/check-code`, {
        params: { code, excludeId },
    });
    return response.data;
};

// Default export
const customersService = {
    getCustomers,
    getCustomersForSelect,
    getCustomerById,
    getCustomerByCode,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    toggleCustomerStatus,
    getCustomerStatistics,
    checkCustomerCodeExists,
};

export default customersService;
