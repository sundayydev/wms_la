import React, { useState, useRef } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Tooltip,
  Modal,
  Timeline,
  Typography,
  Row,
  Col,
  Descriptions,
  Divider,
  Dropdown,
  message,
  Statistic,
  Badge,
  Tabs,
  Empty
} from 'antd';
import {
  SearchOutlined,
  BarcodeOutlined,
  HistoryOutlined,
  ExportOutlined,
  ShopOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  EyeOutlined,
  EditOutlined,
  PrinterOutlined,
  MoreOutlined,
  ToolOutlined,
  InboxOutlined,
  QrcodeOutlined,
  DownOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

// ============================================================================
// 1. TYPES & INTERFACES
// ============================================================================

interface ProductInstance {
  InstanceID: string;
  ComponentID: string;
  ComponentName: string;
  SKU: string;
  SerialNumber: string;
  PartNumber?: string;
  IMEI1?: string;
  IMEI2?: string;
  WarehouseID?: string;
  WarehouseName?: string;
  Status: 'IN_STOCK' | 'SOLD' | 'WARRANTY' | 'BROKEN' | 'TRANSFERRING' | 'DEMO';
  ActualImportPrice: number;
  ImportDate: string;
  Notes?: string;
  CreatedAt: string;
  UpdatedAt: string;
  // Thông tin thêm cho hiển thị
  CategoryName?: string;
  ImageURL?: string;
}

interface LifecycleEvent {
  id: string;
  date: string;
  action: 'IMPORT' | 'TRANSFER' | 'SOLD' | 'WARRANTY_IN' | 'WARRANTY_OUT' | 'CHECK' | 'STATUS_CHANGE';
  description: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  user: string;
  note?: string;
}

// ============================================================================
// 2. MOCK DATA
// ============================================================================

const mockInstances: ProductInstance[] = [
  {
    InstanceID: 'ins-001',
    ComponentID: 'comp-1',
    ComponentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    SKU: 'MOBY-M63-V2',
    SerialNumber: 'M63V2-2024-00001',
    WarehouseID: 'wh-1',
    WarehouseName: 'Kho Tổng HCM',
    Status: 'IN_STOCK',
    ActualImportPrice: 8500000,
    ImportDate: '2024-12-20',
    CreatedAt: '2024-12-20T08:30:00',
    UpdatedAt: '2024-12-20T08:30:00',
    CategoryName: 'Thiết bị cầm tay',
    ImageURL: 'https://via.placeholder.com/100'
  },
  {
    InstanceID: 'ins-002',
    ComponentID: 'comp-1',
    ComponentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    SKU: 'MOBY-M63-V2',
    SerialNumber: 'M63V2-2024-00002',
    WarehouseID: 'wh-1',
    WarehouseName: 'Kho Tổng HCM',
    Status: 'IN_STOCK',
    ActualImportPrice: 8500000,
    ImportDate: '2024-12-20',
    CreatedAt: '2024-12-20T08:30:00',
    UpdatedAt: '2024-12-20T08:30:00',
    CategoryName: 'Thiết bị cầm tay',
  },
  {
    InstanceID: 'ins-003',
    ComponentID: 'comp-2',
    ComponentName: 'iPhone 15 Pro Max 256GB - Titan',
    SKU: 'IP15PM-256-TI',
    SerialNumber: 'DNPXR123456789',
    IMEI1: '356998000001234',
    IMEI2: '356998000001235',
    WarehouseID: 'wh-2',
    WarehouseName: 'Kho CN Hà Nội',
    Status: 'SOLD',
    ActualImportPrice: 24500000,
    ImportDate: '2024-11-15',
    Notes: 'Đã bán cho KH: Công ty ABC - Hóa đơn #HD2024-001',
    CreatedAt: '2024-11-15T10:00:00',
    UpdatedAt: '2024-12-01T14:30:00',
    CategoryName: 'Điện thoại',
  },
  {
    InstanceID: 'ins-004',
    ComponentID: 'comp-3',
    ComponentName: 'Máy in hóa đơn Xprinter XP-80',
    SKU: 'XP80-THERMAL',
    SerialNumber: 'XP80-2024-A0001',
    WarehouseID: 'wh-3',
    WarehouseName: 'Kho Bảo Hành',
    Status: 'WARRANTY',
    ActualImportPrice: 1200000,
    ImportDate: '2024-10-10',
    Notes: 'Lỗi đầu in nhiệt - Đang chờ linh kiện thay thế',
    CreatedAt: '2024-10-10T09:00:00',
    UpdatedAt: '2024-12-24T16:00:00',
    CategoryName: 'Máy in',
  },
  {
    InstanceID: 'ins-005',
    ComponentID: 'comp-4',
    ComponentName: 'Máy quét mã vạch Zebra DS2208',
    SKU: 'ZBR-DS2208',
    SerialNumber: 'DS2208-SN-99887766',
    WarehouseID: '',
    WarehouseName: 'Đang chuyển kho...',
    Status: 'TRANSFERRING',
    ActualImportPrice: 2800000,
    ImportDate: '2024-12-24',
    Notes: 'Chuyển từ Kho HCM → Kho Hà Nội',
    CreatedAt: '2024-12-24T07:00:00',
    UpdatedAt: '2024-12-25T08:00:00',
    CategoryName: 'Máy quét',
  },
  {
    InstanceID: 'ins-006',
    ComponentID: 'comp-5',
    ComponentName: 'Màn hình LCD iPhone 13 Pro - Zin bóc máy',
    SKU: 'LCD-IP13P-ZIN',
    SerialNumber: 'LCD13P-2024-X0001',
    WarehouseID: 'wh-1',
    WarehouseName: 'Kho Tổng HCM',
    Status: 'BROKEN',
    ActualImportPrice: 3500000,
    ImportDate: '2024-09-20',
    Notes: 'Vỡ góc màn hình khi vận chuyển - Đã báo NCC',
    CreatedAt: '2024-09-20T11:00:00',
    UpdatedAt: '2024-12-20T09:00:00',
    CategoryName: 'Linh kiện thay thế',
  },
  {
    InstanceID: 'ins-007',
    ComponentID: 'comp-1',
    ComponentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    SKU: 'MOBY-M63-V2',
    SerialNumber: 'M63V2-DEMO-001',
    WarehouseID: 'wh-1',
    WarehouseName: 'Kho Tổng HCM',
    Status: 'DEMO',
    ActualImportPrice: 8500000,
    ImportDate: '2024-12-01',
    Notes: 'Máy demo cho khách hàng trải nghiệm tại showroom',
    CreatedAt: '2024-12-01T08:00:00',
    UpdatedAt: '2024-12-01T08:00:00',
    CategoryName: 'Thiết bị cầm tay',
  },
];

const mockLifecycleHistory: LifecycleEvent[] = [
  {
    id: 'evt-1',
    date: '2024-12-20 08:30',
    action: 'IMPORT',
    description: 'Nhập kho từ đơn hàng PO-2024-0012',
    user: 'Nguyễn Văn Thủ Kho',
    note: 'Nhập từ NCC Mobydata Việt Nam'
  },
  {
    id: 'evt-2',
    date: '2024-12-22 14:00',
    action: 'TRANSFER',
    description: 'Chuyển kho nội bộ',
    fromWarehouse: 'Kho Hà Nội',
    toWarehouse: 'Kho HCM',
    user: 'Trần Văn Vận Chuyển',
    note: 'Phiếu chuyển TF-2024-0005'
  },
  {
    id: 'evt-3',
    date: '2024-12-23 10:00',
    action: 'CHECK',
    description: 'Kiểm kê định kỳ - Khớp số liệu',
    user: 'Lê Thị Kiểm Kê',
  },
  {
    id: 'evt-4',
    date: '2024-12-25 09:00',
    action: 'STATUS_CHANGE',
    description: 'Cập nhật trạng thái: IN_STOCK → DEMO',
    user: 'Admin Hệ Thống',
    note: 'Chuyển máy sang trưng bày showroom'
  },
];

// ============================================================================
// 3. STATUS CONFIG
// ============================================================================

const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode; text: string; bgColor: string }> = {
  IN_STOCK: { color: 'success', icon: <CheckCircleOutlined />, text: 'Trong kho', bgColor: '#f6ffed' },
  SOLD: { color: 'blue', icon: <ShopOutlined />, text: 'Đã bán', bgColor: '#e6f4ff' },
  WARRANTY: { color: 'warning', icon: <ToolOutlined />, text: 'Bảo hành', bgColor: '#fffbe6' },
  BROKEN: { color: 'error', icon: <CloseCircleOutlined />, text: 'Lỗi/Hỏng', bgColor: '#fff2f0' },
  TRANSFERRING: { color: 'processing', icon: <SwapOutlined />, text: 'Đang chuyển', bgColor: '#f0f5ff' },
  DEMO: { color: 'purple', icon: <EyeOutlined />, text: 'Demo/Trưng bày', bgColor: '#f9f0ff' },
};

