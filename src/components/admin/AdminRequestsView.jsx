import React, { useState } from 'react';
import { 
  Inbox, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  Mail, 
  MessageSquare, 
  User, 
  Trash2,
  Check,
  ExternalLink,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { 
  approveShiftRequest, 
  rejectShiftRequest, 
  holdShiftRequest, 
  allotShiftRequest 
} from '../../data/libraryStore';

export default function AdminRequestsView({
  shiftRequests = [],
  feedbacks = [],
  onDataUpdated
}) {
  const [activeSubTab, setActiveSubTab] = useState('shifts'); // 'shifts' | 'inquiries'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Pending' | 'Hold' | 'Approved'
  const [feeOverrides, setFeeOverrides] = useState({});

  const handleFeeChange = (reqId, value) => {
    setFeeOverrides(prev => ({ ...prev, [reqId]: value }));
  };

  const handleHold = (reqId) => {
    const res = holdShiftRequest(reqId);
    if (res && !res.success) {
      alert(res.error || 'Failed to place request on hold');
    }
    if (onDataUpdated) onDataUpdated();
  };

  const handleAllot = (reqId) => {
    const customFee = feeOverrides[reqId];
    const res = allotShiftRequest(reqId, customFee);
    if (res && !res.success) {
      alert(res.error || 'Failed to allot seat');
    }
    if (onDataUpdated) onDataUpdated();
  };

  const handleReject = (reqId) => {
    rejectShiftRequest(reqId);
    if (onDataUpdated) onDataUpdated();
  };

  // Filter requests based on status filter
  const filteredRequests = shiftRequests.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const pendingCount = shiftRequests.filter(r => r.status === 'Pending').length;
  const holdCount = shiftRequests.filter(r => r.status === 'Hold').length;
  const approvedCount = shiftRequests.filter(r => r.status === 'Approved').length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Inbox className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Requests &amp; Communications Terminal
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage student shift modification petitions and website inquiries
          </p>
        </div>

        {/* Tab switcher */}
        <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveSubTab('shifts')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'shifts' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Shift Requests ({shiftRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('inquiries')}
            className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
              activeSubTab === 'inquiries' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span>Website Inquiries ({feedbacks.length})</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Student Shift Requests */}
      {activeSubTab === 'shifts' && (
        <div className="space-y-4">
          
          {/* Quick Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-slate-200/80 text-xs">
            <span className="text-slate-400 font-medium text-[11px] mr-1">Filter by Status:</span>
            
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                statusFilter === 'all' 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({shiftRequests.length})
            </button>

            <button
              onClick={() => setStatusFilter('Pending')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === 'Pending' 
                  ? 'bg-amber-600 text-white' 
                  : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>Pending ({pendingCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Hold')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === 'Hold' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-orange-50 text-orange-900 hover:bg-orange-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>On Hold (Orange) ({holdCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Approved')}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                statusFilter === 'Approved' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Allotted ({approvedCount})</span>
            </button>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                {statusFilter === 'all' ? 'Inbox Clean — No Shift Petitions' : `No ${statusFilter} Requests`}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When students request a desk or shift modification from their Student Portal, it will appear here for administrative hold and allotment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((req) => (
                <div 
                  key={req.id}
                  className={`bg-white p-5 rounded-2xl border shadow-2xs space-y-3 flex flex-col justify-between transition-all ${
                    req.status === 'Hold' 
                      ? 'border-amber-300 ring-1 ring-amber-400/40 bg-amber-50/10' 
                      : req.status === 'Approved'
                      ? 'border-emerald-200 bg-emerald-50/5'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                        req.status === 'Hold'
                          ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-400'
                          : req.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {req.studentName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-tight">
                          {req.studentName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ID: {req.studentId} • Mobile: {req.mobile || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {req.status === 'Hold' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-100 text-amber-900 ring-1 ring-amber-400 flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                        <span>ON HOLD (ORANGE)</span>
                      </span>
                    ) : req.status === 'Approved' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span>ALLOTTED (RED)</span>
                      </span>
                    ) : req.status === 'Rejected' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-rose-100 text-rose-800">
                        DISMISSED
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-100 text-amber-800 animate-pulse">
                        PENDING REVIEW
                      </span>
                    )}
                  </div>

                  {/* Transfer & Fee Details */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Current Plan:</span>
                      <span className="font-bold text-slate-800 font-mono">
                        Desk #{req.currentSeat || 'Assigned'} ({req.previousFee ? `₹${req.previousFee}/mo` : 'Active'})
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-amber-950 font-semibold">
                      <span>Target Schedule:</span>
                      <span className="font-bold font-mono bg-amber-100 px-2 py-0.5 rounded text-amber-900 border border-amber-200">
                        Desk #{req.requestedSeat} ({req.requestedShift})
                      </span>
                    </div>

                    {/* Fee Adjustment / Breakdown */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Monthly Fee</span>
                        {req.feeDifference !== undefined && req.feeDifference > 0 && (
                          <span className="text-[10px] text-emerald-700 font-bold">
                            Diff: +₹{req.feeDifference}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-1">
                        <span className="font-bold text-slate-500 font-mono">₹</span>
                        <input
                          type="number"
                          value={feeOverrides[req.id] !== undefined ? feeOverrides[req.id] : (req.newFee || 1200)}
                          onChange={(e) => handleFeeChange(req.id, e.target.value)}
                          disabled={req.status === 'Approved'}
                          className="w-20 px-2 py-1 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 text-right disabled:bg-slate-100 disabled:text-slate-500"
                          title="Admin can adjust or confirm monthly fee before allotting"
                        />
                        <span className="text-[10px] text-slate-400">/mo</span>
                      </div>
                    </div>

                    {req.createdAt && (
                      <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                        <span>Submitted: {new Date(req.createdAt).toLocaleString()}</span>
                        {req.heldAt && (
                          <span className="text-amber-700 font-semibold">Held: {new Date(req.heldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        {req.approvedAt && (
                          <span className="text-emerald-700 font-semibold">Allotted: {new Date(req.approvedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dynamic Action Buttons based on 3-Stage Lifecycle */}
                  {req.status === 'Pending' && (
                    <div className="space-y-2 pt-1">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* Step 1: Approve & Put on Hold (Orange Slot) */}
                        <button
                          onClick={() => handleHold(req.id)}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Place desk slot on Hold (Orange). Student will see reserved slot and visit admin for fee payment."
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Approve &amp; Hold (Orange)</span>
                        </button>

                        {/* Direct Allot (Converts directly to Red) */}
                        <button
                          onClick={() => handleAllot(req.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer shadow-xs"
                          title="Allot immediately if payment is already collected"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Direct Allot</span>
                        </button>

                        {/* Dismiss */}
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-2 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 text-center">
                        Click "Approve &amp; Hold" to turn slot <strong className="text-amber-600">Orange</strong> on the 50 Desks Board while student pays fee.
                      </p>
                    </div>
                  )}

                  {req.status === 'Hold' && (
                    <div className="space-y-2 pt-1">
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                        <div className="flex items-center space-x-1.5 font-bold">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>Slot is currently ON HOLD (Orange) on Desk #{req.requestedSeat}</span>
                        </div>
                        <p className="text-amber-800 leading-relaxed">
                          Student has been notified to complete fee payment. Once received, click below to confirm allotment.
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {/* Step 2: Allot Seat & Confirm (Turns Orange to Red / Occupied) */}
                        <button
                          onClick={() => handleAllot(req.id)}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                          title="Converts slot from Orange to RED (Occupied / Allotted)"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Allot Seat &amp; Confirm (Turns Red)</span>
                        </button>

                        {/* Release Hold (Turns back to Green / Vacant) */}
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          title="Cancel hold and make slot Green (Vacant) again"
                        >
                          Release Hold
                        </button>
                      </div>
                    </div>
                  )}

                  {req.status === 'Approved' && (
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 text-[11px] text-emerald-800 flex items-center justify-between">
                      <span className="font-semibold flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Seat officially allotted (Occupied / Red)</span>
                      </span>
                      <span className="font-mono text-emerald-700">Desk #{req.requestedSeat}</span>
                    </div>
                  )}

                  {req.status === 'Rejected' && (
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Request dismissed / hold released</span>
                      <span className="text-[10px] text-slate-400">Reverted to Vacant</span>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sub-tab 2: Website Inquiries */}
      {activeSubTab === 'inquiries' && (
        <div className="space-y-4">
          {feedbacks.length === 0 ? (
            <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center space-y-3">
              <Mail className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Visitor Inquiries Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Messages and inquiries sent by visitors via the "Get in Touch" form on your website will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <div 
                  key={fb.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{fb.subject || 'Website Inquiry'}</h4>
                      <p className="text-xs text-slate-500">
                        From: <span className="font-semibold text-slate-800">{fb.name}</span> ({fb.email})
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {fb.createdAt ? new Date(fb.createdAt).toLocaleDateString() : 'Recent'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    "{fb.message}"
                  </p>

                  <div className="flex justify-end pt-1">
                    <a
                      href={`mailto:${fb.email}?subject=${encodeURIComponent('Re: ' + (fb.subject || 'Inquiry - Amba Library'))}`}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Reply via Email</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
