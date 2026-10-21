import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Save, 
  CheckCircle, 
  Award, 
  Sparkles, 
  RefreshCw,
  Search,
  MoreVertical
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MATA_PELAJARAN_MTS } from '../data/initialData';
import { getGrades, saveGradeForClassSubject } from '../utils/storage';

// Fixed Theme: Hijau Madrasah (Official Matsanda Theme)
const THEME_HIJAU_MADRASAH = {
  topIdentity: 'bg-slate-800 text-white border-slate-700',
  topKd: 'bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white border-emerald-900',
  topSummary: 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-800',
  phHeaders: [
    'bg-emerald-700 text-white border-emerald-800',
    'bg-teal-700 text-white border-teal-800',
    'bg-cyan-700 text-white border-cyan-800',
    'bg-emerald-800 text-white border-emerald-900',
  ],
  summaryHeaders: {
    rataKd3: 'bg-emerald-600 text-white border-emerald-700',
    rataKd4: 'bg-teal-600 text-white border-teal-700',
    nilaiAkhir: 'bg-amber-500 text-amber-950 font-black border-amber-600',
    predikat: 'bg-emerald-700 text-white border-emerald-800',
    keterangan: 'bg-slate-700 text-white border-slate-800',
  },
  subColumns: {
    ph: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold',
    remidi: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
    praktek: 'bg-sky-100 text-sky-950 border-sky-300 font-bold',
    proyek: 'bg-indigo-100 text-indigo-950 border-indigo-300 font-bold',
    porto: 'bg-purple-100 text-purple-950 border-purple-300 font-bold',
  },
  cellHighlight: {
    kd3: 'bg-emerald-50/70 text-emerald-950 font-bold',
    kd4: 'bg-teal-50/70 text-teal-950 font-bold',
    akhir: 'bg-amber-100 text-amber-950 font-black',
  }
};

export default function RekapNilai({ 
  classes, 
  students, 
  schoolProfile,
  allGrades = {},
  onSaveGrade
}) {
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '7A');
  const [selectedMapel, setSelectedMapel] = useState(MATA_PELAJARAN_MTS[0]?.id || 'QH');
  const [selectedSemester, setSelectedSemester] = useState(schoolProfile?.semester || 'Ganjil');
  const [kdCount, setKdCount] = useState(2); // Default 2 PH (sesuai format lampiran)
  const [kkm, setKkm] = useState(75);
  const [guruPengampu, setGuruPengampu] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // 'saved' | 'saving' | 'dirty' | ''
  
  // Mobile Column Filter State: 'all' | 'ph1' | 'ph2' | 'final'
  const [viewMode, setViewMode] = useState('all');
  const [showMoreActions, setShowMoreActions] = useState(false);

  // Batch Fill Modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchTarget, setBatchTarget] = useState('ph1_ph');
  const [batchScore, setBatchScore] = useState(80);

  // Current grade sheet document key: `${classId}_${mapelId}_${semester}`
  const docKey = `${selectedClass}_${selectedMapel}_${selectedSemester}`;

  // Current class and subject info
  const currentClassObj = classes.find(c => c.id === selectedClass) || { nama: `Kelas ${selectedClass}`, waliKelas: '-' };
  const currentMapelObj = MATA_PELAJARAN_MTS.find(m => m.id === selectedMapel) || MATA_PELAJARAN_MTS[0];

  // Filter students for the selected class, sorted alphabetically
  const classStudents = useMemo(() => {
    return students
      .filter(s => s.kelas === selectedClass)
      .sort((a, b) => (a.nama || '').trim().localeCompare((b.nama || '').trim(), 'id', { sensitivity: 'base' }));
  }, [students, selectedClass]);

  // Scores state: { [studentId]: { ph1: { ph, remidi, praktek, proyek, porto }, ph2: { ... }, ... } }
  const [scores, setScores] = useState({});

  // Load existing grades whenever class, subject, semester, or allGrades changes
  useEffect(() => {
    const existing = allGrades[docKey] || getGrades()[docKey];
    if (existing) {
      setScores(existing.scores || {});
      setKkm(existing.kkm !== undefined ? existing.kkm : (currentMapelObj?.kkmDefault || 75));
      setGuruPengampu(existing.guruPengampu || '');
      if (existing.kdCount) setKdCount(existing.kdCount);
    } else {
      setScores({});
      setKkm(currentMapelObj?.kkmDefault || 75);
      setGuruPengampu('');
    }
    setSaveStatus('');
  }, [docKey, allGrades, currentMapelObj]);

  // Helper to handle input change for a student's KD score
  const handleScoreChange = (studentId, kdKey, field, value) => {
    if (value !== '' && (isNaN(value) || Number(value) < 0 || Number(value) > 100)) {
      return;
    }

    setScores(prev => {
      const studentScores = prev[studentId] || {};
      const kdScores = studentScores[kdKey] || {};
      const updatedKd = { ...kdScores, [field]: value };
      const updatedStudent = { ...studentScores, [kdKey]: updatedKd };
      return { ...prev, [studentId]: updatedStudent };
    });
    setSaveStatus('dirty');
  };

  // Fast Enter Key Navigation: moves directly to the same field of the next student
  const handleInputKeyDown = (e, currentIdx, kdKey, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentIdx < filteredStudents.length - 1) {
        const nextStudent = filteredStudents[currentIdx + 1];
        const nextInput = document.getElementById(`score_${nextStudent.id}_${kdKey}_${field}`);
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    }
  };

  // Perform save to LocalStorage and Firestore
  const handleSave = (scoresToSave = scores, customKkm = kkm, customGuru = guruPengampu, customKdCount = kdCount) => {
    setSaveStatus('saving');
    const gradeData = {
      kkm: Number(customKkm),
      guruPengampu: customGuru,
      kdCount: customKdCount,
      scores: scoresToSave,
    };

    if (onSaveGrade) {
      onSaveGrade(selectedClass, selectedMapel, selectedSemester, gradeData);
    } else {
      saveGradeForClassSubject(selectedClass, selectedMapel, selectedSemester, gradeData);
    }

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2500);
    }, 400);
  };

  // Auto-save debounced when dirty
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (saveStatus === 'dirty') {
      const timer = setTimeout(() => {
        handleSave();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [scores, kkm, guruPengampu, kdCount, saveStatus]);

  // Calculation helpers per student
  const calculateStudentResults = (studentId) => {
    const studentScore = scores[studentId] || {};
    const effectiveKnowledgeScores = [];
    const skillAverages = [];

    for (let i = 1; i <= kdCount; i++) {
      const kdKey = `ph${i}`;
      const kd = studentScore[kdKey] || {};

      let effectivePh = null;
      if (kd.remidi !== undefined && kd.remidi !== '' && !isNaN(kd.remidi)) {
        effectivePh = Number(kd.remidi);
      } else if (kd.ph !== undefined && kd.ph !== '' && !isNaN(kd.ph)) {
        effectivePh = Number(kd.ph);
      }
      if (effectivePh !== null) {
        effectiveKnowledgeScores.push(effectivePh);
      }

      const skillVals = [];
      if (kd.praktek !== undefined && kd.praktek !== '' && !isNaN(kd.praktek)) skillVals.push(Number(kd.praktek));
      if (kd.proyek !== undefined && kd.proyek !== '' && !isNaN(kd.proyek)) skillVals.push(Number(kd.proyek));
      if (kd.porto !== undefined && kd.porto !== '' && !isNaN(kd.porto)) skillVals.push(Number(kd.porto));

      if (skillVals.length > 0) {
        const kd4Avg = skillVals.reduce((a, b) => a + b, 0) / skillVals.length;
        skillAverages.push(kd4Avg);
      }
    }

    const rataKD3 = effectiveKnowledgeScores.length > 0
      ? (effectiveKnowledgeScores.reduce((a, b) => a + b, 0) / effectiveKnowledgeScores.length)
      : null;

    const rataKD4 = skillAverages.length > 0
      ? (skillAverages.reduce((a, b) => a + b, 0) / skillAverages.length)
      : null;

    let nilaiAkhir = null;
    if (rataKD3 !== null && rataKD4 !== null) {
      nilaiAkhir = Math.round((rataKD3 + rataKD4) / 2);
    } else if (rataKD3 !== null) {
      nilaiAkhir = Math.round(rataKD3);
    } else if (rataKD4 !== null) {
      nilaiAkhir = Math.round(rataKD4);
    }

    let predikat = '-';
    let isTuntas = false;
    if (nilaiAkhir !== null) {
      isTuntas = nilaiAkhir >= kkm;
      if (nilaiAkhir >= 90) predikat = 'A';
      else if (nilaiAkhir >= 80) predikat = 'B';
      else if (nilaiAkhir >= kkm) predikat = 'C';
      else predikat = 'D';
    }

    return {
      rataKD3: rataKD3 !== null ? Math.round(rataKD3 * 10) / 10 : null,
      rataKD4: rataKD4 !== null ? Math.round(rataKD4 * 10) / 10 : null,
      nilaiAkhir,
      predikat,
      isTuntas,
      isFilled: nilaiAkhir !== null
    };
  };

  // Class Statistics
  const statistics = useMemo(() => {
    let filledCount = 0;
    let tuntasCount = 0;
    let totalScore = 0;
    let highest = null;
    let lowest = null;

    classStudents.forEach(s => {
      const res = calculateStudentResults(s.id);
      if (res.isFilled) {
        filledCount++;
        totalScore += res.nilaiAkhir;
        if (res.isTuntas) tuntasCount++;
        if (highest === null || res.nilaiAkhir > highest) highest = res.nilaiAkhir;
        if (lowest === null || res.nilaiAkhir < lowest) lowest = res.nilaiAkhir;
      }
    });

    const average = filledCount > 0 ? (totalScore / filledCount).toFixed(1) : '-';
    const tuntasPercent = filledCount > 0 ? Math.round((tuntasCount / filledCount) * 100) : 0;

    return {
      totalStudents: classStudents.length,
      filledCount,
      tuntasCount,
      tuntasPercent,
      average,
      highest: highest !== null ? highest : '-',
      lowest: lowest !== null ? lowest : '-'
    };
  }, [classStudents, scores, kdCount, kkm]);

  // Batch Fill Action
  const applyBatchFill = () => {
    const [kdKey, field] = batchTarget.split('_');
    const updated = { ...scores };
    classStudents.forEach(s => {
      const studentScores = updated[s.id] || {};
      const kdScores = studentScores[kdKey] || {};
      updated[s.id] = {
        ...studentScores,
        [kdKey]: {
          ...kdScores,
          [field]: batchScore
        }
      };
    });
    setScores(updated);
    setSaveStatus('dirty');
    setShowBatchModal(false);
    handleSave(updated);
  };

  // Export to Excel with Multi-Level Merged Headers matching the template
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const sheetData = [
      [`MADRASAH TSANAWIYAH (MTs) DARUSSALAM NGESONG JOMBANG`],
      [`REKAPITULASI NILAI HASIL BELAJAR SISWA - TAHUN AJARAN ${schoolProfile?.tahunAjaran || '2026/2027'}`],
      [`Kelas: ${currentClassObj.nama}`, `Mata Pelajaran: ${currentMapelObj.nama}`, `Semester: ${selectedSemester}`, `KKM: ${kkm}`, `Guru: ${guruPengampu || '-'}`],
      [],
    ];

    const rowTop = ['No', 'NIS', 'Nama Siswa', 'L/P'];
    const kdTotalCols = 5 * kdCount;
    rowTop.push('Kompetensi Dasar Pengetahuan dan Ketrampilan');
    for (let c = 1; c < kdTotalCols; c++) rowTop.push('');
    rowTop.push('Rekapitulasi Nilai Akhir', '', '', '', '');
    sheetData.push(rowTop);

    const rowSub = ['', '', '', ''];
    for (let i = 1; i <= kdCount; i++) {
      rowSub.push(`Penilaian Harian ${i}`, '', '', '', '');
    }
    rowSub.push('Rata KD-3', 'Rata KD-4', 'Nilai Akhir', 'Predikat', 'Keterangan');
    sheetData.push(rowSub);

    const rowFields = ['', '', '', ''];
    for (let i = 1; i <= kdCount; i++) {
      rowFields.push('PH', 'Remidi', 'Praktek', 'Proyek', 'Porto F');
    }
    rowFields.push('', '', '', '', '');
    sheetData.push(rowFields);

    classStudents.forEach((s, idx) => {
      const studentScore = scores[s.id] || {};
      const res = calculateStudentResults(s.id);
      const row = [
        idx + 1,
        s.nis || '-',
        s.nama,
        s.gender || '-'
      ];

      for (let i = 1; i <= kdCount; i++) {
        const kd = studentScore[`ph${i}`] || {};
        row.push(
          kd.ph !== undefined && kd.ph !== '' ? Number(kd.ph) : '',
          kd.remidi !== undefined && kd.remidi !== '' ? Number(kd.remidi) : '',
          kd.praktek !== undefined && kd.praktek !== '' ? Number(kd.praktek) : '',
          kd.proyek !== undefined && kd.proyek !== '' ? Number(kd.proyek) : '',
          kd.porto !== undefined && kd.porto !== '' ? Number(kd.porto) : ''
        );
      }

      row.push(
        res.rataKD3 !== null ? res.rataKD3 : '',
        res.rataKD4 !== null ? res.rataKD4 : '',
        res.nilaiAkhir !== null ? res.nilaiAkhir : '',
        res.predikat,
        res.isFilled ? (res.isTuntas ? 'Tuntas' : 'Belum Tuntas') : ''
      );

      sheetData.push(row);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    const merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 + kdTotalCols + 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 + kdTotalCols + 4 } },
      { s: { r: 4, c: 0 }, e: { r: 6, c: 0 } },
      { s: { r: 4, c: 1 }, e: { r: 6, c: 1 } },
      { s: { r: 4, c: 2 }, e: { r: 6, c: 2 } },
      { s: { r: 4, c: 3 }, e: { r: 6, c: 3 } },
      { s: { r: 4, c: 4 }, e: { r: 4, c: 4 + kdTotalCols - 1 } },
      { s: { r: 4, c: 4 + kdTotalCols }, e: { r: 4, c: 4 + kdTotalCols + 4 } },
      { s: { r: 5, c: 4 + kdTotalCols }, e: { r: 6, c: 4 + kdTotalCols } },
      { s: { r: 5, c: 4 + kdTotalCols + 1 }, e: { r: 6, c: 4 + kdTotalCols + 1 } },
      { s: { r: 5, c: 4 + kdTotalCols + 2 }, e: { r: 6, c: 4 + kdTotalCols + 2 } },
      { s: { r: 5, c: 4 + kdTotalCols + 3 }, e: { r: 6, c: 4 + kdTotalCols + 3 } },
      { s: { r: 5, c: 4 + kdTotalCols + 4 }, e: { r: 6, c: 4 + kdTotalCols + 4 } },
    ];

    for (let i = 0; i < kdCount; i++) {
      merges.push({
        s: { r: 5, c: 4 + (i * 5) },
        e: { r: 5, c: 4 + (i * 5) + 4 }
      });
    }

    ws['!merges'] = merges;

    const colWidths = [
      { wch: 5 },
      { wch: 10 },
      { wch: 28 },
      { wch: 6 },
    ];
    for (let i = 0; i < kdTotalCols; i++) {
      colWidths.push({ wch: 9 });
    }
    colWidths.push({ wch: 11 }, { wch: 11 }, { wch: 11 }, { wch: 9 }, { wch: 14 });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, `Nilai ${selectedClass}`);
    const safeMapel = currentMapelObj.nama.replace(/[/\\?%*:|"<>]/g, '-');
    XLSX.writeFile(wb, `Rekap_Nilai_${selectedClass}_${safeMapel}_Sem_${selectedSemester}.xlsx`);
  };

  // Filtered student list for search
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return classStudents;
    const q = searchQuery.toLowerCase();
    return classStudents.filter(s => 
      s.nama.toLowerCase().includes(q) || 
      (s.nis && s.nis.toLowerCase().includes(q))
    );
  }, [classStudents, searchQuery]);

  return (
    <div className="space-y-4">
      
      {/* 1. SIMPLE & CLEAN TOP BAR */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 no-print">
        
        {/* Title & Extra Actions Menu */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight truncate">
                Rekap Nilai Siswa
              </h1>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                {currentClassObj.nama} • {currentMapelObj.nama}
              </p>
            </div>
          </div>

          {/* Quick Extra Menu (Export Excel, Cetak PDF, Isi Cepat) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMoreActions(!showMoreActions)}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition flex items-center gap-1 text-xs font-semibold"
              title="Menu Tambahan"
            >
              <MoreVertical className="w-4 h-4" />
              <span className="hidden sm:inline">Menu Lainnya</span>
            </button>

            {showMoreActions && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMoreActions(false)} />
                <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs animate-fadeIn">
                  <button
                    onClick={() => {
                      setShowBatchModal(true);
                      setShowMoreActions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-amber-50 hover:text-amber-800 text-left font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Isi Nilai Cepat</span>
                  </button>
                  <button
                    onClick={() => {
                      handleExportExcel();
                      setShowMoreActions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 text-left font-medium"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Export Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                      setShowMoreActions(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-800 text-left font-medium border-t border-slate-100"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>Cetak / PDF Resmi</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Essential Selectors: Kelas & Mata Pelajaran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Mata Pelajaran</label>
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none truncate"
            >
              <optgroup label="Pendidikan Agama Islam (PAI)">
                {MATA_PELAJARAN_MTS.filter(m => m.kelompok === 'PAI').map(m => (
                  <option key={m.id} value={m.id}>{m.nama}</option>
                ))}
              </optgroup>
              <optgroup label="Mata Pelajaran Umum">
                {MATA_PELAJARAN_MTS.filter(m => m.kelompok === 'Umum').map(m => (
                  <option key={m.id} value={m.id}>{m.nama}</option>
                ))}
              </optgroup>
              <optgroup label="Muatan Lokal">
                {MATA_PELAJARAN_MTS.filter(m => m.kelompok === 'Mulok').map(m => (
                  <option key={m.id} value={m.id}>{m.nama}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

      </div>

      {/* 2. COMPACT SUMMARY STATS (1-Line Chips) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-print text-xs">
        <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs font-semibold text-slate-700 flex-shrink-0">
          <span className="text-slate-400">Total:</span>
          <strong className="text-slate-900 font-black">{statistics.totalStudents} Siswa</strong>
          <span className="text-[10px] text-slate-400">({statistics.filledCount} terisi)</span>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs font-semibold text-slate-700 flex-shrink-0">
          <span className="text-slate-400">Rata-rata:</span>
          <strong className="text-emerald-700 font-black">{statistics.average}</strong>
          <span className="text-[10px] text-slate-400">(KKM {kkm})</span>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs font-semibold text-slate-700 flex-shrink-0">
          <span className="text-slate-400">Ketuntasan:</span>
          <strong className="text-blue-700 font-black">{statistics.tuntasPercent}%</strong>
          <span className="text-[10px] text-slate-400">({statistics.tuntasCount} anak)</span>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs font-semibold text-slate-700 flex-shrink-0">
          <span className="text-slate-400">Tertinggi/Terendah:</span>
          <strong className="text-slate-900">{statistics.highest}</strong>
          <span className="text-slate-300">/</span>
          <strong className="text-rose-600">{statistics.lowest}</strong>
        </div>
      </div>

      {/* 3. MOBILE COLUMN FILTER TABS & SEARCH */}
      <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 no-print">
        
        {/* Column Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              viewMode === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📑 Semua Kolom
          </button>

          <button
            type="button"
            onClick={() => setViewMode('ph1')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              viewMode === 'ph1'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📝 PH 1 (Langsung di HP)
          </button>

          <button
            type="button"
            onClick={() => setViewMode('ph2')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              viewMode === 'ph2'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📝 PH 2 (Langsung di HP)
          </button>

          <button
            type="button"
            onClick={() => setViewMode('final')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              viewMode === 'final'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🎯 Nilai Akhir & Rapor
          </button>
        </div>

        {/* Quick Search Field */}
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

      </div>

      {/* 4. MAIN GRADE LEDGER TABLE (Direct In-Table Touch-Friendly Input) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none print:p-0">
        
        {/* Printable Madrasah KOP (visible when printed) */}
        <div className="p-6 pb-4 border-b-2 border-slate-900/80 hidden print:block space-y-4">
          <div className="flex items-center justify-center gap-6">
            <img src="/logo.png" alt="Logo MTs Darussalam" className="w-16 h-16 object-contain" />
            <div className="text-center">
              <h2 className="text-lg font-black uppercase tracking-wide text-slate-900 leading-tight">
                MADRASAH TSANAWIYAH (MTs) DARUSSALAM NGESONG
              </h2>
              <p className="text-xs font-semibold text-slate-700">
                NSM: {schoolProfile?.nsm || '121235170045'} • NPSN: {schoolProfile?.npsn || '20583492'}
              </p>
              <p className="text-[11px] text-slate-600 italic">
                {schoolProfile?.alamat || 'Jl. Maspait No. 04 Ngesong, Sengon, Kec. Jombang, Kab. Jombang'}
              </p>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-slate-300">
            <h3 className="text-base font-black uppercase text-slate-900 underline">
              REKAPITULASI NILAI HASIL BELAJAR SISWA (PENGETAHUAN & KETRAMPILAN)
            </h3>
            <div className="flex justify-between text-xs font-semibold text-slate-800 pt-2 px-2">
              <span>Kelas: <strong>{currentClassObj.nama}</strong> ({currentClassObj.waliKelas})</span>
              <span>Mata Pelajaran: <strong>{currentMapelObj.nama}</strong></span>
              <span>Semester: <strong>{selectedSemester}</strong></span>
              <span>KKM: <strong>{kkm}</strong></span>
            </div>
          </div>
        </div>

        {/* Mobile Swipe Hint */}
        <div className="sm:hidden px-3 py-1.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Geser tabel ke samping untuk melihat nilai PH & kolom lainnya 👉
          </span>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto relative scrollbar-thin overscroll-x-contain touch-pan-x [-webkit-overflow-scrolling:touch]">
          <table className="min-w-full text-xs border-collapse text-center">
            
            {/* Table Header matching the template locked in Hijau Madrasah theme */}
            <thead>
              {/* Row 1: Top Header */}
              <tr className="border-b border-slate-400">
                <th rowSpan={3} className={`border border-slate-600 px-2 py-2 min-w-[34px] font-black ${THEME_HIJAU_MADRASAH.topIdentity}`}>
                  No
                </th>
                <th rowSpan={3} className={`hidden sm:table-cell print:table-cell border border-slate-600 px-2 py-2 min-w-[70px] font-black ${THEME_HIJAU_MADRASAH.topIdentity}`}>
                  NIS
                </th>
                {/* Nama Column (Bebas digeser di HP, tidak menutupi kolom PH) */}
                <th 
                  rowSpan={3} 
                  className={`border border-slate-600 px-2.5 py-2 min-w-[120px] sm:min-w-[180px] text-left font-black ${THEME_HIJAU_MADRASAH.topIdentity}`}
                >
                  Nama Siswa
                </th>
                <th rowSpan={3} className={`hidden sm:table-cell print:table-cell border border-slate-600 px-1.5 py-2 min-w-[32px] font-black ${THEME_HIJAU_MADRASAH.topIdentity}`}>
                  L/P
                </th>

                {/* KD Top Header */}
                {(viewMode === 'all' || viewMode === 'ph1' || viewMode === 'ph2') && (
                  <th 
                    colSpan={viewMode === 'all' ? (5 * kdCount) : 5} 
                    className={`border border-slate-700 py-2 text-xs sm:text-sm uppercase tracking-wider font-black shadow-inner ${THEME_HIJAU_MADRASAH.topKd}`}
                  >
                    Kompetensi Dasar Pengetahuan dan Ketrampilan
                  </th>
                )}

                {/* Nilai Akhir Top Header */}
                {(viewMode === 'all' || viewMode === 'final') && (
                  <th 
                    colSpan={5} 
                    className={`border border-slate-700 py-2 text-xs uppercase tracking-wider font-black shadow-inner ${THEME_HIJAU_MADRASAH.topSummary}`}
                  >
                    Rekapitulasi Nilai Akhir
                  </th>
                )}
              </tr>

              {/* Row 2: Subheaders (Penilaian Harian) */}
              <tr>
                {viewMode === 'all' ? (
                  Array.from({ length: kdCount }, (_, i) => (
                    <th 
                      key={i} 
                      colSpan={5} 
                      className={`border border-slate-600 py-1.5 text-xs font-black uppercase tracking-wide ${
                        THEME_HIJAU_MADRASAH.phHeaders[i % THEME_HIJAU_MADRASAH.phHeaders.length]
                      }`}
                    >
                      Penilaian Harian {i + 1}
                    </th>
                  ))
                ) : (viewMode === 'ph1' || viewMode === 'ph2') ? (
                  <th 
                    colSpan={5} 
                    className={`border border-slate-600 py-1.5 text-xs font-black uppercase tracking-wide ${
                      viewMode === 'ph1' ? THEME_HIJAU_MADRASAH.phHeaders[0] : THEME_HIJAU_MADRASAH.phHeaders[1]
                    }`}
                  >
                    {viewMode === 'ph1' ? 'Penilaian Harian 1' : 'Penilaian Harian 2'}
                  </th>
                ) : null}
                
                {/* Summary columns spanning across remaining 2 rows */}
                {(viewMode === 'all' || viewMode === 'final') && (
                  <>
                    <th rowSpan={2} className={`border border-slate-600 px-2 py-1.5 min-w-[50px] font-bold ${THEME_HIJAU_MADRASAH.summaryHeaders.rataKd3}`}>
                      Rata KD-3
                    </th>
                    <th rowSpan={2} className={`border border-slate-600 px-2 py-1.5 min-w-[50px] font-bold ${THEME_HIJAU_MADRASAH.summaryHeaders.rataKd4}`}>
                      Rata KD-4
                    </th>
                    <th rowSpan={2} className={`border border-slate-600 px-2 py-1.5 min-w-[55px] font-black text-slate-950 ${THEME_HIJAU_MADRASAH.summaryHeaders.nilaiAkhir}`}>
                      Nilai Akhir
                    </th>
                    <th rowSpan={2} className={`border border-slate-600 px-1.5 py-1.5 min-w-[44px] font-bold ${THEME_HIJAU_MADRASAH.summaryHeaders.predikat}`}>
                      Predikat
                    </th>
                    <th rowSpan={2} className={`border border-slate-600 px-2 py-1.5 min-w-[65px] font-bold ${THEME_HIJAU_MADRASAH.summaryHeaders.keterangan}`}>
                      Keterangan
                    </th>
                  </>
                )}
              </tr>

              {/* Row 3: Sub-columns (PH, Remidi, Praktek, Proyek, Porto F) */}
              <tr>
                {viewMode === 'all' ? (
                  Array.from({ length: kdCount }, (_, i) => (
                    <React.Fragment key={i}>
                      <th className={`border border-slate-400 px-1 py-1 min-w-[50px] text-[11px] ${THEME_HIJAU_MADRASAH.subColumns.ph}`}>
                        PH
                      </th>
                      <th className={`border border-slate-400 px-1 py-1 min-w-[50px] text-[11px] ${THEME_HIJAU_MADRASAH.subColumns.remidi}`}>
                        Remidi
                      </th>
                      <th className={`border border-slate-400 px-1 py-1 min-w-[50px] text-[11px] ${THEME_HIJAU_MADRASAH.subColumns.praktek}`}>
                        Praktek
                      </th>
                      <th className={`border border-slate-400 px-1 py-1 min-w-[50px] text-[11px] ${THEME_HIJAU_MADRASAH.subColumns.proyek}`}>
                        Proyek
                      </th>
                      <th className={`border border-slate-400 px-1 py-1 min-w-[50px] text-[11px] ${THEME_HIJAU_MADRASAH.subColumns.porto}`}>
                        Porto F
                      </th>
                    </React.Fragment>
                  ))
                ) : (viewMode === 'ph1' || viewMode === 'ph2') ? (
                  <>
                    <th className={`border border-slate-400 px-1.5 py-1.5 min-w-[50px] text-xs ${THEME_HIJAU_MADRASAH.subColumns.ph}`}>
                      PH
                    </th>
                    <th className={`border border-slate-400 px-1.5 py-1.5 min-w-[50px] text-xs ${THEME_HIJAU_MADRASAH.subColumns.remidi}`}>
                      Remidi
                    </th>
                    <th className={`border border-slate-400 px-1.5 py-1.5 min-w-[50px] text-xs ${THEME_HIJAU_MADRASAH.subColumns.praktek}`}>
                      Praktek
                    </th>
                    <th className={`border border-slate-400 px-1.5 py-1.5 min-w-[50px] text-xs ${THEME_HIJAU_MADRASAH.subColumns.proyek}`}>
                      Proyek
                    </th>
                    <th className={`border border-slate-400 px-1.5 py-1.5 min-w-[50px] text-xs ${THEME_HIJAU_MADRASAH.subColumns.porto}`}>
                      Porto F
                    </th>
                  </>
                ) : null}
              </tr>
            </thead>

            {/* Table Body with Student Rows */}
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={20} className="py-12 text-center text-slate-400 font-medium">
                    {searchQuery ? 'Tidak ada siswa yang sesuai pencarian.' : `Belum ada siswa di ${currentClassObj.nama}.`}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const studentScore = scores[student.id] || {};
                  const res = calculateStudentResults(student.id);

                  const renderKdCells = (kdIdx) => {
                    const kdKey = `ph${kdIdx + 1}`;
                    const kd = studentScore[kdKey] || {};

                    return (
                      <React.Fragment key={kdIdx}>
                        {/* PH */}
                        <td className="border border-slate-300 p-1 min-w-[50px]">
                          <input
                            id={`score_${student.id}_${kdKey}_ph`}
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="100"
                            value={kd.ph !== undefined ? kd.ph : ''}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => handleInputKeyDown(e, idx, kdKey, 'ph')}
                            onChange={(e) => handleScoreChange(student.id, kdKey, 'ph', e.target.value)}
                            className="w-full h-9 sm:h-10 text-center font-bold text-slate-900 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none rounded-lg text-xs sm:text-sm shadow-2xs"
                            placeholder="-"
                          />
                        </td>

                        {/* Remidi */}
                        <td className="border border-slate-300 p-1 min-w-[50px] bg-amber-50/20">
                          <input
                            id={`score_${student.id}_${kdKey}_remidi`}
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="100"
                            value={kd.remidi !== undefined ? kd.remidi : ''}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => handleInputKeyDown(e, idx, kdKey, 'remidi')}
                            onChange={(e) => handleScoreChange(student.id, kdKey, 'remidi', e.target.value)}
                            className={`w-full h-9 sm:h-10 text-center font-bold rounded-lg text-xs sm:text-sm border focus:ring-2 focus:ring-amber-500/30 focus:outline-none shadow-2xs ${
                              kd.remidi ? 'text-amber-800 bg-amber-100/90 border-amber-300' : 'text-slate-400 bg-white border-slate-200'
                            }`}
                            placeholder="-"
                          />
                        </td>

                        {/* Praktek */}
                        <td className="border border-slate-300 p-1 min-w-[50px]">
                          <input
                            id={`score_${student.id}_${kdKey}_praktek`}
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="100"
                            value={kd.praktek !== undefined ? kd.praktek : ''}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => handleInputKeyDown(e, idx, kdKey, 'praktek')}
                            onChange={(e) => handleScoreChange(student.id, kdKey, 'praktek', e.target.value)}
                            className="w-full h-9 sm:h-10 text-center font-bold text-slate-900 bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 focus:outline-none rounded-lg text-xs sm:text-sm shadow-2xs"
                            placeholder="-"
                          />
                        </td>

                        {/* Proyek */}
                        <td className="border border-slate-300 p-1 min-w-[50px]">
                          <input
                            id={`score_${student.id}_${kdKey}_proyek`}
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="100"
                            value={kd.proyek !== undefined ? kd.proyek : ''}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => handleInputKeyDown(e, idx, kdKey, 'proyek')}
                            onChange={(e) => handleScoreChange(student.id, kdKey, 'proyek', e.target.value)}
                            className="w-full h-9 sm:h-10 text-center font-bold text-slate-900 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none rounded-lg text-xs sm:text-sm shadow-2xs"
                            placeholder="-"
                          />
                        </td>

                        {/* Porto F */}
                        <td className="border border-slate-300 p-1 min-w-[50px]">
                          <input
                            id={`score_${student.id}_${kdKey}_porto`}
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="100"
                            value={kd.porto !== undefined ? kd.porto : ''}
                            onFocus={(e) => e.target.select()}
                            onKeyDown={(e) => handleInputKeyDown(e, idx, kdKey, 'porto')}
                            onChange={(e) => handleScoreChange(student.id, kdKey, 'porto', e.target.value)}
                            className="w-full h-9 sm:h-10 text-center font-bold text-slate-900 bg-white border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none rounded-lg text-xs sm:text-sm shadow-2xs"
                            placeholder="-"
                          />
                        </td>
                      </React.Fragment>
                    );
                  };

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-emerald-50/40 focus-within:bg-emerald-50/70 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}
                    >
                      {/* Identity Cells */}
                      <td className="border border-slate-300 px-2 py-1 text-slate-500 font-medium text-[11px] min-w-[34px]">
                        {idx + 1}
                      </td>
                      <td className="hidden sm:table-cell print:table-cell border border-slate-300 px-1 py-1 text-slate-500 font-mono text-[10px]">
                        {student.nis || '-'}
                      </td>

                      {/* Student Name Column: Bebas geser di HP, tidak menutupi kolom PH */}
                      <td className="border border-slate-300 px-2.5 py-2 text-left font-bold text-slate-900 min-w-[120px] sm:min-w-[180px] max-w-[160px] sm:max-w-none truncate sm:whitespace-normal">
                        {student.nama}
                      </td>

                      <td className="hidden sm:table-cell print:table-cell border border-slate-300 px-1 py-1 font-semibold text-slate-500 text-[11px]">
                        {student.gender || '-'}
                      </td>

                      {/* KD Columns depending on active viewMode */}
                      {viewMode === 'all' && (
                        Array.from({ length: kdCount }, (_, kdIdx) => renderKdCells(kdIdx))
                      )}

                      {viewMode === 'ph1' && renderKdCells(0)}
                      {viewMode === 'ph2' && renderKdCells(1)}

                      {/* Summary Columns */}
                      {(viewMode === 'all' || viewMode === 'final') && (
                        <>
                          <td className={`border border-slate-300 px-2 py-1 font-bold ${THEME_HIJAU_MADRASAH.cellHighlight.kd3}`}>
                            {res.rataKD3 !== null ? res.rataKD3 : '-'}
                          </td>
                          <td className={`border border-slate-300 px-2 py-1 font-bold ${THEME_HIJAU_MADRASAH.cellHighlight.kd4}`}>
                            {res.rataKD4 !== null ? res.rataKD4 : '-'}
                          </td>
                          <td className={`border border-slate-300 px-2 py-1 font-black text-slate-950 text-sm ${THEME_HIJAU_MADRASAH.cellHighlight.akhir}`}>
                            {res.nilaiAkhir !== null ? res.nilaiAkhir : '-'}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1 font-extrabold">
                            {res.predikat !== '-' ? (
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-black shadow-2xs ${
                                res.predikat === 'A' ? 'bg-emerald-600 text-white' :
                                res.predikat === 'B' ? 'bg-blue-600 text-white' :
                                res.predikat === 'C' ? 'bg-amber-500 text-slate-950' :
                                'bg-rose-600 text-white'
                              }`}>
                                {res.predikat}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="border border-slate-300 px-1.5 py-1 font-bold text-[11px]">
                            {res.isFilled ? (
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                res.isTuntas 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {res.isTuntas ? 'Tuntas' : 'Belum'}
                              </span>
                            ) : '-'}
                          </td>
                        </>
                      )}

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Official Signatures Kop (Print View) */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-10 p-6 text-center text-xs text-slate-900 border-t border-slate-200 mt-6">
          <div>
            <p className="font-semibold">Mengetahui,</p>
            <p className="font-bold">Kepala MTs Darussalam Ngesong</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{schoolProfile?.kepalaSekolah || 'H. Ahmad Syarifuddin, S.Pd.I.'}</p>
            <p className="text-[11px] text-slate-600">NIP. {schoolProfile?.nipKepalaSekolah || '-'}</p>
          </div>

          <div>
            <p className="font-semibold">Jombang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">Guru Mata Pelajaran</p>
            <div className="h-20" />
            <p className="font-bold underline uppercase">{guruPengampu || currentClassObj.waliKelas || '...........................................'}</p>
            <p className="text-[11px] text-slate-600">NIP. -</p>
          </div>
        </div>

      </div>

      {/* 5. MENU SIMPAN DI BAGIAN BAWAH (Sesuai Permintaan) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
        
        {/* Status Keterangan Simpan */}
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 font-bold animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              Menyimpan data nilai ke cloud...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-bold animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Nilai kelas {currentClassObj.nama} berhasil tersimpan di cloud!
            </span>
          )}
          {saveStatus !== 'saving' && saveStatus !== 'saved' && (
            <span className="text-xs text-slate-500 font-medium">
              Data otomatis disinkronkan, atau klik tombol simpan untuk memastikan.
            </span>
          )}
        </div>

        {/* Tombol Simpan Utama di Bawah */}
        <button
          type="button"
          onClick={() => handleSave()}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3 rounded-xl text-sm shadow-md shadow-emerald-900/15 transition active:scale-95"
        >
          <Save className="w-5 h-5" />
          <span>Simpan Rekapitulasi Nilai</span>
        </button>

      </div>

      {/* 6. BATCH FILL MODAL (Isi Cepat) */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Isi Nilai Cepat (Batch Fill)</h3>
                  <p className="text-[11px] text-slate-500">Terapkan nilai yang sama ke semua siswa di {currentClassObj.nama}</p>
                </div>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pilih Kolom Nilai</label>
                <select
                  value={batchTarget}
                  onChange={(e) => setBatchTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <optgroup label="Penilaian Harian 1">
                    <option value="ph1_ph">PH 1 - Ulangan Harian (PH)</option>
                    <option value="ph1_praktek">PH 1 - Praktek</option>
                    <option value="ph1_proyek">PH 1 - Proyek</option>
                    <option value="ph1_porto">PH 1 - Porto F</option>
                  </optgroup>
                  <optgroup label="Penilaian Harian 2">
                    <option value="ph2_ph">PH 2 - Ulangan Harian (PH)</option>
                    <option value="ph2_praktek">PH 2 - Praktek</option>
                    <option value="ph2_proyek">PH 2 - Proyek</option>
                    <option value="ph2_porto">PH 2 - Porto F</option>
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nilai yang akan diisikan (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={batchScore}
                  onChange={(e) => setBatchScore(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                ⚠️ Catatan: Aksi ini akan mengisi nilai kolom terpilih untuk seluruh siswa ({classStudents.length} siswa) di kelas {currentClassObj.nama}.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={applyBatchFill}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition"
              >
                Terapkan Nilai
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
