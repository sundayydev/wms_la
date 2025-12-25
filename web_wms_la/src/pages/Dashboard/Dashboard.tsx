import React from 'react';
import { Card, Row, Col, Table, Tag, Typography, Progress, Space } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ShoppingOutlined,
  DropboxOutlined,
  WarningOutlined,
  DollarOutlined
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const { Title, Text } = Typography;

// --- DỮ LIỆU MOCK (GIẢ LẬP) ---

// 1. Dữ liệu Thống kê Top
const statsData = [
  {
    title: 'Tổng giá trị kho',
    value: '2.5 Tỷ',
    icon: <DollarOutlined />,
    color: 'bg-blue-50 text-blue-600',
    trend: 12.5, // % tăng trưởng
    trendType: 'up',
  },
  {
    title: 'Đơn xuất hôm nay',
    value: '150',
    icon: <ShoppingOutlined />,
    color: 'bg-purple-50 text-purple-600',
    trend: 5.2,
    trendType: 'up',
  },
  {
    title: 'Hàng sắp hết (Low Stock)',
    value: '12',
    icon: <WarningOutlined />,
    color: 'bg-orange-50 text-orange-600',
    trend: 2,
    trendType: 'down', // down ở đây là tốt (giảm số lượng hàng thiếu)
  },
  {
    title: 'Hàng tồn kho',
    value: '3,400',
    icon: <DropboxOutlined />,
    color: 'bg-green-50 text-green-600',
    trend: 0.8,
    trendType: 'up',
  },
];

// 2. Dữ liệu Biểu đồ Nhập/Xuất tuần này
const chartData = [
  { name: 'T2', Inbound: 40, Outbound: 24 },
  { name: 'T3', Inbound: 30, Outbound: 13 },
  { name: 'T4', Inbound: 20, Outbound: 58 },
  { name: 'T5', Inbound: 27, Outbound: 39 },
  { name: 'T6', Inbound: 18, Outbound: 48 },
  { name: 'T7', Inbound: 23, Outbound: 38 },
  { name: 'CN', Inbound: 34, Outbound: 43 },
];

// 3. Dữ liệu Biểu đồ tròn (Cơ cấu kho)
const pieData = [
  { name: 'Điện tử', value: 400 },
  { name: 'Gia dụng', value: 300 },
  { name: 'Phụ kiện', value: 300 },
  { name: 'Khác', value: 200 },
];
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// 4. Dữ liệu Giao dịch gần đây
const recentOrders = [
  {
    key: '1',
    code: 'PX-2023001',
    type: 'Export',
    customer: 'Cửa hàng A',
    amount: '15.000.000',
    status: 'Completed',
  },
  {
    key: '2',
    code: 'PN-2023002',
    type: 'Import',
    customer: 'NCC Samsung',
    amount: '250.000.000',
    status: 'Pending',
  },
  {
    key: '3',
    code: 'PX-2023003',
    type: 'Export',
    customer: 'Khách lẻ',
    amount: '2.500.000',
    status: 'Completed',
  },
  {
    key: '4',
    code: 'PX-2023004',
    type: 'Export',
    customer: 'Đại lý B',
    amount: '55.000.000',
    status: 'Cancelled',
  },
];

const Dashboard: React.FC = () => {
  return (
    <div className="w-full">
      {/* SECTION 1: STATISTIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statsData.map((item, index) => (
          <Card key={index} bordered={false} className="shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <Text type="secondary" className="text-gray-500">{item.title}</Text>
                <Title level={2} className="m-0 mt-1">{item.value}</Title>
              </div>
              <div className={`p-3 rounded-full ${item.color} text-xl`}>
                {item.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className={item.trendType === 'up' ? 'text-green-500' : 'text-red-500'}>
                {item.trendType === 'up' ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {item.trend}%
              </span>
              <span className="text-gray-400 ml-2">so với hôm qua</span>
            </div>
          </Card>
        ))}
      </div>

      {/* SECTION 2: CHARTS AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Biểu đồ cột: Xuất nhập tồn */}
        <Card title="Phân tích Nhập / Xuất (7 ngày qua)" bordered={false} className="shadow-sm lg:col-span-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="Inbound" name="Nhập kho" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="Outbound" name="Xuất kho" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Biểu đồ tròn: Cơ cấu danh mục */}
        <Card title="Cơ cấu kho hàng" bordered={false} className="shadow-sm">
          <div className="h-[200px] w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legend */}
          <div className="mt-4 space-y-2">
            {pieData.map((entry, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                  <span className="text-gray-600">{entry.name}</span>
                </div>
                <span className="font-semibold">{entry.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* SECTION 3: RECENT ACTIVITIES & CAPACITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bảng giao dịch gần đây */}
        <Card title="Giao dịch gần đây" bordered={false} className="shadow-sm lg:col-span-2">
          <Table
            dataSource={recentOrders}
            pagination={false}
            rowKey="key"
            columns={[
              {
                title: 'Mã phiếu',
                dataIndex: 'code',
                render: (text) => <a className="font-medium text-blue-600">{text}</a>
              },
              {
                title: 'Loại',
                dataIndex: 'type',
                render: (type) => (
                  <Tag color={type === 'Import' ? 'blue' : 'green'}>
                    {type === 'Import' ? 'Nhập kho' : 'Xuất kho'}
                  </Tag>
                )
              },
              {
                title: 'Khách hàng / NCC',
                dataIndex: 'customer',
              },
              {
                title: 'Giá trị',
                dataIndex: 'amount',
                align: 'right',
                render: (text) => <span className="font-mono">{text} ₫</span>
              },
              {
                title: 'Trạng thái',
                dataIndex: 'status',
                align: 'center',
                render: (status) => {
                  let color = status === 'Completed' ? 'success' : status === 'Pending' ? 'processing' : 'error';
                  return <Tag color={color}>{status}</Tag>
                }
              }
            ]}
          />
        </Card>

        {/* Tiện ích sức chứa kho */}
        <Card title="Sức chứa kho (Capacity)" bordered={false} className="shadow-sm">
          <div className="flex flex-col gap-6 py-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Kệ A (Hàng điện tử)</span>
                <span className="text-blue-600 font-bold">85%</span>
              </div>
              <Progress percent={85} showInfo={false} strokeColor="#2563eb" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Kệ B (Phụ kiện)</span>
                <span className="text-green-600 font-bold">45%</span>
              </div>
              <Progress percent={45} showInfo={false} strokeColor="#10b981" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Kệ C (Hàng lỗi)</span>
                <span className="text-red-500 font-bold">92%</span>
              </div>
              <Progress percent={92} showInfo={false} status="exception" />
              <Text type="danger" className="text-xs mt-1 block">* Kệ sắp đầy, cần giải phóng!</Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;