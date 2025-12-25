import React, { useState } from 'react';
import {
	Table,
	Card,
	Tag,
	Button,
	Input,
	DatePicker,
	Select,
	Space,
	Typography,
	Row,
	Col,
	Statistic,
	Modal,
	Form,
	Radio,
	message
} from 'antd';
import {
	PlusOutlined,
	SearchOutlined,
	FilterOutlined,
	WalletOutlined,
	ArrowUpOutlined,
	ArrowDownOutlined,
	BankOutlined,
	DollarOutlined,
	FileTextOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;
const { TextArea } = Input;

// ============================================================================
// 1. TYPES & MOCK DATA
// ============================================================================

interface PaymentType {
	PaymentID: string;
	PaymentCode: string;
	ReferenceType: 'SALES_ORDER' | 'PURCHASE_ORDER' | 'REPAIR';
	ReferenceID: string; // Mã đơn hàng (SO-xxx, PO-xxx)
	PartnerName: string; // Tên Khách hàng hoặc NCC
	PaymentDate: string;
	PaymentMethod: 'CASH' | 'BANK_TRANSFER' | 'MOMO' | 'CREDIT_CARD';
	Amount: number;
	Status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
	TransactionID?: string; // Mã tham chiếu ngân hàng
	Notes?: string;
}

const mockData: PaymentType[] = [
	{
		PaymentID: 'pay-1',
		PaymentCode: 'PAY-2412-001',
		ReferenceType: 'SALES_ORDER',
		ReferenceID: 'SO-2024-099',
		PartnerName: 'Nguyễn Văn Khách',
		PaymentDate: '2024-12-25 09:30',
		PaymentMethod: 'BANK_TRANSFER',
		Amount: 15500000,
		Status: 'COMPLETED',
		TransactionID: 'FT233499...',
	},
	{
		PaymentID: 'pay-2',
		PaymentCode: 'PAY-2412-002',
		ReferenceType: 'REPAIR',
		ReferenceID: 'REP-2412-001',
		PartnerName: 'Lê Thị B',
		PaymentDate: '2024-12-25 10:15',
		PaymentMethod: 'CASH',
		Amount: 850000,
		Status: 'COMPLETED',
	},
	{
		PaymentID: 'pay-3',
		PaymentCode: 'PAY-2412-003',
		ReferenceType: 'PURCHASE_ORDER',
		ReferenceID: 'PO-2024-005',
		PartnerName: 'Samsung Vina Electronics',
		PaymentDate: '2024-12-24 14:00',
		PaymentMethod: 'BANK_TRANSFER',
		Amount: 250000000,
		Status: 'PENDING', // Đang chờ kế toán trưởng duyệt chi
	},
	{
		PaymentID: 'pay-4',
		PaymentCode: 'PAY-2412-004',
		ReferenceType: 'SALES_ORDER',
		ReferenceID: 'SO-2024-100',
		PartnerName: 'Công ty ABC',
		PaymentDate: '2024-12-23 16:45',
		PaymentMethod: 'MOMO',
		Amount: 2500000,
		Status: 'FAILED',
		Notes: 'Lỗi cổng thanh toán'
	},
];

// ============================================================================
// 2. COMPONENT CHÍNH
// ============================================================================

const PaymentList: React.FC = () => {
	const [data, setData] = useState<PaymentType[]>(mockData);
	const [loading, setLoading] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [form] = Form.useForm();

	// --- Helpers ---

	const formatCurrency = (amount: number) =>
		new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

	// Xác định đây là khoản Thu (Income) hay Chi (Expense)
	const isExpense = (type: string) => type === 'PURCHASE_ORDER';

	const getStatusTag = (status: string) => {
		switch (status) {
			case 'COMPLETED': return <Tag color="success">Thành công</Tag>;
			case 'PENDING': return <Tag color="warning">Chờ xử lý</Tag>;
			case 'FAILED': return <Tag color="error">Thất bại</Tag>;
			case 'REFUNDED': return <Tag color="purple">Hoàn tiền</Tag>;
			default: return <Tag>{status}</Tag>;
		}
	};

	const getRefTypeTag = (type: string) => {
		switch (type) {
			case 'SALES_ORDER': return <Tag color="blue">Bán hàng</Tag>;
			case 'REPAIR': return <Tag color="orange">Sửa chữa</Tag>;
			case 'PURCHASE_ORDER': return <Tag color="red">Nhập hàng</Tag>;
			default: return <Tag>{type}</Tag>;
		}
	};

	const handleCreate = async () => {
		try {
			const values = await form.validateFields();
			message.success('Tạo phiếu thu/chi thành công');
			setIsModalOpen(false);
			form.resetFields();
		} catch (e) {
			// Validation error
		}
	};

	// --- Columns ---

	const columns: ColumnsType<PaymentType> = [
		{
			title: 'Mã phiếu',
			dataIndex: 'PaymentCode',
			key: 'code',
			width: 140,
			render: (text) => <a className="font-bold text-gray-700">{text}</a>,
		},
		{
			title: 'Loại & Tham chiếu',
			key: 'ref',
			width: 200,
			render: (_, record) => (
				<div className="flex flex-col gap-1">
					<div>{getRefTypeTag(record.ReferenceType)}</div>
					<Space size={4} className="text-xs text-gray-500">
						<FileTextOutlined /> {record.ReferenceID}
					</Space>
				</div>
			),
		},
		{
			title: 'Đối tác',
			dataIndex: 'PartnerName',
			key: 'partner',
			render: (text) => <span className="font-medium">{text}</span>
		},
		{
			title: 'Số tiền',
			key: 'amount',
			align: 'right',
			render: (_, record) => {
				const expense = isExpense(record.ReferenceType);
				return (
					<span className={`font-bold text-base ${expense ? 'text-red-600' : 'text-green-600'}`}>
						{expense ? '-' : '+'}{formatCurrency(record.Amount)}
					</span>
				);
			}
		},
		{
			title: 'PTTT',
			dataIndex: 'PaymentMethod',
			key: 'method',
			align: 'center',
			render: (method) => <Tag>{method}</Tag>
		},
		{
			title: 'Trạng thái',
			dataIndex: 'Status',
			key: 'status',
			align: 'center',
			render: (status) => getStatusTag(status)
		},
		{
			title: 'Ngày GD',
			dataIndex: 'PaymentDate',
			key: 'date',
			width: 150,
			render: (date) => <span className="text-gray-500">{date}</span>
		}
	];

	return (
		<div className="w-full">
			{/* HEADER */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
				<div>
					<h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
						<WalletOutlined /> Quản lý Thu Chi
					</h1>
					<p className="text-gray-500 mt-1">Theo dõi dòng tiền ra vào từ các hoạt động kinh doanh</p>
				</div>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					className="bg-blue-600 shadow-md"
					onClick={() => setIsModalOpen(true)}
				>
					Tạo phiếu Thu/Chi
				</Button>
			</div>

			{/* FINANCE DASHBOARD */}
			<Row gutter={16} className="mb-6">
				<Col span={24} md={8}>
					<Card bordered={false} className="shadow-sm bg-green-50 border border-green-100">
						<Statistic
							title="Tổng Thu (Tháng này)"
							value={560000000}
							precision={0}
							valueStyle={{ color: '#3f8600', fontWeight: 'bold' }}
							prefix={<ArrowUpOutlined />}
							suffix="₫"
						/>
					</Card>
				</Col>
				<Col span={24} md={8}>
					<Card bordered={false} className="shadow-sm bg-red-50 border border-red-100">
						<Statistic
							title="Tổng Chi (Tháng này)"
							value={250000000}
							precision={0}
							valueStyle={{ color: '#cf1322', fontWeight: 'bold' }}
							prefix={<ArrowDownOutlined />}
							suffix="₫"
						/>
					</Card>
				</Col>
				<Col span={24} md={8}>
					<Card bordered={false} className="shadow-sm bg-blue-50 border border-blue-100">
						<Statistic
							title="Lợi nhuận ròng (Tạm tính)"
							value={310000000}
							precision={0}
							valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
							prefix={<DollarOutlined />}
							suffix="₫"
						/>
					</Card>
				</Col>
			</Row>

			{/* FILTER */}
			<Card className="mb-6 shadow-sm" bordered={false} bodyStyle={{ padding: '16px' }}>
				<Row gutter={[16, 16]}>
					<Col xs={24} md={6}>
						<RangePicker className="w-full" />
					</Col>
					<Col xs={12} md={4}>
						<Select
							placeholder="Loại giao dịch"
							allowClear
							className="w-full"
							options={[
								{ label: 'Thu (Bán hàng/Sửa chữa)', value: 'INCOME' },
								{ label: 'Chi (Nhập hàng)', value: 'EXPENSE' },
							]}
						/>
					</Col>
					<Col xs={12} md={4}>
						<Select
							placeholder="Hình thức TT"
							allowClear
							className="w-full"
							options={[
								{ label: 'Tiền mặt', value: 'CASH' },
								{ label: 'Chuyển khoản', value: 'BANK' },
							]}
						/>
					</Col>
					<Col xs={24} md={10}>
						<Input
							placeholder="Tìm theo Mã phiếu, Khách hàng, Mã đơn..."
							prefix={<SearchOutlined className="text-gray-400" />}
						/>
					</Col>
				</Row>
			</Card>

			{/* TABLE */}
			<Card className="shadow-sm" bordered={false} bodyStyle={{ padding: 0 }}>
				<Table
					columns={columns}
					dataSource={data}
					rowKey="PaymentID"
					loading={loading}
					pagination={{ pageSize: 10 }}
				/>
			</Card>

			{/* MODAL CREATE PAYMENT */}
			<Modal
				title="Tạo phiếu Thu / Chi"
				open={isModalOpen}
				onOk={handleCreate}
				onCancel={() => setIsModalOpen(false)}
				width={600}
				okText="Tạo phiếu"
				cancelText="Hủy"
			>
				<Form form={form} layout="vertical" className="mt-4">
					<Form.Item name="Type" label="Loại giao dịch" rules={[{ required: true }]}>
						<Radio.Group>
							<Radio.Button value="INCOME" className="text-green-600 font-medium">Phiếu Thu</Radio.Button>
							<Radio.Button value="EXPENSE" className="text-red-600 font-medium">Phiếu Chi</Radio.Button>
						</Radio.Group>
					</Form.Item>

					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name="ReferenceType" label="Nguồn gốc" rules={[{ required: true }]}>
								<Select placeholder="Chọn loại đơn">
									<Select.Option value="SALES_ORDER">Đơn bán hàng</Select.Option>
									<Select.Option value="REPAIR">Phiếu sửa chữa</Select.Option>
									<Select.Option value="PURCHASE_ORDER">Đơn nhập hàng</Select.Option>
									<Select.Option value="OTHER">Khác</Select.Option>
								</Select>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="ReferenceID" label="Mã đơn tham chiếu">
								<Input placeholder="VD: SO-2024-001" />
							</Form.Item>
						</Col>
					</Row>

					<Row gutter={16}>
						<Col span={12}>
							<Form.Item name="Amount" label="Số tiền" rules={[{ required: true }]}>
								<Input prefix="₫" type="number" className="w-full" />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item name="PaymentMethod" label="Phương thức" rules={[{ required: true }]}>
								<Select>
									<Select.Option value="CASH">Tiền mặt</Select.Option>
									<Select.Option value="BANK_TRANSFER">Chuyển khoản</Select.Option>
								</Select>
							</Form.Item>
						</Col>
					</Row>

					<Form.Item name="Notes" label="Ghi chú / Diễn giải">
						<TextArea rows={3} />
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default PaymentList;