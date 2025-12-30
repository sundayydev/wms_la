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
    Badge,
    Statistic,
    List,
    Image,
} from 'antd';
import {
    SearchOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    MoreOutlined,
    ClockCircleOutlined,
    UserOutlined,
    AppstoreOutlined,
    CheckCircleOutlined,
    DollarOutlined,
    GiftOutlined,
    ShoppingCartOutlined,
    PercentageOutlined,
    TagsOutlined,
    StarOutlined,
    StarFilled,
    CopyOutlined,
    FireOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import { FaBoxes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// ============================================================================
// TYPES
// ============================================================================

// Trạng thái bundle
type BundleStatus = 'ACTIVE' | 'INACTIVE' | 'SCHEDULED' | 'EXPIRED';

// Loại bundle
type BundleType = 'COMBO' | 'STARTER_KIT' | 'PROMOTIONAL' | 'ACCESSORY_SET' | 'ENTERPRISE';

// Interface bundle item (sản phẩm trong bundle)
interface BundleItem {
    componentId: string;
    componentName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    imageUrl?: string;
}

// Interface bundle chính
interface ProductBundle {
    bundleId: string;

    // Thông tin cơ bản
    bundleName: string;
    bundleCode: string;
    description?: string;
    bundleType: BundleType;

    // Sản phẩm trong bundle
    items: BundleItem[];

    // Giá
    originalPrice: number;    // Tổng giá gốc của các items
    bundlePrice: number;      // Giá bán bundle (đã giảm)
    discountPercent: number;  // % giảm giá

    // Thời gian hiệu lực
    status: BundleStatus;
    startDate?: string;
    endDate?: string;

    // Tồn kho
    stockQuantity: number;
    minOrderQuantity: number;
    maxOrderQuantity?: number;

    // Metadata
    isFeatured: boolean;
    sortOrder: number;
    tags?: string[];
    imageUrl?: string;

    // Audit
    createdByUserId?: string;
    createdByUserName?: string;
    createdAt: string;
    updatedAt: string;

    // Stats
    totalSold?: number;
}

// ============================================================================
// CONFIGS
// ============================================================================

const BUNDLE_STATUS_CONFIG: Record<BundleStatus, { label: string; color: string; icon: React.ReactNode }> = {
    ACTIVE: { label: 'Đang bán', color: 'success', icon: <CheckCircleOutlined /> },
    INACTIVE: { label: 'Tạm dừng', color: 'default', icon: <ClockCircleOutlined /> },
    SCHEDULED: { label: 'Lên lịch', color: 'processing', icon: <ClockCircleOutlined /> },
    EXPIRED: { label: 'Hết hạn', color: 'error', icon: <ClockCircleOutlined /> },
};

const BUNDLE_TYPE_CONFIG: Record<BundleType, { label: string; color: string; icon: React.ReactNode; description: string }> = {
    COMBO: { label: 'Combo', color: 'blue', icon: <FaBoxes />, description: 'Bộ sản phẩm kết hợp' },
    STARTER_KIT: { label: 'Bộ khởi đầu', color: 'green', icon: <GiftOutlined />, description: 'Bộ dành cho người mới' },
    PROMOTIONAL: { label: 'Khuyến mãi', color: 'volcano', icon: <FireOutlined />, description: 'Bundle giảm giá đặc biệt' },
    ACCESSORY_SET: { label: 'Bộ phụ kiện', color: 'purple', icon: <TagsOutlined />, description: 'Bộ phụ kiện đi kèm' },
    ENTERPRISE: { label: 'Doanh nghiệp', color: 'gold', icon: <ThunderboltOutlined />, description: 'Gói dành cho doanh nghiệp' },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockBundles: ProductBundle[] = [
    {
        bundleId: 'bun-001',
        bundleName: 'Combo PDA Mobydata M63 + Phụ kiện',
        bundleCode: 'COMBO-M63-FULL',
        description: 'Bộ sản phẩm hoàn chỉnh gồm máy PDA Mobydata M63 V2, pin dự phòng, ốp lưng bảo vệ và sạc nhanh USB-C.',
        bundleType: 'COMBO',
        items: [
            { componentId: '1', componentName: 'Máy kiểm kho PDA Mobydata M63 V2', sku: 'MOBY-M63-V2', quantity: 1, unitPrice: 5500000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=pda1' },
            { componentId: '2', componentName: 'Pin Mobydata M63 Extended (5000mAh)', sku: 'BAT-M63-EXT', quantity: 1, unitPrice: 680000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=bat1' },
            { componentId: '3', componentName: 'Ốp lưng bảo vệ M63', sku: 'CASE-M63', quantity: 1, unitPrice: 250000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=case1' },
            { componentId: '4', componentName: 'Sạc USB-C 18W', sku: 'CHG-USB-18W', quantity: 1, unitPrice: 280000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=chg1' },
        ],
        originalPrice: 6710000,
        bundlePrice: 5990000,
        discountPercent: 10.7,
        status: 'ACTIVE',
        stockQuantity: 50,
        minOrderQuantity: 1,
        maxOrderQuantity: 10,
        isFeatured: true,
        sortOrder: 1,
        tags: ['Best Seller', 'Tiết kiệm'],
        imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=bundle1',
        createdByUserName: 'Nguyễn Văn A',
        createdAt: '2024-10-01T10:00:00Z',
        updatedAt: '2024-12-20T14:30:00Z',
        totalSold: 125,
    },
    {
        bundleId: 'bun-002',
        bundleName: 'Starter Kit - Zebra TC21 cho kho hàng',
        bundleCode: 'KIT-TC21-STARTER',
        description: 'Bộ khởi đầu hoàn hảo cho kho hàng với máy Zebra TC21, đế sạc và các phụ kiện cần thiết.',
        bundleType: 'STARTER_KIT',
        items: [
            { componentId: '5', componentName: 'Zebra TC21 Android Mobile Computer', sku: 'ZEBRA-TC21', quantity: 1, unitPrice: 12000000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=tc21' },
            { componentId: '6', componentName: 'Đế sạc đơn Zebra TC21', sku: 'DOCK-TC21-1', quantity: 1, unitPrice: 1500000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=dock1' },
            { componentId: '7', componentName: 'Pin Zebra TC21 Extended', sku: 'BAT-TC21-EXT', quantity: 2, unitPrice: 1800000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=bat2' },
            { componentId: '8', componentName: 'Dây đeo tay Zebra', sku: 'STRAP-ZEB', quantity: 1, unitPrice: 120000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=strap1' },
        ],
        originalPrice: 17220000,
        bundlePrice: 15500000,
        discountPercent: 10,
        status: 'ACTIVE',
        stockQuantity: 25,
        minOrderQuantity: 1,
        isFeatured: true,
        sortOrder: 2,
        tags: ['Mới', 'Cho kho hàng'],
        imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=bundle2',
        createdByUserName: 'Trần Thị B',
        createdAt: '2024-11-01T09:00:00Z',
        updatedAt: '2024-12-18T11:00:00Z',
        totalSold: 45,
    },
    {
        bundleId: 'bun-003',
        bundleName: 'Flash Sale - Combo Máy quét + Cáp',
        bundleCode: 'PROMO-HON-1400G',
        description: 'Khuyến mãi đặc biệt: Máy quét Honeywell 1400g kèm cáp USB chính hãng.',
        bundleType: 'PROMOTIONAL',
        items: [
            { componentId: '9', componentName: 'Máy quét mã vạch Honeywell Voyager 1400g', sku: 'HON-1400G', quantity: 1, unitPrice: 2800000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=hon1' },
            { componentId: '10', componentName: 'Cáp USB Honeywell 1400g', sku: 'CBL-USB-HON', quantity: 1, unitPrice: 180000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=cbl1' },
        ],
        originalPrice: 2980000,
        bundlePrice: 2650000,
        discountPercent: 11,
        status: 'ACTIVE',
        startDate: '2024-12-01T00:00:00Z',
        endDate: '2024-12-31T23:59:59Z',
        stockQuantity: 100,
        minOrderQuantity: 1,
        maxOrderQuantity: 5,
        isFeatured: false,
        sortOrder: 3,
        tags: ['Flash Sale', 'Giới hạn'],
        imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=bundle3',
        createdByUserName: 'Nguyễn Văn A',
        createdAt: '2024-12-01T08:00:00Z',
        updatedAt: '2024-12-01T08:00:00Z',
        totalSold: 78,
    },
    {
        bundleId: 'bun-004',
        bundleName: 'Bộ phụ kiện Máy in Zebra ZD421',
        bundleCode: 'ACC-ZD421-SET',
        description: 'Bộ phụ kiện hoàn chỉnh cho máy in Zebra ZD421: Đầu in thay thế, tem nhãn và ribbon.',
        bundleType: 'ACCESSORY_SET',
        items: [
            { componentId: '11', componentName: 'Đầu in nhiệt Zebra ZD421', sku: 'PH-ZD421', quantity: 1, unitPrice: 2800000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=ph1' },
            { componentId: '12', componentName: 'Cuộn tem nhãn 50x30mm (1000 tem)', sku: 'LABEL-50X30', quantity: 5, unitPrice: 85000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=label1' },
            { componentId: '13', componentName: 'Ribbon Wax/Resin 110mm x 300m', sku: 'RIB-110-300', quantity: 2, unitPrice: 250000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=rib1' },
        ],
        originalPrice: 3725000,
        bundlePrice: 3300000,
        discountPercent: 11.4,
        status: 'ACTIVE',
        stockQuantity: 30,
        minOrderQuantity: 1,
        isFeatured: false,
        sortOrder: 4,
        tags: ['Phụ kiện', 'Máy in'],
        imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=bundle4',
        createdByUserName: 'Kỹ thuật Team',
        createdAt: '2024-09-15T10:00:00Z',
        updatedAt: '2024-11-20T14:30:00Z',
        totalSold: 32,
    },
    {
        bundleId: 'bun-005',
        bundleName: 'Gói Enterprise - 5 PDA + Phần mềm',
        bundleCode: 'ENT-M63-5UNITS',
        description: 'Gói dành cho doanh nghiệp: 5 máy PDA Mobydata M63, phụ kiện và license phần mềm quản lý kho 1 năm.',
        bundleType: 'ENTERPRISE',
        items: [
            { componentId: '1', componentName: 'Máy kiểm kho PDA Mobydata M63 V2', sku: 'MOBY-M63-V2', quantity: 5, unitPrice: 5500000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=pda1' },
            { componentId: '14', componentName: 'Đế sạc 4 slot Mobydata', sku: 'DOCK-M63-4', quantity: 2, unitPrice: 2500000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=dock2' },
            { componentId: '15', componentName: 'License WMS Pro 1 năm', sku: 'LIC-WMS-PRO-1Y', quantity: 1, unitPrice: 12000000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=lic1' },
        ],
        originalPrice: 44500000,
        bundlePrice: 38900000,
        discountPercent: 12.6,
        status: 'ACTIVE',
        stockQuantity: 10,
        minOrderQuantity: 1,
        maxOrderQuantity: 3,
        isFeatured: true,
        sortOrder: 5,
        tags: ['Enterprise', 'Best Deal'],
        imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=bundle5',
        createdByUserName: 'Sales Team',
        createdAt: '2024-08-01T10:00:00Z',
        updatedAt: '2024-12-15T09:00:00Z',
        totalSold: 8,
    },
    {
        bundleId: 'bun-006',
        bundleName: 'Combo Tết 2025 - Giảm sốc',
        bundleCode: 'TET-2025-PROMO',
        description: 'Khuyến mãi đặc biệt mừng Tết 2025. Áp dụng từ 01/01/2025.',
        bundleType: 'PROMOTIONAL',
        items: [
            { componentId: '1', componentName: 'Máy kiểm kho PDA Mobydata M63 V2', sku: 'MOBY-M63-V2', quantity: 1, unitPrice: 5500000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=pda1' },
            { componentId: '16', componentName: 'Thẻ nhớ 64GB', sku: 'SD-64GB', quantity: 1, unitPrice: 180000, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=sd1' },
        ],
        originalPrice: 5680000,
        bundlePrice: 4990000,
        discountPercent: 12.1,
        status: 'SCHEDULED',
        startDate: '2025-01-01T00:00:00Z',
        endDate: '2025-01-31T23:59:59Z',
        stockQuantity: 200,
        minOrderQuantity: 1,
        isFeatured: false,
        sortOrder: 10,
        tags: ['Tết 2025', 'Sắp ra mắt'],
        imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=bundle6',
        createdByUserName: 'Marketing Team',
        createdAt: '2024-12-20T10:00:00Z',
        updatedAt: '2024-12-20T10:00:00Z',
        totalSold: 0,
    },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ProductBundles: React.FC = () => {
    const navigate = useNavigate();

    // States
    const [data] = useState<ProductBundle[]>(mockBundles);
    const [searchText, setSearchText] = useState('');
    const [selectedType, setSelectedType] = useState<BundleType | 'ALL'>('ALL');
    const [selectedStatus, setSelectedStatus] = useState<BundleStatus | 'ALL'>('ALL');

    // Modal/Drawer states
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ProductBundle | null>(null);
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [createForm] = Form.useForm();

    // Computed: Filtered data
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchSearch = !searchText ||
                item.bundleName.toLowerCase().includes(searchText.toLowerCase()) ||
                item.bundleCode.toLowerCase().includes(searchText.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchText.toLowerCase());

            const matchType = selectedType === 'ALL' || item.bundleType === selectedType;
            const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;

            return matchSearch && matchType && matchStatus;
        });
    }, [data, searchText, selectedType, selectedStatus]);

    // Stats
    const stats = useMemo(() => ({
        total: data.length,
        active: data.filter(d => d.status === 'ACTIVE').length,
        featured: data.filter(d => d.isFeatured).length,
        totalSold: data.reduce((sum, d) => sum + (d.totalSold || 0), 0),
        totalRevenue: data.reduce((sum, d) => sum + ((d.totalSold || 0) * d.bundlePrice), 0),
    }), [data]);

    // Format currency
    const formatCurrency = (value?: number) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Handlers
    const handleViewDetail = (item: ProductBundle) => {
        setSelectedItem(item);
        setDetailDrawerOpen(true);
    };

    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            console.log('New bundle:', values);
            message.success('Đã tạo bundle mới');
            setCreateModalOpen(false);
            createForm.resetFields();
        } catch (error) {
            // Validation failed
        }
    };

    const handleDelete = (id: string) => {
        message.success('Đã xóa bundle');
    };

    const handleToggleFeatured = (id: string, featured: boolean) => {
        message.success(featured ? 'Đã đánh dấu nổi bật' : 'Đã bỏ nổi bật');
    };

    // Table Columns
    const columns: ColumnsType<ProductBundle> = [
        {
            title: 'Bundle',
            key: 'bundle',
            width: 350,
            fixed: 'left',
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar
                            shape="square"
                            size={56}
                            src={record.imageUrl}
                            icon={<FaBoxes />}
                            className="bg-gray-100"
                        />
                        {record.isFeatured && (
                            <StarFilled className="absolute -top-1 -right-1 text-yellow-400 text-sm" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div
                            className="font-medium text-gray-800 line-clamp-1 cursor-pointer hover:text-blue-600"
                            onClick={() => handleViewDetail(record)}
                        >
                            {record.bundleName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Tag>{record.bundleCode}</Tag>
                            <Tag color={BUNDLE_TYPE_CONFIG[record.bundleType].color}>
                                {BUNDLE_TYPE_CONFIG[record.bundleType].label}
                            </Tag>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Sản phẩm',
            key: 'items',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <Tooltip title={record.items.map(i => `${i.quantity}x ${i.sku}`).join(', ')}>
                    <Badge count={record.items.length} style={{ backgroundColor: '#1890ff' }}>
                        <Avatar.Group maxCount={3} size="small">
                            {record.items.slice(0, 3).map((item, idx) => (
                                <Avatar key={idx} src={item.imageUrl} size="small" />
                            ))}
                        </Avatar.Group>
                    </Badge>
                </Tooltip>
            ),
        },
        {
            title: 'Giá gốc',
            dataIndex: 'originalPrice',
            key: 'originalPrice',
            width: 130,
            align: 'right',
            render: (price) => (
                <span className="text-gray-400 line-through text-sm">{formatCurrency(price)}</span>
            ),
        },
        {
            title: 'Giá Bundle',
            dataIndex: 'bundlePrice',
            key: 'bundlePrice',
            width: 140,
            align: 'right',
            sorter: (a, b) => a.bundlePrice - b.bundlePrice,
            render: (price, record) => (
                <div>
                    <div className="font-bold text-green-600">{formatCurrency(price)}</div>
                    <Tag color="error" className="text-xs">-{record.discountPercent.toFixed(0)}%</Tag>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            align: 'center',
            filters: Object.entries(BUNDLE_STATUS_CONFIG).map(([key, config]) => ({
                text: config.label,
                value: key,
            })),
            onFilter: (value, record) => record.status === value,
            render: (status: BundleStatus) => {
                const config = BUNDLE_STATUS_CONFIG[status];
                return (
                    <Tag color={config.color} icon={config.icon}>
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: 'Tồn kho',
            dataIndex: 'stockQuantity',
            key: 'stock',
            width: 100,
            align: 'center',
            sorter: (a, b) => a.stockQuantity - b.stockQuantity,
            render: (stock) => (
                <Badge
                    count={stock}
                    style={{ backgroundColor: stock < 10 ? '#ff4d4f' : '#52c41a' }}
                    overflowCount={999}
                />
            ),
        },
        {
            title: 'Đã bán',
            dataIndex: 'totalSold',
            key: 'totalSold',
            width: 100,
            align: 'center',
            sorter: (a, b) => (a.totalSold || 0) - (b.totalSold || 0),
            render: (sold) => (
                <span className="font-medium text-blue-600">{sold || 0}</span>
            ),
        },
        {
            title: 'Nổi bật',
            dataIndex: 'isFeatured',
            key: 'featured',
            width: 80,
            align: 'center',
            render: (featured, record) => (
                <Switch
                    checked={featured}
                    size="small"
                    checkedChildren={<StarFilled />}
                    unCheckedChildren={<StarOutlined />}
                    onChange={(checked) => handleToggleFeatured(record.bundleId, checked)}
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
                            { key: 'copy', icon: <CopyOutlined />, label: 'Nhân bản' },
                            { type: 'divider' },
                            { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => handleDelete(record.bundleId) },
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
                        <FaBoxes className="text-purple-600" />
                        Đóng gói sản phẩm (Bundles)
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Quản lý các combo, bộ sản phẩm bán kèm nhau với giá ưu đãi
                    </p>
                </div>
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setCreateModalOpen(true)}
                        className="bg-blue-600"
                    >
                        Tạo Bundle mới
                    </Button>
                </Space>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} sm={8} lg={4}>
                    <Card className="shadow-sm" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title={<span className="text-gray-500">Tổng Bundles</span>}
                            value={stats.total}
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                            prefix={<FaBoxes />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card className="shadow-sm" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title={<span className="text-gray-500">Đang bán</span>}
                            value={stats.active}
                            valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card className="shadow-sm" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title={<span className="text-gray-500">Nổi bật</span>}
                            value={stats.featured}
                            valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
                            prefix={<StarFilled />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={12} lg={6}>
                    <Card className="shadow-sm" bodyStyle={{ padding: '16px' }}>
                        <Statistic
                            title={<span className="text-gray-500">Tổng đã bán</span>}
                            value={stats.totalSold}
                            valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                            prefix={<ShoppingCartOutlined />}
                            suffix="bundles"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={24} lg={6}>
                    <Card className="shadow-sm" bodyStyle={{ padding: '16px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <Statistic
                            title={<span className="text-white/80">Doanh thu ước tính</span>}
                            value={stats.totalRevenue}
                            valueStyle={{ color: '#fff', fontWeight: 'bold', fontSize: '20px' }}
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
                            placeholder="Tìm kiếm bundle, mã, mô tả..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            allowClear
                            size="large"
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                        <Select
                            placeholder="Loại bundle"
                            allowClear
                            className="w-40"
                            value={selectedType === 'ALL' ? undefined : selectedType}
                            onChange={(val) => setSelectedType(val || 'ALL')}
                            options={Object.entries(BUNDLE_TYPE_CONFIG).map(([key, config]) => ({
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
                            placeholder="Trạng thái"
                            allowClear
                            className="w-36"
                            value={selectedStatus === 'ALL' ? undefined : selectedStatus}
                            onChange={(val) => setSelectedStatus(val || 'ALL')}
                            options={Object.entries(BUNDLE_STATUS_CONFIG).map(([key, config]) => ({
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
                        description="Không tìm thấy bundle nào"
                    >
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                            Tạo Bundle mới
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="bundleId"
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} bundles`,
                        }}
                        scroll={{ x: 1400 }}
                    />
                </Card>
            )}

            {/* Detail Drawer */}
            <Drawer
                title="Chi tiết Bundle"
                placement="right"
                width={700}
                open={detailDrawerOpen}
                onClose={() => setDetailDrawerOpen(false)}
                extra={
                    <Space>
                        <Button icon={<CopyOutlined />}>Nhân bản</Button>
                        <Button icon={<EditOutlined />} type="primary" className="bg-blue-600">Chỉnh sửa</Button>
                    </Space>
                }
            >
                {selectedItem && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                            <Avatar
                                shape="square"
                                size={100}
                                src={selectedItem.imageUrl}
                                icon={<FaBoxes />}
                                className="bg-gray-100"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {selectedItem.isFeatured && (
                                        <Tag color="gold" icon={<StarFilled />}>Nổi bật</Tag>
                                    )}
                                    <Tag color={BUNDLE_STATUS_CONFIG[selectedItem.status].color}>
                                        {BUNDLE_STATUS_CONFIG[selectedItem.status].label}
                                    </Tag>
                                    <Tag color={BUNDLE_TYPE_CONFIG[selectedItem.bundleType].color}>
                                        {BUNDLE_TYPE_CONFIG[selectedItem.bundleType].label}
                                    </Tag>
                                </div>
                                <Title level={4} className="m-0 mb-1">{selectedItem.bundleName}</Title>
                                <Tag>{selectedItem.bundleCode}</Tag>
                            </div>
                        </div>

                        {/* Description */}
                        {selectedItem.description && (
                            <Paragraph className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {selectedItem.description}
                            </Paragraph>
                        )}

                        {/* Price Box */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
                            <Row gutter={16}>
                                <Col span={8} className="text-center">
                                    <div className="text-sm text-gray-500">Giá gốc</div>
                                    <div className="text-lg text-gray-400 line-through">{formatCurrency(selectedItem.originalPrice)}</div>
                                </Col>
                                <Col span={8} className="text-center">
                                    <div className="text-sm text-gray-500">Giá Bundle</div>
                                    <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedItem.bundlePrice)}</div>
                                </Col>
                                <Col span={8} className="text-center">
                                    <div className="text-sm text-gray-500">Tiết kiệm</div>
                                    <div className="text-xl font-bold text-red-500">-{selectedItem.discountPercent.toFixed(1)}%</div>
                                </Col>
                            </Row>
                        </div>

                        <Divider>Sản phẩm trong Bundle ({selectedItem.items.length})</Divider>

                        {/* Items List */}
                        <List
                            dataSource={selectedItem.items}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={
                                            <Avatar shape="square" size={48} src={item.imageUrl} icon={<AppstoreOutlined />} className="bg-gray-100" />
                                        }
                                        title={
                                            <div className="flex items-center justify-between">
                                                <span>{item.componentName}</span>
                                                <Tag color="blue">x{item.quantity}</Tag>
                                            </div>
                                        }
                                        description={
                                            <div className="flex items-center justify-between">
                                                <Tag>{item.sku}</Tag>
                                                <span className="text-gray-600">{formatCurrency(item.unitPrice)} / cái</span>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            )}
                        />

                        {/* Tags */}
                        {selectedItem.tags && selectedItem.tags.length > 0 && (
                            <div>
                                <Text strong>Tags</Text>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {selectedItem.tags.map((tag) => (
                                        <Tag key={tag} color="purple">{tag}</Tag>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Stats */}
                        <Row gutter={16}>
                            <Col span={8}>
                                <Card size="small" className="text-center">
                                    <div className="text-xl font-bold text-blue-600">{selectedItem.stockQuantity}</div>
                                    <div className="text-xs text-gray-500">Tồn kho</div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small" className="text-center">
                                    <div className="text-xl font-bold text-green-600">{selectedItem.totalSold || 0}</div>
                                    <div className="text-xs text-gray-500">Đã bán</div>
                                </Card>
                            </Col>
                            <Col span={8}>
                                <Card size="small" className="text-center">
                                    <div className="text-xl font-bold text-purple-600">{formatCurrency((selectedItem.totalSold || 0) * selectedItem.bundlePrice)}</div>
                                    <div className="text-xs text-gray-500">Doanh thu</div>
                                </Card>
                            </Col>
                        </Row>

                        {/* Validity Period */}
                        {(selectedItem.startDate || selectedItem.endDate) && (
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                                <Text strong><ClockCircleOutlined className="mr-1" /> Thời gian áp dụng</Text>
                                <div className="mt-1 text-gray-600">
                                    {selectedItem.startDate && <span>Từ: {dayjs(selectedItem.startDate).format('DD/MM/YYYY HH:mm')}</span>}
                                    {selectedItem.startDate && selectedItem.endDate && <span> → </span>}
                                    {selectedItem.endDate && <span>Đến: {dayjs(selectedItem.endDate).format('DD/MM/YYYY HH:mm')}</span>}
                                </div>
                            </div>
                        )}

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
                        Tạo Bundle mới
                    </span>
                }
                open={createModalOpen}
                onCancel={() => {
                    setCreateModalOpen(false);
                    createForm.resetFields();
                }}
                onOk={handleCreate}
                okText="Tạo Bundle"
                cancelText="Hủy"
                width={700}
            >
                <Form form={createForm} layout="vertical" className="mt-4">
                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="bundleName"
                                label="Tên Bundle"
                                rules={[{ required: true, message: 'Vui lòng nhập tên bundle' }]}
                            >
                                <Input placeholder="VD: Combo PDA + Phụ kiện" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="bundleCode"
                                label="Mã Bundle"
                                rules={[{ required: true }]}
                            >
                                <Input placeholder="VD: COMBO-M63-01" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={2} placeholder="Mô tả ngắn về bundle" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item
                                name="bundleType"
                                label="Loại Bundle"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    placeholder="Chọn loại"
                                    options={Object.entries(BUNDLE_TYPE_CONFIG).map(([key, config]) => ({
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
                                name="bundlePrice"
                                label="Giá Bundle"
                                rules={[{ required: true }]}
                            >
                                <InputNumber
                                    className="w-full"
                                    min={0}
                                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => Number(value?.replace(/,/g, '') || 0) as unknown as 0}
                                    addonAfter="₫"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="stockQuantity"
                                label="Số lượng tồn"
                                initialValue={100}
                            >
                                <InputNumber className="w-full" min={0} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="minOrderQuantity" label="SL đặt tối thiểu" initialValue={1}>
                                <InputNumber className="w-full" min={1} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="maxOrderQuantity" label="SL đặt tối đa">
                                <InputNumber className="w-full" min={1} placeholder="Không giới hạn" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="isFeatured" label="Nổi bật" valuePropName="checked">
                                <Switch checkedChildren="Có" unCheckedChildren="Không" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="tags" label="Tags">
                        <Select
                            mode="tags"
                            placeholder="Nhập tags và nhấn Enter"
                            tokenSeparators={[',']}
                            options={[
                                { value: 'Best Seller', label: 'Best Seller' },
                                { value: 'Flash Sale', label: 'Flash Sale' },
                                { value: 'Tiết kiệm', label: 'Tiết kiệm' },
                                { value: 'Mới', label: 'Mới' },
                            ]}
                        />
                    </Form.Item>

                    <div className="text-gray-500 text-sm bg-blue-50 p-3 rounded">
                        💡 Sau khi tạo, bạn có thể thêm các sản phẩm vào bundle trong trang chỉnh sửa.
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProductBundles;
