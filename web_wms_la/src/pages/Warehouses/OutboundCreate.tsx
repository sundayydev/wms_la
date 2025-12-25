import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  Table,
  Space,
  InputNumber,
  Modal,
  Tag,
  Typography,
  message,
  Divider,
  Row,
  Col,
  Alert
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  BarcodeOutlined,
  SearchOutlined,
  ExportOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ============================================================================
// 1. TYPES & MOCK DATA
// ============================================================================

interface CartItem {
  key: string;
  ComponentID: string;
  ComponentName: string;
  SKU: string;
  Unit: string;
  Quantity: number;
  IsSerialized: boolean;
  SelectedIMEIs: string[]; // Danh sách IMEI được chọn (nếu có)
}

// Mock kho hàng
const warehouses = [
  { label: 'Kho Tổng HCM', value: 'wh1' },
  { label: 'Kho Hà Nội', value: 'wh2' },
];

// Mock sản phẩm để tìm kiếm
const mockProducts = [
  { id: 'p1', name: 'iPhone 15 Pro Max 256GB', sku: 'IP15PM', unit: 'Cái', serialized: true, stock: 10 },
  { id: 'p2', name: 'Cáp sạc Type-C', sku: 'CAB-001', unit: 'Sợi', serialized: false, stock: 100 },
  { id: 'p3', name: 'Samsung S24 Ultra', sku: 'SS-S24', unit: 'Cái', serialized: true, stock: 5 },
];

