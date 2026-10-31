import React, { useState, useEffect } from 'react';
import { 
  User, BookOpen, Clock, Calendar, CheckCircle2, 
  LogOut, Sun, Moon, Sunrise, Sunset, Share2, HelpCircle, 
  Send, AlertCircle, Phone, Mail, FileText, Users,
  Receipt, Printer, CreditCard, ShieldCheck, Check, X,
  ArrowRight, PlusCircle
} from 'lucide-react';
import { 
  getStoredSeats, 
  getStoredStudents, 
  isSeatHasVacancy, 
  getVacantShiftsCount,
  isSeatHasHold,
  getHoldShiftsCount,
  getShiftStatus,
  isShiftOnHold,
  getStudentFeeStatus,
  saveShiftRequest,
  getStoredShiftRequests,
  calculateShiftsFee,
  getShiftPricingConfig,
  DAY_SHIFTS, 
  NIGHT_SHIFTS 
} from '../data/libraryStore';
import logoImg from '../assets/logo.png';
import FeeReceiptModal from './FeeReceiptModal';

export default function StudentDashboard({ studentUser, onBackToLanding, onLogout }) {
  const [seats, setSeats] = useState(() => getStoredSeats());
  const [mode, setMode] = useState('day');
  const [selectedSeatDetails, setSelectedSeatDetails] = useState(null);
  const [isTotalShiftSelected, setIsTotalShiftSelected] = useState(false);
  const [shiftChangeSuccess, setShiftChangeSuccess] = useState('');
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [dismissedNoticeIds, setDismissedNoticeIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('amba_dismissed_notices_v1') || '[]');
    } catch (e) {
      return [];
    }
  });

  const handleDismissNotice = (noticeId) => {
    const updated = [...dismissedNoticeIds, noticeId];
    setDismissedNoticeIds(updated);
    try {
      localStorage.setItem('amba_dismissed_notices_v1', JSON.stringify(updated));
    } catch (e) {}
  };

  // Live student record (in case seat was transferred / approved)
  const [currentStudent, setCurrentStudent] = useState(() => {
    const allStudents = getStoredStudents();
    return allStudents.find(s => s.id === studentUser.id) || studentUser;
  });

  // Track student's shift requests
  const [myRequests, setMyRequests] = useState(() => {
    const all = getStoredShiftRequests();
    return all.filter(r => r.studentId === studentUser.id);
  });

  const refreshData = () => {
    const allSeats = getStoredSeats();
    setSeats(allSeats);
    const allStudents = getStoredStudents();
    const found = allStudents.find(s => s.id === studentUser.id);
    if (found) setCurrentStudent(found);
    const allReqs = getStoredShiftRequests();
    setMyRequests(allReqs.filter(r => r.studentId === studentUser.id));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const currentShiftList = mode === 'day' ? DAY_SHIFTS : NIGHT_SHIFTS;
  const feeStatus = getStudentFeeStatus(currentStudent);

  // Active / latest request notice
  const activeRequests = myRequests.filter(r => !dismissedNoticeIds.includes(r.id));
  const candidate = activeRequests.length > 0 ? activeRequests[0] : null;

  // Protect against orphaned requests from previously deleted student accounts:
  // If request says 'Approved' for Full Day, but current student is not Full Day, it's stale.
  const latestRequest = candidate && !(candidate.status === 'Approved' && candidate.isFullDay && !currentStudent.isFullDay)
    ? candidate 
    : null;

  // Request to ADD a shift (e.g. Student has Morning 6-10 AM, and adds Noon 10-2 PM => now has 6 AM - 2 PM, 2 shifts, ₹1200!)
  const handleRequestAddShift = (seatNum, shiftName, shiftId) => {
    const existing = Array.isArray(currentStudent.shifts) ? currentStudent.shifts : [];
    const combinedShiftIds = Array.from(new Set([...existing, shiftId]));
    const isNowFullDay = combinedShiftIds.length === 4 && mode === 'day';
    const newFee = calculateShiftsFee(combinedShiftIds, isNowFullDay, mode);
    const prevFee = currentStudent.monthlyFee || calculateShiftsFee(existing, currentStudent.isFullDay, currentStudent.mode);
    const feeDiff = Math.max(0, newFee - prevFee);

    const shiftNames = combinedShiftIds.map(sId => {
      const sObj = DAY_SHIFTS.find(x => x.id === sId) || NIGHT_SHIFTS.find(x => x.id === sId);
      return sObj?.name || sId;
    }).join(' + ');

    const shiftLabel = `${shiftNames} (${combinedShiftIds.length} Shifts)`;

    const entry = saveShiftRequest({
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      currentSeat: currentStudent.seatNumber,
      requestedSeat: seatNum,
      requestType: 'ADD_SHIFT',
      addingShiftId: shiftId,
      addingShiftName: shiftName,
      requestedShift: shiftLabel,
      requestedShiftId: combinedShiftIds.join('_'),
      shiftIds: combinedShiftIds,
      isFullDay: isNowFullDay,
      previousFee: prevFee,
      newFee: newFee,
      feeDifference: feeDiff,
      mode: mode,
      mobile: currentStudent.mobile || ''
    });

    setMyRequests(prev => [entry, ...prev]);
    setShiftChangeSuccess(`Request to add ${shiftName} submitted! Schedule: ${shiftLabel} • New Fee: ₹${newFee} (+₹${feeDiff} to pay).`);
    setTimeout(() => {
      setShiftChangeSuccess('');
    }, 5000);
  };

  // Request to SWITCH / Transfer to this shift only (Replaces previous shift)
  const handleRequestSwitchShift = (seatNum, shiftName, shiftId) => {
    const newFee = calculateShiftsFee([shiftId], false, mode);
    const prevFee = currentStudent.monthlyFee || calculateShiftsFee(currentStudent.shifts || [], currentStudent.isFullDay, currentStudent.mode);
    const feeDiff = newFee - prevFee;

    const entry = saveShiftRequest({
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      currentSeat: currentStudent.seatNumber,
      requestedSeat: seatNum,
      requestType: 'TRANSFER',
      requestedShift: `${shiftName} (1 Shift Only)`,
      requestedShiftId: shiftId,
      shiftIds: [shiftId],
      isFullDay: false,
      previousFee: prevFee,
      newFee: newFee,
      feeDifference: feeDiff,
      mode: mode,
      mobile: currentStudent.mobile || ''
    });

    setMyRequests(prev => [entry, ...prev]);
    setShiftChangeSuccess(`Request to switch to ${shiftName} on Desk #${seatNum} submitted (Fee: ₹${newFee}).`);
    setTimeout(() => {
      setShiftChangeSuccess('');
    }, 4000);
  };

  const handleRequestTotalShifts = (seatNum) => {
    // Total Shifts / Full Day ALWAYS books all 4 daytime shifts for 06:00 AM - 10:00 PM full day access
    const all4ShiftIds = ['shift1', 'shift2', 'shift3', 'shift4'];
    const shiftLabel = 'Full Day (All 4 Shifts — 06:00 AM to 10:00 PM)';
    const newFee = calculateShiftsFee(all4ShiftIds, true, 'day');
    const prevFee = currentStudent.monthlyFee || calculateShiftsFee(currentStudent.shifts || [], currentStudent.isFullDay, currentStudent.mode);
    const feeDiff = Math.max(0, newFee - prevFee);

    const entry = saveShiftRequest({
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      currentSeat: currentStudent.seatNumber,
      requestedSeat: seatNum,
      requestType: 'FULL_DAY',
      requestedShift: shiftLabel,
      requestedShiftId: 'full_day',
      shiftIds: all4ShiftIds,
      isFullDay: true,
      previousFee: prevFee,
      newFee: newFee,
      feeDifference: feeDiff,
      mode: 'day',
      mobile: currentStudent.mobile || ''
    });
    setMyRequests(prev => [entry, ...prev]);
    setIsTotalShiftSelected(false);
    setShiftChangeSuccess(`Full Day (All 4 Shifts) request for Desk #${seatNum} transmitted to Library Administration (Fee: ₹${newFee}).`);
    setTimeout(() => {
      setShiftChangeSuccess('');
    }, 5000);
  };

  const handleRequestKeepSingleShift = (seatNum, shiftName, shiftId) => {
    const shiftLabel = `Keep Only: ${shiftName}`;
    const newFee = calculateShiftsFee([shiftId], false, mode);
    const prevFee = currentStudent.monthlyFee || calculateShiftsFee(currentStudent.shifts || [], currentStudent.isFullDay, currentStudent.mode);
    const feeDiff = newFee - prevFee;

    const entry = saveShiftRequest({
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      currentSeat: currentStudent.seatNumber,
      requestedSeat: seatNum,
      requestType: 'DOWNGRADE',
      requestedShift: shiftLabel,
      requestedShiftId: shiftId,
      shiftIds: [shiftId],
      isFullDay: false,
      isDowngrade: true,
      previousFee: prevFee,
      newFee: newFee,
      feeDifference: feeDiff,
      mode: mode,
      mobile: currentStudent.mobile || ''
    });
    setMyRequests(prev => [entry, ...prev]);
    setShiftChangeSuccess(`Request to switch to single shift (${shiftName}) on Desk #${seatNum} transmitted to Library Administration (Fee: ₹${newFee}).`);
    setTimeout(() => {
      setShiftChangeSuccess('');
    }, 4000);
  };

  const getShiftIcon = (shiftId) => {
    switch (shiftId) {
      case 'shift1': return <Sunrise className="w-3.5 h-3.5 text-amber-500" />;
      case 'shift2': return <Sun className="w-3.5 h-3.5 text-amber-600" />;
      case 'shift3': return <Sunset className="w-3.5 h-3.5 text-orange-500" />;
      case 'shift4': return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      default: return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const seatNum = currentStudent.seatNumber || 1;
  const formattedMyDesk = seatNum < 10 ? `0${seatNum}` : seatNum;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans antialiased selection:bg-amber-100">
      
      {/* Executive Header */}
      <header className="bg-[#0B0F19] text-white sticky top-0 z-40 border-b border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-700/80 p-0.5 shadow-xs flex items-center justify-center overflow-hidden">
              <img src={logoImg} alt="Amba Library Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base text-white tracking-tight leading-none">
                  AMBA LIBRARY
                </span>
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded uppercase">
                  Student Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium block mt-0.5">
                Member ID: {studentUser.id}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onLogout}
              className="px-3 py-1.5 bg-slate-900/90 hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-slate-700/80 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex-1 w-full space-y-6">
        
        {/* Feedback message */}
        {shiftChangeSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center space-x-2 shadow-2xs animate-in fade-in text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{shiftChangeSuccess}</span>
          </div>
        )}

        {/* Live Shift Request Status Banner */}
        {latestRequest && (
          <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-2xs animate-in fade-in ${
            latestRequest.status === 'Hold'
              ? 'bg-amber-50 border-amber-300 text-amber-950 ring-1 ring-amber-400/40'
              : latestRequest.status === 'Approved'
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
              : latestRequest.status === 'Rejected'
              ? 'bg-rose-50/90 border-rose-200 text-rose-950'
              : 'bg-slate-100 border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                latestRequest.status === 'Hold' ? 'bg-amber-500 text-white animate-pulse' :
                latestRequest.status === 'Approved' ? 'bg-emerald-600 text-white' :
                latestRequest.status === 'Rejected' ? 'bg-rose-600 text-white' :
                'bg-slate-800 text-white'
              }`}>
                {latestRequest.status === 'Hold' ? <Clock className="w-4 h-4" /> :
                 latestRequest.status === 'Approved' ? <Check className="w-4 h-4" /> :
                 latestRequest.status === 'Rejected' ? <X className="w-4 h-4" /> :
                 <Clock className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs uppercase tracking-wider">
                    {latestRequest.status === 'Hold' ? 'Shift Request Approved (Desk on Hold)' :
                     latestRequest.status === 'Approved' ? 'Shift Allotment Confirmed' :
                     latestRequest.status === 'Rejected' ? 'Shift Request Declined / Released' :
                     'Shift Request In Review'}
                  </span>
                  <span className="text-[10px] font-mono opacity-60">
                    {new Date(latestRequest.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">
                  {latestRequest.status === 'Hold' ? (
                    <>
                      Good news! <strong>Desk #{latestRequest.requestedSeat} ({latestRequest.requestedShift})</strong> has been approved and placed on <strong>HOLD (Orange Slot)</strong> for you. Please visit Library Administration to complete fee payment and confirm your seat allotment.
                    </>
                  ) : latestRequest.status === 'Approved' ? (
                    <>
                      Your shift change has been <strong>Officially Allotted</strong>! You are assigned to <strong>Desk #{latestRequest.requestedSeat} ({latestRequest.requestedShift})</strong>. Your digital pass and seat have been updated.
                    </>
                  ) : latestRequest.status === 'Rejected' ? (
                    <>
                      Your shift change request for <strong>Desk #{latestRequest.requestedSeat} ({latestRequest.requestedShift})</strong> was declined or released by Library Administration.
                    </>
                  ) : (
                    <>
                      You have submitted a shift change request for <strong>Desk #{latestRequest.requestedSeat} ({latestRequest.requestedShift})</strong>. Awaiting Administrator review and hold approval.
                    </>
                  )}
                </p>
              </div>
            </div>

            {latestRequest.status !== 'Pending' && latestRequest.status !== 'Hold' && (
              <button
                onClick={() => handleDismissNotice(latestRequest.id)}
                className="opacity-50 hover:opacity-100 p-1 rounded-lg cursor-pointer transition-opacity"
                title="Dismiss notice"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* SECTION 1: OFFICIAL DIGITAL MEMBERSHIP PASS */}
        <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-5 border-b border-slate-100">
            
            {/* Student ID Info */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xl text-slate-700 shrink-0 shadow-2xs overflow-hidden">
                {currentStudent.photo ? (
                  <img src={currentStudent.photo} alt={currentStudent.name} className="w-full h-full object-cover" />
                ) : (
                  currentStudent.name?.charAt(0) || 'S'
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{currentStudent.name}</h2>
                  <span className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase">
                    Active Member
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{currentStudent.id}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{currentStudent.mobile}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentStudent.email}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Allocated Desk Card */}
            <div className="flex items-center space-x-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/90 w-full lg:w-auto">
              <div className="w-14 h-14 rounded-xl bg-slate-900 text-amber-400 flex flex-col items-center justify-center font-bold shadow-xs">
                <span className="text-[9px] uppercase tracking-wider text-slate-400">DESK</span>
                <span className="text-xl font-mono leading-none">#{formattedMyDesk}</span>
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-900 block">
                  {currentStudent.isFullDay ? 'Full Day Access (06:00 AM – 10:00 PM)' : `Allocated Slots (${currentStudent.shifts?.length || 1})`}
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {currentStudent.shifts?.map(sId => {
                    const shiftObj = DAY_SHIFTS.find(s => s.id === sId) || NIGHT_SHIFTS.find(s => s.id === sId);
                    return (
                      <span key={sId} className="bg-white text-slate-700 font-mono font-medium px-2 py-0.5 rounded text-[11px] border border-slate-200 shadow-2xs">
                        {shiftObj?.shortTime || sId}
                      </span>
                    );
                  })}
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">Quiet Study Zone Reserved</span>
              </div>
            </div>

          </div>

          {/* Student Profile Metadata (Admission Date, Parents, Aadhar) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 text-xs">
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Admission Date</span>
              <span className="font-mono font-semibold text-slate-800">{currentStudent.admissionDate || currentStudent.allottedAt || 'Recent'}</span>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Aadhar UID</span>
              <span className="font-mono font-semibold text-slate-800">{currentStudent.aadhar || 'Verified'}</span>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Father's Name</span>
              <span className="font-semibold text-slate-800 truncate block">{currentStudent.fatherName || 'Not specified'}</span>
            </div>
            <div className="p-2.5 bg-slate-50/70 rounded-lg border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Mother's Name</span>
              <span className="font-semibold text-slate-800 truncate block">{currentStudent.motherName || 'Not specified'}</span>
            </div>
          </div>

          {/* Fee & Subscription Status Card with Receipt Download */}
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center font-bold">
                <CreditCard className="w-4 h-4 text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-xs text-slate-900">Subscription Status:</span>
                  <span className={`text-[10px] px-2 py-0.2 rounded-full font-semibold ${feeStatus.badgeClass}`}>
                    {feeStatus.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Monthly Fee: <strong className="text-slate-900 font-mono">₹{currentStudent.monthlyFee || calculateShiftsFee(currentStudent.shifts, currentStudent.isFullDay, currentStudent.mode)}</strong> • Valid Till: <strong className="text-slate-900 font-mono">{currentStudent.validTill || 'Active'}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsReceiptOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs rounded-lg border border-slate-300 shadow-2xs transition-all cursor-pointer"
            >
              <Receipt className="w-3.5 h-3.5 text-slate-600" />
              <span>Download Official Receipt</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: LIVE DESKS VACANCY BOARD */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <span>Library Desks Vacancy Board (50 Desks)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time shift vacancy across the silent study floor. Click any desk to inspect shifts or request a change.
              </p>
            </div>

            {/* Mode switch */}
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 gap-1">
              <button
                onClick={() => setMode('day')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  mode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>Day Shifts</span>
              </button>
              <button
                onClick={() => setMode('night')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                  mode === 'night' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Moon className="w-3 h-3 text-indigo-400" />
                <span>Overnight Slot</span>
              </button>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs bg-white p-2.5 rounded-lg border border-slate-200/80">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-medium text-slate-700">Available Shift(s)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-[11px] font-medium text-amber-800">On Hold (Orange)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              <span className="text-[11px] font-medium text-slate-500">Fully Booked</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span className="text-[11px] font-medium text-indigo-900 font-semibold">My Assigned Desk</span>
            </div>
          </div>

          {/* 50 Desks Matrix for Student View */}
          <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-2.5">
            {seats.map(seat => {
              const hasVacancy = isSeatHasVacancy(seat, mode);
              const vacantCount = getVacantShiftsCount(seat, mode);
              const hasHold = isSeatHasHold(seat, mode);
              const holdCount = getHoldShiftsCount(seat, mode);
              const isMySeat = seat.seatNumber === studentUser.seatNumber;
              const formattedNum = seat.seatNumber < 10 ? `0${seat.seatNumber}` : seat.seatNumber;

              return (
                <button
                  key={seat.seatNumber}
                  onClick={() => setSelectedSeatDetails(seat)}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between h-24 relative ${
                    isMySeat 
                      ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400' 
                      : hasHold
                      ? 'bg-amber-50/30 border-amber-300 hover:border-amber-400 hover:shadow-2xs'
                      : hasVacancy 
                      ? 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs' 
                      : 'bg-slate-50/80 border-slate-200/60 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      #{formattedNum}
                    </span>
                    {isMySeat ? (
                      <span className="text-[9px] font-bold text-indigo-800 bg-indigo-100 px-1 rounded">
                        MINE
                      </span>
                    ) : hasHold ? (
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1 rounded">
                        {holdCount} hold
                      </span>
                    ) : hasVacancy ? (
                      <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1 rounded">
                        {vacantCount} free
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium text-slate-400">
                        Full
                      </span>
                    )}
                  </div>

                  {/* Micro shift bars */}
                  <div className="w-full my-1">
                    {mode === 'day' ? (
                      <div className="grid grid-cols-4 gap-1">
                        {DAY_SHIFTS.map(s => {
                          const stInfo = getShiftStatus(seat, 'day', s.id);
                          return (
                            <div
                              key={s.id}
                              className={`h-1 rounded-full ${
                                stInfo.status === 'HOLD'
                                  ? 'bg-amber-500 ring-1 ring-amber-400'
                                  : stInfo.status === 'OCCUPIED'
                                  ? 'bg-slate-300'
                                  : 'bg-emerald-500'
                              }`}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="w-full">
                        {(() => {
                          const nightSt = getShiftStatus(seat, 'night', 'night_full');
                          return (
                            <div 
                              className={`h-1 rounded-full ${
                                nightSt.status === 'HOLD'
                                  ? 'bg-amber-500'
                                  : nightSt.status === 'OCCUPIED'
                                  ? 'bg-slate-300'
                                  : 'bg-indigo-500'
                              }`}
                            />
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-400 truncate">
                    {isMySeat ? 'Assigned' : hasHold ? 'On Hold' : hasVacancy ? 'Click details' : 'Occupied'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </main>

      {/* Seat Shift Breakdown Modal for Student */}
      {selectedSeatDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Desk #{selectedSeatDetails.seatNumber} Shift Availability</h4>
                <p className="text-xs text-slate-400">Live Vacancy for {mode === 'day' ? 'Day Shifts' : 'Overnight Slot'}</p>
              </div>
              <button 
                onClick={() => {
                  setSelectedSeatDetails(null);
                  setIsTotalShiftSelected(false);
                }} 
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Shifts / Full Day Checkbox Action Card */}
            {mode === 'day' && (() => {
              // A daytime shift on this desk is available for THIS student if:
              // 1. It is vacant (!occupant && !hold), OR
              // 2. It is already assigned to this student (occupant === currentStudent.id), OR
              // 3. It is on hold FOR THIS STUDENT (hold?.studentId === currentStudent.id)
              const shiftsAvailableForMe = currentShiftList.filter(s => {
                const occupant = selectedSeatDetails.day[s.id];
                const hold = isShiftOnHold(selectedSeatDetails.seatNumber, 'day', s.id);
                if (occupant === currentStudent.id) return true;
                if (hold && hold.studentId === currentStudent.id) return true;
                if (!occupant && !hold) return true;
                return false;
              });

              // Desk can be booked as Full Day (Total Shifts) if all 4 shifts are available for this student
              const isAll4AvailableForMe = shiftsAvailableForMe.length === 4;
              const isMyOwnDesk = Number(selectedSeatDetails.seatNumber) === Number(currentStudent.seatNumber);

              const totalShiftActiveReq = myRequests.find(
                r => (r.status === 'Pending' || r.status === 'Hold') && 
                     Number(r.requestedSeat) === Number(selectedSeatDetails.seatNumber) &&
                     (r.isFullDay || r.requestedShiftId === 'full_day' || r.requestedShift?.toLowerCase().includes('total') || r.requestedShift?.toLowerCase().includes('full day'))
              );
              const hasAnyPendingOrHoldRequest = myRequests.some(r => r.status === 'Pending' || r.status === 'Hold');

              return (
                <div className={`p-3.5 rounded-xl border mb-3 transition-all ${
                  isTotalShiftSelected 
                    ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-400/30' 
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer select-none flex-1">
                      <input
                        type="checkbox"
                        checked={isTotalShiftSelected}
                        onChange={(e) => {
                          if (hasAnyPendingOrHoldRequest && !totalShiftActiveReq) return;
                          setIsTotalShiftSelected(e.target.checked);
                        }}
                        disabled={!isAll4AvailableForMe || (hasAnyPendingOrHoldRequest && !totalShiftActiveReq)}
                        className="w-4 h-4 rounded text-slate-900 accent-[#1C1935] cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-xs text-slate-900 block leading-tight">
                            Total Shift (Full Day — All 4 Shifts)
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            totalShiftActiveReq?.status === 'Hold'
                              ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400'
                              : isAll4AvailableForMe 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {totalShiftActiveReq?.status === 'Hold'
                              ? 'On Hold For You'
                              : isAll4AvailableForMe 
                              ? (isMyOwnDesk ? 'Upgrade to Full Day' : 'All 4 Shifts Available') 
                              : 'Occupied by Other'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          {isAll4AvailableForMe
                            ? (isMyOwnDesk 
                                ? 'Upgrade your desk to 06:00 AM – 10:00 PM full day unlimited access' 
                                : 'Book all 4 daytime shifts simultaneously (06:00 AM – 10:00 PM)')
                            : 'This desk cannot be booked for full day as one or more slots are occupied or on hold'}
                        </span>
                      </div>
                    </label>

                    {/* Action button: Request Total Shifts */}
                    {totalShiftActiveReq?.status === 'Hold' ? (
                      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold shrink-0">
                        <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                        <span>On Hold — Pay Admin</span>
                      </div>
                    ) : totalShiftActiveReq ? (
                      <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold shrink-0">
                        <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                        <span>Total Request Sent</span>
                      </div>
                    ) : isTotalShiftSelected ? (
                      <button
                        type="button"
                        onClick={() => handleRequestTotalShifts(selectedSeatDetails.seatNumber)}
                        className="bg-[#1C1935] hover:bg-[#2b2752] active:bg-black text-amber-400 font-bold px-3.5 py-1.5 rounded-lg text-xs transition-all shadow-xs flex items-center space-x-1.5 shrink-0 cursor-pointer"
                      >
                        <Send className="w-3 h-3 text-amber-400" />
                        <span>Send Total Request</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (hasAnyPendingOrHoldRequest || !isAll4AvailableForMe) return;
                          setIsTotalShiftSelected(true);
                          handleRequestTotalShifts(selectedSeatDetails.seatNumber);
                        }}
                        disabled={!isAll4AvailableForMe || hasAnyPendingOrHoldRequest}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1 shrink-0 ${
                          isAll4AvailableForMe && !hasAnyPendingOrHoldRequest
                            ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                        title={hasAnyPendingOrHoldRequest ? 'You already have 1 shift change request in progress' : 'Click to select and send request for all 4 shifts'}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Select All &amp; Send</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="space-y-2">
              {currentShiftList.map(shift => {
                const occupantId = selectedSeatDetails[mode][shift.id];
                const holdInfo = isShiftOnHold(selectedSeatDetails.seatNumber, mode, shift.id);
                const isOccupiedByMe = occupantId === currentStudent.id;
                const isOccupiedByOther = occupantId && !isOccupiedByMe;
                const isOnHoldForMe = holdInfo && holdInfo.studentId === currentStudent.id;
                const isOnHoldForOther = holdInfo && holdInfo.studentId !== currentStudent.id;
                const isVacant = !occupantId && !holdInfo;

                return (
                  <div
                    key={shift.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isOccupiedByMe
                        ? 'bg-indigo-50/70 border-indigo-200 shadow-2xs'
                        : isOnHoldForMe
                        ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400/40 shadow-2xs'
                        : isOnHoldForOther
                        ? 'bg-amber-50/30 border-amber-200/80'
                        : isOccupiedByOther
                        ? 'bg-slate-50 border-slate-200'
                        : isTotalShiftSelected
                        ? 'bg-amber-50/40 border-amber-300/80 shadow-2xs'
                        : 'bg-white border-slate-200/90'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-slate-900">{shift.name}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                          isOccupiedByMe 
                            ? 'bg-indigo-100 text-indigo-800 font-bold ring-1 ring-indigo-500/20' 
                            : isOnHoldForMe
                            ? 'bg-amber-100 text-amber-900 font-bold ring-1 ring-amber-400'
                            : isOnHoldForOther
                            ? 'bg-amber-100 text-amber-800 font-semibold'
                            : isOccupiedByOther 
                            ? 'bg-slate-200 text-slate-700' 
                            : isTotalShiftSelected
                            ? 'bg-amber-100 text-amber-800 font-bold'
                            : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                        }`}>
                          {isOccupiedByMe 
                            ? 'Your Current Shift' 
                            : isOnHoldForMe
                            ? 'Reserved For You (On Hold)'
                            : isOnHoldForOther
                            ? 'On Hold (Reserved)'
                            : isOccupiedByOther 
                            ? 'Occupied' 
                            : isTotalShiftSelected 
                            ? 'Selected in Total' 
                            : 'Vacant'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-mono mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{shift.time}</span>
                      </div>
                    </div>

                    {isOccupiedByMe && (
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                          Active Slot
                        </span>

                        {/* If student currently has multiple shifts or full day, allow requesting to keep ONLY this single shift */}
                        {(currentStudent.isFullDay || (currentStudent.shifts?.length || 0) > 1) && (() => {
                          const isThisDowngradeRequested = myRequests.some(
                            r => r.status === 'Pending' && 
                                 Number(r.requestedSeat) === Number(selectedSeatDetails.seatNumber) &&
                                 (r.requestedShiftId === shift.id || r.requestedShift?.includes(shift.name))
                          );
                          const hasAnyPendingRequest = myRequests.some(r => r.status === 'Pending');

                          if (isThisDowngradeRequested) {
                            return (
                              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span>Keep Request Sent</span>
                              </div>
                            );
                          }

                          return (
                            <button
                              type="button"
                              onClick={() => handleRequestKeepSingleShift(selectedSeatDetails.seatNumber, shift.name, shift.id)}
                              disabled={hasAnyPendingRequest}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 ${
                                hasAnyPendingRequest 
                                   ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-2xs'
                              }`}
                              title={hasAnyPendingRequest ? 'You already have 1 shift change request in review' : `Request to keep only ${shift.name} and release other shifts`}
                            >
                              <ArrowRight className="w-3 h-3" />
                              <span>Keep Only This Shift</span>
                            </button>
                          );
                        })()}
                      </div>
                    )}

                    {isOnHoldForMe && (
                      <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                        <span>Held 4 You — Pay Fee</span>
                      </div>
                    )}

                    {isOnHoldForOther && (
                      <span className="text-xs text-slate-400 font-medium px-2.5 py-1 bg-slate-100 rounded-lg">
                        Reserved
                      </span>
                    )}

                    {isOccupiedByOther && (
                      <span className="text-xs text-slate-400 font-medium px-2.5 py-1 bg-slate-100 rounded-lg">
                        Occupied
                      </span>
                    )}

                    {isVacant && (() => {
                      const isTotalShiftAlreadyRequested = myRequests.some(
                        r => (r.status === 'Pending' || r.status === 'Hold') && 
                             Number(r.requestedSeat) === Number(selectedSeatDetails.seatNumber) &&
                             (r.isFullDay || r.requestedShiftId === 'full_day' || r.requestedShift?.toLowerCase().includes('total') || r.requestedShift?.toLowerCase().includes('full day'))
                      );

                      const isAlreadyRequestedForThisShift = myRequests.some(
                        r => (r.status === 'Pending' || r.status === 'Hold') && 
                             Number(r.requestedSeat) === Number(selectedSeatDetails.seatNumber) &&
                             (r.requestedShiftId === shift.id || r.requestedShift === shift.name)
                      );
                      const hasAnyPendingRequest = myRequests.some(r => r.status === 'Pending' || r.status === 'Hold');

                      if (isTotalShiftAlreadyRequested) {
                        return (
                          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 text-[11px] font-semibold">
                            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                            <span>In Total Request</span>
                          </div>
                        );
                      }

                      if (isAlreadyRequestedForThisShift) {
                        return (
                          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 text-xs font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                            <span>Request Sent</span>
                          </div>
                        );
                      }

                      if (hasAnyPendingRequest) {
                        return (
                          <button
                            disabled
                            className="bg-slate-100 text-slate-400 font-medium px-2.5 py-1 rounded-lg text-xs cursor-not-allowed"
                            title="You already have 1 shift change request in progress"
                          >
                            <span>Request In Progress</span>
                          </button>
                        );
                      }

                      const studentHasActiveShifts = (currentStudent.shifts?.length || 0) > 0;
                      const isSameDesk = Number(selectedSeatDetails.seatNumber) === Number(currentStudent.seatNumber);

                      if (studentHasActiveShifts && isSameDesk) {
                        return (
                          <div className="flex items-center gap-1.5">
                            {/* Option 1: Add Shift to current schedule (e.g. 6-10 AM + 10-2 PM = 6 AM to 2 PM, 2 shifts, ₹1200) */}
                            <button
                              type="button"
                              onClick={() => handleRequestAddShift(selectedSeatDetails.seatNumber, shift.name, shift.id)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1 cursor-pointer shadow-2xs"
                              title={`Add ${shift.name} to your schedule. Total fee will update to ₹${calculateShiftsFee([...(currentStudent.shifts || []), shift.id], false, mode)}/month`}
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>+ Add Shift (+₹600)</span>
                            </button>

                            {/* Option 2: Switch to this shift only (transfer) */}
                            <button
                              type="button"
                              onClick={() => handleRequestSwitchShift(selectedSeatDetails.seatNumber, shift.name, shift.id)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer border border-slate-200"
                              title={`Switch to ${shift.name} only (Fee: ₹600/month)`}
                            >
                              <span>Switch Only</span>
                            </button>
                          </div>
                        );
                      }

                      return (
                        <button
                          onClick={() => handleRequestSwitchShift(selectedSeatDetails.seatNumber, shift.name, shift.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1.5 cursor-pointer shadow-xs"
                        >
                          <Send className="w-3 h-3 text-amber-400" />
                          <span>Request Shift (₹600/mo)</span>
                        </button>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 flex justify-end items-center text-xs">
              <button
                onClick={() => {
                  setSelectedSeatDetails(null);
                  setIsTotalShiftSelected(false);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Fee Receipt Modal */}
      <FeeReceiptModal
        isOpen={isReceiptOpen}
        student={studentUser}
        onClose={() => setIsReceiptOpen(false)}
      />

    </div>
  );
}
