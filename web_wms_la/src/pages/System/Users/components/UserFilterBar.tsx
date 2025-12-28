import React from 'react';
import { Card, Row, Col, Input, Select, Button } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ROLE_OPTIONS, STATUS_OPTIONS } from '../constants';
import type { UserFilterBarProps } from '../types';

const UserFilterBar: React.FC<UserFilterBarProps> = ({
    searchText,
    roleFilter,
    statusFilter,
    onSearchChange,
    onRoleChange,
    onStatusChange,
    onSearch,
}) => {
    return (
        <Card
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: 20 } }}
        >
            <Row gutter={16} align="middle">
                <Col flex="auto">
                    <Input
                        prefix={<SearchOutlined className="text-gray-400" />}
                        placeholder="Tìm theo tên, email hoặc số điện thoại..."
                        value={searchText}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onPressEnter={onSearch}
                        allowClear
                        style={{ borderRadius: 8 }}
                    />
                </Col>
                <Col>
                    <Select
                        placeholder="Vai trò"
                        allowClear
                        options={ROLE_OPTIONS.map(r => ({ label: r.label, value: r.value }))}
                        value={roleFilter}
                        onChange={onRoleChange}
                        style={{ width: 160 }}
                    />
                </Col>
                <Col>
                    <Select
                        placeholder="Trạng thái"
                        allowClear
                        options={STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={onStatusChange}
                        style={{ width: 160 }}
                    />
                </Col>
                <Col>
                    <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
                        Tìm kiếm
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default UserFilterBar;
