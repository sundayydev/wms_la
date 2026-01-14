import apiClient from '../config/api.config';
import type { Component, ComponentFilterParams, ComponentListResponse, Variant, Category } from '../types/type.component';

const BASE_URL = '/Products';

// Helper to parse JSON safely
const tryParse = (json?: string) => {
    if (!json) return undefined;
    try {
        return JSON.parse(json);
    } catch {
        return [];
    }
};

// Map backend DTO to frontend Component
const mapToComponent = (dto: any): Component => {
    let specs = {};
    try {
        if (dto.specifications) {
            specs = JSON.parse(dto.specifications);
        }
    } catch { }

    // Transform variants
    const variants: Variant[] = Array.isArray(dto.variants) ? dto.variants.map((v: any) => ({
        variantId: v.variantID,
        partNumber: v.partNumber,
        variantName: v.variantName,
        variantDescription: v.variantDescription,
        variantSpecs: v.variantSpecs,
        basePrice: v.basePrice,
        sellPrice: v.sellPrice,
        wholesalePrice: v.wholesalePrice,
        barcode: v.barcode,
        minStockLevel: v.minStockLevel || 0,
        maxStockLevel: v.maxStockLevel,
        isActive: v.isActive,
        isDefault: v.isDefault,
        sortOrder: v.sortOrder || 0,
        stockCount: v.stockCount || 0
    })) : [];

    const category: Category | undefined = dto.categoryID ? {
        categoryId: dto.categoryID,
        categoryName: dto.categoryName || '',
    } : undefined;

    const supplier = dto.supplierID ? {
        supplierId: dto.supplierID,
        supplierName: dto.supplierName || '',
        supplierCode: dto.supplierCode,
    } : undefined;

    return {
        componentId: dto.componentID,
        sku: dto.sku,
        componentName: dto.componentName,
        componentNameVN: dto.componentNameVN,
        categoryId: dto.categoryID,
        category,
        supplierId: dto.supplierID,
        supplier,
        productType: dto.productType,
        brand: dto.brand,
        model: dto.model,
        manufacturerSKU: dto.manufacturerSKU,
        barcode: dto.barcode,
        unit: dto.unit,
        imageUrl: dto.imageURL,
        imageGallery: tryParse(dto.imageGallery),
        basePrice: dto.basePrice,
        sellPrice: dto.sellPrice,
        wholesalePrice: dto.wholesalePrice,
        isSerialized: dto.isSerialized,
        minStockLevel: dto.minStockLevel,
        maxStockLevel: dto.maxStockLevel,
        currentStock: dto.totalStock,
        defaultWarrantyMonths: dto.defaultWarrantyMonths,
        weight: dto.weight,
        length: dto.length,
        width: dto.width,
        height: dto.height,
        specifications: specs,
        tags: tryParse(dto.tags),
        documents: tryParse(dto.documents),
        competitors: tryParse(dto.competitors),
        compatibleWith: tryParse(dto.compatibleWith),
        status: dto.status,
        shortDescription: dto.shortDescription,
        fullDescription: dto.fullDescription,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt,
        variants,
    };
};

// Lấy danh sách sản phẩm
export const getComponents = async (params?: ComponentFilterParams): Promise<ComponentListResponse> => {
    const response = await apiClient.get<any>(BASE_URL, { params });
    if (response.data.success) {
        // Handle pagination response structure from backend
        // Assuming backend returns { data: [], totalCount: ... } inside response.data.data
        const result = response.data.data;
        return {
            data: Array.isArray(result.data) ? result.data.map((item: any) => mapToComponent(item)) : [],
            total: result.totalCount || 0,
            page: result.page || 1,
            pageSize: result.pageSize || 20
        };
    }
    throw new Error(response.data.message);
};

// Lấy danh sách sản phẩm cho dropdown (không phân trang)
export const getComponentsForSelect = async (): Promise<Component[]> => {
    const response = await apiClient.get<any>(`${BASE_URL}/select`);
    if (response.data.success) {
        const data = response.data.data;
        return Array.isArray(data) ? data.map((item: any) => mapToComponent(item)) : [];
    }
    throw new Error(response.data.message || 'Không thể lấy danh sách sản phẩm');
};

// Lấy chi tiết sản phẩm
export const getComponentById = async (id: string): Promise<Component> => {
    const response = await apiClient.get<any>(`${BASE_URL}/${id}`);
    if (response.data.success) {
        return mapToComponent(response.data.data);
    }
    throw new Error(response.data.message || 'Không tìm thấy sản phẩm');
};

