import apiClient from '../config/api.config';
import type { DocumentItem, SpecificationItem, SpecificationGroup } from '../types/type.component';

const BASE_URL = '/Products';

// ============================================================
// TYPES
// ============================================================

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
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface CreateProductDto {
    sku: string;
    componentName: string;
    componentNameVN?: string;
    categoryID?: string;
    supplierID?: string;
    productType: string;
    brand?: string;
    model?: string;
    manufacturerSKU?: string;
    barcode?: string;
    unit?: string;
    imageURL?: string;
    imageGallery: string; // JSON string
    basePrice?: number;
    sellPrice?: number;
    wholesalePrice?: number;
    isSerialized: boolean;
    minStockLevel: number;
    maxStockLevel?: number;
    defaultWarrantyMonths: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    specifications: string; // JSON string
    tags: string; // JSON string
    documents: string; // JSON string
    competitors: string; // JSON string
    compatibleWith: string; // JSON string
    status: string;
    shortDescription?: string;
    fullDescription?: string;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }

export interface ProductDetailDto {
    componentID: string;
    sku: string;
    componentName: string;
    componentNameVN?: string | null;
    categoryID?: string | null;
    categoryName?: string | null;
    supplierID?: string | null;
    supplierName?: string | null;
    productType: string;
    brand?: string | null;
    model?: string | null;
    manufacturerSKU?: string | null;
    barcode?: string | null;
    unit?: string | null;
    imageURL?: string | null;
    imageGallery: string;
    basePrice?: number | null;
    sellPrice?: number | null;
    wholesalePrice?: number | null;
    isSerialized: boolean;
    minStockLevel: number;
    maxStockLevel?: number | null;
    defaultWarrantyMonths: number;
    weight?: number | null;
    length?: number | null;
    width?: number | null;
    height?: number | null;
    specifications: string;
    tags: string;
    documents: string;
    competitors: string;
    compatibleWith: string;
    status: string;
    shortDescription?: string | null;
    fullDescription?: string | null;
    createdAt: string;
    updatedAt: string;
    variantCount: number;
    totalStock: number;
    variants: ProductVariantDto[];
}

export interface ProductListDto {
    componentID: string;
    sku: string;
    componentName: string;
    categoryID?: string | null;
    categoryName?: string | null;
    unit?: string | null;
    imageURL?: string | null;
    basePrice?: number | null;
    sellPrice?: number | null;
    isSerialized: boolean;
    variantCount: number;
    totalStock: number;
    createdAt?: string;
}

export interface ProductVariantDto {
    variantID: string;
    partNumber: string;
    variantName?: string | null;
    variantDescription?: string | null;
    variantSpecs?: string | null;
    basePrice?: number | null;
    sellPrice?: number | null;
    wholesalePrice?: number | null;
    barcode?: string | null;
    minStockLevel: number;
    maxStockLevel?: number | null;
    isActive: boolean;
    isDefault: boolean;
    sortOrder: number;
    stockCount: number;
}

export interface CategoryDto {
    categoryID: string;
    categoryName: string;
    categoryCode?: string;
    description?: string;
    parentCategoryID?: string;
    level: number;
    path?: string;
}

export interface ProductStatistics {
    totalProducts: number;
    serializedProducts: number;
    quantityProducts: number;
    totalVariants: number;
    totalStock: number;
}

// ============================================================
// API FUNCTIONS
// ============================================================

/**
 * Lấy danh sách sản phẩm
 */
export const getAllProducts = async (
    page = 1,
    pageSize = 20,
    search?: string,
    categoryId?: string,
    isSerialized?: boolean
): Promise<PaginatedResponse<ProductListDto>> => {
    const response = await apiClient.get<PaginatedResponse<ProductListDto>>(BASE_URL, {
        params: { page, pageSize, search, categoryId, isSerialized },
    });
    return response.data;
};

/**
 * Lấy danh sách sản phẩm cho dropdown
 */
