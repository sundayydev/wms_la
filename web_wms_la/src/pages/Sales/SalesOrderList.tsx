import React, { useState } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Input,
  DatePicker,
  Select,
  Space,
  Tooltip,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  message
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  ShopOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Text } = Typography;

// ============================================================================
// 1. TYPES & MOCK DATA
// ============================================================================

interface SalesOrderType {
  SalesOrderID: string;
  OrderCode: string;
  CustomerName: string;
  PhoneNumber: string;
  WarehouseName: string;
  OrderDate: string;
  Status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  PaymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  PaymentMethod: string;
  FinalAmount: number;
  CreatedByName: string;
}

const mockData: SalesOrderType[] = [
  {
    SalesOrderID: 'so-1',
    OrderCode: 'SO-2024-1001',
    CustomerName: 'Nguyễn Văn An',
    PhoneNumber: '0909123456',
    WarehouseName: 'Kho Tổng HCM',
    OrderDate: '2024-12-25 09:30',
    Status: 'COMPLETED',
    PaymentStatus: 'PAID',
    PaymentMethod: 'CK',
    FinalAmount: 35500000,
    CreatedByName: 'Sale Admin',
  },
  {
    SalesOrderID: 'so-2',
    OrderCode: 'SO-2024-1002',
    CustomerName: 'Trần Thị B',
    PhoneNumber: '0912345678',
    WarehouseName: 'Kho Hà Nội',
    OrderDate: '2024-12-25 10:15',
    Status: 'CONFIRMED', // Đã xác nhận, đang giao
    PaymentStatus: 'PARTIAL', // Khách cọc trước
    PaymentMethod: 'TIỀN MẶT',
    FinalAmount: 12500000,
    CreatedByName: 'Nhân viên Sale 1',
  },
  {
    SalesOrderID: 'so-3',
    OrderCode: 'SO-2024-1003',
    CustomerName: 'Công ty TNHH ABC',
    PhoneNumber: '0283999888',
    WarehouseName: 'Kho Tổng HCM',
    OrderDate: '2024-12-24 16:00',
    Status: 'PENDING', // Mới tạo
    PaymentStatus: 'UNPAID',
    PaymentMethod: 'CÔNG NỢ',
    FinalAmount: 150000000,
    CreatedByName: 'Sale Admin',
  },
  {
    SalesOrderID: 'so-4',
    OrderCode: 'SO-2024-0999',
    CustomerName: 'Khách lẻ vãng lai',
    PhoneNumber: '',
    WarehouseName: 'Cửa hàng Quận 1',
    OrderDate: '2024-12-23 11:00',
    Status: 'CANCELLED',
    PaymentStatus: 'UNPAID',
    PaymentMethod: '-',
    FinalAmount: 500000,
    CreatedByName: 'Lễ tân',
  },
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

const SalesOrderList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SalesOrderType[]>(mockData);
  const navigate = useNavigate();

  // --- Helpers ---

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING': return <Tag color="gold" icon={<SyncOutlined spin />}>Chờ xử lý</Tag>;
      case 'CONFIRMED': return <Tag color="blue" icon={<CheckCircleOutlined />}>Đang giao</Tag>;
      case 'COMPLETED': return <Tag color="success" icon={<CheckCircleOutlined />}>Hoàn thành</Tag>;
      case 'CANCELLED': return <Tag color="default" icon={<CloseCircleOutlined />}>Đã hủy</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <Badge status="success" text={<span className="text-green-600 font-medium">Đã thanh toán</span>} />;
      case 'PARTIAL': return <Badge status="warning" text={<span className="text-orange-600 font-medium">Thanh toán 1 phần</span>} />;
      default: return <Badge status="error" text={<span className="text-red-500 font-medium">Chưa thanh toán</span>} />;
    }
  };

  // --- Columns ---

  const columns: ColumnsType<SalesOrderType> = [
    {
      title: 'Mã đơn',
      dataIndex: 'OrderCode',
      key: 'code',
      width: 130,
      render: (text) => <a className="font-bold text-blue-600 hover:underline">{text}</a>,
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      width: 220,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{record.CustomerName}</span>
          {record.PhoneNumber && (
            <span className="text-xs text-gray-500">{record.PhoneNumber}</span>
          )}
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'OrderDate',
      key: 'date',
      width: 150,
      render: (date) => (
        <div className="flex flex-col">
          <span className="text-gray-700">{dayjs(date).format('HH:mm')}</span>
          <span className="text-xs text-gray-400">{dayjs(date).format('DD/MM/YYYY')}</span>
        </div>
      )
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'FinalAmount',
      key: 'amount',
      align: 'right',
      width: 150,
      render: (amount) => <span className="font-bold text-gray-800">{formatCurrency(amount)}</span>,
    },
    {
      title: 'Thanh toán',
      key: 'payment',
      width: 180,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          {getPaymentBadge(record.PaymentStatus)}
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{record.PaymentMethod}</span>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'Status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined className="text-blue-600" />}
              onClick={() => message.info(`Xem chi tiết ${record.OrderCode}`)}
            />
          </Tooltip>
          {record.Status !== 'CANCELLED' && (
            <Tooltip title="In hóa đơn">
              <Button type="text" icon={<PrinterOutlined />} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <ShopOutlined /> Danh sách Đơn bán hàng
          </h1>
          <p className="text-gray-500 mt-1">Quản lý toàn bộ đơn hàng bán ra và trạng thái giao hàng</p>
        </div>
        <Space>
          <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
          <Button
            type="primary"
            icon={<ShoppingCartOutlined />}
            className="bg-blue-600 shadow-md"
            onClick={() => navigate('/sales/create')}
          >
            Tạo đơn bán (POS)
          </Button>
        </Space>
      </div>

      {/* DASHBOARD MINI */}
      <Row gutter={16} className="mb-6">
        <Col span={12} md={6}>
          <Card bordered={false} className="shadow-sm border-l-4 border-green-500">
            <Statistic
              title="Doanh thu hôm nay"
              value={48000000}
              precision={0}
              valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
        <Col span={12} md={6}>
          <Card bordered={false} className="shadow-sm border-l-4 border-blue-500">
            <Statistic
              title="Đơn hàng mới"
              value={15}
              valueStyle={{ color: '#2563eb', fontWeight: 'bold' }}
              suffix=" đơn"
            />
          </Card>
        </Col>
        <Col span={12} md={6}>
          <Card bordered={false} className="shadow-sm border-l-4 border-orange-400">
            <Statistic
              title="Chờ thanh toán"
              value={3}
              valueStyle={{ color: '#d97706', fontWeight: 'bold' }}
              suffix=" đơn"
            />
          </Card>
        </Col>
      </Row>

      {/* FILTER BAR */}
      <Card className="mb-6 shadow-sm" bordered={false} bodyStyle={{ padding: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <RangePicker className="w-full" placeholder={['Từ ngày', 'Đến ngày']} />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Trạng thái đơn"
              allowClear
              className="w-full"
              options={[
                { label: 'Hoàn thành', value: 'COMPLETED' },
                { label: 'Đang giao', value: 'CONFIRMED' },
                { label: 'Đã hủy', value: 'CANCELLED' },
              ]}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Thanh toán"
              allowClear
              className="w-full"
              options={[
                { label: 'Đã thanh toán', value: 'PAID' },
                { label: 'Chưa thanh toán', value: 'UNPAID' },
              ]}
            />
          </Col>
          <Col xs={24} md={10}>
            <Input
              placeholder="Tìm theo Mã đơn, SĐT, Tên khách..."
              prefix={<SearchOutlined className="text-gray-400" />}
            />
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="SalesOrderID"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} đơn` }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default SalesOrderList;