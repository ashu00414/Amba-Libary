import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, User, Mail, Phone, Lock, Eye, EyeOff, 
  KeyRound, CheckCircle2, AlertCircle, Save, BadgeCheck 
} from 'lucide-react';
import { getStoredAdminProfile, updateAdminProfile } from '../data/libraryStore';

export default function AdminProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const [currentProfile, setCurrentProfile] = useState(() => getStoredAdminProfile());

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Status feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const p = getStoredAdminProfile();
      setCurrentProfile(p);
      setName(p.name || '');
      setEmail(p.email || '');
      setPhone(p.phone || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccess('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Admin name cannot be empty.');
      return;
    }

    if (!email.trim()) {
      setError('Admin email / username cannot be empty.');
      return;
    }

    const wantsPasswordChange = currentPassword || newPassword || confirmPassword;

    if (wantsPasswordChange) {
      if (!currentPassword) {
        setError('Please enter your Current Password to verify identity.');
        return;
      }

      if (currentPassword !== currentProfile.password) {
        setError('Current Password is incorrect. Please verify and try again.');
        return;
      }

      if (!newPassword || newPassword.length < 4) {
        setError('New Password must be at least 4 characters long.');
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('New Password and Confirm Password do not match.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const updates = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim()
      };

      if (wantsPasswordChange && newPassword) {
        updates.password = newPassword.trim();
      }

      const updated = updateAdminProfile(updates);
      setCurrentProfile(updated);
      if (onProfileUpdated) {
        onProfileUpdated(updated);
      }

      setSuccess('Admin credentials updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 900);
    } catch (err) {
      setError('Failed to update profile: ' + (err.message || 'Unknown error'));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/90 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B0F19] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Administrator Account & Credentials</h3>
              <p className="text-xs text-slate-400 mt-0.5">Manage identity, email and system password</p>
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

        {/* Feedback messages */}
        <div className="px-6 pt-3">
          {error && (
            <div className="flex items-center space-x-2 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center space-x-2 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4 max-h-[72vh] overflow-y-auto text-xs">
          
          {/* Identity Card */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block">Staff Role</span>
              <span className="text-xs font-bold text-slate-900">{currentProfile.role || 'Chief Librarian'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[11px] font-mono font-semibold rounded border border-slate-300">
                {currentProfile.id || 'ADM-001'}
              </span>
            </div>
          </div>

          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
              <span>Personal Profile</span>
            </h4>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Display Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Chief Librarian"
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@amba-library.edu"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Contact Mobile
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Security & Password Change */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>Change Password</span>
              </h4>
              <span className="text-[10px] text-slate-400">Leave blank to keep current</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full pl-9 pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 4 characters"
                    className="w-full pl-9 pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full pl-9 pr-9 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5 text-amber-400" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

        </form>

        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between font-mono">
          <span>AMBA SECURITY</span>
          <span>ENCRYPTED STORE</span>
        </div>
      </div>
    </div>
  );
}
