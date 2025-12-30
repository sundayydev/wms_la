import React, { useState, useMemo } from 'react';
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
  message,
  Drawer,
  Descriptions,
  List,
  Avatar,
  Badge,
  Progress,
  Divider,
  Timeline,
  Modal,
  Dropdown,
  Empty,
  Popconfirm,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  TruckOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  InboxOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  HistoryOutlined,
  FileDoneOutlined,
  ExclamationCircleOutlined,
  CopyOutlined,
  BoxPlotOutlined,
  StopOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, Link } from 'react-router-dom';
import { FaFileInvoice, FaBoxOpen, FaUserTie } from 'react-icons/fa';

const { RangePicker } = DatePicker;
const { Text, Title, Paragraph } = Typography;

// ============================================================================
// TYPES
// ============================================================================

type POStatus = 'PENDING' | 'CONFIRMED' | 'PARTIAL' | 'DELIVERED' | 'CANCELLED';

interface POItem {
  itemId: string;
  componentId: string;
  sku: string;
  componentName: string;
  brand?: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

interface PurchaseOrder {
  purchaseOrderId: string;
  orderCode: string;
  supplierId: string;
  supplierCode: string;
  supplierName: string;
  supplierContact?: string;
  supplierPhone?: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  orderDate: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  status: POStatus;
  items: POItem[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  receivedAmount: number;
  createdByUserId: string;
  createdByName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface POHistory {
  id: string;
  action: string;
  date: string;
  user: string;
  description: string;
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const PO_STATUS_CONFIG: Record<POStatus, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
  PENDING: { label: 'Chờ duyệt', color: 'warning', icon: <ClockCircleOutlined />, bgColor: 'bg-yellow-50' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'processing', icon: <TruckOutlined />, bgColor: 'bg-blue-50' },
  PARTIAL: { label: 'Nhận một phần', color: 'cyan', icon: <BoxPlotOutlined />, bgColor: 'bg-cyan-50' },
  DELIVERED: { label: 'Đã nhận đủ', color: 'success', icon: <CheckCircleOutlined />, bgColor: 'bg-green-50' },
  CANCELLED: { label: 'Đã hủy', color: 'error', icon: <CloseCircleOutlined />, bgColor: 'bg-red-50' },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    purchaseOrderId: 'po-001',
    orderCode: 'PO-2024-001',
    supplierId: 'sup-1',
    supplierCode: 'NCC-SAMSUNG',
    supplierName: 'Samsung Vina Electronics',
    supplierContact: 'Nguyễn Văn A',
    supplierPhone: '02839157600',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Tổng HCM',
    warehouseCode: 'HCM-01',
    orderDate: '2024-12-20T10:30:00',
    expectedDeliveryDate: '2024-12-25',
    actualDeliveryDate: '2024-12-24',
    status: 'DELIVERED',
    items: [
      { itemId: 'item-1', componentId: '1', sku: 'MOBY-M63-V2', componentName: 'Máy kiểm kho PDA Mobydata M63 V2', brand: 'Mobydata', quantity: 50, receivedQuantity: 50, unitPrice: 5500000, totalPrice: 275000000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=pda1' },
      { itemId: 'item-2', componentId: '2', sku: 'DOCK-M63-4', componentName: 'Đế sạc 4 slot Mobydata M63', brand: 'Mobydata', quantity: 10, receivedQuantity: 10, unitPrice: 2500000, totalPrice: 25000000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=dock1' },
    ],
    totalAmount: 300000000,
    discountAmount: 15000000,
    finalAmount: 285000000,
    receivedAmount: 285000000,
    createdByUserId: 'user-1',
    createdByName: 'Nguyễn Văn A',
    notes: 'Đơn hàng ưu tiên - Giao trước Tết',
    createdAt: '2024-12-20T10:30:00',
    updatedAt: '2024-12-24T14:00:00',
  },
  {
    purchaseOrderId: 'po-002',
    orderCode: 'PO-2024-002',
    supplierId: 'sup-2',
    supplierCode: 'NCC-ZEBRA',
    supplierName: 'Zebra Corporation Vietnam',
    supplierContact: 'Trần Thị B',
    supplierPhone: '028912345678',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Tổng HCM',
    warehouseCode: 'HCM-01',
    orderDate: '2024-12-22T09:00:00',
    expectedDeliveryDate: '2024-12-30',
    status: 'PARTIAL',
    items: [
      { itemId: 'item-3', componentId: '3', sku: 'ZEBRA-TC21', componentName: 'Zebra TC21 Android Mobile Computer', brand: 'Zebra', quantity: 20, receivedQuantity: 12, unitPrice: 12000000, totalPrice: 240000000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=zebra1' },
      { itemId: 'item-4', componentId: '4', sku: 'ZEB-ZD421-DT', componentName: 'Zebra ZD421 Direct Thermal Printer', brand: 'Zebra', quantity: 5, receivedQuantity: 5, unitPrice: 8500000, totalPrice: 42500000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=printer1' },
    ],
    totalAmount: 282500000,
    discountAmount: 0,
    finalAmount: 282500000,
    receivedAmount: 186500000,
    createdByUserId: 'user-2',
    createdByName: 'Trần Thị B',
    createdAt: '2024-12-22T09:00:00',
    updatedAt: '2024-12-28T16:00:00',
  },
  {
    purchaseOrderId: 'po-003',
    orderCode: 'PO-2024-003',
    supplierId: 'sup-3',
    supplierCode: 'NCC-HONEY',
    supplierName: 'Honeywell Asia Pacific',
    supplierContact: 'Lê Văn C',
    warehouseId: 'wh-2',
    warehouseName: 'Kho Hà Nội',
    warehouseCode: 'HN-01',
    orderDate: '2024-12-25T08:00:00',
    expectedDeliveryDate: '2025-01-05',
    status: 'CONFIRMED',
    items: [
      { itemId: 'item-5', componentId: '5', sku: 'HON-1400G', componentName: 'Máy quét mã vạch Honeywell Voyager 1400g', brand: 'Honeywell', quantity: 100, receivedQuantity: 0, unitPrice: 2800000, totalPrice: 280000000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=scanner1' },
      { itemId: 'item-6', componentId: '6', sku: 'HON-CBL-USB', componentName: 'Cáp USB Honeywell', brand: 'Honeywell', quantity: 100, receivedQuantity: 0, unitPrice: 150000, totalPrice: 15000000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=cable1' },
    ],
    totalAmount: 295000000,
    discountAmount: 10000000,
    finalAmount: 285000000,
    receivedAmount: 0,
    createdByUserId: 'user-1',
    createdByName: 'Nguyễn Văn A',
    notes: 'Đơn hàng cho dự án BigMart - 100 cửa hàng',
    createdAt: '2024-12-25T08:00:00',
    updatedAt: '2024-12-25T08:00:00',
  },
  {
    purchaseOrderId: 'po-004',
    orderCode: 'PO-2024-004',
    supplierId: 'sup-4',
    supplierCode: 'NCC-BASEUS',
    supplierName: 'Công ty Phụ kiện Baseus',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Tổng HCM',
    warehouseCode: 'HCM-01',
    orderDate: '2024-12-26T14:00:00',
    expectedDeliveryDate: '2024-12-30',
    status: 'PENDING',
    items: [
      { itemId: 'item-7', componentId: '7', sku: 'BAS-PWB-10K', componentName: 'Pin dự phòng Baseus 10000mAh', brand: 'Baseus', quantity: 200, receivedQuantity: 0, unitPrice: 350000, totalPrice: 70000000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=power1' },
    ],
    totalAmount: 70000000,
    discountAmount: 5000000,
    finalAmount: 65000000,
    receivedAmount: 0,
    createdByUserId: 'user-3',
    createdByName: 'Lê Văn C',
    createdAt: '2024-12-26T14:00:00',
    updatedAt: '2024-12-26T14:00:00',
  },
  {
    purchaseOrderId: 'po-005',
    orderCode: 'PO-2024-005',
    supplierId: 'sup-5',
    supplierCode: 'NCC-CHOLON',
    supplierName: 'Linh kiện Chợ Lớn',
    warehouseId: 'wh-1',
    warehouseName: 'Kho Tổng HCM',
    warehouseCode: 'HCM-01',
    orderDate: '2024-12-10T10:00:00',
    expectedDeliveryDate: '2024-12-12',
    status: 'CANCELLED',
    items: [
      { itemId: 'item-8', componentId: '8', sku: 'SCREEN-TC21', componentName: 'Màn hình thay thế Zebra TC21', brand: 'Zebra', quantity: 10, receivedQuantity: 0, unitPrice: 1500000, totalPrice: 15000000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=screen1' },
    ],
    totalAmount: 15000000,
    discountAmount: 0,
    finalAmount: 15000000,
    receivedAmount: 0,
    createdByUserId: 'user-2',
    createdByName: 'Trần Thị B',
    notes: 'Đã hủy do NCC không có hàng',
    createdAt: '2024-12-10T10:00:00',
    updatedAt: '2024-12-11T09:00:00',
  },
];

const mockSuppliers = [
  { value: 'sup-1', label: 'Samsung Vina Electronics' },
  { value: 'sup-2', label: 'Zebra Corporation Vietnam' },
  { value: 'sup-3', label: 'Honeywell Asia Pacific' },
  { value: 'sup-4', label: 'Công ty Phụ kiện Baseus' },
  { value: 'sup-5', label: 'Linh kiện Chợ Lớn' },
];

const mockWarehouses = [
  { value: 'wh-1', label: 'Kho Tổng HCM' },
  { value: 'wh-2', label: 'Kho Hà Nội' },
  { value: 'wh-3', label: 'Kho Đà Nẵng' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PurchaseOrderList: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(false);
  const [data] = useState<PurchaseOrder[]>(mockPurchaseOrders);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<POStatus | undefined>();
  const [supplierFilter, setSupplierFilter] = useState<string | undefined>();
  const [warehouseFilter, setWarehouseFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Drawer/Modal states
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [activeTab, setActiveTab] = useState('detail');

  // Computed: Statistics
  const stats = useMemo(() => {
    const pending = data.filter(d => d.status === 'PENDING').length;
    const confirmed = data.filter(d => d.status === 'CONFIRMED').length;
    const partial = data.filter(d => d.status === 'PARTIAL').length;
    const delivered = data.filter(d => d.status === 'DELIVERED').length;
    const thisMonth = data.filter(d => dayjs(d.orderDate).isSame(dayjs(), 'month'));
    const totalThisMonth = thisMonth.reduce((sum, d) => sum + d.finalAmount, 0);
    const totalPending = data.filter(d => d.status !== 'CANCELLED' && d.status !== 'DELIVERED')
      .reduce((sum, d) => sum + (d.finalAmount - d.receivedAmount), 0);

    return {
      pending,
      confirmed,
      partial,
      delivered,
      total: data.length,
      totalThisMonth,
      totalPending,
      needReceive: confirmed + partial,
    };
  }, [data]);

  // Computed: Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = !searchText ||
        item.orderCode.toLowerCase().includes(searchText.toLowerCase()) ||
        item.supplierName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.createdByName.toLowerCase().includes(searchText.toLowerCase());

      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchSupplier = !supplierFilter || item.supplierId === supplierFilter;
      const matchWarehouse = !warehouseFilter || item.warehouseId === warehouseFilter;

      let matchDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const orderDate = dayjs(item.orderDate);
        matchDate = orderDate.isAfter(dateRange[0].startOf('day')) && orderDate.isBefore(dateRange[1].endOf('day'));
      }

      return matchSearch && matchStatus && matchSupplier && matchWarehouse && matchDate;
    });
  }, [data, searchText, statusFilter, supplierFilter, warehouseFilter, dateRange]);

  // Helpers
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '---';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép!');
  };

  // Handlers
  const handleViewDetail = (record: PurchaseOrder) => {
    setSelectedPO(record);
    setActiveTab('detail');
    setDetailDrawerOpen(true);
  };

  const handleApprove = (record: PurchaseOrder) => {
    Modal.confirm({
      title: 'Duyệt đơn hàng',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: (
        <div>
          <p>Bạn có chắc muốn duyệt đơn hàng <strong>{record.orderCode}</strong>?</p>
          <p className="text-gray-500">Sau khi duyệt, đơn hàng sẽ chuyển sang trạng thái "Đã xác nhận" và có thể nhận hàng.</p>
        </div>
      ),
      okText: 'Duyệt đơn',
      cancelText: 'Hủy',
      onOk: () => {
        message.success(`Đã duyệt đơn hàng ${record.orderCode}`);
      },
    });
  };

  const handleCancel = (record: PurchaseOrder) => {
    Modal.confirm({
      title: 'Hủy đơn hàng',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      content: (
        <div>
          <p>Bạn có chắc muốn hủy đơn hàng <strong>{record.orderCode}</strong>?</p>
          <p className="text-red-500">Hành động này không thể hoàn tác!</p>
        </div>
      ),
      okText: 'Hủy đơn',
      okButtonProps: { danger: true },
      cancelText: 'Đóng',
      onOk: () => {
        message.success(`Đã hủy đơn hàng ${record.orderCode}`);
      },
    });
  };

  const handleReceiving = (record: PurchaseOrder) => {
    navigate('/admin/purchasing/receiving');
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Đã làm mới dữ liệu');
    }, 800);
  };

  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter(undefined);
    setSupplierFilter(undefined);
    setWarehouseFilter(undefined);
    setDateRange(null);
    message.info('Đã xóa bộ lọc');
  };

  // Action Menu
  const getActionMenuItems = (record: PurchaseOrder): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeOutlined />,
        label: 'Xem chi tiết',
        onClick: () => handleViewDetail(record),
      },
    ];

