import type { ReceivedItem } from '@/types/type.purchaseOrder';

/**
 * Format currency to Vietnamese Dong
 */
export const formatCurrency = (value?: number): string => {
    if (!value) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

/**
 * Validate Serial Number
 */
export const validateSerial = async (
    serial: string,
    receivedItems: ReceivedItem[],
    checkSerialExists: (serial: string) => Promise<{ success: boolean; data?: boolean }>
): Promise<{ valid: boolean; error?: string }> => {
    if (!serial.trim()) {
        return { valid: false, error: 'Serial không được để trống' };
    }
    // Check if already in current session
    if (receivedItems.some(item => item.serialNumber === serial)) {
        return { valid: false, error: 'Serial đã có trong danh sách nhận' };
    }
    // Check in database via API
    try {
        const response = await checkSerialExists(serial);
        if (response.success && response.data) {
            return { valid: false, error: 'Serial đã tồn tại trong kho' };
        }
    } catch (error) {
        console.error('Error checking serial:', error);
        // Continue if API fails - will be validated on submit
    }
    return { valid: true };
};

/**
 * Validate IMEI (15 digits)
 */
export const validateIMEI = (
    imei: string,
    receivedItems: ReceivedItem[]
): { valid: boolean; error?: string } => {
    if (!imei) return { valid: true };
    if (!/^\d{15}$/.test(imei)) {
        return { valid: false, error: 'IMEI phải có đúng 15 số' };
    }
    // Check if IMEI already in current session
    if (receivedItems.some(item => item.imei1 === imei || item.imei2 === imei)) {
        return { valid: false, error: 'IMEI đã có trong danh sách nhận' };
    }
    return { valid: true };
};