// Tạo sản phẩm mới
export const createComponent = async (data: Partial<Component>): Promise<Component> => {
    // Need to map Component back to CreateProductDto if necessary, or just send partial
    // For now assuming backend accepts the payload or we map it. 
    // Given the complexity, we might need a reverse mapper or use productsService.convertFormToCreateDto
    // But keeping it simple for now as requested task is about ProductDetail (Read).
    const response = await apiClient.post<any>(BASE_URL, data);
    return response.data.data ? mapToComponent(response.data.data) : response.data;
};

// Cập nhật sản phẩm
export const updateComponent = async (id: string, data: Partial<Component>): Promise<Component> => {
    const response = await apiClient.put<any>(`${BASE_URL}/${id}`, data);
    return response.data.data ? mapToComponent(response.data.data) : response.data;
};

// Xóa sản phẩm (soft delete)
export const deleteComponent = async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
};

// ============ Compatible Products APIs ============

// DTO từ backend (ComponentCompatibilityDto)
export interface ComponentCompatibilityBackendDto {
    sourceComponentID: string;
    sourceComponentName: string;
    sourceComponentSKU: string;
    sourceComponentImageURL?: string;
    sourceComponentProductType?: string;
    targetComponentID: string;
    targetComponentName: string;
    targetComponentSKU: string;
    targetComponentImageURL?: string;
    targetComponentProductType?: string;
    note?: string;
}

// DTO cho sản phẩm tương thích (frontend simplified)
export interface CompatibleProductDto {
    componentID: string; // This will be populated based on context
    sku: string;
    name: string;
    imageURL?: string;
    productType?: string;
    notes?: string;
    createdAt?: string;
}

/**
 * Transform backend ComponentCompatibilityDto thành frontend CompatibleProductDto
 * @param backendDto - DTO từ backend
 * @param currentProductId - ID của sản phẩm hiện tại đang xem
 * @returns CompatibleProductDto - DTO đã transform để hiển thị
 */
const transformCompatibilityDto = (
    backendDto: ComponentCompatibilityBackendDto,
    currentProductId: string
): CompatibleProductDto => {
    // Nếu currentProductId là Source, thì hiển thị thông tin Target (và ngược lại)
    const isSource = backendDto.sourceComponentID === currentProductId;

    return {
        componentID: isSource ? backendDto.targetComponentID : backendDto.sourceComponentID,
        sku: isSource ? backendDto.targetComponentSKU : backendDto.sourceComponentSKU,
        name: isSource ? backendDto.targetComponentName : backendDto.sourceComponentName,
        imageURL: isSource ? backendDto.targetComponentImageURL : backendDto.sourceComponentImageURL,
        productType: isSource ? backendDto.targetComponentProductType : backendDto.sourceComponentProductType,
        notes: backendDto.note
    };
};

/**
 * Lấy danh sách phụ kiện tương thích với một thiết bị
 * Ví dụ: Máy PDA này dùng được pin/phụ kiện nào?
 * API: GET /Products/{componentId}/compatible-accessories
 */
export const getCompatibleAccessories = async (componentId: string): Promise<CompatibleProductDto[]> => {
    const response = await apiClient.get<any>(`${BASE_URL}/${componentId}/compatible-accessories`);
    if (response.data.success) {
        const backendData: ComponentCompatibilityBackendDto[] = response.data.data || [];
        return backendData.map(dto => transformCompatibilityDto(dto, componentId));
    }
    throw new Error(response.data.message || 'Không thể lấy danh sách phụ kiện tương thích');
};

/**
 * Lấy danh sách thiết bị tương thích với một Component  
 * Ví dụ: Pin này dùng được cho máy nào?
 * API: GET /Products/{componentId}/compatible-targets
 */
export const getCompatibleTargets = async (componentId: string): Promise<CompatibleProductDto[]> => {
    const response = await apiClient.get<any>(`${BASE_URL}/${componentId}/compatible-targets`);
    if (response.data.success) {
        const backendData: ComponentCompatibilityBackendDto[] = response.data.data || [];
        return backendData.map(dto => transformCompatibilityDto(dto, componentId));
    }
    throw new Error(response.data.message || 'Không thể lấy danh sách thiết bị tương thích');
};

/**
 * Lấy danh sách sản phẩm tương thích (wrapper function)
 * Tự động gọi cả accessories và targets, kết hợp kết quả
 */
export const getCompatibleProducts = async (productId: string): Promise<CompatibleProductDto[]> => {
    try {
        const [accessories, targets] = await Promise.all([
            getCompatibleAccessories(productId).catch(() => []),
            getCompatibleTargets(productId).catch(() => [])
        ]);

        // Combine and deduplicate
        const combined = [...accessories, ...targets];
        const seen = new Set<string>();
        return combined.filter(item => {
            if (seen.has(item.componentID)) return false;
            seen.add(item.componentID);
            return true;
        });
    } catch (error) {
        console.error('Error fetching compatible products:', error);
        return [];
    }
};

