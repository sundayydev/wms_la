import React, { forwardRef } from 'react';

export interface ServiceData {
  ticketCode: string;
  date: string;
  customerName: string;
  phone: string;
  deviceModel: string;
  imei: string;
  problem: string; // Lỗi khách báo
  condition: string; // Ngoại quan (Trầy xước, cấn móp...)
  accessories: string[]; // Phụ kiện kèm theo
  technician?: string;
  estimatedDate: string;
}

export const ServiceReceipt = forwardRef<HTMLDivElement, { data: ServiceData }>(({ data }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-black font-sans max-w-[210mm] mx-auto text-sm border-2 border-dashed border-gray-300 m-4">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-4 mb-4">
        <h2 className="font-bold text-2xl uppercase">Phiếu Biên Nhận Sửa Chữa</h2>
        <p className="font-bold text-lg mt-1">Mã phiếu: {data.ticketCode}</p>
        <p className="italic text-sm">Ngày tiếp nhận: {data.date}</p>
      </div>

      {/* Thông tin Khách & Máy */}
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div>
          <h3 className="font-bold bg-gray-200 p-1 mb-2">1. Thông tin khách hàng</h3>
          <p>Khách hàng: <span className="font-bold">{data.customerName}</span></p>
          <p>Điện thoại: <span className="font-bold">{data.phone}</span></p>
        </div>
        <div>
          <h3 className="font-bold bg-gray-200 p-1 mb-2">2. Thông tin thiết bị</h3>
          <p>Model: <span className="font-bold">{data.deviceModel}</span></p>
          <p>IMEI/Serial: <span className="font-mono font-bold">{data.imei}</span></p>
        </div>
      </div>

      {/* Tình trạng tiếp nhận (Quan trọng) */}
      <div className="mb-4">
        <h3 className="font-bold bg-gray-200 p-1 mb-2">3. Tình trạng tiếp nhận</h3>
        <div className="border p-2">
          <p className="mb-1"><span className="font-semibold">Mô tả lỗi:</span> {data.problem}</p>
          <p className="mb-1"><span className="font-semibold">Ngoại quan:</span> {data.condition}</p>
          <p><span className="font-semibold">Phụ kiện kèm theo:</span> {data.accessories.length > 0 ? data.accessories.join(', ') : 'Không có (Chỉ nhận máy trần)'}</p>
        </div>
      </div>

      {/* Cam kết */}
      <div className="mb-6 text-xs text-justify">
        <h3 className="font-bold bg-gray-200 p-1 mb-2">4. Quy định bảo hành & sửa chữa</h3>
        <ul className="list-disc pl-4 space-y-1">
          <li>Quý khách vui lòng kiểm tra kỹ ngoại quan thiết bị và xác nhận tình trạng trước khi rời khỏi quầy.</li>
          <li>Cửa hàng không chịu trách nhiệm với dữ liệu cá nhân trong máy. Vui lòng sao lưu trước khi sửa chữa.</li>
          <li>Đối với máy sửa chữa phần cứng, thời gian bảo hành là 30 ngày cho lỗi đã sửa.</li>
          <li>Quý khách vui lòng mang theo phiếu này khi đến nhận máy.</li>
        </ul>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-8 px-8">
        <div className="text-center">
          <p className="font-bold">Nhân viên tiếp nhận</p>
          <p className="italic text-xs mb-8">(Ký tên)</p>
          <p className="font-semibold">{data.technician || '....................'}</p>
        </div>
        <div className="text-center">
          <p className="font-bold">Khách hàng</p>
          <p className="italic text-xs mb-8">(Ký xác nhận tình trạng máy)</p>
          <p className="font-semibold">{data.customerName}</p>
        </div>
      </div>

      <div className="text-center mt-8 border-t pt-2">
        <p className="font-bold text-lg">Hẹn trả máy: {data.estimatedDate}</p>
        <p className="italic text-xs">Hotline hỗ trợ: 1900 1234</p>
      </div>
    </div>
  );
});