const STATUS_OPTIONS = [
  { label: '🟢 Trong kho (In Stock)', value: 'IN_STOCK' },
  { label: '🔵 Đã bán (Sold)', value: 'SOLD' },
  { label: '🟡 Bảo hành (Warranty)', value: 'WARRANTY' },
  { label: '🔴 Lỗi/Hỏng (Broken)', value: 'BROKEN' },
  { label: '🔄 Đang chuyển kho', value: 'TRANSFERRING' },
  { label: '🟣 Demo/Trưng bày', value: 'DEMO' },
];

// ============================================================================
// 4. BARCODE COMPONENT (SVG-based simple barcode representation)
// ============================================================================

const BarcodeDisplay: React.FC<{ value: string; height?: number; showText?: boolean }> = ({
  value,
  height = 50,
  showText = true
}) => {
  // Tạo barcode pattern đơn giản dựa trên giá trị
  const generateBars = (text: string) => {
    const bars: { width: number; filled: boolean }[] = [];
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Start pattern
    bars.push({ width: 2, filled: true });
    bars.push({ width: 2, filled: false });
    bars.push({ width: 2, filled: true });
    bars.push({ width: 2, filled: false });

    // Generate bars based on characters
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      bars.push({ width: (charCode % 3) + 1, filled: true });
      bars.push({ width: (charCode % 2) + 1, filled: false });
      bars.push({ width: ((charCode + seed) % 3) + 1, filled: true });
      bars.push({ width: 1, filled: false });
    }

    // End pattern
    bars.push({ width: 2, filled: true });
    bars.push({ width: 2, filled: false });
    bars.push({ width: 2, filled: true });

    return bars;
  };

  const bars = generateBars(value);
  const totalWidth = bars.reduce((acc, bar) => acc + bar.width, 0);
  let currentX = 0;

  return (
    <div className="flex flex-col items-center">
      <svg width="100%" height={height} viewBox={`0 0 ${totalWidth} ${height}`} className="max-w-xs">
        {bars.map((bar, index) => {
          const x = currentX;
          currentX += bar.width;
          return bar.filled ? (
            <rect key={index} x={x} y={0} width={bar.width} height={height} fill="#000" />
          ) : null;
        })}
      </svg>
      {showText && (
        <div className="font-mono text-sm mt-1 tracking-wider font-bold">{value}</div>
      )}
    </div>
  );
};

