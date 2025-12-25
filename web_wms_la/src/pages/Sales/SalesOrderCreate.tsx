import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  InputNumber,
  Select,
  Divider,
  Space,
  Tag,
  Modal,
  Form,
  Radio,
  Statistic,
  message,
  Empty
} from 'antd';
import {
  SearchOutlined,
  BarcodeOutlined,
  UserOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
  CreditCardOutlined,
  PrinterOutlined,
  SaveOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

// ============================================================================
// 1. TYPES & MOCK DATA
// ============================================================================

interface ProductType {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}

interface CartItem extends ProductType {
  quantity: number;
  discount: number; // VNĐ
}

const mockProducts: ProductType[] = [
  {
    id: 'p1',
    sku: 'IP15PM-256',
    name: 'iPhone 15 Pro Max 256GB - Titan',
    price: 29500000,
    stock: 10,
    category: 'Phone',
    image: 'https://api.dicebear.com/7.x/initials/svg?seed=IP',
  },
  {
    id: 'p2',
    sku: 'SS-S24U',
    name: 'Samsung Galaxy S24 Ultra',
    price: 24000000,
    stock: 5,
    category: 'Phone',
    image: 'https://api.dicebear.com/7.x/initials/svg?seed=SS',
  },
  {
    id: 'p3',
    sku: 'APP-CASE',
    name: 'Ốp lưng MagSafe iPhone 15',
    price: 1200000,
    stock: 50,
    category: 'Accessory',
    image: 'https://api.dicebear.com/7.x/initials/svg?seed=Case',
  },
  {
    id: 'p4',
    sku: 'ANKER-20W',
    name: 'Củ sạc Anker 20W Nano',
    price: 350000,
    stock: 22,
    category: 'Accessory',
    image: 'https://api.dicebear.com/7.x/initials/svg?seed=Anker',
  },
  {
    id: 'p5',
    sku: 'AIRPODS-PRO',
    name: 'Tai nghe AirPods Pro 2',
    price: 5900000,
    stock: 0, // Hết hàng
    category: 'Accessory',
    image: 'https://api.dicebear.com/7.x/initials/svg?seed=Air',
  },
];

const mockCustomers = [
  { value: 'kh1', label: '0909123456 - Nguyễn Văn A', name: 'Nguyễn Văn A', phone: '0909123456' },
  { value: 'kh2', label: '0912345678 - Trần Thị B', name: 'Trần Thị B', phone: '0912345678' },
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

const SalesOrderCreate: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Modal Checkout State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [amountReceived, setAmountReceived] = useState<number>(0);

  // --- Computed ---

  const filteredProducts = mockProducts.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const subTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = cart.reduce((sum, item) => sum + item.discount, 0);
  const finalTotal = subTotal - totalDiscount;
  const changeAmount = amountReceived - finalTotal; // Tiền thừa

  // --- Handlers ---

  const handleAddToCart = (product: ProductType) => {
    if (product.stock <= 0) {
      message.error('Sản phẩm này đã hết hàng!');
      return;
    }

    setCart(prev => {
      const exist = prev.find(item => item.id === product.id);
      if (exist) {
        if (exist.quantity >= product.stock) {
          message.warning('Đã đạt giới hạn tồn kho!');
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, discount: 0 }];
    });
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, qty: number | null) => {
    if (!qty || qty < 1) return;
    const product = mockProducts.find(p => p.id === id);
    if (product && qty > product.stock) {
      message.warning(`Kho chỉ còn ${product.stock} sản phẩm`);
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      message.error('Giỏ hàng đang trống!');
      return;
    }
    if (!selectedCustomer) {
      message.warning('Vui lòng chọn khách hàng!');
      return;
    }
    setAmountReceived(finalTotal); // Mặc định khách đưa đủ
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmPayment = () => {
    message.success('Thanh toán thành công! Đang in hóa đơn...');
    setIsCheckoutModalOpen(false);

    // Reset or Navigate
    setTimeout(() => navigate('/sales/orders'), 1000);
  };

  // --- Render Functions ---

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col md:flex-row gap-4">

      {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
      <div className="flex-1 flex flex-col gap-4 h-full overflow-hidden">
        {/* Search Bar */}
        <Card bordered={false} className="shadow-sm flex-shrink-0" bodyStyle={{ padding: '16px' }}>
          <Input
            size="large"
            placeholder="Quét mã vạch hoặc tìm tên sản phẩm..."
            prefix={<BarcodeOutlined className="text-xl text-gray-400 mr-2" />}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            allowClear
            autoFocus
          />
        </Card>

        {/* Product Grid (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <Row gutter={[16, 16]}>
            {filteredProducts.map(product => (
              <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
                <Card
                  hoverable
                  className={`h-full transition-all ${product.stock === 0 ? 'opacity-60 grayscale' : 'hover:border-blue-500'}`}
                  bodyStyle={{ padding: '12px' }}
                  onClick={() => handleAddToCart(product)}
                >
                  <div className="relative aspect-square mb-3 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                    <img alt={product.name} src={product.image} className="w-2/3 object-contain" />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <Tag color="red" className="font-bold">HẾT HÀNG</Tag>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Text className="font-medium line-clamp-2 h-10 leading-tight" title={product.name}>{product.name}</Text>
                    <Text type="secondary" className="text-xs">SKU: {product.sku}</Text>
                    <div className="flex justify-between items-center mt-2">
                      <Text className="text-blue-600 font-bold text-base">{formatCurrency(product.price)}</Text>
                      <Text type="secondary" className="text-xs">Kho: {product.stock}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </div>

      {/* CỘT PHẢI: GIỎ HÀNG & THANH TOÁN */}
      <div className="w-full md:w-[400px] lg:w-[450px] flex-shrink-0 flex flex-col h-full bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">

        {/* 1. Customer Selection */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <Select
            showSearch
            placeholder="Tìm khách hàng (SĐT/Tên)..."
            className="w-full"
            size="large"
            options={mockCustomers}
            onChange={(val, option: any) => setSelectedCustomer(option)}
            suffixIcon={<UserOutlined />}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          />
          {selectedCustomer && (
            <div className="mt-2 text-sm text-gray-500 flex justify-between">
              <span>{selectedCustomer.name}</span>
              <span>{selectedCustomer.phone}</span>
            </div>
          )}
        </div>

        {/* 2. Cart Items List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          {cart.length === 0 ? (
            <Empty description="Chưa có sản phẩm nào" image={Empty.PRESENTED_IMAGE_SIMPLE} className="mt-10" />
          ) : (
            <List
              itemLayout="horizontal"
              dataSource={cart}
              renderItem={(item) => (
                <List.Item className="group">
                  <List.Item.Meta
                    avatar={<Avatar shape="square" src={item.image} size={48} className="bg-gray-100" />}
                    title={<Text className="text-sm font-medium line-clamp-1">{item.name}</Text>}
                    description={
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-blue-600 font-medium">{formatCurrency(item.price)}</div>
                        <div className="flex items-center border rounded">
                          <Button
                            size="small"
                            type="text"
                            icon={<MinusOutlined className="text-xs" />}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          />
                          <InputNumber
                            min={1}
                            value={item.quantity}
                            size="small"
                            bordered={false}
                            className="w-10 text-center text-sm font-bold p-0"
                            readOnly
                          />
                          <Button
                            size="small"
                            type="text"
                            icon={<PlusOutlined className="text-xs" />}
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          />
                        </div>
                      </div>
                    }
                  />
                  <div className="flex flex-col items-end gap-2 ml-2">
                    <Text strong>{formatCurrency(item.price * item.quantity)}</Text>
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>

        {/* 3. Summary & Action */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between mb-2 text-gray-500">
            <span>Tạm tính ({cart.length} món):</span>
            <span>{formatCurrency(subTotal)}</span>
          </div>
          <div className="flex justify-between mb-2 text-gray-500">
            <span>Giảm giá:</span>
            <span>- {formatCurrency(totalDiscount)}</span>
          </div>
          <Divider className="my-2" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-bold text-gray-800">Tổng thanh toán:</span>
            <span className="text-2xl font-bold text-blue-600">{formatCurrency(finalTotal)}</span>
          </div>

          <Button
            type="primary"
            size="large"
            block
            icon={<CreditCardOutlined />}
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="bg-blue-600 h-12 text-lg font-semibold shadow-md"
          >
            THANH TOÁN
          </Button>
        </div>
      </div>

      {/* MODAL CHECKOUT */}
      <Modal
        title={<div className="text-center w-full font-bold text-lg">Xác nhận thanh toán</div>}
        open={isCheckoutModalOpen}
        onCancel={() => setIsCheckoutModalOpen(false)}
        footer={null}
        width={500}
        centered
      >
        <div className="flex flex-col gap-6 pt-4">
          {/* Tổng tiền */}
          <div className="text-center">
            <div className="text-gray-500 text-sm mb-1">Tổng tiền cần thanh toán</div>
            <div className="text-4xl font-bold text-blue-600">{formatCurrency(finalTotal)}</div>
          </div>

          {/* Phương thức */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-semibold mb-2">Phương thức thanh toán</div>
            <Radio.Group
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              className="w-full grid grid-cols-2 gap-2"
            >
              <Radio.Button value="CASH" className="text-center">Tiền mặt</Radio.Button>
              <Radio.Button value="BANK" className="text-center">Chuyển khoản</Radio.Button>
              <Radio.Button value="MOMO" className="text-center">MoMo / QR</Radio.Button>
              <Radio.Button value="DEBT" className="text-center">Công nợ</Radio.Button>
            </Radio.Group>
          </div>

          {/* Nhập tiền khách đưa */}
          <div>
            <div className="font-semibold mb-2">Tiền khách đưa</div>
            <InputNumber
              className="w-full text-lg h-12 py-1"
              prefix="₫"
              value={amountReceived}
              onChange={(val) => setAmountReceived(val || 0)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <Tag className="cursor-pointer" onClick={() => setAmountReceived(finalTotal)}>Đủ tiền</Tag>
              <Tag className="cursor-pointer" onClick={() => setAmountReceived(500000)}>500k</Tag>
              <Tag className="cursor-pointer" onClick={() => setAmountReceived(1000000)}>1tr</Tag>
            </div>
          </div>

          {/* Tiền thừa */}
          <div className="flex justify-between items-center p-3 border rounded bg-blue-50">
            <span className="font-semibold text-gray-700">Tiền thừa trả khách:</span>
            <span className={`text-xl font-bold ${changeAmount < 0 ? 'text-red-500' : 'text-green-600'}`}>
              {changeAmount < 0 ? 'Thiếu tiền' : formatCurrency(changeAmount)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <Button size="large" block onClick={() => setIsCheckoutModalOpen(false)}>Quay lại</Button>
            <Button
              type="primary"
              size="large"
              block
              icon={<PrinterOutlined />}
              className="bg-blue-600"
              onClick={handleConfirmPayment}
              disabled={changeAmount < 0}
            >
              Hoàn tất & In
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SalesOrderCreate;