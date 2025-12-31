import React, { useState, useRef } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  Table,
  Space,
  Tag,
  Typography,
  message,
  Row,
  Col,
  Alert,
  type InputRef
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
  BarcodeOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  PrinterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useReactToPrint } from 'react-to-print';
import { InboundNote, type InboundNoteData } from '../../components/Print/InboundNote';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// ============================================================================
// 1. TYPES & MOCK DATA
// ============================================================================

interface ReturnItem {
  key: string;
  InstanceID: string;
  ComponentName: string;
  SKU: string;
  IMEI: string;
  CurrentStatus: string; // Trạng thái trước khi nhập (SOLD, TRANSFERRING...)
  ReturnCondition: string; // Tình trạng khi nhập lại (Mới, Trầy xước, Hỏng...)
}

// Mock database các máy đang ở ngoài (Đã bán hoặc Đang demo)
const mockExternalInstances = [
  {
    id: 'ins-1',
    name: 'iPhone 15 Pro Max 256GB - Titan',
    sku: 'IP15PM-256',
    imei: '356998000001234',
    status: 'SOLD' // Đã bán cho khách
  },
  {
    id: 'ins-2',
    name: 'Samsung Galaxy S24 Ultra',
    sku: 'SS-S24U',
    imei: '359000111222333',
    status: 'DEMO' // Đang cho mượn demo
  },
  {
    id: 'ins-3',
    name: 'Macbook Air M2',
    sku: 'MAC-M2',
    imei: 'C02123456',
    status: 'WARRANTY_OUT' // Đang ở trung tâm bảo hành
  }
];

