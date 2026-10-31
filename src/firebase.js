import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyClUXkEbAywmCO5BKGbLlXduOGHwlrEwZ0",
  authDomain: "amba-library.firebaseapp.com",
  projectId: "amba-library",
  storageBucket: "amba-library.firebasestorage.app",
  messagingSenderId: "139275840948",
  appId: "1:139275840948:web:6820d7773d8bc204ca16e1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
