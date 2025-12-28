import apiClient, { handleApiError } from '../config/api.config';
import type {
    PingResponse,
    HealthStatusResponse,
    TestConnectionResponse,
} from '../types/api.types';

// ====================
// Health Check Service
// ====================

const HEALTH_ENDPOINTS = {
    PING: '/HealthCheck/ping',
    STATUS: '/HealthCheck/status',
    TEST: '/HealthCheck/test',
};

/**
 * Kiểm tra API đang hoạt động
 */
export const ping = async (): Promise<PingResponse> => {
    try {
        const response = await apiClient.get<PingResponse>(HEALTH_ENDPOINTS.PING);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Kiểm tra chi tiết trạng thái hệ thống
 */
export const getStatus = async (): Promise<HealthStatusResponse> => {
    try {
        const response = await apiClient.get<HealthStatusResponse>(HEALTH_ENDPOINTS.STATUS);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Test endpoint đơn giản để kiểm tra kết nối
 */
export const testConnection = async (): Promise<TestConnectionResponse> => {
    try {
        const response = await apiClient.get<TestConnectionResponse>(HEALTH_ENDPOINTS.TEST);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

/**
 * Kiểm tra xem API có sẵn sàng không
 * @returns true nếu API sẵn sàng, false nếu không
 */
export const isApiReady = async (): Promise<boolean> => {
    try {
        const response = await ping();
        return response.status === 'OK';
    } catch {
        return false;
    }
};

// Export default object với tất cả methods
const healthCheckService = {
    ping,
    getStatus,
    testConnection,
    isApiReady,
};

export default healthCheckService;
