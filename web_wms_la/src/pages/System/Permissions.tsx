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
  Divider
} from 'antd';
import {
  SafetyCertificateOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  UserOutlined,
  SearchOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// ============================================================================
// 1. TYPES & INTERFACES (Khớp với DB)
// ============================================================================

interface PermissionType {
  PermissionID: string;
  PermissionName: string; // VD: "Xóa sản phẩm", "Xem báo cáo"
  Group?: string; // (Frontend only) Để gom nhóm hiển thị cho đẹp
}

interface UserType {
  UserID: string;
  Username: string;
  Role: string; // ADMIN, WAREHOUSE...
  AssignedPermissionIDs: string[]; // Danh sách ID quyền đã được cấp
}

// ============================================================================
// 2. MOCK DATA
// ============================================================================

// Danh sách tất cả quyền trong hệ thống (Bảng Permission)
const initialPermissions: PermissionType[] = [
  { PermissionID: 'p1', PermissionName: 'Xem Dashboard', Group: 'General' },
  { PermissionID: 'p2', PermissionName: 'Quản lý Người dùng', Group: 'System' },
  { PermissionID: 'p3', PermissionName: 'Xem tồn kho', Group: 'Inventory' },
  { PermissionID: 'p4', PermissionName: 'Nhập kho (Tạo PO)', Group: 'Inventory' },
  { PermissionID: 'p5', PermissionName: 'Xuất kho (Tạo SO)', Group: 'Inventory' },
  { PermissionID: 'p6', PermissionName: 'Điều chỉnh tồn kho', Group: 'Inventory' },
  { PermissionID: 'p7', PermissionName: 'Xem Báo cáo tài chính', Group: 'Finance' },
  { PermissionID: 'p8', PermissionName: 'Xóa đơn hàng', Group: 'Sales' },
];

// Danh sách User và quyền hiện tại của họ (Join User + UserPermission)
const initialUsers: UserType[] = [
  {
    UserID: 'u1',
    Username: 'admin_sys',
    Role: 'ADMIN',
    AssignedPermissionIDs: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
  },
  {
    UserID: 'u2',
    Username: 'kho_a',
    Role: 'WAREHOUSE',
    AssignedPermissionIDs: ['p1', 'p3', 'p4'] // Chỉ xem và nhập kho
  },
  {
    UserID: 'u3',
    Username: 'sale_b',
    Role: 'RECEPTIONIST',
    AssignedPermissionIDs: ['p1', 'p5'] // Chỉ xem và bán hàng
  },
];

const PermissionsPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState('1');
  const [permissions, setPermissions] = useState<PermissionType[]>(initialPermissions);
  const [users, setUsers] = useState<UserType[]>(initialUsers);

  // State cho Modal Phân quyền
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [checkedPermissions, setCheckedPermissions] = useState<string[]>([]);

  // State cho Modal Thêm Quyền mới
  const [isAddPermModalOpen, setIsAddPermModalOpen] = useState(false);
  const [newPermName, setNewPermName] = useState('');

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
      // Cập nhật state users (Thực tế sẽ gọi API update UserPermission)
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

  // --- Tab 2: Quản lý Danh mục Quyền ---

  const handleAddPermission = () => {
    if (!newPermName.trim()) {
      message.error('Vui lòng nhập tên quyền');
      return;
    }
    const newPerm: PermissionType = {
      PermissionID: `p${Date.now()}`,
      PermissionName: newPermName,
      Group: 'Other'
    };
    setPermissions([...permissions, newPerm]);
    setNewPermName('');
    setIsAddPermModalOpen(false);
    message.success('Thêm quyền mới thành công');
  };

  const handleDeletePermission = (id: string) => {
    setPermissions(permissions.filter(p => p.PermissionID !== id));
    message.success('Đã xóa quyền');
  };

  // --- Render ---

  // Helper để lấy tên quyền từ ID (dùng hiển thị Tag)
  const getPermissionName = (id: string) => permissions.find(p => p.PermissionID === id)?.PermissionName || id;

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
          {ids.length > 5 ? (
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

  const permissionColumns: ColumnsType<PermissionType> = [
    {
      title: 'ID',
      dataIndex: 'PermissionID',
      width: 100,
      render: (text) => <Text type="secondary" className="font-mono text-xs">{text}</Text>
    },
    {
      title: 'Tên quyền (Permission Name)',
      dataIndex: 'PermissionName',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>
    },
    {
      title: 'Nhóm (Group)', // Cột giả lập để UI đẹp
      dataIndex: 'Group',
      render: (text) => <Tag>{text}</Tag>
    },
    {
      title: '',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeletePermission(record.PermissionID)}
        />
      )
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
            // TAB 2: PERMISSION MANAGEMENT
            {
              key: '2',
              label: 'Danh mục Quyền',
              children: (
                <div>
                  <div className="flex justify-end mb-4">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      className="bg-blue-600"
                      onClick={() => setIsAddPermModalOpen(true)}
                    >
                      Tạo quyền mới
                    </Button>
                  </div>
                  <Table
                    columns={permissionColumns}
                    dataSource={permissions}
                    rowKey="PermissionID"
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* MODAL 1: PHÂN QUYỀN CHO USER */}
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
        width={700}
        okText="Lưu cấu hình"
        cancelText="Hủy"
      >
        <p className="mb-4 text-gray-500">
          Chọn các hành động mà người dùng này được phép thực hiện.
          <br /><span className="text-xs text-orange-500">* User đã có vai trò là <b>{selectedUser?.Role}</b>, các quyền dưới đây là quyền bổ sung.</span>
        </p>

        <Divider />

        <Checkbox.Group
          className="w-full"
          value={checkedPermissions}
          onChange={(list) => setCheckedPermissions(list as string[])}
        >
          <Row gutter={[16, 16]}>
            {/* Render Permission Grouped */}
            {Object.entries(
              permissions.reduce((groups, item) => {
                const group = item.Group || 'Other';
                groups[group] = groups[group] || [];
                groups[group].push(item);
                return groups;
              }, {} as Record<string, PermissionType[]>)
            ).map(([groupName, groupPerms]) => (
              <Col span={24} key={groupName}>
                <h4 className="font-bold text-gray-700 mb-2 uppercase text-xs tracking-wider border-b pb-1">
                  {groupName}
                </h4>
                <Row gutter={[8, 8]}>
                  {groupPerms.map(perm => (
                    <Col span={12} key={perm.PermissionID}>
                      <Checkbox value={perm.PermissionID} className="ml-0">
                        {perm.PermissionName}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </Col>
            ))}
          </Row>
        </Checkbox.Group>
      </Modal>

      {/* MODAL 2: THÊM QUYỀN MỚI */}
      <Modal
        title="Thêm quyền hạn mới"
        open={isAddPermModalOpen}
        onOk={handleAddPermission}
        onCancel={() => setIsAddPermModalOpen(false)}
      >
        <div className="pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tên quyền hạn</label>
          <Input
            placeholder="Ví dụ: Xóa nhà cung cấp"
            value={newPermName}
            onChange={(e) => setNewPermName(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-2">
            Tên quyền nên mô tả rõ hành động (Ví dụ: Chỉnh sửa, Xóa, Xem...)
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionsPage;