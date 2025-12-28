// Re-export types từ api.types để sử dụng trong module này
export type {
    UserListDto,
    UserDetailDto,
    CreateUserDto,
    UpdateUserDto,
    UserStatistics
} from '../../../types/api.types';

// ============================================================================
// Component Props Types
// ============================================================================

export interface UserFilters {
    search: string;
    role?: string;
    isActive?: boolean;
}

export interface UserFormModalProps {
    open: boolean;
    editingUser: import('../../../types/api.types').UserDetailDto | null;
    onSave: () => void;
    onCancel: () => void;
    form: import('antd').FormInstance;
}

export interface UserDetailDrawerProps {
    open: boolean;
    user: import('../../../types/api.types').UserDetailDto | null;
    onClose: () => void;
    onEdit: () => void;
    onResetPassword: () => void;
}

export interface ResetPasswordModalProps {
    open: boolean;
    user: import('../../../types/api.types').UserDetailDto | null;
    onConfirm: () => void;
    onCancel: () => void;
    form: import('antd').FormInstance;
}

export interface UserStatisticsCardsProps {
    statistics: import('../../../types/api.types').UserStatistics | null;
}

export interface UserFilterBarProps {
    searchText: string;
    roleFilter?: string;
    statusFilter?: boolean;
    onSearchChange: (value: string) => void;
    onRoleChange: (value: string | undefined) => void;
    onStatusChange: (value: boolean | undefined) => void;
    onSearch: () => void;
}
