import axios from 'axios';
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { message } from 'antd';

// ====================
// Types
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

// Type cho failed request queue
interface FailedRequest {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}

// ====================
// Constants
// ====================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Key lưu trữ trong sessionStorage (memory-like, sẽ mất khi đóng tab)
const ACCESS_TOKEN_KEY = 'wms_access_token';
const TOKEN_EXPIRY_KEY = 'wms_token_expiry';

// ====================
// Token Refresh Queue Management
// ====================

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
    failedQueue.forEach((request) => {
        if (error) {
            request.reject(error);
        } else if (token) {
            request.resolve(token);
        }
    });
    failedQueue = [];
};

// ====================
// Token Management (Memory-based với fallback sessionStorage)
// ====================

// Biến lưu token trong memory (sẽ mất khi refresh page)
let inMemoryToken: string | null = null;
let inMemoryExpiry: number | null = null;

export const tokenManager = {
    /**
     * Lấy Access Token từ memory (hoặc sessionStorage như fallback)
     */
    getAccessToken: (): string | null => {
        if (inMemoryToken) {
            return inMemoryToken;
        }
        // Fallback to sessionStorage (for page refresh scenarios)
        return sessionStorage.getItem(ACCESS_TOKEN_KEY);
    },

    /**
     * Lấy thời gian hết hạn của token
     */
    getTokenExpiry: (): number | null => {
        if (inMemoryExpiry) {
            return inMemoryExpiry;
        }
        const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
        return expiry ? parseInt(expiry, 10) : null;
    },

    /**
     * Lưu Access Token vào memory và sessionStorage
     * Refresh Token được lưu trong HttpOnly Cookie bởi server
     */
    setAccessToken: (accessToken: string, expiresAt: number): void => {
        inMemoryToken = accessToken;
        inMemoryExpiry = expiresAt;
        // Backup to sessionStorage for page refresh
        sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiresAt.toString());
    },

    /**
     * Xóa token khỏi memory và sessionStorage
     * Lưu ý: HttpOnly Cookie sẽ được xóa bởi server khi gọi logout
     */
    clearTokens: (): void => {
        inMemoryToken = null;
        inMemoryExpiry = null;
        sessionStorage.removeItem(ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    },

    /**
     * Kiểm tra người dùng đã đăng nhập chưa
     */
    isAuthenticated: (): boolean => {
        const token = tokenManager.getAccessToken();
        const expiry = tokenManager.getTokenExpiry();

        if (!token || !expiry) {
            return false;
        }

        // Kiểm tra token có hết hạn không (với buffer 30 giây)
        const now = Math.floor(Date.now() / 1000);
        return expiry > now + 30;
    },

    /**
     * Kiểm tra token có sắp hết hạn không (còn dưới 30 giây)
     * Điều chỉnh để phù hợp với token 1 phút
     */
    isTokenExpiringSoon: (): boolean => {
        const expiry = tokenManager.getTokenExpiry();
        if (!expiry) return true;

        const now = Math.floor(Date.now() / 1000);
        return expiry - now < 30; // 30 giây trước khi hết hạn
    },

    /**
     * Lấy số giây còn lại trước khi token hết hạn
     */
    getTokenRemainingTime: (): number => {
        const expiry = tokenManager.getTokenExpiry();
        if (!expiry) return 0;

        const now = Math.floor(Date.now() / 1000);
        return Math.max(0, expiry - now);
    },

    // Legacy methods for backward compatibility
    setTokens: (accessToken: string, _refreshToken?: string, expiresAt?: number): void => {
        tokenManager.setAccessToken(accessToken, expiresAt || Math.floor(Date.now() / 1000) + 3600);
    },

    getRefreshToken: (): string | null => {
        // Refresh token giờ nằm trong HttpOnly Cookie, không thể đọc từ JS
        console.warn('getRefreshToken() is deprecated. Refresh token is now in HttpOnly Cookie.');
        return null;
    },
};

// ====================
// Refresh Token Function
// ====================

/**
 * Gọi API refresh token và cập nhật access token mới
 * Sử dụng queue mechanism để tránh gọi nhiều lần đồng thời
 */
