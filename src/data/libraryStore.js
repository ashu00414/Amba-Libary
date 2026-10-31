// Initializer and LocalStorage manager for 50 Library Seats & Shift Management
import { 
  pushSeatsToFirestore, 
  pushStudentsToFirestore, 
  removeStudentFromFirestore,
  pushRequestsToFirestore, 
  pushFeedbacksToFirestore, 
  pushAdminProfileToFirestore,
  initCloudSync 
} from './firebaseSync.js';

export { initCloudSync };

const STORAGE_KEY_SEATS = 'amba_lib_seats_v4_clean';
const STORAGE_KEY_STUDENTS = 'amba_lib_students_v4_clean';
const STORAGE_KEY_ADMIN = 'amba_lib_admin_profile_v1';
const STORAGE_KEY_SESSION = 'amba_lib_active_session_v1';

// Default Admin Profile
export const DEFAULT_ADMIN_PROFILE = {
  id: 'ADM-001',
  role: 'Chief Librarian / Owner',
  name: 'Chief Librarian (Admin)',
  email: 'admin@amba-library.edu',
  phone: '8292002249',
  password: 'admin2026'
};

export function getStoredAdminProfile() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ADMIN);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  saveStoredAdminProfile(DEFAULT_ADMIN_PROFILE);
  return DEFAULT_ADMIN_PROFILE;
}

export function saveStoredAdminProfile(profile) {
  try {
    localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(profile));
    pushAdminProfileToFirestore(profile);
  } catch (e) {
    console.error(e);
  }
}

export function updateAdminProfile(updatedFields) {
  const current = getStoredAdminProfile();
  const updated = { ...current, ...updatedFields };
  saveStoredAdminProfile(updated);
  return updated;
}

export function authenticateAdmin(identifier, password) {
  const profile = getStoredAdminProfile();
  const cleanId = (identifier || '').trim().toLowerCase();
  const inputPass = (password || '').trim();

  // Allow login by email, username 'admin', or Staff ID 'ADM-001'
  const isMatchId = 
    profile.email.toLowerCase() === cleanId ||
    cleanId === 'admin' ||
    profile.id.toLowerCase() === cleanId;

  if (isMatchId && profile.password === inputPass) {
    return {
      role: 'admin',
      name: profile.name,
      id: profile.id,
      email: profile.email,
      phone: profile.phone
    };
  }

  // Fallback for default initial credentials if not yet customized
  if (
    (cleanId === 'admin@amba-library.edu' || cleanId === 'admin') &&
    (inputPass === 'admin2026' || inputPass === 'admin123')
  ) {
    return {
      role: 'admin',
      name: profile.name || 'Chief Librarian (Admin)',
      id: profile.id || 'ADM-001',
      email: profile.email || 'admin@amba-library.edu',
      phone: profile.phone || '9876543210'
    };
  }

  return null;
}

// User Session Persistence across page refreshes (Admin & Student)
export function getStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (raw) {
      const session = JSON.parse(raw);
      if (session?.user && session?.view) {
        // If it's an admin, fetch fresh admin profile to reflect any updates
        if (session.user.role === 'admin') {
          const adminProfile = getStoredAdminProfile();
          session.user = {
            role: 'admin',
            name: adminProfile.name,
            id: adminProfile.id,
            email: adminProfile.email,
            phone: adminProfile.phone
          };
        } else if (session.user.role === 'student') {
          // If student, check if student record exists and update with fresh data
          const students = getStoredStudents();
          const freshStudent = students.find(s => s.id === session.user.id || s.email === session.user.email);
          if (freshStudent) {
            session.user = { ...freshStudent, role: 'student' };
          }
        }
        return session;
      }
    }
  } catch (e) {
    console.error('Failed to load stored session:', e);
  }
  return { user: null, view: 'landing' };
}

export function saveStoredSession(user, view) {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } else {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ user, view }));
    }
  } catch (e) {
    console.error('Failed to save session:', e);
  }
}

