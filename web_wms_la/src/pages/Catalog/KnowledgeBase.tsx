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
  Badge,
  Tooltip,
  Dropdown,
  List,
  Table,
  Upload,
  Alert,
  Popconfirm,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  FileTextOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  LinkOutlined,
  EyeOutlined,
  MoreOutlined,
  FolderOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CopyOutlined,
  DownloadOutlined,
  FilterOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ToolOutlined,
  LockOutlined,
  GlobalOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  CloudUploadOutlined,
  FileOutlined,
  YoutubeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ============================================================================
// TYPES (Dựa trên Database Schema)
// ============================================================================

// Loại nội dung
type ContentType = 'DOCUMENT' | 'VIDEO' | 'DRIVER' | 'FIRMWARE';

// Mức độ truy cập
type AccessLevel = 'PUBLIC' | 'INTERNAL' | 'RESTRICTED';

// Interface chính theo schema ProductKnowledgeBase
interface KnowledgeItem {
  knowledgeId: string;
  componentId: string;

  // Thông tin cơ bản
  title: string;
  description?: string;

  // Loại tài liệu
  contentType: ContentType;
  contentUrl: string;
  thumbnailUrl?: string;

  // Phân quyền truy cập
  accessLevel: AccessLevel;
  allowedRoles?: string[]; // VD: ["TECHNICIAN", "ADMIN"]

  // Metadata
  uploadedByUserId?: string;
  createdAt: string;
  updatedAt: string;

  // Joined fields
  componentName?: string;
  sku?: string;
  uploadedByUserName?: string;
}

// Component cho dropdown chọn sản phẩm
interface ComponentOption {
  componentId: string;
  sku: string;
  componentName: string;
  brand?: string;
}

// ============================================================================
// CONFIGS
// ============================================================================

const CONTENT_TYPE_CONFIG: Record<ContentType, {
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}> = {
  DOCUMENT: {
    label: 'Tài liệu',
    color: 'blue',
    icon: <FilePdfOutlined />,
    description: 'PDF, Word, Excel...'
  },
  VIDEO: {
    label: 'Video',
    color: 'red',
    icon: <VideoCameraOutlined />,
    description: 'Youtube, Vimeo...'
  },
  DRIVER: {
    label: 'Driver',
    color: 'green',
    icon: <ToolOutlined />,
    description: 'Driver phần cứng'
  },
  FIRMWARE: {
    label: 'Firmware',
    color: 'purple',
    icon: <DownloadOutlined />,
    description: 'Phần mềm cập nhật'
  },
};

const ACCESS_LEVEL_CONFIG: Record<AccessLevel, {
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}> = {
  PUBLIC: {
    label: 'Công khai',
    color: 'green',
    icon: <GlobalOutlined />,
    description: 'Ai cũng xem được'
  },
  INTERNAL: {
    label: 'Nội bộ',
    color: 'orange',
    icon: <TeamOutlined />,
    description: 'Chỉ nhân viên công ty'
  },
  RESTRICTED: {
    label: 'Hạn chế',
    color: 'red',
    icon: <LockOutlined />,
    description: 'Theo role cụ thể'
  },
};

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'MANAGER', label: 'Quản lý' },
  { value: 'TECHNICIAN', label: 'Kỹ thuật viên' },
  { value: 'WAREHOUSE', label: 'Thủ kho' },
  { value: 'SALES', label: 'Nhân viên bán hàng' },
];

// ============================================================================
// MOCK DATA
// ============================================================================

const mockComponents: ComponentOption[] = [
  { componentId: '1', sku: 'MOBY-M63-V2', componentName: 'Máy kiểm kho PDA Mobydata M63 V2', brand: 'Mobydata' },
  { componentId: '2', sku: 'ZEBRA-TC21', componentName: 'Zebra TC21 Android Mobile Computer', brand: 'Zebra' },
  { componentId: '3', sku: 'ZEB-ZD421-DT', componentName: 'Zebra ZD421 Direct Thermal Printer', brand: 'Zebra' },
  { componentId: '4', sku: 'HON-1400G', componentName: 'Máy quét mã vạch Honeywell Voyager 1400g', brand: 'Honeywell' },
  { componentId: '5', sku: 'ESL-29-BW', componentName: 'Electronic Shelf Label 2.9 inch', brand: 'Hanshow' },
];

const mockKnowledgeItems: KnowledgeItem[] = [
  {
    knowledgeId: 'kb-001',
    componentId: '1',
    title: 'Hướng dẫn cài đặt Wifi và Bluetooth',
    description: 'Hướng dẫn chi tiết cách cài đặt, cấu hình wifi, bluetooth và các kết nối mạng cơ bản trên máy kiểm kho PDA Mobydata M63 V2.',
    contentType: 'DOCUMENT',
    contentUrl: 'https://drive.google.com/file/moby-m63-wifi-guide.pdf',
    thumbnailUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=doc1',
    accessLevel: 'PUBLIC',
    uploadedByUserId: 'user-1',
    createdAt: '2024-10-15T10:00:00Z',
    updatedAt: '2024-12-20T14:30:00Z',
    componentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    sku: 'MOBY-M63-V2',
    uploadedByUserName: 'Nguyễn Văn A',
  },
  {
    knowledgeId: 'kb-002',
    componentId: '1',
    title: 'Video: Cách thay pin Mobydata M63 V2',
    description: 'Video hướng dẫn chi tiết cách tháo và thay pin cho máy một cách an toàn.',
    contentType: 'VIDEO',
    contentUrl: 'https://www.youtube.com/watch?v=example123',
    thumbnailUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=video1',
    accessLevel: 'PUBLIC',
    uploadedByUserId: 'user-2',
    createdAt: '2024-11-15T09:00:00Z',
    updatedAt: '2024-11-15T09:00:00Z',
    componentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    sku: 'MOBY-M63-V2',
    uploadedByUserName: 'Trần Thị B',
  },
  {
    knowledgeId: 'kb-003',
    componentId: '2',
    title: 'Driver USB Zebra TC21 cho Windows',
    description: 'Driver USB để kết nối Zebra TC21 với máy tính Windows 10/11.',
    contentType: 'DRIVER',
    contentUrl: 'https://download.zebra.com/tc21-driver.zip',
    accessLevel: 'PUBLIC',
    uploadedByUserId: 'user-1',
    createdAt: '2024-09-20T14:00:00Z',
    updatedAt: '2024-12-25T16:00:00Z',
    componentName: 'Zebra TC21 Android Mobile Computer',
    sku: 'ZEBRA-TC21',
    uploadedByUserName: 'Nguyễn Văn A',
  },
  {
    knowledgeId: 'kb-004',
    componentId: '1',
    title: 'Firmware Update v2.1.5 - Mobydata M63 V2',
    description: 'Bản cập nhật firmware mới nhất với các cải tiến hiệu năng và sửa lỗi bảo mật.',
    contentType: 'FIRMWARE',
    contentUrl: 'https://cdn.mobydata.com/firmware/m63-v2.1.5.zip',
    accessLevel: 'INTERNAL',
    uploadedByUserId: 'user-3',
    createdAt: '2024-12-10T14:00:00Z',
    updatedAt: '2024-12-10T14:00:00Z',
    componentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    sku: 'MOBY-M63-V2',
    uploadedByUserName: 'Kỹ thuật Team',
  },
  {
    knowledgeId: 'kb-005',
    componentId: '3',
    title: 'Hướng dẫn sửa chữa đầu in nhiệt',
    description: 'Tài liệu hướng dẫn tháo lắp và thay thế đầu in nhiệt cho máy in Zebra ZD421. CHỈ DÀNH CHO KỸ THUẬT VIÊN.',
    contentType: 'DOCUMENT',
    contentUrl: 'https://internal.company.com/repair-guide-zd421.pdf',
    thumbnailUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=doc2',
    accessLevel: 'RESTRICTED',
    allowedRoles: ['TECHNICIAN', 'ADMIN'],
    uploadedByUserId: 'user-1',
    createdAt: '2024-08-15T10:00:00Z',
    updatedAt: '2024-12-01T09:00:00Z',
    componentName: 'Zebra ZD421 Direct Thermal Printer',
    sku: 'ZEB-ZD421-DT',
    uploadedByUserName: 'Nguyễn Văn A',
  },
  {
    knowledgeId: 'kb-006',
    componentId: '2',
    title: 'Firmware Android 11 Update cho TC21',
    description: 'Bản cập nhật lên Android 11 cho Zebra TC21 với các tính năng bảo mật mới.',
    contentType: 'FIRMWARE',
    contentUrl: 'https://download.zebra.com/tc21-android11.zip',
    accessLevel: 'RESTRICTED',
    allowedRoles: ['TECHNICIAN', 'ADMIN', 'MANAGER'],
    uploadedByUserId: 'user-3',
    createdAt: '2024-12-20T08:00:00Z',
    updatedAt: '2024-12-20T08:00:00Z',
    componentName: 'Zebra TC21 Android Mobile Computer',
    sku: 'ZEBRA-TC21',
    uploadedByUserName: 'Kỹ thuật Team',
  },
  {
    knowledgeId: 'kb-007',
    componentId: '4',
    title: 'Video Demo: Máy quét Honeywell 1400g',
    description: 'Video giới thiệu tính năng và cách sử dụng máy quét mã vạch Honeywell Voyager 1400g.',
    contentType: 'VIDEO',
    contentUrl: 'https://www.youtube.com/watch?v=demo1400g',
    thumbnailUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=video2',
    accessLevel: 'PUBLIC',
    uploadedByUserId: 'user-2',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-01T10:00:00Z',
    componentName: 'Máy quét mã vạch Honeywell Voyager 1400g',
    sku: 'HON-1400G',
    uploadedByUserName: 'Trần Thị B',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const KnowledgeBase: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [data] = useState<KnowledgeItem[]>(mockKnowledgeItems);
  const [searchText, setSearchText] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<ContentType | 'ALL'>('ALL');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel | 'ALL'>('ALL');
  const [selectedComponent, setSelectedComponent] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal/Drawer states
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [accessLevelValue, setAccessLevelValue] = useState<AccessLevel>('PUBLIC');

  // Computed: Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = !searchText ||
        item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchText.toLowerCase());

      const matchContentType = selectedContentType === 'ALL' || item.contentType === selectedContentType;
      const matchAccessLevel = selectedAccessLevel === 'ALL' || item.accessLevel === selectedAccessLevel;
      const matchComponent = !selectedComponent || item.componentId === selectedComponent;

      return matchSearch && matchContentType && matchAccessLevel && matchComponent;
    });
  }, [data, searchText, selectedContentType, selectedAccessLevel, selectedComponent]);

  // Stats
  const stats = useMemo(() => ({
    total: data.length,
    documents: data.filter(d => d.contentType == 'DOCUMENT').length,
    videos: data.filter(d => d.contentType === 'VIDEO').length,
    drivers: data.filter(d => d.contentType === 'DRIVER').length,
    firmwares: data.filter(d => d.contentType === 'FIRMWARE').length,
    public: data.filter(d => d.accessLevel === 'PUBLIC').length,
    internal: data.filter(d => d.accessLevel === 'INTERNAL').length,
    restricted: data.filter(d => d.accessLevel === 'RESTRICTED').length,
  }), [data]);

  // Handlers
  const handleViewDetail = (item: KnowledgeItem) => {
    setSelectedItem(item);
    setDetailDrawerOpen(true);
  };

  const handleOpenContent = (url: string) => {
    window.open(url, '_blank');
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success('Đã sao chép link!');
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      console.log('New item:', values);
      message.success('Đã thêm tài liệu mới');
      setCreateModalOpen(false);
      createForm.resetFields();
      setAccessLevelValue('PUBLIC');
    } catch (error) {
      // Validation failed
    }
  };

  const handleDelete = (id: string) => {
    message.success('Đã xóa tài liệu');
  };

  // Table Columns
  const columns: ColumnsType<KnowledgeItem> = [
    {
      title: 'Tiêu đề',
      key: 'title',
      width: 350,
      render: (_, record) => (
        <div className="flex items-start gap-3">
          <Avatar
            shape="square"
            size={48}
            src={record.thumbnailUrl}
            icon={CONTENT_TYPE_CONFIG[record.contentType].icon}
            className="bg-gray-100 flex-shrink-0"
          />
          <div className="min-w-0">
            <div
              className="font-medium text-gray-800 line-clamp-1 cursor-pointer hover:text-blue-600"
              onClick={() => handleViewDetail(record)}
            >
              {record.title}
            </div>
            {record.description && (
              <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                {record.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'component',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-700 line-clamp-1">{record.componentName}</div>
          <Tag className="mt-1">{record.sku}</Tag>
        </div>
      ),
    },
    {
      title: 'Loại',
      dataIndex: 'contentType',
      key: 'contentType',
      width: 120,
      align: 'center',
      filters: Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => ({
        text: config.label,
        value: key,
      })),
      onFilter: (value, record) => record.contentType === value,
      render: (type: ContentType) => {
        const config = CONTENT_TYPE_CONFIG[type];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Quyền truy cập',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      width: 140,
      align: 'center',
      filters: Object.entries(ACCESS_LEVEL_CONFIG).map(([key, config]) => ({
        text: config.label,
        value: key,
      })),
      onFilter: (value, record) => record.accessLevel === value,
      render: (level: AccessLevel, record) => {
        const config = ACCESS_LEVEL_CONFIG[level];
        return (
          <Tooltip
            title={
              level === 'RESTRICTED' && record.allowedRoles
                ? `Chỉ: ${record.allowedRoles.join(', ')}`
                : config.description
            }
          >
            <Tag color={config.color} icon={config.icon}>
              {config.label}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Người tải lên',
      key: 'uploader',
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <span className="text-gray-600">{record.uploadedByUserName}</span>
        </div>
      ),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 130,
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
      render: (date) => (
        <span className="text-gray-500">
          <ClockCircleOutlined className="mr-1" />
          {dayjs(date).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Mở nội dung">
            <Button
              type="text"
              icon={record.contentType === 'VIDEO' ? <PlayCircleOutlined className="text-red-500" /> : <EyeOutlined className="text-blue-500" />}
              onClick={() => handleOpenContent(record.contentUrl)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => handleViewDetail(record) },
                { key: 'copy', icon: <CopyOutlined />, label: 'Sao chép link', onClick: () => handleCopyLink(record.contentUrl) },
                { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
                { type: 'divider' },
                { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => handleDelete(record.knowledgeId) },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Grid Card Component
  const KnowledgeCard: React.FC<{ item: KnowledgeItem }> = ({ item }) => {
    const typeConfig = CONTENT_TYPE_CONFIG[item.contentType];
    const accessConfig = ACCESS_LEVEL_CONFIG[item.accessLevel];

    return (
      <Card
        hoverable
        className="h-full shadow-sm hover:shadow-lg transition-all duration-300"
        cover={
          <div className="relative h-36 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
            {item.thumbnailUrl ? (
              <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-5xl text-gray-300">{typeConfig.icon}</div>
            )}

            {/* Type badge */}
            <Tag color={typeConfig.color} className="absolute top-2 left-2" icon={typeConfig.icon}>
              {typeConfig.label}
            </Tag>

            {/* Access badge */}
            <Tooltip title={accessConfig.description}>
              <Tag color={accessConfig.color} className="absolute top-2 right-2" icon={accessConfig.icon}>
                {accessConfig.label}
              </Tag>
            </Tooltip>

            {/* Play button for video */}
            {item.contentType === 'VIDEO' && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => handleOpenContent(item.contentUrl)}
              >
                <PlayCircleOutlined className="text-5xl text-white" />
              </div>
            )}
          </div>
        }
        actions={[
          <Tooltip key="open" title="Mở nội dung">
            <span onClick={() => handleOpenContent(item.contentUrl)}>
              {item.contentType === 'VIDEO' ? <PlayCircleOutlined /> : <EyeOutlined />}
            </span>
          </Tooltip>,
          <Tooltip key="copy" title="Sao chép link">
            <CopyOutlined onClick={() => handleCopyLink(item.contentUrl)} />
          </Tooltip>,
          <Dropdown
            key="more"
            menu={{
              items: [
                { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
                { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
              ],
            }}
          >
            <MoreOutlined />
          </Dropdown>,
        ]}
        onClick={() => handleViewDetail(item)}
      >
        <Card.Meta
          title={<div className="line-clamp-2 font-medium text-gray-800 text-sm">{item.title}</div>}
          description={
            <div className="space-y-2">
              <div className="text-xs text-gray-400 flex items-center gap-1">
                <AppstoreOutlined />
                {item.sku}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
                <span><UserOutlined className="mr-1" />{item.uploadedByUserName}</span>
                <span>{dayjs(item.updatedAt).format('DD/MM')}</span>
              </div>
            </div>
          }
        />
      </Card>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <BookOutlined className="text-blue-600" />
            Kho Tri Thức Sản Phẩm
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý tài liệu, video, driver và firmware cho sản phẩm
          </p>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            className="bg-blue-600"
          >
            Thêm tài liệu
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm" bodyStyle={{ padding: '12px' }}>
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-gray-500 text-xs">Tổng cộng</div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm" bodyStyle={{ padding: '12px' }}>
            <div className="text-2xl font-bold text-blue-500">{stats.documents}</div>
            <div className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <FilePdfOutlined /> Tài liệu
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm" bodyStyle={{ padding: '12px' }}>
            <div className="text-2xl font-bold text-red-500">{stats.videos}</div>
            <div className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <VideoCameraOutlined /> Video
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm" bodyStyle={{ padding: '12px' }}>
            <div className="text-2xl font-bold text-green-500">{stats.drivers}</div>
            <div className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <ToolOutlined /> Driver
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm" bodyStyle={{ padding: '12px' }}>
            <div className="text-2xl font-bold text-purple-500">{stats.firmwares}</div>
            <div className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <DownloadOutlined /> Firmware
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm" bodyStyle={{ padding: '12px' }}>
            <div className="text-2xl font-bold text-green-600">{stats.public}</div>
            <div className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <GlobalOutlined /> Công khai
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm" bodyStyle={{ padding: '12px' }}>
            <div className="text-2xl font-bold text-orange-500">{stats.internal}</div>
            <div className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <TeamOutlined /> Nội bộ
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm" bodyStyle={{ padding: '12px' }}>
            <div className="text-2xl font-bold text-red-600">{stats.restricted}</div>
            <div className="text-gray-500 text-xs flex items-center justify-center gap-1">
              <LockOutlined /> Hạn chế
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card className="mb-6 shadow-sm" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm tiêu đề, mô tả, SKU..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              placeholder="Loại nội dung"
              allowClear
              className="w-36"
              value={selectedContentType === 'ALL' ? undefined : selectedContentType}
              onChange={(val) => setSelectedContentType(val || 'ALL')}
              options={Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => ({
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
              placeholder="Quyền truy cập"
              allowClear
              className="w-36"
              value={selectedAccessLevel === 'ALL' ? undefined : selectedAccessLevel}
              onChange={(val) => setSelectedAccessLevel(val || 'ALL')}
              options={Object.entries(ACCESS_LEVEL_CONFIG).map(([key, config]) => ({
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
              placeholder="Sản phẩm"
              allowClear
              showSearch
              className="w-48"
              value={selectedComponent}
              onChange={setSelectedComponent}
              optionFilterProp="label"
              options={mockComponents.map(c => ({
                value: c.componentId,
                label: `${c.sku} - ${c.componentName}`,
              }))}
            />
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                type={viewMode === 'table' ? 'primary' : 'text'}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode('table')}
                className={viewMode === 'table' ? 'bg-blue-600' : ''}
              />
              <Button
                type={viewMode === 'grid' ? 'primary' : 'text'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-blue-600' : ''}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Content */}
      {filteredData.length === 0 ? (
        <Card className="shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy tài liệu nào"
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
              Thêm tài liệu mới
            </Button>
          </Empty>
        </Card>
      ) : viewMode === 'table' ? (
        <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
          <Table
            columns={columns}
            dataSource={filteredData}
            rowKey="knowledgeId"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} tài liệu`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredData.map((item) => (
            <Col xs={24} sm={12} md={8} xl={6} key={item.knowledgeId}>
              <KnowledgeCard item={item} />
            </Col>
          ))}
        </Row>
      )}

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết tài liệu"
        placement="right"
        width={600}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        extra={
          <Space>
            <Button icon={<EditOutlined />}>Chỉnh sửa</Button>
            <Button
              type="primary"
              icon={selectedItem?.contentType === 'VIDEO' ? <PlayCircleOutlined /> : <EyeOutlined />}
              onClick={() => selectedItem && handleOpenContent(selectedItem.contentUrl)}
              className="bg-blue-600"
            >
              {selectedItem?.contentType === 'VIDEO' ? 'Xem video' : 'Mở tài liệu'}
            </Button>
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
                src={selectedItem.thumbnailUrl}
                icon={CONTENT_TYPE_CONFIG[selectedItem.contentType].icon}
                className="bg-gray-100"
              />
              <div className="flex-1">
                <Title level={4} className="m-0 mb-2">{selectedItem.title}</Title>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag color={CONTENT_TYPE_CONFIG[selectedItem.contentType].color} icon={CONTENT_TYPE_CONFIG[selectedItem.contentType].icon}>
                    {CONTENT_TYPE_CONFIG[selectedItem.contentType].label}
                  </Tag>
                  <Tag color={ACCESS_LEVEL_CONFIG[selectedItem.accessLevel].color} icon={ACCESS_LEVEL_CONFIG[selectedItem.accessLevel].icon}>
                    {ACCESS_LEVEL_CONFIG[selectedItem.accessLevel].label}
                  </Tag>
                </div>
              </div>
            </div>

            <Divider />

            {/* Description */}
            {selectedItem.description && (
              <div>
                <Text strong>Mô tả</Text>
                <Paragraph className="text-gray-600 mt-1">{selectedItem.description}</Paragraph>
              </div>
            )}

            {/* Component */}
            <div>
              <Text strong>Sản phẩm liên quan</Text>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{selectedItem.componentName}</div>
                <Tag className="mt-1">{selectedItem.sku}</Tag>
              </div>
            </div>

            {/* Content URL */}
            <div>
              <Text strong>Đường dẫn nội dung</Text>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  value={selectedItem.contentUrl}
                  readOnly
                  addonAfter={
                    <CopyOutlined
                      className="cursor-pointer"
                      onClick={() => handleCopyLink(selectedItem.contentUrl)}
                    />
                  }
                />
              </div>
            </div>

            {/* Access Control */}
            {selectedItem.accessLevel === 'RESTRICTED' && selectedItem.allowedRoles && (
              <div>
                <Text strong>Chỉ cho phép các vai trò</Text>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedItem.allowedRoles.map(role => (
                    <Tag key={role} color="blue">{role}</Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="text-sm text-gray-500 pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span><UserOutlined className="mr-1" />Người tải lên:</span>
                <span className="font-medium">{selectedItem.uploadedByUserName}</span>
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
            Thêm tài liệu mới
          </span>
        }
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
          setAccessLevelValue('PUBLIC');
        }}
        onOk={handleCreate}
        okText="Thêm tài liệu"
        cancelText="Hủy"
        width={650}
      >
        <Form form={createForm} layout="vertical" className="mt-4">
          <Form.Item
            name="componentId"
            label="Sản phẩm liên quan"
            rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
          >
            <Select
              placeholder="Chọn sản phẩm"
              showSearch
              optionFilterProp="label"
              options={mockComponents.map(c => ({
                value: c.componentId,
                label: `${c.sku} - ${c.componentName}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="VD: Hướng dẫn cài đặt Wifi" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} placeholder="Mô tả ngắn gọn về nội dung tài liệu" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contentType"
                label="Loại nội dung"
                rules={[{ required: true, message: 'Vui lòng chọn loại' }]}
              >
                <Select
                  placeholder="Chọn loại"
                  options={Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: (
                      <span className="flex items-center gap-2">
                        {config.icon}
                        {config.label} - {config.description}
                      </span>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="accessLevel"
                label="Quyền truy cập"
                rules={[{ required: true }]}
                initialValue="PUBLIC"
              >
                <Select
                  placeholder="Chọn quyền"
                  onChange={(val) => setAccessLevelValue(val)}
                  options={Object.entries(ACCESS_LEVEL_CONFIG).map(([key, config]) => ({
                    value: key,
                    label: (
                      <span className="flex items-center gap-2">
                        {config.icon}
                        {config.label}
                      </span>
                    ),
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Hiển thị chọn roles khi accessLevel = RESTRICTED */}
          {accessLevelValue === 'RESTRICTED' && (
            <Form.Item
              name="allowedRoles"
              label="Các vai trò được phép xem"
              rules={[{ required: true, message: 'Vui lòng chọn ít nhất 1 vai trò' }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn các vai trò"
                options={ROLE_OPTIONS}
              />
            </Form.Item>
          )}

          <Form.Item
            name="contentUrl"
            label="Đường dẫn nội dung"
            rules={[
              { required: true, message: 'Vui lòng nhập đường dẫn' },
              { type: 'url', message: 'Đường dẫn không hợp lệ' },
            ]}
          >
            <Input
              prefix={<LinkOutlined className="text-gray-400" />}
              placeholder="https://... (Link file hoặc link Youtube)"
            />
          </Form.Item>

          <Form.Item name="thumbnailUrl" label="Ảnh thumbnail (tùy chọn)">
            <Input
              prefix={<LinkOutlined className="text-gray-400" />}
              placeholder="https://... (Link ảnh thumbnail)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeBase;