export const getAllProductsForSelect = async (): Promise<ApiResponse<ProductListDto[]>> => {
    const response = await apiClient.get<ApiResponse<ProductListDto[]>>(`${BASE_URL}/select`);
    return response.data;
};

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export const getProductById = async (id: string): Promise<ApiResponse<ProductDetailDto>> => {
    const response = await apiClient.get<ApiResponse<ProductDetailDto>>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Lấy sản phẩm theo SKU
 */
export const getProductBySKU = async (sku: string): Promise<ApiResponse<ProductDetailDto>> => {
    const response = await apiClient.get<ApiResponse<ProductDetailDto>>(`${BASE_URL}/sku/${sku}`);
    return response.data;
};

/**
 * Tạo sản phẩm mới
 */
export const createProduct = async (data: CreateProductDto): Promise<ApiResponse<ProductDetailDto>> => {
    const response = await apiClient.post<ApiResponse<ProductDetailDto>>(BASE_URL, data);
    return response.data;
};

/**
 * Cập nhật sản phẩm
 */
export const updateProduct = async (id: string, data: UpdateProductDto): Promise<ApiResponse<ProductDetailDto>> => {
    const response = await apiClient.put<ApiResponse<ProductDetailDto>>(`${BASE_URL}/${id}`, data);
    return response.data;
};

/**
 * Xóa sản phẩm (soft delete)
 */
export const deleteProduct = async (id: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Lấy danh sách danh mục
 */
export const getCategories = async (): Promise<ApiResponse<CategoryDto[]>> => {
    const response = await apiClient.get<ApiResponse<CategoryDto[]>>(`${BASE_URL}/categories`);
    return response.data;
};

/**
 * Kiểm tra SKU đã tồn tại
 */
export const checkSKUExists = async (sku: string, excludeId?: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.get<ApiResponse<boolean>>(`${BASE_URL}/check-sku`, {
        params: { sku, excludeId },
    });
    return response.data;
};

/**
 * Kiểm tra Part Number đã tồn tại
 */
export const checkPartNumberExists = async (partNumber: string, excludeId?: string): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.get<ApiResponse<boolean>>(`${BASE_URL}/check-partnumber`, {
        params: { partNumber, excludeId },
    });
    return response.data;
};

/**
 * Lấy thống kê sản phẩm
 */
export const getStatistics = async (): Promise<ApiResponse<ProductStatistics>> => {
    const response = await apiClient.get<ApiResponse<ProductStatistics>>(`${BASE_URL}/statistics`);
    return response.data;
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Types cho Specifications mới - moved to type.component.ts

// Định dạng lưu trong DB: { "GROUP_NAME": [{ k, v, q }, ...], ... }
export type SpecificationsDbFormat = Record<string, Array<{ k: string; v: string; q?: number }>>;

/**
 * Chuyển đổi từ form data sang DTO để gửi API
 * Form format: [{ groupName: "...", items: [{ k, v, q }, ...] }, ...]
 * DB format: { "GROUP_NAME": [{ k, v, q }, ...], ... }
 */
export const convertFormToCreateDto = (formData: any): CreateProductDto => {
    // Convert specifications from form format to DB format
    const specGroups: SpecificationGroup[] = formData.specifications || [];
    const specObject: SpecificationsDbFormat = {};

    specGroups.forEach((group) => {
        if (group.groupName && group.items && group.items.length > 0) {
            specObject[group.groupName] = group.items
                .filter((item) => item.k && item.v) // Only include items with both k and v
                .map((item) => ({
                    k: item.k,
                    v: item.v,
                    ...(item.q ? { q: 1 } : {}), // Only include q if it's true/1
                }));
        }
    });

    return {
        sku: formData.sku,
        componentName: formData.componentName,
        componentNameVN: formData.componentNameVN || undefined,
        categoryID: formData.categoryId || undefined,
        supplierID: formData.supplierId || undefined,
        productType: formData.productType || 'DEVICE',
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        manufacturerSKU: formData.manufacturerSKU || undefined,
        barcode: formData.barcode || undefined,
        unit: formData.unit,
        imageURL: formData.imageUrl,
        imageGallery: JSON.stringify(formData.imageGallery || []),
        basePrice: formData.basePrice,
        sellPrice: formData.sellPrice,
        wholesalePrice: formData.wholesalePrice,
        isSerialized: formData.isSerialized ?? true,
        minStockLevel: formData.minStockLevel || 0,
        maxStockLevel: formData.maxStockLevel || undefined,
        defaultWarrantyMonths: formData.defaultWarrantyMonths || 12,
        weight: formData.weight || undefined,
        length: formData.length || undefined,
        width: formData.width || undefined,
        height: formData.height || undefined,
        specifications: JSON.stringify(specObject),
        tags: JSON.stringify(formData.tags || []),
        documents: JSON.stringify(formData.documents || []),
        competitors: JSON.stringify(formData.competitors || []),
        compatibleWith: JSON.stringify(formData.compatibleWith || []),
        status: formData.status || 'ACTIVE',
        shortDescription: formData.shortDescription || undefined,
        fullDescription: formData.fullDescription || undefined,
    };
};

/**
 * Chuyển đổi từ DTO sang form data để hiển thị
 * DB format: { "GROUP_NAME": [{ k, v, q }, ...], ... }
 * Form format: [{ groupName: "...", items: [{ k, v, q }, ...] }, ...]
 */
export const convertDtoToFormData = (dto: ProductDetailDto): any => {
    // Parse specifications JSON to grouped format
    let specifications: SpecificationGroup[] = [];
    try {
        const specObj = JSON.parse(dto.specifications || '{}');

        // Check if it's the new grouped format or old flat format
        if (typeof specObj === 'object' && !Array.isArray(specObj)) {
            const firstValue = Object.values(specObj)[0];

            if (Array.isArray(firstValue)) {
                // New grouped format: { "GROUP_NAME": [{ k, v, q }, ...], ... }
                specifications = Object.entries(specObj).map(([groupName, items]) => ({
                    groupName,
                    items: (items as SpecificationItem[]).map((item) => ({
                        k: item.k,
                        v: item.v,
                        q: Boolean(item.q),
                    })),
                }));
            } else {
                // Old flat format: { "key": "value", ... } - convert to grouped format
                specifications = [{
                    groupName: 'GENERAL SPECIFICATIONS',
                    items: Object.entries(specObj).map(([k, v]) => ({
                        k,
                        v: String(v),
                        q: false,
                    })),
                }];
            }
        }
    } catch (e) {
        console.warn('Failed to parse specifications:', e);
    }

    // Parse documents JSON
    let documents: DocumentItem[] = [];
    try {
        documents = JSON.parse(dto.documents || '[]');
    } catch (e) {
        console.warn('Failed to parse documents:', e);
    }

    // Parse competitors JSON
    let competitors: string[] = [];
    try {
        competitors = JSON.parse(dto.competitors || '[]');
    } catch (e) {
        console.warn('Failed to parse competitors:', e);
    }

    // Parse tags JSON
    let tags: string[] = [];
    try {
        tags = JSON.parse(dto.tags || '[]');
    } catch (e) {
        console.warn('Failed to parse tags:', e);
    }

    // Parse compatibleWith JSON
    let compatibleWith: any[] = [];
    try {
        compatibleWith = JSON.parse(dto.compatibleWith || '[]');
    } catch (e) {
        console.warn('Failed to parse compatibleWith:', e);
    }

    // Parse imageGallery JSON
    let imageGallery: string[] = [];
    try {
        imageGallery = JSON.parse(dto.imageGallery || '[]');
    } catch (e) {
        console.warn('Failed to parse imageGallery:', e);
    }

    return {
        sku: dto.sku,
        componentName: dto.componentName,
        componentNameVN: dto.componentNameVN,
        categoryId: dto.categoryID,
        supplierId: dto.supplierID,
        productType: dto.productType,
        brand: dto.brand,
        model: dto.model,
        manufacturerSKU: dto.manufacturerSKU,
        barcode: dto.barcode,
        unit: dto.unit,
        imageUrl: dto.imageURL,
        imageGallery,
        basePrice: dto.basePrice,
        sellPrice: dto.sellPrice,
        wholesalePrice: dto.wholesalePrice,
        isSerialized: dto.isSerialized,
        minStockLevel: dto.minStockLevel,
        maxStockLevel: dto.maxStockLevel,
        defaultWarrantyMonths: dto.defaultWarrantyMonths,
        weight: dto.weight,
        length: dto.length,
        width: dto.width,
        height: dto.height,
        specifications,
        tags,
        documents,
        competitors,
        compatibleWith,
        status: dto.status,
        shortDescription: dto.shortDescription,
        fullDescription: dto.fullDescription,
    };
};

const productsService = {
    getAllProducts,
    getAllProductsForSelect,
    getProductById,
    getProductBySKU,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    checkSKUExists,
    checkPartNumberExists,
    getStatistics,
    convertFormToCreateDto,
    convertDtoToFormData,
};

export default productsService;