export function clearStoredSession() {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

export const DAY_SHIFTS = [
  { id: 'shift1', name: 'Morning Shift', time: '06:00 AM - 10:00 AM', shortTime: '06:00 - 10:00 AM', iconType: 'sunrise', defaultFee: 600 },
  { id: 'shift2', name: 'Noon Shift', time: '10:00 AM - 02:00 PM', shortTime: '10:00 AM - 02:00 PM', iconType: 'sun', defaultFee: 600 },
  { id: 'shift3', name: 'Evening Shift', time: '02:00 PM - 06:00 PM', shortTime: '02:00 - 06:00 PM', iconType: 'sunset', defaultFee: 600 },
  { id: 'shift4', name: 'Night Shift', time: '06:00 PM - 10:00 PM', shortTime: '06:00 - 10:00 PM', iconType: 'moon', defaultFee: 600 }
];

export const NIGHT_SHIFTS = [
  { id: 'night_full', name: 'Overnight Slot', time: '10:00 PM - 06:00 AM', shortTime: '10:00 PM - 06:00 AM', iconType: 'moon', defaultFee: 800 }
];

// Per-shift pricing configuration manager
export const DEFAULT_SHIFT_PRICING = {
  shift1: 600,     // Morning (06:00 AM - 10:00 AM)
  shift2: 600,     // Noon (10:00 AM - 02:00 PM)
  shift3: 600,     // Evening (02:00 PM - 06:00 PM)
  shift4: 600,     // Night (06:00 PM - 10:00 PM)
  night_full: 800, // Overnight (10:00 PM - 06:00 AM)
  full_day: 1800   // Full Day (All 4 Daytime Shifts - Discounted bundle)
};

const STORAGE_KEY_SHIFT_PRICING = 'amba_lib_shift_pricing_v1';

export function getShiftPricingConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHIFT_PRICING);
    if (raw) return { ...DEFAULT_SHIFT_PRICING, ...JSON.parse(raw) };
  } catch (e) {
    console.error(e);
  }
  return { ...DEFAULT_SHIFT_PRICING };
}

export function saveShiftPricingConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_SHIFT_PRICING, JSON.stringify(config));
  } catch (e) {
    console.error(e);
  }
}

// Calculate total fee for any shift combination
// e.g. 1 shift = 600, 2 shifts (Morning + Noon) = 1200, 3 shifts = 1800, Full Day = 1800, Overnight = 800
export function calculateShiftsFee(shiftIds = [], isFullDay = false, mode = 'day') {
  const pricing = getShiftPricingConfig();
  if (mode === 'night' || (Array.isArray(shiftIds) && shiftIds.includes('night_full'))) {
    return pricing.night_full || 800;
  }
  if (isFullDay || (Array.isArray(shiftIds) && shiftIds.length === 4)) {
    return pricing.full_day || 1800;
  }
  if (!Array.isArray(shiftIds) || shiftIds.length === 0) {
    return pricing.shift1 || 600;
  }
  // Sum individual prices of selected shifts
  return shiftIds.reduce((sum, sId) => sum + (pricing[sId] || 600), 0);
}

// Clean state for fresh client demo (0 students enrolled)
const INITIAL_STUDENTS = [];

// Initialize 50 clean seats with all shifts vacant
function generateInitialSeats() {
  const seats = [];
  for (let i = 1; i <= 50; i++) {
    const dayAllotments = {};
    DAY_SHIFTS.forEach(s => {
      dayAllotments[s.id] = null;
    });

    const nightAllotments = {};
    NIGHT_SHIFTS.forEach(s => {
      nightAllotments[s.id] = null;
    });

    seats.push({
      seatNumber: i,
      day: dayAllotments,
      night: nightAllotments
    });
  }

  return seats;
}

// Get all seats from storage or initialize
export function getStoredSeats() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_SEATS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  const initial = generateInitialSeats();
  saveStoredSeats(initial);
  return initial;
}

export function saveStoredSeats(seats) {
  try {
    localStorage.setItem(STORAGE_KEY_SEATS, JSON.stringify(seats));
    pushSeatsToFirestore(seats);
  } catch (e) {
    console.error(e);
  }
}

// Helper to calculate validTill given a start date and number of months
export function calculateValidTill(fromDateStr, months = 1) {
  const date = new Date(fromDateStr || new Date());
  date.setMonth(date.getMonth() + Number(months));
  return date.toISOString().split('T')[0];
}

