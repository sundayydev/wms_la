import React, { useState, useEffect } from 'react';
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
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  UserOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { warehousesService, usersService } from '../../services';
import type { WarehouseListDto, CreateWarehouseDto, UpdateWarehouseDto } from '../../types/type.warehouse';
import type { UserListDto } from '../../types/api.types';

const WarehouseList: React.FC = () => {
  const [data, setData] = useState<WarehouseListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // --- API CALLS ---

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await warehousesService.getAllWarehouses(true); // Include inactive
      if (response.success) {
        setData(response.data);
      } else {
        message.warning(response.message);
      }
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
      message.error('Không thể tải danh sách kho');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Lấy danh sách user để chọn Manager (tạm thời lấy 100 user đầu tiên)
      // Lý tưởng nhất là có API getManagers hoặc filter user theo role
      const response = await usersService.getUsers({ pageSize: 100, isActive: true });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  // --- HANDLERS ---

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = async (record: WarehouseListDto) => {
    setEditingId(record.warehouseID);
    // Fetch chi tiết để lấy đầy đủ thông tin (nếu cần)
    // Ở đây ta dùng tạm data từ list, nhưng đúng ra nên gọi API detail nếu thiếu trường
    try {
      const detailRes = await warehousesService.getWarehouseById(record.warehouseID);
      if (detailRes.success && detailRes.data) {
        form.setFieldsValue({
          warehouseName: detailRes.data.warehouseName,
          address: detailRes.data.address,
          phoneNumber: detailRes.data.phoneNumber,
          managerUserID: detailRes.data.managerUserID,
          isActive: detailRes.data.isActive
        });
        setIsModalOpen(true);
      } else {
        message.error('Không thể lấy chi tiết kho');
      }
    } catch (e) {
      message.error('Lỗi khi tải thông tin kho');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await warehousesService.deleteWarehouse(id);
      if (res.success) {
        message.success('Đã xóa kho hàng');
        fetchData();
      } else {
        message.error(res.message || 'Xóa thất bại');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xóa kho');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      let success = false;
      let msg = '';

      if (editingId) {
        // Update
        const updateDto: UpdateWarehouseDto = {
          warehouseName: values.warehouseName,
          address: values.address,
          phoneNumber: values.phoneNumber,
          managerUserID: values.managerUserID,
          isActive: values.isActive
        };
        const res = await warehousesService.updateWarehouse(editingId, updateDto);
        success = res.success;
        msg = res.message || 'Cập nhật thành công';
      } else {
        // Create
        const createDto: CreateWarehouseDto = {
          warehouseName: values.warehouseName,
          address: values.address,
          phoneNumber: values.phoneNumber,
          managerUserID: values.managerUserID
        };
        const res = await warehousesService.createWarehouse(createDto);
        success = res.success;
        msg = res.message || 'Tạo kho thành công';
      }

      if (success) {
        message.success(msg);
        setIsModalOpen(false);
        fetchData();
      } else {
        message.error(msg);
      }

    } catch (error) {
      console.log('Validate Failed:', error);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await warehousesService.restoreWarehouse(id);
      if (res.success) {
        message.success('Đã khôi phục kho');
        fetchData();
      } else {
        message.error(res.message);
      }
    } catch (e) {
      message.error('Lỗi khi khôi phục');
    }
  };

  // --- TABLE COLUMNS ---

  const columns: ColumnsType<WarehouseListDto> = [
    {
      title: 'Tên Kho & Liên hệ',
      dataIndex: 'warehouseName',
      key: 'name',
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-blue-600 text-base">{record.warehouseName}</span>
          <span className="text-gray-500 text-sm">
            <PhoneOutlined className="mr-1" /> {record.phoneNumber || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      responsive: ['md'],
      render: (addr) => (
        <div className="text-sm text-gray-700 max-w-xs truncate" title={addr}>
          {addr || 'Chưa cập nhật'}
        </div>
      ),
    },
    {
      title: 'Quản lý',
      dataIndex: 'managerName',
      key: 'manager',
      render: (name) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <UserOutlined />
          </div>
          <span className="font-medium text-gray-700">{name || 'Chưa chỉ định'}</span>
        </div>
      ),
    },
    {
      title: 'Thống kê',
      key: 'stats',
      render: (_, record) => (
        <div className="text-xs text-gray-500">
          <div>NV: <b>{record.totalUsers}</b></div>
          <div>SP: <b>{record.totalProducts}</b></div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
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

          {record.isActive ? (
            <Popconfirm
              title="Xóa kho hàng này?"
              description="Lưu ý: Chỉ nên xóa kho nếu chưa có hàng hóa!"
              onConfirm={() => handleDelete(record.warehouseID)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          ) : (
            // Nếu đã xóa mềm hoặc không hoạt động, có thể cho phép restore hoặc xóa thật (tuỳ logic BE)
            // Backend hiện tại là Soft Delete khi gọi API Delete.
            // Logic FE: Nếu !isActive chưa chắc là đã xóa mềm, mà có thể chỉ là inactive.
            // Tuy nhiên, với API Delete hiện tại, nó set IsDeleted = true (thường là vậy) và IsActive = false.
            // Nhưng API GetAll có param includeInactive.
            // Thêm nút Restore nếu cần thiết, hoặc chỉ nút Delete.
            <Button type="text" onClick={() => handleRestore(record.warehouseID)} title="Khôi phục">
              <ReloadOutlined />
            </Button>
          )}

        </Space>
      ),
    },
  ];

  // Filter Data
  const filteredData = data.filter(item => {
    const search = searchText.toLowerCase();
    return (
      item.warehouseName.toLowerCase().includes(search) ||
      (item.managerName && item.managerName.toLowerCase().includes(search)) ||
      (item.phoneNumber && item.phoneNumber.includes(search))
    );
  });

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
          loading={loading}
          columns={columns}
          dataSource={filteredData}
          rowKey="warehouseID"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* MODAL FORM (CREATE / EDIT) */}
      <Modal
        title={editingId ? "Cập nhật thông tin Kho" : "Thêm Kho mới"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        okText="Lưu thông tin"
        cancelText="Hủy bỏ"
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="warehouseName"
            label="Tên kho"
            rules={[{ required: true, message: 'Vui lòng nhập tên kho' }]}
          >
            <Input placeholder="Ví dụ: Kho Tổng TP.HCM" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
              >
                <Input prefix={<PhoneOutlined />} placeholder="0909..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="managerUserID"
                label="Người quản lý"
              >
                <Select
                  placeholder="Chọn quản lý"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={users.map(u => ({ label: `${u.fullName} (${u.username})`, value: u.userID }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ chi tiết..." />
          </Form.Item>

          {editingId && (
            <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
              <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngưng hoạt động" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};


export default WarehouseList;