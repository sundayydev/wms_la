import React, { useState, useMemo } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Tabs,
  Switch,
  InputNumber,
  Select,
  message,
  Typography,
  Tag,
  ColorPicker,
  Upload,
  Image,
  Space,
  Divider,
  Badge
} from 'antd';
import {
  GlobalOutlined,
  ShopOutlined,
  DollarOutlined,
  PrinterOutlined,
  SettingOutlined,
  SaveOutlined,
  UndoOutlined,
  UploadOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  BranchesOutlined,
  MailOutlined,
  PhoneOutlined,
  LinkOutlined,
  BgColorsOutlined,
  FileImageOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  KeyOutlined,
  CloudServerOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;
const { TextArea } = Input;

// ============================================================================
// 1. TYPES & INTERFACES
// ============================================================================

interface SettingOption {
  label: string;
  value: string;
}

type CategoryType = 'GENERAL' | 'INVENTORY' | 'FINANCE' | 'PRINTING' | 'SYSTEM';
type InputTypeType = 'TEXT' | 'TEXTAREA' | 'SWITCH' | 'SELECT' | 'NUMBER' | 'PASSWORD' | 'COLOR' | 'IMAGE';

interface AppSetting {
  SettingID: string;
  SettingKey: string;
  SettingValue: string | null;
  Category: CategoryType;
  Description: string | null;
  DataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  InputType: InputTypeType;
  Options: SettingOption[] | null;
  IsEncrypted: boolean;
  IsSystem: boolean;
}

// ============================================================================
// 2. MOCK DATA - DỮ LIỆU CẤU HÌNH CHI TIẾT
// ============================================================================

const mockSettings: AppSetting[] = [
  // =================================================================
  // GENERAL - THÔNG TIN DOANH NGHIỆP
  // =================================================================
  {
    SettingID: 'G001',
    SettingKey: 'company_name',
    SettingValue: 'Công ty TNHH Giải pháp công nghệ Lead And Aim Việt Nam',
    Category: 'GENERAL',
    Description: 'Tên pháp lý đầy đủ của doanh nghiệp, hiển thị trên hóa đơn và báo cáo.',
    DataType: 'STRING',
    InputType: 'TEXT',
    Options: null,
    IsEncrypted: false,
    IsSystem: true
  },
  {
    SettingID: 'G002',
    SettingKey: 'company_short_name',
    SettingValue: 'Lead And Aim',
    Category: 'GENERAL',
    Description: 'Tên viết tắt của công ty, hiển thị trên Header ứng dụng.',
    DataType: 'STRING',
    InputType: 'TEXT',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'G003',
    SettingKey: 'company_tax_code',
    SettingValue: '0312345678',
    Category: 'GENERAL',
    Description: 'Mã số thuế doanh nghiệp (MST) để xuất hóa đơn điện tử.',
    DataType: 'STRING',
    InputType: 'TEXT',
    Options: null,
    IsEncrypted: false,
    IsSystem: true
  },
  {
    SettingID: 'G004',
    SettingKey: 'headquarters_address',
    SettingValue: 'Tầng 15, Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    Category: 'GENERAL',
    Description: 'Địa chỉ Trụ sở chính (Headquarters). Địa chỉ các chi nhánh/kho được cấu hình riêng tại module Danh mục Kho.',
    DataType: 'STRING',
    InputType: 'TEXTAREA',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'G005',
    SettingKey: 'company_hotline',
    SettingValue: '1900 9999 88',
    Category: 'GENERAL',
    Description: 'Số điện thoại tổng đài hỗ trợ khách hàng (CSKH).',
    DataType: 'STRING',
    InputType: 'TEXT',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'G006',
    SettingKey: 'contact_email',
    SettingValue: 'support@leadandaim.com',
    Category: 'GENERAL',
    Description: 'Email liên hệ chung, nhận thông báo từ hệ thống.',
    DataType: 'STRING',
    InputType: 'TEXT',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'G007',
    SettingKey: 'company_website',
    SettingValue: 'https://wms-la.com',
    Category: 'GENERAL',
    Description: 'Website chính thức của doanh nghiệp.',
    DataType: 'STRING',
    InputType: 'TEXT',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'G008',
    SettingKey: 'company_logo',
    SettingValue: '/LA_Logo.png',
    Category: 'GENERAL',
    Description: 'Logo công ty hiển thị trên Header, Phiếu in và Báo cáo. Khuyến nghị: PNG trong suốt, kích thước 200x80px.',
    DataType: 'STRING',
    InputType: 'IMAGE',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'G009',
    SettingKey: 'primary_color',
    SettingValue: '#1677ff',
    Category: 'GENERAL',
    Description: 'Màu chủ đạo (Brand Color) của giao diện ứng dụng.',
    DataType: 'STRING',
    InputType: 'COLOR',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },

  // =================================================================
  // INVENTORY - QUẢN LÝ KHO & TỒN KHO
  // =================================================================
  {
    SettingID: 'I001',
    SettingKey: 'multi_branch_mode',
    SettingValue: 'true',
    Category: 'INVENTORY',
    Description: 'Kích hoạt chế độ đa chi nhánh/đa kho. Khi bật, dữ liệu tồn kho, đơn hàng sẽ được phân tách theo từng kho.',
    DataType: 'BOOLEAN',
    InputType: 'SWITCH',
    Options: null,
    IsEncrypted: false,
    IsSystem: true
  },
  {
    SettingID: 'I002',
    SettingKey: 'default_warehouse_id',
    SettingValue: 'wh-hcm-01',
    Category: 'INVENTORY',
    Description: 'Kho mặc định được chọn tự động khi tạo phiếu nhập/xuất mới (nếu người dùng chưa được gán kho cố định).',
    DataType: 'STRING',
    InputType: 'SELECT',
    Options: [
      { label: 'Kho Tổng HCM - Quận 7', value: 'wh-hcm-01' },
      { label: 'Kho Chi nhánh Hà Nội - Long Biên', value: 'wh-hn-01' },
      { label: 'Kho Chi nhánh Đà Nẵng - Hải Châu', value: 'wh-dn-01' }
    ],
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'I003',
    SettingKey: 'low_stock_threshold',
    SettingValue: '10',
    Category: 'INVENTORY',
    Description: 'Mức cảnh báo tồn kho tối thiểu. Sản phẩm có số lượng dưới mức này sẽ hiển thị cảnh báo màu vàng.',
    DataType: 'NUMBER',
    InputType: 'NUMBER',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'I004',
    SettingKey: 'critical_stock_threshold',
    SettingValue: '5',
    Category: 'INVENTORY',
    Description: 'Mức cảnh báo tồn kho nghiêm trọng. Sản phẩm dưới mức này sẽ hiển thị cảnh báo màu đỏ.',
    DataType: 'NUMBER',
    InputType: 'NUMBER',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'I005',
    SettingKey: 'allow_negative_stock',
    SettingValue: 'false',
    Category: 'INVENTORY',
    Description: 'Cho phép xuất kho khi số lượng tồn = 0 (xuất âm). Nếu tắt, hệ thống sẽ chặn khi không đủ hàng.',
    DataType: 'BOOLEAN',
    InputType: 'SWITCH',
    Options: null,
    IsEncrypted: false,
    IsSystem: true
  },
  {
    SettingID: 'I006',
    SettingKey: 'auto_generate_sku',
    SettingValue: 'true',
    Category: 'INVENTORY',
    Description: 'Tự động sinh mã SKU theo quy tắc hệ thống khi tạo sản phẩm mới.',
    DataType: 'BOOLEAN',
    InputType: 'SWITCH',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'I007',
    SettingKey: 'sku_format',
    SettingValue: 'CAT-YYYYMM-####',
    Category: 'INVENTORY',
    Description: 'Định dạng mã SKU tự động. VD: CAT-YYYYMM-#### → PHO-202512-0001',
    DataType: 'STRING',
    InputType: 'TEXT',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'I008',
    SettingKey: 'require_serial_number',
    SettingValue: 'true',
    Category: 'INVENTORY',
    Description: 'Bắt buộc nhập Serial Number khi nhập kho các thiết bị điện tử.',
    DataType: 'BOOLEAN',
    InputType: 'SWITCH',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },

  // =================================================================
  // FINANCE - TÀI CHÍNH & THUẾ
  // =================================================================
  {
    SettingID: 'F001',
    SettingKey: 'default_currency',
    SettingValue: 'VND',
    Category: 'FINANCE',
    Description: 'Đơn vị tiền tệ mặc định cho tất cả giao dịch tài chính.',
    DataType: 'STRING',
    InputType: 'SELECT',
    Options: [
      { label: '🇻🇳 Việt Nam Đồng (VND)', value: 'VND' },
      { label: '🇺🇸 US Dollar (USD)', value: 'USD' },
      { label: '🇪🇺 Euro (EUR)', value: 'EUR' },
      { label: '🇯🇵 Japanese Yen (JPY)', value: 'JPY' }
    ],
    IsEncrypted: false,
    IsSystem: true
  },
  {
    SettingID: 'F002',
    SettingKey: 'vat_rate',
    SettingValue: '10',
    Category: 'FINANCE',
    Description: 'Mức thuế VAT mặc định (%) áp dụng cho sản phẩm/dịch vụ.',
    DataType: 'NUMBER',
    InputType: 'NUMBER',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'F003',
    SettingKey: 'auto_apply_vat',
    SettingValue: 'true',
    Category: 'FINANCE',
    Description: 'Tự động áp dụng thuế VAT khi tạo hóa đơn bán hàng.',
    DataType: 'BOOLEAN',
    InputType: 'SWITCH',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'F004',
    SettingKey: 'price_includes_vat',
    SettingValue: 'true',
    Category: 'FINANCE',
    Description: 'Giá bán đã bao gồm VAT. Nếu tắt, VAT sẽ được tính thêm vào tổng hóa đơn.',
    DataType: 'BOOLEAN',
    InputType: 'SWITCH',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'F005',
    SettingKey: 'invoice_prefix',
    SettingValue: 'INV',
    Category: 'FINANCE',
    Description: 'Tiền tố mã hóa đơn bán hàng. VD: INV-2025-00001',
    DataType: 'STRING',
    InputType: 'TEXT',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'F006',
    SettingKey: 'payment_due_days',
    SettingValue: '30',
    Category: 'FINANCE',
    Description: 'Số ngày thanh toán mặc định cho hóa đơn công nợ.',
    DataType: 'NUMBER',
    InputType: 'NUMBER',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },

  // =================================================================
  // PRINTING - IN ẤN & CHỨNG TỪ
  // =================================================================
  {
    SettingID: 'P001',
    SettingKey: 'default_print_format',
    SettingValue: 'A4',
    Category: 'PRINTING',
    Description: 'Khổ giấy mặc định khi in phiếu xuất/nhập kho, hóa đơn.',
    DataType: 'STRING',
    InputType: 'SELECT',
    Options: [
      { label: 'Khổ A4 (210x297mm) - Văn phòng', value: 'A4' },
      { label: 'Khổ A5 (148x210mm) - Tiết kiệm', value: 'A5' },
      { label: 'K80 (80mm) - Máy in Bill/POS', value: 'K80' },
      { label: 'Tem 50x30mm - Nhãn sản phẩm', value: 'LABEL_50x30' }
    ],
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'P002',
    SettingKey: 'company_stamp_image',
    SettingValue: '/con-dau-tron-cong-ty-mau-doanh-nghiep-tu-nhan.jpg',
    Category: 'PRINTING',
    Description: 'Hình ảnh con dấu đỏ của công ty (dùng cho hóa đơn điện tử, phiếu in). Khuyến nghị: PNG trong suốt.',
    DataType: 'STRING',
    InputType: 'IMAGE',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'P003',
    SettingKey: 'signature_image',
    SettingValue: null,
    Category: 'PRINTING',
    Description: 'Hình ảnh chữ ký điện tử của Giám đốc/Kế toán trưởng (hiển thị trên hóa đơn).',
    DataType: 'STRING',
    InputType: 'IMAGE',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'P004',
    SettingKey: 'invoice_footer_text',
    SettingValue: 'Cảm ơn Quý khách đã tin tưởng sử dụng dịch vụ của Lead And Aim!\nHàng đã mua vui lòng kiểm tra trước khi rời quầy. Đổi trả trong vòng 7 ngày với hóa đơn.',
    Category: 'PRINTING',
    Description: 'Nội dung hiển thị dưới chân trang hóa đơn/phiếu xuất kho.',
    DataType: 'STRING',
    InputType: 'TEXTAREA',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'P005',
    SettingKey: 'print_qr_on_invoice',
    SettingValue: 'true',
    Category: 'PRINTING',
    Description: 'In mã QR Code tra cứu hóa đơn điện tử trên phiếu.',
    DataType: 'BOOLEAN',
    InputType: 'SWITCH',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },

  // =================================================================
  // SYSTEM - HỆ THỐNG & BẢO MẬT
  // =================================================================
  {
    SettingID: 'S001',
    SettingKey: 'date_format',
    SettingValue: 'DD/MM/YYYY',
    Category: 'SYSTEM',
    Description: 'Định dạng ngày tháng hiển thị trong toàn bộ hệ thống.',
    DataType: 'STRING',
    InputType: 'SELECT',
    Options: [
      { label: 'DD/MM/YYYY (25/12/2025)', value: 'DD/MM/YYYY' },
      { label: 'MM/DD/YYYY (12/25/2025)', value: 'MM/DD/YYYY' },
      { label: 'YYYY-MM-DD (2025-12-25)', value: 'YYYY-MM-DD' }
    ],
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'S002',
    SettingKey: 'time_zone',
    SettingValue: 'Asia/Ho_Chi_Minh',
    Category: 'SYSTEM',
    Description: 'Múi giờ hoạt động của hệ thống.',
    DataType: 'STRING',
    InputType: 'SELECT',
    Options: [
      { label: '(GMT+07:00) Hà Nội, Bangkok, Jakarta', value: 'Asia/Ho_Chi_Minh' },
      { label: '(GMT+00:00) UTC - Coordinated Universal Time', value: 'UTC' },
      { label: '(GMT-05:00) Eastern Time (US & Canada)', value: 'America/New_York' }
    ],
    IsEncrypted: false,
    IsSystem: true
  },
  {
    SettingID: 'S003',
    SettingKey: 'session_timeout',
    SettingValue: '60',
    Category: 'SYSTEM',
    Description: 'Thời gian tự động đăng xuất nếu người dùng không hoạt động (đơn vị: phút).',
    DataType: 'NUMBER',
    InputType: 'NUMBER',
    Options: null,
    IsEncrypted: false,
    IsSystem: true
  },
  {
    SettingID: 'S004',
    SettingKey: 'max_login_attempts',
    SettingValue: '5',
    Category: 'SYSTEM',
    Description: 'Số lần đăng nhập sai tối đa trước khi tài khoản bị khóa tạm thời.',
    DataType: 'NUMBER',
    InputType: 'NUMBER',
    Options: null,
    IsEncrypted: false,
    IsSystem: true
  },
  {
    SettingID: 'S005',
    SettingKey: 'maintenance_mode',
    SettingValue: 'false',
    Category: 'SYSTEM',
    Description: 'Bật chế độ bảo trì hệ thống. Khi bật, chỉ Admin mới có thể truy cập.',
    DataType: 'BOOLEAN',
    InputType: 'SWITCH',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'S006',
    SettingKey: 'data_isolation_level',
    SettingValue: 'STRICT',
    Category: 'SYSTEM',
    Description: 'Mức độ chia sẻ dữ liệu giữa các chi nhánh trong chế độ đa kho.',
    DataType: 'STRING',
    InputType: 'SELECT',
    Options: [
      { label: 'Cách ly hoàn toàn (STRICT) - Mỗi chi nhánh chỉ thấy dữ liệu của mình', value: 'STRICT' },
      { label: 'Xem chéo (SHARED_VIEW) - Có thể xem tồn kho chi nhánh khác', value: 'SHARED_VIEW' },
      { label: 'Hợp nhất (UNIFIED) - Dữ liệu được gộp chung', value: 'UNIFIED' }
    ],
    IsEncrypted: false,
    IsSystem: true
  },
  {
    SettingID: 'S007',
    SettingKey: 'smtp_host',
    SettingValue: 'smtp.gmail.com',
    Category: 'SYSTEM',
    Description: 'Địa chỉ máy chủ SMTP để gửi email thông báo.',
    DataType: 'STRING',
    InputType: 'TEXT',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'S008',
    SettingKey: 'smtp_port',
    SettingValue: '587',
    Category: 'SYSTEM',
    Description: 'Cổng SMTP (thường là 587 cho TLS hoặc 465 cho SSL).',
    DataType: 'NUMBER',
    InputType: 'NUMBER',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'S009',
    SettingKey: 'smtp_username',
    SettingValue: 'noreply@wms-logistics.vn',
    Category: 'SYSTEM',
    Description: 'Tài khoản email để gửi thông báo hệ thống.',
    DataType: 'STRING',
    InputType: 'TEXT',
    Options: null,
    IsEncrypted: false,
    IsSystem: false
  },
  {
    SettingID: 'S010',
    SettingKey: 'smtp_password',
    SettingValue: '',
    Category: 'SYSTEM',
    Description: 'Mật khẩu ứng dụng Email (App Password). Dữ liệu được mã hóa khi lưu vào database.',
    DataType: 'STRING',
    InputType: 'PASSWORD',
    Options: null,
    IsEncrypted: true,
    IsSystem: false
  },
  {
    SettingID: 'S011',
    SettingKey: 'api_key',
    SettingValue: '',
    Category: 'SYSTEM',
    Description: 'API Key để tích hợp với hệ thống ERP/CRM bên ngoài. Giá trị được mã hóa.',
    DataType: 'STRING',
    InputType: 'PASSWORD',
    Options: null,
    IsEncrypted: true,
    IsSystem: false
  }
];

// ============================================================================
// 3. CONFIG UI (MÀU SẮC, ICON & LABEL)
// ============================================================================

interface CategoryConfig {
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const categoryConfig: Record<CategoryType, CategoryConfig> = {
  GENERAL: {
    icon: <GlobalOutlined />,
    label: 'Thông tin doanh nghiệp',
    description: 'Cấu hình thông tin cơ bản: tên, địa chỉ, logo, liên hệ',
    color: '#1677ff',
    bgColor: '#e6f4ff'
  },
  INVENTORY: {
    icon: <ShopOutlined />,
    label: 'Kho & Tồn kho',
    description: 'Quản lý đa kho, ngưỡng cảnh báo, mã SKU tự động',
    color: '#52c41a',
    bgColor: '#f6ffed'
  },
  FINANCE: {
    icon: <DollarOutlined />,
    label: 'Tài chính & Thuế',
    description: 'Tiền tệ, thuế VAT, định dạng hóa đơn',
    color: '#faad14',
    bgColor: '#fffbe6'
  },
  PRINTING: {
    icon: <PrinterOutlined />,
    label: 'In ấn & Chứng từ',
    description: 'Mẫu in, con dấu, chữ ký điện tử, QR Code',
    color: '#eb2f96',
    bgColor: '#fff0f6'
  },
  SYSTEM: {
    icon: <SettingOutlined />,
    label: 'Hệ thống & Bảo mật',
    description: 'Múi giờ, phiên làm việc, SMTP Email, API Key',
    color: '#722ed1',
    bgColor: '#f9f0ff'
  }
};

// Labels tiếng Việt cho các SettingKey
const settingLabels: Record<string, string> = {
  // GENERAL
  company_name: 'Tên công ty',
  company_short_name: 'Tên viết tắt',
  company_tax_code: 'Mã số thuế (MST)',
  headquarters_address: 'Địa chỉ trụ sở',
  company_hotline: 'Hotline CSKH',
  contact_email: 'Email liên hệ',
  company_website: 'Website',
  company_logo: 'Logo công ty',
  primary_color: 'Màu thương hiệu',

  // INVENTORY
  multi_branch_mode: 'Chế độ đa chi nhánh',
  default_warehouse_id: 'Kho mặc định',
  low_stock_threshold: 'Ngưỡng tồn kho thấp',
  critical_stock_threshold: 'Ngưỡng tồn kho nghiêm trọng',
  allow_negative_stock: 'Cho phép xuất âm',
  auto_generate_sku: 'Tự động tạo mã SKU',
  sku_format: 'Định dạng mã SKU',
  require_serial_number: 'Bắt buộc nhập Serial',

  // FINANCE
  default_currency: 'Đơn vị tiền tệ',
  vat_rate: 'Thuế VAT (%)',
  auto_apply_vat: 'Tự động tính VAT',
  price_includes_vat: 'Giá đã gồm VAT',
  invoice_prefix: 'Tiền tố mã hóa đơn',
  payment_due_days: 'Hạn thanh toán (ngày)',

  // PRINTING
  default_print_format: 'Khổ giấy in',
  company_stamp_image: 'Con dấu công ty',
  signature_image: 'Chữ ký điện tử',
  invoice_footer_text: 'Ghi chú chân hóa đơn',
  print_qr_on_invoice: 'In mã QR trên hóa đơn',

  // SYSTEM
  date_format: 'Định dạng ngày',
  time_zone: 'Múi giờ',
  session_timeout: 'Thời gian hết phiên (phút)',
  max_login_attempts: 'Số lần đăng nhập sai tối đa',
  maintenance_mode: 'Chế độ bảo trì',
  data_isolation_level: 'Mức cách ly dữ liệu',
  smtp_host: 'SMTP Server',
  smtp_port: 'SMTP Port',
  smtp_username: 'SMTP Username',
  smtp_password: 'SMTP Password',
  api_key: 'API Key tích hợp'
};

// ============================================================================
// 4. MAIN COMPONENT
// ============================================================================

const SettingsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Chuyển đổi dữ liệu từ DB (String) sang định dạng Form
  const initialValues = useMemo(() => {
    const values: Record<string, unknown> = {};
    mockSettings.forEach(setting => {
      if (setting.DataType === 'BOOLEAN') {
        values[setting.SettingKey] = setting.SettingValue === 'true';
      } else if (setting.DataType === 'NUMBER') {
        values[setting.SettingKey] = Number(setting.SettingValue);
      } else {
        values[setting.SettingKey] = setting.SettingValue;
      }
    });
    return values;
  }, []);

  // Xử lý lưu cấu hình
  const handleSave = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      // Chuyển đổi về string để gửi API
      const payload = Object.keys(values).map(key => ({
        key,
        value: String(values[key])
      }));
      console.log('Saving Settings Payload:', payload);

      await new Promise(resolve => setTimeout(resolve, 800));
      message.success('Cập nhật cấu hình thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi lưu cấu hình!');
    } finally {
      setLoading(false);
    }
  };

  // Render Input Component dựa trên InputType
  const renderFormItemInput = (setting: AppSetting) => {
    switch (setting.InputType) {
      case 'SWITCH':
        return <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />;

      case 'NUMBER':
        return <InputNumber min={0} style={{ minWidth: 100, width: '100%' }} />;

      case 'TEXTAREA':
        return <TextArea rows={3} placeholder="Nhập nội dung..." style={{ minWidth: 600, width: '100%' }} />;

      case 'SELECT':
        return (
          <Select
            className="w-full"
            options={setting.Options?.map(opt => ({ label: opt.label, value: opt.value }))}
            placeholder="-- Chọn giá trị --"
          />
        );

      case 'PASSWORD':
        return (
          <Input.Password
            placeholder={setting.IsEncrypted ? '••••••••' : 'Nhập mật khẩu'}
            className="w-full"
            style={{ minWidth: 300, width: '100%' }}
          />
        );

      case 'COLOR':
        return <ColorPicker showText format="hex" />;

      case 'IMAGE':
        return (
          <Space size="middle">
            {setting.SettingValue ? (
              <div style={{ border: '1px solid #f0f0f0', padding: 4, borderRadius: 8, background: '#fafafa' }}>
                <Image
                  src={setting.SettingValue}
                  alt={setting.SettingKey}
                  width={120}
                  height={60}
                  style={{ objectFit: 'contain' }}
                  fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAxMjAgNjAiPjxyZWN0IGZpbGw9IiNmNWY1ZjUiIHdpZHRoPSIxMjAiIGhlaWdodD0iNjAiLz48dGV4dCB4PSI2MCIgeT0iMzAiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4="
                />
              </div>
            ) : (
              <div style={{
                width: 120,
                height: 60,
                background: '#f5f5f5',
                border: '1px dashed #d9d9d9',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: 12
              }}>
                <FileImageOutlined style={{ marginRight: 4 }} /> Chưa có ảnh
              </div>
            )}
            <Upload showUploadList={false} beforeUpload={() => false} accept="image/*">
              <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
            </Upload>
          </Space>
        );

      default:
        return <Input placeholder="Nhập giá trị..." style={{ minWidth: 300, width: '100%' }} />;
    }
  };

  // Render Tab Content - Danh sách Settings của 1 Category
  const renderSettingsGroup = (category: CategoryType) => {
    const groupSettings = mockSettings.filter(s => s.Category === category);
    const config = categoryConfig[category];

    return (
      <div style={{ padding: '24px 32px', maxWidth: 900 }}>
        {/* Category Header */}
        <div style={{ marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
          <Space size="middle">
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: config.bgColor,
              color: config.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24
            }}>
              {config.icon}
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>{config.label}</Title>
              <Text type="secondary">{config.description}</Text>
            </div>
          </Space>
        </div>

        {/* Settings List */}
        {groupSettings.map((setting) => {
          const label = settingLabels[setting.SettingKey] || setting.SettingKey;
          const isSwitch = setting.InputType === 'SWITCH';

          return (
            <div
              key={setting.SettingID}
              style={{
                padding: '16px 0',
                borderBottom: '1px solid #f5f5f5'
              }}
            >
              <Form.Item
                name={setting.SettingKey}
                valuePropName={isSwitch ? 'checked' : 'value'}
                style={{ marginBottom: 0 }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: isSwitch ? 'center' : 'flex-start',
                  flexDirection: isSwitch ? 'row' : 'column',
                  gap: isSwitch ? 24 : 12
                }}>
                  {/* Label & Description */}
                  <div style={{ flex: 1 }}>
                    <Space size={8} style={{ marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>{label}</Text>
                      {setting.IsSystem && (
                        <Tag color="blue" style={{ fontSize: 10, lineHeight: '18px' }}>SYSTEM</Tag>
                      )}
                      {setting.IsEncrypted && (
                        <Tag icon={<LockOutlined />} color="gold" style={{ fontSize: 10, lineHeight: '18px' }}>
                          ENCRYPTED
                        </Tag>
                      )}
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>{setting.Description}</Text>
                    </div>
                  </div>

                  {/* Input Field */}
                  <div style={{ flexShrink: 0 }}>
                    <Form.Item name={setting.SettingKey} valuePropName={isSwitch ? 'checked' : 'value'} noStyle>
                      {renderFormItemInput(setting)}
                    </Form.Item>
                  </div>
                </div>
              </Form.Item>
            </div>
          );
        })}
      </div>
    );
  };

  // Tạo Tab Items
  const tabItems = (Object.keys(categoryConfig) as CategoryType[]).map((category) => {
    const config = categoryConfig[category];
    const count = mockSettings.filter(s => s.Category === category).length;

    return {
      key: category,
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 4px' }}>
          <Badge count={count} size="small" offset={[-2, 2]} color={config.color}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: config.bgColor,
              color: config.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18
            }}>
              {config.icon}
            </div>
          </Badge>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 500, fontSize: 14, lineHeight: 1.3 }}>{config.label}</div>
            <div style={{ fontSize: 11, color: '#999', lineHeight: 1.2 }}>{count} thiết lập</div>
          </div>
        </div>
      ),
      children: renderSettingsGroup(category),
    };
  });

  return (
    <div style={{ width: '100%' }}>
      {/* HEADER */}
      <div style={{
        marginBottom: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <SettingOutlined style={{ marginRight: 12 }} />
            Cấu hình hệ thống
          </Title>
          <Text type="secondary">
            Điều chỉnh các tham số vận hành toàn bộ phần mềm WMS Logistics
          </Text>
        </div>
        <Space size="middle">
          <Button
            icon={<UndoOutlined />}
            onClick={() => form.resetFields()}
          >
            Khôi phục mặc định
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => form.submit()}
          >
            Lưu thay đổi
          </Button>
        </Space>
      </div>

      {/* MAIN CONTENT */}
      <Card
        bordered={false}
        style={{ borderRadius: 12 }}
        styles={{ body: { padding: 0 } }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSave}
        >
          <Tabs
            defaultActiveKey="GENERAL"
            tabPosition="left"
            items={tabItems}
            style={{ minHeight: 700 }}
            tabBarStyle={{
              width: 280,
              paddingTop: 16,
              paddingBottom: 16,
              backgroundColor: '#fafafa',
              borderRight: '1px solid #f0f0f0'
            }}
          />
        </Form>
      </Card>
    </div>
  );
};

export default SettingsPage;