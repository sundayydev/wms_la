import apiClient from '../config/api.config';

const BASE_URL = '/KnowledgeBase';

// ============================================================
// TYPES - Match với Backend DTOs
// ============================================================

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    errors?: string[];
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

// Enums matching backend (KnowledgeType, AccessScope, FileStatus)
export type ContentType = 'DOCUMENT' | 'VIDEO' | 'DRIVER' | 'FIRMWARE';
export type AccessScope = 'PUBLIC' | 'INTERNAL';
export type FileStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';

// Backward compatibility alias
export type AccessLevel = AccessScope;

/**
 * DTO để upload tài liệu - Match với KnowledgeBaseUploadDto backend
 */
export interface KnowledgeBaseUploadDto {
    componentID?: string;
    title: string;
    description?: string;
    contentType: ContentType;
    scope: AccessScope;
    videoURL?: string; // Chỉ dùng cho VIDEO type
}

/**
 * DTO kết quả trả về - Match với KnowledgeBaseResultDto backend
 */
export interface KnowledgeBaseResultDto {
    knowledgeID: string;
    componentID?: string;
    title: string;
    description?: string;
    contentType: ContentType;
    scope: AccessScope;
    processStatus: FileStatus;

    // MinIO Storage Info
    bucketName?: string;
    objectKey?: string;
    fileSize?: number;
    mimeType?: string;
    originalFileName?: string;

    // Preview & Media URLs (presigned)
    previewObjectKey?: string;
    thumbnailObjectKey?: string;
    externalVideoURL?: string;

    // Metadata
    createdByUserID?: string;
    createdByUserName?: string;
    createdAt: string;
    updatedByUserID?: string;
    updatedByUserName?: string;
    updatedAt?: string;

    // Sharing info (aggregated)
    shareCount: number;
    totalDownloads: number;
}

/**
 * DTO tạo share link - Match với CreateShareLinkDto backend
 */
export interface CreateShareLinkDto {
    expirationMinutes: number;
    maxDownloads?: number;
    targetEmail?: string;
    targetUserID?: string;
    sendEmail?: boolean;
}

/**
 * DTO kết quả share link - Match với ShareLinkResultDto backend
 */
export interface ShareLinkResultDto {
    shareID: string;
    knowledgeID: string;
    shareToken: string;
    shareURL: string;
    expiryDate?: string;
    maxDownloads?: number;
    createdAt: string;
    createdByUserID: string;
}

/**
 * DTO thông tin file chia sẻ - Match với ShareInfoDto backend
 */
export interface ShareInfoDto {
    knowledgeID: string;
    title: string;
    description?: string;
    contentType: ContentType;
    fileSize?: number;
    mimeType?: string;
    originalFileName?: string;
    isExpired: boolean;
    isDownloadLimitReached: boolean;
    remainingDownloads?: number;
    expiresAt?: string;
}

/**
 * DTO Preview URL - Match với PreviewUrlResultDto backend
 */
export interface PreviewUrlResultDto {
    knowledgeID: string;
    contentType: ContentType;
    previewUrl: string;
    originalFileName?: string;
    mimeType?: string;
    processStatus: FileStatus;
    isExternalVideo: boolean;
    expiresAt?: string;
}

/**
 * DTO Thumbnail URL - Match với ThumbnailUrlResultDto backend
 */
export interface ThumbnailUrlResultDto {
    knowledgeID: string;
    thumbnailUrl: string;
    isExternalUrl: boolean;
    expiresAt?: string;
}

/**
 * DTO Download URL - Match với DownloadUrlResultDto backend
 */
export interface DownloadUrlResultDto {
    knowledgeID: string;
    downloadUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    expiresAt: string;
}

/**
 * DTO thống kê - Match với KnowledgeBaseStatisticsDto backend
 */
export interface KnowledgeBaseStatisticsDto {
    totalItems: number;
    totalFileSizeBytes: number;
    sharedItemsCount: number;
    byContentType: Record<string, number>;
    topDownloaded: Array<{
        knowledgeID: string;
        title: string;
        downloadCount: number;
    }>;
}

// ============================================================
// API FUNCTIONS - Match với KnowledgeBaseController endpoints
// ============================================================

// #region CRUD Endpoints

/**
 * POST /api/KnowledgeBase/upload
 * Upload tài liệu vào Knowledge Base
 */