// ============================================================================
// 5. MAIN COMPONENT
// ============================================================================

const InstanceList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductInstance[]>(mockInstances);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [warehouseFilter, setWarehouseFilter] = useState<string | null>(null);

  // Modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<ProductInstance | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');

  // Ref for barcode print
  const barcodeRef = useRef<HTMLDivElement>(null);

  // --- Helpers ---
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || { color: 'default', icon: null, text: status, bgColor: '#fafafa' };
  };

  // --- Statistics ---
  const stats = {
    total: data.length,
    inStock: data.filter(d => d.Status === 'IN_STOCK').length,
    sold: data.filter(d => d.Status === 'SOLD').length,
    warranty: data.filter(d => d.Status === 'WARRANTY').length,
    broken: data.filter(d => d.Status === 'BROKEN').length,
  };

  // --- Handlers ---
  const handleViewDetail = (record: ProductInstance) => {
    setSelectedInstance(record);
    setIsDetailModalOpen(true);
  };

  const handleChangeStatus = (record: ProductInstance) => {
    setSelectedInstance(record);
    setNewStatus(record.Status);
    setStatusNote('');
    setIsStatusModalOpen(true);
  };

  const handleViewHistory = (record: ProductInstance) => {
    setSelectedInstance(record);
    setIsHistoryModalOpen(true);
  };

  const handleSaveStatus = () => {
    if (!selectedInstance || !newStatus) return;

    // Cập nhật status trong data
    setData(prev => prev.map(item =>
      item.InstanceID === selectedInstance.InstanceID
        ? { ...item, Status: newStatus as ProductInstance['Status'], UpdatedAt: new Date().toISOString() }
        : item
    ));

    message.success(`Đã cập nhật trạng thái thiết bị ${selectedInstance.SerialNumber} thành "${STATUS_CONFIG[newStatus]?.text}"`);
    setIsStatusModalOpen(false);
  };

  const handlePrintBarcode = () => {
    if (!selectedInstance) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>In mã Barcode - ${selectedInstance.SerialNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .barcode-container { margin: 20px auto; }
              .serial { font-size: 18px; font-weight: bold; margin-top: 10px; font-family: monospace; }
              .product-name { font-size: 14px; color: #666; margin-top: 5px; }
              @media print { body { margin: 0; padding: 10px; } }
            </style>
          </head>
          <body>
            <div class="barcode-container">
              ${barcodeRef.current?.innerHTML || ''}
            </div>
            <div class="product-name">${selectedInstance.ComponentName}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // --- Action Menu for each row ---
  const getActionMenuItems = (record: ProductInstance): MenuProps['items'] => [
    {
      key: 'detail',
      icon: <EyeOutlined />,
      label: 'Xem chi tiết',
      onClick: () => handleViewDetail(record),
    },
    {
      key: 'status',
      icon: <EditOutlined />,
      label: 'Thay đổi trạng thái',
      onClick: () => handleChangeStatus(record),
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: 'Xem lịch sử vòng đời',
      onClick: () => handleViewHistory(record),
    },
    { type: 'divider' },
    {
      key: 'print',
      icon: <PrinterOutlined />,
      label: 'In mã Barcode',
      onClick: () => {
        setSelectedInstance(record);
        setTimeout(() => handlePrintBarcode(), 100);
      },
    },
  ];

  // --- Filter data ---
  const filteredData = data.filter(item => {
    const matchSearch = !searchText ||
      item.SerialNumber.toLowerCase().includes(searchText.toLowerCase()) ||
      item.ComponentName.toLowerCase().includes(searchText.toLowerCase()) ||
      item.SKU.toLowerCase().includes(searchText.toLowerCase()) ||
      (item.IMEI1 && item.IMEI1.includes(searchText));

    const matchStatus = !statusFilter || item.Status === statusFilter;
    const matchWarehouse = !warehouseFilter || item.WarehouseID === warehouseFilter;

    return matchSearch && matchStatus && matchWarehouse;
  });

  // --- Columns ---
  const columns: ColumnsType<ProductInstance> = [
    {
      title: 'Mã Serial / IMEI',
      key: 'serial',
      width: 220,
      fixed: 'left',
      render: (_, record) => (
        <div className="py-2">
          <div className="flex items-center gap-2 mb-1">
            <BarcodeOutlined className="text-blue-600 text-lg" />
            <span className="font-mono font-bold text-gray-800 text-base">
              {record.SerialNumber}
            </span>
          </div>
          {record.IMEI1 && (
            <div className="text-xs text-gray-500 ml-6">
              IMEI: <span className="font-mono">{record.IMEI1}</span>
            </div>
          )}
          <div className="text-xs text-gray-400 ml-6 mt-1">
            SKU: {record.SKU}
          </div>
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'ComponentName',
      key: 'product',
      width: 280,
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-800">{text}</div>
          {record.CategoryName && (
            <Tag className="mt-1" color="default">{record.CategoryName}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Vị trí kho',
      key: 'warehouse',
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-1">
          <EnvironmentOutlined className="text-gray-400" />
          <span>{record.WarehouseName}</span>
        </div>
      ),
    },
    {
      title: 'Giá nhập',
      dataIndex: 'ActualImportPrice',
      key: 'price',
      align: 'right',
      width: 140,
      render: (val) => (
        <span className="font-mono text-gray-700 font-medium">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Ngày nhập',
      dataIndex: 'ImportDate',
      key: 'date',
      width: 120,
      render: (date) => (
        <div className="text-gray-600">
          <CalendarOutlined className="mr-1" />
          {dayjs(date).format('DD/MM/YYYY')}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'Status',
      key: 'status',
      width: 150,
      align: 'center',
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag
            color={config.color}
            icon={config.icon}
            className="px-3 py-1"
          >
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'Notes',
      key: 'notes',
      width: 200,
      ellipsis: true,
      render: (notes) => notes ? (
        <Tooltip title={notes}>
          <span className="text-gray-500 text-sm">{notes}</span>
        </Tooltip>
      ) : <span className="text-gray-300">-</span>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // --- Lifecycle Event Icon ---
  const getEventIcon = (action: string) => {
    switch (action) {
      case 'IMPORT': return <InboxOutlined style={{ color: '#52c41a' }} />;
      case 'TRANSFER': return <SwapOutlined style={{ color: '#1890ff' }} />;
      case 'SOLD': return <ShopOutlined style={{ color: '#1890ff' }} />;
      case 'WARRANTY_IN': return <ToolOutlined style={{ color: '#faad14' }} />;
      case 'WARRANTY_OUT': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'CHECK': return <FileTextOutlined style={{ color: '#8c8c8c' }} />;
      case 'STATUS_CHANGE': return <SyncOutlined style={{ color: '#722ed1' }} />;
      default: return <InfoCircleOutlined />;
    }
  };

  const getEventColor = (action: string) => {
    switch (action) {
      case 'IMPORT': return 'green';
      case 'TRANSFER': return 'blue';
      case 'SOLD': return 'blue';
      case 'WARRANTY_IN': return 'orange';
      case 'WARRANTY_OUT': return 'green';
      case 'STATUS_CHANGE': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <BarcodeOutlined className="text-blue-600" /> Quản lý Thiết bị (Serial Number)
          </h1>
          <p className="text-gray-500 mt-1">
            Theo dõi chi tiết từng thiết bị, vị trí, trạng thái và lịch sử vòng đời
          </p>
        </div>
        <Space>
          <Button icon={<QrcodeOutlined />}>Quét mã</Button>
          <Button icon={<ExportOutlined />}>Xuất Excel</Button>
        </Space>
      </div>

      {/* STATISTICS CARDS */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8} lg={4}>
          <Card className="shadow-sm text-center" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-500">Tổng thiết bị</span>}
              value={stats.total}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="shadow-sm text-center" bodyStyle={{ padding: '16px', background: '#f6ffed' }}>
            <Statistic
              title={<span className="text-gray-500">Trong kho</span>}
              value={stats.inStock}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="shadow-sm text-center" bodyStyle={{ padding: '16px', background: '#e6f4ff' }}>
            <Statistic
              title={<span className="text-gray-500">Đã bán</span>}
              value={stats.sold}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="shadow-sm text-center" bodyStyle={{ padding: '16px', background: '#fffbe6' }}>
            <Statistic
              title={<span className="text-gray-500">Bảo hành</span>}
              value={stats.warranty}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="shadow-sm text-center" bodyStyle={{ padding: '16px', background: '#fff2f0' }}>
            <Statistic
              title={<span className="text-gray-500">Lỗi/Hỏng</span>}
              value={stats.broken}
              valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* FILTER BAR */}
      <Card className="mb-6 shadow-sm" bordered={false} bodyStyle={{ padding: '16px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="🔍 Quét hoặc nhập Serial Number, IMEI, SKU..."
              prefix={<BarcodeOutlined className="text-gray-400" />}
              size="large"
              autoFocus
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Trạng thái"
              allowClear
              className="w-full"
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              placeholder="Kho hàng"
              allowClear
              className="w-full"
              size="large"
              value={warehouseFilter}
              onChange={setWarehouseFilter}
              options={[
                { label: '📍 Kho Tổng HCM', value: 'wh-1' },
                { label: '📍 Kho CN Hà Nội', value: 'wh-2' },
                { label: '📍 Kho Bảo Hành', value: 'wh-3' },
              ]}
            />
          </Col>
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm theo tên sản phẩm..."
              prefix={<SearchOutlined className="text-gray-400" />}
              size="large"
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="InstanceID"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} thiết bị`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1400 }}
          onRow={(record) => ({
            onDoubleClick: () => handleViewDetail(record),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>

      {/* ============================================== */}
      {/* MODAL: XEM CHI TIẾT THIẾT BỊ */}
      {/* ============================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg">
            <InfoCircleOutlined className="text-blue-600" />
            Chi tiết thiết bị
          </div>
        }
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="print" icon={<PrinterOutlined />} onClick={handlePrintBarcode}>
            In Barcode
          </Button>,
          <Button key="status" icon={<EditOutlined />} onClick={() => {
            setIsDetailModalOpen(false);
            if (selectedInstance) handleChangeStatus(selectedInstance);
          }}>
            Đổi trạng thái
          </Button>,
          <Button key="close" type="primary" onClick={() => setIsDetailModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedInstance && (
          <div className="mt-4">
            {/* Barcode hiển thị lớn */}
            <div
              ref={barcodeRef}
              className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 mb-6 text-center"
            >
              <BarcodeDisplay
                value={selectedInstance.SerialNumber}
                height={80}
                showText={true}
              />
            </div>

            <Tabs
              items={[
                {
                  key: 'info',
                  label: '📋 Thông tin cơ bản',
                  children: (
                    <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                      <Descriptions.Item label="Serial Number" span={2}>
                        <span className="font-mono font-bold text-lg text-blue-600">
                          {selectedInstance.SerialNumber}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Tên sản phẩm" span={2}>
                        {selectedInstance.ComponentName}
                      </Descriptions.Item>
                      <Descriptions.Item label="SKU">
                        <Tag>{selectedInstance.SKU}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Danh mục">
                        {selectedInstance.CategoryName || '-'}
                      </Descriptions.Item>
                      {selectedInstance.IMEI1 && (
                        <Descriptions.Item label="IMEI 1">
                          <span className="font-mono">{selectedInstance.IMEI1}</span>
                        </Descriptions.Item>
                      )}
                      {selectedInstance.IMEI2 && (
                        <Descriptions.Item label="IMEI 2">
                          <span className="font-mono">{selectedInstance.IMEI2}</span>
                        </Descriptions.Item>
                      )}
                      {selectedInstance.PartNumber && (
                        <Descriptions.Item label="Part Number">
                          <span className="font-mono">{selectedInstance.PartNumber}</span>
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="Trạng thái">
                        <Tag
                          color={getStatusConfig(selectedInstance.Status).color}
                          icon={getStatusConfig(selectedInstance.Status).icon}
                          className="px-3 py-1"
                        >
                          {getStatusConfig(selectedInstance.Status).text}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: 'warehouse',
                  label: '📍 Thông tin kho',
                  children: (
                    <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
                      <Descriptions.Item label="Vị trí hiện tại">
                        <span className="font-medium">{selectedInstance.WarehouseName}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Giá nhập">
                        <span className="font-mono font-bold text-green-600 text-lg">
                          {formatCurrency(selectedInstance.ActualImportPrice)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày nhập kho">
                        {dayjs(selectedInstance.ImportDate).format('DD/MM/YYYY')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Cập nhật lần cuối">
                        {dayjs(selectedInstance.UpdatedAt).format('DD/MM/YYYY HH:mm')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ghi chú" span={2}>
                        {selectedInstance.Notes || <span className="text-gray-400">Không có ghi chú</span>}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Modal>

      {/* ============================================== */}
      {/* MODAL: THAY ĐỔI TRẠNG THÁI */}
      {/* ============================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-orange-500" />
            Thay đổi trạng thái thiết bị
          </div>
        }
        open={isStatusModalOpen}
        onCancel={() => setIsStatusModalOpen(false)}
        onOk={handleSaveStatus}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={500}
      >
        {selectedInstance && (
          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="font-bold text-gray-800">{selectedInstance.ComponentName}</div>
              <div className="text-sm text-gray-500 font-mono mt-1">
                Serial: {selectedInstance.SerialNumber}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-2 font-medium">
                Trạng thái hiện tại:
              </label>
              <Tag
                color={getStatusConfig(selectedInstance.Status).color}
                icon={getStatusConfig(selectedInstance.Status).icon}
                className="px-4 py-1 text-base"
              >
                {getStatusConfig(selectedInstance.Status).text}
              </Tag>
            </div>

            <div className="mb-4">
              <label className="block text-gray-600 mb-2 font-medium">
                Chuyển sang trạng thái mới: <span className="text-red-500">*</span>
              </label>
              <Select
                value={newStatus}
                onChange={setNewStatus}
                className="w-full"
                size="large"
                options={STATUS_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-2 font-medium">
                Lý do thay đổi (tùy chọn):
              </label>
              <Input.TextArea
                rows={3}
                placeholder="Nhập lý do thay đổi trạng thái..."
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* ============================================== */}
      {/* MODAL: LỊCH SỬ VÒNG ĐỜI */}
      {/* ============================================== */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined className="text-purple-600" />
            Lịch sử vòng đời thiết bị
          </div>
        }
        open={isHistoryModalOpen}
        onCancel={() => setIsHistoryModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsHistoryModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedInstance && (
          <div className="mt-4">
            {/* Thông tin thiết bị */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100">
              <div className="font-bold text-gray-800 text-lg">{selectedInstance.ComponentName}</div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-600">
                  <BarcodeOutlined className="mr-1" />
                  <span className="font-mono font-bold">{selectedInstance.SerialNumber}</span>
                </span>
                <Tag
                  color={getStatusConfig(selectedInstance.Status).color}
                  icon={getStatusConfig(selectedInstance.Status).icon}
                >
                  {getStatusConfig(selectedInstance.Status).text}
                </Tag>
              </div>
            </div>

            {/* Timeline */}
            {mockLifecycleHistory.length > 0 ? (
              <Timeline
                mode="left"
                items={mockLifecycleHistory.map(event => ({
                  dot: getEventIcon(event.action),
                  color: getEventColor(event.action),
                  label: (
                    <span className="text-gray-500 text-sm">{event.date}</span>
                  ),
                  children: (
                    <div className="pb-4">
                      <div className="font-bold text-gray-800">{event.description}</div>
                      {event.fromWarehouse && event.toWarehouse && (
                        <div className="text-sm text-blue-600 mt-1">
                          <EnvironmentOutlined className="mr-1" />
                          {event.fromWarehouse} → {event.toWarehouse}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <UserOutlined />
                        {event.user}
                      </div>
                      {event.note && (
                        <div className="text-xs text-gray-500 mt-1 italic">
                          💬 {event.note}
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty description="Chưa có lịch sử hoạt động" />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default InstanceList;