export const performTokenRefresh = async (): Promise<string | null> => {
    const currentToken = tokenManager.getAccessToken();
    if (!currentToken) {
        return null;
    }

    try {
        console.log('[TokenRefresh] Calling refresh token API...');

        const response = await axios.post<ApiResponse<{ accessToken: string; expiresAt: number }>>(
            `${API_BASE_URL}/Auth/refresh-token`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${currentToken}`,
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            }
        );

        if (response.data.success) {
            const { accessToken: newAccessToken, expiresAt } = response.data.data;
            tokenManager.setAccessToken(newAccessToken, expiresAt);

            console.log(`[TokenRefresh] Success! New token expires in ${tokenManager.getTokenRemainingTime()} seconds`);
            return newAccessToken;
        }

        console.error('[TokenRefresh] API returned unsuccessful response');
        return null;
    } catch (error) {
        console.error('[TokenRefresh] Failed:', error);
        throw error;
    }
};

// ====================
// Axios Instance
// ====================

const createApiInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            'Content-Type': 'application/json',
        },
        // QUAN TRỌNG: Cho phép gửi cookies cross-origin
        withCredentials: true,
    });

    // Request Interceptor - Thêm token vào header
    instance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = tokenManager.getAccessToken();
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response Interceptor - Xử lý token hết hạn với Queue mechanism
    instance.interceptors.response.use(
        (response: AxiosResponse) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

            // Bỏ qua nếu không có config (request bị cancel)
            if (!originalRequest) {
                return Promise.reject(error);
            }

            // Lấy URL của request
            const requestUrl = originalRequest.url || '';

            // Danh sách các endpoint KHÔNG cần refresh token khi gặp 401
            // (vì đây là các endpoint auth, 401 nghĩa là đăng nhập thất bại, không phải token hết hạn)
            const authEndpoints = ['/Auth/login', '/Auth/register', '/Auth/refresh-token'];
            const isAuthEndpoint = authEndpoints.some(endpoint => requestUrl.includes(endpoint));

            // Nếu lỗi 401 và chưa thử refresh token VÀ không phải auth endpoint
            if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
                // Nếu đang trong quá trình refresh, thêm request vào queue
                if (isRefreshing) {
                    console.log('[Interceptor] Token refresh in progress, queueing request...');
                    return new Promise<AxiosResponse>((resolve, reject) => {
                        failedQueue.push({
                            resolve: (token: string) => {
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                resolve(instance(originalRequest));
                            },
                            reject: (err: unknown) => {
                                reject(err);
                            },
                        });
                    });
                }

                originalRequest._retry = true;
                isRefreshing = true;

                console.log('[Interceptor] Received 401, attempting token refresh...');

                try {
                    const newToken = await performTokenRefresh();

                    if (newToken) {
                        // Thông báo cho các request đang chờ
                        processQueue(null, newToken);

                        // Retry request gốc với token mới
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return instance(originalRequest);
                    }

                    // Không có token mới -> logout
                    throw new Error('Token refresh returned null');
                } catch (refreshError) {
                    // Refresh thất bại -> thông báo cho queue và logout
                    console.error('[Interceptor] Token refresh failed:', refreshError);
                    processQueue(refreshError, null);

                    tokenManager.clearTokens();
                    sessionStorage.clear();

                    // Redirect to login (chỉ khi không đang ở trang login)
                    if (!window.location.pathname.includes('/login')) {
                        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                        window.location.href = '/login';
                    }

                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            // Hiển thị lỗi cho các trường hợp khác (không phải 401)
            if (error.response?.status !== 401) {
                const errorData = error.response?.data as { message?: string } | undefined;
                if (errorData?.message) {
                    message.error(errorData.message);
                } else if (error.message === 'Network Error') {
                    message.error('Không thể kết nối đến máy chủ');
                } else if (error.code === 'ECONNABORTED') {
                    message.error('Yêu cầu đã hết thời gian chờ');
                }
            }

            return Promise.reject(error);
        }
    );

    return instance;
};

export const apiClient = createApiInstance();

// ====================
// Helper Functions
// ====================

export const handleApiError = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as { message?: string; errors?: string[] } | undefined;
        if (errorData?.message) {
            return errorData.message;
        }
        if (errorData?.errors?.length) {
            return errorData.errors.join(', ');
        }
        if (error.message === 'Network Error') {
            return 'Không thể kết nối đến máy chủ';
        }
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'Đã xảy ra lỗi không xác định';
};

export default apiClient;
