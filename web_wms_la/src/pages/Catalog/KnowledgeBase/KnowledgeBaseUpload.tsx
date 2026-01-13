import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  Typography,
  Row,
  Col,
  Form,
  message,
  Upload,
  Breadcrumb,
  Divider,
  Statistic,
  Progress,
  Alert,
  Space,
  Tag,
} from 'antd';
import {
  LinkOutlined,
  ArrowLeftOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { IoWarningOutline } from "react-icons/io5";
import type { UploadFile } from 'antd/es/upload/interface';
import { useNavigate, Link } from 'react-router-dom';
import { FaRegFilePdf } from 'react-icons/fa';
import { FiVideo, FiTool, FiDownload, FiGlobe, FiUsers } from 'react-icons/fi';
import knowledgeBaseService, {
  type KnowledgeBaseUploadDto,
  type KnowledgeBaseResultDto,
  type ContentType,
  type AccessScope,
} from '../../../services/knowledgeBase.service';
import componentsService from '../../../services/components.service';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

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
  acceptedFiles: string;
  maxSize: string;
}> = {
  DOCUMENT: {
    label: 'Tài liệu',
    color: '#1890ff',
    bgColor: 'bg-blue-50',
    icon: <FaRegFilePdf style={{ fontSize: 28 }} />,
    iconSmall: <FaRegFilePdf className='text-[20px] flex justify-center' />,
    description: 'PDF, Word, Excel...',
    acceptedFiles: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
    maxSize: '50MB',
  },
  VIDEO: {
    label: 'Video',
    color: '#f5222d',
    bgColor: 'bg-red-50',
    icon: <FiVideo style={{ fontSize: 28 }} />,
    iconSmall: <FiVideo className='text-[20px] flex justify-center' />,
    description: 'Link YouTube, Vimeo...',
    acceptedFiles: '',
    maxSize: 'N/A',
  },
  DRIVER: {
    label: 'Driver',
    color: '#52c41a',
    bgColor: 'bg-green-50',
    icon: <FiTool style={{ fontSize: 28 }} />,
    iconSmall: <FiTool className='text-[20px] flex justify-center' />,
    description: 'Driver phần cứng...',
    acceptedFiles: '.exe,.msi,.zip,.rar,.7z,.tar,.gz',
    maxSize: '200MB',
  },
  FIRMWARE: {
    label: 'Firmware',
    color: '#722ed1',
    bgColor: 'bg-purple-50',
    icon: <FiDownload style={{ fontSize: 28 }} />,
    iconSmall: <FiDownload className='text-[20px] flex justify-center' />,
    description: 'Firmware cập nhật...',
    acceptedFiles: '.bin,.hex,.fw,.zip,.rar',
    maxSize: '500MB',
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const KnowledgeBaseUpload: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // States
  const [contentType, setContentType] = useState<ContentType>('DOCUMENT');
  const [accessScope, setAccessScope] = useState<AccessScope>('PUBLIC');
  const [uploadFile, setUploadFile] = useState<UploadFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<KnowledgeBaseResultDto | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [components, setComponents] = useState<any[]>([]);
  const [videoURL, setVideoURL] = useState<string>('');

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

  // Fetch components
  const fetchComponents = useCallback(async () => {
    try {
      const result = await componentsService.getComponentsForSelect();
      setComponents(result);
    } catch (error) {
      console.error('Error fetching components:', error);
    }
  }, []);

  useEffect(() => {
    fetchComponents();
  }, [fetchComponents]);

  // Handlers
  const handleFileChange = (info: { file: UploadFile; fileList: UploadFile[] }) => {
    const file = info.file;
    const config = CONTENT_TYPE_CONFIG[contentType];

    // Validate file size based on content type
    const maxSizeMap: Record<string, number> = {
      '50MB': 50 * 1024 * 1024,
      '200MB': 200 * 1024 * 1024,
      '500MB': 500 * 1024 * 1024,
    };
    const maxSize = maxSizeMap[config.maxSize] || 500 * 1024 * 1024;

    if (file.size && file.size > maxSize) {
      message.error(`File quá lớn! Tối đa ${config.maxSize}`);
      return;
    }

    setUploadFile(file);
    form.setFieldValue('file', file);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setUploading(true);
      setUploadProgress(0);
      setUploadError(null);

      // Build DTO matching backend structure
      const dto: KnowledgeBaseUploadDto = {
        componentID: values.componentId,
        title: values.title,
        description: values.description,
        contentType: contentType,
        scope: accessScope,
        videoURL: values.videoURL,
      };

      // Get actual file for non-VIDEO types
      const file = contentType === 'VIDEO'
        ? null
        : (uploadFile?.originFileObj as File || uploadFile as unknown as File || null);

      // Call API with real progress tracking
      const response = await knowledgeBaseService.uploadKnowledgeBase(
        file,
        dto,
        (progressEvent) => {
          // Calculate progress percentage from axios event
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded)
          );
          setUploadProgress(percentCompleted);
        }
      );

      // Ensure progress reaches 100%
      setUploadProgress(100);

      if (response.success) {
        setUploadResult(response.data);
        message.success('Đã upload tài liệu thành công!');
      } else {
        setUploadError(response.message || 'Upload thất bại');
        message.error(response.message || 'Upload thất bại');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      // Don't show error if it's just form validation
      if (error.errorFields) {
        return;
      }
      setUploadError(error.message || 'Có lỗi xảy ra khi upload');
      message.error(error.message || 'Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setContentType('DOCUMENT');
    setAccessScope('PUBLIC');
    setUploadFile(null);
    setUploadProgress(0);
    setUploadResult(null);
    setUploadError(null);
    form.resetFields();
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const typeConfig = CONTENT_TYPE_CONFIG[contentType];
  const scopeConfig = ACCESS_SCOPE_CONFIG[accessScope];

  return (
    <div className="minh-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="py-4 px-4 mx-auto">
          <Breadcrumb
            className="mb-3"
            items={[
              { title: <Link to="/admin/catalog/knowledge-base">Kho tri thức</Link> },
              { title: 'Upload tài liệu' },
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
                <Title level={4} className="m-0">Upload tài liệu mới</Title>
                <Text type="secondary">Thêm tài liệu, video, driver hoặc firmware vào hệ thống</Text>
              </div>
            </div>

            <Space>
              <Button onClick={handleReset} disabled={uploading}>
                Làm mới
              </Button>
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={handleSubmit}
                loading={uploading}
                className="bg-blue-600"
              >
                {uploading ? 'Đang xử lý...' : 'Lưu tài liệu'}
              </Button>
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
                title="Định dạng"
                value={contentType === 'VIDEO' ? 'URL' : 'File'}
                valueStyle={{ fontSize: 16 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} className="text-center shadow-sm h-full py-2">
              <Statistic
                title="Giới hạn"
                value={typeConfig.maxSize}
                valueStyle={{ fontSize: 16 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Progress & Result Display */}
        {(uploading || uploadResult || uploadError) && (
          <Card className="shadow-sm mb-6">
            {uploading && (
              <div className="text-center py-6">
                <CloudUploadOutlined className="text-5xl text-blue-500 mb-4 animate-bounce" />
                <Title level={5}>Đang tải lên hệ thống...</Title>

                {uploadFile && (
                  <div className="text-sm text-gray-500 mb-3">
                    <div className="font-medium">{uploadFile.name}</div>
                    <div className="text-xs mt-1">
                      {formatFileSize(uploadFile.size)} • {CONTENT_TYPE_CONFIG[contentType].label}
                    </div>
                  </div>
                )}

                <Progress
                  percent={uploadProgress}
                  status="active"
                  strokeColor={{ '0%': '#1890ff', '100%': '#52c41a' }}
                  className="max-w-md mx-auto"
                  format={(percent) => `${percent}%`}
                />

                <div className="text-xs text-gray-400 mt-2">
                  {uploadProgress < 100 ? 'Vui lòng chờ...' : 'Đang xử lý...'}
                </div>
              </div>
            )}

            {uploadError && (
              <Alert
                message="Upload thất bại"
                description={uploadError}
                type="error"
                showIcon
                action={
                  <Button size="small" onClick={handleSubmit}>
                    Thử lại
                  </Button>
                }
              />
            )}

            {uploadResult && !uploading && (
              <div className="text-center py-6">
                <CheckCircleOutlined className="text-5xl text-green-500 mb-4" />
                <Title level={4} className="text-green-600">Upload thành công!</Title>
                <Paragraph type="secondary" className="mb-4">
                  Tài liệu "{uploadResult.title}" đã được thêm vào kho tri thức
                </Paragraph>

                <Space className="mb-4">
                  <Button
                    type="primary"
                    onClick={() => navigate('/admin/catalog/knowledge-base')}
                    className="bg-blue-600"
                  >
                    Về danh sách
                  </Button>
                  <Button onClick={handleReset}>
                    Upload tiếp
                  </Button>
                </Space>

                <Divider />

                <div className="flex items-center gap-4 justify-center">
                  <div
                    className={`w-16 h-16 rounded-lg flex items-center justify-center ${CONTENT_TYPE_CONFIG[uploadResult.contentType].bgColor}`}
                    style={{ color: CONTENT_TYPE_CONFIG[uploadResult.contentType].color }}
                  >
                    {CONTENT_TYPE_CONFIG[uploadResult.contentType].icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-lg">{uploadResult.title}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {uploadResult.originalFileName && (
                        <div>
                          <FileTextOutlined className="mr-1" />
                          {uploadResult.originalFileName} • {formatFileSize(uploadResult.fileSize)}
                        </div>
                      )}
                      {uploadResult.externalVideoURL && (
                        <div>
                          <LinkOutlined className="mr-1" />
                          Video: {uploadResult.externalVideoURL}
                        </div>
                      )}
                      <div className="mt-1">
                        Trạng thái: <Tag color={uploadResult.processStatus === 'READY' ? 'green' : 'orange'}>
                          {uploadResult.processStatus}
                        </Tag>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Main Form Content - Hide if success */}
        {!uploadResult && (
          <>
            {/* 1. Configuration Section (Full Width) */}
            <Row gutter={[24, 24]} className="mb-6">
              {/* Content Type Selector */}
              <Col span={24}>
                <Card
                  title={<span><AppstoreOutlined className="text-blue-500 mr-2" />Phân loại nội dung</span>}
                  className="shadow-sm"
                  bodyStyle={{ padding: '20px' }}
                >
                  <Row gutter={[16, 16]}>
                    {(Object.entries(CONTENT_TYPE_CONFIG) as [ContentType, typeof CONTENT_TYPE_CONFIG[ContentType]][]).map(([type, config]) => (
                      <Col xs={12} md={6} key={type}>
                        <div
                          className={`
                            relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 text-center h-full group
                            ${contentType === type
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                            }
                          `}
                          onClick={() => {
                            setContentType(type);
                            setUploadFile(null);
                            form.setFieldValue('file', undefined);
                            form.setFieldValue('videoURL', undefined);
                          }}
                        >
                          <div
                            className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors ${config.bgColor}`}
                            style={{ color: config.color }}
                          >
                            {config.icon}
                          </div>
                          <div className={`font-semibold transition-colors ${contentType === type ? 'text-blue-700' : 'text-gray-700'}`}>
                            {config.label}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{config.description}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>

              {/* Access Scope Selector - HORIZONTAL LAYOUT */}
              <Col span={24}>
                <Card
                  title={<span><SafetyCertificateOutlined className="text-green-500 mr-2" />Phạm vi truy cập</span>}
                  className="shadow-sm"
                  bodyStyle={{ padding: '20px' }}
                >
                  <Row gutter={[16, 16]}>
                    {(Object.entries(ACCESS_SCOPE_CONFIG) as [AccessScope, typeof ACCESS_SCOPE_CONFIG[AccessScope]][]).map(([scope, config]) => (
                      <Col xs={24} md={12} key={scope}>
                        <div
                          className={`
                            flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                            ${accessScope === scope
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-100 hover:border-green-200 hover:bg-gray-50'
                            }
                          `}
                          onClick={() => setAccessScope(scope)}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex shrink-0 items-center justify-center bg-white shadow-sm"
                            style={{ color: config.color }}
                          >
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <div className={`font-semibold text-base ${accessScope === scope ? 'text-green-700' : 'text-gray-700'}`}>
                              {config.label}
                            </div>
                            <div className="text-sm text-gray-500 mt-0.5">{config.description}</div>
                          </div>
                          {/* Radio circle indicator simulation */}
                          <div className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center
                            ${accessScope === scope ? 'border-green-500' : 'border-gray-300'}
                          `}>
                            {accessScope === scope && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                          </div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </Col>
            </Row>

            {/* 2. Detail Info & Upload Section */}
            <Row gutter={24}>
              <Col xs={24} lg={16}>
                <Card
                  title={<span><FileTextOutlined className="text-indigo-500 mr-2" />Thông tin chi tiết</span>}
                  className="shadow-sm h-full"
                >
                  <Form form={form} layout="vertical" requiredMark="optional">
                    <Row gutter={16}>
                      <Col xs={24} md={14}>
                        <Form.Item
                          name="title"
                          label="Tiêu đề tài liệu"
                          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
                        >
                          <Input placeholder="VD: Hướng dẫn sử dụng..." />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={10}>
                        <Form.Item name="componentId" label="Sản phẩm liên kết">
                          <Select
                            placeholder="Chọn sản phẩm"
                            allowClear
                            showSearch
                            options={components.map(c => ({ value: c.componentId, label: c.componentName }))}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item name="description" label="Mô tả nội dung">
                      <TextArea rows={3} placeholder="Mô tả chi tiết về tài liệu này..." />
                    </Form.Item>

                    <Divider orientation="horizontal" className="text-gray-400 font-normal">
                      {contentType === 'VIDEO' ? 'Đường dẫn Video' : 'Tập tin đính kèm'}
                    </Divider>

                    {contentType === 'VIDEO' ? (
                      <>
                        <Form.Item
                          name="videoURL"
                          rules={[
                            { required: true, message: 'Nhập link video' },
                            { type: 'url', message: 'Link không hợp lệ' }
                          ]}
                        >
                          <Input
                            prefix={<LinkOutlined />}
                            placeholder="https://youtube.com/watch?v=..."
                            onChange={(e) => setVideoURL(e.target.value)}
                          />
                        </Form.Item>

                        {/* YouTube Preview */}
                        {getYoutubeVideoId(videoURL) && (
                          <div className="mt-4 rounded-lg overflow-hidden border border-gray-200">
                            <div className="bg-gray-100 px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
                              <FiVideo className="text-red-500" />
                              Xem trước video
                            </div>
                            <div className="aspect-video">
                              <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${getYoutubeVideoId(videoURL)}`}
                                title="YouTube video preview"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        )}

                        {/* Invalid URL hint */}
                        {videoURL && !getYoutubeVideoId(videoURL) && (
                          <div className="mt-2 text-sm text-orange-500 flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Chưa nhận diện được link YouTube. Vui lòng kiểm tra lại URL.</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <Form.Item
                        name="file"
                        rules={[{ required: true, message: 'Vui lòng chọn file' }]}
                        className="mb-0"
                      >
                        <Dragger
                          maxCount={1}
                          accept={typeConfig.acceptedFiles}
                          beforeUpload={(file) => {
                            handleFileChange({ file: file as UploadFile, fileList: [file as UploadFile] });
                            return false;
                          }}
                          onRemove={() => {
                            setUploadFile(null);
                            form.setFieldValue('file', undefined);
                          }}
                          fileList={uploadFile ? [uploadFile] : []}
                          className="bg-gray-50 hover:bg-blue-50 transition-colors border-dashed border-2 border-gray-300 rounded-lg"
                        >
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ color: typeConfig.color }} />
                          </p>
                          <p className="ant-upload-text font-medium">Click hoặc Kéo thả file vào đây</p>
                          <p className="ant-upload-hint text-gray-400">
                            Hỗ trợ: {typeConfig.acceptedFiles || 'Tất cả'} (Max: {typeConfig.maxSize})
                          </p>
                        </Dragger>
                      </Form.Item>
                    )}
                  </Form>
                </Card>
              </Col>

              {/* 3. Helper Section (Sidebar) */}
              <Col xs={24} lg={8}>
                <Card
                  title={
                    <span className="flex items-center text-amber-700 font-semibold">
                      <IoWarningOutline className="mr-2" size={24} />
                      Lưu ý quan trọng
                    </span>
                  }
                  className="shadow-sm h-full border border-amber-200 bg-amber-50"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        1
                      </span>
                      <span className="text-sm text-gray-700 leading-relaxed">
                        Chọn đúng <b className="text-amber-700">Loại nội dung</b> để hệ thống phân loại chính xác.
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        2
                      </span>
                      <span className="text-sm text-gray-700 leading-relaxed">
                        Với <b className="text-amber-700">Video</b>, nên ưu tiên link Youtube để xem trực tiếp, tránh upload file nặng.
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        3
                      </span>
                      <span className="text-sm text-gray-700 leading-relaxed">
                        Đặt tên file <b className="text-amber-700">ngắn gọn, không dấu</b> trước khi upload để tránh lỗi hệ thống.
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        4
                      </span>
                      <span className="text-sm text-gray-700 leading-relaxed">
                        Tài liệu có quyền <b className="text-amber-700">Nội bộ</b> sẽ không hiển thị cho khách hàng bên ngoài.
                      </span>
                    </div>
                  </div>
                </Card>

              </Col>
            </Row>
          </>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBaseUpload;