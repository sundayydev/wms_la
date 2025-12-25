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
  Col,
  Avatar,
  Badge
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

// ============================================================================
// 1. TYPES & MOCK DATA
// ============================================================================

interface UserType {
  UserID: string;
  Username: string;
  Email: string;
  PhoneNumber: string;
  Role: 'ADMIN' | 'RECEPTIONIST' | 'TECHNICIAN' | 'WAREHOUSE';
  IsActive: boolean;
  CreatedAt: string;
  Password?: string; // Chỉ dùng khi submit form, không hiển thị
}

const initialUsers: UserType[] = [
  {
    UserID: 'u1',
    Username: 'admin_sys',
    Email: 'admin@wms.com',
    PhoneNumber: '0909111222',
    Role: 'ADMIN',
    IsActive: true,
    CreatedAt: '2024-01-01',
  },
  {
    UserID: 'u2',
    Username: 'kho_tong',
    Email: 'warehouse@wms.com',
    PhoneNumber: '0909333444',
    Role: 'WAREHOUSE',
    IsActive: true,
    CreatedAt: '2024-02-15',
  },
  {
    UserID: 'u3',
    Username: 'ky_thuat_vien',
    Email: 'tech@wms.com',
    PhoneNumber: '0909555666',
    Role: 'TECHNICIAN',
    IsActive: false, // Đã nghỉ việc
    CreatedAt: '2024-03-10',
  },
];

const roleOptions = [
  { label: 'Quản trị viên (Admin)', value: 'ADMIN' },
  { label: 'Thủ kho (Warehouse)', value: 'WAREHOUSE' },
  { label: 'Lễ tân (Receptionist)', value: 'RECEPTIONIST' },
  { label: 'Kỹ thuật viên (Technician)', value: 'TECHNICIAN' },
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

const UserList: React.FC = () => {
  const [data, setData] = useState<UserType[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // --- Helpers ---

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'red';
      case 'WAREHOUSE': return 'blue';
      case 'TECHNICIAN': return 'orange';
      case 'RECEPTIONIST': return 'purple';
      default: return 'default';
    }
  };

  // --- Handlers ---

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ IsActive: true, Role: 'WAREHOUSE' });
    setIsModalOpen(true);
  };

  const handleEdit = (record: UserType) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter(u => u.UserID !== id));
    message.success('Đã xóa nhân viên');
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (editingUser) {
        // Edit logic
        const updatedData = data.map(u =>
          u.UserID === editingUser.UserID ? { ...u, ...values } : u
        );
        setData(updatedData);
        message.success('Cập nhật thông tin thành công!');
      } else {
        // Create logic
        const newUser: UserType = {
          ...values,
          UserID: `u${Date.now()}`,
          CreatedAt: dayjs().format('YYYY-MM-DD'),
        };
        setData([...data, newUser]);
        message.success('Thêm nhân viên mới thành công!');
      }
      setIsModalOpen(false);
    } catch (error) {
      // Validate failed
    }
  };

  // --- Table Columns ---

  const columns: ColumnsType<UserType> = [
    {
      title: 'Nhân viên',
      dataIndex: 'Username',
      key: 'user',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ backgroundColor: getRoleColor(record.Role) }} icon={<UserOutlined />} />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{text}</span>
            <span className="text-xs text-gray-400">ID: {record.UserID}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col text-sm text-gray-600">
          <div className="flex items-center gap-2"><MailOutlined /> {record.Email}</div>
          <div className="flex items-center gap-2"><PhoneOutlined /> {record.PhoneNumber}</div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'Role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)} className="font-semibold">
          {role}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'IsActive',
      key: 'status',
      render: (active) => (
        <Badge
          status={active ? 'success' : 'error'}
          text={active ? <span className="text-green-600">Hoạt động</span> : <span className="text-red-500">Đã khóa</span>}
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'CreatedAt',
      key: 'created',
      render: (date) => <span className="text-gray-500">{date}</span>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa thông tin">
            <Button type="text" icon={<EditOutlined className="text-blue-600" />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa tài khoản này?"
            description="Hành động này sẽ vô hiệu hóa quyền truy cập của user."
            onConfirm={() => handleDelete(record.UserID)}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <UserOutlined /> Quản lý Nhân viên
          </h1>
          <p className="text-gray-500 mt-1">Quản lý tài khoản truy cập hệ thống WMS</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-blue-600"
          onClick={handleAdd}
        >
          Thêm nhân viên
        </Button>
      </div>

      {/* FILTER */}
      <Card className="mb-6 shadow-sm" bordered={false} bodyStyle={{ padding: '16px' }}>
        <div className="flex gap-4">
          <Input
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm theo Username, Email hoặc SĐT..."
            className="max-w-md"
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="Lọc theo Vai trò"
            allowClear
            options={roleOptions}
            className="w-48"
          />
        </div>
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data.filter(u =>
            u.Username.toLowerCase().includes(searchText.toLowerCase()) ||
            u.Email.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="UserID"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* MODAL FORM */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            {editingUser ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingUser ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</span>
          </div>
        }
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        okText="Lưu thông tin"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="Username"
                label="Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập username' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="vd: nguyenvan_a" disabled={!!editingUser} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="Role"
                label="Vai trò (Role)"
                rules={[{ required: true, message: 'Chọn vai trò' }]}
              >
                <Select options={roleOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="Email"
                label="Email"
                rules={[
                  { required: true },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="email@wms.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="PhoneNumber"
                label="Số điện thoại"
                rules={[{ required: true }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <span className="font-semibold text-gray-700 block mb-2"><SafetyCertificateOutlined /> Bảo mật & Trạng thái</span>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="Password"
                  label={editingUser ? "Mật khẩu mới (Để trống nếu không đổi)" : "Mật khẩu"}
                  rules={[{ required: !editingUser, message: 'Nhập mật khẩu' }]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="********" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="IsActive" label="Trạng thái tài khoản" valuePropName="checked">
                  <Switch
                    checkedChildren={<CheckCircleOutlined />}
                    unCheckedChildren={<StopOutlined />}
                    defaultChecked
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;