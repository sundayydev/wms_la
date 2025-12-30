// src/pages/Public/WarrantyLookup.tsx
import React, { useState } from 'react';
import {
  Typography,
  Card,
  Input,
  Button,
  Form,
  Row,
  Col,
  Result,
  Descriptions,
  Tag,
  Timeline,
  Space,
  Divider,
  Spin,
  Alert,
  Steps,
} from 'antd';
import {
  SearchOutlined,
  SafetyCertificateOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  ExclamationCircleFilled,
  CloseCircleFilled,
  MobileOutlined,
  CalendarOutlined,
  ShopOutlined,
  ToolOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// TYPES
// ============================================================================
interface WarrantyInfo {
  serialNumber: string;
  productName: string;
  productModel: string;
  purchaseDate: string;
  warrantyEndDate: string;
  warrantyStatus: 'active' | 'expiring' | 'expired';
  remainingDays: number;
  purchaseLocation: string;
  repairHistory: {
    date: string;
    description: string;
    status: 'completed' | 'pending';
  }[];
}

// ============================================================================
// MOCK DATA (Replace with API call)
// ============================================================================
const mockWarrantyData: Record<string, WarrantyInfo> = {
  'SN123456789': {
    serialNumber: 'SN123456789',
    productName: 'iPhone 15 Pro Max',
    productModel: 'A3106',
    purchaseDate: '2024-06-15',
    warrantyEndDate: '2025-06-15',
    warrantyStatus: 'active',
    remainingDays: 168,
    purchaseLocation: 'WMS LA Store - Quận 1',
    repairHistory: [
      { date: '2024-09-20', description: 'Thay màn hình', status: 'completed' },
      { date: '2024-11-05', description: 'Kiểm tra pin', status: 'completed' },
    ],
  },
  'IMEI123456789012345': {
    serialNumber: 'IMEI123456789012345',
    productName: 'Samsung Galaxy S24 Ultra',
    productModel: 'SM-S928B',
    purchaseDate: '2024-01-20',
    warrantyEndDate: '2025-01-20',
    warrantyStatus: 'expiring',
    remainingDays: 22,
    purchaseLocation: 'WMS LA Store - Quận 7',
    repairHistory: [],
  },
};

// ============================================================================
// WARRANTY STATUS CONFIG
// ============================================================================
const warrantyStatusConfig = {
  active: {
    color: '#52c41a',
    bgColor: '#f6ffed',
    icon: <CheckCircleFilled style={{ color: '#52c41a' }} />,
    label: 'Còn bảo hành',
    tagColor: 'success',
  },
  expiring: {
    color: '#faad14',
    bgColor: '#fffbe6',
    icon: <ClockCircleFilled style={{ color: '#faad14' }} />,
    label: 'Sắp hết hạn',
    tagColor: 'warning',
  },
  expired: {
    color: '#ff4d4f',
    bgColor: '#fff2f0',
    icon: <CloseCircleFilled style={{ color: '#ff4d4f' }} />,
    label: 'Hết bảo hành',
    tagColor: 'error',
  },
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const WarrantyLookup: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<WarrantyInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (values: { searchCode: string }) => {
    setLoading(true);
    setError(null);
    setSearchResult(null);
    setSearched(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const result = mockWarrantyData[values.searchCode.toUpperCase()];

    if (result) {
      setSearchResult(result);
    } else {
      setError('Không tìm thấy thông tin bảo hành. Vui lòng kiểm tra lại mã Serial/IMEI.');
    }

    setLoading(false);
  };

  const handleReset = () => {
    form.resetFields();
    setSearchResult(null);
    setError(null);
    setSearched(false);
  };

  const statusConfig = searchResult
    ? warrantyStatusConfig[searchResult.warrantyStatus]
    : null;

  return (
    <div style={{ background: '#f5f7fa', minHeight: 'calc(100vh - 72px)' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
          padding: '60px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <SafetyCertificateOutlined
            style={{ fontSize: 56, color: '#fff', marginBottom: 16 }}
          />
          <Title level={2} style={{ color: '#fff', marginBottom: 8 }}>
            Tra cứu bảo hành
          </Title>
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: 16 }}>
            Nhập số Serial hoặc IMEI để kiểm tra tình trạng bảo hành sản phẩm của bạn
          </Paragraph>
        </div>
      </section>

      {/* Search Section */}
      <section style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Card
            style={{
              borderRadius: 16,
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
              marginTop: -60,
            }}
          >
            <Form form={form} onFinish={handleSearch} layout="vertical">
              <Form.Item
                name="searchCode"
                label={
                  <Text strong style={{ fontSize: 15 }}>
                    Nhập Serial Number hoặc IMEI
                  </Text>
                }
                rules={[
                  { required: true, message: 'Vui lòng nhập mã tra cứu' },
                  { min: 8, message: 'Mã tra cứu phải có ít nhất 8 ký tự' },
                ]}
              >
                <Input
                  size="large"
                  placeholder="Ví dụ: SN123456789 hoặc IMEI123456789012345"
                  prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                  style={{ borderRadius: 10 }}
                />
              </Form.Item>

              <Row gutter={12}>
                <Col flex="auto">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    icon={<SearchOutlined />}
                    style={{
                      width: '100%',
                      height: 48,
                      borderRadius: 10,
                      fontWeight: 600,
                      background: '#52c41a',
                      borderColor: '#52c41a',
                    }}
                  >
                    Tra cứu
                  </Button>
                </Col>
                {searched && (
                  <Col>
                    <Button
                      size="large"
                      icon={<ReloadOutlined />}
                      onClick={handleReset}
                      style={{ height: 48, borderRadius: 10 }}
                    >
                      Làm mới
                    </Button>
                  </Col>
                )}
              </Row>
            </Form>

            {/* Help text */}
            <div style={{ marginTop: 20 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                * Serial Number thường nằm trên hộp sản phẩm hoặc trong phần Cài đặt
                &gt; Giới thiệu &gt; Serial Number
              </Text>
            </div>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      <section style={{ padding: '0 24px 60px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          {/* Loading State */}
          {loading && (
            <Card style={{ borderRadius: 16, textAlign: 'center', padding: 40 }}>
              <Spin size="large" />
              <Paragraph style={{ marginTop: 16, color: '#666' }}>
                Đang tra cứu thông tin bảo hành...
              </Paragraph>
            </Card>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card style={{ borderRadius: 16 }}>
              <Result
                status="warning"
                icon={<ExclamationCircleFilled style={{ color: '#faad14' }} />}
                title="Không tìm thấy thông tin"
                subTitle={error}
                extra={
                  <Button type="primary" onClick={handleReset}>
                    Thử lại
                  </Button>
                }
              />
            </Card>
          )}

          {/* Success Result */}
          {searchResult && !loading && statusConfig && (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* Status Card */}
              <Card
                style={{
                  borderRadius: 16,
                  border: `2px solid ${statusConfig.color}`,
                  background: statusConfig.bgColor,
                }}
              >
                <Row align="middle" gutter={16}>
                  <Col>
                    <div
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 32,
                      }}
                    >
                      {statusConfig.icon}
                    </div>
                  </Col>
                  <Col flex="auto">
                    <Text type="secondary">Tình trạng bảo hành</Text>
                    <Title level={3} style={{ margin: 0, color: statusConfig.color }}>
                      {statusConfig.label}
                    </Title>
                    {searchResult.warrantyStatus !== 'expired' && (
                      <Text>Còn lại {searchResult.remainingDays} ngày</Text>
                    )}
                  </Col>
                  <Col>
                    <Tag
                      color={statusConfig.tagColor as 'success' | 'warning' | 'error'}
                      style={{ fontSize: 14, padding: '4px 12px' }}
                    >
                      {statusConfig.label}
                    </Tag>
                  </Col>
                </Row>
              </Card>

              {/* Product Info Card */}
              <Card
                title={
                  <Space>
                    <MobileOutlined />
                    <span>Thông tin sản phẩm</span>
                  </Space>
                }
                style={{ borderRadius: 16 }}
              >
                <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ fontWeight: 500 }}>
                  <Descriptions.Item label="Tên sản phẩm">
                    <Text strong>{searchResult.productName}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Model">
                    {searchResult.productModel}
                  </Descriptions.Item>
                  <Descriptions.Item label="Serial Number">
                    <Text code>{searchResult.serialNumber}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Nơi mua">
                    <Space>
                      <ShopOutlined />
                      {searchResult.purchaseLocation}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>

                <Divider />

                <Descriptions column={{ xs: 1, sm: 2 }} labelStyle={{ fontWeight: 500 }}>
                  <Descriptions.Item label="Ngày mua">
                    <Space>
                      <CalendarOutlined />
                      {new Date(searchResult.purchaseDate).toLocaleDateString('vi-VN')}
                    </Space>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày hết hạn bảo hành">
                    <Space>
                      <CalendarOutlined />
                      {new Date(searchResult.warrantyEndDate).toLocaleDateString('vi-VN')}
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Repair History Card */}
              {searchResult.repairHistory.length > 0 && (
                <Card
                  title={
                    <Space>
                      <ToolOutlined />
                      <span>Lịch sử sửa chữa</span>
                    </Space>
                  }
                  style={{ borderRadius: 16 }}
                >
                  <Timeline
                    items={searchResult.repairHistory.map((item) => ({
                      color: item.status === 'completed' ? 'green' : 'blue',
                      children: (
                        <div>
                          <Text strong>{item.description}</Text>
                          <br />
                          <Text type="secondary">
                            {new Date(item.date).toLocaleDateString('vi-VN')}
                          </Text>
                          <Tag
                            color={item.status === 'completed' ? 'success' : 'processing'}
                            style={{ marginLeft: 8 }}
                          >
                            {item.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                          </Tag>
                        </div>
                      ),
                    }))}
                  />
                </Card>
              )}

              {/* Alert for expiring warranty */}
              {searchResult.warrantyStatus === 'expiring' && (
                <Alert
                  type="warning"
                  showIcon
                  message="Bảo hành sắp hết hạn"
                  description={`Bảo hành sản phẩm của bạn sẽ hết hạn trong ${searchResult.remainingDays} ngày. 
                  Hãy liên hệ với chúng tôi để được tư vấn gia hạn bảo hành.`}
                  action={
                    <Button size="small" type="primary" style={{ background: '#faad14', borderColor: '#faad14' }}>
                      Liên hệ ngay
                    </Button>
                  }
                />
              )}
            </Space>
          )}
        </div>
      </section>

      {/* Guide Section */}
      <section style={{ padding: '40px 24px 60px', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 32 }}>
            Hướng dẫn tra cứu
          </Title>

          <Steps
            direction="vertical"
            current={-1}
            items={[
              {
                title: 'Bước 1: Tìm Serial Number',
                description: 'Serial Number có thể được tìm thấy trên hộp sản phẩm, trong phần Cài đặt hoặc trên hóa đơn mua hàng.',
              },
              {
                title: 'Bước 2: Nhập mã tra cứu',
                description: 'Nhập đầy đủ Serial Number hoặc IMEI vào ô tìm kiếm phía trên.',
              },
              {
                title: 'Bước 3: Xem kết quả',
                description: 'Thông tin bảo hành sẽ được hiển thị bao gồm tình trạng, thời hạn và lịch sử sửa chữa.',
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
};

export default WarrantyLookup;
