import React, { useState } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Space,
  Modal,
  Form,
  message,
  Tooltip,
  Popconfirm,
  Typography,
  Tag
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
  FolderOpenOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Text } = Typography;

// ============================================================================
// 1. TYPES & MOCK DATA
// ============================================================================

interface CategoryType {
  CategoryID: string;
  CategoryName: string;
  ProductCount: number; // Trường giả lập (Frontend only)
  CreatedAt: string;
  UpdatedAt: string;
}

const initialData: CategoryType[] = [
  {
    CategoryID: 'cat-001',
    CategoryName: 'Điện thoại thông minh',
    ProductCount: 150,
    CreatedAt: '2024-01-01',
    UpdatedAt: '2024-01-01',
  },
  {
    CategoryID: 'cat-002',
    CategoryName: 'Laptop & Macbook',
    ProductCount: 45,
    CreatedAt: '2024-01-10',
    UpdatedAt: '2024-02-15',
  },
  {
    CategoryID: 'cat-003',
    CategoryName: 'Phụ kiện - Cáp sạc',
    ProductCount: 320,
    CreatedAt: '2024-03-05',
    UpdatedAt: '2024-03-05',
  },
  {
    CategoryID: 'cat-004',
    CategoryName: 'Linh kiện sửa chữa',
    ProductCount: 1200,
    CreatedAt: '2024-04-20',
    UpdatedAt: '2024-04-20',
  },
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

const CategoryList: React.FC = () => {
  const [data, setData] = useState<CategoryType[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CategoryType | null>(null);
  const [searchText, setSearchText] = useState('');

  const [form] = Form.useForm();

  // --- HANDLERS ---

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: CategoryType) => {
    setEditingRecord(record);
    form.setFieldsValue({ CategoryName: record.CategoryName });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    // Logic gọi API xóa (Soft Delete)
    setData(data.filter(item => item.CategoryID !== id));
    message.success('Đã xóa danh mục');
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Giả lập delay API
      await new Promise(resolve => setTimeout(resolve, 600));

      if (editingRecord) {
        // Update logic
        const updatedData = data.map(item =>
          item.CategoryID === editingRecord.CategoryID
            ? { ...item, CategoryName: values.CategoryName, UpdatedAt: dayjs().format('YYYY-MM-DD') }
            : item
        );
        setData(updatedData);
        message.success('Cập nhật thành công');
      } else {
        // Create logic
        const newItem: CategoryType = {
          CategoryID: `cat-${Date.now()}`,
          CategoryName: values.CategoryName,
          ProductCount: 0,
          CreatedAt: dayjs().format('YYYY-MM-DD'),
          UpdatedAt: dayjs().format('YYYY-MM-DD'),
        };
        setData([newItem, ...data]); // Thêm vào đầu danh sách
        message.success('Thêm danh mục mới thành công');
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error('Validate Failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- TABLE COLUMNS ---

  const columns: ColumnsType<CategoryType> = [
    {
      title: 'Tên danh mục',
      dataIndex: 'CategoryName',
      key: 'name',
      render: (text) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <FolderOpenOutlined className="text-lg" />
          </div>
          <span className="font-semibold text-gray-700 text-base">{text}</span>
        </div>
      ),
    },
    {
      title: 'Số lượng SP',
      dataIndex: 'ProductCount',
      key: 'count',
      align: 'center',
      sorter: (a, b) => a.ProductCount - b.ProductCount,
      render: (count) => (
        <Tag color="cyan" className="rounded-full px-3">
          {count} sản phẩm
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'CreatedAt',
      key: 'created',
      render: (date) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY')}</Text>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center',
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
            title="Xóa danh mục?"
            description="Hành động này sẽ không xóa các sản phẩm bên trong."
            onConfirm={() => handleDelete(record.CategoryID)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
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
            <TagsOutlined /> Danh mục sản phẩm
          </h1>
          <p className="text-gray-500 mt-1">Phân loại hàng hóa và linh kiện trong kho</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          className="bg-blue-600 shadow-md hover:shadow-lg transition-all"
        >
          Thêm danh mục
        </Button>
      </div>

      {/* FILTER & TOOLBAR */}
      <Card className="mb-6 shadow-sm" bordered={false} bodyStyle={{ padding: '16px' }}>
        <div className="flex justify-between items-center">
          <Input
            placeholder="Tìm kiếm danh mục..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="max-w-md"
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Tooltip title="Làm mới dữ liệu">
            <Button icon={<ReloadOutlined />} onClick={() => message.info('Đã làm mới!')} />
          </Tooltip>
        </div>
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data.filter(item =>
            item.CategoryName.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="CategoryID"
          pagination={{ pageSize: 8 }}
          loading={loading}
        />
      </Card>

      {/* MODAL FORM */}
      <Modal
        title={editingRecord ? "Cập nhật danh mục" : "Thêm danh mục mới"}
        open={isModalOpen}
        onOk={handleSave}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={loading}
        okText="Lưu lại"
        cancelText="Hủy bỏ"
      >
        <Form form={form} layout="vertical" className="pt-4">
          <Form.Item
            name="CategoryName"
            label="Tên danh mục"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục' },
              { max: 100, message: 'Tên quá dài (tối đa 100 ký tự)' }
            ]}
          >
            <Input
              placeholder="Ví dụ: Điện thoại, Phụ kiện..."
              prefix={<FolderOpenOutlined className="text-gray-400" />}
              autoFocus
            />
          </Form.Item>

          <div className="bg-blue-50 p-3 rounded text-sm text-blue-700 border border-blue-100">
            <span className="font-bold">Lưu ý:</span> Tên danh mục nên ngắn gọn và duy nhất để dễ quản lý.
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryList;