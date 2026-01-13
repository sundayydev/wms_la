import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Typography,
    Tag,
    Space,
    message,
    Breadcrumb,
    Skeleton,
    Empty,
    Row,
    Col,
    Statistic,
    Popconfirm,
    Input,
} from 'antd';
import {
    ArrowLeftOutlined,
    EditOutlined,
    DownloadOutlined,
    ShareAltOutlined,
    DeleteOutlined,
    PlayCircleOutlined,
    CopyOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    UserOutlined,
    CloudDownloadOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { IoWarningOutline } from 'react-icons/io5';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaRegFilePdf } from 'react-icons/fa';
import { FiVideo, FiTool, FiDownload, FiGlobe, FiUsers } from 'react-icons/fi';
import dayjs from 'dayjs';
import knowledgeBaseService, {
    type KnowledgeBaseResultDto,
    type ContentType,
    type AccessScope,
} from '../../../services/knowledgeBase.service';

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// ENUMS MAPPING (Backend may return numbers)
// ============================================================================

const CONTENT_TYPE_MAP: Record<number, ContentType> = {
    0: 'DOCUMENT',
    1: 'VIDEO',
    2: 'DRIVER',
    3: 'FIRMWARE',
};

const ACCESS_SCOPE_MAP: Record<number, AccessScope> = {
    0: 'PUBLIC',
    1: 'INTERNAL',
};

const getContentType = (value: any): ContentType => {
    if (typeof value === 'string') return value as ContentType;
    return CONTENT_TYPE_MAP[value as number] || 'DOCUMENT';
};

const getAccessScope = (value: any): AccessScope => {
    if (typeof value === 'string') return value as AccessScope;
    return ACCESS_SCOPE_MAP[value as number] || 'PUBLIC';
};

// ============================================================================
// CONFIGS
// ============================================================================

const CONTENT_TYPE_CONFIG: Record<ContentType, {
    label: string;
    color: string;
    bgColor: string;
    icon: React.ReactNode;
    iconSmall: React.ReactNode;
    description: string;
}> = {
    DOCUMENT: {
        label: 'Tài liệu',
        color: '#1890ff',
        bgColor: 'bg-blue-50',
        icon: <FaRegFilePdf style={{ fontSize: 28 }} />,
        iconSmall: <FaRegFilePdf className='text-[20px] flex justify-center' />,
        description: 'PDF, Word, Excel...',
    },
    VIDEO: {
        label: 'Video',
        color: '#f5222d',
        bgColor: 'bg-red-50',
        icon: <FiVideo style={{ fontSize: 28 }} />,
        iconSmall: <FiVideo className='text-[20px] flex justify-center' />,
        description: 'Video hướng dẫn',
    },
    DRIVER: {
        label: 'Driver',
        color: '#52c41a',
        bgColor: 'bg-green-50',
        icon: <FiTool style={{ fontSize: 28 }} />,
        iconSmall: <FiTool className='text-[20px] flex justify-center' />,
        description: 'Phần mềm điều khiển',
    },
    FIRMWARE: {
        label: 'Firmware',
        color: '#722ed1',
        bgColor: 'bg-purple-50',
        icon: <FiDownload style={{ fontSize: 28 }} />,
        iconSmall: <FiDownload className='text-[20px] flex justify-center' />,
        description: 'Phần mềm cập nhật',
    },
};

const ACCESS_SCOPE_CONFIG: Record<AccessScope, {
    label: string;
    color: string;
    icon: React.ReactNode;
    iconSmall: React.ReactNode;
    description: string;
}> = {
    PUBLIC: {
        label: 'Công khai',
        color: '#52c41a',
        icon: <FiGlobe style={{ fontSize: 24 }} />,
        iconSmall: <FiGlobe className='text-[20px] flex justify-center' />,
        description: 'Ai cũng có thể xem và tải xuống',
    },
    INTERNAL: {
        label: 'Nội bộ',
        color: '#fa8c16',
        icon: <FiUsers style={{ fontSize: 24 }} />,
        iconSmall: <FiUsers className='text-[20px] flex justify-center' />,
        description: 'Chỉ nhân viên nội bộ mới xem được',
    },
};

