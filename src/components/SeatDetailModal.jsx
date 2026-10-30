import React, { useState } from 'react';
import { 
  X, CheckCircle2, AlertCircle, Clock, User, Phone, 
  CheckSquare, Square, Trash2, ArrowRight, Sunrise, Sun, 
  Sunset, Moon, ShieldCheck, Check
} from 'lucide-react';
import { 
  DAY_SHIFTS, 
  NIGHT_SHIFTS, 
  deallocateShift,
  isShiftOnHold,
  allotShiftRequest,
  rejectShiftRequest
} from '../data/libraryStore';

export default function SeatDetailModal({
  isOpen,
  onClose,
  seat,
  mode,
  students,
  onOpenAllotment,
  onViewStudent,
  onDataChanged
}) {
  const [selectedShifts, setSelectedShifts] = useState([]);
  const [isFullDaySelected, setIsFullDaySelected] = useState(false);

  if (!isOpen || !seat) return null;

  const currentShiftList = mode === 'day' ? DAY_SHIFTS : NIGHT_SHIFTS;
  const seatAllotments = seat[mode] || {};

  const vacantShiftIds = currentShiftList
    .filter(s => !seatAllotments[s.id] && !isShiftOnHold(seat.seatNumber, mode, s.id))
    .map(s => s.id);

  const handleToggleFullDay = () => {
    if (isFullDaySelected) {
      setIsFullDaySelected(false);
      setSelectedShifts([]);
    } else {
      setIsFullDaySelected(true);
      setSelectedShifts(vacantShiftIds);
    }
  };

  const handleToggleShift = (shiftId) => {
    if (seatAllotments[shiftId] || isShiftOnHold(seat.seatNumber, mode, shiftId)) return;

    let updated;
    if (selectedShifts.includes(shiftId)) {
      updated = selectedShifts.filter(id => id !== shiftId);
    } else {
      updated = [...selectedShifts, shiftId];
    }
    setSelectedShifts(updated);
    setIsFullDaySelected(updated.length === 4);
  };

  const handleQuickAllotHold = (requestId) => {
    const res = allotShiftRequest(requestId);
    if (res && !res.success) {
      alert(res.error || 'Failed to allot seat');
    }
    if (onDataChanged) onDataChanged();
  };

  const handleQuickReleaseHold = (requestId) => {
    if (window.confirm('Are you sure you want to release this hold? The slot will become vacant (Green) again.')) {
      rejectShiftRequest(requestId);
      if (onDataChanged) onDataChanged();
    }
  };

  const handleDeallocate = (shiftId, studentName) => {
    if (window.confirm(`Are you sure you want to cancel shift allocation for ${studentName}?`)) {
      deallocateShift({
        seatNumber: seat.seatNumber,
        mode,
        shiftId
      });
      onDataChanged();
      setSelectedShifts(prev => prev.filter(id => id !== shiftId));
    }
  };

  const getShiftIcon = (shiftId) => {
    switch (shiftId) {
      case 'shift1': return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'shift2': return <Sun className="w-4 h-4 text-amber-600" />;
      case 'shift3': return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'shift4': return <Moon className="w-4 h-4 text-indigo-400" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const formattedDeskNum = seat.seatNumber < 10 ? `0${seat.seatNumber}` : seat.seatNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/90 my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Executive Modal Header */}
        <div className="bg-[#0B0F19] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center font-mono font-bold text-base shadow-xs">
              #{formattedDeskNum}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base leading-tight">Desk #{seat.seatNumber} Details</h3>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  vacantShiftIds.length > 0 
                    ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30' 
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {vacantShiftIds.length > 0 ? `${vacantShiftIds.length} Shift(s) Available` : '100% Reserved'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'day' ? 'Daytime Schedule (4 Slots Available)' : 'Overnight Dedicated Slot'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Full Day Option (Day Mode) */}
        {mode === 'day' && (
          <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-3 flex items-center justify-between">
            <label className="flex items-center space-x-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFullDaySelected}
                onChange={handleToggleFullDay}
                disabled={vacantShiftIds.length === 0}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-slate-900 block leading-tight">
                  Full Day Membership (06:00 AM – 10:00 PM)
                </span>
                <span className="text-[11px] text-slate-500">
                  Select all 4 daytime shifts simultaneously for a student
                </span>
              </div>
            </label>
            {vacantShiftIds.length < 4 && vacantShiftIds.length > 0 && (
              <span className="text-[10px] text-amber-800 font-semibold bg-amber-50 ring-1 ring-amber-600/20 px-2 py-0.5 rounded">
                Partially Booked
              </span>
            )}
          </div>
        )}

        {/* Shift Breakdown List */}
        <div className="p-5 space-y-2.5 max-h-[55vh] overflow-y-auto">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
            Desk Shift Schedule
          </div>

          {currentShiftList.map(shift => {
            const studentId = seatAllotments[shift.id];
            const isAllotted = !!studentId;
            const holdInfo = !isAllotted ? isShiftOnHold(seat.seatNumber, mode, shift.id) : null;
            const isOnHold = !!holdInfo;
            const student = isAllotted 
              ? (students?.find(st => st.id === studentId) || null)
              : null;
            const isSelected = selectedShifts.includes(shift.id);

            return (
              <div
                key={shift.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isAllotted
                    ? 'bg-slate-50/70 border-slate-200'
                    : isOnHold
                    ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-400/40'
                    : isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-2xs ring-1 ring-emerald-500'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  
                  {/* Left: Shift Info */}
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                      isOnHold ? 'bg-amber-100 border-amber-300' : 'bg-slate-100 border-slate-200/80'
                    }`}>
                      {getShiftIcon(shift.id)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-xs">{shift.name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isAllotted 
                            ? 'bg-slate-200 text-slate-700' 
                            : isOnHold
                            ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400 font-bold'
                            : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                        }`}>
                          {isAllotted ? 'Occupied' : isOnHold ? 'On Hold (Orange)' : 'Vacant'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-[11px] text-slate-500 font-mono mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{shift.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Allocation details, Hold Actions, or Select button */}
                  <div>
                    {isAllotted ? (
                      <div 
                        onClick={() => {
                          if (student && onViewStudent) {
                            onViewStudent(student);
                          } else if (onViewStudent) {
                            onViewStudent({
                              id: studentId,
                              name: 'Student',
                              mobile: 'Registered',
                              seatNumber: seat.seatNumber,
                              mode,
                              shifts: [shift.id]
                            });
                          }
                        }}
                        title="Click to view student record"
                        className="flex items-center space-x-2 bg-white hover:bg-slate-100 p-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer group"
                      >
                        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                          {student?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="text-left pr-1">
                          <p className="text-xs font-semibold text-slate-800 leading-tight">
                            {student?.name || 'Student Member'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{student?.mobile || studentId}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeallocate(shift.id, student?.name || 'student');
                          }}
                          title="Revoke / Deallocate shift"
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : isOnHold ? (
                      <div className="flex items-center gap-2">
                        <div className="text-right pr-1">
                          <p className="text-xs font-bold text-amber-900 leading-tight">
                            {holdInfo.studentName || 'Student'}
                          </p>
                          <p className="text-[10px] text-amber-700 font-mono">Payment Pending</p>
                        </div>

                        {/* Allot Seat Button (Turns Orange to Red/Occupied) */}
                        <button
                          type="button"
                          onClick={() => handleQuickAllotHold(holdInfo.requestId)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shadow-2xs cursor-pointer"
                          title="Allot Seat & Confirm (Converts to Red / Occupied)"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Allot Seat</span>
                        </button>

                        {/* Release Hold Button (Turns Orange to Green/Vacant) */}
                        <button
                          type="button"
                          onClick={() => handleQuickReleaseHold(holdInfo.requestId)}
                          className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                          title="Release Hold (reverts to Green/Vacant)"
                        >
                          Release
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleShift(shift.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5 text-slate-400" />}
                        <span>{isSelected ? 'Selected' : 'Select'}</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            {selectedShifts.length > 0 ? (
              <span className="text-slate-900 font-semibold">
                {selectedShifts.length} shift(s) selected
              </span>
            ) : (
              <span>Select vacant shift(s) to admit student</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={selectedShifts.length === 0}
              onClick={() => {
                onOpenAllotment({
                  seatNumber: seat.seatNumber,
                  mode,
                  shifts: selectedShifts
                });
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                selectedShifts.length > 0
                  ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>Continue to Allotment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
