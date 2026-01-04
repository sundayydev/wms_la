// ====================
// Customer Types
// ====================

import type { ApiResponse, PaginatedResponse } from './api.types';

export type CustomerType = 'INDIVIDUAL' | 'COMPANY';
export type CustomerGroup = 'RETAIL' | 'WHOLESALE' | 'VIP';

/**
 * Thông tin liên hệ của khách hàng
 */
export interface CustomerContact {
    contactID?: string;
    contactName: string;
    position: string;
    department?: string;
    phoneNumber: string;
    email?: string;
    isDefaultReceiver: boolean;
    note?: string;
}

/**
 * DTO hiển thị danh sách khách hàng
 */
export interface CustomerListDto {
    customerID: string;
    customerCode: string;
    customerName: string;
    type: CustomerType;
    customerGroup: CustomerGroup;
    phoneNumber: string;
    email?: string;
    city?: string;
    isActive: boolean;
    createdAt: string;
}

/**
 * DTO chi tiết khách hàng
 */
export interface CustomerDetailDto {
    customerID: string;
    customerCode: string;
    customerName: string;
    type: CustomerType;
    customerGroup: CustomerGroup;
    phoneNumber: string;
    email?: string;
    address?: string;
    city?: string;
    district?: string;
    ward?: string;
    taxCode?: string;
    dateOfBirth?: string;
    gender?: string;
    notes?: string;
    isActive: boolean;
    contacts?: CustomerContact[];
    createdAt: string;
    updatedAt: string;
    orderCount: number;
    totalRevenue: number;
}

/**
 * DTO tạo mới khách hàng
 */
export interface CreateCustomerDto {
    customerCode: string;
    customerName: string;
    type: CustomerType;
    customerGroup: CustomerGroup;
    phoneNumber: string;
    email?: string;
    address?: string;
    city?: string;
    district?: string;
    ward?: string;
    taxCode?: string;
    dateOfBirth?: string;
    gender?: string;
    notes?: string;
    isActive?: boolean;
    contacts?: CustomerContact[];
}

/**
 * DTO cập nhật khách hàng
 */
export interface UpdateCustomerDto {
    customerName?: string;
    type?: CustomerType;
    customerGroup?: CustomerGroup;
    phoneNumber?: string;
    email?: string;
    address?: string;
    city?: string;
    district?: string;
    ward?: string;
    taxCode?: string;
    dateOfBirth?: string;
    gender?: string;
    notes?: string;
    isActive?: boolean;
    contacts?: CustomerContact[];
}

/**
 * Tham số bộ lọc danh sách khách hàng
 */
export interface CustomerFilterParams {
    page?: number;
    pageSize?: number;
    search?: string;
    type?: CustomerType;
    customerGroup?: CustomerGroup;
    isActive?: boolean;
}

/**
 * Thống kê khách hàng
 */
export interface CustomerStatistics {
    totalCustomers: number;
    activeCustomers: number;
    inactiveCustomers: number;
    customersByType: Record<string, number>;
    customersByGroup: Record<string, number>;
}

// Response Types
export type CustomerListResponse = PaginatedResponse<CustomerListDto>;
export type CustomerDetailResponse = ApiResponse<CustomerDetailDto>;
export type CustomerCreateResponse = ApiResponse<CustomerDetailDto>;
export type CustomerUpdateResponse = ApiResponse<CustomerDetailDto>;
export type CustomerDeleteResponse = ApiResponse<boolean>;
export type CustomerStatisticsResponse = ApiResponse<CustomerStatistics>;
export type CustomerCheckCodeResponse = ApiResponse<boolean>;