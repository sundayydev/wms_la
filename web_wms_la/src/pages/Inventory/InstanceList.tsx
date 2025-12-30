import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Drawer,
  Dropdown,
  message,
  Statistic,
  Badge,
  Tabs,
  Empty,
  Progress,
  Avatar,
  Segmented,
  DatePicker,
  Popover,
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
  InfoCircleOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  UserOutlined,
  FileTextOutlined,
  SafetyCertificateOutlined,
  WarningOutlined,
  PlusOutlined,
  FilterOutlined,
  ReloadOutlined,
  CopyOutlined,
  TableOutlined,
  AppstoreOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

// ============================================================================
// 1. TYPES & INTERFACES (Dựa trên Database Schema)
// ============================================================================

// Trạng thái của từng thiết bị
type InstanceStatus =
  | 'IN_STOCK'      // Trong kho - sẵn sàng bán
  | 'SOLD'          // Đã bán
  | 'WARRANTY'      // Đang bảo hành
  | 'REPAIR'        // Đang sửa chữa (ngoài bảo hành)
  | 'BROKEN'        // Lỗi/Hỏng
  | 'TRANSFERRING'  // Đang chuyển kho
  | 'DEMO'          // Demo/Trưng bày
  | 'SCRAPPED'      // Đã thanh lý
  | 'LOST';         // Mất/Thất lạc

// Loại chủ sở hữu hiện tại
type OwnerType = 'COMPANY' | 'CUSTOMER' | 'SUPPLIER' | 'DEMO_PARTNER';

// Zone trong kho
type WarehouseZone = 'MAIN' | 'REPAIR' | 'DEMO' | 'QUARANTINE';

interface ProductInstance {
  instanceId: string;
  componentId: string;
  warehouseId?: string;

  // Mã định danh
  serialNumber: string;
  partNumber?: string;
  modelNumber?: string;
  inboundBoxNumber?: string;
  imei1?: string;
  imei2?: string;
  macAddress?: string;

  // Trạng thái
  status: InstanceStatus;

  // Vị trí trong kho
  locationCode?: string;
  zone?: WarehouseZone;

  // Chủ sở hữu
  currentOwnerType: OwnerType;
  currentOwnerId?: string;
  currentOwnerName?: string;

  // Bảo hành
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  warrantyMonths: number;

  // Sửa chữa
  totalRepairCount: number;
  lastRepairDate?: string;

  // Giá
  actualImportPrice?: number;
  actualSellPrice?: number;
  soldDate?: string;

  // Audit
  importDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;

  // Joined fields (từ Components, Warehouses)
  componentName: string;
  sku: string;
  brand?: string;
  warehouseName?: string;
  categoryName?: string;
  imageUrl?: string;
}

interface LifecycleEvent {
  historyId: string;
  eventType: string;
  eventDate: string;
  oldStatus?: string;
  newStatus?: string;
  oldWarehouseName?: string;
  newWarehouseName?: string;
  description?: string;
  performedByUser: string;
  referenceCode?: string;
}

// ============================================================================
// 2. STATUS CONFIG
// ============================================================================

const STATUS_CONFIG: Record<InstanceStatus, {
  color: string;
  icon: React.ReactNode;
  text: string;
  bgColor: string;
  description: string;
}> = {
  IN_STOCK: {
    color: 'success',
    icon: <CheckCircleOutlined />,
    text: 'Trong kho',
    bgColor: '#f6ffed',
    description: 'Sẵn sàng bán'
  },
  SOLD: {
    color: 'blue',
    icon: <ShopOutlined />,
    text: 'Đã bán',
    bgColor: '#e6f4ff',
    description: 'Đã bán cho khách hàng'
  },
  WARRANTY: {
    color: 'warning',
    icon: <SafetyCertificateOutlined />,
    text: 'Bảo hành',
    bgColor: '#fffbe6',
    description: 'Đang trong quá trình bảo hành'
  },
  REPAIR: {
    color: 'orange',
    icon: <ToolOutlined />,
    text: 'Sửa chữa',
    bgColor: '#fff7e6',
    description: 'Đang sửa chữa (ngoài BH)'
  },
  BROKEN: {
    color: 'error',
    icon: <CloseCircleOutlined />,
    text: 'Lỗi/Hỏng',
    bgColor: '#fff2f0',
    description: 'Thiết bị bị lỗi'
  },
  TRANSFERRING: {
    color: 'processing',
    icon: <SwapOutlined />,
    text: 'Đang chuyển',
    bgColor: '#f0f5ff',
    description: 'Đang vận chuyển giữa các kho'
  },
  DEMO: {
    color: 'purple',
    icon: <EyeOutlined />,
    text: 'Demo',
    bgColor: '#f9f0ff',
    description: 'Dùng để trưng bày/demo'
  },
  SCRAPPED: {
    color: 'default',
    icon: <ExclamationCircleOutlined />,
    text: 'Đã thanh lý',
    bgColor: '#fafafa',
    description: 'Đã thanh lý/hủy bỏ'
  },
  LOST: {
    color: 'magenta',
    icon: <WarningOutlined />,
    text: 'Mất/Thất lạc',
    bgColor: '#fff0f6',
    description: 'Không tìm thấy'
  },
};

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
  value: key,
  label: (
    <span className="flex items-center gap-2">
      {config.icon}
      {config.text}
    </span>
  ),
}));

