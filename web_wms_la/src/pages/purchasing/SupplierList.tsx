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
  Descriptions,
  Tabs
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
  InfoCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

// 1. Định nghĩa kiểu dữ liệu khớp với SQL
interface SupplierType {
  SupplierID: string;
  SupplierCode: string;
  SupplierName: string;
  ContactPerson: string;
  PhoneNumber: string;
  Email: string;
  Address: string;
  City: string;
  TaxCode: string;
  BankAccount: string;
  BankName: string;
  Notes: string;
  IsActive: boolean;
}

// 2. Dữ liệu giả lập
const initialData: SupplierType[] = [
  {
    SupplierID: 'sup-001',
    SupplierCode: 'NCC-SAMSUNG',
    SupplierName: 'Samsung Vina Electronics',
    ContactPerson: 'Nguyễn Văn A',
    PhoneNumber: '02839157600',
    Email: 'contact@samsung.vn',
    Address: 'Số 2, Hải Triều, Q.1',
    City: 'TP.HCM',
    TaxCode: '0300900xxx',
    BankAccount: '1900123456789',
    BankName: 'Techcombank',
    Notes: 'Nhà cung cấp màn hình, linh kiện chính hãng',
    IsActive: true,
  },
  {
    SupplierID: 'sup-002',
    SupplierCode: 'NCC-BASEUS',
    SupplierName: 'Phụ Kiện Baseus VN',
    ContactPerson: 'Trần Thị B',
    PhoneNumber: '0909123456',
    Email: 'sales@baseus.vn',
    Address: '123 Xã Đàn',
    City: 'Hà Nội',
    TaxCode: '0101200xxx',
    BankAccount: '0071000123456',
    BankName: 'Vietcombank',
    Notes: 'Cáp sạc, ốp lưng',
    IsActive: true,
  },
];

