import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_wTNntZUVtyXVMdakfCXRGrwurIh_08",
  authDomain: "matsanda.firebaseapp.com",
  projectId: "matsanda",
  storageBucket: "matsanda.firebasestorage.app",
  messagingSenderId: "1066327263038",
  appId: "1:1066327263038:web:1cf8ed11dd87be1573ce6f",
  measurementId: "G-6C4PWQZY1W"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

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
