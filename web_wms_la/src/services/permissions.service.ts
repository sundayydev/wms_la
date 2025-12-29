import apiClient, { handleApiError } from '../config/api.config';
import type { ApiResponse, PermissionDto, PermissionGroupDto, UserPermissionDto } from '../types/api.types';

// ====================
// Permissions Service
// ====================

const PERMISSIONS_ENDPOINTS = {
    BASE: '/Permissions',
    BY_ID: (id: string) => `/Permissions/${id}`,
    GROUPED: '/Permissions/grouped',
    MODULES: '/Permissions/modules',
    BY_MODULE: (module: string) => `/Permissions/module/${module}`,
    USER_PERMISSIONS: (userId: string) => `/Permissions/user/${userId}`,
    USER_ADD: (userId: string) => `/Permissions/user/${userId}/add`,
    USER_REMOVE: (userId: string) => `/Permissions/user/${userId}/remove`,
    USER_ALL: (userId: string) => `/Permissions/user/${userId}/all`,
    MY_PERMISSIONS: '/Permissions/me',
    MY_CHECK: '/Permissions/me/check',
    SYNC: '/Permissions/sync',
    SYSTEM: '/Permissions/system',
    SYSTEM_BY_MODULE: (module: string) => `/Permissions/system/module/${module}`,
    SYSTEM_MODULES: '/Permissions/system/modules',
    ROLES: '/Permissions/roles',
    ROLE_PERMISSIONS: (role: string) => `/Permissions/roles/${role}/permissions`,
    ROLE_MAPPINGS: '/Permissions/roles/mappings',
};

// ====================
// Permission List Operations
// ====================

/**
 * Lấy tất cả quyền
 */
