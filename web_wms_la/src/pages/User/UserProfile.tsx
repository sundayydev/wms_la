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
  DatePicker,
  Select,
  Upload,
  Tooltip,
  Spin
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
  CameraOutlined,
  SaveOutlined,
  HomeOutlined,
  CalendarOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { UploadProps } from 'antd';
import { getCurrentUser, updateProfile, changePassword, logout } from '../../services/auth.service';
import type { UpdateProfileRequest, ChangePasswordRequest } from '../../types/api.types';

// Định nghĩa kiểu dữ liệu khớp với API response
interface UserProfileData {
  userID: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  avatar: string | null;
  dateOfBirth: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  address: string | null;
  role: string;
  warehouseID: string | null;
  warehouseName: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  lastLoginIP: string | null;
  createdAt: string;
}

const UserProfile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [form] = Form.useForm();

  // User data từ API
  const [userData, setUserData] = useState<UserProfileData | null>(null);

  // Fetch user data từ API khi component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setFetchingData(true);
      try {
        const user = await getCurrentUser();
        setUserData({
          userID: user.userID,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber || null,
          avatar: user.avatar || null,
          dateOfBirth: user.dateOfBirth || null,
          gender: user.gender as 'MALE' | 'FEMALE' | 'OTHER' | null,
          address: user.address || null,
          role: user.role,
          warehouseID: user.warehouseID || null,
          warehouseName: user.warehouseName || null,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt || null,
          lastLoginIP: user.lastLoginIP || null,
          createdAt: user.createdAt,
        });
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        message.error('Không thể tải thông tin người dùng');
      } finally {
        setFetchingData(false);
      }
    };

    fetchUserData();
  }, []);

  // Load dữ liệu vào Form khi userData thay đổi
  useEffect(() => {
    if (userData) {
      form.setFieldsValue({
        ...userData,
        phone: userData.phoneNumber,
        // Antd DatePicker cần object dayjs, không nhận string trực tiếp
        dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth) : null,
      });
    }
  }, [userData, form]);

  // Xử lý cập nhật thông tin chung
  const handleUpdateInfo = async (values: any) => {
    if (!userData) {
      message.error('Không có thông tin người dùng để cập nhật');
      return;
    }

    setLoading(true);
    try {
      // Tạo payload cho API PUT /api/Users/{id}
      const payload: UpdateProfileRequest = {
        fullName: values.fullName || null,
        email: values.email || null,
        phoneNumber: values.phone || null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : null,
        gender: values.gender || null,
        address: values.address || null,
        avatar: userData.avatar || null, // Giữ nguyên avatar hiện tại
        role: null, // Không cho phép thay đổi role từ profile
        warehouseID: null, // Không cho phép thay đổi warehouse từ profile
        isActive: null, // Không cho phép thay đổi trạng thái từ profile
      };

      // Gọi API cập nhật
      const updatedUser = await updateProfile(userData.userID, payload);

      // Cập nhật state với dữ liệu mới từ server
      setUserData({
        userID: updatedUser.userID,
        username: updatedUser.username,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber || null,
        avatar: updatedUser.avatar || null,
        dateOfBirth: updatedUser.dateOfBirth || null,
        gender: updatedUser.gender as 'MALE' | 'FEMALE' | 'OTHER' | null,
        address: updatedUser.address || null,
        role: updatedUser.role,
        warehouseID: updatedUser.warehouseID || null,
        warehouseName: updatedUser.warehouseName || null,
        isActive: updatedUser.isActive,
        lastLoginAt: updatedUser.lastLoginAt || null,
        lastLoginIP: updatedUser.lastLoginIP || null,
        createdAt: updatedUser.createdAt,
      });

      message.success('Cập nhật hồ sơ thành công!');
    } catch (error) {
      console.error('Update profile failed:', error);
      message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi cập nhật!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (values: any) => {
    setLoading(true);
    try {
      // Tạo payload cho API POST /api/Auth/change-password
      const payload: ChangePasswordRequest = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmPassword, // Form field là confirmPassword
      };

      // Gọi API đổi mật khẩu
      await changePassword(payload);

      // Thông báo thành công
      message.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');

      // Reset form
      form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);

      // Tự động đăng xuất sau 1.5 giây để người dùng kịp đọc thông báo
      setTimeout(async () => {
        await logout();
        window.location.href = '/auth/login';
      }, 1500);
    } catch (error) {
      console.error('Change password failed:', error);
      message.error(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đổi mật khẩu!');
      setLoading(false); // Chỉ tắt loading nếu có lỗi, nếu thành công thì giữ loading cho đến khi redirect
    }
  };

  // Mock Upload Avatar
  const uploadProps: UploadProps = {
    name: 'file',
    action: 'https://run.mocky.io/v3/435ba68c-f2a3-4bea-8e1c-ce8022ffd963', // Mock URL
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} uploaded successfully`);
        // Thực tế sẽ set URL trả về từ server
        setUserData(prev => prev ? { ...prev, avatar: 'https://i.pravatar.cc/300' } : null);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload failed.`);
      }
    },
    showUploadList: false,
  };

  // Tab Items - chỉ render khi có userData
  const items = [
    {
      key: '1',
      label: 'Thông tin cá nhân',
      children: userData ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateInfo}
        >
          {/* Row 1: Username & Email (Read-only sensitive info) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Tên đăng nhập" tooltip="Không thể thay đổi">
              <Input disabled value={userData.username} className="bg-gray-50 text-gray-500" />
            </Form.Item>
            <Form.Item label="Vai trò (Role)">
              <Input disabled value={userData.role} className="bg-gray-50 text-gray-500" />
            </Form.Item>
          </div>

          <Divider dashed style={{ margin: '12px 0' }} />

          {/* Row 2: FullName & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="Nhập họ tên đầy đủ" />
            </Form.Item>

            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="09xx..." />
            </Form.Item>
          </div>

          {/* Row 3: Email & DOB */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="dateOfBirth" label="Ngày sinh">
                <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} placeholder="Chọn ngày sinh" />
              </Form.Item>

              <Form.Item name="gender" label="Giới tính">
                <Select placeholder="Chọn giới tính">
                  <Select.Option value="MALE">Nam</Select.Option>
                  <Select.Option value="FEMALE">Nữ</Select.Option>
                  <Select.Option value="OTHER">Khác</Select.Option>
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* Row 4: Address (Full width) */}
          <Form.Item name="address" label="Địa chỉ liên hệ">
            <Input.TextArea
              rows={2}
              placeholder="Nhập địa chỉ chi tiết (Số nhà, đường, quận/huyện...)"
              maxLength={500}
              showCount
            />
          </Form.Item>

          <div className="flex justify-end mt-4">
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      ) : (
        <div className="text-center text-gray-500 py-10">Đang tải thông tin...</div>
      ),
    },
    {
      key: '2',
      label: 'Bảo mật & Mật khẩu',
      children: (
        <div className="flex flex-col gap-6">
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-700 text-sm">
            <SafetyCertificateOutlined className="mr-2" />
            Để bảo mật tài khoản, vui lòng sử dụng mật khẩu mạnh gồm chữ hoa, chữ thường và ký tự đặc biệt.
          </div>

          <Form
            layout="vertical"
            onFinish={handleChangePassword}
            className="max-w-md mx-auto w-full"
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
              <Button type="primary" danger htmlType="submit" block loading={loading} icon={<SafetyCertificateOutlined />}>
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: '3',
      label: 'Nhật ký hoạt động',
      children: userData ? (
        <div className="py-2">
          <Descriptions title="Thông tin phiên đăng nhập" bordered column={1} size="small" className='font-medium'>
            <Descriptions.Item label="Trạng thái tài khoản">
              <Tag color={userData.isActive ? 'success' : 'error'}>
                {userData.isActive ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ KHÓA'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đăng nhập lần cuối">
              <Tag icon={<ClockCircleOutlined />} color="blue">
                {userData.lastLoginAt ? dayjs(userData.lastLoginAt).format('HH:mm:ss - DD/MM/YYYY') : 'Chưa đăng nhập'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="IP đăng nhập cuối">
              <Tag icon={<SafetyCertificateOutlined />} color="red">
                {userData.lastLoginIP || '---'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Kho được gán">
              {userData.warehouseID ? (
                <Tag icon={<HomeOutlined />} color="cyan">{userData.warehouseName}</Tag>
              ) : <span className="text-gray-400">Chưa được gán kho (Quyền Admin/Office)</span>}
            </Descriptions.Item>
          </Descriptions>

          <div className="mt-6 text-gray-500 text-sm">
            <HistoryOutlined className="mr-2" />
            Lịch sử thay đổi dữ liệu (Audit Log) sẽ được hiển thị chi tiết trong module quản trị hệ thống.
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">Đang tải...</div>
      )
    }
  ];

  return (
    <div className="w-full">
      {/* Header Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Hồ sơ cá nhân</h1>
        <p className="text-gray-500">Quản lý thông tin tài khoản và bảo mật hệ thống</p>
      </div>

      {/* Loading state */}
      {fetchingData ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Đang tải thông tin..." />
        </div>
      ) : !userData ? (
        <div className="text-center text-gray-500 py-10">
          Không thể tải thông tin người dùng. Vui lòng thử lại.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Cột trái: Thông tin tóm tắt (Chiếm 4/12 trên Desktop) */}
          <div className="md:col-span-4 lg:col-span-3">
            <Card className="text-center shadow-sm sticky top-6" bordered={false}>
              <div className="relative inline-block mb-4 group">
                <Avatar
                  size={120}
                  icon={<UserOutlined />}
                  src={userData.avatar}
                  className="bg-blue-100 text-blue-600 border-4 border-white shadow-md"
                />
                {/* Nút upload ảnh */}
                <Upload {...uploadProps}>
                  <Tooltip title="Tải ảnh đại diện mới">
                    <div className="absolute bottom-1 right-1 bg-white text-gray-600 rounded-full p-2 shadow-md cursor-pointer hover:text-blue-600 hover:bg-blue-50 transition border border-gray-200">
                      <CameraOutlined className="text-lg flex items-center justify-center" />
                    </div>
                  </Tooltip>
                </Upload>
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-1">{userData.fullName}</h2>
              <p className="text-gray-500 mb-3">@{userData.username}</p>

              <div className="mb-6 flex justify-center gap-2 flex-wrap">
                <Tag color="geekblue">{userData.role}</Tag>
                <Tag color={userData.isActive ? 'success' : 'error'}>
                  {userData.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                </Tag>
              </div>

              <Divider />

              <div className="text-left space-y-3">
                <div className="flex items-center text-gray-600">
                  <MailOutlined className="mr-3 text-gray-400" />
                  <span className="truncate" title={userData.email}>{userData.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <PhoneOutlined className="mr-3 text-gray-400" />
                  <span>{userData.phoneNumber || '---'}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <CalendarOutlined className="mr-3 text-gray-400" />
                  <span>Sinh nhật: {userData.dateOfBirth ? dayjs(userData.dateOfBirth).format('DD/MM/YYYY') : '---'}</span>
                </div>
                <div className="flex items-start text-gray-600">
                  <HomeOutlined className="mr-3 mt-1 text-gray-400" />
                  <span className="text-sm">{userData.address || '---'}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
                Tham gia ngày: {dayjs(userData.createdAt).format('DD/MM/YYYY')}
              </div>
            </Card>
          </div>

          {/* Cột phải: Form chỉnh sửa (Chiếm 8/12 trên Desktop) */}
          <div className="md:col-span-8 lg:col-span-9">
            <Card className="shadow-sm min-h-[500px]" bordered={false}>
              <Tabs defaultActiveKey="1" items={items} />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;