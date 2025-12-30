import React, { useState } from 'react';
import {
    Table,
    Card,
    Button,
    Input,
    Space,
    Tag,
    Typography,
    Tooltip,
    Modal,
    Form,
    InputNumber,
    Select,
    message,
    Tabs,
    Badge,
    Descriptions,
} from 'antd';
import {
    PlusOutlined,
    SearchOutlined,
    ToolOutlined,
    DeleteOutlined,
    EditOutlined,
    ReloadOutlined,
    HistoryOutlined,
    RocketOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

// ============================================================================
// TYPES & MOCK DATA
// ============================================================================

interface RepairPart {
    id: string;
    sku: string;
    name: string;
    category: string;
    quantityInStock: number;
    quantityReserved: number;
    unitPrice: number;
    compatModels: string[]; // Các dòng máy tương thích
    status: 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';
}

const mockParts: RepairPart[] = [
    {
        id: 'p1',
        sku: 'LCD-IP13PM-OLED',
        name: 'Màn hình iPhone 13 Pro Max (OLED Zin)',
        category: 'Màn hình',
        quantityInStock: 5,
        quantityReserved: 1,
        unitPrice: 8500000,
        compatModels: ['iPhone 13 Pro Max'],
        status: 'AVAILABLE',
    },
    {
        id: 'p2',
        sku: 'BAT-SS-S22U',
        name: 'Pin Samsung Galaxy S22 Ultra (Zin)',
        category: 'Pin',
        quantityInStock: 2,
        quantityReserved: 0,
        unitPrice: 1200000,
        compatModels: ['Samsung S22 Ultra'],
        status: 'LOW_STOCK',
    },
    {
        id: 'p3',
        sku: 'CAM-IP14-MAIN',
        name: 'Camera sau iPhone 14 (Chính)',
        category: 'Camera',
        quantityInStock: 0,
        quantityReserved: 0,
        unitPrice: 2500000,
        compatModels: ['iPhone 14', 'iPhone 14 Plus'],
        status: 'OUT_OF_STOCK',
    },
    {
        id: 'p4',
        sku: 'GLS-IP12',
        name: 'Kính lưng iPhone 12 Pro',
        category: 'Vỏ/Kính',
        quantityInStock: 15,
        quantityReserved: 2,
        unitPrice: 500000,
        compatModels: ['iPhone 12 Pro'],
        status: 'AVAILABLE',
    },
];

const mockRequests = [
    {
        id: 'req1',
        repairId: 'R-2024-001',
        technician: 'Trần Kỹ Thuật',
        partName: 'Màn hình iPhone 13 Pro Max (OLED Zin)',
        quantity: 1,
        requestDate: '2024-12-30 09:00',
        status: 'PENDING', // PENDING, APPROVED, REJECTED
    },
    {
        id: 'req2',
        repairId: 'R-2024-005',
        technician: 'Lê Văn Staff',
        partName: 'Pin Samsung Galaxy S22 Ultra (Zin)',
        quantity: 1,
        requestDate: '2024-12-29 14:30',
        status: 'APPROVED',
    },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RepairParts: React.FC = () => {
    const [activeTab, setActiveTab] = useState('inventory');
    const [searchText, setSearchText] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    // State data (giả lập)
    const [parts, setParts] = useState(mockParts);
    const [requests, setRequests] = useState(mockRequests);

    // --- ACTIONS ---

    const handleAddPart = () => {
        setIsModalVisible(true);
        form.resetFields();
    };

    const handleModalOk = () => {
        form.validateFields().then(values => {
            // Logic thêm mới (mock)
            const newPart: RepairPart = {
                id: `p${parts.length + 1}`,
                sku: values.sku,
                name: values.name,
                category: values.category,
                quantityInStock: values.quantity,
                quantityReserved: 0,
                unitPrice: values.price,
                compatModels: values.compatModels || [],
                status: values.quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK',
            };
            setParts([...parts, newPart]);
            setIsModalVisible(false);
            message.success('Đã thêm linh kiện mới');
        });
    };

    const handleApproveRequest = (id: string) => {
        const newReqs = requests.map(r => r.id === id ? { ...r, status: 'APPROVED' } : r);
        setRequests(newReqs as any);
        message.success('Đã duyệt yêu cầu xuất linh kiện');
    };

    const handleRejectRequest = (id: string) => {
        const newReqs = requests.map(r => r.id === id ? { ...r, status: 'REJECTED' } : r);
        setRequests(newReqs as any);
        message.info('Đã từ chối yêu cầu');
    };


    // --- COLUMNS ---

    const columnsInventory: ColumnsType<RepairPart> = [
        {
            title: 'Mã LK (SKU)',
            dataIndex: 'sku',
            key: 'sku',
            render: (text) => <Text strong>{text}</Text>,
        },
        {
            title: 'Tên linh kiện',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: 'Tương thích',
            dataIndex: 'compatModels',
            key: 'compatModels',
            render: (models: string[]) => (
                <Space size={[0, 4]} wrap>
                    {models.slice(0, 2).map(m => <Tag key={m}>{m}</Tag>)}
                    {models.length > 2 && <Tag>+{models.length - 2}</Tag>}
                </Space>
            ),
        },
        {
            title: 'Giá vốn',
            dataIndex: 'unitPrice',
            key: 'unitPrice',
            render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
        },
        {
            title: 'Tồn kho',
            key: 'stock',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong className={record.quantityInStock === 0 ? 'text-red-500' : ''}>
                        {record.quantityInStock}
                    </Text>
                    <Text type="secondary" className="text-xs">
                        (Đang giữ: {record.quantityReserved})
                    </Text>
                </Space>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                let text = 'N/A';
                switch (status) {
                    case 'AVAILABLE': color = 'success'; text = 'Sẵn sàng'; break;
                    case 'LOW_STOCK': color = 'warning'; text = 'Sắp hết'; break;
                    case 'OUT_OF_STOCK': color = 'error'; text = 'Hết hàng'; break;
                }
                return <Badge status={status === 'AVAILABLE' ? 'success' : status === 'LOW_STOCK' ? 'warning' : 'error'} text={text} />;
            },
        },
        {
            title: '',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<HistoryOutlined />} title="Lịch sử nhập xuất" />
                    <Button type="text" icon={<EditOutlined />} title="Sửa" />
                </Space>
            )
        }
    ];

    const columnsRequests: ColumnsType<any> = [
        {
            title: 'Mã yêu cầu',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Mã sửa chữa',
            dataIndex: 'repairId',
            key: 'repairId',
            render: (text) => <a href="#">{text}</a>
        },
        {
            title: 'Kỹ thuật viên',
            dataIndex: 'technician',
            key: 'technician',
        },
        {
            title: 'Linh kiện yêu cầu',
            dataIndex: 'partName',
            key: 'partName',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
        },
        {
            title: 'Thời gian',
            dataIndex: 'requestDate',
            key: 'requestDate',
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                if (status === 'PENDING') return <Tag color="orange">Chờ duyệt</Tag>;
                if (status === 'APPROVED') return <Tag color="green">Đã duyệt</Tag>;
                if (status === 'REJECTED') return <Tag color="red">Từ chối</Tag>;
                return status;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                record.status === 'PENDING' && (
                    <Space>
                        <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleApproveRequest(record.id)}>Duyệt</Button>
                        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleRejectRequest(record.id)}>Từ chối</Button>
                    </Space>
                )
            )
        }
    ];

    return (
        <div className="w-full">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <Title level={3} className="m-0 flex items-center gap-2">
                        <ToolOutlined /> Quản lý Linh Kiện Sửa Chữa
                    </Title>
                    <Text type="secondary">Kho linh kiện chuyên dùng cho dịch vụ sửa chữa & Bảo hành</Text>
                </div>
                <Space>
                    <Button icon={<ReloadOutlined />}>Làm mới</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPart}>Nhập linh kiện</Button>
                </Space>
            </div>

            <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                    {/* TAB 1: KHO LINH KIỆN */}
                    <TabPane tab="Kho linh kiện" key="inventory">
                        <div className="mb-4 flex gap-4">
                            <Input placeholder="Tìm kiếm tên, SKU, dòng máy..." prefix={<SearchOutlined />} className="max-w-md" />
                            <Select placeholder="Danh mục" style={{ width: 150 }} allowClear>
                                <Option value="screen">Màn hình</Option>
                                <Option value="battery">Pin</Option>
                                <Option value="camera">Camera</Option>
                            </Select>
                            <Select placeholder="Tương thích" style={{ width: 150 }} allowClear>
                                <Option value="iphone">iPhone</Option>
                                <Option value="samsung">Samsung</Option>
                            </Select>
                        </div>
                        <Table
                            dataSource={parts}
                            columns={columnsInventory}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                        />
                    </TabPane>

                    {/* TAB 2: YÊU CẦU XUẤT KHO */}
                    <TabPane tab={<Badge count={requests.filter(r => r.status === 'PENDING').length} offset={[10, 0]}>Yêu cầu xuất kho</Badge>} key="requests">
                        <Table
                            dataSource={requests}
                            columns={columnsRequests}
                            rowKey="id"
                        />
                    </TabPane>
                </Tabs>
            </Card>

            {/* MODAL THÊM LINH KIỆN */}
            <Modal
                title="Nhập kho linh kiện mới"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Lưu kho"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Tên linh kiện" rules={[{ required: true }]}>
                        <Input placeholder="VD: Pin iPhone 14 Pro Max" />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="sku" label="Mã SKU" rules={[{ required: true }]}>
                            <Input placeholder="VD: BAT-IP14PM" />
                        </Form.Item>
                        <Form.Item name="category" label="Danh mục" rules={[{ required: true }]}>
                            <Select>
                                <Option value="Màn hình">Màn hình</Option>
                                <Option value="Pin">Pin</Option>
                                <Option value="Camera">Camera</Option>
                                <Option value="Vỏ/Kính">Vỏ/Kính</Option>
                                <Option value="IC/Main">IC/Mainboard</Option>
                            </Select>
                        </Form.Item>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="quantity" label="Số lượng nhập" rules={[{ required: true }]}>
                            <InputNumber min={1} className="w-full" />
                        </Form.Item>
                        <Form.Item name="price" label="Giá vốn (VNĐ)" rules={[{ required: true }]}>
                            <InputNumber min={0} className="w-full" step={1000} formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
                        </Form.Item>
                    </div>
                    <Form.Item name="compatModels" label="Dòng máy tương thích">
                        <Select mode="tags" placeholder="Nhập dòng máy và nhấn Enter (VD: iPhone 13)">
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RepairParts;
