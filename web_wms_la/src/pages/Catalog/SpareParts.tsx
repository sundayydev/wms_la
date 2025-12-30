import React, { useState, useMemo } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Modal,
  Form,
  Drawer,
  Divider,
  message,
  Empty,
  Avatar,
  Tooltip,
  Dropdown,
  Table,
  InputNumber,
  Switch,
  Popconfirm,
  Badge,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ToolOutlined,
  EyeOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  UserOutlined,
  AppstoreOutlined,
  LinkOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  InboxOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ============================================================================
// TYPES
// ============================================================================

// Loại linh kiện thay thế
type SparePartType =
  | 'BATTERY'       // Pin
  | 'SCREEN'        // Màn hình
  | 'KEYBOARD'      // Bàn phím
  | 'PRINTHEAD'     // Đầu in
  | 'CHARGER'       // Sạc
  | 'CABLE'         // Cáp
  | 'COVER'         // Vỏ máy
  | 'BOARD'         // Bo mạch
  | 'SENSOR'        // Cảm biến
  | 'OTHER';        // Khác

// Mức độ tương thích
type CompatibilityLevel = 'OEM' | 'COMPATIBLE' | 'GENERIC';

// Linh kiện thay thế
interface SparePart {
  sparePartId: string;

  // Sản phẩm chính mà linh kiện này dùng để thay thế
  mainComponentId: string;
  mainComponentName: string;
  mainComponentSku: string;

  // Linh kiện thay thế (link tới Component trong kho)
  spareComponentId: string;
  spareComponentName: string;
  spareComponentSku: string;

  // Thông tin
  sparePartType: SparePartType;
  compatibilityLevel: CompatibilityLevel;
  quantity: number; // Số lượng cần cho 1 lần thay thế

  // Thông tin kỹ thuật
  installationGuide?: string;
  estimatedTime?: number; // Phút
  difficultyLevel?: 'EASY' | 'MEDIUM' | 'HARD';
  requiresSpecialTool?: boolean;
  specialToolNote?: string;

  // Trạng thái
  isActive: boolean;

  // Audit
  createdByUserId?: string;
  createdByUserName?: string;
  createdAt: string;
  updatedAt: string;

  // Joined fields
  spareComponentPrice?: number;
  spareComponentStock?: number;
  spareComponentImage?: string;
}

// Component option cho dropdown
interface ComponentOption {
  componentId: string;
  sku: string;
  componentName: string;
  brand?: string;
  basePrice?: number;
}

// ============================================================================
// CONFIGS
// ============================================================================

const SPARE_PART_TYPE_CONFIG: Record<SparePartType, { label: string; color: string; icon: React.ReactNode }> = {
  BATTERY: { label: 'Pin', color: 'orange', icon: <span>🔋</span> },
  SCREEN: { label: 'Màn hình', color: 'blue', icon: <span>📱</span> },
  KEYBOARD: { label: 'Bàn phím', color: 'purple', icon: <span>⌨️</span> },
  PRINTHEAD: { label: 'Đầu in', color: 'red', icon: <span>🖨️</span> },
  CHARGER: { label: 'Sạc', color: 'green', icon: <span>🔌</span> },
  CABLE: { label: 'Cáp', color: 'cyan', icon: <span>🔗</span> },
  COVER: { label: 'Vỏ máy', color: 'default', icon: <span>📦</span> },
  BOARD: { label: 'Bo mạch', color: 'volcano', icon: <span>🔧</span> },
  SENSOR: { label: 'Cảm biến', color: 'magenta', icon: <span>📡</span> },
  OTHER: { label: 'Khác', color: 'default', icon: <span>🔩</span> },
};

