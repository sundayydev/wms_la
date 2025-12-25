import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Tabs,
  Row,
  Col,
  InputNumber,
  Select,
  Switch,
  Space,
  Upload,
  Table,
  Typography
} from 'antd';
import {
  SaveOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  UploadOutlined,
  FilePdfOutlined,
  LinkOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

// Mock Data dựa trên link bạn gửi (Mobydata M63)
const initialValues = {
  SKU: 'MOBY-M63-V2',
  ComponentName: 'Máy kiểm kho PDA Mobydata M63 V2',
  Specifications: [
    { key: 'Hệ điều hành', value: 'Android 13' },
    { key: 'Vi xử lý (CPU)', value: 'Octa-core 2.0GHz' },
    { key: 'Bộ nhớ (RAM/ROM)', value: '4GB / 64GB' },
    { key: 'Màn hình', value: '5.99 inch HD+ (1440 x 720)' },
    { key: 'Pin', value: '5000mAh (Có thể tháo rời)' },
    { key: 'Đầu đọc mã vạch', value: '2D Imager (SE4710 / CM60)' },
    { key: 'Chuẩn chống bụi/nước', value: 'IP65' },
    { key: 'Kết nối', value: '4G, Wi-Fi, Bluetooth 5.0, NFC' },
  ],
  Documents: [
    { name: 'Mobydata M63 Datasheet.pdf', url: '#', type: 'Datasheet' },
    { name: 'User Guide v1.0.pdf', url: '#', type: 'Manual' },
  ],
  Competitors: ['Zebra TC21', 'Honeywell EDA50']
};

const ProductForm: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    // Convert Array Specs -> JSON Object trước khi gửi về BE
    const specObject = values.Specifications.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const payload = {
      ...values,
      Specifications: specObject, // Gửi xuống DB dạng JSONB
    };

    console.log('Dữ liệu gửi đi (Payload):', payload);
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <Title level={3}>Thêm mới / Cập nhật Sản phẩm</Title>
        <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
          Lưu sản phẩm
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onFinish={onFinish}
      >
        <Tabs
          defaultActiveKey="1"
          type="card"
          items={[
            // TAB 1: THÔNG TIN CHUNG
            {
              key: '1',
              label: 'Thông tin chung',
              children: (
                <Card bordered={false} className="shadow-sm">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item name="SKU" label="Mã sản phẩm (SKU)" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="Unit" label="Đơn vị tính">
                        <Select options={[{ value: 'Cái', label: 'Cái' }, { value: 'Bộ', label: 'Bộ' }]} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="ComponentName" label="Tên sản phẩm" rules={[{ required: true }]}>
                        <Input />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item name="BasePrice" label="Giá nhập (Base Price)">
                        <InputNumber
                          className="w-full"
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                          addonAfter="₫"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="SellPrice" label="Giá bán (Niêm yết)">
                        <InputNumber
                          className="w-full"
                          formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                          addonAfter="₫"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item name="IsSerialized" label="Quản lý Serial/IMEI" valuePropName="checked">
                        <Switch checkedChildren="Có" unCheckedChildren="Không" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              ),
            },

            // TAB 2: THÔNG SỐ KỸ THUẬT (DYNAMIC)
            {
              key: '2',
              label: 'Thông số kỹ thuật',
              children: (
                <Card
                  bordered={false}
                  className="shadow-sm"
                  title="Cấu hình chi tiết (Dùng để so sánh)"
                >
                  <Form.List name="Specifications">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, ...restField }) => (
                          <Row key={key} gutter={16} align="middle" className="mb-2">
                            <Col span={10}>
                              <Form.Item
                                {...restField}
                                name={[name, 'key']}
                                rules={[{ required: true, message: 'Nhập tên thông số' }]}
                                className="mb-0"
                              >
                                <Input placeholder="Tên thông số (VD: CPU, Ram)" />
                              </Form.Item>
                            </Col>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, 'value']}
                                rules={[{ required: true, message: 'Nhập giá trị' }]}
                                className="mb-0"
                              >
                                <Input placeholder="Giá trị (VD: 4GB)" />
                              </Form.Item>
                            </Col>
                            <Col span={2}>
                              <Button
                                type="text"
                                danger
                                icon={<MinusCircleOutlined />}
                                onClick={() => remove(name)}
                              />
                            </Col>
                          </Row>
                        ))}
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => add()}
                            block
                            icon={<PlusOutlined />}
                            className="mt-4"
                          >
                            Thêm thông số kỹ thuật
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>

                  <div className="mt-4 p-3 bg-blue-50 rounded text-blue-700 text-xs">
                    * Gợi ý: Nhập các thông số như OS, CPU, RAM, ROM, Camera, Pin để hệ thống tự động so sánh với sản phẩm khác.
                  </div>
                </Card>
              ),
            },

            // TAB 3: TÀI LIỆU & ĐỐI THỦ
            {
              key: '3',
              label: 'Tài liệu & Khác',
              children: (
                <Card bordered={false} className="shadow-sm">
                  <Title level={5}>1. Tài liệu đính kèm (Driver, Manual)</Title>
                  <Form.List name="Documents">
                    {(fields, { add, remove }) => (
                      <div className="mb-6">
                        {fields.map((field, index) => (
                          <div key={field.key} className="flex gap-2 mb-2 items-center border p-2 rounded bg-gray-50">
                            <FilePdfOutlined className="text-red-500 text-xl" />
                            <Form.Item
                              {...field}
                              name={[field.name, 'name']}
                              className="mb-0 flex-1"
                            >
                              <Input placeholder="Tên tài liệu" variant="borderless" />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[field.name, 'url']}
                              className="mb-0 w-1/3"
                            >
                              <Input prefix={<LinkOutlined />} placeholder="URL tải về" />
                            </Form.Item>
                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                          </div>
                        ))}
                        <Upload>
                          <Button icon={<UploadOutlined />}>Tải lên tài liệu mới</Button>
                        </Upload>
                      </div>
                    )}
                  </Form.List>

                  <Title level={5}>2. Sản phẩm đối thủ (Competitors)</Title>
                  <Form.Item name="Competitors">
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      placeholder="Nhập tên đối thủ rồi Enter (VD: Zebra TC21)"
                      tokenSeparators={[',']}
                    />
                  </Form.Item>
                </Card>
              ),
            },
          ]}
        />
      </Form>
    </div>
  );
};

export default ProductForm;