const SupplierList: React.FC = () => {
  const [data, setData] = useState<SupplierType[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SupplierType | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  // --- HÀM XỬ LÝ ---
  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({ IsActive: true, City: 'TP.HCM' });
    setIsModalOpen(true);
  };

  const handleEdit = (record: SupplierType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter((item) => item.SupplierID !== id));
    message.success('Đã xóa nhà cung cấp');
  };

  const onFinish = (values: any) => {
    if (editingRecord) {
      // Update logic
      const newData = data.map((item) =>
        item.SupplierID === editingRecord.SupplierID ? { ...item, ...values } : item
      );
      setData(newData);
      message.success('Cập nhật thành công!');
    } else {
      // Create logic
      const newItem = { ...values, SupplierID: `sup-${Date.now()}` };
      setData([...data, newItem]);
      message.success('Thêm mới thành công!');
    }
    setIsModalOpen(false);
  };

  // --- CẤU HÌNH CỘT BẢNG ---
  const columns: ColumnsType<SupplierType> = [
    {
      title: 'Nhà cung cấp',
      key: 'name',
      width: 280,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-bold text-blue-700 text-base">{record.SupplierName}</span>
          <Space size={4} className="text-xs text-gray-500 mt-1">
            <Tag className="m-0 bg-gray-100">{record.SupplierCode}</Tag>
            <span>MST: {record.TaxCode || '---'}</span>
          </Space>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-2 text-gray-700">
            <UserOutlined /> {record.ContactPerson}
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <PhoneOutlined /> <a href={`tel:${record.PhoneNumber}`}>{record.PhoneNumber}</a>
          </div>
          <div className="flex items-center gap-2 text-blue-500">
            <MailOutlined /> {record.Email}
          </div>
        </div>
      ),
    },
    {
      title: 'Ngân hàng',
      key: 'bank',
      responsive: ['lg'], // Ẩn trên mobile/tablet dọc
      render: (_, record) => (
        record.BankName ? (
          <div className="text-sm">
            <div className="font-medium text-gray-700">{record.BankName}</div>
            <div className="text-gray-500 text-xs font-mono">{record.BankAccount}</div>
          </div>
        ) : <span className="text-gray-400 italic">Chưa cập nhật</span>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'IsActive',
      width: 120,
      render: (active) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Hoạt động' : 'Ngừng GD'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Sửa">
            <Button type="text" icon={<EditOutlined className="text-blue-600" />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Popconfirm
            title="Xóa nhà cung cấp?"
            onConfirm={() => handleDelete(record.SupplierID)}
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // --- NỘI DUNG MODAL (FORM) ---
  const modalContent = (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: '1',
            label: 'Thông tin chung',
            children: (
              <>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item
                      name="SupplierCode"
                      label="Mã NCC"
                      rules={[{ required: true, message: 'Nhập mã' }]}
                    >
                      <Input placeholder="VD: NCC-001" />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item
                      name="SupplierName"
                      label="Tên Nhà cung cấp"
                      rules={[{ required: true, message: 'Nhập tên NCC' }]}
                    >
                      <Input placeholder="Công ty TNHH..." />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item name="TaxCode" label="Mã số thuế">
                      <Input placeholder="Nhập MST" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="IsActive" label="Trạng thái" valuePropName="checked">
                      <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngừng" />
                    </Form.Item>
                  </Col>
                </Row>

                <div className="bg-gray-50 p-4 rounded mb-4 border border-gray-100">
                  <span className="font-semibold text-gray-700 block mb-2"><GlobalOutlined /> Địa chỉ</span>
                  <Form.Item name="Address" className="mb-2">
                    <Input placeholder="Số nhà, tên đường..." />
                  </Form.Item>
                  <Form.Item name="City" className="mb-0">
                    <Input placeholder="Tỉnh / Thành phố" />
                  </Form.Item>
                </div>
              </>
            ),
          },
          {
            key: '2',
            label: 'Liên hệ & Tài chính',
            children: (
              <>
                <div className="mb-4">
                  <span className="font-semibold text-blue-600 block mb-2">Người liên hệ</span>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="ContactPerson" label="Họ tên">
                        <Input prefix={<UserOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="PhoneNumber" label="Số điện thoại">
                        <Input prefix={<PhoneOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="Email" label="Email" rules={[{ type: 'email' }]}>
                        <Input prefix={<MailOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <div className="mb-4">
                  <span className="font-semibold text-green-600 block mb-2">Tài khoản ngân hàng</span>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="BankName" label="Tên Ngân hàng">
                        <Input prefix={<BankOutlined />} placeholder="Vietcombank..." />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="BankAccount" label="Số tài khoản">
                        <Input placeholder="0123xxx" />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Form.Item name="Notes" label="Ghi chú nội bộ">
                  <TextArea rows={2} placeholder="Điều khoản thanh toán, lưu ý giao hàng..." />
                </Form.Item>
              </>
            ),
          },
        ]}
      />
    </Form>
  );

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0">Nhà cung cấp (Suppliers)</h1>
          <p className="text-gray-500">Quản lý danh sách đối tác nhập hàng</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="bg-blue-600"
          onClick={handleAdd}
        >
          Thêm NCC mới
        </Button>
      </div>

      {/* FILTER */}
      <Card className="mb-4 shadow-sm" bordered={false} bodyStyle={{ padding: '16px' }}>
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm theo Tên, Mã số thuế hoặc SĐT..."
          className="max-w-md"
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Card>

      {/* TABLE */}
      <Card className="shadow-sm" bordered={false} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={data.filter(item =>
            item.SupplierName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.PhoneNumber.includes(searchText) ||
            item.TaxCode?.includes(searchText)
          )}
          rowKey="SupplierID"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* MODAL */}
      <Modal
        title={editingRecord ? "Cập nhật Nhà cung cấp" : "Thêm Nhà cung cấp mới"}
        open={isModalOpen}
        onOk={() => form.submit()}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        okText="Lưu thông tin"
        cancelText="Hủy"
        maskClosable={false}
      >
        {modalContent}
      </Modal>
    </div>
  );
};

export default SupplierList;