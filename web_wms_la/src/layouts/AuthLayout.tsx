import React from 'react';
import { Outlet } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-blue-600 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-transparent" />

        <div className="z-10">
          <h1 className="text-4xl font-bold text-white tracking-wider flex items-center gap-2">
            WMS
            <span className="bg-white text-blue-600 px-2 rounded">LA</span>
          </h1>
        </div>

        <div className="z-10 mb-20">
          <h2 className="text-5xl font-bold text-white leading-tight mb-6">
            Quản lý kho hàng <br />
            <span className="text-blue-200">Thông minh & Hiệu quả</span>
          </h2>
          <p className="text-blue-100 text-lg max-w-md">
            Hệ thống quản lý xuất nhập tồn, tối ưu hóa vị trí và theo dõi thời gian thực dành cho doanh nghiệp hiện đại.
          </p>
        </div>

        <div className="z-10 text-blue-200 text-sm">
          © 2025 WMS Project. All rights reserved.
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center bg-gray-50 relative p-6">
        <div className="lg:hidden absolute top-8 left-8">
          <h1 className="text-2xl font-bold text-blue-600">WMS LA</h1>
        </div>

        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
          <Outlet />
        </div>

        <div className="mt-8 text-center text-gray-400 text-xs lg:hidden">
          © 2025 WMS Project
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;