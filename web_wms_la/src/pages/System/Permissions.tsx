import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tabs,
  Tag,
  Modal,
  Checkbox,
  Input,
  Space,
  message,
  Typography,
  Row,
  Col,
  Tooltip,
  Divider,
  Spin
} from 'antd';
import {
  SafetyCertificateOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getAllPermissions } from '../../services/permissions.service';
import type { PermissionDto } from '../../types/api.types';

const { Title, Text } = Typography;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface UserType {
  UserID: string;
  Username: string;
  Role: string;
  AssignedPermissionIDs: string[];
}

// Mock users data (sẽ được thay bằng API sau)
const initialUsers: UserType[] = [
  {
    UserID: 'u1',
    Username: 'admin_sys',
    Role: 'ADMIN',
    AssignedPermissionIDs: []
  },
  {
    UserID: 'u2',
    Username: 'kho_a',
    Role: 'WAREHOUSE',
    AssignedPermissionIDs: []
  },
  {
    UserID: 'u3',
    Username: 'sale_b',
    Role: 'RECEPTIONIST',
    AssignedPermissionIDs: []
  },
];

const PermissionsPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState('1');
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');

  // State cho Modal Phân quyền
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [checkedPermissions, setCheckedPermissions] = useState<string[]>([]);

  // ============================================================================
  // FETCH DATA
  // ============================================================================

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const data = await getAllPermissions();
      setPermissions(data);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      message.error(error instanceof Error ? error.message : 'Không thể tải danh sách quyền');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // ============================================================================
  // LOGIC XỬ LÝ
  // ============================================================================

  // --- Tab 1: Phân quyền User ---

  const handleOpenAssignModal = (user: UserType) => {
    setSelectedUser(user);
    setCheckedPermissions(user.AssignedPermissionIDs);
    setIsAssignModalOpen(true);
  };

  const handleSaveAssignment = () => {
    if (selectedUser) {
      const updatedUsers = users.map(u =>
        u.UserID === selectedUser.UserID
          ? { ...u, AssignedPermissionIDs: checkedPermissions }
          : u
      );
      setUsers(updatedUsers);
      message.success(`Đã cập nhật quyền cho user ${selectedUser.Username}`);
      setIsAssignModalOpen(false);
    }
  };

  // --- Helper Functions ---

  // Nhóm permissions theo module
  const groupedPermissions = permissions.reduce((groups, perm) => {
    const module = perm.module || 'Other';
    if (!groups[module]) {
      groups[module] = [];
    }
    groups[module].push(perm);
    return groups;
  }, {} as Record<string, PermissionDto[]>);

  // Lọc permissions theo search text
  const filteredPermissions = permissions.filter(p =>
    p.permissionName.toLowerCase().includes(searchText.toLowerCase()) ||
    p.module.toLowerCase().includes(searchText.toLowerCase()) ||
    p.action.toLowerCase().includes(searchText.toLowerCase())
  );

  // Helper để lấy tên quyền từ ID
  const getPermissionName = (id: string) =>
    permissions.find(p => p.permissionID === id)?.permissionName || id;

  // ============================================================================
  // TABLE COLUMNS
  // ============================================================================

  const userColumns: ColumnsType<UserType> = [
    {
      title: 'Nhân viên',
      dataIndex: 'Username',
      key: 'username',
      render: (text) => <span className="font-semibold text-blue-600"><UserOutlined /> {text}</span>
    },
    {
      title: 'Vai trò (Role)',
      dataIndex: 'Role',
      key: 'role',
      render: (role) => {
        let color = role === 'ADMIN' ? 'red' : role === 'WAREHOUSE' ? 'orange' : 'green';
        return <Tag color={color}>{role}</Tag>;
      }
    },
    {
      title: 'Quyền hạn riêng (Permissions)',
      dataIndex: 'AssignedPermissionIDs',
      key: 'perms',
      render: (ids: string[]) => (
        <div className="flex flex-wrap gap-1">
          {ids.length === 0 ? (
            <Text type="secondary" className="text-xs">Chưa có quyền riêng</Text>
          ) : ids.length > 5 ? (
            <Tooltip title={ids.map(id => getPermissionName(id)).join(', ')}>
              <Tag color="blue">{ids.length} quyền được cấp</Tag>
            </Tooltip>
          ) : (
            ids.map(id => (
              <Tag key={id} className="text-xs bg-gray-50 border-gray-200 text-gray-600">
                {getPermissionName(id)}
              </Tag>
            ))
          )}
        </div>
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          ghost
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleOpenAssignModal(record)}
        >
          Phân quyền
        </Button>
      )
    }
  ];

  const permissionColumns: ColumnsType<PermissionDto> = [
    {
      title: 'ID',
      dataIndex: 'permissionID',
      width: 280,
      render: (text) => (
        <Text copyable className="font-mono text-xs text-gray-500">
          {text}
        </Text>
      )
    },
    {
      title: 'Tên quyền (Permission Name)',
      dataIndex: 'permissionName',
      key: 'name',
      render: (text) => <span className="font-medium text-blue-600">{text}</span>
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: (text) => <Tag color="cyan">{text}</Tag>,
      filters: [...new Set(permissions.map(p => p.module))].map(m => ({ text: m, value: m })),
      onFilter: (value, record) => record.module === value,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text) => <Tag color="purple">{text}</Tag>
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (text) => {
        const date = new Date(text);
        return <Text type="secondary" className="text-xs">{date.toLocaleDateString('vi-VN')}</Text>;
      }
    }
  ];

  // ============================================================================
  // RENDER MAIN
  // ============================================================================

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <SafetyCertificateOutlined /> Phân quyền hệ thống
          </h1>
          <p className="text-gray-500 mt-1">Quản lý quyền truy cập chi tiết cho từng người dùng</p>
        </div>
      </div>

      <Card className="shadow-sm" bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            // TAB 1: USER ASSIGNMENT
            {
              key: '1',
              label: 'Phân quyền người dùng',
              children: (
                <div>
                  <div className="flex justify-between mb-4">
                    <Input prefix={<SearchOutlined />} placeholder="Tìm nhân viên..." className="max-w-xs" />
                    <Button type="default" icon={<SafetyCertificateOutlined />}>Kiểm tra quyền</Button>
                  </div>
                  <Table
                    columns={userColumns}
                    dataSource={users}
                    rowKey="UserID"
                    pagination={false}
                  />
                </div>
              )
            },
            // TAB 2: PERMISSION LIST (From API)
            {
              key: '2',
              label: (
                <span>
                  Danh mục Quyền
                  {permissions.length > 0 && (
                    <Tag color="blue" className="ml-2">{permissions.length}</Tag>
                  )}
                </span>
              ),
              children: (
                <div>
                  <div className="flex justify-between mb-4">
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Tìm quyền theo tên, module, action..."
                      className="max-w-md"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                    />
                    <Button
                      type="default"
                      icon={<ReloadOutlined spin={loading} />}
                      onClick={fetchPermissions}
                      loading={loading}
                    >
                      Làm mới
                    </Button>
                  </div>

                  {loading ? (
                    <div className="flex justify-center items-center py-20">
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Đang tải danh sách quyền..." />
                    </div>
                  ) : (
                    <Table
                      columns={permissionColumns}
                      dataSource={filteredPermissions}
                      rowKey="permissionID"
                      pagination={{
                        pageSize: 15,
                        showSizeChanger: true,
                        showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} quyền`
                      }}
                      size="small"
                    />
                  )}
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* MODAL: PHÂN QUYỀN CHO USER */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-blue-600" />
            Phân quyền cho: <span className="font-bold text-blue-700">{selectedUser?.Username}</span>
          </div>
        }
        open={isAssignModalOpen}
        onOk={handleSaveAssignment}
        onCancel={() => setIsAssignModalOpen(false)}
        width={800}
        okText="Lưu cấu hình"
        cancelText="Hủy"
      >
        <p className="mb-4 text-gray-500">
          Chọn các hành động mà người dùng này được phép thực hiện.
          <br /><span className="text-xs text-orange-500">* User đã có vai trò là <b>{selectedUser?.Role}</b>, các quyền dưới đây là quyền bổ sung.</span>
        </p>

        <Divider />

        {loading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : (
          <Checkbox.Group
            className="w-full"
            value={checkedPermissions}
            onChange={(list) => setCheckedPermissions(list as string[])}
          >
            <Row gutter={[16, 16]}>
              {Object.entries(groupedPermissions).sort().map(([moduleName, modulePerms]) => (
                <Col span={24} key={moduleName}>
                  <h4 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider border-b pb-1 flex items-center gap-2">
                    <Tag color="cyan">{moduleName}</Tag>
                    <span className="text-gray-400 font-normal">({modulePerms.length} quyền)</span>
                  </h4>
                  <Row gutter={[8, 8]}>
                    {modulePerms.map(perm => (
                      <Col span={12} key={perm.permissionID}>
                        <Checkbox value={perm.permissionID} className="ml-0">
                          <span className="text-sm">
                            <Tag color="purple" className="mr-1">{perm.action}</Tag>
                            {perm.permissionName}
                          </span>
                        </Checkbox>
                      </Col>
                    ))}
                  </Row>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        )}
      </Modal>
    </div>
  );
};

export default PermissionsPage;