// Migrate student record to ensure all fee & validity fields exist safely
export function migrateStudentFeeFields(st) {
  const admDate = st.admissionDate || st.allottedAt || new Date().toISOString().split('T')[0];
  const autoCalculatedFee = calculateShiftsFee(st.shifts, st.isFullDay, st.mode);
  const monthlyFee = (st.monthlyFee !== undefined && st.monthlyFee !== null && st.monthlyFee !== '') 
    ? Number(st.monthlyFee) 
    : autoCalculatedFee;
  const planMonths = Number(st.planMonths) || 1;
  const validFrom = st.validFrom || admDate;
  const validTill = st.validTill || calculateValidTill(validFrom, planMonths);
  const paymentMode = st.paymentMode || 'UPI / QR';
  const feeStatus = st.feeStatus || 'Paid';
  const receiptNumber = st.receiptNumber || `AMBA-REC-${st.id ? st.id.replace('STU-', '') : '1001'}`;
  const lastPaymentDate = st.lastPaymentDate || admDate;

  return {
    ...st,
    address: st.address || '',
    addressDetails: st.addressDetails || null,
    admissionDate: admDate,
    monthlyFee,
    planMonths,
    validFrom,
    validTill,
    paymentMode,
    feeStatus,
    receiptNumber,
    lastPaymentDate
  };
}

// Get all students
export function getStoredStudents() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Self-healing: if all 50 desks are vacant, no ghost/orphaned students should remain
        const seatsRaw = localStorage.getItem(STORAGE_KEY_SEATS);
        if (seatsRaw) {
          try {
            const seats = JSON.parse(seatsRaw);
            const assignedIds = new Set();
            seats.forEach(s => {
              if (s.day) Object.values(s.day).filter(Boolean).forEach(id => assignedIds.add(id));
              if (s.night) Object.values(s.night).filter(Boolean).forEach(id => assignedIds.add(id));
            });
            if (assignedIds.size === 0 && parsed.length > 0) {
              localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify([]));
              parsed.forEach(st => removeStudentFromFirestore(st.id));
              return [];
            }
          } catch (e) {
            console.error(e);
          }
        }
        return parsed.map(st => migrateStudentFeeFields(st));
      }
    }
  } catch (e) {
    console.error(e);
  }
  saveStoredStudents([]);
  return [];
}

export function saveStoredStudents(students) {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    pushStudentsToFirestore(students);
  } catch (e) {
    console.error(e);
  }
}

// Permanently delete a student and free their desk/shifts
export function deleteStudentCompletely(studentId) {
  const students = getStoredStudents();
  const seats = getStoredSeats();

  // 1. Remove from student records
  const updatedStudents = students.filter(st => st.id !== studentId);

  // 2. Free any seats / shifts assigned to this student
  seats.forEach(seat => {
    if (seat.day) {
      Object.keys(seat.day).forEach(sId => {
        if (seat.day[sId] === studentId) seat.day[sId] = null;
      });
    }
    if (seat.night) {
      Object.keys(seat.night).forEach(sId => {
        if (seat.night[sId] === studentId) seat.night[sId] = null;
      });
    }
  });

  // 3. Remove shift requests for this student
  const requests = getStoredShiftRequests();
  const updatedRequests = requests.filter(r => r.studentId !== studentId);

  // 4. Save locally and sync with Firestore
  saveStoredSeats(seats);
  saveStoredStudents(updatedStudents);
  saveStoredShiftRequests(updatedRequests);
  removeStudentFromFirestore(studentId);

  return { seats, students: updatedStudents };
}

// Reset all 50 seats and student records to 100% fresh clean state
export function resetLibraryDataToFresh() {
  try {
    localStorage.removeItem(STORAGE_KEY_SEATS);
    localStorage.removeItem(STORAGE_KEY_STUDENTS);
    localStorage.removeItem('amba_lib_seats_v2');
    localStorage.removeItem('amba_lib_students_v2');
    localStorage.removeItem('amba_lib_seats_v3_clean');
    localStorage.removeItem('amba_lib_students_v3_clean');
  } catch (e) {
    console.error(e);
  }
  const freshSeats = generateInitialSeats();
  saveStoredSeats(freshSeats);
  saveStoredStudents([]);
  return { seats: freshSeats, students: [] };
}

