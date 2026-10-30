import React from 'react';
import { Shield, User, BookOpen, Clock, ArrowRight, LogOut, LayoutGrid } from 'lucide-react';

export default function RoleBanner({ currentUser, onLogout, onOpenCatalog }) {
  if (!currentUser) return null;

  return (
    <div className="w-full bg-[#0B0F19] text-white py-2.5 px-4 sm:px-8 border-b border-slate-800 transition-all animate-in slide-in-from-top duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Role Info */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center font-bold text-xs shadow-xs">
            {currentUser.role === 'admin' ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-xs tracking-tight text-white">{currentUser.name}</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.2 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                {currentUser.role === 'admin' ? 'Administrator' : 'Student Member'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentUser.role === 'admin'
                ? 'Active Session • Operations & Seating Console'
                : `Assigned Desk #${currentUser.seatNumber || '01'} • ${currentUser.mobile || 'Registered'}`}
            </p>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center space-x-2 text-xs">
          <button 
            onClick={onOpenCatalog}
            className="bg-slate-100 hover:bg-white text-slate-900 font-semibold px-3 py-1.5 rounded-lg transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer text-xs"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{currentUser.role === 'admin' ? 'Open Admin Console' : 'Open Student Portal'}</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </button>

          <button 
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
