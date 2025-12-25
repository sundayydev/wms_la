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
  message
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Text } = Typography;

// ============================================================================
// 1. TYPES & MOCK DATA
// ============================================================================

interface PurchaseOrderType {
  PurchaseOrderID: string;
  OrderCode: string;
  SupplierName: string; // Join từ bảng Suppliers
  WarehouseName: string; // Join từ bảng Warehouses
  OrderDate: string;
  ExpectedDeliveryDate: string;
  Status: 'PENDING' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED';
  FinalAmount: number;
  CreatedByName: string; // Join từ bảng User
}

const mockData: PurchaseOrderType[] = [
  {
    PurchaseOrderID: 'po-1',
    OrderCode: 'PO-2024-001',
    SupplierName: 'Samsung Vina Electronics',
    WarehouseName: 'Kho Tổng HCM',
    OrderDate: '2024-12-20',
    ExpectedDeliveryDate: '2024-12-25',
    Status: 'DELIVERED', // Đã nhập kho xong
    FinalAmount: 550000000,
    CreatedByName: 'Nguyễn Văn A',
  },
  {
    PurchaseOrderID: 'po-2',
    OrderCode: 'PO-2024-002',
    SupplierName: 'Công ty Phụ kiện Baseus',
    WarehouseName: 'Kho Hà Nội',
    OrderDate: '2024-12-24',
    ExpectedDeliveryDate: '2024-12-30',
    Status: 'CONFIRMED', // Đã xác nhận, đang giao
    FinalAmount: 25000000,
    CreatedByName: 'Trần Thị B',
  },
  {
    PurchaseOrderID: 'po-3',
    OrderCode: 'PO-2024-003',
    SupplierName: 'Nhà cung cấp Apple Global',
    WarehouseName: 'Kho Tổng HCM',
    OrderDate: '2024-12-25',
    ExpectedDeliveryDate: '2025-01-05',
    Status: 'PENDING', // Mới tạo, chưa duyệt
    FinalAmount: 1200000000,
    CreatedByName: 'Nguyễn Văn A',
  },
  {
    PurchaseOrderID: 'po-4',
    OrderCode: 'PO-2024-004',
    SupplierName: 'Linh kiện Chợ Lớn',
    WarehouseName: 'Kho Quận 7',
    OrderDate: '2024-12-10',
    ExpectedDeliveryDate: '2024-12-12',
    Status: 'CANCELLED', // Đã hủy
    FinalAmount: 5000000,
    CreatedByName: 'Lê Văn C',
  },
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

const PurchaseOrderList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PurchaseOrderType[]>(mockData);
  const navigate = useNavigate();

  // --- Helpers ---

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>;
      case 'CONFIRMED':
        return <Tag color="processing" icon={<CheckCircleOutlined />}>Đã xác nhận</Tag>;
      case 'DELIVERED':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Đã nhập kho</Tag>;
      case 'CANCELLED':
        return <Tag color="error">Đã hủy</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  // --- Columns ---

  const columns: ColumnsType<PurchaseOrderType> = [
    {
      title: 'Mã đơn (PO)',
      dataIndex: 'OrderCode',
      key: 'code',
      width: 140,
      render: (text) => <a className="font-bold text-blue-600 hover:underline">{text}</a>,
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'SupplierName',
      key: 'supplier',
      render: (text) => <span className="font-medium text-gray-700">{text}</span>,
    },
    {
      title: 'Ngày đặt / Dự kiến',
      key: 'dates',
      width: 200,
      render: (_, record) => (
        <div className="flex flex-col text-sm">
          <span>Ngày đặt: {dayjs(record.OrderDate).format('DD/MM/YYYY')}</span>
          <span className="text-gray-400 text-xs">
            Giao: {dayjs(record.ExpectedDeliveryDate).format('DD/MM/YYYY')}
          </span>
        </div>
      ),
    },
    {
      title: 'Kho nhập',
      dataIndex: 'WarehouseName',
      key: 'warehouse',
      responsive: ['lg'],
      render: (text) => <Tag>{text}</Tag>,
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
      width: 120,
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
            <Tooltip title="In phiếu">
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
            <ShoppingCartOutlined /> Đơn đặt hàng (Purchase Orders)
          </h1>
          <p className="text-gray-500 mt-1">Quản lý các đơn nhập hàng từ Nhà cung cấp</p>
        </div>
        <Space>
          <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-blue-600 shadow-md"
            onClick={() => navigate('/purchasing/orders/create')}
          >
            Tạo đơn nhập
          </Button>
        </Space>
      </div>

      {/* DASHBOARD MINI */}
      <Row gutter={16} className="mb-6">
        <Col span={12} md={6}>
          <Card bordered={false} className="shadow-sm bg-blue-50 border border-blue-100">
            <Statistic
              title="Đơn chờ duyệt"
              value={1}
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
              suffix="/ 4"
            />
          </Card>
        </Col>
        <Col span={12} md={6}>
          <Card bordered={false} className="shadow-sm bg-green-50 border border-green-100">
            <Statistic
              title="Chi tiêu tháng này"
              value={1225000000}
              precision={0}
              valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
              suffix="₫"
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
              placeholder="Trạng thái"
              allowClear
              className="w-full"
              options={[
                { label: 'Chờ duyệt (Pending)', value: 'PENDING' },
                { label: 'Đã xác nhận', value: 'CONFIRMED' },
                { label: 'Đã nhập kho', value: 'DELIVERED' },
                { label: 'Đã hủy', value: 'CANCELLED' },
              ]}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Chọn Nhà cung cấp"
              allowClear
              showSearch
              className="w-full"
              options={[
                { label: 'Samsung Vina', value: 'ncc1' },
                { label: 'Apple Global', value: 'ncc2' },
              ]}
            />
          </Col>
          <Col xs={24} md={9}>
            <Input
              placeholder="Tìm theo Mã đơn (PO), Người tạo..."
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
          rowKey="PurchaseOrderID"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} đơn hàng` }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default PurchaseOrderList;