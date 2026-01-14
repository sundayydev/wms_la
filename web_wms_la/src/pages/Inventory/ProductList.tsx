import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Space,
  Tooltip,
  Select,
  message,
  Avatar,
  Image,
  Typography,
  Dropdown,
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
  DollarOutlined,
  InboxOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import productsService, {
  type ProductListDto,
  type CategoryDto,
} from '../../services/products.service';
import { getProductStatistics, type ProductStatisticsDto } from '../../services/components.service';

const { Text } = Typography;

// ============================================================
// MAIN COMPONENT
// ============================================================
const ProductList: React.FC = () => {
  const navigate = useNavigate();

  // States
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductListDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedSerialized, setSelectedSerialized] = useState<boolean | undefined>();
  const [productStats, setProductStats] = useState<ProductStatisticsDto | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Fetch products from API
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productsService.getAllProducts(
        pagination.current,
        pagination.pageSize,
        searchText || undefined,
        selectedCategory,
        selectedSerialized
      );

      if (response.success) {
        setData(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.totalCount || 0,
        }));
      } else {
        message.error(response.message || 'Lỗi khi tải danh sách sản phẩm');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, selectedCategory, selectedSerialized]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await productsService.getCategories();
        if (response.success && response.data) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load product statistics on mount
  useEffect(() => {
    const loadStatistics = async () => {
      setStatsLoading(true);
      try {
        const stats = await getProductStatistics();
        setProductStats(stats);
      } catch (error) {
        console.error('Failed to load product statistics:', error);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStatistics();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pagination.current !== 1) {
        setPagination(prev => ({ ...prev, current: 1 }));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Computed: Statistics (fallback to local calculation if API stats not available)
  const stats = useMemo(() => {
    if (productStats) {
      return {
        totalProducts: productStats.totalProducts,
        totalVariants: productStats.totalVariants,
        totalInstances: productStats.totalInstances,
        inStock: productStats.inStock,
        sold: productStats.sold,
        byCategory: productStats.byCategory,
      };
    }
    // Fallback to local calculation
    return {
      totalProducts: pagination.total,
      totalVariants: data.filter(item => item.variantCount > 0).reduce((sum, item) => sum + item.variantCount, 0),
      totalInstances: 0,
      inStock: data.reduce((sum, item) => sum + (item.totalStock || 0), 0),
      sold: 0,
      byCategory: [] as { category: string; count: number }[],
    };
  }, [productStats, data, pagination.total]);

  // Handlers
  const formatCurrency = (value?: number | null) => {
    if (value === undefined || value === null) return '---';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const handleRefresh = () => {
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await productsService.deleteProduct(id);
      if (response.success) {
        message.success('Đã xóa sản phẩm thành công');
        fetchProducts(); // Reload data
      } else {
        message.error(response.message || 'Không thể xóa sản phẩm');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Có lỗi xảy ra khi xóa sản phẩm');
    }
  };

  const handleViewDetail = (record: ProductListDto) => {
    navigate(`/admin/inventory/products/${record.componentID}`);
  };

  const handleExport = () => {
    message.info('Đang xuất Excel...');
    // TODO: Implement export functionality
  };

  const handleTableChange = (paginationConfig: any) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    }));
  };

  // More actions dropdown
  const getMoreActions = (record: ProductListDto): MenuProps['items'] => [
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
      onClick: () => navigate(`/admin/inventory/products/${record.componentID}/edit`),
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
      onClick: () => handleDelete(record.componentID),
    },
  ];

  // ============================================================
  // TABLE COLUMNS
  // ============================================================
  const columns: ColumnsType<ProductListDto> = [
    {
      title: 'Sản phẩm',
      key: 'product',
      width: 380,
      fixed: 'left',
      render: (_, record) => (
        <div className="flex gap-3">
          {record.imageURL ? (
            <Image
              src={record.imageURL}
              alt={record.componentName}
              width={64}
              height={64}
              style={{
                objectFit: 'cover',
                borderRadius: 4,
                border: '1px solid #e5e7eb',
                cursor: 'pointer'
              }}
              className="shrink-0 shadow-sm"
              preview={{
                mask: (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <PictureOutlined style={{ fontSize: 18 }} />
                    <span style={{ fontSize: 11 }}>Xem ảnh</span>
                  </div>
                ),
              }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesANyIGdIYAAAAJcEhZcwAADsQAAA7EAZUrDhsAAA=="
            />
          ) : (
            <Avatar
              shape="square"
              size={64}
              icon={<AppstoreOutlined />}
              className="bg-linear-to-br from-gray-100 to-gray-200 border border-gray-200 shrink-0 shadow-sm"
            />
          )}
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
              {record.categoryName && (
                <span className="text-xs text-gray-500 font-medium">{record.categoryName}</span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'category',
      width: 160,
      render: (categoryName: string | null) => (
        categoryName ? (
          <Tag color="blue">{categoryName}</Tag>
        ) : (
          <span className="text-gray-400">---</span>
        )
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
      dataIndex: 'totalStock',
      key: 'stock',
      width: 100,
      align: 'center',
      sorter: (a, b) => (a.totalStock || 0) - (b.totalStock || 0),
      render: (stock: number) => (
        <span className="font-semibold text-base text-gray-700">
          {stock ?? 0}
        </span>
      ),
    },
    {
      title: 'Biến thể',
      dataIndex: 'variantCount',
      key: 'variants',
      width: 100,
      align: 'center',
      render: (count: number) => (
        count > 0 ? (
          <Tag color="geekblue">{count} biến thể</Tag>
        ) : (
          <span className="text-gray-400">---</span>
        )
      ),
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
      title: 'Đơn vị',
      dataIndex: 'unit',
      key: 'unit',
      width: 100,
      align: 'center',
      render: (unit: string | null) => unit || '---',
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
          <Card className="shadow-sm hover:shadow-md transition-shadow" bodyStyle={{ padding: '16px' }} loading={statsLoading}>
            <Statistic
              title={<span className="text-gray-500">Tổng sản phẩm</span>}
              value={stats.totalProducts}
              prefix={<AppstoreOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bodyStyle={{ padding: '16px' }} loading={statsLoading}>
            <Statistic
              title={<span className="text-gray-500">Tổng biến thể</span>}
              value={stats.totalVariants}
              valueStyle={{ color: '#1890ff' }}
              prefix={<AppstoreAddOutlined className="text-orange-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bodyStyle={{ padding: '16px' }} loading={statsLoading}>
            <Statistic
              title={<span className="text-gray-500">Còn trong kho</span>}
              value={stats.inStock}
              valueStyle={{ color: '#52c41a' }}
              prefix={<InboxOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="shadow-sm hover:shadow-md transition-shadow" bodyStyle={{ padding: '16px' }} loading={statsLoading}>
            <Statistic
              title={<span className="text-gray-500">Đã bán</span>}
              value={stats.sold}
              valueStyle={{ color: '#faad14' }}
              prefix={<DollarOutlined className="text-yellow-500" />}
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
              placeholder="Tìm theo tên, SKU..."
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
              placeholder="Danh mục"
              allowClear
              showSearch
              className="w-48"
              value={selectedCategory}
              onChange={setSelectedCategory}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={categories.map(cat => ({
                value: cat.categoryID,
                label: cat.categoryName,
              }))}
              loading={categories.length === 0}
            />

            <Select
              placeholder="Loại quản lý"
              allowClear
              className="w-40"
              value={selectedSerialized === undefined ? undefined : selectedSerialized ? 'serialized' : 'quantity'}
              onChange={val => {
                if (val === 'serialized') setSelectedSerialized(true);
                else if (val === 'quantity') setSelectedSerialized(false);
                else setSelectedSerialized(undefined);
              }}
              options={[
                { value: 'serialized', label: 'Serial/IMEI' },
                { value: 'quantity', label: 'Số lượng' },
              ]}
            />

            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            />

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
        {(selectedCategory || selectedSerialized !== undefined) && (
          <div className="mt-3 flex items-center gap-2">
            <FilterOutlined className="text-gray-400" />
            <span className="text-sm text-gray-500">Bộ lọc:</span>
            {selectedCategory && (
              <Tag closable onClose={() => setSelectedCategory(undefined)}>
                {categories.find(c => c.categoryID === selectedCategory)?.categoryName || selectedCategory}
              </Tag>
            )}
            {selectedSerialized !== undefined && (
              <Tag closable onClose={() => setSelectedSerialized(undefined)}>
                {selectedSerialized ? 'Serial/IMEI' : 'Số lượng'}
              </Tag>
            )}
            <Button
              type="link"
              size="small"
              onClick={() => {
                setSelectedCategory(undefined);
                setSelectedSerialized(undefined);
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
          dataSource={data}
          rowKey="componentID"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} sản phẩm`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          rowClassName="hover:bg-blue-50/30"
        />
      </Card>

    </div>
  );
};

export default ProductList;