    if (record.status === 'PENDING') {
      items.push(
        {
          key: 'approve',
          icon: <CheckCircleOutlined />,
          label: 'Duyệt đơn',
          onClick: () => handleApprove(record),
        },
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Chỉnh sửa',
        }
      );
    }

    if (record.status === 'CONFIRMED' || record.status === 'PARTIAL') {
      items.push({
        key: 'receive',
        icon: <InboxOutlined />,
        label: 'Nhận hàng',
        onClick: () => handleReceiving(record),
      });
    }

    items.push(
      { type: 'divider' },
      {
        key: 'print',
        icon: <PrinterOutlined />,
        label: 'In đơn hàng',
      },
      {
        key: 'copy',
        icon: <CopyOutlined />,
        label: 'Copy mã đơn',
        onClick: () => copyToClipboard(record.orderCode),
      }
    );

    if (record.status !== 'DELIVERED' && record.status !== 'CANCELLED') {
      items.push(
        { type: 'divider' },
        {
          key: 'cancel',
          icon: <StopOutlined />,
          label: 'Hủy đơn',
          danger: true,
          onClick: () => handleCancel(record),
        }
      );
    }

    return items;
  };

  // Table Columns
  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: 'Mã đơn (PO)',
      key: 'code',
      width: 150,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <a
            className="font-bold text-blue-600 hover:underline text-base"
            onClick={() => handleViewDetail(record)}
          >
            {record.orderCode}
          </a>
          <div className="text-xs text-gray-400 mt-1">
            {dayjs(record.createdAt).format('DD/MM/YYYY HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Nhà cung cấp',
      key: 'supplier',
      width: 220,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            icon={<FaUserTie />}
            className="bg-blue-100 text-blue-600"
          />
          <div>
            <div className="font-medium text-gray-700">{record.supplierName}</div>
            <Tag className="mt-1">{record.supplierCode}</Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Kho nhập',
      key: 'warehouse',
      width: 130,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <EnvironmentOutlined className="text-green-500" />
          <div>
            <div>{record.warehouseName}</div>
            <div className="text-xs text-gray-400">{record.warehouseCode}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ngày đặt / Giao',
      key: 'dates',
      width: 160,
      render: (_, record) => {
        const isOverdue = record.status !== 'DELIVERED' && record.status !== 'CANCELLED' &&
          dayjs(record.expectedDeliveryDate).isBefore(dayjs(), 'day');
        return (
          <div className="text-sm">
            <div className="flex items-center gap-1">
              <CalendarOutlined className="text-gray-400" />
              {dayjs(record.orderDate).format('DD/MM/YYYY')}
            </div>
            <div className={`text-xs mt-1 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
              Giao: {dayjs(record.expectedDeliveryDate).format('DD/MM/YYYY')}
              {isOverdue && <Tag color="error" className="ml-1 text-xs">Quá hạn</Tag>}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Sản phẩm',
      key: 'items',
      width: 120,
      align: 'center',
      render: (_, record) => {
        const totalOrdered = record.items.reduce((sum, i) => sum + i.quantity, 0);
        const totalReceived = record.items.reduce((sum, i) => sum + i.receivedQuantity, 0);
        const percent = Math.round((totalReceived / totalOrdered) * 100);
        return (
          <Tooltip title={`${totalReceived}/${totalOrdered} sản phẩm đã nhận`}>
            <div className="text-center">
              <Badge count={record.items.length} className="mb-1" style={{ backgroundColor: '#1890ff' }} />
              <Progress
                percent={percent}
                size="small"
                showInfo={false}
                strokeColor={percent === 100 ? '#52c41a' : '#1890ff'}
              />
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Tổng tiền',
      key: 'amount',
      width: 150,
      align: 'right',
      sorter: (a, b) => a.finalAmount - b.finalAmount,
      render: (_, record) => (
        <div>
          <div className="font-bold text-gray-800">{formatCurrency(record.finalAmount)}</div>
          {record.discountAmount > 0 && (
            <div className="text-xs text-gray-400 line-through">{formatCurrency(record.totalAmount)}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      filters: Object.entries(PO_STATUS_CONFIG).map(([key, config]) => ({ text: config.label, value: key })),
      onFilter: (value, record) => record.status === value,
      render: (status: POStatus) => {
        const config = PO_STATUS_CONFIG[status];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdByName',
      key: 'createdBy',
      width: 120,
      responsive: ['xl'],
      render: (name) => (
        <div className="flex items-center gap-1 text-sm">
          <UserOutlined className="text-gray-400" />
          {name}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  // Mock history
  const getHistory = (po: PurchaseOrder): POHistory[] => {
    const history: POHistory[] = [
      { id: '1', action: 'Tạo đơn', date: po.createdAt, user: po.createdByName, description: 'Tạo đơn đặt hàng mới' },
    ];
    if (po.status !== 'PENDING') {
      history.push({ id: '2', action: 'Duyệt đơn', date: dayjs(po.createdAt).add(1, 'hour').toISOString(), user: 'Admin', description: 'Duyệt và xác nhận đơn hàng' });
    }
    if (po.status === 'PARTIAL') {
      history.push({ id: '3', action: 'Nhận hàng', date: po.updatedAt, user: 'Thủ kho', description: 'Nhận một phần hàng hóa' });
    }
    if (po.status === 'DELIVERED') {
      history.push({ id: '3', action: 'Hoàn thành', date: po.updatedAt, user: 'Thủ kho', description: 'Đã nhận đủ hàng hóa' });
    }
    if (po.status === 'CANCELLED') {
      history.push({ id: '3', action: 'Hủy đơn', date: po.updatedAt, user: 'Admin', description: po.notes || 'Đơn hàng đã bị hủy' });
    }
    return history;
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <FaFileInvoice className="text-blue-600" />
            Đơn đặt hàng (Purchase Orders)
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý các đơn nhập hàng từ Nhà cung cấp
          </p>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Làm mới
          </Button>
          <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-blue-600"
            onClick={() => navigate('/admin/purchasing/create')}
          >
            Tạo đơn nhập
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={12} lg={6}>
          <Card className="shadow-sm bg-yellow-50 border border-yellow-200" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-yellow-700">Chờ duyệt</span>}
              value={stats.pending}
              valueStyle={{ color: '#faad14', fontWeight: 'bold', fontSize: '28px' }}
              prefix={<ClockCircleOutlined />}
              suffix="đơn"
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="shadow-sm bg-blue-50 border border-blue-200" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-blue-700">Chờ nhận hàng</span>}
              value={stats.needReceive}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: '28px' }}
              prefix={<TruckOutlined />}
              suffix="đơn"
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="shadow-sm bg-green-50 border border-green-200" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-green-700">Đã hoàn thành</span>}
              value={stats.delivered}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: '28px' }}
              prefix={<CheckCircleOutlined />}
              suffix="đơn"
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} lg={6}>
          <Card className="shadow-sm bg-purple-50 border border-purple-200" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-purple-700">Chi tiêu tháng này</span>}
              value={stats.totalThisMonth}
              valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: '20px' }}
              prefix={<DollarOutlined />}
              formatter={value => formatCurrency(Number(value))}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card className="mb-6 shadow-sm" bodyStyle={{ padding: '16px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={6}>
            <RangePicker
              className="w-full"
              placeholder={['Từ ngày', 'Đến ngày']}
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
            />
          </Col>
          <Col xs={12} lg={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              className="w-full"
              value={statusFilter}
              onChange={setStatusFilter}
              options={Object.entries(PO_STATUS_CONFIG).map(([key, config]) => ({
                value: key,
                label: (
                  <span className="flex items-center gap-2">
                    {config.icon} {config.label}
                  </span>
                ),
              }))}
            />
          </Col>
          <Col xs={12} lg={5}>
            <Select
              placeholder="Nhà cung cấp"
              allowClear
              showSearch
              className="w-full"
              value={supplierFilter}
              onChange={setSupplierFilter}
              options={mockSuppliers}
              optionFilterProp="label"
            />
          </Col>
          <Col xs={12} lg={4}>
            <Select
              placeholder="Kho nhập"
              allowClear
              className="w-full"
              value={warehouseFilter}
              onChange={setWarehouseFilter}
              options={mockWarehouses}
            />
          </Col>
          <Col xs={12} lg={5}>
            <Input
              placeholder="Tìm mã đơn, NCC, người tạo..."
              prefix={<SearchOutlined className="text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
        {(searchText || statusFilter || supplierFilter || warehouseFilter || dateRange) && (
          <div className="mt-3 flex items-center gap-2">
            <Text type="secondary" className="text-sm">
              Đang lọc {filteredData.length}/{data.length} đơn hàng
            </Text>
            <Button type="link" size="small" onClick={handleClearFilters}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </Card>

      {/* Table */}
      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="purchaseOrderId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
          scroll={{ x: 1400 }}
          rowClassName={(record) => {
            const isOverdue = record.status !== 'DELIVERED' && record.status !== 'CANCELLED' &&
              dayjs(record.expectedDeliveryDate).isBefore(dayjs(), 'day');
            return isOverdue ? 'bg-red-50' : '';
          }}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <FaFileInvoice className="text-blue-600 text-xl" />
            <div>
              <div className="font-bold">Chi tiết đơn hàng</div>
              <div className="text-sm text-gray-500 font-normal">{selectedPO?.orderCode}</div>
            </div>
          </div>
        }
        placement="right"
        width={800}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        extra={
          selectedPO && (
            <Space>
              <Button icon={<PrinterOutlined />}>In đơn</Button>
              {selectedPO.status === 'PENDING' && (
                <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApprove(selectedPO)} className="bg-green-600">
                  Duyệt đơn
                </Button>
              )}
              {(selectedPO.status === 'CONFIRMED' || selectedPO.status === 'PARTIAL') && (
                <Button type="primary" icon={<InboxOutlined />} onClick={() => handleReceiving(selectedPO)} className="bg-blue-600">
                  Nhận hàng
                </Button>
              )}
            </Space>
          )
        }
      >
        {selectedPO && (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'detail',
                label: <span><FileDoneOutlined className="mr-1" />Thông tin</span>,
                children: (
                  <div className="space-y-6">
                    {/* Status Banner */}
                    <div className={`p-4 rounded-lg border ${PO_STATUS_CONFIG[selectedPO.status].bgColor} border-gray-200`}>
                      <div className="flex items-center justify-between">
                        <Tag color={PO_STATUS_CONFIG[selectedPO.status].color} icon={PO_STATUS_CONFIG[selectedPO.status].icon} className="text-base px-3 py-1">
                          {PO_STATUS_CONFIG[selectedPO.status].label}
                        </Tag>
                        {selectedPO.notes && (
                          <Text type="secondary" className="text-sm">{selectedPO.notes}</Text>
                        )}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <Descriptions column={2} bordered size="small">
                      <Descriptions.Item label="Mã đơn hàng"><Text strong>{selectedPO.orderCode}</Text></Descriptions.Item>
                      <Descriptions.Item label="Ngày tạo">{dayjs(selectedPO.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                      <Descriptions.Item label="Nhà cung cấp">
                        <div>
                          <div className="font-medium">{selectedPO.supplierName}</div>
                          <Tag className="mt-1">{selectedPO.supplierCode}</Tag>
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Liên hệ">
                        <div>
                          <div><UserOutlined className="mr-1" />{selectedPO.supplierContact || '---'}</div>
                          {selectedPO.supplierPhone && <div className="text-sm text-gray-500 mt-1">📞 {selectedPO.supplierPhone}</div>}
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Kho nhập">
                        <span><EnvironmentOutlined className="mr-1 text-green-500" />{selectedPO.warehouseName}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày giao dự kiến">
                        <span><CalendarOutlined className="mr-1" />{dayjs(selectedPO.expectedDeliveryDate).format('DD/MM/YYYY')}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Người tạo"><UserOutlined className="mr-1" />{selectedPO.createdByName}</Descriptions.Item>
                      <Descriptions.Item label="Cập nhật lúc">{dayjs(selectedPO.updatedAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                    </Descriptions>

                    {/* Items */}
                    <Divider>Danh sách sản phẩm ({selectedPO.items.length})</Divider>
                    <List
                      dataSource={selectedPO.items}
                      renderItem={(item) => {
                        const percent = Math.round((item.receivedQuantity / item.quantity) * 100);
                        return (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar shape="square" size={56} src={item.imageUrl} icon={<InboxOutlined />} className="bg-gray-100" />}
                              title={
                                <div className="flex items-center justify-between">
                                  <span>{item.componentName}</span>
                                  <span className="font-bold text-blue-600">{formatCurrency(item.totalPrice)}</span>
                                </div>
                              }
                              description={
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Tag>{item.sku}</Tag>
                                    {item.brand && <span className="text-gray-500">{item.brand}</span>}
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm">SL: <strong>{item.quantity}</strong></span>
                                    <span className="text-sm">Đã nhận: <strong className="text-green-600">{item.receivedQuantity}</strong></span>
                                    <span className="text-sm">Đơn giá: {formatCurrency(item.unitPrice)}</span>
                                    <Progress percent={percent} size="small" className="w-24" showInfo={false} />
                                  </div>
                                </div>
                              }
                            />
                          </List.Item>
                        );
                      }}
                    />

                    {/* Summary */}
                    <Card className="bg-gray-50">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <Text type="secondary">Tổng tiền hàng:</Text>
                          <Text>{formatCurrency(selectedPO.totalAmount)}</Text>
                        </div>
                        {selectedPO.discountAmount > 0 && (
                          <div className="flex justify-between text-sm">
                            <Text type="secondary">Chiết khấu:</Text>
                            <Text className="text-red-500">-{formatCurrency(selectedPO.discountAmount)}</Text>
                          </div>
                        )}
                        <Divider className="my-2" />
                        <div className="flex justify-between">
                          <Text strong className="text-lg">Thành tiền:</Text>
                          <Text strong className="text-lg text-blue-600">{formatCurrency(selectedPO.finalAmount)}</Text>
                        </div>
                        <div className="flex justify-between text-sm">
                          <Text type="secondary">Đã nhận:</Text>
                          <Text className="text-green-600">{formatCurrency(selectedPO.receivedAmount)}</Text>
                        </div>
                        <div className="flex justify-between text-sm">
                          <Text type="secondary">Còn lại:</Text>
                          <Text className="text-orange-500">{formatCurrency(selectedPO.finalAmount - selectedPO.receivedAmount)}</Text>
                        </div>
                      </div>
                    </Card>
                  </div>
                ),
              },
              {
                key: 'history',
                label: <span><HistoryOutlined className="mr-1" />Lịch sử</span>,
                children: (
                  <Timeline
                    items={getHistory(selectedPO).map((h, idx) => ({
                      color: idx === 0 ? 'green' : h.action === 'Hủy đơn' ? 'red' : 'blue',
                      children: (
                        <div>
                          <div className="font-medium">{h.action}</div>
                          <div className="text-sm text-gray-500">{h.description}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {dayjs(h.date).format('DD/MM/YYYY HH:mm')} - {h.user}
                          </div>
                        </div>
                      ),
                    }))}
                  />
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default PurchaseOrderList;