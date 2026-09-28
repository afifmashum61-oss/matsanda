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
  if (!data) {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
    syncClassesToCloud(INITIAL_CLASSES);
    return INITIAL_CLASSES;
  }
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
      syncClassesToCloud(updatedStored);
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

export const getStudents = () => {
  const data = localStorage.getItem(KEYS.STUDENTS);
  if (!data) {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    syncStudentsToCloud(INITIAL_STUDENTS);
    return INITIAL_STUDENTS;
  }
  try {
    return JSON.parse(data);
  } catch (err) {
    return INITIAL_STUDENTS;
  }
};

export const saveStudents = (students) => {
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  syncStudentsToCloud(students);
};

export const getAttendance = () => {
  const data = localStorage.getItem(KEYS.ATTENDANCE);
  return data ? JSON.parse(data) : INITIAL_ATTENDANCE;
};

export const saveAttendance = (records, targetDate) => {
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  syncAttendanceToCloud(records, targetDate);
};

export const resetDataToDefault = () => {
  localStorage.setItem(KEYS.SCHOOL, JSON.stringify(INITIAL_SCHOOL_PROFILE));
  localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));

  syncSchoolProfileToCloud(INITIAL_SCHOOL_PROFILE);
  syncClassesToCloud(INITIAL_CLASSES);
  syncStudentsToCloud(INITIAL_STUDENTS);
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
