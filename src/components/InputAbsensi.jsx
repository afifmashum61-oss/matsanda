import React, { useState, useEffect, useRef } from 'react';
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
  Zap, 
  MessageCircle, 
  X, 
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { JAM_PELAJARAN, getJamPelajaranByDate } from '../data/initialData';
import { getTodayDateString } from '../utils/storage';

export default function InputAbsensi({ 
  classes, 
  students, 
  attendance, 
  onSaveAttendance, 
  selectedClass, 
  setSelectedClass,
  schoolProfile
}) {
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedSemester, setSelectedSemester] = useState(schoolProfile?.semester || 'Ganjil');
  
  // Dynamic Jam Pelajaran based on selected date (Monday vs Regular)
  const currentJamPelajaran = getJamPelajaranByDate(selectedDate);
  
  // Multi-select Jam Pelajaran IDs, e.g. [1, 2] or [3, 4]
  const [selectedJams, setSelectedJams] = useState([1, 2]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  // Modal WhatsApp Wali Kelas untuk Siswa Alpa
  const [showAlpaModal, setShowAlpaModal] = useState(false);
  const [alpaModalStudents, setAlpaModalStudents] = useState([]);
  const [waliPhoneInput, setWaliPhoneInput] = useState('');

  // Filter students by selected class and ensure strict alphabetical order (A-Z)
  const classStudents = students
    .filter(s => s.kelas === selectedClass)
    .sort((a, b) => (a.nama || '').trim().localeCompare((b.nama || '').trim(), 'id', { sensitivity: 'base' }));
  const filteredStudents = classStudents.filter(s => 
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.nis && s.nis.includes(searchTerm))
  );

  // Form state for current attendance records
  const [attendanceMap, setAttendanceMap] = useState({});

  // Primary JP for loading initial state (first selected JP)
  const primaryJam = selectedJams[0] || 1;

  // Refs for tracking dirty state & preventing background Firestore snapshots from wiping active edits
  const isDirtyRef = useRef(false);
  const prevContextRef = useRef(`${selectedClass}_${selectedDate}`);

  // Draft helper functions
  const getDraftKey = (cls, dt) => `mts_draft_absensi_${cls}_${dt}`;

  const saveDraftLocally = (map) => {
    try {
      localStorage.setItem(getDraftKey(selectedClass, selectedDate), JSON.stringify(map));
      setHasDraft(true);
    } catch (e) {
      console.warn("Gagal simpan draf lokal:", e);
    }
  };

  const clearDraftLocally = () => {
    try {
      localStorage.removeItem(getDraftKey(selectedClass, selectedDate));
      setHasDraft(false);
    } catch (e) {}
  };

  // Safe reset to saved cloud/default state
  const handleResetToSaved = () => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan perubahan draf dan memuat ulang data absensi semula?")) {
      clearDraftLocally();
      isDirtyRef.current = false;
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
    }
  };

  // Load existing records or draft safely without background data loss
  useEffect(() => {
    const currentContext = `${selectedClass}_${selectedDate}`;
    const contextChanged = prevContextRef.current !== currentContext;
    prevContextRef.current = currentContext;

    // 1. If user switched class or date:
    if (contextChanged) {
      isDirtyRef.current = false;
      const savedDraft = localStorage.getItem(getDraftKey(selectedClass, selectedDate));
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            setAttendanceMap(parsed);
            isDirtyRef.current = true;
            setHasDraft(true);
            return;
          }
        } catch (e) {}
      }

      setHasDraft(false);
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
      return;
    }

    // 2. If context has NOT changed:
    // If the teacher has uncommitted edits OR an active draft, NEVER OVERWRITE!
    if (isDirtyRef.current) {
      return;
    }
    const savedDraft = localStorage.getItem(getDraftKey(selectedClass, selectedDate));
    if (savedDraft) {
      setHasDraft(true);
      return;
    }

    // 3. Otherwise, if teacher is not dirty and has no draft, update cleanly from attendance
    const map = {};
    let foundRecords = false;
    classStudents.forEach(s => {
      const existing = attendance.find(
        a => a.studentId === s.id && a.date === selectedDate && (a.jamKe === primaryJam || !a.jamKe)
      );
      if (existing) {
        foundRecords = true;
        map[s.id] = { status: existing.status, catatan: existing.catatan || '' };
      } else {
        map[s.id] = { status: 'Hadir', catatan: '' };
      }
    });

    if (foundRecords || Object.keys(attendanceMap).length === 0) {
      setAttendanceMap(map);
    }
  }, [selectedClass, selectedDate, attendance, classStudents]);

  // Toggle individual Jam Pelajaran in multi-select list (Never wipe attendanceMap!)
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
    isDirtyRef.current = true;
    setAttendanceMap(prev => {
      const next = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          status
        }
      };
      saveDraftLocally(next);
      return next;
    });
  };

  const handleCatatanChange = (studentId, catatan) => {
    isDirtyRef.current = true;
    setAttendanceMap(prev => {
      const next = {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          catatan
        }
      };
      saveDraftLocally(next);
      return next;
    });
  };

  const markAllHadir = () => {
    isDirtyRef.current = true;
    const newMap = { ...attendanceMap };
    classStudents.forEach(s => {
      newMap[s.id] = { ...newMap[s.id], status: 'Hadir' };
    });
    setAttendanceMap(newMap);
    saveDraftLocally(newMap);
  };

  // Helper to build attendance records from classStudents
  const buildNewRecords = () => {
    const newRecords = [];
    selectedJams.forEach(jamId => {
      classStudents.forEach(s => {
        newRecords.push({
          studentId: s.id,
          date: selectedDate,
          jamKe: jamId,
          status: attendanceMap[s.id]?.status || 'Hadir',
          catatan: attendanceMap[s.id]?.catatan || ''
        });
      });
    });
    return newRecords;
  };

  // Multi-Jam Pelajaran Save
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const newRecords = buildNewRecords();
      await onSaveAttendance(newRecords, selectedClass, selectedDate);
      isDirtyRef.current = false;
      clearDraftLocally();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);

      // Cek apakah ada siswa yang berstatus Alpa
      const alpas = classStudents.filter(s => attendanceMap[s.id]?.status === 'Alpa');
      if (alpas.length > 0) {
        setAlpaModalStudents(alpas);
        setWaliPhoneInput(currentClassObj?.noHpWali || '');
        setShowAlpaModal(true);
      }
    } catch (err) {
      console.error("Gagal menyimpan absensi:", err);
      alert("Gagal menyimpan absensi. Silakan periksa koneksi internet Anda.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendAlpaWhatsApp = async () => {
    let cleanPhone = waliPhoneInput.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone) {
      alert('Silakan masukkan nomor WhatsApp Wali Kelas terlebih dahulu!');
      return;
    }
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    try {
      const newRecords = buildNewRecords();
      await onSaveAttendance(newRecords, selectedClass, selectedDate);
    } catch (err) {
      console.warn("Auto-save before WhatsApp:", err);
    }

    const jamLabels = selectedJams.map(j => `Jam Ke-${j}`).join(', ');
    const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const studentListText = alpaModalStudents.map((s, idx) => {
      const cat = attendanceMap[s.id]?.catatan ? ` _(Ket: ${attendanceMap[s.id].catatan})_` : '';
      return `${idx + 1}. *${s.nama}* (NIS: ${s.nis})${cat}`;
    }).join('\n');

    const message = 
`*PEMBERITAHUAN KETIDAKHADIRAN SISWA (ALPA)*
*MTs DARUSSALAM NGESONG JOMBANG*

Assalamu'alaikum Wr. Wb.
Yth. Wali Kelas *${currentClassObj?.nama || selectedClass}*
Bpk/Ibu: *${currentClassObj?.waliKelas || '-'}*

Menginformasikan bahwa pada absensi kelas:
📅 *Hari/Tanggal:* ${formattedDate}
⏰ *Jam Pelajaran:* ${jamLabels}

Terdapat siswa yang tidak hadir dengan status *ALPA (Tanpa Keterangan)*:
${studentListText}

Mohon untuk dapat dikonfirmasi atau ditindaklanjuti ke pihak orang tua/wali murid.

Terima kasih.
Wassalamu'alaikum Wr. Wb.`;

    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    setShowAlpaModal(false);

    try {
      const win = window.open(waUrl, '_blank');
      if (!win || win.closed || typeof win.closed === 'undefined') {
        window.location.href = waUrl;
      }
    } catch (e) {
      window.location.href = waUrl;
    }
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
    <div className="space-y-4 sm:space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-3.5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Form Absensi Siswa Multi-Jam Pelajaran</h1>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                T.A. {schoolProfile?.tahunAjaran || '2026/2027'} • Semester {selectedSemester}
              </span>
            </div>
            <p className="text-xs text-slate-500">Pilih jam pelajaran yang ingin diisi, lalu tentukan status kehadiran siswa.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={markAllHadir}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold px-3 py-2.5 rounded-xl text-xs transition active:scale-95"
            >
              <CheckCheck className="w-4 h-4 text-emerald-600" />
              Tandai Semua Hadir
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition active:scale-95 ${
                isSaving ? 'bg-emerald-400 cursor-wait opacity-80' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Menyimpan...' : `Simpan ${selectedJams.length} Jam Pelajaran`}
            </button>
          </div>
        </div>

        {/* Draft Notice Banner */}
        {hasDraft && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
              <span><strong>Draf Tersimpan:</strong> Melanjutkan pengisian yang belum disimpan. Data tidak akan hilang meski aplikasi ditutup.</span>
            </div>
            <button
              type="button"
              onClick={handleResetToSaved}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:text-amber-950 underline self-end sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Muat Ulang dari Awal
            </button>
          </div>
        )}

        {/* Success Alert */}
        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                Berhasil menyimpan absensi Kelas {selectedClass} ke <strong>Cloud Firebase</strong> untuk <strong>{selectedJams.length} Jam Pelajaran ({selectedJamLabels})</strong> sekaligus pada tanggal {selectedDate}!
              </span>
            </div>
            {alpaCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  const alpas = classStudents.filter(s => attendanceMap[s.id]?.status === 'Alpa');
                  setAlpaModalStudents(alpas);
                  setWaliPhoneInput(currentClassObj?.noHpWali || '');
                  setShowAlpaModal(true);
                }}
                className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition shadow-sm flex-shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                Kirim WA ke Wali Kelas ({alpaCount} Alpa)
              </button>
            )}
          </div>
        )}

        {/* Inputs row with separated Kelas, Wali Kelas, Semester, Tanggal, & Cari Siswa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none h-[42px]"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Wali Kelas</label>
            <div className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 truncate flex items-center h-[42px]">
              {currentClassObj?.waliKelas || '-'}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Semester</label>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                T.A. {schoolProfile?.tahunAjaran || '2026/2027'}
              </span>
            </div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none h-[42px]"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Absensi</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none h-[42px]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cari Siswa</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Cari nama/NIS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none h-[42px]"
              />
            </div>
          </div>
        </div>

        {/* Multi-Select Jam Pelajaran Pills Bar (1 - 8) */}
        <div className="pt-1 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              Pilih Jam Pelajaran (Bisa pilih lebih dari 1):
            </label>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
            {currentJamPelajaran.map(j => {
              const isSelected = selectedJams.includes(j.id);
              return (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => toggleJamSelection(j.id)}
                  className={`p-2 rounded-xl text-center transition border relative select-none active:scale-95 ${
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

        {/* Summary Badges */}
        <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200/80 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-slate-700 font-bold">
            <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <span>Kelas <strong className="text-emerald-800 font-black">{selectedClass}</strong> • <span className="font-medium text-slate-600">Total {classStudents.length} Siswa</span></span>
          </div>

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

      {/* Student List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Tidak ada siswa ditemukan di kelas ini.</p>
          </div>
        ) : (
          <>
            {/* 1. MOBILE VIEW (Full-Width Responsive Cards, No Horizontal Scroll, No Zoom/Pop-up) */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredStudents.map((s, index) => {
                const currentStatus = attendanceMap[s.id]?.status || 'Hadir';
                const currentCatatan = attendanceMap[s.id]?.catatan || '';
                const todayJpRecs = attendance.filter(a => a.studentId === s.id && a.date === selectedDate);

                return (
                  <div key={s.id} className="p-3.5 space-y-2.5 bg-white">
                    {/* Header Card: No, Nama, NIS, Gender, Status Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono text-xs flex items-center justify-center flex-shrink-0 font-bold">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 leading-tight truncate">
                            {s.nama}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            NIS: {s.nis} • <span className={s.gender === 'L' ? 'text-blue-600 font-semibold' : 'text-pink-600 font-semibold'}>{s.gender === 'L' ? 'L' : 'P'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Status Indicator Pill */}
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black flex-shrink-0 ${
                        currentStatus === 'Hadir' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        currentStatus === 'Sakit' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        currentStatus === 'Izin' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {currentStatus}
                      </span>
                    </div>

                    {/* Today other JP records history chips */}
                    {todayJpRecs.length > 0 && (
                      <div className="flex flex-wrap gap-1 text-[10px]">
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
                    )}

                    {/* 4 Status Buttons: Large Touch Targets, No Zooming */}
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'Hadir')}
                        className={`h-10 rounded-xl text-xs font-black transition border flex items-center justify-center active:scale-95 ${
                          currentStatus === 'Hadir'
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-600/30'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        Hadir
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'Sakit')}
                        className={`h-10 rounded-xl text-xs font-black transition border flex items-center justify-center active:scale-95 ${
                          currentStatus === 'Sakit'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-500/30'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-amber-50'
                        }`}
                      >
                        Sakit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'Izin')}
                        className={`h-10 rounded-xl text-xs font-black transition border flex items-center justify-center active:scale-95 ${
                          currentStatus === 'Izin'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-600/30'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50'
                        }`}
                      >
                        Izin
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'Alpa')}
                        className={`h-10 rounded-xl text-xs font-black transition border flex items-center justify-center active:scale-95 ${
                          currentStatus === 'Alpa'
                            ? 'bg-rose-600 text-white border-rose-700 shadow-sm ring-2 ring-rose-600/30'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-rose-50'
                        }`}
                      >
                        Alpa
                      </button>
                    </div>

                    {/* Catatan Field with Mobile-Friendly 16px Font */}
                    <input
                      type="text"
                      placeholder={currentStatus !== 'Hadir' ? `Catatan/alasan ${currentStatus.toLowerCase()}...` : 'Catatan opsional...'}
                      value={currentCatatan}
                      onChange={(e) => handleCatatanChange(s.id, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>

            {/* 2. DESKTOP VIEW (High Density Table for Laptop / PC) */}
            <div className="hidden md:block overflow-x-auto">
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
                    const todayJpRecs = attendance.filter(a => a.studentId === s.id && a.date === selectedDate);

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">{index + 1}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{s.nis}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{s.nama}</div>
                          {todayJpRecs.length > 0 && (
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
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-500">
                          <span className={`px-2 py-0.5 rounded ${s.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                            {s.gender}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
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
          </>
        )}

        {/* Bottom Save Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            {hasDraft ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Draf tersimpan otomatis di perangkat ini. Klik tombol untuk menyimpan ke Cloud.
              </span>
            ) : (
              <span>Klik tombol simpan untuk memperbarui rekaman absensi ke Cloud Firebase.</span>
            )}
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition active:scale-95 ${
              isSaving ? 'bg-emerald-400 cursor-wait opacity-80' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            {isSaving ? 'Menyimpan ke Cloud...' : `Simpan Absensi Kelas ${selectedClass} (${selectedJams.length} Jam Pelajaran)`}
          </button>
        </div>
      </div>

      {/* Modal Notifikasi WhatsApp Wali Kelas untuk Siswa Alpa */}
      {showAlpaModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-100 animate-scaleUp">
            
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Notifikasi Siswa Alpa ke Wali Kelas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Terdapat {alpaModalStudents.length} siswa tanpa keterangan pada {selectedJamLabels}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setShowAlpaModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Penyimpanan Cloud */}
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs px-3.5 py-2 rounded-xl border border-emerald-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Data absensi telah tersimpan aman di cloud & memori lokal.</span>
            </div>

            {/* List Siswa Alpa */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Daftar Siswa Alpa Hari Ini:</label>
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl p-3.5 max-h-40 overflow-y-auto space-y-2">
                {alpaModalStudents.map((s, idx) => (
                  <div key={s.id} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-rose-100 shadow-xs">
                    <div>
                      <span className="font-bold text-slate-900">{idx + 1}. {s.nama}</span>
                      <span className="text-slate-500 ml-1.5 font-mono text-[11px]">(NIS: {s.nis})</span>
                      {attendanceMap[s.id]?.catatan && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">Ket: {attendanceMap[s.id].catatan}</p>
                      )}
                    </div>
                    <span className="bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                      Alpa
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Wali Kelas & Nomor HP */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Wali Kelas {currentClassObj?.nama || selectedClass}:</span>
                <strong className="text-slate-900 font-bold">{currentClassObj?.waliKelas || '-'}</strong>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nomor WhatsApp Wali Kelas:
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 08123456789 atau 628123456789"
                  value={waliPhoneInput}
                  onChange={(e) => setWaliPhoneInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Nomor ini akan digunakan untuk mengirim pesan otomatis rincian siswa alpa via WhatsApp.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAlpaModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Tutup Saja
              </button>
              <button
                type="button"
                onClick={handleSendAlpaWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition"
              >
                <MessageCircle className="w-4 h-4" />
                Buka WhatsApp & Kirim Pesan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
