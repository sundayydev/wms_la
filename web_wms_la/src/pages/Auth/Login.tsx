import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login, getCurrentUser } from '../../services/auth.service';
import type { LoginRequest, UserInfo } from '../../types/api.types';

// Lưu thông tin user vào sessionStorage
const saveUserInfo = (user: UserInfo): void => {
  sessionStorage.setItem('user_info', JSON.stringify(user));
  sessionStorage.setItem('user_role', user.role);
  sessionStorage.setItem('user_name', user.username);
  sessionStorage.setItem('user_fullname', user.fullName);
};

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);

    try {
      // 1. Gọi API đăng nhập
      // Access Token được lưu tự động bởi auth.service
      // Refresh Token được set vào HttpOnly Cookie bởi server
      const loginData = await login(values);

      console.log('Login response:', {
        hasAccessToken: !!loginData.accessToken,
        expiresInMinutes: loginData.expiresInMinutes,
      });

      if (!loginData) {
        message.error('Đăng nhập thất bại!');
        return;
      }

      // 2. Lấy thông tin user
      setFetchingUser(true);
      try {
        const userInfo = await getCurrentUser();
        saveUserInfo(userInfo);

        message.success(`Chào mừng ${userInfo.fullName || userInfo.username}!`);

        // 3. Điều hướng dựa trên Role
        navigate('/admin/dashboard');
      } catch (userError) {
        console.error('Failed to fetch user info:', userError);
        // Vẫn điều hướng dù không lấy được user info (có thể lấy sau)
        message.warning('Đăng nhập thành công nhưng không lấy được thông tin người dùng.');
        navigate('/admin/dashboard');
      }

    } catch (error: unknown) {
      // Hiển thị thông báo lỗi từ server (ví dụ: sai mật khẩu, tài khoản bị khóa...)
      const errorMessage = error instanceof Error ? error.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      message.error(errorMessage);
      console.error('Login error:', errorMessage);
    } finally {
      setLoading(false);
      setFetchingUser(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Đăng nhập</h2>
        <p className="text-gray-500 mt-2">Nhập thông tin tài khoản WMS của bạn</p>
      </div>

      {/* Loading overlay khi đang lấy thông tin user */}
      {fetchingUser && (
        <div className="mb-4 text-center text-gray-500">
          <Spin indicator={<LoadingOutlined spin />} /> Đang tải thông tin người dùng...
        </div>
      )}

      <Form
        name="login_form"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
        disabled={loading || fetchingUser}
      >
        {/* Field: Username */}
        <Form.Item
          name="username"
          rules={[
            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
            { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' }
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Tên đăng nhập (Username)"
            className="rounded-md py-2"
            autoComplete="username"
          />
        </Form.Item>

        {/* Field: Password */}
        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Mật khẩu"
            className="rounded-md py-2"
            autoComplete="current-password"
          />
        </Form.Item>

        {/* Options: Remember & Forgot Password */}
        <div className="flex justify-between items-center mb-6">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ tôi</Checkbox>
          </Form.Item>

          <a
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            href="/forgot-password"
          >
            Quên mật khẩu?
          </a>
        </div>

        {/* Submit Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 font-bold text-lg rounded-md shadow-md"
          >
            {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG NHẬP'}
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center mt-4 text-gray-400 text-sm">
        Hỗ trợ kỹ thuật: 1900 1234 (Ext: 101)
      </div>
    </div>
  );
};

export default Login;