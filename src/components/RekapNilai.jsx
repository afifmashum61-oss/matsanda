import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  SlidersHorizontal,
  Sparkles, 
  RefreshCw,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  User,
  Layers,
  Palette,
  Eye
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MATA_PELAJARAN_MTS } from '../data/initialData';
import { getGrades, saveGradeForClassSubject } from '../utils/storage';

// Curated Professional Color Themes
const COLOR_THEMES = {
  emerald: {
    id: 'emerald',
    name: 'Hijau Madrasah',
    colorDot: 'bg-emerald-600',
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
  },
  ocean: {
    id: 'ocean',
    name: 'Biru Samudra',
    colorDot: 'bg-blue-600',
    topIdentity: 'bg-slate-900 text-white border-slate-800',
    topKd: 'bg-gradient-to-r from-blue-900 via-indigo-800 to-cyan-800 text-white border-blue-950',
    topSummary: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-cyan-700',
    phHeaders: [
      'bg-blue-800 text-white border-blue-900',
      'bg-cyan-700 text-white border-cyan-800',
      'bg-sky-700 text-white border-sky-800',
      'bg-indigo-800 text-white border-indigo-900',
    ],
    summaryHeaders: {
      rataKd3: 'bg-blue-700 text-white border-blue-800',
      rataKd4: 'bg-cyan-600 text-white border-cyan-700',
      nilaiAkhir: 'bg-sky-400 text-slate-950 font-black border-sky-500',
      predikat: 'bg-indigo-700 text-white border-indigo-800',
      keterangan: 'bg-slate-800 text-white border-slate-900',
    },
    subColumns: {
      ph: 'bg-blue-100 text-blue-950 border-blue-300 font-bold',
      remidi: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
      praktek: 'bg-cyan-100 text-cyan-950 border-cyan-300 font-bold',
      proyek: 'bg-teal-100 text-teal-950 border-teal-300 font-bold',
      porto: 'bg-sky-100 text-sky-950 border-sky-300 font-bold',
    },
    cellHighlight: {
      kd3: 'bg-blue-50/70 text-blue-950 font-bold',
      kd4: 'bg-cyan-50/70 text-cyan-950 font-bold',
      akhir: 'bg-sky-100 text-sky-950 font-black',
    }
  },
  royal: {
    id: 'royal',
    name: 'Ungu Elegan',
    colorDot: 'bg-purple-600',
    topIdentity: 'bg-slate-900 text-white border-slate-800',
    topKd: 'bg-gradient-to-r from-purple-900 via-indigo-900 to-violet-800 text-white border-purple-950',
    topSummary: 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border-fuchsia-700',
    phHeaders: [
      'bg-purple-800 text-white border-purple-900',
      'bg-indigo-800 text-white border-indigo-900',
      'bg-violet-800 text-white border-violet-900',
      'bg-fuchsia-800 text-white border-fuchsia-900',
    ],
    summaryHeaders: {
      rataKd3: 'bg-purple-700 text-white border-purple-800',
      rataKd4: 'bg-indigo-600 text-white border-indigo-700',
      nilaiAkhir: 'bg-amber-400 text-amber-950 font-black border-amber-500',
      predikat: 'bg-violet-700 text-white border-violet-800',
      keterangan: 'bg-slate-800 text-white border-slate-900',
    },
    subColumns: {
      ph: 'bg-purple-100 text-purple-950 border-purple-300 font-bold',
      remidi: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
      praktek: 'bg-violet-100 text-violet-950 border-violet-300 font-bold',
      proyek: 'bg-indigo-100 text-indigo-950 border-indigo-300 font-bold',
      porto: 'bg-fuchsia-100 text-fuchsia-950 border-fuchsia-300 font-bold',
    },
    cellHighlight: {
      kd3: 'bg-purple-50/70 text-purple-950 font-bold',
      kd4: 'bg-violet-50/70 text-violet-950 font-bold',
      akhir: 'bg-amber-100 text-amber-950 font-black',
    }
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Coral',
    colorDot: 'bg-orange-500',
    topIdentity: 'bg-stone-900 text-white border-stone-800',
    topKd: 'bg-gradient-to-r from-orange-700 via-amber-700 to-rose-700 text-white border-orange-800',
    topSummary: 'bg-gradient-to-r from-rose-600 to-red-600 text-white border-rose-700',
    phHeaders: [
      'bg-orange-600 text-white border-orange-700',
      'bg-amber-600 text-white border-amber-700',
      'bg-rose-600 text-white border-rose-700',
      'bg-red-700 text-white border-red-800',
    ],
    summaryHeaders: {
      rataKd3: 'bg-orange-600 text-white border-orange-700',
      rataKd4: 'bg-amber-600 text-white border-amber-700',
      nilaiAkhir: 'bg-amber-300 text-amber-950 font-black border-amber-400',
      predikat: 'bg-rose-600 text-white border-rose-700',
      keterangan: 'bg-stone-800 text-white border-stone-900',
    },
    subColumns: {
      ph: 'bg-orange-100 text-orange-950 border-orange-300 font-bold',
      remidi: 'bg-rose-100 text-rose-950 border-rose-300 font-bold',
      praktek: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
      proyek: 'bg-yellow-100 text-yellow-950 border-yellow-300 font-bold',
      porto: 'bg-teal-100 text-teal-950 border-teal-300 font-bold',
    },
    cellHighlight: {
      kd3: 'bg-orange-50/70 text-orange-950 font-bold',
      kd4: 'bg-amber-50/70 text-amber-950 font-bold',
      akhir: 'bg-amber-100 text-amber-950 font-black',
    }
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
  const [kdCount, setKdCount] = useState(2); // Default 2: PH 1 & PH 2
  const [kkm, setKkm] = useState(75);
  const [guruPengampu, setGuruPengampu] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // 'saved' | 'saving' | 'dirty' | ''
  
  // Mobile & Simplicity UX States
  const [showSettings, setShowSettings] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'ph1' | 'ph2' | 'ph3' | 'final'
  const [activeStudentModal, setActiveStudentModal] = useState(null);

  // Batch Fill Modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchTarget, setBatchTarget] = useState('ph1_ph');
  const [batchScore, setBatchScore] = useState(80);

  // Theme selection
  const [activeThemeKey, setActiveThemeKey] = useState(() => {
    return localStorage.getItem('mts_grade_theme') || 'emerald';
  });
  const currentTheme = COLOR_THEMES[activeThemeKey] || COLOR_THEMES.emerald;

  const handleSelectTheme = (themeKey) => {
    setActiveThemeKey(themeKey);
    localStorage.setItem('mts_grade_theme', themeKey);
  };

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

  // Modal Student Navigation
  const handleNextStudent = () => {
    if (!activeStudentModal) return;
    const curIdx = filteredStudents.findIndex(s => s.id === activeStudentModal.id);
    if (curIdx < filteredStudents.length - 1) {
      setActiveStudentModal(filteredStudents[curIdx + 1]);
    }
  };

  const handlePrevStudent = () => {
    if (!activeStudentModal) return;
    const curIdx = filteredStudents.findIndex(s => s.id === activeStudentModal.id);
    if (curIdx > 0) {
      setActiveStudentModal(filteredStudents[curIdx - 1]);
    }
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
      
      {/* 1. SIMPLE & COMPACT TOP BAR (Optimized for Mobile Screens) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 no-print">
        
        {/* Row 1: Title, Quick Status & Action Buttons */}
        <div className="flex items-center justify-between gap-2">
          
          {/* Left: Compact Title & Badge */}
          <div className="flex items-center gap-2 min-w-0">
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

          {/* Right: Cloud Status & Quick Buttons */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {saveStatus === 'saving' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-semibold">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Simpan...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 font-semibold">
                <CheckCircle className="w-3 h-3" />
                Tersimpan
              </span>
            )}

            {/* Quick Save Button */}
            <button
              onClick={() => handleSave()}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan</span>
            </button>

            {/* More Actions Dropdown Menu (Export, Cetak, Isi Cepat) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreActions(!showMoreActions)}
                className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition"
                title="Aksi Tambahan"
              >
                <MoreVertical className="w-4 h-4" />
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
        </div>

        {/* Row 2: Two Essential Dropdowns (Kelas & Mapel) + Settings Toggle */}
        <div className="grid grid-cols-12 gap-2 pt-1">
          
          {/* Kelas Selector */}
          <div className="col-span-4 sm:col-span-3">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
          </div>

          {/* Mata Pelajaran Selector */}
          <div className="col-span-8 sm:col-span-6">
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none truncate"
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

          {/* Settings & Filter Toggle Button */}
          <div className="col-span-12 sm:col-span-3 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition border ${
                showSettings 
                  ? 'bg-slate-900 text-white border-slate-900' 
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showSettings ? 'Tutup Pengaturan' : 'Pengaturan & KKM'}</span>
              {showSettings ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 ml-0.5" />}
            </button>
          </div>

        </div>

        {/* Collapsible Secondary Settings (KKM, Semester, Guru, Jumlah KD, Tema Warna) */}
        {showSettings && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 pt-3 animate-fadeIn">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">KKM Mapel</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={kkm}
                  onChange={(e) => {
                    setKkm(Number(e.target.value));
                    setSaveStatus('dirty');
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Semester</label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Jumlah KD / PH</label>
                <select
                  value={kdCount}
                  onChange={(e) => {
                    setKdCount(Number(e.target.value));
                    setSaveStatus('dirty');
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={2}>2 PH (Standar)</option>
                  <option value={3}>3 Penilaian Harian</option>
                  <option value={4}>4 Penilaian Harian</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1">Guru Pengampu</label>
                <input
                  type="text"
                  placeholder="Nama Guru Mapel..."
                  value={guruPengampu}
                  onChange={(e) => {
                    setGuruPengampu(e.target.value);
                    setSaveStatus('dirty');
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

            </div>

            {/* Tema Warna Switcher */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-600" />
                Pilihan Tema Warna:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {Object.values(COLOR_THEMES).map((theme) => {
                  const isSelected = activeThemeKey === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold transition border ${
                        isSelected
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${theme.colorDot}`} />
                      <span>{theme.name}</span>
                      {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 2. COMPACT SUMMARY STRIP (1-Line Stat Chips instead of 4 big boxes) */}
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

      {/* 3. MOBILE COLUMN FILTER TABS & SEARCH (Solves horizontal swiping frustration) */}
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
            📝 PH 1 (Pas Layar HP)
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
            📝 PH 2 (Pas Layar HP)
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

      {/* 4. MAIN GRADE LEDGER TABLE (Optimized with Sticky Name Column & Mobile Width) */}
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

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto relative">
          <table className="w-full text-xs border-collapse text-center">
            
            {/* Table Header matching the template and active view mode */}
            <thead>
              {/* Row 1: Top Header */}
              <tr className="border-b border-slate-400">
                <th rowSpan={3} className={`border border-slate-600 px-2 py-2 min-w-[34px] font-black ${currentTheme.topIdentity}`}>
                  No
                </th>
                <th rowSpan={3} className={`border border-slate-600 px-2 py-2 min-w-[70px] font-black ${currentTheme.topIdentity}`}>
                  NIS
                </th>
                {/* Frozen Sticky Nama Column on Mobile & Desktop */}
                <th 
                  rowSpan={3} 
                  className={`border border-slate-600 px-3 py-2 min-w-[170px] max-w-[220px] text-left font-black sticky left-0 z-20 shadow-sm ${currentTheme.topIdentity}`}
                >
                  Nama Siswa
                </th>
                <th rowSpan={3} className={`border border-slate-600 px-1.5 py-2 min-w-[32px] font-black ${currentTheme.topIdentity}`}>
                  L/P
                </th>

                {/* KD Top Header */}
                {(viewMode === 'all' || viewMode === 'ph1' || viewMode === 'ph2') && (
                  <th 
                    colSpan={viewMode === 'all' ? (5 * kdCount) : 5} 
                    className={`border border-slate-700 py-2 text-xs sm:text-sm uppercase tracking-wider font-black shadow-inner ${currentTheme.topKd}`}
                  >
                    Kompetensi Dasar Pengetahuan dan Ketrampilan
                  </th>
                )}

                {/* Nilai Akhir Top Header */}
                {(viewMode === 'all' || viewMode === 'final') && (
                  <th 
                    colSpan={5} 
                    className={`border border-slate-700 py-2 text-xs uppercase tracking-wider font-black shadow-inner ${currentTheme.topSummary}`}
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
                        currentTheme.phHeaders[i % currentTheme.phHeaders.length]
                      }`}
                    >
                      Penilaian Harian {i + 1}
                    </th>
                  ))
                ) : (viewMode === 'ph1' || viewMode === 'ph2') ? (
                  <th 
                    colSpan={5} 
                    className={`border border-slate-600 py-1.5 text-xs font-black uppercase tracking-wide ${
                      viewMode === 'ph1' ? currentTheme.phHeaders[0] : currentTheme.phHeaders[1]
                    }`}
                  >
                    {viewMode === 'ph1' ? 'Penilaian Harian 1' : 'Penilaian Harian 2'}
                  </th>
                ) : null}
                
                {/* Summary columns spanning across remaining 2 rows */}
                {(viewMode === 'all' || viewMode === 'final') && (
                  <>
                    <th rowSpan={2} className={`border border-slate-600 px-2 py-1.5 min-w-[50px] font-bold ${currentTheme.summaryHeaders.rataKd3}`}>
                      Rata KD-3
                    </th>
                    <th rowSpan={2} className={`border border-slate-600 px-2 py-1.5 min-w-[50px] font-bold ${currentTheme.summaryHeaders.rataKd4}`}>
                      Rata KD-4
                    </th>
                    <th rowSpan={2} className={`border border-slate-600 px-2 py-1.5 min-w-[55px] font-black text-slate-950 ${currentTheme.summaryHeaders.nilaiAkhir}`}>
                      Nilai Akhir
                    </th>
                    <th rowSpan={2} className={`border border-slate-600 px-1.5 py-1.5 min-w-[44px] font-bold ${currentTheme.summaryHeaders.predikat}`}>
                      Predikat
                    </th>
                    <th rowSpan={2} className={`border border-slate-600 px-2 py-1.5 min-w-[65px] font-bold ${currentTheme.summaryHeaders.keterangan}`}>
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
                      <th className={`border border-slate-400 px-1.5 py-1 min-w-[46px] text-[11px] ${currentTheme.subColumns.ph}`}>
                        PH
                      </th>
                      <th className={`border border-slate-400 px-1.5 py-1 min-w-[46px] text-[11px] ${currentTheme.subColumns.remidi}`}>
                        Remidi
                      </th>
                      <th className={`border border-slate-400 px-1.5 py-1 min-w-[46px] text-[11px] ${currentTheme.subColumns.praktek}`}>
                        Praktek
                      </th>
                      <th className={`border border-slate-400 px-1.5 py-1 min-w-[46px] text-[11px] ${currentTheme.subColumns.proyek}`}>
                        Proyek
                      </th>
                      <th className={`border border-slate-400 px-1.5 py-1 min-w-[46px] text-[11px] ${currentTheme.subColumns.porto}`}>
                        Porto F
                      </th>
                    </React.Fragment>
                  ))
                ) : (viewMode === 'ph1' || viewMode === 'ph2') ? (
                  <>
                    <th className={`border border-slate-400 px-2 py-1.5 min-w-[50px] text-xs ${currentTheme.subColumns.ph}`}>
                      PH
                    </th>
                    <th className={`border border-slate-400 px-2 py-1.5 min-w-[50px] text-xs ${currentTheme.subColumns.remidi}`}>
                      Remidi
                    </th>
                    <th className={`border border-slate-400 px-2 py-1.5 min-w-[50px] text-xs ${currentTheme.subColumns.praktek}`}>
                      Praktek
                    </th>
                    <th className={`border border-slate-400 px-2 py-1.5 min-w-[50px] text-xs ${currentTheme.subColumns.proyek}`}>
                      Proyek
                    </th>
                    <th className={`border border-slate-400 px-2 py-1.5 min-w-[50px] text-xs ${currentTheme.subColumns.porto}`}>
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

                  // Function to render a single KD block
                  const renderKdCells = (kdIdx) => {
                    const kdKey = `ph${kdIdx + 1}`;
                    const kd = studentScore[kdKey] || {};

                    return (
                      <React.Fragment key={kdIdx}>
                        {/* PH */}
                        <td className="border border-slate-300 p-0.5">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="100"
                            value={kd.ph !== undefined ? kd.ph : ''}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleScoreChange(student.id, kdKey, 'ph', e.target.value)}
                            className="w-full text-center py-2 px-1 font-semibold text-slate-900 bg-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded text-xs"
                            placeholder="-"
                          />
                        </td>

                        {/* Remidi */}
                        <td className="border border-slate-300 p-0.5 bg-amber-50/20">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="100"
                            value={kd.remidi !== undefined ? kd.remidi : ''}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleScoreChange(student.id, kdKey, 'remidi', e.target.value)}
                            className={`w-full text-center py-2 px-1 font-bold rounded text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                              kd.remidi ? 'text-amber-800 bg-amber-100/90 border border-amber-300' : 'text-slate-400 bg-transparent'
                            }`}
                            placeholder="-"
                          />
                        </td>

                        {/* Praktek */}
                        <td className="border border-slate-300 p-0.5">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="100"
                            value={kd.praktek !== undefined ? kd.praktek : ''}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleScoreChange(student.id, kdKey, 'praktek', e.target.value)}
                            className="w-full text-center py-2 px-1 font-semibold text-slate-900 bg-transparent focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none rounded text-xs"
                            placeholder="-"
                          />
                        </td>

                        {/* Proyek */}
                        <td className="border border-slate-300 p-0.5">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="100"
                            value={kd.proyek !== undefined ? kd.proyek : ''}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleScoreChange(student.id, kdKey, 'proyek', e.target.value)}
                            className="w-full text-center py-2 px-1 font-semibold text-slate-900 bg-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded text-xs"
                            placeholder="-"
                          />
                        </td>

                        {/* Porto F */}
                        <td className="border border-slate-300 p-0.5">
                          <input
                            type="number"
                            inputMode="numeric"
                            min="0"
                            max="100"
                            value={kd.porto !== undefined ? kd.porto : ''}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => handleScoreChange(student.id, kdKey, 'porto', e.target.value)}
                            className="w-full text-center py-2 px-1 font-semibold text-slate-900 bg-transparent focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none rounded text-xs"
                            placeholder="-"
                          />
                        </td>
                      </React.Fragment>
                    );
                  };

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-emerald-50/40 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}
                    >
                      {/* Identity Cells */}
                      <td className="border border-slate-300 px-2 py-1 text-slate-500 font-medium text-[11px]">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 text-slate-500 font-mono text-[10px]">
                        {student.nis || '-'}
                      </td>

                      {/* Sticky Frozen Student Name Column (Tap to open full card) */}
                      <td 
                        className="border border-slate-300 px-2.5 py-1 text-left font-bold text-slate-900 whitespace-nowrap sticky left-0 z-10 bg-white shadow-xs cursor-pointer hover:text-emerald-700 group"
                        onClick={() => setActiveStudentModal(student)}
                        title="Klik untuk membuka kartu input cepat siswa ini"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate">{student.nama}</span>
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 flex-shrink-0" />
                        </div>
                      </td>

                      <td className="border border-slate-300 px-1 py-1 font-semibold text-slate-500 text-[11px]">
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
                          <td className={`border border-slate-300 px-2 py-1 font-bold ${currentTheme.cellHighlight.kd3}`}>
                            {res.rataKD3 !== null ? res.rataKD3 : '-'}
                          </td>
                          <td className={`border border-slate-300 px-2 py-1 font-bold ${currentTheme.cellHighlight.kd4}`}>
                            {res.rataKD4 !== null ? res.rataKD4 : '-'}
                          </td>
                          <td className={`border border-slate-300 px-2 py-1 font-black text-slate-950 text-sm ${currentTheme.cellHighlight.akhir}`}>
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
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
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

      {/* 5. QUICK INDIVIDUAL STUDENT CARD MODAL (Makes mobile input super easy!) */}
      {activeStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 no-print animate-fadeIn">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 border border-slate-100 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">
                    {activeStudentModal.nama}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    NIS: {activeStudentModal.nis || '-'} • {currentClassObj.nama} • {currentMapelObj.nama}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveStudentModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inputs Per KD */}
            <div className="space-y-4">
              {Array.from({ length: kdCount }, (_, kdIdx) => {
                const kdKey = `ph${kdIdx + 1}`;
                const studentScore = scores[activeStudentModal.id] || {};
                const kd = studentScore[kdKey] || {};

                return (
                  <div key={kdIdx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                        Penilaian Harian {kdIdx + 1}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        KD {kdIdx + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">PH (Ulangan)</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="100"
                          value={kd.ph !== undefined ? kd.ph : ''}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleScoreChange(activeStudentModal.id, kdKey, 'ph', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl py-2 px-2 text-center text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          placeholder="-"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-amber-700 mb-1">Remidi</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="100"
                          value={kd.remidi !== undefined ? kd.remidi : ''}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleScoreChange(activeStudentModal.id, kdKey, 'remidi', e.target.value)}
                          className="w-full bg-amber-50/60 border border-amber-300 rounded-xl py-2 px-2 text-center text-sm font-bold text-amber-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          placeholder="-"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Praktek</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="100"
                          value={kd.praktek !== undefined ? kd.praktek : ''}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleScoreChange(activeStudentModal.id, kdKey, 'praktek', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl py-2 px-2 text-center text-sm font-bold text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                          placeholder="-"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Proyek</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="100"
                          value={kd.proyek !== undefined ? kd.proyek : ''}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleScoreChange(activeStudentModal.id, kdKey, 'proyek', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl py-2 px-2 text-center text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                          placeholder="-"
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-[10px] font-bold text-slate-600 mb-1">Porto F</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="0"
                          max="100"
                          value={kd.porto !== undefined ? kd.porto : ''}
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => handleScoreChange(activeStudentModal.id, kdKey, 'porto', e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl py-2 px-2 text-center text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          placeholder="-"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Calculated Summary for this student */}
              {(() => {
                const res = calculateStudentResults(activeStudentModal.id);
                return (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs font-bold text-slate-800">
                    <div>
                      <p className="text-[10px] text-amber-800 font-semibold">Hasil Akhir Siswa:</p>
                      <p className="text-sm font-black text-slate-950">
                        Nilai: {res.nilaiAkhir !== null ? res.nilaiAkhir : '-'} (Predikat: {res.predikat})
                      </p>
                    </div>
                    <div>
                      {res.isFilled ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                          res.isTuntas ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {res.isTuntas ? 'Tuntas' : 'Belum Tuntas'}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">Belum Lengkap</span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Navigation buttons: Prev & Next Student */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrevStudent}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveStudentModal(null)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                Selesai
              </button>

              <button
                type="button"
                onClick={handleNextStudent}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                <span>Berikutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 6. BATCH FILL MODAL */}
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
