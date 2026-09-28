import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc, setDoc, getDoc, collection, getDocs, onSnapshot 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_wTNntZUVtyXVMdakfCXRGrwurIh_08",
  authDomain: "matsanda.firebaseapp.com",
  projectId: "matsanda",
  storageBucket: "matsanda.firebasestorage.app",
  messagingSenderId: "1066327263038",
  appId: "1:1066327263038:web:1cf8ed11dd87be1573ce6f",
  measurementId: "G-6C4PWQZY1W"
};

// Initialize Firebase with multi-tab IndexedDB offline persistence
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Helper functions for cloud synchronization
export const syncSchoolProfileToCloud = async (profile) => {
  try {
    await setDoc(doc(db, "school", "profile"), profile);
  } catch (err) {
    console.warn("Cloud sync warning (profile):", err);
  }
};

export const syncClassesToCloud = async (classes) => {
  try {
    await setDoc(doc(db, "school", "classes"), { list: classes });
  } catch (err) {
    console.warn("Cloud sync warning (classes):", err);
  }
};

export const syncStudentsToCloud = async (students) => {
  try {
    await setDoc(doc(db, "school", "students"), { list: students });
  } catch (err) {
    console.warn("Cloud sync warning (students):", err);
  }
};

export const syncAttendanceToCloud = async (attendance) => {
  try {
    await setDoc(doc(db, "school", "attendance"), { list: attendance });
  } catch (err) {
    console.warn("Cloud sync warning (attendance):", err);
  }
};

// Real-time subscriptions for multi-device sync
export const subscribeSchoolProfile = (onUpdate, initialData) => {
  return onSnapshot(doc(db, "school", "profile"), (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data());
    } else if (initialData) {
      syncSchoolProfileToCloud(initialData);
    }
  }, (err) => console.warn("Realtime error (profile):", err));
};

export const subscribeClasses = (onUpdate, initialData) => {
  return onSnapshot(doc(db, "school", "classes"), (docSnap) => {
    if (docSnap.exists() && Array.isArray(docSnap.data().list)) {
      onUpdate(docSnap.data().list);
    } else if (initialData) {
      syncClassesToCloud(initialData);
    }
  }, (err) => console.warn("Realtime error (classes):", err));
};

export const subscribeStudents = (onUpdate, initialData) => {
  return onSnapshot(doc(db, "school", "students"), (docSnap) => {
    if (docSnap.exists() && Array.isArray(docSnap.data().list)) {
      onUpdate(docSnap.data().list);
    } else if (initialData) {
      syncStudentsToCloud(initialData);
    }
  }, (err) => console.warn("Realtime error (students):", err));
};

export const subscribeAttendance = (onUpdate, initialData) => {
  return onSnapshot(doc(db, "school", "attendance"), (docSnap) => {
    if (docSnap.exists() && Array.isArray(docSnap.data().list)) {
      onUpdate(docSnap.data().list);
    } else if (initialData) {
      syncAttendanceToCloud(initialData);
    }
  }, (err) => console.warn("Realtime error (attendance):", err));
};
