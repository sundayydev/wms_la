import React, { useState, useEffect } from 'react';
import {
  Form,
  Card,
  Button,
  Select,
  DatePicker,
  Input,
  Row,
  Col,
  Typography,
  Divider,
  Space,
  message,
  Alert,
  Avatar
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserOutlined,
  BarcodeOutlined,
  FileSearchOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// =============================================================================
// MOCK DATA (Dữ liệu giả lập từ DB)
// =============================================================================

// Danh sách nhân viên kỹ thuật
const MOCK_INSPECTORS = [
  { id: 'u1', name: 'Nguyễn Văn A', role: 'Senior QC' },
  { id: 'u2', name: 'Trần Thị B', role: 'Junior QC' },
  { id: 'u3', name: 'Lê Văn C', role: 'Technician' },
];

// Danh sách sản phẩm (Component)
const MOCK_COMPONENTS = [
  { id: 'c1', sku: 'MOBY-M63', name: 'PDA Mobydata M63', category: 'PDA' },
  { id: 'c2', sku: 'ZEBRA-DS2208', name: 'Scanner Zebra DS2208', category: 'Scanner' },
];

// Danh sách Serial (Instance) thuộc sản phẩm
const MOCK_INSTANCES: Record<string, { id: string; serial: string; status: string }[]> = {
  'c1': [
    { id: 'i1', serial: 'SN-M63-001', status: 'In Stock' },
    { id: 'i2', serial: 'SN-M63-002', status: 'Repaired' },
  ],
  'c2': [
    { id: 'i3', serial: 'SN-ZEBRA-999', status: 'New' },
  ]
};

// Danh sách mẫu kiểm tra (Templates) - Load từ bảng InspectionTemplates
const MOCK_TEMPLATES = [
  { id: 't1', name: 'QC Xuất kho - PDA (Standard)', type: 'PRE_DELIVERY', componentId: 'c1' },
  { id: 't2', name: 'QC Nhập kho - PDA', type: 'INBOUND', componentId: 'c1' },
  { id: 't3', name: 'QC Máy quét mã vạch', type: 'ALL', componentId: 'c2' },
  { id: 't4', name: 'Kiểm tra ngẫu nhiên (Chung)', type: 'RANDOM', componentId: null },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const InspectionCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // States để xử lý logic dynamic
  const [inspectionType, setInspectionType] = useState<string>('PRE_DELIVERY');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [availableInstances, setAvailableInstances] = useState<any[]>([]);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);

  // 1. Khi thay đổi Component -> Load Serial tương ứng và Template phù hợp
  const handleComponentChange = (componentId: string) => {
    setSelectedComponent(componentId);

    // Reset fields phụ thuộc
    form.setFieldsValue({ instanceId: null, templateId: null });

    // Load Serials
    setAvailableInstances(MOCK_INSTANCES[componentId] || []);

    // Load Templates phù hợp (Cùng Component hoặc Chung + Cùng loại kiểm tra hoặc Chung)
    const templates = MOCK_TEMPLATES.filter(t =>
      (t.componentId === componentId || t.componentId === null) &&
      (t.type === inspectionType || t.type === 'ALL')
    );
    setAvailableTemplates(templates);
  };

  // 2. Khi thay đổi loại kiểm tra -> Filter lại Template
  const handleTypeChange = (type: string) => {
    setInspectionType(type);
    form.setFieldsValue({ referenceId: null, templateId: null }); // Reset reference vì loại thay đổi

    if (selectedComponent) {
      const templates = MOCK_TEMPLATES.filter(t =>
        (t.componentId === selectedComponent || t.componentId === null) &&
        (t.type === type || t.type === 'ALL')
      );
      setAvailableTemplates(templates);
    }
  };

  const onFinish = (values: any) => {
    console.log('Create Inspection Payload:', values);
    message.success('Đã tạo phiếu kiểm tra thành công!');
    message.info('Đang chuyển hướng về danh sách...');
    setTimeout(() => navigate('/admin/inspection'), 1500);
  };

  // Helper render Reference Label
  const getReferenceLabel = () => {
    switch (inspectionType) {
      case 'PRE_DELIVERY': return 'Mã Đơn hàng (SO)';
      case 'INBOUND': return 'Mã Đơn mua hàng (PO)';
      case 'POST_REPAIR': return 'Mã Phiếu sửa chữa (Repair ID)';
      default: return 'Mã tham chiếu (Optional)';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <div>
            <Title level={3} style={{ margin: 0 }}>Tạo phiếu kiểm tra kỹ thuật</Title>
            <Text type="secondary">Khởi tạo yêu cầu QC mới cho thiết bị</Text>
          </div>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          inspectionDate: dayjs(),
          status: 'IN_PROGRESS'
        }}
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN: MAIN INFO */}
          <div className="lg:col-span-2 space-y-6">

            {/* Card 1: Thông tin phân loại */}
            <Card title="1. Thông tin chung & Tham chiếu" className="shadow-sm">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="inspectionType"
                    label="Loại kiểm tra"
                    rules={[{ required: true }]}
                  >
                    <Select onChange={handleTypeChange}>
                      <Option value="PRE_DELIVERY">QC Xuất kho (Pre-Delivery)</Option>
                      <Option value="INBOUND">QC Nhập kho (Inbound)</Option>
                      <Option value="POST_REPAIR">Sau sửa chữa (Post-Repair)</Option>
                      <Option value="RANDOM">Kiểm tra ngẫu nhiên</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="referenceId"
                    label={getReferenceLabel()}
                    rules={[{ required: inspectionType !== 'RANDOM', message: 'Vui lòng nhập mã tham chiếu' }]}
                  >
                    <Select
                      showSearch
                      placeholder={`Chọn ${getReferenceLabel()}...`}
                      allowClear
                    >
                      {/* Mock options */}
                      <Option value="SO-2023-001">SO-2023-001 (Logistics ABC)</Option>
                      <Option value="PO-2023-999">PO-2023-999 (Nhập hàng Zebra)</Option>
                      <Option value="REP-888">REP-888 (Sửa màn hình)</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="inspectionDate" label="Ngày dự kiến kiểm tra">
                    <DatePicker className="w-full" format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="inspectorId"
                    label="Kỹ thuật viên phụ trách"
                    rules={[{ required: true, message: 'Vui lòng chỉ định người kiểm tra' }]}
                  >
                    <Select placeholder="Chọn nhân viên...">
                      {MOCK_INSPECTORS.map(u => (
                        <Option key={u.id} value={u.id}>
                          <Space>
                            <Avatar size="small" icon={<UserOutlined />} />
                            {u.name} - <Text type="secondary" style={{ fontSize: 12 }}>{u.role}</Text>
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            {/* Card 2: Thông tin thiết bị */}
            <Card title="2. Đối tượng kiểm tra" className="shadow-sm">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="componentId"
                    label="Sản phẩm / Model"
                    rules={[{ required: true, message: 'Chọn sản phẩm cần kiểm tra' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Tìm kiếm theo SKU hoặc Tên..."
                      optionFilterProp="children"
                      onChange={handleComponentChange}
                    >
                      {MOCK_COMPONENTS.map(c => (
                        <Option key={c.id} value={c.id}>{c.sku} - {c.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="instanceId"
                    label="Số Serial (Instance)"
                    rules={[{ required: true, message: 'Chọn máy cụ thể' }]}
                    help="Chọn Model trước để lọc Serial"
                  >
                    <Select
                      placeholder="Chọn Serial Number"
                      disabled={!selectedComponent}
                      showSearch
                    >
                      {availableInstances.map(i => (
                        <Option key={i.id} value={i.id}>
                          <Space>
                            <BarcodeOutlined />
                            {i.serial}
                            <TagStatus status={i.status} />
                          </Space>
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="remarks" label="Ghi chú ban đầu (nếu có)">
                <TextArea rows={3} placeholder="Ví dụ: Khách yêu cầu check kỹ màn hình, máy từng bị rơi..." />
              </Form.Item>
            </Card>
          </div>

          {/* RIGHT COLUMN: TEMPLATE CONFIG */}
          <div className="lg:col-span-1">
            <Card
              title="3. Cấu hình mẫu kiểm tra"
              className="shadow-sm h-full sticky top-6"
              extra={<FileSearchOutlined />}
            >
              <Alert
                message="Lưu ý"
                description="Hệ thống sẽ tự động đề xuất mẫu kiểm tra dựa trên Loại kiểm tra và Model sản phẩm bạn chọn."
                type="info"
                showIcon
                className="mb-4"
              />

              <Form.Item
                name="templateId"
                label="Mẫu Checklist áp dụng"
                rules={[{ required: true, message: 'Bắt buộc chọn mẫu kiểm tra' }]}
              >
                <Select
                  placeholder="Chọn mẫu checklist..."
                  size="large"
                  disabled={!selectedComponent}
                  listHeight={300}
                >
                  {availableTemplates.map(t => (
                    <Option key={t.id} value={t.id}>
                      <div className="py-1">
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Loại: {t.type} {t.componentId ? '• Riêng biệt' : '• Chung'}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {availableTemplates.length === 0 && selectedComponent && (
                <div className="text-red-500 text-sm mb-4">
                  Không tìm thấy mẫu phù hợp. Vui lòng tạo mẫu mới trong phần Cấu hình.
                </div>
              )}

              <Divider />

              <div className="flex flex-col gap-3">
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" block>
                  Tạo phiếu kiểm tra
                </Button>
                <Button onClick={() => navigate('/admin/inspection')} block>
                  Hủy bỏ
                </Button>
              </div>
            </Card>
          </div>

        </div>
      </Form>
    </div>
  );
};

// Component phụ để hiển thị status tag
const TagStatus = ({ status }: { status: string }) => {
  const color = status === 'New' ? 'green' : (status === 'Repaired' ? 'orange' : 'blue');
  return <span className={`ml-2 text-xs px-2 py-0.5 rounded bg-${color}-100 text-${color}-700`}>{status}</span>;
}

export default InspectionCreate;