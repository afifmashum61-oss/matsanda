import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  RefreshCw, 
  Download, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertTriangle,
  Lock
} from 'lucide-react';
import { exportFullBackup, resetDataToDefault } from '../utils/storage';

export default function PengaturanSekolah({ 
  schoolProfile, 
  onSaveProfile, 
  classes, 
  onSaveClasses,
  onLockAdmin
}) {
  const [profile, setProfile] = useState({ ...schoolProfile });
  const [successMsg, setSuccessMsg] = useState('');
  
  // Class management state
  const [newClassId, setNewClassId] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newClassWali, setNewClassWali] = useState('');

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    onSaveProfile(profile);
    setSuccessMsg('Profil sekolah berhasil diperbarui!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClassId.trim()) return;

    if (classes.some(c => c.id.toLowerCase() === newClassId.trim().toLowerCase())) {
      alert('Kode Kelas sudah ada!');
      return;
    }

    const newClass = {
      id: newClassId.trim().toUpperCase(),
      nama: newClassName.trim() || `Kelas ${newClassId.trim().toUpperCase()}`,
      waliKelas: newClassWali.trim() || 'Belum Ditentukan'
    };

    onSaveClasses([...classes, newClass]);
    setNewClassId('');
    setNewClassName('');
    setNewClassWali('');
  };

  const handleDeleteClass = (classId) => {
    if (window.confirm(`Hapus ${classId}?`)) {
      onSaveClasses(classes.filter(c => c.id !== classId));
    }
  };

  const handleReset = () => {
    if (window.confirm('PERHATIAN: Apakah Anda yakin ingin mengembalikan semua data ke data awal bawaan? Data inputan Anda akan diset ulang.')) {
      resetDataToDefault();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pengaturan Identitas & Data Sekolah</h1>
          <p className="text-xs text-slate-500">Sesuaikan profil MTs Darussalam Ngesong Jombang, PIN Admin, wali kelas, dan manajemen data.</p>
        </div>
        {onLockAdmin && (
          <button
            type="button"
            onClick={onLockAdmin}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs transition border border-slate-200 shadow-sm"
          >
            <Lock className="w-4 h-4 text-slate-500" />
            Kunci Akses Admin
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Profil Form */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-emerald-600" />
          Identitas Madrasah / Sekolah
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Madrasah / Sekolah</label>
              <input
                type="text"
                required
                value={profile.nama}
                onChange={(e) => setProfile({ ...profile, nama: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                required
                value={profile.alamat}
                onChange={(e) => setProfile({ ...profile, alamat: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NSM (Nomor Statistik Madrasah)</label>
              <input
                type="text"
                value={profile.nsm}
                onChange={(e) => setProfile({ ...profile, nsm: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NPSN</label>
              <input
                type="text"
                value={profile.npsn}
                onChange={(e) => setProfile({ ...profile, npsn: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kepala Sekolah / Madrasah</label>
              <input
                type="text"
                required
                value={profile.kepalaSekolah}
                onChange={(e) => setProfile({ ...profile, kepalaSekolah: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">NIP Kepala Sekolah</label>
              <input
                type="text"
                value={profile.nipKepalaSekolah}
                onChange={(e) => setProfile({ ...profile, nipKepalaSekolah: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tahun Ajaran</label>
              <input
                type="text"
                value={profile.tahunAjaran}
                onChange={(e) => setProfile({ ...profile, tahunAjaran: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Semester</label>
              <select
                value={profile.semester}
                onChange={(e) => setProfile({ ...profile, semester: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                PIN Admin / Password Pengaturan
              </label>
              <input
                type="text"
                required
                value={profile.adminPin || '1234'}
                onChange={(e) => setProfile({ ...profile, adminPin: e.target.value })}
                className="w-full bg-emerald-50/50 border border-emerald-300 rounded-xl px-3.5 py-2 text-sm font-mono font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Gunakan PIN ini untuk mengunci & membuka menu Pengaturan Sekolah.</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md transition"
            >
              <Save className="w-4 h-4" />
              Simpan Profil Sekolah
            </button>
          </div>
        </form>
      </div>

      {/* Rombongan Belajar (Kelas) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Daftar Rombongan Belajar (Kelas) & Wali Kelas
        </h2>

        {/* Add Class Form */}
        <form onSubmit={handleAddClass} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div>
            <input
              type="text"
              placeholder="Kode Kelas (misal: 7C)"
              value={newClassId}
              onChange={(e) => setNewClassId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Nama Kelas (misal: Kelas 7C)"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Nama Wali Kelas..."
              value={newClassWali}
              onChange={(e) => setNewClassWali(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg text-xs transition"
          >
            <Plus className="w-4 h-4" /> Tambah Kelas
          </button>
        </form>

        <div className="divide-y divide-slate-100">
          {classes.map(c => (
            <div key={c.id} className="py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 text-sm">{c.nama} ({c.id})</span>
                <p className="text-xs text-slate-500">Wali Kelas: {c.waliKelas}</p>
              </div>
              <button
                onClick={() => handleDeleteClass(c.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Backup & Reset Data */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Pemeliharaan Data & Backup
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">Export Backup Data (JSON)</p>
            <p className="text-xs text-slate-500">Unduh cadangan seluruh data absensi, kelas, dan data siswa ke perangkat Anda.</p>
          </div>
          <button
            onClick={exportFullBackup}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition"
          >
            <Download className="w-4 h-4" />
            Download Backup File
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <p className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Reset ke Data Bawaan
            </p>
            <p className="text-xs text-slate-500">Kembalikan sistem ke data sampel awal MTs Darussalam.</p>
          </div>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold px-4 py-2 rounded-xl text-xs transition"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
}
