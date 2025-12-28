import React from 'react';
import { Avatar, Tag, Badge, Tooltip, Button, Space, Popconfirm } from 'antd';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    EditOutlined,
    DeleteOutlined,
    LockOutlined,
    UnlockOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { getRoleConfig } from '../constants';
import type { UserListDto } from '../types';

dayjs.extend(relativeTime);
dayjs.locale('vi');

interface UseUserColumnsProps {
    onView: (record: UserListDto) => void;
    onEdit: (record: UserListDto) => void;
    onDelete: (id: string) => void;
    onToggleLock: (id: string, isLocked: boolean) => void;
}

export const getUserTableColumns = ({
    onView,
    onEdit,
    onDelete,
    onToggleLock,
}: UseUserColumnsProps): ColumnsType<UserListDto> => [
        {
            title: 'Người dùng',
            dataIndex: 'username',
            key: 'user',
            width: 280,
            render: (_, record) => {
                const roleConfig = getRoleConfig(record.role);
                return (
                    <div className="flex items-center gap-3">
                        <Avatar
                            size={44}
                            style={{
                                backgroundColor: roleConfig.color,
                                boxShadow: `0 2px 8px ${roleConfig.color}40`
                            }}
                            icon={<UserOutlined />}
                        />
                        <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 text-base">{record.fullName}</span>
                            <span className="text-sm text-gray-500">@{record.username}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            width: 250,
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MailOutlined className="text-blue-500" />
                        <span>{record.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <PhoneOutlined className="text-green-500" />
                        <span>{record.phoneNumber}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            width: 160,
            render: (role) => {
                const config = getRoleConfig(role);
                return (
                    <Tag
                        style={{
                            color: config.color,
                            backgroundColor: config.bgColor,
                            border: `1px solid ${config.color}30`,
                            fontWeight: 600,
                            fontSize: 13,
                            padding: '4px 12px',
                            borderRadius: 6
                        }}
                        icon={config.icon}
                    >
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Kho',
            dataIndex: 'warehouseName',
            key: 'warehouse',
            width: 150,
            render: (name) => name ? (
                <div className="flex items-center gap-2 text-sm">
                    <HomeOutlined className="text-orange-500" />
                    <span>{name}</span>
                </div>
            ) : <span className="text-gray-400">-</span>,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 140,
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <Badge
                        status={record.isActive ? 'success' : 'error'}
                        text={
                            <span className={record.isActive ? 'text-green-600' : 'text-red-500'}>
                                {record.isActive ? 'Hoạt động' : 'Đã vô hiệu'}
                            </span>
                        }
                    />
                </div>
            ),
        },
        {
            title: 'Đăng nhập gần nhất',
            dataIndex: 'lastLoginAt',
            key: 'lastLogin',
            width: 160,
            render: (date) => date ? (
                <Tooltip title={dayjs(date).format('DD/MM/YYYY HH:mm:ss')}>
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <ClockCircleOutlined />
                        <span>{dayjs(date).fromNow()}</span>
                    </div>
                </Tooltip>
            ) : (
                <span className="text-gray-400 text-sm">Chưa đăng nhập</span>
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'created',
            width: 130,
            render: (date) => (
                <span className="text-gray-500 text-sm">
                    {dayjs(date).format('DD/MM/YYYY')}
                </span>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            fixed: 'right',
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined className="text-gray-600" />}
                            onClick={() => onView(record)}
                        />
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined className="text-blue-600" />}
                            onClick={() => onEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xóa người dùng này?"
                        description="Hành động này sẽ vô hiệu hóa tài khoản."
                        onConfirm={() => onDelete(record.userID)}
                        okText="Xóa"
                        cancelText="Hủy"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];
