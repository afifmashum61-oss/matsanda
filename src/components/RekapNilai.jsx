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
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { MATA_PELAJARAN_MTS } from '../data/initialData';
import { getGrades, saveGradeForClassSubject } from '../utils/storage';

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
  const [kdCount, setKdCount] = useState(2); // Default 2: PH 1 & PH 2 exactly matching the template
  const [kkm, setKkm] = useState(75);
  const [guruPengampu, setGuruPengampu] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [saveStatus, setSaveStatus] = useState(''); // 'saved' | 'saving' | 'dirty' | ''
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

  // Export to Excel with Multi-Level Merged Headers matching the image
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Prepare header rows
    const sheetData = [
      // Title metadata
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

    // Header Merges:
    // r=4 (Top), r=5 (Sub), r=6 (Fields)
    const merges = [
      // Title merges
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 + kdTotalCols + 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 + kdTotalCols + 4 } },

      // Identity columns (Row 4 to Row 6)
      { s: { r: 4, c: 0 }, e: { r: 6, c: 0 } }, // No
      { s: { r: 4, c: 1 }, e: { r: 6, c: 1 } }, // NIS
      { s: { r: 4, c: 2 }, e: { r: 6, c: 2 } }, // Nama Siswa
      { s: { r: 4, c: 3 }, e: { r: 6, c: 3 } }, // L/P

      // Row 4: Kompetensi Dasar Pengetahuan dan Ketrampilan
      { s: { r: 4, c: 4 }, e: { r: 4, c: 4 + kdTotalCols - 1 } },

      // Row 4: Nilai Akhir overall header
      { s: { r: 4, c: 4 + kdTotalCols }, e: { r: 4, c: 4 + kdTotalCols + 4 } },

      // Row 5 & 6: Summary columns
      { s: { r: 5, c: 4 + kdTotalCols }, e: { r: 6, c: 4 + kdTotalCols } }, // Rata KD-3
      { s: { r: 5, c: 4 + kdTotalCols + 1 }, e: { r: 6, c: 4 + kdTotalCols + 1 } }, // Rata KD-4
      { s: { r: 5, c: 4 + kdTotalCols + 2 }, e: { r: 6, c: 4 + kdTotalCols + 2 } }, // Nilai Akhir
      { s: { r: 5, c: 4 + kdTotalCols + 3 }, e: { r: 6, c: 4 + kdTotalCols + 3 } }, // Predikat
      { s: { r: 5, c: 4 + kdTotalCols + 4 }, e: { r: 6, c: 4 + kdTotalCols + 4 } }, // Keterangan
    ];

    // Penilaian Harian subheaders in Row 5
    for (let i = 0; i < kdCount; i++) {
      merges.push({
        s: { r: 5, c: 4 + (i * 5) },
        e: { r: 5, c: 4 + (i * 5) + 4 }
      });
    }

    ws['!merges'] = merges;

    // Set Column Widths
    const colWidths = [
      { wch: 5 },  // No
      { wch: 10 }, // NIS
      { wch: 28 }, // Nama
      { wch: 6 },  // L/P
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
            <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200 shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Rekapitulasi Nilai Siswa</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fcd5b4] text-amber-900 border border-amber-300">
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
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs shadow-md transition"
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

        {/* Secondary Info Bar: Guru Pengampu & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="w-full sm:w-80">
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

          <div className="w-full sm:w-72">
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
        </div>

      </div>

      {/* Statistics Cards (Hidden during print) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Total Siswa Kelas</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-xl font-black text-slate-900">{statistics.totalStudents}</p>
            <span className="text-[11px] text-slate-400">({statistics.filledCount} terisi)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Rata-rata Nilai Kelas</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-xl font-black text-emerald-600">{statistics.average}</p>
            <span className="text-[11px] text-slate-400">KKM: {kkm}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-semibold text-slate-500">Ketuntasan Belajar</p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-xl font-black text-blue-600">{statistics.tuntasPercent}%</p>
            <span className="text-[11px] text-slate-400">({statistics.tuntasCount} tuntas)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
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
        <div className="px-5 py-2.5 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between no-print text-[11px] text-amber-900">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Tabel otomatis menghitung <strong>Rata KD-3</strong> (Pengetahuan PH/Remidi), <strong>Rata KD-4</strong> (Ketrampilan Praktek/Proyek/Porto), dan <strong>Nilai Akhir</strong>. Nilai tersimpan realtime.
            </span>
          </div>
          <span className="hidden sm:inline font-semibold text-amber-700">
            {currentClassObj.nama} • {currentMapelObj.nama}
          </span>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse text-center">
            
            {/* Table Header matching the uploaded image exactly */}
            <thead>
              {/* Row 1: Top Header */}
              <tr className="bg-[#fcd5b4] text-slate-900 font-bold border border-slate-600">
                <th rowSpan={3} className="border border-slate-600 px-2 py-2 min-w-[36px] bg-[#fcd5b4]">
                  No
                </th>
                <th rowSpan={3} className="border border-slate-600 px-2 py-2 min-w-[80px] bg-[#fcd5b4]">
                  NIS
                </th>
                <th rowSpan={3} className="border border-slate-600 px-3 py-2 min-w-[190px] text-left bg-[#fcd5b4]">
                  Nama Siswa
                </th>
                <th rowSpan={3} className="border border-slate-600 px-1.5 py-2 min-w-[36px] bg-[#fcd5b4]">
                  L/P
                </th>
                <th 
                  colSpan={5 * kdCount} 
                  className="border border-slate-600 py-2.5 text-sm uppercase tracking-wide bg-[#fcd5b4] text-slate-950 font-black"
                >
                  Kompetensi Dasar Pengetahuan dan Ketrampilan
                </th>
                <th 
                  colSpan={5} 
                  className="border border-slate-600 py-2.5 text-xs uppercase tracking-wide bg-[#fcd5b4] text-slate-950 font-black"
                >
                  Rekapitulasi Nilai Akhir
                </th>
              </tr>

              {/* Row 2: Penilaian Harian Subheaders */}
              <tr className="bg-[#fcd5b4] text-slate-900 font-bold border border-slate-600">
                {Array.from({ length: kdCount }, (_, i) => (
                  <th 
                    key={i} 
                    colSpan={5} 
                    className="border border-slate-600 py-2 text-xs font-extrabold bg-[#fcd5b4]"
                  >
                    Penilaian Harian {i + 1}
                  </th>
                ))}
                
                {/* Summary columns spanning across remaining 2 rows */}
                <th rowSpan={2} className="border border-slate-600 px-2 py-2 min-w-[55px] bg-[#fcd5b4] font-bold">
                  Rata KD-3
                </th>
                <th rowSpan={2} className="border border-slate-600 px-2 py-2 min-w-[55px] bg-[#fcd5b4] font-bold">
                  Rata KD-4
                </th>
                <th rowSpan={2} className="border border-slate-600 px-2 py-2 min-w-[58px] bg-[#fcd5b4] font-black text-slate-950">
                  Nilai Akhir
                </th>
                <th rowSpan={2} className="border border-slate-600 px-2 py-2 min-w-[48px] bg-[#fcd5b4] font-bold">
                  Predikat
                </th>
                <th rowSpan={2} className="border border-slate-600 px-2 py-2 min-w-[75px] bg-[#fcd5b4] font-bold">
                  Keterangan
                </th>
              </tr>

              {/* Row 3: Sub-columns (PH, Remidi, Praktek, Proyek, Porto F) */}
              <tr className="bg-[#fcd5b4] text-slate-900 font-bold border border-slate-600">
                {Array.from({ length: kdCount }, (_, i) => (
                  <React.Fragment key={i}>
                    <th className="border border-slate-600 px-2 py-1.5 min-w-[50px] bg-[#fcd5b4] text-[11px] font-bold">
                      PH
                    </th>
                    <th className="border border-slate-600 px-2 py-1.5 min-w-[50px] bg-[#fcd5b4] text-[11px] font-bold">
                      Remidi
                    </th>
                    <th className="border border-slate-600 px-2 py-1.5 min-w-[50px] bg-[#fcd5b4] text-[11px] font-bold">
                      Praktek
                    </th>
                    <th className="border border-slate-600 px-2 py-1.5 min-w-[50px] bg-[#fcd5b4] text-[11px] font-bold">
                      Proyek
                    </th>
                    <th className="border border-slate-600 px-2 py-1.5 min-w-[50px] bg-[#fcd5b4] text-[11px] font-bold">
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
                      className={`hover:bg-amber-50/40 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}`}
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
                            <td className="border border-slate-300 p-0.5 bg-amber-50/30">
                              <input
                                type="number"
                                inputMode="numeric"
                                min="0"
                                max="100"
                                value={kd.remidi !== undefined ? kd.remidi : ''}
                                onChange={(e) => handleScoreChange(student.id, kdKey, 'remidi', e.target.value)}
                                className={`w-full text-center py-1.5 px-0.5 font-bold rounded text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                                  kd.remidi ? 'text-amber-700 bg-amber-100/60' : 'text-slate-400 bg-transparent'
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
                                className="w-full text-center py-1.5 px-0.5 font-semibold text-slate-900 bg-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded text-xs"
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
                                className="w-full text-center py-1.5 px-0.5 font-semibold text-slate-900 bg-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded text-xs"
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
                                className="w-full text-center py-1.5 px-0.5 font-semibold text-slate-900 bg-transparent focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none rounded text-xs"
                                placeholder="-"
                              />
                            </td>
                          </React.Fragment>
                        );
                      })}

                      {/* Summary Calculated Results */}
                      <td className="border border-slate-300 px-2 py-1 font-bold text-slate-800 bg-slate-50/50">
                        {res.rataKD3 !== null ? res.rataKD3 : '-'}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 font-bold text-slate-800 bg-slate-50/50">
                        {res.rataKD4 !== null ? res.rataKD4 : '-'}
                      </td>
                      <td className="border border-slate-300 px-2 py-1 font-black text-slate-950 bg-amber-50/50 text-sm">
                        {res.nilaiAkhir !== null ? res.nilaiAkhir : '-'}
                      </td>
                      <td className="border border-slate-300 px-1.5 py-1 font-extrabold">
                        {res.predikat !== '-' ? (
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                            res.predikat === 'A' ? 'bg-emerald-100 text-emerald-800' :
                            res.predikat === 'B' ? 'bg-blue-100 text-blue-800' :
                            res.predikat === 'C' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {res.predikat}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="border border-slate-300 px-1.5 py-1 font-bold text-[11px]">
                        {res.isFilled ? (
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${
                            res.isTuntas ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
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
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition"
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
