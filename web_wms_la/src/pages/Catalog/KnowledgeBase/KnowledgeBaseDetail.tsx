import React, { useState, useEffect } from 'react';
import {
    Card,
    Button,
    Typography,
    Tag,
    Divider,
    Space,
    message,
    Avatar,
    Popconfirm,
    Input,
    Breadcrumb,
    Skeleton,
    Empty,
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
    LinkOutlined,
    ClockCircleOutlined,
    UserOutlined,
    GlobalOutlined,
    TeamOutlined,
    StopOutlined,
    HomeOutlined,
    FolderOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaRegFilePdf } from 'react-icons/fa';
import { FiVideo, FiTool, FiDownload } from 'react-icons/fi';
import dayjs from 'dayjs';
import knowledgeBaseService, {
    type KnowledgeBaseResultDto,
    type ContentType,
    type AccessScope,
} from '../../../services/knowledgeBase.service';

const { Title, Text, Paragraph } = Typography;

// ============================================================================
// ENUMS MAPPING
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
    return ACCESS_SCOPE_MAP[value as number] || 'INTERNAL';
};

// ============================================================================
// CONFIGS
// ============================================================================

const CONTENT_TYPE_CONFIG: Record<ContentType, {
    label: string;
    color: string;
    icon: React.ReactNode;
    description: string;
}> = {
    DOCUMENT: {
        label: 'Tài liệu',
        color: 'blue',
        icon: <FaRegFilePdf style={{ fontSize: 24 }} />,
        description: 'PDF, Word, Excel...',
    },
    VIDEO: {
        label: 'Video',
        color: 'red',
        icon: <FiVideo style={{ fontSize: 24 }} />,
        description: 'Video hướng dẫn',
    },
    DRIVER: {
        label: 'Driver',
        color: 'green',
        icon: <FiTool style={{ fontSize: 24 }} />,
        description: 'Phần mềm điều khiển',
    },
    FIRMWARE: {
        label: 'Firmware',
        color: 'purple',
        icon: <FiDownload style={{ fontSize: 24 }} />,
        description: 'Phần mềm cập nhật',
    },
};

const ACCESS_LEVEL_CONFIG: Record<AccessScope, {
    label: string;
    color: string;
    icon: React.ReactNode;
    description: string;
}> = {
    PUBLIC: {
        label: 'Công khai',
        color: 'green',
        icon: <GlobalOutlined className="text-green-500" />,
        description: 'Ai cũng xem được',
    },
    INTERNAL: {
        label: 'Nội bộ',
        color: 'orange',
        icon: <TeamOutlined className="text-orange-500" />,
        description: 'Chỉ nhân viên công ty',
    },
};

const formatFileSize = (bytes?: number | null): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// ============================================================================
// COMPONENT
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

    const handleRevokeAllShares = async () => {
        if (!item) return;

        try {
            await knowledgeBaseService.revokeAllShareLinks(item.knowledgeID);
            message.success('Đã hủy tất cả link chia sẻ');
            fetchDetail(); // Refresh
        } catch (error: any) {
            message.error(error.message || 'Có lỗi xảy ra');
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <Skeleton active />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="p-6">
                <Empty description="Không tìm thấy tài liệu" />
            </div>
        );
    }

    const contentType = getContentType(item.contentType);
    const scope = getAccessScope(item.scope);
    const typeConfig = CONTENT_TYPE_CONFIG[contentType];
    const accessConfig = ACCESS_LEVEL_CONFIG[scope];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Breadcrumb
                        items={[
                            { title: <Link to="/admin"><HomeOutlined /> Home</Link> },
                            { title: <Link to="/admin/catalog"><FolderOutlined /> Catalog</Link> },
                            { title: <Link to="/admin/catalog/knowledge-base">Knowledge Base</Link> },
                            { title: item.title },
                        ]}
                    />

                    <div className="flex items-center justify-between mt-4">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/admin/catalog/knowledge-base')}
                        >
                            Quay lại
                        </Button>

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

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Title Card */}
                        <Card className="shadow-sm">
                            <div className="flex items-start gap-4">
                                <Avatar
                                    shape="square"
                                    size={80}
                                    icon={typeConfig.icon}
                                    className="bg-gray-100"
                                    style={{ backgroundColor: typeConfig.color + '20', color: typeConfig.color }}
                                />
                                <div className="flex-1">
                                    <Title level={3} className="m-0 mb-2">{item.title}</Title>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Tag color={typeConfig.color} icon={typeConfig.icon}>
                                            {typeConfig.label}
                                        </Tag>
                                        <Tag color={accessConfig.color} icon={accessConfig.icon}>
                                            {accessConfig.label}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Description */}
                        {item.description && (
                            <Card title="Mô tả" className="shadow-sm">
                                <Paragraph className="text-gray-600">{item.description}</Paragraph>
                            </Card>
                        )}

                        {/* File Info */}
                        {item.originalFileName && (
                            <Card title="Thông tin file" className="shadow-sm">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Tên file:</span>
                                        <span className="font-medium">{item.originalFileName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Kích thước:</span>
                                        <span>{formatFileSize(item.fileSize)}</span>
                                    </div>
                                    {item.mimeType && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Loại file:</span>
                                            <span>{item.mimeType}</span>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        )}

                        {/* Video URL */}
                        {contentType === 'VIDEO' && item.externalVideoURL && (
                            <Card title="Đường dẫn Video" className="shadow-sm">
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={item.externalVideoURL}
                                        readOnly
                                        addonAfter={
                                            <CopyOutlined
                                                className="cursor-pointer"
                                                onClick={() => handleCopyLink(item.externalVideoURL!)}
                                            />
                                        }
                                    />
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Sharing */}
                        <Card title="Chia sẻ" className="shadow-sm">
                            {item.shareCount > 0 ? (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Tag color="blue" icon={<ShareAltOutlined />}>
                                            {item.shareCount} link đang chia sẻ
                                        </Tag>
                                        <Popconfirm
                                            title="Hủy tất cả link chia sẻ?"
                                            onConfirm={handleRevokeAllShares}
                                            okText="Hủy tất cả"
                                            cancelText="Đóng"
                                        >
                                            <Button size="small" danger icon={<StopOutlined />}>
                                                Hủy tất cả
                                            </Button>
                                        </Popconfirm>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Tổng downloads: {item.totalDownloads}
                                    </div>
                                </div>
                            ) : contentType !== 'VIDEO' ? (
                                <Button
                                    type="dashed"
                                    icon={<ShareAltOutlined />}
                                    onClick={() => navigate(`/admin/catalog/knowledge-base/share/${item.knowledgeID}`)}
                                    block
                                >
                                    Tạo link chia sẻ
                                </Button>
                            ) : (
                                <div className="text-gray-500 text-sm">
                                    Video có thể chia sẻ trực tiếp qua link
                                </div>
                            )}
                        </Card>

                        {/* Metadata */}
                        <Card title="Thông tin" className="shadow-sm">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        <UserOutlined className="mr-1" />Người tải lên:
                                    </span>
                                    <span className="font-medium">{item.createdByUserName || 'N/A'}</span>
                                </div>
                                <Divider className="my-2" />
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        <ClockCircleOutlined className="mr-1" />Ngày tạo:
                                    </span>
                                    <span>{dayjs(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}</span>
                                </div>
                                {item.updatedAt && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            <ClockCircleOutlined className="mr-1" />Cập nhật:
                                        </span>
                                        <span>{dayjs(item.updatedAt).format('DD/MM/YYYY HH:mm:ss')}</span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KnowledgeBaseDetail;
