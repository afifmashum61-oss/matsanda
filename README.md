# 🏫 MATSANDA - Sistem Absensi Siswa MTs Darussalam Ngesong Jombang

Aplikasi Sistem Informasi Absensi Siswa Digital berbasis web modern untuk **MTs Darussalam Ngesong Jombang**. Dirancang untuk mengelola absensi harian per kelas, per jam pelajaran (Ke-1 s/d Ke-8), data master siswa, rekapitulasi bulanan, serta cetak laporan dokumen resmi dan ekspor Excel.

![MATSANDA Logo](./public/logo.png)

---

## 🌟 Fitur Utama

- 📊 **Dashboard Real-time**: Statistik kehadiran harian, persentase kehadiran, per-kelas status, serta daftar ketidakhadiran siswa dengan WhatsApp Ortu link.
- ⏰ **Absensi Per Jam Pelajaran (1 - 8)**: Form input kehadiran per jam pelajaran (Jam Ke-1 s/d Jam Ke-8) dengan tombol 1-klik "Tandai Semua Hadir".
- 👥 **Master Data Siswa & Kelas**: Pengelolaan 15 Rombongan Belajar (Kelas 7A-E, 8A-E, 9A-E), pencarian cepat NIS/NISN, serta Import & Export file Excel (`.xlsx`).
- 📄 **Rekapitulasi & Cetak Laporan PDF**: Rekap bulanan matriks H1-H31 & harian per jam pelajaran lengkap dengan Kop Surat Resmi MTs Darussalam Ngesong Jombang dan kolom Tanda Tangan.
- 🍔 **Bilah Navigasi Hamburger Drawer**: Tampilan modern *full-width* dengan navigasi drawer yang responsif di desktop maupun HP.
- ⚙️ **Identitas Sekolah & Backup Data**: Pengaturan profil madrasah, wali kelas, serta fitur ekspor cadangan data JSON.

---

## 🚀 Cara Menjalankan

1. **Clone repository ini**:
   ```bash
   git clone https://github.com/afifmashum61-oss/matsanda.git
   cd matsanda
   ```

2. **Install dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan server pengembang**:
   ```bash
   npm run dev
   ```
   Buka `http://localhost:5173` di browser Anda.

4. **Build untuk Produksi**:
   ```bash
   npm run build
   ```

---

## 🛠️ Teknologi yang Digunakan

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Export Utility**: SheetJS (XLSX)
- **Data Persistence**: LocalStorage & IndexedDB

---

## 📜 Lisensi & Identitas Sekolah

**MTs Darussalam Ngesong Jombang**  
Jl. Maspait No. 04 Ngesong, Sengon, Kec. Jombang, Kab. Jombang, Jawa Timur  
NSM: 121235170045 | NPSN: 20583492
