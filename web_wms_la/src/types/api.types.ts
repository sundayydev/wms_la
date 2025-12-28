// ====================
// Common API Response Types
// ====================

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: string[];
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

// ====================
// Auth Types
// ====================

export interface LoginRequest {
    username: string;
    password: string;
}

/**
 * Response sau khi đăng nhập thành công
 * - accessToken: lưu trong memory (state/context)
 * - refreshToken: được gửi qua HttpOnly Cookie (không xuất hiện trong response body)
 */
export interface LoginResponse {
    accessToken: string;
    expiresAt: number; // Unix timestamp (seconds)
    expiresInMinutes: number;
}

export interface RegisterRequest {
    username: string;
    password: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    role?: string;
}

/**
 * @deprecated Refresh Token được lấy từ HttpOnly Cookie, không cần gửi trong body
 */
export interface RefreshTokenRequest {
    refreshToken?: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface UserInfo {
    userID: string;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: 'ADMIN' | 'RECEPTIONIST' | 'TECHNICIAN' | 'WAREHOUSE';
    isActive: boolean;
    isLocked: boolean;
    createdAt: string;
    lastLogin?: string;
    profilePicture?: string;
    warehouseID?: string;
    warehouseName?: string;
    // Additional profile fields
    avatar?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    address?: string;
    lastLoginAt?: string;
    lastLoginIP?: string;
}

// ====================
// Auth State Types (for context/store)
// ====================

/**
 * Trạng thái xác thực trong memory
 */
export interface AuthState {
    isAuthenticated: boolean;
    accessToken: string | null;
    expiresAt: number | null;
    user: UserInfo | null;
    isLoading: boolean;
}

/**
 * Token info để lưu trữ tạm thời
 */
export interface TokenInfo {
    accessToken: string;
    expiresAt: number;
    expiresInMinutes: number;
}

// ====================
// User Types
// ====================

export interface UserListDto {
    userID: string;
    username: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
    warehouseName?: string;
    isActive: boolean;
    isLocked: boolean;
    lastLoginAt?: string;
    createdAt: string;
}

export interface UserDetailDto extends UserListDto {
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    address?: string;
    avatar?: string;
    warehouseID?: string;
    lastLoginIP?: string;
    updatedAt: string;
    permissions: string[];
}

export interface CreateUserDto {
    username: string;
    password: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    address?: string;
    avatar?: string;
    role: string;
    warehouseID?: string;
    isActive?: boolean;
}

export interface UpdateUserDto {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    address?: string;
    avatar?: string;
    role?: string;
    warehouseID?: string;
    isActive?: boolean;
}

/**
 * Request body cho API cập nhật thông tin người dùng
 * PUT /api/Users/{id}
 */
export interface UpdateProfileRequest {
    fullName?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
    dateOfBirth?: string | null;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
    address?: string | null;
    avatar?: string | null;
    role?: string | null;
    warehouseID?: string | null;
    isActive?: boolean | null;
}

export interface AssignPermissionsDto {
    permissionIDs: string[];
}

export interface ResetPasswordRequest {
    newPassword: string;
}

export interface UserStatistics {
    totalUsers: number;
    activeUsers: number;
    lockedUsers: number;
    usersByRole: Record<string, number>;
}

// ====================
// Permission Types
// ====================

export interface PermissionDto {
    permissionID: string;
    permissionName: string;  // VD: "AuditLog.Export"
    module: string;          // VD: "AuditLog"
    action: string;          // VD: "Export"
    createdAt: string;
}

export interface PermissionGroupDto {
    module: string;
    permissions: PermissionDto[];
}

export interface UserPermissionDto {
    userID: string;
    username: string;
    fullName: string;
    role: string;
    permissions: PermissionDto[];
    permissionNames: string[];
}

// ====================
// Health Check Types
// ====================

export interface PingResponse {
    status: string;
    message: string;
    timestamp: string;
    environment: string;
}

export interface ServiceCheck {
    status: string;
    responseTime?: string;
    message?: string;
}

export interface HealthChecks {
    api: ServiceCheck;
    database: ServiceCheck;
}

export interface HealthStatusResponse {
    status: string;
    timestamp: string;
    version: string;
    environment: string;
    serverTime: string;
    machineName: string;
    osVersion: string;
    checks: HealthChecks;
}

export interface ApiInfoData {
    apiName: string;
    description: string;
    timestamp: string;
}

export interface TestConnectionResponse {
    success: boolean;
    message: string;
    data: ApiInfoData;
}
