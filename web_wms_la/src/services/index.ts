// ====================
// Service Exports
// ====================

// Auth Service
export { default as authService } from './auth.service';
export {
    login,
    register,
    refreshToken,
    getCurrentUser,
    changePassword,
    logout,
    createUser as authCreateUser, // Renamed to avoid conflict with users.service.createUser
    isAuthenticated,
    isTokenExpiringSoon,
    clearAuth,
    getAccessToken,
} from './auth.service';

// Users Service
export { default as usersService } from './users.service';
export {
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
    type GetUsersParams,
} from './users.service';

// Permissions Service
export { default as permissionsService } from './permissions.service';
export * from './permissions.service';

// Health Check Service
export { default as healthCheckService } from './healthcheck.service';
export * from './healthcheck.service';

// API Config
export { apiClient, tokenManager, handleApiError } from '../config/api.config';

// Types
export type * from '../types/api.types';
