import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Tabs,
  Collapse,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  PrinterOutlined,
  FileExcelOutlined,
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
  InfoCircleOutlined,
  BarcodeOutlined,
  AppstoreOutlined,
  SyncOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { FaFileInvoice } from 'react-icons/fa';
import purchaseOrdersService from '../../services/purchaseOrders.service';
import suppliersService from '../../services/suppliers.service';
import warehousesService from '../../services/warehouses.service';
import type {
  PurchaseOrderListDto,
  PurchaseOrderDetailDto,
  PurchaseOrderStatus,
  PurchaseOrderStatisticsDto,
  ReceivedItemsResponseDto,
  PurchaseOrderHistoryDto,
} from '../../types/type.purchaseOrder';
import Barcode from 'react-barcode';

const { RangePicker } = DatePicker;
const { Text } = Typography;

// ============================================================================
// TYPES
// ============================================================================

// POHistory interface removed - using PurchaseOrderHistoryDto instead

interface SupplierOption {
  value: string;
  label: string;
  code?: string;
}

interface WarehouseOption {
  value: string;
  label: string;
  code?: string;
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const PO_STATUS_CONFIG: Record<PurchaseOrderStatus, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
  PENDING: { label: 'Chờ duyệt', color: 'warning', icon: <SyncOutlined spin />, bgColor: 'bg-yellow-50' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'processing', icon: <TruckOutlined />, bgColor: 'bg-blue-50' },
  PARTIAL: { label: 'Nhận một phần', color: 'cyan', icon: <BoxPlotOutlined />, bgColor: 'bg-cyan-50' },
  DELIVERED: { label: 'Đã nhận đủ', color: 'success', icon: <CheckCircleOutlined />, bgColor: 'bg-green-50' },
  CANCELLED: { label: 'Đã hủy', color: 'error', icon: <CloseCircleOutlined />, bgColor: 'bg-red-50' },
};
// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PurchaseOrderList: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [data, setData] = useState<PurchaseOrderListDto[]>([]);
  const [statistics, setStatistics] = useState<PurchaseOrderStatisticsDto | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseOption[]>([]);

  // Filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | undefined>();
  const [supplierFilter, setSupplierFilter] = useState<string | undefined>();
  const [warehouseFilter, setWarehouseFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  //Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Drawer/Modal states
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrderDetailDto | null>(null);
  const [activeTab, setActiveTab] = useState('detail');
  const [receivedItemsData, setReceivedItemsData] = useState<ReceivedItemsResponseDto | null>(null);
  const [receivedItemsLoading, setReceivedItemsLoading] = useState(false);
  const [historyData, setHistoryData] = useState<PurchaseOrderHistoryDto[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Fetch purchase orders
  const fetchPurchaseOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await purchaseOrdersService.getPurchaseOrders({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText || undefined,
        supplierId: supplierFilter,
        warehouseId: warehouseFilter,
        status: statusFilter,
        fromDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        toDate: dateRange?.[1]?.format('YYYY-MM-DD'),
      });

      if (response.success) {
        setData(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.totalItems || 0,
        }));
      } else {
        message.error(response.message || 'Lỗi khi tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, supplierFilter, warehouseFilter, statusFilter, dateRange]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await purchaseOrdersService.getPurchaseOrderStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  // Load statistics on mount
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  // Fetch received items when tab changes to 'received'
  const fetchReceivedItems = useCallback(async (poId: string) => {
    setReceivedItemsLoading(true);
    try {
      const response = await purchaseOrdersService.getReceivedItems(poId);
      if (response.success && response.data) {
        setReceivedItemsData(response.data);
      } else {
        message.error(response.message || 'Không thể tải danh sách hàng đã nhận');
      }
    } catch (error) {
      console.error('Error fetching received items:', error);
      message.error('Lỗi khi tải danh sách hàng đã nhận');
    } finally {
      setReceivedItemsLoading(false);
    }
  }, []);

  // Auto-fetch received items when switching to 'received' tab
  useEffect(() => {
    if (activeTab === 'received' && selectedPO && !receivedItemsData) {
      fetchReceivedItems(selectedPO.purchaseOrderID);
    }
  }, [activeTab, selectedPO, receivedItemsData, fetchReceivedItems]);

  // Fetch history when tab changes to 'history'
  const fetchHistory = useCallback(async (poId: string) => {
    setHistoryLoading(true);
    try {
      const response = await purchaseOrdersService.getPurchaseOrderHistory(poId);
      if (response.success && response.data) {
        setHistoryData(response.data);
      } else {
        message.error(response.message || 'Không thể tải lịch sử đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      message.error('Lỗi khi tải lịch sử đơn hàng');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Auto-fetch history when switching to 'history' tab
  useEffect(() => {
    if (activeTab === 'history' && selectedPO && historyData.length === 0) {
      fetchHistory(selectedPO.purchaseOrderID);
    }
  }, [activeTab, selectedPO, historyData, fetchHistory]);

  // Load suppliers and warehouses for dropdown filters  
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // Fetch suppliers for dropdown
        const suppliersResp = await suppliersService.getSuppliersForSelect();
        if (suppliersResp.success && suppliersResp.data) {
          setSuppliers(suppliersResp.data.map(s => ({
            value: s.supplierID,
            label: s.supplierName,
            code: s.supplierCode,
          })));
        }
      } catch (error) {
        console.error('Error loading suppliers:', error);
      }

      try {
        // Fetch warehouses for dropdown
        const warehousesResp = await warehousesService.getAllWarehouses(false); // only active
        if (warehousesResp.success && warehousesResp.data) {
          setWarehouses(warehousesResp.data.map(w => ({
            value: w.warehouseID,
            label: w.warehouseName,
          })));
        }
      } catch (error) {
        console.error('Error loading warehouses:', error);
      }
    };

    fetchDropdownData();
  }, []);

  // Computed: Statistics from API
  const stats = useMemo(() => {
    if (statistics) {
      return {
        pending: statistics.pendingOrders,
        confirmed: statistics.confirmedOrders,
        delivered: statistics.deliveredOrders,
        cancelled: statistics.cancelledOrders,
        total: statistics.totalOrders,
        totalThisMonth: statistics.totalAmountThisMonth,
        totalThisYear: statistics.totalAmountThisYear,
        ordersThisMonth: statistics.ordersThisMonth,
        needReceive: statistics.confirmedOrders, // CONFIRMED orders need receiving
      };
    }

    // Default values when API not loaded yet
    return {
      pending: 0,
      confirmed: 0,
      delivered: 0,
      cancelled: 0,
      total: 0,
      totalThisMonth: 0,
      totalThisYear: 0,
      ordersThisMonth: 0,
      needReceive: 0,
    };
  }, [statistics]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '---';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép!');
  };

  // View detail - fetch full detail from API
  const handleViewDetail = async (record: PurchaseOrderListDto) => {
    try {
      const response = await purchaseOrdersService.getPurchaseOrderById(record.purchaseOrderID);
      if (response.success && response.data) {
        setSelectedPO(response.data);
        setReceivedItemsData(null); // Reset when opening a new PO
        setHistoryData([]); // Reset history data
        setActiveTab('detail');
        setDetailDrawerOpen(true);
      } else {
        message.error('Không thể tải chi tiết đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching PO detail:', error);
      message.error('Lỗi khi tải chi tiết đơn hàng');
    }
  };

  // Approve purchase order
  const handleApprove = async (record: PurchaseOrderListDto | PurchaseOrderDetailDto) => {
    Modal.confirm({
      title: 'Duyệt đơn hàng',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: (
        <div>
          <p>Bạn có chắc muốn duyệt  đơn hàng <strong>{record.orderCode}</strong>?</p>
          <p className="text-gray-500">Sau khi duyệt, đơn hàng sẽ chuyển sang trạng thái "Đã xác nhận" và có thể nhận hàng.</p>
        </div>
      ),
      okText: 'Duyệt đơn',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const response = await purchaseOrdersService.confirmPurchaseOrder(record.purchaseOrderID);
          if (response.success) {
            message.success(`Đã duyệt đơn hàng ${record.orderCode}`);
            fetchPurchaseOrders();
            fetchStatistics();
          } else {
            message.error(response.message || 'Không thể duyệt đơn hàng');
          }
        } catch (error) {
          console.error('Error confirming PO:', error);
          message.error('Lỗi khi duyệt đơn hàng');
        }
      },
    });
  };

  // Cancel purchase order
  const handleCancel = async (record: PurchaseOrderListDto | PurchaseOrderDetailDto) => {
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
      onOk: async () => {
        try {
          const response = await purchaseOrdersService.cancelPurchaseOrder(record.purchaseOrderID, 'Hủy đơn bởi người dùng');
          if (response.success) {
            message.success(`Đã hủy đơn hàng ${record.orderCode}`);
            fetchPurchaseOrders();
            fetchStatistics();
          } else {
            message.error(response.message || 'Không thể hủy đơn hàng');
          }
        } catch (error) {
          console.error('Error cancelling PO:', error);
          message.error('Lỗi khi hủy đơn hàng');
        }
      },
    });
  };

  // Navigate to receiving page
  const handleReceiving = (record: PurchaseOrderListDto | PurchaseOrderDetailDto) => {
    navigate(`/admin/purchasing/receiving?po=${record.purchaseOrderID}`);
  };

  // Delete purchase order
  const handleDelete = async (id: string, orderCode: string) => {
    try {
      const response = await purchaseOrdersService.deletePurchaseOrder(id);
      if (response.success) {
        message.success(`Đã xóa đơn hàng ${orderCode}`);
        fetchPurchaseOrders();
        fetchStatistics();
      } else {
        message.error(response.message || 'Không thể xóa đơn hàng');
      }
    } catch (error) {
      console.error('Error deleting PO:', error);
      message.error('Lỗi khi xóa đơn hàng');
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchPurchaseOrders();
    fetchStatistics();
    message.success('Đã làm mới dữ liệu');
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchText('');
    setStatusFilter(undefined);
    setSupplierFilter(undefined);
    setWarehouseFilter(undefined);
    setDateRange(null);
    setPagination(prev => ({ ...prev, current: 1 }));
    message.info('Đã xóa bộ lọc');
  };

  // Handle pagination change
  const handleTableChange = (paginationConfig: any) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  // Action Menu
  const getActionMenuItems = (record: PurchaseOrderListDto): MenuProps['items'] => {
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
          onClick: () => navigate(`/admin/purchasing/edit/${record.purchaseOrderID}`),
        },
        { type: 'divider' },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Xóa đơn',
          danger: true,
          onClick: () => {
            Modal.confirm({
              title: 'Xóa đơn hàng',
              content: `Bạn có chắc muốn xóa đơn hàng ${record.orderCode}?`,
              okText: 'Xóa',
              okButtonProps: { danger: true },
              cancelText: 'Hủy',
              onOk: () => handleDelete(record.purchaseOrderID, record.orderCode),
            });
          },
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

  // ============================================================================
  // TABLE COLUMNS
  // ============================================================================

  const columns: ColumnsType<PurchaseOrderListDto> = [
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
          <div className="font-medium text-gray-700">{record.supplierName}</div>
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
          <div className="font-medium">{record.warehouseName}</div>
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
        const percent = record.totalQuantity > 0
          ? Math.round((record.receivedQuantity / record.totalQuantity) * 100)
          : 0;

        return (
          <Tooltip title={`${record.receivedQuantity}/${record.totalQuantity} sản phẩm đã nhận`}>
            <Progress
              percent={percent}
              size="small"
              status={percent === 100 ? 'success' : 'active'}
              strokeColor={{
                '0%': '#1890ff',
                '100%': '#52c41a',
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              {record.receivedQuantity}/{record.totalQuantity} sản phẩm
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
      render: (status: PurchaseOrderStatus) => {
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

  // Helper function to get timeline color based on action
  const getTimelineColor = (action: string, index: number): string => {
    if (index === 0) return 'green'; // First action (created) is green
    if (action === 'CANCELLED') return 'red';
    if (action === 'FULLY_RECEIVED' || action === 'COMPLETED') return 'green';
    if (action === 'CONFIRMED') return 'blue';
    if (action === 'PARTIAL_RECEIVED') return 'cyan';
    return 'blue';
  };

  // Helper function to get action label in Vietnamese
  const getActionLabel = (action: string): string => {
    const labels: Record<string, string> = {
      'CREATED': 'Tạo đơn',
      'CONFIRMED': 'Duyệt đơn',
      'RECEIVING_STARTED': 'Bắt đầu nhận hàng',
      'PARTIAL_RECEIVED': 'Nhận một phần',
      'FULLY_RECEIVED': 'Nhận đủ hàng',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Hủy đơn',
      'UPDATED': 'Cập nhật',
      'PRINTED': 'In đơn hàng',
      'EMAIL_SENT': 'Gửi email',
    };
    return labels[action] || action;
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
              valueStyle={{ color: '#faad14', fontWeight: 'bold', fontSize: '20px' }}
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
              valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: '20px' }}
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
              valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: '20px' }}
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
              options={suppliers}
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
              options={warehouses}
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
              Bộ lọc đang áp dụng
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
          dataSource={data}
          rowKey="purchaseOrderID"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
          rowClassName={(record) => {
            const isOverdue = record.status !== 'DELIVERED' && record.status !== 'CANCELLED' &&
              record.expectedDeliveryDate && dayjs(record.expectedDeliveryDate).isBefore(dayjs(), 'day');
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

              {/* PENDING: Hiển thị Duyệt và Hủy */}
              {selectedPO.status === 'PENDING' && (
                <>
                  <Button
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleCancel(selectedPO)}
                  >
                    Hủy đơn
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleApprove(selectedPO)}
                    className="bg-green-600"
                  >
                    Duyệt đơn
                  </Button>
                </>
              )}

              {/* CONFIRMED hoặc PARTIAL: Hiển thị Nhận hàng */}
              {(selectedPO.status === 'CONFIRMED' || selectedPO.status === 'PARTIAL') && (
                <Button
                  type="primary"
                  icon={<InboxOutlined />}
                  onClick={() => handleReceiving(selectedPO)}
                  className="bg-blue-600"
                >
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
                    <div className={`p-5 rounded-xl border ${PO_STATUS_CONFIG[selectedPO.status].bgColor} border-gray-200 transition-all`}>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

                        {/* Phần thông tin bên trái */}
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-medium text-sm uppercase tracking-wider">Trạng thái:</span>
                            <Tag
                              color={PO_STATUS_CONFIG[selectedPO.status].color}
                              icon={PO_STATUS_CONFIG[selectedPO.status].icon}
                              className="text-base px-3 py-1 m-0 rounded-md font-semibold border-0"
                            >
                              {PO_STATUS_CONFIG[selectedPO.status].label}
                            </Tag>
                          </div>

                          {/* Hiển thị notes nếu có */}
                          {selectedPO.notes ? (
                            <div className="flex items-start gap-2 text-gray-600 bg-white/60 p-2 rounded-lg mt-1">
                              <InfoCircleOutlined className="mt-1 text-blue-400" />
                              <Text className="text-sm italic">{selectedPO.notes}</Text>
                            </div>
                          ) : (
                            <Text type="secondary" className="text-xs text-gray-400 pl-1">Không có ghi chú bổ sung</Text>
                          )}
                        </div>

                        {/* Phần Barcode bên phải */}
                        {selectedPO.orderCode && (
                          <div className="flex flex-col items-center gap-1 bg-white p-3 rounded-lg shadow-sm border border-gray-100 min-w-[180px]">
                            <Barcode
                              value={selectedPO.orderCode}
                              format="CODE128"
                              height={35}
                              width={1.2} // Giảm width để barcode gọn hơn
                              fontSize={11}
                              margin={0}
                              displayValue={true} // Hiển thị mã số dưới vạch
                              background="transparent"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <Descriptions column={2} bordered size="small">
                      <Descriptions.Item label="Mã đơn hàng"><Text strong>{selectedPO.orderCode}</Text></Descriptions.Item>
                      <Descriptions.Item label="Ngày tạo">{dayjs(selectedPO.createdAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                      <Descriptions.Item label="Nhà cung cấp">
                        <div>
                          <div className="font-medium text-blue-600">{selectedPO.supplierName}</div>
                          <Tag className="mt-1">{selectedPO.supplierCode}</Tag>
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Liên hệ">
                        <div>
                          {selectedPO.supplierPhone && <div className="text-sm">{selectedPO.supplierPhone}</div>}
                          {selectedPO.supplierEmail && <div className="text-sm mt-1">{selectedPO.supplierEmail}</div>}
                          {!selectedPO.supplierPhone && !selectedPO.supplierEmail && <span>---</span>}
                        </div>
                      </Descriptions.Item>
                      <Descriptions.Item label="Kho nhập">
                        <span><EnvironmentOutlined className="mr-1 text-green-500" />{selectedPO.warehouseName}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Ngày giao dự kiến">
                        <span>{dayjs(selectedPO.expectedDeliveryDate).format('DD/MM/YYYY')}</span>
                      </Descriptions.Item>
                      <Descriptions.Item label="Người tạo"><UserOutlined className="mr-1" />{selectedPO.createdByName}</Descriptions.Item>
                      <Descriptions.Item label="Cập nhật lúc">{dayjs(selectedPO.updatedAt).format('DD/MM/YYYY HH:mm')}</Descriptions.Item>
                    </Descriptions>

                    {/* Items */}
                    <Divider>Danh sách sản phẩm ({selectedPO.items.length})</Divider>
                    <List
                      dataSource={selectedPO.items}
                      renderItem={(item) => {
                        const percent = item.quantity > 0 ? Math.round((item.receivedQuantity / item.quantity) * 100) : 0;
                        return (
                          <List.Item>
                            <List.Item.Meta
                              avatar={<Avatar shape="square" size={56} src={item.imageURL} icon={<InboxOutlined />} className="bg-gray-100" />}
                              title={
                                <div className="flex items-center justify-between">
                                  <span>{item.componentName}</span>
                                  <span className="font-bold text-blue-600">{formatCurrency(item.totalPrice)}</span>
                                </div>
                              }
                              description={
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Tag>{item.componentSKU}</Tag>
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
                        {(() => {
                          // Calculate received amount from items
                          const receivedAmount = selectedPO.items?.reduce((sum, item) => {
                            const receivedValue = (item.receivedQuantity || 0) * (item.unitPrice || 0);
                            return sum + receivedValue;
                          }, 0) || 0;
                          const remaining = selectedPO.finalAmount - receivedAmount;

                          return (
                            <>
                              <div className="flex justify-between text-sm">
                                <Text type="secondary">Đã nhận:</Text>
                                <Text className="text-green-600">{formatCurrency(receivedAmount)}</Text>
                              </div>
                              <div className="flex justify-between text-sm">
                                <Text type="secondary">Còn lại:</Text>
                                <Text className="text-orange-500">{formatCurrency(remaining)}</Text>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </Card>
                  </div>
                ),
              },
              {
                key: 'received',
                label: (
                  <span>
                    <CheckCircleOutlined className="mr-1" />
                    Hàng đã nhập
                    <Badge
                      count={selectedPO.items?.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0) || 0}
                      className="ml-2"
                      showZero={false}
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    {/* Loading state */}
                    {receivedItemsLoading && (
                      <div className="flex justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          <Text type="secondary">Đang tải dữ liệu...</Text>
                        </div>
                      </div>
                    )}

                    {/* Content when loaded */}
                    {!receivedItemsLoading && receivedItemsData && (
                      <>
                        {/* Header thống kê */}
                        <div className="grid grid-cols-3 gap-4">
                          <Card size="small" className="text-center">
                            <Statistic
                              title="Tổng sản phẩm đã nhập"
                              value={receivedItemsData.totalReceivedQuantity}
                              prefix={<InboxOutlined />}
                              valueStyle={{ color: '#3f8600', fontSize: '20px' }}
                            />
                          </Card>
                          <Card size="small" className="text-center">
                            <Statistic
                              title="Serial đã nhập"
                              value={receivedItemsData.totalSerializedItems}
                              prefix={<BarcodeOutlined />}
                              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                            />
                          </Card>
                          <Card size="small" className="text-center">
                            <Statistic
                              title="Số lượng (không serial)"
                              value={receivedItemsData.totalNonSerializedItems}
                              prefix={<AppstoreOutlined />}
                              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                            />
                          </Card>
                        </div>

                        {/* Danh sách sản phẩm đã nhập */}
                        {(() => {
                          const serializedItems = receivedItemsData.items.filter(item => item.isSerialized);
                          const nonSerializedItems = receivedItemsData.items.filter(item => !item.isSerialized);

                          return (
                            <>
                              {/* Sản phẩm quản lý theo Serial */}
                              {serializedItems.length > 0 && (
                                <div className="mb-4">
                                  <Divider className="my-2!">
                                    <span className="flex items-center gap-2 text-sm text-blue-600">
                                      <BarcodeOutlined />
                                      Sản phẩm quản lý theo Serial ({serializedItems.length})
                                    </span>
                                  </Divider>
                                  <Collapse
                                    accordion
                                    items={serializedItems.map(item => ({
                                      key: item.purchaseOrderDetailID,
                                      label: (
                                        <div className="flex items-center justify-between w-full pr-4">
                                          <div className="flex items-center gap-3">
                                            <Avatar
                                              shape="square"
                                              size={40}
                                              src={item.imageURL}
                                              icon={<InboxOutlined />}
                                              className="bg-gray-100"
                                            />
                                            <div>
                                              <div className="font-medium">{item.componentName}</div>
                                              <div className="text-xs text-gray-500">
                                                <Tag color="blue">{item.componentSKU}</Tag>
                                                <Tag color="purple" className="ml-1">Serial</Tag>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <div className="text-right">
                                              <div className="text-sm text-gray-500">Đã nhập</div>
                                              <div className="font-bold text-green-600">{item.instances.length} serial</div>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-sm text-gray-500">Giá trị</div>
                                              <div className="font-bold text-blue-600">
                                                {formatCurrency(item.instances.length * item.unitPrice)}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                      children: (
                                        <div className="pl-4">
                                          <Alert
                                            message="Danh sách Serial đã nhập kho"
                                            description={
                                              <div className="mt-3">
                                                <Text type="secondary" className="text-sm mb-2 block">
                                                  Các serial number/IMEI đã được nhập vào kho cho sản phẩm này
                                                </Text>
                                                <List
                                                  size="small"
                                                  bordered
                                                  dataSource={item.instances}
                                                  renderItem={(instance, idx) => (
                                                    <List.Item className="hover:bg-blue-50 transition-colors">
                                                      <div className="flex items-center justify-between w-full">
                                                        <div className="flex items-center gap-3">
                                                          <Avatar size="small" className="bg-blue-500">
                                                            {idx + 1}
                                                          </Avatar>
                                                          <div>
                                                            <div className="flex items-center gap-2">
                                                              <BarcodeOutlined className="text-blue-500" />
                                                              <Text strong className="font-mono">
                                                                {instance.serialNumber}
                                                              </Text>
                                                              <Tag color="green">{instance.status}</Tag>
                                                            </div>
                                                            {(instance.imei1 || instance.imei2) && (
                                                              <div className="text-xs text-gray-500 mt-1">
                                                                {instance.imei1 && <span className="mr-2">IMEI1: <span className="font-mono">{instance.imei1}</span></span>}
                                                                {instance.imei2 && <span>IMEI2: <span className="font-mono">{instance.imei2}</span></span>}
                                                              </div>
                                                            )}
                                                            {instance.macAddress && (
                                                              <div className="text-xs text-gray-500">
                                                                MAC: <span className="font-mono">{instance.macAddress}</span>
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                        <div className="text-right">
                                                          <div className="text-xs text-gray-500">
                                                            <EnvironmentOutlined className="mr-1" />
                                                            {instance.locationCode || receivedItemsData.warehouseName}
                                                          </div>
                                                          <div className="text-xs text-gray-400 mt-1">
                                                            <ClockCircleOutlined className="mr-1" />
                                                            {dayjs(instance.importDate).format('DD/MM/YYYY HH:mm')}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </List.Item>
                                                  )}
                                                />
                                              </div>
                                            }
                                            type="info"
                                            showIcon
                                            icon={<BarcodeOutlined />}
                                          />
                                        </div>
                                      ),
                                    }))}
                                  />
                                </div>
                              )}

                              {/* Sản phẩm quản lý theo Số lượng */}
                              {nonSerializedItems.length > 0 && (
                                <div className="mb-4">
                                  <Divider className="!my-2">
                                    <span className="flex items-center gap-2 text-sm text-green-600">
                                      <AppstoreOutlined />
                                      Sản phẩm quản lý theo Số lượng ({nonSerializedItems.length})
                                    </span>
                                  </Divider>
                                  <List
                                    bordered
                                    dataSource={nonSerializedItems}
                                    renderItem={(item) => (
                                      <List.Item className="hover:bg-green-50 transition-colors">
                                        <div className="flex items-center justify-between w-full">
                                          <div className="flex items-center gap-3">
                                            <Avatar
                                              shape="square"
                                              size={48}
                                              src={item.imageURL}
                                              icon={<InboxOutlined />}
                                              className="bg-gray-100"
                                            />
                                            <div>
                                              <div className="font-medium text-gray-800">{item.componentName}</div>
                                              <div className="text-xs text-gray-500 mt-1">
                                                <Tag color="green">{item.componentSKU}</Tag>
                                                <Tag color="orange" className="ml-1">Số lượng</Tag>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-6">
                                            <div className="text-center">
                                              <div className="text-xs text-gray-500 mb-1">Đã nhập</div>
                                              <div className="flex items-center gap-1">
                                                <span className="text-2xl font-bold text-green-600">{item.receivedQuantity}</span>
                                                <span className="text-gray-500">/ {item.orderedQuantity}</span>
                                              </div>
                                            </div>
                                            <div className="text-right min-w-[120px]">
                                              <div className="text-xs text-gray-500 mb-1">Giá trị</div>
                                              <div className="font-bold text-blue-600 text-lg">
                                                {formatCurrency(item.receivedQuantity * item.unitPrice)}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </List.Item>
                                    )}
                                  />
                                </div>
                              )}

                              {receivedItemsData.items.length === 0 && (
                                <Empty
                                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                                  description="Chưa có sản phẩm nào được nhập vào kho"
                                />
                              )}
                            </>
                          );
                        })()}
                      </>
                    )}

                    {/* No data yet - prompt to load */}
                    {!receivedItemsLoading && !receivedItemsData && (
                      <div className="text-center py-8">
                        <Button
                          type="primary"
                          icon={<ReloadOutlined />}
                          onClick={() => selectedPO && fetchReceivedItems(selectedPO.purchaseOrderID)}
                        >
                          Tải danh sách hàng đã nhận
                        </Button>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'history',
                label: (
                  <span>
                    <HistoryOutlined className="mr-1" />
                    Lịch sử
                  </span>
                ),
                children: (
                  <div className="h-full flex flex-col">
                    {historyLoading ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <SyncOutlined spin className="text-3xl text-blue-500 mb-3" />
                        <Text type="secondary">Đang tải dữ liệu lịch sử...</Text>
                      </div>
                    ) : historyData.length === 0 ? (
                      <div className="py-8">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lịch sử hoạt động" />
                      </div>
                    ) : (
                      // Thêm max-height và overflow để tạo vùng cuộn nếu danh sách dài
                      <div className="max-h-[500px] overflow-y-auto px-4 py-2 custom-scrollbar">
                        <Timeline
                          mode="left"
                          items={historyData.map((h, idx) => ({
                            color: getTimelineColor(h.action, idx),
                            // Tùy chọn: Thêm dot icon nếu muốn custom icon cho từng loại action
                            // dot: getActionIcon(h.action), 
                            children: (
                              <div className="pb-4 group">
                                {/* Header: Action & Time */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-1">
                                  <Text strong className="text-base text-gray-800">
                                    {getActionLabel(h.action)}
                                  </Text>
                                  <div className="text-xs text-gray-400 flex items-center gap-1 mt-1 sm:mt-0">
                                    <ClockCircleOutlined />
                                    {dayjs(h.performedAt).format('DD/MM/YYYY HH:mm')}
                                  </div>
                                </div>

                                {/* Description */}
                                {h.description && (
                                  <div className="text-gray-600 mb-2 leading-relaxed">
                                    {h.description}
                                  </div>
                                )}

                                {/* User Info & Metadata Control */}
                                <div className="flex items-center flex-wrap gap-2 mt-2">
                                  {h.performedByUserName && (
                                    <Tag icon={<UserOutlined />} color="default" className="m-0 text-xs border-transparent bg-gray-100 text-gray-500">
                                      {h.performedByUserName}
                                    </Tag>
                                  )}

                                  {/* Metadata hiển thị gọn gàng hơn */}
                                  {h.metadata && (
                                    <Collapse
                                      ghost
                                      size="small"
                                      className="w-full mt-1 [&_.ant-collapse-header]:p-0 [&_.ant-collapse-content-box]:p-0"
                                      items={[
                                        {
                                          key: 'meta',
                                          label: (
                                            <span className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                              <CodeOutlined /> Chi tiết kỹ thuật
                                            </span>
                                          ),
                                          children: (
                                            <div className="mt-2 bg-gray-50 p-2 rounded border border-gray-200 text-xs font-mono text-gray-600 break-all">
                                              {h.metadata}
                                            </div>
                                          ),
                                        },
                                      ]}
                                    />
                                  )}
                                </div>
                              </div>
                            ),
                          }))}
                        />
                      </div>
                    )}
                  </div>
                ),
              }
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default PurchaseOrderList;