import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Tabs,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Tooltip,
  Modal,
  Form,
  InputNumber,
  Select,
  message
} from 'antd';
import {
  SearchOutlined,
  ExportOutlined,
  UserOutlined,
  ShopOutlined,
  DollarOutlined,
  BankOutlined,
  BellOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

// ============================================================================
// 1. TYPES & MOCK DATA
// ============================================================================

interface DebtType {
  PartnerID: string;
  PartnerCode: string;
  PartnerName: string;
  PhoneNumber: string;
  TotalTransactionValue: number; // Tổng giá trị mua/bán
  TotalPaid: number; // Đã thanh toán
  DebtAmount: number; // Còn nợ (Total - Paid)
  LastTransactionDate: string;
  Status: 'SAFE' | 'WARNING' | 'OVERDUE'; // Trạng thái nợ
}

// Dữ liệu Phải thu (Khách hàng nợ mình)
const receivablesData: DebtType[] = [
  {
    PartnerID: 'cust-1',
    PartnerCode: 'KH-001',
    PartnerName: 'Đại lý Minh Tuấn Mobile',
    PhoneNumber: '0909123123',
    TotalTransactionValue: 150000000,
    TotalPaid: 100000000,
    DebtAmount: 50000000,
    LastTransactionDate: '2024-12-20',
    Status: 'WARNING',
  },
  {
    PartnerID: 'cust-2',
    PartnerCode: 'KH-002',
    PartnerName: 'Nguyễn Văn A (Khách lẻ)',
    PhoneNumber: '0909888777',
    TotalTransactionValue: 25000000,
    TotalPaid: 5000000,
    DebtAmount: 20000000,
    LastTransactionDate: '2024-11-15',
    Status: 'OVERDUE', // Nợ lâu quá hạn
  },
  {
    PartnerID: 'cust-3',
    PartnerCode: 'KH-003',
    PartnerName: 'Cửa hàng VT Store',
    PhoneNumber: '0912345678',
    TotalTransactionValue: 500000000,
    TotalPaid: 495000000,
    DebtAmount: 5000000,
    LastTransactionDate: '2024-12-25',
    Status: 'SAFE',
  },
];

// Dữ liệu Phải trả (Mình nợ Nhà cung cấp)
const payablesData: DebtType[] = [
  {
    PartnerID: 'sup-1',
    PartnerCode: 'NCC-SAM',
    PartnerName: 'Samsung Vina Electronics',
    PhoneNumber: '02839157600',
    TotalTransactionValue: 1200000000,
    TotalPaid: 800000000,
    DebtAmount: 400000000,
    LastTransactionDate: '2024-12-24',
    Status: 'WARNING',
  },
  {
    PartnerID: 'sup-2',
    PartnerCode: 'NCC-APP',
    PartnerName: 'Apple Global Supplier',
    PhoneNumber: '18001122',
    TotalTransactionValue: 5000000000,
    TotalPaid: 5000000000,
    DebtAmount: 0,
    LastTransactionDate: '2024-12-10',
    Status: 'SAFE',
  },
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

const DebtList: React.FC = () => {
  const [activeTab, setActiveTab] = useState('receivables'); // receivables | payables
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<DebtType | null>(null);

  // --- Helpers ---

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'SAFE': return <Tag color="success">An toàn</Tag>;
      case 'WARNING': return <Tag color="warning">Cần lưu ý</Tag>;
      case 'OVERDUE': return <Tag color="error">Quá hạn</Tag>;
      default: return <Tag>{status}</Tag>;
    }
  };

  const handleOpenPaymentModal = (record: DebtType) => {
    setSelectedPartner(record);
    setIsModalOpen(true);
  };

  const handleSettleDebt = () => {
    message.success('Đã ghi nhận thanh toán công nợ');
    setIsModalOpen(false);
  };

  // --- Columns ---

  const columns: ColumnsType<DebtType> = [
    {
      title: 'Đối tác',
      dataIndex: 'PartnerName',
      key: 'partner',
      width: 250,
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'receivables' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
            {activeTab === 'receivables' ? <UserOutlined /> : <ShopOutlined />}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{text}</span>
            <span className="text-xs text-gray-500">{record.PartnerCode} - {record.PhoneNumber}</span>
          </div>
        </div>
      )
    },
    {
      title: 'Tổng giao dịch',
      dataIndex: 'TotalTransactionValue',
      key: 'total',
      align: 'right',
      render: (val) => formatCurrency(val)
    },
    {
      title: 'Tiến độ thanh toán',
      key: 'progress',
      width: 200,
      render: (_, record) => {
        const percent = Math.round((record.TotalPaid / record.TotalTransactionValue) * 100) || 0;
        return (
          <Tooltip title={`Đã trả: ${formatCurrency(record.TotalPaid)}`}>
            <Progress percent={percent} size="small" status={percent === 100 ? 'success' : 'active'} />
          </Tooltip>
        );
      }
    },
    {
      title: 'Dư nợ hiện tại',
      dataIndex: 'DebtAmount',
      key: 'debt',
      align: 'right',
      width: 150,
      sorter: (a, b) => a.DebtAmount - b.DebtAmount,
      render: (val) => (
        <span className={`font-bold text-base ${val > 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatCurrency(val)}
        </span>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'Status',
      key: 'status',
      align: 'center',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Hành động',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space>
          {activeTab === 'receivables' && record.DebtAmount > 0 && (
            <Tooltip title="Gửi thông báo nhắc nợ">
              <Button icon={<BellOutlined />} size="small" />
            </Tooltip>
          )}
          <Button
            type="primary"
            size="small"
            disabled={record.DebtAmount === 0}
            onClick={() => handleOpenPaymentModal(record)}
            className={activeTab === 'receivables' ? 'bg-blue-600' : 'bg-orange-600'}
          >
            {activeTab === 'receivables' ? 'Thu nợ' : 'Trả nợ'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <SafetyCertificateOutlined /> Quản lý Công nợ
          </h1>
          <p className="text-gray-500 mt-1">Theo dõi các khoản phải thu khách hàng và phải trả nhà cung cấp</p>
        </div>
        <Button icon={<ExportOutlined />}>Xuất báo cáo công nợ</Button>
      </div>

      {/* SUMMARY CARDS */}
      <Row gutter={16} className="mb-6">
        <Col span={24} md={8}>
          <Card bordered={false} className="shadow-sm border-l-4 border-blue-500">
            <Statistic
              title="Tổng Phải thu (Receivables)"
              value={75000000}
              valueStyle={{ color: '#2563eb', fontWeight: 'bold' }}
              suffix="₫"
            />
            <Text type="secondary" className="text-xs">Khách hàng đang nợ</Text>
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card bordered={false} className="shadow-sm border-l-4 border-orange-500">
            <Statistic
              title="Tổng Phải trả (Payables)"
              value={400000000}
              valueStyle={{ color: '#ea580c', fontWeight: 'bold' }}
              suffix="₫"
            />
            <Text type="secondary" className="text-xs">Đang nợ nhà cung cấp</Text>
          </Card>
        </Col>
        <Col span={24} md={8}>
          <Card bordered={false} className="shadow-sm bg-gray-50">
            <Statistic
              title="Dòng tiền ròng (Net)"
              value={-325000000}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarOutlined />}
              suffix="₫"
            />
            <Text type="secondary" className="text-xs">Chênh lệch Thu - Chi dự kiến</Text>
          </Card>
        </Col>
      </Row>

      {/* MAIN CONTENT WITH TABS */}
      <Card className="shadow-sm" bordered={false} bodyStyle={{ padding: '0 16px 16px 16px' }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'receivables',
              label: <span className="px-4 py-2 text-base"><UserOutlined /> Phải thu Khách hàng</span>,
              children: (
                <div>
                  <div className="flex justify-end mb-4">
                    <Input prefix={<SearchOutlined />} placeholder="Tìm khách hàng..." className="max-w-xs" />
                  </div>
                  <Table
                    columns={columns}
                    dataSource={receivablesData}
                    rowKey="PartnerID"
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              )
            },
            {
              key: 'payables',
              label: <span className="px-4 py-2 text-base"><ShopOutlined /> Phải trả Nhà cung cấp</span>,
              children: (
                <div>
                  <div className="flex justify-end mb-4">
                    <Input prefix={<SearchOutlined />} placeholder="Tìm nhà cung cấp..." className="max-w-xs" />
                  </div>
                  <Table
                    columns={columns}
                    dataSource={payablesData}
                    rowKey="PartnerID"
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* MODAL THANH TOÁN CÔNG NỢ */}
      <Modal
        title={activeTab === 'receivables' ? "Thu nợ khách hàng" : "Thanh toán cho Nhà cung cấp"}
        open={isModalOpen}
        onOk={handleSettleDebt}
        onCancel={() => setIsModalOpen(false)}
        okText="Xác nhận thanh toán"
        cancelText="Hủy"
      >
        {selectedPartner && (
          <Form layout="vertical" className="mt-4">
            <div className="bg-gray-50 p-4 rounded mb-4 flex justify-between items-center">
              <div>
                <div className="text-gray-500 text-xs">Đối tác</div>
                <div className="font-bold text-gray-800">{selectedPartner.PartnerName}</div>
              </div>
              <div className="text-right">
                <div className="text-gray-500 text-xs">Dư nợ hiện tại</div>
                <div className="font-bold text-red-600 text-lg">{formatCurrency(selectedPartner.DebtAmount)}</div>
              </div>
            </div>

            <Form.Item label="Số tiền thanh toán" required>
              <InputNumber
                className="w-full"
                prefix="₫"
                defaultValue={selectedPartner.DebtAmount}
                max={selectedPartner.DebtAmount}
              />
            </Form.Item>
            <Form.Item label="Phương thức" required>
              <Select defaultValue="BANK_TRANSFER">
                <Select.Option value="CASH">Tiền mặt</Select.Option>
                <Select.Option value="BANK_TRANSFER">Chuyển khoản ngân hàng</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="Ghi chú">
              <TextArea rows={2} placeholder="Nhập mã giao dịch hoặc ghi chú..." />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default DebtList;