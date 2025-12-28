import React from 'react';
import { Modal, Form, Input, Typography } from 'antd';
import { KeyOutlined, LockOutlined } from '@ant-design/icons';
import type { ResetPasswordModalProps } from '../types';

const { Text } = Typography;

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
    open,
    user,
    onConfirm,
    onCancel,
    form,
}) => {
    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <KeyOutlined className="text-orange-500" />
                    <span>Đặt lại mật khẩu</span>
                </div>
            }
            open={open}
            onOk={onConfirm}
            onCancel={onCancel}
            okText="Đặt lại"
            cancelText="Hủy"
            centered
        >
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <Text>
                    Bạn đang đặt lại mật khẩu cho người dùng: <Text strong>{user?.fullName}</Text> (@{user?.username})
                </Text>
            </div>
            <Form form={form} layout="vertical">
                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                        { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Nhập mật khẩu mới" />
                </Form.Item>
                <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ResetPasswordModal;
