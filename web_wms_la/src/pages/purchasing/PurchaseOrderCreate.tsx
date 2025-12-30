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
    Form,
    InputNumber,
    Table,
    Tag,
    Divider,
    DatePicker,
    message,
    Breadcrumb,
    Empty,
    Tooltip,
    Popconfirm,
    Avatar,
    AutoComplete,
    Alert,
    Statistic,
} from 'antd';
import {
    SaveOutlined,
    PlusOutlined,
    DeleteOutlined,
    ArrowLeftOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    EnvironmentOutlined,
    SearchOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
    DollarOutlined,
    FileTextOutlined,
    InboxOutlined,
    InfoCircleOutlined,
    ClearOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FaFileInvoice } from 'react-icons/fa';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ============================================================================
// TYPES
// ============================================================================

interface Supplier {
    supplierId: string;
    supplierCode: string;
    supplierName: string;
    contactPerson?: string;
    phoneNumber?: string;
    email?: string;
}

interface Warehouse {
    warehouseId: string;
    warehouseCode: string;
    warehouseName: string;
    city?: string;
}

interface Component {
    componentId: string;
    sku: string;
    componentName: string;
    brand?: string;
    basePrice?: number;
    sellPrice?: number;
    isSerialized: boolean;
    imageUrl?: string;
}

