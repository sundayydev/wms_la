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
    Statistic,
    message,
    Drawer,
    Divider,
    Badge,
    Avatar,
    List,
    Progress,
    Empty,
    Modal,
    Form,
    InputNumber,
    Alert,
    Popconfirm,
    Tabs,
    Switch,
    Collapse,
} from 'antd';
import {
    SearchOutlined,
    EyeOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    InboxOutlined,
    TruckOutlined,
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
    BoxPlotOutlined,
    CheckOutlined,
    CloseOutlined,
    ReloadOutlined,
    HistoryOutlined,
    FileDoneOutlined,
    ExclamationCircleOutlined,
    MobileOutlined,
    WifiOutlined,
    EditOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { InputRef } from 'antd';
import dayjs from 'dayjs';
import { useNavigate, Link } from 'react-router-dom';
import { FaBoxOpen, FaTruck, FaClipboardCheck, FaWarehouse } from 'react-icons/fa';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Panel } = Collapse;

// ============================================================================
// TYPES
// ============================================================================

type POStatus = 'PENDING' | 'CONFIRMED' | 'PARTIAL' | 'DELIVERED' | 'CANCELLED';
type DeviceType = 'PDA' | 'PRINTER' | 'SCANNER' | 'ESL' | 'PHONE' | 'OTHER' | 'CONSUMABLE';

interface POItem {
    itemId: string;
    componentId: string;
    sku: string;
    componentName: string;
    brand?: string;
    orderedQuantity: number;
    receivedQuantity: number;
    unitPrice: number;
    isSerialized: boolean;
    deviceType: DeviceType;
    hasIMEI: boolean;      // Sản phẩm có IMEI (điện thoại, PDA có SIM)
    hasMacAddress: boolean; // Sản phẩm có MAC (thiết bị wifi/bluetooth)
    hasPartNumber: boolean; // Sản phẩm có Part Number (nhiều biến thể)
    imageUrl?: string;
}

interface PurchaseOrder {
    purchaseOrderId: string;
    orderCode: string;
    supplierName: string;
    supplierCode: string;
    warehouseId: string;
    warehouseName: string;
    orderDate: string;
    expectedDeliveryDate: string;
    status: POStatus;
    items: POItem[];
    totalAmount: number;
    receivedAmount: number;
    createdByName: string;
    notes?: string;
}

interface ReceivedItem {
    key: string;
    poItemId: string;
    sku: string;
    componentName: string;
    serialNumber?: string;
    partNumber?: string;
    imei1?: string;
    imei2?: string;
    macAddress?: string;
    quantity: number;
    status: 'valid' | 'error' | 'duplicate';
    errorMessage?: string;
    notes?: string;
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const PO_STATUS_CONFIG: Record<POStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Chờ duyệt', color: 'warning', icon: <ClockCircleOutlined /> },
    CONFIRMED: { label: 'Đã xác nhận', color: 'processing', icon: <TruckOutlined /> },
    PARTIAL: { label: 'Nhận một phần', color: 'cyan', icon: <BoxPlotOutlined /> },
    DELIVERED: { label: 'Đã nhận đủ', color: 'success', icon: <CheckCircleOutlined /> },
    CANCELLED: { label: 'Đã hủy', color: 'error', icon: <CloseOutlined /> },
};

