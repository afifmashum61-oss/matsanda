import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  initializeFirestore, 
  getFirestore,
  persistentLocalCache, 
  persistentMultipleTabManager,
  doc, setDoc, getDoc, collection, getDocs, onSnapshot 
} from "firebase/firestore";
import { INITIAL_SCHOOL_PROFILE, INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_ATTENDANCE } from './data/initialData';

const firebaseConfig = {
  apiKey: "AIzaSyC_wTNntZUVtyXVMdakfCXRGrwurIh_08",
  authDomain: "matsanda.firebaseapp.com",
  projectId: "matsanda",
  storageBucket: "matsanda.firebasestorage.app",
  messagingSenderId: "1066327263038",
  appId: "1:1066327263038:web:1cf8ed11dd87be1573ce6f",
  measurementId: "G-6C4PWQZY1W"
};

// Initialize Firebase with multi-tab IndexedDB offline persistence & safe fallback
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

// Helper functions for cloud synchronization
export const syncSchoolProfileToCloud = async (profile) => {
  try {
    await setDoc(doc(db, "school", "profile"), profile);
    return true;
  } catch (err) {
    console.warn("Cloud sync warning (profile):", err);
    return false;
  }
};

export const syncClassesToCloud = async (classes) => {
  try {
    await setDoc(doc(db, "school", "classes"), { list: classes });
    return true;
  } catch (err) {
    console.warn("Cloud sync warning (classes):", err);
    return false;
  }
};

export const syncStudentsToCloud = async (students) => {
  try {
    await setDoc(doc(db, "school", "students"), { list: students });
    return true;
  } catch (err) {
    console.warn("Cloud sync warning (students):", err);
    return false;
  }
};

export const syncAttendanceToCloud = async (records, arg2, arg3) => {
  try {
    if (!records || !Array.isArray(records) || records.length === 0) return true;

    let classId = null;
    let dateStr = null;

    if (arg2 && typeof arg2 === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(arg2)) {
        dateStr = arg2;
        classId = (arg3 && typeof arg3 === 'string' && !/^\d{4}-\d{2}-\d{2}$/.test(arg3)) ? arg3 : null;
      } else {
        classId = arg2;
        dateStr = (arg3 && typeof arg3 === 'string') ? arg3 : null;
      }
    }

    // 1. Concurrent Multi-Device Safe: Save specific class records under classes[classId]
    if (dateStr && classId) {
      await setDoc(doc(db, "daily_attendance", dateStr), {
        date: dateStr,
        updatedAt: new Date().toISOString(),
        classes: {
          [classId]: records
        }
      }, { merge: true });
      return true;
    }

    // 2. If dateStr is provided without classId, partition records by class if possible
    if (dateStr) {
      const classesMap = {};
      records.forEach(r => {
        const c = r.kelas || 'all';
        if (!classesMap[c]) classesMap[c] = [];
        classesMap[c].push(r);
      });
      await setDoc(doc(db, "daily_attendance", dateStr), {
        date: dateStr,
        updatedAt: new Date().toISOString(),
        classes: classesMap
      }, { merge: true });
      return true;
    }

    // 3. Fallback: Full sync partitioned cleanly by date and class into daily_attendance
    const recordsByDate = {};
    records.forEach(rec => {
      if (!rec.date) return;
      if (!recordsByDate[rec.date]) recordsByDate[rec.date] = [];
      recordsByDate[rec.date].push(rec);
    });

    for (const [dStr, dayRecords] of Object.entries(recordsByDate)) {
      const classesMap = {};
      dayRecords.forEach(r => {
        const c = r.kelas || 'all';
        if (!classesMap[c]) classesMap[c] = [];
        classesMap[c].push(r);
      });
      await setDoc(doc(db, "daily_attendance", dStr), {
        date: dStr,
        updatedAt: new Date().toISOString(),
        classes: classesMap
      }, { merge: true });
    }
    return true;
  } catch (err) {
    console.warn("Cloud sync warning (attendance):", err);
    throw err;
  }
};

// Real-time subscriptions for instantaneous multi-device sync
export const subscribeSchoolProfile = (onUpdate) => {
  return onSnapshot(doc(db, "school", "profile"), (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data());
    } else {
      syncSchoolProfileToCloud(INITIAL_SCHOOL_PROFILE);
    }
  }, (err) => console.warn("Realtime error (profile):", err));
};

export const subscribeClasses = (onUpdate) => {
  return onSnapshot(doc(db, "school", "classes"), (docSnap) => {
    if (docSnap.exists() && Array.isArray(docSnap.data().list)) {
      onUpdate(docSnap.data().list);
    } else {
      syncClassesToCloud(INITIAL_CLASSES);
    }
  }, (err) => console.warn("Realtime error (classes):", err));
};

export const subscribeStudents = (onUpdate) => {
  return onSnapshot(doc(db, "school", "students"), (docSnap) => {
    if (docSnap.exists() && Array.isArray(docSnap.data().list)) {
      onUpdate(docSnap.data().list);
    } else {
      syncStudentsToCloud(INITIAL_STUDENTS);
    }
  }, (err) => console.warn("Realtime error (students):", err));
};

export const subscribeAttendance = (onUpdate) => {
  return onSnapshot(collection(db, "daily_attendance"), (querySnapshot) => {
    try {
      if (querySnapshot.empty) return;

      const allRecords = [];
      querySnapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (data.classes && typeof data.classes === 'object') {
          Object.values(data.classes).forEach(records => {
            if (Array.isArray(records)) {
              allRecords.push(...records);
            }
          });
        }
        if (Array.isArray(data.records)) {
          allRecords.push(...data.records);
        }
      });

      // Strict de-duplication by studentId + date + jamKe to ensure flawless consistency
      const recordMap = new Map();
      allRecords.forEach(r => {
        if (r && r.studentId && r.date) {
          const key = `${r.studentId}_${r.date}_${r.jamKe || 1}`;
          recordMap.set(key, r);
        }
      });

      const deduplicated = Array.from(recordMap.values());
      onUpdate(deduplicated);
    } catch (err) {
      console.warn("Realtime processing error (attendance):", err);
    }
  }, (err) => {
    console.warn("Realtime error (attendance):", err);
  });
};

// Sync grade ledger per class, subject, and semester to Firestore
export const syncGradesToCloud = async (classId, mapelId, semester, gradeData) => {
  try {
    if (!classId || !mapelId || !semester) return false;
    const docId = `${classId}_${mapelId}_${semester}`;
    await setDoc(doc(db, "grades", docId), {
      ...gradeData,
      classId,
      mapelId,
      semester,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    return true;
  } catch (err) {
    console.warn("Cloud sync warning (grades):", err);
    throw err;
  }
};

// Real-time listener for grades across all classes and subjects
export const subscribeGrades = (onUpdate) => {
  return onSnapshot(collection(db, "grades"), (querySnapshot) => {
    try {
      const gradesMap = {};
      querySnapshot.forEach(docSnap => {
        gradesMap[docSnap.id] = docSnap.data();
      });
      onUpdate(gradesMap);
    } catch (err) {
      console.warn("Realtime processing error (grades):", err);
    }
  }, (err) => {
    console.warn("Realtime error (grades):", err);
  });
};

