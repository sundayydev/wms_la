// src/pages/Admin/Catalog/CommonIssues.tsx
import React, { useState, useMemo } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  message,
  Drawer,
  Descriptions,
  Badge,
  Divider,
  Timeline,
  Modal,
  Dropdown,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  BugOutlined,
  ToolOutlined,
  DollarOutlined,
  ClockCircleOutlined,
  FireOutlined,
  LaptopOutlined,
  WifiOutlined,
  ThunderboltOutlined,
  MobileOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { Link, useNavigate } from 'react-router-dom';
import { FaMicrochip, FaBatteryFull } from 'react-icons/fa';

const { Text, Title, Paragraph } = Typography;

// ============================================================================
// 1. TYPES (Mapping from SQL Schema)
// ============================================================================

type IssueSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type IssueCategory = 'HARDWARE' | 'SOFTWARE' | 'CONNECTIVITY' | 'BATTERY' | 'DISPLAY' | 'INPUT';

interface CommonIssue {
  issueId: string;
  issueCode: string; // VD: ISS-PDA-001

  // Sản phẩm liên quan
  componentId?: string;
  componentName?: string; // Mock data mapping
  categoryId?: string;
  categoryName?: string; // Mock data mapping

  // Thông tin lỗi
  issueName: string;
  issueDescription: string;

  // Phân loại
  issueCategory: IssueCategory;
  severity: IssueSeverity;

  // JSON Data
  commonCauses: string[];
  searchKeywords: string[];

  // Stats
  occurrenceCount: number;
  lastOccurrenceDate: string;

  // Repair Info
  avgRepairTimeMinutes: number;
  estimatedRepairCostMin: number;
  estimatedRepairCostMax: number;

  // Status
  isPublic: boolean;
  isActive: boolean;