/**
 * Tạo mối quan hệ tương thích giữa 2 Components
 * API: POST /Products/compatibility
 */
export const createCompatibility = async (
    sourceComponentID: string,
    targetComponentID: string,
    notes?: string
): Promise<CompatibleProductDto> => {
    const response = await apiClient.post<any>(`${BASE_URL}/compatibility`, {
        sourceComponentID,
        targetComponentID,
        notes
    });
    if (response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data.message || 'Không thể tạo compatibility');
};

/**
 * Thêm một sản phẩm vào danh sách tương thích
 * (wrapper sử dụng createCompatibility)
 */
export const addCompatibleProduct = async (
    productId: string,
    compatibleId: string,
    notes?: string
): Promise<void> => {
    await createCompatibility(productId, compatibleId, notes);
};

/**
 * Thêm nhiều sản phẩm vào danh sách tương thích
 * (wrapper gọi createCompatibility nhiều lần)
 */
export const addCompatibleProducts = async (
    productId: string,
    compatibleIds: string[],
    notes?: string
): Promise<void> => {
    await Promise.all(
        compatibleIds.map(compatibleId =>
            createCompatibility(productId, compatibleId, notes)
        )
    );
};

/**
 * Xóa một compatibility
 * API: DELETE /Products/compatibility/{sourceId}/{targetId}
 */
export const deleteCompatibility = async (
    sourceId: string,
    targetId: string
): Promise<void> => {
    const response = await apiClient.delete<any>(`${BASE_URL}/compatibility/${sourceId}/${targetId}`);
    if (!response.data.success) {
        throw new Error(response.data.message || 'Không thể xóa compatibility');
    }
};

/**
 * Xóa một sản phẩm khỏi danh sách tương thích
 * (wrapper sử dụng deleteCompatibility)
 */
export const removeCompatibleProduct = async (
    productId: string,
    compatibleId: string
): Promise<void> => {
    await deleteCompatibility(productId, compatibleId);
};


// ============ Product Statistics API ============

// DTO cho thống kê theo danh mục
export interface CategoryStatDto {
    category: string;
    count: number;
}

// DTO cho thống kê sản phẩm
export interface ProductStatisticsDto {
    totalProducts: number;
    totalVariants: number;
    totalInstances: number;
    inStock: number;
    sold: number;
    byCategory: CategoryStatDto[];
}

// Lấy thống kê sản phẩm
export const getProductStatistics = async (): Promise<ProductStatisticsDto> => {
    const response = await apiClient.get<any>(`${BASE_URL}/statistics`);
    if (response.data.success) {
        return response.data.data;
    }
    throw new Error(response.data.message || 'Không thể lấy thống kê sản phẩm');
};

// Lấy danh sách thương hiệu (distinct)
// TODO: API endpoint /brands không tồn tại trong ProductsController backend
// Cần thêm endpoint này ở backend nếu muốn sử dụng
// export const getBrands = async (): Promise<string[]> => {
//     const response = await apiClient.get<string[]>(`${BASE_URL}/brands`);
//     return response.data;
// };

// Xuất Excel
// TODO: API endpoint /export không tồn tại trong ProductsController backend
// Cần thêm endpoint này ở backend nếu muốn sử dụng
// export const exportComponentsToExcel = async (params?: ComponentFilterParams): Promise<Blob> => {
//     const response = await apiClient.get(`${BASE_URL}/export`, {
//         params,
//         responseType: 'blob',
//     });
//     return response.data;
// };

// Import Excel
// TODO: API endpoint /import không tồn tại trong ProductsController backend
// Cần thêm endpoint này ở backend nếu muốn sử dụng
// export const importComponentsFromExcel = async (file: File): Promise<{ success: number; errors: string[] }> => {
//     const formData = new FormData();
//     formData.append('file', file);
//     const response = await apiClient.post<{ success: number; errors: string[] }>(`${BASE_URL}/import`, formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//     });
//     return response.data;
// };

// Default export object containing all service functions
const componentsService = {
    getComponents,
    getComponentsForSelect,
    getComponentById,
    createComponent,
    updateComponent,
    deleteComponent,
    getCompatibleProducts,
    getCompatibleAccessories,
    getCompatibleTargets,
    createCompatibility,
    addCompatibleProduct,
    addCompatibleProducts,
    deleteCompatibility,
    removeCompatibleProduct,
    getProductStatistics,
};

export default componentsService;