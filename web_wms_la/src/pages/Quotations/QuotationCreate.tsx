// src/pages/Admin/Quotations/CreateQuotation.tsx
import React, { useState, useEffect } from 'react';
import {
  Form, Input, Select, DatePicker, Button, Card, Row, Col,
  InputNumber, Table, Typography, Divider, Space, message
} from 'antd';
import {
  SaveOutlined, SendOutlined, PlusOutlined, DeleteOutlined,
  CalculatorOutlined, FileSearchOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const QuotationCreate: React.FC = () => {
  const [form] = Form.useForm();
  const [quoteType, setQuoteType] = useState<'REPAIR' | 'SALES'>('REPAIR');
  const [loading, setLoading] = useState(false);

  // State tính toán tổng tiền (để hiển thị realtime)
  const [summary, setSummary] = useState({
    subTotal: 0,
    discountAmt: 0,
    taxAmt: 0,
    total: 0
  });

  // --- MOCK DATA ---
  const customers = [
    { id: 'CUST-001', name: 'Công ty Logistics ABC', contact: 'Nguyễn Văn A', email: 'a.nguyen@abc.com', phone: '0909123456' },
    { id: 'CUST-002', name: 'Kho Vận Miền Nam', contact: 'Trần Thị B', email: 'b.tran@kho.vn', phone: '0909888999' },
  ];

  const repairTickets = [
    { id: 'REP-2024-001', code: 'RMA-2412-001', device: 'Zebra TC51', issue: 'Hỏng màn hình' },
    { id: 'REP-2024-002', code: 'RMA-2412-005', device: 'Honeywell EDA51', issue: 'Lỗi Mainboard' },
  ];

  // --- LOGIC TÍNH TOÁN ---
  const handleValuesChange = (_: any, allValues: any) => {
    // 1. Check đổi loại báo giá
    if (allValues.quotationType && allValues.quotationType !== quoteType) {
      setQuoteType(allValues.quotationType);
    }

    // 2. Auto-fill thông tin khách hàng
    if (allValues.customerId) {
      const cust = customers.find(c => c.id === allValues.customerId);
      if (cust) {
        // Chỉ set nếu các trường contact đang trống (tránh ghi đè khi user đã sửa)
        if (!form.getFieldValue('contactPersonName')) {
          form.setFieldsValue({
            contactPersonName: cust.contact,
            contactEmail: cust.email,
            contactPhone: cust.phone
          });
        }
      }
    }

    // 3. Tính toán tiền
    const items = allValues.items || [];
    const subTotal = items.reduce((sum: number, item: any) => {
      return sum + (item?.quantity || 0) * (item?.price || 0);
    }, 0);

    const discountPercent = allValues.discountPercent || 0;
    const taxPercent = allValues.taxPercent || 10;

    const discountAmt = (subTotal * discountPercent) / 100;
    const afterDiscount = subTotal - discountAmt;
    const taxAmt = (afterDiscount * taxPercent) / 100;
    const total = afterDiscount + taxAmt;

    setSummary({ subTotal, discountAmt, taxAmt, total });
  };

  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Form Values:', { ...values, ...summary });

    // Giả lập API call
    setTimeout(() => {
      message.success('Đã lưu báo giá nháp thành công!');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header Page */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} style={{ margin: 0 }}>Tạo Báo Giá Mới</Title>
          <Text type="secondary">LeadAndAim Warranty Center</Text>
        </div>
        <Space>
          <Button size="large">Hủy bỏ</Button>
          <Button type="primary" size="large" icon={<SaveOutlined />} onClick={() => form.submit()} loading={loading}>
            Lưu Nháp
          </Button>
          <Button type="primary" size="large" className="bg-green-600 hover:bg-green-500" icon={<SendOutlined />}>
            Lưu & Gửi Mail
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onValuesChange={handleValuesChange}
        initialValues={{
          quotationType: 'REPAIR',
          quotationCode: 'QT-2024-XXXX (Auto)',
          validUntil: dayjs().add(15, 'days'), // Mặc định hiệu lực 15 ngày
          taxPercent: 10,
          discountPercent: 0,
          currency: 'VND',
          items: [{}] // Dòng trống đầu tiên
        }}
      >
        <Row gutter={24}>
          {/* CỘT TRÁI: THÔNG TIN CHÍNH */}
          <Col span={16}>
            {/* 1. THÔNG TIN KHÁCH HÀNG & LOẠI BÁO GIÁ */}
            <Card title="Thông tin chung" className="mb-6 shadow-sm">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="quotationCode" label="Mã báo giá">
                    <Input disabled className="bg-gray-50 text-gray-500 font-bold" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="quotationType" label="Loại báo giá" rules={[{ required: true }]}>
                    <Select>
                      <Option value="REPAIR">Sửa chữa / Bảo hành</Option>
                      <Option value="SALES">Thương mại / Bán hàng</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="validUntil" label="Hiệu lực đến" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="customerId" label="Khách hàng (Doanh nghiệp)" rules={[{ required: true, message: 'Vui lòng chọn khách' }]}>
                    <Select showSearch placeholder="Tìm theo tên cty, MST..." optionFilterProp="children">
                      {customers.map(c => (
                        <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                {/* Nếu là REPAIR thì hiện ô chọn Ticket */}
                {quoteType === 'REPAIR' && (
                  <Col span={12}>
                    <Form.Item name="repairId" label="Liên kết phiếu sửa chữa (RMA)" rules={[{ required: true, message: 'Cần chọn phiếu RMA' }]}>
                      <Select placeholder="Chọn mã phiếu...">
                        {repairTickets.map(r => (
                          <Select.Option key={r.id} value={r.id}>
                            {r.code} - {r.device} ({r.issue})
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                )}
              </Row>

              <Divider dashed />

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item name="contactPersonName" label="Người liên hệ">
                    <Input placeholder="Tên người nhận" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="contactEmail" label="Email nhận báo giá" rules={[{ type: 'email' }]}>
                    <Input placeholder="example@domain.com" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item name="contactPhone" label="SĐT liên hệ">
                    <Input placeholder="09xxxx" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="title" label="Tiêu đề báo giá" rules={[{ required: true }]}>
                <Input placeholder="VD: Báo giá thay màn hình Zebra TC51..." />
              </Form.Item>
            </Card>

            {/* 2. CHI TIẾT HÀNG HÓA / DỊCH VỤ */}
            <Card title="Chi tiết Hàng hóa / Dịch vụ" className="mb-6 shadow-sm" bodyStyle={{ padding: 0 }}>
              {/* Sử dụng Form.List để quản lý mảng Items */}
              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <>
                    <Table
                      dataSource={fields}
                      pagination={false}
                      rowKey="key"
                      columns={[
                        {
                          title: 'Mô tả / Tên linh kiện',
                          dataIndex: 'name',
                          key: 'name',
                          width: '40%',
                          render: (_, field) => (
                            <Form.Item {...field} name={[field.name, 'description']} noStyle rules={[{ required: true, message: 'Nhập tên hàng' }]}>
                              <Input placeholder="VD: Mainboard Zebra TC51..." />
                            </Form.Item>
                          )
                        },
                        {
                          title: 'ĐVT',
                          dataIndex: 'unit',
                          key: 'unit',
                          width: '10%',
                          render: (_, field) => (
                            <Form.Item {...field} name={[field.name, 'unit']} noStyle>
                              <Input placeholder="Cái" style={{ textAlign: 'center' }} />
                            </Form.Item>
                          )
                        },
                        {
                          title: 'SL',
                          dataIndex: 'quantity',
                          key: 'quantity',
                          width: '10%',
                          render: (_, field) => (
                            <Form.Item {...field} name={[field.name, 'quantity']} noStyle initialValue={1}>
                              <InputNumber min={1} style={{ width: '100%' }} />
                            </Form.Item>
                          )
                        },
                        {
                          title: 'Đơn giá (VND)',
                          dataIndex: 'price',
                          key: 'price',
                          width: '20%',
                          render: (_, field) => (
                            <Form.Item {...field} name={[field.name, 'price']} noStyle initialValue={0}>
                              <InputNumber
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                style={{ width: '100%' }}
                              />
                            </Form.Item>
                          )
                        },
                        {
                          title: 'Thành tiền',
                          key: 'total',
                          width: '15%',
                          align: 'right',
                          render: (_, field) => {
                            // Lấy giá trị hiện tại của dòng này để tính
                            const rowValues = form.getFieldValue(['items', field.name]) || {};
                            const total = (rowValues.quantity || 0) * (rowValues.price || 0);
                            return <Text strong>{total.toLocaleString()}</Text>
                          }
                        },
                        {
                          title: '',
                          key: 'action',
                          width: '5%',
                          render: (_, field) => (
                            <DeleteOutlined
                              className="text-red-500 cursor-pointer hover:text-red-700"
                              onClick={() => remove(field.name)}
                            />
                          )
                        }
                      ]}
                    />
                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        Thêm dòng
                      </Button>
                    </div>
                  </>
                )}
              </Form.List>
            </Card>

            {/* 3. ĐIỀU KHOẢN */}
            <Card title="Điều khoản & Ghi chú" className="shadow-sm">
              <Form.Item name="paymentTerms" label="Điều khoản thanh toán">
                <TextArea rows={2} placeholder="VD: Thanh toán 100% trước khi giao hàng..." />
              </Form.Item>
              <Form.Item name="warrantyTerms" label="Chính sách bảo hành">
                <TextArea rows={2} placeholder="VD: Bảo hành 03 tháng đối với linh kiện thay thế..." />
              </Form.Item>
              <Form.Item name="deliveryTerms" label="Thời gian giao hàng / hoàn thành">
                <Input placeholder="VD: 3-5 ngày làm việc" />
              </Form.Item>
              <Form.Item name="description" label="Ghi chú nội bộ / Khác">
                <TextArea rows={2} />
              </Form.Item>
            </Card>
          </Col>

          {/* CỘT PHẢI: TỔNG KẾT TÀI CHÍNH */}
          <Col span={8}>
            <Card className="shadow-sm sticky top-6" title={<><CalculatorOutlined /> Tổng cộng</>}>
              <div className="space-y-4">
                <div className="flex justify-between text-base">
                  <Text type="secondary">Tổng tiền hàng (Subtotal):</Text>
                  <Text strong>{summary.subTotal.toLocaleString()}</Text>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div className="flex justify-between items-center">
                  <Text>Chiết khấu (%):</Text>
                  <Form.Item name="discountPercent" noStyle>
                    <InputNumber min={0} max={100} style={{ width: 80 }} />
                  </Form.Item>
                </div>
                <div className="flex justify-between items-center text-sm text-red-500">
                  <Text type="secondary">Tiền giảm:</Text>
                  <Text>- {summary.discountAmt.toLocaleString()}</Text>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div className="flex justify-between items-center">
                  <Text>Thuế VAT (%):</Text>
                  <Form.Item name="taxPercent" noStyle>
                    <InputNumber min={0} max={100} style={{ width: 80 }} />
                  </Form.Item>
                </div>
                <div className="flex justify-between items-center text-sm text-blue-500">
                  <Text type="secondary">Tiền thuế:</Text>
                  <Text>+ {summary.taxAmt.toLocaleString()}</Text>
                </div>

                <Divider style={{ margin: '12px 0' }} />

                <div className="flex justify-between items-center text-xl">
                  <Text strong>TỔNG CỘNG:</Text>
                  <Text strong type="success" className="text-green-600">
                    {summary.total.toLocaleString()}
                    <span className="text-sm ml-1">VND</span>
                  </Text>
                </div>
              </div>

              <div className="mt-8">
                <Button block size="large" icon={<FileSearchOutlined />}>
                  Xem trước PDF
                </Button>
              </div>
            </Card>

            {/* AUDIT INFO (Chỉ hiển thị khi edit, ở đây để placeholder) */}
            <div className="mt-6 px-2 text-gray-400 text-xs">
              <p>Created by: Admin User</p>
              <p>Date: {dayjs().format('DD/MM/YYYY HH:mm')}</p>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default QuotationCreate;