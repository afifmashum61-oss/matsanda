import React from 'react';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Calendar, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  GraduationCap
} from 'lucide-react';

export default function Dashboard({ 
  students, 
  attendance, 
  classes, 
  schoolProfile, 
  setActiveTab, 
  setSelectedClass 
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's attendance
  const todayRecords = attendance.filter(a => a.date === todayStr);

  const totalStudents = students.length;
  
  let presentCount = 0;
  let sickCount = 0;
  let permissionCount = 0;
  let alphaCount = 0;

  students.forEach(student => {
    const dayRecs = todayRecords.filter(a => a.studentId === student.id);
    if (dayRecs.length > 0) {
      const hasAlpa = dayRecs.some(r => r.status === 'Alpa');
      const hasSakit = dayRecs.some(r => r.status === 'Sakit');
      const hasIzin = dayRecs.some(r => r.status === 'Izin');
      const hasHadir = dayRecs.some(r => r.status === 'Hadir');

      if (hasAlpa) alphaCount++;
      if (hasSakit) sickCount++;
      if (hasIzin) permissionCount++;
      if (!hasAlpa && !hasSakit && !hasIzin && hasHadir) presentCount++;
    }
  });

  const rawAttendanceRate = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;
  const attendanceRate = Math.min(100, Math.max(0, rawAttendanceRate));

  // List of absent students today (checking all JPs today)
  const absentToday = students
    .map(student => {
      const dayRecs = attendance.filter(a => a.studentId === student.id && a.date === todayStr);
      if (dayRecs.length === 0) return null;

      const hasAlpa = dayRecs.filter(r => r.status === 'Alpa');
      const hasSakit = dayRecs.filter(r => r.status === 'Sakit');
      const hasIzin = dayRecs.filter(r => r.status === 'Izin');

      if (hasAlpa.length > 0) {
        const jams = hasAlpa.map(r => `Jam ${r.jamKe || 1}`).join(', ');
        return { 
          student, 
          status: 'Alpa', 
          jamDetail: jams, 
          catatan: hasAlpa.map(r => r.catatan).filter(Boolean).join('; ') 
        };
      }
      if (hasSakit.length > 0) {
        const jams = hasSakit.map(r => `Jam ${r.jamKe || 1}`).join(', ');
        return { 
          student, 
          status: 'Sakit', 
          jamDetail: jams, 
          catatan: hasSakit.map(r => r.catatan).filter(Boolean).join('; ') 
        };
      }
      if (hasIzin.length > 0) {
        const jams = hasIzin.map(r => `Jam ${r.jamKe || 1}`).join(', ');
        return { 
          student, 
          status: 'Izin', 
          jamDetail: jams, 
          catatan: hasIzin.map(r => r.catatan).filter(Boolean).join('; ') 
        };
      }
      return null;
    })
    .filter(Boolean);

  // Today date formatted in Indonesian
  const formattedToday = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Banner Top */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-emerald-200 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4" />
              <span>{formattedToday}</span>
              <span className="mx-1">•</span>
              <span className="bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-xs">
                Tahun Ajaran {schoolProfile.tahunAjaran} ({schoolProfile.semester})
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              Selamat Datang di Sistem Absensi Siswa
            </h1>
            <p className="text-emerald-100 text-sm md:text-base leading-relaxed">
              {schoolProfile.nama} • Pengelolaan rekapitulasi kehadiran siswa harian dan bulanan secara terintegrasi dan akurat.
            </p>
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                onClick={() => setActiveTab('input')}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold px-4 py-2.5 rounded-xl transition shadow-md hover:shadow-lg text-sm"
              >
                <UserCheck className="w-4 h-4" />
                Input Absensi Hari Ini
              </button>
              <button
                onClick={() => setActiveTab('laporan')}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl transition backdrop-blur-sm border border-white/20 text-sm"
              >
                <FileText className="w-4 h-4" />
                Lihat Rekap Laporan
              </button>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card Total Siswa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Siswa Terdaftar</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalStudents}</div>
          <p className="text-xs text-slate-500 mt-1">Terbagi dalam {classes.length} Rombongan Belajar</p>
        </div>

        {/* Card Hadir */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hadir Hari Ini</span>
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-teal-700">{presentCount}</span>
            <span className="text-xs font-semibold text-teal-600">({attendanceRate}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="bg-teal-600 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${attendanceRate}%` }}
            />
          </div>
        </div>

        {/* Card Sakit & Izin */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Sakit / Izin</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <div>
              <span className="text-2xl font-bold text-amber-700">{sickCount}</span>
              <span className="text-xs text-slate-500 ml-1">Sakit</span>
            </div>
            <span className="text-slate-300">|</span>
            <div>
              <span className="text-2xl font-bold text-blue-700">{permissionCount}</span>
              <span className="text-xs text-slate-500 ml-1">Izin</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">Dengan konfirmasi keterangan</p>
        </div>

        {/* Card Alpa */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tanpa Keterangan (Alpa)</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-rose-600">{alphaCount}</div>
          <p className="text-xs text-rose-500 font-medium mt-1">
            {alphaCount > 0 ? 'Perlu tindakan follow-up wali kelas' : 'Tidak ada siswa alpa hari ini ✨'}
          </p>
        </div>
      </div>

      {/* Main Grid: Per-Class Progress & Absent List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Ringkasan per Kelas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Kehadiran Hari Ini per Kelas</h2>
              <p className="text-xs text-slate-500">Klik kelas untuk langsung melakukan input absensi</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
              {classes.length} Kelas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map(c => {
              const classStudents = students.filter(s => s.kelas === c.id);
              let classPresent = 0;
              let classSick = 0;
              let classPermission = 0;
              let classAlpha = 0;
              let isFilled = false;

              classStudents.forEach(s => {
                const sRecs = todayRecords.filter(a => a.studentId === s.id);
                if (sRecs.length > 0) {
                  isFilled = true;
                  const hasAlpa = sRecs.some(r => r.status === 'Alpa');
                  const hasSakit = sRecs.some(r => r.status === 'Sakit');
                  const hasIzin = sRecs.some(r => r.status === 'Izin');
                  const hasHadir = sRecs.some(r => r.status === 'Hadir');

                  if (hasAlpa) classAlpha++;
                  if (hasSakit) classSick++;
                  if (hasIzin) classPermission++;
                  if (!hasAlpa && !hasSakit && !hasIzin && hasHadir) classPresent++;
                }
              });

              const rawPercent = classStudents.length > 0 && isFilled
                ? Math.round((classPresent / classStudents.length) * 100) 
                : 0;
              const percent = Math.min(100, Math.max(0, rawPercent));

              return (
                <div 
                  key={c.id} 
                  className="border border-slate-200 hover:border-emerald-500 rounded-xl p-4 transition bg-slate-50/50 hover:bg-emerald-50/20 group cursor-pointer"
                  onClick={() => {
                    setSelectedClass(c.id);
                    setActiveTab('input');
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 group-hover:text-emerald-700 text-base">
                        {c.nama}
                      </span>
                      <span className="text-xs text-slate-500">({classStudents.length} Siswa)</span>
                    </div>
                    {isFilled ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Sudah Diabsen
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Belum
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mb-3 truncate">Wali Kelas: {c.waliKelas}</p>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-600">
                      <span>Kehadiran</span>
                      <span>{isFilled ? `${percent}%` : '0%'}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Breakdown */}
                  {isFilled && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200/60 text-xs">
                      <span className="text-emerald-700 font-medium">{classPresent} Hadir</span>
                      {classSick > 0 && <span className="text-amber-600 font-medium">{classSick} Sakit</span>}
                      {classPermission > 0 && <span className="text-blue-600 font-medium">{classPermission} Izin</span>}
                      {classAlpha > 0 && <span className="text-rose-600 font-bold">{classAlpha} Alpa</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Siswa Tidak Hadir Hari Ini */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Catatan Ketidakhadiran</h2>
              <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full font-bold">
                {absentToday.length} Siswa
              </span>
            </div>

            {absentToday.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-emerald-400 opacity-60" />
                <p className="text-sm font-medium text-slate-600">Semua siswa terdaftar hadir hari ini!</p>
                <p className="text-xs text-slate-400 mt-1">Tidak ada catatan sakit, izin, atau alpa.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {absentToday.map((item, idx) => {
                  let badgeBg = 'bg-rose-100 text-rose-800 border-rose-200';
                  if (item.status === 'Sakit') badgeBg = 'bg-amber-100 text-amber-800 border-amber-200';
                  if (item.status === 'Izin') badgeBg = 'bg-blue-100 text-blue-800 border-blue-200';

                  return (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.student.nama}</p>
                          <p className="text-xs text-slate-500">Kelas {item.student.kelas} • NIS: {item.student.nis}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${badgeBg}`}>
                          {item.status} ({item.jamDetail})
                        </span>
                      </div>
                      
                      {item.catatan && (
                        <p className="text-xs text-slate-600 italic bg-white p-2 rounded border border-slate-100">
                          "{item.catatan}"
                        </p>
                      )}

                      {item.student.noHp && (
                        <a 
                          href={`https://wa.me/${item.student.noHp.replace(/^0/, '62')}?text=Assalamu'alaikum%20Bapak/Ibu,%20kami%20dari%20MTs%20Darussalam%20Ngesong%20mengkonfirmasi%20kehadiran%20ananda%20${encodeURIComponent(item.student.nama)}%20hari%20ini.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold pt-1"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Hubungi Ortu (WhatsApp)
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setActiveTab('laporan')}
              className="w-full flex items-center justify-center gap-2 text-sm text-emerald-700 hover:text-emerald-800 font-bold py-2 bg-emerald-50 hover:bg-emerald-100/70 rounded-xl transition"
            >
              Lihat Rekapitulasi Lengkap
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
