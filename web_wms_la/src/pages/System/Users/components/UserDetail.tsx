import React from 'react';
import {
    Modal,
    Avatar,
    Space,
    Button,
    Tag,
    Badge,
    Row,
    Col,
    Typography,
    Descriptions,
} from 'antd';
import {
    EditOutlined,
    UserOutlined,
    KeyOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    HomeOutlined,
    SafetyCertificateOutlined,
    ClockCircleOutlined,
    GlobalOutlined,
    IdcardOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getRoleConfig, getGenderConfig } from '../constants';
import type { UserDetailDrawerProps } from '../types';

const { Text, Title } = Typography;

const UserDetailModal: React.FC<UserDetailDrawerProps> = ({
    open,
    user,
    onClose,
    onEdit,
    onResetPassword,
}) => {
    if (!user) return null;

    const roleConfig = getRoleConfig(user.role);

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <Avatar
                        size={48}
                        style={{ backgroundColor: roleConfig.color }}
                        icon={<UserOutlined />}
                    />
                    <div>
                        <div className="font-semibold text-lg">{user.fullName}</div>
                        <div className="text-gray-500 text-sm">@{user.username}</div>
                    </div>
                </div>
            }
            open={open}
            onCancel={onClose}
            width={800}
            centered
            footer={
                <div className="flex justify-between">
                    <Button icon={<KeyOutlined />} onClick={onResetPassword}>
                        Đặt lại mật khẩu
                    </Button>
                    <Space>
                        <Button onClick={onClose}>Đóng</Button>
                        <Button type="primary" icon={<EditOutlined />} onClick={onEdit}>
                            Chỉnh sửa
                        </Button>
                    </Space>
                </div>
            }
            styles={{
                header: { paddingBottom: 16, borderBottom: '1px solid #f0f0f0' },
                body: { paddingTop: 24 }
            }}
        >
            {/* Status badges */}
            <div className="flex gap-3 flex-wrap mb-6 items-center justify-between">
                <Tag
                    style={{
                        background: roleConfig.bgColor,
                        color: roleConfig.color,
                        border: `1px solid ${roleConfig.color}30`,
                        padding: '6px 16px',
                        fontSize: 14,
                        fontWeight: 600,
                        borderRadius: 8
                    }}
                    icon={roleConfig.icon}
                >
                    {roleConfig.label}
                </Tag>
                <Tag className="" color={user.isActive ? 'success' : 'error'}>
                    {user.isActive ? 'Hoạt động' : 'Vô hiệu'}
                </Tag>
            </div>

            {/* Thông tin liên hệ */}
            <div className="bg-blue-50 p-5 rounded-xl mb-6 border border-blue-100">
                <div className="flex items-center gap-2 mb-4">
                    <MailOutlined className="text-blue-600" />
                    <span className="font-semibold text-gray-700">Thông tin liên hệ</span>
                </div>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <div className="text-gray-500 text-sm mb-1">Email</div>
                        <div className="flex items-center gap-2">
                            <MailOutlined className="text-gray-400" />
                            <a href={`mailto:${user.email}`} className="text-blue-600">{user.email}</a>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className="text-gray-500 text-sm mb-1">Số điện thoại</div>
                        <div className="flex items-center gap-2">
                            <PhoneOutlined className="text-gray-400" />
                            <a href={`tel:${user.phoneNumber}`} className="text-blue-600">{user.phoneNumber}</a>
                        </div>
                    </Col>
                    {user.address && (
                        <Col span={24}>
                            <div className="text-gray-500 text-sm mb-1">Địa chỉ</div>
                            <div className="flex items-center gap-2">
                                <EnvironmentOutlined className="text-gray-400" />
                                <span>{user.address}</span>
                            </div>
                        </Col>
                    )}
                </Row>
            </div>

            {/* Thông tin cá nhân */}
            <div className="bg-gray-50 p-5 rounded-xl mb-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <UserOutlined className="text-green-600" />
                    <span className="font-semibold text-gray-700">Thông tin cá nhân</span>
                </div>
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <div className="text-gray-500 text-sm mb-1">Ngày sinh</div>
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-gray-400" />
                            <span>
                                {user.dateOfBirth
                                    ? dayjs(user.dateOfBirth).format('DD/MM/YYYY')
                                    : <Text type="secondary">Chưa cập nhật</Text>
                                }
                            </span>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="text-gray-500 text-sm mb-1">Giới tính</div>
                        <div className="flex items-center gap-2">
                            {user.gender ? (
                                <>
                                    {getGenderConfig(user.gender)?.icon}
                                    <span>{getGenderConfig(user.gender)?.label}</span>
                                </>
                            ) : (
                                <Text type="secondary">Chưa cập nhật</Text>
                            )}
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="text-gray-500 text-sm mb-1">Kho phụ trách</div>
                        <div className="flex items-center gap-2">
                            <HomeOutlined className="text-gray-400" />
                            <span>
                                {user.warehouseName || <Text type="secondary">Không có</Text>}
                            </span>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Thông tin hệ thống */}
            <div className="bg-orange-50 p-5 rounded-xl mb-6 border border-orange-100">
                <div className="flex items-center gap-2 mb-4">
                    <SafetyCertificateOutlined className="text-orange-600" />
                    <span className="font-semibold text-gray-700">Thông tin hệ thống</span>
                </div>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <div className="text-gray-500 text-sm mb-1">ID người dùng</div>
                        <div className="flex items-center gap-2">
                            <IdcardOutlined className="text-gray-400" />
                            <Text code copyable style={{ fontSize: 12 }}>{user.userID}</Text>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="text-gray-500 text-sm mb-1">Ngày tạo</div>
                        <div className="flex items-center gap-2">
                            <CalendarOutlined className="text-gray-400" />
                            <span>{dayjs(user.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="text-gray-500 text-sm mb-1">Cập nhật lần cuối</div>
                        <div className="flex items-center gap-2">
                            <ClockCircleOutlined className="text-gray-400" />
                            <span>{dayjs(user.updatedAt).format('DD/MM/YYYY HH:mm')}</span>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="text-gray-500 text-sm mb-1">Đăng nhập gần nhất</div>
                        <div className="flex items-center gap-2">
                            <ClockCircleOutlined className="text-gray-400" />
                            <span>
                                {user.lastLoginAt
                                    ? dayjs(user.lastLoginAt).format('DD/MM/YYYY HH:mm')
                                    : <Text type="secondary">Chưa đăng nhập</Text>
                                }
                            </span>
                        </div>
                    </Col>
                    {user.lastLoginIP && (
                        <Col span={8}>
                            <div className="text-gray-500 text-sm mb-1">IP đăng nhập</div>
                            <div className="flex items-center gap-2">
                                <GlobalOutlined className="text-gray-400" />
                                <Text code>{user.lastLoginIP}</Text>
                            </div>
                        </Col>
                    )}
                </Row>
            </div>

            {/* Quyền hạn */}
            {user.permissions && user.permissions.length > 0 && (
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 mb-4">
                        <SafetyCertificateOutlined className="text-purple-600" />
                        <span className="font-semibold text-gray-700">
                            Quyền hạn ({user.permissions.length})
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {user.permissions.map((perm, idx) => (
                            <Tag key={idx} color="purple">{perm}</Tag>
                        ))}
                    </div>
                </div>
            )}
        </Modal>
    );
};

export default UserDetailModal;
