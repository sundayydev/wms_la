// src/pages/Public/OrderLookup.tsx
import React, { useState } from 'react';
import {
    Typography, Card, Input, Button, Form, Row, Col, Result, Descriptions,
    Tag, Steps, Space, Divider, Spin, Table, Avatar, Timeline,
} from 'antd';
import {
    SearchOutlined, FileSearchOutlined, CheckCircleFilled, ClockCircleFilled,
    CarOutlined, InboxOutlined, ShoppingOutlined, ExclamationCircleFilled,
    ReloadOutlined, EnvironmentOutlined, PhoneOutlined, UserOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

interface OrderItem {
    key: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
    serialNumber?: string;
}

interface OrderInfo {
    orderCode: string;
    status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
    createdDate: string;
    estimatedDelivery: string;
    customerName: string;
    phone: string;
    address: string;
    paymentMethod: string;
    paymentStatus: 'paid' | 'pending';
    items: OrderItem[];
    totalAmount: number;
    shippingFee: number;
    trackingHistory: { date: string; status: string; description: string }[];
}

const mockOrderData: Record<string, OrderInfo> = {
    'DH20241229001': {
        orderCode: 'DH20241229001',
        status: 'shipping',
        createdDate: '2024-12-29T10:30:00',
        estimatedDelivery: '2025-01-02',
        customerName: 'Nguyễn Văn A',
        phone: '0901234567',
        address: '123 Đường ABC, Phường XYZ, Quận 1, TP. Hồ Chí Minh',
        paymentMethod: 'Chuyển khoản ngân hàng',
        paymentStatus: 'paid',
        items: [
            { key: '1', name: 'iPhone 15 Pro Max 256GB', image: '📱', quantity: 1, price: 34990000, serialNumber: 'SN123456789' },
            { key: '2', name: 'Ốp lưng iPhone 15 Pro Max', image: '🛡️', quantity: 2, price: 350000 },
        ],
        totalAmount: 35690000,
        shippingFee: 0,
        trackingHistory: [
            { date: '2024-12-29T10:30:00', status: 'pending', description: 'Đơn hàng đã được tạo' },
            { date: '2024-12-29T11:00:00', status: 'confirmed', description: 'Đơn hàng đã được xác nhận' },
            { date: '2024-12-29T15:00:00', status: 'shipping', description: 'Đơn hàng đang được giao' },
        ],
    },
};

const orderStatusConfig = {
    pending: { color: '#8c8c8c', label: 'Chờ xác nhận', step: 0, icon: <ClockCircleFilled /> },
    confirmed: { color: '#1890ff', label: 'Đã xác nhận', step: 1, icon: <CheckCircleFilled /> },
    shipping: { color: '#faad14', label: 'Đang giao hàng', step: 2, icon: <CarOutlined /> },
    delivered: { color: '#52c41a', label: 'Đã giao hàng', step: 3, icon: <InboxOutlined /> },
    cancelled: { color: '#ff4d4f', label: 'Đã hủy', step: -1, icon: <ExclamationCircleFilled /> },
};

const OrderLookup: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<OrderInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (values: { orderCode: string }) => {
        setLoading(true);
        setError(null);
        setSearchResult(null);
        setSearched(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const result = mockOrderData[values.orderCode.toUpperCase()];
        if (result) setSearchResult(result);
        else setError('Không tìm thấy đơn hàng.');
        setLoading(false);
    };

    const handleReset = () => {
        form.resetFields();
        setSearchResult(null);
        setError(null);
        setSearched(false);
    };

    const statusConfig = searchResult ? orderStatusConfig[searchResult.status] : null;

    const columns = [
        {
            title: 'Sản phẩm', dataIndex: 'name', key: 'name',
            render: (text: string, record: OrderItem) => (
                <Space>
                    <Avatar shape="square" size={48} style={{ background: '#f0f0f0', fontSize: 24 }}>{record.image}</Avatar>
                    <div>
                        <Text strong>{text}</Text>
                        {record.serialNumber && <><br /><Text type="secondary" style={{ fontSize: 12 }}>S/N: {record.serialNumber}</Text></>}
                    </div>
                </Space>
            ),
        },
        { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60, align: 'center' as const },
        { title: 'Đơn giá', dataIndex: 'price', key: 'price', width: 130, align: 'right' as const, render: (p: number) => <Text strong style={{ color: '#1890ff' }}>{p.toLocaleString('vi-VN')}đ</Text> },
    ];

    return (
        <div style={{ background: '#f5f7fa', minHeight: 'calc(100vh - 72px)' }}>
            <section style={{ background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', padding: '60px 24px', textAlign: 'center' }}>
                <FileSearchOutlined style={{ fontSize: 56, color: '#fff', marginBottom: 16 }} />
                <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>Tra cứu đơn hàng</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>Nhập mã đơn hàng để theo dõi trạng thái</Paragraph>
            </section>

            <section style={{ padding: '40px 24px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <Card style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginTop: -60 }}>
                        <Form form={form} onFinish={handleSearch} layout="vertical">
                            <Form.Item name="orderCode" label={<Text strong>Mã đơn hàng</Text>} rules={[{ required: true, message: 'Vui lòng nhập mã đơn hàng' }]}>
                                <Input size="large" placeholder="Ví dụ: DH20241229001" prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} style={{ borderRadius: 10 }} />
                            </Form.Item>
                            <Row gutter={12}>
                                <Col flex="auto"><Button type="primary" htmlType="submit" size="large" loading={loading} icon={<SearchOutlined />} style={{ width: '100%', height: 48, borderRadius: 10, fontWeight: 600 }}>Tra cứu</Button></Col>
                                {searched && <Col><Button size="large" icon={<ReloadOutlined />} onClick={handleReset} style={{ height: 48, borderRadius: 10 }}>Làm mới</Button></Col>}
                            </Row>
                        </Form>
                    </Card>
                </div>
            </section>

            <section style={{ padding: '0 24px 60px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    {loading && <Card style={{ borderRadius: 16, textAlign: 'center', padding: 40 }}><Spin size="large" /><Paragraph style={{ marginTop: 16, color: '#666' }}>Đang tra cứu...</Paragraph></Card>}
                    {error && !loading && <Card style={{ borderRadius: 16 }}><Result status="warning" title="Không tìm thấy" subTitle={error} extra={<Button type="primary" onClick={handleReset}>Thử lại</Button>} /></Card>}
                    {searchResult && !loading && statusConfig && (
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Card style={{ borderRadius: 16 }}>
                                <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
                                    <Col flex="auto"><Text type="secondary">Mã đơn hàng</Text><Title level={4} style={{ margin: 0 }}>#{searchResult.orderCode}</Title></Col>
                                    <Col><Tag icon={statusConfig.icon} color={statusConfig.color} style={{ fontSize: 14, padding: '6px 12px' }}>{statusConfig.label}</Tag></Col>
                                </Row>
                                {searchResult.status !== 'cancelled' && <Steps current={statusConfig.step} size="small" items={[{ title: 'Chờ XN', icon: <ShoppingOutlined /> }, { title: 'Đã XN', icon: <CheckCircleFilled /> }, { title: 'Đang giao', icon: <CarOutlined /> }, { title: 'Đã giao', icon: <InboxOutlined /> }]} />}
                            </Card>
                            <Card title={<Space><EnvironmentOutlined /><span>Thông tin giao hàng</span></Space>} style={{ borderRadius: 16 }}>
                                <Descriptions column={{ xs: 1, sm: 2 }}>
                                    <Descriptions.Item label="Người nhận"><Space><UserOutlined />{searchResult.customerName}</Space></Descriptions.Item>
                                    <Descriptions.Item label="SĐT"><Space><PhoneOutlined />{searchResult.phone}</Space></Descriptions.Item>
                                    <Descriptions.Item label="Địa chỉ" span={2}>{searchResult.address}</Descriptions.Item>
                                </Descriptions>
                            </Card>
                            <Card title={<Space><ShoppingOutlined /><span>Sản phẩm</span></Space>} style={{ borderRadius: 16 }}>
                                <Table columns={columns} dataSource={searchResult.items} pagination={false} size="small" />
                                <Divider />
                                <Row justify="end"><Col xs={24} sm={12}><Row justify="space-between"><Text strong style={{ fontSize: 16 }}>Tổng cộng:</Text><Text strong style={{ fontSize: 18, color: '#f5222d' }}>{searchResult.totalAmount.toLocaleString('vi-VN')}đ</Text></Row></Col></Row>
                            </Card>
                            <Card title={<Space><ClockCircleFilled /><span>Lịch sử</span></Space>} style={{ borderRadius: 16 }}>
                                <Timeline items={searchResult.trackingHistory.map((item, i) => ({ color: i === searchResult.trackingHistory.length - 1 ? 'green' : 'gray', children: <div><Text strong>{item.description}</Text><br /><Text type="secondary" style={{ fontSize: 12 }}>{new Date(item.date).toLocaleString('vi-VN')}</Text></div> })).reverse()} />
                            </Card>
                        </Space>
                    )}
                </div>
            </section>
        </div>
    );
};

export default OrderLookup;
