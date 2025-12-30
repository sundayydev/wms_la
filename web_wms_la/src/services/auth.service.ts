import apiClient, { tokenManager, handleApiError } from '../config/api.config';
import type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ChangePasswordRequest,
  UserInfo,
  UpdateProfileRequest,
} from '../types/api.types';

// ====================
// Auth Service
// Sử dụng HttpOnly Cookie (Refresh Token) + Memory (Access Token)
// ====================

const AUTH_ENDPOINTS = {
  LOGIN: '/Auth/login',
  REGISTER: '/Auth/register',
  REFRESH_TOKEN: '/Auth/refresh-token',
  ME: '/Auth/me',
  CHANGE_PASSWORD: '/Auth/change-password',
  LOGOUT: '/Auth/logout',
  CREATE_USER: '/Auth/create-user',
};

/**
 * Đăng nhập vào hệ thống
 * - Access Token được trả về trong response body -> lưu vào memory
 * - Refresh Token được set trong HttpOnly Cookie bởi server -> tự động gửi kèm requests
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      AUTH_ENDPOINTS.LOGIN,
      credentials
    );

    if (response.data.success) {
      const { accessToken, expiresAt, expiresInMinutes } = response.data.data;

      // Lưu access token vào memory/sessionStorage
      tokenManager.setAccessToken(accessToken, expiresAt);

      console.log(`Login successful. Token expires in ${expiresInMinutes} minutes.`);

      return response.data.data;
    }

    throw new Error(response.data.message || 'Đăng nhập thất bại');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Đăng ký tài khoản mới (Public)
 */
export const register = async (data: RegisterRequest): Promise<UserInfo> => {
  try {
    const response = await apiClient.post<ApiResponse<UserInfo>>(
      AUTH_ENDPOINTS.REGISTER,
      data
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Đăng ký thất bại');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Làm mới Access Token
 * - Server đọc Refresh Token từ HttpOnly Cookie
 * - Trả về Access Token mới trong response body
 */
export const refreshToken = async (): Promise<LoginResponse | null> => {
  try {
    const currentToken = tokenManager.getAccessToken();
    if (!currentToken) {
      console.log('[AuthService] No current token, cannot refresh');
      return null;
    }

    console.log('[AuthService] Attempting token refresh...');

    // Import axios trực tiếp để tránh interceptor loop
    const { default: axios } = await import('axios');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5023/api';

    const response = await axios.post<ApiResponse<LoginResponse>>(
      `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`,
      {}, // Body trống, refresh token trong cookie
      {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true, // Quan trọng: gửi cookie
      }
    );

    if (response.data.success) {
      const { accessToken, expiresAt } = response.data.data;
      tokenManager.setAccessToken(accessToken, expiresAt);
      console.log('[AuthService] Token refresh successful');
      return response.data.data;
    }

    console.error('[AuthService] Refresh response not successful:', response.data.message);
    return null;
  } catch (error) {
    console.error('[AuthService] Refresh token failed:', error);
    // Không clear tokens ở đây - để cho caller quyết định
    return null;
  }
};

/**
 * Lấy thông tin người dùng hiện tại
 */
export const getCurrentUser = async (): Promise<UserInfo> => {
  try {
    const response = await apiClient.get<ApiResponse<UserInfo>>(AUTH_ENDPOINTS.ME);

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Không thể lấy thông tin người dùng');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Cập nhật thông tin người dùng
 * PUT /api/Users/{id}
 */
export const updateProfile = async (userId: string, data: UpdateProfileRequest): Promise<UserInfo> => {
  try {
    const response = await apiClient.put<ApiResponse<UserInfo>>(
      `/Users/${userId}`,
      data
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Cập nhật thông tin thất bại');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Đổi mật khẩu
 * Sau khi đổi mật khẩu, server sẽ xóa refresh token cookie
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<boolean> => {
  try {
    const response = await apiClient.post<ApiResponse<boolean>>(
      AUTH_ENDPOINTS.CHANGE_PASSWORD,
      data
    );

    if (response.data.success) {
      // Xóa token local vì server đã xóa refresh token
      tokenManager.clearTokens();
      return response.data.data;
    }

    throw new Error(response.data.message || 'Đổi mật khẩu thất bại');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Đăng xuất
 * - Server xóa Refresh Token từ Redis và Cookie
 * - Client xóa Access Token từ memory
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post<ApiResponse<boolean>>(AUTH_ENDPOINTS.LOGOUT);
  } catch (error) {
    // Bỏ qua lỗi khi đăng xuất
    console.warn('Logout error:', error);
  } finally {
    // Luôn xóa token local dù API có lỗi hay không
    tokenManager.clearTokens();
  }
};

/**
 * Tạo tài khoản mới (Admin only)
 */
export const createUser = async (data: RegisterRequest): Promise<UserInfo> => {
  try {
    const response = await apiClient.post<ApiResponse<UserInfo>>(
      AUTH_ENDPOINTS.CREATE_USER,
      data
    );

    if (response.data.success) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Tạo tài khoản thất bại');
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Kiểm tra xem người dùng đã đăng nhập chưa
 */
export const isAuthenticated = (): boolean => {
  return tokenManager.isAuthenticated();
};

/**
 * Kiểm tra token có sắp hết hạn không
 */
export const isTokenExpiringSoon = (): boolean => {
  return tokenManager.isTokenExpiringSoon();
};

/**
 * Xóa token (client-side logout)
 */
export const clearAuth = (): void => {
  tokenManager.clearTokens();
};

/**
 * Lấy Access Token hiện tại
 */
export const getAccessToken = (): string | null => {
  return tokenManager.getAccessToken();
};

// Export default object với tất cả methods
const authService = {
  login,
  register,
  refreshToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
  createUser,
  isAuthenticated,
  isTokenExpiringSoon,
  clearAuth,
  getAccessToken,
};

export default authService;