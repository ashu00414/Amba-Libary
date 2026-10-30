import React, { useState } from 'react';
import { 
  AlertCircle, 
  Send, 
  Receipt, 
  Search, 
  Clock, 
  CheckCircle2, 
  Phone, 
  Calendar, 
  CreditCard,
  ExternalLink,
  MessageCircle,
  Filter
} from 'lucide-react';
import { getStudentFeeStatus } from '../../data/libraryStore';

export default function AdminDuesTracker({
  students = [],
  onOpenReceipt,
  onDataUpdated
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'overdue' | 'due_soon'
  const [searchQuery, setSearchQuery] = useState('');

  // Extract all students with dues or upcoming expiry
  const studentsWithDues = students.map(student => {
    const feeStatus = getStudentFeeStatus(student);
    const dueAmount = student.feeDetails?.dueAmount !== undefined 
      ? Number(student.feeDetails.dueAmount) 
      : (feeStatus.code === 'OVERDUE' || feeStatus.code === 'DUE') ? (Number(student.monthlyFee || student.feeDetails?.amount) || (student.shifts?.length ? student.shifts.length * 600 : 600)) : 0;

    return {
      student,
      feeStatus,
      dueAmount
    };
  }).filter(item => {
    return item.dueAmount > 0 || ['OVERDUE', 'DUE', 'EXPIRING_SOON'].includes(item.feeStatus.code);
  });

  const totalDuesAmount = studentsWithDues.reduce((acc, curr) => acc + curr.dueAmount, 0);

  const filteredList = studentsWithDues.filter(item => {
    if (filterType === 'overdue' && item.feeStatus.code !== 'OVERDUE') return false;
    if (filterType === 'due_soon' && !['DUE', 'EXPIRING_SOON'].includes(item.feeStatus.code)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const st = item.student;
      return st.name.toLowerCase().includes(q) || 
        st.id.toLowerCase().includes(q) || 
        st.mobile?.includes(q) || 
        st.seatNumber?.toString().includes(q);
    }
    return true;
  });

  const sendWhatsAppReminder = (student, dueAmount, dueDate) => {
    const mobile = (student.mobile || '').replace(/[^0-9]/g, '');
    const cleanMobile = mobile.length === 10 ? `91${mobile}` : mobile;
    
    const message = encodeURIComponent(
      `Namaste ${student.name},\n\nThis is a friendly reminder from Amba Library that your monthly library fee of ₹${dueAmount} for Desk #${student.seatNumber} is due on ${dueDate || 'this week'}.\n\nKindly clear your dues at the library desk or via UPI to ensure uninterrupted seat reservation.\n\nThank you,\nAmba Library Administration\n📞 +91 82920 02249`
    );

    window.open(`https://wa.me/${cleanMobile}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h2 className="text-xl font-bold text-slate-900 font-heading">
                Fee Dues &amp; Overdue Recovery Tracker
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated ledger tracking of pending student fees with 1-click WhatsApp payment reminders
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-6 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2 self-start md:self-auto">
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Pending Accounts</div>
              <div className="text-lg font-black font-mono text-slate-900">{studentsWithDues.length}</div>
            </div>
            <div className="w-px h-7 bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-500 font-bold uppercase">Total Outstanding</div>
              <div className="text-lg font-black font-mono text-rose-600">₹{totalDuesAmount.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student, mobile, desk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Dues ({studentsWithDues.length})
            </button>
            <button
              onClick={() => setFilterType('overdue')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filterType === 'overdue' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Critical Overdue
            </button>
            <button
              onClick={() => setFilterType('due_soon')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filterType === 'due_soon' ? 'bg-white text-amber-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expiring Soon
            </button>
          </div>

        </div>
      </div>

      {/* Dues Cards List */}
      {filteredList.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Zero Outstanding Dues!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All enrolled library students have their accounts fully settled and up to date.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map(({ student, feeStatus, dueAmount }) => {
            const isCritical = feeStatus.code === 'OVERDUE';
            const dueDate = student.feeDetails?.dueDate || student.feeDetails?.validUntil || 'Pending';

            return (
              <div 
                key={student.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
              >
                {/* Top Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0">
                      {student.name?.charAt(0) || 'S'}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 leading-tight">
                        {student.name}
                      </h4>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {student.id} • Desk #{student.seatNumber}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isCritical ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {feeStatus.label || 'Fee Due'}
                  </span>
                </div>

                {/* Due Details Grid */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Outstanding Balance:</span>
                    <span className="text-base font-black font-mono text-rose-600">
                      ₹{dueAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">Due Date:</span>
                    <span className="font-semibold text-slate-800 font-mono flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{dueDate}</span>
                    </span>
                  </div>

                  <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Contact: {student.mobile || 'No Mobile'}</span>
                    <span>Plan: {student.isFullDay ? 'Full Day' : 'Shift Plan'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  
                  {/* WhatsApp Reminder Button */}
                  <button
                    onClick={() => sendWhatsAppReminder(student, dueAmount, dueDate)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    title="Send customized WhatsApp payment reminder"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Reminder</span>
                  </button>

                  {/* Collect Fee Button */}
                  <button
                    onClick={() => onOpenReceipt(student)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-amber-400" />
                    <span>Collect Fee</span>
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
