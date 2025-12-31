import React, { useState, useEffect } from 'react';
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
  Tag,
  Switch
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
  FolderOpenOutlined,
  ReloadOutlined,
  UndoOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { categoriesService } from '../../services';
import type { CategoryListDto, CreateCategoryDto, UpdateCategoryDto } from '../../types/type.category';

const { Text } = Typography;

// ============================================================================
// COMPONENT CHÍNH
// ============================================================================

const CategoryList: React.FC = () => {
  const [data, setData] = useState<CategoryListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CategoryListDto | null>(null);
  const [searchText, setSearchText] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);

  const [form] = Form.useForm();

  // --- LOAD DATA ---
  const loadCategories = async () => {
    try {
      setLoading(true);

      const response = await categoriesService.getAllCategories(includeDeleted);

      if (response.success && response.data) {
        setData(response.data);
      } else {
        message.error(response.message || 'Không thể tải danh sách danh mục');
      }
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi khi tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [includeDeleted]);

  // --- HANDLERS ---

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record: CategoryListDto) => {
    setEditingRecord(record);
    form.setFieldsValue({ categoryName: record.categoryName });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      const response = await categoriesService.deleteCategory(id);

      if (response.success) {
        message.success('Đã xóa danh mục thành công');
        loadCategories();
      } else {
        message.error(response.message || 'Không thể xóa danh mục');
      }
    } catch (error: any) {
      console.error('Error deleting category:', error);
      message.error(error?.response?.data?.message || 'Lỗi khi xóa danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setLoading(true);
      const response = await categoriesService.restoreCategory(id);

      if (response.success) {
        message.success('Đã khôi phục danh mục thành công');
        loadCategories();
      } else {
        message.error(response.message || 'Không thể khôi phục danh mục');
      }
    } catch (error: any) {
      console.error('Error restoring category:', error);
      message.error(error?.response?.data?.message || 'Lỗi khi khôi phục danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingRecord) {
        // Update
        const updateDto: UpdateCategoryDto = {
          categoryName: values.categoryName,
        };
        const response = await categoriesService.updateCategory(editingRecord.categoryID, updateDto);

        if (response.success) {
          message.success('Cập nhật danh mục thành công');
          setIsModalOpen(false);
          loadCategories();
        } else {
          message.error(response.message || 'Không thể cập nhật danh mục');
        }
      } else {
        // Create
        const createDto: CreateCategoryDto = {
          categoryName: values.categoryName,
        };
        const response = await categoriesService.createCategory(createDto);

        if (response.success) {
          message.success('Thêm danh mục mới thành công');
          setIsModalOpen(false);
          loadCategories();
        } else {
          message.error(response.message || 'Không thể thêm danh mục');
        }
      }
    } catch (error: any) {
      console.error('Error saving category:', error);
      if (error?.errorFields) {
        // Validation error
        return;
      }
      message.error(error?.response?.data?.message || 'Lỗi khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  // --- TABLE COLUMNS ---

  const columns: ColumnsType<CategoryListDto> = [
    {
      title: 'Tên danh mục',
      dataIndex: 'categoryName',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <FolderOpenOutlined className="text-lg" />
          </div>
          <div className="flex flex-col">
            <span className={`font-semibold text-base ${record.deletedAt ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
              {text}
            </span>
            {record.deletedAt && (
              <Text type="danger" className="text-xs">
                Đã xóa: {dayjs(record.deletedAt).format('DD/MM/YYYY HH:mm')}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Số lượng SP',
      dataIndex: 'componentCount',
      key: 'count',
      align: 'center',
      width: 150,
      sorter: (a, b) => a.componentCount - b.componentCount,
      render: (count) => (
        <Tag color="cyan" className="rounded-full px-3">
          {count} sản phẩm
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'created',
      width: 150,
      render: (date) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY')}</Text>
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updated',
      width: 150,
      render: (date) => <Text type="secondary">{dayjs(date).format('DD/MM/YYYY')}</Text>
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record) => {
        if (record.deletedAt) {
          // Danh mục đã xóa - chỉ hiển thị nút khôi phục
          return (
            <Tooltip title="Khôi phục">
              <Button
                type="primary"
                icon={<UndoOutlined />}
                onClick={() => handleRestore(record.categoryID)}
                size="small"
              >
                Khôi phục
              </Button>
            </Tooltip>
          );
        }

        // Danh mục đang hoạt động - hiển thị edit và delete
        return (
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
              onConfirm={() => handleDelete(record.categoryID)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa">
                <Button type="text" danger icon={<DeleteOutlined />} />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // Filtered data based on search
  const filteredData = data.filter(item =>
    item.categoryName?.toLowerCase()
      .includes(searchText?.toLowerCase() ?? "") ?? false
  );

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
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Input
            placeholder="Tìm kiếm danh mục..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="max-w-md"
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
          <Space>
            <div className="flex items-center gap-2">
              <Text>Hiển thị danh mục đã xóa:</Text>
              <Switch
                checked={includeDeleted}
                onChange={setIncludeDeleted}
                checkedChildren="Có"
                unCheckedChildren="Không"
              />
            </div>
            <Tooltip title="Làm mới dữ liệu">
              <Button icon={<ReloadOutlined />} onClick={loadCategories} />
            </Tooltip>
          </Space>
        </div>
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="categoryID"
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Tổng ${total} danh mục`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          loading={loading}
          rowClassName={(record) => record.deletedAt ? 'bg-gray-50' : ''}
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
            name="categoryName"
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