const ZONE_CONFIG: Record<WarehouseZone, { label: string; color: string }> = {
  MAIN: { label: 'Khu chính', color: 'blue' },
  REPAIR: { label: 'Khu sửa chữa', color: 'orange' },
  DEMO: { label: 'Khu trưng bày', color: 'purple' },
  QUARANTINE: { label: 'Khu cách ly', color: 'red' },
};

// ============================================================================
// 3. MOCK DATA
// ============================================================================

const mockInstances: ProductInstance[] = [
  {
    instanceId: 'ins-001',
    componentId: 'comp-1',
    componentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    sku: 'MOBY-M63-V2',
    brand: 'Mobydata',
    serialNumber: 'M63V2-2024-00001',
    modelNumber: 'M63-V2-WIFI',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Tổng HCM',
    locationCode: 'A-01-R2-S3-B05',
    zone: 'MAIN',
    status: 'IN_STOCK',
    currentOwnerType: 'COMPANY',
    warrantyMonths: 12,
    totalRepairCount: 0,
    actualImportPrice: 5500000,
    importDate: '2024-12-20',
    createdAt: '2024-12-20T08:30:00',
    updatedAt: '2024-12-20T08:30:00',
    categoryName: 'Thiết bị cầm tay',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=pda1',
  },
  {
    instanceId: 'ins-002',
    componentId: 'comp-1',
    componentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    sku: 'MOBY-M63-V2',
    brand: 'Mobydata',
    serialNumber: 'M63V2-2024-00002',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Tổng HCM',
    locationCode: 'A-01-R2-S3-B06',
    zone: 'MAIN',
    status: 'IN_STOCK',
    currentOwnerType: 'COMPANY',
    warrantyMonths: 12,
    totalRepairCount: 0,
    actualImportPrice: 5500000,
    importDate: '2024-12-20',
    createdAt: '2024-12-20T08:30:00',
    updatedAt: '2024-12-20T08:30:00',
    categoryName: 'Thiết bị cầm tay',
  },
  {
    instanceId: 'ins-003',
    componentId: 'comp-2',
    componentName: 'Zebra TC21 Android Mobile Computer',
    sku: 'ZEBRA-TC21',
    brand: 'Zebra',
    serialNumber: 'TC21-SN-99887765',
    modelNumber: 'TC210K-01A222-A6',
    imei1: '356998000001234',
    imei2: '356998000001235',
    warehouseId: 'wh-2',
    warehouseName: 'Kho CN Hà Nội',
    zone: 'MAIN',
    status: 'SOLD',
    currentOwnerType: 'CUSTOMER',
    currentOwnerId: 'cust-001',
    currentOwnerName: 'Công ty ABC Logistics',
    warrantyMonths: 24,
    warrantyStartDate: '2024-12-01',
    warrantyEndDate: '2026-12-01',
    totalRepairCount: 0,
    actualImportPrice: 12000000,
    actualSellPrice: 15500000,
    soldDate: '2024-12-01',
    importDate: '2024-11-15',
    createdAt: '2024-11-15T10:00:00',
    updatedAt: '2024-12-01T14:30:00',
    categoryName: 'Thiết bị cầm tay',
    notes: 'Đã bán cho Công ty ABC Logistics - Hóa đơn #HD2024-001',
  },
  {
    instanceId: 'ins-004',
    componentId: 'comp-3',
    componentName: 'Zebra ZD421 Direct Thermal Printer',
    sku: 'ZEB-ZD421-DT',
    brand: 'Zebra',
    serialNumber: 'ZD421-SN-88776655',
    warehouseId: 'wh-3',
    warehouseName: 'Kho Bảo Hành',
    zone: 'REPAIR',
    status: 'WARRANTY',
    currentOwnerType: 'CUSTOMER',
    currentOwnerId: 'cust-002',
    currentOwnerName: 'Siêu thị BigMart',
    warrantyMonths: 12,
    warrantyStartDate: '2024-06-15',
    warrantyEndDate: '2025-06-15',
    totalRepairCount: 1,
    lastRepairDate: '2024-12-24',
    actualImportPrice: 8500000,
    actualSellPrice: 11000000,
    soldDate: '2024-06-15',
    importDate: '2024-05-10',
    createdAt: '2024-05-10T09:00:00',
    updatedAt: '2024-12-24T16:00:00',
    categoryName: 'Máy in',
    notes: 'Lỗi đầu in nhiệt - Đang chờ linh kiện thay thế',
  },
  {
    instanceId: 'ins-005',
    componentId: 'comp-4',
    componentName: 'Máy quét mã vạch Honeywell Voyager 1400g',
    sku: 'HON-1400G',
    brand: 'Honeywell',
    serialNumber: 'VOY-SN-55443322',
    warehouseId: '',
    status: 'TRANSFERRING',
    currentOwnerType: 'COMPANY',
    warrantyMonths: 12,
    totalRepairCount: 0,
    actualImportPrice: 2800000,
    importDate: '2024-12-24',
    createdAt: '2024-12-24T07:00:00',
    updatedAt: '2024-12-25T08:00:00',
    categoryName: 'Máy quét',
    notes: 'Đang chuyển từ Kho HCM → Kho Hà Nội - Phiếu TF-2024-0015',
  },
  {
    instanceId: 'ins-006',
    componentId: 'comp-5',
    componentName: 'Electronic Shelf Label 2.9 inch',
    sku: 'ESL-29-BW',
    brand: 'Hanshow',
    serialNumber: 'ESL-BATCH-2024-A001',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Tổng HCM',
    zone: 'MAIN',
    status: 'BROKEN',
    currentOwnerType: 'COMPANY',
    warrantyMonths: 36,
    totalRepairCount: 0,
    actualImportPrice: 180000,
    importDate: '2024-09-20',
    createdAt: '2024-09-20T11:00:00',
    updatedAt: '2024-12-20T09:00:00',
    categoryName: 'Nhãn điện tử',
    notes: 'Lỗi màn hình E-ink - Không hiển thị',
  },
  {
    instanceId: 'ins-007',
    componentId: 'comp-1',
    componentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    sku: 'MOBY-M63-V2',
    brand: 'Mobydata',
    serialNumber: 'M63V2-DEMO-001',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Tổng HCM',
    zone: 'DEMO',
    status: 'DEMO',
    currentOwnerType: 'DEMO_PARTNER',
    currentOwnerName: 'Showroom Quận 1',
    warrantyMonths: 12,
    totalRepairCount: 0,
    actualImportPrice: 5500000,
    importDate: '2024-12-01',
    createdAt: '2024-12-01T08:00:00',
    updatedAt: '2024-12-01T08:00:00',
    categoryName: 'Thiết bị cầm tay',
    notes: 'Máy demo cho khách hàng trải nghiệm tại showroom',
  },
  {
    instanceId: 'ins-008',
    componentId: 'comp-6',
    componentName: 'Pin Zebra TC21 Extended (5000mAh)',
    sku: 'BAT-TC21-EXT',
    brand: 'Zebra',
    serialNumber: 'BAT-TC21-EXT-001',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Tổng HCM',
    zone: 'MAIN',
    status: 'IN_STOCK',
    currentOwnerType: 'COMPANY',
    warrantyMonths: 6,
    totalRepairCount: 0,
    actualImportPrice: 1200000,
    importDate: '2024-12-15',
    createdAt: '2024-12-15T10:00:00',
    updatedAt: '2024-12-15T10:00:00',
    categoryName: 'Linh kiện thay thế',
  },
];

