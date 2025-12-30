import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { tokenManager } from '../../config/api.config';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = tokenManager.isAuthenticated();

  const handleGoBack = () => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Result
        status="404"
        title="404"
        subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
        extra={
          <Button
            type="primary"
            onClick={handleGoBack}
            className="bg-blue-600 hover:bg-blue-500"
          >
            {isAuthenticated ? 'Quay về Dashboard' : 'Quay về Trang chủ'}
          </Button>
        }
        className="bg-white p-8 rounded-lg shadow-md"
      />
    </div>
  );
};

export default NotFound;