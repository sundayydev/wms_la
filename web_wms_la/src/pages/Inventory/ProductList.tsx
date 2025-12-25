import React, { useState } from 'react';
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Space,
  Tooltip,
  Popconfirm,
  Select,
  message,
  Avatar,
  Typography
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  BarcodeOutlined,
  AppstoreOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

// 1. Định nghĩa Interface chuẩn theo bảng SQL "Components"
interface ComponentType {
  ComponentID: string; // UUID
  SKU: string;
  ComponentName: string;
  CategoryName: string; // Mock từ CategoryID
  Unit: string;
  ImageURL: string;
  BasePrice: number;
  SellPrice: number;
  IsSerialized: boolean;
  UpdatedAt: string;
}

// 2. Giả lập dữ liệu
const initialData: ComponentType[] = [
  {
    ComponentID: 'uuid-1',
    SKU: 'IP15PM-LCD-ZIN',
    ComponentName: 'Màn hình iPhone 15 Pro Max (Zin bóc máy)',
    CategoryName: 'Linh kiện màn hình',
    Unit: 'Cái',
    ImageURL: 'https://api.dicebear.com/7.x/icons/svg?seed=IP15',
    BasePrice: 8500000,
    SellPrice: 10500000,
    IsSerialized: true, // Quản lý theo IMEI
    UpdatedAt: '2025-10-20',
  },
  {
    ComponentID: 'uuid-2',
    SKU: 'GLUE-B7000',
    ComponentName: 'Keo dán màn hình B7000 (Tuýp nhỏ)',
    CategoryName: 'Vật tư tiêu hao',
    Unit: 'Tuýp',
    ImageURL: 'https://api.dicebear.com/7.x/icons/svg?seed=Glue',
    BasePrice: 15000,
    SellPrice: 35000,
    IsSerialized: false, // Quản lý số lượng
    UpdatedAt: '2025-10-21',
  },
  {
    ComponentID: 'uuid-3',
    SKU: 'BAT-SS-S23U',
    ComponentName: 'Pin Samsung S23 Ultra (Chính hãng)',
    CategoryName: 'Linh kiện Pin',
    Unit: 'Viên',
    ImageURL: 'https://api.dicebear.com/7.x/icons/svg?seed=Bat',
    BasePrice: 800000,
    SellPrice: 1200000,
    IsSerialized: true,
    UpdatedAt: '2025-10-22',
  },
];

const ProductList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ComponentType[]>(initialData);
  const navigate = useNavigate();

  // Format tiền tệ
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  const handleDelete = (id: string) => {
    setData(data.filter(item => item.ComponentID !== id));
    message.success('Đã xóa sản phẩm');
  };

  const columns: ColumnsType<ComponentType> = [
    {
      title: 'Thông tin sản phẩm',
      dataIndex: 'ComponentName',
      key: 'info',
      width: 350,
      render: (_, record) => (
        <div className="flex gap-3">
          <Avatar
            shape="square"
            size={54}
            src={record.ImageURL}
            icon={<AppstoreOutlined />}
            className="bg-gray-100 border border-gray-200 flex-shrink-0"
          />
          <div className="flex flex-col justify-center">
            <Text strong className="text-gray-800 line-clamp-2" title={record.ComponentName}>
              {record.ComponentName}
            </Text>
            <div className="flex items-center gap-2 mt-1">
              <Tag className="m-0 bg-gray-100 text-gray-500 border-gray-300 font-mono text-xs">
                {record.SKU}
              </Tag>
              <span className="text-xs text-gray-400">| {record.Unit}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'CategoryName',
      key: 'category',
      responsive: ['md'], // Ẩn trên mobile
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Loại quản lý',
      dataIndex: 'IsSerialized',
      key: 'type',
      render: (isSerialized) => (
        isSerialized ? (
          <Tooltip title="Cần quét mã Serial/IMEI từng cái khi nhập xuất">
            <Tag icon={<BarcodeOutlined />} color="purple">
              Theo Serial/IMEI
            </Tag>
          </Tooltip>
        ) : (
          <Tooltip title="Chỉ cần đếm số lượng">
            <Tag color="cyan">Theo Số lượng</Tag>
          </Tooltip>
        )
      ),
    },
    {
      title: 'Giá (VND)',
      key: 'price',
      align: 'right',
      render: (_, record) => (
        <div className="flex flex-col items-end">
          <span className="font-bold text-gray-700">{formatCurrency(record.SellPrice)}</span>
          <span className="text-xs text-gray-400">Vốn: {formatCurrency(record.BasePrice)}</span>
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => message.info(`Sửa: ${record.SKU}`)}
          />
          <Popconfirm
            title="Xóa sản phẩm này?"
            onConfirm={() => handleDelete(record.ComponentID)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0">Danh sách Linh kiện</h1>
          <p className="text-gray-500 mt-1">Quản lý Master Data: Giá, SKU và quy cách quản lý</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-blue-600 shadow-sm"
          onClick={() => navigate('/inventory/create')}
        >
          Thêm linh kiện mới
        </Button>
      </div>

      {/* FILTER BAR */}
      <Card className="mb-6 shadow-sm border-gray-100" bordered={false} bodyStyle={{ padding: '16px' }}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-5">
            <Input
              placeholder="Tìm theo Tên hoặc SKU..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
            />
          </div>
          <div className="md:col-span-3">
            <Select
              placeholder="Danh mục"
              allowClear
              className="w-full"
              options={[
                { value: 'screen', label: 'Linh kiện màn hình' },
                { value: 'battery', label: 'Linh kiện Pin' },
              ]}
            />
          </div>
          <div className="md:col-span-3">
            <Select
              placeholder="Loại quản lý"
              allowClear
              className="w-full"
              options={[
                { value: true, label: 'Theo Serial/IMEI' },
                { value: false, label: 'Theo Số lượng' },
              ]}
            />
          </div>
          <div className="md:col-span-1 text-right">
            <Button icon={<ReloadOutlined />} onClick={() => setLoading(true)} />
          </div>
        </div>
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm border-gray-100" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="ComponentID"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 800 }} // Cho phép cuộn ngang trên mobile
        />
      </Card>
    </div>
  );
};

export default ProductList;