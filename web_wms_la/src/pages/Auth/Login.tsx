import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { loginAPI, type LoginRequest } from '../../services/auth.service';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Gọi API đăng nhập
      const data = await loginAPI(values);

      // 2. Lưu Token và thông tin User vào LocalStorage
      // Quan trọng: Lưu Role để sau này phân quyền menu
      localStorage.setItem('access_token', data.token);
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('user_name', data.user.username);

      message.success('Đăng nhập thành công!');

      // 3. Điều hướng dựa trên Role (Ví dụ)
      navigate('/dashboard');

    } catch (error: any) {
      setErrorMsg(error.message || 'Đã có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-800">Đăng nhập</h2>
        <p className="text-gray-500 mt-2">Nhập thông tin tài khoản WMS của bạn</p>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {errorMsg && (
        <Alert
          message="Đăng nhập thất bại"
          description={errorMsg}
          type="error"
          showIcon
          className="mb-6"
        />
      )}

      <Form
        name="login_form"
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        size="large"
      >
        {/* Field: Username */}
        <Form.Item
          name="username"
          rules={[
            { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
            { min: 3, message: 'Tên đăng nhập phải > 3 ký tự' }
          ]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="Tên đăng nhập (Username)"
            className="rounded-md py-2"
          />
        </Form.Item>

        {/* Field: Password */}
        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải > 6 ký tự' } // DB lưu hash, nhưng input client cần validate cơ bản
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="Mật khẩu"
            className="rounded-md py-2"
          />
        </Form.Item>

        {/* Options: Remember & Forgot Password */}
        <div className="flex justify-between items-center mb-6">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Ghi nhớ tôi</Checkbox>
          </Form.Item>

          <a className="text-blue-600 hover:text-blue-800 text-sm font-medium" href="#">
            Quên mật khẩu?
          </a>
        </div>

        {/* Submit Button */}
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-500 font-bold text-lg rounded-md shadow-md"
          >
            ĐĂNG NHẬP
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