export const uploadKnowledgeBase = async (
    file: File | null,
    dto: KnowledgeBaseUploadDto,
    onUploadProgress?: (progressEvent: any) => void
): Promise<ApiResponse<KnowledgeBaseResultDto>> => {
    const formData = new FormData();

    // Append file nếu không phải VIDEO type
    if (file && dto.contentType !== 'VIDEO') {
        formData.append('file', file);
    }

    // Append các trường bắt buộc (PascalCase để match với backend [FromForm])
    formData.append('Title', dto.title);
    formData.append('ContentType', dto.contentType);
    formData.append('Scope', dto.scope);

    // Append các trường optional
    if (dto.description) {
        formData.append('Description', dto.description);
    }

    if (dto.componentID) {
        formData.append('ComponentID', dto.componentID);
    }

    // VideoURL cho VIDEO type
    if (dto.videoURL && dto.contentType === 'VIDEO') {
        formData.append('VideoURL', dto.videoURL);
    }

    const response = await apiClient.post<ApiResponse<KnowledgeBaseResultDto>>(
        `${BASE_URL}/upload`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress, // Pass progress callback to axios
        }
    );
    return response.data;
};

/**
 * GET /api/KnowledgeBase
 * Lấy danh sách Knowledge Base (yêu cầu xác thực)
 */
export const getAllKnowledgeBase = async (
    page = 1,
    pageSize = 20,
    componentId?: string,
    contentType?: ContentType,
    scope?: AccessScope
): Promise<ApiResponse<PagedResult<KnowledgeBaseResultDto>>> => {
    const response = await apiClient.get<ApiResponse<PagedResult<KnowledgeBaseResultDto>>>(
        BASE_URL,
        {
            params: { page, pageSize, componentId, contentType, scope },
        }
    );
    return response.data;
};

/**
 * GET /api/KnowledgeBase/public
 * Lấy danh sách tài liệu PUBLIC (không cần xác thực)
 */
export const getPublicKnowledgeBase = async (
    page = 1,
    pageSize = 20,
    componentId?: string,
    contentType?: ContentType
): Promise<ApiResponse<PagedResult<KnowledgeBaseResultDto>>> => {
    const response = await apiClient.get<ApiResponse<PagedResult<KnowledgeBaseResultDto>>>(
        `${BASE_URL}/public`,
        {
            params: { page, pageSize, componentId, contentType },
        }
    );
    return response.data;
};

/**
 * GET /api/KnowledgeBase/{id}
 * Lấy chi tiết Knowledge Base item
 */
export const getKnowledgeBaseById = async (
    id: string
): Promise<ApiResponse<KnowledgeBaseResultDto>> => {
    const response = await apiClient.get<ApiResponse<KnowledgeBaseResultDto>>(
        `${BASE_URL}/${id}`
    );
    return response.data;
};

/**
 * GET /api/KnowledgeBase/by-component/{componentId}
 * Lấy danh sách Knowledge Base theo Component
 */
export const getKnowledgeBaseByComponent = async (
    componentId: string
): Promise<ApiResponse<KnowledgeBaseResultDto[]>> => {
    const response = await apiClient.get<ApiResponse<KnowledgeBaseResultDto[]>>(
        `${BASE_URL}/by-component/${componentId}`
    );
    return response.data;
};

/**
 * PUT /api/KnowledgeBase/{id}
 * Cập nhật thông tin Knowledge Base (không cập nhật file)
 */
export const updateKnowledgeBase = async (
    id: string,
    dto: KnowledgeBaseUploadDto
): Promise<ApiResponse<KnowledgeBaseResultDto>> => {
    const response = await apiClient.put<ApiResponse<KnowledgeBaseResultDto>>(
        `${BASE_URL}/${id}`,
        dto
    );
    return response.data;
};

/**
 * DELETE /api/KnowledgeBase/{id}
 * Xóa tài liệu khỏi Knowledge Base
 */
export const deleteKnowledgeBase = async (
    id: string
): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(`${BASE_URL}/${id}`);
    return response.data;
};

// #endregion

// #region Sharing Endpoints

/**
 * POST /api/KnowledgeBase/{id}/share
 * Tạo share link cho tài liệu
 */
export const createShareLink = async (
    id: string,
    dto: CreateShareLinkDto
): Promise<ApiResponse<ShareLinkResultDto>> => {
    const response = await apiClient.post<ApiResponse<ShareLinkResultDto>>(
        `${BASE_URL}/${id}/share`,
        dto
    );
    return response.data;
};

/**
 * DELETE /api/KnowledgeBase/share/{shareId}
 * Hủy share link cụ thể
 */
export const revokeShareLink = async (
    shareId: string
): Promise<ApiResponse<boolean>> => {
    const response = await apiClient.delete<ApiResponse<boolean>>(
        `${BASE_URL}/share/${shareId}`
    );
    return response.data;
};

/**
 * DELETE /api/KnowledgeBase/{id}/shares
 * Hủy tất cả share links của một tài liệu
 */
export const revokeAllShareLinks = async (
    id: string
): Promise<ApiResponse<number>> => {
    const response = await apiClient.delete<ApiResponse<number>>(
        `${BASE_URL}/${id}/shares`
    );
    return response.data;
};

/**
 * GET /api/KnowledgeBase/shared/{shareToken}/info
 * Lấy thông tin file được chia sẻ qua token (không cần xác thực)
 */