// Compute accurate real-time fee and validity status
export function getStudentFeeStatus(student) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validTillDate = new Date(student.validTill || new Date());
  validTillDate.setHours(0, 0, 0, 0);

  const diffTime = validTillDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (student.feeStatus === 'Due') {
    return {
      code: 'DUE',
      label: 'Payment Pending',
      badgeText: 'Payment Due',
      color: 'red',
      badgeClass: 'bg-red-50 text-red-700 ring-1 ring-red-600/20 font-medium',
      daysRemaining: diffDays,
      isAlert: true
    };
  }

  if (diffDays < 0) {
    return {
      code: 'OVERDUE',
      label: `Expired (${Math.abs(diffDays)}d ago)`,
      badgeText: `Overdue (${Math.abs(diffDays)}d)`,
      color: 'rose',
      badgeClass: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20 font-medium',
      daysRemaining: diffDays,
      isAlert: true
    };
  }

  if (diffDays <= 4) {
    return {
      code: 'EXPIRING_SOON',
      label: diffDays === 0 ? 'Expires Today' : `Expiring in ${diffDays} day${diffDays > 1 ? 's' : ''}`,
      badgeText: diffDays === 0 ? 'Due Today' : `Due in ${diffDays}d`,
      color: 'amber',
      badgeClass: 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20 font-medium',
      daysRemaining: diffDays,
      isAlert: true
    };
  }

  return {
    code: 'ACTIVE',
    label: `Active (${diffDays} days left)`,
    badgeText: 'Paid & Active',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 font-medium',
    daysRemaining: diffDays,
    isAlert: false
  };
}

// Helper: Check if seat has at least one vacant shift in given mode ('day' or 'night')
// Pure vacancy = not occupied and not on hold
export function isSeatHasVacancy(seat, mode = 'day') {
  const shiftsMap = seat[mode] || {};
  const shiftList = mode === 'day' ? DAY_SHIFTS : NIGHT_SHIFTS;
  
  // If ANY shift is unallotted AND NOT on hold, then seat has vacancy => GREEN
  const hasUnallottedShift = shiftList.some(shift => !shiftsMap[shift.id] && !isShiftOnHold(seat.seatNumber, mode, shift.id));
  return hasUnallottedShift;
}

// Helper: Count vacant shifts for seat (excluding holds)
export function getVacantShiftsCount(seat, mode = 'day') {
  const shiftsMap = seat[mode] || {};
  const shiftList = mode === 'day' ? DAY_SHIFTS : NIGHT_SHIFTS;
  return shiftList.filter(shift => !shiftsMap[shift.id] && !isShiftOnHold(seat.seatNumber, mode, shift.id)).length;
}

// Helper: Check if seat has at least one shift on Hold (Orange)
export function isSeatHasHold(seat, mode = 'day') {
  const shiftList = mode === 'day' ? DAY_SHIFTS : NIGHT_SHIFTS;
  return shiftList.some(shift => isShiftOnHold(seat.seatNumber, mode, shift.id));
}

// Helper: Count shifts on Hold for seat
export function getHoldShiftsCount(seat, mode = 'day') {
  const shiftList = mode === 'day' ? DAY_SHIFTS : NIGHT_SHIFTS;
  return shiftList.filter(shift => isShiftOnHold(seat.seatNumber, mode, shift.id)).length;
}

// Allot a student to a seat for specified shifts
export function allotStudentToSeat({
  studentData,
  seatNumber,
  mode = 'day',
  shiftIds = []
}) {
  const seats = getStoredSeats();
  const students = getStoredStudents();

  const seatIndex = seats.findIndex(s => s.seatNumber === seatNumber);
  if (seatIndex === -1) throw new Error('Invalid Seat Number');

  // Generate unique student ID
  const newStudentId = `STU-${1000 + students.length + 1}`;
  const admDate = studentData.admissionDate || new Date().toISOString().split('T')[0];
  const planMonths = Number(studentData.planMonths) || 1;
  const isFullDay = mode === 'day' && shiftIds.length === 4;
  const autoFee = calculateShiftsFee(shiftIds, isFullDay, mode);
  const monthlyFee = (studentData.monthlyFee !== undefined && studentData.monthlyFee !== null && studentData.monthlyFee !== '') 
    ? Number(studentData.monthlyFee) 
    : autoFee;

  const validFrom = studentData.validFrom || admDate;
  const validTill = studentData.validTill || calculateValidTill(validFrom, planMonths);
  const receiptNumber = `AMBA-REC-${1000 + students.length + 1}`;

  const studentRecord = {
    id: newStudentId,
    ...studentData,
    address: studentData.address || '',
    addressDetails: studentData.addressDetails || null,
    seatNumber,
    mode,
    shifts: shiftIds,
    isFullDay,
    admissionDate: admDate,
    allottedAt: admDate,
    monthlyFee,
    feeStatus: studentData.feeStatus || 'Paid',
    paymentMode: studentData.paymentMode || 'UPI / QR',
    planMonths,
    validFrom,
    validTill,
    receiptNumber,
    lastPaymentDate: admDate
  };

  // Update Seat
  shiftIds.forEach(sId => {
    seats[seatIndex][mode][sId] = newStudentId;
  });

  students.push(studentRecord);

  saveStoredSeats(seats);
  saveStoredStudents(students);

  // Purge any stale shift requests that might have belonged to previous deleted student with this ID
  try {
    const rawReqs = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (rawReqs) {
      const list = JSON.parse(rawReqs);
      const cleaned = list.filter(r => r.studentId !== newStudentId);
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(cleaned));
    }
  } catch (e) {
    console.error(e);
  }

  return { student: studentRecord, seats, students };
}

