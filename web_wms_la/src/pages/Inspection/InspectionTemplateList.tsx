import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Tooltip,
  Popconfirm,
  Row,
  Col,
  Divider,
  Typography,
  message,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  SearchOutlined,
  UnorderedListOutlined,
  MinusCircleOutlined,
  HolderOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================

interface ChecklistItem {
  category: string;
  label: string;
  mandatory: boolean;
}

interface InspectionTemplate {
  key: string; // TemplateID
  templateName: string;
  categoryName?: string; // Tên danh mục áp dụng
  componentName?: string; // Tên model cụ thể (nếu có)
  inspectionType: 'PRE_DELIVERY' | 'POST_REPAIR' | 'INBOUND' | 'ALL';
  checklistItems: ChecklistItem[];
  isActive: boolean;
  updatedAt: string;
  itemCount: number;
}

const MOCK_DATA: InspectionTemplate[] = [
  {
    key: '1',
    templateName: 'QC Xuất kho - PDA Android',
    categoryName: 'PDA',
    inspectionType: 'PRE_DELIVERY',
    isActive: true,
    updatedAt: '2024-01-08 10:00',
    itemCount: 12,
    checklistItems: [
      { category: 'Ngoại quan', label: 'Màn hình không trầy xước', mandatory: true },
      { category: 'Chức năng', label: 'Test cảm ứng đa điểm', mandatory: true },
    ]
  },
  {
    key: '2',
    templateName: 'QC Nhập kho - Máy in mã vạch',
    categoryName: 'Printer',
    componentName: 'Zebra ZT411',
    inspectionType: 'INBOUND',
    isActive: true,
    updatedAt: '2024-01-07 15:30',
    itemCount: 8,
    checklistItems: []
  },
  {
    key: '3',
    templateName: 'Kiểm tra sau sửa chữa (Chung)',
    categoryName: 'All',
    inspectionType: 'POST_REPAIR',
    isActive: false,
    updatedAt: '2023-12-20 09:00',
    itemCount: 5,
    checklistItems: []
  }
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const InspectionTemplateManager: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<InspectionTemplate | null>(null);
  const [form] = Form.useForm();
  const [dataSource, setDataSource] = useState(MOCK_DATA);

  // --- Handlers ---

  const handleCreate = () => {
    setEditingTemplate(null);
    form.resetFields();
    // Default 1 item mẫu
    form.setFieldsValue({
      isActive: true,
      checklistItems: [{ category: 'Ngoại quan', label: '', mandatory: true }]
    });
    setIsModalOpen(true);
  };

  const handleEdit = (record: InspectionTemplate) => {
    setEditingTemplate(record);
    form.setFieldsValue({
      ...record,
      // Map data nếu cần thiết
    });
    setIsModalOpen(true);
  };

  const handleDelete = (key: string) => {
    setDataSource(prev => prev.filter(item => item.key !== key));
    message.success('Đã xóa mẫu kiểm tra');
  };

  const handleDuplicate = (record: InspectionTemplate) => {
    const newRecord = {
      ...record,
      key: `${Date.now()}`,
      templateName: `${record.templateName} (Copy)`,
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    setDataSource([newRecord, ...dataSource]);
    message.success('Đã nhân bản mẫu kiểm tra');
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const newItem: InspectionTemplate = {
        key: editingTemplate ? editingTemplate.key : `${Date.now()}`,
        updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        itemCount: values.checklistItems?.length || 0,
        ...values,
      };

      if (editingTemplate) {
        setDataSource(prev => prev.map(item => item.key === editingTemplate.key ? newItem : item));
        message.success('Cập nhật thành công');
      } else {
        setDataSource([newItem, ...dataSource]);
        message.success('Tạo mới thành công');
      }
      setIsModalOpen(false);
    });
  };

  // --- Columns Config ---

  const columns: ColumnsType<InspectionTemplate> = [
    {
      title: 'Tên mẫu kiểm tra',
      dataIndex: 'templateName',
      key: 'templateName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div className="text-xs text-gray-400">ID: {record.key}</div>
        </div>
      )
    },
    {
      title: 'Phạm vi áp dụng',
      key: 'scope',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text className="text-xs text-gray-500">Danh mục:</Text>
          <Tag color="blue">{record.categoryName || 'Tất cả'}</Tag>
          {record.componentName && (
            <>
              <Text className="text-xs text-gray-500 mt-1">Model:</Text>
              <Tag color="cyan">{record.componentName}</Tag>
            </>
          )}
        </Space>
      )
    },
    {
      title: 'Loại kiểm tra',
      dataIndex: 'inspectionType',
      key: 'inspectionType',
      render: (type) => {
        const colors: Record<string, string> = {
          PRE_DELIVERY: 'green',
          POST_REPAIR: 'orange',
          INBOUND: 'purple',
          ALL: 'default'
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      }
    },
    {
      title: 'Số mục',
      dataIndex: 'itemCount',
      key: 'itemCount',
      render: (count) => <Tag icon={<UnorderedListOutlined />}>{count} mục</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => <Switch size="small" checked={active} />
    },
    {
      title: 'Cập nhật cuối',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      className: 'text-gray-500 text-xs'
    },
    {
      title: '',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Nhân bản">
            <Button type="text" icon={<CopyOutlined />} onClick={() => handleDuplicate(record)} />
          </Tooltip>
          <Popconfirm title="Xóa mẫu này?" onConfirm={() => handleDelete(record.key)}>
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // ===========================================================================
  // RENDER
  // ===========================================================================

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER BAR */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản lý Mẫu Kiểm Tra (Templates)</Title>
          <Text type="secondary">Cấu hình các hạng mục kiểm tra QC cho từng dòng sản phẩm</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate} size="large">
          Tạo mẫu mới
        </Button>
      </div>

      {/* FILTERS & TABLE */}
      <Card bordered={false} className="shadow-sm">
        <div className="flex gap-4 mb-4">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm theo tên mẫu..."
            style={{ width: 300 }}
          />
          <Select placeholder="Loại kiểm tra" allowClear style={{ width: 200 }}>
            <Option value="PRE_DELIVERY">QC Xuất kho</Option>
            <Option value="INBOUND">QC Nhập kho</Option>
            <Option value="POST_REPAIR">Sau sửa chữa</Option>
          </Select>
        </div>

        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 10 }}
          rowKey="key"
        />
      </Card>

      {/* MODAL FORM: CREATE / EDIT */}
      <Modal
        title={editingTemplate ? "Chỉnh sửa mẫu kiểm tra" : "Tạo mẫu kiểm tra mới"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={900}
        maskClosable={false}
        okText="Lưu lại"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">

          {/* 1. THÔNG TIN CHUNG */}
          <Divider orientation="horizontal" plain>Thông tin cơ bản</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="templateName"
                label="Tên mẫu"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="VD: QC Máy quét Zebra dòng DS" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="inspectionType"
                label="Loại kiểm tra"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn loại">
                  <Option value="PRE_DELIVERY">Trước giao hàng (Pre-Delivery)</Option>
                  <Option value="INBOUND">Nhập kho (Inbound)</Option>
                  <Option value="POST_REPAIR">Sau sửa chữa (Post-Repair)</Option>
                  <Option value="RANDOM">Kiểm tra ngẫu nhiên</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="categoryName" label="Áp dụng Danh mục">
                <Select placeholder="Tất cả danh mục" allowClear>
                  <Option value="PDA">PDA</Option>
                  <Option value="Scanner">Scanner</Option>
                  <Option value="Printer">Printer</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="componentName" label="Áp dụng Model cụ thể">
                <Select placeholder="Tất cả model" allowClear disabled={!form.getFieldValue('categoryName')}>
                  <Option value="Zebra DS2208">Zebra DS2208</Option>
                  <Option value="Honeywell EDA51">Honeywell EDA51</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                <Switch checkedChildren="Đang dùng" unCheckedChildren="Tạm ẩn" />
              </Form.Item>
            </Col>
          </Row>

          {/* 2. CHECKLIST BUILDER */}
          <Divider orientation="horizontal" plain>Danh sách hạng mục kiểm tra (Checklist)</Divider>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Form.List name="checklistItems">
              {(fields, { add, remove, move }) => (
                <>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <div key={key} className="flex gap-2 items-start mb-2 animate-fadeIn">
                      <div className="pt-2 cursor-move text-gray-400">
                        <HolderOutlined />
                      </div>

                      <div className="flex-1 grid grid-cols-12 gap-2">
                        {/* Cột Category */}
                        <div className="col-span-3">
                          <Form.Item
                            {...restField}
                            name={[name, 'category']}
                            rules={[{ required: true, message: 'Thiếu nhóm' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Select placeholder="Nhóm" showSearch allowClear mode="tags">
                              <Option value="Ngoại quan">Ngoại quan</Option>
                              <Option value="Chức năng">Chức năng</Option>
                              <Option value="Pin & Nguồn">Pin & Nguồn</Option>
                              <Option value="Phụ kiện">Phụ kiện</Option>
                            </Select>
                          </Form.Item>
                        </div>

                        {/* Cột Label */}
                        <div className="col-span-7">
                          <Form.Item
                            {...restField}
                            name={[name, 'label']}
                            rules={[{ required: true, message: 'Thiếu nội dung' }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder="Nội dung kiểm tra (VD: Màn hình sáng rõ...)" />
                          </Form.Item>
                        </div>

                        {/* Cột Mandatory */}
                        <div className="col-span-2 text-center">
                          <Form.Item
                            {...restField}
                            name={[name, 'mandatory']}
                            valuePropName="checked"
                            style={{ marginBottom: 0 }}
                          >
                            <Switch size="small" checkedChildren="Bắt buộc" unCheckedChildren="Tùy chọn" />
                          </Form.Item>
                        </div>
                      </div>

                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(name)}
                      />
                    </div>
                  ))}

                  <Form.Item style={{ marginBottom: 0, marginTop: 12 }}>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Thêm hạng mục kiểm tra
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </div>

          <Row gutter={16} className="mt-4">
            <Col span={12}>
              <Form.Item name="passingScore" label="Điểm đạt tối thiểu (nếu dùng thang điểm)">
                <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="VD: 80" />
              </Form.Item>
            </Col>
          </Row>

        </Form>
      </Modal>
    </div>
  );
};

export default InspectionTemplateManager;