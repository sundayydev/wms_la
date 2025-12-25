import React, { forwardRef } from 'react';

export interface PaymentData {
	type: 'INCOME' | 'EXPENSE'; // Thu hay Chi
	code: string;
	date: string;
	partnerName: string; // Người nộp / Người nhận
	address?: string;
	reason: string;
	amount: number;
	amountText: string; // Số tiền bằng chữ (Cần thư viện convert hoặc backend trả về)
	attachment?: string; // Kèm theo chứng từ gốc
}

export const PaymentVoucher = forwardRef<HTMLDivElement, { data: PaymentData }>(({ data }, ref) => {
	const isIncome = data.type === 'INCOME';
	const title = isIncome ? 'PHIẾU THU' : 'PHIẾU CHI';
	const formCode = isIncome ? '01-TT' : '02-TT';
	const personLabel = isIncome ? 'Họ tên người nộp tiền:' : 'Họ tên người nhận tiền:';

	return (
		<div ref={ref} className="p-10 bg-white text-black font-serif max-w-[210mm] mx-auto text-base">
			<div className="flex justify-between items-start mb-8">
				<div>
					<h3 className="font-bold uppercase text-sm">Công Ty TNHH WMS LA</h3>
					<p className="text-xs">123 Đường ABC, Quận 1, TP.HCM</p>
				</div>
				<div className="text-center">
					<h1 className="text-2xl font-bold uppercase mb-1">{title}</h1>
					<p className="italic text-sm">Ngày.....tháng.....năm......</p>
					<div className="text-right absolute right-10 top-10 text-xs">
						<p>Quyển số:.......</p>
						<p>Số: <span className="font-bold">{data.code}</span></p>
						<p>Nợ:.............</p>
						<p>Có:.............</p>
					</div>
				</div>
			</div>

			<div className="space-y-3 px-4">
				<div className="flex">
					<span className="w-48 flex-shrink-0">{personLabel}</span>
					<span className="font-bold border-b border-dotted border-black flex-1">{data.partnerName}</span>
				</div>
				<div className="flex">
					<span className="w-48 flex-shrink-0">Địa chỉ:</span>
					<span className="border-b border-dotted border-black flex-1">{data.address || '...'}</span>
				</div>
				<div className="flex">
					<span className="w-48 flex-shrink-0">Lý do {isIncome ? 'thu' : 'chi'}:</span>
					<span className="border-b border-dotted border-black flex-1">{data.reason}</span>
				</div>
				<div className="flex">
					<span className="w-48 flex-shrink-0">Số tiền:</span>
					<span className="font-bold border-b border-dotted border-black flex-1">{data.amount.toLocaleString('vi-VN')} đ</span>
				</div>
				<div className="flex">
					<span className="w-48 flex-shrink-0 italic">Bằng chữ:</span>
					<span className="font-bold italic border-b border-dotted border-black flex-1">{data.amountText}</span>
				</div>
				<div className="flex">
					<span className="w-48 flex-shrink-0">Kèm theo:</span>
					<span className="border-b border-dotted border-black flex-1">{data.attachment || '.............................'} chứng từ gốc</span>
				</div>
			</div>

			<div className="grid grid-cols-5 gap-4 text-center mt-10">
				<div>
					<p className="font-bold">Giám đốc</p>
					<p className="italic text-xs">(Ký, họ tên, đóng dấu)</p>
				</div>
				<div>
					<p className="font-bold">Kế toán trưởng</p>
					<p className="italic text-xs">(Ký, họ tên)</p>
				</div>
				<div>
					<p className="font-bold">Người lập phiếu</p>
					<p className="italic text-xs">(Ký, họ tên)</p>
				</div>
				<div>
					<p className="font-bold">Người {isIncome ? 'nộp' : 'nhận'} tiền</p>
					<p className="italic text-xs">(Ký, họ tên)</p>
				</div>
				<div>
					<p className="font-bold">Thủ quỹ</p>
					<p className="italic text-xs">(Ký, họ tên)</p>
				</div>
			</div>

			<div className="mt-12 text-xs italic text-center">
				(Đã nhận đủ số tiền: ........................................................................................)
			</div>
		</div>
	);
});