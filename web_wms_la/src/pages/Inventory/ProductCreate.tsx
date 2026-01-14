import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  InputNumber,
  Select,
  Switch,
  Space,
  Typography,
  Divider,
  message,
  Tooltip,
  Collapse,
  Tag,
  Breadcrumb,
  Alert,
  Image,
  Spin,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  ArrowLeftOutlined,
  InfoCircleOutlined,
  DollarOutlined,
  BarcodeOutlined,
  AppstoreOutlined,
  SettingOutlined,
  FileTextOutlined,
  TagsOutlined,
  BoxPlotOutlined,
  SafetyCertificateOutlined,
  PictureOutlined,
  LinkOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { ProductType } from '../../types/type.component';
import {
  PRODUCT_TYPE_CONFIG,
  STATUS_CONFIG,
} from '../../types/type.component';
import productsService, {
  type CategoryDto,
  type CreateProductDto,
  convertFormToCreateDto,
  convertDtoToFormData,
} from '../../services/products.service';
import suppliersService from '../../services/suppliers.service';
import type { SupplierListDto } from '../../types/type.supplier';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ============================================================
// CONSTANTS
// ============================================================
const UNIT_OPTIONS = [
  { value: 'Cái', label: 'Cái' },
  { value: 'Bộ', label: 'Bộ' },
  { value: 'Cuộn', label: 'Cuộn' },
  { value: 'Hộp', label: 'Hộp' },
  { value: 'Viên', label: 'Viên' },
  { value: 'Tuýp', label: 'Tuýp' },
  { value: 'Chai', label: 'Chai' },
  { value: 'Gói', label: 'Gói' },
];

