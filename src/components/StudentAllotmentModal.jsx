import React, { useState } from 'react';
import { 
  X, User, Phone, Mail, FileText, Lock, Users, Camera, 
  Check, AlertCircle, CheckCircle2, Calendar, DollarSign, 
  CreditCard, Sunrise, Sun, Sunset, Moon, Clock
} from 'lucide-react';
import { DAY_SHIFTS, NIGHT_SHIFTS, allotStudentToSeat, calculateValidTill } from '../data/libraryStore';

export default function StudentAllotmentModal({
  isOpen,
  onClose,
  seatNumber,
  mode,
  selectedShifts,
  onAllotmentComplete
}) {
  const isFullDay = mode === 'day' && selectedShifts.length === 4;
  const defaultFee = isFullDay ? 1800 : Math.max(600, selectedShifts.length * 600);

  const [photoPreview, setPhotoPreview] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [admissionDate, setAdmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [password, setPassword] = useState('student123');

  // Fee & Subscription state
  const [monthlyFee, setMonthlyFee] = useState(defaultFee);
  const [planMonths, setPlanMonths] = useState(1);
  const [paymentMode, setPaymentMode] = useState('UPI / QR');
  const [feeStatus, setFeeStatus] = useState('Paid');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const currentShiftList = mode === 'day' ? DAY_SHIFTS : NIGHT_SHIFTS;
  const calculatedValidTill = calculateValidTill(admissionDate, planMonths);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please enter student full name');
    if (!mobile.trim() || mobile.length < 10) return setError('Please enter a valid 10-digit mobile number');
    if (!email.trim() || !email.includes('@')) return setError('Please enter a valid email address');
    if (!aadhar.trim() || aadhar.length < 12) return setError('Please enter a valid 12-digit Aadhar Card number');
    if (!admissionDate) return setError('Please select an admission date');
    if (!fatherName.trim()) return setError("Please enter Father's name");
    if (!motherName.trim()) return setError("Please enter Mother's name");
    if (!password.trim()) return setError('Please provide a student login password');

    setIsSubmitting(true);

    try {
      const { student } = allotStudentToSeat({
        studentData: {
          name,
          email,
          mobile,
          aadhar,
          admissionDate,
          fatherName,
          motherName,
          password,
          photo: photoPreview || '',
          monthlyFee: Number(monthlyFee) || defaultFee,
          planMonths: Number(planMonths),
          paymentMode,
          feeStatus,
          validFrom: admissionDate,
          validTill: calculatedValidTill
        },
        seatNumber,
        mode,
        shiftIds: selectedShifts
      });

      setSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSuccess(false);
        onAllotmentComplete(student);
        onClose();
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to complete allotment');
      setIsSubmitting(false);
    }
  };

  const formattedDesk = seatNumber < 10 ? `0${seatNumber}` : seatNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/90 my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Executive Header */}
        <div className="bg-[#0B0F19] px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-amber-400 border border-slate-700 flex items-center justify-center font-mono font-bold text-base shadow-xs">
              #{formattedDesk}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Student Admission & Desk Allotment</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Desk #{seatNumber} • {mode === 'day' ? (isFullDay ? 'Full Day Membership' : `${selectedShifts.length} Shift(s)`) : 'Overnight Slot'}
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

        {/* Selected Shifts Banner */}
        <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-700">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-500">Allocated Shifts:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedShifts.map(sId => {
                const sObj = currentShiftList.find(s => s.id === sId);
                return (
                  <span key={sId} className="bg-white border border-slate-200/90 font-mono font-medium px-2 py-0.5 rounded text-[11px] text-slate-800 shadow-2xs">
                    {sObj?.name} ({sObj?.shortTime})
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[72vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Admission confirmed! Desk #{seatNumber} successfully registered.</span>
            </div>
          )}

          {/* Photo & Basic Details Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Student Photo */}
            <div className="md:col-span-4 flex flex-col items-center text-center p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-slate-200 shadow-2xs mb-2 bg-white flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-slate-300" />
                )}
              </div>
              <label className="cursor-pointer bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium py-1 px-2.5 rounded-lg transition-all shadow-2xs flex items-center space-x-1">
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <span>Upload Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
              <span className="text-[10px] text-slate-400 mt-1">Optional passport photo</span>
            </div>

            {/* Name, Mobile, Email */}
            <div className="md:col-span-8 space-y-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile"
                      maxLength={10}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Aadhar Card Number *</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={aadhar}
                      onChange={(e) => setAadhar(e.target.value)}
                      placeholder="12-digit UID"
                      maxLength={14}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admission Date *</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={admissionDate}
                      onChange={(e) => setAdmissionDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800 font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Parents Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Father's Name *</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Father's full name"
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mother's Name *</label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Mother's full name"
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* Fee & Subscription Plan Details */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span>Subscription Plan & Billing</span>
              </label>
              <span className="text-[11px] font-mono font-medium text-emerald-800 bg-emerald-50 ring-1 ring-emerald-600/20 px-2 py-0.5 rounded">
                Valid Till: {calculatedValidTill}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Monthly Fee (₹) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    placeholder="800"
                    className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Plan Duration</label>
                <select
                  value={planMonths}
                  onChange={(e) => setPlanMonths(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value={1}>1 Month (Standard)</option>
                  <option value={2}>2 Months</option>
                  <option value={3}>3 Months (Quarterly)</option>
                  <option value={6}>6 Months (Half-Yearly)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="UPI / QR">UPI / QR (PhonePe / GPay)</option>
                  <option value="Cash">Cash at Reception</option>
                  <option value="Bank Transfer">Bank Transfer / IMPS</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs text-slate-600">
              <span className="flex items-center space-x-2">
                <span className="font-semibold text-slate-700">Initial Status:</span>
                <label className="inline-flex items-center space-x-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="initialFeeStatus" 
                    checked={feeStatus === 'Paid'} 
                    onChange={() => setFeeStatus('Paid')} 
                    className="accent-slate-900"
                  />
                  <span className="text-emerald-700 font-medium">Paid & Active</span>
                </label>
                <label className="inline-flex items-center space-x-1 cursor-pointer ml-2">
                  <input 
                    type="radio" 
                    name="initialFeeStatus" 
                    checked={feeStatus === 'Due'} 
                    onChange={() => setFeeStatus('Due')} 
                    className="accent-slate-900"
                  />
                  <span className="text-red-700 font-medium">Payment Due</span>
                </label>
              </span>
              <span className="text-[10px] text-slate-400">Generates receipt record</span>
            </div>
          </div>

          {/* Student Login Credentials */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>Student Portal Authentication</span>
              </label>
              <span className="text-[10px] text-slate-400">Mobile/Email as Username</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[9px] uppercase font-semibold">User Identifier</span>
                <span className="font-mono text-xs text-slate-700">{mobile || email || 'Mobile / Email'}</span>
              </div>
              <div>
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set Password"
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isSubmitting ? 'Registering...' : 'Confirm Admission'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
