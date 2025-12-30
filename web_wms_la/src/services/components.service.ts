import apiClient from '../config/api.config';
import type { Component, ComponentFilterParams, ComponentListResponse } from '../types/type.component';

const BASE_URL = '/api/components';

// Lấy danh sách sản phẩm
export const getComponents = async (params?: ComponentFilterParams): Promise<ComponentListResponse> => {
    const response = await apiClient.get<ComponentListResponse>(BASE_URL, { params });
    return response.data;
};

// Lấy chi tiết sản phẩm
export const getComponentById = async (id: string): Promise<Component> => {
    const response = await apiClient.get<Component>(`${BASE_URL}/${id}`);
    return response.data;
};

// Tạo sản phẩm mới
export const createComponent = async (data: Partial<Component>): Promise<Component> => {
    const response = await apiClient.post<Component>(BASE_URL, data);
    return response.data;
};

// Cập nhật sản phẩm
export const updateComponent = async (id: string, data: Partial<Component>): Promise<Component> => {
    const response = await apiClient.put<Component>(`${BASE_URL}/${id}`, data);
    return response.data;
};

// Xóa sản phẩm (soft delete)
export const deleteComponent = async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
};

// Lấy danh sách thương hiệu (distinct)
export const getBrands = async (): Promise<string[]> => {
    const response = await apiClient.get<string[]>(`${BASE_URL}/brands`);
    return response.data;
};

// Xuất Excel
export const exportComponentsToExcel = async (params?: ComponentFilterParams): Promise<Blob> => {
    const response = await apiClient.get(`${BASE_URL}/export`, {
        params,
        responseType: 'blob',
    });
    return response.data;
};

// Import Excel
export const importComponentsFromExcel = async (file: File): Promise<{ success: number; errors: string[] }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ success: number; errors: string[] }>(`${BASE_URL}/import`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