const DEVICE_TYPE_CONFIG: Record<DeviceType, { label: string; icon: React.ReactNode }> = {
    PDA: { label: 'PDA / Máy cầm tay', icon: <MobileOutlined /> },
    PRINTER: { label: 'Máy in', icon: <PrinterOutlined /> },
    SCANNER: { label: 'Máy quét', icon: <BarcodeOutlined /> },
    ESL: { label: 'Nhãn điện tử', icon: <WifiOutlined /> },
    PHONE: { label: 'Điện thoại', icon: <MobileOutlined /> },
    OTHER: { label: 'Thiết bị khác', icon: <InboxOutlined /> },
    CONSUMABLE: { label: 'Vật tư tiêu hao', icon: <InboxOutlined /> },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPurchaseOrders: PurchaseOrder[] = [
    {
        purchaseOrderId: 'po-001',
        orderCode: 'PO-2024-001',
        supplierName: 'Samsung Vina Electronics',
        supplierCode: 'SUP-SAMSUNG',
        warehouseId: 'wh-1',
        warehouseName: 'Kho Tổng HCM',
        orderDate: '2024-12-20',
        expectedDeliveryDate: '2024-12-30',
        status: 'CONFIRMED',
        items: [
            {
                itemId: 'item-1', componentId: '1', sku: 'MOBY-M63-V2',
                componentName: 'Máy kiểm kho PDA Mobydata M63 V2', brand: 'Mobydata',
                orderedQuantity: 50, receivedQuantity: 0, unitPrice: 5500000,
                isSerialized: true, deviceType: 'PDA',
                hasIMEI: true, hasMacAddress: true, hasPartNumber: true,
                imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=pda1'
            },
            {
                itemId: 'item-2', componentId: '2', sku: 'DOCK-M63-4',
                componentName: 'Đế sạc 4 slot Mobydata M63', brand: 'Mobydata',
                orderedQuantity: 10, receivedQuantity: 0, unitPrice: 2500000,
                isSerialized: true, deviceType: 'OTHER',
                hasIMEI: false, hasMacAddress: false, hasPartNumber: true,
                imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=dock1'
            },
        ],
        totalAmount: 300000000,
        receivedAmount: 0,
        createdByName: 'Nguyễn Văn A',
        notes: 'Đơn hàng ưu tiên - Khách đang chờ',
    },
    {
        purchaseOrderId: 'po-002',
        orderCode: 'PO-2024-002',
        supplierName: 'Zebra Corporation Vietnam',
        supplierCode: 'SUP-ZEBRA',
        warehouseId: 'wh-1',
        warehouseName: 'Kho Tổng HCM',
        orderDate: '2024-12-18',
        expectedDeliveryDate: '2024-12-28',
        status: 'PARTIAL',
        items: [
            {
                itemId: 'item-3', componentId: '3', sku: 'ZEBRA-TC21',
                componentName: 'Zebra TC21 Android Mobile Computer', brand: 'Zebra',
                orderedQuantity: 20, receivedQuantity: 12, unitPrice: 12000000,
                isSerialized: true, deviceType: 'PDA',
                hasIMEI: true, hasMacAddress: true, hasPartNumber: true,
                imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=zebra1'
            },
            {
                itemId: 'item-4', componentId: '4', sku: 'ZEB-ZD421-DT',
                componentName: 'Zebra ZD421 Direct Thermal Printer', brand: 'Zebra',
                orderedQuantity: 5, receivedQuantity: 5, unitPrice: 8500000,
                isSerialized: true, deviceType: 'PRINTER',
                hasIMEI: false, hasMacAddress: true, hasPartNumber: true,
                imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=printer1'
            },
        ],
        totalAmount: 282500000,
        receivedAmount: 186500000,
        createdByName: 'Trần Thị B',
    },
    {
        purchaseOrderId: 'po-003',
        orderCode: 'PO-2024-003',
        supplierName: 'Honeywell Asia Pacific',
        supplierCode: 'SUP-HONEY',
        warehouseId: 'wh-2',
        warehouseName: 'Kho Hà Nội',
        orderDate: '2024-12-22',
        expectedDeliveryDate: '2024-12-31',
        status: 'CONFIRMED',
        items: [
            {
                itemId: 'item-5', componentId: '5', sku: 'HON-1400G',
                componentName: 'Máy quét mã vạch Honeywell Voyager 1400g', brand: 'Honeywell',
                orderedQuantity: 100, receivedQuantity: 0, unitPrice: 2800000,
                isSerialized: true, deviceType: 'SCANNER',
                hasIMEI: false, hasMacAddress: false, hasPartNumber: true,
                imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=scanner1'
            },
            {
                itemId: 'item-6', componentId: '6', sku: 'HON-CBL-USB',
                componentName: 'Cáp USB Honeywell', brand: 'Honeywell',
                orderedQuantity: 100, receivedQuantity: 0, unitPrice: 150000,
                isSerialized: false, deviceType: 'CONSUMABLE',
                hasIMEI: false, hasMacAddress: false, hasPartNumber: false,
                imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=cable1'
            },
        ],
        totalAmount: 295000000,
        receivedAmount: 0,
        createdByName: 'Lê Văn C',
    },
    {
        purchaseOrderId: 'po-004',
        orderCode: 'PO-2024-004',
        supplierName: 'Công ty Phụ kiện Baseus',
        supplierCode: 'SUP-BASEUS',
        warehouseId: 'wh-1',
        warehouseName: 'Kho Tổng HCM',
        orderDate: '2024-12-15',
        expectedDeliveryDate: '2024-12-20',
        status: 'DELIVERED',
        items: [
            {
                itemId: 'item-7', componentId: '7', sku: 'BAS-PWB-10K',
                componentName: 'Pin dự phòng Baseus 10000mAh', brand: 'Baseus',
                orderedQuantity: 200, receivedQuantity: 200, unitPrice: 350000,
                isSerialized: false, deviceType: 'CONSUMABLE',
                hasIMEI: false, hasMacAddress: false, hasPartNumber: false,
                imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=power1'
            },
        ],
        totalAmount: 70000000,
        receivedAmount: 70000000,
        createdByName: 'Nguyễn Văn A',
    },
];

// Existing serials/IMEIs for validation
const existingSerials = ['M63V2-2024-00001', 'TC21-VN-00001', 'ZD421-HCM-00001'];
const existingIMEIs = ['356998000001234', '356998000005678'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Receiving: React.FC = () => {
    const navigate = useNavigate();
    const serialInputRef = useRef<InputRef>(null);
    const [form] = Form.useForm();

    // States
    const [purchaseOrders] = useState<PurchaseOrder[]>(mockPurchaseOrders);
    const [searchText, setSearchText] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<POStatus | 'ALL'>('ALL');
    const [selectedWarehouse, setSelectedWarehouse] = useState<string | 'ALL'>('ALL');

    // Drawer states
    const [receivingDrawerOpen, setReceivingDrawerOpen] = useState(false);
    const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
    const [selectedItem, setSelectedItem] = useState<POItem | null>(null);

    // Receiving states
    const [receivedItems, setReceivedItems] = useState<ReceivedItem[]>([]);
    const [quantityInput, setQuantityInput] = useState<number>(1);
    const [activeTab, setActiveTab] = useState('items');
    const [quickMode, setQuickMode] = useState(true); // Chế độ nhanh (chỉ serial)
    const [isEditing, setIsEditing] = useState<string | null>(null);

    // Computed: Filtered data
    const filteredData = useMemo(() => {
        return purchaseOrders.filter(po => {
            const matchSearch = !searchText ||
                po.orderCode.toLowerCase().includes(searchText.toLowerCase()) ||
                po.supplierName.toLowerCase().includes(searchText.toLowerCase());

            const matchStatus = selectedStatus === 'ALL' || po.status === selectedStatus;
            const matchWarehouse = selectedWarehouse === 'ALL' || po.warehouseId === selectedWarehouse;

            // Only show POs that can receive goods
            const canReceive = po.status === 'CONFIRMED' || po.status === 'PARTIAL';

            return matchSearch && matchStatus && matchWarehouse && (selectedStatus !== 'ALL' || canReceive || po.status === 'DELIVERED');
        });
    }, [purchaseOrders, searchText, selectedStatus, selectedWarehouse]);

    // Stats
    const stats = useMemo(() => {
        const pendingReceive = purchaseOrders.filter(po => po.status === 'CONFIRMED' || po.status === 'PARTIAL');
        return {
            totalPending: pendingReceive.length,
            totalItems: pendingReceive.reduce((sum, po) => sum + po.items.reduce((s, i) => s + (i.orderedQuantity - i.receivedQuantity), 0), 0),
            totalValue: pendingReceive.reduce((sum, po) => sum + (po.totalAmount - po.receivedAmount), 0),
            deliveredToday: purchaseOrders.filter(po => po.status === 'DELIVERED' && dayjs(po.expectedDeliveryDate).isSame(dayjs(), 'day')).length,
        };
    }, [purchaseOrders]);

    // Format currency
    const formatCurrency = (value?: number) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

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

    // Handlers
    const handleOpenReceiving = (po: PurchaseOrder) => {
        setSelectedPO(po);
        setSelectedItem(null);
        setReceivedItems([]);
        setReceivingDrawerOpen(true);
        setActiveTab('items');
    };

    const handleSelectItem = (item: POItem) => {
        setSelectedItem(item);
        setReceivedItems([]);
        form.resetFields();
        setQuantityInput(1);
        setIsEditing(null);
    };

    const validateSerial = (serial: string): { valid: boolean; error?: string } => {
        if (!serial.trim()) {
            return { valid: false, error: 'Serial không được để trống' };
        }
        if (existingSerials.includes(serial)) {
            return { valid: false, error: 'Serial đã tồn tại trong hệ thống' };
        }
        if (receivedItems.some(item => item.serialNumber === serial)) {
            return { valid: false, error: 'Serial đã có trong danh sách nhận' };
        }
        return { valid: true };
    };

    const validateIMEI = (imei: string): { valid: boolean; error?: string } => {
        if (!imei) return { valid: true };
        if (!/^\d{15}$/.test(imei)) {
            return { valid: false, error: 'IMEI phải có đúng 15 số' };
        }
        if (existingIMEIs.includes(imei)) {
            return { valid: false, error: 'IMEI đã tồn tại trong hệ thống' };
        }
        if (receivedItems.some(item => item.imei1 === imei || item.imei2 === imei)) {
            return { valid: false, error: 'IMEI đã có trong danh sách nhận' };
        }
        return { valid: true };
    };

    const handleAddInstance = () => {
        if (!selectedItem) return;

        form.validateFields().then(values => {
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

            // Validate Serial
            const serialValidation = validateSerial(serial);
            if (!serialValidation.valid) {
                message.error(serialValidation.error);
                return;
            }

            // Validate IMEI1
            if (values.imei1) {
                const imei1Validation = validateIMEI(values.imei1);
                if (!imei1Validation.valid) {
                    message.error(`IMEI1: ${imei1Validation.error}`);
                    return;
                }
            }

            // Validate IMEI2
            if (values.imei2) {
                const imei2Validation = validateIMEI(values.imei2);
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
            // Only reset serial, imei, mac, notes - keep partNumber
            form.setFieldsValue({
                serialNumber: '',
                imei1: '',
                imei2: '',
                macAddress: '',
                notes: '',
            });
            message.success(`Đã thêm: ${serial}`);
            serialInputRef.current?.focus();
        }).catch(() => {
            // Validation failed
        });
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

    const handleConfirmReceiving = () => {
        const validItems = receivedItems.filter(i => i.status === 'valid');
        if (validItems.length === 0) {
            message.error('Không có sản phẩm hợp lệ để nhận');
            return;
        }

        Modal.confirm({
            title: 'Xác nhận nhận hàng',
            icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
            content: (
                <div>
                    <p>Bạn đang xác nhận nhận hàng cho đơn <strong>{selectedPO?.orderCode}</strong></p>
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
            onOk: () => {
                message.success(`Đã nhận ${validItems.length} sản phẩm thành công!`);
                setReceivingDrawerOpen(false);
                setSelectedPO(null);
                setSelectedItem(null);
                setReceivedItems([]);
            },
        });
    };

    // Receiving stats for selected item
    const receivingStats = useMemo(() => {
        if (!selectedItem) return null;
        const validCount = receivedItems.filter(i => i.status === 'valid' && i.poItemId === selectedItem.itemId).reduce((sum, i) => sum + i.quantity, 0);
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
    const columns: ColumnsType<PurchaseOrder> = [
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
                        <Tag className="mt-1">{record.supplierCode}</Tag>
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
                const totalOrdered = record.items.reduce((sum, i) => sum + i.orderedQuantity, 0);
                const totalReceived = record.items.reduce((sum, i) => sum + i.receivedQuantity, 0);
                const percent = Math.round((totalReceived / totalOrdered) * 100);
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
            dataIndex: 'totalAmount',
            key: 'amount',
            width: 150,
            align: 'right',
            render: (amount, record) => (
                <div>
                    <div className="font-bold text-gray-800">{formatCurrency(amount)}</div>
                    {record.receivedAmount > 0 && (
                        <div className="text-xs text-green-600">
                            Đã nhận: {formatCurrency(record.receivedAmount)}
                        </div>
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
            width: 120,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined className="text-blue-600" />}
                            onClick={() => handleOpenReceiving(record)}
                        />
                    </Tooltip>
                    {(record.status === 'CONFIRMED' || record.status === 'PARTIAL') && (
                        <Button
                            type="primary"
                            size="small"
                            icon={<InboxOutlined />}
                            onClick={() => handleOpenReceiving(record)}
                            className="bg-green-600"
                        >
                            Nhận hàng
                        </Button>
                    )}
                </Space>
            ),
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

            {/* Stats */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} sm={12} lg={6}>
                    <Card className="shadow-sm bg-blue-50 border border-blue-200" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title={<span className="text-blue-700">Đơn chờ nhận</span>}
                            value={stats.totalPending}
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold', fontSize: '28px' }}
                            prefix={<TruckOutlined />}
                            suffix="đơn"
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} lg={6}>
                    <Card className="shadow-sm bg-orange-50 border border-orange-200" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title={<span className="text-orange-700">Sản phẩm chờ nhận</span>}
                            value={stats.totalItems}
                            valueStyle={{ color: '#fa8c16', fontWeight: 'bold', fontSize: '28px' }}
                            prefix={<InboxOutlined />}
                            suffix="SP"
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} lg={6}>
                    <Card className="shadow-sm bg-green-50 border border-green-200" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title={<span className="text-green-700">Nhận hôm nay</span>}
                            value={stats.deliveredToday}
                            valueStyle={{ color: '#52c41a', fontWeight: 'bold', fontSize: '28px' }}
                            prefix={<CheckCircleOutlined />}
                            suffix="đơn"
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} lg={6}>
                    <Card className="shadow-sm bg-purple-50 border border-purple-200" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title={<span className="text-purple-700">Giá trị chờ nhận</span>}
                            value={stats.totalValue}
                            valueStyle={{ color: '#722ed1', fontWeight: 'bold', fontSize: '20px' }}
                            prefix={<DollarOutlined />}
                            formatter={value => formatCurrency(Number(value))}
                        />
                    </Card>
                </Col>
            </Row>

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
                    rowKey="purchaseOrderId"
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
                    <Space>
                        <Button icon={<PrinterOutlined />}>In phiếu nhận</Button>
                        <Button
                            type="primary"
                            icon={<CheckCircleOutlined />}
                            onClick={handleConfirmReceiving}
                            disabled={receivedItems.filter(i => i.status === 'valid').length === 0}
                            className="bg-green-600"
                        >
                            Xác nhận nhận hàng
                        </Button>
                    </Space>
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
                                                    <div className="flex items-center justify-between">
                                                        <span><ScanOutlined className="mr-2" />Nhập thông tin sản phẩm</span>
                                                        <div className="flex items-center gap-2">
                                                            <Text type="secondary" className="text-sm">Chế độ nhanh</Text>
                                                            <Switch
                                                                checked={quickMode}
                                                                onChange={setQuickMode}
                                                                checkedChildren="Bật"
                                                                unCheckedChildren="Tắt"
                                                            />
                                                        </div>
                                                    </div>
                                                }
                                                size="small"
                                            >
                                                <Form
                                                    form={form}
                                                    layout="vertical"
                                                    onFinish={handleAddInstance}
                                                >
                                                    <Row gutter={16}>
                                                        {/* Serial Number - Always Required */}
                                                        <Col span={selectedItem.hasPartNumber ? 12 : 16}>
                                                            <Form.Item
                                                                name="serialNumber"
                                                                label={<span><BarcodeOutlined /> Serial Number <span className="text-red-500">*</span></span>}
                                                                rules={[{ required: true, message: 'Vui lòng nhập Serial' }]}
                                                            >
                                                                <Input
                                                                    ref={serialInputRef}
                                                                    placeholder="Quét hoặc nhập Serial Number..."
                                                                    size="large"
                                                                    onPressEnter={handleAddInstance}
                                                                />
                                                            </Form.Item>
                                                        </Col>

                                                        {/* Part Number - Always show if device has it, NOT reset between entries */}
                                                        {selectedItem.hasPartNumber && (
                                                            <Col span={8}>
                                                                <Form.Item
                                                                    name="partNumber"
                                                                    label="Part Number"
                                                                    tooltip="Mã biến thể - không reset giữa các lần nhập"
                                                                >
                                                                    <Input placeholder="VD: TC210K-01A222-A6" size="large" />
                                                                </Form.Item>
                                                            </Col>
                                                        )}

                                                        {/* Add Button */}
                                                        <Col span={4}>
                                                            <Form.Item label=" ">
                                                                <Button
                                                                    type="primary"
                                                                    size="large"
                                                                    icon={<PlusOutlined />}
                                                                    onClick={handleAddInstance}
                                                                    className="w-full bg-green-600"
                                                                >
                                                                    Thêm
                                                                </Button>
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    {/* IMEI and MAC fields - Show based on device type */}
                                                    {(selectedItem.hasIMEI || selectedItem.hasMacAddress) && (
                                                        <Row gutter={16}>
                                                            {selectedItem.hasIMEI && (
                                                                <>
                                                                    <Col span={8}>
                                                                        <Form.Item
                                                                            name="imei1"
                                                                            label={<span><MobileOutlined /> IMEI 1</span>}
                                                                            rules={[
                                                                                { pattern: /^\d{15}$/, message: 'IMEI phải có 15 số' }
                                                                            ]}
                                                                        >
                                                                            <Input placeholder="15 số IMEI1" maxLength={15} />
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
                                                                            <Input placeholder="15 số IMEI2" maxLength={15} />
                                                                        </Form.Item>
                                                                    </Col>
                                                                </>
                                                            )}
                                                            {selectedItem.hasMacAddress && (
                                                                <Col span={8}>
                                                                    <Form.Item
                                                                        name="macAddress"
                                                                        label={<span><WifiOutlined /> MAC Address</span>}
                                                                        rules={[
                                                                            { pattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, message: 'Định dạng MAC không hợp lệ' }
                                                                        ]}
                                                                    >
                                                                        <Input placeholder="AA:BB:CC:DD:EE:FF" />
                                                                    </Form.Item>
                                                                </Col>
                                                            )}
                                                        </Row>
                                                    )}

                                                    {/* Notes - only show in full mode */}
                                                    {!quickMode && (
                                                        <Row gutter={16}>
                                                            <Col span={24}>
                                                                <Form.Item
                                                                    name="notes"
                                                                    label="Ghi chú"
                                                                >
                                                                    <Input placeholder="Ghi chú nếu có (VD: Máy trầy xước nhẹ)..." />
                                                                </Form.Item>
                                                            </Col>
                                                        </Row>
                                                    )}
                                                </Form>

                                                {/* Quick tips */}
                                                <Alert
                                                    className="mt-3"
                                                    type="info"
                                                    showIcon
                                                    message={
                                                        quickMode
                                                            ? "Chế độ nhanh: Chỉ cần nhập Serial và nhấn Enter hoặc nút Thêm. Tắt chế độ nhanh để nhập đầy đủ thông tin (Part Number, IMEI, MAC)."
                                                            : "Chế độ đầy đủ: Nhập tất cả thông tin có sẵn để tiết kiệm thời gian kiểm kê sau này."
                                                    }
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
