import React, { forwardRef } from 'react';

export interface InboundNoteData {
  code: string;
  date: string;
  warehouse: string;
  supplier: string; // Hoặc người giao
  deliverer: string; // Người giao hàng thực tế
  reason: string;
  items: {
    name: string;
    sku: string;
    unit: string;
    qty: number;
    price?: number; // Có thể ẩn nếu không muốn thủ kho biết giá
    total?: number;
  }[];
}

export const InboundNote = forwardRef<HTMLDivElement, { data: InboundNoteData }>(({ data }, ref) => {
  return (
    <div ref={ref} className="p-10 bg-white text-black font-serif max-w-[210mm] mx-auto text-sm">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="font-bold uppercase">Công Ty TNHH WMS LA</h3>
          <p>123 Đường ABC, Quận 1, TP.HCM</p>
        </div>
        <div className="text-center">
          <h3 className="font-bold text-xl uppercase">Phiếu Nhập Kho</h3>
          <p className="italic">Ngày.....tháng.....năm......</p>
          <p className="font-bold">Số: {data.code}</p>
        </div>
        <div className="text-right text-xs">
          <p>Mẫu số: 01-VT</p>
          <p>(TT 200/2014/TT-BTC)</p>
        </div>
      </div>

      {/* Info */}
      <div className="mb-4 space-y-1">
        <p>- Họ tên người giao: <span className="font-semibold">{data.deliverer}</span></p>
        <p>- Theo đơn vị (NCC): <span className="font-semibold">{data.supplier}</span></p>
        <p>- Lý do nhập: {data.reason}</p>
        <p>- Nhập tại kho: {data.warehouse}</p>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border border-black mb-6">
        <thead>
          <tr className="bg-gray-100 font-bold text-center">
            <th className="border border-black p-1 w-10">STT</th>
            <th className="border border-black p-1">Tên, nhãn hiệu, quy cách</th>
            <th className="border border-black p-1 w-20">Mã số</th>
            <th className="border border-black p-1 w-12">ĐVT</th>
            <th className="border border-black p-1 w-16">Số lượng</th>
            <th className="border border-black p-1 w-24">Đơn giá</th>
            <th className="border border-black p-1 w-28">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, idx) => (
            <tr key={idx}>
              <td className="border border-black p-1 text-center">{idx + 1}</td>
              <td className="border border-black p-1">{item.name}</td>
              <td className="border border-black p-1 text-center">{item.sku}</td>
              <td className="border border-black p-1 text-center">{item.unit}</td>
              <td className="border border-black p-1 text-center font-bold">{item.qty}</td>
              <td className="border border-black p-1 text-right">{item.price?.toLocaleString()}</td>
              <td className="border border-black p-1 text-right">{item.total?.toLocaleString()}</td>
            </tr>
          ))}
          <tr className="font-bold">
            <td colSpan={4} className="border border-black p-1 text-right">Cộng:</td>
            <td className="border border-black p-1 text-center">{data.items.reduce((a, b) => a + b.qty, 0)}</td>
            <td className="border border-black p-1"></td>
            <td className="border border-black p-1 text-right">{data.items.reduce((a, b) => a + (b.total || 0), 0).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* Signatures */}
      <div className="grid grid-cols-4 gap-4 text-center mt-8">
        <div>
          <p className="font-bold">Người lập phiếu</p>
          <p className="italic text-xs">(Ký, họ tên)</p>
        </div>
        <div>
          <p className="font-bold">Người giao hàng</p>
          <p className="italic text-xs">(Ký, họ tên)</p>
        </div>
        <div>
          <p className="font-bold">Thủ kho</p>
          <p className="italic text-xs">(Ký, họ tên)</p>
        </div>
        <div>
          <p className="font-bold">Kế toán trưởng</p>
          <p className="italic text-xs">(Ký, họ tên)</p>
        </div>
      </div>
    </div>
  );
});