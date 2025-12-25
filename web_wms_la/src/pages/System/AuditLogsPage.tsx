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
  Row,
  Col,
  Avatar,
  Typography,
  Divider
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  HistoryOutlined,
  GlobalOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  LoginOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  FilterOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import AuditLogDetailModal from './AuditLogDetailModal';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// ============================================================================
// 1. INTERFACES & CONFIG
// ============================================================================

export interface AuditLogType {
  LogID: string;
  UserName: string;
  Action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'Other';
  EntityType: string;
  EntityID: string;
  OldValue?: string;
  NewValue?: string;
  IPAddress: string;
  UserAgent: string;
  CreatedAt: string;
}

const ACTION_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  CREATE: { color: 'success', icon: <PlusCircleOutlined />, label: 'Tạo mới' },
  UPDATE: { color: 'warning', icon: <EditOutlined />, label: 'Cập nhật' },
  DELETE: { color: 'error', icon: <DeleteOutlined />, label: 'Xóa' },
  LOGIN: { color: 'processing', icon: <LoginOutlined />, label: 'Đăng nhập' },
  LOGOUT: { color: 'default', icon: <LogoutOutlined />, label: 'Đăng xuất' },
  Other: { color: 'default', icon: <QuestionCircleOutlined />, label: 'Khác' },
};

// ============================================================================
// 2. MOCK DATA
// ============================================================================

const mockLogs: AuditLogType[] = [
  {
    LogID: 'LOG-2024-001',
    UserName: 'Admin System',
    Action: 'UPDATE',
    EntityType: 'Product',
    EntityID: 'SP-001 (iPhone 15)',
    OldValue: '{\n  "Price": 25000000,\n  "Stock": 10,\n  "Status": "ACTIVE"\n}',
    NewValue: '{\n  "Price": 24500000,\n  "Stock": 15,\n  "Status": "ACTIVE"\n}',
    IPAddress: '192.168.1.10',
    UserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    CreatedAt: '2024-12-25 10:30:00',
  },
  {
    LogID: 'LOG-2024-002',
    UserName: 'Nguyễn Văn Kho',
    Action: 'CREATE',
    EntityType: 'ImportOrder',
    EntityID: 'PN-2024001',
    NewValue: '{\n  "Supplier": "Samsung Vina",\n  "TotalAmount": 500000000,\n  "ItemsCount": 50\n}',
    IPAddress: '113.161.22.10',
    UserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    CreatedAt: '2024-12-25 09:15:00',
  },
  {
    LogID: 'LOG-2024-003',
    UserName: 'Lê Thị Kế Toán',
    Action: 'LOGIN',
    EntityType: 'System',
    EntityID: 'AUTH',
    IPAddress: '14.161.99.88',
    UserAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    CreatedAt: '2024-12-25 08:00:00',
  },
  {
    LogID: 'LOG-2024-004',
    UserName: 'Admin System',
    Action: 'DELETE',
    EntityType: 'User',
    EntityID: 'user-guest-01',
    OldValue: '{\n  "Username": "staff_temp",\n  "Role": "GUEST",\n  "LastLogin": "2023-12-01"\n}',
    IPAddress: '192.168.1.10',
    UserAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    CreatedAt: '2024-12-24 17:45:00',
  },
];

// ============================================================================
// 3. MAIN COMPONENT
// ============================================================================

const AuditLogsPage: React.FC = () => {
  const [data] = useState(mockLogs);
  const [loading, setLoading] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogType | null>(null);

  // --- Helper Functions ---

  const handleViewDetail = (record: AuditLogType) => {
    setSelectedLog(record);
    setDetailModalOpen(true);
  };

  const getRandomColor = (name: string) => {
    const colors = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#1677ff', '#52c41a'];
    return colors[name.length % colors.length];
  };

  // --- Columns Configuration ---

  const columns: ColumnsType<AuditLogType> = [
    {
      title: 'Thời gian / Mã Log',
      dataIndex: 'CreatedAt',
      width: 220,
      render: (text, record) => (
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-end min-w-[60px] text-right">
            <span className="font-bold text-gray-700 text-sm">{dayjs(text).format('HH:mm')}</span>
            <span className="text-xs text-gray-400">{dayjs(text).format('DD/MM')}</span>
          </div>
          <div className="h-8 w-[2px] bg-gray-100 mx-1"></div>
          <div className="flex flex-col">
            <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1 rounded w-fit mb-1">{record.LogID}</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <GlobalOutlined className="text-[10px]" /> {record.IPAddress}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'UserName',
      render: (text) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: getRandomColor(text), verticalAlign: 'middle' }} size="small">
            {text.charAt(0)}
          </Avatar>
          <span className="font-medium text-gray-700">{text}</span>
        </div>
      )
    },
    {
      title: 'Hành động',
      dataIndex: 'Action',
      width: 140,
      align: 'center',
      render: (action) => {
        const config = ACTION_CONFIG[action] || ACTION_CONFIG['Other'];
        return (
          <Tag
            color={config.color}
            className="flex items-center justify-center gap-1 px-3 py-1 text-xs font-semibold border-0 min-w-[100px]"
          >
            {config.icon} {config.label.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Đối tượng tác động',
      key: 'entity',
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Tag color="blue" bordered={false}>{record.EntityType}</Tag>
          </div>
          <span className="text-sm font-medium text-gray-700 block truncate max-w-[200px]" title={record.EntityID}>
            {record.EntityID}
          </span>
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      align: 'right',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết thay đổi">
          <Button
            type="text"
            shape="circle"
            icon={<EyeOutlined className="text-blue-600" />}
            onClick={() => handleViewDetail(record)}
            className="hover:bg-blue-50"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Title level={3} style={{ margin: 0 }} className="flex items-center gap-2">
            <HistoryOutlined className="text-blue-600" /> Nhật Ký Hoạt Động
          </Title>
          <Text type="secondary">Truy vết toàn bộ thay đổi dữ liệu và bảo mật hệ thống</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => setLoading(true)}>Làm mới</Button>
          <Button type="primary" icon={<FileTextOutlined />}>Xuất báo cáo</Button>
        </Space>
      </div>

      {/* FILTER BAR */}
      <Card className="mb-6 shadow-sm border-gray-200" bodyStyle={{ padding: '16px 24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Tìm kiếm theo Mã Log, User, IP..."
              allowClear
            />
          </Col>
          <Col>
            <Divider type="vertical" className="h-6" />
          </Col>
          <Col>
            <RangePicker placeholder={['Từ ngày', 'Đến ngày']} style={{ width: 240 }} />
          </Col>
          <Col>
            <Select
              placeholder="Loại hành động"
              mode="multiple"
              style={{ width: 200 }}
              allowClear
              maxTagCount="responsive"
              options={Object.keys(ACTION_CONFIG).map(key => ({
                label: ACTION_CONFIG[key].label,
                value: key
              }))}
            />
          </Col>
          <Col>
            <Button icon={<FilterOutlined />}>Lọc nâng cao</Button>
          </Col>
        </Row>
      </Card>

      {/* DATA TABLE */}
      <Card className="shadow-sm border-gray-200" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="LogID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} bản ghi`
          }}
          scroll={{ x: 900 }}
        />
      </Card>

      {/* DETAIL MODAL - Tách thành component riêng */}
      <AuditLogDetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        log={selectedLog}
      />
    </div>
  );
};

export default AuditLogsPage;