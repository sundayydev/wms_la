import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import authService from '../services/auth.service';
import { tokenManager } from '../config/api.config';
import type { UserInfo, AuthState } from '../types/api.types';

// ====================
// Context Types
// ====================

interface AuthContextType extends AuthState {
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuth: () => Promise<boolean>;
}

const defaultAuthState: AuthState = {
    isAuthenticated: false,
    accessToken: null,
    expiresAt: null,
    user: null,
    isLoading: true,
};

// ====================
// Context Creation
// ====================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ====================
// Provider Component
// ====================

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [state, setState] = useState<AuthState>(defaultAuthState);

    /**
     * Kiểm tra và khôi phục trạng thái xác thực khi app khởi động
     * Logic mới: Nếu có token (dù hết hạn), thử refresh trước khi logout
     */
    const checkAuth = useCallback(async (): Promise<boolean> => {
        try {
            const existingToken = tokenManager.getAccessToken();

            // Không có token nào -> chưa đăng nhập
            if (!existingToken) {
                console.log('[AuthContext] No token found, user not authenticated');
                setState({
                    ...defaultAuthState,
                    isLoading: false,
                });
                return false;
            }

            // Có token, kiểm tra xem còn hạn không
            const isTokenValid = tokenManager.isAuthenticated();

            if (!isTokenValid) {
                // Token hết hạn -> thử refresh trước
                console.log('[AuthContext] Token expired, attempting refresh...');

                const refreshResult = await authService.refreshToken();
                if (!refreshResult) {
                    console.log('[AuthContext] Refresh failed, clearing auth');
                    tokenManager.clearTokens();
                    sessionStorage.clear();
                    setState({
                        ...defaultAuthState,
                        isLoading: false,
                    });
                    return false;
                }

                console.log('[AuthContext] Token refreshed successfully');
            }

            // Token còn hạn (hoặc vừa refresh thành công), lấy thông tin user
            const user = await authService.getCurrentUser();

            setState({
                isAuthenticated: true,
                accessToken: tokenManager.getAccessToken(),
                expiresAt: tokenManager.getTokenExpiry(),
                user,
                isLoading: false,
            });

            // Lưu user info vào sessionStorage
            sessionStorage.setItem('user_info', JSON.stringify(user));
            sessionStorage.setItem('user_role', user.role);

            return true;
        } catch (error) {
            console.error('[AuthContext] Auth check failed:', error);

            // Thử refresh token nếu có lỗi (ví dụ: API /me trả về 401)
            try {
                console.log('[AuthContext] Trying to refresh token after error...');
                const refreshResult = await authService.refreshToken();
                if (refreshResult) {
                    const user = await authService.getCurrentUser();
                    setState({
                        isAuthenticated: true,
                        accessToken: tokenManager.getAccessToken(),
                        expiresAt: tokenManager.getTokenExpiry(),
                        user,
                        isLoading: false,
                    });

                    sessionStorage.setItem('user_info', JSON.stringify(user));
                    sessionStorage.setItem('user_role', user.role);
                    return true;
                }
            } catch (refreshError) {
                console.error('[AuthContext] Token refresh failed:', refreshError);
            }

            // Xóa token và reset state
            tokenManager.clearTokens();
            sessionStorage.clear();
            setState({
                ...defaultAuthState,
                isLoading: false,
            });
            return false;
        }
    }, []);

    /**
     * Đăng nhập
     */
    const login = useCallback(async (username: string, password: string): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            // Gọi API login (accessToken được lưu tự động, refreshToken trong cookie)
            const loginResponse = await authService.login({ username, password });

            // Lấy thông tin user
            const user = await authService.getCurrentUser();

            setState({
                isAuthenticated: true,
                accessToken: loginResponse.accessToken,
                expiresAt: loginResponse.expiresAt,
                user,
                isLoading: false,
            });

            // Lưu user info vào sessionStorage
            sessionStorage.setItem('user_info', JSON.stringify(user));
            sessionStorage.setItem('user_role', user.role);
            sessionStorage.setItem('user_name', user.username);
            sessionStorage.setItem('user_fullname', user.fullName);
        } catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            throw error;
        }
    }, []);

    /**
     * Đăng xuất
     */
    const logout = useCallback(async (): Promise<void> => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Xóa tất cả dữ liệu
            tokenManager.clearTokens();
            sessionStorage.clear();

            setState({
                ...defaultAuthState,
                isLoading: false,
            });
        }
    }, []);

    /**
     * Làm mới thông tin user
     */
    const refreshUser = useCallback(async (): Promise<void> => {
        try {
            const user = await authService.getCurrentUser();
            setState(prev => ({ ...prev, user }));
            sessionStorage.setItem('user_info', JSON.stringify(user));
        } catch (error) {
            console.error('Failed to refresh user:', error);
        }
    }, []);

    // Kiểm tra auth khi component mount
    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    // Auto refresh token khi sắp hết hạn (proactive refresh)
    useEffect(() => {
        if (!state.isAuthenticated || !state.expiresAt) return;

        let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
        let checkInterval: ReturnType<typeof setInterval> | null = null;

        const scheduleRefresh = () => {
            const remainingTime = tokenManager.getTokenRemainingTime();

            // Nếu token còn hơn 15 giây, đặt timeout để refresh trước 15 giây
            if (remainingTime > 15) {
                const refreshIn = (remainingTime - 15) * 1000; // Refresh 15 giây trước khi hết hạn
                console.log(`[AuthContext] Token expires in ${remainingTime}s, scheduling refresh in ${Math.round(refreshIn / 1000)}s`);

                refreshTimeout = setTimeout(async () => {
                    console.log('[AuthContext] Proactive token refresh triggered');
                    try {
                        const refreshResult = await authService.refreshToken();
                        if (refreshResult) {
                            setState(prev => ({
                                ...prev,
                                accessToken: refreshResult.accessToken,
                                expiresAt: refreshResult.expiresAt,
                            }));
                            // Schedule next refresh
                            scheduleRefresh();
                        }
                    } catch (error) {
                        console.error('[AuthContext] Proactive refresh failed:', error);
                    }
                }, refreshIn);
            }
        };

        // Kiểm tra định kỳ để đảm bảo token còn valid
        const checkTokenValidity = async () => {
            if (tokenManager.isTokenExpiringSoon()) {
                console.log('[AuthContext] Token expiring soon, attempting refresh...');
                try {
                    const refreshResult = await authService.refreshToken();
                    if (refreshResult) {
                        setState(prev => ({
                            ...prev,
                            accessToken: refreshResult.accessToken,
                            expiresAt: refreshResult.expiresAt,
                        }));
                    }
                } catch (error) {
                    console.error('[AuthContext] Periodic refresh failed:', error);
                }
            }
        };

        // Bắt đầu schedule refresh
        scheduleRefresh();

        // Kiểm tra mỗi 10 giây (phù hợp với token 1 phút)
        checkInterval = setInterval(checkTokenValidity, 10000);

        return () => {
            if (refreshTimeout) clearTimeout(refreshTimeout);
            if (checkInterval) clearInterval(checkInterval);
        };
    }, [state.isAuthenticated, state.expiresAt]);

    const contextValue: AuthContextType = {
        ...state,
        login,
        logout,
        refreshUser,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// ====================
// Custom Hook
// ====================

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// ====================
// Helper Hooks
// ====================

/**
 * Hook để lấy thông tin user hiện tại
 */
export const useCurrentUser = (): UserInfo | null => {
    const { user } = useAuth();
    return user;
};

/**
 * Hook để kiểm tra quyền của user
 */
export const useHasRole = (roles: string | string[]): boolean => {
    const { user } = useAuth();
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
};

/**
 * Hook để kiểm tra trạng thái loading
 */
export const useAuthLoading = (): boolean => {
    const { isLoading } = useAuth();
    return isLoading;
};

export default AuthContext;
