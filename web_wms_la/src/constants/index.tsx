import React from 'react';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    TruckOutlined,
    InboxOutlined,
    BarcodeOutlined,
    CloseOutlined,
    PrinterOutlined,
    BoxPlotOutlined,
    MobileOutlined,
    WifiOutlined,
} from '@ant-design/icons';
import type { POStatus, DeviceType } from '@/types/type.purchaseOrder';

export const PO_STATUS_CONFIG: Record<POStatus, { label: string; color: string; icon: React.ReactNode }> = {
    PENDING: { label: 'Chờ duyệt', color: 'warning', icon: <ClockCircleOutlined /> },
    CONFIRMED: { label: 'Đã xác nhận', color: 'processing', icon: <TruckOutlined /> },
    PARTIAL: { label: 'Nhận một phần', color: 'cyan', icon: <BoxPlotOutlined /> },
    DELIVERED: { label: 'Đã nhận đủ', color: 'success', icon: <CheckCircleOutlined /> },
    CANCELLED: { label: 'Đã hủy', color: 'error', icon: <CloseOutlined /> },
};

export const DEVICE_TYPE_CONFIG: Record<DeviceType, { label: string; icon: React.ReactNode }> = {
    PDA: { label: 'PDA / Máy cầm tay', icon: <MobileOutlined /> },
    PRINTER: { label: 'Máy in', icon: <PrinterOutlined /> },
    SCANNER: { label: 'Máy quét', icon: <BarcodeOutlined /> },
    ESL: { label: 'Nhãn điện tử', icon: <WifiOutlined /> },
    PHONE: { label: 'Điện thoại', icon: <MobileOutlined /> },
    OTHER: { label: 'Thiết bị khác', icon: <InboxOutlined /> },
    CONSUMABLE: { label: 'Vật tư tiêu hao', icon: <InboxOutlined /> },
};
