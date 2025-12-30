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
  Upload,
  Typography,
  Divider,
  message,
  Tooltip,
  Collapse,
  Tag,
  Breadcrumb,
  Alert,
  Image,
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
} from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { UploadProps } from 'antd';
import type {
  Component,
  ProductType,
} from '../../types/type.component';
import {
  PRODUCT_TYPE_CONFIG,
  DEVICE_TYPE_CONFIG,
  STATUS_CONFIG,
} from '../../types/type.component';

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
  const [productType, setProductType] = useState<ProductType>('DEVICE');
  const [previewImage, setPreviewImage] = useState<string>('');

  // Load data if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      // TODO: Fetch product data by ID
      message.info(`Đang tải thông tin sản phẩm: ${id}`);
    }
  }, [isEditMode, id]);

  // Watch productType changes
  const handleProductTypeChange = (value: ProductType) => {
    setProductType(value);
    if (value !== 'DEVICE') {
      form.setFieldValue('deviceType', undefined);
    }
  };

  // Submit form
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Convert specifications array to object
      const specObject = (values.specifications || []).reduce(
        (acc: Record<string, string>, curr: { key: string; value: string }) => {
          if (curr.key && curr.value) {
            acc[curr.key] = curr.value;
          }
          return acc;
        },
        {}
      );

      const payload: Partial<Component> = {
        ...values,
        specifications: specObject,
        tags: values.tags || [],
        documents: values.documents || [],
        competitors: values.competitors || [],
      };

      console.log('Payload gửi đi:', payload);

      // TODO: Call API create/update
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success(isEditMode ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
      navigate('/admin/inventory/products');
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
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

  // Upload props
  const uploadProps: UploadProps = {
    listType: 'picture-card',
    maxCount: 1,
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      return false;
    },
  };

  // ============================================================
  // RENDER SECTIONS
  // ============================================================

  // Section 1: Basic Info
  const renderBasicInfo = () => (
    <Card
      className="shadow-sm mb-6"
      title={
        <span className="flex items-center gap-2">
          <InfoCircleOutlined className="text-blue-500" />
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
              prefix={<BarcodeOutlined className="text-gray-400" />}
              placeholder="VD: MOBY-M63-V2"
              className="font-mono"
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item
            name="barcode"
            label="Mã vạch (Barcode/EAN)"
            tooltip="Mã vạch quốc tế của sản phẩm"
          >
            <Input placeholder="VD: 8935235123456" className="font-mono" />
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
      className="shadow-sm mb-6"
      title={
        <span className="flex items-center gap-2">
          <AppstoreOutlined className="text-purple-500" />
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
            name="deviceType"
            label="Loại thiết bị"
            tooltip="Chỉ áp dụng khi loại sản phẩm là Thiết bị"
          >
            <Select
              placeholder="Chọn loại thiết bị"
              disabled={productType !== 'DEVICE'}
              allowClear
              options={Object.entries(DEVICE_TYPE_CONFIG).map(([key, config]) => ({
                value: key,
                label: config.label,
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
              options={Object.entries(STATUS_CONFIG).map(([key, config]) => ({
                value: key,
                label: (
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full bg-${config.color}-500`}></span>
                    {config.label}
                  </span>
                ),
              }))}
            />
          </Form.Item>
        </Col>

        {/* Category */}
        <Col xs={24} md={12}>
          <Form.Item name="categoryId" label="Danh mục sản phẩm">
            <Select
              showSearch
              placeholder="Chọn danh mục"
              allowClear
              options={[
                { value: 'cat-1', label: 'Thiết bị cầm tay (Handheld)' },
                { value: 'cat-2', label: 'Máy in tem nhãn' },
                { value: 'cat-3', label: 'Nhãn giá điện tử (ESL)' },
                { value: 'cat-4', label: 'Phụ kiện thiết bị' },
                { value: 'cat-5', label: 'Vật tư tiêu hao' },
                { value: 'cat-6', label: 'Linh kiện thay thế' },
              ]}
            />
          </Form.Item>
        </Col>

        {/* Serialized */}
        <Col xs={24} md={12}>
          <Form.Item
            name="isSerialized"
            label={
              <span className="flex items-center gap-2">
                Quản lý theo Serial/IMEI
                <Tooltip title="Bật nếu cần quét mã Serial/IMEI cho từng sản phẩm khi nhập xuất kho">
                  <QuestionCircleOutlined className="text-gray-400" />
                </Tooltip>
              </span>
            }
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Có Serial"
              unCheckedChildren="Số lượng"
              className="bg-gray-300"
            />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  // Section 3: Pricing
  const renderPricing = () => (
    <Card
      className="shadow-sm mb-6"
      title={
        <span className="flex items-center gap-2">
          <DollarOutlined className="text-green-500" />
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
        className="mt-2"
      />
    </Card>
  );

  // Section 4: Inventory & Warranty
  const renderInventory = () => (
    <Card
      className="shadow-sm mb-6"
      title={
        <span className="flex items-center gap-2">
          <BoxPlotOutlined className="text-orange-500" />
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
              <span className="flex items-center gap-1">
                <SafetyCertificateOutlined className="text-green-500" />
                Bảo hành (tháng)
              </span>
            }
            initialValue={12}
          >
            <InputNumber className="w-full" min={0} max={120} addonAfter="tháng" />
          </Form.Item>
        </Col>
      </Row>

      <Divider className="text-sm text-gray-500">
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
      className="shadow-sm mb-6"
      title={
        <span className="flex items-center gap-2">
          <PictureOutlined className="text-pink-500" />
          Hình ảnh & Media
        </span>
      }
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} md={8}>
          <Form.Item name="imageUrl" label="Ảnh đại diện">
            <Upload {...uploadProps}>
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="preview"
                  style={{ width: '100%', height: 100, objectFit: 'contain' }}
                  preview={false}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-4">
                  <PlusOutlined />
                  <div className="mt-2 text-xs">Tải ảnh lên</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Col>
        <Col xs={24} md={16}>
          <Form.Item
            name="imageUrl"
            label="Hoặc nhập URL ảnh"
          >
            <Input
              prefix={<LinkOutlined className="text-gray-400" />}
              placeholder="https://example.com/image.jpg"
              onChange={(e) => setPreviewImage(e.target.value)}
            />
          </Form.Item>

          <Text type="secondary" className="text-xs">
            Hỗ trợ định dạng: JPG, PNG, WebP. Kích thước tối đa: 5MB
          </Text>
        </Col>
      </Row>
    </Card>
  );

  // Section 6: Specifications (Dynamic)
  const renderSpecifications = () => (
    <Card
      className="shadow-sm mb-6"
      title={
        <span className="flex items-center gap-2">
          <SettingOutlined className="text-indigo-500" />
          Thông số kỹ thuật
        </span>
      }
    >
      <Form.List name="specifications">
        {(fields, { add, remove }) => (
          <>
            {fields.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                Chưa có thông số kỹ thuật. Click nút bên dưới để thêm.
              </div>
            )}

            {fields.map(({ key, name, ...restField }) => (
              <Row key={key} gutter={16} align="middle" className="mb-3">
                <Col xs={10}>
                  <Form.Item
                    {...restField}
                    name={[name, 'key']}
                    rules={[{ required: true, message: 'Nhập tên thông số' }]}
                    className="mb-0"
                  >
                    <Input placeholder="Tên thông số (VD: CPU, RAM)" />
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item
                    {...restField}
                    name={[name, 'value']}
                    rules={[{ required: true, message: 'Nhập giá trị' }]}
                    className="mb-0"
                  >
                    <Input placeholder="Giá trị (VD: Octa-core 2.0GHz)" />
                  </Form.Item>
                </Col>
                <Col xs={2}>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                  />
                </Col>
              </Row>
            ))}

            <Button
              type="dashed"
              onClick={() => add()}
              block
              icon={<PlusOutlined />}
              className="mt-2"
            >
              Thêm thông số kỹ thuật
            </Button>
          </>
        )}
      </Form.List>

      <Collapse
        ghost
        className="mt-4"
        items={[{
          key: '1',
          label: <Text type="secondary" className="text-xs">Gợi ý thông số phổ biến</Text>,
          children: (
            <div className="flex flex-wrap gap-2">
              {['OS', 'CPU', 'RAM', 'Storage', 'Display', 'Battery', 'Scanner', 'IP Rating', 'Resolution', 'Print Width', 'Interface'].map(spec => (
                <Tag
                  key={spec}
                  className="cursor-pointer hover:bg-blue-50"
                  onClick={() => {
                    const specs = form.getFieldValue('specifications') || [];
                    form.setFieldValue('specifications', [...specs, { key: spec, value: '' }]);
                  }}
                >
                  + {spec}
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
      className="shadow-sm mb-6"
      title={
        <span className="flex items-center gap-2">
          <TagsOutlined className="text-cyan-500" />
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
      className="shadow-sm mb-6"
      title={
        <span className="flex items-center gap-2">
          <FileTextOutlined className="text-amber-500" />
          Tài liệu đính kèm
        </span>
      }
    >
      <Form.List name="documents">
        {(fields, { add, remove }) => (
          <>
            {fields.length === 0 && (
              <div className="text-center py-6 text-gray-400">
                Chưa có tài liệu. Click nút bên dưới để thêm.
              </div>
            )}

            {fields.map(({ key, name, ...restField }) => (
              <div
                key={key}
                className="flex gap-3 mb-3 p-3 bg-gray-50 rounded-lg items-center"
              >
                <FileTextOutlined className="text-xl text-blue-500" />

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
      className="shadow-sm mb-6"
      title={
        <span className="flex items-center gap-2">
          <FileTextOutlined className="text-gray-500" />
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
    <div className="w-full max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        className="mb-4"
        items={[
          { title: <Link to="/admin/inventory/products">Sản phẩm</Link> },
          { title: isEditMode ? 'Chỉnh sửa' : 'Thêm mới' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Title level={3} className="m-0 flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/inventory/products')}
            />
            {isEditMode ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </Title>
          <Text type="secondary" className="ml-10">
            {isEditMode ? 'Cập nhật thông tin sản phẩm' : 'Điền đầy đủ thông tin để tạo sản phẩm'}
          </Text>
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
            className="bg-blue-600"
          >
            {isEditMode ? 'Cập nhật' : 'Tạo sản phẩm'}
          </Button>
        </Space>
      </div>

      {/* Form */}
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

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t py-4 px-6 -mx-6 flex justify-end gap-3 shadow-lg">
          <Button onClick={() => navigate('/admin/inventory/products')}>
            Hủy bỏ
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => form.submit()}
            size="large"
            className="bg-blue-600 px-8"
          >
            {isEditMode ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProductCreate;