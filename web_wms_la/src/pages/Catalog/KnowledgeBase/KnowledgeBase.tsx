import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  Modal,
  Form,
  Drawer,
  Divider,
  message,
  Empty,
  Avatar,
  Tooltip,
  Dropdown,
  Table,
  Upload,
  Popconfirm,
  Spin,
  InputNumber,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  LinkOutlined,
  EyeOutlined,
  MoreOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CopyOutlined,
  DownloadOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ToolOutlined,
  LockOutlined,
  GlobalOutlined,
  TeamOutlined,
  PlayCircleOutlined,
  ShareAltOutlined,
  StopOutlined,
  InboxOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import knowledgeBaseService, {
  type KnowledgeBaseResultDto,
  type KnowledgeBaseUploadDto,
  type ContentType,
  type AccessScope,
  type AccessLevel, // Alias for backward compatibility
  type CreateShareLinkDto,
  type ShareLinkResultDto,
  type KnowledgeBaseStatisticsDto,
} from '@/services/knowledgeBase.service';
import componentsService from '@/services/components.service';
import { FiFile, FiVideo, FiTool, FiDownload, FiShare2, FiDatabase, FiLayers } from 'react-icons/fi';
import { FaRegFilePdf } from "react-icons/fa";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

// ============================================================================
// TYPES
// ============================================================================

// Component cho dropdown chọn sản phẩm
interface ComponentOption {
  componentId: string;
  sku: string;
  componentName: string;
  brand?: string;
}

// ============================================================================
// ENUMS MAPPING - Backend returns numbers, not strings
// ============================================================================

// ContentType: DOCUMENT=0, VIDEO=1, DRIVER=2, FIRMWARE=3
const CONTENT_TYPE_MAP: Record<number, ContentType> = {
  0: 'DOCUMENT',
  1: 'VIDEO',
  2: 'DRIVER',
  3: 'FIRMWARE',
};

// AccessScope: PUBLIC=0, INTERNAL=1
const ACCESS_SCOPE_MAP: Record<number, AccessScope> = {
  0: 'PUBLIC',
  1: 'INTERNAL',
};

// FileStatus: PENDING=0, PROCESSING=1, READY=2, FAILED=3
const FILE_STATUS_MAP: Record<number, string> = {
  0: 'PENDING',
  1: 'PROCESSING',
  2: 'READY',
  3: 'FAILED',
};

// Helper to safely get enum string from number
const getContentType = (value: any): ContentType => {
  if (typeof value === 'string') return value as ContentType;
  return CONTENT_TYPE_MAP[value as number] || 'DOCUMENT';
};

const getAccessScope = (value: any): AccessScope => {
  if (typeof value === 'string') return value as AccessScope;
  return ACCESS_SCOPE_MAP[value as number] || 'INTERNAL';
};

const getFileStatus = (value: any): string => {
  if (typeof value === 'string') return value;
  return FILE_STATUS_MAP[value as number] || 'PENDING';
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
    icon: <FaRegFilePdf className="text-blue-500" />,
    description: 'PDF, Word, Excel...'
  },
  VIDEO: {
    label: 'Video',
    color: 'red',
    icon: <VideoCameraOutlined className="text-red-500" />,
    description: 'Youtube, Vimeo...'
  },
  DRIVER: {
    label: 'Driver',
    color: 'green',
    icon: <ToolOutlined className="text-green-500" />,
    description: 'Driver phần cứng'
  },
  FIRMWARE: {
    label: 'Firmware',
    color: 'purple',
    icon: <DownloadOutlined className="text-purple-500" />,
    description: 'Phần mềm cập nhật'
  },
};

const ACCESS_LEVEL_CONFIG: Record<AccessLevel, {
  label: string;
  color: string;
  icon: React.ReactNode;
  description: string;
}> = {
  PUBLIC: {
    label: 'Công khai',
    color: 'green',
    icon: <GlobalOutlined className="text-green-500" />,
    description: 'Ai cũng xem được'
  },
  INTERNAL: {
    label: 'Nội bộ',
    color: 'orange',
    icon: <TeamOutlined className="text-orange-500" />,
    description: 'Chỉ nhân viên công ty'
  },
};

// Removed ROLE_OPTIONS - backend only supports PUBLIC and INTERNAL scope

// Helper function to format file size
const formatFileSize = (bytes?: number | null): string => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const KnowledgeBase: React.FC = () => {

  const navigate = useNavigate();

  // States
  const [data, setData] = useState<KnowledgeBaseResultDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedContentType, setSelectedContentType] = useState<ContentType | 'ALL'>('ALL');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<AccessLevel | 'ALL'>('ALL');
  const [selectedComponent, setSelectedComponent] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [components, setComponents] = useState<ComponentOption[]>([]);
  const [statistics, setStatistics] = useState<KnowledgeBaseStatisticsDto | null>(null);

  // Pagination
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Modal/Drawer states
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeBaseResultDto | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [shareForm] = Form.useForm();
  const [accessLevelValue, setAccessLevelValue] = useState<AccessLevel>('PUBLIC');
  const [contentTypeValue, setContentTypeValue] = useState<ContentType>('DOCUMENT');
  const [uploadFile, setUploadFile] = useState<UploadFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [shareResult, setShareResult] = useState<ShareLinkResultDto | null>(null);
  const [expirationUnit, setExpirationUnit] = useState<'minutes' | 'hours' | 'days'>('days');

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const contentType = selectedContentType === 'ALL' ? undefined : selectedContentType;
      const accessLevel = selectedAccessLevel === 'ALL' ? undefined : selectedAccessLevel;

      const response = await knowledgeBaseService.getAllKnowledgeBase(
        pagination.current,
        pagination.pageSize,
        selectedComponent,
        contentType,
        accessLevel
      );

      if (response.success && response.data) {
        setData(response.data.items || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.totalCount,
        }));
      } else {
        message.error(response.message || 'Không thể tải dữ liệu');
      }
    } catch (error: any) {
      console.error('Error fetching knowledge base:', error);
      message.error(error.message || 'Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, selectedComponent, selectedContentType, selectedAccessLevel]);

  // Fetch components for dropdown
  const fetchComponents = useCallback(async () => {
    try {
      const result = await componentsService.getComponentsForSelect();
      setComponents(result.map(c => ({
        componentId: c.componentId,
        sku: c.sku,
        componentName: c.componentName,
        brand: c.brand,
      })));
    } catch (error) {
      console.error('Error fetching components:', error);
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await knowledgeBaseService.getStatistics();
      if (response.success) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchComponents();
    fetchStatistics();
  }, [fetchComponents, fetchStatistics]);

  // Computed: Filtered data (client-side search)
  const filteredData = useMemo(() => {
    if (!searchText) return data;

    const lowerSearch = searchText.toLowerCase();
    return data.filter(item =>
      item.title.toLowerCase().includes(lowerSearch) ||
      item.description?.toLowerCase().includes(lowerSearch) ||
      item.originalFileName?.toLowerCase().includes(lowerSearch)
    );
  }, [data, searchText]);

  // Stats from API
  const stats = useMemo(() => {
    if (statistics) {
      return {
        total: statistics.totalItems,
        documents: statistics.byContentType?.['DOCUMENT'] || 0,
        videos: statistics.byContentType?.['VIDEO'] || 0,
        drivers: statistics.byContentType?.['DRIVER'] || 0,
        firmwares: statistics.byContentType?.['FIRMWARE'] || 0,
        sharedItems: statistics.sharedItemsCount,
        totalSize: formatFileSize(statistics.totalFileSizeBytes),
      };
    }
    return {
      total: data.length,
      documents: data.filter(d => d.contentType === 'DOCUMENT').length,
      videos: data.filter(d => d.contentType === 'VIDEO').length,
      drivers: data.filter(d => d.contentType === 'DRIVER').length,
      firmwares: data.filter(d => d.contentType === 'FIRMWARE').length,
      sharedItems: data.filter(d => d.shareCount > 0).length,
      totalSize: formatFileSize(data.reduce((sum, d) => sum + (d.fileSize || 0), 0)),
    };
  }, [data, statistics]);

  // Handlers
  const handleViewDetail = async (item: KnowledgeBaseResultDto) => {
    try {
      // Fetch latest data
      const response = await knowledgeBaseService.getKnowledgeBaseById(item.knowledgeID);
      if (response.success) {
        setSelectedItem(response.data);
      } else {
        setSelectedItem(item);
      }
    } catch {
      setSelectedItem(item);
    }
    setDetailDrawerOpen(true);
  };

  const handleOpenContent = (url: string) => {
    window.open(url, '_blank');
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success('Đã sao chép link!');
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setUploading(true);

      const dto: KnowledgeBaseUploadDto = {
        componentID: values.componentId,
        title: values.title,
        description: values.description,
        contentType: values.contentType,
        scope: values.accessLevel, // Map accessLevel to scope
        videoURL: values.videoURL,
      };

      // Get the actual file from uploadFile state
      const file = contentTypeValue === 'VIDEO' ? null : (uploadFile?.originFileObj || null);

      const response = await knowledgeBaseService.uploadKnowledgeBase(file, dto);

      if (response.success) {
        message.success('Đã thêm tài liệu mới');
        setCreateModalOpen(false);
        createForm.resetFields();
        setUploadFile(null);
        setAccessLevelValue('PUBLIC');
        setContentTypeValue('DOCUMENT');
        fetchData();
        fetchStatistics();
      } else {
        message.error(response.message || 'Không thể thêm tài liệu');
      }
    } catch (error: any) {
      console.error('Error creating:', error);
      if (error.errorFields) {
        // Form validation error
        return;
      }
      message.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedItem) return;

    try {
      const values = await editForm.validateFields();
      setUploading(true);

      const dto: KnowledgeBaseUploadDto = {
        componentID: values.componentId,
        title: values.title,
        description: values.description,
        contentType: selectedItem.contentType as ContentType, // Can't change content type
        scope: values.accessLevel, // Map accessLevel to scope
        videoURL: values.videoURL,
      };

      const response = await knowledgeBaseService.updateKnowledgeBase(selectedItem.knowledgeID, dto);

      if (response.success) {
        message.success('Đã cập nhật tài liệu');
        setEditModalOpen(false);
        editForm.resetFields();
        setSelectedItem(response.data);
        fetchData();
      } else {
        message.error(response.message || 'Không thể cập nhật tài liệu');
      }
    } catch (error: any) {
      console.error('Error updating:', error);
      if (error.errorFields) return;
      message.error(error.message || 'Có lỗi xảy ra');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await knowledgeBaseService.deleteKnowledgeBase(id);
      if (response.success) {
        message.success('Đã xóa tài liệu');
        fetchData();
        fetchStatistics();
      } else {
        message.error(response.message || 'Không thể xóa tài liệu');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi xóa');
    }
  };

  const handleDownload = async (item: KnowledgeBaseResultDto) => {
    try {
      const contentType = getContentType(item.contentType);
      if (contentType === 'VIDEO') {
        // For video, open the external video URL
        if (item.externalVideoURL) {
          handleOpenContent(item.externalVideoURL);
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

  const handleCreateShareLink = async () => {
    if (!selectedItem) return;

    try {
      const values = await shareForm.validateFields();

      // Calculate expiration in minutes based on selected unit
      let expirationMinutes = values.expirationValue;
      switch (expirationUnit) {
        case 'hours':
          expirationMinutes = values.expirationValue * 60;
          break;
        case 'days':
          expirationMinutes = values.expirationValue * 24 * 60;
          break;
        default: // minutes
          expirationMinutes = values.expirationValue;
      }

      const dto: CreateShareLinkDto = {
        expirationMinutes,
        maxDownloads: values.maxDownloads || undefined,
      };

      const response = await knowledgeBaseService.createShareLink(selectedItem.knowledgeID, dto);

      if (response.success) {
        setShareResult(response.data);
        message.success('Đã tạo link chia sẻ');
        // Refresh selected item
        handleViewDetail(selectedItem);
      } else {
        message.error(response.message || 'Không thể tạo link chia sẻ');
      }
    } catch (error: any) {
      if (error.errorFields) return;
      message.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const handleRevokeShareLink = async (shareId?: string) => {
    if (!selectedItem || !shareId) return;

    try {
      const response = await knowledgeBaseService.revokeShareLink(shareId);
      if (response.success) {
        message.success('Đã hủy link chia sẻ');
        setShareResult(null);
        // Refresh selected item
        const refreshed = await knowledgeBaseService.getKnowledgeBaseById(selectedItem.knowledgeID);
        if (refreshed.success) {
          setSelectedItem(refreshed.data);
        }
      } else {
        message.error(response.message || 'Không thể hủy link chia sẻ');
      }
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra');
    }
  };

  const openEditModal = () => {
    if (!selectedItem) return;

    editForm.setFieldsValue({
      componentId: selectedItem.componentID,
      title: selectedItem.title,
      description: selectedItem.description,
      accessLevel: selectedItem.scope, // Map scope back to form field
      videoURL: selectedItem.contentType === 'VIDEO' ? selectedItem.externalVideoURL : undefined,
    });
    setAccessLevelValue(selectedItem.scope as AccessLevel);
    setEditModalOpen(true);
  };

  const openShareModal = () => {
    if (!selectedItem) return;
    shareForm.setFieldsValue({
      expirationValue: 7,
      maxDownloads: null,
    });
    setExpirationUnit('days');
    setShareResult(null);
    setShareModalOpen(true);
  };

  // Table Columns
  const columns: ColumnsType<KnowledgeBaseResultDto> = [
    {
      title: 'Tiêu đề',
      key: 'title',
      width: 380,
      render: (_, record) => {
        const contentType = getContentType(record.contentType);
        const typeConfig = CONTENT_TYPE_CONFIG[contentType];

        return (
          <div className="flex items-start gap-3">
            <Avatar
              shape="square"
              size={48}
              src={contentType === 'VIDEO' && record.thumbnailObjectKey ? record.thumbnailObjectKey : undefined}
              icon={!record.thumbnailObjectKey && typeConfig?.icon}
              className="bg-gray-100 shrink-0"
              style={{ backgroundColor: typeConfig?.color + '20' }}
            />
            <div className="min-w-0 flex-1">
              <div
                className="font-medium text-gray-800 line-clamp-1 cursor-pointer hover:text-blue-600"
                onClick={() => navigate(`/admin/catalog/knowledge-base/${record.knowledgeID}`)}
              >
                {record.title}
              </div>
              {record.description && (
                <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                  {record.description}
                </div>
              )}
              {/* Hiển thị file info hoặc video URL */}
              {contentType === 'VIDEO' && record.externalVideoURL ? (
                <div className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                  <LinkOutlined />
                  <span className="truncate">{new URL(record.externalVideoURL).hostname}</span>
                </div>
              ) : record.originalFileName ? (
                <div className="text-xs text-gray-400 mt-1">
                  {record.originalFileName} • {formatFileSize(record.fileSize)}
                </div>
              ) : null}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Loại',
      dataIndex: 'contentType',
      key: 'contentType',
      width: 120,
      align: 'center',
      filters: Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => ({
        text: config.label,
        value: key,
      })),
      onFilter: (value, record) => record.contentType === value,
      render: (_, record) => {
        const contentType = getContentType(record.contentType);
        const config = CONTENT_TYPE_CONFIG[contentType];
        if (!config) return contentType;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        );
      },
    },
    {
      title: 'Quyền truy cập',
      dataIndex: 'scope',
      key: 'scope',
      width: 140,
      align: 'center',
      filters: Object.entries(ACCESS_LEVEL_CONFIG).map(([key, config]) => ({
        text: config.label,
        value: key,
      })),
      onFilter: (value, record) => record.scope === value,
      render: (_, record) => {
        const scope = getAccessScope(record.scope);
        const config = ACCESS_LEVEL_CONFIG[scope];
        if (!config) return scope;
        return (
          <Tooltip title={config.description}>
            <Tag color={config.color} icon={config.icon}>
              {config.label}
            </Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Chia sẻ',
      key: 'sharing',
      width: 100,
      align: 'center',
      render: (_, record) => (
        record.shareCount > 0 ? (
          <Tooltip title={`Tổng downloads: ${record.totalDownloads}`}>
            <Tag color="blue" icon={<ShareAltOutlined />}>
              {record.shareCount} link
            </Tag>
          </Tooltip>
        ) : (
          <Tag>Chưa chia sẻ</Tag>
        )
      ),
    },
    {
      title: 'Người tải lên',
      key: 'uploader',
      width: 150,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <span className="text-gray-600">{record.createdByUserName || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      render: (date) => (
        <div className="text-gray-500 text-xs">
          <div><ClockCircleOutlined className="mr-1" />{dayjs(date).format('DD/MM/YYYY')}</div>
          <div className="text-gray-400">{dayjs(date).format('HH:mm:ss')}</div>
        </div>
      ),
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      sorter: (a, b) => dayjs(a.updatedAt || a.createdAt).unix() - dayjs(b.updatedAt || b.createdAt).unix(),
      render: (date, record) => (
        <div className="text-gray-500 text-xs">
          <div><ClockCircleOutlined className="mr-1" />{dayjs(date || record.createdAt).format('DD/MM/YYYY')}</div>
          <div className="text-gray-400">{dayjs(date || record.createdAt).format('HH:mm:ss')}</div>
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title={getContentType(record.contentType) === 'VIDEO' ? 'Xem video' : 'Tải xuống'}>
            <Button
              type="text"
              icon={getContentType(record.contentType) === 'VIDEO' ? <PlayCircleOutlined className="text-red-500" /> : <DownloadOutlined className="text-blue-500" />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/admin/catalog/knowledge-base/${record.knowledgeID}`) },
                {
                  key: 'copy', icon: <CopyOutlined />, label: 'Sao chép link', onClick: () => {
                    // For video, copy external URL. For files, get download URL
                    if (record.contentType === 'VIDEO' && record.externalVideoURL) {
                      handleCopyLink(record.externalVideoURL);
                    } else {
                      knowledgeBaseService.getDownloadUrl(record.knowledgeID).then(res => {
                        if (res.success) handleCopyLink(res.data.downloadUrl);
                      });
                    }
                  }
                },
                { type: 'divider' },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: 'Xóa',
                  danger: true,
                },
              ],
              onClick: ({ key }) => {
                if (key === 'delete') {
                  Modal.confirm({
                    title: 'Xác nhận xóa',
                    content: `Bạn có chắc muốn xóa tài liệu "${record.title}"?`,
                    okText: 'Xóa',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    onOk: () => handleDelete(record.knowledgeID),
                  });
                }
              },
            }}
            trigger={['click']}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  // Grid Card Component
  const KnowledgeCard: React.FC<{ item: KnowledgeBaseResultDto }> = ({ item }) => {
    const contentType = getContentType(item.contentType);
    const scope = getAccessScope(item.scope);
    const typeConfig = CONTENT_TYPE_CONFIG[contentType];
    const accessConfig = ACCESS_LEVEL_CONFIG[scope];

    if (!typeConfig || !accessConfig) return null;

    return (
      <Card
        hoverable
        className="h-full shadow-sm hover:shadow-lg transition-all duration-300"
        cover={
          <div className="relative h-36 overflow-hidden">
            {contentType === 'VIDEO' && item.thumbnailObjectKey ? (
              <img
                src={item.thumbnailObjectKey}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center bg-linear-to-br from-gray-100 to-gray-200"
                style={{ backgroundColor: typeConfig.color + '10' }}
              >
                <div className="text-5xl" style={{ color: typeConfig.color }}>
                  {typeConfig.icon}
                </div>
              </div>
            )}

            {/* Type badge */}
            <Tag color={typeConfig.color} className="absolute top-2 left-2" icon={typeConfig.icon}>
              {typeConfig.label}
            </Tag>

            {/* Access badge */}
            <Tooltip title={accessConfig.description}>
              <Tag color={accessConfig.color} className="absolute top-2 right-2" icon={accessConfig.icon}>
                {accessConfig.label}
              </Tag>
            </Tooltip>

            {/* Play button for video */}
            {contentType === 'VIDEO' && item.externalVideoURL && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => handleOpenContent(item.externalVideoURL!)}
              >
                <PlayCircleOutlined className="text-5xl text-white" />
              </div>
            )}

            {/* Shared badge */}
            {item.shareCount > 0 && (
              <Tag color="blue" className="absolute bottom-2 left-2" icon={<ShareAltOutlined />}>
                {item.shareCount} link
              </Tag>
            )}
          </div>
        }
        actions={[
          <Tooltip key="download" title={contentType === 'VIDEO' ? 'Xem video' : 'Tải xuống'}>
            <span onClick={() => handleDownload(item)}>
              {contentType === 'VIDEO' ? <PlayCircleOutlined /> : <DownloadOutlined />}
            </span>
          </Tooltip>,
          <Tooltip key="copy" title="Sao chép link">
            <CopyOutlined onClick={() => {
              if (contentType === 'VIDEO' && item.externalVideoURL) {
                handleCopyLink(item.externalVideoURL);
              } else {
                knowledgeBaseService.getDownloadUrl(item.knowledgeID).then(res => {
                  if (res.success) handleCopyLink(res.data.downloadUrl);
                });
              }
            }} />
          </Tooltip>,
          <Dropdown
            key="more"
            menu={{
              items: [
                { key: 'view', icon: <EyeOutlined />, label: 'Xem chi tiết', onClick: () => navigate(`/admin/catalog/knowledge-base/${item.knowledgeID}`) },
                { key: 'delete', icon: <DeleteOutlined />, label: 'Xóa', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'delete') {
                  Modal.confirm({
                    title: 'Xác nhận xóa',
                    content: `Bạn có chắc muốn xóa tài liệu "${item.title}"?`,
                    okText: 'Xóa',
                    okType: 'danger',
                    cancelText: 'Hủy',
                    onOk: () => handleDelete(item.knowledgeID),
                  });
                }
              },
            }}
          >
            <MoreOutlined />
          </Dropdown>,
        ]}
        onClick={() => navigate(`/admin/catalog/knowledge-base/${item.knowledgeID}`)}
      >
        <Card.Meta
          title={<div className="line-clamp-2 font-medium text-gray-800 text-sm">{item.title}</div>}
          description={
            <div className="space-y-2">
              {item.originalFileName && (
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  {formatFileSize(item.fileSize)}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t">
                <span><UserOutlined className="mr-1" />{item.createdByUserName || 'N/A'}</span>
                <span>{dayjs(item.updatedAt).format('DD/MM')}</span>
              </div>
            </div>
          }
        />
      </Card>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            Kho Tri Thức Sản Phẩm
          </h1>
          <p className="text-gray-500 mt-1">
            Quản lý tài liệu, video, driver và firmware cho sản phẩm
          </p>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchData();
              fetchStatistics();
            }}
            loading={loading}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/catalog/knowledge-base/upload')}
            className="bg-blue-600"
          >
            Thêm tài liệu
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm p-1">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-blue-600 text-sm flex items-center justify-center gap-1">
              <FiLayers /> Tổng cộng
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm p-1">
            <div className="text-2xl font-bold text-blue-500">{stats.documents}</div>
            <div className="text-blue-500 text-sm flex items-center justify-center gap-1">
              <FaRegFilePdf /> Tài liệu
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm p-1">
            <div className="text-2xl font-bold text-red-500">{stats.videos}</div>
            <div className="text-red-500 text-sm flex items-center justify-center gap-1">
              <FiVideo /> Video
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm p-1">
            <div className="text-2xl font-bold text-green-500">{stats.drivers}</div>
            <div className="text-green-500 text-sm flex items-center justify-center gap-1">
              <FiTool /> Driver
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm p-1">
            <div className="text-2xl font-bold text-purple-500">{stats.firmwares}</div>
            <div className="text-purple-500 text-sm flex items-center justify-center gap-1">
              <FiDownload /> Firmware
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="text-center shadow-sm p-1">
            <div className="text-2xl font-bold text-cyan-600">{stats.sharedItems}</div>
            <div className="text-cyan-600 text-sm flex items-center justify-center gap-1">
              <FiShare2 /> Đã chia sẻ
            </div>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={6}>
          <Card className="text-center shadow-sm p-1">
            <div className="text-2xl font-bold text-gray-600">{stats.totalSize}</div>
            <div className="text-gray-600 text-sm flex items-center justify-center gap-1">
              <FiDatabase /> Tổng dung lượng
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filter Bar */}
      <Card className="mb-6 shadow-sm p-[16px]" >
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search Input */}
          <div className="flex-1 min-w-0 max-w-md">
            <Input
              placeholder="Tìm kiếm tiêu đề, mô tả..."
              prefix={<SearchOutlined className="text-gray-400" />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ height: 36 }}
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select
              placeholder="Loại nội dung"
              allowClear
              style={{ width: 160, height: 36 }}
              value={selectedContentType === 'ALL' ? undefined : selectedContentType}
              onChange={(val) => {
                setSelectedContentType(val || 'ALL');
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
              options={Object.entries(CONTENT_TYPE_CONFIG).map(([key, config]) => ({
                value: key,
                label: (
                  <span className="flex items-center gap-2">
                    {config.icon}
                    {config.label}
                  </span>
                ),
              }))}
            />
            <Select
              placeholder="Quyền truy cập"
              allowClear
              style={{ width: 160, height: 36 }}
              value={selectedAccessLevel === 'ALL' ? undefined : selectedAccessLevel}
              onChange={(val) => {
                setSelectedAccessLevel(val || 'ALL');
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
              options={Object.entries(ACCESS_LEVEL_CONFIG).map(([key, config]) => ({
                value: key,
                label: (
                  <span className="flex items-center gap-2">
                    {config.icon}
                    {config.label}
                  </span>
                ),
              }))}
            />
            <Select
              placeholder="Sản phẩm"
              allowClear
              showSearch
              style={{ width: 220, height: 36 }}
              value={selectedComponent}
              onChange={(val) => {
                setSelectedComponent(val);
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
              optionFilterProp="label"
              options={components.map(c => ({
                value: c.componentId,
                label: `${c.sku} - ${c.componentName}`,
              }))}
            />

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 h-9">
              <Button
                type={viewMode === 'table' ? 'primary' : 'text'}
                icon={<UnorderedListOutlined />}
                onClick={() => setViewMode('table')}
                size="small"
                style={{
                  height: 28,
                  width: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                className={viewMode === 'table' ? 'bg-blue-600' : ''}
              />
              <Button
                type={viewMode === 'grid' ? 'primary' : 'text'}
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode('grid')}
                size="small"
                style={{
                  height: 28,
                  width: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                className={viewMode === 'grid' ? 'bg-blue-600' : ''}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Content */}
      <Spin spinning={loading}>
        {filteredData.length === 0 && !loading ? (
          <Card className="shadow-sm">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không tìm thấy tài liệu nào"
            >
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
                Thêm tài liệu mới
              </Button>
            </Empty>
          </Card>
        ) : viewMode === 'table' ? (
          <Card className="shadow-sm" bodyStyle={{ padding: 0 }}>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="knowledgeID"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} tài liệu`,
                onChange: (page, pageSize) => {
                  setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize: pageSize || 20,
                  }));
                },
              }}
              scroll={{ x: 1200 }}
            />
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {filteredData.map((item) => (
              <Col xs={24} sm={12} md={8} xl={6} key={item.knowledgeID}>
                <KnowledgeCard item={item} />
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {/* Detail Drawer */}
      <Drawer
        title="Chi tiết tài liệu"
        placement="right"
        width={600}
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        extra={
          <Space>
            <Button icon={<EditOutlined />} onClick={openEditModal}>Chỉnh sửa</Button>
            <Button
              type="primary"
              icon={selectedItem?.contentType === 'VIDEO' ? <PlayCircleOutlined /> : <DownloadOutlined />}
              onClick={() => selectedItem && handleDownload(selectedItem)}
              className="bg-blue-600"
            >
              {selectedItem?.contentType === 'VIDEO' ? 'Xem video' : 'Tải xuống'}
            </Button>
          </Space>
        }
      >
        {selectedItem && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <Avatar
                shape="square"
                size={80}
                icon={CONTENT_TYPE_CONFIG[getContentType(selectedItem.contentType)]?.icon}
                className="bg-gray-100"
                style={{ backgroundColor: CONTENT_TYPE_CONFIG[getContentType(selectedItem.contentType)]?.color + '20', color: CONTENT_TYPE_CONFIG[getContentType(selectedItem.contentType)]?.color }}
              />
              <div className="flex-1">
                <Title level={4} className="m-0 mb-2">{selectedItem.title}</Title>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag color={CONTENT_TYPE_CONFIG[getContentType(selectedItem.contentType)]?.color} icon={CONTENT_TYPE_CONFIG[getContentType(selectedItem.contentType)]?.icon}>
                    {CONTENT_TYPE_CONFIG[getContentType(selectedItem.contentType)]?.label}
                  </Tag>
                  <Tag color={ACCESS_LEVEL_CONFIG[getAccessScope(selectedItem.scope)]?.color} icon={ACCESS_LEVEL_CONFIG[getAccessScope(selectedItem.scope)]?.icon}>
                    {ACCESS_LEVEL_CONFIG[getAccessScope(selectedItem.scope)]?.label}
                  </Tag>
                </div>
              </div>
            </div>

            <Divider />

            {/* Description */}
            {selectedItem.description && (
              <div>
                <Text strong>Mô tả</Text>
                <Paragraph className="text-gray-600 mt-1">{selectedItem.description}</Paragraph>
              </div>
            )}

            {/* File Info */}
            {selectedItem.originalFileName && (
              <div>
                <Text strong>Thông tin file</Text>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Tên file:</span>
                      <span className="font-medium">{selectedItem.originalFileName}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-500">Kích thước:</span>
                      <span>{formatFileSize(selectedItem.fileSize)}</span>
                    </div>
                    {selectedItem.mimeType && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Loại file:</span>
                        <span>{selectedItem.mimeType}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Content URL - Only for VIDEO */}
            {getContentType(selectedItem.contentType) === 'VIDEO' && selectedItem.externalVideoURL && (
              <div>
                <Text strong>Đường dẫn Video</Text>
                <div className="mt-2 flex items-center gap-2">
                  <Input
                    value={selectedItem.externalVideoURL}
                    readOnly
                    addonAfter={
                      <CopyOutlined
                        className="cursor-pointer"
                        onClick={() => handleCopyLink(selectedItem.externalVideoURL!)}
                      />
                    }
                  />
                </div>
              </div>
            )}

            {/* Sharing Section */}
            <div>
              <Text strong>Chia sẻ</Text>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                {selectedItem.shareCount > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Tag color="blue" icon={<ShareAltOutlined />}>{selectedItem.shareCount} link đang chia sẻ</Tag>
                      <Popconfirm
                        title="Hủy tất cả link chia sẻ?"
                        onConfirm={() => knowledgeBaseService.revokeAllShareLinks(selectedItem.knowledgeID).then(() => {
                          message.success('Đã hủy tất cả link chia sẻ');
                          handleViewDetail(selectedItem);
                        })}
                        okText="Hủy tất cả"
                        cancelText="Đóng"
                      >
                        <Button size="small" danger icon={<StopOutlined />}>Hủy tất cả</Button>
                      </Popconfirm>
                    </div>
                    <div className="text-xs text-gray-500">
                      <div>Tổng downloads: {selectedItem.totalDownloads}</div>
                    </div>
                  </div>
                ) : getContentType(selectedItem.contentType) !== 'VIDEO' ? (
                  <Button
                    type="dashed"
                    icon={<ShareAltOutlined />}
                    onClick={openShareModal}
                    block
                  >
                    Tạo link chia sẻ
                  </Button>
                ) : (
                  <div className="text-gray-500 text-sm">
                    Video có thể chia sẻ trực tiếp qua link
                  </div>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="text-sm text-gray-500 pt-4 border-t space-y-2">
              <div className="flex justify-between">
                <span><UserOutlined className="mr-1" />Người tải lên:</span>
                <span className="font-medium">{selectedItem.createdByUserName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span><ClockCircleOutlined className="mr-1" />Ngày tạo:</span>
                <span>{dayjs(selectedItem.createdAt).format('DD/MM/YYYY HH:mm:ss')}</span>
              </div>
              {selectedItem.updatedAt && (
                <div className="flex justify-between">
                  <span><ClockCircleOutlined className="mr-1" />Cập nhật:</span>
                  <span>{dayjs(selectedItem.updatedAt).format('DD/MM/YYYY HH:mm:ss')}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Share Modal */}
      <Modal
        title={
          <span className="flex items-center gap-2">
            <ShareAltOutlined className="text-blue-600" />
            Tạo link chia sẻ
          </span>
        }
        open={shareModalOpen}
        onCancel={() => {
          setShareModalOpen(false);
          shareForm.resetFields();
          setShareResult(null);
        }}
        footer={shareResult ? [
          <Button key="close" onClick={() => {
            setShareModalOpen(false);
            setShareResult(null);
          }}>
            Đóng
          </Button>
        ] : [
          <Button key="cancel" onClick={() => setShareModalOpen(false)}>
            Hủy
          </Button>,
          <Button key="create" type="primary" onClick={handleCreateShareLink} className="bg-blue-600">
            Tạo link
          </Button>
        ]}
        width={500}
      >
        {shareResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-green-600 font-medium mb-2">✓ Đã tạo link chia sẻ thành công!</div>
              <div className="flex gap-2">
                <Input value={shareResult.sharedURL} readOnly />
                <Button
                  icon={<CopyOutlined />}
                  onClick={() => handleCopyLink(shareResult.sharedURL)}
                >
                  Sao chép
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <div>Hết hạn: {dayjs(shareResult.sharedExpiry).format('DD/MM/YYYY HH:mm')}</div>
              {shareResult.maxDownloads && (
                <div>Giới hạn tải: {shareResult.maxDownloads} lần</div>
              )}
            </div>
          </div>
        ) : (
          <Form form={shareForm} layout="vertical" className="mt-4">
            <Form.Item
              label="Thời hạn"
              required
            >
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item
                  name="expirationValue"
                  noStyle
                  rules={[{ required: true, message: 'Vui lòng nhập thời hạn' }]}
                  initialValue={7}
                >
                  <InputNumber
                    min={1}
                    max={expirationUnit === 'minutes' ? 525600 : expirationUnit === 'hours' ? 8760 : 365}
                    style={{ width: '60%' }}
                    placeholder="Nhập số"
                  />
                </Form.Item>
                <Select
                  value={expirationUnit}
                  onChange={(val) => setExpirationUnit(val)}
                  style={{ width: '40%' }}
                  options={[
                    { value: 'minutes', label: 'Phút' },
                    { value: 'hours', label: 'Giờ' },
                    { value: 'days', label: 'Ngày' },
                  ]}
                />
              </Space.Compact>
            </Form.Item>
            <Form.Item
              name="maxDownloads"
              label="Giới hạn số lần tải (để trống = không giới hạn)"
            >
              <InputNumber min={1} max={1000} className="w-full" placeholder="Không giới hạn" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default KnowledgeBase;
