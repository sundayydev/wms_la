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
    /** TRUE = Quản lý theo Serial/IMEI (từng chiếc), FALSE = Quản lý theo số lượng */
    isSerialized: boolean;
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
    totalQuantity: number;
    receivedQuantity: number;
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

// ReceiveItemDto is defined below with full properties (lines 169-184)

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

/**
 * DTO cho mỗi item được nhận
 */
export interface ReceiveItemDto {
    purchaseOrderDetailID: string;
    quantity?: number;
    serialNumber?: string;
    modelNumber?: string;
    inboundBoxNumber?: string;
    variantID?: string;
    imei1?: string;
    imei2?: string;
    macAddress?: string;
    locationCode?: string;
    zone?: string;
    actualImportPrice?: number;
    warrantyMonths?: number;
    notes?: string;
}

/**
 * DTO để nhận hàng từ Purchase Order
 */
export interface ReceivePurchaseOrderDto {
    items: ReceiveItemDto[];
    receivedDate?: string;
    notes?: string;
}

/**
 * Response sau khi nhận hàng thành công
 */
export interface ReceiveResultDto {
    purchaseOrderID: string;
    orderCode: string;
    receivedItemsCount: number;
    newStatus: string;
    warehouseName: string;
    updatedAt: string;
    receivedSerials: string[];
}

/**
 * Chi tiết một ProductInstance đã nhận
 */
export interface ReceivedInstanceDto {
    instanceID: string;
    serialNumber: string;
    imei1?: string;
    imei2?: string;
    macAddress?: string;
    status: string;
    locationCode?: string;
    zone?: string;
    importDate: string;
    notes?: string;
}

/**
 * Chi tiết sản phẩm đã nhận, bao gồm danh sách serial nếu là serialized
 */
export interface ReceivedItemDetailDto {
    purchaseOrderDetailID: string;
    componentID: string;
    componentSKU: string;
    componentName: string;
    imageURL?: string;
    isSerialized: boolean;
    orderedQuantity: number;
    receivedQuantity: number;
    unitPrice: number;
    instances: ReceivedInstanceDto[];
}

/**
 * Response chứa toàn bộ thông tin hàng đã nhận cho một PO
 */
export interface ReceivedItemsResponseDto {
    purchaseOrderID: string;
    orderCode: string;
    warehouseName: string;
    totalReceivedQuantity: number;
    totalSerializedItems: number;
    totalNonSerializedItems: number;
    items: ReceivedItemDetailDto[];
}

// ====================
// Types cho UI Component (Receiving)
// ====================

/**
 * Alias cho PurchaseOrderStatus - sử dụng trong UI component
 */
export type POStatus = PurchaseOrderStatus;

/**
 * Loại thiết bị - dùng để phân loại và hiển thị icon phù hợp
 */
export type DeviceType = 'PDA' | 'PRINTER' | 'SCANNER' | 'ESL' | 'PHONE' | 'OTHER' | 'CONSUMABLE';

/**
 * Thông tin sản phẩm trong đơn hàng (dùng cho màn hình nhận hàng)
 * Được map từ PurchaseOrderDetailItemDto với các thông tin bổ sung cho UI
 */
export interface POItem {
    itemId: string;
    componentId: string;
    sku: string;
    componentName: string;
    brand?: string;
    orderedQuantity: number;
    receivedQuantity: number;
    unitPrice: number;
    isSerialized: boolean;
    deviceType: DeviceType;
    hasIMEI: boolean;      // Sản phẩm có IMEI (điện thoại, PDA có SIM)
    hasMacAddress: boolean; // Sản phẩm có MAC (thiết bị wifi/bluetooth)
    hasPartNumber: boolean; // Sản phẩm có Part Number (nhiều biến thể)
    imageUrl?: string;
}

/**
 * Thông tin đơn mua hàng đầy đủ (dùng cho màn hình nhận hàng)
 * Được map từ PurchaseOrderDetailDto với format phù hợp cho UI component
 */
