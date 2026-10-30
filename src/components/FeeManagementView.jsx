import React, { useState } from 'react';
import { 
  DollarSign, Search, Calendar, AlertCircle, CheckCircle2, 
  Printer, RefreshCw, Clock, Phone, User, Filter, 
  ArrowUpRight, AlertTriangle, ShieldCheck, X, TrendingUp,
  CreditCard, Receipt, FileText, Check
} from 'lucide-react';
import { 
  getStoredStudents, 
  getStudentFeeStatus, 
  renewStudentMembership, 
  updateStudentFeeStatus,
  calculateValidTill,
  DAY_SHIFTS,
  NIGHT_SHIFTS
} from '../data/libraryStore';

export default function FeeManagementView({ students, onDataUpdated, onOpenReceipt }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Renewal modal state
  const [renewingStudent, setRenewingStudent] = useState(null);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewFeeAmount, setRenewFeeAmount] = useState('');
  const [renewPaymentMode, setRenewPaymentMode] = useState('UPI / QR');
  const [renewNote, setRenewNote] = useState('');
  const [renewSuccessMsg, setRenewSuccessMsg] = useState('');

  // Calculate high-level financial metrics
  const totalCollected = students
    .filter(s => s.feeStatus === 'Paid')
    .reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);

  const totalPending = students
    .filter(s => s.feeStatus === 'Due' || getStudentFeeStatus(s).code === 'OVERDUE')
    .reduce((sum, s) => sum + Number(s.monthlyFee || 0), 0);

  const expiringSoonCount = students.filter(s => getStudentFeeStatus(s).code === 'EXPIRING_SOON').length;
  const overdueCount = students.filter(s => getStudentFeeStatus(s).code === 'OVERDUE').length;
  const activeCount = students.filter(s => getStudentFeeStatus(s).code === 'ACTIVE').length;

  // Filter students
  const filteredStudents = students.filter(student => {
    const feeStatus = getStudentFeeStatus(student);

    if (statusFilter === 'expiring' && feeStatus.code !== 'EXPIRING_SOON') return false;
    if (statusFilter === 'overdue' && feeStatus.code !== 'OVERDUE') return false;
    if (statusFilter === 'paid' && feeStatus.code !== 'ACTIVE') return false;
    if (statusFilter === 'due' && feeStatus.code !== 'DUE') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.name.toLowerCase().includes(q);
      const matchPhone = student.mobile.includes(q);
      const matchSeat = student.seatNumber.toString().includes(q) || `seat ${student.seatNumber}`.includes(q) || `desk ${student.seatNumber}`.includes(q);
      const matchReceipt = (student.receiptNumber || '').toLowerCase().includes(q);
      const matchId = student.id.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchSeat && !matchReceipt && !matchId) return false;
    }

    return true;
  });

  const handleOpenRenewModal = (student) => {
    setRenewingStudent(student);
    setRenewMonths(1);
    const calculatedFee = student.monthlyFee || (student.shifts?.length ? student.shifts.length * 600 : 600);
    setRenewFeeAmount(calculatedFee);
    setRenewPaymentMode(student.paymentMode || 'UPI / QR');
    setRenewNote('');
    setRenewSuccessMsg('');
  };

  const handleConfirmRenewal = (e) => {
    e.preventDefault();
    if (!renewingStudent) return;

    try {
      renewStudentMembership(renewingStudent.id, {
        months: Number(renewMonths),
        feeAmount: Number(renewFeeAmount),
        paymentMode: renewPaymentMode,
        note: renewNote
      });

      setRenewSuccessMsg(`Payment recorded! Plan for ${renewingStudent.name} extended by ${renewMonths} month(s).`);
      onDataUpdated();

      setTimeout(() => {
        setRenewingStudent(null);
        setRenewSuccessMsg('');
      }, 1000);
    } catch (err) {
      alert('Error updating payment: ' + err.message);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* 4 Financial Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Monthly Collected */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Collections
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight tabular-nums">
              ₹{totalCollected.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-400 font-normal">/mo</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium flex items-center mt-1">
            Verified active fees
          </span>
        </div>

        {/* Pending & Overdue Amount */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Pending Receivables
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-rose-600 font-mono tracking-tight tabular-nums">
              ₹{totalPending.toLocaleString('en-IN')}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium flex items-center mt-1">
            {overdueCount} account(s) overdue
          </span>
        </div>

        {/* Expiring Soon Alert Card */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Due for Renewal (≤ 4d)
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-amber-800 tracking-tight tabular-nums">
              {expiringSoonCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">Students</span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Upcoming plan expiration
          </span>
        </div>

        {/* Active Students */}
        <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active In Good Standing
            </span>
            <ShieldCheck className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
              {activeCount}
            </span>
            <span className="text-xs text-slate-400 font-normal">/ 50 Desks</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Paid & up-to-date
          </span>
        </div>

      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, mobile, desk no. or receipt..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-slate-900 text-white font-semibold' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Students ({students.length})
          </button>

          <button
            onClick={() => setStatusFilter('expiring')}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer flex items-center space-x-1.5 ${
              statusFilter === 'expiring' 
                ? 'bg-amber-700 text-white font-semibold' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Expiring Soon</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 rounded-full font-mono font-semibold">
              {expiringSoonCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer flex items-center space-x-1.5 ${
              statusFilter === 'overdue' 
                ? 'bg-rose-700 text-white font-semibold' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Overdue</span>
            <span className="text-[10px] bg-rose-100 text-rose-900 px-1.5 rounded-full font-mono font-semibold">
              {overdueCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
              statusFilter === 'paid' 
                ? 'bg-emerald-700 text-white font-semibold' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Paid & Active ({activeCount})
          </button>
        </div>

      </div>

      {/* Students Fee Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-700">
              Subscription & Membership Ledger
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredStudents.length} of {students.length} record(s)
          </span>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-base text-slate-900">No Billing & Fee Records</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              When you admit students in the Desks Matrix, their membership term, payment voucher, and renewal status will be tracked here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Desk & Slot</th>
                  <th className="py-3 px-4">Fee Rate</th>
                  <th className="py-3 px-4">Plan Validity</th>
                  <th className="py-3 px-4 text-center">Renewal Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(student => {
                  const feeInfo = getStudentFeeStatus(student);
                  const isFullDay = student.isFullDay;

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Student info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                            {student.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-xs">{student.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              {student.id} • {student.mobile}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Desk & Shift */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200/80">
                            Desk #{student.seatNumber < 10 ? `0${student.seatNumber}` : student.seatNumber}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500">
                            {isFullDay ? 'Full Day' : `${student.shifts?.length || 1} Shift(s)`}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Adm: {student.admissionDate}
                        </p>
                      </td>

                      {/* Fee Amount & Mode */}
                      <td className="py-3 px-4">
                        <p className="font-mono font-bold text-xs text-slate-900">
                          ₹{Number(student.monthlyFee || (student.shifts?.length ? student.shifts.length * 600 : 600)).toLocaleString('en-IN')}
                        </p>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium inline-block mt-0.5">
                          {student.paymentMode || 'UPI / QR'}
                        </span>
                      </td>

                      {/* Plan Validity */}
                      <td className="py-3 px-4">
                        <div className="text-[11px] font-mono">
                          <span className="text-slate-500">{student.validFrom}</span>
                          <span className="text-slate-400 mx-1">→</span>
                          <span className="font-semibold text-slate-900">{student.validTill}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {student.planMonths || 1} Month Plan
                        </span>
                      </td>

                      {/* Renewal Status Badge */}
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] ${feeInfo.badgeClass}`}>
                          <span>{feeInfo.label}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          
                          {/* Quick Renew Plan Button */}
                          <button
                            onClick={() => handleOpenRenewModal(student)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-2xs transition-colors flex items-center space-x-1 cursor-pointer"
                            title="Renew subscription & record payment"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Renew</span>
                          </button>

                          {/* Print Fee Receipt */}
                          <button
                            onClick={() => onOpenReceipt(student)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-md transition-colors flex items-center space-x-1 cursor-pointer border border-slate-200"
                            title="View / Print Official Receipt"
                          >
                            <Receipt className="w-3 h-3 text-slate-600" />
                            <span>Receipt</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* QUICK RENEWAL MODAL */}
      {renewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-slate-700" />
                <h4 className="font-bold text-sm text-slate-900">Renew Membership Plan</h4>
              </div>
              <button 
                onClick={() => setRenewingStudent(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-black cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {renewSuccessMsg ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-800 text-sm">{renewSuccessMsg}</p>
                <p className="text-xs text-slate-500">Updating membership validity and generating receipt...</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmRenewal} className="space-y-3.5 pt-3.5 text-xs">
                
                {/* Student summary banner */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                    {renewingStudent.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-xs">{renewingStudent.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Desk #{renewingStudent.seatNumber} • Current Expiry: <strong className="text-slate-800">{renewingStudent.validTill}</strong>
                    </p>
                  </div>
                </div>

                {/* Duration options */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Extend Plan Duration</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 6].map(m => (
                      <button
                        type="button"
                        key={m}
                        onClick={() => setRenewMonths(m)}
                        className={`py-2 rounded-lg font-medium text-xs border text-center transition-all cursor-pointer ${
                          renewMonths === m
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        +{m} Mo
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    New Expiry: <strong className="font-mono text-slate-900">{calculateValidTill(renewingStudent.validTill, renewMonths)}</strong>
                  </p>
                </div>

                {/* Fee Amount & Payment Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Fee Amount (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                      <input
                        type="number"
                        value={renewFeeAmount}
                        onChange={(e) => setRenewFeeAmount(e.target.value)}
                        className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={renewPaymentMode}
                      onChange={(e) => setRenewPaymentMode(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="UPI / QR">UPI / QR (PhonePe/GPay)</option>
                      <option value="Cash">Cash at Counter</option>
                      <option value="Bank Transfer">Bank Transfer / IMPS</option>
                    </select>
                  </div>
                </div>

                {/* Optional Note */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Reference / Note (Optional)</label>
                  <input
                    type="text"
                    value={renewNote}
                    onChange={(e) => setRenewNote(e.target.value)}
                    placeholder="e.g. UTR / Transaction No. or Cash Receipt"
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRenewingStudent(null)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Confirm & Generate Receipt</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
