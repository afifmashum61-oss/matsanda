import { INITIAL_SCHOOL_PROFILE, INITIAL_CLASSES, INITIAL_STUDENTS, INITIAL_ATTENDANCE } from '../data/initialData';

const KEYS = {
  SCHOOL: 'mts_school_profile',
  CLASSES: 'mts_classes',
  STUDENTS: 'mts_students',
  ATTENDANCE: 'mts_attendance',
};

export const getSchoolProfile = () => {
  const data = localStorage.getItem(KEYS.SCHOOL);
  return data ? JSON.parse(data) : INITIAL_SCHOOL_PROFILE;
};

export const saveSchoolProfile = (profile) => {
  localStorage.setItem(KEYS.SCHOOL, JSON.stringify(profile));
};

export const getClasses = () => {
  const data = localStorage.getItem(KEYS.CLASSES);
  if (!data) return INITIAL_CLASSES;
  try {
    const stored = JSON.parse(data);
    const existingIds = stored.map(c => c.id);
    const missing = INITIAL_CLASSES.filter(c => !existingIds.includes(c.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      localStorage.setItem(KEYS.CLASSES, JSON.stringify(merged));
      return merged;
    }
    return stored;
  } catch (err) {
    return INITIAL_CLASSES;
  }
};

export const saveClasses = (classes) => {
  localStorage.setItem(KEYS.CLASSES, JSON.stringify(classes));
};

export const getStudents = () => {
  const data = localStorage.getItem(KEYS.STUDENTS);
  if (!data) return INITIAL_STUDENTS;
  try {
    const stored = JSON.parse(data);
    const existingIds = stored.map(s => s.id);
    const missing = INITIAL_STUDENTS.filter(s => !existingIds.includes(s.id));
    if (missing.length > 0) {
      const merged = [...stored, ...missing];
      localStorage.setItem(KEYS.STUDENTS, JSON.stringify(merged));
      return merged;
    }
    return stored;
  } catch (err) {
    return INITIAL_STUDENTS;
  }
};

export const saveStudents = (students) => {
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
};

export const getAttendance = () => {
  const data = localStorage.getItem(KEYS.ATTENDANCE);
  return data ? JSON.parse(data) : INITIAL_ATTENDANCE;
};

export const saveAttendance = (records) => {
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
};

export const resetDataToDefault = () => {
  localStorage.setItem(KEYS.SCHOOL, JSON.stringify(INITIAL_SCHOOL_PROFILE));
  localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  localStorage.setItem(KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
  localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(INITIAL_ATTENDANCE));
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
