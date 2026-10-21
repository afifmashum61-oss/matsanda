import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileText, 
  Settings, 
  Menu, 
  X,
  School,
  ChevronRight,
  Lock,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Award
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import InputAbsensi from './components/InputAbsensi';
import DataSiswa from './components/DataSiswa';
import LaporanAbsensi from './components/LaporanAbsensi';
import PengaturanSekolah from './components/PengaturanSekolah';
import RekapNilai from './components/RekapNilai';

import { 
  getSchoolProfile, saveSchoolProfile,
  getClasses, saveClasses,
  getStudents, saveStudents, sortStudentsAlphabetically,
  getAttendance, saveAttendance,
  getGrades, saveGradeForClassSubject
} from './utils/storage';

import {
  subscribeSchoolProfile,
  subscribeClasses,
  subscribeStudents,
  subscribeAttendance,
  syncAttendanceToCloud,
  subscribeGrades,
  syncGradesToCloud
} from './firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persistent States
  const [schoolProfile, setSchoolProfileState] = useState(getSchoolProfile);
  const [classes, setClassesState] = useState(getClasses);
  const [students, setStudentsState] = useState(() => sortStudentsAlphabetically(getStudents()));
  const [attendance, setAttendanceState] = useState(getAttendance);
  const [grades, setGradesState] = useState(getGrades);

  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '7A');

  // Admin PIN Protection State
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinText, setShowPinText] = useState(false);

  const handleSelectTab = (tabId) => {
    if (tabId === 'pengaturan' && !isAdminUnlocked) {
      setPinInput('');
      setPinError('');
      setShowAdminPinModal(true);
    } else {
      setActiveTab(tabId);
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    const correctPin = schoolProfile?.adminPin || '1234';
    if (pinInput.trim() === correctPin) {
      setIsAdminUnlocked(true);
      setShowAdminPinModal(false);
      setActiveTab('pengaturan');
      setPinError('');
    } else {
      setPinError('PIN Admin / Password salah! Silakan periksa kembali.');
    }
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    setActiveTab('dashboard');
  };

  // Real-time Firestore Listeners across all devices
  useEffect(() => {
    const unsubProfile = subscribeSchoolProfile((profile) => {
      setSchoolProfileState(profile);
      localStorage.setItem('mts_school_profile', JSON.stringify(profile));
      setIsCloudConnected(true);
    });

    const unsubClasses = subscribeClasses((classList) => {
      setClassesState(classList);
      localStorage.setItem('mts_classes', JSON.stringify(classList));
      setIsCloudConnected(true);
    });

    const unsubStudents = subscribeStudents((studentList) => {
      const sorted = sortStudentsAlphabetically(studentList);
      setStudentsState(sorted);
      localStorage.setItem('mts_students', JSON.stringify(sorted));
      setIsCloudConnected(true);
    });

    const unsubAttendance = subscribeAttendance((attendanceList) => {
      setAttendanceState(attendanceList);
      localStorage.setItem('mts_attendance', JSON.stringify(attendanceList));
      setIsCloudConnected(true);
    });

    const unsubGrades = subscribeGrades((gradesMap) => {
      setGradesState(gradesMap);
      localStorage.setItem('mts_grades', JSON.stringify(gradesMap));
      setIsCloudConnected(true);
    });

    return () => {
      unsubProfile();
      unsubClasses();
      unsubStudents();
      unsubAttendance();
      unsubGrades();
    };
  }, []);

  // Handlers for state update + LocalStorage persistence
  const handleSaveSchoolProfile = (profile) => {
    setSchoolProfileState(profile);
    saveSchoolProfile(profile);
  };

  const handleSaveClasses = (newClasses) => {
    setClassesState(newClasses);
    saveClasses(newClasses);
  };

  const handleSaveStudents = (newStudents) => {
    const sorted = sortStudentsAlphabetically(newStudents);
    setStudentsState(sorted);
    saveStudents(sorted);
  };

  const handleSaveAttendance = async (newRecords, classId, dateStr) => {
    // 1. Identify all student IDs that belong to this class
    const classStudentIds = new Set([
      ...students.filter(s => s.kelas === classId).map(s => s.id),
      ...newRecords.map(r => r.studentId)
    ]);

    // Keys of the records being updated in this batch: `${studentId}_${date}_${jamKe}`
    const newKeys = new Set(newRecords.map(r => `${r.studentId}_${r.date}_${r.jamKe || 1}`));

    // 2. Class records for this date: preserve existing records for other JP of this class, and add newRecords
    const existingForClass = attendance.filter(a => 
      a.date === dateStr &&
      classStudentIds.has(a.studentId) &&
      !newKeys.has(`${a.studentId}_${a.date}_${a.jamKe || 1}`)
    );
    const fullClassRecordsForDate = [...existingForClass, ...newRecords];

    // 3. Update global local attendance state (smart deduplicate/merge)
    const filteredGlobal = attendance.filter(a => !newKeys.has(`${a.studentId}_${a.date}_${a.jamKe || 1}`));
    const updatedGlobal = [...filteredGlobal, ...newRecords];
    setAttendanceState(updatedGlobal);
    localStorage.setItem('mts_attendance', JSON.stringify(updatedGlobal));

    // 4. Atomically sync ONLY this class's records for this date to Firestore (concurrent multi-device safe)
    await syncAttendanceToCloud(fullClassRecordsForDate, classId, dateStr);
    return true;
  };

  const handleSaveGrade = (classId, mapelId, semester, gradeData) => {
    const updated = saveGradeForClassSubject(classId, mapelId, semester, gradeData);
    setGradesState(updated);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Beranda', icon: LayoutDashboard, desc: 'Ringkasan kehadiran & statistik' },
    { id: 'input', label: 'Input Absensi', shortLabel: 'Absensi', icon: UserCheck, desc: 'Form absensi harian per kelas' },
    { id: 'nilai', label: 'Rekapitulasi Nilai', shortLabel: 'Nilai', icon: Award, desc: 'Ledger nilai PH, remidi & ketrampilan' },
    { id: 'siswa', label: 'Data Siswa', shortLabel: 'Siswa', icon: Users, desc: 'Kelola data siswa & import Excel' },
    { id: 'laporan', label: 'Rekap & Laporan', shortLabel: 'Laporan', icon: FileText, desc: 'Rekap bulanan & cetak PDF' },
    { id: 'pengaturan', label: 'Pengaturan Sekolah', shortLabel: 'Pengaturan', icon: Settings, desc: 'Identitas sekolah & backup data' },
  ];

  const activeNavItem = navItems.find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-emerald-900 text-white border-b border-emerald-800 sticky top-0 z-40 shadow-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Hamburger (Desktop) & Logo / Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hidden md:flex p-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white transition items-center justify-center border border-emerald-700/50 shadow-sm focus:outline-none"
              title="Buka Navigasi Utama"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-emerald-200" /> : <Menu className="w-5 h-5 text-emerald-200" />}
            </button>
            
            {/* Mobile Brand Logo */}
            <div className="bg-white/10 p-1 rounded-lg border border-white/20 flex items-center justify-center md:hidden flex-shrink-0 shadow-xs">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain drop-shadow-xs" />
            </div>

            <div>
              <h1 className="font-bold text-base md:text-lg leading-tight tracking-tight text-emerald-50">
                {schoolProfile.nama}
              </h1>
              <p className="text-[11px] text-emerald-300 font-medium hidden sm:block">
                Sistem Informasi Absensi Digital • Ngesong - Jombang
              </p>
            </div>
          </div>

          {/* Right: School Logo (Desktop & Tablet) */}
          <div className="hidden md:flex items-center gap-2.5">
            <div className="bg-white/10 p-1.5 rounded-xl border border-white/20 backdrop-blur-xs flex items-center justify-center shadow-xs">
              <img src="/logo.png" alt="Logo MTs Darussalam" className="w-7 h-7 object-contain drop-shadow-sm" />
            </div>
          </div>

        </div>
      </header>

      {/* Hamburger Navigation Drawer Modal (Slide-Over from Left) */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex no-print animate-fadeIn"
          onClick={() => setIsMenuOpen(false)}
        >
          <div 
            className="w-80 max-w-[85vw] bg-white h-full p-5 flex flex-col justify-between shadow-2xl animate-slideRight"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-4">
              {/* Header Drawer */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="bg-white p-1 rounded-lg shadow border border-slate-200">
                    <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900 leading-tight">Navigasi Utama</h2>
                    <p className="text-[11px] text-slate-500">MTs Darussalam Ngesong</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Menu List */}
              <div className="space-y-1.5 pt-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleSelectTab(item.id);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition text-left ${
                        isActive
                          ? 'bg-emerald-700 text-white font-bold shadow-md shadow-emerald-900/10'
                          : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-tight">{item.label}</p>
                          <p className={`text-[11px] font-normal ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 opacity-50 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer Drawer */}
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700">MTs Darussalam Ngesong Jombang</p>
              <p className="text-[11px] text-slate-400">Sistem Absensi Digital v1.0 • Offline Ready</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Full Width */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        <main className="w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              students={students}
              attendance={attendance}
              classes={classes}
              schoolProfile={schoolProfile}
              setActiveTab={setActiveTab}
              setSelectedClass={setSelectedClass}
            />
          )}

          {activeTab === 'input' && (
            <InputAbsensi
              classes={classes}
              students={students}
              attendance={attendance}
              onSaveAttendance={handleSaveAttendance}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
            />
          )}

          {activeTab === 'nilai' && (
            <RekapNilai
              classes={classes}
              students={students}
              schoolProfile={schoolProfile}
              allGrades={grades}
              onSaveGrade={handleSaveGrade}
            />
          )}

          {activeTab === 'siswa' && (
            <DataSiswa
              students={students}
              classes={classes}
              onSaveStudents={handleSaveStudents}
            />
          )}

          {activeTab === 'laporan' && (
            <LaporanAbsensi
              students={students}
              attendance={attendance}
              classes={classes}
              schoolProfile={schoolProfile}
            />
          )}

          {activeTab === 'pengaturan' && (
            <PengaturanSekolah
              schoolProfile={schoolProfile}
              onSaveProfile={handleSaveSchoolProfile}
              classes={classes}
              onSaveClasses={handleSaveClasses}
              onLockAdmin={handleLockAdmin}
            />
          )}
        </main>
      </div>

      {/* Modal Lock / Input PIN Admin */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Akses Pengaturan Terkunci</h3>
                  <p className="text-xs text-slate-500">Masukkan PIN Admin untuk membuka pengaturan</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminPinModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pinError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">PIN Admin / Password</label>
                <div className="relative">
                  <input
                    type={showPinText ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder="Masukkan PIN Admin..."
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 pr-10 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none tracking-wider"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinText(!showPinText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPinText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminPinModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Buka Pengaturan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer (Hidden during print) */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-center text-xs text-slate-500 no-print mb-16 md:mb-0">
        <p>© {new Date().getFullYear()} MTs Darussalam Ngesong Jombang. All Rights Reserved.</p>
      </footer>

      {/* Mobile Bottom Navigation Bar (Docked at bottom of screen on mobile) */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] no-print"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Navigasi Utama Ponsel"
      >
        <div className="grid grid-cols-6 items-center h-16 max-w-xl mx-auto px-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all duration-200 relative group ${
                  isActive ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {/* Active Indicator Top Pill */}
                {isActive && (
                  <span className="absolute top-0 w-6 h-1 bg-emerald-600 rounded-full" />
                )}

                <div className={`p-1 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 scale-105 shadow-xs' 
                    : 'group-hover:bg-slate-50'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>

                <span className={`text-[9px] leading-tight tracking-tight mt-0.5 transition-all truncate max-w-full px-0.5 ${
                  isActive 
                    ? 'font-bold text-emerald-800' 
                    : 'font-medium text-slate-500'
                }`}>
                  {item.shortLabel || item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
