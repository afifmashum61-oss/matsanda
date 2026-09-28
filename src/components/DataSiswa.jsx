import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  X, 
  Check, 
  Filter,
  Users
} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DataSiswa({ students, classes, onSaveStudents }) {
  const [selectedFilterClass, setSelectedFilterClass] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    nama: '',
    gender: 'L',
    kelas: classes[0]?.id || '7A',
    noHp: ''
  });

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesClass = selectedFilterClass === 'ALL' || s.kelas === selectedFilterClass;
    const matchesSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.nis.includes(searchTerm) ||
                          (s.nisn && s.nisn.includes(searchTerm));
    return matchesClass && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      nis: '',
      nisn: '',
      nama: '',
      gender: 'L',
      kelas: selectedFilterClass !== 'ALL' ? selectedFilterClass : (classes[0]?.id || '7A'),
      noHp: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setEditingStudent(student);
    setFormData({
      nis: student.nis || '',
      nisn: student.nisn || '',
      nama: student.nama || '',
      gender: student.gender || 'L',
      kelas: student.kelas || '7A',
      noHp: student.noHp || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (studentId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data siswa ini?')) {
      const updated = students.filter(s => s.id !== studentId);
      onSaveStudents(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.nis.trim()) {
      alert('Nama dan NIS wajib diisi!');
      return;
    }

    if (editingStudent) {
      const updated = students.map(s => 
        s.id === editingStudent.id ? { ...s, ...formData } : s
      );
      onSaveStudents(updated);
    } else {
      const newStudent = {
        id: `S${Date.now()}`,
        ...formData
      };
      onSaveStudents([...students, newStudent]);
    }

    setIsModalOpen(false);
  };

  // Export Students to Excel
  const handleExportExcel = () => {
    const dataToExport = filteredStudents.map((s, idx) => ({
      No: idx + 1,
      NIS: s.nis,
      NISN: s.nisn || '-',
      'Nama Lengkap': s.nama,
      'Jenis Kelamin': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      Kelas: s.kelas,
      'No HP Ortu': s.noHp || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Siswa');
    XLSX.writeFile(workbook, `Data_Siswa_MTs_Darussalam_${selectedFilterClass}.xlsx`);
  };

  // Download Sample Template for Import
  const handleDownloadTemplate = () => {
    const sample = [
      { NIS: '2425099', NISN: '0112345999', 'Nama Lengkap': 'Ahmad Contoh', 'Jenis Kelamin': 'L', Kelas: '7A', 'No HP Ortu': '08123456789' },
      { NIS: '2425100', NISN: '0112345100', 'Nama Lengkap': 'Siti Contoh', 'Jenis Kelamin': 'P', Kelas: '7A', 'No HP Ortu': '08123456780' }
    ];
    const worksheet = XLSX.utils.json_to_sheet(sample);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');
    XLSX.writeFile(workbook, 'Template_Import_Siswa_MTs_Darussalam.xlsx');
  };

  // Import Excel File
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const newStudents = data.map((item, idx) => ({
          id: `SIMP_${Date.now()}_${idx}`,
          nis: String(item.NIS || item.nis || ''),
          nisn: String(item.NISN || item.nisn || ''),
          nama: String(item['Nama Lengkap'] || item.nama || ''),
          gender: String(item['Jenis Kelamin'] || item.gender || 'L').startsWith('P') ? 'P' : 'L',
          kelas: String(item.Kelas || item.kelas || '7A'),
          noHp: String(item['No HP Ortu'] || item.noHp || '')
        })).filter(s => s.nama && s.nis);

        if (newStudents.length > 0) {
          onSaveStudents([...students, ...newStudents]);
          alert(`Berhasil mengimpor ${newStudents.length} data siswa!`);
        } else {
          alert('Format file Excel tidak sesuai atau data kosong.');
        }
      } catch (err) {
        alert('Gagal membaca file Excel. Pastikan format file sesuai template.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Data Master Siswa</h1>
            <p className="text-xs text-slate-500">Kelola informasi data siswa MTs Darussalam Ngesong Jombang per kelas.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold px-3 py-2 rounded-xl text-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export Excel
            </button>

            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-3 py-2 rounded-xl text-xs transition"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Template Excel
            </button>

            <label className="inline-flex items-center gap-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold px-3 py-2 rounded-xl text-xs cursor-pointer transition">
              <Upload className="w-4 h-4 text-teal-600" />
              Import Excel
              <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
            </label>

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Siswa Baru
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Filter Kelas</label>
            <select
              value={selectedFilterClass}
              onChange={(e) => setSelectedFilterClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="ALL">Semua Kelas ({students.length} Siswa)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Kelas {c.id} ({students.filter(s => s.kelas === c.id).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Pencarian Siswa</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, NIS, atau NISN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">Tidak ada data siswa ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">NIS</th>
                  <th className="py-3.5 px-4">NISN</th>
                  <th className="py-3.5 px-4">Nama Lengkap</th>
                  <th className="py-3.5 px-4 text-center">L/P</th>
                  <th className="py-3.5 px-4 text-center">Kelas</th>
                  <th className="py-3.5 px-4">No HP Ortu</th>
                  <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-500">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-700">{s.nis}</td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{s.nisn || '-'}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.nama}</td>
                    <td className="py-3.5 px-4 text-center text-xs font-semibold">
                      <span className={`px-2 py-0.5 rounded ${s.gender === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                        {s.gender}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-xs">
                        {s.kelas}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600">{s.noHp || '-'}</td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                          title="Edit Siswa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Hapus Siswa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah/Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIS *</label>
                  <input
                    type="text"
                    required
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="2425001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NISN</label>
                  <input
                    type="text"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="0112345678"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Nama Lengkap Siswa"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Kelas {c.id}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. HP Orang Tua / WhatsApp</label>
                <input
                  type="text"
                  value={formData.noHp}
                  onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="08123456789"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                >
                  {editingStudent ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