// Renew a student membership plan (+1, +2, +3 months)
export function renewStudentMembership(studentId, { months = 1, feeAmount, paymentMode = 'UPI / QR', note = '' }) {
  const students = getStoredStudents();
  const index = students.findIndex(s => s.id === studentId);
  if (index === -1) throw new Error('Student not found');

  const student = students[index];
  const todayStr = new Date().toISOString().split('T')[0];

  // If existing plan is still active, extend from validTill; otherwise extend from today
  const isStillActive = new Date(student.validTill) > new Date();
  const baseDate = isStillActive ? student.validTill : todayStr;
  const newValidTill = calculateValidTill(baseDate, months);
  const newReceiptNo = `AMBA-REC-${Date.now().toString().slice(-6)}`;

  students[index] = {
    ...student,
    monthlyFee: Number(feeAmount) || student.monthlyFee,
    paymentMode,
    feeStatus: 'Paid',
    validFrom: baseDate,
    validTill: newValidTill,
    planMonths: Number(months),
    lastPaymentDate: todayStr,
    receiptNumber: newReceiptNo,
    lastRenewalNote: note
  };

  saveStoredStudents(students);
  return students[index];
}

// Update payment status (e.g. mark Paid or Due)
export function updateStudentFeeStatus(studentId, feeStatus) {
  const students = getStoredStudents();
  const index = students.findIndex(s => s.id === studentId);
  if (index === -1) throw new Error('Student not found');

  students[index].feeStatus = feeStatus;
  if (feeStatus === 'Paid') {
    students[index].lastPaymentDate = new Date().toISOString().split('T')[0];
  }
  saveStoredStudents(students);
  return students[index];
}

// Update complete student record details (Name, Contact, Address, Parents, Password, Fee, Photo, etc.)
export function updateStudentRecord(studentId, updatedFields) {
  const students = getStoredStudents();
  const index = students.findIndex(s => s.id === studentId);
  if (index === -1) throw new Error('Student not found in database');

  const existing = students[index];
  const updatedStudent = {
    ...existing,
    ...updatedFields,
    id: existing.id, // Immutable ID
    updatedAt: new Date().toISOString()
  };

  // Ensure monthlyFee is a number if provided
  if (updatedFields.monthlyFee !== undefined && updatedFields.monthlyFee !== '') {
    updatedStudent.monthlyFee = Number(updatedFields.monthlyFee);
  }

  students[index] = updatedStudent;
  saveStoredStudents(students);

  // Sync active session if logged in as this student
  try {
    const currentSession = getStoredSession();
    if (currentSession && currentSession.user && currentSession.user.id === studentId) {
      saveStoredSession({
        ...currentSession,
        user: { ...updatedStudent, role: 'student' }
      });
    }
  } catch (err) {
    console.error('Session sync error on student update:', err);
  }

  return updatedStudent;
}

