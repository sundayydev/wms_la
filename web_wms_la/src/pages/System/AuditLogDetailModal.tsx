import React, { useMemo } from 'react';
import {
    Modal,
    Tag,
    Badge,
    Avatar,
    Typography
} from 'antd';
import {
    GlobalOutlined,
    FileTextOutlined,
    LaptopOutlined,
    CodeOutlined,
    ArrowRightOutlined,
    CloseCircleOutlined,
    CloseOutlined,
    CheckCircleOutlined,
    HistoryOutlined,
    PlusCircleOutlined,
    EditOutlined,
    DeleteOutlined,
    LoginOutlined,
    LogoutOutlined,
    QuestionCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

// ============================================================================
// INTERFACES
// ============================================================================

interface AuditLogType {
    LogID: string;
    UserName: string;
    Action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'Other';
    EntityType: string;
    EntityID: string;
    OldValue?: string;
    NewValue?: string;
    IPAddress: string;
    UserAgent: string;
    CreatedAt: string;
}

interface AuditLogDetailModalProps {
    open: boolean;
    onClose: () => void;
    log: AuditLogType | null;
}

// ============================================================================
// CONFIG
// ============================================================================

const ACTION_CONFIG: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    CREATE: { color: 'success', icon: <PlusCircleOutlined />, label: 'Tạo mới' },
    UPDATE: { color: 'warning', icon: <EditOutlined />, label: 'Cập nhật' },
    DELETE: { color: 'error', icon: <DeleteOutlined />, label: 'Xóa' },
    LOGIN: { color: 'processing', icon: <LoginOutlined />, label: 'Đăng nhập' },
    LOGOUT: { color: 'default', icon: <LogoutOutlined />, label: 'Đăng xuất' },
    Other: { color: 'default', icon: <QuestionCircleOutlined />, label: 'Khác' },
};

// ============================================================================
// DIFF UTILITIES - So sánh và tìm dòng khác biệt
// ============================================================================

const getDiffLines = (oldJson?: string, newJson?: string): { oldDiff: Set<number>; newDiff: Set<number> } => {
    const oldDiff = new Set<number>();
    const newDiff = new Set<number>();

    if (!oldJson && !newJson) return { oldDiff, newDiff };

    try {
        const oldObj = oldJson ? JSON.parse(oldJson) : {};
        const newObj = newJson ? JSON.parse(newJson) : {};

        const oldFormatted = JSON.stringify(oldObj, null, 2).split('\n');
        const newFormatted = JSON.stringify(newObj, null, 2).split('\n');

        // So sánh từng dòng
        const maxLen = Math.max(oldFormatted.length, newFormatted.length);
        for (let i = 0; i < maxLen; i++) {
            const oldLine = oldFormatted[i] || '';
            const newLine = newFormatted[i] || '';
            if (oldLine !== newLine) {
                if (i < oldFormatted.length) oldDiff.add(i);
                if (i < newFormatted.length) newDiff.add(i);
            }
        }
    } catch (e) {
        // Nếu parse lỗi, không highlight
    }

    return { oldDiff, newDiff };
};

// ============================================================================
// SYNTAX HIGHLIGHT COMPONENT
// ============================================================================

interface SyntaxHighlightProps {
    json: string;
    diffLines?: Set<number>;
    type?: 'old' | 'new';
}

