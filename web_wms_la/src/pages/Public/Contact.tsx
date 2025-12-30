// src/pages/Public/Contact.tsx
import React, { useState } from 'react';
import { Typography, Card, Input, Button, Form, Row, Col, Space, message, Divider } from 'antd';
import {
    PhoneOutlined, MailOutlined, EnvironmentOutlined, ClockCircleOutlined,
    SendOutlined, FacebookOutlined, InstagramOutlined, YoutubeOutlined,
    CustomerServiceOutlined, MessageOutlined, UserOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const contactInfo = [
    { icon: <PhoneOutlined style={{ fontSize: 24, color: '#1890ff' }} />, title: 'Hotline', content: '1900 1234 56', subContent: 'Miễn phí cuộc gọi' },
    { icon: <MailOutlined style={{ fontSize: 24, color: '#52c41a' }} />, title: 'Email', content: 'support@wmsla.vn', subContent: 'Phản hồi trong 24h' },
    { icon: <EnvironmentOutlined style={{ fontSize: 24, color: '#fa8c16' }} />, title: 'Địa chỉ', content: '123 Đường ABC, Quận 1', subContent: 'TP. Hồ Chí Minh' },
    { icon: <ClockCircleOutlined style={{ fontSize: 24, color: '#722ed1' }} />, title: 'Giờ làm việc', content: '8:00 - 21:00', subContent: 'Thứ 2 - Chủ nhật' },
];

const Contact: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        console.log('Form values:', values);
        message.success('Gửi thông tin thành công! Chúng tôi sẽ liên hệ lại sớm nhất.');
        form.resetFields();
        setLoading(false);
    };

    return (
        <div style={{ background: '#f5f7fa', minHeight: 'calc(100vh - 72px)' }}>
            {/* Hero Section */}
            <section style={{ background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)', padding: '60px 24px', textAlign: 'center' }}>
                <CustomerServiceOutlined style={{ fontSize: 56, color: '#fff', marginBottom: 16 }} />
                <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>Liên hệ với chúng tôi</Title>
                <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16 }}>Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn 24/7</Paragraph>
            </section>

            {/* Contact Info Cards */}
            <section style={{ padding: '40px 24px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <Row gutter={[16, 16]} style={{ marginTop: -80 }}>
                        {contactInfo.map((item, index) => (
                            <Col xs={12} sm={12} md={6} key={index}>
                                <Card style={{ borderRadius: 16, textAlign: 'center', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} hoverable>
                                    <div style={{ width: 56, height: 56, borderRadius: 16, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                                        {item.icon}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{item.title}</Text>
                                    <Title level={5} style={{ margin: '4px 0' }}>{item.content}</Title>
                                    <Text type="secondary" style={{ fontSize: 12 }}>{item.subContent}</Text>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            </section>

            {/* Contact Form & Map */}
            <section style={{ padding: '0 24px 60px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <Row gutter={[32, 32]}>
                        {/* Contact Form */}
                        <Col xs={24} lg={14}>
                            <Card title={<Space><MessageOutlined /><span>Gửi tin nhắn cho chúng tôi</span></Space>} style={{ borderRadius: 16, height: '100%' }}>
                                <Form form={form} onFinish={handleSubmit} layout="vertical">
                                    <Row gutter={16}>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="name" label="Họ tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                                <Input size="large" prefix={<UserOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập họ tên" style={{ borderRadius: 8 }} />
                                            </Form.Item>
                                        </Col>
                                        <Col xs={24} sm={12}>
                                            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT' }]}>
                                                <Input size="large" prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập số điện thoại" style={{ borderRadius: 8 }} />
                                            </Form.Item>
                                        </Col>
                                    </Row>
                                    <Form.Item name="email" label="Email">
                                        <Input size="large" prefix={<MailOutlined style={{ color: '#bfbfbf' }} />} placeholder="Nhập email (không bắt buộc)" style={{ borderRadius: 8 }} />
                                    </Form.Item>
                                    <Form.Item name="subject" label="Chủ đề" rules={[{ required: true, message: 'Vui lòng nhập chủ đề' }]}>
                                        <Input size="large" placeholder="Nhập chủ đề" style={{ borderRadius: 8 }} />
                                    </Form.Item>
                                    <Form.Item name="message" label="Nội dung" rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}>
                                        <TextArea rows={4} placeholder="Nhập nội dung tin nhắn..." style={{ borderRadius: 8 }} />
                                    </Form.Item>
                                    <Button type="primary" htmlType="submit" size="large" loading={loading} icon={<SendOutlined />} style={{ width: '100%', height: 48, borderRadius: 10, fontWeight: 600, background: '#722ed1', borderColor: '#722ed1' }}>
                                        Gửi tin nhắn
                                    </Button>
                                </Form>
                            </Card>
                        </Col>

                        {/* Info & Social */}
                        <Col xs={24} lg={10}>
                            <Card style={{ borderRadius: 16, marginBottom: 24 }}>
                                <Title level={5}>Kết nối với chúng tôi</Title>
                                <Paragraph type="secondary">Theo dõi các kênh mạng xã hội để cập nhật thông tin mới nhất về sản phẩm và khuyến mãi.</Paragraph>
                                <Space size="middle">
                                    <Button type="primary" shape="circle" icon={<FacebookOutlined />} size="large" style={{ background: '#1877f2', borderColor: '#1877f2' }} />
                                    <Button type="primary" shape="circle" icon={<InstagramOutlined />} size="large" style={{ background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', border: 'none' }} />
                                    <Button type="primary" shape="circle" icon={<YoutubeOutlined />} size="large" style={{ background: '#ff0000', borderColor: '#ff0000' }} />
                                </Space>
                            </Card>

                            <Card style={{ borderRadius: 16, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
                                <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>Cần hỗ trợ ngay?</Title>
                                <Paragraph style={{ color: 'rgba(255,255,255,0.85)' }}>Gọi ngay hotline để được tư vấn miễn phí 24/7.</Paragraph>
                                <Button size="large" icon={<PhoneOutlined />} style={{ background: '#fff', color: '#667eea', border: 'none', fontWeight: 600, height: 48, width: '100%', borderRadius: 10 }}>
                                    1900 1234 56
                                </Button>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </section>
        </div>
    );
};

export default Contact;
