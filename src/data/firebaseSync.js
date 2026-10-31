import { db } from '../firebase.js';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';

// Storage Keys matching libraryStore.js
const STORAGE_KEY_SEATS = 'amba_lib_seats_v4_clean';
const STORAGE_KEY_STUDENTS = 'amba_lib_students_v4_clean';
const STORAGE_KEY_REQUESTS = 'amba_lib_shift_requests_v1';
const STORAGE_KEY_FEEDBACKS = 'amba_lib_feedbacks_v1';
const STORAGE_KEY_ADMIN = 'amba_lib_admin_profile_v1';

// Firestore collection & document names
const CONFIG_COLL = 'library_config';
const SEATS_DOC = 'seats_matrix';
const ADMIN_DOC = 'admin_profile';
const STUDENTS_COLL = 'students';
const REQUESTS_COLL = 'shift_requests';
const FEEDBACKS_COLL = 'feedbacks';

let isListenersAttached = false;
let isApplyingCloudUpdate = false;

/**
 * Push 50 Desks Seat Matrix to Firestore
 */
export async function pushSeatsToFirestore(seats) {
  if (isApplyingCloudUpdate || !db || !Array.isArray(seats)) return;
  try {
    const ref = doc(db, CONFIG_COLL, SEATS_DOC);
    await setDoc(ref, { 
      seats, 
      updatedAt: new Date().toISOString() 
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore pushSeats:', err.message);
  }
}

/**
 * Push full students list to Firestore (uses batch write for consistency)
 */
export async function pushStudentsToFirestore(students) {
  if (isApplyingCloudUpdate || !db || !Array.isArray(students)) return;
  try {
    const batch = writeBatch(db);
    
    // Write or update each student doc
    students.forEach(st => {
      if (st?.id) {
        const ref = doc(db, STUDENTS_COLL, st.id);
        batch.set(ref, { ...st, updatedAt: new Date().toISOString() }, { merge: true });
      }
    });

    await batch.commit();
  } catch (err) {
    console.warn('Firestore pushStudents:', err.message);
  }
}

export async function removeStudentFromFirestore(studentId) {
  if (!db || !studentId) return;
  try {
    const ref = doc(db, STUDENTS_COLL, studentId);
    await deleteDoc(ref);
  } catch (err) {
    console.warn('Firestore removeStudent:', err.message);
  }
}

/**
 * Push shift requests to Firestore
 */
export async function pushRequestsToFirestore(requests) {
  if (isApplyingCloudUpdate || !db || !Array.isArray(requests)) return;
  try {
    const batch = writeBatch(db);
    requests.forEach(r => {
      if (r?.id) {
        const ref = doc(db, REQUESTS_COLL, r.id);
        batch.set(ref, { ...r, updatedAt: new Date().toISOString() }, { merge: true });
      }
    });
    await batch.commit();
  } catch (err) {
    console.warn('Firestore pushRequests:', err.message);
  }
}

/**
 * Push feedback to Firestore
 */
export async function pushFeedbacksToFirestore(feedbacks) {
  if (isApplyingCloudUpdate || !db || !Array.isArray(feedbacks)) return;
  try {
    const batch = writeBatch(db);
    feedbacks.forEach(f => {
      if (f?.id) {
        const ref = doc(db, FEEDBACKS_COLL, f.id);
        batch.set(ref, { ...f, updatedAt: new Date().toISOString() }, { merge: true });
      }
    });
    await batch.commit();
  } catch (err) {
    console.warn('Firestore pushFeedbacks:', err.message);
  }
}

/**
 * Push Admin Profile to Firestore
 */
export async function pushAdminProfileToFirestore(profile) {
  if (isApplyingCloudUpdate || !db || !profile) return;
  try {
    const ref = doc(db, CONFIG_COLL, ADMIN_DOC);
    await setDoc(ref, { 
      ...profile, 
      updatedAt: new Date().toISOString() 
    }, { merge: true });
  } catch (err) {
    console.warn('Firestore pushAdminProfile:', err.message);
  }
}

/**
 * Broadcast event to all listening components
 */
function notifyDataSynced(type) {
  try {
    window.dispatchEvent(new CustomEvent('amba_data_synced', { detail: { type } }));
  } catch (e) {
    // ignore
  }
}

/**
 * Initialize Cloud Synchronization:
 * 1. Seed or pull latest data on startup
 * 2. Attach real-time listeners across all devices
 */
export async function initCloudSync() {
  if (!db) return;

  try {
    // --- 1. Initial One-time Hydration ---
    // A. Seats
    const seatsSnap = await getDoc(doc(db, CONFIG_COLL, SEATS_DOC));
    if (seatsSnap.exists() && Array.isArray(seatsSnap.data()?.seats)) {
      isApplyingCloudUpdate = true;
      localStorage.setItem(STORAGE_KEY_SEATS, JSON.stringify(seatsSnap.data().seats));
      isApplyingCloudUpdate = false;
      notifyDataSynced('seats');
    } else {
      // Seed local seats to cloud if empty
      const localSeatsRaw = localStorage.getItem(STORAGE_KEY_SEATS);
      if (localSeatsRaw) {
        pushSeatsToFirestore(JSON.parse(localSeatsRaw));
      }
    }

    // B. Students
    const studentsSnap = await getDocs(collection(db, STUDENTS_COLL));
    if (!studentsSnap.empty) {
      const cloudStudents = [];
      studentsSnap.forEach(d => cloudStudents.push(d.data()));
      isApplyingCloudUpdate = true;
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(cloudStudents));
      isApplyingCloudUpdate = false;
      notifyDataSynced('students');
    } else {
      // Cloud has 0 students: ensure local cache is clean as well
      isApplyingCloudUpdate = true;
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify([]));
      isApplyingCloudUpdate = false;
      notifyDataSynced('students');
    }

    // C. Requests
    const reqSnap = await getDocs(collection(db, REQUESTS_COLL));
    if (!reqSnap.empty) {
      const cloudReqs = [];
      reqSnap.forEach(d => cloudReqs.push(d.data()));
      isApplyingCloudUpdate = true;
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(cloudReqs));
      isApplyingCloudUpdate = false;
      notifyDataSynced('requests');
    }

    // D. Feedbacks
    const fbSnap = await getDocs(collection(db, FEEDBACKS_COLL));
    if (!fbSnap.empty) {
      const cloudFbs = [];
      fbSnap.forEach(d => cloudFbs.push(d.data()));
      isApplyingCloudUpdate = true;
      localStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(cloudFbs));
      isApplyingCloudUpdate = false;
      notifyDataSynced('feedbacks');
    }

    // E. Admin
    const adminSnap = await getDoc(doc(db, CONFIG_COLL, ADMIN_DOC));
    if (adminSnap.exists() && adminSnap.data()) {
      isApplyingCloudUpdate = true;
      localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(adminSnap.data()));
      isApplyingCloudUpdate = false;
      notifyDataSynced('admin');
    } else {
      const localAdminRaw = localStorage.getItem(STORAGE_KEY_ADMIN);
      if (localAdminRaw) {
        pushAdminProfileToFirestore(JSON.parse(localAdminRaw));
      }
    }
  } catch (err) {
    console.warn('Initial cloud hydration note (offline/fallback mode active):', err.message);
  }

  // --- 2. Attach Real-time Listeners (Once) ---
  if (!isListenersAttached) {
    isListenersAttached = true;

    try {
      // Real-time Seats Listener
      onSnapshot(doc(db, CONFIG_COLL, SEATS_DOC), (snap) => {
        if (snap.exists() && Array.isArray(snap.data()?.seats)) {
          isApplyingCloudUpdate = true;
          localStorage.setItem(STORAGE_KEY_SEATS, JSON.stringify(snap.data().seats));
          isApplyingCloudUpdate = false;
          notifyDataSynced('seats');
        }
      }, (err) => console.warn('Seats realtime listener warning:', err.message));

      // Real-time Students Listener
      onSnapshot(collection(db, STUDENTS_COLL), (snap) => {
        const list = [];
        snap.forEach(d => list.push(d.data()));
        isApplyingCloudUpdate = true;
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(list));
        isApplyingCloudUpdate = false;
        notifyDataSynced('students');
      }, (err) => console.warn('Students realtime listener warning:', err.message));

      // Real-time Requests Listener
      onSnapshot(collection(db, REQUESTS_COLL), (snap) => {
        const list = [];
        snap.forEach(d => list.push(d.data()));
        isApplyingCloudUpdate = true;
        localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(list));
        isApplyingCloudUpdate = false;
        notifyDataSynced('requests');
      }, (err) => console.warn('Requests realtime listener warning:', err.message));

      // Real-time Feedbacks Listener
      onSnapshot(collection(db, FEEDBACKS_COLL), (snap) => {
        const list = [];
        snap.forEach(d => list.push(d.data()));
        isApplyingCloudUpdate = true;
        localStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(list));
        isApplyingCloudUpdate = false;
        notifyDataSynced('feedbacks');
      }, (err) => console.warn('Feedbacks realtime listener warning:', err.message));

    } catch (err) {
      console.warn('Firestore realtime listeners setup note:', err.message);
    }
  }
}
