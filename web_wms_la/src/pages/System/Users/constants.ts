import {
    SafetyCertificateOutlined,
    HomeOutlined,
    UserOutlined,
    KeyOutlined,
    ManOutlined,
    WomanOutlined,
    QuestionOutlined,
} from '@ant-design/icons';
import React from 'react';

// ============================================================================
// Role Config
// ============================================================================

export interface RoleConfig {
    label: string;
    value: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
}

export const ROLE_OPTIONS: RoleConfig[] = [
    {
        label: 'Quản trị viên',
        value: 'ADMIN',
        color: '#f5222d',
        bgColor: '#fff1f0',
        icon: React.createElement(SafetyCertificateOutlined)
    },
    {
        label: 'Thủ kho',
        value: 'WAREHOUSE',
        color: '#1890ff',
        bgColor: '#e6f7ff',
        icon: React.createElement(HomeOutlined)
    },
    {
        label: 'Lễ tân',
        value: 'RECEPTIONIST',
        color: '#722ed1',
        bgColor: '#f9f0ff',
        icon: React.createElement(UserOutlined)
    },
    {
        label: 'Kỹ thuật viên',
        value: 'TECHNICIAN',
        color: '#fa8c16',
        bgColor: '#fff7e6',
        icon: React.createElement(KeyOutlined)
    },
];

// ============================================================================
// Gender Config
// ============================================================================

export interface GenderConfig {
    label: string;
    value: string;
    icon: React.ReactNode;
}

export const GENDER_OPTIONS: GenderConfig[] = [
    { label: 'Nam', value: 'MALE', icon: React.createElement(ManOutlined) },
    { label: 'Nữ', value: 'FEMALE', icon: React.createElement(WomanOutlined) },
    { label: 'Khác', value: 'OTHER', icon: React.createElement(QuestionOutlined) },
];

// ============================================================================
// Status Options
// ============================================================================

export const STATUS_OPTIONS = [
    { label: 'Đang hoạt động', value: true },
    { label: 'Đã khóa', value: false },
];

// ============================================================================
// Helper Functions
// ============================================================================

export const getRoleConfig = (role: string): RoleConfig => {
    return ROLE_OPTIONS.find(r => r.value === role) || {
        label: role,
        value: role,
        color: '#8c8c8c',
        bgColor: '#fafafa',
        icon: React.createElement(UserOutlined)
    };
};

export const getGenderConfig = (gender?: string): GenderConfig | null => {
    return GENDER_OPTIONS.find(g => g.value === gender) || null;
};
