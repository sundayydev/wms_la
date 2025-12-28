import apiClient, { handleApiError, type ApiResponse, type PaginatedResponse } from '../config/api.config';
import type {
    UserListDto,
    UserDetailDto,
    CreateUserDto,
    UpdateUserDto,
    AssignPermissionsDto,
    ResetPasswordRequest,
    UserStatistics,
} from '../types/api.types';

// ====================
// Users Service
// ====================

const USERS_ENDPOINTS = {
    BASE: '/Users',
    BY_ID: (id: string) => `/Users/${id}`,
    LOCK: (id: string) => `/Users/${id}/lock`,
    RESET_PASSWORD: (id: string) => `/Users/${id}/reset-password`,
    PERMISSIONS: (id: string) => `/Users/${id}/permissions`,
    PERMISSIONS_ALL: (id: string) => `/Users/${id}/permissions/all`,
    STATISTICS: '/Users/statistics',
};

// ====================
// Query Parameters
// ====================

export interface GetUsersParams {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
}

// ====================
// CRUD Operations
// ====================

/**
 * Lấy danh sách người dùng
 */
export const getUsers = async (params?: GetUsersParams): Promise<PaginatedResponse<UserListDto>> => {
    try {
        const response = await apiClient.get<PaginatedResponse<UserListDto>>(USERS_ENDPOINTS.BASE, {
            params: {
                page: params?.page ?? 1,
                pageSize: params?.pageSize ?? 20,
                search: params?.search,
                role: params?.role,
                isActive: params?.isActive,
            },
        });

        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Lấy chi tiết người dùng theo ID
 */
export const getUserById = async (id: string): Promise<UserDetailDto> => {
    try {
        const response = await apiClient.get<ApiResponse<UserDetailDto>>(USERS_ENDPOINTS.BY_ID(id));

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy thông tin người dùng');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Tạo người dùng mới
 */
export const createUser = async (data: CreateUserDto): Promise<UserDetailDto> => {
    try {
        const response = await apiClient.post<ApiResponse<UserDetailDto>>(USERS_ENDPOINTS.BASE, data);

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Tạo người dùng thất bại');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Cập nhật người dùng
 */
export const updateUser = async (id: string, data: UpdateUserDto): Promise<UserDetailDto> => {
    try {
        const response = await apiClient.put<ApiResponse<UserDetailDto>>(
            USERS_ENDPOINTS.BY_ID(id),
            data
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Cập nhật người dùng thất bại');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Xóa người dùng (soft delete)
 */
export const deleteUser = async (id: string): Promise<boolean> => {
    try {
        const response = await apiClient.delete<ApiResponse<boolean>>(USERS_ENDPOINTS.BY_ID(id));

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Xóa người dùng thất bại');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// ====================
// Account Management
// ====================

/**
 * Khóa/mở khóa tài khoản
 */
export const toggleUserLock = async (id: string, isLocked: boolean): Promise<boolean> => {
    try {
        const response = await apiClient.patch<ApiResponse<boolean>>(
            `${USERS_ENDPOINTS.LOCK(id)}?isLocked=${isLocked}`
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể thay đổi trạng thái khóa');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Reset mật khẩu người dùng
 */
export const resetUserPassword = async (id: string, newPassword: string): Promise<boolean> => {
    try {
        const data: ResetPasswordRequest = { newPassword };
        const response = await apiClient.patch<ApiResponse<boolean>>(
            USERS_ENDPOINTS.RESET_PASSWORD(id),
            data
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Reset mật khẩu thất bại');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// ====================
// Permission Management
// ====================

/**
 * Lấy quyền của người dùng
 */
export const getUserPermissions = async (id: string): Promise<string[]> => {
    try {
        const response = await apiClient.get<ApiResponse<string[]>>(USERS_ENDPOINTS.PERMISSIONS(id));

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy danh sách quyền');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Gán quyền cho người dùng
 */
export const assignUserPermissions = async (
    id: string,
    permissionIDs: string[]
): Promise<boolean> => {
    try {
        const data: AssignPermissionsDto = { permissionIDs };
        const response = await apiClient.put<ApiResponse<boolean>>(
            USERS_ENDPOINTS.PERMISSIONS(id),
            data
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Gán quyền thất bại');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Gán tất cả quyền cho người dùng (Admin only)
 */
export const assignAllPermissions = async (id: string): Promise<boolean> => {
    try {
        const response = await apiClient.post<ApiResponse<boolean>>(USERS_ENDPOINTS.PERMISSIONS_ALL(id));

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Gán tất cả quyền thất bại');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Xóa tất cả quyền của người dùng (Admin only)
 */
export const removeAllPermissions = async (id: string): Promise<boolean> => {
    try {
        const response = await apiClient.delete<ApiResponse<boolean>>(USERS_ENDPOINTS.PERMISSIONS(id));

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Xóa tất cả quyền thất bại');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// ====================
// Statistics
// ====================

/**
 * Lấy thống kê người dùng (Admin only)
 */
export const getUserStatistics = async (): Promise<UserStatistics> => {
    try {
        const response = await apiClient.get<ApiResponse<UserStatistics>>(USERS_ENDPOINTS.STATISTICS);

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy thống kê');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Export default object với tất cả methods
const usersService = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserLock,
    resetUserPassword,
    getUserPermissions,
    assignUserPermissions,
    assignAllPermissions,
    removeAllPermissions,
    getUserStatistics,
};

export default usersService;
