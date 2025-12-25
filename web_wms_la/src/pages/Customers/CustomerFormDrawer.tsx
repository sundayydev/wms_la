import React, { useEffect, useState } from 'react';
import {
  Drawer, Form, Button, Row, Col, Input,
  Select, DatePicker, Radio, Switch, Divider, Space, message
} from 'antd';
import {
  UserOutlined, TeamOutlined, BankOutlined,
  SaveOutlined, CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ContactTable from './ContactTable';
import type { Customer } from '../../types/type.customer';

const { Option } = Select;
const { TextArea } = Input;

interface CustomerFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Customer) => void;
  initialValues?: Customer | null;
}

const CustomerFormDrawer: React.FC<CustomerFormDrawerProps> = ({
  open, onClose, onSubmit, initialValues
}) => {
  const [form] = Form.useForm();
  const [customerType, setCustomerType] = useState<'INDIVIDUAL' | 'COMPANY'>('INDIVIDUAL');

  useEffect(() => {
    if (open) {
      if (initialValues) {
        // Mode Edit
        form.setFieldsValue({
          ...initialValues,
          DateOfBirth: initialValues.DateOfBirth ? dayjs(initialValues.DateOfBirth) : null,
        });
        setCustomerType(initialValues.Type);
      } else {
        // Mode Create
        form.resetFields();
        form.setFieldsValue({
          Type: 'INDIVIDUAL',
          CustomerGroup: 'RETAIL',
          IsActive: true,
          CustomerCode: `KH-${Date.now().toString().slice(-4)}` // Mock auto-gen code
        });
        setCustomerType('INDIVIDUAL');
      }
    }
  }, [open, initialValues, form]);

  const handleTypeChange = (e: any) => {
    setCustomerType(e.target.value);
  };

  const onFinish = async (values: any) => {
    // Validate custom cho bảng Contacts nếu là Company
    if (values.Type === 'COMPANY') {
      if (!values.Contacts || values.Contacts.length === 0) {
        message.warning('Khách hàng công ty cần ít nhất 1 người liên hệ!');
        return;
      }
      // Check required fields trong sub-table
      const hasInvalidContact = values.Contacts.some((c: any) => !c.ContactName || !c.PhoneNumber);
      if (hasInvalidContact) {
        message.error('Vui lòng điền tên và SĐT cho người liên hệ');
        return;
      }
    }

    const payload: Customer = {
      ...values,
      CustomerID: initialValues?.CustomerID, // Keep ID if editing
      DateOfBirth: values.DateOfBirth ? values.DateOfBirth.format('YYYY-MM-DD') : undefined,
    };

    onSubmit(payload);
    onClose();
  };

  return (
    <Drawer
      title={initialValues ? `Cập nhật: ${initialValues.CustomerName}` : "Thêm khách hàng mới"}
      width={720}
      onClose={onClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}
      extra={
        <Space>
          <Button onClick={onClose} icon={<CloseOutlined />}>Hủy</Button>
          <Button onClick={() => form.submit()} type="primary" icon={<SaveOutlined />}>
            Lưu lại
          </Button>
        </Space>
      }
    >
      <Form layout="vertical" form={form} onFinish={onFinish}>
        {/* 1. LOẠI KHÁCH HÀNG */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
          <Form.Item name="Type" label="Đối tượng khách hàng" className="mb-0">
            <Radio.Group onChange={handleTypeChange} optionType="button" buttonStyle="solid">
              <Radio.Button value="INDIVIDUAL"><UserOutlined /> Cá nhân</Radio.Button>
              <Radio.Button value="COMPANY"><BankOutlined /> Doanh nghiệp / Công ty</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </div>

        {/* 2. THÔNG TIN CƠ BẢN */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="CustomerCode" label="Mã khách hàng" rules={[{ required: true }]}>
              <Input disabled placeholder="Tự động tạo" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="CustomerGroup" label="Nhóm khách hàng">
              <Select>
                <Option value="RETAIL">Khách lẻ</Option>
                <Option value="WHOLESALE">Khách sỉ</Option>
                <Option value="VIP">Khách VIP</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="CustomerName"
              label={customerType === 'COMPANY' ? "Tên Công Ty / Doanh Nghiệp" : "Họ và tên"}
              rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
            >
              <Input placeholder={customerType === 'COMPANY' ? "VD: Công ty TNHH ABC" : "VD: Nguyễn Văn A"} />
            </Form.Item>
          </Col>
        </Row>

        {/* 3. THÔNG TIN LIÊN LẠC CHÍNH (HOTLINE/CÁ NHÂN) */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="PhoneNumber"
              label={customerType === 'COMPANY' ? "Hotline công ty" : "Số điện thoại"}
              rules={[{ required: true, message: 'Nhập số điện thoại' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="Email" label="Email" rules={[{ type: 'email' }]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        {/* 4. ĐẶC THÙ THEO LOẠI */}
        {customerType === 'COMPANY' ? (
          // === FORM CÔNG TY ===
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="TaxCode" label="Mã số thuế" rules={[{ required: true, message: 'Nhập MST' }]}>
                  <Input placeholder="VD: 0312345678" />
                </Form.Item>
              </Col>
            </Row>

            <Divider>Danh sách nhân viên liên hệ</Divider>
            {/* Sử dụng component ContactTable */}
            <Form.Item name="Contacts">
              <ContactTable />
            </Form.Item>
          </>
        ) : (
          // === FORM CÁ NHÂN ===
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="DateOfBirth" label="Ngày sinh">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="Gender" label="Giới tính">
                <Select>
                  <Option value="MALE">Nam</Option>
                  <Option value="FEMALE">Nữ</Option>
                  <Option value="OTHER">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Divider />

        {/* 5. ĐỊA CHỈ & KHÁC */}
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="Address" label="Địa chỉ">
              <Input placeholder="Số nhà, tên đường..." />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="City" label="Tỉnh / Thành"><Input /></Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="District" label="Quận / Huyện"><Input /></Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="Ward" label="Phường / Xã"><Input /></Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="Notes" label="Ghi chú">
              <TextArea rows={3} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="IsActive" label="Trạng thái hoạt động" valuePropName="checked">
          <Switch checkedChildren="Hoạt động" unCheckedChildren="Ngưng" />
        </Form.Item>

      </Form>
    </Drawer>
  );
};

export default CustomerFormDrawer;