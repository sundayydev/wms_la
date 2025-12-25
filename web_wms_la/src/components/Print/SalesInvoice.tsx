import React, { forwardRef } from 'react';

// Interface dữ liệu truyền vào
export interface InvoiceData {
  invoiceDate: string; // Ngày tháng năm
  invoiceNumber: string; // Số hóa đơn: 0000000
  serialNumber: string; // Ký hiệu: AA/19E
  formNumber: string; // Mẫu số: 02GTTT0/002

  buyer: {
    name: string; // Họ tên người mua
    company: string; // Tên đơn vị
    taxCode: string; // MST
    address: string;
    paymentMethod: string; // Hình thức TT
    accountNumber: string; // Số tài khoản
  };

  items: {
    name: string;
    unit: string;
    quantity: number;
    price: number;
    amount: number;
  }[];

  totalAmount: number;
  amountInWords: string;

  // Thông tin chữ ký điện tử (nếu có)
  sellerSignature?: {
    signedBy: string;
    signedDate: string;
  };
}

// Component chính
export const SalesInvoice = forwardRef<HTMLDivElement, { data: InvoiceData }>(({ data }, ref) => {
  // Hàm format tiền tệ
  const fmt = (num: number) => new Intl.NumberFormat('vi-VN').format(num);

  // Tạo các dòng trống nếu bảng ít hàng (để form đẹp như hình)
  const minRows = 10;
  const emptyRows = Array.from({ length: Math.max(0, minRows - data.items.length) });

  return (
    <div ref={ref} className="bg-white text-black font-serif max-w-[210mm] min-h-[297mm] mx-auto p-2 text-sm leading-tight relative">

      {/* KHUNG VIỀN HOA VĂN (Giả lập bằng border) */}
      <div className="border-[3px] border-double border-slate-400 p-6 h-full min-h-[290mm] relative">

        {/* --- 1. HEADER --- */}
        <div className="flex justify-between items-start mb-6">
          {/* Logo */}
          <div className="w-1/4 pt-2">
            {/* Thay src bằng logo thật của bạn */}
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png"
              alt="Logo"
              className="w-24 h-auto mx-auto mb-2 opacity-80"
            />
            <div className="text-center font-bold text-orange-600 text-xs">SOFT DREAMS</div>
            <div className="text-center text-[10px] text-gray-500">Make IT Simple</div>
          </div>

          {/* Thông tin công ty bán */}
          <div className="w-3/4 pl-4 text-xs space-y-1">
            <h2 className="font-bold text-base uppercase text-gray-800">CÔNG TY CP ĐẦU TƯ CÔNG NGHỆ VÀ THƯƠNG MẠI SOFTDREAMS</h2>
            <div className="flex">
              <span className="w-24 font-bold">Mã số thuế (Tax code):</span>
              <span>0105987432-999</span>
            </div>
            <div className="flex">
              <span className="w-24 flex-shrink-0 font-bold">Địa chỉ (Address):</span>
              <span>Nhà khách ATS, số 8 Phạm Hùng, P. Mễ Trì, Q. Nam Từ Liêm, Hà Nội</span>
            </div>
            <div className="flex gap-8">
              <div><span className="font-bold">Điện thoại (Tel):</span> 0981 772 388</div>
              <div><span className="font-bold">Fax:</span> 0919 510 089</div>
            </div>
            <div className="flex">
              <span className="w-24 font-bold">Email:</span>
              <span>contact@softdreams.vn</span>
            </div>
            <div className="flex">
              <span className="w-36 font-bold">Tài khoản (A/C number):</span>
              <span>0123456789123 Ngân hàng TMCP Ngoại Thương Việt Nam</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-300 my-2"></div>

        {/* --- 2. TITLE & QR --- */}
        <div className="flex justify-between items-center mb-4">
          {/* QR Code Giả lập */}
          <div className="w-24 h-24 border border-gray-300 flex items-center justify-center bg-gray-50">
            <div className="text-[9px] text-center text-gray-400">QR CODE<br />AREA</div>
          </div>

          {/* Tiêu đề chính */}
          <div className="text-center flex-1">
            <h1 className="text-2xl font-bold text-red-600 uppercase">HÓA ĐƠN BÁN HÀNG</h1>
            <p className="font-bold text-red-600 italic text-sm">(SALES INVOICE)</p>
            <p className="italic mt-1">
              Ngày (Date) <span className="px-2 font-bold">{data.invoiceDate.split('/')[0]}</span>
              tháng (month) <span className="px-2 font-bold">{data.invoiceDate.split('/')[1]}</span>
              năm (year) <span className="px-2 font-bold">{data.invoiceDate.split('/')[2]}</span>
            </p>
          </div>

          {/* Số hóa đơn */}
          <div className="text-right text-xs space-y-1 w-32">
            <p>Mẫu số (Form): {data.formNumber}</p>
            <p>Ký hiệu (Serial): {data.serialNumber}</p>
            <p className="text-red-600 font-bold text-sm">Số (No.): {data.invoiceNumber}</p>
          </div>
        </div>

        {/* --- 3. BUYER INFO --- */}
        <div className="mb-4 text-xs space-y-1.5">
          <div className="flex">
            <span className="w-40 flex-shrink-0">Họ tên người mua hàng (Buyer):</span>
            <span className="border-b border-dotted border-gray-400 flex-1 font-bold">{data.buyer.name}</span>
          </div>
          <div className="flex">
            <span className="w-40 flex-shrink-0">Tên đơn vị (Company's name):</span>
            <span className="border-b border-dotted border-gray-400 flex-1 uppercase">{data.buyer.company}</span>
          </div>
          <div className="flex">
            <span className="w-40 flex-shrink-0">Mã số thuế (Tax code):</span>
            <span className="border-b border-dotted border-gray-400 flex-1 font-bold tracking-widest">{data.buyer.taxCode}</span>
          </div>
          <div className="flex">
            <span className="w-40 flex-shrink-0">Địa chỉ (Address):</span>
            <span className="border-b border-dotted border-gray-400 flex-1">{data.buyer.address}</span>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-1">
              <span className="w-52 flex-shrink-0">Hình thức thanh toán (Payment method):</span>
              <span className="border-b border-dotted border-gray-400 flex-1">{data.buyer.paymentMethod}</span>
            </div>
            <div className="flex flex-1">
              <span className="w-32 flex-shrink-0">Số tài khoản (A/C No):</span>
              <span className="border-b border-dotted border-gray-400 flex-1">{data.buyer.accountNumber}</span>
            </div>
          </div>
        </div>

        {/* --- 4. TABLE --- */}
        <table className="w-full border-collapse border border-black mb-2 text-xs">
          <thead>
            <tr className="text-center font-bold bg-gray-100">
              <th className="border border-black p-1 w-10">STT<br /><span className="italic font-normal">(No.)</span></th>
              <th className="border border-black p-1">Tên hàng hóa, dịch vụ<br /><span className="italic font-normal">(Description)</span></th>
              <th className="border border-black p-1 w-16">Đơn vị tính<br /><span className="italic font-normal">(Unit)</span></th>
              <th className="border border-black p-1 w-16">Số lượng<br /><span className="italic font-normal">(Quantity)</span></th>
              <th className="border border-black p-1 w-24">Đơn giá<br /><span className="italic font-normal">(Unit price)</span></th>
              <th className="border border-black p-1 w-28">Thành tiền<br /><span className="italic font-normal">(Amount)</span></th>
            </tr>
            <tr className="text-center font-normal text-[10px]">
              <th className="border border-black">(1)</th>
              <th className="border border-black">(2)</th>
              <th className="border border-black">(3)</th>
              <th className="border border-black">(4)</th>
              <th className="border border-black">(5)</th>
              <th className="border border-black">(6)=(4)x(5)</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx}>
                <td className="border-x border-dotted border-black p-1 text-center">{idx + 1}</td>
                <td className="border-x border-dotted border-black p-1 font-semibold">{item.name}</td>
                <td className="border-x border-dotted border-black p-1 text-center">{item.unit}</td>
                <td className="border-x border-dotted border-black p-1 text-center font-bold">{item.quantity}</td>
                <td className="border-x border-dotted border-black p-1 text-right">{fmt(item.price)}</td>
                <td className="border-x border-black p-1 text-right">{fmt(item.amount)}</td>
              </tr>
            ))}
            {/* Fill Empty Rows */}
            {emptyRows.map((_, idx) => (
              <tr key={`empty-${idx}`}>
                <td className="border-x border-dotted border-black p-1">&nbsp;</td>
                <td className="border-x border-dotted border-black p-1">&nbsp;</td>
                <td className="border-x border-dotted border-black p-1">&nbsp;</td>
                <td className="border-x border-dotted border-black p-1">&nbsp;</td>
                <td className="border-x border-dotted border-black p-1">&nbsp;</td>
                <td className="border-x border-black p-1">&nbsp;</td>
              </tr>
            ))}
            {/* Total Row */}
            <tr>
              <td colSpan={5} className="border border-black p-1 text-right font-bold">Cộng tiền hàng hóa, dịch vụ (Total amount):</td>
              <td className="border border-black p-1 text-right font-bold">{fmt(data.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        {/* --- 5. AMOUNT IN WORDS --- */}
        <div className="mb-8 text-xs">
          <div className="flex">
            <span className="font-bold italic">Số tiền viết bằng chữ (Amount in words):</span>
            <span className="ml-2 italic border-b border-dotted border-gray-400 flex-1">{data.amountInWords}</span>
          </div>
        </div>

        {/* --- 6. SIGNATURES --- */}
        <div className="flex justify-between text-center text-xs mb-16">
          <div className="w-1/2">
            <p className="font-bold">Người mua hàng (Buyer)</p>
            <p className="italic">(Ký, ghi rõ họ tên)</p>
          </div>
          <div className="w-1/2">
            <p className="font-bold">Người bán hàng (Seller)</p>
            <p className="italic">(Ký, ghi rõ họ tên)</p>

            {/* Giả lập chữ ký điện tử / Mộc đỏ */}
            <div className="mt-4 inline-block border-2 border-red-500 text-red-500 p-2 text-left bg-red-50/10">
              <p className="font-bold text-[10px]">Mẫu</p>
              <p className="font-bold mt-1">Ký bởi: {data.sellerSignature?.signedBy || 'CÔNG TY CP ĐẦU TƯ CÔNG NGHỆ VÀ THƯƠNG MẠI SOFTDREAMS'}</p>
              <p className="font-bold">Ký ngày: {data.sellerSignature?.signedDate || data.invoiceDate}</p>
            </div>
          </div>
        </div>

        {/* --- 7. FOOTER --- */}
        <div className="absolute bottom-6 left-6 right-6 text-[10px] text-gray-500 border-t border-gray-300 pt-2">
          <div className="flex justify-between">
            <span>Trang tra cứu: <span className="font-bold">http://tracuu.ehoadon.vn</span></span>
            <span>Mã tra cứu: <span className="font-bold text-black">105987432</span></span>
          </div>
          <div className="text-center italic mt-2">
            (Cần kiểm tra, đối chiếu khi lập, giao, nhận hóa đơn)
          </div>
          <div className="text-center mt-1 border-t border-dotted pt-1">
            Đơn vị cung cấp giải pháp: Công ty cổ phần đầu tư công nghệ và thương mại SOFTDREAMS, MST: 0105987432, http://easyinvoice.vn/
          </div>
        </div>

      </div>
    </div>
  );
});