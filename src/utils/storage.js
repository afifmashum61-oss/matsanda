import { INITIAL_SCHOOL_PROFILE, INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_ATTENDANCE } from '../data/initialData';
import { 
  syncSchoolProfileToCloud, 
  syncClassesToCloud, 
  syncStudentsToCloud, 
  syncAttendanceToCloud 
} from '../firebase';

const KEYS = {
  SCHOOL: 'mts_school_profile',
  CLASSES: 'mts_classes',
  STUDENTS: 'mts_students',
  ATTENDANCE: 'mts_attendance',
};

export const getSchoolProfile = () => {
  const data = localStorage.getItem(KEYS.SCHOOL);
  if (!data) return INITIAL_SCHOOL_PROFILE;
  try {
    const profile = JSON.parse(data);
    if (profile.tahunAjaran === '2025/2026') {
      profile.tahunAjaran = '2026/2027';
      localStorage.setItem(KEYS.SCHOOL, JSON.stringify(profile));
    }
    return profile;
  } catch (err) {
    return INITIAL_SCHOOL_PROFILE;
  }
};

export const saveSchoolProfile = (profile) => {
  localStorage.setItem(KEYS.SCHOOL, JSON.stringify(profile));
  syncSchoolProfileToCloud(profile);
};

export const getClasses = () => {
  const data = localStorage.getItem(KEYS.CLASSES);
  if (!data) return INITIAL_CLASSES;
  try {
    const stored = JSON.parse(data);
    let updated = false;
    const updatedStored = stored.map(c => {
      const init = INITIAL_CLASSES.find(ic => ic.id === c.id);
      if (init && (c.waliKelas !== init.waliKelas || c.nama !== init.nama)) {
        updated = true;
        return { ...c, waliKelas: init.waliKelas, nama: init.nama };
      }
      return c;
    });

    if (updated) {
      localStorage.setItem(KEYS.CLASSES, JSON.stringify(updatedStored));
    }
    return updatedStored;
  } catch (err) {
    return INITIAL_CLASSES;
  }
};

export const saveClasses = (classes) => {
  localStorage.setItem(KEYS.CLASSES, JSON.stringify(classes));
  syncClassesToCloud(classes);
};

export const sortStudentsAlphabetically = (studentsList) => {
  if (!Array.isArray(studentsList)) return [];
  return [...studentsList].sort((a, b) => {
    // 1. Urutkan berdasarkan Kelas terlebih dahulu (7A, 7B, ... 9E)
    const classA = (a.kelas || '').trim();
    const classB = (b.kelas || '').trim();
    const classComp = classA.localeCompare(classB, 'id', { numeric: true, sensitivity: 'base' });
    if (classComp !== 0) return classComp;

    // 2. Urutkan berdasarkan Abjad Nama Siswa (A s/d Z)
    const nameA = (a.nama || '').trim();
    const nameB = (b.nama || '').trim();
    const nameComp = nameA.localeCompare(nameB, 'id', { sensitivity: 'base' });
    if (nameComp !== 0) return nameComp;

    // 3. Fallback jika nama sama: urutkan berdasarkan NIS
    const nisA = (a.nis || '').trim();
    const nisB = (b.nis || '').trim();
    return nisA.localeCompare(nisB, 'id', { numeric: true });
  });
};

export const getStudents = () => {
  const data = localStorage.getItem(KEYS.STUDENTS);
  if (!data) return sortStudentsAlphabetically(INITIAL_STUDENTS);
  try {
    return sortStudentsAlphabetically(JSON.parse(data));
  } catch (err) {
    return sortStudentsAlphabetically(INITIAL_STUDENTS);
  }
};

export const saveStudents = (students) => {
  const sorted = sortStudentsAlphabetically(students);
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(sorted));
  syncStudentsToCloud(sorted);
};

export const getAttendance = () => {
  const data = localStorage.getItem(KEYS.ATTENDANCE);
  return data ? JSON.parse(data) : INITIAL_ATTENDANCE;
};

export const saveAttendance = (records, targetDate, classId) => {
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  syncAttendanceToCloud(records, classId, targetDate);
};

export const resetDataToDefault = () => {
  const sortedStudents = sortStudentsAlphabetically(INITIAL_STUDENTS);
  localStorage.setItem(KEYS.SCHOOL, JSON.stringify(INITIAL_SCHOOL_PROFILE));
  localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(sortedStudents));
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));

  syncSchoolProfileToCloud(INITIAL_SCHOOL_PROFILE);
  syncClassesToCloud(INITIAL_CLASSES);
  syncStudentsToCloud(sortedStudents);
  syncAttendanceToCloud(INITIAL_ATTENDANCE);
};

export const exportFullBackup = () => {
  const backup = {
    schoolProfile: getSchoolProfile(),
    classes: getClasses(),
    students: getStudents(),
    attendance: getAttendance(),
    exportedAt: new Date().toISOString()
  };
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `backup-absensi-mts-darussalam-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};
