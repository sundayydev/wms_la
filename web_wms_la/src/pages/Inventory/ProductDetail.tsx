import React, { useState, useEffect, useMemo } from 'react';
import {
    Card,
    Row,
    Col,
    Tag,
    Typography,
    Descriptions,
    Image,
    Button,
    Space,
    Spin,
    Empty,
    Breadcrumb,
    Divider,
    Tabs,
    Table,
    Badge,
    Tooltip,
    message,
    Statistic,
    Alert,
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    CopyOutlined,
    DeleteOutlined,
    BarcodeOutlined,
    AppstoreOutlined,
    DollarOutlined,
    SettingOutlined,
    FileTextOutlined,
    TagsOutlined,
    BoxPlotOutlined,
    SafetyCertificateOutlined,
    LinkOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClockCircleOutlined,
    WarningOutlined,
    PrinterOutlined,
    DownloadOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getComponentById } from '../../services/components.service';
import { PRODUCT_TYPE_CONFIG, STATUS_CONFIG, type Component, type SpecificationGroup, type SpecificationItem } from '../../types/type.component';

const { Title, Text, Paragraph } = Typography;

// ============================================================
// MAIN COMPONENT
// ============================================================
const ProductDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<Component | null>(null);

    // Load product data
    useEffect(() => {
        const loadProduct = async () => {
            if (!id) {
                message.error('Không tìm thấy ID sản phẩm');
                navigate('/admin/inventory/products');
                return;
            }

            setLoading(true);
            try {
                const data = await getComponentById(id);
                setProduct(data);
            } catch (error: any) {
                console.error('Failed to load product:', error);
                message.error(error.message || 'Có lỗi khi tải thông tin sản phẩm');
                navigate('/admin/inventory/products');
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [id, navigate]);

    // Parse specifications
    const specifications = useMemo((): SpecificationGroup[] => {
        if (!product?.specifications) return [];
        // Service already parses JSON into object
        return Object.entries(product.specifications).map(([groupName, items]) => ({
            groupName,
            items: items as SpecificationItem[],
        }));
    }, [product?.specifications]);

    // Format currency
    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '---';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Get status config
    const getStatusConfig = (status: string) => {
        // Safe cast as status is string in Component but keyof STATUS_CONFIG requires specific literal
        const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
        if (!config) return { label: status, color: 'gray', badge: 'default' as const };
        return config;
    };

    // Get product type config
    const getProductTypeConfig = (type: string) => {
        const config = PRODUCT_TYPE_CONFIG[type as keyof typeof PRODUCT_TYPE_CONFIG];
        if (!config) return { label: type, color: 'gray' };
        return config;
    };

    // Copy to clipboard
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        message.success(`Đã copy ${label}`);
    };

    // ============================================================
    // RENDER SECTIONS
    // ============================================================

    // Header Section
    const renderHeader = () => {
        if (!product) return null;
        const statusConfig = getStatusConfig(product.status);

        return (
            <div className="bg-white border-b shadow-sm">
                <div className="py-4 px-6">
                    <Breadcrumb
                        className="mb-3"
                        items={[
                            { title: <Link to="/admin/inventory/products">Sản phẩm</Link> },
                            { title: 'Chi tiết' },
                            { title: product.sku },
                        ]}
                    />

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/admin/inventory/products')}
                            />
                            <Image
                                src={product.imageUrl || undefined}
                                alt={product.componentName}
                                width={80}
                                height={80}
                                style={{ objectFit: 'contain', borderRadius: 8, border: '1px solid #e5e7eb' }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesANyIGdIYAAAAJcEhZcwAADsQAAA7EAZUrDhsAAA=="
                                preview={{
                                    mask: 'Xem ảnh',
                                }}
                            />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Title level={4} className="m-0">{product.componentName}</Title>
                                    <Badge
                                        status={statusConfig.badge}
                                        text={<span style={{ fontSize: 12 }}>{statusConfig.label}</span>}
                                    />
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <Tooltip title="Click để copy">
                                        <Tag
                                            icon={<BarcodeOutlined />}
                                            className="cursor-pointer font-mono"
                                            onClick={() => copyToClipboard(product.sku, 'SKU')}
                                        >
                                            {product.sku}
                                        </Tag>
                                    </Tooltip>
                                    {product.brand && (
                                        <Text type="secondary">{product.brand} {product.model}</Text>
                                    )}
                                    {product.category?.categoryName && (
                                        <Tag color="blue">{product.category.categoryName}</Tag>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Space>
                            <Button icon={<PrinterOutlined />}>In mã</Button>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/admin/inventory/products/${id}/edit`)}
                            >
                                Chỉnh sửa
                            </Button>
                            <Button
                                type="primary"
                                icon={<CopyOutlined />}
                                className="bg-blue-600"
                            >
                                Nhân bản
                            </Button>
                        </Space>
                    </div>
                </div>
            </div>
        );
    };

    // Stats Cards
    const renderStats = () => {
        if (!product) return null;
        const productTypeConfig = getProductTypeConfig(product.productType);

        return (
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} sm={6}>
                    <Card className="text-center shadow-sm hover:shadow-md transition-shadow h-full">
                        <Statistic
                            title={<span className="text-gray-500">Tồn kho</span>}
                            value={product.currentStock || 0}
                            valueStyle={{ color: (product.currentStock || 0) > 0 ? '#22c55e' : '#ef4444' }}
                            prefix={<InboxOutlined />}
                            suffix={product.unit || 'cái'}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="text-center shadow-sm hover:shadow-md transition-shadow h-full">
                        <Statistic
                            title={<span className="text-gray-500">Biến thể</span>}
                            value={product.variants?.length || 0}
                            prefix={<AppstoreOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="text-center shadow-sm hover:shadow-md transition-shadow h-full">
                        <Statistic
                            title={<span className="text-gray-500">Bảo hành</span>}
                            value={product.defaultWarrantyMonths}
                            prefix={<SafetyCertificateOutlined style={{ color: '#22c55e' }} />}
                            suffix="tháng"
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card className="text-center shadow-sm hover:shadow-md transition-shadow h-full">
                        <div className="text-gray-500 text-sm mb-2">Loại sản phẩm</div>
                        <Tag color={productTypeConfig.color} style={{ fontSize: 14, padding: '4px 12px' }}>
                            {productTypeConfig.label}
                        </Tag>
                    </Card>
                </Col>
            </Row>
        );
    };

    // Basic Info Card
    const renderBasicInfo = () => {
        if (!product) return null;

        return (
            <Card
                title={
                    <span className="flex items-center gap-2">
                        <BarcodeOutlined style={{ color: '#3b82f6' }} />
                        Thông tin cơ bản
                    </span>
                }
                className="shadow-sm mb-6"
            >
                <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
                    <Descriptions.Item label="SKU">
                        <Text copyable className="font-mono">{product.sku}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã vạch">
                        {product.barcode ? (
                            <Text copyable className="font-mono">{product.barcode}</Text>
                        ) : (
                            <Text type="secondary">---</Text>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mã hãng (Part Number)">
                        {product.manufacturerSKU ? (
                            <Text copyable className="font-mono">{product.manufacturerSKU}</Text>
                        ) : (
                            <Text type="secondary">---</Text>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên sản phẩm" span={2}>
                        {product.componentName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên tờ khai (VN)">
                        {product.componentNameVN || <Text type="secondary">---</Text>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Thương hiệu">
                        {product.brand || <Text type="secondary">---</Text>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Model">
                        {product.model || <Text type="secondary">---</Text>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Danh mục">
                        {product.category?.categoryName ? (
                            <Tag color="blue">{product.category.categoryName}</Tag>
                        ) : (
                            <Text type="secondary">Chưa phân loại</Text>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Đơn vị">{product.unit || 'Cái'}</Descriptions.Item>
                    <Descriptions.Item label="Quản lý kho">
                        {product.isSerialized ? (
                            <Tag color="purple" icon={<BarcodeOutlined />}>Serial/IMEI</Tag>
                        ) : (
                            <Tag color="cyan" icon={<InboxOutlined />}>Số lượng</Tag>
                        )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Badge
                            status={getStatusConfig(product.status).badge}
                            text={getStatusConfig(product.status).label}
                        />
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        );
    };

    // Pricing Card
    const renderPricing = () => {
        if (!product) return null;

        const profit = product.sellPrice && product.basePrice
            ? product.sellPrice - product.basePrice
            : null;
        const profitPercent = profit && product.basePrice
            ? Math.round((profit / product.basePrice) * 100)
            : null;

        return (
            <Card
                title={
                    <span className="flex items-center gap-2">
                        <DollarOutlined style={{ color: '#22c55e' }} />
                        Giá cả
                    </span>
                }
                className="shadow-sm mb-6"
            >
                <Row gutter={[24, 16]}>
                    <Col xs={24} sm={8}>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-500 text-sm mb-1">Giá nhập (Vốn)</div>
                            <div className="text-xl font-semibold text-gray-700">
                                {formatCurrency(product.basePrice)}
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={8}>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-gray-500 text-sm mb-1">Giá bán lẻ</div>
                            <div className="text-2xl font-bold text-blue-600">
                                {formatCurrency(product.sellPrice)}
                            </div>
                            {profitPercent !== null && (
                                <div className="text-green-600 text-sm mt-1">
                                    +{profitPercent}% lợi nhuận
                                </div>
                            )}
                        </div>
                    </Col>
                    <Col xs={24} sm={8}>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-gray-500 text-sm mb-1">Giá sỉ</div>
                            <div className="text-xl font-semibold text-gray-700">
                                {formatCurrency(product.wholesalePrice)}
                            </div>
                        </div>
                    </Col>
                </Row>

                {profit !== null && (
                    <Alert
                        className="mt-4"
                        message={
                            <span>
                                Lợi nhuận dự kiến: <strong className="text-green-600">{formatCurrency(profit)}</strong> / sản phẩm
                            </span>
                        }
                        type="success"
                        showIcon
                        icon={<CheckCircleOutlined />}
                    />
                )}
            </Card>
        );
    };

    // Inventory & Warranty Card
    const renderInventory = () => {
        if (!product) return null;

        return (
            <Card
                title={
                    <span className="flex items-center gap-2">
                        <BoxPlotOutlined style={{ color: '#f97316' }} />
                        Kho hàng & Vận chuyển
                    </span>
                }
                className="shadow-sm mb-6"
            >
                <Row gutter={[24, 16]}>
                    <Col xs={12} sm={6}>
                        <div className="text-center">
                            <div className="text-gray-500 text-sm">Tồn kho tối thiểu</div>
                            <div className="text-lg font-semibold">{product.minStockLevel}</div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div className="text-center">
                            <div className="text-gray-500 text-sm">Tồn kho tối đa</div>
                            <div className="text-lg font-semibold">
                                {product.maxStockLevel ?? 'Không giới hạn'}
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div className="text-center">
                            <div className="text-gray-500 text-sm">Bảo hành mặc định</div>
                            <div className="text-lg font-semibold text-green-600">
                                {product.defaultWarrantyMonths} tháng
                            </div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div className="text-center">
                            <div className="text-gray-500 text-sm">Tổng tồn kho</div>
                            <div className={`text-lg font-bold ${(product.currentStock || 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {product.currentStock || 0} {product.unit || 'cái'}
                            </div>
                        </div>
                    </Col>
                </Row>

                <Divider className="my-4">Thông tin vật lý</Divider>

                <Row gutter={[24, 16]}>
                    <Col xs={12} sm={6}>
                        <div className="text-center">
                            <div className="text-gray-500 text-sm">Trọng lượng</div>
                            <div className="text-base">{product.weight ? `${product.weight} kg` : '---'}</div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div className="text-center">
                            <div className="text-gray-500 text-sm">Chiều dài</div>
                            <div className="text-base">{product.length ? `${product.length} cm` : '---'}</div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div className="text-center">
                            <div className="text-gray-500 text-sm">Chiều rộng</div>
                            <div className="text-base">{product.width ? `${product.width} cm` : '---'}</div>
                        </div>
                    </Col>
                    <Col xs={12} sm={6}>
                        <div className="text-center">
                            <div className="text-gray-500 text-sm">Chiều cao</div>
                            <div className="text-base">{product.height ? `${product.height} cm` : '---'}</div>
                        </div>
                    </Col>
                </Row>
            </Card>
        );
    };

    // Specifications Card
    const renderSpecifications = () => {
        if (!product) return null;

        return (
            <Card
                title={
                    <span className="flex items-center gap-2">
                        <SettingOutlined style={{ color: '#6366f1' }} />
                        Thông số kỹ thuật
                    </span>
                }
                className="shadow-sm mb-6"
            >
                {specifications.length === 0 ? (
                    <Empty description="Chưa có thông số kỹ thuật" />
                ) : (
                    <div className="space-y-6">
                        {specifications.map((group, idx) => (
                            <div key={idx}>
                                <div className="font-semibold text-gray-700 mb-3 pb-2 border-b border-gray-200">
                                    {group.groupName}
                                </div>
                                <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered>
                                    {group.items.map((item, itemIdx) => (
                                        <Descriptions.Item
                                            key={itemIdx}
                                            label={
                                                <span className="flex items-center gap-2">
                                                    {item.k}
                                                    {item.q && (
                                                        <Tooltip title="Hiển thị trong báo giá">
                                                            <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 12 }} />
                                                        </Tooltip>
                                                    )}
                                                </span>
                                            }
                                        >
                                            {item.v}
                                        </Descriptions.Item>
                                    ))}
                                </Descriptions>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        );
    };

    // Tags & Documents Card
    const renderTagsAndDocs = () => {
        if (!product) return null;

        return (
            <Card
                title={
                    <span className="flex items-center gap-2">
                        <TagsOutlined style={{ color: '#06b6d4' }} />
                        Tags & Tài liệu
                    </span>
                }
                className="shadow-sm mb-6"
            >
                <div className="mb-4">
                    <Text strong className="block mb-2">Tags tìm kiếm:</Text>
                    {product.tags && product.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag, idx) => (
                                <Tag key={idx} color="blue">{tag}</Tag>
                            ))}
                        </div>
                    ) : (
                        <Text type="secondary">Chưa có tags</Text>
                    )}
                </div>

                <Divider />

                <div className="mb-4">
                    <Text strong className="block mb-2">Sản phẩm đối thủ:</Text>
                    {product.competitors && product.competitors.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {product.competitors.map((comp: any, idx) => (
                                <Tag key={idx} color="orange">{typeof comp === 'string' ? comp : (comp.brand + ' ' + comp.model)}</Tag>
                            ))}
                        </div>
                    ) : (
                        <Text type="secondary">Chưa có thông tin đối thủ</Text>
                    )}
                </div>

                <Divider />

                <div>
                    <Text strong className="block mb-2">Tài liệu đính kèm:</Text>
                    {product.documents && product.documents.length > 0 ? (
                        <div className="space-y-2">
                            {product.documents.map((doc: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <FileTextOutlined style={{ color: '#3b82f6' }} />
                                    <span>{doc.title || doc.type}</span>
                                    {doc.url && (
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<DownloadOutlined />}
                                            href={doc.url}
                                            target="_blank"
                                        >
                                            Tải về
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Text type="secondary">Chưa có tài liệu</Text>
                    )}
                </div>
            </Card>
        );
    };

    // Description Card
    const renderDescription = () => {
        if (!product) return null;
        if (!product.shortDescription && !product.fullDescription) return null;

        return (
            <Card
                title={
                    <span className="flex items-center gap-2">
                        <FileTextOutlined style={{ color: '#6b7280' }} />
                        Mô tả sản phẩm
                    </span>
                }
                className="shadow-sm mb-6"
            >
                {product.shortDescription && (
                    <div className="mb-4">
                        <Text strong className="block mb-2">Mô tả ngắn:</Text>
                        <Paragraph>{product.shortDescription}</Paragraph>
                    </div>
                )}
                {product.fullDescription && (
                    <div>
                        <Text strong className="block mb-2">Mô tả chi tiết:</Text>
                        <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.fullDescription }}
                        />
                    </div>
                )}
            </Card>
        );
    };

    // Variants Table
    const renderVariants = () => {
        if (!product) return null;

        const columns = [
            {
                title: 'Part Number',
                dataIndex: 'partNumber',
                key: 'partNumber',
                render: (text: string) => <Text copyable className="font-mono">{text}</Text>,
            },
            {
                title: 'Tên biến thể',
                dataIndex: 'variantName',
                key: 'variantName',
                render: (text: string) => text || <Text type="secondary">---</Text>,
            },
            {
                title: 'Giá bán',
                dataIndex: 'sellPrice',
                key: 'sellPrice',
                render: (value: number | null) => formatCurrency(value),
            },
            {
                title: 'Tồn kho',
                dataIndex: 'stockCount',
                key: 'stockCount',
                align: 'center' as const,
            },
            {
                title: 'Trạng thái',
                dataIndex: 'isActive',
                key: 'isActive',
                render: (active: boolean) => (
                    <Badge
                        status={active ? 'success' : 'default'}
                        text={active ? 'Hoạt động' : 'Tạm dừng'}
                    />
                ),
            },
        ];

        return (
            <Card
                title={
                    <span className="flex items-center gap-2">
                        <AppstoreOutlined style={{ color: '#a855f7' }} />
                        Biến thể sản phẩm ({product.variants?.length || 0})
                    </span>
                }
                className="shadow-sm mb-6"
            >
                {product.variants && product.variants.length > 0 ? (
                    <Table
                        columns={columns}
                        dataSource={product.variants}
                        rowKey="variantId"
                        pagination={false}
                        size="small"
                    />
                ) : (
                    <Empty description="Sản phẩm này không có biến thể" />
                )}
            </Card>
        );
    };

    // Audit Info
    const renderAuditInfo = () => {
        if (!product) return null;

        return (
            <Card className="shadow-sm mb-6" size="small">
                <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <ClockCircleOutlined />
                        <span>Tạo lúc: {formatDate(product.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockCircleOutlined />
                        <span>Cập nhật: {formatDate(product.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <BarcodeOutlined />
                        <span>ID: <Text copyable className="font-mono text-xs">{product.componentId}</Text></span>
                    </div>
                </div>
            </Card>
        );
    };

    // ============================================================
    // MAIN RENDER
    // ============================================================
    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spin size="large" tip="Đang tải thông tin sản phẩm..." />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex justify-center items-center h-96">
                <Empty
                    description="Không tìm thấy sản phẩm"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" onClick={() => navigate('/admin/inventory/products')}>
                        Quay lại danh sách
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div className="w-full">
            {renderHeader()}

            <div className="p-6">
                {renderStats()}

                <Row gutter={[24, 0]}>
                    <Col xs={24} lg={16}>
                        {renderBasicInfo()}
                        {renderPricing()}
                        {renderSpecifications()}
                        {renderVariants()}
                        {renderDescription()}
                    </Col>
                    <Col xs={24} lg={8}>
                        {renderInventory()}
                        {renderTagsAndDocs()}
                    </Col>
                </Row>

                {renderAuditInfo()}
            </div>
        </div>
    );
};

export default ProductDetail;