// Cancel / Deallocate a shift
export function deallocateShift({ seatNumber, mode, shiftId }) {
  const seats = getStoredSeats();
  const students = getStoredStudents();

  const seatIndex = seats.findIndex(s => s.seatNumber === seatNumber);
  if (seatIndex === -1) return;

  const studentId = seats[seatIndex][mode][shiftId];
  if (!studentId) return;

  // Clear from seat
  seats[seatIndex][mode][shiftId] = null;

  // Update student's shift list
  const studentIndex = students.findIndex(st => st.id === studentId);
  if (studentIndex !== -1) {
    const updatedShifts = students[studentIndex].shifts.filter(s => s !== shiftId);
    if (updatedShifts.length === 0) {
      // If student has no shifts left, remove student
      students.splice(studentIndex, 1);
      removeStudentFromFirestore(studentId);
      // Clean up all requests for this deleted student
      try {
        const rawReqs = localStorage.getItem(STORAGE_KEY_REQUESTS);
        if (rawReqs) {
          const list = JSON.parse(rawReqs);
          const cleaned = list.filter(r => r.studentId !== studentId);
          localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(cleaned));
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      students[studentIndex].shifts = updatedShifts;
      students[studentIndex].isFullDay = false;
    }
  }

  saveStoredSeats(seats);
  saveStoredStudents(students);
  return { seats, students };
}

// Stored Feedback / Get in Touch
const STORAGE_KEY_FEEDBACKS = 'amba_lib_feedbacks_v1';
const STORAGE_KEY_REQUESTS = 'amba_lib_shift_requests_v1';

export function getStoredShiftRequests() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (data) {
      const list = JSON.parse(data);
      if (Array.isArray(list)) {
        // Automatically purge orphaned requests whose student was deleted
        // or requests created prior to the student's current admission date
        const students = getStoredStudents();
        const validStudentMap = new Map(students.map(s => [s.id, s]));

        const validList = list.filter(r => {
          const student = validStudentMap.get(r.studentId);
          if (!student) return false;
          // If request was created before current student's admission date, ignore as stale
          if (r.createdAt) {
            const admTime = new Date(student.allottedAt || student.admissionDate || 0).getTime();
            if (admTime && new Date(r.createdAt).getTime() < admTime - (2 * 60 * 1000)) {
              return false;
            }
          }
          return true;
        });

        if (validList.length !== list.length) {
          localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(validList));
        }
        return validList;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveStoredShiftRequests(requests) {
  try {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    pushRequestsToFirestore(requests);
  } catch (e) {
    console.error(e);
  }
}

export function saveShiftRequest(req) {
  const list = getStoredShiftRequests();
  const entry = {
    id: `REQ-${Date.now()}`,
    ...req,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };
  list.unshift(entry);
  saveStoredShiftRequests(list);
  return entry;
}

// Get a map of all currently held shifts across the 50 desks
// Key format: `${seatNumber}_${mode}_${shiftId}`
export function getHeldShiftsMap() {
  try {
    const rawReqs = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (!rawReqs) return {};
    const requests = JSON.parse(rawReqs);
    if (!Array.isArray(requests)) return {};

    const holdMap = {};
    const holdRequests = requests.filter(r => r.status === 'Hold');

    holdRequests.forEach(req => {
      const seatNum = Number(req.requestedSeat);
      let targetMode = req.mode || (req.requestedShift?.toLowerCase().includes('overnight') ? 'night' : 'day');
      let shiftIds = [];

      const isFullDay = req.isFullDay || 
                        req.requestedShiftId === 'full_day' || 
                        req.requestedShift?.toLowerCase().includes('full day') ||
                        req.requestedShift?.toLowerCase().includes('total');

      if (isFullDay && targetMode === 'day') {
        shiftIds = ['shift1', 'shift2', 'shift3', 'shift4'];
      } else if (req.requestType === 'ADD_SHIFT' && req.addingShiftId) {
        shiftIds = [req.addingShiftId];
      } else if (Array.isArray(req.shiftIds) && req.shiftIds.length > 0) {
        shiftIds = req.shiftIds;
      } else {
        let targetShiftId = req.requestedShiftId;
        if (!targetShiftId) {
          const allShifts = [...DAY_SHIFTS, ...NIGHT_SHIFTS];
          const match = allShifts.find(s => s.name.toLowerCase() === (req.requestedShift || '').toLowerCase());
          targetShiftId = match ? match.id : 'shift1';
        }
        shiftIds = [targetShiftId];
      }

      shiftIds.forEach(sId => {
        const key = `${seatNum}_${targetMode}_${sId}`;
        holdMap[key] = {
          requestId: req.id,
          studentId: req.studentId,
          studentName: req.studentName,
          mobile: req.mobile,
          seatNumber: seatNum,
          mode: targetMode,
          shiftId: sId,
          isFullDay,
          heldAt: req.heldAt,
          rawRequest: req
        };
      });
    });

    return holdMap;
  } catch (e) {
    console.error(e);
    return {};
  }
}

// Check if a specific shift on a desk is on Hold (Orange)
export function isShiftOnHold(seatNumber, mode, shiftId) {
  const map = getHeldShiftsMap();
  const key = `${Number(seatNumber)}_${mode}_${shiftId}`;
  return map[key] || null;
}

// Get full status of a shift: 'OCCUPIED' | 'HOLD' | 'VACANT'
export function getShiftStatus(seat, mode, shiftId) {
  const occupant = seat[mode]?.[shiftId];
  if (occupant) {
    return { status: 'OCCUPIED', studentId: occupant };
  }
  const hold = isShiftOnHold(seat.seatNumber, mode, shiftId);
  if (hold) {
    return { status: 'HOLD', ...hold };
  }
  return { status: 'VACANT' };
}

// Stage 1: Put request on Hold (turns slot Orange on 50 Desks Board)
export function holdShiftRequest(reqId) {
  const requests = getStoredShiftRequests();
  const reqIndex = requests.findIndex(r => r.id === reqId);
  if (reqIndex === -1) return { success: false, error: 'Request not found' };

  const req = requests[reqIndex];
  if (req.status !== 'Pending') {
    return { success: false, error: `Request cannot be put on hold (current status: ${req.status})` };
  }

  requests[reqIndex] = {
    ...req,
    status: 'Hold',
    heldAt: new Date().toISOString()
  };

  saveStoredShiftRequests(requests);

  return { success: true, updatedRequest: requests[reqIndex] };
}

// Stage 2: Allot student shift request (converts slot from Orange / Hold to Red / Occupied)
export function approveShiftRequest(reqId, customFee) {
  const requests = getStoredShiftRequests();
  const reqIndex = requests.findIndex(r => r.id === reqId);
  if (reqIndex === -1) return { success: false, error: 'Request not found' };

  const req = requests[reqIndex];
  // Allow approving from either 'Pending' or 'Hold'
  if (req.status !== 'Pending' && req.status !== 'Hold') {
    return { success: false, error: 'Request is already processed' };
  }

  const seats = getStoredSeats();
  const students = getStoredStudents();

  // Find student record
  const studentIndex = students.findIndex(st => st.id === req.studentId);
  if (studentIndex === -1) {
    return { success: false, error: 'Student record not found in system' };
  }
  const student = students[studentIndex];

  // Old seat details
  const oldSeatNumber = Number(student.seatNumber);
  const oldSeatIndex = seats.findIndex(s => s.seatNumber === oldSeatNumber);

  // Target seat details
  const newSeatNumber = Number(req.requestedSeat);
  const newSeatIndex = seats.findIndex(s => s.seatNumber === newSeatNumber);
  if (newSeatIndex === -1) {
    return { success: false, error: 'Target desk not found' };
  }

  // Determine target shift IDs and mode
  let targetMode = req.mode || (req.requestedShift?.toLowerCase().includes('overnight') ? 'night' : 'day');
  let targetShiftIds = [];

  const isFullDay = req.isFullDay || 
                    req.requestedShiftId === 'full_day' || 
                    req.requestedShift?.toLowerCase().includes('full day') ||
                    req.requestedShift?.toLowerCase().includes('total');

  if (isFullDay && targetMode === 'day') {
    targetShiftIds = ['shift1', 'shift2', 'shift3', 'shift4'];
  } else if (req.requestType === 'ADD_SHIFT') {
    // When adding a shift, combine student's current shifts with the requested shift
    const existing = Array.isArray(student.shifts) ? student.shifts : [];
    const adding = Array.isArray(req.shiftIds) ? req.shiftIds : (req.requestedShiftId ? [req.requestedShiftId] : []);
    targetShiftIds = Array.from(new Set([...existing, ...adding]));
  } else if (Array.isArray(req.shiftIds) && req.shiftIds.length > 0) {
    targetShiftIds = req.shiftIds;
  } else {
    let targetShiftId = req.requestedShiftId;
    if (!targetShiftId) {
      const allShifts = [...DAY_SHIFTS, ...NIGHT_SHIFTS];
      const match = allShifts.find(s => s.name.toLowerCase() === (req.requestedShift || '').toLowerCase());
      if (match) {
        targetShiftId = match.id;
        targetMode = DAY_SHIFTS.some(s => s.id === match.id) ? 'day' : 'night';
      } else {
        targetShiftId = 'shift1';
      }
    }
    targetShiftIds = [targetShiftId];
  }

  // Check if target seat shifts are vacant
  const occupiedShift = targetShiftIds.find(sId => seats[newSeatIndex][targetMode][sId] && seats[newSeatIndex][targetMode][sId] !== student.id);
  if (occupiedShift) {
    return { 
      success: false, 
      error: `Desk #${newSeatNumber} has occupied shift(s). Cannot approve full transfer.` 
    };
  }

  // 1. Vacate student's previous seat
  if (oldSeatIndex !== -1) {
    Object.keys(seats[oldSeatIndex].day || {}).forEach(sId => {
      if (seats[oldSeatIndex].day[sId] === student.id) {
        seats[oldSeatIndex].day[sId] = null;
      }
    });
    Object.keys(seats[oldSeatIndex].night || {}).forEach(sId => {
      if (seats[oldSeatIndex].night[sId] === student.id) {
        seats[oldSeatIndex].night[sId] = null;
      }
    });
  }

  // 2. Allot target seat and shifts to student
  targetShiftIds.forEach(sId => {
    seats[newSeatIndex][targetMode][sId] = student.id;
  });

  // 3. Update student record & calculate accurate multi-shift fee
  const newIsFullDay = targetShiftIds.length === 4 && targetMode === 'day';
  const autoCalculatedFee = calculateShiftsFee(targetShiftIds, newIsFullDay, targetMode);
  const newFee = (customFee !== undefined && customFee !== null && customFee !== '')
    ? Number(customFee)
    : (req.newFee !== undefined && req.newFee !== null && req.newFee !== ''
        ? Number(req.newFee)
        : autoCalculatedFee);

  students[studentIndex] = {
    ...student,
    seatNumber: newSeatNumber,
    mode: targetMode,
    shifts: targetShiftIds,
    isFullDay: newIsFullDay,
    monthlyFee: newFee,
    lastPaymentDate: new Date().toISOString().split('T')[0]
  };

  // 4. Update request status
  requests[reqIndex] = {
    ...req,
    status: 'Approved',
    approvedAt: new Date().toISOString(),
    approvedFee: newFee
  };

  saveStoredSeats(seats);
  saveStoredStudents(students);
  saveStoredShiftRequests(requests);

  // 5. Update active student session if logged in
  const currentSession = getStoredSession();
  if (currentSession && currentSession.user && currentSession.user.id === student.id) {
    saveStoredSession(students[studentIndex], currentSession.view);
  }

  return { success: true, updatedRequest: requests[reqIndex] };
}

// Stage 2 Alias: Allot shift request (Orange -> Red/Occupied)
export function allotShiftRequest(reqId, customFee) {
  return approveShiftRequest(reqId, customFee);
}

// Stage 3: Reject or Release Hold for a shift request (Orange -> Green/Vacant)
export function rejectShiftRequest(reqId) {
  const requests = getStoredShiftRequests();
  const updated = requests.map(r => r.id === reqId ? { 
    ...r, 
    status: 'Rejected', 
    rejectedAt: new Date().toISOString() 
  } : r);
  saveStoredShiftRequests(updated);
  return updated;
}

export const releaseShiftRequest = rejectShiftRequest;

export function updateShiftRequestStatus(id, newStatus) {
  if (newStatus === 'Approved') {
    return approveShiftRequest(id);
  } else if (newStatus === 'Rejected') {
    return rejectShiftRequest(id);
  }
  const list = getStoredShiftRequests();
  const updated = list.map(r => r.id === id ? { ...r, status: newStatus } : r);
  saveStoredShiftRequests(updated);
  return updated;
}

export function getStoredFeedbacks() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_FEEDBACKS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveStoredFeedbacks(feedbacks) {
  try {
    localStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(feedbacks));
    pushFeedbacksToFirestore(feedbacks);
  } catch (e) {
    console.error(e);
  }
}

export function saveFeedback(feedback) {
  const list = getStoredFeedbacks();
  const entry = {
    id: `FB-${Date.now()}`,
    ...feedback,
    createdAt: new Date().toISOString()
  };
  list.unshift(entry);
  saveStoredFeedbacks(list);
  return entry;
}

export function deleteFeedback(fbId) {
  const feedbacks = getStoredFeedbacks();
  const updated = feedbacks.filter(f => f.id !== fbId);
  saveStoredFeedbacks(updated);
  return updated;
}

// Authenticate student by email OR mobile + password
export function authenticateStudent(identifier, password) {
  const students = getStoredStudents();
  const cleanId = identifier.trim().toLowerCase();
  
  return students.find(s => 
    (s.email.toLowerCase() === cleanId || s.mobile === cleanId || s.id.toLowerCase() === cleanId) &&
    s.password === password
  );
}
