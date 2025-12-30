import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Select,
  DatePicker,
  Checkbox,
  Divider,
  message,
  Space,
  AutoComplete,
  Typography,
  Radio,
  Alert
} from 'antd';
import {
  SaveOutlined,
  UserOutlined,
  MobileOutlined,
  BarcodeOutlined,
  ToolOutlined,
  ClockCircleOutlined,
  ArrowLeftOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

// ============================================================================
// 1. TYPES & MOCK DATA
// ============================================================================

// Mock Database Khách hàng
const mockCustomers = [
  { value: '0909123456', label: '0909123456 - Nguyễn Văn An', name: 'Nguyễn Văn An', address: 'TP. Thủ Đức' },
  { value: '0912345678', label: '0912345678 - Trần Thị B', name: 'Trần Thị B', address: 'Quận 7' },
];

// Mock Database Thiết bị đã bán
const mockDevices = [
  {
    imei: '356998000001234',
    name: 'iPhone 15 Pro Max 256GB',
    warranty: 'IN_WARRANTY',
    purchaseDate: '2024-01-15'
  },
  {
    imei: '359000111222333',
    name: 'Samsung Galaxy S22 Ultra',
    warranty: 'OUT_WARRANTY',
    purchaseDate: '2022-05-10'
  },
];

const RepairReceive: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // State quản lý logic form
  const [customerName, setCustomerName] = useState('');
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  // 1. Auto-fill IMEI nếu chuyển từ trang Tra cứu bảo hành
  useEffect(() => {
    if (location.state?.imei) {
      form.setFieldsValue({ SerialNumber: location.state.imei });
      handleCheckIMEI(location.state.imei);
    }
  }, [location.state]);

  // 2. Xử lý chọn Khách hàng (Giả lập)
  const handleSelectCustomer = (value: string) => {
    const customer = mockCustomers.find(c => c.value === value);
    if (customer) {
      setCustomerName(customer.name);
      form.setFieldsValue({ CustomerName: customer.name, Address: customer.address });
      message.success('Đã tìm thấy thông tin khách hàng cũ');
    }
  };

  // 3. Xử lý check IMEI
  const handleCheckIMEI = (imei: string) => {
    const device = mockDevices.find(d => d.imei === imei);
    if (device) {
      setDeviceInfo(device);
      form.setFieldsValue({
        DeviceName: device.name,
        WarrantyType: device.warranty
      });
      message.info(`Đã tìm thấy thiết bị: ${device.name}`);
    } else {
      setDeviceInfo(null);
      // Nếu không tìm thấy, reset field để nhập tay
      form.setFieldsValue({ DeviceName: '', WarrantyType: 'OUT_WARRANTY' });
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      console.log('Form Values:', values);
      // Giả lập API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      message.success('Tạo phiếu tiếp nhận thành công!');
      navigate('/repairs/list'); // Quay về danh sách
    } catch (error) {
      message.error('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <div>
            <Title level={3} className="m-0">Tiếp nhận sửa chữa</Title>
            <Text type="secondary">Tạo phiếu yêu cầu dịch vụ mới</Text>
          </div>
        </div>
        <Space>
          <Button onClick={() => form.resetFields()}>Làm mới</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => form.submit()}
            className="bg-blue-600"
          >
            Lưu phiếu
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          WarrantyType: 'OUT_WARRANTY',
          ExpectedDate: dayjs().add(2, 'day'), // Mặc định hẹn 2 ngày sau
          Accessories: []
        }}
      >
        <Row gutter={24}>
          {/* CỘT TRÁI: THÔNG TIN KHÁCH & MÁY */}
          <Col xs={24} lg={16}>
            {/* 1. KHÁCH HÀNG */}
            <Card title={<><UserOutlined /> Thông tin Khách hàng</>} className="mb-6 shadow-sm">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="PhoneNumber"
                    label="Số điện thoại"
                    rules={[{ required: true, message: 'Nhập SĐT khách' }]}
                  >
                    <AutoComplete
                      options={mockCustomers}
                      onSelect={handleSelectCustomer}
                      placeholder="Nhập SĐT để tìm kiếm..."
                      filterOption={(inputValue, option) =>
                        option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                      }
                    >
                      <Input prefix={<SearchOutlined />} />
                    </AutoComplete>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="CustomerName"
                    label="Tên khách hàng"
                    rules={[{ required: true, message: 'Nhập tên khách' }]}
                  >
                    <Input placeholder="Tự động điền hoặc nhập mới" />
                  </Form.Item>
                </Col>
                <Col span={24}>
                  <Form.Item name="Address" label="Địa chỉ">
                    <Input placeholder="Địa chỉ liên hệ" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 2. THIẾT BỊ */}
            <Card title={<><MobileOutlined /> Thông tin Thiết bị</>} className="mb-6 shadow-sm">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="SerialNumber"
                    label="IMEI / Serial Number"
                    rules={[{ required: true, message: 'Nhập IMEI/Serial' }]}
                  >
                    <Input.Search
                      placeholder="Quét hoặc nhập mã..."
                      prefix={<BarcodeOutlined />}
                      enterButton={<Button>Kiểm tra</Button>}
                      onSearch={handleCheckIMEI}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="DeviceName"
                    label="Tên thiết bị / Model"
                    rules={[{ required: true, message: 'Nhập tên máy' }]}
                  >
                    <Input placeholder="VD: iPhone 13 Pro..." />
                  </Form.Item>
                </Col>
              </Row>

              {/* Thông báo trạng thái bảo hành nếu tìm thấy trong DB */}
              {deviceInfo && (
                <Alert
                  message={deviceInfo.warranty === 'IN_WARRANTY' ? "Sản phẩm CÒN bảo hành" : "Sản phẩm HẾT bảo hành"}
                  description={`Mua ngày: ${dayjs(deviceInfo.purchaseDate).format('DD/MM/YYYY')}. Hệ thống tự động đề xuất loại bảo hành.`}
                  type={deviceInfo.warranty === 'IN_WARRANTY' ? "success" : "warning"}
                  showIcon
                  className="mb-4"
                />
              )}

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="Password" label="Mật khẩu màn hình (Nếu có)">
                    <Input placeholder="Để kỹ thuật viên kiểm tra máy" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="WarrantyType" label="Hình thức xử lý">
                    <Select>
                      <Option value="IN_WARRANTY">Bảo hành (Miễn phí)</Option>
                      <Option value="OUT_WARRANTY">Sửa chữa dịch vụ (Có phí)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* 3. TÌNH TRẠNG TIẾP NHẬN */}
            <Card title={<><ToolOutlined /> Tình trạng & Yêu cầu</>} className="shadow-sm">
              <Form.Item
                name="ProblemDescription"
                label="Mô tả lỗi (Khách báo)"
                rules={[{ required: true, message: 'Vui lòng nhập mô tả lỗi' }]}
              >
                <TextArea rows={3} placeholder="VD: Máy rơi nước, không lên nguồn..." />
              </Form.Item>

              <Form.Item
                name="PhysicalCondition"
                label="Tình trạng ngoại quan (Quan trọng)"
                rules={[{ required: true, message: 'Ghi rõ tình trạng trầy xước' }]}
              >
                <TextArea rows={2} placeholder="VD: Màn hình trầy xước nhẹ, cấn góc phải..." />
              </Form.Item>

              <Form.Item name="Accessories" label="Phụ kiện nhận kèm">
                <Checkbox.Group>
                  <Row>
                    <Col span={8}><Checkbox value="sac">Củ sạc</Checkbox></Col>
                    <Col span={8}><Checkbox value="cap">Cáp sạc</Checkbox></Col>
                    <Col span={8}><Checkbox value="op-lung">Ốp lưng</Checkbox></Col>
                    <Col span={8}><Checkbox value="sim-tray">Khay SIM</Checkbox></Col>
                    <Col span={8}><Checkbox value="box">Hộp máy</Checkbox></Col>
                  </Row>
                </Checkbox.Group>
              </Form.Item>
            </Card>
          </Col>

          {/* CỘT PHẢI: THÔNG TIN DỊCH VỤ */}
          <Col xs={24} lg={8}>
            <Card title="Thông tin dịch vụ" className="shadow-sm">
              <Form.Item name="TechnicianID" label="Kỹ thuật viên phụ trách">
                <Select placeholder="Chọn kỹ thuật viên (Tùy chọn)">
                  <Option value="tech1">Trần Kỹ Thuật</Option>
                  <Option value="tech2">Lê Văn Staff</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="ExpectedDate"
                label="Ngày hẹn trả khách (Dự kiến)"
                rules={[{ required: true }]}
              >
                <DatePicker
                  className="w-full"
                  showTime
                  format="DD/MM/YYYY HH:mm"
                  suffixIcon={<ClockCircleOutlined />}
                />
              </Form.Item>

              <Form.Item name="EstimatedCost" label="Báo giá dự kiến">
                <Input
                  prefix="₫"
                  type="number"
                  className="font-bold text-red-600"
                  placeholder="0"
                />
              </Form.Item>

              <Divider />

              <div className="bg-gray-50 p-3 rounded text-xs text-gray-500">
                <p className="mb-1"><b>Lưu ý:</b></p>
                <ul className="list-disc pl-4">
                  <li>Vui lòng yêu cầu khách thoát iCloud/Samsung Account.</li>
                  <li>Yêu cầu khách ký tên xác nhận tình trạng ngoại quan.</li>
                </ul>
              </div>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default RepairReceive;