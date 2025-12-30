// src/pages/Public/PublicHome.tsx
import React from 'react';
import { Typography, Card, Row, Col, Button, Input, Statistic, Avatar, Steps, Tag } from 'antd';
import {
  SearchOutlined,
  ArrowRightOutlined,
  SafetyCertificateFilled,
  ToolFilled,
  ClockCircleFilled,
  CheckCircleFilled,
  FileSearchOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { FaTools, FaHandshake, FaMicrochip, FaHeadset } from 'react-icons/fa';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

// ============================================================================
// 1. HERO SECTION (Giới thiệu Trung tâm bảo hành)
// ============================================================================
const HeroSection: React.FC = () => (
  <section className="bg-blue-50 py-20 lg:py-32 relative overflow-hidden">
    {/* Decorative Blobs - Chuyển sang tông xanh dương/cam cho cảm giác kỹ thuật */}
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
    <div className="absolute top-0 -left-20 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <Row gutter={[64, 48]} align="middle">
        {/* Left Content */}
        <Col xs={24} lg={12}>
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-blue-100">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <Text className="text-blue-800 font-medium">Trung tâm dịch vụ ủy quyền chính hãng từ Mobydata</Text>
            </div>

            <Title className="text-5xl lg:text-6xl font-extrabold text-slate-800 leading-tight">
              Trung Tâm Bảo Hành <br />
              <span className="text-blue-600 relative inline-block">
                LeadAndAim
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </Title>

            <Paragraph className="text-lg text-slate-600 leading-relaxed max-w-lg">
              Đối tác tin cậy cung cấp dịch vụ bảo hành, sửa chữa và bảo trì các thiết bị PDA, máy quét mã vạch (Scanner) và máy in công nghiệp. Cam kết linh kiện chính hãng và quy trình chuẩn quốc tế.
            </Paragraph>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/warranty-lookup">
                <Button type="primary" size="large" className="bg-blue-600 hover:bg-blue-700 border-none h-14 px-8 rounded-xl shadow-lg shadow-blue-200 text-lg font-semibold flex items-center gap-2 w-full sm:w-auto justify-center">
                  Tra cứu bảo hành <SearchOutlined />
                </Button>
              </Link>
              <Link to="/partners">
                <Button size="large" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 h-14 px-8 rounded-xl text-lg font-semibold w-full sm:w-auto">
                  Dành cho Đại lý
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-blue-100/50 mt-6">
              <div className="flex -space-x-3">
                {/* Giả lập avatar kỹ thuật viên */}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">KV</div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-500">TH</div>
                <div className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">+10</div>
              </div>
              <div className="flex flex-col">
                <Text className="text-slate-800 font-bold">Đội ngũ kỹ thuật viên</Text>
                <Text className="text-slate-500 text-sm">Được đào tạo chứng chỉ hãng</Text>
              </div>
            </div>
          </div>
        </Col>

        {/* Right Content */}
        <Col xs={24} lg={12} className="hidden lg:block">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-600 rounded-[3rem] -rotate-2 opacity-10"></div>
            {/* Hình ảnh kỹ thuật viên đang sửa chữa bo mạch hoặc thiết bị PDA */}
            <img
              src="https://img.freepik.com/free-photo/technician-repairing-computer-motherboard_53876-120536.jpg"
              alt="LeadAndAim Technician"
              className="relative rounded-[3rem] shadow-2xl border-4 border-white w-full object-cover h-[500px]"
            />
            {/* Floating Card 1: Trạng thái sửa chữa */}
            <div className="absolute -left-8 top-16 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <CheckCircleFilled className="text-2xl" />
              </div>
              <div>
                <Text className="block text-slate-400 text-xs font-semibold uppercase">Tỷ lệ sửa thành công</Text>
                <Text className="block text-slate-800 text-lg font-bold">99.5%</Text>
              </div>
            </div>
            {/* Floating Card 2: Chứng nhận */}
            <div className="absolute -right-4 bottom-20 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow delay-700">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                <SafetyCertificateFilled className="text-2xl" />
              </div>
              <div>
                <Text className="block text-slate-400 text-xs font-semibold uppercase">Linh kiện</Text>
                <Text className="block text-slate-800 text-lg font-bold">Chính Hãng 100%</Text>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  </section>
);

// ============================================================================
// 2. WARRANTY CHECK SECTION (Chức năng cốt lõi)
// ============================================================================
const QuickSearchSection: React.FC = () => (
  <section className="py-12 -mt-16 relative z-20 px-6">
    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 p-8 lg:p-12">
      <div className="text-center mb-8">
        <Title level={3} className="text-slate-800 m-0">Tra cứu trạng thái thiết bị</Title>
        <Text className="text-slate-500">Nhập số Serial (SN), IMEI hoặc Mã phiếu tiếp nhận để kiểm tra tiến độ bảo hành</Text>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Search
          placeholder="Ví dụ: SN12345678 hoặc RMA-2023-001..."
          allowClear
          enterButton={
            <Button type="primary" className="bg-blue-600 hover:bg-blue-700 border-none h-full px-8 text-lg">
              Kiểm tra ngay
            </Button>
          }
          size="large"
          className="search-large-custom"
          style={{ width: '100%' }}
        />
      </div>
    </div>
  </section>
);

// ============================================================================
// 3. SERVICE FEATURES (Tại sao chọn LeadAndAim)
// ============================================================================
const features = [
  {
    icon: <SafetyCertificateFilled className="text-4xl text-blue-500" />,
    title: 'Ủy Quyền Chính Hãng',
    desc: 'Trung tâm bảo hành được ủy quyền bởi các hãng lớn (Mobydata, Zebra, Honeywell...). Đảm bảo linh kiện thay thế là 100% chính hãng.'
  },
  {
    icon: <ClockCircleFilled className="text-4xl text-orange-500" />,
    title: 'Cam Kết TAT (Turnaround Time)',
    desc: 'Quy trình tiếp nhận và xử lý nhanh chóng. Cam kết thời gian trả máy từ 24h - 48h đối với các lỗi thông thường.'
  },
  {
    icon: <FaMicrochip className="text-4xl text-green-500" />,
    title: 'Kỹ Thuật Chuyên Sâu',
    desc: 'Đội ngũ kỹ thuật viên am hiểu sâu về PDA, máy quét công nghiệp, có khả năng sửa chữa Mainboard (Level 3-4).'
  },
  {
    icon: <FileSearchOutlined className="text-4xl text-purple-500" />,
    title: 'Theo Dõi Online',
    desc: 'Hệ thống tracking realtime. Khách hàng biết chính xác thiết bị đang ở công đoạn nào (Tiếp nhận -> Sửa chữa -> QC -> Trả hàng).'
  }
];

const FeaturesSection: React.FC = () => (
  <section className="py-20 px-6 bg-white">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <Text className="text-blue-600 font-bold tracking-wider uppercase">Dịch vụ LeadAndAim</Text>
        <Title level={2} className="text-slate-800 mt-2">Tiêu chuẩn vàng trong bảo hành thiết bị</Title>
      </div>

      <Row gutter={[32, 32]}>
        {features.map((feature, idx) => (
          <Col xs={24} sm={12} lg={6} key={idx}>
            <Card
              className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-50 hover:bg-white text-center group"
              bodyStyle={{ padding: '32px 24px' }}
            >
              <div className="w-16 h-16 mx-auto bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <Title level={4} className="text-slate-800 mb-3">{feature.title}</Title>
              <Paragraph className="text-slate-500 text-base leading-relaxed mb-0">
                {feature.desc}
              </Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  </section>
);

// ============================================================================
// 4. WORKFLOW SECTION (Quy trình làm việc)
// ============================================================================
const WorkflowSection: React.FC = () => (
  <section className="py-20 bg-slate-50 px-6">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <Title level={2}>Quy trình xử lý bảo hành</Title>
        <Paragraph className="text-slate-500">Minh bạch trong từng bước xử lý thiết bị của khách hàng</Paragraph>
      </div>
      <div className="hidden md:block px-10">
        <Steps
          current={1} // Demo trạng thái đang xử lý
          items={[
            { title: 'Tiếp nhận', description: 'Kiểm tra ngoại quan & ghi nhận lỗi', icon: <FileSearchOutlined /> },
            { title: 'Kiểm tra & Báo giá', description: 'Kỹ thuật chẩn đoán chi tiết', icon: <FaTools /> },
            { title: 'Sửa chữa', description: 'Thay thế linh kiện & Fix lỗi', icon: <FaMicrochip /> },
            { title: 'QC & Test', description: 'Kiểm tra hoạt động lần cuối', icon: <SafetyCertificateFilled /> },
            { title: 'Hoàn tất', description: 'Bàn giao thiết bị cho khách', icon: <CheckCircleFilled /> },
          ]}
        />
      </div>
      {/* Mobile View Placeholder for Steps could be added here */}
    </div>
  </section>
)


// ============================================================================
// 5. STATS SECTION (Uy tín thông qua con số)
// ============================================================================
const StatsSection: React.FC = () => (
  <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
    <div className="max-w-7xl mx-auto px-6 relative z-10">
      <Row gutter={[48, 48]} justify="center" align="middle">
        <Col xs={24} lg={12}>
          <div className="inline-block px-3 py-1 bg-blue-900 rounded-lg text-blue-300 text-sm font-semibold mb-4">LeadAndAim Warranty Center</div>
          <Title className="text-white text-4xl mb-6">Năng lực thực thi</Title>
          <Paragraph className="text-slate-400 text-lg mb-8 max-w-md">
            Chúng tôi hiểu rằng thiết bị ngưng hoạt động sẽ ảnh hưởng lớn đến vận hành của Quý đối tác. Vì vậy, tốc độ và sự chính xác là ưu tiên hàng đầu của LeadAndAim.
          </Paragraph>
          <Link to="/public/contact">
            <Button size="large" type="primary" className="bg-blue-600 hover:bg-blue-500 border-none h-12 px-8 rounded-lg">
              Liên hệ hợp tác bảo hành
            </Button>
          </Link>
        </Col>
        <Col xs={24} lg={12}>
          <Row gutter={[24, 24]}>
            <Col span={12}>
              <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                <Statistic title={<span className="text-slate-400">Thiết bị đã sửa chữa</span>} value={15000} suffix="+" valueStyle={{ color: '#60a5fa', fontWeight: 'bold' }} />
              </div>
            </Col>
            <Col span={12}>
              <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                <Statistic title={<span className="text-slate-400">Đối tác doanh nghiệp</span>} value={350} suffix="+" valueStyle={{ color: '#4ade80', fontWeight: 'bold' }} />
              </div>
            </Col>
            <Col span={12}>
              <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                <Statistic title={<span className="text-slate-400">Thời gian TB (giờ)</span>} value={24} valueStyle={{ color: '#facc15', fontWeight: 'bold' }} />
              </div>
            </Col>
            <Col span={12}>
              <div className="p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10 text-center">
                <Statistic title={<span className="text-slate-400">Hài lòng</span>} value={98} suffix="%" valueStyle={{ color: '#f472b6', fontWeight: 'bold' }} />
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  </section>
);

// ============================================================================
// 6. CTA SECTION
// ============================================================================
const CTASection: React.FC = () => (
  <section className="py-24 px-6 bg-white text-center">
    <div className="max-w-4xl mx-auto">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaHeadset className="text-3xl text-blue-600" />
      </div>
      <Title level={2} className="text-slate-800 mb-6">
        Bạn cần gửi thiết bị bảo hành?
      </Title>
      <Paragraph className="text-slate-500 text-lg mb-8 max-w-2xl mx-auto">
        Tạo phiếu yêu cầu bảo hành trực tuyến (RMA) ngay để được ưu tiên xử lý và theo dõi tiến độ sửa chữa mọi lúc mọi nơi.
      </Paragraph>
      <div className="flex justify-center gap-4">
        <Link to="/public/create-rma">
          <Button type="primary" size="large" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-full shadow-lg shadow-blue-200 border-none font-medium">
            Tạo phiếu bảo hành (RMA)
          </Button>
        </Link>
        <Link to="/public/policy">
          <Button size="large" className="h-12 px-8 rounded-full border-slate-300 text-slate-600 hover:text-blue-600 hover:border-blue-600 font-medium">
            Xem chính sách bảo hành
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const PublicHome: React.FC = () => {
  return (
    <div className="font-sans">
      <HeroSection />
      <QuickSearchSection />
      <FeaturesSection />
      <WorkflowSection />
      <StatsSection />
      <CTASection />
    </div>
  );
};

export default PublicHome;