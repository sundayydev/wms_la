import React, { useState } from 'react';
import { Table, Card, Button, Input, Tag, Space, Modal, message, Badge, Tooltip } from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  BankOutlined, UserOutlined, TeamOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import CustomerFormDrawer from './CustomerFormDrawer';
import type { Customer } from '../../types/type.customer';

// --- MOCK DATA ---
const initialData: Customer[] = [
  {
    CustomerID: '1',
    CustomerCode: 'KH-0001',
    CustomerName: 'Nguyễn Văn An',
    Type: 'INDIVIDUAL',
    CustomerGroup: 'RETAIL',
    PhoneNumber: '0909111222',
    IsActive: true,
  },
  {
    CustomerID: '2',
    CustomerCode: 'KH-0002',
    CustomerName: 'Công Ty TNHH ABC Logistics',
    Type: 'COMPANY',
    CustomerGroup: 'WHOLESALE',
    PhoneNumber: '0283999888', // Hotline
    TaxCode: '0312345678',
    IsActive: true,
    Contacts: [
      { ContactName: 'Trần Thủ Kho', Position: 'Thủ kho', PhoneNumber: '0912333444', IsDefaultReceiver: true },
      { ContactName: 'Lê Kế Toán', Position: 'Kế toán', PhoneNumber: '0912555666', IsDefaultReceiver: false }
    ]
  }
];

const CustomerList: React.FC = () => {
  const [data, setData] = useState<Customer[]>(initialData);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchText, setSearchText] = useState('');

  // --- HANDLERS ---
  const handleCreate = () => {
    setEditingCustomer(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (record: Customer) => {
    setEditingCustomer(record);
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: string) => {
    setData(data.filter(item => item.CustomerID !== id));
    message.success('Đã xóa khách hàng');
  };

  const handleSubmitForm = (values: Customer) => {
    if (editingCustomer) {
      // Update
      const updatedData = data.map(item =>
        item.CustomerID === editingCustomer.CustomerID ? { ...item, ...values } : item
      );
      setData(updatedData);
      message.success('Cập nhật thành công');
    } else {
      // Create
      const newCustomer = {
        ...values,
        CustomerID: Date.now().toString(),
        CreatedAt: new Date().toISOString()
      };
      setData([newCustomer, ...data]);
      message.success('Thêm mới thành công');
    }
  };

  // --- COLUMNS ---
  const columns: ColumnsType<Customer> = [
    {
      title: 'Mã KH',
      dataIndex: 'CustomerCode',
      width: 100,
    },
    {
      title: 'Tên Khách Hàng / Công Ty',
      dataIndex: 'CustomerName',
      render: (_, record) => (
        <div>
          <div className="font-semibold text-base text-gray-800">{record.CustomerName}</div>
          <div className="flex gap-2 mt-1">
            {record.Type === 'COMPANY' ? (
              <Tag color="blue" icon={<BankOutlined />}>Doanh nghiệp</Tag>
            ) : (
              <Tag color="green" icon={<UserOutlined />}>Cá nhân</Tag>
            )}
            <Tag>{record.CustomerGroup}</Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Liên hệ chính',
      dataIndex: 'PhoneNumber',
      render: (text) => <span>{text}</span>
    },
    {
      title: 'Người nhận hàng (Cty)',
      key: 'receivers',
      render: (_, record) => {
        if (record.Type !== 'COMPANY' || !record.Contacts) return <span className="text-gray-400">---</span>;

        // Hiển thị người mặc định hoặc người đầu tiên
        const mainContact = record.Contacts.find(c => c.IsDefaultReceiver) || record.Contacts[0];
        const otherCount = record.Contacts.length - 1;

        if (!mainContact) return <span className="text-red-400">Chưa có liên hệ</span>;

        return (
          <Tooltip title={
            <div>
              {record.Contacts.map((c, i) => (
                <div key={i}>{c.ContactName} - {c.Position} ({c.PhoneNumber})</div>
              ))}
            </div>
          }>
            <div className="cursor-pointer">
              <div className="font-medium text-blue-700">{mainContact.ContactName}</div>
              <div className="text-xs text-gray-500">{mainContact.Position} - {mainContact.PhoneNumber}</div>
              {otherCount > 0 && <div className="text-xs italic text-gray-400">Và {otherCount} người khác...</div>}
            </div>
          </Tooltip>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'IsActive',
      align: 'center',
      width: 100,
      render: (active) => <Badge status={active ? 'success' : 'error'} text={active ? 'Active' : 'Stop'} />
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => {
            Modal.confirm({
              title: 'Xóa khách hàng?',
              content: `Bạn có chắc muốn xóa ${record.CustomerName}?`,
              onOk: () => handleDelete(record.CustomerID)
            })
          }} />
        </Space>
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Danh sách Khách hàng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
          Thêm Khách Hàng
        </Button>
      </div>

      <Card>
        <div className="mb-4 w-1/3">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm tên, SĐT, mã số thuế..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
        </div>
        <Table
          columns={columns}
          dataSource={data.filter(item =>
            item.CustomerName.toLowerCase().includes(searchText.toLowerCase()) ||
            item.PhoneNumber.includes(searchText) ||
            (item.TaxCode && item.TaxCode.includes(searchText))
          )}
          rowKey="CustomerID"
        />
      </Card>

      <CustomerFormDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleSubmitForm}
        initialValues={editingCustomer}
      />
    </div>
  );
};

export default CustomerList;