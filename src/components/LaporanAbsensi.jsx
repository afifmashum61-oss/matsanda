import React, { useState } from 'react';
import { 
  Printer, 
  FileSpreadsheet, 
  Calendar, 
  Filter, 
  CheckCircle2, 
  FileText,
  School,
  Clock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { JAM_PELAJARAN, getJamPelajaranByDate } from '../data/initialData';

export default function LaporanAbsensi({ students, attendance, classes, schoolProfile }) {
  const [reportType, setReportType] = useState('monthly'); // 'monthly' | 'daily'
  const [selectedClass, setSelectedClass] = useState(classes[0]?.id || '7A');
  
  // Month & Year state for monthly report
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  
  // Date & Jam state for daily report
  const [selectedDate, setSelectedDate] = useState(now.toISOString().split('T')[0]);
  const [selectedJamFilter, setSelectedJamFilter] = useState('ALL'); // 'ALL' | 1..8

  const currentJamList = getJamPelajaranByDate(selectedDate);
  const isMondaySelected = new Date(selectedDate).getDay() === 1;
  const isFridaySelected = new Date(selectedDate).getDay() === 5;

  const currentClassInfo = classes.find(c => c.id === selectedClass) || { nama: `Kelas ${selectedClass}`, waliKelas: '-' };
  const classStudents = students.filter(s => s.kelas === selectedClass);

  // Month names in Indonesian
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Days in selected month
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Helper to format date YYYY-MM-DD for a day in month
  const getFormattedDayDate = (day) => {
    const m = String(selectedMonth).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${selectedYear}-${m}-${d}`;
  };

  // Export Monthly Report to Excel
  const handleExportMonthlyExcel = () => {
    const excelData = classStudents.map((s, idx) => {
      const row = {
        No: idx + 1,
        NIS: s.nis,
        'Nama Siswa': s.nama,
        'L/P': s.gender,
      };

      let hCount = 0, sCount = 0, iCount = 0, aCount = 0;

      daysArray.forEach(day => {
        const dStr = getFormattedDayDate(day);
        const dayRecs = attendance.filter(a => a.studentId === s.id && a.date === dStr);
        let code = '-';

        if (dayRecs.length > 0) {
          const hasAlpa = dayRecs.some(r => r.status === 'Alpa');
          const hasSakit = dayRecs.some(r => r.status === 'Sakit');
          const hasIzin = dayRecs.some(r => r.status === 'Izin');
          const hasHadir = dayRecs.some(r => r.status === 'Hadir');

          if (hasAlpa) {
            code = 'A';
            aCount++;
          } else if (hasSakit) {
            code = 'S';
            sCount++;
          } else if (hasIzin) {
            code = 'I';
            iCount++;
          } else if (hasHadir) {
            code = 'H';
            hCount++;
          }
        }

        row[`Tgl ${day}`] = code;
      });

      row['Hadir (H)'] = hCount;
      row['Sakit (S)'] = sCount;
      row['Izin (I)'] = iCount;
      row['Alpa (A)'] = aCount;
      const totalDaysRecorded = hCount + sCount + iCount + aCount;
      row['% Kehadiran'] = totalDaysRecorded > 0 ? `${Math.round((hCount / totalDaysRecorded) * 100)}%` : '0%';

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Rekap Kelas ${selectedClass}`);
    XLSX.writeFile(workbook, `Rekap_Absensi_MTs_Darussalam_Kelas_${selectedClass}_${monthNames[selectedMonth - 1]}_${selectedYear}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar (Hidden during print) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Laporan & Rekapitulasi Absensi</h1>
            <p className="text-xs text-slate-500">Cetak dokumen rekapitulasi kehadiran resmi (termasuk jam pelajaran ke 1-8) atau download file Excel.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMonthlyExcel}
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold px-3 py-2 rounded-xl text-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export Excel
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              Cetak / Save PDF
            </button>
          </div>
        </div>

        {/* Report Options */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Jenis Laporan</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="monthly">Rekapitulasi Bulanan</option>
              <option value="daily">Laporan Harian (Jam Ke 1-8)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kelas</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
          </div>

          {reportType === 'monthly' ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Bulan</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {monthNames.map((m, idx) => (
                    <option key={idx} value={idx + 1}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Tanggal</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Filter Jam Pelajaran</label>
                <select
                  value={selectedJamFilter}
                  onChange={(e) => setSelectedJamFilter(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="ALL">Semua Jam (1 s/d 8)</option>
                  {currentJamList.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.label} ({j.waktu})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 print:shadow-none print:border-none print:p-0">
        
        {/* KOP SURAT SEKOLAH */}
        <div className="border-b-4 border-double border-slate-900 pb-4 flex items-center justify-center gap-6">
          <img src="/logo.png" alt="Logo MTs Darussalam" className="w-20 h-20 object-contain flex-shrink-0" />
          <div className="text-center">
            <h2 className="text-xl font-black uppercase tracking-wide text-slate-900">
              MADRASAH TSANAWIYAH (MTs) DARUSSALAM NGESONG
            </h2>
            <p className="text-xs font-semibold text-slate-700">
              NSM: {schoolProfile.nsm} • NPSN: {schoolProfile.npsn}
            </p>
            <p className="text-xs text-slate-600 italic">
              {schoolProfile.alamat}
            </p>
          </div>
        </div>

        {/* Judul Laporan */}
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-slate-900 uppercase underline">
            {reportType === 'monthly' ? 'REKAPITULASI ABSENSI SISWA BULANAN' : 'LAPORAN KEHADIRAN SISWA PER JAM PELAJARAN'}
          </h3>
          <p className="text-xs font-medium text-slate-700">
            Kelas: <strong>{currentClassInfo.nama}</strong> | Wali Kelas: <strong>{currentClassInfo.waliKelas}</strong>
          </p>
          <p className="text-xs text-slate-600">
            {reportType === 'monthly' 
              ? `Bulan: ${monthNames[selectedMonth - 1]} ${selectedYear} • Tahun Ajaran ${schoolProfile.tahunAjaran} (${schoolProfile.semester})`
              : `Tanggal: ${new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ${selectedJamFilter !== 'ALL' ? `• Jam Ke-${selectedJamFilter}` : '• Jam Pelajaran Ke 1 s/d 8'}`
            }
          </p>
        </div>

        {/* Tabel Rekapitulasi Bulanan */}
        {reportType === 'monthly' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-900 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                  <th className="border border-slate-900 p-1.5 w-8">No</th>
                  <th className="border border-slate-900 p-1.5 w-20">NIS</th>
                  <th className="border border-slate-900 p-1.5 text-left min-w-[140px]">Nama Siswa</th>
                  <th className="border border-slate-900 p-1.5 w-8">L/P</th>
                  {daysArray.map(day => (
                    <th key={day} className="border border-slate-900 p-0.5 w-6 text-[10px]">
                      {day}
                    </th>
                  ))}
                  <th className="border border-slate-900 p-1.5 w-6 bg-emerald-50 text-emerald-900">H</th>
                  <th className="border border-slate-900 p-1.5 w-6 bg-amber-50 text-amber-900">S</th>
                  <th className="border border-slate-900 p-1.5 w-6 bg-blue-50 text-blue-900">I</th>
                  <th className="border border-slate-900 p-1.5 w-6 bg-rose-50 text-rose-900">A</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, idx) => {
                  let h = 0, sakit = 0, izin = 0, alpa = 0;

                  return (
                    <tr key={s.id} className="text-slate-800 hover:bg-slate-50">
                      <td className="border border-slate-900 p-1 text-center">{idx + 1}</td>
                      <td className="border border-slate-900 p-1 text-center font-mono">{s.nis}</td>
                      <td className="border border-slate-900 p-1 font-bold">{s.nama}</td>
                      <td className="border border-slate-900 p-1 text-center font-semibold">{s.gender}</td>

                      {daysArray.map(day => {
                        const dStr = getFormattedDayDate(day);
                        const dayRecs = attendance.filter(a => a.studentId === s.id && a.date === dStr);
                        let char = '';
                        let colorClass = '';
                        let titleText = '';

                        if (dayRecs.length > 0) {
                          const hasAlpa = dayRecs.some(r => r.status === 'Alpa');
                          const hasSakit = dayRecs.some(r => r.status === 'Sakit');
                          const hasIzin = dayRecs.some(r => r.status === 'Izin');
                          const hasHadir = dayRecs.some(r => r.status === 'Hadir');

                          const jpDetails = dayRecs.map(r => `Jam ${r.jamKe || 1}: ${r.status}`).join(', ');
                          titleText = `Tgl ${day}: ${jpDetails}`;

                          if (hasAlpa) {
                            char = 'A';
                            alpa++;
                            colorClass = 'bg-rose-200 font-extrabold text-rose-900';
                          } else if (hasSakit) {
                            char = 'S';
                            sakit++;
                            colorClass = 'bg-amber-100 font-bold text-amber-900';
                          } else if (hasIzin) {
                            char = 'I';
                            izin++;
                            colorClass = 'bg-blue-100 font-bold text-blue-900';
                          } else if (hasHadir) {
                            char = 'H';
                            h++;
                          }
                        }

                        return (
                          <td key={day} className={`border border-slate-900 p-0.5 text-center text-[10px] ${colorClass}`} title={titleText}>
                            {char}
                          </td>
                        );
                      })}

                      <td className="border border-slate-900 p-1 text-center font-bold bg-emerald-50/50">{h}</td>
                      <td className="border border-slate-900 p-1 text-center font-bold bg-amber-50/50">{sakit}</td>
                      <td className="border border-slate-900 p-1 text-center font-bold bg-blue-50/50">{izin}</td>
                      <td className="border border-slate-900 p-1 text-center font-bold text-rose-700 bg-rose-50/50">{alpa}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabel Laporan Harian (Jam Pelajaran Ke 1-8) */}
        {reportType === 'daily' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-900 text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                  <th className="border border-slate-900 p-2 w-10" rowSpan={2}>No</th>
                  <th className="border border-slate-900 p-2 w-24" rowSpan={2}>NIS</th>
                  <th className="border border-slate-900 p-2 text-left" rowSpan={2}>Nama Siswa</th>
                  <th className="border border-slate-900 p-2 w-10" rowSpan={2}>L/P</th>
                  <th className="border border-slate-900 p-1" colSpan={8}>Jam Pelajaran</th>
                  <th className="border border-slate-900 p-2 text-left" rowSpan={2}>Catatan</th>
                </tr>
                <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                  {currentJamList.map(j => (
                    <th key={j.id} className="border border-slate-900 p-1 w-8 text-[11px]" title={`${j.label} (${j.waktu})`}>
                      {j.id}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classStudents.map((s, idx) => {
                  const notesList = [];
                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-900 p-2 text-center font-mono">{s.nis}</td>
                      <td className="border border-slate-900 p-2 font-bold">{s.nama}</td>
                      <td className="border border-slate-900 p-2 text-center">{s.gender}</td>

                      {currentJamList.map(j => {
                        const rec = attendance.find(
                          a => a.studentId === s.id && a.date === selectedDate && Number(a.jamKe || 1) === j.id
                        );
                        let char = '-';
                        let badgeClass = 'text-slate-400 font-normal';

                        if (rec) {
                          if (rec.status === 'Hadir') { char = 'H'; badgeClass = 'bg-emerald-50 text-emerald-800 font-bold'; }
                          if (rec.status === 'Sakit') { char = 'S'; badgeClass = 'bg-amber-100 text-amber-900 font-bold'; }
                          if (rec.status === 'Izin') { char = 'I'; badgeClass = 'bg-blue-100 text-blue-900 font-bold'; }
                          if (rec.status === 'Alpa') { char = 'A'; badgeClass = 'bg-rose-200 text-rose-900 font-extrabold'; }
                          if (rec.catatan) notesList.push(`Jam ${j.id}: ${rec.catatan}`);
                        }

                        return (
                          <td key={j.id} className={`border border-slate-900 p-1 text-center font-bold text-[11px] ${badgeClass}`}>
                            {char}
                          </td>
                        );
                      })}

                      <td className="border border-slate-900 p-2 italic text-[11px]">{notesList.join('; ') || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Legenda Keterangan Jam Pelajaran */}
        <div className="text-xs text-slate-700 space-y-1.5 pt-2">
          <p className="font-bold flex items-center justify-between">
            <span>Keterangan Waktu Jam Pelajaran MTs Darussalam:</span>
            {isMondaySelected && (
              <span className="text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                * Upacara Bendera: 06.40 - 07.30 • Istirahat: 09.50 - 10.25 (Senin)
              </span>
            )}
            {isFridaySelected && (
              <span className="text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                * Istirahat: 09.00 - 09.20 • Selesai 11.20 (Jum'at 30 Menit/JP)
              </span>
            )}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            {currentJamList.map(j => (
              <span key={j.id} className="bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                <strong>Jam {j.id}:</strong> {j.waktu}
              </span>
            ))}
          </div>
        </div>

        {/* Tanda Tangan Dokumen (Signatures) */}
        <div className="pt-8 grid grid-cols-2 text-center text-xs gap-8 font-medium">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala MTs Darussalam</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{schoolProfile.kepalaSekolah}</p>
            <p className="text-slate-600">NIP. {schoolProfile.nipKepalaSekolah}</p>
          </div>

          <div>
            <p>Jombang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">Wali Kelas {selectedClass}</p>
            <div className="h-16"></div>
            <p className="font-bold underline">{currentClassInfo.waliKelas}</p>
            <p className="text-slate-600">Guru NUPTK / NIP</p>
          </div>
        </div>

      </div>
    </div>
  );
}
