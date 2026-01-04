import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Card,
  Button,
  Input,
  Tag,
  Space,
  Modal,
  Form,
  Switch,
  message,
  Tooltip,
  Row,
  Col,
  Tabs,
  Empty,
  Statistic,
  Descriptions,
  Divider,
  Badge,
  Typography,
  Select,
  Avatar,
  Dropdown,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  BankOutlined,
  GlobalOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  IdcardOutlined,
  NumberOutlined,
  CalendarOutlined,
  MoreOutlined,
  FileExcelOutlined,
  LinkOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { FilterValue } from 'antd/es/table/interface';
import type { MenuProps } from 'antd';
import { FaBuilding } from 'react-icons/fa';
import {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
  checkSupplierCodeExists,
} from '../../services/suppliers.service';
import type {
  SupplierListDto,
  SupplierDetailDto,
  CreateSupplierDto,
  UpdateSupplierDto,
} from '../../types/type.supplier';

const { TextArea } = Input;
const { Title, Text } = Typography;

const SupplierList: React.FC = () => {
  // State
  const [data, setData] = useState<SupplierListDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SupplierDetailDto | null>(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierDetailDto | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Code validation
  const [checkingCode, setCheckingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);

  // === DATA FETCHING ===
  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSuppliers({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText || undefined,
        isActive: statusFilter,
      });

      if (response.success) {
        setData(response.data);
        setPagination((prev) => ({
          ...prev,
          total: response.totalItems,
        }));
      } else {
        message.error(response.message || 'Không thể tải danh sách nhà cung cấp');
      }
    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
      message.error('Lỗi kết nối server. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, searchText, statusFilter]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // === EVENT HANDLERS ===
  const handleTableChange = (
    paginationConfig: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
  ) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 20,
    }));
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleStatusFilterChange = (value: string | undefined) => {
    if (value === 'all') {
      setStatusFilter(undefined);
    } else if (value === 'active') {
      setStatusFilter(true);
    } else if (value === 'inactive') {
      setStatusFilter(false);
    }
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true, city: 'TP.HCM' });
    setCodeError(null);
    setIsModalOpen(true);
  };

  const handleEdit = async (record: SupplierListDto | SupplierDetailDto) => {
    setLoading(true);
    try {
      const response = await getSupplierById(record.supplierID);
      if (response.success && response.data) {
        setEditingRecord(response.data);
        form.setFieldsValue(response.data);
        setCodeError(null);
        setIsModalOpen(true);
      } else {
        message.error(response.message || 'Không thể tải thông tin nhà cung cấp');
      }
    } catch (error) {
      console.error('Error loading supplier:', error);
      message.error('Lỗi khi tải thông tin nhà cung cấp');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (record: SupplierListDto) => {
    setLoadingDetail(true);
    setDetailModalOpen(true);
    try {
      const response = await getSupplierById(record.supplierID);
      if (response.success && response.data) {
        setSelectedSupplier(response.data);
      } else {
        message.error(response.message || 'Không thể tải thông tin chi tiết');
      }
    } catch (error) {
      console.error('Error loading supplier detail:', error);
      message.error('Lỗi khi tải thông tin chi tiết');
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await deleteSupplier(id);
      if (response.success) {
        message.success('Đã xóa nhà cung cấp thành công');
        fetchSuppliers();
      } else {
        message.error(response.message || 'Không thể xóa nhà cung cấp');
      }
    } catch (error: any) {
      console.error('Error deleting supplier:', error);
      message.error(error.response?.data?.message || 'Lỗi khi xóa nhà cung cấp');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await toggleSupplierStatus(id, !currentStatus);
      if (response.success) {
        message.success(currentStatus ? 'Đã ngừng hoạt động nhà cung cấp' : 'Đã kích hoạt nhà cung cấp');
        fetchSuppliers();
      } else {
        message.error(response.message || 'Không thể thay đổi trạng thái');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      message.error('Lỗi khi thay đổi trạng thái');
    }
  };

  const handleCheckCode = async (code: string) => {
    if (!code || code.length < 2) {
      setCodeError(null);
      return;
    }
    setCheckingCode(true);
    try {
      const response = await checkSupplierCodeExists(code, editingRecord?.supplierID);
      if (response.success && response.data) {
        setCodeError('Mã nhà cung cấp đã tồn tại');
      } else {
        setCodeError(null);
      }
    } catch (error) {
      console.error('Error checking code:', error);
    } finally {
      setCheckingCode(false);
    }
  };

  const handleRefresh = () => {
    fetchSuppliers();
    message.success('Đã làm mới dữ liệu');
  };

  const onFinish = async (values: CreateSupplierDto | UpdateSupplierDto) => {
    if (codeError) {
      message.error('Vui lòng kiểm tra lại mã nhà cung cấp');
      return;
    }

    setSubmitting(true);
    try {
      if (editingRecord) {
        // Update
        const response = await updateSupplier(editingRecord.supplierID, values as UpdateSupplierDto);
        if (response.success) {
          message.success('Cập nhật nhà cung cấp thành công!');
          setIsModalOpen(false);
          fetchSuppliers();
        } else {
          message.error(response.message || 'Cập nhật thất bại');
        }
      } else {
        // Create
        const response = await createSupplier(values as CreateSupplierDto);
        if (response.success) {
          message.success('Thêm nhà cung cấp mới thành công!');
          setIsModalOpen(false);
          fetchSuppliers();
        } else {
          message.error(response.message || 'Thêm mới thất bại');
        }
      }
    } catch (error: any) {
      console.error('Error saving supplier:', error);
      message.error(error.response?.data?.message || 'Lỗi khi lưu nhà cung cấp');
    } finally {
      setSubmitting(false);
    }
  };

  // Action Menu
  const getActionMenuItems = (record: SupplierListDto): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'Xem chi tiết',
      onClick: () => handleViewDetail(record),
    },
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Chỉnh sửa',
      onClick: () => handleEdit(record),
    },
    { type: 'divider' },
    {
      key: 'toggle',
      icon: record.isActive ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
      label: record.isActive ? 'Ngừng hoạt động' : 'Kích hoạt',
      onClick: () => handleToggleStatus(record.supplierID, record.isActive),
    },
    { type: 'divider' },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Xóa',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Xóa nhà cung cấp?',
          content: 'Hành động này không thể hoàn tác',
          okText: 'Xóa',
          okButtonProps: { danger: true },
          cancelText: 'Hủy',
          onOk: () => handleDelete(record.supplierID),
        });
      },
    },
  ];

  // === TABLE COLUMNS ===
  const columns: ColumnsType<SupplierListDto> = [
    {
      title: 'Nhà cung cấp',
      key: 'supplier',
      width: 300,
      fixed: 'left',
      render: (_, record) => (
        <div className="flex items-start gap-3">
          <Avatar
            size={48}
            src={record.logoUrl}
            icon={!record.logoUrl && <ShopOutlined />}
            className="bg-gradient-to-br border border-blue-500 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <a
              className="font-semibold text-blue-600 hover:text-blue-700 hover:underline text-base block truncate"
              onClick={() => handleViewDetail(record)}
            >
              {record.supplierName}
            </a>
            <div className="flex items-center gap-2 mt-1">
              <Tag className="m-0" icon={<IdcardOutlined />}>
                {record.supplierCode}
              </Tag>
              {record.city && (
                <Tag className="m-0" icon={<EnvironmentOutlined />} color="cyan">
                  {record.city}
                </Tag>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      width: 220,
      render: (_, record) => (
        <div className="flex flex-col gap-1.5 text-sm">
          {record.contactPerson && (
            <div className="flex items-center gap-2 text-gray-700">
              <UserOutlined className="text-gray-400" />
              <span className="font-medium">{record.contactPerson}</span>
            </div>
          )}
          {record.phoneNumber && (
            <div className="flex items-center gap-2">
              <PhoneOutlined className="text-green-500" />
              <a href={`tel:${record.phoneNumber}`} className="text-gray-600 hover:text-blue-600">
                {record.phoneNumber}
              </a>
            </div>
          )}
          {record.email && (
            <div className="flex items-center gap-2">
              <MailOutlined className="text-blue-500" />
              <a href={`mailto:${record.email}`} className="text-gray-600 hover:text-blue-600 truncate max-w-[160px]">
                {record.email}
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      width: 120,
      align: 'center',
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Ngừng GD', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (active: boolean) => (
        <Badge
          status={active ? 'success' : 'default'}
          text={active ? 'Hoạt động' : 'Ngừng GD'}
          className="font-medium"
        />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      width: 120,
      responsive: ['lg'],
      render: (date: string) => (
        <div className="text-sm text-gray-600">
          {date ? new Date(date).toLocaleDateString('vi-VN') : '---'}
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']} placement="bottomRight">
          <Button type="text" icon={<MoreOutlined />} className="hover:bg-gray-100" />
        </Dropdown>
      ),
    },
  ];

  // === MODAL FORM ===
  const modalContent = (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: (
              <span className="flex items-center gap-2">
                <InfoCircleOutlined /> Thông tin chung
              </span>
            ),
            children: (
              <>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="supplierCode"
                      label="Mã NCC"
                      rules={[{ required: true, message: 'Vui lòng nhập mã' }]}
                      validateStatus={codeError ? 'error' : checkingCode ? 'validating' : undefined}
                      help={codeError}
                      hasFeedback
                    >
                      <Input
                        placeholder="VD: NCC-001"
                        disabled={!!editingRecord}
                        onBlur={(e) => !editingRecord && handleCheckCode(e.target.value)}
                        prefix={<NumberOutlined />}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      name="supplierName"
                      label="Tên Nhà cung cấp"
                      rules={[{ required: true, message: 'Vui lòng nhập tên NCC' }]}
                    >
                      <Input placeholder="Công ty TNHH..." prefix={<ShopOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="taxCode" label="Mã số thuế">
                      <Input placeholder="Nhập MST" prefix={<FileTextOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="logoUrl" label="URL Logo">
                      <Input placeholder="https://example.com/logo.png" prefix={<LinkOutlined />} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
                      <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
                    </Form.Item>
                  </Col>
                </Row>

                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                  <span className="font-semibold text-blue-700 block mb-3 flex items-center gap-2">
                    <EnvironmentOutlined /> Địa chỉ
                  </span>
                  <Form.Item name="address" className="mb-3">
                    <Input placeholder="Số nhà, tên đường..." />
                  </Form.Item>
                  <Form.Item name="city" className="mb-0">
                    <Input placeholder="Tỉnh / Thành phố" />
                  </Form.Item>
                </div>
              </>
            ),
          },
          {
            key: '2',
            label: (
              <span className="flex items-center gap-2">
                <UserOutlined /> Liên hệ & Tài chính
              </span>
            ),
            children: (
              <>
                <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-100">
                  <span className="font-semibold text-green-700 block mb-3 flex items-center gap-2">
                    <UserOutlined /> Người liên hệ
                  </span>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="contactPerson" label="Họ tên">
                        <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="phoneNumber" label="Số điện thoại">
                        <Input prefix={<PhoneOutlined />} placeholder="0901234567" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="email" label="Email" rules={[{ type: 'email', message: 'Email không hợp lệ' }]}>
                        <Input prefix={<MailOutlined />} placeholder="email@example.com" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg mb-4 border border-purple-100">
                  <span className="font-semibold text-purple-700 block mb-3 flex items-center gap-2">
                    <BankOutlined /> Tài khoản ngân hàng
                  </span>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="bankName" label="Tên Ngân hàng">
                        <Input prefix={<BankOutlined />} placeholder="Vietcombank..." />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="bankAccount" label="Số tài khoản">
                        <Input placeholder="0123xxx" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Form.Item name="notes" label="Ghi chú nội bộ">
                  <TextArea rows={3} placeholder="Điều khoản thanh toán, lưu ý giao hàng..." />
                </Form.Item>
              </>
            ),
          },
        ]}
      />
    </Form>
  );

  // === DETAIL MODAL CONTENT ===
  const detailModalContent = selectedSupplier && (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
        <Avatar
          size={72}
          src={selectedSupplier.logoUrl}
          icon={!selectedSupplier.logoUrl && <ShopOutlined />}
          className="bg-white shadow-lg"
        />
        <div className="flex-1">
          <Title level={4} className="mb-0">
            {selectedSupplier.supplierName}
          </Title>
          <Space className="mt-2">
            <Tag color="blue" icon={<IdcardOutlined />}>
              {selectedSupplier.supplierCode}
            </Tag>
            <Badge
              status={selectedSupplier.isActive ? 'success' : 'default'}
              text={selectedSupplier.isActive ? 'Đang hoạt động' : 'Ngừng giao dịch'}
            />
          </Space>
        </div>
      </div>

      {/* Basic Info */}
      <div>
        <Divider orientation="horizontal">
          <Space>
            <InfoCircleOutlined className="text-blue-500" /> Thông tin cơ bản
          </Space>
        </Divider>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Mã số thuế">{selectedSupplier.taxCode || '---'}</Descriptions.Item>
          <Descriptions.Item label="Thành phố">
            {selectedSupplier.city ? (
              <Tag icon={<EnvironmentOutlined />} color="cyan">
                {selectedSupplier.city}
              </Tag>
            ) : (
              '---'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ" span={2}>
            {selectedSupplier.address || '---'}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Contact Info */}
      <div>
        <Divider orientation="horizontal">
          <Space>
            <UserOutlined className="text-green-500" /> Liên hệ
          </Space>
        </Divider>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Người liên hệ">{selectedSupplier.contactPerson || '---'}</Descriptions.Item>
          <Descriptions.Item label="Điện thoại">
            {selectedSupplier.phoneNumber ? (
              <a href={`tel:${selectedSupplier.phoneNumber}`} className="text-blue-600">
                <PhoneOutlined /> {selectedSupplier.phoneNumber}
              </a>
            ) : (
              '---'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={2}>
            {selectedSupplier.email ? (
              <a href={`mailto:${selectedSupplier.email}`} className="text-blue-600">
                <MailOutlined /> {selectedSupplier.email}
              </a>
            ) : (
              '---'
            )}
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Bank Info */}
      <div>
        <Divider orientation="horizontal">
          <Space>
            <BankOutlined className="text-purple-500" /> Thông tin ngân hàng
          </Space>
        </Divider>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="Ngân hàng">{selectedSupplier.bankName || '---'}</Descriptions.Item>
          <Descriptions.Item label="Số tài khoản">
            <span className="font-mono">{selectedSupplier.bankAccount || '---'}</span>
          </Descriptions.Item>
        </Descriptions>
      </div>

      {/* Notes */}
      {selectedSupplier.notes && (
        <div>
          <Divider orientation="horizontal">
            <Space>
              <FileTextOutlined className="text-orange-500" /> Ghi chú
            </Space>
          </Divider>
          <div className="bg-gray-50 p-4 rounded-lg text-gray-700 border border-gray-200">
            {selectedSupplier.notes}
          </div>
        </div>
      )}

      {/* Statistics */}
      <Row gutter={16}>
        <Col span={12}>
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <Statistic
              title={<span className="text-blue-700 font-semibold">Sản phẩm cung cấp</span>}
              value={selectedSupplier.productCount}
              valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <Statistic
              title={<span className="text-green-700 font-semibold">Đơn đặt hàng</span>}
              value={selectedSupplier.purchaseOrderCount}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <div className="w-full p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 m-0 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBuilding className="text-blue-600 text-2xl" />
              </div>
              Nhà cung cấp
            </h1>
            <p className="text-gray-500 mt-2 ml-1">Quản lý danh sách đối tác nhập hàng</p>
          </div>
          <Space size="middle">
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              Làm mới
            </Button>
            <Button icon={<FileExcelOutlined />} className="border-green-500 text-green-600 hover:bg-green-50">
              Xuất Excel
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              className="bg-blue-600 hover:bg-blue-700 shadow-md"
            >
              Thêm NCC mới
            </Button>
          </Space>
        </div>
      </div>

      {/* FILTERS */}
      <Card className="mb-6 shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Tìm theo Tên, Mã, SĐT hoặc Email..."
              allowClear
              value={searchText}
              onChange={(e) => handleSearch(e.target.value)}
              className="rounded-lg"
            />
          </Col>
          <Col xs={12} lg={8}>
            <Select
              placeholder="Trạng thái"
              className="w-full"
              onChange={handleStatusFilterChange}
              defaultValue="all"
              options={[
                { value: 'all', label: 'Tất cả' },
                { value: 'active', label: 'Đang hoạt động' },
                { value: 'inactive', label: 'Ngừng GD' },
              ]}
            />
          </Col>
        </Row>
        {searchText && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between border border-blue-100">
            <Text className="text-sm">
              Đang tìm kiếm: <strong>"{searchText}"</strong>
            </Text>
            <Button type="link" size="small" onClick={() => setSearchText('')}>
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="supplierID"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `Hiển thị ${range[0]}-${range[1]} của ${total} nhà cung cấp`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: (
              <Empty
                description="Chưa có nhà cung cấp nào"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                imageStyle={{ height: 60 }}
              />
            ),
          }}
          className="custom-table"
        />
      </Card>

      {/* CREATE/EDIT MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg">
            {editingRecord ? (
              <>
                <EditOutlined className="text-orange-500" /> Cập nhật Nhà cung cấp
              </>
            ) : (
              <>
                <PlusOutlined className="text-blue-500" /> Thêm Nhà cung cấp mới
              </>
            )}
          </div>
        }
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        okText="Lưu thông tin"
        cancelText="Hủy"
        confirmLoading={submitting}
        maskClosable={false}
        destroyOnClose
      >
        {modalContent}
      </Modal>

      {/* DETAIL MODAL */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-lg">
            <EyeOutlined className="text-blue-500" /> Chi tiết Nhà cung cấp
          </div>
        }
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false);
          setSelectedSupplier(null);
        }}
        width={800}
        footer={
          <Space>
            <Button onClick={() => setDetailModalOpen(false)}>Đóng</Button>
            {selectedSupplier && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => {
                  setDetailModalOpen(false);
                  handleEdit(selectedSupplier);
                }}
              >
                Chỉnh sửa
              </Button>
            )}
          </Space>
        }
        destroyOnClose
      >
        {loadingDetail ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : (
          detailModalContent
        )}
      </Modal>
    </div>
  );
};

export default SupplierList;