interface OrderItem {
    key: string;
    componentId: string;
    sku: string;
    componentName: string;
    brand?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    notes?: string;
    imageUrl?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockSuppliers: Supplier[] = [
    { supplierId: 'sup-1', supplierCode: 'NCC-SAMSUNG', supplierName: 'Samsung Vina Electronics', contactPerson: 'Nguyễn Văn A', phoneNumber: '02839157600', email: 'contact@samsung.vn' },
    { supplierId: 'sup-2', supplierCode: 'NCC-ZEBRA', supplierName: 'Zebra Corporation Vietnam', contactPerson: 'Trần Thị B', phoneNumber: '028912345678', email: 'sales@zebra.vn' },
    { supplierId: 'sup-3', supplierCode: 'NCC-HONEYWELL', supplierName: 'Honeywell Asia Pacific', contactPerson: 'Lê Văn C', phoneNumber: '028987654321', email: 'info@honeywell.vn' },
    { supplierId: 'sup-4', supplierCode: 'NCC-MOBYDATA', supplierName: 'Mobydata Technology JSC', contactPerson: 'Phạm Thị D', phoneNumber: '0909123456', email: 'sales@mobydata.vn' },
];

const mockWarehouses: Warehouse[] = [
    { warehouseId: 'wh-1', warehouseCode: 'HCM-01', warehouseName: 'Kho Tổng HCM', city: 'TP.HCM' },
    { warehouseId: 'wh-2', warehouseCode: 'HN-01', warehouseName: 'Kho Hà Nội', city: 'Hà Nội' },
    { warehouseId: 'wh-3', warehouseCode: 'DN-01', warehouseName: 'Kho Đà Nẵng', city: 'Đà Nẵng' },
];

const mockComponents: Component[] = [
    { componentId: '1', sku: 'MOBY-M63-V2', componentName: 'Máy kiểm kho PDA Mobydata M63 V2', brand: 'Mobydata', basePrice: 5500000, isSerialized: true, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=pda1' },
    { componentId: '2', sku: 'ZEBRA-TC21', componentName: 'Zebra TC21 Android Mobile Computer', brand: 'Zebra', basePrice: 12000000, isSerialized: true, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=zebra1' },
    { componentId: '3', sku: 'ZEB-ZD421-DT', componentName: 'Zebra ZD421 Direct Thermal Printer', brand: 'Zebra', basePrice: 8500000, isSerialized: true, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=printer1' },
    { componentId: '4', sku: 'HON-1400G', componentName: 'Máy quét mã vạch Honeywell Voyager 1400g', brand: 'Honeywell', basePrice: 2800000, isSerialized: true, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=scanner1' },
    { componentId: '5', sku: 'HON-CBL-USB', componentName: 'Cáp USB Honeywell', brand: 'Honeywell', basePrice: 150000, isSerialized: false, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=cable1' },
    { componentId: '6', sku: 'DOCK-M63-4', componentName: 'Đế sạc 4 slot Mobydata M63', brand: 'Mobydata', basePrice: 2500000, isSerialized: true, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=dock1' },
    { componentId: '7', sku: 'LABEL-50X30', componentName: 'Cuộn tem nhãn 50x30mm (1000 tem)', brand: 'Generic', basePrice: 85000, isSerialized: false, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=label1' },
    { componentId: '8', sku: 'RIB-110-300', componentName: 'Ribbon Wax/Resin 110mm x 300m', brand: 'Zebra', basePrice: 250000, isSerialized: false, imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=ribbon1' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PurchaseOrderCreate: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // States
    const [loading, setLoading] = useState(false);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

    // Product search states
    const [productSearchText, setProductSearchText] = useState('');
    const [productSearchOptions, setProductSearchOptions] = useState<{ value: string; label: React.ReactNode; component: Component }[]>([]);

    // Computed: Summary
    const summary = useMemo(() => {
        const subTotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const itemCount = orderItems.length;
        const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        return { subTotal, itemCount, totalQuantity };
    }, [orderItems]);

    // Format currency
    const formatCurrency = (value?: number) => {
        if (!value) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Generate PO Code
    const generatePOCode = () => {
        const today = dayjs().format('YYYYMMDD');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `PO-${today}-${random}`;
    };

    // Handle product search
    const handleProductSearch = (value: string) => {
        setProductSearchText(value);
        if (!value.trim()) {
            setProductSearchOptions([]);
            return;
        }

        const filtered = mockComponents.filter(c =>
            c.sku.toLowerCase().includes(value.toLowerCase()) ||
            c.componentName.toLowerCase().includes(value.toLowerCase()) ||
            c.brand?.toLowerCase().includes(value.toLowerCase())
        );

        const options = filtered.map(c => ({
            value: c.componentId,
            label: (
                <div className="flex items-center gap-3 py-1">
                    <Avatar shape="square" size={40} src={c.imageUrl} icon={<InboxOutlined />} />
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">{c.componentName}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Tag className="m-0">{c.sku}</Tag>
                            <span>{c.brand}</span>
                            <span className="text-green-600 font-medium">{formatCurrency(c.basePrice)}</span>
                        </div>
                    </div>
                </div>
            ),
            component: c,
        }));

        setProductSearchOptions(options);
    };

    // Handle add product
    const handleAddProduct = (componentId: string, option: any) => {
        const component = option.component as Component;

        // Check if already added
        if (orderItems.some(item => item.componentId === componentId)) {
            message.warning('Sản phẩm đã có trong danh sách');
            return;
        }

        const newItem: OrderItem = {
            key: `${Date.now()}-${Math.random()}`,
            componentId: component.componentId,
            sku: component.sku,
            componentName: component.componentName,
            brand: component.brand,
            quantity: 1,
            unitPrice: component.basePrice || 0,
            totalPrice: component.basePrice || 0,
            imageUrl: component.imageUrl,
        };

        setOrderItems(prev => [...prev, newItem]);
        setProductSearchText('');
        setProductSearchOptions([]);
        message.success(`Đã thêm: ${component.sku}`);
    };

    // Handle quantity change
    const handleQuantityChange = (key: string, quantity: number) => {
        setOrderItems(prev => prev.map(item => {
            if (item.key === key) {
                return { ...item, quantity, totalPrice: quantity * item.unitPrice };
            }
            return item;
        }));
    };

    // Handle price change
    const handlePriceChange = (key: string, unitPrice: number) => {
        setOrderItems(prev => prev.map(item => {
            if (item.key === key) {
                return { ...item, unitPrice, totalPrice: item.quantity * unitPrice };
            }
            return item;
        }));
    };

    // Handle remove item
    const handleRemoveItem = (key: string) => {
        setOrderItems(prev => prev.filter(item => item.key !== key));
    };

    // Handle clear all
    const handleClearAll = () => {
        setOrderItems([]);
        message.info('Đã xóa tất cả sản phẩm');
    };

    // Handle submit
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (orderItems.length === 0) {
                message.error('Vui lòng thêm ít nhất 1 sản phẩm vào đơn hàng');
                return;
            }

            setLoading(true);

            const payload = {
                orderCode: generatePOCode(),
                supplierId: values.supplierId,
                warehouseId: values.warehouseId,
                expectedDeliveryDate: values.expectedDeliveryDate?.format('YYYY-MM-DD'),
                notes: values.notes,
                items: orderItems.map(item => ({
                    componentId: item.componentId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    notes: item.notes,
                })),
                totalAmount: summary.subTotal,
            };

            console.log('Payload:', payload);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            message.success('Tạo đơn đặt hàng thành công!');
            navigate('/admin/purchasing/orders');
        } catch (error) {
            // Validation failed
        } finally {
            setLoading(false);
        }
    };

    // Table columns
    const columns: ColumnsType<OrderItem> = [
        {
            title: '#',
            key: 'index',
            width: 50,
            align: 'center',
            render: (_, __, index) => <span className="text-gray-400">{index + 1}</span>,
        },
        {
            title: 'Sản phẩm',
            key: 'product',
            width: 350,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <Avatar shape="square" size={48} src={record.imageUrl} icon={<InboxOutlined />} className="bg-gray-100 shrink-0" />
                    <div className="min-w-0">
                        <div className="font-medium text-gray-800 line-clamp-1">{record.componentName}</div>
                        <div className="flex items-center gap-2 mt-1">
                            <Tag>{record.sku}</Tag>
                            {record.brand && <span className="text-xs text-gray-500">{record.brand}</span>}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Số lượng',
            key: 'quantity',
            width: 120,
            align: 'center',
            render: (_, record) => (
                <InputNumber
                    min={1}
                    max={99999}
                    value={record.quantity}
                    onChange={(val) => handleQuantityChange(record.key, val || 1)}
                    className="w-20"
                />
            ),
        },
        {
            title: 'Đơn giá',
            key: 'unitPrice',
            width: 180,
            align: 'right',
            render: (_, record) => (
                <InputNumber
                    min={0}
                    value={record.unitPrice}
                    onChange={(val) => handlePriceChange(record.key, val || 0)}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => Number(value?.replace(/,/g, '') || 0) as unknown as 0}
                    className="w-36"
                    addonAfter="₫"
                />
            ),
        },
        {
            title: 'Thành tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 150,
            align: 'right',
            render: (value) => (
                <span className="font-bold text-blue-600">{formatCurrency(value)}</span>
            ),
        },
        {
            title: '',
            key: 'action',
            width: 60,
            align: 'center',
            render: (_, record) => (
                <Popconfirm
                    title="Xóa sản phẩm này?"
                    onConfirm={() => handleRemoveItem(record.key)}
                    okButtonProps={{ danger: true }}
                >
                    <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
            ),
        },
    ];

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="w-full max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <Breadcrumb
                className="mb-4"
                items={[
                    { title: <Link to="/admin/purchasing/orders">Đơn đặt hàng</Link> },
                    { title: 'Tạo đơn mới' },
                ]}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <Title level={3} className="m-0 flex items-center gap-3">
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/admin/purchasing/orders')}
                        />
                        <FaFileInvoice className="text-blue-600" />
                        Tạo đơn đặt hàng mới
                    </Title>
                    <Text type="secondary" className="ml-10">
                        Tạo Purchase Order để nhập hàng từ Nhà cung cấp
                    </Text>
                </div>
                <Space>
                    <Button onClick={() => navigate('/admin/purchasing/orders')}>Hủy</Button>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        loading={loading}
                        onClick={handleSubmit}
                        disabled={orderItems.length === 0}
                        className="bg-blue-600"
                    >
                        Lưu đơn hàng
                    </Button>
                </Space>
            </div>

            <Row gutter={24}>
                {/* LEFT: Form Info */}
                <Col xs={24} lg={8}>
                    <Card
                        title={
                            <span className="flex items-center gap-2">
                                <FileTextOutlined className="text-blue-500" />
                                Thông tin đơn hàng
                            </span>
                        }
                        className="shadow-sm mb-6"
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{
                                expectedDeliveryDate: dayjs().add(7, 'day'),
                            }}
                        >
                            {/* Supplier */}
                            <Form.Item
                                name="supplierId"
                                label="Nhà cung cấp"
                                rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Chọn nhà cung cấp..."
                                    optionFilterProp="label"
                                    onChange={(_, option: any) => {
                                        const sup = mockSuppliers.find(s => s.supplierId === option.value);
                                        setSelectedSupplier(sup || null);
                                    }}
                                    options={mockSuppliers.map(s => ({
                                        value: s.supplierId,
                                        label: `${s.supplierCode} - ${s.supplierName}`,
                                    }))}
                                    optionRender={(option) => {
                                        const sup = mockSuppliers.find(s => s.supplierId === option.value);
                                        return (
                                            <div>
                                                <div className="font-medium">{sup?.supplierName}</div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Tag className="m-0">{sup?.supplierCode}</Tag>
                                                    <span>{sup?.contactPerson}</span>
                                                </div>
                                            </div>
                                        );
                                    }}
                                />
                            </Form.Item>

                            {/* Selected supplier info */}
                            {selectedSupplier && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <div className="font-medium text-blue-800">{selectedSupplier.supplierName}</div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        <div><UserOutlined className="mr-2" />{selectedSupplier.contactPerson}</div>
                                        {selectedSupplier.phoneNumber && <div className="mt-1">📞 {selectedSupplier.phoneNumber}</div>}
                                        {selectedSupplier.email && <div className="mt-1">✉️ {selectedSupplier.email}</div>}
                                    </div>
                                </div>
                            )}

                            {/* Warehouse */}
                            <Form.Item
                                name="warehouseId"
                                label="Kho nhập hàng"
                                rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
                            >
                                <Select
                                    placeholder="Chọn kho nhập..."
                                    onChange={(_, option: any) => {
                                        const wh = mockWarehouses.find(w => w.warehouseId === option.value);
                                        setSelectedWarehouse(wh || null);
                                    }}
                                    options={mockWarehouses.map(w => ({
                                        value: w.warehouseId,
                                        label: (
                                            <span className="flex items-center gap-2">
                                                <EnvironmentOutlined className="text-green-500" />
                                                {w.warehouseName}
                                                <Tag className="m-0">{w.warehouseCode}</Tag>
                                            </span>
                                        ),
                                    }))}
                                />
                            </Form.Item>

                            {/* Expected Delivery Date */}
                            <Form.Item
                                name="expectedDeliveryDate"
                                label="Ngày giao dự kiến"
                                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                            >
                                <DatePicker
                                    className="w-full"
                                    format="DD/MM/YYYY"
                                    placeholder="Chọn ngày..."
                                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                                />
                            </Form.Item>

                            {/* Notes */}
                            <Form.Item name="notes" label="Ghi chú">
                                <TextArea rows={3} placeholder="Ghi chú cho đơn hàng..." />
                            </Form.Item>
                        </Form>
                    </Card>

                    {/* Summary Card */}
                    <Card className="shadow-sm bg-gray-50">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Text type="secondary">Số dòng sản phẩm:</Text>
                                <Text strong>{summary.itemCount}</Text>
                            </div>
                            <div className="flex justify-between items-center">
                                <Text type="secondary">Tổng số lượng:</Text>
                                <Text strong>{summary.totalQuantity}</Text>
                            </div>
                            <Divider className="my-3" />
                            <div className="flex justify-between items-center">
                                <Text strong className="text-lg">Tổng tiền:</Text>
                                <Text strong className="text-xl text-blue-600">{formatCurrency(summary.subTotal)}</Text>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* RIGHT: Product List */}
                <Col xs={24} lg={16}>
                    {/* Product Search */}
                    <Card
                        title={
                            <span className="flex items-center gap-2">
                                <SearchOutlined className="text-green-500" />
                                Thêm sản phẩm
                            </span>
                        }
                        className="shadow-sm mb-6"
                    >
                        <AutoComplete
                            value={productSearchText}
                            options={productSearchOptions}
                            onSearch={handleProductSearch}
                            onSelect={handleAddProduct}
                            className="w-full"
                        >
                            <Input
                                size="large"
                                placeholder="Tìm sản phẩm theo SKU, tên, thương hiệu..."
                                prefix={<SearchOutlined className="text-gray-400" />}
                            />
                        </AutoComplete>

                        <Alert
                            message={
                                <span>
                                    <strong>Mẹo:</strong> Nhập SKU hoặc tên sản phẩm để tìm kiếm. Nhấn để thêm vào danh sách.
                                </span>
                            }
                            type="info"
                            showIcon
                            className="mt-4"
                        />
                    </Card>

                    {/* Products Table */}
                    <Card
                        title={
                            <span className="flex items-center gap-2">
                                <InboxOutlined className="text-purple-500" />
                                Danh sách sản phẩm đặt hàng
                                <Tag>{summary.itemCount} sản phẩm</Tag>
                            </span>
                        }
                        className="shadow-sm"
                        extra={
                            orderItems.length > 0 && (
                                <Popconfirm
                                    title="Xóa tất cả sản phẩm?"
                                    onConfirm={handleClearAll}
                                    okButtonProps={{ danger: true }}
                                >
                                    <Button size="small" icon={<ClearOutlined />} danger>
                                        Xóa tất cả
                                    </Button>
                                </Popconfirm>
                            )
                        }
                    >
                        {orderItems.length === 0 ? (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="Chưa có sản phẩm nào. Hãy tìm kiếm và thêm sản phẩm ở trên."
                            />
                        ) : (
                            <Table
                                columns={columns}
                                dataSource={orderItems}
                                rowKey="key"
                                pagination={false}
                                scroll={{ x: 900 }}
                                summary={() => (
                                    <Table.Summary fixed>
                                        <Table.Summary.Row className="bg-gray-50">
                                            <Table.Summary.Cell index={0} colSpan={4} align="right">
                                                <Text strong>Tổng cộng:</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={1} align="right">
                                                <Text strong className="text-lg text-blue-600">{formatCurrency(summary.subTotal)}</Text>
                                            </Table.Summary.Cell>
                                            <Table.Summary.Cell index={2} />
                                        </Table.Summary.Row>
                                    </Table.Summary>
                                )}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PurchaseOrderCreate;
