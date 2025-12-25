import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Typography,
  Descriptions,
  Tag,
  Timeline,
  Statistic,
  Row,
  Col,
  Alert,
  Empty,
  Badge,
  Space,
  Divider,
  message
} from 'antd';
import {
  SearchOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  HistoryOutlined,
  ShopOutlined,
  ToolOutlined,
  UserOutlined,
  CalendarOutlined,
  RightCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// ============================================================================
// 1. TYPES & MOCK DATA
// ============================================================================

interface DeviceHistory {
  Date: string;
  Event: string; // 'PURCHASE' | 'REPAIR' | 'WARRANTY_ACTIVATION'
  Description: string;
  ReferenceCode?: string; // Mã đơn hàng/phiếu sửa
}

interface WarrantyInfo {
  InstanceID: string;
  DeviceName: string;
  SerialNumber: string;
  IMEI: string;
  CustomerName: string;
  PhoneNumber: string;
  PurchaseDate: string;
  WarrantyPeriod: number; // Tháng
  ExpirationDate: string;
  Status: 'ACTIVE' | 'EXPIRED' | 'VOID'; // VOID = Từ chối bảo hành (rơi vỡ, vào nước...)
  History: DeviceHistory[];
}

// Giả lập Database
const mockDatabase: WarrantyInfo[] = [
  {
    InstanceID: 'ins-1',
    DeviceName: 'iPhone 15 Pro Max 256GB - Titan Tự nhiên',
    SerialNumber: 'H4K99L001',
    IMEI: '356998000001234',
    CustomerName: 'Nguyễn Văn An',
    PhoneNumber: '0909123456',
    PurchaseDate: '2024-01-15',
    WarrantyPeriod: 12, // 12 tháng
    ExpirationDate: '2025-01-15',
    Status: 'ACTIVE',
    History: [
      {
        Date: '2024-01-15',
        Event: 'PURCHASE',
        Description: 'Mua mới tại cửa hàng',
        ReferenceCode: 'SO-2024-001'
      },
      {
        Date: '2024-06-20',
        Event: 'REPAIR',
        Description: 'Vệ sinh loa, mic (Miễn phí)',
        ReferenceCode: 'REP-2406-005'
      }
    ]
  },
  {
    InstanceID: 'ins-2',
    DeviceName: 'Samsung Galaxy S22 Ultra',
    SerialNumber: 'R5CW10...',
    IMEI: '359000111222333',
    CustomerName: 'Trần Thị B',
    PhoneNumber: '0912345678',
    PurchaseDate: '2022-05-10',
    WarrantyPeriod: 12,
    ExpirationDate: '2023-05-10',
    Status: 'EXPIRED',
    History: [
      {
        Date: '2022-05-10',
        Event: 'PURCHASE',
        Description: 'Mua mới',
        ReferenceCode: 'SO-2022-100'
      },
      {
        Date: '2023-05-10',
        Event: 'WARRANTY_EXPIRATION',
        Description: 'Hết hạn bảo hành chính hãng',
      }
    ]
  }
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

const WarrantyCheck: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState<WarrantyInfo | null>(null);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (value: string) => {
    if (!value.trim()) {
      message.warning('Vui lòng nhập IMEI hoặc Serial Number');
      return;
    }

    setLoading(true);
    setSearched(true);
    setResult(null); // Reset result

    // Giả lập delay API
    setTimeout(() => {
      const found = mockDatabase.find(
        item => item.IMEI === value || item.SerialNumber === value || item.PhoneNumber === value
      );
      setResult(found || null);
      setLoading(false);
    }, 800);
  };

  // Tính số ngày còn lại
  const getDaysRemaining = (expDate: string) => {
    const today = dayjs();
    const end = dayjs(expDate);
    const diff = end.diff(today, 'day');
    return diff > 0 ? diff : 0;
  };

  // Render nội dung kết quả
  const renderResult = () => {
    if (!result) return <Empty description="Không tìm thấy thông tin thiết bị" />;

    const isExpired = result.Status === 'EXPIRED';
    const isVoid = result.Status === 'VOID';
    const daysRemaining = getDaysRemaining(result.ExpirationDate);

    // Màu sắc chủ đạo
    const statusColor = isExpired || isVoid ? '#ff4d4f' : '#52c41a';
    const statusText = isExpired ? 'ĐÃ HẾT HẠN' : isVoid ? 'TỪ CHỐI BẢO HÀNH' : 'CÒN BẢO HÀNH';

    return (
      <div className="animate-fade-in">
        {/* 1. STATUS BANNER */}
        <Badge.Ribbon
          text={statusText}
          color={statusColor}
          className="scale-110"
        >
          <Card className="shadow-md mb-6 border-t-4" style={{ borderTopColor: statusColor }}>
            <Row gutter={24} align="middle">
              <Col xs={24} md={16}>
                <Title level={3} className="m-0 mb-2">{result.DeviceName}</Title>
                <Space split={<Divider type="vertical" />}>
                  <Text type="secondary"><BarcodeOutlined /> IMEI: <Text strong copyable>{result.IMEI}</Text></Text>
                  <Text type="secondary">SN: <Text strong copyable>{result.SerialNumber}</Text></Text>
                </Space>
                <div className="mt-4">
                  <Space>
                    <Tag icon={<UserOutlined />}>{result.CustomerName}</Tag>
                    <Tag icon={<ShopOutlined />}>Mua ngày: {dayjs(result.PurchaseDate).format('DD/MM/YYYY')}</Tag>
                  </Space>
                </div>
              </Col>

              {/* Countdown Statistic */}
              <Col xs={24} md={8} className="text-right border-l pl-6 border-gray-100">
                {!isExpired && !isVoid ? (
                  <Statistic
                    title="Thời hạn còn lại"
                    value={daysRemaining}
                    suffix="ngày"
                    valueStyle={{ color: statusColor, fontWeight: 'bold' }}
                  />
                ) : (
                  <Statistic
                    title="Trạng thái"
                    value={isVoid ? "Bị từ chối" : "Hết hạn"}
                    valueStyle={{ color: statusColor, fontWeight: 'bold' }}
                  />
                )}
                <Text type="secondary" className="text-xs">
                  Hết hạn: {dayjs(result.ExpirationDate).format('DD/MM/YYYY')}
                </Text>
              </Col>
            </Row>
          </Card>
        </Badge.Ribbon>

        <Row gutter={24}>
          {/* 2. HISTORY TIMELINE */}
          <Col xs={24} lg={16}>
            <Card title={<><HistoryOutlined /> Lịch sử thiết bị</>} className="shadow-sm h-full">
              <Timeline mode="left">
                {result.History.map((item, index) => (
                  <Timeline.Item
                    key={index}
                    color={item.Event === 'PURCHASE' ? 'blue' : 'green'}
                    dot={item.Event === 'PURCHASE' ? <ShopOutlined /> : <ToolOutlined />}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-700">
                        {dayjs(item.Date).format('DD/MM/YYYY')} - {item.Description}
                      </span>
                      {item.ReferenceCode && (
                        <a className="text-xs text-blue-500">{item.ReferenceCode}</a>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
                {/* Dự báo tương lai: Ngày hết hạn */}
                <Timeline.Item
                  color={isExpired ? 'red' : 'gray'}
                  dot={isExpired ? <CloseCircleOutlined /> : <ClockCircleOutlined />}
                >
                  <span className={isExpired ? 'text-red-500 font-bold' : 'text-gray-400'}>
                    {dayjs(result.ExpirationDate).format('DD/MM/YYYY')} - Hết hạn bảo hành
                  </span>
                </Timeline.Item>
              </Timeline>
            </Card>
          </Col>

          {/* 3. ACTIONS */}
          <Col xs={24} lg={8}>
            <Card title="Thao tác" className="shadow-sm h-full">
              <div className="flex flex-col gap-3">
                <Button
                  type="primary"
                  size="large"
                  icon={<ToolOutlined />}
                  block
                  onClick={() => navigate('/repairs/create', { state: { imei: result.IMEI } })}
                >
                  Tạo phiếu sửa chữa
                </Button>

                <Button block>Xem lịch sử chi tiết</Button>

                {isExpired && (
                  <Alert
                    message="Lưu ý"
                    description="Thiết bị đã hết hạn bảo hành. Phí sửa chữa sẽ được tính theo bảng giá dịch vụ."
                    type="warning"
                    showIcon
                    className="mt-4"
                  />
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* HEADER SEARCH SECTION */}
      <div className="text-center mb-8 pt-6">
        <Title level={2} className="text-blue-600 mb-2">
          <CheckCircleOutlined /> Tra cứu bảo hành
        </Title>
        <Paragraph type="secondary">
          Nhập số IMEI, Serial Number hoặc Số điện thoại khách hàng để kiểm tra
        </Paragraph>

        <div className="max-w-xl mx-auto mt-6">
          <Search
            placeholder="Nhập IMEI / Serial / SĐT..."
            allowClear
            enterButton="Tra cứu ngay"
            size="large"
            onSearch={handleSearch}
            onChange={(e) => setSearchQuery(e.target.value)}
            loading={loading}
            className="shadow-lg rounded-lg"
          />
          <div className="text-left mt-2">
            <Text type="secondary" className="text-xs">
              * Gợi ý: Thử nhập <Tag>356998000001234</Tag> (Còn BH) hoặc <Tag>359000111222333</Tag> (Hết BH)
            </Text>
          </div>
        </div>
      </div>

      <Divider />

      {/* RESULT SECTION */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded w-full mb-4"></div>
            </div>
          </div>
        ) : (
          searched && renderResult()
        )}
      </div>
    </div>
  );
};

export default WarrantyCheck;