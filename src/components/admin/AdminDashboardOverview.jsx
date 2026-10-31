import React from 'react';
import { 
  Users, 
  Receipt, 
  AlertCircle, 
  LayoutGrid, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  ArrowRight, 
  CheckCircle2, 
  Clock,
  Inbox
} from 'lucide-react';
import { DAY_SHIFTS } from '../../data/libraryStore';

export default function AdminDashboardOverview({
  seats = [],
  students = [],
  shiftRequests = [],
  onNavigateTab,
  onOpenReceipt
}) {
  const totalSeats = 50;
  
  // Calculate vacant vs full
  const vacantSeatsCount = seats.filter(s => {
    const isDayVacant = s.day && Object.values(s.day).some(val => val === null);
    return isDayVacant;
  }).length;

  // Calculate shift-wise allocation count
  const shiftStats = {
    shift1: seats.filter(s => s.day?.shift1).length,
    shift2: seats.filter(s => s.day?.shift2).length,
    shift3: seats.filter(s => s.day?.shift3).length,
    shift4: seats.filter(s => s.day?.shift4).length,
    night: seats.filter(s => s.night?.night_full).length
  };

  // Financial calculations
  const totalCollected = students.reduce((acc, st) => {
    return acc + (Number(st.feeDetails?.paidAmount) || Number(st.feeDetails?.amount) || 0);
  }, 0);

  const totalDues = students.reduce((acc, st) => {
    return acc + (Number(st.feeDetails?.dueAmount) || 0);
  }, 0);

  const pendingRequests = shiftRequests.filter(r => r.status === 'Pending' || r.status === 'Hold');

  return (
    <div className="space-y-6">
      
      {/* 4 Stripe/Linear-Style Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Total Desks & Capacity */}
        <div 
          onClick={() => onNavigateTab('seat_matrix')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Hall Capacity</span>
            <LayoutGrid className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">50</span>
            <span className="text-xs text-slate-500 font-semibold">Desks</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-medium flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{vacantSeatsCount} desks have open slots</span>
          </div>
        </div>

        {/* Card 2: Active Enrolled Students */}
        <div 
          onClick={() => onNavigateTab('students')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Enrolled Members</span>
            <Users className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{students.length}</span>
            <span className="text-xs text-slate-500 font-semibold">Active Students</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center space-x-1">
            <span className="text-slate-400">Total shift allocations:</span>
            <span className="font-semibold text-slate-700 font-mono">
              {students.reduce((acc, s) => acc + (s.shifts?.length || 1), 0)}
            </span>
          </div>
        </div>

        {/* Card 3: Fee Collections */}
        <div 
          onClick={() => onNavigateTab('fees')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fee Revenue</span>
            <Receipt className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-xs font-bold text-slate-500 font-mono">₹</span>
            <span className="text-3xl font-black text-emerald-700 font-mono tracking-tight">
              {totalCollected.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Collected fees</span>
            <span className="text-emerald-700 font-semibold group-hover:underline">
              Ledger →
            </span>
          </div>
        </div>

        {/* Card 4: Dues & Overdues */}
        <div 
          onClick={() => onNavigateTab('dues')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-sm hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Dues</span>
            <AlertCircle className={`w-4 h-4 ${totalDues > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-xs font-bold text-slate-500 font-mono">₹</span>
            <span className={`text-3xl font-black font-mono tracking-tight ${totalDues > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {totalDues.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 font-medium flex items-center justify-between">
            <span>Outstanding balance</span>
            <span className="text-rose-600 font-semibold group-hover:underline">
              Track Dues →
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Shift Occupancy Breakdown & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Real-time Shift Utilization (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">
                Shift Slot Utilization
              </h3>
              <p className="text-xs text-slate-500">
                Capacity distribution across Morning, Afternoon, Evening, and Night batches
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('seat_matrix')}
              className="text-xs font-semibold text-slate-700 hover:text-black flex items-center space-x-1 cursor-pointer"
            >
              <span>Manage Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Shift 1: Morning */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Sunrise className="w-4 h-4 text-amber-500" />
                  <span>Morning (6 AM - 12 PM)</span>
                </span>
                <span className="font-mono font-bold text-slate-900">{shiftStats.shift1}/50</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${(shiftStats.shift1 / 50) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>{Math.round((shiftStats.shift1 / 50) * 100)}% Booked</span>
                <span className="text-emerald-700 font-semibold">{50 - shiftStats.shift1} Free</span>
              </div>
            </div>

            {/* Shift 2: Afternoon */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Sun className="w-4 h-4 text-amber-600" />
                  <span>Afternoon (12 PM - 6 PM)</span>
                </span>
                <span className="font-mono font-bold text-slate-900">{shiftStats.shift2}/50</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-600 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${(shiftStats.shift2 / 50) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>{Math.round((shiftStats.shift2 / 50) * 100)}% Booked</span>
                <span className="text-emerald-700 font-semibold">{50 - shiftStats.shift2} Free</span>
              </div>
            </div>

            {/* Shift 3: Evening */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Sunset className="w-4 h-4 text-orange-500" />
                  <span>Evening (6 PM - 10 PM)</span>
                </span>
                <span className="font-mono font-bold text-slate-900">{shiftStats.shift3}/50</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-orange-500 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${(shiftStats.shift3 / 50) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>{Math.round((shiftStats.shift3 / 50) * 100)}% Booked</span>
                <span className="text-emerald-700 font-semibold">{50 - shiftStats.shift3} Free</span>
              </div>
            </div>

            {/* Shift 4: Night / Overnight */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span>Night Batch (10 PM - 6 AM)</span>
                </span>
                <span className="font-mono font-bold text-slate-900">{shiftStats.night}/50</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
                  style={{ width: `${(shiftStats.night / 50) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 flex justify-between">
                <span>{Math.round((shiftStats.night / 50) * 100)}% Booked</span>
                <span className="text-emerald-700 font-semibold">{50 - shiftStats.night} Free</span>
              </div>
            </div>

          </div>

          {/* Quick Action to Seat Matrix */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Want to allot a seat or register a student?</span>
            <button
              onClick={() => onNavigateTab('seat_matrix')}
              className="text-[#1C1935] hover:text-black font-bold flex items-center space-x-1 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
            >
              <span>Go to Seat Matrix (50 Desks)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Pending Actions & Activity (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Action Box 1: Shift Requests & Inquiries */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Inbox className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Pending Requests</h4>
                  <p className="text-[11px] text-slate-500">Student shift change petitions</p>
                </div>
              </div>

              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                pendingRequests.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-500'
              }`}>
                {pendingRequests.length}
              </span>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                No pending shift requests at the moment.
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between items-center font-semibold text-slate-800">
                      <span>{req.studentName}</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-amber-600 font-mono">Desk #{req.requestedSeat}</span>
                        {req.status === 'Hold' ? (
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded ring-1 ring-amber-400">HOLD</span>
                        ) : (
                          <span className="text-[9px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">PENDING</span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{req.requestedShift}</p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => onNavigateTab('requests')}
              className="w-full text-center py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Open Requests →
            </button>
          </div>

          {/* Action Box 2: Dues Fast Action */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Outstanding Fees</h4>
                  <p className="text-[11px] text-slate-500">Students with unpaid fees</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 text-xs space-y-1">
              <div className="flex justify-between text-rose-900 font-bold">
                <span>Total Overdue:</span>
                <span className="font-mono">₹{totalDues.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[11px] text-rose-700">
                Send 1-click WhatsApp payment reminders.
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('dues')}
              className="w-full text-center py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Launch Dues Tracker →
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
