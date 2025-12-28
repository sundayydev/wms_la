import React from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    Switch,
    Row,
    Col,
    DatePicker,
} from 'antd';
import {
    EditOutlined,
    UserAddOutlined,
    UserOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    CheckCircleOutlined,
    StopOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import { ROLE_OPTIONS, GENDER_OPTIONS } from '../constants';
import type { UserFormModalProps } from '../types';

const UserFormModal: React.FC<UserFormModalProps> = ({
    open,
    editingUser,
    onSave,
    onCancel,
    form,
}) => {
    return (
        <Modal
            title={
                <div className="flex items-center gap-3 text-lg">
                    {editingUser ? (
                        <EditOutlined className="text-blue-500" />
                    ) : (
                        <UserAddOutlined className="text-green-500" />
                    )}
                    <span>{editingUser ? 'Cập nhật người dùng' : 'Thêm người dùng mới'}</span>
                </div>
            }
            open={open}
            onOk={onSave}
            onCancel={onCancel}
            width={800}
            okText="Lưu"
            cancelText="Hủy"
            centered
            styles={{
                header: { paddingBottom: 16, borderBottom: '1px solid #f0f0f0' },
                body: { paddingTop: 24 }
            }}
        >
            <Form form={form} layout="vertical" className="mt-2">
                {/* Thông tin đăng nhập */}
                <div className="bg-blue-50 p-5 rounded-xl mb-6 border border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                        <LockOutlined className="text-blue-600" />
                        <span className="font-semibold text-gray-700">Thông tin đăng nhập</span>
                    </div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="username"
                                label="Tên đăng nhập"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                                    { min: 3, message: 'Tối thiểu 3 ký tự' },
                                    { max: 50, message: 'Tối đa 50 ký tự' }
                                ]}
                            >
                                <Input
                                    prefix={<UserOutlined className="text-gray-400" />}
                                    placeholder="nguyenvana"
                                    disabled={!!editingUser}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="password"
                                label={editingUser ? 'Mật khẩu (để trống nếu không đổi)' : 'Mật khẩu'}
                                rules={[
                                    { required: !editingUser, message: 'Vui lòng nhập mật khẩu' },
                                    { min: 6, message: 'Tối thiểu 6 ký tự' }
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined className="text-gray-400" />}
                                    placeholder="••••••••"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>

                {/* Thông tin cá nhân */}
                <div className="bg-gray-50 p-5 rounded-xl mb-6 border border-gray-200">
                    <div className="flex items-center gap-2 mb-4">
                        <UserOutlined className="text-green-600" />
                        <span className="font-semibold text-gray-700">Thông tin cá nhân</span>
                    </div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input placeholder="Nguyễn Văn A" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' }
                                ]}
                            >
                                <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="email@company.com" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                                rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}
                            >
                                <Input prefix={<PhoneOutlined className="text-gray-400" />} placeholder="0909123456" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="dateOfBirth" label="Ngày sinh">
                                <DatePicker
                                    style={{ width: '100%' }}
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày sinh"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="gender" label="Giới tính">
                                <Select
                                    placeholder="Chọn giới tính"
                                    options={GENDER_OPTIONS.map(g => ({ label: g.label, value: g.value }))}
                                    allowClear
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="address" label="Địa chỉ">
                        <Input prefix={<EnvironmentOutlined className="text-gray-400" />} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
                    </Form.Item>
                </div>

                {/* Phân quyền */}
                <div className="bg-orange-50 p-5 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-2 mb-4">
                        <SafetyCertificateOutlined className="text-orange-600" />
                        <span className="font-semibold text-gray-700">Phân quyền & Trạng thái</span>
                    </div>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="role"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                            >
                                <Select options={ROLE_OPTIONS.map(r => ({ label: r.label, value: r.value }))} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="isActive" label="Trạng thái tài khoản" valuePropName="checked">
                                <Switch
                                    checkedChildren={<CheckCircleOutlined />}
                                    unCheckedChildren={<StopOutlined />}
                                    defaultChecked
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </div>
            </Form>
        </Modal>
    );
};

export default UserFormModal;
