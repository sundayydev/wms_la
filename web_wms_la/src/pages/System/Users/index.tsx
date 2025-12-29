import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Button, Space, Form, message, Typography } from 'antd';
import { TeamOutlined, ReloadOutlined, UserAddOutlined } from '@ant-design/icons';
import type { TablePaginationConfig } from 'antd/es/table';
import dayjs from 'dayjs';

// Types
import type {
    UserListDto,
    UserDetailDto,
    CreateUserDto,
    UpdateUserDto,
    UserStatistics
} from '../../../types/api.types';

// Services
import {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserLock,
    resetUserPassword,
    getUserStatistics,
    type GetUsersParams
} from '../../../services/users.service';

// Components
import {
    UserFilterBar,
    UserFormModal,
    UserDetail,
    ResetPasswordModal,
    getUserTableColumns,
} from './components';

const { Title, Text } = Typography;

// ============================================================================
// COMPONENT CHÍNH
// ============================================================================

const UserListPage: React.FC = () => {
    // State
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<UserListDto[]>([]);
    const [statistics, setStatistics] = useState<UserStatistics | null>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
    const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserDetailDto | null>(null);
    const [selectedUser, setSelectedUser] = useState<UserDetailDto | null>(null);
    const [form] = Form.useForm();
    const [resetPasswordForm] = Form.useForm();

    // Filters
    const [searchText, setSearchText] = useState('');
    const [roleFilter, setRoleFilter] = useState<string | undefined>();
    const [statusFilter, setStatusFilter] = useState<boolean | undefined>();

    // ============================================================================
    // Data Fetching
    // ============================================================================

    const fetchUsers = useCallback(async (params?: GetUsersParams) => {
        setLoading(true);
        try {
            const response = await getUsers({
                page: params?.page || pagination.current,
                pageSize: params?.pageSize || pagination.pageSize,
                search: params?.search ?? searchText,
                role: params?.role ?? roleFilter,
                isActive: params?.isActive ?? statusFilter,
            });

            setUsers(response.data);
            setPagination(prev => ({
                ...prev,
                current: response.currentPage,
                total: response.totalItems,
            }));
        } catch (error) {
            message.error('Không thể tải danh sách người dùng');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [pagination.current, pagination.pageSize, searchText, roleFilter, statusFilter]);

    const fetchStatistics = useCallback(async () => {
        try {
            const stats = await getUserStatistics();
            setStatistics(stats);
        } catch (error) {
            console.error('Không thể tải thống kê:', error);
        }
    }, []);

    const fetchUserDetail = async (id: string): Promise<UserDetailDto> => {
        try {
            const user = await getUserById(id);
            return user;
        } catch (error) {
            message.error('Không thể tải thông tin người dùng');
            throw error;
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchStatistics();
    }, []);

    // ============================================================================
    // Handlers
    // ============================================================================

    const handleTableChange = (paginationConfig: TablePaginationConfig) => {
        fetchUsers({
            page: paginationConfig.current,
            pageSize: paginationConfig.pageSize,
        });
    };

    const handleSearch = () => {
        fetchUsers({ page: 1 });
    };

    const handleRefresh = () => {
        setSearchText('');
        setRoleFilter(undefined);
        setStatusFilter(undefined);
        fetchUsers({ page: 1, search: '', role: undefined, isActive: undefined });
        fetchStatistics();
    };

    const handleAdd = () => {
        setEditingUser(null);
        form.resetFields();
        form.setFieldsValue({
            isActive: true,
            role: 'WAREHOUSE',
        });
        setIsModalOpen(true);
    };

    const handleEdit = async (record: UserListDto) => {
        try {
            const userDetail = await fetchUserDetail(record.userID);
            setEditingUser(userDetail);
            form.setFieldsValue({
                ...userDetail,
                dateOfBirth: userDetail.dateOfBirth ? dayjs(userDetail.dateOfBirth) : undefined,
            });
            setIsModalOpen(true);
        } catch {
            // Error already handled in fetchUserDetail
        }
    };

    const handleViewDetail = async (record: UserListDto) => {
        try {
            const userDetail = await fetchUserDetail(record.userID);
            setSelectedUser(userDetail);
            setIsDetailDrawerOpen(true);
        } catch {
            // Error already handled
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteUser(id);
            message.success('Đã xóa người dùng thành công');
            fetchUsers();
            fetchStatistics();
        } catch {
            message.error('Không thể xóa người dùng');
        }
    };

    const handleToggleLock = async (id: string, currentLockStatus: boolean) => {
        try {
            await toggleUserLock(id, !currentLockStatus);
            message.success(currentLockStatus ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
            fetchUsers();
            fetchStatistics();
        } catch {
            message.error('Không thể thay đổi trạng thái khóa');
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            const userData = {
                ...values,
                dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : undefined,
            };

            if (editingUser) {
                // Update
                const updateData: UpdateUserDto = {
                    fullName: userData.fullName,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    role: userData.role,
                    dateOfBirth: userData.dateOfBirth,
                    gender: userData.gender,
                    address: userData.address,
                    isActive: userData.isActive,
                    warehouseID: userData.warehouseID,
                };
                await updateUser(editingUser.userID, updateData);
                message.success('Cập nhật thông tin thành công!');
            } else {
                // Create
                const createData: CreateUserDto = {
                    username: userData.username,
                    password: userData.password,
                    fullName: userData.fullName,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    role: userData.role,
                    dateOfBirth: userData.dateOfBirth,
                    gender: userData.gender,
                    address: userData.address,
                    isActive: userData.isActive ?? true,
                    warehouseID: userData.warehouseID,
                };
                await createUser(createData);
                message.success('Thêm người dùng mới thành công!');
            }

            setIsModalOpen(false);
            fetchUsers();
            fetchStatistics();
        } catch (error: unknown) {
            const err = error as { errorFields?: unknown; message?: string };
            if (err?.errorFields) {
                // Form validation error
                return;
            }
            message.error(err?.message || 'Có lỗi xảy ra');
        }
    };

    const handleResetPassword = async () => {
        if (!selectedUser) return;

        try {
            const values = await resetPasswordForm.validateFields();
            await resetUserPassword(selectedUser.userID, values.newPassword);
            message.success('Đã đặt lại mật khẩu thành công');
            setIsResetPasswordModalOpen(false);
            resetPasswordForm.resetFields();
        } catch (error: unknown) {
            const err = error as { errorFields?: unknown; message?: string };
            if (err?.errorFields) return;
            message.error(err?.message || 'Không thể đặt lại mật khẩu');
        }
    };

    const handleEditFromDrawer = () => {
        setIsDetailDrawerOpen(false);
        if (selectedUser) {
            handleEdit(selectedUser as UserListDto);
        }
    };

    // ============================================================================
    // Table Columns
    // ============================================================================

    const columns = getUserTableColumns({
        onView: handleViewDetail,
        onEdit: handleEdit,
        onDelete: handleDelete,
        onToggleLock: handleToggleLock,
    });

    // ============================================================================
    // Render
    // ============================================================================

    return (
        <div className="w-full space-y-6">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                        <TeamOutlined />
                        Quản lý Người dùng
                    </Title>
                    <Text type="secondary" className="mt-1">
                        Quản lý tài khoản và phân quyền truy cập hệ thống WMS
                    </Text>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                        Làm mới
                    </Button>
                    <Button
                        type="primary"
                        icon={<UserAddOutlined />}
                        onClick={handleAdd}
                    >
                        Thêm người dùng
                    </Button>
                </Space>
            </div>

            {/* FILTER BAR */}
            <UserFilterBar
                searchText={searchText}
                roleFilter={roleFilter}
                statusFilter={statusFilter}
                onSearchChange={setSearchText}
                onRoleChange={setRoleFilter}
                onStatusChange={setStatusFilter}
                onSearch={handleSearch}
            />

            {/* TABLE */}
            <Card
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                styles={{ body: { padding: 0 } }}
            >
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="userID"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Tổng ${total} người dùng`,
                        pageSizeOptions: ['10', '20', '50', '100'],
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1400 }}
                    rowClassName="hover:bg-gray-50 transition-colors"
                />
            </Card>

            {/* MODALS & DRAWERS */}
            <UserFormModal
                open={isModalOpen}
                editingUser={editingUser}
                onSave={handleSave}
                onCancel={() => setIsModalOpen(false)}
                form={form}
            />

            <UserDetail
                open={isDetailDrawerOpen}
                user={selectedUser}
                onClose={() => setIsDetailDrawerOpen(false)}
                onEdit={handleEditFromDrawer}
                onResetPassword={() => setIsResetPasswordModalOpen(true)}
            />

            <ResetPasswordModal
                open={isResetPasswordModalOpen}
                user={selectedUser}
                onConfirm={handleResetPassword}
                onCancel={() => {
                    setIsResetPasswordModalOpen(false);
                    resetPasswordForm.resetFields();
                }}
                form={resetPasswordForm}
            />
        </div>
    );
};

export default UserListPage;
