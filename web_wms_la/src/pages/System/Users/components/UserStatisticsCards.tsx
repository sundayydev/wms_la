import React from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import {
    TeamOutlined,
    CheckCircleOutlined,
    LockOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { UserStatisticsCardsProps } from '../types';

const UserStatisticsCards: React.FC<UserStatisticsCardsProps> = ({ statistics }) => {
    if (!statistics) return null;

    const cards = [
        {
            title: 'Tổng người dùng',
            value: statistics.totalUsers,
            icon: <TeamOutlined style={{ fontSize: 24 }} />,
            color: '#1890ff',
            bgColor: '#e6f7ff',
        },
        {
            title: 'Đang hoạt động',
            value: statistics.activeUsers,
            icon: <CheckCircleOutlined style={{ fontSize: 24 }} />,
            color: '#52c41a',
            bgColor: '#f6ffed',
        },
        {
            title: 'Đang bị khóa',
            value: statistics.lockedUsers,
            icon: <LockOutlined style={{ fontSize: 24 }} />,
            color: '#ff4d4f',
            bgColor: '#fff2f0',
        },
        {
            title: 'Quản trị viên',
            value: statistics.usersByRole?.['ADMIN'] || 0,
            icon: <SafetyCertificateOutlined style={{ fontSize: 24 }} />,
            color: '#722ed1',
            bgColor: '#f9f0ff',
        },
    ];

    return (
        <Row gutter={16}>
            {cards.map((card, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                    <Card
                        bordered={false}
                        style={{
                            backgroundColor: card.bgColor,
                            borderRadius: 12,
                            border: `1px solid ${card.color}20`
                        }}
                    >
                        <Statistic
                            title={<span style={{ color: card.color, fontWeight: 500 }}>{card.title}</span>}
                            value={card.value}
                            valueStyle={{ color: card.color, fontSize: 28, fontWeight: 700 }}
                            prefix={<span style={{ color: card.color }}>{card.icon}</span>}
                        />
                    </Card>
                </Col>
            ))}
        </Row>
    );
};

export default UserStatisticsCards;
