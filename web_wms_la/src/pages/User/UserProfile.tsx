import React, { useState, useEffect } from 'react';
import {
  Card,
  Avatar,
  Tag,
  Tabs,
  Form,
  Input,
  Button,
  message,
  Descriptions,
  Divider,
  Space,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  CameraOutlined,
  SaveOutlined
} from '@ant-design/icons';

const UserProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Giả lập dữ liệu user lấy từ API
  const [userData, setUserData] = useState({
    username: 'admin',
    fullName: 'Nguyễn Văn Quản Lý',
    email: 'admin@wms-system.com',
    phone: '0987654321',
    role: 'ADMIN',
    isActive: true,
    createdAt: '2024-01-01',
    avatar: '', // URL ảnh nếu có
  });

  // Load dữ liệu vào Form khi component mount
  useEffect(() => {
    form.setFieldsValue(userData);
  }, [userData, form]);

  // Xử lý cập nhật thông tin chung
  const handleUpdateInfo = async (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setUserData({ ...userData, ...values });
      message.success('Cập nhật thông tin thành công!');
      setLoading(false);
    }, 1000);
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (values: any) => {
    setLoading(true);
    setTimeout(() => {
      console.log('New Password:', values.newPassword);
      message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
      form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
      setLoading(false);
    }, 1000);
  };

  // Cấu hình các Tab
  const items = [
    {
      key: '1',
      label: 'Thông tin chung',
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateInfo}
          initialValues={userData}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Tên đăng nhập (Không thể sửa)">
              <Input disabled value={userData.username} className="bg-gray-50 text-gray-500" />
            </Form.Item>

            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ tên" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Vui lòng nhập email' },
                { type: 'email', message: 'Email không hợp lệ' }
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="example@mail.com" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="09xx..." />
            </Form.Item>
          </div>

          <div className="flex justify-end mt-4">
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      ),
    },
    {
      key: '2',
      label: 'Bảo mật',
      children: (
        <Form
          layout="vertical"
          onFinish={handleChangePassword}
          className="max-w-md"
        >
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải lớn hơn 6 ký tự' }
            ]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" danger htmlType="submit" loading={loading} icon={<SafetyCertificateOutlined />}>
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* Header Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
        <p className="text-gray-500">Quản lý thông tin tài khoản và bảo mật</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cột trái: Thông tin tóm tắt */}
        <div className="md:col-span-1">
          <Card className="text-center shadow-sm" bordered={false}>
            <div className="relative inline-block mb-4">
              <Avatar
                size={100}
                icon={<UserOutlined />}
                src={userData.avatar}
                className="bg-blue-100 text-blue-600"
              />
              {/* Nút upload ảnh nhỏ (Giả lập) */}
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow border cursor-pointer hover:bg-gray-100 transition">
                <CameraOutlined className="text-gray-600 text-lg" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800">{userData.fullName}</h2>
            <p className="text-gray-500 mb-2">@{userData.username}</p>

            {/* Thêm 'flex justify-center gap-4' vào div cha */}
            <div className="mb-4 flex justify-center gap-4">
              <Tag color="blue">{userData.role}</Tag>
              <Tag color={userData.isActive ? 'success' : 'error'}>
                {userData.isActive ? 'Đang hoạt động' : 'Đã khóa'}
              </Tag>
            </div>

            <Divider />

            <Descriptions column={1} size="small" className="text-left">
              <Descriptions.Item label="Tham gia">{userData.createdAt}</Descriptions.Item>
              <Descriptions.Item label="Phòng ban">Kho vận</Descriptions.Item>
            </Descriptions>
          </Card>
        </div>

        {/* Cột phải: Form chỉnh sửa */}
        <div className="md:col-span-2">
          <Card className="shadow-sm min-h-[400px]" bordered={false}>
            <Tabs defaultActiveKey="1" items={items} />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;