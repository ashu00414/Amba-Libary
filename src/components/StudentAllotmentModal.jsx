import React, { useState, useRef, useEffect } from 'react';
import { 
  X, User, Phone, Mail, FileText, Lock, Users, Camera, 
  Check, AlertCircle, CheckCircle2, Calendar, DollarSign, 
  CreditCard, Sunrise, Sun, Sunset, Moon, Clock,
  Upload, RefreshCw, RotateCcw, Trash2, MapPin
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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('user');
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [capturedSnapshot, setCapturedSnapshot] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [admissionDate, setAdmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  
  // Detailed Address State
  const [villageOrStreet, setVillageOrStreet] = useState('');
  const [landmarkOrPS, setLandmarkOrPS] = useState('');
  const [districtOrCity, setDistrictOrCity] = useState('');
  const [stateName, setStateName] = useState('Bihar');
  const [pinCode, setPinCode] = useState('');

  const [password, setPassword] = useState('student123');

  // Fee & Subscription state
  const [monthlyFee, setMonthlyFee] = useState(defaultFee);
  const [planMonths, setPlanMonths] = useState(1);
  const [paymentMode, setPaymentMode] = useState('UPI / QR');
  const [feeStatus, setFeeStatus] = useState('Paid');

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Stop camera stream cleanly when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  const startCamera = async (facing = 'user') => {
    setIsCameraOpen(true);
    setCameraLoading(true);
    setCameraError('');
    setCapturedSnapshot(null);

    // Stop previous stream if any
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }

      const constraints = {
        video: {
          facingMode: facing,
          width: { ideal: 640 },
          height: { ideal: 640 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Small delay to ensure modal DOM element is rendered
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (e) {
            console.warn('Auto-play blocked or delayed:', e);
          }
        }
        setCameraLoading(false);
      }, 100);
    } catch (err) {
      console.error('Camera error:', err);
      setCameraLoading(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission denied. Please allow camera permissions in your browser address bar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please upload a photo from files.');
      } else {
        setCameraError(err.message || 'Unable to open camera. Please check permissions or upload from device.');
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
    setCameraError('');
    setCapturedSnapshot(null);
  };

  const handleFlipCamera = () => {
    const nextFacing = cameraFacingMode === 'user' ? 'environment' : 'user';
    setCameraFacingMode(nextFacing);
    startCamera(nextFacing);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');

    const videoWidth = video.videoWidth || 640;
    const videoHeight = video.videoHeight || 480;
    const size = Math.min(videoWidth, videoHeight);

    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const startX = (videoWidth - size) / 2;
    const startY = (videoHeight - size) / 2;

    // Mirror if front camera for natural selfie view
    if (cameraFacingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, startX, startY, size, size, 0, 0, 400, 400);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedSnapshot(dataUrl);
  };

  const confirmCapturedPhoto = () => {
    if (capturedSnapshot) {
      setPhotoPreview(capturedSnapshot);
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedSnapshot(null);
  };

  if (!isOpen) return null;

  const currentShiftList = mode === 'day' ? DAY_SHIFTS : NIGHT_SHIFTS;
  const calculatedValidTill = calculateValidTill(admissionDate, planMonths);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress to 400x400 JPEG
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = Math.min(img.width, img.height);
          canvas.width = 400;
          canvas.height = 400;
          const ctx = canvas.getContext('2d');
          const startX = (img.width - size) / 2;
          const startY = (img.height - size) / 2;
          ctx.drawImage(img, startX, startY, size, size, 0, 0, 400, 400);
          setPhotoPreview(canvas.toDataURL('image/jpeg', 0.88));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const formattedAddress = [
    villageOrStreet.trim(),
    landmarkOrPS.trim() ? `P.O./P.S.: ${landmarkOrPS.trim()}` : '',
    districtOrCity.trim() ? `Dist: ${districtOrCity.trim()}` : '',
    stateName.trim() ? (pinCode.trim() ? `${stateName.trim()} - ${pinCode.trim()}` : stateName.trim()) : pinCode.trim()
  ].filter(Boolean).join(', ');

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
    if (!villageOrStreet.trim()) return setError('Please enter Village / Mohalla / Street in Address Details');
    if (!districtOrCity.trim()) return setError('Please enter City / District in Address Details');
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
          address: formattedAddress,
          addressDetails: {
            street: villageOrStreet.trim(),
            landmark: landmarkOrPS.trim(),
            city: districtOrCity.trim(),
            state: stateName.trim(),
            pincode: pinCode.trim()
          },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/90 my-2 sm:my-8 max-h-[96vh] sm:max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Executive Header */}
        <div className="bg-[#0B0F19] px-4 sm:px-6 py-3.5 sm:py-4 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
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
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
            <div className="md:col-span-4 flex flex-col items-center text-center p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-2xs mb-2.5 bg-white flex items-center justify-center group">
                {photoPreview ? (
                  <>
                    <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview('')}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center shadow-xs transition-opacity cursor-pointer"
                      title="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <User className="w-10 h-10" />
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5">Passport Size</span>
                  </div>
                )}
              </div>

              {photoPreview ? (
                <div className="space-y-1.5 w-full">
                  <div className="flex items-center justify-center space-x-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 py-1 px-2 rounded-lg border border-emerald-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Photo Attached</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => startCamera(cameraFacingMode)}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 flex items-center space-x-1 shadow-2xs cursor-pointer transition-all"
                    >
                      <Camera className="w-3 h-3 text-emerald-600" />
                      <span>Retake</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 flex items-center space-x-1 shadow-2xs cursor-pointer transition-all"
                    >
                      <Upload className="w-3 h-3 text-slate-500" />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5 w-full">
                  {/* Primary: Live Camera Button */}
                  <button
                    type="button"
                    onClick={() => startCamera(cameraFacingMode)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer group"
                  >
                    <Camera className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>Click Live Photo</span>
                  </button>

                  {/* Secondary: Upload File Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium py-1.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Upload from Device</span>
                  </button>
                  <p className="text-[10px] text-slate-400 leading-tight">Webcam or mobile camera</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handlePhotoUpload}
                className="hidden"
              />
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

          {/* Residential / Permanent Address Details */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Residential / Permanent Address Details *</span>
              </label>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Address on Record</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Village / Mohalla / Ward / Street *</label>
                <input
                  type="text"
                  value={villageOrStreet}
                  onChange={(e) => setVillageOrStreet(e.target.value)}
                  placeholder="e.g. Vill - Rampur, Ward #04"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Post Office (P.O.) / Police Station (P.S.)</label>
                <input
                  type="text"
                  value={landmarkOrPS}
                  onChange={(e) => setLandmarkOrPS(e.target.value)}
                  placeholder="e.g. P.O. - Barh, Near Kali Mandir"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">District / City *</label>
                <input
                  type="text"
                  value={districtOrCity}
                  onChange={(e) => setDistrictOrCity(e.target.value)}
                  placeholder="e.g. Patna / Gaya"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">State *</label>
                <input
                  type="text"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="e.g. Bihar"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">PIN Code (6 Digits)</label>
                <input
                  type="text"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 803213"
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 font-mono"
                />
              </div>
            </div>

            {formattedAddress && (
              <div className="p-2 bg-amber-50/70 rounded-lg border border-amber-200/70 text-[11px] text-amber-900 flex items-start space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-semibold text-amber-950">Formatted Address: </span>
                  <span>{formattedAddress}</span>
                </div>
              </div>
            )}
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

        {/* LIVE CAMERA CAPTURE OVERLAY MODAL */}
        {isCameraOpen && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div 
              className="bg-[#0B0F19] border border-slate-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold text-sm text-white">Live Student Photo Camera</span>
                </div>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Viewfinder Window */}
              <div className="relative aspect-square w-full max-w-[320px] mx-auto bg-black overflow-hidden flex items-center justify-center my-3 rounded-2xl border border-slate-800 shadow-inner">
                {cameraLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-900 text-slate-400 space-y-2">
                    <RefreshCw className="w-7 h-7 text-amber-400 animate-spin" />
                    <span className="text-xs font-medium">Starting device camera...</span>
                  </div>
                )}

                {cameraError ? (
                  <div className="p-6 text-center space-y-3">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
                    <p className="text-xs text-red-300 leading-relaxed">{cameraError}</p>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        fileInputRef.current?.click();
                      }}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-white border border-slate-700 cursor-pointer"
                    >
                      Upload photo file instead
                    </button>
                  </div>
                ) : capturedSnapshot ? (
                  /* Captured Snapshot Preview */
                  <img src={capturedSnapshot} alt="Snapshot Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    {/* Live Video Stream */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${cameraFacingMode === 'user' ? '-scale-x-100' : ''}`}
                    />
                    
                    {/* Passport Oval Guide Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                      <div className="w-44 h-56 border-2 border-dashed border-amber-400/80 rounded-[50%] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
                      <span className="absolute bottom-2.5 text-[10px] text-amber-300 font-semibold bg-black/70 px-2.5 py-0.5 rounded-full backdrop-blur-xs tracking-wide">
                        Align Face in Oval
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Bottom Controls */}
              <div className="p-4 bg-[#090D15] border-t border-slate-800 flex items-center justify-center">
                {capturedSnapshot ? (
                  /* Post-capture controls */
                  <div className="flex items-center justify-center gap-3 w-full px-2">
                    <button
                      type="button"
                      onClick={retakePhoto}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake</span>
                    </button>
                    <button
                      type="button"
                      onClick={confirmCapturedPhoto}
                      className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-md cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Use Photo</span>
                    </button>
                  </div>
                ) : !cameraError ? (
                  /* Pre-capture live stream controls */
                  <div className="flex items-center justify-between w-full px-4">
                    <button
                      type="button"
                      onClick={handleFlipCamera}
                      className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                      title="Flip Front/Back Camera"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>

                    {/* Shutter Button */}
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="w-16 h-16 rounded-full border-4 border-white/80 p-1 flex items-center justify-center bg-white hover:bg-amber-400 transition-all cursor-pointer shadow-lg active:scale-95 group"
                      title="Take Photo"
                    >
                      <div className="w-full h-full rounded-full bg-amber-500 group-hover:bg-amber-600 transition-colors flex items-center justify-center shadow-inner">
                        <Camera className="w-6 h-6 text-slate-950" />
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={stopCamera}
                      className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 rounded-lg cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Close Camera
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
