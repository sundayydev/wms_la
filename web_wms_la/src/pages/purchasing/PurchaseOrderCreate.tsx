import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Popconfirm,
  Avatar,
  AutoComplete,
  Alert,
  Spin,
} from 'antd';
import {
  SaveOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  EnvironmentOutlined,
  SearchOutlined,
  FileTextOutlined,
  InboxOutlined,
  ClearOutlined,
  LoadingOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FaFileInvoice } from 'react-icons/fa';

// Import Services & Types
import purchaseOrdersService from '../../services/purchaseOrders.service';
import suppliersService from '../../services/suppliers.service';
import warehousesService from '../../services/warehouses.service';
import { getComponentsForSelect } from '../../services/components.service';
import type { CreatePurchaseOrderDto } from '../../types/type.purchaseOrder';
import type { SupplierListDto } from '../../types/type.supplier';
import type { WarehouseListDto } from '../../types/type.warehouse';
import type { Component } from '../../types/type.component';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ============================================================================
// TYPES
// ============================================================================

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
// MAIN COMPONENT
// ============================================================================

const PurchaseOrderCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // Loading states
  const [loading, setLoading] = useState(false);
  const [suppliersLoading, setSuppliersLoading] = useState(false);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  // Data states
  const [suppliers, setSuppliers] = useState<SupplierListDto[]>([]);
  const [warehouses, setWarehouses] = useState<WarehouseListDto[]>([]);
  const [components, setComponents] = useState<Component[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierListDto | null>(null);

  // Product search states
  const [productSearchText, setProductSearchText] = useState('');
  const [productSearchOptions, setProductSearchOptions] = useState<{ value: string; label: React.ReactNode; component: Component }[]>([]);

  // Fetch suppliers
  const fetchSuppliers = useCallback(async () => {
    setSuppliersLoading(true);
    try {
      const response = await suppliersService.getSuppliersForSelect();
      if (response.success) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      message.error('Không thể tải danh sách nhà cung cấp');
    } finally {
      setSuppliersLoading(false);
    }
  }, []);

  // Fetch warehouses
  const fetchWarehouses = useCallback(async () => {
    setWarehousesLoading(true);
    try {
      const response = await warehousesService.getAllWarehouses(false);
      if (response.success) {
        setWarehouses(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
      message.error('Không thể tải danh sách kho');
    } finally {
      setWarehousesLoading(false);
    }
  }, []);

  // Fetch components (for product search) - using select endpoint
  const fetchComponents = useCallback(async () => {
    setProductsLoading(true);
    try {
      const data = await getComponentsForSelect();
      setComponents(data);
      console.log('Loaded components:', data.length);
    } catch (error) {
      console.error('Failed to fetch components:', error);
      message.error('Không thể tải danh sách sản phẩm');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchSuppliers();
    fetchWarehouses();
    fetchComponents();
  }, [fetchSuppliers, fetchWarehouses, fetchComponents]);

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

  // Handle product search
  const handleProductSearch = (value: string) => {
    setProductSearchText(value);
    if (!value.trim()) {
      setProductSearchOptions([]);
      return;
    }

    const filtered = components.filter(c =>
      c.sku.toLowerCase().includes(value.toLowerCase()) ||
      c.componentName.toLowerCase().includes(value.toLowerCase()) ||
      c.brand?.toLowerCase().includes(value.toLowerCase())
    );

    const options = filtered.slice(0, 20).map(c => ({
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

      const payload: CreatePurchaseOrderDto = {
        supplierID: values.supplierId,
        warehouseID: values.warehouseId,
        expectedDeliveryDate: values.expectedDeliveryDate?.format('YYYY-MM-DD'),
        notes: values.notes,
        discountAmount: 0,
        items: orderItems.map(item => ({
          componentID: item.componentId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          notes: item.notes,
        })),
      };

      const response = await purchaseOrdersService.createPurchaseOrder(payload);

      if (response.success) {
        message.success('Tạo đơn đặt hàng thành công!');
        navigate('/admin/purchasing/orders');
      } else {
        message.error(response.message || 'Tạo đơn hàng thất bại');
      }
    } catch (error: any) {
      console.error('Failed to create purchase order:', error);
      message.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo đơn hàng');
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
    <div className="w-full mx-auto">
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
                  loading={suppliersLoading}
                  notFoundContent={suppliersLoading ? <Spin size="small" /> : 'Không có dữ liệu'}
                  onChange={(value) => {
                    const sup = suppliers.find(s => s.supplierID === value);
                    setSelectedSupplier(sup || null);
                  }}
                  options={suppliers.map(s => ({
                    value: s.supplierID,
                    label: `${s.supplierCode} - ${s.supplierName}`,
                  }))}
                  optionRender={(option) => {
                    const sup = suppliers.find(s => s.supplierID === option.value);
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
                    {selectedSupplier.phoneNumber && <div className="mt-1"><PhoneOutlined /> {selectedSupplier.phoneNumber}</div>}
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
                  loading={warehousesLoading}
                  notFoundContent={warehousesLoading ? <Spin size="small" /> : 'Không có dữ liệu'}
                  options={warehouses.map(w => ({
                    value: w.warehouseID,
                    label: (
                      <span className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-green-500" />
                        {w.warehouseName}
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
                {productsLoading && <LoadingOutlined className="ml-2" />}
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
              disabled={productsLoading}
            >
              <Input
                placeholder={productsLoading ? "Đang tải danh sách sản phẩm..." : "Tìm sản phẩm theo SKU, tên, thương hiệu..."}
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
            className="shadow-sm"
            bodyStyle={{ padding: 0 }}
            title={
              <div className="flex items-center gap-3">
                <InboxOutlined style={{ fontSize: 18, color: '#722ed1' }} />
                <span className="font-semibold">Danh sách sản phẩm đặt hàng</span>
                <Tag color="purple">{summary.itemCount} sản phẩm</Tag>
              </div>
            }
            extra={
              orderItems.length > 0 && (
                <Popconfirm
                  title="Xác nhận xóa"
                  description="Bạn có chắc muốn xóa tất cả sản phẩm?"
                  onConfirm={handleClearAll}
                  okText="Xóa tất cả"
                  cancelText="Hủy"
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
              <div style={{ padding: '48px 24px' }}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <Space direction="vertical" size="small">
                      <Text type="secondary">Chưa có sản phẩm nào trong đơn hàng</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Tìm kiếm và thêm sản phẩm ở phần bên trên
                      </Text>
                    </Space>
                  }
                />
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={orderItems}
                rowKey="key"
                pagination={false}
                scroll={{ x: 900 }}
                summary={() => (
                  <Table.Summary fixed>
                    <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                      <Table.Summary.Cell index={0} colSpan={4} align="right">
                        <Text strong>Tổng cộng:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                          {formatCurrency(summary.subTotal)}
                        </Text>
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
