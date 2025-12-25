import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Tag,
  Space,
  Modal,
  Form,
  Select,
  Switch,
  message,
  Tooltip,
  Popconfirm,
  Row,
  Col
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  PhoneOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

// 1. Định nghĩa kiểu dữ liệu khớp với bảng SQL
interface WarehouseType {
  WarehouseID: string;
  WarehouseName: string;
  Address: string;
  City: string;
  District: string;
  Ward: string;
  PhoneNumber: string;
  ManagerUserID: string; // Lưu ID
  ManagerName?: string; // Tên hiển thị (Do FE map hoặc BE join)
  IsActive: boolean;
}

// 2. Dữ liệu giả lập (Mock Data)
const initialData: WarehouseType[] = [
  {
    WarehouseID: 'wh-001',
    WarehouseName: 'Kho Tổng TP.HCM',
    Address: '123 Kha Vạn Cân',
    Ward: 'Phường Hiệp Bình Chánh',
    District: 'TP. Thủ Đức',
    City: 'TP. Hồ Chí Minh',
    PhoneNumber: '0909123456',
    ManagerUserID: 'user-01',
    ManagerName: 'Nguyễn Văn Quản Lý',
    IsActive: true,
  },
  {
    WarehouseID: 'wh-002',
    WarehouseName: 'Kho Phân Phối Hà Nội',
    Address: '456 Giải Phóng',
    Ward: 'Phường Giáp Bát',
    District: 'Quận Hoàng Mai',
    City: 'Hà Nội',
    PhoneNumber: '0912345678',
    ManagerUserID: 'user-02',
    ManagerName: 'Trần Thị Thủ Kho',
    IsActive: true,
  },
];

// Danh sách User giả lập để chọn Manager
const mockUsers = [
  { label: 'Nguyễn Văn Quản Lý', value: 'user-01' },
  { label: 'Trần Thị Thủ Kho', value: 'user-02' },
  { label: 'Lê Văn Staff', value: 'user-03' },
];

const WarehouseList: React.FC = () => {
  const [data, setData] = useState<WarehouseType[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // --- HÀM XỬ LÝ ---

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    // Set mặc định IsActive = true
    form.setFieldsValue({ IsActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (record: WarehouseType) => {
    setEditingId(record.WarehouseID);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter((item) => item.WarehouseID !== id));
    message.success('Đã xóa kho hàng');
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Tìm tên Manager dựa trên ID đã chọn để hiển thị ra bảng
      const manager = mockUsers.find(u => u.value === values.ManagerUserID);
      const newRecord = {
        ...values,
        ManagerName: manager?.label || 'Unknown',
        WarehouseID: editingId || `wh-${Date.now()}` // Tạo ID giả
      };

      if (editingId) {
        // Cập nhật
        setData(data.map(item => item.WarehouseID === editingId ? newRecord : item));
        message.success('Cập nhật kho thành công!');
      } else {
        // Thêm mới
        setData([...data, newRecord]);
        message.success('Tạo kho mới thành công!');
      }
      setIsModalOpen(false);
    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  // --- CẤU HÌNH BẢNG ---

  const columns: ColumnsType<WarehouseType> = [
    {
      title: 'Tên Kho & Liên hệ',
      dataIndex: 'WarehouseName',
      key: 'name',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-blue-600 text-base">{record.WarehouseName}</span>
          <span className="text-gray-500 text-sm">
            <PhoneOutlined className="mr-1" /> {record.PhoneNumber}
          </span>
        </div>
      ),
    },
    {
      title: 'Địa chỉ',
      key: 'address',
      responsive: ['md'],
      render: (_, record) => (
        <div className="text-sm">
          <div className="font-medium text-gray-700">{record.Address}</div>
          <div className="text-gray-500 text-xs">
            {record.Ward}, {record.District}, {record.City}
          </div>
        </div>
      ),
    },
    {
      title: 'Quản lý',
      dataIndex: 'ManagerUserID',
      key: 'manager',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <UserOutlined />
          </div>
          <span className="font-medium text-gray-700">{record.ManagerName}</span>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'IsActive',
      key: 'status',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined className="text-blue-600" />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa kho hàng này?"
            description="Lưu ý: Chỉ nên xóa kho nếu chưa có hàng hóa!"
            onConfirm={() => handleDelete(record.WarehouseID)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0">Danh sách Kho hàng</h1>
          <p className="text-gray-500">Quản lý các địa điểm lưu trữ và chi nhánh</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-blue-600"
          onClick={handleAdd}
        >
          Tạo kho mới
        </Button>
      </div>

      {/* SEARCH */}
      <Card className="mb-4 shadow-sm" bordered={false} bodyStyle={{ padding: '16px' }}>
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm tên kho, số điện thoại hoặc quản lý..."
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-md"
        />
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data.filter(item =>
            item.WarehouseName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.ManagerName?.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="WarehouseID"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* MODAL FORM (CREATE / EDIT) */}
      <Modal
        title={editingId ? "Cập nhật thông tin Kho" : "Thêm Kho mới"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        okText="Lưu thông tin"
        cancelText="Hủy bỏ"
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Row gutter={16}>
            {/* Cột 1: Thông tin cơ bản */}
            <Col span={12}>
              <Form.Item
                name="WarehouseName"
                label="Tên kho"
                rules={[{ required: true, message: 'Vui lòng nhập tên kho' }]}
              >
                <Input prefix={<HomeOutlined />} placeholder="Ví dụ: Kho Tổng HCM" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="PhoneNumber"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Nhập số hotline kho' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="0909..." />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="ManagerUserID"
                label="Người quản lý (Manager)"
                rules={[{ required: true, message: 'Chọn người quản lý kho' }]}
              >
                <Select
                  placeholder="Chọn nhân viên"
                  options={mockUsers}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="IsActive" label="Trạng thái hoạt động" valuePropName="checked">
                <Switch checkedChildren="Đang hoạt động" unCheckedChildren="Đóng cửa" />
              </Form.Item>
            </Col>
          </Row>

          <div className="bg-gray-50 p-4 rounded-md mb-4 border border-gray-200">
            <span className="font-semibold text-gray-700 block mb-3">Địa chỉ chi tiết</span>
            <Form.Item
              name="Address"
              label="Số nhà, tên đường"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
            >
              <Input placeholder="Ví dụ: 123 Đường ABC" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="City" label="Tỉnh / Thành phố" rules={[{ required: true }]}>
                  {/* Sau này nên dùng Select Load API */}
                  <Input placeholder="TP.HCM" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="District" label="Quận / Huyện" rules={[{ required: true }]}>
                  <Input placeholder="Thủ Đức" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="Ward" label="Phường / Xã" rules={[{ required: true }]}>
                  <Input placeholder="Hiệp Bình Chánh" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default WarehouseList;