export const getSharedFileInfo = async (
    shareToken: string
): Promise<ApiResponse<ShareInfoDto>> => {
    const response = await apiClient.get<ApiResponse<ShareInfoDto>>(
        `${BASE_URL}/shared/${shareToken}/info`
    );
    return response.data;
};

/**
 * GET /api/KnowledgeBase/shared/{shareToken}/download
 * Download file qua share token (không cần xác thực)
 */
export const downloadSharedFile = async (shareToken: string): Promise<void> => {
    const response = await apiClient.get(`${BASE_URL}/shared/${shareToken}/download`, {
        responseType: 'blob',
    });

    // Tạo blob URL và trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Lấy filename từ header hoặc sử dụng default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'download';
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
        if (filenameMatch) {
            filename = decodeURIComponent(filenameMatch[1]);
        }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// #endregion

// #region Download Endpoints

/**
 * GET /api/KnowledgeBase/{id}/download
 * Download file trực tiếp (yêu cầu xác thực)
 */
export const downloadKnowledgeBase = async (id: string): Promise<void> => {
    const response = await apiClient.get(`${BASE_URL}/${id}/download`, {
        responseType: 'blob',
    });

    // Tạo blob URL và trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Lấy filename từ header hoặc sử dụng default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'download';
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i);
        if (filenameMatch) {
            filename = decodeURIComponent(filenameMatch[1]);
        }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

/**
 * GET /api/KnowledgeBase/{id}/presigned-url
 * Lấy presigned URL để download (legacy)
 */
export const getPresignedUrl = async (
    id: string,
    expirationMinutes = 60
): Promise<ApiResponse<string>> => {
    const response = await apiClient.get<ApiResponse<string>>(
        `${BASE_URL}/${id}/presigned-url`,
        {
            params: { expirationMinutes },
        }
    );
    return response.data;
};

/**
 * GET /api/KnowledgeBase/{id}/preview
 * Lấy Preview URL với kiểm tra quyền (hỗ trợ anonymous cho PUBLIC)
 */
export const getPreviewUrl = async (
    id: string,
    expirationMinutes = 15
): Promise<ApiResponse<PreviewUrlResultDto>> => {
    const response = await apiClient.get<ApiResponse<PreviewUrlResultDto>>(
        `${BASE_URL}/${id}/preview`,
        {
            params: { expirationMinutes },
        }
    );
    return response.data;
};

/**
 * GET /api/KnowledgeBase/{id}/thumbnail
 * Lấy Thumbnail URL với kiểm tra quyền (hỗ trợ anonymous cho PUBLIC)
 */
export const getThumbnailUrl = async (
    id: string,
    expirationMinutes = 60
): Promise<ApiResponse<ThumbnailUrlResultDto>> => {
    const response = await apiClient.get<ApiResponse<ThumbnailUrlResultDto>>(
        `${BASE_URL}/${id}/thumbnail`,
        {
            params: { expirationMinutes },
        }
    );
    return response.data;
};

/**
 * GET /api/KnowledgeBase/{id}/download-url
 * Lấy Download URL với kiểm tra quyền (hỗ trợ anonymous cho PUBLIC)
 */
export const getDownloadUrl = async (
    id: string,
    expirationMinutes = 15
): Promise<ApiResponse<DownloadUrlResultDto>> => {
    const response = await apiClient.get<ApiResponse<DownloadUrlResultDto>>(
        `${BASE_URL}/${id}/download-url`,
        {
            params: { expirationMinutes },
        }
    );
    return response.data;
};

// #endregion

// #region Statistics Endpoints

/**
 * GET /api/KnowledgeBase/statistics
 * Lấy thống kê Knowledge Base
 */
export const getStatistics = async (): Promise<ApiResponse<KnowledgeBaseStatisticsDto>> => {
    const response = await apiClient.get<ApiResponse<KnowledgeBaseStatisticsDto>>(
        `${BASE_URL}/statistics`
    );
    return response.data;
};

// #endregion

// ============================================================
// DEFAULT EXPORT - Service object với tất cả functions
// ============================================================

const knowledgeBaseService = {
    // CRUD
    uploadKnowledgeBase,
    getAllKnowledgeBase,
    getPublicKnowledgeBase,
    getKnowledgeBaseById,
    getKnowledgeBaseByComponent,
    updateKnowledgeBase,
    deleteKnowledgeBase,

    // Sharing
    createShareLink,
    revokeShareLink,
    revokeAllShareLinks,
    getSharedFileInfo,
    downloadSharedFile,

    // Download
    downloadKnowledgeBase,
    getPresignedUrl,
    getPreviewUrl,
    getThumbnailUrl,
    getDownloadUrl,

    // Statistics
    getStatistics,
};

export default knowledgeBaseService;
