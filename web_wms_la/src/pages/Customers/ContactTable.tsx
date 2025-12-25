import React, { useContext, useEffect, useRef, useState } from 'react';
import { Table, Button, Input, Form, Switch, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, StarOutlined, StarFilled } from '@ant-design/icons';
import type { CustomerContact } from '../../types/type.customer';

interface ContactTableProps {
  value?: CustomerContact[];
  onChange?: (value: CustomerContact[]) => void;
}

const ContactTable: React.FC<ContactTableProps> = ({ value = [], onChange }) => {
  const [dataSource, setDataSource] = useState<CustomerContact[]>(value);

  // Sync khi prop value thay đổi (từ form cha)
  useEffect(() => {
    setDataSource(value);
  }, [value]);

  const triggerChange = (newData: CustomerContact[]) => {
    setDataSource(newData);
    onChange?.(newData);
  };

  const handleAdd = () => {
    const newContact: CustomerContact = {
      ContactName: '',
      Position: '',
      PhoneNumber: '',
      IsDefaultReceiver: dataSource.length === 0, // Người đầu tiên mặc định là chính
    };
    triggerChange([...dataSource, newContact]);
  };

  const handleDelete = (index: number) => {
    const newData = dataSource.filter((_, i) => i !== index);
    triggerChange(newData);
  };

  const handleChangeField = (index: number, field: keyof CustomerContact, val: any) => {
    const newData = [...dataSource];
    newData[index] = { ...newData[index], [field]: val };
    triggerChange(newData);
  };

  const handleSetDefault = (index: number) => {
    const newData = dataSource.map((item, i) => ({
      ...item,
      IsDefaultReceiver: i === index,
    }));
    triggerChange(newData);
  };

  const columns = [
    {
      title: 'Mặc định',
      dataIndex: 'IsDefaultReceiver',
      width: 80,
      align: 'center' as const,
      render: (val: boolean, _: any, index: number) => (
        <div onClick={() => handleSetDefault(index)} className="cursor-pointer text-lg">
          {val ? <StarFilled className="text-yellow-500" /> : <StarOutlined className="text-gray-300" />}
        </div>
      ),
    },
    {
      title: 'Tên nhân viên (*)',
      dataIndex: 'ContactName',
      render: (text: string, _: any, index: number) => (
        <Input
          value={text}
          placeholder="Nhập tên"
          onChange={(e) => handleChangeField(index, 'ContactName', e.target.value)}
          status={!text ? 'error' : ''}
        />
      ),
    },
    {
      title: 'Chức vụ',
      dataIndex: 'Position',
      width: 150,
      render: (text: string, _: any, index: number) => (
        <Input
          value={text}
          placeholder="VD: Kế toán"
          onChange={(e) => handleChangeField(index, 'Position', e.target.value)}
        />
      ),
    },
    {
      title: 'SĐT (*)',
      dataIndex: 'PhoneNumber',
      width: 150,
      render: (text: string, _: any, index: number) => (
        <Input
          value={text}
          placeholder="09..."
          onChange={(e) => handleChangeField(index, 'PhoneNumber', e.target.value)}
          status={!text ? 'error' : ''}
        />
      ),
    },
    {
      title: 'Hành động',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => (
        <Popconfirm title="Xóa dòng này?" onConfirm={() => handleDelete(index)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-gray-700">Danh sách người nhận hàng / Liên hệ</span>
        <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={handleAdd}>Thêm người</Button>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey={(record, index) => index || 'new'}
        pagination={false}
        size="small"
        locale={{ emptyText: 'Chưa có người liên hệ nào' }}
      />
    </div>
  );
};

export default ContactTable;