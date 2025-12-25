// src/types/Customer.ts

export type CustomerType = 'INDIVIDUAL' | 'COMPANY';
export type CustomerGroup = 'RETAIL' | 'WHOLESALE' | 'VIP';

export interface CustomerContact {
    ContactID?: string; // Optional vì khi tạo mới chưa có ID
    ContactName: string;
    Position: string;
    Department?: string;
    PhoneNumber: string;
    Email?: string;
    IsDefaultReceiver: boolean;
    Note?: string;
}

export interface Customer {
    CustomerID: string;
    CustomerCode: string;
    CustomerName: string;
    Type: CustomerType;
    CustomerGroup: CustomerGroup;

    // Thông tin liên lạc chung
    PhoneNumber: string;
    Email?: string;

    // Địa chỉ
    Address?: string;
    City?: string;
    District?: string;
    Ward?: string;

    // Định danh
    TaxCode?: string;      // Dành cho Company
    DateOfBirth?: string;  // Dành cho Individual
    Gender?: string;       // Dành cho Individual

    Notes?: string;
    IsActive: boolean;

    // Danh sách liên hệ (Chỉ dùng ở FE để gửi về API)
    Contacts?: CustomerContact[];

    CreatedAt?: string;
    UpdatedAt?: string;
}