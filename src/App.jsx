import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileText, 
  Settings, 
  Menu, 
  X,
  School,
  ChevronRight
} from 'lucide-react';

import Dashboard from './components/Dashboard';
import InputAbsensi from './components/InputAbsensi';
import DataSiswa from './components/DataSiswa';
import LaporanAbsensi from './components/LaporanAbsensi';
import PengaturanSekolah from './components/PengaturanSekolah';

import { 
  getSchoolProfile, saveSchoolProfile,
  getClasses, saveClasses,
  getStudents, saveStudents,
  getAttendance, saveAttendance
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Persistent States
  const [schoolProfile, setSchoolProfileState] = useState(getSchoolProfile);
  const [classes, setClassesState] = useState(getClasses);
  const [students, setStudentsState] = useState(getStudents);
  const [attendance, setAttendanceState] = useState(getAttendance);

  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '7A');

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
    setStudentsState(newStudents);
    saveStudents(newStudents);
  };

  const handleSaveAttendance = (newRecords, classId, dateStr) => {
    const studentIds = newRecords.map(r => r.studentId);
    const filteredExisting = attendance.filter(
      a => !(a.date === dateStr && studentIds.includes(a.studentId))
    );
    const updated = [...filteredExisting, ...newRecords];
    setAttendanceState(updated);
    saveAttendance(updated);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Ringkasan kehadiran & statistik' },
    { id: 'input', label: 'Input Absensi', icon: UserCheck, desc: 'Form absensi harian per kelas' },
    { id: 'siswa', label: 'Data Siswa', icon: Users, desc: 'Kelola data siswa & import Excel' },
    { id: 'laporan', label: 'Rekap & Laporan', icon: FileText, desc: 'Rekap bulanan & cetak PDF' },
    { id: 'pengaturan', label: 'Pengaturan Sekolah', icon: Settings, desc: 'Identitas sekolah & backup data' },
  ];

  const activeNavItem = navItems.find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-emerald-900 text-white border-b border-emerald-800 sticky top-0 z-40 shadow-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Left: Hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 hover:text-white transition flex items-center gap-2 border border-emerald-700/50 shadow-sm focus:outline-none"
              title="Buka Navigasi Utama"
            >
              {isMenuOpen ? <X className="w-5 h-5 text-emerald-200" /> : <Menu className="w-5 h-5 text-emerald-200" />}
              <span className="text-xs font-bold tracking-wide uppercase pr-0.5">Menu</span>
            </button>

            <div className="bg-white p-1 rounded-lg shadow-sm flex items-center justify-center">
              <img src="/logo.png" alt="Logo MTs Darussalam" className="w-8 h-8 object-contain" />
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

          {/* Right: Academic Info */}
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="bg-emerald-800/80 text-emerald-100 font-semibold px-2.5 py-1 rounded-full border border-emerald-700/50 text-[11px]">
                {activeNavItem?.label}
              </span>
              <p className="text-[11px] text-emerald-300 mt-1 hidden sm:block">
                T.A {schoolProfile.tahunAjaran} ({schoolProfile.semester})
              </p>
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
                        setActiveTab(item.id);
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
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            />
          )}
        </main>
      </div>

      {/* Footer (Hidden during print) */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4 text-center text-xs text-slate-500 no-print">
        <p>© {new Date().getFullYear()} MTs Darussalam Ngesong Jombang. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
