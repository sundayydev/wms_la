import React, { useState, useMemo } from 'react';
import {
    Table,
    Card,
    Tag,
    Button,
    Input,
    DatePicker,
    Select,
    Space,
    Tooltip,
    Typography,
    Row,
    Col,
    Statistic,
    message,
    Dropdown,
    Badge,
    Modal,
    Avatar,
    Empty,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    EyeOutlined,
    PrinterOutlined,
    FileExcelOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    SendOutlined,
    FileTextOutlined,
    StopOutlined,
    CopyOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { FaFileInvoiceDollar, FaUserTie } from 'react-icons/fa';

const { RangePicker } = DatePicker;
const { Text } = Typography;

// ============================================================================
// TYPES
// ============================================================================

type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

interface QuotationItem {
    itemId: string;
    sku: string;
    componentName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    discount: number;
}

interface Quotation {
    quotationId: string;
    quotationCode: string;
    customerId: string;
    customerName: string;
    customerPhone?: string;
    createdDate: string;
    validTo: string;
    status: QuotationStatus;
    items: QuotationItem[];
    subTotal: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    createdByUserId: string;
    createdByName: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// STATUS CONFIG
// ============================================================================

const QUOTATION_STATUS_CONFIG: Record<QuotationStatus, { label: string; color: string; icon: React.ReactNode; bgColor: string }> = {
    DRAFT: { label: 'Bản nháp', color: 'default', icon: <FileTextOutlined />, bgColor: 'bg-gray-50' },
    SENT: { label: 'Đã gửi', color: 'processing', icon: <SendOutlined />, bgColor: 'bg-blue-50' },
    ACCEPTED: { label: 'Đã chấp nhận', color: 'success', icon: <CheckCircleOutlined />, bgColor: 'bg-green-50' },
    REJECTED: { label: 'Đã từ chối', color: 'error', icon: <CloseCircleOutlined />, bgColor: 'bg-red-50' },
    EXPIRED: { label: 'Hết hạn', color: 'warning', icon: <StopOutlined />, bgColor: 'bg-yellow-50' },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockQuotations: Quotation[] = [
    {
        quotationId: 'q-001',
        quotationCode: 'Q-2024-001',
        customerId: 'cust-1',
        customerName: 'Công ty TNHH ABC',
        customerPhone: '0901234567',
        createdDate: '2024-12-28T10:00:00',
        validTo: '2025-01-28T10:00:00',
        status: 'SENT',
        items: [
            { itemId: 'i-1', sku: 'MOBY-M63-V2', componentName: 'Máy PDA M63', quantity: 5, unitPrice: 5500000, totalPrice: 27500000, discount: 0 },
        ],
        subTotal: 27500000,
        taxAmount: 2750000,
        discountAmount: 0,
        totalAmount: 30250000,
        createdByUserId: 'u-1',
        createdByName: 'Nguyễn Văn Kinh Doanh',
        notes: 'Khách hàng quan tâm bảo hành mở rộng',
        createdAt: '2024-12-28T10:00:00',
        updatedAt: '2024-12-28T10:30:00',
    },
    {
        quotationId: 'q-002',
        quotationCode: 'Q-2024-002',
        customerId: 'cust-2',
        customerName: 'Anh Nam - Khách lẻ',
        customerPhone: '0987654321',
        createdDate: '2024-12-29T09:00:00',
        validTo: '2025-01-05T09:00:00',
        status: 'DRAFT',
        items: [],
        subTotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        totalAmount: 0,
        createdByUserId: 'u-1',
        createdByName: 'Nguyễn Văn Kinh Doanh',
        createdAt: '2024-12-29T09:00:00',
        updatedAt: '2024-12-29T09:00:00',
    },
    {
        quotationId: 'q-003',
        quotationCode: 'Q-2024-003',
        customerId: 'cust-3',
        customerName: 'Tập đoàn XYZ',
        customerPhone: '0283999999',
        createdDate: '2024-12-20T14:00:00',
        validTo: '2024-12-30T14:00:00',
        status: 'ACCEPTED',
        items: [
            { itemId: 'i-2', sku: 'ZEBRA-TC21', componentName: 'Zebra TC21', quantity: 50, unitPrice: 12000000, totalPrice: 600000000, discount: 10000000 },
        ],
        subTotal: 600000000,
        taxAmount: 60000000,
        discountAmount: 10000000,
        totalAmount: 650000000,
        createdByUserId: 'u-2',
        createdByName: 'Trần Thị Sale',
        notes: 'Đã chốt đơn, chờ PO',
        createdAt: '2024-12-20T14:00:00',
        updatedAt: '2024-12-25T16:00:00',
    },
    {
        quotationId: 'q-004',
        quotationCode: 'Q-2024-004',
        customerId: 'cust-1',
        customerName: 'Công ty TNHH ABC',
        createdDate: '2024-11-15T08:00:00',
        validTo: '2024-12-15T08:00:00',
        status: 'EXPIRED',
        items: [],
        subTotal: 10000000,
        taxAmount: 1000000,
        discountAmount: 0,
        totalAmount: 11000000,
        createdByUserId: 'u-1',
        createdByName: 'Nguyễn Văn Kinh Doanh',
        createdAt: '2024-11-15T08:00:00',
        updatedAt: '2024-11-15T08:00:00',
    },
    {
        quotationId: 'q-005',
        quotationCode: 'Q-2024-005',
        customerId: 'cust-4',
        customerName: 'Siêu thị BigMart',
        createdDate: '2024-12-29T15:00:00',
        validTo: '2025-01-29T15:00:00',
        status: 'REJECTED',
        items: [],
        subTotal: 50000000,
        taxAmount: 5000000,
        discountAmount: 0,
        totalAmount: 55000000,
        createdByUserId: 'u-2',
        createdByName: 'Trần Thị Sale',
        notes: 'Giá cao hơn đối thủ',
        createdAt: '2024-12-29T15:00:00',
        updatedAt: '2024-12-30T09:00:00',
    }
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const QuotationList: React.FC = () => {
    const navigate = useNavigate();

    // States
    const [loading, setLoading] = useState(false);
    const [data] = useState<Quotation[]>(mockQuotations);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<QuotationStatus | undefined>();
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

    // Statistics
    const stats = useMemo(() => {
        const draft = data.filter(d => d.status === 'DRAFT').length;
        const sent = data.filter(d => d.status === 'SENT').length;
        const accepted = data.filter(d => d.status === 'ACCEPTED').length;
        const totalAmount = data.reduce((sum, d) => sum + d.totalAmount, 0);
        const potentialAmount = data.filter(d => ['DRAFT', 'SENT'].includes(d.status)).reduce((sum, d) => sum + d.totalAmount, 0);

        return { draft, sent, accepted, totalAmount, potentialAmount, total: data.length };
    }, [data]);

    // Filtered Data
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchSearch = !searchText ||
                item.quotationCode.toLowerCase().includes(searchText.toLowerCase()) ||
                item.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
                item.createdByName.toLowerCase().includes(searchText.toLowerCase());

            const matchStatus = !statusFilter || item.status === statusFilter;

            let matchDate = true;
            if (dateRange && dateRange[0] && dateRange[1]) {
                const qDate = dayjs(item.createdDate);
                matchDate = qDate.isAfter(dateRange[0].startOf('day')) && qDate.isBefore(dateRange[1].endOf('day'));
            }

            return matchSearch && matchStatus && matchDate;
        });
    }, [data, searchText, statusFilter, dateRange]);

    // Helpers
    const formatCurrency = (amount?: number) => {
        if (amount === undefined) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('Đã sao chép!');
    };

    // Actions
    const handleViewDetail = (record: Quotation) => {
        message.info(`Xem chi tiết báo giá ${record.quotationCode}`);
        // navigate(`/admin/quotations/${record.quotationId}`);
    };

    const handleDelete = (record: Quotation) => {
        Modal.confirm({
            title: 'Xóa báo giá',
            content: `Bạn có chắc muốn xóa báo giá ${record.quotationCode}?`,
            okText: 'Xóa',
            okButtonProps: { danger: true },
            cancelText: 'Hủy',
            onOk: () => message.success(`Đã xóa báo giá ${record.quotationCode}`),
        });
    };

    const getActionMenuItems = (record: Quotation): MenuProps['items'] => {
        const items: MenuProps['items'] = [
            { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => handleViewDetail(record) },
            { key: 'edit', icon: <EditOutlined />, label: 'Chỉnh sửa' },
            { type: 'divider' },
            { key: 'print', icon: <PrinterOutlined />, label: 'In báo giá' },
            { key: 'send', icon: <SendOutlined />, label: 'Gửi Email' },
            { key: 'copy', icon: <CopyOutlined />, label: 'Sao chép mã', onClick: () => copyToClipboard(record.quotationCode) },
        ];

        if (record.status === 'ACCEPTED') {
            items.push(
                { type: 'divider' },
                { key: 'convert', icon: <RocketOutlined />, label: 'Tạo đơn hàng', className: 'text-blue-600 font-medium' }
            );
        }

        if (['DRAFT', 'SENT', 'EXPIRED', 'REJECTED'].includes(record.status)) {
            items.push(
                { type: 'divider' },
                { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true, onClick: () => handleDelete(record) }
            );
        }

        return items;
    };

    const columns: ColumnsType<Quotation> = [
        {
            title: 'Mã Báo Giá',
            dataIndex: 'quotationCode',
            key: 'code',
            width: 140,
            render: (text, record) => (
                <a className="font-bold text-blue-600 hover:underline" onClick={() => handleViewDetail(record)}>{text}</a>
            ),
        },
        {
            title: 'Khách Hàng',
            key: 'customer',
            width: 250,
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    <Avatar size="small" icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
                    <div>
                        <div className="font-medium text-gray-700">{record.customerName}</div>
                        {record.customerPhone && <div className="text-xs text-gray-400">{record.customerPhone}</div>}
                    </div>
                </div>
            ),
        },
        {
            title: 'Ngày Tạo',
            key: 'dates',
            width: 150,
            render: (_, record) => (
                <div className="text-sm">
                    <div>{dayjs(record.createdDate).format('DD/MM/YYYY')}</div>
                    <div className="text-xs text-gray-400">Hết hạn: {dayjs(record.validTo).format('DD/MM/YYYY')}</div>
                </div>
            ),
        },
        {
            title: 'Tổng Tiền',
            key: 'amount',
            width: 160,
            align: 'right',
            sorter: (a, b) => a.totalAmount - b.totalAmount,
            render: (_, record) => (
                <span className="font-bold text-gray-800">{formatCurrency(record.totalAmount)}</span>
            ),
        },
        {
            title: 'Trạng Thái',
            key: 'status',
            width: 140,
            align: 'center',
            render: (_, record) => {
                const config = QUOTATION_STATUS_CONFIG[record.status];
                return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
            },
        },
        {
            title: 'Người Tạo',
            dataIndex: 'createdByName',
            key: 'createdBy',
            width: 150,
            render: (text) => <span className="text-gray-500">{text}</span>,
        },
        {
            title: '',
            key: 'action',
            width: 60,
            align: 'center',
            fixed: 'right',
            render: (_, record) => (
                <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
                        <FaFileInvoiceDollar className="text-blue-600" />
                        Quản lý Báo Giá
                    </h1>
                    <p className="text-gray-500 mt-1">Tạo và quản lý báo giá gửi khách hàng</p>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />} onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 500); }}>Làm mới</Button>
                    <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/quotations/create')}>Tạo báo giá</Button>
                </Space>
            </div>

            {/* Stats Cards */}
            <Row gutter={[16, 16]} className="mb-6">
                <Col xs={12} sm={6} lg={6}>
                    <Card className="shadow-sm border-l-4 border-l-blue-500" bodyStyle={{ padding: '12px 16px' }}>
                        <Statistic title="Tổng báo giá" value={stats.total} prefix={<FileTextOutlined />} />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={6}>
                    <Card className="shadow-sm border-l-4 border-l-yellow-500" bodyStyle={{ padding: '12px 16px' }}>
                        <Statistic title="Tiềm năng (Đang xử lý)" value={formatCurrency(stats.potentialAmount)} valueStyle={{ fontSize: '18px', fontWeight: 600 }} />
                        <div className="text-xs text-gray-400 mt-1">Draft: {stats.draft} | Đã gửi: {stats.sent}</div>
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={6}>
                    <Card className="shadow-sm border-l-4 border-l-green-500" bodyStyle={{ padding: '12px 16px' }}>
                        <Statistic title="Đã chốt (Thành công)" value={stats.accepted} prefix={<CheckCircleOutlined className="text-green-500" />} groupSeparator="." />
                    </Card>
                </Col>
                <Col xs={12} sm={6} lg={6}>
                    <Card className="shadow-sm border-l-4 border-l-purple-500" bodyStyle={{ padding: '12px 16px' }}>
                        <Statistic title="Tổng giá trị" value={formatCurrency(stats.totalAmount)} valueStyle={{ fontSize: '18px', fontWeight: 600, color: '#722ed1' }} />
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Card className="mb-6 shadow-sm" bodyStyle={{ padding: '16px' }}>
                <Row gutter={[16, 16]}>
                    <Col xs={24} md={8} lg={6}>
                        <Input
                            placeholder="Tìm kiếm mã, khách hàng..."
                            prefix={<SearchOutlined className="text-gray-400" />}
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={12} md={6} lg={4}>
                        <Select
                            placeholder="Trạng thái"
                            allowClear
                            className="w-full"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={Object.entries(QUOTATION_STATUS_CONFIG).map(([key, conf]) => ({ label: conf.label, value: key }))}
                        />
                    </Col>
                    <Col xs={12} md={8} lg={6}>
                        <RangePicker
                            className="w-full"
                            placeholder={['Từ ngày', 'Đến ngày']}
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                        />
                    </Col>
                </Row>
            </Card>

            {/* Table */}
            <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    rowKey="quotationId"
                    loading={loading}
                    pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Tổng ${total} báo giá` }}
                    scroll={{ x: 1000 }}
                />
            </Card>
        </div>
    );
};

export default QuotationList;
