import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, Sun, Moon, Sunrise, Sunset,
  CheckCircle2, AlertCircle, PlusCircle, Filter, BookOpen, 
  Layers, Download, RefreshCw, Eye, X, Receipt, CreditCard, 
  Printer, LayoutGrid, LogOut, SlidersHorizontal, ArrowRight,
  UserCheck, Clock, Check, Bell, Map, ChevronRight, Menu, Trash2,
  Pencil, MapPin
} from 'lucide-react';
import { 
  getStoredSeats, 
  getStoredStudents, 
  getStoredAdminProfile,
  getStoredShiftRequests,
  getStoredFeedbacks,
  deleteStudentCompletely,
  saveStoredSession,
  isSeatHasVacancy, 
  getVacantShiftsCount,
  isSeatHasHold,
  getHoldShiftsCount,
  getShiftStatus,
  getStudentFeeStatus,
  DAY_SHIFTS,
  NIGHT_SHIFTS
} from '../data/libraryStore';

// Modular Admin Views
import AdminSidebar from './admin/AdminSidebar';
import AdminDashboardOverview from './admin/AdminDashboardOverview';
import AdminDuesTracker from './admin/AdminDuesTracker';
import AdminRequestsView from './admin/AdminRequestsView';
import AdminReportsView from './admin/AdminReportsView';

// Existing Views & Modals
import FeeManagementView from './FeeManagementView';
import SeatDetailModal from './SeatDetailModal';
import StudentAllotmentModal from './StudentAllotmentModal';
import FeeReceiptModal from './FeeReceiptModal';
import AdminProfileModal from './AdminProfileModal';
import EditStudentModal from './EditStudentModal';
import logoImg from '../assets/amba_official_logo.png';