const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// Helper: Extract YouTube video ID from URL
const getYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const KnowledgeBaseDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [item, setItem] = useState<KnowledgeBaseResultDto | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch data
    useEffect(() => {
        if (id) {
            fetchDetail();
        }
    }, [id]);

    const fetchDetail = async () => {
        if (!id) return;

        setLoading(true);
        try {
            const response = await knowledgeBaseService.getKnowledgeBaseById(id);
            if (response.success) {
                setItem(response.data);
            } else {
                message.error('Không tìm thấy tài liệu');
                navigate('/admin/catalog/knowledge-base');
            }
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra');
            navigate('/admin/catalog/knowledge-base');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!item) return;

        try {
            const contentType = getContentType(item.contentType);
            if (contentType === 'VIDEO') {
                if (item.externalVideoURL) {
                    window.open(item.externalVideoURL, '_blank');
                }
                return;
            }

            message.loading({ content: 'Đang tải xuống...', key: 'download' });
            await knowledgeBaseService.downloadKnowledgeBase(item.knowledgeID);
            message.success({ content: 'Tải xuống thành công!', key: 'download' });
        } catch (error: any) {
            message.error({ content: error.message || 'Không thể tải xuống', key: 'download' });
        }
    };

    const handleDelete = async () => {
        if (!item) return;

        try {
            const response = await knowledgeBaseService.deleteKnowledgeBase(item.knowledgeID);
            if (response.success) {
                message.success('Đã xóa tài liệu');
                navigate('/admin/catalog/knowledge-base');
            } else {
                message.error(response.message || 'Không thể xóa');
            }
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra khi xóa');
        }
    };

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        message.success('Đã sao chép link!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="bg-white border-b shadow-sm">
                    <div className="py-4 px-4 mx-auto">
                        <Skeleton active paragraph={{ rows: 2 }} />
                    </div>
                </div>
                <div className="mx-auto px-6 mt-6">
                    <Skeleton active paragraph={{ rows: 10 }} />
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Empty description="Không tìm thấy tài liệu" />
            </div>
        );
    }

    const contentType = getContentType(item.contentType);
    const scope = getAccessScope(item.scope);
    const typeConfig = CONTENT_TYPE_CONFIG[contentType];
    const scopeConfig = ACCESS_SCOPE_CONFIG[scope];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm">
                <div className="py-4 px-4 mx-auto">
                    <Breadcrumb
                        className="mb-3"
                        items={[
                            { title: <Link to="/admin/catalog/knowledge-base">Kho tri thức</Link> },
                            { title: item.title },
                        ]}
                    />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate('/admin/catalog/knowledge-base')}
                            />
                            <div>
                                <Title level={4} className="m-0">{item.title}</Title>
                                <Text type="secondary">{typeConfig.description}</Text>
                            </div>
                        </div>

                        <Space>
                            <Button
                                icon={<EditOutlined />}
                                onClick={() => navigate(`/admin/catalog/knowledge-base/edit/${item.knowledgeID}`)}
                            >
                                Chỉnh sửa
                            </Button>
                            <Button
                                type="primary"
                                icon={contentType === 'VIDEO' ? <PlayCircleOutlined /> : <DownloadOutlined />}
                                onClick={handleDownload}
                                className="bg-blue-600"
                            >
                                {contentType === 'VIDEO' ? 'Xem video' : 'Tải xuống'}
                            </Button>
                            <Popconfirm
                                title="Xác nhận xóa"
                                description={`Bạn có chắc muốn xóa tài liệu "${item.title}"?`}
                                onConfirm={handleDelete}
                                okText="Xóa"
                                cancelText="Hủy"
                                okType="danger"
                            >
                                <Button danger icon={<DeleteOutlined />}>
                                    Xóa
                                </Button>
                            </Popconfirm>
                        </Space>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-6 mt-6">
                {/* Stats Summary */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={12} sm={6}>
                        <Card bordered={false} className="text-center shadow-sm h-full py-2">
                            <Statistic
                                title="Loại nội dung"
                                value={typeConfig.label}
                                valueStyle={{
                                    color: typeConfig.color,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                                prefix={typeConfig.iconSmall}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card bordered={false} className="text-center shadow-sm h-full py-2">
                            <Statistic
                                title="Quyền truy cập"
                                value={scopeConfig.label}
                                valueStyle={{
                                    color: scopeConfig.color,
                                    fontSize: 16,
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                                prefix={scopeConfig.iconSmall}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card bordered={false} className="text-center shadow-sm h-full py-2">
                            <Statistic
                                title="Lượt chia sẻ"
                                value={item.shareCount || 0}
                                valueStyle={{ fontSize: 16, color: '#1890ff' }}
                                prefix={<ShareAltOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card bordered={false} className="text-center shadow-sm h-full py-2">
                            <Statistic
                                title="Tổng tải xuống"
                                value={item.totalDownloads || 0}
                                valueStyle={{ fontSize: 16, color: '#52c41a' }}
                                prefix={<CloudDownloadOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* Main Content */}
                <Row gutter={24}>
                    <Col xs={24} lg={16}>
                        <div className="space-y-6">
                            {/* Description */}
                            {item.description && (
                                <Card
                                    title={<span><FileTextOutlined className="text-indigo-500 mr-2" />Mô tả</span>}
                                    className="shadow-sm"
                                >
                                    <Paragraph className="text-gray-700 whitespace-pre-wrap">{item.description}</Paragraph>
                                </Card>
                            )}

                            {/* File Info */}
                            {item.originalFileName && (
                                <Card
                                    title={<span><FileTextOutlined className="text-blue-500 mr-2" />Thông tin file</span>}
                                    className="shadow-sm"
                                >
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-500 font-medium">Tên file:</span>
                                            <span className="font-semibold text-gray-800">{item.originalFileName}</span>
                                        </div>
                                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                            <span className="text-gray-500 font-medium">Kích thước:</span>
                                            <span className="text-gray-700">{formatFileSize(item.fileSize)}</span>
                                        </div>
                                        {item.mimeType && (
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-500 font-medium">Loại file:</span>
                                                <Tag color="blue">{item.mimeType}</Tag>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}

                            {/* Video Preview */}
                            {contentType === 'VIDEO' && item.externalVideoURL && (
                                <Card
                                    title={<span><PlayCircleOutlined className="text-red-500 mr-2" />Video</span>}
                                    className="shadow-sm"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={item.externalVideoURL}
                                                readOnly
                                                addonBefore={<EyeOutlined />}
                                                addonAfter={
                                                    <CopyOutlined
                                                        className="cursor-pointer hover:text-blue-500"
                                                        onClick={() => handleCopyLink(item.externalVideoURL!)}
                                                    />
                                                }
                                            />
                                        </div>

                                        {/* YouTube Preview */}
                                        {getYoutubeVideoId(item.externalVideoURL) && (
                                            <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                                                <div className="bg-gray-100 px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                                                    <FiVideo className="text-red-500" />
                                                    Xem trước video
                                                </div>
                                                <div className="aspect-video">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(item.externalVideoURL)}`}
                                                        title="YouTube video preview"
                                                        frameBorder="0"
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                        allowFullScreen
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </Col>

                    {/* Sidebar */}
                    <Col xs={24} lg={8}>
                        <div className="space-y-6">
                            {/* Status Card */}
                            <Card
                                title={<span><EyeOutlined className="text-purple-500 mr-2" />Trạng thái</span>}
                                className="shadow-sm"
                            >
                                <div className="text-center py-4">
                                    <Tag
                                        color={item.processStatus === 'READY' ? 'green' : item.processStatus === 'PROCESSING' ? 'blue' : 'orange'}
                                        style={{ fontSize: 16, padding: '8px 16px' }}
                                    >
                                        {item.processStatus}
                                    </Tag>
                                    <div className="text-xs text-gray-400 mt-2">
                                        {item.processStatus === 'READY' ? 'Tài liệu sẵn sàng sử dụng' : 'Đang xử lý...'}
                                    </div>
                                </div>
                            </Card>

                            {/* Metadata */}
                            <Card
                                title={<span><ClockCircleOutlined className="text-gray-500 mr-2" />Thông tin</span>}
                                className="shadow-sm"
                            >
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-500">
                                            <UserOutlined className="mr-1" />Người tải:
                                        </span>
                                        <span className="font-medium">{item.createdByUserName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <span className="text-gray-500">
                                            <ClockCircleOutlined className="mr-1" />Ngày tạo:
                                        </span>
                                        <span>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                                    </div>
                                    {item.updatedAt && (
                                        <div className="flex justify-between items-center py-2">
                                            <span className="text-gray-500">
                                                <ClockCircleOutlined className="mr-1" />Cập nhật:
                                            </span>
                                            <span>{dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm')}</span>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            {/* Quick Actions */}
                            <Card
                                title={
                                    <span className="flex items-center text-amber-700 font-semibold">
                                        <IoWarningOutline className="mr-2" size={24} />
                                        Thao tác nhanh
                                    </span>
                                }
                                className="shadow-sm border border-amber-200 bg-amber-50"
                            >
                                <Space direction="vertical" className="w-full" size="middle">
                                    {contentType !== 'VIDEO' && (
                                        <Button
                                            type="dashed"
                                            icon={<ShareAltOutlined />}
                                            onClick={() => navigate(`/admin/catalog/knowledge-base/share/${item.knowledgeID}`)}
                                            block
                                        >
                                            Tạo link chia sẻ
                                        </Button>
                                    )}
                                    <Button
                                        type="dashed"
                                        icon={<DownloadOutlined />}
                                        onClick={handleDownload}
                                        block
                                    >
                                        {contentType === 'VIDEO' ? 'Xem ngay' : 'Tải xuống'}
                                    </Button>
                                </Space>
                            </Card>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default KnowledgeBaseDetail;