const SyntaxHighlight = ({ json, diffLines, type }: SyntaxHighlightProps) => {
    if (!json) return null;

    let formatted = '';
    try {
        const obj = JSON.parse(json);
        formatted = JSON.stringify(obj, null, 2);
    } catch (e) {
        return <span style={{ color: '#ff4d4f' }}>Invalid JSON: {json}</span>;
    }

    // Hàm highlight từng dòng
    const highlightLine = (line: string, lineIndex: number) => {
        const regex = /("[^"]*"\s*:|"[^"]*"|true|false|null|-?\d+(?:\.\d*)?|[{}\[\]:,])/g;
        const parts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(line)) !== null) {
            if (match.index > lastIndex) {
                parts.push(<span key={`${lineIndex}-ws-${lastIndex}`}>{line.slice(lastIndex, match.index)}</span>);
            }

            const token = match[0];
            let style: React.CSSProperties = { color: '#374151' };

            if (token === '{' || token === '}' || token === '[' || token === ']') {
                style.color = '#DC2626';
            } else if (token === ':' || token === ',') {
                style.color = '#6B7280';
            } else if (token.endsWith(':')) {
                style.color = '#2563EB';
                style.fontWeight = 500;
            } else if (token.startsWith('"')) {
                style.color = '#16A34A';
            } else if (token === 'true' || token === 'false') {
                style.color = '#EA580C';
            } else if (token === 'null') {
                style.color = '#9333EA';
            } else if (/^-?\d+(?:\.\d*)?$/.test(token)) {
                style.color = '#EA580C';
            }

            parts.push(<span key={`${lineIndex}-${match.index}`} style={style}>{token}</span>);
            lastIndex = regex.lastIndex;
        }

        if (lastIndex < line.length) {
            parts.push(<span key={`${lineIndex}-end`}>{line.slice(lastIndex)}</span>);
        }

        return parts;
    };

    // Style cho dòng khác biệt
    const getDiffStyle = (lineIndex: number): React.CSSProperties => {
        if (!diffLines || !diffLines.has(lineIndex)) return {};

        if (type === 'old') {
            return {
                backgroundColor: '#FEE2E2',
                borderLeft: '3px solid #EF4444',
                marginLeft: '-12px',
                paddingLeft: '9px',
                display: 'block'
            };
        } else if (type === 'new') {
            return {
                backgroundColor: '#DCFCE7',
                borderLeft: '3px solid #22C55E',
                marginLeft: '-12px',
                paddingLeft: '9px',
                display: 'block'
            };
        }
        return {};
    };

    const lines = formatted.split('\n');

    return (
        <pre style={{
            fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
            fontSize: '13px',
            lineHeight: '1.7',
            margin: 0,
            padding: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
        }}>
            {lines.map((line, i) => (
                <div key={i} style={getDiffStyle(i)}>{highlightLine(line, i)}</div>
            ))}
        </pre>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({ open, onClose, log }) => {
    // Tính toán diff lines
    const { oldDiff, newDiff } = useMemo(() => {
        if (!log) return { oldDiff: new Set<number>(), newDiff: new Set<number>() };
        return getDiffLines(log.OldValue, log.NewValue);
    }, [log]);

    if (!log) return null;

    const actionConfig = ACTION_CONFIG[log.Action] || ACTION_CONFIG['Other'];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={1000}
            centered
            className="audit-modal"
            styles={{ body: { padding: 0 } }}
            closeIcon={<CloseOutlined style={{ fontSize: 16 }} />}
        >
            <div className="flex flex-col h-[85vh] overflow-hidden rounded-lg bg-gray-50">
                {/* 1. HEADER SECTION */}
                <div className="bg-white border-b border-gray-200 p-6 flex flex-col gap-4">
                    {/* Top Row: Title & ID */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-2xl">
                                <FileTextOutlined />
                            </div>
                            <div>
                                <Title level={4} style={{ margin: 0 }}>Chi tiết Nhật ký</Title>
                                <Text type="secondary" className="font-mono text-xs">ID: {log.LogID}</Text>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <Tag color={actionConfig.color} className="text-sm px-3 py-1 m-0 rounded border-0">
                                {actionConfig.icon} <span className="ml-1 uppercase">{log.Action}</span>
                            </Tag>
                            <Text type="secondary" className="text-xs mt-1">
                                {dayjs(log.CreatedAt).format('DD/MM/YYYY HH:mm:ss')}
                            </Text>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-3 gap-4 mt-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-3">
                            <Avatar
                                src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${log.UserName}`}
                                style={{ backgroundColor: '#1890ff' }}
                            />
                            <div>
                                <div className="text-xs text-gray-500">Người thực hiện</div>
                                <div className="font-semibold text-gray-800">{log.UserName}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                                <GlobalOutlined />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">IP Address</div>
                                <div className="font-mono text-gray-800">{log.IPAddress}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 border-l border-gray-200 pl-4">
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                <CodeOutlined />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500">Đối tượng (Entity)</div>
                                <div className="font-semibold text-gray-800">
                                    {log.EntityType} <span className="font-normal text-gray-400">#{log.EntityID}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. BODY SECTION (DIFF VIEW) */}
                <div className="flex-1 overflow-hidden p-6 flex gap-4">
                    {/* Old Value */}
                    <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex justify-between items-center">
                            <span className="font-semibold text-red-700 flex items-center gap-2">
                                <HistoryOutlined /> Dữ liệu cũ (Before)
                            </span>
                            <Badge status="error" />
                        </div>
                        <div className="flex-1 bg-gray-50 p-4 overflow-auto scrollbar-thin">
                            {log.OldValue ? (
                                <SyntaxHighlight json={log.OldValue} diffLines={oldDiff} type="old" />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                    <CloseCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                    <span>Không có dữ liệu</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center shadow-sm">
                            <ArrowRightOutlined />
                        </div>
                    </div>

                    {/* New Value */}
                    <div className="flex-1 flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                        <div className="bg-green-50 px-4 py-2 border-b border-green-100 flex justify-between items-center">
                            <span className="font-semibold text-green-700 flex items-center gap-2">
                                <CheckCircleOutlined /> Dữ liệu mới (After)
                            </span>
                            <Badge status="success" />
                        </div>
                        <div className="flex-1 bg-gray-50 p-4 overflow-auto scrollbar-thin">
                            {log.NewValue ? (
                                <SyntaxHighlight json={log.NewValue} diffLines={newDiff} type="new" />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                    <CloseCircleOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                    <span>Đã bị xóa hoặc không có dữ liệu</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. FOOTER INFO */}
                <div className="bg-gray-100 px-6 py-2 text-xs text-gray-500 border-t border-gray-200 flex justify-between">
                    <span className="truncate max-w-[60%] flex items-center gap-1">
                        <LaptopOutlined /> {log.UserAgent}
                    </span>
                    <span>Powered by WMS Audit System</span>
                </div>
            </div>
        </Modal>
    );
};

export default AuditLogDetailModal;
