import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Printer, 
  Save, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  BookOpen, 
  Users, 
  Filter, 
  TrendingUp, 
  Sparkles, 
  RefreshCw,
  Search,
  Check,
  ChevronDown,
  Layers,
  Info,
  Palette
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
    accentBorder: 'border-emerald-500',
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
    accentBorder: 'border-blue-500',
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
    accentBorder: 'border-purple-500',
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
    accentBorder: 'border-orange-500',
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
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchTarget, setBatchTarget] = useState('ph1_ph');
  const [batchScore, setBatchScore] = useState(80);

  // Theme selection: defaults to 'emerald' (Hijau Madrasah)
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
    // Sanitize value: allow empty or numbers 0-100
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
    
    // Knowledge (KD-3): PH vs Remidi per KD
    const effectiveKnowledgeScores = [];
    // Skills (KD-4): Praktek, Proyek, Porto F per KD
    const skillAverages = [];

    for (let i = 1; i <= kdCount; i++) {
      const kdKey = `ph${i}`;
      const kd = studentScore[kdKey] || {};

      // KD 3: If Remidi is filled and valid, use Remidi; else use PH
      let effectivePh = null;
      if (kd.remidi !== undefined && kd.remidi !== '' && !isNaN(kd.remidi)) {
        effectivePh = Number(kd.remidi);
      } else if (kd.ph !== undefined && kd.ph !== '' && !isNaN(kd.ph)) {
        effectivePh = Number(kd.ph);
      }
      if (effectivePh !== null) {
        effectiveKnowledgeScores.push(effectivePh);
      }

      // KD 4: Average of filled Praktek, Proyek, Porto F
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

    // Prepare header rows
    const sheetData = [
      [`MADRASAH TSANAWIYAH (MTs) DARUSSALAM NGESONG JOMBANG`],
      [`REKAPITULASI NILAI HASIL BELAJAR SISWA - TAHUN AJARAN ${schoolProfile?.tahunAjaran || '2026/2027'}`],
      [`Kelas: ${currentClassObj.nama}`, `Mata Pelajaran: ${currentMapelObj.nama}`, `Semester: ${selectedSemester}`, `KKM: ${kkm}`, `Guru: ${guruPengampu || '-'}`],
      [], // blank line
    ];

    // Row 5 (index 4): Top Header
    const rowTop = ['No', 'NIS', 'Nama Siswa', 'L/P'];
    const kdTotalCols = 5 * kdCount;
    rowTop.push('Kompetensi Dasar Pengetahuan dan Ketrampilan');
    for (let c = 1; c < kdTotalCols; c++) rowTop.push('');
    rowTop.push('Rekapitulasi Nilai Akhir', '', '', '', '');
    sheetData.push(rowTop);

    // Row 6 (index 5): Subheader (Penilaian Harian 1, 2, etc.)
    const rowSub = ['', '', '', ''];
    for (let i = 1; i <= kdCount; i++) {
      rowSub.push(`Penilaian Harian ${i}`, '', '', '', '');
    }
    rowSub.push('Rata KD-3', 'Rata KD-4', 'Nilai Akhir', 'Predikat', 'Keterangan');
    sheetData.push(rowSub);

    // Row 7 (index 6): Field Columns (PH, Remidi, Praktek, Proyek, Porto F)
    const rowFields = ['', '', '', ''];
    for (let i = 1; i <= kdCount; i++) {
      rowFields.push('PH', 'Remidi', 'Praktek', 'Proyek', 'Porto F');
    }
    rowFields.push('', '', '', '', '');
    sheetData.push(rowFields);

    // Data rows
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
      { s: { r: 4, c: 0 }, e: { r: 6, c: 0 } }, // No
      { s: { r: 4, c: 1 }, e: { r: 6, c: 1 } }, // NIS
      { s: { r: 4, c: 2 }, e: { r: 6, c: 2 } }, // Nama Siswa
      { s: { r: 4, c: 3 }, e: { r: 6, c: 3 } }, // L/P
      { s: { r: 4, c: 4 }, e: { r: 4, c: 4 + kdTotalCols - 1 } }, // Kompetensi Dasar
      { s: { r: 4, c: 4 + kdTotalCols }, e: { r: 4, c: 4 + kdTotalCols + 4 } }, // Nilai Akhir
      { s: { r: 5, c: 4 + kdTotalCols }, e: { r: 6, c: 4 + kdTotalCols } }, // Rata KD-3
      { s: { r: 5, c: 4 + kdTotalCols + 1 }, e: { r: 6, c: 4 + kdTotalCols + 1 } }, // Rata KD-4
      { s: { r: 5, c: 4 + kdTotalCols + 2 }, e: { r: 6, c: 4 + kdTotalCols + 2 } }, // Nilai Akhir
      { s: { r: 5, c: 4 + kdTotalCols + 3 }, e: { r: 6, c: 4 + kdTotalCols + 3 } }, // Predikat
      { s: { r: 5, c: 4 + kdTotalCols + 4 }, e: { r: 6, c: 4 + kdTotalCols + 4 } }, // Keterangan
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
    <div className="space-y-6">
      
      {/* Top Filter and Controls Bar (Hidden during print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-200 shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Rekapitulasi Nilai Siswa</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs">
                  Format Resmi MTs
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ledger nilai Pengetahuan (PH & Remidi) dan Ketrampilan (Praktek, Proyek, Porto F) sesuai standar raport madrasah.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fadeIn">
                <CheckCircle className="w-4 h-4" />
                Tersimpan di Cloud
              </span>
            )}
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Menyimpan...
              </span>
            )}

            <button
              onClick={() => setShowBatchModal(true)}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition"
              title="Isi nilai default untuk seluruh siswa sekaligus"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Isi Cepat</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold px-3 py-2 rounded-xl text-xs transition shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={() => handleSave()}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan</span>
            </button>
          </div>
        </div>

        {/* Dropdowns & Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Kelas */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
          </div>

          {/* Mata Pelajaran */}
          <div className="col-span-2 sm:col-span-1 lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Mata Pelajaran</label>
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
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

          {/* Semester */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Semester</label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Ganjil">Semester Ganjil</option>
              <option value="Genap">Semester Genap</option>
            </select>
          </div>

          {/* KKM */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">KKM Mapel</label>
            <input
              type="number"
              min="0"
              max="100"
              value={kkm}
              onChange={(e) => {
                setKkm(Number(e.target.value));
                setSaveStatus('dirty');
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Jumlah KD (PH) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Jumlah KD / PH</label>
            <select
              value={kdCount}
              onChange={(e) => {
                setKdCount(Number(e.target.value));
                setSaveStatus('dirty');
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value={2}>2 PH (Sesuai Gambar)</option>
              <option value={3}>3 Penilaian Harian</option>
              <option value={4}>4 Penilaian Harian</option>
            </select>
          </div>

        </div>

        {/* Secondary Info Bar: Guru Pengampu, Search & Theme Selector */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* Guru Pengampu */}
          <div className="w-full lg:w-72">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Guru Pengampu</label>
            <input
              type="text"
              placeholder="Nama Guru Pengampu Mapel..."
              value={guruPengampu}
              onChange={(e) => {
                setGuruPengampu(e.target.value);
                setSaveStatus('dirty');
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Search Siswa */}
          <div className="w-full lg:w-64">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Cari Siswa</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama atau NIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Color Theme Selector Pills */}
          <div className="w-full lg:w-auto">
            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tema Warna Tabel</span>
            </label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {Object.values(COLOR_THEMES).map((theme) => {
                const isSelected = activeThemeKey === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${theme.colorDot}`} />
                    <span>{theme.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* Statistics Cards (Hidden during print) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs border-t-4 border-t-slate-700">
          <p className="text-[11px] font-semibold text-slate-500">Total Siswa Kelas</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-xl font-black text-slate-900">{statistics.totalStudents}</p>
            <span className="text-[11px] text-slate-400">({statistics.filledCount} terisi)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs border-t-4 border-t-emerald-600">
          <p className="text-[11px] font-semibold text-slate-500">Rata-rata Nilai Kelas</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-xl font-black text-emerald-600">{statistics.average}</p>
            <span className="text-[11px] text-slate-400">KKM: {kkm}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs border-t-4 border-t-blue-600">
          <p className="text-[11px] font-semibold text-slate-500">Ketuntasan Belajar</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-xl font-black text-blue-600">{statistics.tuntasPercent}%</p>
            <span className="text-[11px] text-slate-400">({statistics.tuntasCount} tuntas)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs border-t-4 border-t-amber-500">
          <p className="text-[11px] font-semibold text-slate-500">Nilai Tertinggi / Terendah</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-lg font-black text-slate-900">{statistics.highest}</p>
            <span className="text-slate-400 font-bold">/</span>
            <p className="text-lg font-black text-rose-600">{statistics.lowest}</p>
          </div>
        </div>
      </div>

      {/* Main Grade Ledger Card / Printable Document */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none print:p-0">
        
        {/* Printable Madrasah KOP (visible when printed or in preview) */}
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

        {/* Informative helper for user on desktop/mobile */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-sky-50/50 border-b border-emerald-100 flex items-center justify-between no-print text-[11px] text-slate-800">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              Tabel otomatis menghitung <strong>Rata KD-3</strong> (Pengetahuan PH/Remidi), <strong>Rata KD-4</strong> (Ketrampilan Praktek/Proyek/Porto), dan <strong>Nilai Akhir</strong>. Nilai tersimpan realtime.
            </span>
          </div>
          <span className="hidden sm:inline font-bold text-emerald-800">
            {currentClassObj.nama} • {currentMapelObj.nama}
          </span>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse text-center">
            
            {/* Table Header with Modern, High-Contrast Harmonious Theme */}
            <thead>
              {/* Row 1: Top Header */}
              <tr className="border-b border-slate-400">
                <th rowSpan={3} className={`border border-slate-600 px-2 py-2 min-w-[36px] font-black ${currentTheme.topIdentity}`}>
                  No
                </th>
                <th rowSpan={3} className={`border border-slate-600 px-2 py-2 min-w-[80px] font-black ${currentTheme.topIdentity}`}>
                  NIS
                </th>
                <th rowSpan={3} className={`border border-slate-600 px-3 py-2 min-w-[190px] text-left font-black ${currentTheme.topIdentity}`}>
                  Nama Siswa
                </th>
                <th rowSpan={3} className={`border border-slate-600 px-1.5 py-2 min-w-[36px] font-black ${currentTheme.topIdentity}`}>
                  L/P
                </th>
                <th 
                  colSpan={5 * kdCount} 
                  className={`border border-slate-700 py-2.5 text-sm uppercase tracking-wider font-black shadow-inner ${currentTheme.topKd}`}
                >
                  Kompetensi Dasar Pengetahuan dan Ketrampilan
                </th>
                <th 
                  colSpan={5} 
                  className={`border border-slate-700 py-2.5 text-xs uppercase tracking-wider font-black shadow-inner ${currentTheme.topSummary}`}
                >
                  Rekapitulasi Nilai Akhir
                </th>
              </tr>

              {/* Row 2: Penilaian Harian Subheaders */}
              <tr>
                {Array.from({ length: kdCount }, (_, i) => (
                  <th 
                    key={i} 
                    colSpan={5} 
                    className={`border border-slate-600 py-2 text-xs font-black uppercase tracking-wide ${
                      currentTheme.phHeaders[i % currentTheme.phHeaders.length]
                    }`}
                  >
                    Penilaian Harian {i + 1}
                  </th>
                ))}
                
                {/* Summary columns spanning across remaining 2 rows */}
                <th rowSpan={2} className={`border border-slate-600 px-2 py-2 min-w-[55px] font-bold ${currentTheme.summaryHeaders.rataKd3}`}>
                  Rata KD-3
                </th>
                <th rowSpan={2} className={`border border-slate-600 px-2 py-2 min-w-[55px] font-bold ${currentTheme.summaryHeaders.rataKd4}`}>
                  Rata KD-4
                </th>
                <th rowSpan={2} className={`border border-slate-600 px-2 py-2 min-w-[58px] font-black text-slate-950 ${currentTheme.summaryHeaders.nilaiAkhir}`}>
                  Nilai Akhir
                </th>
                <th rowSpan={2} className={`border border-slate-600 px-2 py-2 min-w-[48px] font-bold ${currentTheme.summaryHeaders.predikat}`}>
                  Predikat
                </th>
                <th rowSpan={2} className={`border border-slate-600 px-2 py-2 min-w-[75px] font-bold ${currentTheme.summaryHeaders.keterangan}`}>
                  Keterangan
                </th>
              </tr>

              {/* Row 3: Sub-columns (PH, Remidi, Praktek, Proyek, Porto F) */}
              <tr>
                {Array.from({ length: kdCount }, (_, i) => (
                  <React.Fragment key={i}>
                    <th className={`border border-slate-400 px-2 py-1.5 min-w-[50px] text-[11px] ${currentTheme.subColumns.ph}`}>
                      PH
                    </th>
                    <th className={`border border-slate-400 px-2 py-1.5 min-w-[50px] text-[11px] ${currentTheme.subColumns.remidi}`}>
                      Remidi
                    </th>
                    <th className={`border border-slate-400 px-2 py-1.5 min-w-[50px] text-[11px] ${currentTheme.subColumns.praktek}`}>
                      Praktek
                    </th>
                    <th className={`border border-slate-400 px-2 py-1.5 min-w-[50px] text-[11px] ${currentTheme.subColumns.proyek}`}>
                      Proyek
                    </th>
                    <th className={`border border-slate-400 px-2 py-1.5 min-w-[50px] text-[11px] ${currentTheme.subColumns.porto}`}>
                      Porto F
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            {/* Table Body with Student Rows */}
            <tbody className="divide-y divide-slate-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4 + (5 * kdCount) + 5} className="py-12 text-center text-slate-400 font-medium">
                    {searchQuery ? 'Tidak ada siswa yang sesuai dengan kata kunci pencarian.' : `Belum ada siswa di ${currentClassObj.nama}. Silakan tambahkan di menu Data Siswa.`}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => {
                  const studentScore = scores[student.id] || {};
                  const res = calculateStudentResults(student.id);

                  return (
                    <tr 
                      key={student.id} 
                      className={`hover:bg-emerald-50/40 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}`}
                    >
                      {/* Identity Cells */}
                      <td className="border border-slate-300 px-2 py-1 text-slate-600 font-medium">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 text-slate-600 font-mono text-[11px]">
                        {student.nis || '-'}
                      </td>
                      <td className="border border-slate-300 px-3 py-1 text-left font-bold text-slate-800 whitespace-nowrap">
                        {student.nama}
                      </td>
                      <td className="border border-slate-300 px-1 py-1 font-semibold text-slate-600">
                        {student.gender || '-'}
                      </td>

                      {/* KD Columns (PH, Remidi, Praktek, Proyek, Porto F) */}
                      {Array.from({ length: kdCount }, (_, kdIdx) => {
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
                                onChange={(e) => handleScoreChange(student.id, kdKey, 'ph', e.target.value)}
                                className="w-full text-center py-1.5 px-0.5 font-semibold text-slate-900 bg-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded text-xs"
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
                                onChange={(e) => handleScoreChange(student.id, kdKey, 'remidi', e.target.value)}
                                className={`w-full text-center py-1.5 px-0.5 font-bold rounded text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                                  kd.remidi ? 'text-amber-800 bg-amber-100/80 border border-amber-300' : 'text-slate-400 bg-transparent'
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
                                onChange={(e) => handleScoreChange(student.id, kdKey, 'praktek', e.target.value)}
                                className="w-full text-center py-1.5 px-0.5 font-semibold text-slate-900 bg-transparent focus:bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none rounded text-xs"
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
                                onChange={(e) => handleScoreChange(student.id, kdKey, 'proyek', e.target.value)}
                                className="w-full text-center py-1.5 px-0.5 font-semibold text-slate-900 bg-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none rounded text-xs"
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
                                onChange={(e) => handleScoreChange(student.id, kdKey, 'porto', e.target.value)}
                                className="w-full text-center py-1.5 px-0.5 font-semibold text-slate-900 bg-transparent focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none rounded text-xs"
                                placeholder="-"
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {/* Summary Calculated Results with Highlight Tinting */}
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
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            res.isTuntas 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {res.isTuntas ? 'Tuntas' : 'Belum'}
                          </span>
                        ) : '-'}
                      </td>

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

      {/* Batch Fill Modal */}
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
                  <p className="text-[11px] text-slate-500">Terapkan nilai yang sama ke semua siswa kelas {currentClassObj.nama}</p>
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
