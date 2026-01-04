// ====================
// Purchase Order Types
// ====================

import type { ApiResponse, PaginatedResponse } from './api.types';

export type PurchaseOrderStatus = 'PENDING' | 'CONFIRMED' | 'PARTIAL' | 'DELIVERED' | 'CANCELLED';

/**
 * Chi tiết sản phẩm trong đơn mua hàng
 */
export interface PurchaseOrderDetailItemDto {
    purchaseOrderDetailID: string;
    componentID: string;
    componentSKU: string;
    componentName: string;
    imageURL?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    receivedQuantity: number;
    notes?: string;
}

/**
 * DTO tạo mới item trong đơn mua hàng
 */
export interface CreatePurchaseOrderDetailDto {
    componentID: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
}

/**
 * DTO hiển thị danh sách đơn mua hàng
 */
export interface PurchaseOrderListDto {
    purchaseOrderID: string;
    orderCode: string;
    supplierID: string;
    supplierName: string;
    warehouseID: string;
    warehouseName: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    status: PurchaseOrderStatus;
    totalAmount: number;
    finalAmount: number;
    itemCount: number;
    receivedItemCount: number;
    createdByName?: string;
    createdAt: string;
}

/**
 * DTO chi tiết đơn mua hàng
 */
export interface PurchaseOrderDetailDto {
    purchaseOrderID: string;
    orderCode: string;
    // Supplier info
    supplierID: string;
    supplierName: string;
    supplierCode?: string;
    supplierPhone?: string;
    supplierEmail?: string;
    // Warehouse info
    warehouseID: string;
    warehouseName: string;
    // Dates
    orderDate: string;
    expectedDeliveryDate?: string;
    actualDeliveryDate?: string;
    // Status & Amounts
    status: PurchaseOrderStatus;
    totalAmount: number;
    discountAmount: number;
    finalAmount: number;
    // User info
    createdByUserID?: string;
    createdByName?: string;
    notes?: string;
    // Audit
    createdAt: string;
    updatedAt: string;
    // Items
    items: PurchaseOrderDetailItemDto[];
}

/**
 * DTO tạo mới đơn mua hàng
 */
export interface CreatePurchaseOrderDto {
    orderCode?: string;
    supplierID: string;
    warehouseID: string;
    orderDate?: string;
    expectedDeliveryDate?: string;
    discountAmount?: number;
    notes?: string;
    items: CreatePurchaseOrderDetailDto[];
}

/**
 * DTO cập nhật đơn mua hàng
 */
export interface UpdatePurchaseOrderDto {
    expectedDeliveryDate?: string;
    discountAmount?: number;
    notes?: string;
    items?: CreatePurchaseOrderDetailDto[];
}

/**
 * DTO cập nhật trạng thái đơn mua hàng
 */
export interface UpdatePurchaseOrderStatusDto {
    status: PurchaseOrderStatus;
    actualDeliveryDate?: string;
    notes?: string;
}

/**
 * DTO xác nhận nhận hàng
 */
export interface ReceiveItemDto {
    purchaseOrderDetailID: string;
    receivedQuantity: number;
    serialNumbers?: string[];
    notes?: string;
}

/**
 * Tham số bộ lọc danh sách đơn mua hàng
 */
export interface PurchaseOrderFilterParams {
    page?: number;
    pageSize?: number;
    search?: string;
    supplierId?: string;
    warehouseId?: string;
    status?: PurchaseOrderStatus;
    fromDate?: string;
    toDate?: string;
}

/**
 * Thống kê đơn mua hàng
 */
export interface PurchaseOrderStatisticsDto {
    totalOrders: number;
    pendingOrders: number;
    confirmedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalAmountThisMonth: number;
    totalAmountThisYear: number;
    ordersThisMonth: number;
}

// Response Types
export type PurchaseOrderListResponse = PaginatedResponse<PurchaseOrderListDto>;
export type PurchaseOrderDetailResponse = ApiResponse<PurchaseOrderDetailDto>;
export type PurchaseOrderCreateResponse = ApiResponse<PurchaseOrderDetailDto>;
export type PurchaseOrderUpdateResponse = ApiResponse<PurchaseOrderDetailDto>;
export type PurchaseOrderDeleteResponse = ApiResponse<boolean>;
export type PurchaseOrderStatisticsResponse = ApiResponse<PurchaseOrderStatisticsDto>;
