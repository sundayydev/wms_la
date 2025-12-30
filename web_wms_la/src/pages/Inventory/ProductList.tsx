import React, { useState, useMemo } from 'react';
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Space,
  Tooltip,
  Popconfirm,
  Select,
  message,
  Avatar,
  Typography,
  Badge,
  Dropdown,
  Drawer,
  Descriptions,
  Tabs,
  Empty,
  Statistic,
  Row,
  Col,
  Segmented,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  BarcodeOutlined,
  AppstoreOutlined,
  EyeOutlined,
  MoreOutlined,
  ExportOutlined,
  ImportOutlined,
  FilterOutlined,
  TableOutlined,
  AppstoreAddOutlined,
  TagsOutlined,
  DollarOutlined,
  InboxOutlined,
  SafetyCertificateOutlined,
  FileTextOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import type {
  Component,
  ProductType,
  DeviceType,
  ComponentStatus,
} from '../../types/type.component';
import {
  PRODUCT_TYPE_CONFIG,
  DEVICE_TYPE_CONFIG,
  STATUS_CONFIG,
} from '../../types/type.component';

const { Text, Paragraph } = Typography;

// ============================================================
// MOCK DATA - Sẽ thay bằng API call thực tế
// ============================================================
const mockData: Component[] = [
  {
    componentId: 'uuid-1',
    sku: 'MOBY-M63-V2',
    componentName: 'Máy kiểm kho PDA Mobydata M63 V2',
    componentNameVN: 'Máy đọc mã vạch cầm tay',
    productType: 'DEVICE',
    deviceType: 'PDA',
    brand: 'Mobydata',
    model: 'M63 V2',
    unit: 'Cái',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=pda1',
    basePrice: 5500000,
    sellPrice: 7500000,
    wholesalePrice: 6800000,
    isSerialized: true,
    currentStock: 45,
    minStockLevel: 10,
    defaultWarrantyMonths: 12,
    status: 'ACTIVE',
    tags: ['Android', 'Bluetooth', 'IP65', '2D Scanner'],
    specifications: {
      OS: 'Android 13',
      CPU: 'Octa-core 2.0GHz',
      RAM: '4GB',
      Storage: '64GB',
      Battery: '5000mAh',
      Scanner: '2D Honeywell',
    },
    updatedAt: '2024-12-28T10:30:00Z',
  },
  {
    componentId: 'uuid-2',
    sku: 'ZEBRA-TC21',
    componentName: 'Zebra TC21 Android Mobile Computer',
    componentNameVN: 'Máy tính di động Zebra TC21',
    productType: 'DEVICE',
    deviceType: 'PDA',
    brand: 'Zebra',
    model: 'TC21',
    unit: 'Cái',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=zebra',
    basePrice: 12000000,
    sellPrice: 15500000,
    wholesalePrice: 14000000,
    isSerialized: true,
    currentStock: 12,
    minStockLevel: 5,
    defaultWarrantyMonths: 24,
    status: 'ACTIVE',
    tags: ['Android', 'IP65', 'SE4710 Scanner', 'Enterprise'],
    specifications: {
      OS: 'Android 11',
      CPU: 'Qualcomm SDM660',
      RAM: '4GB',
      Storage: '64GB',
      Battery: '3100mAh',
      Scanner: 'SE4710',
    },
    updatedAt: '2024-12-27T14:20:00Z',
  },
  {
    componentId: 'uuid-3',
    sku: 'ZEB-ZD421-DT',
    componentName: 'Zebra ZD421 Direct Thermal Desktop Printer',
    componentNameVN: 'Máy in tem Zebra ZD421',
    productType: 'DEVICE',
    deviceType: 'PRINTER',
    brand: 'Zebra',
    model: 'ZD421',
    unit: 'Cái',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=printer',
    basePrice: 8500000,
    sellPrice: 11000000,
    wholesalePrice: 10000000,
    isSerialized: true,
    currentStock: 8,
    minStockLevel: 3,
    defaultWarrantyMonths: 12,
    status: 'ACTIVE',
    tags: ['Direct Thermal', 'USB', 'Bluetooth', '203dpi'],
    specifications: {
      Print_Width: '104mm',
      Resolution: '203dpi',
      Speed: '152mm/s',
      Interface: 'USB, Bluetooth, Ethernet',
    },
    updatedAt: '2024-12-26T09:15:00Z',
  },
  {
    componentId: 'uuid-4',
    sku: 'ESL-29-BW',
    componentName: 'Electronic Shelf Label 2.9 inch (Black/White)',
    componentNameVN: 'Nhãn giá điện tử 2.9 inch',
    productType: 'DEVICE',
    deviceType: 'ESL',
    brand: 'Hanshow',
    model: 'Lumina 2.9',
    unit: 'Cái',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=esl',
    basePrice: 180000,
    sellPrice: 280000,
    wholesalePrice: 220000,
    isSerialized: false,
    currentStock: 500,
    minStockLevel: 100,
    defaultWarrantyMonths: 36,
    status: 'ACTIVE',
    tags: ['E-ink', 'RF 433MHz', '5 years battery'],
    specifications: {
      Display_Size: '2.9 inch',
      Display_Type: 'E-ink',
      Resolution: '296x128',
      Battery_Life: '5 years',
    },
    updatedAt: '2024-12-25T16:45:00Z',
  },
  {
    componentId: 'uuid-5',
    sku: 'CASE-M63-BLK',
    componentName: 'Ốp lưng bảo vệ Mobydata M63 (Đen)',
    productType: 'ACCESSORY',
    brand: 'Mobydata',
    model: 'M63 Case',
    unit: 'Cái',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=case',
    basePrice: 120000,
    sellPrice: 250000,
    wholesalePrice: 180000,
    isSerialized: false,
    currentStock: 200,
    minStockLevel: 50,
    status: 'ACTIVE',
    tags: ['TPU', 'Shockproof'],
    updatedAt: '2024-12-24T11:00:00Z',
  },
  {
    componentId: 'uuid-6',
    sku: 'LABEL-40x30-1000',
    componentName: 'Giấy in tem 40x30mm (1000 tem/cuộn)',
    productType: 'CONSUMABLE',
    brand: 'Generic',
    unit: 'Cuộn',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=label',
    basePrice: 25000,
    sellPrice: 45000,
    wholesalePrice: 35000,
    isSerialized: false,
    currentStock: 1500,
    minStockLevel: 200,
    status: 'ACTIVE',
    tags: ['Decal', 'White'],
    updatedAt: '2024-12-23T08:30:00Z',
  },
  {
    componentId: 'uuid-7',
    sku: 'BAT-TC21-STD',
    componentName: 'Pin Zebra TC21 Standard (3100mAh)',
    productType: 'SPARE_PART',
    brand: 'Zebra',
    model: 'BTRY-TC2X-2XMAXX-01',
    unit: 'Viên',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=battery',
    basePrice: 850000,
    sellPrice: 1200000,
    wholesalePrice: 1000000,
    isSerialized: true,
    currentStock: 25,
    minStockLevel: 10,
    defaultWarrantyMonths: 6,
    status: 'ACTIVE',
    tags: ['Li-Ion', 'Original'],
    updatedAt: '2024-12-22T13:20:00Z',
  },
  {
    componentId: 'uuid-8',
    sku: 'OLD-PDA-X100',
    componentName: 'PDA Model X100 (Đã ngừng sản xuất)',
    productType: 'DEVICE',
    deviceType: 'PDA',
    brand: 'Generic',
    model: 'X100',
    unit: 'Cái',
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=oldpda',
    basePrice: 2000000,
    sellPrice: 3500000,
    isSerialized: true,
    currentStock: 2,
    status: 'DISCONTINUED',
    updatedAt: '2024-11-15T10:00:00Z',
  },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const ProductList: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(false);
  const [data] = useState<Component[]>(mockData);
  const [searchText, setSearchText] = useState('');
  const [selectedProductType, setSelectedProductType] = useState<ProductType | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ComponentStatus | 'ALL'>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Component | null>(null);

  // Computed: Unique brands
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(data.map(item => item.brand).filter(Boolean))];
    return uniqueBrands.sort();
  }, [data]);

  // Computed: Filtered data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        !searchText ||
        item.componentName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchText.toLowerCase());

      const matchProductType = selectedProductType === 'ALL' || item.productType === selectedProductType;
      const matchStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchBrand = !selectedBrand || item.brand === selectedBrand;

      return matchSearch && matchProductType && matchStatus && matchBrand;
    });
  }, [data, searchText, selectedProductType, selectedStatus, selectedBrand]);

  // Computed: Statistics
  const stats = useMemo(() => {
    return {
      total: data.length,
      active: data.filter(item => item.status === 'ACTIVE').length,
      lowStock: data.filter(item => (item.currentStock || 0) <= (item.minStockLevel || 0)).length,
      serialized: data.filter(item => item.isSerialized).length,
    };
  }, [data]);

  // Handlers
  const formatCurrency = (value?: number) => {
    if (value === undefined) return '---';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('Đã làm mới dữ liệu');
    }, 800);
  };

  const handleDelete = (id: string) => {
    message.success('Đã xóa sản phẩm');
    // TODO: Call API delete
  };

  const handleViewDetail = (record: Component) => {
    setSelectedProduct(record);
    setDetailDrawerOpen(true);
  };

  const handleExport = () => {
    message.info('Đang xuất Excel...');
    // TODO: Call API export
  };

  // More actions dropdown
  const getMoreActions = (record: Component): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Xem chi tiết',
      icon: <EyeOutlined />,
      onClick: () => handleViewDetail(record),
    },
    {
      key: 'edit',
      label: 'Chỉnh sửa',
      icon: <EditOutlined />,
      onClick: () => navigate(`/admin/inventory/products/${record.componentId}/edit`),
    },
    { type: 'divider' },
    {
      key: 'duplicate',
      label: 'Nhân bản',
      icon: <AppstoreAddOutlined />,
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: 'Xóa sản phẩm',
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const columns: ColumnsType<Component> = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 380,
      fixed: 'left',
      render: (_, record) => (
        <div className="flex gap-3">
          <Avatar
            shape="square"
            size={64}
            src={record.imageUrl}
            icon={<AppstoreOutlined />}
            className="bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-200 flex-shrink-0 shadow-sm"
          />
          <div className="flex flex-col justify-center min-w-0">
            <Text
              strong
              className="text-gray-800 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => handleViewDetail(record)}
            >
              {record.componentName}
            </Text>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Tag className="m-0 bg-gray-100 text-gray-600 border-gray-300 font-mono text-xs">
                {record.sku}
              </Tag>
              {record.brand && (
                <span className="text-xs text-gray-500 font-medium">{record.brand}</span>
              )}
            </div>
            {record.tags && record.tags.length > 0 && (
              <div className="flex gap-1 mt-1.5 flex-wrap">
                {record.tags.slice(0, 3).map(tag => (
                  <Tag key={tag} className="m-0 text-xs" color="default">
                    {tag}
                  </Tag>
                ))}
                {record.tags.length > 3 && (
                  <Tag className="m-0 text-xs">+{record.tags.length - 3}</Tag>
                )}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Phân loại',
      key: 'type',
      width: 160,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <Tag color={PRODUCT_TYPE_CONFIG[record.productType]?.color}>
            {PRODUCT_TYPE_CONFIG[record.productType]?.label}
          </Tag>
          {record.deviceType && (
            <span className="text-xs text-gray-500">
              {DEVICE_TYPE_CONFIG[record.deviceType]?.label}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Quản lý',
      key: 'management',
      width: 130,
      align: 'center',
      render: (_, record) =>
        record.isSerialized ? (
          <Tooltip title="Quản lý theo Serial/IMEI - Cần quét mã từng cái">
            <Tag icon={<BarcodeOutlined />} color="purple">
              Serial/IMEI
            </Tag>
          </Tooltip>
        ) : (
          <Tooltip title="Quản lý theo số lượng">
            <Tag icon={<InboxOutlined />} color="cyan">
              Số lượng
            </Tag>
          </Tooltip>
        ),
    },
    {
      title: 'Tồn kho',
      key: 'stock',
      width: 100,
      align: 'center',
      sorter: (a, b) => (a.currentStock || 0) - (b.currentStock || 0),
      render: (_, record) => {
        const isLowStock = (record.currentStock || 0) <= (record.minStockLevel || 0);
        return (
          <Tooltip title={isLowStock ? `Dưới mức tối thiểu (${record.minStockLevel})` : ''}>
            <span
              className={`font-semibold text-base ${isLowStock ? 'text-red-500' : 'text-gray-700'
                }`}
            >
              {record.currentStock ?? '---'}
            </span>
            {isLowStock && (
              <div className="text-xs text-red-400">Sắp hết</div>
            )}
          </Tooltip>
        );
      },
    },
    {
      title: 'Giá bán',
      key: 'price',
      width: 150,
      align: 'right',
      sorter: (a, b) => (a.sellPrice || 0) - (b.sellPrice || 0),
      render: (_, record) => (
        <div className="flex flex-col items-end">
          <span className="font-bold text-gray-800">{formatCurrency(record.sellPrice)}</span>
          <span className="text-xs text-gray-400">Vốn: {formatCurrency(record.basePrice)}</span>
          {record.sellPrice && record.basePrice && (
            <span className="text-xs text-green-600">
              +{Math.round(((record.sellPrice - record.basePrice) / record.basePrice) * 100)}%
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Bảo hành',
      dataIndex: 'defaultWarrantyMonths',
      key: 'warranty',
      width: 100,
      align: 'center',
      render: (months?: number) =>
        months ? (
          <Tag icon={<SafetyCertificateOutlined />} color="green">
            {months} tháng
          </Tag>
        ) : (
          <span className="text-gray-400">---</span>
        ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      align: 'center',
      render: (status: ComponentStatus) => (
        <Badge
          status={STATUS_CONFIG[status]?.badge}
          text={
            <span className={`text-${STATUS_CONFIG[status]?.color}-600`}>
              {STATUS_CONFIG[status]?.label}
            </span>
          }
        />
      ),
    },
    {
      title: '',
      key: 'actions',
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
          <Dropdown menu={{ items: getMoreActions(record) }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0">Quản lý Sản phẩm</h1>
          <p className="text-gray-500 mt-1">
            Danh mục sản phẩm, thiết bị, linh kiện và vật tư
          </p>
        </div>
        <Space>
          <Button icon={<ImportOutlined />}>Import</Button>
          <Button icon={<ExportOutlined />} onClick={handleExport}>
            Export
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="bg-blue-600 shadow-sm"
            onClick={() => navigate('/admin/inventory/products/create')}
          >
            Thêm sản phẩm
          </Button>
        </Space>
      </div>

      {/* STATS CARDS */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-500">Tổng sản phẩm</span>}
              value={stats.total}
              prefix={<AppstoreOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-500">Đang kinh doanh</span>}
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
              prefix={<Badge status="success" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-500">Sắp hết hàng</span>}
              value={stats.lowStock}
              valueStyle={{ color: stats.lowStock > 0 ? '#ff4d4f' : undefined }}
              prefix={<InboxOutlined className={stats.lowStock > 0 ? 'text-red-500' : 'text-gray-400'} />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bodyStyle={{ padding: '16px' }}>
            <Statistic
              title={<span className="text-gray-500">Quản lý Serial</span>}
              value={stats.serialized}
              prefix={<BarcodeOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* FILTER BAR */}
      <Card className="mb-6 shadow-sm" bordered={false} bodyStyle={{ padding: '16px' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Tìm theo tên, SKU, thương hiệu..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              placeholder="Loại sản phẩm"
              allowClear
              className="w-40"
              value={selectedProductType === 'ALL' ? undefined : selectedProductType}
              onChange={val => setSelectedProductType(val || 'ALL')}
              options={[
                ...Object.entries(PRODUCT_TYPE_CONFIG).map(([key, config]) => ({
                  value: key,
                  label: config.label,
                })),
              ]}
            />

            <Select
              placeholder="Thương hiệu"
              allowClear
              showSearch
              className="w-36"
              value={selectedBrand}
              onChange={setSelectedBrand}
              options={brands.map(brand => ({ value: brand, label: brand }))}
            />

            <Select
              placeholder="Trạng thái"
              allowClear
              className="w-40"
              value={selectedStatus === 'ALL' ? undefined : selectedStatus}
              onChange={val => setSelectedStatus(val || 'ALL')}
              options={Object.entries(STATUS_CONFIG).map(([key, config]) => ({
                value: key,
                label: config.label,
              }))}
            />

            <Button icon={<ReloadOutlined />} onClick={handleRefresh} />

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
        {(selectedProductType !== 'ALL' || selectedStatus !== 'ALL' || selectedBrand) && (
          <div className="mt-3 flex items-center gap-2">
            <FilterOutlined className="text-gray-400" />
            <span className="text-sm text-gray-500">Bộ lọc:</span>
            {selectedProductType !== 'ALL' && (
              <Tag closable onClose={() => setSelectedProductType('ALL')}>
                {PRODUCT_TYPE_CONFIG[selectedProductType]?.label}
              </Tag>
            )}
            {selectedBrand && (
              <Tag closable onClose={() => setSelectedBrand(undefined)}>
                {selectedBrand}
              </Tag>
            )}
            {selectedStatus !== 'ALL' && (
              <Tag closable onClose={() => setSelectedStatus('ALL')}>
                {STATUS_CONFIG[selectedStatus]?.label}
              </Tag>
            )}
            <Button
              type="link"
              size="small"
              onClick={() => {
                setSelectedProductType('ALL');
                setSelectedStatus('ALL');
                setSelectedBrand(undefined);
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
          rowKey="componentId"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sản phẩm`,
          }}
          scroll={{ x: 1400 }}
          rowClassName="hover:bg-blue-50/30"
        />
      </Card>

      {/* DETAIL DRAWER */}
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <Avatar
              shape="square"
              size={48}
              src={selectedProduct?.imageUrl}
              icon={<AppstoreOutlined />}
            />
            <div>
              <div className="font-semibold">{selectedProduct?.componentName}</div>
              <div className="text-sm text-gray-500 font-mono">{selectedProduct?.sku}</div>
            </div>
          </div>
        }
        placement="right"
        width={600}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        extra={
          <Space>
            <Button icon={<EditOutlined />} onClick={() => {
              setDetailDrawerOpen(false);
              navigate(`/admin/inventory/products/${selectedProduct?.componentId}/edit`);
            }}>
              Sửa
            </Button>
          </Space>
        }
      >
        {selectedProduct && (
          <Tabs
            items={[
              {
                key: 'info',
                label: (
                  <span>
                    <FileTextOutlined /> Thông tin
                  </span>
                ),
                children: (
                  <div className="space-y-6">
                    <Descriptions column={2} size="small" bordered>
                      <Descriptions.Item label="SKU" span={1}>
                        <Text copyable className="font-mono">
                          {selectedProduct.sku}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Barcode" span={1}>
                        {selectedProduct.barcode || '---'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Loại sản phẩm" span={1}>
                        <Tag color={PRODUCT_TYPE_CONFIG[selectedProduct.productType]?.color}>
                          {PRODUCT_TYPE_CONFIG[selectedProduct.productType]?.label}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Loại thiết bị" span={1}>
                        {selectedProduct.deviceType
                          ? DEVICE_TYPE_CONFIG[selectedProduct.deviceType]?.label
                          : '---'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Thương hiệu" span={1}>
                        {selectedProduct.brand || '---'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Model" span={1}>
                        {selectedProduct.model || '---'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Đơn vị" span={1}>
                        {selectedProduct.unit || '---'}
                      </Descriptions.Item>
                      <Descriptions.Item label="Trạng thái" span={1}>
                        <Badge
                          status={STATUS_CONFIG[selectedProduct.status]?.badge}
                          text={STATUS_CONFIG[selectedProduct.status]?.label}
                        />
                      </Descriptions.Item>
                    </Descriptions>

                    <Card size="small" title={<><DollarOutlined /> Giá cả</>}>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-gray-500 text-sm">Giá vốn</div>
                          <div className="font-semibold text-lg">
                            {formatCurrency(selectedProduct.basePrice)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm">Giá bán lẻ</div>
                          <div className="font-bold text-lg text-blue-600">
                            {formatCurrency(selectedProduct.sellPrice)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm">Giá sỉ</div>
                          <div className="font-semibold text-lg">
                            {formatCurrency(selectedProduct.wholesalePrice)}
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card size="small" title={<><InboxOutlined /> Kho hàng</>}>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-gray-500 text-sm">Tồn kho</div>
                          <div className="font-bold text-2xl text-gray-800">
                            {selectedProduct.currentStock ?? 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm">Tối thiểu</div>
                          <div className="font-semibold text-lg">
                            {selectedProduct.minStockLevel ?? 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 text-sm">Quản lý</div>
                          <div>
                            {selectedProduct.isSerialized ? (
                              <Tag color="purple">Serial/IMEI</Tag>
                            ) : (
                              <Tag color="cyan">Số lượng</Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ),
              },
              {
                key: 'specs',
                label: (
                  <span>
                    <SettingOutlined /> Thông số
                  </span>
                ),
                children: selectedProduct.specifications ? (
                  <Descriptions column={1} size="small" bordered>
                    {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                      <Descriptions.Item key={key} label={key.replace(/_/g, ' ')}>
                        {value}
                      </Descriptions.Item>
                    ))}
                  </Descriptions>
                ) : (
                  <Empty description="Chưa có thông số kỹ thuật" />
                ),
              },
              {
                key: 'tags',
                label: (
                  <span>
                    <TagsOutlined /> Tags
                  </span>
                ),
                children: selectedProduct.tags && selectedProduct.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.tags.map(tag => (
                      <Tag key={tag} color="blue">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                ) : (
                  <Empty description="Chưa có tags" />
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </div>
  );
};

export default ProductList;