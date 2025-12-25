import React, { useState } from 'react';
import {
  Table,
  Card,
  Tag,
  DatePicker,
  Select,
  Input,
  Button,
  Row,
  Col,
  Statistic,
  Space,
  Tooltip,
  Typography
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
  FileTextOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

// ============================================================================
// 1. TYPES & MOCK DATA (Khớp với bảng InventoryTransactions)
// ============================================================================

interface TransactionType {
  TransactionID: string;
  TransactionCode: string;
  TransactionType: 'IMPORT' | 'EXPORT' | 'TRANSFER' | 'ADJUSTMENT';
  ReferenceCode: string; // Mã phiếu liên quan (PO, SO, Transfer Code)
  ComponentName: string;
  SKU: string;
  WarehouseName: string;
  Quantity: number; // Số dương là nhập, âm là xuất
  Unit: string;
  SerialNumber?: string; // Nếu là hàng có IMEI/Serial
  UserName: string;
  TransactionDate: string;
  Notes?: string;
}

const mockTransactions: TransactionType[] = [
  {
    TransactionID: 't1',
    TransactionCode: 'TRA-001',
    TransactionType: 'IMPORT',
    ReferenceCode: 'PO-2024-001',
    ComponentName: 'iPhone 15 Pro Max 256GB',
    SKU: 'IP15PM-256',
    WarehouseName: 'Kho Tổng HCM',
    Quantity: 50,
    Unit: 'Cái',
    UserName: 'Admin Nhập hàng',
    TransactionDate: '2024-12-25 08:30:00',
    Notes: 'Nhập hàng từ NCC Apple VN'
  },
  {
    TransactionID: 't2',
    TransactionCode: 'TRA-002',
    TransactionType: 'EXPORT',
    ReferenceCode: 'SO-2024-055',
    ComponentName: 'Samsung Galaxy S24 Ultra',
    SKU: 'SS-S24U',
    WarehouseName: 'Kho Tổng HCM',
    Quantity: -1,
    Unit: 'Cái',
    SerialNumber: 'IMEI356899000...',
    UserName: 'Sale Admin',
    TransactionDate: '2024-12-25 09:15:00',
    Notes: 'Bán lẻ cho khách A'
  },
  {
    TransactionID: 't3',
    TransactionCode: 'TRA-003',
    TransactionType: 'TRANSFER',
    ReferenceCode: 'TRF-009',
    ComponentName: 'Cáp sạc Type-C Baseus',
    SKU: 'CAB-C-100W',
    WarehouseName: 'Kho Hà Nội',
    Quantity: 20, // Nhận từ kho khác chuyển về (Góc nhìn kho HN)
    Unit: 'Sợi',
    UserName: 'Thủ kho HN',
    TransactionDate: '2024-12-25 10:00:00',
    Notes: 'Nhận điều chuyển từ HCM'
  },
  {
    TransactionID: 't4',
    TransactionCode: 'TRA-004',
    TransactionType: 'ADJUSTMENT',
    ReferenceCode: 'ADJ-001',
    ComponentName: 'Tai nghe AirPods Pro',
    SKU: 'APP-2',
    WarehouseName: 'Kho Tổng HCM',
    Quantity: -2,
    Unit: 'Cái',
    UserName: 'Kiểm kê viên',
    TransactionDate: '2024-12-24 17:00:00',
    Notes: 'Cân bằng kho (Hàng hỏng/Mất)'
  },
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

const InventoryHistory: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TransactionType[]>(mockTransactions);

  // --- Helpers ---

  const getTypeTag = (type: string) => {
    switch (type) {
      case 'IMPORT':
        return <Tag color="success" icon={<ArrowUpOutlined />}>NHẬP KHO</Tag>;
      case 'EXPORT':
        return <Tag color="error" icon={<ArrowDownOutlined />}>XUẤT KHO</Tag>;
      case 'TRANSFER':
        return <Tag color="processing" icon={<SwapOutlined />}>CHUYỂN KHO</Tag>;
      case 'ADJUSTMENT':
        return <Tag color="warning" icon={<FileTextOutlined />}>KIỂM KÊ/ĐC</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  const formatQuantity = (qty: number) => {
    const isPositive = qty > 0;
    return (
      <span className={`font-bold text-base ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{qty}
      </span>
    );
  };

  // --- Columns ---

  const columns: ColumnsType<TransactionType> = [
    {
      title: 'Mã GD',
      dataIndex: 'TransactionCode',
      key: 'code',
      width: 120,
      render: (text) => <span className="font-medium text-gray-700">{text}</span>
    },
    {
      title: 'Thời gian',
      dataIndex: 'TransactionDate',
      key: 'date',
      width: 160,
      render: (date) => (
        <div className="flex flex-col">
          <span className="font-medium">{dayjs(date).format('HH:mm')}</span>
          <span className="text-xs text-gray-500">{dayjs(date).format('DD/MM/YYYY')}</span>
        </div>
      )
    },
    {
      title: 'Loại',
      dataIndex: 'TransactionType',
      key: 'type',
      width: 140,
      render: (type) => getTypeTag(type)
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 300,
      render: (_, record) => (
        <div className="flex flex-col">
          <Text strong className="text-blue-700">{record.ComponentName}</Text>
          <div className="flex gap-2 text-xs text-gray-500 mt-1">
            <Tag className="m-0 bg-gray-100 border-gray-200">{record.SKU}</Tag>
            {record.SerialNumber && (
              <Tooltip title="Serial/IMEI của sản phẩm này">
                <Tag color="purple" className="m-0 cursor-help">SN: {record.SerialNumber}</Tag>
              </Tooltip>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Kho',
      dataIndex: 'WarehouseName',
      key: 'warehouse',
      responsive: ['md'],
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: 'Số lượng',
      dataIndex: 'Quantity',
      key: 'qty',
      align: 'right',
      render: (qty, record) => (
        <div>
          {formatQuantity(qty)} <span className="text-xs text-gray-400 ml-1">{record.Unit}</span>
        </div>
      )
    },
    {
      title: 'Chứng từ',
      dataIndex: 'ReferenceCode',
      key: 'ref',
      responsive: ['lg'],
      render: (text) => <a className="text-blue-500 hover:underline">{text}</a>
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'UserName',
      key: 'user',
      responsive: ['lg'],
      render: (text) => <span className="text-gray-600 text-sm">{text}</span>
    }
  ];

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <HistoryOutlined /> Lịch sử Xuất Nhập Kho
          </h1>
          <p className="text-gray-500 mt-1">Tra cứu chi tiết mọi biến động hàng hóa trong hệ thống</p>
        </div>
        <Button icon={<ExportOutlined />}>Xuất báo cáo</Button>
      </div>

      {/* SUMMARY STATISTICS (Optional) */}
      <Row gutter={16} className="mb-6">
        <Col span={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng nhập (Hôm nay)"
              value={1250}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="SP"
            />
          </Card>
        </Col>
        <Col span={12} md={6}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng xuất (Hôm nay)"
              value={84}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="SP"
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
              placeholder="Loại giao dịch"
              allowClear
              className="w-full"
              options={[
                { label: 'Nhập kho', value: 'IMPORT' },
                { label: 'Xuất kho', value: 'EXPORT' },
                { label: 'Chuyển kho', value: 'TRANSFER' },
                { label: 'Kiểm kê', value: 'ADJUSTMENT' },
              ]}
            />
          </Col>
          <Col xs={12} md={4}>
            <Select
              placeholder="Chọn kho"
              allowClear
              className="w-full"
              options={[
                { label: 'Kho Tổng HCM', value: 'wh1' },
                { label: 'Kho Hà Nội', value: 'wh2' },
              ]}
            />
          </Col>
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm theo Mã SP, SKU, Serial/IMEI..."
              prefix={<SearchOutlined className="text-gray-400" />}
            />
          </Col>
          <Col xs={24} md={2}>
            <Button icon={<ReloadOutlined />} onClick={() => setLoading(true)} className="w-full" />
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey="TransactionID"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} giao dịch`
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default InventoryHistory;