const warehouses = [
  { label: 'Kho Tổng HCM', value: 'wh1' },
  { label: 'Kho Hà Nội', value: 'wh2' },
  { label: 'Kho Bảo Hành', value: 'wh_warranty' },
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

// Helper: Map reason code to Vietnamese label
const reasonLabels: Record<string, string> = {
  'DEMO_RETURN': 'Trả hàng Demo/Mượn',
  'CUSTOMER_RETURN': 'Khách trả hàng (Refund)',
  'WARRANTY_IN': 'Nhập nhận bảo hành',
  'INTERNAL_TRANSFER': 'Nhận điều chuyển',
};

const InboundCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // State quản lý danh sách hàng nhập
  const [cart, setCart] = useState<ReturnItem[]>([]);
  const searchInputRef = useRef<InputRef>(null);

  // Print functionality
  const printRef = useRef<HTMLDivElement>(null);
  const [printData, setPrintData] = useState<InboundNoteData | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Phieu_Nhap_Kho_${dayjs().format('YYYYMMDD_HHmmss')}`,
  });

  // Chuẩn bị dữ liệu và in phiếu
  const onPrint = () => {
    if (cart.length === 0) {
      message.warning('Danh sách hàng hóa đang trống!');
      return;
    }

    const formValues = form.getFieldsValue();
    const warehouseName = warehouses.find(w => w.value === formValues.WarehouseID)?.label || 'Chưa chọn';

    const data: InboundNoteData = {
      code: `NK${dayjs().format('YYMMDDHHmm')}`, // Tự sinh mã phiếu
      date: formValues.TransactionDate ? dayjs(formValues.TransactionDate).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY'),
      warehouse: warehouseName,
      supplier: formValues.Deliverer || 'N/A', // Người giao cũng là NCC trong trường hợp này
      deliverer: formValues.Deliverer || 'N/A',
      reason: reasonLabels[formValues.Reason] || formValues.Reason || 'Nhập kho',
      items: cart.map(item => ({
        name: item.ComponentName,
        sku: item.SKU,
        unit: 'Cái',
        qty: 1, // Mỗi thiết bị là 1 unit
        price: undefined, // Không hiển thị giá
        total: undefined,
      })),
    };

    setPrintData(data);

    // Đợi render xong rồi mới in
    setTimeout(() => {
      handlePrint();
    }, 100);
  };

  // --- Handlers ---

  // Xử lý quét IMEI/Serial
  const handleScanIMEI = (value: string) => {
    if (!value) return;

    // 1. Kiểm tra đã có trong danh sách chưa
    if (cart.find(item => item.IMEI === value)) {
      message.warning('Thiết bị này đã có trong danh sách nhập!');
      return;
    }

    // 2. Tìm trong Mock DB
    const foundDevice = mockExternalInstances.find(d => d.imei === value);

    if (foundDevice) {
      const newItem: ReturnItem = {
        key: foundDevice.id,
        InstanceID: foundDevice.id,
        ComponentName: foundDevice.name,
        SKU: foundDevice.sku,
        IMEI: foundDevice.imei,
        CurrentStatus: foundDevice.status,
        ReturnCondition: 'GOOD', // Mặc định là tốt
      };
      setCart([newItem, ...cart]);
      message.success(`Đã thêm: ${foundDevice.name}`);

      // Clear input để quét tiếp
      form.setFieldValue('scanInput', '');
      searchInputRef.current?.focus();
    } else {
      message.error(`Không tìm thấy thông tin thiết bị với IMEI: ${value}`);
    }
  };

  // Thay đổi tình trạng máy khi nhập
  const handleConditionChange = (key: string, condition: string) => {
    setCart(cart.map(item => item.key === key ? { ...item, ReturnCondition: condition } : item));
  };

  // Xóa dòng
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
        TransactionType: 'IMPORT_RETURN',
        Details: cart
      };
      console.log('Payload:', payload);

      await new Promise(r => setTimeout(r, 1000));

      message.success('Tạo phiếu nhập trả thành công!');
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
      title: 'Thiết bị',
      dataIndex: 'ComponentName',
      key: 'name',
      render: (text: string, record: ReturnItem) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-xs text-gray-500">SKU: {record.SKU}</div>
        </div>
      )
    },
    {
      title: 'Serial / IMEI',
      dataIndex: 'IMEI',
      key: 'imei',
      render: (imei: string) => <Tag color="blue" className="font-mono">{imei}</Tag>
    },
    {
      title: 'Nguồn gốc',
      dataIndex: 'CurrentStatus',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = status;
        if (status === 'SOLD') { color = 'green'; text = 'Khách trả'; }
        if (status === 'DEMO') { color = 'orange'; text = 'Trả Demo'; }
        if (status === 'WARRANTY_OUT') { color = 'purple'; text = 'BH Xong'; }
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: 'Tình trạng khi nhập',
      dataIndex: 'ReturnCondition',
      key: 'condition',
      width: 200,
      render: (val: string, record: ReturnItem) => (
        <Select
          value={val}
          style={{ width: '100%' }}
          onChange={(v) => handleConditionChange(record.key, v)}
        >
          <Option value="GOOD">Nguyên vẹn (Good)</Option>
          <Option value="SCRATCHED">Trầy xước (Scratched)</Option>
          <Option value="BROKEN">Hư hỏng (Broken)</Option>
          <Option value="MISSING_ACCESSORIES">Thiếu phụ kiện</Option>
        </Select>
      )
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_: any, record: ReturnItem) => (
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
            <Title level={3} className="m-0">Nhập Kho (Trả hàng / Bảo hành)</Title>
            <Text type="secondary">Nhập lại thiết bị đã xuất (Khách trả, Demo, Bảo hành xong)</Text>
          </div>
        </div>
        <Space>
          <Button onClick={() => form.resetFields()}>Làm lại</Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={onPrint}
            disabled={cart.length === 0}
          >
            In phiếu
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => form.submit()}
            className="bg-green-600"
          >
            Hoàn tất nhập
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          TransactionDate: dayjs(),
          Reason: 'DEMO_RETURN'
        }}
      >
        <Row gutter={24}>
          {/* LEFT: THÔNG TIN PHIẾU */}
          <Col xs={24} lg={8}>
            <Card title="Thông tin phiếu nhập" className="shadow-sm mb-6">
              <Form.Item
                name="WarehouseID"
                label="Nhập vào Kho"
                rules={[{ required: true, message: 'Chọn kho nhập' }]}
              >
                <Select placeholder="Chọn kho..." options={warehouses} />
              </Form.Item>

              <Form.Item name="Reason" label="Lý do nhập" rules={[{ required: true }]}>
                <Select>
                  <Option value="DEMO_RETURN">Trả hàng Demo/Mượn</Option>
                  <Option value="CUSTOMER_RETURN">Khách trả hàng (Refund)</Option>
                  <Option value="WARRANTY_IN">Nhập nhận bảo hành</Option>
                  <Option value="INTERNAL_TRANSFER">Nhận điều chuyển</Option>
                </Select>
              </Form.Item>

              <Form.Item name="TransactionDate" label="Ngày chứng từ">
                <DatePicker showTime className="w-full" format="DD/MM/YYYY HH:mm" />
              </Form.Item>

              <Form.Item name="Deliverer" label="Người giao hàng">
                <Input placeholder="Tên nhân viên hoặc Khách hàng" />
              </Form.Item>

              <Form.Item name="Notes" label="Ghi chú">
                <TextArea rows={3} placeholder="Lý do chi tiết, tình trạng chung..." />
              </Form.Item>
            </Card>

            <Alert
              message="Quy trình"
              description="Quét mã IMEI để tìm thông tin máy. Nhớ kiểm tra kỹ ngoại quan và chọn đúng 'Tình trạng khi nhập' để phân loại tồn kho."
              type="info"
              showIcon
            />
          </Col>

          {/* RIGHT: DANH SÁCH HÀNG HÓA */}
          <Col xs={24} lg={16}>
            <Card
              title={
                <div className="flex items-center gap-2">
                  <ImportOutlined /> Danh sách thiết bị nhập
                </div>
              }
              className="shadow-sm h-full"
            >
              {/* BARCODE SCANNER INPUT */}
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <Form.Item name="scanInput" noStyle>
                  <Input.Search
                    ref={searchInputRef}
                    placeholder="Quét hoặc nhập IMEI/Serial và Enter..."
                    enterButton={<Button icon={<BarcodeOutlined />}>Thêm vào phiếu</Button>}
                    size="large"
                    onSearch={handleScanIMEI}
                    autoFocus
                  />
                </Form.Item>
                <div className="mt-2 text-xs text-gray-500">
                  <InfoCircleOutlined /> Hệ thống sẽ tự động tìm thông tin máy dựa trên lịch sử xuất kho.
                </div>
              </div>

              <Table
                columns={columns}
                dataSource={cart}
                pagination={false}
                locale={{ emptyText: 'Chưa có thiết bị nào được quét' }}
              />

              {cart.length > 0 && (
                <div className="mt-4 text-right">
                  <Text>Số lượng: </Text>
                  <Text strong className="text-lg text-green-600 ml-2">
                    {cart.length} máy
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </Form>

      {/* Hidden Print Component */}
      <div style={{ display: 'none' }}>
        {printData && <InboundNote ref={printRef} data={printData} />}
      </div>
    </div>
  );
};

export default InboundCreate;