const mockLifecycleHistory: LifecycleEvent[] = [
  {
    historyId: 'evt-1',
    eventType: 'IMPORTED',
    eventDate: '2024-12-20 08:30',
    newStatus: 'IN_STOCK',
    description: 'Nhập kho từ đơn hàng PO-2024-0012',
    performedByUser: 'Nguyễn Văn Thủ Kho',
    referenceCode: 'PO-2024-0012',
  },
  {
    historyId: 'evt-2',
    eventType: 'LOCATION_CHANGED',
    eventDate: '2024-12-20 09:00',
    description: 'Đặt vào vị trí kho',
    performedByUser: 'Nguyễn Văn Thủ Kho',
    newWarehouseName: 'A-01-R2-S3-B05',
  },
  {
    historyId: 'evt-3',
    eventType: 'INSPECTED',
    eventDate: '2024-12-22 14:00',
    description: 'Kiểm tra QC đầu vào - PASSED',
    performedByUser: 'Trần Văn QC',
    referenceCode: 'QC-2024-0088',
  },
  {
    historyId: 'evt-4',
    eventType: 'STATUS_CHANGED',
    eventDate: '2024-12-25 09:00',
    oldStatus: 'IN_STOCK',
    newStatus: 'DEMO',
    description: 'Chuyển sang máy trưng bày showroom',
    performedByUser: 'Admin Hệ Thống',
  },
];