  // Audit
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// 2. CONFIGURATION (Colors, Icons)
// ============================================================================

const SEVERITY_CONFIG: Record<IssueSeverity, { label: string; color: string; icon: React.ReactNode }> = {
  CRITICAL: { label: 'Nghiêm trọng', color: '#f5222d', icon: <FireOutlined /> }, // Red
  HIGH: { label: 'Cao', color: '#fa8c16', icon: <ThunderboltOutlined /> }, // Orange
  MEDIUM: { label: 'Trung bình', color: '#1890ff', icon: <ToolOutlined /> }, // Blue
  LOW: { label: 'Thấp', color: '#52c41a', icon: <BugOutlined /> }, // Green
};

const CATEGORY_CONFIG: Record<IssueCategory, { label: string; color: string; icon: React.ReactNode }> = {
  HARDWARE: { label: 'Phần cứng', color: 'magenta', icon: <FaMicrochip /> },
  SOFTWARE: { label: 'Phần mềm', color: 'cyan', icon: <AppstoreOutlined /> },
  CONNECTIVITY: { label: 'Kết nối', color: 'blue', icon: <WifiOutlined /> },
  BATTERY: { label: 'Pin / Nguồn', color: 'gold', icon: <FaBatteryFull /> },
  DISPLAY: { label: 'Màn hình', color: 'purple', icon: <LaptopOutlined /> },
  INPUT: { label: 'Phím / Cảm ứng', color: 'geekblue', icon: <MobileOutlined /> },
};

// ============================================================================
// 3. MOCK DATA
// ============================================================================

const mockIssues: CommonIssue[] = [
  {
    issueId: 'iss-001',
    issueCode: 'ISS-ZEB-001',
    componentName: 'Zebra TC51',
    categoryName: 'PDA',
    issueName: 'Màn hình sọc ngang, liệt cảm ứng',
    issueDescription: 'Thiết bị hiển thị các đường sọc ngang màn hình, cảm ứng không phản hồi tại khu vực sọc.',
    issueCategory: 'DISPLAY',
    severity: 'HIGH',
    commonCauses: ['Rơi vỡ', 'Lỏng cáp màn hình', 'Hỏng IC hiển thị'],
    searchKeywords: ['sọc màn hình', 'liệt cảm ứng', 'zebra tc51 display'],
    occurrenceCount: 154,
    lastOccurrenceDate: '2024-12-28T10:30:00',
    avgRepairTimeMinutes: 45,
    estimatedRepairCostMin: 1500000,
    estimatedRepairCostMax: 2200000,
    isPublic: true,
    isActive: true,
    createdByName: 'Admin',
    createdAt: '2024-01-10T00:00:00',
    updatedAt: '2024-12-28T10:30:00',
  },
  {
    issueId: 'iss-002',
    issueCode: 'ISS-HON-002',
    componentName: 'Honeywell EDA51',
    categoryName: 'PDA',
    issueName: 'Không nhận sạc, pin báo ảo',
    issueDescription: 'Cắm sạc không vào điện hoặc sạc rất chậm. Pin tụt nhanh từ 50% xuống 0%.',
    issueCategory: 'BATTERY',
    severity: 'MEDIUM',
    commonCauses: ['Chân sạc oxy hóa', 'Pin chai', 'Lỗi IC nguồn'],
    searchKeywords: ['sạc không vào', 'pin ảo', 'eda51 battery'],
    occurrenceCount: 89,
    lastOccurrenceDate: '2024-12-25T14:20:00',
    avgRepairTimeMinutes: 30,
    estimatedRepairCostMin: 500000,
    estimatedRepairCostMax: 1200000,
    isPublic: true,
    isActive: true,
    createdByName: 'Kỹ thuật A',
    createdAt: '2024-02-15T00:00:00',
    updatedAt: '2024-12-25T14:20:00',
  },
  {
    issueId: 'iss-003',
    issueCode: 'ISS-GEN-003',
    componentName: 'Mobydata M71',
    categoryName: 'Scanner',
    issueName: 'Mất kết nối Bluetooth liên tục',
    issueDescription: 'Máy quét kết nối với PDA/PC nhưng bị disconnect sau 1-2 phút sử dụng.',
    issueCategory: 'CONNECTIVITY',
    severity: 'LOW',
    commonCauses: ['Nhiễu sóng', 'Firmware cũ', 'Lỗi module Bluetooth'],
    searchKeywords: ['bluetooth disconnect', 'mất kết nối', 'mobydata m71'],
    occurrenceCount: 42,
    lastOccurrenceDate: '2024-12-20T09:00:00',
    avgRepairTimeMinutes: 20,
    estimatedRepairCostMin: 0,
    estimatedRepairCostMax: 800000,
    isPublic: false,
    isActive: true,
    createdByName: 'Kỹ thuật B',
    createdAt: '2024-03-01T00:00:00',
    updatedAt: '2024-12-20T09:00:00',
  },
  {
    issueId: 'iss-004',
    issueCode: 'ISS-SYS-004',
    categoryName: 'All PDAs',
    issueName: 'Treo logo khi khởi động (Bootloop)',
    issueDescription: 'Thiết bị bật nguồn chỉ hiện logo hãng rồi tự khởi động lại, không vào được Android.',
    issueCategory: 'SOFTWARE',
    severity: 'CRITICAL',
    commonCauses: ['Lỗi bản cập nhật OS', 'Xung đột ứng dụng', 'Hỏng bộ nhớ Flash'],
    searchKeywords: ['treo logo', 'bootloop', 'không vào được win'],
    occurrenceCount: 12,
    lastOccurrenceDate: '2024-11-30T16:45:00',
    avgRepairTimeMinutes: 120,
    estimatedRepairCostMin: 300000,
    estimatedRepairCostMax: 3500000,
    isPublic: true,
    isActive: true,
    createdByName: 'Admin',
    createdAt: '2024-05-20T00:00:00',
    updatedAt: '2024-11-30T16:45:00',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const CommonIssuesPage: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CommonIssue[]>(mockIssues);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | undefined>();
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | undefined>();

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<CommonIssue | null>(null);

  // Computed: Stats
  const stats = useMemo(() => {
    const total = data.length;
    const critical = data.filter(d => d.severity === 'CRITICAL' || d.severity === 'HIGH').length;
    const avgCost = data.reduce((acc, curr) => acc + (curr.estimatedRepairCostMin + curr.estimatedRepairCostMax) / 2, 0) / total;
    const totalOccurrences = data.reduce((acc, curr) => acc + curr.occurrenceCount, 0);

    return { total, critical, avgCost, totalOccurrences };
  }, [data]);

  // Computed: Filtered Data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = !searchText ||
        item.issueName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.issueCode.toLowerCase().includes(searchText.toLowerCase()) ||
        item.componentName?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.searchKeywords.some(k => k.toLowerCase().includes(searchText.toLowerCase()));

      const matchCategory = !categoryFilter || item.issueCategory === categoryFilter;
      const matchSeverity = !severityFilter || item.severity === severityFilter;

      return matchSearch && matchCategory && matchSeverity;
    });
  }, [data, searchText, categoryFilter, severityFilter]);

  // Helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Actions
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Đã cập nhật dữ liệu mới nhất');
    }, 600);
  };

  const handleViewDetail = (record: CommonIssue) => {
    setSelectedIssue(record);
    setDrawerOpen(true);
  };

  const handleDelete = (record: CommonIssue) => {
    Modal.confirm({
      title: 'Xóa vấn đề này?',
      content: `Bạn có chắc muốn xóa "${record.issueName}"? Dữ liệu lịch sử sửa chữa liên quan vẫn sẽ được giữ lại.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        setData(prev => prev.filter(item => item.issueId !== record.issueId));
        message.success('Đã xóa thành công');
      }
    });
  };

  // Menu Actions
  const getActionMenu = (record: CommonIssue): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: <EyeOutlined />,
      onClick: () => handleViewDetail(record),
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: <EditOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record),
    },
  ];

  // Table Columns
  const columns: ColumnsType<CommonIssue> = [
    {
      title: 'Mã & Tên lỗi',
      key: 'name',
      width: 280,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Text code className="text-xs">{record.issueCode}</Text>
            {record.isPublic && <Tooltip title="Hiển thị cho khách"><EyeOutlined className="text-blue-500" /></Tooltip>}
          </div>
          <a onClick={() => handleViewDetail(record)} className="font-semibold text-blue-700 hover:underline block mb-1">
            {record.issueName}
          </a>
          <Text type="secondary" className="text-xs">
            Thiết bị: {record.componentName || 'Tất cả'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Phân loại',
      key: 'category',
      width: 150,
      render: (_, record) => {
        const cat = CATEGORY_CONFIG[record.issueCategory];
        const sev = SEVERITY_CONFIG[record.severity];
        return (
          <div className="space-y-1">
            <Tag color={cat.color} icon={cat.icon} className="w-full text-center mr-0 mb-1">
              {cat.label}
            </Tag>
            <div className="flex items-center gap-1 text-xs">
              Mức độ: <span style={{ color: sev.color, fontWeight: 'bold' }}>{sev.label}</span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Sửa chữa (Ước tính)',
      key: 'repair',
      width: 200,
      render: (_, record) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-600 mb-1">
            <ClockCircleOutlined /> {record.avgRepairTimeMinutes} phút
          </div>
          <div className="flex items-center gap-1 font-medium text-slate-700">
            <DollarOutlined /> {formatCurrency(record.estimatedRepairCostMin)} - {formatCurrency(record.estimatedRepairCostMax)}
          </div>
        </div>
      )
    },
    {
      title: 'Tần suất',
      key: 'stats',
      width: 150,
      sorter: (a, b) => a.occurrenceCount - b.occurrenceCount,
      render: (_, record) => (
        <div>
          <div className="text-lg font-bold text-center">{record.occurrenceCount}</div>
          <div className="text-xs text-gray-400 text-center">lần gặp</div>
          <div className="text-xs text-gray-400 text-center mt-1">
            Lần cuối: {dayjs(record.lastOccurrenceDate).format('DD/MM/YY')}
          </div>
        </div>
      )
    },
    {
      title: '',
      key: 'action',
      width: 50,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="w-full p-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <BugOutlined className="text-red-500" />
            Danh mục Lỗi Phổ biến (Common Issues)
          </h1>
          <p className="text-gray-500 mt-1">
            Kho tri thức về các lỗi thường gặp, nguyên nhân và chi phí sửa chữa.
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-blue-600"
            onClick={() => message.info('Mở trang tạo mới')}
          >
            Thêm Lỗi Mới
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6} lg={6}>
          <Card bordered={false} className="shadow-sm bg-blue-50">
            <Statistic
              title={<span className="text-blue-600 font-semibold">Tổng số lỗi</span>}
              value={stats.total}
              prefix={<BugOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card bordered={false} className="shadow-sm bg-red-50">
            <Statistic
              title={<span className="text-red-600 font-semibold">Lỗi nghiêm trọng</span>}
              value={stats.critical}
              prefix={<FireOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card bordered={false} className="shadow-sm bg-green-50">
            <Statistic
              title={<span className="text-green-600 font-semibold">CP Sửa trung bình</span>}
              value={stats.avgCost}
              precision={0}
              prefix={<DollarOutlined />}
              formatter={(val) => formatCurrency(Number(val))}
              valueStyle={{ color: '#389e0d' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card bordered={false} className="shadow-sm bg-purple-50">
            <Statistic
              title={<span className="text-purple-600 font-semibold">Tổng lượt xử lý</span>}
              value={stats.totalOccurrences}
              prefix={<ToolOutlined />}
              suffix="ca"
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card className="mb-6 shadow-sm" bodyStyle={{ padding: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Input
              placeholder="Tìm kiếm tên lỗi, mã lỗi, triệu chứng..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Phân loại lỗi"
              className="w-full"
              allowClear
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={Object.entries(CATEGORY_CONFIG).map(([key, conf]) => ({
                value: key,
                label: <span>{conf.icon} {conf.label}</span>
              }))}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Mức độ nghiêm trọng"
              className="w-full"
              allowClear
              value={severityFilter}
              onChange={setSeverityFilter}
              options={Object.entries(SEVERITY_CONFIG).map(([key, conf]) => ({
                value: key,
                label: <span style={{ color: conf.color }}>{conf.label}</span>
              }))}
            />
          </Col>
          <Col xs={24} md={4} className="text-right">
            <Text type="secondary" className="text-xs">Hiển thị {filteredData.length} kết quả</Text>
          </Col>
        </Row>
      </Card>

      {/* Data Table */}
      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="issueId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={selectedIssue ? (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600 text-xl">
              {CATEGORY_CONFIG[selectedIssue.issueCategory].icon}
            </div>
            <div>
              <div className="font-bold text-lg">{selectedIssue.issueName}</div>
              <div className="text-xs text-gray-500">{selectedIssue.issueCode}</div>
            </div>
          </div>
        ) : 'Chi tiết lỗi'}
        placement="right"
        width={720}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Đóng</Button>
            <Button type="primary" icon={<EditOutlined />}>Sửa</Button>
          </Space>
        }
      >
        {selectedIssue && (
          <div className="space-y-6">
            {/* Overview Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <Space size="large">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Mức độ</div>
                  <Tag color={SEVERITY_CONFIG[selectedIssue.severity].color} className="mt-1 text-sm px-3 py-1">
                    {SEVERITY_CONFIG[selectedIssue.severity].icon} {SEVERITY_CONFIG[selectedIssue.severity].label}
                  </Tag>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Tình trạng</div>
                  <Badge status={selectedIssue.isActive ? 'success' : 'default'} text={selectedIssue.isActive ? 'Đang hoạt động' : 'Ngưng sử dụng'} className="mt-1 block" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Hiển thị Public</div>
                  <span className="font-medium mt-1 block">{selectedIssue.isPublic ? 'Có' : 'Không'}</span>
                </div>
              </Space>
            </div>

            <Descriptions title="Thông tin chi tiết" bordered column={2}>
              <Descriptions.Item label="Thiết bị áp dụng" span={2}>
                <Link to={`/admin/catalog/components/${selectedIssue.componentId}`} className="font-semibold text-blue-600">
                  {selectedIssue.componentName}
                </Link>
                {selectedIssue.categoryName && <Tag className="ml-2">{selectedIssue.categoryName}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả triệu chứng" span={2}>
                {selectedIssue.issueDescription}
              </Descriptions.Item>
              <Descriptions.Item label="Thời gian sửa TB">
                {selectedIssue.avgRepairTimeMinutes} phút
              </Descriptions.Item>
              <Descriptions.Item label="Chi phí ước tính">
                <span className="text-green-600 font-bold">
                  {formatCurrency(selectedIssue.estimatedRepairCostMin)} - {formatCurrency(selectedIssue.estimatedRepairCostMax)}
                </span>
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="horizontal">Phân tích kỹ thuật</Divider>

            <Row gutter={24}>
              <Col span={12}>
                <Title level={5} className="text-gray-600 mb-3">Nguyên nhân phổ biến</Title>
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {selectedIssue.commonCauses.map((cause, idx) => (
                    <li key={idx}>{cause}</li>
                  ))}
                  {selectedIssue.commonCauses.length === 0 && <li className="text-gray-400">Chưa cập nhật</li>}
                </ul>
              </Col>
              <Col span={12}>
                <Title level={5} className="text-gray-600 mb-3">Từ khóa tìm kiếm (SEO)</Title>
                <div className="flex flex-wrap gap-2">
                  {selectedIssue.searchKeywords.map((kw, idx) => (
                    <Tag key={idx} color="blue">#{kw}</Tag>
                  ))}
                </div>
              </Col>
            </Row>

            <Divider orientation="horizontal">Lịch sử & Thống kê</Divider>
            <div className="grid grid-cols-2 gap-4">
              <Card size="small" title="Tần suất xuất hiện">
                <Statistic value={selectedIssue.occurrenceCount} suffix="lần" />
                <div className="text-xs text-gray-400 mt-2">Tính trên tổng số phiếu sửa chữa</div>
              </Card>
              <Card size="small" title="Gặp gần đây nhất">
                <Statistic value={dayjs(selectedIssue.lastOccurrenceDate).format('DD/MM/YYYY')} valueStyle={{ fontSize: 18 }} />
                <div className="text-xs text-gray-400 mt-2">Cách đây {dayjs().diff(dayjs(selectedIssue.lastOccurrenceDate), 'day')} ngày</div>
              </Card>
            </div>

            <div className="text-right text-xs text-gray-400 pt-4 border-t">
              Ngày tạo: {dayjs(selectedIssue.createdAt).format('DD/MM/YYYY')} bởi {selectedIssue.createdByName}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default CommonIssuesPage;