const COMPATIBILITY_CONFIG: Record<CompatibilityLevel, { label: string; color: string; description: string }> = {
  OEM: { label: 'Chính hãng (OEM)', color: 'success', description: 'Linh kiện gốc từ nhà sản xuất' },
  COMPATIBLE: { label: 'Tương thích', color: 'processing', description: 'Linh kiện tương thích từ bên thứ 3' },
  GENERIC: { label: 'Thay thế chung', color: 'warning', description: 'Linh kiện thay thế phổ thông' },
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  EASY: { label: 'Dễ', color: 'success' },
  MEDIUM: { label: 'Trung bình', color: 'warning' },
  HARD: { label: 'Khó', color: 'error' },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockMainComponents: ComponentOption[] = [
  { componentId: '1', sku: 'MOBY-M63-V2', componentName: 'Máy kiểm kho PDA Mobydata M63 V2', brand: 'Mobydata', basePrice: 5500000 },
  { componentId: '2', sku: 'ZEBRA-TC21', componentName: 'Zebra TC21 Android Mobile Computer', brand: 'Zebra', basePrice: 12000000 },
  { componentId: '3', sku: 'ZEB-ZD421-DT', componentName: 'Zebra ZD421 Direct Thermal Printer', brand: 'Zebra', basePrice: 8500000 },
  { componentId: '4', sku: 'HON-1400G', componentName: 'Máy quét mã vạch Honeywell Voyager 1400g', brand: 'Honeywell', basePrice: 2800000 },
];

const mockSpareComponents: ComponentOption[] = [
  { componentId: 's1', sku: 'BAT-M63-STD', componentName: 'Pin Mobydata M63 Standard (3000mAh)', brand: 'Mobydata', basePrice: 450000 },
  { componentId: 's2', sku: 'BAT-M63-EXT', componentName: 'Pin Mobydata M63 Extended (5000mAh)', brand: 'Mobydata', basePrice: 680000 },
  { componentId: 's3', sku: 'BAT-TC21-STD', componentName: 'Pin Zebra TC21 Standard', brand: 'Zebra', basePrice: 1200000 },
  { componentId: 's4', sku: 'BAT-TC21-EXT', componentName: 'Pin Zebra TC21 Extended', brand: 'Zebra', basePrice: 1800000 },
  { componentId: 's5', sku: 'SCR-M63', componentName: 'Màn hình LCD Mobydata M63', brand: 'Mobydata', basePrice: 1200000 },
  { componentId: 's6', sku: 'SCR-TC21', componentName: 'Màn hình cảm ứng Zebra TC21', brand: 'Zebra', basePrice: 3500000 },
  { componentId: 's7', sku: 'PH-ZD421', componentName: 'Đầu in nhiệt Zebra ZD421', brand: 'Zebra', basePrice: 2800000 },
  { componentId: 's8', sku: 'CHG-M63', componentName: 'Sạc USB-C Mobydata M63', brand: 'Mobydata', basePrice: 250000 },
  { componentId: 's9', sku: 'DOCK-TC21', componentName: 'Đế sạc 4 slot Zebra TC21', brand: 'Zebra', basePrice: 4500000 },
  { componentId: 's10', sku: 'CBL-USB-HON', componentName: 'Cáp USB Honeywell 1400g', brand: 'Honeywell', basePrice: 180000 },
];

const mockSpareParts: SparePart[] = [
  {
    sparePartId: 'sp-001',
    mainComponentId: '1',
    mainComponentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    mainComponentSku: 'MOBY-M63-V2',
    spareComponentId: 's1',
    spareComponentName: 'Pin Mobydata M63 Standard (3000mAh)',
    spareComponentSku: 'BAT-M63-STD',
    sparePartType: 'BATTERY',
    compatibilityLevel: 'OEM',
    quantity: 1,
    estimatedTime: 5,
    difficultyLevel: 'EASY',
    requiresSpecialTool: false,
    isActive: true,
    createdByUserName: 'Nguyễn Văn A',
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
    spareComponentPrice: 450000,
    spareComponentStock: 25,
    spareComponentImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=bat1',
  },
  {
    sparePartId: 'sp-002',
    mainComponentId: '1',
    mainComponentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    mainComponentSku: 'MOBY-M63-V2',
    spareComponentId: 's2',
    spareComponentName: 'Pin Mobydata M63 Extended (5000mAh)',
    spareComponentSku: 'BAT-M63-EXT',
    sparePartType: 'BATTERY',
    compatibilityLevel: 'OEM',
    quantity: 1,
    estimatedTime: 5,
    difficultyLevel: 'EASY',
    requiresSpecialTool: false,
    isActive: true,
    createdByUserName: 'Nguyễn Văn A',
    createdAt: '2024-10-01T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
    spareComponentPrice: 680000,
    spareComponentStock: 15,
    spareComponentImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=bat2',
  },
  {
    sparePartId: 'sp-003',
    mainComponentId: '1',
    mainComponentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    mainComponentSku: 'MOBY-M63-V2',
    spareComponentId: 's5',
    spareComponentName: 'Màn hình LCD Mobydata M63',
    spareComponentSku: 'SCR-M63',
    sparePartType: 'SCREEN',
    compatibilityLevel: 'OEM',
    quantity: 1,
    installationGuide: 'Cần mở nắp lưng, tháo 4 con vít, cẩn thận với cáp flex',
    estimatedTime: 30,
    difficultyLevel: 'MEDIUM',
    requiresSpecialTool: true,
    specialToolNote: 'Cần tua vít đặc biệt Torx T5',
    isActive: true,
    createdByUserName: 'Trần Văn B',
    createdAt: '2024-10-15T09:00:00Z',
    updatedAt: '2024-11-20T11:00:00Z',
    spareComponentPrice: 1200000,
    spareComponentStock: 8,
    spareComponentImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=scr1',
  },
  {
    sparePartId: 'sp-004',
    mainComponentId: '2',
    mainComponentName: 'Zebra TC21 Android Mobile Computer',
    mainComponentSku: 'ZEBRA-TC21',
    spareComponentId: 's3',
    spareComponentName: 'Pin Zebra TC21 Standard',
    spareComponentSku: 'BAT-TC21-STD',
    sparePartType: 'BATTERY',
    compatibilityLevel: 'OEM',
    quantity: 1,
    estimatedTime: 3,
    difficultyLevel: 'EASY',
    requiresSpecialTool: false,
    isActive: true,
    createdByUserName: 'Nguyễn Văn A',
    createdAt: '2024-09-01T10:00:00Z',
    updatedAt: '2024-12-15T14:30:00Z',
    spareComponentPrice: 1200000,
    spareComponentStock: 20,
    spareComponentImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=bat3',
  },
  {
    sparePartId: 'sp-005',
    mainComponentId: '2',
    mainComponentName: 'Zebra TC21 Android Mobile Computer',
    mainComponentSku: 'ZEBRA-TC21',
    spareComponentId: 's6',
    spareComponentName: 'Màn hình cảm ứng Zebra TC21',
    spareComponentSku: 'SCR-TC21',
    sparePartType: 'SCREEN',
    compatibilityLevel: 'OEM',
    quantity: 1,
    installationGuide: 'Chỉ kỹ thuật viên được đào tạo mới được thực hiện',
    estimatedTime: 60,
    difficultyLevel: 'HARD',
    requiresSpecialTool: true,
    specialToolNote: 'Bộ dụng cụ Zebra Repair Kit chuyên dụng',
    isActive: true,
    createdByUserName: 'Kỹ thuật Team',
    createdAt: '2024-08-01T10:00:00Z',
    updatedAt: '2024-12-10T09:00:00Z',
    spareComponentPrice: 3500000,
    spareComponentStock: 5,
    spareComponentImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=scr2',
  },
  {
    sparePartId: 'sp-006',
    mainComponentId: '3',
    mainComponentName: 'Zebra ZD421 Direct Thermal Printer',
    mainComponentSku: 'ZEB-ZD421-DT',
    spareComponentId: 's7',
    spareComponentName: 'Đầu in nhiệt Zebra ZD421',
    spareComponentSku: 'PH-ZD421',
    sparePartType: 'PRINTHEAD',
    compatibilityLevel: 'OEM',
    quantity: 1,
    installationGuide: 'Tắt máy, mở nắp, tháo đầu in cũ, lắp đầu in mới, căn chỉnh',
    estimatedTime: 15,
    difficultyLevel: 'MEDIUM',
    requiresSpecialTool: false,
    isActive: true,
    createdByUserName: 'Trần Văn B',
    createdAt: '2024-07-01T10:00:00Z',
    updatedAt: '2024-12-01T14:30:00Z',
    spareComponentPrice: 2800000,
    spareComponentStock: 10,
    spareComponentImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=ph1',
  },
  {
    sparePartId: 'sp-007',
    mainComponentId: '4',
    mainComponentName: 'Máy quét mã vạch Honeywell Voyager 1400g',
    mainComponentSku: 'HON-1400G',
    spareComponentId: 's10',
    spareComponentName: 'Cáp USB Honeywell 1400g',
    spareComponentSku: 'CBL-USB-HON',
    sparePartType: 'CABLE',
    compatibilityLevel: 'OEM',
    quantity: 1,
    estimatedTime: 2,
    difficultyLevel: 'EASY',
    requiresSpecialTool: false,
    isActive: true,
    createdByUserName: 'Nguyễn Văn A',
    createdAt: '2024-11-01T10:00:00Z',
    updatedAt: '2024-11-01T10:00:00Z',
    spareComponentPrice: 180000,
    spareComponentStock: 50,
    spareComponentImage: 'https://api.dicebear.com/7.x/shapes/svg?seed=cbl1',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SpareParts: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [data] = useState<SparePart[]>(mockSpareParts);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<SparePartType | 'ALL'>('ALL');
  const [selectedMainComponent, setSelectedMainComponent] = useState<string | undefined>();
  const [selectedCompatibility, setSelectedCompatibility] = useState<CompatibilityLevel | 'ALL'>('ALL');

  // Modal/Drawer states
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SparePart | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();

  // Computed: Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = !searchText ||
        item.spareComponentName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.spareComponentSku.toLowerCase().includes(searchText.toLowerCase()) ||
        item.mainComponentName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.mainComponentSku.toLowerCase().includes(searchText.toLowerCase());

      const matchType = selectedType === 'ALL' || item.sparePartType === selectedType;
      const matchMain = !selectedMainComponent || item.mainComponentId === selectedMainComponent;
      const matchCompat = selectedCompatibility === 'ALL' || item.compatibilityLevel === selectedCompatibility;

      return matchSearch && matchType && matchMain && matchCompat;
    });
  }, [data, searchText, selectedType, selectedMainComponent, selectedCompatibility]);

  // Stats
  const stats = useMemo(() => ({
    total: data.length,
    active: data.filter(d => d.isActive).length,
    oem: data.filter(d => d.compatibilityLevel === 'OEM').length,
    products: new Set(data.map(d => d.mainComponentId)).size,
    lowStock: data.filter(d => (d.spareComponentStock || 0) < 5).length,
  }), [data]);

  // Format currency
  const formatCurrency = (value?: number) => {
    if (!value) return '---';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // Handlers
  const handleViewDetail = (item: SparePart) => {
    setSelectedItem(item);
    setDetailDrawerOpen(true);
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      console.log('New spare part:', values);
      message.success('Đã thêm linh kiện thay thế');
      setCreateModalOpen(false);
      createForm.resetFields();
    } catch (error) {
      // Validation failed
    }
  };

  const handleDelete = (id: string) => {
    message.success('Đã xóa linh kiện thay thế');
  };

  const handleToggleActive = (id: string, active: boolean) => {
    message.success(active ? 'Đã kích hoạt' : 'Đã tắt');
  };

  // Table Columns
  const columns: ColumnsType<SparePart> = [
    {
      title: 'Linh kiện thay thế',
      key: 'spare',
      width: 300,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            shape="square"
            size={48}
            src={record.spareComponentImage}
            icon={SPARE_PART_TYPE_CONFIG[record.sparePartType].icon}
            className="bg-gray-100 flex-shrink-0"
          />
          <div className="min-w-0">
            <div
              className="font-medium text-gray-800 line-clamp-1 cursor-pointer hover:text-blue-600"
              onClick={() => handleViewDetail(record)}
            >
              {record.spareComponentName}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Tag>{record.spareComponentSku}</Tag>
              <Tag color={SPARE_PART_TYPE_CONFIG[record.sparePartType].color}>
                {SPARE_PART_TYPE_CONFIG[record.sparePartType].label}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Dùng cho sản phẩm',
      key: 'mainComponent',
      width: 250,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-700 line-clamp-1">{record.mainComponentName}</div>
          <Tag className="mt-1" color="blue">{record.mainComponentSku}</Tag>
        </div>
      ),
    },
    {
      title: 'Tương thích',
      dataIndex: 'compatibilityLevel',
      key: 'compatibility',
      width: 140,
      align: 'center',
      filters: Object.entries(COMPATIBILITY_CONFIG).map(([key, config]) => ({
        text: config.label,
        value: key,
      })),
      onFilter: (value, record) => record.compatibilityLevel === value,
      render: (level: CompatibilityLevel) => {
        const config = COMPATIBILITY_CONFIG[level];
        return (
          <Tooltip title={config.description}>
            <Tag color={config.color}>{config.label}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Giá',
      dataIndex: 'spareComponentPrice',
      key: 'price',
      width: 130,
      align: 'right',
      sorter: (a, b) => (a.spareComponentPrice || 0) - (b.spareComponentPrice || 0),
      render: (price) => (
        <span className="font-mono text-gray-700 font-medium">{formatCurrency(price)}</span>
      ),
    },
    {
      title: 'Tồn kho',
      dataIndex: 'spareComponentStock',
      key: 'stock',
      width: 100,
      align: 'center',
      sorter: (a, b) => (a.spareComponentStock || 0) - (b.spareComponentStock || 0),
      render: (stock) => {
        const isLow = stock < 5;
        return (
          <Badge
            count={stock}
            style={{ backgroundColor: isLow ? '#ff4d4f' : '#52c41a' }}
            overflowCount={999}
          />
        );
      },
    },
    {
      title: 'Độ khó',
      dataIndex: 'difficultyLevel',
      key: 'difficulty',
      width: 100,
      align: 'center',
      render: (level) => {
        if (!level) return '---';
        const config = DIFFICULTY_CONFIG[level];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'estimatedTime',
      key: 'time',
      width: 100,
      align: 'center',
      render: (time) => time ? `${time} phút` : '---',
    },
    {
      title: 'Kích hoạt',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (active, record) => (
        <Switch
          checked={active}
          size="small"
          onChange={(checked) => handleToggleActive(record.sparePartId, checked)}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => handleViewDetail(record) },
              { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
              { type: 'divider' },
              { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => handleDelete(record.sparePartId) },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <ToolOutlined className="text-orange-500" />
            Linh kiện thay thế
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý các linh kiện có thể dùng để thay thế/sửa chữa cho sản phẩm
          </p>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-600"
          >
            Thêm linh kiện
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6} lg={4}>
          <Card className="shadow-sm" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-500">Tổng linh kiện</span>}
              value={stats.total}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card className="shadow-sm" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-500">Đang hoạt động</span>}
              value={stats.active}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card className="shadow-sm" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-500">Chính hãng (OEM)</span>}
              value={stats.oem}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={4}>
          <Card className="shadow-sm" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-500">Sản phẩm áp dụng</span>}
              value={stats.products}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={8}>
          <Card className="shadow-sm" bodyStyle={{ padding: '16px', background: stats.lowStock > 0 ? '#fff2f0' : '#f6ffed' }}>
            <Statistic
              title={<span className="text-gray-500">Sắp hết hàng (dưới 5)</span>}
              value={stats.lowStock}
              valueStyle={{ color: stats.lowStock > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card className="mb-6 shadow-sm" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm linh kiện, SKU, sản phẩm..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              placeholder="Loại linh kiện"
              allowClear
              className="w-36"
              value={selectedType === 'ALL' ? undefined : selectedType}
              onChange={(val) => setSelectedType(val || 'ALL')}
              options={Object.entries(SPARE_PART_TYPE_CONFIG).map(([key, config]) => ({
                value: key,
                label: (
                  <span className="flex items-center gap-2">
                    {config.icon}
                    {config.label}
                  </span>
                ),
              }))}
            />
            <Select
              placeholder="Sản phẩm chính"
              allowClear
              showSearch
              className="w-56"
              value={selectedMainComponent}
              onChange={setSelectedMainComponent}
              optionFilterProp="label"
              options={mockMainComponents.map(c => ({
                value: c.componentId,
                label: `${c.sku} - ${c.componentName}`,
              }))}
            />
            <Select
              placeholder="Mức tương thích"
              allowClear
              className="w-40"
              value={selectedCompatibility === 'ALL' ? undefined : selectedCompatibility}
              onChange={(val) => setSelectedCompatibility(val || 'ALL')}
              options={Object.entries(COMPATIBILITY_CONFIG).map(([key, config]) => ({
                value: key,
                label: config.label,
              }))}
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      {filteredData.length === 0 ? (
        <Card className="shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy linh kiện thay thế nào"
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Thêm linh kiện
            </Button>
          </Empty>
        </Card>
      ) : (
        <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="sparePartId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} linh kiện`,
            }}
            scroll={{ x: 1400 }}
          />
        </Card>
      )}

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết linh kiện thay thế"
        placement="right"
        width={600}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        extra={
          <Space>
            <Button icon={<EditOutlined />}>Chỉnh sửa</Button>
          </Space>
        }
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <Avatar
                shape="square"
                size={80}
                src={selectedItem.spareComponentImage}
                icon={SPARE_PART_TYPE_CONFIG[selectedItem.sparePartType].icon}
                className="bg-gray-100"
              />
              <div className="flex-1">
                <Title level={4} className="m-0 mb-2">{selectedItem.spareComponentName}</Title>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag>{selectedItem.spareComponentSku}</Tag>
                  <Tag color={SPARE_PART_TYPE_CONFIG[selectedItem.sparePartType].color}>
                    {SPARE_PART_TYPE_CONFIG[selectedItem.sparePartType].label}
                  </Tag>
                  <Tag color={COMPATIBILITY_CONFIG[selectedItem.compatibilityLevel].color}>
                    {COMPATIBILITY_CONFIG[selectedItem.compatibilityLevel].label}
                  </Tag>
                </div>
              </div>
            </div>

            <Divider />

            {/* Sản phẩm chính */}
            <div>
              <Text strong className="flex items-center gap-1">
                <SwapOutlined /> Dùng để thay thế cho
              </Text>
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="font-medium text-blue-800">{selectedItem.mainComponentName}</div>
                <Tag color="blue" className="mt-1">{selectedItem.mainComponentSku}</Tag>
              </div>
            </div>

            {/* Thông tin kỹ thuật */}
            <div>
              <Text strong className="flex items-center gap-1">
                <SettingOutlined /> Thông tin kỹ thuật
              </Text>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Số lượng cần</div>
                  <div className="font-bold text-lg">{selectedItem.quantity}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Thời gian ước tính</div>
                  <div className="font-bold text-lg">{selectedItem.estimatedTime || '---'} phút</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Độ khó</div>
                  <div>
                    {selectedItem.difficultyLevel ? (
                      <Tag color={DIFFICULTY_CONFIG[selectedItem.difficultyLevel].color}>
                        {DIFFICULTY_CONFIG[selectedItem.difficultyLevel].label}
                      </Tag>
                    ) : '---'}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500">Dụng cụ đặc biệt</div>
                  <div>
                    {selectedItem.requiresSpecialTool ? (
                      <Tag color="warning">Cần dụng cụ</Tag>
                    ) : (
                      <Tag color="success">Không cần</Tag>
                    )}
                  </div>
                </div>
              </div>
              {selectedItem.specialToolNote && (
                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                  <ToolOutlined className="mr-1" />
                  {selectedItem.specialToolNote}
                </div>
              )}
            </div>

            {/* Hướng dẫn */}
            {selectedItem.installationGuide && (
              <div>
                <Text strong>Hướng dẫn lắp đặt</Text>
                <Paragraph className="text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">
                  {selectedItem.installationGuide}
                </Paragraph>
              </div>
            )}

            {/* Inventory */}
            <div>
              <Text strong className="flex items-center gap-1">
                <InboxOutlined /> Thông tin kho
              </Text>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="text-xs text-gray-500">Giá bán</div>
                  <div className="font-bold text-lg text-green-600">
                    {formatCurrency(selectedItem.spareComponentPrice)}
                  </div>
                </div>
                <div className={`p-3 rounded-lg border ${(selectedItem.spareComponentStock || 0) < 5 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="text-xs text-gray-500">Tồn kho</div>
                  <div className={`font-bold text-lg ${(selectedItem.spareComponentStock || 0) < 5 ? 'text-red-500' : ''}`}>
                    {selectedItem.spareComponentStock || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="text-sm text-gray-500 pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span><UserOutlined className="mr-1" />Người tạo:</span>
                <span className="font-medium">{selectedItem.createdByUserName}</span>
              </div>
              <div className="flex justify-between">
                <span><ClockCircleOutlined className="mr-1" />Ngày tạo:</span>
                <span>{dayjs(selectedItem.createdAt).format('DD/MM/YYYY HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span><ClockCircleOutlined className="mr-1" />Cập nhật:</span>
                <span>{dayjs(selectedItem.updatedAt).format('DD/MM/YYYY HH:mm')}</span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Create Modal */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <PlusOutlined className="text-blue-600" />
            Thêm linh kiện thay thế
          </span>
        }
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        onOk={handleCreate}
        okText="Thêm linh kiện"
        cancelText="Hủy"
        width={650}
      >
        <Form form={createForm} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="mainComponentId"
                label="Sản phẩm chính"
                rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
              >
                <Select
                  placeholder="Chọn sản phẩm cần linh kiện"
                  showSearch
                  optionFilterProp="label"
                  options={mockMainComponents.map(c => ({
                    value: c.componentId,
                    label: `${c.sku} - ${c.componentName}`,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="spareComponentId"
                label="Linh kiện thay thế"
                rules={[{ required: true, message: 'Vui lòng chọn linh kiện' }]}
              >
                <Select
                  placeholder="Chọn linh kiện từ kho"
                  showSearch
                  optionFilterProp="label"
                  options={mockSpareComponents.map(c => ({
                    value: c.componentId,
                    label: `${c.sku} - ${c.componentName}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="sparePartType"
                label="Loại linh kiện"
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Chọn loại"
                  options={Object.entries(SPARE_PART_TYPE_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: (
                      <span className="flex items-center gap-2">
                        {config.icon} {config.label}
                      </span>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="compatibilityLevel"
                label="Mức tương thích"
                rules={[{ required: true }]}
                initialValue="OEM"
              >
                <Select
                  options={Object.entries(COMPATIBILITY_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: config.label,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="quantity"
                label="Số lượng cần"
                initialValue={1}
                rules={[{ required: true }]}
              >
                <InputNumber min={1} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="estimatedTime" label="Thời gian (phút)">
                <InputNumber min={1} className="w-full" placeholder="VD: 15" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="difficultyLevel" label="Độ khó">
                <Select
                  placeholder="Chọn độ khó"
                  allowClear
                  options={Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: config.label,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="requiresSpecialTool"
                label="Cần dụng cụ đặc biệt"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="specialToolNote" label="Ghi chú dụng cụ">
            <Input placeholder="VD: Cần tua vít Torx T5" />
          </Form.Item>

          <Form.Item name="installationGuide" label="Hướng dẫn lắp đặt">
            <TextArea rows={3} placeholder="Mô tả các bước lắp đặt linh kiện" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SpareParts;