// ============================================================================
// 4. BARCODE COMPONENT
// ============================================================================

const BarcodeDisplay: React.FC<{ value: string; height?: number; showText?: boolean }> = ({
  value,
  height = 50,
  showText = true
}) => {
  const generateBars = (text: string) => {
    const bars: { width: number; filled: boolean }[] = [];
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    bars.push({ width: 2, filled: true }, { width: 2, filled: false }, { width: 2, filled: true }, { width: 2, filled: false });
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      bars.push({ width: (charCode % 3) + 1, filled: true });
      bars.push({ width: (charCode % 2) + 1, filled: false });
      bars.push({ width: ((charCode + seed) % 3) + 1, filled: true });
      bars.push({ width: 1, filled: false });
    }
    bars.push({ width: 2, filled: true }, { width: 2, filled: false }, { width: 2, filled: true });
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
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(false);
  const [data] = useState<ProductInstance[]>(mockInstances);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [warehouseFilter, setWarehouseFilter] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Drawer/Modal states
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<ProductInstance | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState('');

  const barcodeRef = useRef<HTMLDivElement>(null);

  // Computed: Statistics
  const stats = useMemo(() => ({
    total: data.length,
    inStock: data.filter(d => d.status === 'IN_STOCK').length,
    sold: data.filter(d => d.status === 'SOLD').length,
    warranty: data.filter(d => d.status === 'WARRANTY' || d.status === 'REPAIR').length,
    broken: data.filter(d => d.status === 'BROKEN').length,
    demo: data.filter(d => d.status === 'DEMO').length,
    totalValue: data.reduce((sum, d) => sum + (d.actualImportPrice || 0), 0),
  }), [data]);

  // Computed: Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = !searchText ||
        item.serialNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        item.componentName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.imei1 && item.imei1.includes(searchText)) ||
        (item.imei2 && item.imei2.includes(searchText)) ||
        (item.macAddress && item.macAddress.toLowerCase().includes(searchText.toLowerCase()));

      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchWarehouse = !warehouseFilter || item.warehouseId === warehouseFilter;

      return matchSearch && matchStatus && matchWarehouse;
    });
  }, [data, searchText, statusFilter, warehouseFilter]);

  // Helpers
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '---';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusConfig = (status: InstanceStatus) => {
    return STATUS_CONFIG[status] || { color: 'default', icon: null, text: status, bgColor: '#fafafa', description: '' };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép!');
  };

  // Handlers
  const handleViewDetail = (record: ProductInstance) => {
    setSelectedInstance(record);
    setDetailDrawerOpen(true);
  };

  const handleChangeStatus = (record: ProductInstance) => {
    setSelectedInstance(record);
    setNewStatus(record.status);
    setStatusNote('');
    setStatusModalOpen(true);
  };

  const handleViewHistory = (record: ProductInstance) => {
    setSelectedInstance(record);
    setHistoryModalOpen(true);
  };

  const handleSaveStatus = () => {
    if (!selectedInstance || !newStatus) return;
    message.success(`Đã cập nhật trạng thái: ${STATUS_CONFIG[newStatus as InstanceStatus]?.text}`);
    setStatusModalOpen(false);
  };

  const handlePrintBarcode = () => {
    if (!selectedInstance) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>In Barcode - ${selectedInstance.serialNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
              .serial { font-size: 18px; font-weight: bold; margin-top: 10px; font-family: monospace; }
              .product-name { font-size: 12px; color: #666; margin-top: 5px; }
              @media print { body { margin: 0; padding: 10px; } }
            </style>
          </head>
          <body>
            <div>${barcodeRef.current?.innerHTML || ''}</div>
            <div class="product-name">${selectedInstance.componentName}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Đã làm mới dữ liệu');
    }, 800);
  };

  // Action Menu
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
      label: 'Lịch sử vòng đời',
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
    {
      key: 'copy',
      icon: <CopyOutlined />,
      label: 'Copy Serial Number',
      onClick: () => copyToClipboard(record.serialNumber),
    },
  ];

  // Event icon for timeline
  const getEventIcon = (eventType: string) => {
    const icons: Record<string, React.ReactNode> = {
      'IMPORTED': <InboxOutlined style={{ color: '#52c41a' }} />,
      'TRANSFERRED_OUT': <SwapOutlined style={{ color: '#1890ff' }} />,
      'TRANSFERRED_IN': <SwapOutlined style={{ color: '#52c41a' }} />,
      'SOLD': <ShopOutlined style={{ color: '#1890ff' }} />,
      'WARRANTY_RECEIVED': <SafetyCertificateOutlined style={{ color: '#faad14' }} />,
      'WARRANTY_COMPLETED': <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      'REPAIR_STARTED': <ToolOutlined style={{ color: '#faad14' }} />,
      'REPAIR_COMPLETED': <ToolOutlined style={{ color: '#52c41a' }} />,
      'INSPECTED': <FileTextOutlined style={{ color: '#8c8c8c' }} />,
      'LOCATION_CHANGED': <EnvironmentOutlined style={{ color: '#722ed1' }} />,
      'STATUS_CHANGED': <SyncOutlined style={{ color: '#722ed1' }} />,
    };
    return icons[eventType] || <InfoCircleOutlined />;
  };

  // Columns
  const columns: ColumnsType<ProductInstance> = [
    {
      title: 'Mã Serial / IMEI',
      key: 'serial',
      width: 240,
      fixed: 'left',
      render: (_, record) => (
        <div className="py-1">
          <div className="flex items-center gap-2 mb-1">
            <BarcodeOutlined className="text-blue-600 text-lg" />
            <Text
              strong
              className="font-mono text-base cursor-pointer hover:text-blue-600"
              onClick={() => handleViewDetail(record)}
            >
              {record.serialNumber}
            </Text>
            <Tooltip title="Copy">
              <CopyOutlined
                className="text-gray-400 cursor-pointer hover:text-blue-600 text-xs"
                onClick={() => copyToClipboard(record.serialNumber)}
              />
            </Tooltip>
          </div>
          {record.imei1 && (
            <div className="text-xs text-gray-500 ml-6">
              IMEI: <span className="font-mono">{record.imei1}</span>
            </div>
          )}
          {record.modelNumber && (
            <div className="text-xs text-gray-400 ml-6">
              Model: {record.modelNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            shape="square"
            size={48}
            src={record.imageUrl}
            icon={<AppstoreOutlined />}
            className="bg-gray-100 border flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="font-medium text-gray-800 line-clamp-1">{record.componentName}</div>
            <div className="flex items-center gap-2 mt-1">
              <Tag className="m-0 bg-gray-100 text-xs">{record.sku}</Tag>
              {record.brand && <span className="text-xs text-gray-500">{record.brand}</span>}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vị trí',
      key: 'location',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-1">
            <EnvironmentOutlined className="text-gray-400" />
            <span>{record.warehouseName || '---'}</span>
          </div>
          {record.zone && (
            <Tag className="mt-1" color={ZONE_CONFIG[record.zone]?.color}>
              {ZONE_CONFIG[record.zone]?.label}
            </Tag>
          )}
          {record.locationCode && (
            <div className="text-xs text-gray-400 font-mono mt-1">{record.locationCode}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      filters: Object.entries(STATUS_CONFIG).map(([key, config]) => ({ text: config.text, value: key })),
      onFilter: (value, record) => record.status === value,
      render: (status: InstanceStatus) => {
        const config = getStatusConfig(status);
        return (
          <Tooltip title={config.description}>
            <Tag color={config.color} icon={config.icon} className="px-2 py-1">
              {config.text}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Chủ sở hữu',
      key: 'owner',
      width: 160,
      render: (_, record) => {
        if (record.currentOwnerType === 'COMPANY') {
          return <span className="text-gray-500 italic">Công ty</span>;
        }
        return (
          <div>
            <div className="text-sm font-medium">{record.currentOwnerName}</div>
            <Tag className="mt-1" color={record.currentOwnerType === 'CUSTOMER' ? 'blue' : 'purple'}>
              {record.currentOwnerType === 'CUSTOMER' ? 'Khách hàng' : 'Đối tác'}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'Bảo hành',
      key: 'warranty',
      width: 140,
      render: (_, record) => {
        if (!record.warrantyEndDate) {
          return <span className="text-gray-400">Chưa kích hoạt</span>;
        }
        const endDate = dayjs(record.warrantyEndDate);
        const isExpired = endDate.isBefore(dayjs());
        const daysLeft = endDate.diff(dayjs(), 'day');

        return (
          <div>
            <div className={`text-sm ${isExpired ? 'text-red-500' : daysLeft < 30 ? 'text-orange-500' : 'text-green-600'}`}>
              {isExpired ? 'Hết hạn' : `Còn ${daysLeft} ngày`}
            </div>
            <div className="text-xs text-gray-400">{endDate.format('DD/MM/YYYY')}</div>
          </div>
        );
      },
    },
    {
      title: 'Giá nhập',
      dataIndex: 'actualImportPrice',
      key: 'price',
      align: 'right',
      width: 140,
      sorter: (a, b) => (a.actualImportPrice || 0) - (b.actualImportPrice || 0),
      render: (val) => (
        <span className="font-mono text-gray-700 font-medium">{formatCurrency(val)}</span>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 80,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined className="text-gray-500" />}
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

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <BarcodeOutlined className="text-blue-600" />
            Quản lý Serial/IMEI
          </h1>
          <p className="text-gray-500 mt-1">
            Theo dõi chi tiết từng thiết bị, vị trí, trạng thái và lịch sử vòng đời
          </p>
        </div>
        <Space>
          <Button icon={<QrcodeOutlined />}>Quét mã</Button>
          <Button icon={<ExportOutlined />}>Xuất Excel</Button>
          <Button type="primary" icon={<PlusOutlined />} className="bg-blue-600" onClick={() => navigate('/admin/inventory/instances/import')}>
            Nhập thiết bị
          </Button>
        </Space>
      </div>

      {/* STATISTICS */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8} lg={4}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-500">Tổng thiết bị</span>}
              value={stats.total}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="shadow-sm" bodyStyle={{ padding: '16px', background: '#f6ffed' }}>
            <Statistic
              title={<span className="text-gray-500">Trong kho</span>}
              value={stats.inStock}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="shadow-sm" bodyStyle={{ padding: '16px', background: '#e6f4ff' }}>
            <Statistic
              title={<span className="text-gray-500">Đã bán</span>}
              value={stats.sold}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="shadow-sm" bodyStyle={{ padding: '16px', background: '#fffbe6' }}>
            <Statistic
              title={<span className="text-gray-500">Bảo hành/Sửa</span>}
              value={stats.warranty}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
              prefix={<ToolOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="shadow-sm" bodyStyle={{ padding: '16px', background: '#f9f0ff' }}>
            <Statistic
              title={<span className="text-gray-500">Demo</span>}
              value={stats.demo}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
              prefix={<EyeOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card className="shadow-sm" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-500">Tổng giá trị</span>}
              value={stats.totalValue}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: '18px' }}
              prefix={<DollarOutlined />}
              formatter={value => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      {/* FILTER BAR */}
      <Card className="mb-6 shadow-sm" bordered={false} bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 max-w-xl">
            <Input
              placeholder="🔍 Quét hoặc nhập Serial, IMEI, MAC Address, SKU..."
              prefix={<BarcodeOutlined className="text-gray-400" />}
              size="large"
              autoFocus
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              placeholder="Trạng thái"
              allowClear
              className="w-40"
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              options={STATUS_OPTIONS}
            />
            <Select
              placeholder="Kho hàng"
              allowClear
              className="w-44"
              size="large"
              value={warehouseFilter}
              onChange={setWarehouseFilter}
              options={[
                { label: '📍 Kho Tổng HCM', value: 'wh-1' },
                { label: '📍 Kho CN Hà Nội', value: 'wh-2' },
                { label: '📍 Kho Bảo Hành', value: 'wh-3' },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} size="large" />
            <Segmented
              options={[
                { value: 'table', icon: <TableOutlined /> },
                { value: 'grid', icon: <AppstoreOutlined /> },
              ]}
              value={viewMode}
              onChange={val => setViewMode(val as 'table' | 'grid')}
            />
          </div>
        </div>

        {/* Active filters */}
        {(statusFilter || warehouseFilter) && (
          <div className="mt-3 flex items-center gap-2">
            <FilterOutlined className="text-gray-400" />
            <span className="text-sm text-gray-500">Bộ lọc:</span>
            {statusFilter && (
              <Tag closable onClose={() => setStatusFilter(undefined)}>
                {STATUS_CONFIG[statusFilter as InstanceStatus]?.text}
              </Tag>
            )}
            {warehouseFilter && (
              <Tag closable onClose={() => setWarehouseFilter(undefined)}>
                {warehouseFilter}
              </Tag>
            )}
            <Button
              type="link"
              size="small"
              onClick={() => {
                setStatusFilter(undefined);
                setWarehouseFilter(undefined);
                setSearchText('');
              }}
            >
              Xóa tất cả
            </Button>
          </div>
        )}
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          rowKey="instanceId"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} thiết bị`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1500 }}
          onRow={(record) => ({
            onDoubleClick: () => handleViewDetail(record),
            className: 'cursor-pointer hover:bg-blue-50/30',
          })}
        />
      </Card>

      {/* DETAIL DRAWER */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <Avatar
              shape="square"
              size={48}
              src={selectedInstance?.imageUrl}
              icon={<AppstoreOutlined />}
            />
            <div>
              <div className="font-semibold">{selectedInstance?.componentName}</div>
              <div className="text-sm text-gray-500 font-mono">{selectedInstance?.serialNumber}</div>
            </div>
          </div>
        }
        placement="right"
        width={640}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        extra={
          <Space>
            <Button icon={<PrinterOutlined />} onClick={handlePrintBarcode}>
              In Barcode
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setDetailDrawerOpen(false);
                if (selectedInstance) handleChangeStatus(selectedInstance);
              }}
            >
              Đổi trạng thái
            </Button>
          </Space>
        }
      >
        {selectedInstance && (
          <div className="space-y-6">
            {/* Barcode Display */}
            <div
              ref={barcodeRef}
              className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-200 text-center"
            >
              <BarcodeDisplay value={selectedInstance.serialNumber} height={70} showText={true} />
            </div>

            {/* Tabs */}
            <Tabs
              items={[
                {
                  key: 'info',
                  label: '📋 Thông tin',
                  children: (
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="Serial Number" span={2}>
                        <Text copyable className="font-mono font-bold text-blue-600">
                          {selectedInstance.serialNumber}
                        </Text>
                      </Descriptions.Item>
                      {selectedInstance.imei1 && (
                        <Descriptions.Item label="IMEI 1">
                          <Text copyable className="font-mono">{selectedInstance.imei1}</Text>
                        </Descriptions.Item>
                      )}
                      {selectedInstance.imei2 && (
                        <Descriptions.Item label="IMEI 2">
                          <Text copyable className="font-mono">{selectedInstance.imei2}</Text>
                        </Descriptions.Item>
                      )}
                      {selectedInstance.macAddress && (
                        <Descriptions.Item label="MAC Address">
                          <Text copyable className="font-mono">{selectedInstance.macAddress}</Text>
                        </Descriptions.Item>
                      )}
                      <Descriptions.Item label="SKU">
                        <Tag>{selectedInstance.sku}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Thương hiệu">
                        {selectedInstance.brand || '---'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Model Number" span={2}>
                        {selectedInstance.modelNumber || '---'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái" span={2}>
                        <Tag
                          color={getStatusConfig(selectedInstance.status).color}
                          icon={getStatusConfig(selectedInstance.status).icon}
                          className="px-3 py-1"
                        >
                          {getStatusConfig(selectedInstance.status).text}
                        </Tag>
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: 'location',
                  label: '📍 Vị trí & Giá',
                  children: (
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="Kho hiện tại">
                        {selectedInstance.warehouseName || '---'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Khu vực">
                        {selectedInstance.zone ? (
                          <Tag color={ZONE_CONFIG[selectedInstance.zone]?.color}>
                            {ZONE_CONFIG[selectedInstance.zone]?.label}
                          </Tag>
                        ) : '---'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Vị trí chi tiết" span={2}>
                        <span className="font-mono">{selectedInstance.locationCode || '---'}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Giá nhập">
                        <span className="font-bold text-lg text-gray-800">
                          {formatCurrency(selectedInstance.actualImportPrice)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Giá bán">
                        <span className="font-bold text-lg text-green-600">
                          {formatCurrency(selectedInstance.actualSellPrice)}
                        </span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày nhập kho">
                        {dayjs(selectedInstance.importDate).format('DD/MM/YYYY')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Cập nhật cuối">
                        {dayjs(selectedInstance.updatedAt).format('DD/MM/YYYY HH:mm')}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
                {
                  key: 'warranty',
                  label: '🛡️ Bảo hành',
                  children: (
                    <Descriptions bordered column={2} size="small">
                      <Descriptions.Item label="Thời gian BH">
                        {selectedInstance.warrantyMonths} tháng
                      </Descriptions.Item>
                      <Descriptions.Item label="Số lần sửa chữa">
                        <Badge count={selectedInstance.totalRepairCount} showZero color={selectedInstance.totalRepairCount > 0 ? 'orange' : 'gray'} />
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày bắt đầu BH">
                        {selectedInstance.warrantyStartDate ? dayjs(selectedInstance.warrantyStartDate).format('DD/MM/YYYY') : '---'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày kết thúc BH">
                        {selectedInstance.warrantyEndDate ? dayjs(selectedInstance.warrantyEndDate).format('DD/MM/YYYY') : '---'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Chủ sở hữu" span={2}>
                        {selectedInstance.currentOwnerType === 'COMPANY' ? (
                          <span className="text-gray-500 italic">Công ty sở hữu</span>
                        ) : (
                          <div>
                            <span className="font-medium">{selectedInstance.currentOwnerName}</span>
                            <Tag className="ml-2" color={selectedInstance.currentOwnerType === 'CUSTOMER' ? 'blue' : 'purple'}>
                              {selectedInstance.currentOwnerType === 'CUSTOMER' ? 'Khách hàng' : 'Đối tác'}
                            </Tag>
                          </div>
                        )}
                      </Descriptions.Item>
                      <Descriptions.Item label="Ghi chú" span={2}>
                        {selectedInstance.notes || <span className="text-gray-400">Không có ghi chú</span>}
                      </Descriptions.Item>
                    </Descriptions>
                  ),
                },
              ]}
            />
          </div>
        )}
      </Drawer>

      {/* STATUS CHANGE MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-orange-500" />
            Thay đổi trạng thái thiết bị
          </div>
        }
        open={statusModalOpen}
        onCancel={() => setStatusModalOpen(false)}
        onOk={handleSaveStatus}
        okText="Lưu thay đổi"
        cancelText="Hủy"
        width={500}
      >
        {selectedInstance && (
          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="font-bold text-gray-800">{selectedInstance.componentName}</div>
              <div className="text-sm text-gray-500 font-mono mt-1">
                Serial: {selectedInstance.serialNumber}
              </div>
            </div>

            <div>
              <label className="block text-gray-600 mb-2 font-medium">
                Trạng thái hiện tại:
              </label>
              <Tag
                color={getStatusConfig(selectedInstance.status).color}
                icon={getStatusConfig(selectedInstance.status).icon}
                className="px-4 py-1 text-base"
              >
                {getStatusConfig(selectedInstance.status).text}
              </Tag>
            </div>

            <div>
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

      {/* HISTORY MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <HistoryOutlined className="text-purple-600" />
            Lịch sử vòng đời thiết bị
          </div>
        }
        open={historyModalOpen}
        onCancel={() => setHistoryModalOpen(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setHistoryModalOpen(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedInstance && (
          <div className="mt-4">
            {/* Device Info */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg mb-6 border border-blue-100">
              <div className="font-bold text-gray-800 text-lg">{selectedInstance.componentName}</div>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-sm text-gray-600">
                  <BarcodeOutlined className="mr-1" />
                  <span className="font-mono font-bold">{selectedInstance.serialNumber}</span>
                </span>
                <Tag
                  color={getStatusConfig(selectedInstance.status).color}
                  icon={getStatusConfig(selectedInstance.status).icon}
                >
                  {getStatusConfig(selectedInstance.status).text}
                </Tag>
              </div>
            </div>

            {/* Timeline */}
            {mockLifecycleHistory.length > 0 ? (
              <Timeline
                mode="left"
                items={mockLifecycleHistory.map(event => ({
                  dot: getEventIcon(event.eventType),
                  label: (
                    <span className="text-gray-500 text-sm">{event.eventDate}</span>
                  ),
                  children: (
                    <div className="pb-4">
                      <div className="font-bold text-gray-800">{event.description}</div>
                      {event.oldStatus && event.newStatus && (
                        <div className="text-sm text-purple-600 mt-1">
                          <SyncOutlined className="mr-1" />
                          {STATUS_CONFIG[event.oldStatus as InstanceStatus]?.text} → {STATUS_CONFIG[event.newStatus as InstanceStatus]?.text}
                        </div>
                      )}
                      {event.referenceCode && (
                        <Tag className="mt-1" color="blue">{event.referenceCode}</Tag>
                      )}
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <UserOutlined />
                        {event.performedByUser}
                      </div>
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