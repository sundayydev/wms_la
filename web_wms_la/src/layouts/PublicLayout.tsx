// src/layouts/PublicLayout.tsx
import React, { useState, useEffect } from 'react';
import { Layout, Button, Drawer, Typography, Row, Col, Space, FloatButton, Divider } from 'antd';
// Import React Icons
import {
	FaHome,
	FaSearch,
	FaTools,
	FaPhoneAlt,
	FaBars,
	FaShieldAlt,
	FaFacebookF,
	FaInstagram,
	FaYoutube,
	FaEnvelope,
	FaMapMarkerAlt,
	FaRocket,
	FaHeadset,
	FaUser,
	FaChevronRight,
	FaLeaf
} from "react-icons/fa";
import { Outlet, Link, useLocation } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

// ============================================================================
// CONFIGURATION
// ============================================================================

const NAV_ITEMS = [
	{ key: 'home', label: 'Trang chủ', path: '/', icon: <FaHome /> },
	{ key: 'warranty', label: 'Tra cứu bảo hành', path: '/warranty-lookup', icon: <FaShieldAlt /> },
	{ key: 'order', label: 'Tra cứu đơn hàng', path: '/order-lookup', icon: <FaSearch /> },
	{ key: 'diagnosis', label: 'Chuẩn đoán lỗi', path: '/error-diagnosis', icon: <FaTools /> },
	{ key: 'contact', label: 'Liên hệ', path: '/contact', icon: <FaPhoneAlt /> },
];

