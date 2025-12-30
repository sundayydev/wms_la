// src/pages/Public/ErrorDiagnosis.tsx
import React, { useState } from 'react';
import { Typography, Card, Input, Button, Form, Row, Col, Space, Tag, Collapse, Select, Empty, Spin, Divider, Alert, Steps, List, Avatar } from 'antd';
import {
    BugOutlined, SearchOutlined, MobileOutlined, LaptopOutlined, TabletOutlined,
    ToolOutlined, CheckCircleFilled, WarningFilled, InfoCircleFilled, ReloadOutlined,
    QuestionCircleOutlined, ThunderboltOutlined, WifiOutlined, SoundOutlined,
    CameraOutlined, BarsOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

// Error categories
const errorCategories = [
    { key: 'all', label: 'Tất cả', icon: <BugOutlined /> },
    { key: 'screen', label: 'Màn hình', icon: <MobileOutlined /> },
    { key: 'battery', label: 'Pin', icon: <BarsOutlined /> },
    { key: 'network', label: 'Mạng/Wifi', icon: <WifiOutlined /> },
    { key: 'audio', label: 'Âm thanh', icon: <SoundOutlined /> },
    { key: 'camera', label: 'Camera', icon: <CameraOutlined /> },
    { key: 'performance', label: 'Hiệu năng', icon: <ThunderboltOutlined /> },
];

// Product types
const productTypes = [
    { value: 'iphone', label: 'iPhone' },
    { value: 'samsung', label: 'Samsung Galaxy' },
    { value: 'xiaomi', label: 'Xiaomi' },
    { value: 'oppo', label: 'OPPO' },
    { value: 'laptop', label: 'Laptop' },
    { value: 'tablet', label: 'Tablet' },
];

// Mock error data
const errorData = [
    {
        id: '1', productType: 'iphone', category: 'screen', severity: 'medium',
        title: 'Màn hình bị nhấp nháy hoặc chớp',
        symptoms: ['Màn hình chớp liên tục', 'Đường kẻ ngang/dọc xuất hiện', 'Màn hình tự tắt bật'],
        causes: ['Lỗi phần mềm iOS', 'Cáp màn hình bị lỏng', 'Màn hình hư hỏng'],
        solutions: [
            { step: 1, title: 'Khởi động lại thiết bị', description: 'Nhấn giữ nút nguồn và volume down, trượt để tắt nguồn, chờ 30s rồi bật lại.' },
            { step: 2, title: 'Cập nhật iOS', description: 'Vào Cài đặt > Cài đặt chung > Cập nhật phần mềm.' },
            { step: 3, title: 'Reset cài đặt', description: 'Vào Cài đặt > Cài đặt chung > Chuyển hoặc đặt lại > Đặt lại tất cả cài đặt.' },
            { step: 4, title: 'Liên hệ TTBH', description: 'Nếu vẫn còn lỗi, mang thiết bị đến trung tâm bảo hành để kiểm tra phần cứng.' },
        ],
    },
    {
        id: '2', productType: 'iphone', category: 'battery', severity: 'high',
        title: 'Pin tụt nhanh bất thường',
        symptoms: ['Pin giảm nhanh khi không dùng', 'Điện thoại nóng khi sạc', 'Hiển thị % pin không chính xác'],
        causes: ['Pin chai sau thời gian dài sử dụng', 'Ứng dụng ngầm tiêu thụ pin', 'Lỗi phần mềm'],
        solutions: [
            { step: 1, title: 'Kiểm tra tình trạng pin', description: 'Vào Cài đặt > Pin > Tình trạng pin. Nếu dưới 80%, cần thay pin.' },
            { step: 2, title: 'Tắt ứng dụng nền', description: 'Vào Cài đặt > Cài đặt chung > Làm mới ứng dụng nền > Tắt.' },
            { step: 3, title: 'Bật chế độ tiết kiệm pin', description: 'Vào Cài đặt > Pin > Bật Chế độ nguồn điện thấp.' },
            { step: 4, title: 'Thay pin', description: 'Nếu pin đã chai, hãy đến TTBH để thay pin chính hãng.' },
        ],
    },
    {
        id: '3', productType: 'samsung', category: 'network', severity: 'low',
        title: 'Không kết nối được Wifi',
        symptoms: ['Wifi không hiển thị', 'Kết nối nhưng không có internet', 'Wifi tự ngắt'],
        causes: ['Lỗi phần mềm', 'Sai mật khẩu', 'Router có vấn đề'],
        solutions: [
            { step: 1, title: 'Bật/tắt Wifi', description: 'Tắt Wifi, chờ 10 giây rồi bật lại.' },
            { step: 2, title: 'Quên mạng và kết nối lại', description: 'Nhấn giữ tên wifi > Quên > Nhập lại mật khẩu.' },
            { step: 3, title: 'Reset cài đặt mạng', description: 'Vào Cài đặt > Quản lý chung > Đặt lại > Đặt lại cài đặt mạng.' },
            { step: 4, title: 'Khởi động lại router', description: 'Tắt nguồn router, chờ 30 giây rồi bật lại.' },
        ],
    },
    {
        id: '4', productType: 'iphone', category: 'audio', severity: 'medium',
        title: 'Loa ngoài không có tiếng',
        symptoms: ['Không nghe được nhạc qua loa', 'Cuộc gọi không nghe tiếng', 'Âm thanh bị rè'],
        causes: ['Loa bị chặn bởi bụi bẩn', 'Lỗi phần mềm', 'Loa hỏng'],
        solutions: [
            { step: 1, title: 'Kiểm tra chế độ im lặng', description: 'Kiểm tra công tắc bên hông điện thoại, đảm bảo không bật chế độ im lặng.' },
            { step: 2, title: 'Vệ sinh loa', description: 'Dùng bàn chải mềm vệ sinh bụi bẩn ở lỗ loa.' },
            { step: 3, title: 'Tắt Bluetooth', description: 'Vào Cài đặt > Bluetooth > Tắt để đảm bảo không kết nối với thiết bị khác.' },
            { step: 4, title: 'Khởi động lại', description: 'Khởi động lại thiết bị và kiểm tra lại.' },
        ],
    },
];

const severityConfig = {
    low: { color: '#52c41a', label: 'Nhẹ', bgColor: '#f6ffed' },
    medium: { color: '#faad14', label: 'Trung bình', bgColor: '#fffbe6' },
    high: { color: '#ff4d4f', label: 'Nghiêm trọng', bgColor: '#fff2f0' },
};

const ErrorDiagnosis: React.FC = () => {
    const [productType, setProductType] = useState<string>('');
    const [category, setCategory] = useState<string>('all');
    const [searchText, setSearchText] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSearch = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 800);
    };

    const filteredErrors = errorData.filter((error) => {
        const matchProduct = !productType || error.productType === productType;
        const matchCategory = category === 'all' || error.category === category;
        const matchText = !searchText || error.title.toLowerCase().includes(searchText.toLowerCase()) || error.symptoms.some((s) => s.toLowerCase().includes(searchText.toLowerCase()));
        return matchProduct && matchCategory && matchText;
    });

    return (
        <div style={{ background: '#f5f7fa', minHeight: 'calc(100vh - 72px)' }}>
            {/* Hero */}
            <section style={{ background: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)', padding: '60px 24px', textAlign: 'center' }}>
                <BugOutlined style={{ fontSize: 56, color: '#fff', marginBottom: 16 }} />
                <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>Chuẩn đoán lỗi sản phẩm</Title>
                <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>Tra cứu các lỗi phổ biến và hướng dẫn khắc phục</Paragraph>
            </section>

            {/* Search */}
            <section style={{ padding: '40px 24px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <Card style={{ borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', marginTop: -60 }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={8}>
                                <Select size="large" placeholder="Chọn loại sản phẩm" style={{ width: '100%', borderRadius: 10 }} value={productType || undefined} onChange={setProductType} allowClear>
                                    {productTypes.map((p) => <Option key={p.value} value={p.value}>{p.label}</Option>)}
                                </Select>
                            </Col>
                            <Col xs={24} sm={10}>
                                <Input size="large" placeholder="Mô tả triệu chứng lỗi..." prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />} value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ borderRadius: 10 }} />
                            </Col>
                            <Col xs={24} sm={6}>
                                <Button type="primary" size="large" icon={<SearchOutlined />} onClick={handleSearch} style={{ width: '100%', height: 40, borderRadius: 10, fontWeight: 600, background: '#fa8c16', borderColor: '#fa8c16' }}>
                                    Tìm kiếm
                                </Button>
                            </Col>
                        </Row>

                        {/* Category Filter */}
                        <Divider />
                        <Space wrap>
                            {errorCategories.map((cat) => (
                                <Tag key={cat.key} icon={cat.icon} color={category === cat.key ? '#fa8c16' : 'default'} style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: 8 }} onClick={() => setCategory(cat.key)}>
                                    {cat.label}
                                </Tag>
                            ))}
                        </Space>
                    </Card>
                </div>
            </section>

            {/* Results */}
            <section style={{ padding: '0 24px 60px' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    {loading ? (
                        <Card style={{ borderRadius: 16, textAlign: 'center', padding: 40 }}><Spin size="large" /></Card>
                    ) : filteredErrors.length === 0 ? (
                        <Card style={{ borderRadius: 16 }}><Empty description="Không tìm thấy lỗi phù hợp" /></Card>
                    ) : (
                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                            <Text type="secondary">Tìm thấy {filteredErrors.length} kết quả</Text>

                            {filteredErrors.map((error) => {
                                const severity = severityConfig[error.severity as keyof typeof severityConfig];
                                return (
                                    <Card key={error.id} style={{ borderRadius: 16, border: `1px solid ${severity.color}30` }}>
                                        <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
                                            <Col flex="auto">
                                                <Space>
                                                    <Avatar style={{ background: severity.bgColor, color: severity.color }} icon={<BugOutlined />} />
                                                    <div>
                                                        <Title level={5} style={{ margin: 0 }}>{error.title}</Title>
                                                        <Space size="small">
                                                            <Tag color="blue">{productTypes.find((p) => p.value === error.productType)?.label}</Tag>
                                                            <Tag color={severity.color} style={{ background: severity.bgColor }}>{severity.label}</Tag>
                                                        </Space>
                                                    </div>
                                                </Space>
                                            </Col>
                                        </Row>

                                        <Collapse ghost>
                                            <Panel header={<Text strong><InfoCircleFilled style={{ color: '#1890ff', marginRight: 8 }} />Triệu chứng & Nguyên nhân</Text>} key="1">
                                                <Row gutter={24}>
                                                    <Col xs={24} md={12}>
                                                        <Text strong>Triệu chứng:</Text>
                                                        <List size="small" dataSource={error.symptoms} renderItem={(item) => <List.Item><WarningFilled style={{ color: '#faad14', marginRight: 8 }} />{item}</List.Item>} />
                                                    </Col>
                                                    <Col xs={24} md={12}>
                                                        <Text strong>Nguyên nhân có thể:</Text>
                                                        <List size="small" dataSource={error.causes} renderItem={(item) => <List.Item><QuestionCircleOutlined style={{ color: '#1890ff', marginRight: 8 }} />{item}</List.Item>} />
                                                    </Col>
                                                </Row>
                                            </Panel>
                                            <Panel header={<Text strong><ToolOutlined style={{ color: '#52c41a', marginRight: 8 }} />Hướng dẫn khắc phục</Text>} key="2">
                                                <Steps direction="vertical" size="small" current={-1} items={error.solutions.map((s) => ({ title: s.title, description: s.description }))} />
                                            </Panel>
                                        </Collapse>
                                    </Card>
                                );
                            })}
                        </Space>
                    )}
                </div>
            </section>

            {/* Help */}
            <section style={{ padding: '40px 24px', background: '#fff' }}>
                <div style={{ maxWidth: 1000, margin: '0 auto' }}>
                    <Alert type="info" showIcon icon={<InfoCircleFilled />} message="Không tìm thấy lỗi của bạn?" description="Nếu thiết bị gặp lỗi không có trong danh sách hoặc các bước khắc phục không hiệu quả, vui lòng liên hệ hotline 1900 1234 56 hoặc mang thiết bị đến trung tâm bảo hành gần nhất." />
                </div>
            </section>
        </div>
    );
};

export default ErrorDiagnosis;
