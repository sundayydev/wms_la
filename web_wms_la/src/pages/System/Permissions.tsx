import React, { useState, useEffect, useMemo } from 'react';
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
  Spin,
  Badge,
  Alert,
  Collapse,
  Empty
} from 'antd';
import {
  SafetyCertificateOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  LoadingOutlined,
  LockOutlined,
  UnlockOutlined,
  TeamOutlined,
  CheckCircleFilled,
  InfoCircleOutlined,
  CrownOutlined,
  SettingOutlined,
  SaveOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getAllPermissions,
  getUserPermissions,
  assignUserPermissions,
  getAllRoles,
  getRolePermissionMappings
} from '../../services/permissions.service';
import { getUsers } from '../../services/users.service';
import type { PermissionDto, UserPermissionDto, UserListDto } from '../../types/api.types';
import { getRoleConfig } from './Users/constants';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// ============================================================================
// CONSTANTS & CONFIGS
// ============================================================================

const MODULE_COLORS: Record<string, string> = {
  Dashboard: 'blue',
  User: 'purple',
  Role: 'magenta',
  Product: 'cyan',
  Category: 'geekblue',
  Inbound: 'green',
  Outbound: 'orange',
  Inventory: 'gold',
  Location: 'lime',
  Warehouse: 'volcano',
  Supplier: 'red',
  Customer: 'pink',
  Report: 'default',
  AuditLog: 'gray',
  Settings: 'brown',
  ProductInstance: 'teal',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PermissionsPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState('1');
  const [permissions, setPermissions] = useState<PermissionDto[]>([]);
  const [users, setUsers] = useState<UserListDto[]>([]);
  const [rolePermissionMappings, setRolePermissionMappings] = useState<Record<string, string[]>>({});
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [userSearchText, setUserSearchText] = useState('');

  // State cho Modal Phân quyền
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserListDto | null>(null);
  const [userPermissionData, setUserPermissionData] = useState<UserPermissionDto | null>(null);
  const [checkedExtraPermissions, setCheckedExtraPermissions] = useState<string[]>([]);
  const [loadingUserPermissions, setLoadingUserPermissions] = useState(false);
  const [savingPermissions, setSavingPermissions] = useState(false);

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

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await getUsers({ pageSize: 100 });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error(error instanceof Error ? error.message : 'Không thể tải danh sách người dùng');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchRolesAndMappings = async () => {
    try {
      const [rolesData, mappingsData] = await Promise.all([
        getAllRoles(),
        getRolePermissionMappings()
      ]);
      setRoles(rolesData);
      setRolePermissionMappings(mappingsData);
    } catch (error) {
      console.error('Failed to fetch role mappings:', error);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchUsers();
    fetchRolesAndMappings();
  }, []);

  // ============================================================================
  // LOGIC XỬ LÝ
  // ============================================================================

  const handleOpenAssignModal = async (user: UserListDto) => {
    setSelectedUser(user);
    setIsAssignModalOpen(true);
    setLoadingUserPermissions(true);
    setCheckedExtraPermissions([]);

    try {
      const userPerms = await getUserPermissions(user.userID);
      setUserPermissionData(userPerms);

      // Lấy quyền mặc định của role
      const defaultPerms = rolePermissionMappings[user.role] || [];
      // Lọc ra các quyền extra (quyền đã gán nhưng không phải mặc định)
      const userPermNames = userPerms?.permissionNames || [];
      const extraPerms = userPermNames.filter(
        perm => !defaultPerms.includes(perm)
      );
      setCheckedExtraPermissions(extraPerms);
    } catch (error) {
      console.error('Failed to fetch user permissions:', error);
      message.error('Không thể tải quyền người dùng');
    } finally {
      setLoadingUserPermissions(false);
    }
  };

  const handleSaveAssignment = async () => {
    if (!selectedUser) return;

    setSavingPermissions(true);
    try {
      // Lấy quyền mặc định của role
      const defaultPerms = rolePermissionMappings[selectedUser.role] || [];

      // Tạo danh sách quyền cuối cùng = quyền mặc định + quyền extra đã check
      const allPermNames = [...new Set([...defaultPerms, ...checkedExtraPermissions])];

      // Chuyển tên quyền thành ID
      const allPermIds = allPermNames
        .map(permName => permissions.find(p => p.permissionName === permName)?.permissionID)
        .filter((id): id is string => id !== undefined);

      // Thay thế toàn bộ quyền của user
      await assignUserPermissions(selectedUser.userID, allPermIds);
      message.success(`Đã cập nhật quyền cho ${selectedUser.fullName || selectedUser.username}`);
      setIsAssignModalOpen(false);

      // Refresh danh sách users (trong trường hợp có hiển thị số quyền)
      fetchUsers();
    } catch (error) {
      console.error('Failed to save permissions:', error);
      message.error(error instanceof Error ? error.message : 'Không thể lưu quyền');
    } finally {
      setSavingPermissions(false);
    }
  };

  // --- Helper Functions ---

  // Nhóm permissions theo module
  const groupedPermissions = useMemo(() => {
    return permissions.reduce((groups, perm) => {
      const module = perm.module || 'Other';
      if (!groups[module]) {
        groups[module] = [];
      }
      groups[module].push(perm);
      return groups;
    }, {} as Record<string, PermissionDto[]>);
  }, [permissions]);

  // Lọc permissions theo search text
  const filteredPermissions = useMemo(() => {
    return permissions.filter(p =>
      p.permissionName.toLowerCase().includes(searchText.toLowerCase()) ||
      p.module.toLowerCase().includes(searchText.toLowerCase()) ||
      p.action.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [permissions, searchText]);

  // Lọc users theo search text
  const filteredUsers = useMemo(() => {
    return users.filter(u =>
      u.username.toLowerCase().includes(userSearchText.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(userSearchText.toLowerCase()) ||
      u.role.toLowerCase().includes(userSearchText.toLowerCase())
    );
  }, [users, userSearchText]);

  // Lấy quyền mặc định của role hiện tại của user
  const getDefaultPermissions = (role: string): string[] => {
    return rolePermissionMappings[role] || [];
  };

  // Kiểm tra xem quyền có phải mặc định không
  const isDefaultPermission = (permName: string, role: string): boolean => {
    const defaults = getDefaultPermissions(role);
    return defaults.includes(permName);
  };

  // ============================================================================
  // TABLE COLUMNS
  // ============================================================================

  const userColumns: ColumnsType<UserListDto> = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center bg-blue-500 justify-center text-white font-bold">
            {record.fullName?.[0]?.toUpperCase() || record.username[0].toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{record.fullName || record.username}</div>
            <Text type="secondary" className="text-xs">@{record.username}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const config = getRoleConfig(role);
        return (
          <Tag icon={config.icon} color={config.color} className="flex items-center gap-1 px-3 py-1">
            {config.label}
          </Tag>
        );
      },
      filters: roles.map(r => ({ text: getRoleConfig(r).label, value: r })),
      onFilter: (value, record) => record.role === value,
    },
    {
      title: 'Quyền mặc định (Role)',
      key: 'defaultPerms',
      width: 160,
      render: (_, record) => {
        const defaultPerms = getDefaultPermissions(record.role);
        return (
          <Tooltip title={`${defaultPerms.length} quyền từ vai trò ${getRoleConfig(record.role).label}`}>
            <Badge count={defaultPerms.length} style={{ backgroundColor: '#52c41a' }}>
              <Tag icon={<LockOutlined />} color="default" className="px-3 py-1">
                Mặc định
              </Tag>
            </Badge>
          </Tooltip>
        );
      }
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 100,
      render: (_, record) => (
        record.isActive ? (
          <Tag color="success">Hoạt động</Tag>
        ) : (
          <Tag color="error">Đã khóa</Tag>
        )
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 140,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<SettingOutlined />}
          onClick={() => handleOpenAssignModal(record)}
          disabled={record.role === 'ADMIN'}
        >
          Thêm quyền
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
      title: 'Tên quyền',
      dataIndex: 'permissionName',
      key: 'name',
      sorter: (a, b) => a.permissionName.localeCompare(b.permissionName),
      render: (text) => <span className="font-medium text-blue-600">{text}</span>
    },
    {
      title: 'Module',
      dataIndex: 'module',
      key: 'module',
      render: (text) => <Tag color={MODULE_COLORS[text] || 'default'}>{text}</Tag>,
      filters: [...new Set(permissions.map(p => p.module))].map(m => ({ text: m, value: m })),
      onFilter: (value, record) => record.module === value,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (text) => <Tag color="purple">{text}</Tag>,
      filters: [...new Set(permissions.map(p => p.action))].map(a => ({ text: a, value: a })),
      onFilter: (value, record) => record.action === value,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (text) => {
        const date = new Date(text);
        return <Text type="secondary" className="text-xs">{date.toLocaleDateString('vi-VN')}</Text>;
      }
    }
  ];

  // ============================================================================
  // RENDER: ROLE MATRIX TAB
  // ============================================================================

  const renderRoleMatrix = () => {
    const modules = Object.keys(groupedPermissions).sort();

    return (
      <div className="space-y-6">
        <Alert
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          message="Quyền mặc định theo vai trò"
          description="Bảng dưới đây hiển thị các quyền mặc định được gán cho từng vai trò. Các quyền này không thể chỉnh sửa và tự động áp dụng cho tất cả người dùng thuộc vai trò tương ứng."
        />

        <div className="overflow-x-auto mt-4 rounded-lg border border-gray-200 shadow-sm bg-white">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {/* Corner Cell: Module / Permission */}
                <th className="px-4 py-4 text-left font-bold text-gray-700 sticky left-0 bg-gray-50 z-20 min-w-[220px] shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <span className="flex items-center gap-2">
                    Module / Quyền hạn
                    <Tooltip title="Danh sách quyền hạn được phân chia theo từng Module chức năng">
                      <InfoCircleOutlined className="text-gray-400 font-normal" />
                    </Tooltip>
                  </span>
                </th>

                {/* Role Headers */}
                {roles.map((role) => {
                  const roleConfig = getRoleConfig(role);
                  return (
                    <th key={role} className="px-2 py-4 text-center min-w-[120px] align-middle">
                      <div className="flex flex-col items-center gap-1">
                        <Tag icon={roleConfig.icon} color={roleConfig.color} className="m-0 text-sm px-3 py-1 font-semibold">
                          {roleConfig.label}
                        </Tag>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {modules.map((module) => (
                <React.Fragment key={module}>
                  {/* Module Header Row */}
                  <tr className="bg-blue-50/50 border-b border-gray-200">
                    <td
                      colSpan={roles.length + 1}
                      className="px-4 py-2 text-left font-bold text-gray-800 sticky left-0 z-10 bg-blue-50/50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-1 h-6 rounded-r bg-${MODULE_COLORS[module] || 'blue'}-500 inline-block mr-1`}></span>
                        <Tag color={MODULE_COLORS[module] || 'blue'}>{module}</Tag>
                      </div>
                    </td>
                  </tr>

                  {/* Permission Rows */}
                  {groupedPermissions[module]?.map((perm, index) => (
                    <tr
                      key={perm.permissionID}
                      className={`
                    border-b border-gray-100 transition-colors
                    hover:bg-blue-50/60
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'} 
                  `}
                    >
                      {/* Permission Name Column */}
                      <td className="px-4 py-3 text-left sticky left-0 bg-inherit z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-600">{perm.action}</span>
                          <span className="text-xs text-gray-400 font-mono hidden md:inline-block opacity-60">
                            {perm.permissionName.split('.')[1]}
                          </span>
                        </div>
                        {/* Optional: Add description if available */}
                        {/* <div className="text-xs text-gray-400 mt-0.5 font-light">Cho phép {perm.action.toLowerCase()} dữ liệu</div> */}
                      </td>

                      {/* Checkbox Cells per Role */}
                      {roles.map((role) => {
                        const hasPermission = rolePermissionMappings[role]?.includes(perm.permissionName);
                        return (
                          <td key={`${perm.permissionID}-${role}`} className="px-2 py-3 text-center border-l border-gray-100">
                            <div className="flex justify-center items-center h-full">
                              {hasPermission ? (
                                <CheckCircleFilled className="text-green-500 text-xl shadow-sm rounded-full bg-white" />
                              ) : (
                                <CloseCircleOutlined className="text-gray-200 text-lg opacity-50" />
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER MAIN
  // ============================================================================

  return (
    <div className="w-full">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0 flex items-center gap-2">
            <SafetyCertificateOutlined className="text-blue-600" /> Phân quyền hệ thống
          </h1>
          <p className="text-gray-500 mt-1">Quản lý quyền truy cập chi tiết cho từng người dùng và vai trò</p>
        </div>
      </div>

      <Card className="shadow-sm" bordered={false}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            // TAB 1: ROLE-PERMISSION MATRIX
            {
              key: '1',
              label: (
                <span className="flex items-center gap-2">
                  <TeamOutlined /> Ma trận Quyền - Vai trò
                </span>
              ),
              children: loading ? (
                <div className="flex justify-center items-center py-20">
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Đang tải..." />
                </div>
              ) : (
                renderRoleMatrix()
              )
            },
            // TAB 2: USER ASSIGNMENT
            {
              key: '2',
              label: (
                <span className="flex items-center gap-2">
                  <UserOutlined /> Phân quyền người dùng
                </span>
              ),
              children: (
                <div>
                  <Alert
                    type="warning"
                    showIcon
                    className="mb-4"
                    message="Lưu ý về quyền người dùng"
                    description="Mỗi người dùng đã có sẵn các quyền mặc định từ vai trò. Bạn chỉ có thể THÊM quyền bổ sung, không thể xóa quyền mặc định."
                  />

                  <div className="flex justify-between mb-4">
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="Tìm nhân viên theo tên, username, vai trò..."
                      className="max-w-md"
                      value={userSearchText}
                      onChange={(e) => setUserSearchText(e.target.value)}
                      allowClear
                    />
                    <Button
                      type="default"
                      icon={<ReloadOutlined spin={usersLoading} />}
                      onClick={fetchUsers}
                      loading={usersLoading}
                    >
                      Làm mới
                    </Button>
                  </div>

                  {usersLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Đang tải danh sách người dùng..." />
                    </div>
                  ) : (
                    <Table
                      columns={userColumns}
                      dataSource={filteredUsers}
                      rowKey="userID"
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} người dùng`
                      }}
                    />
                  )}
                </div>
              )
            },
            // TAB 3: PERMISSION LIST
            {
              key: '3',
              label: (
                <span className="flex items-center gap-2">
                  Danh mục Quyền
                  {permissions.length > 0 && (
                    <Tag color="blue">{permissions.length}</Tag>
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

      {/* MODAL: THÊM QUYỀN CHO USER */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-blue-600" />
            <span>Quản lý quyền: <span className="font-bold text-blue-700">{selectedUser?.fullName || selectedUser?.username}</span></span>
          </div>
        }
        open={isAssignModalOpen}
        onOk={handleSaveAssignment}
        onCancel={() => setIsAssignModalOpen(false)}
        width={900}
        okText={
          <span className="flex items-center gap-1">
            <SaveOutlined /> Lưu thay đổi
          </span>
        }
        cancelText="Hủy"
        confirmLoading={savingPermissions}
        okButtonProps={{ disabled: selectedUser?.role === 'ADMIN' }}
      >
        {loadingUserPermissions ? (
          <div className="flex justify-center py-10">
            <Spin size="large" tip="Đang tải quyền người dùng..." />
          </div>
        ) : selectedUser?.role === 'ADMIN' ? (
          <Alert
            type="info"
            showIcon
            icon={<CrownOutlined />}
            message="Tài khoản Admin"
            description="Admin có toàn quyền hệ thống và không thể thay đổi quyền."
          />
        ) : (
          <div className="space-y-6">
            {/* Info about current role */}
            <Alert
              type="info"
              showIcon
              message={
                <span>
                  Vai trò hiện tại: <Tag color={getRoleConfig(selectedUser?.role || '').color}>
                    {getRoleConfig(selectedUser?.role || '').label}
                  </Tag>
                </span>
              }
              description="Người dùng này đã có các quyền mặc định từ vai trò. Bạn chỉ có thể thêm quyền bổ sung bên dưới."
            />

            {/* Default permissions (read-only) */}
            <div>
              <Divider orientation="horizontal">
                <span className="text-gray-600 flex items-center gap-2">
                  <LockOutlined /> Quyền mặc định (không thể chỉnh sửa)
                </span>
              </Divider>
              <Collapse ghost>
                {Object.entries(groupedPermissions).map(([module, perms]) => {
                  const defaultPermsInModule = perms.filter(p =>
                    isDefaultPermission(p.permissionName, selectedUser?.role || '')
                  );
                  if (defaultPermsInModule.length === 0) return null;

                  return (
                    <Panel
                      key={module}
                      header={
                        <span className="flex items-center gap-2">
                          <Tag color={MODULE_COLORS[module] || 'default'}>{module}</Tag>
                          <Badge count={defaultPermsInModule.length} style={{ backgroundColor: '#52c41a' }} />
                        </span>
                      }
                    >
                      <Row gutter={[8, 8]}>
                        {defaultPermsInModule.map(perm => (
                          <Col span={12} key={perm.permissionID}>
                            <div className="flex items-center gap-2 p-2 bg-green-50 rounded border border-green-200">
                              <CheckCircleFilled className="text-green-500" />
                              <Tag color="purple" className="text-xs">{perm.action}</Tag>
                              <span className="text-sm text-gray-700">{perm.permissionName}</span>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </Panel>
                  );
                })}
              </Collapse>
            </div>

            {/* Extra permissions (can add/remove) */}
            <div>
              <Divider orientation="horizontal">
                <span className="text-blue-600 flex items-center gap-2">
                  <UnlockOutlined /> Quyền bổ sung (có thể thêm)
                </span>
              </Divider>

              <Checkbox.Group
                className="w-full"
                value={checkedExtraPermissions}
                onChange={(list) => setCheckedExtraPermissions(list as string[])}
              >
                <Collapse ghost defaultActiveKey={Object.keys(groupedPermissions)}>
                  {Object.entries(groupedPermissions).sort().map(([module, perms]) => {
                    // Chỉ hiển thị các quyền không phải mặc định
                    const extraPermsInModule = perms.filter(p =>
                      !isDefaultPermission(p.permissionName, selectedUser?.role || '')
                    );
                    if (extraPermsInModule.length === 0) return null;

                    return (
                      <Panel
                        key={module}
                        header={
                          <span className="flex items-center gap-2">
                            <Tag color={MODULE_COLORS[module] || 'default'}>{module}</Tag>
                            <span className="text-gray-400 text-sm">({extraPermsInModule.length} quyền có thể thêm)</span>
                          </span>
                        }
                      >
                        <Row gutter={[8, 8]}>
                          {extraPermsInModule.map(perm => (
                            <Col span={12} key={perm.permissionID}>
                              <Checkbox value={perm.permissionName} className="w-full">
                                <div className="flex items-center gap-1">
                                  <Tag color="purple" className="text-xs">{perm.action}</Tag>
                                  <span className="text-sm">{perm.permissionName}</span>
                                </div>
                              </Checkbox>
                            </Col>
                          ))}
                        </Row>
                      </Panel>
                    );
                  })}
                </Collapse>
              </Checkbox.Group>

              {Object.values(groupedPermissions).every(perms =>
                perms.every(p => isDefaultPermission(p.permissionName, selectedUser?.role || ''))
              ) && (
                  <Empty
                    description="Vai trò này đã có tất cả quyền. Không có quyền nào để thêm."
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PermissionsPage;