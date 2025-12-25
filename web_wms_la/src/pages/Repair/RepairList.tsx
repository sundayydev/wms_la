import React, { useState } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Tooltip,
  Typography,
  Row,
  Col,
  Statistic,
  Badge,
  Avatar,
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ToolOutlined,
  PrinterOutlined,
  UserOutlined,
  BarcodeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Text } = Typography;

// ============================================================================
// 1. TYPES & MOCK DATA (Khớp với bảng Repairs)
// ============================================================================

interface RepairType {
  RepairID: string;
  RepairCode: string;
  CustomerName: string;
  PhoneNumber: string;
  DeviceName: string; // ComponentName
  SerialNumber?: string; // InstanceID -> Serial
  ProblemDescription: string;
  TechnicianName?: string; // UserID
  Status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  PaymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  WarrantyType: 'IN_WARRANTY' | 'OUT_WARRANTY';
  TotalCost: number;
  RepairDate: string;
  ExpectedCompletionDate: string;
}

const mockData: RepairType[] = [
  {
    RepairID: 'r1',
    RepairCode: 'REP-2412-001',
    CustomerName: 'Nguyễn Văn Khách',
    PhoneNumber: '0909123456',
    DeviceName: 'iPhone 13 Pro Max',
    SerialNumber: '356998000001234',
    ProblemDescription: 'Vỡ màn hình, cảm ứng chập chờn',
    TechnicianName: 'Trần Kỹ Thuật',
    Status: 'IN_PROGRESS',
    PaymentStatus: 'UNPAID',
    WarrantyType: 'OUT_WARRANTY',
    TotalCost: 8500000,
    RepairDate: '2024-12-24 09:00',
    ExpectedCompletionDate: '2024-12-26',
  },
  {
    RepairID: 'r2',
    RepairCode: 'REP-2412-002',
    CustomerName: 'Lê Thị B',
    PhoneNumber: '0912345678',
    DeviceName: 'Samsung S23 Ultra',
    SerialNumber: 'R5CW10...',
    ProblemDescription: 'Máy nóng, sụt pin nhanh',
    TechnicianName: 'Lê Văn Staff',
    Status: 'PENDING',
    PaymentStatus: 'UNPAID',
    WarrantyType: 'IN_WARRANTY',
    TotalCost: 0, // Bảo hành miễn phí
    RepairDate: '2024-12-25 10:30',
    ExpectedCompletionDate: '2024-12-27',
  },
  {
    RepairID: 'r3',
    RepairCode: 'REP-2412-003',
    CustomerName: 'Phạm Văn C',
    PhoneNumber: '0988777666',
    DeviceName: 'Macbook Air M1',
    SerialNumber: 'C02...',
    ProblemDescription: 'Không lên nguồn',
    TechnicianName: 'Trần Kỹ Thuật',
    Status: 'COMPLETED',
    PaymentStatus: 'PAID',
    WarrantyType: 'OUT_WARRANTY',
    TotalCost: 2500000,
    RepairDate: '2024-12-20 14:00',
    ExpectedCompletionDate: '2024-12-22',
  },
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

const RepairList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RepairType[]>(mockData);
  const navigate = useNavigate();

  // --- Helpers ---

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Tag color="orange" icon={<ClockCircleOutlined />}>Chờ tiếp nhận</Tag>;
      case 'IN_PROGRESS':
        return <Tag color="processing" icon={<SyncOutlined spin />}>Đang sửa</Tag>;
      case 'COMPLETED':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Hoàn thành</Tag>;
      case 'CANCELLED':
        return <Tag color="default" icon={<CloseCircleOutlined />}>Đã hủy</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return <Badge status="success" text={<span className="text-green-600 font-medium">Đã thanh toán</span>} />;
      case 'PARTIAL': return <Badge status="warning" text={<span className="text-orange-600">Thanh toán 1 phần</span>} />;
      default: return <Badge status="error" text={<span className="text-red-500">Chưa thanh toán</span>} />;
    }
  };

  // --- Columns ---

  const columns: ColumnsType<RepairType> = [
    {
      title: 'Mã phiếu',
      dataIndex: 'RepairCode',
      key: 'code',
      width: 130,
      render: (text, record) => (
        <div className="flex flex-col">
          <a className="font-bold text-blue-600 hover:underline">{text}</a>
          <span className="text-xs text-gray-400">{dayjs(record.RepairDate).format('DD/MM/YYYY')}</span>
        </div>
      ),
    },
    {
      title: 'Thiết bị & Lỗi',
      key: 'device',
      width: 250,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-800">{record.DeviceName}</span>
          <div className="flex items-center gap-1 text-xs text-gray-500 my-1">
            <BarcodeOutlined /> {record.SerialNumber || 'N/A'}
            {record.WarrantyType === 'IN_WARRANTY' && (
              <Tag color="green" className="ml-1 text-[10px] leading-tight px-1 py-0">Bảo hành</Tag>
            )}
          </div>
          <Text type="secondary" className="text-xs line-clamp-1 italic">
            Lỗi: {record.ProblemDescription}
          </Text>
        </div>
      ),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div className="flex flex-col text-sm">
          <span className="font-medium">{record.CustomerName}</span>
          <span className="text-gray-500">{record.PhoneNumber}</span>
        </div>
      ),
    },
    {
      title: 'Kỹ thuật viên',
      dataIndex: 'TechnicianName',
      key: 'tech',
      responsive: ['lg'],
      render: (text) => text ? (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
          <span className="text-sm">{text}</span>
        </Space>
      ) : <span className="text-gray-400 italic">Chưa phân công</span>,
    },
    {
      title: 'Chi phí / TT',
      key: 'cost',
      width: 180,
      render: (_, record) => (
        <div className="flex flex-col items-end">
          <span className="font-bold">{formatCurrency(record.TotalCost)}</span>
          <div className="scale-90 origin-right">
            {getPaymentStatusBadge(record.PaymentStatus)}
          </div>
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
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="In biên nhận">
            <Button icon={<PrinterOutlined />} size="small" />
          </Tooltip>
          <Button
            type="primary"
            ghost
            size="small"
            onClick={() => navigate(`/repairs/detail/${record.RepairID}`)}
          >
            Chi tiết
          </Button>
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
            <ToolOutlined /> Dịch vụ Sửa chữa
          </h1>
          <p className="text-gray-500 mt-1">Quản lý phiếu tiếp nhận bảo hành và sửa chữa</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-blue-600 shadow-md"
          onClick={() => navigate('/repairs/create')}
        >
          Tạo phiếu tiếp nhận
        </Button>
      </div>

      {/* DASHBOARD MINI */}
      <Row gutter={16} className="mb-6">
        <Col span={8} md={5}>
          <Card bordered={false} className="shadow-sm border-l-4 border-orange-400">
            <Statistic
              title="Đang chờ tiếp nhận"
              value={5}
              valueStyle={{ color: '#d97706', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={8} md={5}>
          <Card bordered={false} className="shadow-sm border-l-4 border-blue-500">
            <Statistic
              title="Đang sửa chữa"
              value={12}
              valueStyle={{ color: '#2563eb', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col span={8} md={5}>
          <Card bordered={false} className="shadow-sm border-l-4 border-green-500">
            <Statistic
              title="Hoàn thành hôm nay"
              value={8}
              valueStyle={{ color: '#16a34a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* FILTER BAR */}
      <Card className="mb-6 shadow-sm" bordered={false} bodyStyle={{ padding: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <RangePicker className="w-full" />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              className="w-full"
              options={[
                { label: 'Chờ tiếp nhận', value: 'PENDING' },
                { label: 'Đang sửa', value: 'IN_PROGRESS' },
                { label: 'Hoàn thành', value: 'COMPLETED' },
              ]}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Kỹ thuật viên"
              allowClear
              className="w-full"
              options={[
                { label: 'Trần Kỹ Thuật', value: 'tech1' },
                { label: 'Lê Văn Staff', value: 'tech2' },
              ]}
            />
          </Col>
          <Col xs={24} md={10}>
            <Input
              placeholder="Tìm theo Mã phiếu, SĐT, IMEI máy..."
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
          rowKey="RepairID"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default RepairList;