const DOCUMENT_TYPES = [
  { value: 'USER_MANUAL', label: 'Hướng dẫn sử dụng' },
  { value: 'DATASHEET', label: 'Thông số kỹ thuật' },
  { value: 'QUICK_START', label: 'Cài đặt nhanh' },
  { value: 'FIRMWARE', label: 'Firmware' },
  { value: 'DRIVER', label: 'Driver' },
  { value: 'VIDEO', label: 'Video hướng dẫn' },
  { value: 'WARRANTY_CARD', label: 'Phiếu bảo hành' },
  { value: 'OTHER', label: 'Khác' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [productType, setProductType] = useState<ProductType>('DEVICE');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierListDto[]>([]);
  const [specsMode, setSpecsMode] = useState<'ui' | 'json'>('ui');
  const [specsJsonValue, setSpecsJsonValue] = useState<string>('');

  // Load categories and suppliers on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const categoriesResponse = await productsService.getCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
        message.warning('Không thể tải danh sách danh mục');
      }

      try {
        // Load suppliers for select
        const suppliersResponse = await suppliersService.getSuppliersForSelect();
        if (suppliersResponse.success && suppliersResponse.data) {
          setSuppliers(suppliersResponse.data);
        }
      } catch (error) {
        console.error('Failed to load suppliers:', error);
        message.warning('Không thể tải danh sách nhà cung cấp');
      }
    };

    loadData();
  }, []);

  // Load data if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadProduct = async () => {
        setLoadingData(true);
        try {
          const response = await productsService.getProductById(id);
          if (response.success && response.data) {
            const formData = convertDtoToFormData(response.data);
            form.setFieldsValue(formData);
            if (formData.imageUrl) {
              setPreviewImage(formData.imageUrl);
            }
            message.success('Đã tải thông tin sản phẩm');
          } else {
            message.error(response.message || 'Không tìm thấy sản phẩm');
            navigate('/admin/inventory/products');
          }
        } catch (error) {
          console.error('Failed to load product:', error);
          message.error('Có lỗi khi tải thông tin sản phẩm');
          navigate('/admin/inventory/products');
        } finally {
          setLoadingData(false);
        }
      };

      loadProduct();
    }
  }, [isEditMode, id, form, navigate]);

  // Watch productType changes
  const handleProductTypeChange = (value: ProductType) => {
    setProductType(value);
  };

  // Submit form
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Convert form data to DTO
      const dto = convertFormToCreateDto(values);

      console.log('Payload gửi đi:', dto);

      let response;
      if (isEditMode && id) {
        // Update existing product
        response = await productsService.updateProduct(id, dto);
      } else {
        // Create new product
        response = await productsService.createProduct(dto);
      }

      if (response.success) {
        message.success(isEditMode ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        navigate('/admin/inventory/products');
      } else {
        // Show error messages from API
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((err: string) => message.error(err));
        } else {
          message.error(response.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
        }
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại!';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (value: number | undefined) => {
    if (!value) return '';
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseCurrency = (value: string | undefined) => {
    return value ? Number(value.replace(/,/g, '')) : 0;
  };

  // ============================================================
  // RENDER SECTIONS
  // ============================================================

  // Section 1: Basic Info
  const renderBasicInfo = () => (
    <Card
      style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <InfoCircleOutlined style={{ color: '#3b82f6' }} />
          Thông tin cơ bản
        </span>
      }
    >
      <Row gutter={[24, 16]}>
        {/* SKU & Barcode */}
        <Col xs={24} md={8}>
          <Form.Item
            name="sku"
            label="Mã sản phẩm (SKU)"
            rules={[{ required: true, message: 'Vui lòng nhập mã SKU' }]}
            tooltip="Mã định danh duy nhất của sản phẩm"
          >
            <Input
              prefix={<BarcodeOutlined style={{ color: '#9ca3af' }} />}
              placeholder="VD: MOBY-M63-V2"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="barcode"
            label="Mã vạch (Barcode/EAN)"
            tooltip="Mã vạch quốc tế của sản phẩm"
          >
            <Input placeholder="VD: 8935235123456" style={{ fontFamily: 'monospace' }} />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="manufacturerSKU"
            label="Mã hãng (Part Number)"
            tooltip="Mã sản phẩm gốc từ nhà sản xuất"
          >
            <Input placeholder="VD: TC210K-01A222-A6" />
          </Form.Item>
        </Col>

        {/* Product Name */}
        <Col xs={24} md={16}>
          <Form.Item
            name="componentName"
            label="Tên sản phẩm"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input placeholder="VD: Máy kiểm kho PDA Mobydata M63 V2" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="componentNameVN"
            label="Tên tờ khai (Tiếng Việt)"
            tooltip="Tên sử dụng cho hải quan/tờ khai"
          >
            <Input placeholder="VD: Máy đọc mã vạch" />
          </Form.Item>
        </Col>

        {/* Brand & Model */}
        <Col xs={24} md={8}>
          <Form.Item name="brand" label="Thương hiệu">
            <Select
              showSearch
              allowClear
              placeholder="Chọn hoặc nhập thương hiệu"
              options={[
                { value: 'Zebra', label: 'Zebra' },
                { value: 'Honeywell', label: 'Honeywell' },
                { value: 'Mobydata', label: 'Mobydata' },
                { value: 'Datalogic', label: 'Datalogic' },
                { value: 'Hanshow', label: 'Hanshow' },
                { value: 'TSC', label: 'TSC' },
                { value: 'Generic', label: 'Generic' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="model" label="Model">
            <Input placeholder="VD: M63 V2, TC21, ZD421" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="unit" label="Đơn vị tính">
            <Select
              placeholder="Chọn đơn vị"
              options={UNIT_OPTIONS}
              defaultValue="Cái"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Section 2: Classification
  const renderClassification = () => (
    <Card
      style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AppstoreOutlined style={{ color: '#a855f7' }} />
          Phân loại sản phẩm
        </span>
      }
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} md={8}>
          <Form.Item
            name="productType"
            label="Loại sản phẩm"
            rules={[{ required: true }]}
            initialValue="DEVICE"
          >
            <Select
              placeholder="Chọn loại sản phẩm"
              onChange={handleProductTypeChange}
              options={Object.entries(PRODUCT_TYPE_CONFIG).map(([key, config]) => ({
                value: key,
                label: (
                  <span>
                    <Tag color={config.color} className="mr-2">{config.label}</Tag>
                  </span>
                ),
              }))}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="ACTIVE"
          >
            <Select
              options={Object.entries(STATUS_CONFIG).map(([key, config]) => {
                const colorMap: Record<string, string> = {
                  green: '#22c55e',
                  red: '#ef4444',
                  gray: '#9ca3af',
                  yellow: '#eab308',
                };
                return {
                  value: key,
                  label: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: colorMap[config.color] || '#9ca3af',
                        display: 'inline-block'
                      }}></span>
                      {config.label}
                    </span>
                  ),
                };
              })}
            />
          </Form.Item>
        </Col>

        {/* Category */}
        <Col xs={24} md={16}>
          <Form.Item name="categoryId" label="Danh mục sản phẩm">
            <Select
              showSearch
              placeholder="Chọn danh mục"
              allowClear
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={categories.map((cat) => ({
                value: cat.categoryID,
                label: cat.categoryName,
              }))}
              loading={categories.length === 0}
              notFoundContent={categories.length === 0 ? 'Đang tải danh mục...' : 'Không có danh mục'}
            />
          </Form.Item>
        </Col>

        {/* Supplier (Manufacturer) */}
        <Col xs={24} md={16}>
          <Form.Item
            name="supplierId"
            label="Nhà sản xuất / Nhà cung cấp"
            tooltip="Chọn nhà sản xuất (Manufacturer) của sản phẩm này"
          >
            <Select
              showSearch
              placeholder="Chọn nhà sản xuất"
              allowClear
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={suppliers.map((sup) => ({
                value: sup.supplierID,
                label: `${sup.supplierName} (${sup.supplierCode})`,
              }))}
              loading={suppliers.length === 0}
              notFoundContent={suppliers.length === 0 ? 'Đang tải...' : 'Không có nhà cung cấp'}
            />
          </Form.Item>
        </Col>

        {/* Serialized */}
        <Col xs={24} md={12}>
          <Form.Item
            name="isSerialized"
            label={
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                Quản lý theo Serial/IMEI
                <Tooltip title="Bật nếu cần quét mã Serial/IMEI cho từng sản phẩm khi nhập xuất kho">
                  <QuestionCircleOutlined style={{ color: '#9ca3af' }} />
                </Tooltip>
              </span>
            }
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Có Serial"
              unCheckedChildren="Số lượng"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Section 3: Pricing
  const renderPricing = () => (
    <Card
      style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarOutlined style={{ color: '#22c55e' }} />
          Giá cả
        </span>
      }
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} md={8}>
          <Form.Item name="basePrice" label="Giá nhập (Vốn)">
            <InputNumber
              className="w-full"
              min={0}
              formatter={formatCurrency}
              parser={parseCurrency}
              addonAfter="₫"
              placeholder="0"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="sellPrice" label="Giá bán lẻ (Niêm yết)">
            <InputNumber
              className="w-full"
              min={0}
              formatter={formatCurrency}
              parser={parseCurrency}
              addonAfter="₫"
              placeholder="0"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="wholesalePrice" label="Giá sỉ">
            <InputNumber
              className="w-full"
              min={0}
              formatter={formatCurrency}
              parser={parseCurrency}
              addonAfter="₫"
              placeholder="0"
            />
          </Form.Item>
        </Col>
      </Row>

      <Alert
        message="Lợi nhuận được tính tự động khi bạn nhập Giá nhập và Giá bán"
        type="info"
        showIcon
        style={{ marginTop: 8 }}
      />
    </Card>
  );

  // Section 4: Inventory & Warranty
  const renderInventory = () => (
    <Card
      style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BoxPlotOutlined style={{ color: '#f97316' }} />
          Kho hàng & Bảo hành
        </span>
      }
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} md={6}>
          <Form.Item
            name="minStockLevel"
            label="Tồn kho tối thiểu"
            tooltip="Cảnh báo khi số lượng tồn dưới mức này"
          >
            <InputNumber className="w-full" min={0} placeholder="0" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item name="maxStockLevel" label="Tồn kho tối đa">
            <InputNumber className="w-full" min={0} placeholder="Không giới hạn" />
          </Form.Item>
        </Col>
        <Col xs={24} md={6}>
          <Form.Item
            name="defaultWarrantyMonths"
            label={
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <SafetyCertificateOutlined style={{ color: '#22c55e' }} />
                Bảo hành (tháng)
              </span>
            }
            initialValue={12}
          >
            <InputNumber className="w-full" min={0} max={120} addonAfter="tháng" />
          </Form.Item>
        </Col>
      </Row>

      <Divider style={{ fontSize: '14px', color: '#6b7280' }}>
        Thông tin vật lý (Vận chuyển)
      </Divider>

      <Row gutter={[24, 16]}>
        <Col xs={12} md={6}>
          <Form.Item name="weight" label="Trọng lượng">
            <InputNumber className="w-full" min={0} step={0.1} addonAfter="kg" placeholder="0.0" />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item name="length" label="Dài">
            <InputNumber className="w-full" min={0} step={0.1} addonAfter="cm" placeholder="0.0" />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item name="width" label="Rộng">
            <InputNumber className="w-full" min={0} step={0.1} addonAfter="cm" placeholder="0.0" />
          </Form.Item>
        </Col>
        <Col xs={12} md={6}>
          <Form.Item name="height" label="Cao">
            <InputNumber className="w-full" min={0} step={0.1} addonAfter="cm" placeholder="0.0" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Section 5: Media
  const renderMedia = () => (
    <Card
      style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PictureOutlined style={{ color: '#ec4899' }} />
          Hình ảnh & Media
        </span>
      }
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} md={16}>
          <Form.Item
            name="imageUrl"
            label="URL ảnh sản phẩm"
            tooltip="Dán link ảnh sản phẩm, ảnh sẽ hiển thị bên cạnh"
          >
            <Input
              prefix={<LinkOutlined style={{ color: '#9ca3af' }} />}
              placeholder="https://example.com/image.jpg"
              onChange={(e) => setPreviewImage(e.target.value)}
              allowClear
            />
          </Form.Item>

          <Text type="secondary" style={{ fontSize: '12px' }}>
            Hỗ trợ định dạng: JPG, PNG, WebP. Click vào ảnh để xem phóng to.
          </Text>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item label="Xem trước">
            <div
              style={{
                border: '1px dashed #d9d9d9',
                borderRadius: 8,
                padding: 8,
                minHeight: 150,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fafafa'
              }}
            >
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Ảnh sản phẩm"
                  style={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    objectFit: 'contain',
                    cursor: 'pointer'
                  }}
                  preview={{
                    mask: (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <PictureOutlined style={{ fontSize: 20 }} />
                        <span style={{ fontSize: 12 }}>Xem ảnh</span>
                      </div>
                    ),
                  }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesANyIGdIYAAAAJcEhZcwAADsQAAA7EAZUrDhsAABzSSURBVHhe7d0JnFTVnffxX3dVdVVXL2xNN82+L7KIgIIgiKIiis4YNWNcWDTGJM5MJidxlsxMnMnEySTjmJiMxjHGMZGJJq64gsgiIpsLOwIiW0M33dC0dNWu+qGp4uXee+vWq+6upqq7+P95P1Jd9S73nHv/59xzb1VRTE8FYMFDz4Gz/w7gGAwBEBgCIDAEQGAIgMAQAIEhAAJDAASGAAgMARAYAiAwBEBgCIDAEACBIQACQwAEhgAIDAEQGAIgMARAYAiAwBAAgSEAAkMABIYACAwBEBgCIDAEQGAIgMAQAIEhAAJDAASGAAgMARAYAiAwBEBgCIDAEACBIQACQwAEhgAIDAEQGAIgMARAYAiAwBAAgSEAAkMABIYACA=="
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#9ca3af' }}>
                  <PictureOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                  <div style={{ fontSize: 12 }}>Chưa có ảnh</div>
                  <div style={{ fontSize: 11 }}>Dán URL ảnh bên trái</div>
                </div>
              )}
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Section 6: Specifications (Dynamic with Groups)
  const renderSpecifications = () => (
    <Card
      style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingOutlined style={{ color: '#6366f1' }} />
          Thông số kỹ thuật
        </span>
      }
    >
      <Form.List name="specifications">
        {(groupFields, { add: addGroup, remove: removeGroup }) => (
          <>
            {groupFields.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>
                Chưa có thông số kỹ thuật. Click nút bên dưới để thêm nhóm thông số.
              </div>
            )}

                  {groupFields.map(({ key: groupKey, name: groupName, ...groupRestField }) => (
                    <Card
                      key={groupKey}
                      size="small"
                      style={{ marginBottom: 16, backgroundColor: '#f9fafb' }}
                      title={
                        <Form.Item
                          {...groupRestField}
                          name={[groupName, 'groupName']}
                          rules={[{ required: true, message: 'Nhập tên nhóm' }]}
                          className="mb-0"
                          style={{ flex: 1 }}
                        >
                          <Input
                            placeholder="Tên nhóm (VD: PERFORMANCE PARAMETER)"
                            style={{ fontWeight: 600, textTransform: 'uppercase' }}
                          />
                        </Form.Item>
                      }
                      extra={
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeGroup(groupName)}
                          size="small"
                        >
                          Xóa nhóm
                        </Button>
                      }
                    >
                      <Form.List name={[groupName, 'items']}>
                        {(itemFields, { add: addItem, remove: removeItem }) => (
                          <>
                            {/* Header */}
                            {itemFields.length > 0 && (
                              <Row gutter={8} style={{ marginBottom: 8, paddingLeft: 4 }}>
                                <Col xs={9}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>Thông số (k)</Text>
                                </Col>
                                <Col xs={10}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>Giá trị (v)</Text>
                                </Col>
                                <Col xs={3}>
                                  <Tooltip title="Hiển thị khi báo giá (q)">
                                    <Text type="secondary" style={{ fontSize: 12 }}>Báo giá</Text>
                                  </Tooltip>
                                </Col>
                                <Col xs={2}></Col>
                              </Row>
                            )}

                            {itemFields.map(({ key: itemKey, name: itemName, ...itemRestField }) => (
                              <Row key={itemKey} gutter={8} align="middle" style={{ marginBottom: 8 }}>
                                <Col xs={9}>
                                  <Form.Item
                                    {...itemRestField}
                                    name={[itemName, 'k']}
                                    rules={[{ required: true, message: 'Nhập tên' }]}
                                    className="mb-0"
                                  >
                                    <Input placeholder="VD: CPU, RAM" size="small" />
                                  </Form.Item>
                                </Col>
                                <Col xs={10}>
                                  <Form.Item
                                    {...itemRestField}
                                    name={[itemName, 'v']}
                                    rules={[{ required: true, message: 'Nhập giá trị' }]}
                                    className="mb-0"
                                  >
                                    <Input placeholder="VD: Octa-core 2.0GHz" size="small" />
                                  </Form.Item>
                                </Col>
                                <Col xs={3} style={{ textAlign: 'center' }}>
                                  <Form.Item
                                    {...itemRestField}
                                    name={[itemName, 'q']}
                                    valuePropName="checked"
                                    className="mb-0"
                                  >
                                    <Switch size="small" />
                                  </Form.Item>
                                </Col>
                                <Col xs={2}>
                                  <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<MinusCircleOutlined />}
                                    onClick={() => removeItem(itemName)}
                                  />
                                </Col>
                              </Row>
                            ))}

                            <Button
                              type="dashed"
                              onClick={() => addItem({ k: '', v: '', q: false })}
                              block
                              icon={<PlusOutlined />}
                              size="small"
                              style={{ marginTop: 4 }}
                            >
                              Thêm thông số
                            </Button>
                          </>
                        )}
                      </Form.List>
                    </Card>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => addGroup({ groupName: '', items: [] })}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginTop: 8 }}
                  >
                    Thêm nhóm thông số kỹ thuật
                  </Button>
                </>
              )}
            </Form.List>

      <Collapse
        ghost
        style={{ marginTop: 16 }}
        items={[{
          key: '1',
          label: <Text type="secondary" style={{ fontSize: '12px' }}>Gợi ý nhóm thông số phổ biến</Text>,
          children: (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {[
                { name: 'PERFORMANCE PARAMETER', items: ['OS', 'CPU', 'RAM / Flash', 'USB Charging'] },
                { name: 'PHYSICAL SPECIFICATIONS', items: ['Weight', 'Dimension', 'LCD', 'Battery', 'Camera'] },
                { name: 'ENVIRONMENTAL SPECIFICATIONS', items: ['IP Rating', 'Drop', 'Operation Temperature'] },
                { name: 'COMMUNICATION', items: ['WiFi', 'Bluetooth', '4G/LTE', 'NFC'] },
              ].map(group => (
                <Tag
                  key={group.name}
                  color="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    const specs = form.getFieldValue('specifications') || [];
                    form.setFieldValue('specifications', [
                      ...specs,
                      {
                        groupName: group.name,
                        items: group.items.map(item => ({ k: item, v: '', q: false }))
                      }
                    ]);
                  }}
                >
                  + {group.name}
                </Tag>
              ))}
            </div>
          ),
        }]}
      />
    </Card>
  );

  // Section 7: Tags
  const renderTags = () => (
    <Card
      style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <TagsOutlined style={{ color: '#06b6d4' }} />
          Tags & Từ khóa
        </span>
      }
    >
      <Form.Item
        name="tags"
        label="Tags tìm kiếm"
        tooltip="Các từ khóa giúp tìm kiếm sản phẩm nhanh hơn"
      >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder="Nhập tag và nhấn Enter"
          tokenSeparators={[',']}
          options={[
            { value: 'Android', label: 'Android' },
            { value: 'Bluetooth', label: 'Bluetooth' },
            { value: 'IP65', label: 'IP65' },
            { value: 'IP67', label: 'IP67' },
            { value: '2D Scanner', label: '2D Scanner' },
            { value: '1D Scanner', label: '1D Scanner' },
            { value: 'NFC', label: 'NFC' },
            { value: 'RFID', label: 'RFID' },
            { value: 'WiFi', label: 'WiFi' },
            { value: '4G', label: '4G' },
            { value: 'Enterprise', label: 'Enterprise' },
          ]}
        />
      </Form.Item>

      <Form.Item
        name="competitors"
        label="Sản phẩm đối thủ cạnh tranh"
        tooltip="Nhập tên các sản phẩm tương tự từ hãng khác"
      >
        <Select
          mode="tags"
          style={{ width: '100%' }}
          placeholder="VD: Zebra TC21, Honeywell EDA50"
          tokenSeparators={[',']}
        />
      </Form.Item>
    </Card>
  );

  // Section 8: Documents
  const renderDocuments = () => (
    <Card
      style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTextOutlined style={{ color: '#f59e0b' }} />
          Tài liệu đính kèm
        </span>
      }
    >
      <Form.List name="documents">
        {(fields, { add, remove }) => (
          <>
            {fields.length === 0 && (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af' }}>
                Chưa có tài liệu. Click nút bên dưới để thêm.
              </div>
            )}

            {fields.map(({ key, name, ...restField }) => (
              <div
                key={key}
                style={{ display: 'flex', gap: 12, marginBottom: 12, padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, alignItems: 'center' }}
              >
                <FileTextOutlined style={{ fontSize: '20px', color: '#3b82f6' }} />

                <Form.Item
                  {...restField}
                  name={[name, 'type']}
                  className="mb-0 w-40"
                >
                  <Select
                    placeholder="Loại tài liệu"
                    options={DOCUMENT_TYPES}
                    size="small"
                  />
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, 'title']}
                  className="mb-0 flex-1"
                >
                  <Input placeholder="Tên tài liệu" size="small" />
                </Form.Item>

                <Form.Item
                  {...restField}
                  name={[name, 'url']}
                  className="mb-0 w-64"
                >
                  <Input
                    prefix={<LinkOutlined />}
                    placeholder="URL tải về"
                    size="small"
                  />
                </Form.Item>

                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => remove(name)}
                />
              </div>
            ))}

            <Button
              type="dashed"
              onClick={() => add({ type: 'USER_MANUAL', title: '', url: '' })}
              block
              icon={<PlusOutlined />}
            >
              Thêm tài liệu
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  );

  // Section 9: Description
  const renderDescription = () => (
    <Card
      style={{ marginBottom: 24, boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileTextOutlined style={{ color: '#6b7280' }} />
          Mô tả sản phẩm
        </span>
      }
    >
      <Form.Item name="shortDescription" label="Mô tả ngắn">
        <TextArea
          rows={2}
          maxLength={500}
          showCount
          placeholder="Mô tả ngắn gọn về sản phẩm (hiển thị trong danh sách)"
        />
      </Form.Item>

      <Form.Item name="fullDescription" label="Mô tả đầy đủ">
        <TextArea
          rows={6}
          placeholder="Mô tả chi tiết sản phẩm (hỗ trợ HTML)"
        />
      </Form.Item>
    </Card>
  );

  // ============================================================
  // MAIN RENDER
  // ============================================================
  return (
    <div className="w-full mx-auto">
      {/* Sticky Header */}
      <div className="bg-white border-b shadow-sm mb-6">
        <div className="py-4 px-6">
          <Breadcrumb
            className="mb-3"
            items={[
              { title: <Link to="/admin/inventory/products">Sản phẩm</Link> },
              { title: isEditMode ? 'Chỉnh sửa' : 'Thêm mới' },
            ]}
          />

          <div className="flex flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/inventory/products')}
              />
              <div>
                <Title level={3} className="m-0">
                  {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </Title>
                <Text type="secondary" className="text-sm">
                  {isEditMode ? 'Cập nhật thông tin sản phẩm' : 'Điền đầy đủ thông tin để tạo sản phẩm'}
                </Text>
              </div>
            </div>

            <Space>
              <Button onClick={() => navigate('/admin/inventory/products')}>
                Hủy
              </Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={loading}
                onClick={() => form.submit()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isEditMode ? 'Cập nhật' : 'Tạo sản phẩm'}
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Form */}
      <Spin spinning={loadingData} tip="Đang tải thông tin sản phẩm...">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            productType: 'DEVICE',
            status: 'ACTIVE',
            isSerialized: true,
            defaultWarrantyMonths: 12,
            unit: 'Cái',
          }}
          scrollToFirstError
        >
          {renderBasicInfo()}
          {renderClassification()}
          {renderPricing()}
          {renderInventory()}
          {renderMedia()}
          {renderSpecifications()}
          {renderTags()}
          {renderDocuments()}
          {renderDescription()}
        </Form>
      </Spin>
    </div>
  );
};

export default ProductCreate;