const PublicLayout: React.FC = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [drawerVisible, setDrawerVisible] = useState(false);
	const location = useLocation();

	// Handle Scroll Effect
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	// Close drawer on route change
	useEffect(() => {
		setDrawerVisible(false);
	}, [location.pathname]);

	// ============================================================================
	// COMPONENT: HEADER
	// ============================================================================
	const renderHeader = () => (
		<Header
			className={`fixed top-0 w-full z-50 transition-all duration-300 flex items-center justify-between px-4 md:px-8 h-[72px]
        ${isScrolled ? 'bg-white shadow-md' : 'bg-white border-b border-slate-100'}
      `}
		>
			{/* 1. LOGO */}
			<Link to="/" className="flex items-center gap-3 no-underline group">
				<img src="/LA_Logo.png" alt="LogoLA" className="h-12" />
				<img src="RTC_Logo.png" alt="LogoRTC" className="h-14" />
			</Link>

			{/* 2. DESKTOP NAVIGATION (Hidden on Mobile) */}
			<div className="hidden lg:flex items-center gap-1 bg-slate-50 p-1.5 rounded-full border border-slate-200">
				{NAV_ITEMS.map((item) => {
					const isActive = location.pathname === item.path;
					return (
						<Link key={item.key} to={item.path}>
							<div
								className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 flex items-center gap-2
                  ${isActive
										? 'bg-white text-green-600 shadow-sm border border-slate-100'
										: 'text-slate-500 hover:text-green-600 hover:bg-green-50'
									}
                `}
							>
								<span className="text-lg">{item.icon}</span>
								<span>{item.label}</span>
							</div>
						</Link>
					);
				})}
			</div>

			{/* 3. MOBILE MENU BUTTON & ACTIONS */}
			<div className="flex items-center gap-3">
			</div>
		</Header>
	);

	// ============================================================================
	// COMPONENT: FOOTER
	// ============================================================================
	const renderFooter = () => (
		<Footer className="bg-slate-900 text-slate-300 pt-16 pb-8 px-4 md:px-0 mt-auto border-t-4 border-green-600 relative overflow-hidden">
			{/* Background Decor (Optional) */}
			<div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

			<div className="max-w-7xl mx-auto relative z-10">
				<Row gutter={[48, 32]}>
					{/* Cột 1: Thông tin công ty */}
					<Col xs={24} md={8}>
						<div className="flex items-center gap-2 mb-4 text-white">
							<div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center font-bold text-white">
								<FaLeaf />
							</div>
							<span className="text-xl font-bold">WMS PRO</span>
						</div>
						<Paragraph className="text-slate-400 mb-6 leading-relaxed text-sm">
							Hệ thống quản lý kho hàng thông minh, thân thiện với môi trường và tối ưu hóa vận hành doanh nghiệp bền vững.
						</Paragraph>
						<Space size="middle">
							<SocialButton icon={<FaFacebookF />} />
							<SocialButton icon={<FaInstagram />} />
							<SocialButton icon={<FaYoutube />} />
						</Space>
					</Col>

					{/* Cột 2: Liên kết */}
					<Col xs={24} sm={12} md={8}>
						<Title level={5} className="text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
							<span className="w-1 h-4 bg-green-500 rounded-full"></span> Liên kết nhanh
						</Title>
						<div className="flex flex-col gap-3">
							{NAV_ITEMS.map(item => (
								<Link key={item.key} to={item.path} className="text-slate-400 hover:text-green-400 transition-colors flex items-center gap-2 text-sm group">
									<FaChevronRight className="text-[10px] text-slate-600 group-hover:text-green-500 transition-colors" />
									{item.label}
								</Link>
							))}
						</div>
					</Col>

					{/* Cột 3: Liên hệ */}
					<Col xs={24} sm={12} md={8}>
						<Title level={5} className="text-white mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
							<span className="w-1 h-4 bg-green-500 rounded-full"></span> Liên hệ hỗ trợ
						</Title>
						<div className="flex flex-col gap-4">
							<div className="flex items-start gap-3 text-slate-400 text-sm group cursor-default">
								<div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-green-500 group-hover:bg-green-600 group-hover:text-white transition-all">
									<FaMapMarkerAlt />
								</div>
								<span className="mt-1.5">Tầng 12A, Tòa nhà Vincom Center,<br />72 Lê Thánh Tôn, Q.1, TP.HCM</span>
							</div>
							<div className="flex items-center gap-3 text-slate-400 text-sm group cursor-pointer">
								<div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-green-500 group-hover:bg-green-600 group-hover:text-white transition-all">
									<FaPhoneAlt />
								</div>
								<span className="text-white font-bold text-lg group-hover:text-green-400 transition-colors">1900 1234 56</span>
							</div>
							<div className="flex items-center gap-3 text-slate-400 text-sm group cursor-pointer">
								<div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-green-500 group-hover:bg-green-600 group-hover:text-white transition-all">
									<FaEnvelope />
								</div>
								<span className="group-hover:text-green-400 transition-colors">support@wmspro.com</span>
							</div>
						</div>
					</Col>
				</Row>

				<Divider className="border-slate-800 my-10" />

				{/* Bottom Footer: Features & Copyright */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="flex flex-wrap justify-center gap-6 text-sm">
						<div className="flex items-center gap-2 text-slate-300 font-medium">
							<FaShieldAlt className="text-green-500 text-lg" /> Bảo hành 100%
						</div>
						<div className="flex items-center gap-2 text-slate-300 font-medium">
							<FaRocket className="text-green-500 text-lg" /> Giao hàng nhanh
						</div>
						<div className="flex items-center gap-2 text-slate-300 font-medium">
							<FaHeadset className="text-green-500 text-lg" /> Hỗ trợ 24/7
						</div>
					</div>
					<Text className="text-slate-500 text-xs">
						© {new Date().getFullYear()} WMS PRO. All rights reserved.
					</Text>
				</div>
			</div>
		</Footer>
	);

	// ============================================================================
	// RENDER MAIN LAYOUT
	// ============================================================================
	return (
		<Layout className="min-h-screen bg-slate-50 font-sans selection:bg-green-100 selection:text-green-800">
			{renderHeader()}

			{/* Mobile Drawer */}
			<Drawer
				title={
					<div className="flex items-center gap-2 text-green-700">
						<FaLeaf className="text-xl" />
						<span className="font-bold text-lg">MENU</span>
					</div>
				}
				placement="right"
				onClose={() => setDrawerVisible(false)}
				open={drawerVisible}
				width={300}
				styles={{ body: { padding: 0 } }}
			>
				<div className="flex flex-col p-4 gap-2">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.key}
							to={item.path}
							className={`
                flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-colors
                ${location.pathname === item.path
									? 'bg-green-50 text-green-700 border border-green-100'
									: 'text-slate-600 hover:bg-slate-50 hover:text-green-600'
								}
              `}
							onClick={() => setDrawerVisible(false)}
						>
							<span className={`text-xl ${location.pathname === item.path ? 'text-green-600' : 'text-slate-400'}`}>
								{item.icon}
							</span>
							{item.label}
						</Link>
					))}
					<Divider className="my-2" />
					<Button
						type="primary"
						size="large"
						icon={<FaUser />}
						className="w-full bg-green-600 hover:bg-green-700 h-12 rounded-xl font-semibold shadow-lg shadow-green-200 border-none"
					>
						Đăng nhập hệ thống
					</Button>

					<div className="mt-8 bg-green-50 p-4 rounded-xl border border-green-100 text-center">
						<p className="text-sm text-green-800 mb-2 font-medium">Tổng đài hỗ trợ miễn phí</p>
						<p className="text-xl font-bold text-green-700 flex items-center justify-center gap-2">
							<FaPhoneAlt className="text-lg" /> 1900 1234 56
						</p>
					</div>
				</div>
			</Drawer>

			<Content className="mt-[72px] flex flex-col min-h-[calc(100vh-72px)]">
				{/* Main Content Area */}
				<div className="flex-1 w-full mx-auto animate-fade-in">
					<Outlet />
				</div>
				{renderFooter()}
			</Content>

			<FloatButton.BackTop
				type="primary"
				style={{ right: 24, bottom: 24 }}
				icon={<FaRocket />}
				className="shadow-lg shadow-green-500/30 bg-green-600 hover:bg-green-700"
			/>
		</Layout>
	);
};

// Sub-component for Social Buttons
const SocialButton = ({ icon }: { icon: React.ReactNode }) => (
	<Button
		shape="circle"
		className="bg-slate-800 border-none text-slate-400 hover:bg-green-600 hover:text-white transition-all duration-300 w-10 h-10 flex items-center justify-center text-lg"
	>
		{icon}
	</Button>
);

export default PublicLayout;