export default function AdminSeatManagement({ onLogout }) {
  const [seats, setSeats] = useState(() => getStoredSeats());
  const [students, setStudents] = useState(() => getStoredStudents());
  const [adminProfile, setAdminProfile] = useState(() => getStoredAdminProfile());
  const [shiftRequests, setShiftRequests] = useState(() => getStoredShiftRequests());
  const [feedbacks, setFeedbacks] = useState(() => getStoredFeedbacks());

  // Navigation tab state: 'dashboard' | 'seat_matrix' | 'seat_map' | 'students' | 'requests' | 'fees' | 'dues' | 'reports' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mode, setMode] = useState('day'); // 'day' | 'night'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState('all');

  // Modal states
  const [activeSeatModal, setActiveSeatModal] = useState(null);
  const [allotmentModalData, setAllotmentModalData] = useState(null);
  const [viewStudentModal, setViewStudentModal] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [feeReceiptModalStudent, setFeeReceiptModalStudent] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const reloadData = () => {
    setSeats(getStoredSeats());
    setStudents(getStoredStudents());
    setShiftRequests(getStoredShiftRequests());
    setFeedbacks(getStoredFeedbacks());
  };

  const handleDeleteStudent = (student) => {
    if (!student) return;
    const confirmed = window.confirm(`Are you sure you want to completely remove ${student.name} (Desk #${student.seatNumber})? This will free the desk and remove all records.`);
    if (confirmed) {
      deleteStudentCompletely(student.id);
      reloadData();
    }
  };

  useEffect(() => {
    reloadData();
    const handleSync = () => reloadData();
    window.addEventListener('amba_data_synced', handleSync);
    return () => window.removeEventListener('amba_data_synced', handleSync);
  }, []);

  // Filtered Seats for Seat Matrix
  const filteredSeats = seats.filter(s => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSeatNum = s.seatNumber.toString().includes(q) || `seat ${s.seatNumber}`.includes(q) || `desk ${s.seatNumber}`.includes(q);
      
      const allocatedStudentNames = mode === 'day' 
        ? Object.values(s.day).filter(Boolean).map(id => {
            const st = students.find(x => x.id === id);
            return st ? `${st.name} ${st.mobile} ${st.id}`.toLowerCase() : '';
          }).join(' ')
        : (s.night.night_full ? (() => {
            const st = students.find(x => x.id === s.night.night_full);
            return st ? `${st.name} ${st.mobile} ${st.id}`.toLowerCase() : '';
          })() : '');

      return matchesSeatNum || allocatedStudentNames.includes(q);
    }

    if (mode === 'day' && selectedShiftFilter !== 'all') {
      return !s.day[selectedShiftFilter];
    }

    return true;
  });

  const getShiftIcon = (shiftId) => {
    switch (shiftId) {
      case 'shift1': return <Sunrise className="w-3.5 h-3.5 text-amber-500" />;
      case 'shift2': return <Sun className="w-3.5 h-3.5 text-amber-600" />;
      case 'shift3': return <Sunset className="w-3.5 h-3.5 text-orange-500" />;
      case 'shift4': return <Moon className="w-3.5 h-3.5 text-indigo-500" />;
      default: return <Clock className="w-3 h-3 text-slate-400" />;
    }
  };

  // Get active breadcrumb title
  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'seat_matrix': return 'Seat Matrix (50 Desks)';
      case 'students': return 'Enrolled Student Records';
      case 'requests': return 'Requests & Communications';
      case 'fees': return 'Fee Collection Terminal';
      case 'dues': return 'Dues & Overdue Recovery Tracker';
      case 'reports': return 'Reports';
      case 'settings': return 'Admin Settings & Security';
      default: return 'Admin Console';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex font-sans antialiased selection:bg-amber-100 overflow-x-hidden">
      
      {/* 1. BESPOKE LEFT NAVIGATION SIDEBAR */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'settings') {
            setIsProfileModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onLogout={onLogout}
        seats={seats}
        students={students}
        shiftRequests={shiftRequests}
        feedbacks={feedbacks}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        
        {/* Top Executive App Bar */}
        <header className="bg-white sticky top-0 z-20 border-b border-slate-200/90 shadow-2xs px-3 sm:px-8 py-3 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Breadcrumb / Title with Mobile Menu Button */}
          <div className="flex items-center space-x-2 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 -ml-1 text-slate-700 hover:text-black hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:inline shrink-0">
              Amba Admin
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 hidden sm:inline shrink-0" />
            <h1 className="font-bold text-sm sm:text-lg text-slate-900 tracking-tight font-heading truncate">
              {getTabTitle()}
            </h1>
          </div>

          {/* Right Controls: Mode Toggle & Profile Action */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Day / Night Shift Mode Toggle (Visible when relevant) */}
            {['dashboard', 'seat_matrix'].includes(activeTab) && (
              <div className="inline-flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => { setMode('day'); setSelectedShiftFilter('all'); }}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    mode === 'day' 
                      ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span className="hidden sm:inline">Day Batches</span>
                  <span className="sm:hidden text-[11px]">Day</span>
                </button>

                <button
                  onClick={() => { setMode('night'); setSelectedShiftFilter('all'); }}
                  className={`flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    mode === 'night' 
                      ? 'bg-slate-900 text-white shadow-2xs' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Night Slot</span>
                  <span className="sm:hidden text-[11px]">Night</span>
                </button>
              </div>
            )}

            {/* Admin Profile Pill */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center space-x-2 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold border border-slate-200/90 transition-all cursor-pointer group shadow-2xs shrink-0"
              title="Admin Profile & Password Settings"
            >
              <div className="w-6 h-6 rounded-lg bg-[#1C1935] text-amber-300 flex items-center justify-center text-[11px] font-bold">
                {adminProfile?.name?.charAt(0) || 'A'}
              </div>
              <span className="hidden md:inline font-medium">
                {adminProfile?.name || 'Administrator'}
              </span>
            </button>

          </div>
        </header>

        {/* View Switcher Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* VIEW 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <AdminDashboardOverview
              seats={seats}
              students={students}
              shiftRequests={shiftRequests}
              feedbacks={feedbacks}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenSeatDetail={(seat) => setActiveSeatModal(seat)}
              onOpenReceipt={(student) => setFeeReceiptModalStudent(student)}
            />
          )}

          {/* VIEW 2: 50 DESKS MATRIX (PRESERVED SENIOR-LEVEL GRID) */}
          {activeTab === 'seat_matrix' && (
            <div className="space-y-4">
              
              {/* Filter and Legend Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
                
                {/* Search input */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search desk number, student, mobile..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400"
                  />
                </div>

                {/* Day Shifts Quick Filter */}
                {mode === 'day' && (
                  <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
                    <span className="text-slate-400 font-medium text-[11px] mr-1 flex items-center">
                      <Filter className="w-3 h-3 mr-1" /> Shift Filter:
                    </span>
                    
                    <button
                      onClick={() => setSelectedShiftFilter('all')}
                      className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors cursor-pointer ${
                        selectedShiftFilter === 'all' 
                          ? 'bg-slate-900 text-white font-semibold shadow-2xs' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      All Shifts
                    </button>

                    {DAY_SHIFTS.map(shift => (
                      <button
                        key={shift.id}
                        onClick={() => setSelectedShiftFilter(shift.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center space-x-1.5 cursor-pointer ${
                          selectedShiftFilter === shift.id 
                            ? 'bg-slate-900 text-white font-semibold shadow-2xs' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {getShiftIcon(shift.id)}
                        <span>{shift.name.replace(' Shift', '')}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Clean Legend */}
                <div className="flex items-center space-x-4 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[11px] font-medium text-slate-600">Available</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-[11px] font-medium text-amber-800">On Hold (Orange)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                    <span className="text-[11px] font-medium text-slate-500">Occupied</span>
                  </div>
                </div>

              </div>

              {/* 50 Desks Executive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-2.5">
                {filteredSeats.map(seat => {
                  const hasVacancy = isSeatHasVacancy(seat, mode);
                  const vacantCount = getVacantShiftsCount(seat, mode);
                  const hasHold = isSeatHasHold(seat, mode);
                  const holdCount = getHoldShiftsCount(seat, mode);
                  const formattedNum = seat.seatNumber < 10 ? `0${seat.seatNumber}` : seat.seatNumber;

                  return (
                    <button
                      key={seat.seatNumber}
                      onClick={() => setActiveSeatModal(seat)}
                      className={`group text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between h-28 relative ${
                        hasHold
                          ? 'bg-amber-50/25 border-amber-300 hover:border-amber-400 hover:shadow-md'
                          : hasVacancy 
                          ? 'bg-white border-slate-200 hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5' 
                          : 'bg-slate-50/80 border-slate-200/70 hover:border-slate-300 opacity-90'
                      }`}
                    >
                      {/* Top Row: Desk Number & Status Badge */}
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono font-bold text-sm text-slate-900 tracking-tight">
                          #{formattedNum}
                        </span>
                        
                        {hasHold ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-amber-800 bg-amber-100 ring-1 ring-amber-500/30 px-1.5 py-0.5 rounded">
                            {holdCount} hold
                          </span>
                        ) : hasVacancy ? (
                          <span className="inline-flex items-center text-[10px] font-medium text-emerald-700 bg-emerald-50 ring-1 ring-emerald-600/20 px-1.5 py-0.5 rounded">
                            {vacantCount} free
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-medium text-slate-500 bg-slate-100 ring-1 ring-slate-300/60 px-1.5 py-0.5 rounded">
                            Full
                          </span>
                        )}
                      </div>

                      {/* Middle: Shift Occupancy Meter */}
                      <div className="w-full my-2">
                        {mode === 'day' ? (
                          <div className="grid grid-cols-4 gap-1">
                            {DAY_SHIFTS.map(s => {
                              const stInfo = getShiftStatus(seat, 'day', s.id);
                              return (
                                <div
                                  key={s.id}
                                  title={`${s.name}: ${stInfo.status === 'HOLD' ? `On Hold for ${stInfo.studentName || 'Student'}` : stInfo.status === 'OCCUPIED' ? 'Allotted / Occupied' : 'Vacant'}`}
                                  className={`h-1.5 rounded-full transition-colors ${
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
                                  title={`Overnight Slot: ${nightSt.status === 'HOLD' ? 'On Hold' : nightSt.status === 'OCCUPIED' ? 'Allotted' : 'Vacant'}`}
                                  className={`h-1.5 rounded-full ${
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

                      {/* Bottom: Action Hint */}
                      <div className="w-full text-[10px] text-slate-400 font-medium group-hover:text-slate-900 transition-colors flex items-center justify-between">
                        <span className="truncate">
                          {hasHold ? 'Under Hold' : hasVacancy ? 'Click to allot' : 'Reserved'}
                        </span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>

                    </button>
                  );
                })}
              </div>

            </div>
          )}

          {/* VIEW 3: STUDENT DIRECTORY */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enrolled Student Database</h3>
                  <p className="text-xs text-slate-500">Master record of active student admissions, seat shifts, and parent contacts</p>
                </div>
                <span className="text-xs font-mono bg-white px-3 py-1 rounded-lg border border-slate-200 font-semibold text-slate-700">
                  Total Registered: {students.length}
                </span>
              </div>

              {students.length === 0 ? (
                <div className="p-16 text-center text-slate-500 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <Users className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">No Students Enrolled Yet</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                      All 50 desks are currently clean &amp; vacant. To admit a student, open <strong>Seat Matrix (50 Desks)</strong>, click any vacant desk, and select the desired shift(s).
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('seat_matrix')}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-all shadow-xs inline-flex items-center space-x-2 cursor-pointer"
                    >
                      <span>Open Seat Matrix (50 Desks)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4">Desk / Slot</th>
                        <th className="py-3 px-4">Admission Date</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Address Details</th>
                        <th className="py-3 px-4">Aadhar Card</th>
                        <th className="py-3 px-4">Parents</th>
                        <th className="py-3 px-4">Credentials</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.map(st => (
                        <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden border border-slate-200">
                                {st.photo ? (
                                  <img src={st.photo} alt={st.name} className="w-full h-full object-cover" />
                                ) : (
                                  st.name?.charAt(0) || 'S'
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 text-xs leading-tight">{st.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{st.id}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200/80">
                                Desk #{st.seatNumber}
                              </span>
                              <span className="text-[10px] font-medium text-slate-500">
                                {st.mode === 'day' ? (st.isFullDay ? 'Full Day' : `${st.shifts?.length || 1} Shift(s)`) : 'Overnight'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-slate-700 font-medium text-[11px]">
                              {st.admissionDate || st.allottedAt || 'Recent'}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <div className="font-mono text-slate-800 font-medium">{st.mobile}</div>
                            <div className="text-slate-400 text-[10px]">{st.email}</div>
                          </td>

                          <td className="py-3 px-4 text-xs">
                            <div className="flex items-start space-x-1.5 max-w-[200px]" title={st.address}>
                              <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                              <span className="text-slate-700 font-medium leading-snug line-clamp-2">
                                {st.address ? st.address : <span className="text-slate-400 italic font-normal">Not provided</span>}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-600">
                            {st.aadhar || 'Verified'}
                          </td>

                          <td className="py-3 px-4 text-[11px]">
                            <div>
                              <span className="text-slate-400 font-normal">F:</span>{' '}
                              <span className={st.fatherName && st.fatherName !== '...' ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}>
                                {st.fatherName && st.fatherName !== '...' ? st.fatherName : 'Not set'}
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-normal">M:</span>{' '}
                              <span className={st.motherName && st.motherName !== '...' && st.motherName !== '....' ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}>
                                {st.motherName && st.motherName !== '...' && st.motherName !== '....' ? st.motherName : 'Not set'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                              {st.password}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => setEditingStudent(st)}
                                className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 rounded-md font-semibold text-xs transition-colors cursor-pointer flex items-center space-x-1 shadow-2xs"
                                title={`Edit ${st.name}'s details & parents`}
                              >
                                <Pencil className="w-3 h-3 text-amber-600" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => setViewStudentModal(st)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-xs transition-colors cursor-pointer"
                              >
                                Pass
                              </button>
                              <button
                                onClick={() => setFeeReceiptModalStudent(st)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-xs transition-colors cursor-pointer flex items-center space-x-1"
                                title="Print Official Fee Receipt"
                              >
                                <Receipt className="w-3 h-3 text-slate-600" />
                                <span>Receipt</span>
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(st)}
                                className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                                title={`Delete ${st.name} completely`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VIEW 5: REQUESTS & INBOX */}
          {activeTab === 'requests' && (
            <AdminRequestsView
              shiftRequests={shiftRequests}
              feedbacks={feedbacks}
              onDataUpdated={reloadData}
            />
          )}

          {/* VIEW 6: BILLING & FEE COLLECTION TERMINAL */}
          {activeTab === 'fees' && (
            <FeeManagementView
              students={students}
              onDataUpdated={reloadData}
              onOpenReceipt={(student) => setFeeReceiptModalStudent(student)}
            />
          )}

          {/* VIEW 7: DUES TRACKER */}
          {activeTab === 'dues' && (
            <AdminDuesTracker
              students={students}
              onOpenReceipt={(student) => setFeeReceiptModalStudent(student)}
              onDataUpdated={reloadData}
            />
          )}

          {/* VIEW 8: REPORTS & ANALYTICS */}
          {activeTab === 'reports' && (
            <AdminReportsView
              seats={seats}
              students={students}
            />
          )}

        </main>
      </div>

      {/* MODAL 1: Desk Allocation & Shift Breakdown Inspector */}
      <SeatDetailModal
        isOpen={!!activeSeatModal}
        onClose={() => setActiveSeatModal(null)}
        seat={activeSeatModal}
        mode={mode}
        students={students}
        onViewStudent={(student) => {
          setViewStudentModal(student);
        }}
        onOpenAllotment={(allotmentData) => {
          setActiveSeatModal(null);
          setAllotmentModalData(allotmentData);
        }}
        onDataChanged={() => {
          reloadData();
          if (activeSeatModal) {
            const updatedSeats = getStoredSeats();
            const fresh = updatedSeats.find(s => s.seatNumber === activeSeatModal.seatNumber);
            setActiveSeatModal(fresh);
          }
        }}
      />

      {/* MODAL 2: Student Allotment & Registration Form */}
      {allotmentModalData && (
        <StudentAllotmentModal
          isOpen={!!allotmentModalData}
          onClose={() => setAllotmentModalData(null)}
          seatNumber={allotmentModalData.seatNumber}
          mode={allotmentModalData.mode}
          selectedShifts={allotmentModalData.shifts}
          onAllotmentComplete={(newStudent) => {
            reloadData();
          }}
        />
      )}

      {/* MODAL 3: View Full Student Pass Slip */}
      {viewStudentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[94vh] overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 overflow-hidden shadow-xs flex items-center justify-center p-0.5 shrink-0">
                  <img src={logoImg} alt="Amba Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight">AMBA LIBRARY</h4>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Official Student Pass & Identity</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setViewStudentModal(null)} 
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-black cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-300 mx-auto flex items-center justify-center text-xl font-bold text-slate-700 mb-2 overflow-hidden shadow-xs">
                {viewStudentModal.photo ? (
                  <img src={viewStudentModal.photo} alt={viewStudentModal.name} className="w-full h-full object-cover" />
                ) : (
                  viewStudentModal.name?.charAt(0) || 'S'
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-900 leading-tight">{viewStudentModal.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{viewStudentModal.id}</p>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Allocated Desk:</span>
                <span className="font-bold font-mono text-slate-900">Desk #{viewStudentModal.seatNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Admission Date:</span>
                <span className="font-mono text-slate-800">{viewStudentModal.admissionDate || viewStudentModal.allottedAt || 'Recent'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Mode:</span>
                <span className="font-semibold uppercase text-slate-800">{viewStudentModal.mode || 'day'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Allocated Shifts:</span>
                <span className="font-semibold text-emerald-700">
                  {viewStudentModal.isFullDay ? 'Full Day (4 Shifts)' : Array.isArray(viewStudentModal.shifts) ? viewStudentModal.shifts.join(', ') : 'Assigned Shift'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Mobile:</span>
                <span className="font-mono font-semibold text-slate-800">{viewStudentModal.mobile || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Email:</span>
                <span className="font-mono text-slate-700">{viewStudentModal.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Aadhar Card:</span>
                <span className="font-mono text-slate-700">{viewStudentModal.aadhar || 'Verified on file'}</span>
              </div>
              <div className="flex justify-between items-start py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 shrink-0">Address:</span>
                <span className="text-slate-800 text-right max-w-[240px] leading-tight font-medium" title={viewStudentModal.address}>
                  {viewStudentModal.address || 'On file'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Parents:</span>
                <span className="text-slate-800">
                  {viewStudentModal.fatherName && viewStudentModal.fatherName !== '...' ? viewStudentModal.fatherName : 'N/A'} / {viewStudentModal.motherName && viewStudentModal.motherName !== '...' && viewStudentModal.motherName !== '....' ? viewStudentModal.motherName : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Portal Password:</span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                  {viewStudentModal.password || 'student123'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = viewStudentModal;
                  setViewStudentModal(null);
                  setEditingStudent(target);
                }}
                className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 py-2 px-3 rounded-xl font-semibold text-xs cursor-pointer transition-colors flex items-center justify-center space-x-1"
                title="Edit student profile"
              >
                <Pencil className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 rounded-xl font-semibold text-xs cursor-pointer transition-colors flex items-center justify-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setViewStudentModal(null)}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Official Fee Receipt Modal */}
      <FeeReceiptModal
        isOpen={!!feeReceiptModalStudent}
        student={feeReceiptModalStudent}
        onClose={() => setFeeReceiptModalStudent(null)}
      />

      {/* MODAL 5: Admin Edit Student Record Modal */}
      <EditStudentModal
        isOpen={!!editingStudent}
        student={editingStudent}
        onClose={() => setEditingStudent(null)}
        onStudentUpdated={(updated) => {
          reloadData();
          if (viewStudentModal && viewStudentModal.id === updated.id) {
            setViewStudentModal(updated);
          }
        }}
      />

      {/* MODAL 6: Admin Profile & Password Settings Modal */}
      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(updated) => {
          setAdminProfile(updated);
          saveStoredSession(
            {
              role: 'admin',
              name: updated.name,
              id: updated.id,
              email: updated.email,
              phone: updated.phone
            },
            'admin_console'
          );
        }}
      />

    </div>
  );
}