export const getAllPermissions = async (): Promise<PermissionDto[]> => {
    try {
        const response = await apiClient.get<ApiResponse<PermissionDto[]>>(PERMISSIONS_ENDPOINTS.BASE);

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy danh sách quyền');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Lấy quyền theo ID
 */
export const getPermissionById = async (id: string): Promise<PermissionDto> => {
    try {
        const response = await apiClient.get<ApiResponse<PermissionDto>>(
            PERMISSIONS_ENDPOINTS.BY_ID(id)
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy thông tin quyền');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Lấy quyền nhóm theo module
 */
export const getGroupedPermissions = async (): Promise<PermissionGroupDto[]> => {
    try {
        const response = await apiClient.get<ApiResponse<PermissionGroupDto[]>>(
            PERMISSIONS_ENDPOINTS.GROUPED
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy danh sách quyền');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Lấy danh sách module
 */
export const getModules = async (): Promise<string[]> => {
    try {
        const response = await apiClient.get<ApiResponse<string[]>>(PERMISSIONS_ENDPOINTS.MODULES);

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy danh sách module');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Lấy quyền theo module
 */
export const getPermissionsByModule = async (module: string): Promise<PermissionDto[]> => {
    try {
        const response = await apiClient.get<ApiResponse<PermissionDto[]>>(
            PERMISSIONS_ENDPOINTS.BY_MODULE(module)
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy danh sách quyền');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// ====================
// User Permission Operations
// ====================

/**
 * Lấy quyền của người dùng
 */
export const getUserPermissions = async (userId: string): Promise<UserPermissionDto> => {
    try {
        const response = await apiClient.get<ApiResponse<UserPermissionDto>>(
            PERMISSIONS_ENDPOINTS.USER_PERMISSIONS(userId)
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy quyền người dùng');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Gán quyền cho người dùng (thay thế quyền cũ)
 */
export const assignUserPermissions = async (
    userId: string,
    permissionIds: string[]
): Promise<boolean> => {
    try {
        const response = await apiClient.put<ApiResponse<boolean>>(
            PERMISSIONS_ENDPOINTS.USER_PERMISSIONS(userId),
            permissionIds
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
 * Thêm quyền cho người dùng (không xóa quyền cũ)
 */
export const addUserPermissions = async (
    userId: string,
    permissionIds: string[]
): Promise<boolean> => {
    try {
        const response = await apiClient.post<ApiResponse<boolean>>(
            PERMISSIONS_ENDPOINTS.USER_ADD(userId),
            permissionIds
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Thêm quyền thất bại');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Xóa quyền của người dùng
 */
export const removeUserPermissions = async (
    userId: string,
    permissionIds: string[]
): Promise<boolean> => {
    try {
        const response = await apiClient.post<ApiResponse<boolean>>(
            PERMISSIONS_ENDPOINTS.USER_REMOVE(userId),
            permissionIds
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Xóa quyền thất bại');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Gán tất cả quyền cho người dùng (Admin only)
 */
export const assignAllPermissions = async (userId: string): Promise<boolean> => {
    try {
        const response = await apiClient.post<ApiResponse<boolean>>(
            PERMISSIONS_ENDPOINTS.USER_ALL(userId)
        );

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
export const removeAllPermissions = async (userId: string): Promise<boolean> => {
    try {
        const response = await apiClient.delete<ApiResponse<boolean>>(
            PERMISSIONS_ENDPOINTS.USER_ALL(userId)
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Xóa tất cả quyền thất bại');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// ====================
// My Permissions
// ====================

/**
 * Lấy quyền của tôi
 */
export const getMyPermissions = async (): Promise<UserPermissionDto> => {
    try {
        const response = await apiClient.get<ApiResponse<UserPermissionDto>>(
            PERMISSIONS_ENDPOINTS.MY_PERMISSIONS
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy quyền của bạn');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Kiểm tra quyền của tôi
 */
export const checkMyPermission = async (permissionName: string): Promise<boolean> => {
    try {
        const response = await apiClient.get<ApiResponse<boolean>>(PERMISSIONS_ENDPOINTS.MY_CHECK, {
            params: { permissionName },
        });

        if (response.data.success) {
            return response.data.data;
        }

        return false;
    } catch (error) {
        console.warn('Check permission error:', error);
        return false;
    }
};

// ====================
// Admin Operations
// ====================

/**
 * Đồng bộ quyền từ code vào database (Admin only)
 */
export const syncPermissions = async (): Promise<number> => {
    try {
        const response = await apiClient.post<ApiResponse<number>>(PERMISSIONS_ENDPOINTS.SYNC);

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Đồng bộ quyền thất bại');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Lấy tất cả quyền từ SystemPermissions (Admin only)
 */
export const getSystemPermissions = async (): Promise<string[]> => {
    try {
        const response = await apiClient.get<ApiResponse<string[]>>(PERMISSIONS_ENDPOINTS.SYSTEM);

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy quyền hệ thống');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Lấy quyền hệ thống theo module (Admin only)
 */
export const getSystemPermissionsByModule = async (module: string): Promise<string[]> => {
    try {
        const response = await apiClient.get<ApiResponse<string[]>>(
            PERMISSIONS_ENDPOINTS.SYSTEM_BY_MODULE(module)
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy quyền hệ thống');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Lấy danh sách module hệ thống (Admin only)
 */
export const getSystemModules = async (): Promise<string[]> => {
    try {
        const response = await apiClient.get<ApiResponse<string[]>>(
            PERMISSIONS_ENDPOINTS.SYSTEM_MODULES
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy danh sách module');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// ====================
// Role Permission Mapping
// ====================

/**
 * Lấy danh sách tất cả roles
 */
export const getAllRoles = async (): Promise<string[]> => {
    try {
        const response = await apiClient.get<ApiResponse<string[]>>(PERMISSIONS_ENDPOINTS.ROLES);

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy danh sách vai trò');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Lấy quyền mặc định theo role
 */
export const getRoleDefaultPermissions = async (role: string): Promise<string[]> => {
    try {
        const response = await apiClient.get<ApiResponse<string[]>>(
            PERMISSIONS_ENDPOINTS.ROLE_PERMISSIONS(role)
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy quyền mặc định');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Lấy toàn bộ mapping quyền theo role
 */
export const getRolePermissionMappings = async (): Promise<Record<string, string[]>> => {
    try {
        const response = await apiClient.get<ApiResponse<Record<string, string[]>>>(
            PERMISSIONS_ENDPOINTS.ROLE_MAPPINGS
        );

        if (response.data.success) {
            return response.data.data;
        }

        throw new Error(response.data.message || 'Không thể lấy mapping quyền');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Export default object với tất cả methods
const permissionsService = {
    getAllPermissions,
    getPermissionById,
    getGroupedPermissions,
    getModules,
    getPermissionsByModule,
    getUserPermissions,
    assignUserPermissions,
    addUserPermissions,
    removeUserPermissions,
    assignAllPermissions,
    removeAllPermissions,
    getMyPermissions,
    checkMyPermission,
    syncPermissions,
    getSystemPermissions,
    getSystemPermissionsByModule,
    getSystemModules,
    getAllRoles,
    getRoleDefaultPermissions,
    getRolePermissionMappings,
};

export default permissionsService;

