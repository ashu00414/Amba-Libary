import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Calendar, Phone, Mail, User, BookOpen, Clock, Download, Receipt } from 'lucide-react';
import { DAY_SHIFTS, NIGHT_SHIFTS } from '../data/libraryStore';
import logoImg from '../assets/logo.png';

export default function FeeReceiptModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null;

  const currentShiftList = student.mode === 'day' ? DAY_SHIFTS : NIGHT_SHIFTS;
  const shiftNames = student.shifts?.map(sId => {
    const sObj = currentShiftList.find(s => s.id === sId);
    return sObj ? `${sObj.name} (${sObj.shortTime})` : sId;
  }).join(' + ') || 'Standard Shift';

  const handlePrint = () => {
    window.print();
  };

  const formattedFee = Number(student.monthlyFee || (student.shifts?.length ? student.shifts.length * 600 : 600)).toLocaleString('en-IN');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static animate-in fade-in duration-150">
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-2 sm:my-8 max-h-[96vh] sm:max-h-[90vh] flex flex-col print:border-none print:shadow-none print:my-0 print:w-full print:max-w-none print:max-h-none animate-in zoom-in-95 duration-200">
        
        {/* Top Action Bar (Hidden during Print) */}
        <div className="bg-[#0B0F19] text-white px-4 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between print:hidden border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <span className="font-semibold text-xs tracking-wide">Official Fee Voucher</span>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-white text-slate-900 font-semibold text-xs rounded-lg shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-4 sm:p-8 bg-white text-slate-900 font-sans printable-fee-receipt overflow-y-auto flex-1">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white text-slate-900 flex items-center justify-center p-1 border border-slate-300 shadow-xs overflow-hidden">
                <img src={logoImg} alt="Amba Library Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="font-bold text-xl tracking-tight text-slate-900 font-heading">
                  AMBA LIBRARY
                </h1>
                <p className="text-[11px] text-slate-500 font-semibold tracking-wider uppercase">
                  Silent Study Space & Workspace Suite
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Civil Lines, Opposite University Gate • Contact: +91 82920 02249
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
              <span className="inline-block bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 font-bold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1">
                Payment Received
              </span>
              <p className="font-mono text-xs text-slate-600 font-semibold">
                Voucher: <span className="text-slate-900 font-bold">{student.receiptNumber || `AMBA-REC-${student.id.replace('STU-', '')}`}</span>
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Date: {student.lastPaymentDate || student.admissionDate || new Date().toISOString().split('T')[0]}
              </p>
            </div>
          </div>

          {/* Student & Desk Details Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider block">Student Record</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{student.name}</p>
                </div>
                {student.photo && (
                  <div className="w-12 h-12 rounded-lg border border-slate-300 overflow-hidden shrink-0 shadow-2xs">
                    <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="mt-1 space-y-0.5 text-slate-600">
                <p><span className="text-slate-400">ID:</span> <span className="font-mono font-bold text-slate-800">{student.id}</span></p>
                <p><span className="text-slate-400">Mobile:</span> <span className="font-mono font-medium text-slate-800">{student.mobile}</span></p>
                <p><span className="text-slate-400">Aadhar:</span> <span className="font-mono text-slate-700">{student.aadhar || 'Verified'}</span></p>
                <p><span className="text-slate-400">Parent:</span> <span className="text-slate-700">{student.fatherName && student.fatherName !== '...' ? student.fatherName : 'On record'}</span></p>
                {student.address && <p><span className="text-slate-400">Address:</span> <span className="text-slate-700">{student.address}</span></p>}
              </div>
            </div>

            <div className="border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-2.5 sm:pt-0">
              <span className="text-slate-400 font-medium uppercase text-[10px] tracking-wider block">Desk & Shift Allocation</span>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="bg-slate-900 text-amber-300 font-bold text-xs px-2 py-0.5 rounded font-mono">
                  DESK #{student.seatNumber < 10 ? `0${student.seatNumber}` : student.seatNumber}
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {student.isFullDay ? 'Full Day Membership' : `${student.shifts?.length || 1} Shift(s)`}
                </span>
              </div>
              <div className="mt-1.5 space-y-0.5 text-slate-600">
                <p><span className="text-slate-400">Shifts:</span> <span className="font-medium text-slate-800">{shiftNames}</span></p>
                <p><span className="text-slate-400">Admission:</span> <span className="font-mono text-slate-700">{student.admissionDate}</span></p>
                <p><span className="text-slate-400">Schedule:</span> <span className="capitalize font-medium text-slate-800">{student.mode} Mode</span></p>
              </div>
            </div>
          </div>

          {/* Billing Breakdown Table */}
          <div className="mb-5 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-medium text-[11px]">
                <tr>
                  <th className="py-2.5 px-3.5">Fee Particulars</th>
                  <th className="py-2.5 px-3.5 text-center">Subscription Period</th>
                  <th className="py-2.5 px-3.5 text-center">Payment Method</th>
                  <th className="py-2.5 px-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="py-3 px-3.5">
                    <p className="font-semibold text-slate-900">
                      Study Desk Membership Fee
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Air conditioned silent hall, high speed optical fiber & dedicated power port.
                    </p>
                  </td>
                  <td className="py-3 px-3.5 text-center font-mono text-[11px]">
                    <div className="font-semibold text-slate-800">
                      {student.validFrom} to {student.validTill}
                    </div>
                    <span className="text-slate-500 text-[10px]">
                      {student.planMonths || 1} Month Plan
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-center font-medium text-slate-700">
                    {student.paymentMode || 'UPI / QR'}
                  </td>
                  <td className="py-3 px-3.5 text-right font-bold text-xs text-slate-900 font-mono">
                    ₹{formattedFee}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                <tr>
                  <td colSpan={3} className="py-2.5 px-3.5 text-right text-slate-600 uppercase tracking-wider text-[10px]">
                    Total Amount Received
                  </td>
                  <td className="py-2.5 px-3.5 text-right font-bold text-sm text-slate-900 font-mono">
                    ₹{formattedFee}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Validity Warning & Stamp Section */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3.5 border-t border-slate-200 text-xs">
            
            {/* Terms */}
            <div className="text-[10px] text-slate-400 leading-relaxed max-w-sm">
              <p className="font-semibold text-slate-600 mb-0.5">Terms & Conditions:</p>
              <ul className="list-disc pl-3.5 space-y-0.5">
                <li>Membership fees deposited are non-refundable & non-transferable.</li>
                <li>Please renew on or before <strong className="text-slate-700">{student.validTill}</strong> to retain your desk reservation.</li>
                <li>Strict silence must be maintained in the study reading rooms.</li>
              </ul>
            </div>

            {/* Stamp & Signatory */}
            <div className="flex items-center space-x-6 text-center">
              
              {/* Amba Library Seal Stamp */}
              <div className="w-18 h-18 rounded-full border-2 border-emerald-600 text-emerald-700 flex flex-col items-center justify-center rotate-[-6deg] p-1 shadow-2xs">
                <span className="text-[7px] font-extrabold uppercase tracking-tight">AMBA LIBRARY</span>
                <span className="text-[9px] font-black uppercase text-emerald-800">★ PAID ★</span>
                <span className="text-[7px] font-semibold text-emerald-600">VERIFIED</span>
              </div>

              {/* Signature Line */}
              <div className="pt-6 border-t border-slate-300 min-w-[120px]">
                <p className="text-[11px] font-bold text-slate-800">Authorized Signatory</p>
                <p className="text-[9px] text-slate-400">Amba Central Library</p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
