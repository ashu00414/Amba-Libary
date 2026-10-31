import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { authenticateAdmin } from '../data/libraryStore';
import logoImg from '../assets/amba_official_logo.png';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!adminUser || !adminPass) {
      setError('Please enter Admin Email / Staff ID and Password.');
      return;
    }

    const adminObj = authenticateAdmin(adminUser, adminPass);
    if (adminObj) {
      setSuccessMsg('Credentials verified. Opening Admin Console...');
      setTimeout(() => {
        onLoginSuccess(adminObj);
        onClose();
      }, 400);
    } else {
      setError('Invalid Admin Credentials. Please check your email and password.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-200">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/90 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-[#0B0F19] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-white p-0.5 border border-slate-700 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
              <img src={logoImg} alt="Amba Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight tracking-tight">Admin Console Login</h3>
              <p className="text-xs text-slate-400 mt-0.5">Authorized Library Staff Only</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feedback message */}
        <div className="px-6 pt-3">
          {error && (
            <div className="flex items-center space-x-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center space-x-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Admin Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-3.5 text-xs">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Email / Staff ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="admin@amba-library.edu"
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 transition-all font-mono"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
            <span>Staff Administration</span>
            <span className="text-slate-400 font-mono text-[10px]">ID: admin • Pass: admin2026</span>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer mt-2"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Sign In to Admin Console</span>
          </button>
        </form>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 text-center text-[10px] text-slate-400 font-mono">
          AMBA CENTRAL LIBRARY • ADMINISTRATIVE PANEL
        </div>
      </div>
    </div>
  );
}
