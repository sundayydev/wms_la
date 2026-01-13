import apiClient from '../config/api.config';
import type {
    SupplierListDto,
    CreateSupplierDto,
    UpdateSupplierDto,
    SupplierFilterParams,
    SupplierListResponse,
    SupplierDetailResponse,
    SupplierCreateResponse,
    SupplierUpdateResponse,
    SupplierDeleteResponse,
    SupplierStatisticsResponse,
    SupplierCheckCodeResponse,
    ImportSupplierResponse,
} from '../types/type.supplier';
import type { ApiResponse } from '../types/api.types';

const BASE_URL = '/Suppliers';

// ====================
// CRUD Operations
// ====================

/**
 * Lấy danh sách nhà cung cấp có phân trang và bộ lọc
 */
export const getSuppliers = async (params?: SupplierFilterParams): Promise<SupplierListResponse> => {
    const response = await apiClient.get<SupplierListResponse>(BASE_URL, { params });
    return response.data;
};

/**
 * Lấy danh sách nhà cung cấp cho dropdown (chỉ nhà cung cấp đang hoạt động)
 */
export const getSuppliersForSelect = async (): Promise<ApiResponse<SupplierListDto[]>> => {
    const response = await apiClient.get<ApiResponse<SupplierListDto[]>>(`${BASE_URL}/select`);
    return response.data;
};

/**
 * Lấy chi tiết nhà cung cấp theo ID
 */
export const getSupplierById = async (id: string): Promise<SupplierDetailResponse> => {
    const response = await apiClient.get<SupplierDetailResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Tìm nhà cung cấp theo mã
 */
export const getSupplierByCode = async (code: string): Promise<SupplierDetailResponse> => {
    const response = await apiClient.get<SupplierDetailResponse>(`${BASE_URL}/code/${code}`);
    return response.data;
};

/**
 * Tạo nhà cung cấp mới
 */
export const createSupplier = async (data: CreateSupplierDto): Promise<SupplierCreateResponse> => {
    const response = await apiClient.post<SupplierCreateResponse>(BASE_URL, data);
    return response.data;
};

/**
 * Cập nhật nhà cung cấp
 */
export const updateSupplier = async (id: string, data: UpdateSupplierDto): Promise<SupplierUpdateResponse> => {
    const response = await apiClient.put<SupplierUpdateResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
};

/**
 * Xóa nhà cung cấp (soft delete)
 */
export const deleteSupplier = async (id: string): Promise<SupplierDeleteResponse> => {
    const response = await apiClient.delete<SupplierDeleteResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

// ====================
// Status Management
// ====================

/**
 * Kích hoạt/vô hiệu hóa nhà cung cấp
 */
export const toggleSupplierStatus = async (id: string, isActive: boolean): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.patch<ApiResponse<boolean>>(`${BASE_URL}/${id}/status`, null, {
        params: { isActive },
    });
    return response.data;
};

// ====================
// Statistics & Validation
// ====================

/**
 * Lấy thống kê nhà cung cấp
 */
export const getSupplierStatistics = async (): Promise<SupplierStatisticsResponse> => {
    const response = await apiClient.get<SupplierStatisticsResponse>(`${BASE_URL}/statistics`);
    return response.data;
};

/**
 * Kiểm tra mã nhà cung cấp đã tồn tại
 * @param code Mã nhà cung cấp cần kiểm tra
 * @param excludeId ID cần loại trừ (dùng khi update)
 * @returns true nếu mã đã tồn tại, false nếu chưa
 */
export const checkSupplierCodeExists = async (
    code: string,
    excludeId?: string
): Promise<SupplierCheckCodeResponse> => {
    const response = await apiClient.get<SupplierCheckCodeResponse>(`${BASE_URL}/check-code`, {
        params: { code, excludeId },
    });
    return response.data;
};

/**
 * Export danh sách nhà cung cấp ra Excel
 */
export const exportSuppliersToExcel = async (params?: SupplierFilterParams): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_URL}/export-excel`, {
        params,
        responseType: 'blob', // Important: Tell axios to expect binary data
    });
    return response.data;
};

/**
 * Import nhà cung cấp từ file Excel  
 * @param file File Excel (.xlsx)
 */
export const importSuppliersFromExcel = async (file: File): Promise<ImportSupplierResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ImportSupplierResponse>(`${BASE_URL}/import-excel`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Default export
const suppliersService = {
    getSuppliers,
    getSuppliersForSelect,
    getSupplierById,
    getSupplierByCode,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleSupplierStatus,
    getSupplierStatistics,
    checkSupplierCodeExists,
    exportSuppliersToExcel,
    importSuppliersFromExcel,
};

export default suppliersService;
