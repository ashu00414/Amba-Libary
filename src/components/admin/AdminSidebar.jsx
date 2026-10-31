import React from 'react';
import { 
  LayoutDashboard, 
  LayoutGrid, 
  Users, 
  Inbox, 
  Receipt, 
  AlertCircle, 
  BarChart3, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  X
} from 'lucide-react';
import logoImg from '../../assets/logo.png';

export default function AdminSidebar({ 
  activeTab, 
  setActiveTab, 
  onLogout,
  seats = [],
  students = [],
  shiftRequests = [],
  feedbacks = [],
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen
}) {
  // Calculate dynamic notifications
  const overdueCount = students.filter(s => {
    const fee = s.feeDetails;
    if (!fee) return false;
    return (fee.status === 'OVERDUE' || fee.status === 'DUE') || (fee.dueAmount && fee.dueAmount > 0);
  }).length;

  const pendingRequestsCount = shiftRequests.filter(r => r.status === 'Pending' || r.status === 'Hold').length + feedbacks.length;

  const totalSeats = 50;
  const occupiedSeatsCount = seats.filter(s => {
    const hasAnyDay = s.day && Object.values(s.day).some(Boolean);
    const hasAnyNight = s.night && Object.values(s.night).some(Boolean);
    return hasAnyDay || hasAnyNight;
  }).length;
  const occupancyPercentage = Math.round((occupiedSeatsCount / totalSeats) * 100) || 0;

  // Clean, non-redundant navigation
  const navGroups = [
    {
      group: 'OPERATIONS',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'seat_matrix', label: 'Seat Matrix (50 Desks)', icon: LayoutGrid }
      ]
    },
    {
      group: 'STUDENTS & PETITIONS',
      items: [
        { id: 'students', label: 'Student Records', icon: Users, count: students.length },
        { id: 'requests', label: 'Requests & Messages', icon: Inbox, countBadge: pendingRequestsCount, badgeColor: 'bg-amber-500' }
      ]
    },
    {
      group: 'ACCOUNTS & BILLING',
      items: [
        { id: 'fees', label: 'Fee Collection', icon: Receipt },
        { id: 'dues', label: 'Dues Tracker', icon: AlertCircle, countBadge: overdueCount, badgeColor: 'bg-rose-500' },
        { id: 'reports', label: 'Reports', icon: BarChart3 }
      ]
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Admin Settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={`bg-[#0B0F19] text-white flex flex-col justify-between border-r border-slate-800/80 transition-all duration-300 select-none
          fixed md:static inset-y-0 left-0 z-50
          ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
          w-72 md:w-auto
        `}
      >
        {/* Top Header / Branding */}
        <div>
          <div className="h-20 px-4 flex items-center justify-between border-b border-slate-800/80 bg-[#090D15]/80 backdrop-blur-md">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-white p-0.5 border border-slate-700 shadow-sm flex items-center justify-center shrink-0 overflow-hidden">
                <img src={logoImg} alt="Amba Logo" className="w-full h-full object-contain" />
              </div>
              {(!isCollapsed || isMobileOpen) && (
                <div className="overflow-hidden">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-black text-sm tracking-tight text-white font-heading truncate">
                      AMBA LIBRARY
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase flex items-center space-x-1">
                    <Shield className="w-2.5 h-2.5 text-amber-400" />
                    <span>Admin Console</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className="md:hidden w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title="Close Navigation"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Desktop Toggle Sidebar Width */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0"
              title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

        {/* Navigation Groups */}
        <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-220px)] scrollbar-none">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  {group.group}
                </div>
              )}

              {group.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (setIsMobileOpen) setIsMobileOpen(false);
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <div className={`shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      
                      {!isCollapsed && (
                        <span className="truncate tracking-tight">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {item.count !== undefined && (
                          <span className="text-[10px] font-mono text-slate-500 font-semibold">
                            {item.count}
                          </span>
                        )}
                        {item.countBadge > 0 && (
                          <span className={`text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full font-mono ${item.badgeColor || 'bg-blue-600'}`}>
                            {item.countBadge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Collapsed dot indicators */}
                    {isCollapsed && item.countBadge > 0 && (
                      <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${item.badgeColor || 'bg-amber-500'} ring-2 ring-[#0B0F19]`} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Occupancy Meter & Sign Out */}
      <div className="p-3 border-t border-slate-800/80 bg-[#090D15]/80 space-y-3">
        {!isCollapsed && (
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hall Occupancy</span>
              </span>
              <span className="font-mono font-bold text-slate-200">
                {occupiedSeatsCount}/{totalSeats}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500" 
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <span>{occupancyPercentage}% Active</span>
              <span className="text-emerald-400 font-semibold">{totalSeats - occupiedSeatsCount} Desks Free</span>
            </div>
          </div>
        )}

        <button
          onClick={onLogout}
          title="Sign Out of Session"
          className={`w-full flex items-center px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-red-300 hover:bg-red-950/30 border border-slate-800 hover:border-red-800/50 transition-all cursor-pointer ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <LogOut className="w-4 h-4 text-slate-400 hover:text-red-400 shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] text-slate-600 font-mono">ADM</span>
          )}
        </button>
      </div>
    </aside>
    </>
  );
}