export interface PurchaseOrder {
    purchaseOrderId: string;
    orderCode: string;
    supplierName: string;
    supplierCode: string;
    warehouseId: string;
    warehouseName: string;
    orderDate: string;
    expectedDeliveryDate: string;
    status: POStatus;
    items: POItem[];
    totalAmount: number;
    receivedAmount: number;
    createdByName: string;
    notes?: string;
}

/**
 * Sản phẩm đã nhập trong phiên làm việc hiện tại (chưa lưu vào DB)
 * Dùng để quản lý danh sách sản phẩm đang nhập trước khi submit
 */
export interface ReceivedItem {
    key: string;
    poItemId: string;
    sku: string;
    componentName: string;
    serialNumber?: string;
    partNumber?: string;
    imei1?: string;
    imei2?: string;
    macAddress?: string;
    quantity: number;
    status: 'valid' | 'error' | 'duplicate';
    errorMessage?: string;
    notes?: string;
}

/**
 * Thống kê tiến độ nhận hàng cho một sản phẩm
 * Hiển thị số lượng đã nhận, còn lại, và tỷ lệ hoàn thành
 */
export interface ReceivingStats {
    ordered: number;
    previouslyReceived: number;
    currentSession: number;
    totalReceived: number;
    remaining: number;
    percentage: number;
}

/**
 * Thống kê tổng quan về các đơn hàng đang chờ nhận
 * Hiển thị ở dashboard hoặc trang danh sách đơn hàng
 */
export interface POStats {
    totalPending: number;
    totalItems: number;
    totalValue: number;
    deliveredToday: number;
}

// ====================
// History Types
// ====================

/**
 * Action types cho Purchase Order History
 */
export type PurchaseOrderActionType =
    | 'CREATED'
    | 'CONFIRMED'
    | 'RECEIVING_STARTED'
    | 'PARTIAL_RECEIVED'
    | 'FULLY_RECEIVED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'UPDATED'
    | 'PRINTED'
    | 'EMAIL_SENT';

/**
 * DTO hiển thị lịch sử hoạt động của đơn mua hàng
 * Theo dõi ai làm gì và khi nào
 */
export interface PurchaseOrderHistoryDto {
    historyID: string;
    purchaseOrderID: string;
    /** Loại hành động: CREATED, CONFIRMED, RECEIVING_STARTED, etc. */
    action: PurchaseOrderActionType | string;
    /** Trạng thái cũ */
    oldStatus?: string;
    /** Trạng thái mới */
    newStatus?: string;
    /** Người thực hiện */
    performedByUserID?: string;
    performedByUserName?: string;
    performedByEmail?: string;
    /** Thời gian thực hiện */
    performedAt: string;
    /** Mô tả chi tiết */
    description?: string;
    /** Metadata bổ sung (JSON) */
    metadata?: string;
    /** IP Address (cho security audit) */
    ipAddress?: string;
}

/**
 * DTO tạo history record mới
 */
export interface CreatePurchaseOrderHistoryDto {
    purchaseOrderID: string;
    action: PurchaseOrderActionType | string;
    oldStatus?: string;
    newStatus?: string;
    description?: string;
    metadata?: string;
}

// Response Types
export type PurchaseOrderListResponse = PaginatedResponse<PurchaseOrderListDto>;
export type PurchaseOrderDetailResponse = ApiResponse<PurchaseOrderDetailDto>;
export type PurchaseOrderCreateResponse = ApiResponse<PurchaseOrderDetailDto>;
export type PurchaseOrderUpdateResponse = ApiResponse<PurchaseOrderDetailDto>;
export type PurchaseOrderDeleteResponse = ApiResponse<boolean>;
export type PurchaseOrderStatisticsResponse = ApiResponse<PurchaseOrderStatisticsDto>;
export type ReceiveResultResponse = ApiResponse<ReceiveResultDto>;
export type ReceivedItemsResponse = ApiResponse<ReceivedItemsResponseDto>;
export type PurchaseOrderHistoryResponse = ApiResponse<PurchaseOrderHistoryDto[]>;
export type PurchaseOrderHistoryCreateResponse = ApiResponse<PurchaseOrderHistoryDto>;
