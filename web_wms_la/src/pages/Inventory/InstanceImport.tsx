import React, { useState, useRef, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  Space,
  Table,
  Typography,
  Divider,
  message,
  Tag,
  Breadcrumb,
  InputNumber,
  Alert,
  Modal,
  Tooltip,
  AutoComplete,
  Empty,
  Popconfirm,
  Badge,
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  BarcodeOutlined,
  ScanOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ClearOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  QrcodeOutlined,
  AppstoreOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { InputRef } from 'antd';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// ============================================================================
// TYPES
// ============================================================================

interface InstanceItem {
  key: string;
  serialNumber: string;
  partNumber?: string;
  modelNumber?: string;
  imei1?: string;
  imei2?: string;
  macAddress?: string;
  actualImportPrice?: number;
  notes?: string;
  status: 'valid' | 'error' | 'duplicate' | 'checking';
  errorMessage?: string;
}

interface Component {
  componentId: string;
  sku: string;
  componentName: string;
  brand?: string;
  isSerialized: boolean;
  basePrice?: number;
  defaultWarrantyMonths?: number;
}

interface Warehouse {
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockComponents: Component[] = [
  { componentId: '1', sku: 'MOBY-M63-V2', componentName: 'Máy kiểm kho PDA Mobydata M63 V2', brand: 'Mobydata', isSerialized: true, basePrice: 5500000, defaultWarrantyMonths: 12 },
  { componentId: '2', sku: 'ZEBRA-TC21', componentName: 'Zebra TC21 Android Mobile Computer', brand: 'Zebra', isSerialized: true, basePrice: 12000000, defaultWarrantyMonths: 24 },
  { componentId: '3', sku: 'ZEB-ZD421-DT', componentName: 'Zebra ZD421 Direct Thermal Printer', brand: 'Zebra', isSerialized: true, basePrice: 8500000, defaultWarrantyMonths: 12 },
  { componentId: '4', sku: 'HON-1400G', componentName: 'Máy quét mã vạch Honeywell Voyager 1400g', brand: 'Honeywell', isSerialized: true, basePrice: 2800000, defaultWarrantyMonths: 12 },
  { componentId: '5', sku: 'ESL-29-BW', componentName: 'Electronic Shelf Label 2.9 inch', brand: 'Hanshow', isSerialized: false, basePrice: 180000, defaultWarrantyMonths: 36 },
];

const mockWarehouses: Warehouse[] = [
  { warehouseId: 'wh-1', warehouseName: 'Kho Tổng HCM', warehouseCode: 'HCM-01' },
  { warehouseId: 'wh-2', warehouseName: 'Kho CN Hà Nội', warehouseCode: 'HN-01' },
  { warehouseId: 'wh-3', warehouseName: 'Kho Bảo Hành', warehouseCode: 'BH-01' },
];

// Danh sách serial đã tồn tại (mock)
const existingSerials = ['M63V2-2024-00001', 'M63V2-2024-00002', 'TC21-SN-99887765'];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const InstanceImport: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const serialInputRef = useRef<InputRef>(null);

  // States
  const [loading, setLoading] = useState(false);
  const [instances, setInstances] = useState<InstanceItem[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [serialInput, setSerialInput] = useState('');
  const [scanMode, setScanMode] = useState(true); // Chế độ quét mã nhanh
  const [batchInputModal, setBatchInputModal] = useState(false);
  const [batchText, setBatchText] = useState('');

  // Focus vào ô nhập serial sau khi thêm
  useEffect(() => {
    if (scanMode && serialInputRef.current) {
      serialInputRef.current.focus();
    }
  }, [instances.length, scanMode]);

  // Kiểm tra Serial Number
  const validateSerial = (serial: string): { valid: boolean; error?: string } => {
    if (!serial.trim()) {
      return { valid: false, error: 'Serial không được để trống' };
    }
    if (serial.length < 3) {
      return { valid: false, error: 'Serial quá ngắn (tối thiểu 3 ký tự)' };
    }
    if (existingSerials.includes(serial)) {
      return { valid: false, error: 'Serial đã tồn tại trong hệ thống' };
    }
    if (instances.some(item => item.serialNumber === serial)) {
      return { valid: false, error: 'Serial đã có trong danh sách nhập' };
    }
    return { valid: true };
  };

  // Thêm Serial vào danh sách
  const handleAddSerial = () => {
    if (!selectedComponent) {
      message.warning('Vui lòng chọn sản phẩm trước');
      return;
    }

    const serial = serialInput.trim();
    if (!serial) return;

    const validation = validateSerial(serial);
    const newItem: InstanceItem = {
      key: `${Date.now()}-${Math.random()}`,
      serialNumber: serial,
      actualImportPrice: selectedComponent.basePrice,
      status: validation.valid ? 'valid' : 'error',
      errorMessage: validation.error,
    };

    setInstances(prev => [newItem, ...prev]);
    setSerialInput('');

    if (validation.valid) {
      message.success(`Đã thêm: ${serial}`);
    } else {
      message.error(validation.error);
    }
  };

  // Nhập hàng loạt từ text
  const handleBatchImport = () => {
    if (!selectedComponent) {
      message.warning('Vui lòng chọn sản phẩm trước');
      return;
    }

    const lines = batchText.split('\n').filter(line => line.trim());
    const newItems: InstanceItem[] = [];

    lines.forEach(line => {
      const serial = line.trim();
      if (!serial) return;

      const validation = validateSerial(serial);
      // Kiểm tra trùng trong batch
      if (newItems.some(item => item.serialNumber === serial)) {
        newItems.push({
          key: `${Date.now()}-${Math.random()}`,
          serialNumber: serial,
          actualImportPrice: selectedComponent.basePrice,
          status: 'duplicate',
          errorMessage: 'Trùng trong danh sách nhập',
        });
      } else {
        newItems.push({
          key: `${Date.now()}-${Math.random()}`,
          serialNumber: serial,
          actualImportPrice: selectedComponent.basePrice,
          status: validation.valid ? 'valid' : 'error',
          errorMessage: validation.error,
        });
      }
    });

    setInstances(prev => [...newItems, ...prev]);
    setBatchInputModal(false);
    setBatchText('');

    const validCount = newItems.filter(i => i.status === 'valid').length;
    const errorCount = newItems.length - validCount;
    message.info(`Đã thêm ${validCount} serial hợp lệ, ${errorCount} lỗi`);
  };

  // Xóa item
  const handleRemoveItem = (key: string) => {
    setInstances(prev => prev.filter(item => item.key !== key));
  };

  // Xóa tất cả lỗi
  const handleRemoveErrors = () => {
    setInstances(prev => prev.filter(item => item.status === 'valid'));
    message.success('Đã xóa các serial lỗi');
  };

  // Xóa tất cả
  const handleClearAll = () => {
    setInstances([]);
    message.info('Đã xóa tất cả');
  };

  // Cập nhật giá cho một item
  const handleUpdatePrice = (key: string, price: number) => {
    setInstances(prev => prev.map(item =>
      item.key === key ? { ...item, actualImportPrice: price } : item
    ));
  };

  // Cập nhật ghi chú
  const handleUpdateNotes = (key: string, notes: string) => {
    setInstances(prev => prev.map(item =>
      item.key === key ? { ...item, notes } : item
    ));
  };

  // Submit
  const handleSubmit = async () => {
    const values = await form.validateFields();
    const validInstances = instances.filter(i => i.status === 'valid');

    if (validInstances.length === 0) {
      message.error('Không có serial hợp lệ để nhập kho');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        componentId: selectedComponent?.componentId,
        warehouseId: values.warehouseId,
        zone: values.zone,
        inboundBoxNumber: values.inboundBoxNumber,
        purchaseOrderCode: values.purchaseOrderCode,
        instances: validInstances.map(item => ({
          serialNumber: item.serialNumber,
          partNumber: item.partNumber,
          modelNumber: item.modelNumber,
          imei1: item.imei1,
          imei2: item.imei2,
          macAddress: item.macAddress,
          actualImportPrice: item.actualImportPrice,
          notes: item.notes,
        })),
      };

      console.log('Payload:', payload);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      message.success(`Đã nhập ${validInstances.length} thiết bị vào kho thành công!`);
      navigate('/admin/inventory/instances');
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = {
    total: instances.length,
    valid: instances.filter(i => i.status === 'valid').length,
    error: instances.filter(i => i.status !== 'valid').length,
    totalValue: instances
      .filter(i => i.status === 'valid')
      .reduce((sum, i) => sum + (i.actualImportPrice || 0), 0),
  };

  // Columns
  const columns: ColumnsType<InstanceItem> = [
    {
      title: '#',
      key: 'index',
      width: 50,
      align: 'center',
      render: (_, __, index) => <span className="text-gray-400">{index + 1}</span>,
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      key: 'serial',
      width: 220,
      render: (text, record) => (
        <div className="flex items-center gap-2">
          {record.status === 'valid' ? (
            <CheckCircleOutlined className="text-green-500" />
          ) : (
            <WarningOutlined className="text-red-500" />
          )}
          <span className="font-mono font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 180,
      render: (_, record) => {
        if (record.status === 'valid') {
          return <Tag color="success" icon={<CheckCircleOutlined />}>Hợp lệ</Tag>;
        }
        return (
          <Tooltip title={record.errorMessage}>
            <Tag color="error" icon={<WarningOutlined />}>
              {record.errorMessage || 'Lỗi'}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Giá nhập',
      key: 'price',
      width: 180,
      render: (_, record) => (
        <InputNumber
          value={record.actualImportPrice}
          onChange={val => handleUpdatePrice(record.key, val || 0)}
          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => Number(value?.replace(/,/g, '') || 0)}
          className="w-full"
          min={0}
          addonAfter="₫"
          disabled={record.status !== 'valid'}
        />
      ),
    },
    {
      title: 'Ghi chú',
      key: 'notes',
      width: 200,
      render: (_, record) => (
        <Input
          value={record.notes}
          onChange={e => handleUpdateNotes(record.key, e.target.value)}
          placeholder="Ghi chú..."
          className="w-full"
          disabled={record.status !== 'valid'}
        />
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      ),
    },
  ];

  // Format currency
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb
        className="mb-4"
        items={[
          { title: <Link to="/admin/inventory/instances">Quản lý Serial</Link> },
          { title: 'Nhập thiết bị' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <Title level={3} className="m-0 flex items-center gap-3">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/inventory/instances')}
            />
            <InboxOutlined className="text-blue-600" />
            Nhập thiết bị mới
          </Title>
          <Text type="secondary" className="ml-10">
            Nhập các thiết bị với Serial Number vào kho hàng
          </Text>
        </div>
        <Space>
          <Button onClick={() => navigate('/admin/inventory/instances')}>Hủy</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={handleSubmit}
            disabled={stats.valid === 0}
            className="bg-blue-600"
          >
            Nhập kho ({stats.valid} thiết bị)
          </Button>
        </Space>
      </div>

      <Row gutter={24}>
        {/* LEFT: Form thông tin */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <span className="flex items-center gap-2">
                <AppstoreOutlined className="text-blue-500" />
                Thông tin nhập kho
              </span>
            }
            className="shadow-sm mb-6"
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                zone: 'MAIN',
              }}
            >
              {/* Chọn sản phẩm */}
              <Form.Item
                name="componentId"
                label="Sản phẩm"
                rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn sản phẩm cần nhập..."
                  optionFilterProp="label"
                  onChange={(_, option: any) => {
                    const comp = mockComponents.find(c => c.componentId === option.value);
                    setSelectedComponent(comp || null);
                    form.setFieldValue('componentId', option.value);
                  }}
                  options={mockComponents.map(c => ({
                    value: c.componentId,
                    label: `${c.sku} - ${c.componentName}`,
                    component: c,
                  }))}
                  optionRender={(option) => {
                    const comp = option.data.component as Component;
                    return (
                      <div>
                        <div className="font-medium">{comp.componentName}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Tag className="m-0">{comp.sku}</Tag>
                          <span>{comp.brand}</span>
                          {comp.isSerialized ? (
                            <Tag color="purple" className="m-0">Serial</Tag>
                          ) : (
                            <Tag color="cyan" className="m-0">Số lượng</Tag>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
              </Form.Item>

              {/* Hiển thị thông tin sản phẩm đã chọn */}
              {selectedComponent && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="font-medium text-blue-800">{selectedComponent.componentName}</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Tag>{selectedComponent.sku}</Tag>
                    <Tag color="green">Giá: {formatCurrency(selectedComponent.basePrice || 0)}</Tag>
                    <Tag color="orange">BH: {selectedComponent.defaultWarrantyMonths} tháng</Tag>
                  </div>
                </div>
              )}

              {/* Chọn kho */}
              <Form.Item
                name="warehouseId"
                label="Kho nhập"
                rules={[{ required: true, message: 'Vui lòng chọn kho' }]}
              >
                <Select
                  placeholder="Chọn kho nhập hàng"
                  options={mockWarehouses.map(w => ({
                    value: w.warehouseId,
                    label: (
                      <span className="flex items-center gap-2">
                        <EnvironmentOutlined />
                        {w.warehouseName}
                        <Tag className="m-0">{w.warehouseCode}</Tag>
                      </span>
                    ),
                  }))}
                />
              </Form.Item>

              {/* Khu vực */}
              <Form.Item name="zone" label="Khu vực trong kho">
                <Select
                  options={[
                    { value: 'MAIN', label: 'Khu chính (MAIN)' },
                    { value: 'REPAIR', label: 'Khu sửa chữa (REPAIR)' },
                    { value: 'DEMO', label: 'Khu trưng bày (DEMO)' },
                    { value: 'QUARANTINE', label: 'Khu cách ly (QUARANTINE)' },
                  ]}
                />
              </Form.Item>

              {/* Mã thùng hàng */}
              <Form.Item name="inboundBoxNumber" label="Mã thùng hàng">
                <Input placeholder="VD: BOX-2024-001" />
              </Form.Item>

              {/* Mã đơn hàng nhập */}
              <Form.Item name="purchaseOrderCode" label="Mã đơn nhập hàng (PO)">
                <Input placeholder="VD: PO-2024-0012" />
              </Form.Item>
            </Form>
          </Card>

          {/* Stats Card */}
          <Card className="shadow-sm bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-gray-500 text-sm">Tổng Serial</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.valid}</div>
                <div className="text-gray-500 text-sm">Hợp lệ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500">{stats.error}</div>
                <div className="text-gray-500 text-sm">Lỗi</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-700">{formatCurrency(stats.totalValue)}</div>
                <div className="text-gray-500 text-sm">Tổng giá trị</div>
              </div>
            </div>
          </Card>
        </Col>

        {/* RIGHT: Nhập Serial & Danh sách */}
        <Col xs={24} lg={16}>
          {/* Input Serial */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <ScanOutlined className="text-green-500" />
                Nhập Serial Number
              </span>
            }
            className="shadow-sm mb-6"
            extra={
              <Space>
                <Button
                  icon={<FileExcelOutlined />}
                  onClick={() => setBatchInputModal(true)}
                >
                  Nhập hàng loạt
                </Button>
              </Space>
            }
          >
            {!selectedComponent ? (
              <Alert
                message="Vui lòng chọn sản phẩm"
                description="Bạn cần chọn sản phẩm ở bên trái trước khi nhập serial"
                type="warning"
                showIcon
              />
            ) : (
              <>
                <div className="flex gap-3 mb-4">
                  <Input
                    ref={serialInputRef}
                    size="large"
                    placeholder="Quét hoặc nhập Serial Number rồi nhấn Enter..."
                    prefix={<BarcodeOutlined className="text-gray-400" />}
                    value={serialInput}
                    onChange={e => setSerialInput(e.target.value)}
                    onPressEnter={handleAddSerial}
                    className="flex-1 font-mono"
                    autoFocus
                  />
                  <Button
                    type="primary"
                    size="large"
                    icon={<PlusOutlined />}
                    onClick={handleAddSerial}
                    className="bg-green-600"
                  >
                    Thêm
                  </Button>
                </div>

                <Alert
                  message={
                    <span>
                      <b>Mẹo:</b> Sử dụng máy quét mã vạch để nhập nhanh. Mỗi lần quét sẽ tự động thêm vào danh sách.
                    </span>
                  }
                  type="info"
                  showIcon
                  className="mb-4"
                />
              </>
            )}
          </Card>

          {/* Danh sách Serial */}
          <Card
            title={
              <span className="flex items-center gap-2">
                <BarcodeOutlined className="text-purple-500" />
                Danh sách Serial đã nhập
                <Badge count={stats.total} className="ml-2" />
              </span>
            }
            className="shadow-sm"
            extra={
              <Space>
                {stats.error > 0 && (
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={handleRemoveErrors}
                  >
                    Xóa lỗi ({stats.error})
                  </Button>
                )}
                <Popconfirm
                  title="Xóa tất cả serial?"
                  onConfirm={handleClearAll}
                  okText="Xóa"
                  cancelText="Hủy"
                  disabled={instances.length === 0}
                >
                  <Button
                    size="small"
                    icon={<ClearOutlined />}
                    disabled={instances.length === 0}
                  >
                    Xóa tất cả
                  </Button>
                </Popconfirm>
              </Space>
            }
          >
            {instances.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có Serial nào. Hãy quét hoặc nhập serial ở trên."
              />
            ) : (
              <Table
                columns={columns}
                dataSource={instances}
                rowKey="key"
                pagination={{ pageSize: 10, showSizeChanger: true }}
                size="small"
                scroll={{ x: 800 }}
                rowClassName={(record) =>
                  record.status !== 'valid' ? 'bg-red-50' : ''
                }
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Modal nhập hàng loạt */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <FileExcelOutlined className="text-green-500" />
            Nhập Serial hàng loạt
          </span>
        }
        open={batchInputModal}
        onCancel={() => setBatchInputModal(false)}
        onOk={handleBatchImport}
        okText="Thêm vào danh sách"
        cancelText="Hủy"
        width={600}
      >
        <Alert
          message="Hướng dẫn"
          description="Mỗi Serial Number một dòng. Hệ thống sẽ tự động kiểm tra và phân loại."
          type="info"
          showIcon
          className="mb-4"
        />
        <Input.TextArea
          rows={10}
          placeholder={`Nhập Serial Number, mỗi dòng một serial:

M63V2-2024-00010
M63V2-2024-00011
M63V2-2024-00012
TC21-SN-12345678
...`}
          value={batchText}
          onChange={e => setBatchText(e.target.value)}
          className="font-mono"
        />
        <div className="mt-2 text-gray-500 text-sm">
          Số dòng: {batchText.split('\n').filter(l => l.trim()).length}
        </div>
      </Modal>
    </div>
  );
};

export default InstanceImport;
