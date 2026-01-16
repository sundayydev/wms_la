import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Tooltip,
  Typography,
  Row,
  Col,
  message,
  Drawer,
  Divider,
  Avatar,
  List,
  Progress,
  Empty,
  Modal,
  Form,
  InputNumber,
  Alert,
  Popconfirm,
  Spin,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  InboxOutlined,
  BarcodeOutlined,
  ScanOutlined,
  PlusOutlined,
  DeleteOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  ReloadOutlined,
  HistoryOutlined,
  FileDoneOutlined,
  MobileOutlined,
  WifiOutlined,
  EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { InputRef } from 'antd';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { FaBoxOpen, FaClipboardCheck } from 'react-icons/fa';
import purchaseOrdersService from '@/services/purchaseOrders.service';
import inventoryService from '@/services/inventory.service';
import type {
  PurchaseOrderListDto,
  PurchaseOrderDetailDto,
  ReceiveItemDto,
  POStatus,
  DeviceType,
  POItem,
  PurchaseOrder,
  ReceivedItem,
} from '@/types/type.purchaseOrder';
import { PO_STATUS_CONFIG, DEVICE_TYPE_CONFIG } from '@/constants';
import { formatCurrency, validateSerial, validateIMEI } from '@/utils';

const { Text } = Typography;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Map API data to local format
const mapPODetailToPO = (detail: PurchaseOrderDetailDto): PurchaseOrder => {
  return {
    purchaseOrderId: detail.purchaseOrderID,
    orderCode: detail.orderCode,
    supplierName: detail.supplierName,
    supplierCode: detail.supplierCode || '',
    warehouseId: detail.warehouseID,
    warehouseName: detail.warehouseName,
    orderDate: detail.orderDate,
    expectedDeliveryDate: detail.expectedDeliveryDate || '',
    status: detail.status,
    items: detail.items.map(item => ({
      itemId: item.purchaseOrderDetailID,
      componentId: item.componentID,
      sku: item.componentSKU,
      componentName: item.componentName,
      brand: '',
      orderedQuantity: item.quantity,
      receivedQuantity: item.receivedQuantity,
      unitPrice: item.unitPrice,
      isSerialized: item.isSerialized,
      deviceType: 'OTHER' as DeviceType,
      hasIMEI: item.isSerialized,
      hasMacAddress: item.isSerialized,
      hasPartNumber: false,
      imageUrl: item.imageURL,
    })),
    totalAmount: detail.totalAmount,
    receivedAmount: detail.items.reduce((sum, item) =>
      sum + (item.receivedQuantity * item.unitPrice), 0
    ),
    createdByName: detail.createdByName || '',
    notes: detail.notes,
  };
};


// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Receiving: React.FC = () => {
  const [searchParams] = useSearchParams();
  const serialInputRef = useRef<InputRef>(null);
  const [form] = Form.useForm();

  // States
  const [loading, setLoading] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderListDto[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<POStatus | 'ALL'>('ALL');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | 'ALL'>('ALL');
  const [submitting, setSubmitting] = useState(false);

  // Drawer states
  const [receivingDrawerOpen, setReceivingDrawerOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [selectedItem, setSelectedItem] = useState<POItem | null>(null);

  // Receiving states
  const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
  const [quantityInput, setQuantityInput] = useState<number>(1);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [checkingSerial, setCheckingSerial] = useState(false);

  // Computed: Filtered data
  const filteredData = useMemo(() => {
    console.log('purchaseOrders in filter:', purchaseOrders);
    console.log('Is array?', Array.isArray(purchaseOrders));

    if (!Array.isArray(purchaseOrders)) return [];

    const filtered = purchaseOrders.filter(po => {
      const matchSearch = !searchText ||
        po.orderCode.toLowerCase().includes(searchText.toLowerCase()) ||
        po.supplierName.toLowerCase().includes(searchText.toLowerCase());

      const matchStatus = selectedStatus === 'ALL' || po.status === selectedStatus;
      const matchWarehouse = selectedWarehouse === 'ALL' || po.warehouseID === selectedWarehouse;

      // Only show POs that can receive goods
      const canReceive = po.status === 'CONFIRMED' || po.status === 'PARTIAL';

      return matchSearch && matchStatus && matchWarehouse && (selectedStatus !== 'ALL' || canReceive || po.status === 'DELIVERED');
    });

    console.log('Filtered data:', filtered);
    console.log('Filtered count:', filtered.length);

    return filtered;
  }, [purchaseOrders, searchText, selectedStatus, selectedWarehouse]);

  // Focus serial input
  useEffect(() => {
    if (receivingDrawerOpen && selectedItem?.isSerialized && serialInputRef.current) {
      setTimeout(() => serialInputRef.current?.focus(), 100);
    }
  }, [receivingDrawerOpen, selectedItem]);

  // Reset form when item changes
  useEffect(() => {
    if (selectedItem) {
      form.resetFields();
    }
  }, [selectedItem, form]);

  // Fetch Purchase Orders
  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  // Check URL params for po parameter
  useEffect(() => {
    const poParam = searchParams.get('po');
    if (poParam) {
      openReceivingByID(poParam);
    }
  }, [searchParams]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrdersService.getPurchaseOrders({});

      if (response.success && response.data) {
        setPurchaseOrders(response.data || []);
      } else {
        setPurchaseOrders([]);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      message.error('Không thể tải danh sách đơn hàng');
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const openReceivingByID = async (poId: string) => {
    try {
      setLoading(true);
      const response = await purchaseOrdersService.getPurchaseOrderById(poId);
      if (response.success && response.data) {
        const mappedPO = mapPODetailToPO(response.data);
        setSelectedPO(mappedPO);
        setSelectedItem(null);
        setReceivedItems([]);
        setReceivingDrawerOpen(true);
      } else {
        message.error('Không thể tải thông tin đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching PO:', error);
      message.error('Lỗi khi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReceiving = async (po: PurchaseOrderListDto) => {
    await openReceivingByID(po.purchaseOrderID);
  };

  const handleSelectItem = (item: POItem) => {
    setSelectedItem(item);
    setReceivedItems([]);
    form.resetFields();
    setQuantityInput(1);
    setIsEditing(null);
  };

  const handleAddInstance = async () => {
    if (!selectedItem) return;

    try {
      const values = await form.validateFields();
      const serial = values.serialNumber?.trim();
      if (!serial) {
        message.error('Vui lòng nhập Serial Number');
        return;
      }

      const remainingQty = selectedItem.orderedQuantity - selectedItem.receivedQuantity - receivedItems.filter(r => r.status === 'valid').length;
      if (remainingQty <= 0) {
        message.warning('Đã nhận đủ số lượng cho sản phẩm này');
        return;
      }

      // Validate Serial with API check
      setCheckingSerial(true);
      const serialValidation = await validateSerial(serial, receivedItems, inventoryService.checkSerialExists);
      setCheckingSerial(false);

      if (!serialValidation.valid) {
        message.error(serialValidation.error);
        return;
      }

      // Validate IMEI1
      if (values.imei1) {
        const imei1Validation = validateIMEI(values.imei1, receivedItems);
        if (!imei1Validation.valid) {
          message.error(`IMEI1: ${imei1Validation.error}`);
          return;
        }
      }

      // Validate IMEI2
      if (values.imei2) {
        const imei2Validation = validateIMEI(values.imei2, receivedItems);
        if (!imei2Validation.valid) {
          message.error(`IMEI2: ${imei2Validation.error}`);
          return;
        }
      }

      // Check IMEI1 !== IMEI2
      if (values.imei1 && values.imei2 && values.imei1 === values.imei2) {
        message.error('IMEI1 và IMEI2 không được trùng nhau');
        return;
      }

      const newItem: ReceivedItem = {
        key: `${Date.now()}-${Math.random()}`,
        poItemId: selectedItem.itemId,
        sku: selectedItem.sku,
        componentName: selectedItem.componentName,
        serialNumber: serial,
        partNumber: values.partNumber?.trim() || undefined,
        imei1: values.imei1?.trim() || undefined,
        imei2: values.imei2?.trim() || undefined,
        macAddress: values.macAddress?.trim() || undefined,
        quantity: 1,
        status: 'valid',
        notes: values.notes?.trim() || undefined,
      };

      setReceivedItems(prev => [newItem, ...prev]);
      // Reset form fields
      form.setFieldsValue({
        serialNumber: '',
        imei1: '',
        imei2: '',
        macAddress: '',
        notes: '',
      });
      message.success(`Đã thêm: ${serial}`);
      serialInputRef.current?.focus();
    } catch (error) {
      // Validation failed
      setCheckingSerial(false);
    }
  };

  const handleAddQuantity = () => {
    if (!selectedItem) return;

    const remainingQty = selectedItem.orderedQuantity - selectedItem.receivedQuantity;
    if (quantityInput > remainingQty) {
      message.warning(`Số lượng tối đa có thể nhận: ${remainingQty}`);
      return;
    }

    const newItem: ReceivedItem = {
      key: `${Date.now()}-${Math.random()}`,
      poItemId: selectedItem.itemId,
      sku: selectedItem.sku,
      componentName: selectedItem.componentName,
      quantity: quantityInput,
      status: 'valid',
    };

    setReceivedItems(prev => [newItem, ...prev]);
    setQuantityInput(1);
    message.success(`Đã thêm ${quantityInput} ${selectedItem.sku}`);
  };

  const handleRemoveItem = (key: string) => {
    setReceivedItems(prev => prev.filter(item => item.key !== key));
  };

  const handleEditItem = (record: ReceivedItem) => {
    setIsEditing(record.key);
    form.setFieldsValue({
      serialNumber: record.serialNumber,
      partNumber: record.partNumber,
      imei1: record.imei1,
      imei2: record.imei2,
      macAddress: record.macAddress,
      notes: record.notes,
    });
  };

  const handleSaveEdit = (key: string) => {
    form.validateFields().then(values => {
      setReceivedItems(prev => prev.map(item => {
        if (item.key === key) {
          return {
            ...item,
            serialNumber: values.serialNumber?.trim(),
            partNumber: values.partNumber?.trim() || undefined,
            imei1: values.imei1?.trim() || undefined,
            imei2: values.imei2?.trim() || undefined,
            macAddress: values.macAddress?.trim() || undefined,
            notes: values.notes?.trim() || undefined,
          };
        }
        return item;
      }));
      setIsEditing(null);
      form.resetFields();
      message.success('Đã cập nhật thông tin');
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(null);
    form.resetFields();
  };

  const handleConfirmReceiving = async () => {
    const validItems = receivedItems.filter(i => i.status === 'valid');
    if (validItems.length === 0) {
      message.error('Không có sản phẩm hợp lệ để nhận');
      return;
    }

    if (!selectedPO) return;

    Modal.confirm({
      title: 'Xác nhận nhận hàng',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      content: (
        <div>
          <p>Bạn đang xác nhận nhận hàng cho đơn <strong>{selectedPO.orderCode}</strong></p>
          <p>Số lượng: <strong>{validItems.length}</strong> sản phẩm hợp lệ</p>
          <Divider />
          <div className="text-sm text-gray-500">
            <p>Chi tiết sẽ được lưu:</p>
            <ul className="list-disc pl-4">
              <li>Serial Number</li>
              {validItems.some(i => i.partNumber) && <li>Part Number</li>}
              {validItems.some(i => i.imei1) && <li>IMEI1</li>}
              {validItems.some(i => i.imei2) && <li>IMEI2</li>}
              {validItems.some(i => i.macAddress) && <li>MAC Address</li>}
            </ul>
          </div>
        </div>
      ),
      okText: 'Xác nhận nhận hàng',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setSubmitting(true);

          // Prepare DTO
          const receiveDto: ReceiveItemDto[] = validItems.map(item => ({
            purchaseOrderDetailID: item.poItemId,
            quantity: item.quantity,
            serialNumber: item.serialNumber,
            imei1: item.imei1,
            imei2: item.imei2,
            macAddress: item.macAddress,
            notes: item.notes,
          }));

          const response = await purchaseOrdersService.receiveItems(
            selectedPO.purchaseOrderId,
            {
              items: receiveDto,
              notes: `Nhận hàng ${validItems.length} sản phẩm`,
            }
          );

          if (response.success && response.data) {
            message.success(`Đã nhận ${response.data.receivedItemsCount} sản phẩm thành công!`);
            message.info(`Trạng thái đơn hàng: ${response.data.newStatus}`);

            // Close drawer and refresh data
            setReceivingDrawerOpen(false);
            setSelectedPO(null);
            setSelectedItem(null);
            setReceivedItems([]);
            fetchPurchaseOrders();
          } else {
            message.error(response.message || 'Không thể nhận hàng');
          }
        } catch (error: any) {
          console.error('Error receiving items:', error);
          const errorMsg = error?.response?.data?.message || error?.message || 'Lỗi khi nhận hàng';
          message.error(errorMsg);
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  // Receiving stats for selected item
  const receivingStats = useMemo(() => {
    if (!selectedItem) return null;
    const validCount = (receivedItems || []).filter(i => i.status === 'valid' && i.poItemId === selectedItem.itemId).reduce((sum, i) => sum + i.quantity, 0);
    const totalReceived = selectedItem.receivedQuantity + validCount;
    return {
      ordered: selectedItem.orderedQuantity,
      previouslyReceived: selectedItem.receivedQuantity,
      currentSession: validCount,
      totalReceived,
      remaining: selectedItem.orderedQuantity - totalReceived,
      percentage: Math.round((totalReceived / selectedItem.orderedQuantity) * 100),
    };
  }, [selectedItem, receivedItems]);

  // Table Columns
  const columns: ColumnsType<PurchaseOrderListDto> = [
    {
      title: 'Đơn hàng',
      key: 'order',
      width: 280,
      fixed: 'left',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={48}
            icon={<ShoppingCartOutlined />}
            className="bg-blue-500"
          />
          <div>
            <div
              className="font-bold text-blue-600 cursor-pointer hover:underline"
              onClick={() => handleOpenReceiving(record)}
            >
              {record.orderCode}
            </div>
            <div className="text-gray-500 text-sm">{record.supplierName}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Kho nhập',
      dataIndex: 'warehouseName',
      key: 'warehouse',
      width: 150,
      render: (text) => (
        <span className="flex items-center gap-1">
          <EnvironmentOutlined className="text-green-500" />
          {text}
        </span>
      ),
    },
    {
      title: 'Tiến độ nhận',
      key: 'progress',
      width: 200,
      render: (_, record) => {
        const totalOrdered = record.totalQuantity;
        const totalReceived = record.receivedQuantity;
        const percent = totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;
        return (
          <div>
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
              {totalReceived}/{totalOrdered} sản phẩm
            </div>
          </div>
        );
      },
    },
    {
      title: 'Ngày giao dự kiến',
      dataIndex: 'expectedDeliveryDate',
      key: 'expectedDate',
      width: 140,
      align: 'center',
      render: (date) => {
        if (!date) return '---';
        const isOverdue = dayjs(date).isBefore(dayjs(), 'day');
        const isToday = dayjs(date).isSame(dayjs(), 'day');
        return (
          <div className={`${isOverdue ? 'text-red-500' : isToday ? 'text-orange-500' : 'text-gray-700'}`}>
            <CalendarOutlined className="mr-1" />
            {dayjs(date).format('DD/MM/YYYY')}
            {isOverdue && <Tag color="error" className="ml-1 text-xs">Quá hạn</Tag>}
            {isToday && <Tag color="warning" className="ml-1 text-xs">Hôm nay</Tag>}
          </div>
        );
      },
    },
    {
      title: 'Tổng giá trị',
      dataIndex: 'finalAmount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount, record) => {
        const receivedValue = record.totalQuantity > 0
          ? (record.receivedQuantity / record.totalQuantity) * record.finalAmount
          : 0;
        return (
          <div>
            <div className="font-bold text-gray-800">{formatCurrency(amount)}</div>
            {receivedValue > 0 && (
              <div className="text-xs text-green-600">
                Đã nhận: {formatCurrency(receivedValue)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
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
      title: '',
      key: 'action',
      width: 150,
      align: 'center',
      fixed: 'right',
      render: (_, record) => {
        const canReceive = record.status === 'CONFIRMED' || record.status === 'PARTIAL';

        return (
          <Space>
            {canReceive ? (
              <>
                <Tooltip title="Xem chi tiết">
                  <Button
                    type="text"
                    icon={<EyeOutlined />}
                    onClick={() => handleOpenReceiving(record)}
                  />
                </Tooltip>
                <Button
                  type="primary"
                  size="small"
                  icon={<InboxOutlined />}
                  onClick={() => handleOpenReceiving(record)}
                  className="bg-green-600"
                >
                  Nhận hàng
                </Button>
              </>
            ) : (
              <Tooltip title="Xem thông tin">
                <Button
                  type="default"
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleOpenReceiving(record)}
                >
                  Xem
                </Button>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  // Received items columns
  const receivedColumns: ColumnsType<ReceivedItem> = [
    {
      title: '#',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => <span className="text-gray-400">{index + 1}</span>,
    },
    {
      title: 'Serial Number',
      key: 'serial',
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          {record.status === 'valid' ? (
            <CheckCircleOutlined className="text-green-500" />
          ) : (
            <WarningOutlined className="text-red-500" />
          )}
          <span className="font-mono font-medium">
            {record.serialNumber || `Số lượng: ${record.quantity}`}
          </span>
        </div>
      ),
    },
    {
      title: 'Part Number',
      dataIndex: 'partNumber',
      key: 'partNumber',
      width: 140,
      render: (val) => val ? <Tag color="blue">{val}</Tag> : <span className="text-gray-300">---</span>,
    },
    {
      title: 'IMEI',
      key: 'imei',
      width: 180,
      render: (_, record) => (
        <div className="text-xs">
          {record.imei1 && <div className="font-mono">IMEI1: {record.imei1}</div>}
          {record.imei2 && <div className="font-mono text-gray-500">IMEI2: {record.imei2}</div>}
          {!record.imei1 && !record.imei2 && <span className="text-gray-300">---</span>}
        </div>
      ),
    },
    {
      title: 'MAC Address',
      dataIndex: 'macAddress',
      key: 'mac',
      width: 150,
      render: (val) => val ? <span className="font-mono text-xs">{val}</span> : <span className="text-gray-300">---</span>,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      width: 150,
      ellipsis: true,
      render: (val) => val || <span className="text-gray-300">---</span>,
    },
    {
      title: '',
      key: 'action',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          {isEditing !== record.key && (
            <Tooltip title="Sửa">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined className="text-blue-500" />}
                onClick={() => handleEditItem(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Xóa">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleRemoveItem(record.key)}
            />
          </Tooltip>
        </Space>
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
            <FaBoxOpen className="text-green-600" />
            Nhận hàng (Goods Receiving)
          </h1>
          <p className="text-gray-500 mt-1">
            Tiếp nhận và kiểm tra hàng hóa từ các đơn đặt hàng (Purchase Orders)
          </p>
        </div>
        <Space>
          <Button icon={<FileExcelOutlined />}>Xuất báo cáo</Button>
          <Button icon={<HistoryOutlined />}>Lịch sử nhận hàng</Button>
        </Space>
      </div>

      {/* Filter Bar */}
      <Card className="mb-6 shadow-sm" bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm mã đơn, nhà cung cấp..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              size="large"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              placeholder="Trạng thái"
              allowClear
              className="w-40"
              value={selectedStatus === 'ALL' ? undefined : selectedStatus}
              onChange={(val) => setSelectedStatus(val || 'ALL')}
              options={Object.entries(PO_STATUS_CONFIG).map(([key, config]) => ({
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
              placeholder="Kho nhận"
              allowClear
              className="w-36"
              value={selectedWarehouse === 'ALL' ? undefined : selectedWarehouse}
              onChange={(val) => setSelectedWarehouse(val || 'ALL')}
              options={[
                { value: 'wh-1', label: 'Kho Tổng HCM' },
                { value: 'wh-2', label: 'Kho Hà Nội' },
              ]}
            />
            <Button icon={<ReloadOutlined />}>Làm mới</Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="purchaseOrderID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn hàng`,
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      {/* Receiving Drawer */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <FaClipboardCheck className="text-green-600 text-xl" />
            <div>
              <div className="font-bold">Nhận hàng - {selectedPO?.orderCode}</div>
              <div className="text-sm text-gray-500 font-normal">{selectedPO?.supplierName}</div>
            </div>
          </div>
        }
        placement="right"
        width={1100}
        open={receivingDrawerOpen}
        onClose={() => setReceivingDrawerOpen(false)}
        extra={
          selectedPO && (
            <Space>
              {receivedItems.length > 0 && (
                <Button icon={<PrinterOutlined />}>In phiếu nhận</Button>
              )}
              {(selectedPO.status === 'CONFIRMED' || selectedPO.status === 'PARTIAL') && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={handleConfirmReceiving}
                  disabled={receivedItems.filter(i => i.status === 'valid').length === 0 || submitting}
                  loading={submitting}
                  className="bg-green-600"
                >
                  Xác nhận nhận hàng
                </Button>
              )}
            </Space>
          )
        }
      >
        {selectedPO && (
          <div className="space-y-6">
            {/* PO Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <Row gutter={16}>
                <Col span={6}>
                  <Text type="secondary">Kho nhập</Text>
                  <div className="font-medium flex items-center gap-1 mt-1">
                    <EnvironmentOutlined className="text-green-500" />
                    {selectedPO.warehouseName}
                  </div>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Ngày giao dự kiến</Text>
                  <div className="font-medium mt-1">
                    <CalendarOutlined className="mr-1" />
                    {dayjs(selectedPO.expectedDeliveryDate).format('DD/MM/YYYY')}
                  </div>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Người tạo đơn</Text>
                  <div className="font-medium mt-1">
                    <UserOutlined className="mr-1" />
                    {selectedPO.createdByName}
                  </div>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Tổng giá trị</Text>
                  <div className="font-medium mt-1 text-blue-600">
                    <DollarOutlined className="mr-1" />
                    {formatCurrency(selectedPO.totalAmount)}
                  </div>
                </Col>
              </Row>
              {selectedPO.notes && (
                <Alert
                  className="mt-3"
                  type="info"
                  showIcon
                  message={selectedPO.notes}
                />
              )}
            </div>

            <Row gutter={16}>
              {/* Left: Item List */}
              <Col span={8}>
                <Card
                  title="Danh sách sản phẩm"
                  size="small"
                  className="h-full"
                >
                  <List
                    dataSource={selectedPO.items}
                    renderItem={(item) => {
                      const validReceived = receivedItems.filter(r => r.poItemId === item.itemId && r.status === 'valid').reduce((sum, r) => sum + r.quantity, 0);
                      const totalReceived = item.receivedQuantity + validReceived;
                      const isComplete = totalReceived >= item.orderedQuantity;
                      const isSelected = selectedItem?.itemId === item.itemId;

                      return (
                        <List.Item
                          className={`cursor-pointer rounded-lg transition-all ${isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'} ${isComplete ? 'opacity-60' : ''}`}
                          style={{ border: isSelected ? '2px solid #1890ff' : '1px solid #f0f0f0', marginBottom: 8, padding: '12px' }}
                          onClick={() => !isComplete && handleSelectItem(item)}
                        >
                          <div className="w-full">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar size={36} src={item.imageUrl} icon={<InboxOutlined />} className="bg-gray-100" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">{item.componentName}</div>
                                <div className="flex items-center gap-2">
                                  <Tag className="text-xs">{item.sku}</Tag>
                                  <Tag color={DEVICE_TYPE_CONFIG[item.deviceType]?.label ? 'blue' : 'default'} className="text-xs">
                                    {DEVICE_TYPE_CONFIG[item.deviceType]?.label || item.deviceType}
                                  </Tag>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={isComplete ? 'text-green-600 font-medium' : ''}>
                                {totalReceived}/{item.orderedQuantity} {isComplete && <CheckCircleOutlined />}
                              </span>
                              <Progress
                                percent={Math.round((totalReceived / item.orderedQuantity) * 100)}
                                size="small"
                                className="w-20"
                                showInfo={false}
                                status={isComplete ? 'success' : 'active'}
                              />
                            </div>
                            {/* Show device capabilities */}
                            {item.isSerialized && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {item.hasPartNumber && <Tag className="text-xs" color="cyan">PN</Tag>}
                                {item.hasIMEI && <Tag className="text-xs" color="volcano">IMEI</Tag>}
                                {item.hasMacAddress && <Tag className="text-xs" color="purple">MAC</Tag>}
                              </div>
                            )}
                          </div>
                        </List.Item>
                      );
                    }}
                  />
                </Card>
              </Col>

              {/* Right: Input Form & Received List */}
              <Col span={16}>
                {selectedItem ? (
                  <div className="space-y-4">
                    {/* Selected Item Info */}
                    <Card size="small" className="bg-blue-50 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar size={48} src={selectedItem.imageUrl} icon={<InboxOutlined />} className="bg-white" />
                          <div>
                            <div className="font-bold">{selectedItem.componentName}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <Tag>{selectedItem.sku}</Tag>
                              <Tag color="blue">{DEVICE_TYPE_CONFIG[selectedItem.deviceType]?.label}</Tag>
                              {selectedItem.brand && <span className="text-gray-500">{selectedItem.brand}</span>}
                            </div>
                          </div>
                        </div>
                        {receivingStats && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-blue-600">
                              {receivingStats.totalReceived}/{receivingStats.ordered}
                            </div>
                            <Progress
                              percent={receivingStats.percentage}
                              size="small"
                              className="w-32"
                              status={receivingStats.percentage === 100 ? 'success' : 'active'}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              Còn lại: <strong className="text-orange-500">{receivingStats.remaining}</strong>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>

                    {/* Input Form */}
                    {selectedItem.isSerialized ? (
                      <Card
                        title={
                          <div className="flex items-center gap-2">
                            <ScanOutlined />
                            <span>Nhập thông tin sản phẩm (Serial)</span>
                            {checkingSerial && <Spin size="small" />}
                          </div>
                        }
                        size="small"
                      >
                        <Spin spinning={checkingSerial} tip="Đang kiểm tra Serial...">
                          <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleAddInstance}
                          >
                            {/* Row 1: Serial Number + Add Button */}
                            <Row gutter={16}>
                              <Col span={20}>
                                <Form.Item
                                  name="serialNumber"
                                  label={
                                    <span>
                                      <BarcodeOutlined className="mr-1" />
                                      Serial Number <span className="text-red-500">*</span>
                                    </span>
                                  }
                                  rules={[{ required: true, message: 'Vui lòng nhập Serial' }]}
                                  extra="Quét mã vạch hoặc nhập thủ công. Hệ thống sẽ tự động kiểm tra Serial đã tồn tại trong kho."
                                >
                                  <Input
                                    ref={serialInputRef}
                                    placeholder="Quét hoặc nhập Serial Number..."
                                    size="large"
                                    onPressEnter={(e) => {
                                      e.preventDefault();
                                      handleAddInstance();
                                    }}
                                    disabled={checkingSerial}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={4}>
                                <Form.Item label=" ">
                                  <Button
                                    type="primary"
                                    size="large"
                                    icon={<PlusOutlined />}
                                    onClick={handleAddInstance}
                                    loading={checkingSerial}
                                    className="w-full bg-green-600"
                                  >
                                    Thêm
                                  </Button>
                                </Form.Item>
                              </Col>
                            </Row>

                            {/* Row 2: IMEI and MAC fields - Always show for serialized products */}
                            <Row gutter={16}>
                              <Col span={8}>
                                <Form.Item
                                  name="imei1"
                                  label={<span><MobileOutlined /> IMEI 1</span>}
                                  rules={[
                                    { pattern: /^\d{15}$/, message: 'IMEI phải có 15 số' }
                                  ]}
                                >
                                  <Input placeholder="15 số IMEI (tùy chọn)" maxLength={15} disabled={checkingSerial} />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item
                                  name="imei2"
                                  label="IMEI 2 (2 SIM)"
                                  rules={[
                                    { pattern: /^\d{15}$/, message: 'IMEI phải có 15 số' }
                                  ]}
                                >
                                  <Input placeholder="15 số IMEI2 (tùy chọn)" maxLength={15} disabled={checkingSerial} />
                                </Form.Item>
                              </Col>
                              <Col span={8}>
                                <Form.Item
                                  name="macAddress"
                                  label={<span><WifiOutlined /> MAC Address</span>}
                                  rules={[
                                    { pattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, message: 'Định dạng MAC không hợp lệ' }
                                  ]}
                                >
                                  <Input placeholder="AA:BB:CC:DD:EE:FF (tùy chọn)" disabled={checkingSerial} />
                                </Form.Item>
                              </Col>
                            </Row>

                            {/* Row 3: Notes */}
                            <Row gutter={16}>
                              <Col span={24}>
                                <Form.Item
                                  name="notes"
                                  label="Ghi chú"
                                >
                                  <Input placeholder="Ghi chú nếu có (VD: Máy trầy xước nhẹ)..." disabled={checkingSerial} />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Form>
                        </Spin>

                        {/* Info */}
                        <Alert
                          className="mt-3"
                          type="info"
                          showIcon
                          message="Nhập Serial Number là bắt buộc. IMEI và MAC Address là tùy chọn, có thể để trống nếu thiết bị không hỗ trợ."
                        />
                      </Card>
                    ) : (
                      // Non-serialized: Just quantity
                      <Card title={<span><InboxOutlined className="mr-2" />Nhập số lượng</span>} size="small">
                        <div className="flex items-center gap-4">
                          <InputNumber
                            size="large"
                            min={1}
                            max={selectedItem.orderedQuantity - selectedItem.receivedQuantity}
                            value={quantityInput}
                            onChange={(val) => setQuantityInput(val || 1)}
                            className="w-32"
                          />
                          <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={handleAddQuantity}
                            className="bg-green-600"
                          >
                            Thêm {quantityInput} sản phẩm
                          </Button>
                        </div>
                      </Card>
                    )}

                    {/* Received Items Table */}
                    {receivedItems.length > 0 && (
                      <Card
                        title={
                          <span>
                            <FileDoneOutlined className="mr-2" />
                            Đã nhận trong phiên này ({receivedItems.filter(i => i.status === 'valid').length})
                          </span>
                        }
                        size="small"
                        extra={
                          <Popconfirm
                            title="Xóa tất cả sản phẩm đã nhập?"
                            onConfirm={() => setReceivedItems([])}
                            okButtonProps={{ danger: true }}
                          >
                            <Button size="small" danger>Xóa tất cả</Button>
                          </Popconfirm>
                        }
                      >
                        <Table
                          columns={receivedColumns}
                          dataSource={receivedItems}
                          rowKey="key"
                          pagination={false}
                          size="small"
                          scroll={{ x: 900, y: 300 }}
                        />
                      </Card>
                    )}
                  </div>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chọn sản phẩm từ danh sách bên trái để bắt đầu nhận hàng"
                  />
                )}
              </Col>
            </Row>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default Receiving;
