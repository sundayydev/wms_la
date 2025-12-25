import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Result
        status="404" // Đây là prop quan trọng của AntD để hiển thị hình ảnh 404
        title="404"
        subTitle="Xin lỗi, trang bạn truy cập không tồn tại."
        extra={
          <Button
            type="primary"
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-500" // Tailwind style (nếu muốn override)
          >
            Quay về Trang chủ
          </Button>
        }
        className="bg-white p-8 rounded-lg shadow-md"
      />
    </div>
  );
};

export default NotFound;