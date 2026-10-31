import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Receipt, 
  Users, 
  Printer, 
  Download, 
  Calendar,
  CheckCircle2, 
  CreditCard,
  Search,
  Filter,
  DollarSign,
  FileSpreadsheet,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  ArrowUpDown,
  FileText,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check
} from 'lucide-react';
import { DAY_SHIFTS } from '../../data/libraryStore';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEAR_OPTIONS = [2023, 2024, 2025, 2026, 2027, 2028];

export default function AdminReportsView({
  seats = [],
  students = [],
  onOpenReceipt
}) {
  const [reportType, setReportType] = useState('all'); // 'all' | 'admissions' | 'earnings'
  const [shiftFilter, setShiftFilter] = useState('all'); // 'all' | 'shift1' | 'shift2' | 'shift3' | 'shift4'
  const [paymentModeFilter, setPaymentModeFilter] = useState('all'); // 'all' | 'Cash' | 'UPI'
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar & Date selection states (Date, Month, Year)
  const today = new Date();
  const currentDayNum = today.getDate();
  const currentMonthNum = today.getMonth(); // 0-11
  const currentYearNum = today.getFullYear();

  const [selectedYear, setSelectedYear] = useState('all'); // 'all' | number (e.g. 2026)
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' | 0-11
  const [selectedDate, setSelectedDate] = useState('all'); // 'all' | 1-31

  // Calendar interactive grid view states
  const [viewYear, setViewYear] = useState(currentYearNum);
  const [viewMonth, setViewMonth] = useState(currentMonthNum);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef(null);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Initial state: No records shown until admin selects filters and clicks "View Report"
  const [hasViewedReport, setHasViewedReport] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper to parse date safely without timezone skew
  const parseRecordDate = (dateStr) => {
    if (!dateStr) return null;
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length >= 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const d = parseInt(parts[2], 10);
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          return { year: y, month: m, day: d };
        }
      }
    }
    const dObj = new Date(dateStr);
    if (isNaN(dObj.getTime())) return null;
    return { year: dObj.getFullYear(), month: dObj.getMonth(), day: dObj.getDate() };
  };

  // Filter students based on selection
  const filteredStudents = students.filter(student => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const fee = student.feeDetails || {};
      const matchName = student.name?.toLowerCase().includes(q);
      const matchId = student.id?.toLowerCase().includes(q);
      const matchMobile = student.mobile?.includes(q);
      const matchSeat = student.seatNumber?.toString().includes(q);
      const matchReceipt = fee.receiptNumber?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchMobile && !matchSeat && !matchReceipt) {
        return false;
      }
    }

    // Shift filter
    if (shiftFilter !== 'all') {
      if (student.mode === 'night' && shiftFilter !== 'shift4') return false;
      if (student.mode === 'day') {
        const hasShift = student.shifts?.includes(shiftFilter) || student.isFullDay;
        if (!hasShift) return false;
      }
    }

    // Payment mode filter
    if (paymentModeFilter !== 'all') {
      const method = student.feeDetails?.paymentMethod || 'Cash';
      if (!method.toLowerCase().includes(paymentModeFilter.toLowerCase())) {
        return false;
      }
    }

    // Calendar Date, Month, Year Filter
    if (selectedYear !== 'all' || selectedMonth !== 'all' || selectedDate !== 'all') {
      let dateStr = null;
      if (reportType === 'admissions') {
        dateStr = student.admissionDate || student.allottedAt;
      } else if (reportType === 'earnings') {
        dateStr = student.feeDetails?.lastPaymentDate || student.feeDetails?.paymentDate || student.admissionDate;
      } else {
        dateStr = student.admissionDate || student.allottedAt || student.feeDetails?.lastPaymentDate;
      }

      const parsed = parseRecordDate(dateStr);
      if (!parsed) return false;

      if (selectedYear !== 'all' && parsed.year !== selectedYear) return false;
      if (selectedMonth !== 'all' && parsed.month !== selectedMonth) return false;
      if (selectedDate !== 'all' && parsed.day !== selectedDate) return false;
    }

    return true;
  });

  // Calculate dynamic stats from filtered data
  const totalFilteredRevenue = filteredStudents.reduce((acc, s) => {
    return acc + (Number(s.feeDetails?.paidAmount) || Number(s.feeDetails?.amount) || 0);
  }, 0);

  const totalFilteredDues = filteredStudents.reduce((acc, s) => {
    return acc + (Number(s.feeDetails?.dueAmount) || 0);
  }, 0);

  const totalFilteredAdmissions = filteredStudents.length;

  const upiCollected = filteredStudents
    .filter(s => (s.feeDetails?.paymentMethod || '').toLowerCase().includes('upi'))
    .reduce((acc, s) => acc + (Number(s.feeDetails?.paidAmount) || Number(s.feeDetails?.amount) || 0), 0);

  const cashCollected = filteredStudents
    .filter(s => !(s.feeDetails?.paymentMethod || '').toLowerCase().includes('upi'))
    .reduce((acc, s) => acc + (Number(s.feeDetails?.paidAmount) || Number(s.feeDetails?.amount) || 0), 0);

  // Shift breakdown counts
  const morningCount = seats.filter(s => s.day?.shift1).length;
  const afternoonCount = seats.filter(s => s.day?.shift2).length;
  const eveningCount = seats.filter(s => s.day?.shift3).length;
  const nightCount = seats.filter(s => s.night?.night_full).length;

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setHasViewedReport(true);
      setIsGenerating(false);
    }, 150);
  };

  const handleReset = () => {
    setReportType('all');
    setSelectedYear('all');
    setSelectedMonth('all');
    setSelectedDate('all');
    setShiftFilter('all');
    setPaymentModeFilter('all');
    setSearchQuery('');
    setHasViewedReport(false);
  };

  // Calendar navigation & day computation
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 is Sunday

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const handleClearDateFilter = () => {
    setSelectedYear('all');
    setSelectedMonth('all');
    setSelectedDate('all');
  };

  const isDateFilterActive = selectedYear !== 'all' || selectedMonth !== 'all' || selectedDate !== 'all';

  const getDateFilterLabel = () => {
    if (selectedDate !== 'all' && selectedMonth !== 'all' && selectedYear !== 'all') {
      return `${selectedDate} ${MONTH_NAMES[selectedMonth].slice(0, 3)} ${selectedYear}`;
    }
    if (selectedMonth !== 'all' && selectedYear !== 'all') {
      return `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
    }
    if (selectedYear !== 'all') {
      return `Year ${selectedYear}`;
    }
    return 'Select Date / Calendar';
  };

  // Export to Excel / CSV format
  const handleExportCSV = () => {
    if (!hasViewedReport) {
      alert("Please click 'View Report' first to generate records.");
      return;
    }

    if (filteredStudents.length === 0) {
      alert('No data available to export under current filters.');
      return;
    }

    const headers = [
      'Receipt No',
      'Student ID',
      'Student Name',
      'Desk Number',
      'Shift Plan',
      'Day / Night Mode',
      'Mobile Number',
      'Father Name',
      'Mother Name',
      'Admission Date',
      'Payment Date',
      'Payment Method',
      'Total Plan Fee (INR)',
      'Paid Amount (INR)',
      'Due Balance (INR)',
      'Fee Status'
    ];

    const rows = filteredStudents.map(st => {
      const fee = st.feeDetails || {};
      const shiftText = st.isFullDay 
        ? 'Full Day (24x7)' 
        : (Array.isArray(st.shifts) ? st.shifts.join(' + ') : 'Assigned Shift');

      return [
        `"${fee.receiptNumber || 'RCP-' + st.id}"`,
        `"${st.id}"`,
        `"${st.name}"`,
        `"${st.seatNumber}"`,
        `"${shiftText}"`,
        `"${st.mode || 'day'}"`,
        `"${st.mobile || ''}"`,
        `"${st.fatherName || ''}"`,
        `"${st.motherName || ''}"`,
        `"${st.admissionDate || st.allottedAt || ''}"`,
        `"${fee.lastPaymentDate || fee.paymentDate || fee.paidAt || st.admissionDate || ''}"`,
        `"${fee.paymentMethod || 'Cash'}"`,
        Number(fee.amount || st.monthlyFee || (st.shifts?.length ? st.shifts.length * 600 : 600)),
        Number(fee.paidAmount) || Number(fee.amount || st.monthlyFee || (st.shifts?.length ? st.shifts.length * 600 : 600)),
        Number(fee.dueAmount) || 0,
        `"${fee.status || 'Active'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Amba_Library_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header with Export Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-bold text-slate-900 font-heading">
              Reports &amp; Analytics Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Admissions tracking, monthly revenue reports, and one-click Excel download
          </p>
        </div>

        {/* Action Buttons: Excel Export & Print */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={!hasViewedReport || filteredStudents.length === 0}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-xs ${
              hasViewedReport && filteredStudents.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-sm hover:shadow'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            }`}
            title={hasViewedReport ? "Download CSV spreadsheet compatible with Microsoft Excel" : "Click 'View Report' first to enable download"}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel (CSV)</span>
          </button>

          <button
            onClick={() => window.print()}
            disabled={!hasViewedReport}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
              hasViewedReport 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200 cursor-pointer'
                : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* 2. Comprehensive Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
        
        {/* Top Row: Report Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => { setReportType('all'); }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                reportType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Reports ({students.length})
            </button>

            <button
              onClick={() => { setReportType('admissions'); }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                reportType === 'admissions' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-500" />
              <span>Admissions Report</span>
            </button>

            <button
              onClick={() => { setReportType('earnings'); }}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 ${
                reportType === 'earnings' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-emerald-500" />
              <span>Monthly Earnings</span>
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            {hasViewedReport 
              ? `Filtered: ${filteredStudents.length} of ${students.length} Records` 
              : 'Choose filters and click "View Report"'}
          </span>
        </div>

        {/* Second Row: Detailed Multi-Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search name, mobile, desk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Smart Interactive Calendar Filter (Date, Month, Year) */}
          <div className="relative" ref={calendarRef}>
            <button
              type="button"
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                isDateFilterActive 
                  ? 'bg-amber-50/90 border-amber-300 text-amber-950 font-semibold' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center space-x-1.5 truncate">
                <Calendar className={`w-3.5 h-3.5 shrink-0 ${isDateFilterActive ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="truncate">{getDateFilterLabel()}</span>
              </div>
              
              <div className="flex items-center space-x-1 shrink-0 ml-1">
                {isDateFilterActive && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearDateFilter();
                    }}
                    className="p-0.5 hover:bg-amber-200/60 rounded text-amber-700 cursor-pointer"
                    title="Clear date filter"
                  >
                    <X className="w-3 h-3" />
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Calendar Popover */}
            {isCalendarOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 z-50 w-[300px] sm:w-[325px] max-w-[calc(100vw-32px)] bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-3.5 text-xs animate-in fade-in zoom-in-95 duration-150">
                {/* Popover Header */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-slate-900 text-xs">Calendar &amp; Date Filter</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 1. Year and Month Dropdowns */}
                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  {/* Month Selector */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Month
                    </label>
                    <select
                      value={viewMonth}
                      onChange={(e) => {
                        const m = parseInt(e.target.value, 10);
                        setViewMonth(m);
                        setSelectedMonth(m);
                        if (selectedYear === 'all') {
                          setSelectedYear(viewYear);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      {MONTH_NAMES.map((name, idx) => (
                        <option key={idx} value={idx}>{name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year Selector */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Year
                    </label>
                    <select
                      value={viewYear}
                      onChange={(e) => {
                        const y = parseInt(e.target.value, 10);
                        setViewYear(y);
                        setSelectedYear(y);
                        if (selectedMonth === 'all') {
                          setSelectedMonth(viewMonth);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Specific Date (Day) Dropdown */}
                <div className="mb-2.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Select Day / Date
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'all') {
                        setSelectedDate('all');
                      } else {
                        const dayNum = parseInt(val, 10);
                        setSelectedDate(dayNum);
                        setSelectedMonth(viewMonth);
                        setSelectedYear(viewYear);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
                  >
                    <option value="all">Whole Month (All Days of {MONTH_NAMES[viewMonth].slice(0, 3)})</option>
                    {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>
                        Date {d} ({d} {MONTH_NAMES[viewMonth].slice(0, 3)} {viewYear})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Interactive Visual Calendar Grid */}
                <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 mb-2.5">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <button
                      type="button"
                      onClick={handlePrevMonth}
                      className="p-1 hover:bg-white rounded-md text-slate-600 transition-colors cursor-pointer"
                      title="Previous Month"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-slate-800 text-xs">
                      {MONTH_NAMES[viewMonth]} {viewYear}
                    </span>
                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="p-1 hover:bg-white rounded-md text-slate-600 transition-colors cursor-pointer"
                      title="Next Month"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Weekday Labels */}
                  <div className="grid grid-cols-7 gap-1 text-center mb-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
                      <div key={idx} className="text-[10px] font-bold text-slate-400 py-0.5">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty padding slots */}
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-6" />
                    ))}

                    {/* Days in Month */}
                    {Array.from({ length: daysInCurrentMonth }, (_, i) => {
                      const dayNum = i + 1;
                      const isSelected = selectedDate === dayNum && selectedMonth === viewMonth && selectedYear === viewYear;
                      const isToday = today.getDate() === dayNum && today.getMonth() === viewMonth && today.getFullYear() === viewYear;

                      return (
                        <button
                          key={dayNum}
                          type="button"
                          onClick={() => {
                            setSelectedDate(dayNum);
                            setSelectedMonth(viewMonth);
                            setSelectedYear(viewYear);
                          }}
                          className={`h-6 rounded-md text-xs font-medium flex items-center justify-center transition-all cursor-pointer relative ${
                            isSelected
                              ? 'bg-[#1C1935] text-amber-400 shadow-2xs font-bold'
                              : isToday
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                              : 'hover:bg-slate-200/80 text-slate-700'
                          }`}
                        >
                          {dayNum}
                          {isToday && !isSelected && (
                            <span className="absolute bottom-0.5 w-1 h-1 bg-amber-600 rounded-full" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Quick Action Presets */}
                <div className="flex flex-wrap items-center justify-between gap-1 pt-2 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => {
                        const t = new Date();
                        setViewYear(t.getFullYear());
                        setViewMonth(t.getMonth());
                        setSelectedYear(t.getFullYear());
                        setSelectedMonth(t.getMonth());
                        setSelectedDate(t.getDate());
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                    >
                      Today
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedYear(viewYear);
                        setSelectedMonth(viewMonth);
                        setSelectedDate('all');
                      }}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                    >
                      Full Month
                    </button>

                    <button
                      type="button"
                      onClick={handleClearDateFilter}
                      className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-medium cursor-pointer"
                    >
                      All Time
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCalendarOpen(false)}
                    className="px-2.5 py-1 bg-[#1C1935] hover:bg-[#2b2752] text-white rounded-lg font-bold text-[11px] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Shift Selector */}
          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Shift: All Batches</option>
              <option value="shift1">Morning (6 AM – 12 PM)</option>
              <option value="shift2">Afternoon (12 PM – 6 PM)</option>
              <option value="shift3">Evening (6 PM – 10 PM)</option>
              <option value="shift4">Night Batch (10 PM – 6 AM)</option>
            </select>
          </div>

          {/* Payment Mode Selector */}
          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Payment: All Modes</option>
              <option value="UPI">UPI / QR (GPay/PhonePe)</option>
              <option value="Cash">Cash Payments</option>
            </select>
          </div>

        </div>

        {/* Third Row: Execute View Report & Reset Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-[#1C1935] hover:bg-[#2b2752] active:bg-black text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{isGenerating ? 'Generating Statement...' : 'View Report'}</span>
            </button>

            {hasViewedReport && (
              <button
                onClick={handleReset}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          <div className="text-xs font-medium">
            {hasViewedReport ? (
              <span className="text-emerald-700 font-semibold font-mono flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Report Generated: {filteredStudents.length} Records</span>
              </span>
            ) : (
              <span className="text-slate-400 italic">Select filters and click "View Report" to load</span>
            )}
          </div>
        </div>

      </div>

      {/* 3. Conditional Render: Empty Initial State vs Generated Report */}
      {!hasViewedReport ? (
        <div className="bg-white p-14 sm:p-20 rounded-2xl border border-slate-200/90 shadow-2xs text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-8 h-8 text-slate-500" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-slate-900">Select Filters &amp; Click "View Report"</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              No records are displayed initially. Select your desired criteria above (Report Type, Calendar Date/Month/Year, Shift, Payment Mode) and click <strong>"View Report"</strong> to generate the statement.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={handleGenerateReport}
              className="px-6 py-2.5 bg-[#1C1935] hover:bg-[#2b2752] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer inline-flex items-center space-x-2"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>View Report Now</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* 3A. Filtered KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1: Total Filtered Admissions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Admissions Count</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                {totalFilteredAdmissions}
              </div>
              <p className="text-[11px] text-slate-400">Matching active criteria</p>
            </div>

            {/* Metric 2: Total Filtered Earnings */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Collections</span>
                <Receipt className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-700">
                ₹{totalFilteredRevenue.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400">Fees realized</p>
            </div>

            {/* Metric 3: Pending Dues */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pending Dues</span>
                <DollarSign className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-rose-600">
                ₹{totalFilteredDues.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-400">Unsettled balances</p>
            </div>

            {/* Metric 4: Cash vs UPI Breakdown */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Payment Breakdown</span>
                <CreditCard className="w-4 h-4 text-slate-400" />
              </div>
              <div className="text-xs font-mono space-y-1 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">UPI / QR:</span>
                  <span className="font-bold text-slate-800">₹{upiCollected.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cash:</span>
                  <span className="font-bold text-slate-800">₹{cashCollected.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

          </div>

          {/* 3B. Filtered Data Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {reportType === 'admissions' 
                    ? 'Student Admissions Ledger' 
                    : reportType === 'earnings' 
                      ? 'Monthly Revenue & Collections Ledger' 
                      : 'Master Admissions & Financial Statement'}
                </h3>
                <p className="text-xs text-slate-500">
                  Sorted by latest entry • Ready for export and audit
                </p>
              </div>

              <span className="text-xs font-mono text-slate-500 font-semibold bg-white px-3 py-1 rounded-lg border border-slate-200">
                {filteredStudents.length} Records
              </span>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-16 text-center space-y-2 text-slate-500">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-slate-800 text-sm">No Records Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No admission or payment records match your current filter settings. Try adjusting the search or month filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Student &amp; ID</th>
                      <th className="py-3 px-4">Desk / Slot</th>
                      <th className="py-3 px-4">Admission Date</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4 text-right">Fee Plan</th>
                      <th className="py-3 px-4 text-right">Paid Amount</th>
                      <th className="py-3 px-4 text-right">Due Balance</th>
                      <th className="py-3 px-4 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map(st => {
                      const fee = st.feeDetails || {};
                      const isDue = (Number(fee.dueAmount) || 0) > 0;
                      const shiftDisplay = st.isFullDay 
                        ? 'Full Day' 
                        : (Array.isArray(st.shifts) ? st.shifts.join(', ') : '1 Shift');

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                          
                          {/* Student Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {st.name?.charAt(0) || 'S'}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 text-xs leading-tight">{st.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{st.id} • {st.mobile || 'No Mobile'}</div>
                              </div>
                            </div>
                          </td>

                          {/* Desk & Shift */}
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-1.5">
                              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200/80">
                                Desk #{st.seatNumber}
                              </span>
                              <span className="text-[10px] font-medium text-slate-500 truncate max-w-[100px]">
                                {shiftDisplay}
                              </span>
                            </div>
                          </td>

                          {/* Admission Date */}
                          <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                            {st.admissionDate || st.allottedAt || 'Recent'}
                          </td>

                          {/* Payment Method */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
                              <CreditCard className="w-3 h-3 text-slate-400" />
                              <span>{fee.paymentMethod || 'Cash'}</span>
                            </span>
                          </td>

                          {/* Plan Fee */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                            ₹{(Number(fee.amount || item.student?.monthlyFee || (item.student?.shifts?.length ? item.student.shifts.length * 600 : 600))).toLocaleString('en-IN')}
                          </td>

                          {/* Amount Paid */}
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                            ₹{(Number(fee.paidAmount) || Number(fee.amount) || 0).toLocaleString('en-IN')}
                          </td>

                          {/* Due Balance */}
                          <td className="py-3 px-4 text-right font-mono font-bold">
                            {isDue ? (
                              <span className="text-rose-600">₹{(Number(fee.dueAmount)).toLocaleString('en-IN')}</span>
                            ) : (
                              <span className="text-slate-400">₹0</span>
                            )}
                          </td>

                          {/* Action */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => onOpenReceipt && onOpenReceipt(st)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium text-xs transition-colors cursor-pointer inline-flex items-center space-x-1"
                              title="View Official Fee Receipt"
                            >
                              <Receipt className="w-3 h-3 text-slate-600" />
                              <span>Receipt</span>
                            </button>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

          {/* 3C. Shift Demand & Utilization Curves */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Shift Demand &amp; Utilization Comparison
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Morning Shift (6 AM – 12 PM)</span>
                  <span className="font-mono">{morningCount} / 50 Desks ({Math.round((morningCount / 50) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(morningCount / 50) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Afternoon Shift (12 PM – 6 PM)</span>
                  <span className="font-mono">{afternoonCount} / 50 Desks ({Math.round((afternoonCount / 50) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-amber-600 h-full rounded-full" style={{ width: `${(afternoonCount / 50) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Evening Shift (6 PM – 10 PM)</span>
                  <span className="font-mono">{eveningCount} / 50 Desks ({Math.round((eveningCount / 50) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${(eveningCount / 50) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Night Batch (10 PM – 6 AM)</span>
                  <span className="font-mono">{nightCount} / 50 Desks ({Math.round((nightCount / 50) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(nightCount / 50) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
