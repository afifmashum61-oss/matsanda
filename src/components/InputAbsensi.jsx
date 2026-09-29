import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Calendar, 
  Users, 
  Save, 
  CheckCheck, 
  Clock, 
  AlertCircle, 
  Search,
  Check,
  Zap
} from 'lucide-react';
import { JAM_PELAJARAN } from '../data/initialData';

export default function InputAbsensi({ 
  classes, 
  students, 
  attendance, 
  onSaveAttendance, 
  selectedClass, 
  setSelectedClass 
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Multi-select Jam Pelajaran IDs, e.g. [1, 2] or [3, 4]
  const [selectedJams, setSelectedJams] = useState([1, 2]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter students by selected class
  const classStudents = students.filter(s => s.kelas === selectedClass);
  const filteredStudents = classStudents.filter(s => 
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.nis.includes(searchTerm)
  );

  // Form state for current attendance records
  const [attendanceMap, setAttendanceMap] = useState({});

  // Primary JP for loading initial state (first selected JP)
  const primaryJam = selectedJams[0] || 1;

  // Load existing records for this class, date, & primary selected jamKe when parameters change
  useEffect(() => {
    const map = {};
    classStudents.forEach(s => {
      const existing = attendance.find(
        a => a.studentId === s.id && a.date === selectedDate && (a.jamKe === primaryJam || !a.jamKe)
      );
      if (existing) {
        map[s.id] = { status: existing.status, catatan: existing.catatan || '' };
      } else {
        map[s.id] = { status: 'Hadir', catatan: '' };
      }
    });
    setAttendanceMap(map);
  }, [selectedClass, selectedDate, primaryJam, students, attendance]);

  // Toggle individual Jam Pelajaran in multi-select list
  const toggleJamSelection = (jamId) => {
    if (selectedJams.includes(jamId)) {
      if (selectedJams.length > 1) {
        setSelectedJams(selectedJams.filter(id => id !== jamId));
      }
    } else {
      setSelectedJams([...selectedJams, jamId].sort((a, b) => a - b));
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleCatatanChange = (studentId, catatan) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        catatan
      }
    }));
  };

  const markAllHadir = () => {
    const newMap = { ...attendanceMap };
    classStudents.forEach(s => {
      newMap[s.id] = { ...newMap[s.id], status: 'Hadir' };
    });
    setAttendanceMap(newMap);
  };

  // Multi-Jam Pelajaran Save
  const handleSave = (e) => {
    e.preventDefault();
    const newRecords = [];

    // Save attendance for EVERY selected Jam Pelajaran at once!
    selectedJams.forEach(jamId => {
      Object.keys(attendanceMap).forEach(studentId => {
        newRecords.push({
          studentId,
          date: selectedDate,
          jamKe: jamId,
          status: attendanceMap[studentId]?.status || 'Hadir',
          catatan: attendanceMap[studentId]?.catatan || ''
        });
      });
    });

    onSaveAttendance(newRecords, selectedClass, selectedDate);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Stats calculation
  const values = Object.values(attendanceMap);
  const hadirCount = values.filter(v => v.status === 'Hadir').length;
  const sakitCount = values.filter(v => v.status === 'Sakit').length;
  const izinCount = values.filter(v => v.status === 'Izin').length;
  const alpaCount = values.filter(v => v.status === 'Alpa').length;

  const currentClassObj = classes.find(c => c.id === selectedClass);
  const selectedJamLabels = selectedJams.map(id => `Jam Ke-${id}`).join(', ');

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Form Absensi Siswa Multi-Jam Pelajaran</h1>
            <p className="text-xs text-slate-500">Bisa memilih lebih dari 1 Jam Pelajaran sekaligus untuk pengisian cepat dan praktis.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={markAllHadir}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold px-3 py-2.5 rounded-xl text-xs transition"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              Tandai Semua Hadir
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition"
            >
              <Save className="w-4 h-4" />
              Simpan {selectedJams.length} Jam Pelajaran
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              Berhasil menyimpan absensi Kelas {selectedClass} untuk <strong>{selectedJams.length} Jam Pelajaran ({selectedJamLabels})</strong> sekaligus pada tanggal {selectedDate}!
            </span>
          </div>
        )}

        {/* Inputs row with separated Kelas & Wali Kelas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Wali Kelas</label>
            <div className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 truncate flex items-center h-[38px]">
              {currentClassObj?.waliKelas || '-'}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal Absensi</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Cari Siswa</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama/NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Multi-Select Jam Pelajaran Pills Bar (1 - 8) */}
        <div className="pt-2 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              Pilih Jam Pelajaran (Bisa pilih lebih dari 1):
            </label>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
            {JAM_PELAJARAN.map(j => {
              const isSelected = selectedJams.includes(j.id);
              return (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => toggleJamSelection(j.id)}
                  className={`p-2 rounded-xl text-center transition border relative ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-md font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300'
                  }`}
                >
                  {isSelected && (
                    <span className="absolute right-1 top-1 bg-white text-emerald-700 rounded-full p-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                  <p className="text-xs font-bold">{j.label}</p>
                  <p className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>{j.waktu}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Badges - Mobile Optimized */}
        <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <span>Kelas <strong className="text-emerald-800 font-black">{selectedClass}</strong> • <span className="font-medium text-slate-600">Total {classStudents.length} Siswa</span></span>
          </div>

          {/* Stats Badges Grid on Mobile / Flex on Desktop */}
          <div className="grid grid-cols-4 sm:flex items-center gap-1.5 sm:gap-3 w-full sm:w-auto text-center font-bold">
            <div className="bg-emerald-100/70 border border-emerald-200 text-emerald-800 px-2 py-1 rounded-lg">
              <span className="text-[10px] text-emerald-600 block sm:inline font-normal sm:mr-1">Hadir:</span>
              <span>{hadirCount}</span>
            </div>
            <div className="bg-amber-100/70 border border-amber-200 text-amber-800 px-2 py-1 rounded-lg">
              <span className="text-[10px] text-amber-600 block sm:inline font-normal sm:mr-1">Sakit:</span>
              <span>{sakitCount}</span>
            </div>
            <div className="bg-blue-100/70 border border-blue-200 text-blue-800 px-2 py-1 rounded-lg">
              <span className="text-[10px] text-blue-600 block sm:inline font-normal sm:mr-1">Izin:</span>
              <span>{izinCount}</span>
            </div>
            <div className="bg-rose-100/70 border border-rose-200 text-rose-800 px-2 py-1 rounded-lg">
              <span className="text-[10px] text-rose-600 block sm:inline font-normal sm:mr-1">Alpa:</span>
              <span>{alpaCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Tidak ada siswa ditemukan di kelas ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4 w-28">NIS</th>
                  <th className="py-3.5 px-4">Nama Lengkap</th>
                  <th className="py-3.5 px-4 w-16 text-center">L/P</th>
                  <th className="py-3.5 px-4 w-80 text-center">Status Kehadiran</th>
                  <th className="py-3.5 px-4">Catatan / Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s, index) => {
                  const currentStatus = attendanceMap[s.id]?.status || 'Hadir';
                  const currentCatatan = attendanceMap[s.id]?.catatan || '';

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">{index + 1}</td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{s.nis}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div>{s.nama}</div>
                        {(() => {
                          const todayJpRecs = attendance.filter(a => a.studentId === s.id && a.date === selectedDate);
                          if (todayJpRecs.length > 0) {
                            return (
                              <div className="flex flex-wrap gap-1 mt-1 text-[10px] font-normal">
                                {todayJpRecs.sort((a,b) => (a.jamKe || 1) - (b.jamKe || 1)).map(r => (
                                  <span 
                                    key={r.jamKe || 1} 
                                    className={`px-1.5 py-0.5 rounded border ${
                                      r.status === 'Hadir' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                      r.status === 'Sakit' ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold' :
                                      r.status === 'Izin' ? 'bg-blue-50 text-blue-800 border-blue-200 font-bold' :
                                      'bg-rose-100 text-rose-800 border-rose-300 font-bold'
                                    }`}
                                  >
                                    JP {r.jamKe || 1}: {r.status}
                                  </span>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-500">
                        <span className={`px-2 py-0.5 rounded ${s.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                          {s.gender}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          {/* Hadir Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'Hadir')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition border ${
                              currentStatus === 'Hadir'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-emerald-50'
                            }`}
                          >
                            Hadir
                          </button>

                          {/* Sakit Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'Sakit')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition border ${
                              currentStatus === 'Sakit'
                                ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-amber-50'
                            }`}
                          >
                            Sakit
                          </button>

                          {/* Izin Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'Izin')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition border ${
                              currentStatus === 'Izin'
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-blue-50'
                            }`}
                          >
                            Izin
                          </button>

                          {/* Alpa Button */}
                          <button
                            type="button"
                            onClick={() => handleStatusChange(s.id, 'Alpa')}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition border ${
                              currentStatus === 'Alpa'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50'
                            }`}
                          >
                            Alpa
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <input
                          type="text"
                          placeholder={currentStatus !== 'Hadir' ? 'Alasan/Keterangan...' : 'Catatan opsional...'}
                          value={currentCatatan}
                          onChange={(e) => handleCatatanChange(s.id, e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition"
          >
            <Save className="w-4 h-4" />
            Simpan Absensi Kelas {selectedClass} ({selectedJams.length} Jam Pelajaran)
          </button>
        </div>
      </div>
    </div>
  );
}