// Mock danh sách IMEI có trong kho (khi chọn sản phẩm serial)
const mockAvailableIMEIs = [
  '356998000001234', '356998000001235', '356998000001236',
  '356998000001237', '356998000001238'
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

const OutboundCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // State quản lý danh sách hàng xuất
  const [cart, setCart] = useState<CartItem[]>([]);

  // State Modal thêm sản phẩm
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedIMEIs, setSelectedIMEIs] = useState<string[]>([]); // IMEI đang chọn trong modal
  const [inputQty, setInputQty] = useState<number>(1); // Số lượng nhập (cho hàng không serial)

  // --- Handlers ---

  // Mở modal thêm hàng
  const handleOpenAddModal = () => {
    // Kiểm tra xem đã chọn kho chưa
    const wh = form.getFieldValue('WarehouseID');
    if (!wh) {
      message.warning('Vui lòng chọn Kho xuất hàng trước!');
      return;
    }
    setSelectedProduct(null);
    setSelectedIMEIs([]);
    setInputQty(1);
    setIsModalOpen(true);
  };

  // Khi chọn 1 sản phẩm trong Modal
  const handleProductSelect = (value: string) => {
    const product = mockProducts.find(p => p.id === value);
    setSelectedProduct(product);
    setSelectedIMEIs([]);
    setInputQty(1);
  };

  // Xác nhận thêm vào danh sách xuất
  const handleConfirmAdd = () => {
    if (!selectedProduct) return;

    const quantity = selectedProduct.serialized ? selectedIMEIs.length : inputQty;

    if (quantity <= 0) {
      message.error('Số lượng phải lớn hơn 0');
      return;
    }

    const newItem: CartItem = {
      key: `${selectedProduct.id}-${Date.now()}`,
      ComponentID: selectedProduct.id,
      ComponentName: selectedProduct.name,
      SKU: selectedProduct.sku,
      Unit: selectedProduct.unit,
      IsSerialized: selectedProduct.serialized,
      Quantity: quantity,
      SelectedIMEIs: selectedProduct.serialized ? [...selectedIMEIs] : []
    };

    setCart([...cart, newItem]);
    setIsModalOpen(false);
    message.success('Đã thêm sản phẩm');
  };

  // Xóa dòng khỏi danh sách
  const handleRemoveItem = (key: string) => {
    setCart(cart.filter(item => item.key !== key));
  };

  // Submit Form
  const onFinish = async (values: any) => {
    if (cart.length === 0) {
      message.error('Danh sách hàng hóa đang trống!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...values,
        TransactionDate: values.TransactionDate.format('YYYY-MM-DD HH:mm:ss'),
        Details: cart
      };
      console.log('Submit Payload:', payload);

      // Giả lập API
      await new Promise(r => setTimeout(r, 1000));

      message.success('Tạo phiếu xuất kho thành công!');
      navigate('/inventory/history');
    } catch (e) {
      message.error('Lỗi hệ thống');
    } finally {
      setLoading(false);
    }
  };

  // --- Table Columns ---
  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'ComponentName',
      key: 'name',
      render: (text: string, record: CartItem) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">SKU: {record.SKU}</div>
        </div>
      )
    },
    {
      title: 'Chi tiết (Serial/IMEI)',
      dataIndex: 'SelectedIMEIs',
      key: 'imei',
      render: (imeis: string[], record: CartItem) => (
        record.IsSerialized ? (
          <div className="flex flex-wrap gap-1">
            {imeis.map(imei => (
              <Tag key={imei} color="blue" className="font-mono text-[10px]">{imei}</Tag>
            ))}
          </div>
        ) : <span className="text-gray-400 italic">Không quản lý Serial</span>
      )
    },
    {
      title: 'ĐVT',
      dataIndex: 'Unit',
      key: 'unit',
      width: 80,
    },
    {
      title: 'Số lượng',
      dataIndex: 'Quantity',
      key: 'qty',
      width: 100,
      align: 'center' as const,
      render: (qty: number) => <span className="font-bold">{qty}</span>
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_: any, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.key)}
        />
      )
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <div>
            <Title level={3} className="m-0">Tạo Phiếu Xuất Kho</Title>
            <Text type="secondary">Xuất bán, xuất demo, xuất hủy hoặc luân chuyển nội bộ</Text>
          </div>
        </div>
        <Space>
          <Button onClick={() => form.resetFields()}>Làm lại</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => form.submit()}
            className="bg-blue-600"
          >
            Hoàn tất xuất kho
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          TransactionDate: dayjs(),
          Type: 'SALE'
        }}
      >
        <Row gutter={24}>
          {/* LEFT: THÔNG TIN CHUNG */}
          <Col xs={24} lg={8}>
            <Card title="Thông tin phiếu" className="shadow-sm mb-6">
              <Form.Item
                name="WarehouseID"
                label="Kho xuất hàng (Source)"
                rules={[{ required: true, message: 'Chọn kho xuất' }]}
              >
                <Select placeholder="Chọn kho..." options={warehouses} />
              </Form.Item>

              <Form.Item name="Type" label="Lý do xuất" rules={[{ required: true }]}>
                <Select>
                  <Option value="SALE">Xuất Bán hàng</Option>
                  <Option value="DEMO">Xuất dùng thử / Demo</Option>
                  <Option value="TRANSFER">Xuất Luân chuyển</Option>
                  <Option value="LIQUIDATION">Xuất Thanh lý / Hủy</Option>
                </Select>
              </Form.Item>

              <Form.Item name="TransactionDate" label="Ngày chứng từ">
                <DatePicker showTime className="w-full" format="DD/MM/YYYY HH:mm" />
              </Form.Item>

              <Divider />

              <Form.Item name="Receiver" label="Người/Đơn vị nhận">
                <Input prefix={<ShopOutlined />} placeholder="Tên khách hàng hoặc Chi nhánh nhận" />
              </Form.Item>

              <Form.Item name="Notes" label="Ghi chú">
                <TextArea rows={3} placeholder="Mã đơn hàng liên quan, ghi chú thêm..." />
              </Form.Item>
            </Card>

            {/* Gợi ý quy trình */}
            <Alert
              message="Lưu ý"
              description="Đối với hàng Demo, hệ thống sẽ vẫn ghi nhận tồn kho ở trạng thái 'Đang mượn'. Vui lòng tạo phiếu 'Nhập trả' khi khách trả máy."
              type="info"
              showIcon
            />
          </Col>

          {/* RIGHT: DANH SÁCH HÀNG HÓA */}
          <Col xs={24} lg={16}>
            <Card
              title="Danh sách hàng hóa"
              className="shadow-sm h-full"
              extra={
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleOpenAddModal}>
                  Thêm sản phẩm
                </Button>
              }
            >
              <Table
                columns={columns}
                dataSource={cart}
                pagination={false}
                locale={{ emptyText: 'Chưa có sản phẩm nào được chọn' }}
              />

              {cart.length > 0 && (
                <div className="mt-4 text-right">
                  <Text>Tổng số lượng: </Text>
                  <Text strong className="text-lg text-blue-600 ml-2">
                    {cart.reduce((sum, item) => sum + item.Quantity, 0)}
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Form>

      {/* MODAL CHỌN SẢN PHẨM */}
      <Modal
        title="Chọn sản phẩm xuất kho"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleConfirmAdd}
        width={600}
        okText="Thêm vào phiếu"
        cancelText="Hủy"
        okButtonProps={{ disabled: !selectedProduct }}
      >
        <div className="flex flex-col gap-4 py-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tìm sản phẩm</label>
            <Select
              showSearch
              placeholder="Nhập tên SP hoặc SKU..."
              className="w-full"
              options={mockProducts.map(p => ({ label: `${p.sku} - ${p.name}`, value: p.id }))}
              onChange={handleProductSelect}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </div>

          {selectedProduct && (
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-800">{selectedProduct.name}</span>
                <Tag color={selectedProduct.stock > 0 ? 'green' : 'red'}>
                  Tồn: {selectedProduct.stock} {selectedProduct.unit}
                </Tag>
              </div>

              <Divider className="my-2" />

              {selectedProduct.serialized ? (
                // CASE 1: Hàng có Serial/IMEI -> Phải chọn đích danh
                <div>
                  <div className="text-sm text-gray-500 mb-2">
                    <BarcodeOutlined /> Chọn các Serial/IMEI cần xuất:
                  </div>
                  <Select
                    mode="multiple"
                    placeholder="Chọn IMEI..."
                    className="w-full"
                    options={mockAvailableIMEIs.map(imei => ({ label: imei, value: imei }))}
                    value={selectedIMEIs}
                    onChange={setSelectedIMEIs}
                    maxTagCount="responsive"
                  />
                  <div className="text-right mt-1 text-xs text-blue-600">
                    Đã chọn: {selectedIMEIs.length} máy
                  </div>
                </div>
              ) : (
                // CASE 2: Hàng thường -> Nhập số lượng
                <div>
                  <div className="text-sm text-gray-500 mb-2">
                    <ExportOutlined /> Nhập số lượng xuất:
                  </div>
                  <InputNumber
                    min={1}
                    max={selectedProduct.stock}
                    value={inputQty}
                    onChange={(val) => setInputQty(val || 1)}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default OutboundCreate;