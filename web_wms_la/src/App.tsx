import React from 'react';
import { Button } from 'antd'; // Ant Design

const App: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-gray-100">

      <h1 className="text-3xl font-bold text-blue-600">
        Tailwind v4 + Ant Design
      </h1>

      <div className="flex gap-4 p-6 bg-white rounded-lg shadow-xl">
        {/* Nút Ant Design chuẩn (vẫn giữ được màu xanh và hiệu ứng ripple) */}
        <Button type="primary" size="large">
          Ant Design Button
        </Button>

        {/* Nút dùng class Tailwind thuần */}
        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
          Tailwind Button
        </button>
      </div>

    </div>
  );
};

export default App;