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

export const syncAttendanceToCloud = async (attendance, targetDate) => {
  try {
    // 1. Sync full master list for fast global realtime app sync
    await setDoc(doc(db, "school", "attendance"), { list: attendance });

    // 2. Save structured daily attendance documents in 'daily_attendance' collection
    if (targetDate) {
      const dayRecords = attendance.filter(a => a.date === targetDate);
      if (dayRecords.length > 0) {
        const stats = {
          hadir: dayRecords.filter(r => r.status === 'H').length,
          sakit: dayRecords.filter(r => r.status === 'S').length,
          izin: dayRecords.filter(r => r.status === 'I').length,
          alpha: dayRecords.filter(r => r.status === 'A').length,
        };
        await setDoc(doc(db, "daily_attendance", targetDate), {
          date: targetDate,
          updatedAt: new Date().toISOString(),
          stats,
          totalStudents: dayRecords.length,
          records: dayRecords
        }, { merge: true });
      }
    } else {
      // Group all attendance records by date and save each date neatly to Firestore
      const recordsByDate = {};
      attendance.forEach(rec => {
        if (!rec.date) return;
        if (!recordsByDate[rec.date]) recordsByDate[rec.date] = [];
        recordsByDate[rec.date].push(rec);
      });

      for (const [dStr, dayRecords] of Object.entries(recordsByDate)) {
        const stats = {
          hadir: dayRecords.filter(r => r.status === 'H').length,
          sakit: dayRecords.filter(r => r.status === 'S').length,
          izin: dayRecords.filter(r => r.status === 'I').length,
          alpha: dayRecords.filter(r => r.status === 'A').length,
        };
        await setDoc(doc(db, "daily_attendance", dStr), {
          date: dStr,
          updatedAt: new Date().toISOString(),
          stats,
          totalStudents: dayRecords.length,
          records: dayRecords
        }, { merge: true });
      }
    }
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
