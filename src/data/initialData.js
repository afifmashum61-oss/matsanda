export const INITIAL_SCHOOL_PROFILE = {
  nama: "MTs Darussalam Ngesong Jombang",
  nsm: "121235170045",
  npsn: "20583492",
  alamat: "Jl. Maspait No. 04 Ngesong, Sengon, Kec. Jombang, Kab. Jombang",
  kepalaSekolah: "H. Ahmad Syarifuddin, S.Pd.I.",
  nipKepalaSekolah: "19780512 200501 1 003",
  tahunAjaran: "2026/2027",
  semester: "Ganjil",
};

export const JAM_PELAJARAN_REGULAR = [
  { id: 1, label: "Jam Ke-1", waktu: "07.00 - 07.40" },
  { id: 2, label: "Jam Ke-2", waktu: "07.40 - 08.20" },
  { id: 3, label: "Jam Ke-3", waktu: "08.20 - 09.00" },
  { id: 4, label: "Jam Ke-4", waktu: "09.00 - 09.40" },
  { id: 5, label: "Jam Ke-5", waktu: "10.00 - 10.40" },
  { id: 6, label: "Jam Ke-6", waktu: "10.40 - 11.20" },
  { id: 7, label: "Jam Ke-7", waktu: "11.20 - 12.00" },
  { id: 8, label: "Jam Ke-8", waktu: "12.30 - 13.10" },
];

// Special Schedule for Hari Senin (Upacara 06.40 - 07.30, 35 min JP)
export const JAM_PELAJARAN_SENIN = [
  { id: 1, label: "Jam Ke-1", waktu: "07.30 - 08.05", info: "Upacara: 06.40 - 07.30" },
  { id: 2, label: "Jam Ke-2", waktu: "08.05 - 08.40" },
  { id: 3, label: "Jam Ke-3", waktu: "08.40 - 09.15" },
  { id: 4, label: "Jam Ke-4", waktu: "09.15 - 09.50" },
  { id: 5, label: "Jam Ke-5", waktu: "10.25 - 11.00", info: "Istirahat: 09.50 - 10.25" },
  { id: 6, label: "Jam Ke-6", waktu: "11.00 - 11.35" },
  { id: 7, label: "Jam Ke-7", waktu: "11.35 - 12.10" },
  { id: 8, label: "Jam Ke-8", waktu: "12.10 - 12.45" },
];

// Special Schedule for Hari Jum'at (30 min JP, Selesai 11.20)
export const JAM_PELAJARAN_JUMAT = [
  { id: 1, label: "Jam Ke-1", waktu: "07.00 - 07.30" },
  { id: 2, label: "Jam Ke-2", waktu: "07.30 - 08.00" },
  { id: 3, label: "Jam Ke-3", waktu: "08.00 - 08.30" },
  { id: 4, label: "Jam Ke-4", waktu: "08.30 - 09.00" },
  { id: 5, label: "Jam Ke-5", waktu: "09.20 - 09.50", info: "Istirahat: 09.00 - 09.20" },
  { id: 6, label: "Jam Ke-6", waktu: "09.50 - 10.20" },
  { id: 7, label: "Jam Ke-7", waktu: "10.20 - 10.50" },
  { id: 8, label: "Jam Ke-8", waktu: "10.50 - 11.20" },
];

export const getJamPelajaranByDate = (dateStr) => {
  if (!dateStr) return JAM_PELAJARAN_REGULAR;
  const date = new Date(dateStr);
  const day = date.getDay(); // 1 = Monday, 5 = Friday
  if (day === 1) return JAM_PELAJARAN_SENIN;
  if (day === 5) return JAM_PELAJARAN_JUMAT;
  return JAM_PELAJARAN_REGULAR;
};

export const JAM_PELAJARAN = JAM_PELAJARAN_REGULAR;

export const INITIAL_CLASSES = [
  // Kelas 7 (7A - 7E)
  { id: "7A", nama: "Kelas 7A", waliKelas: "Irqima Azzah, S.Pd" },
  { id: "7B", nama: "Kelas 7B", waliKelas: "Krisdayanti, S.Pd" },
  { id: "7C", nama: "Kelas 7C", waliKelas: "Noer Ita Anggraeni, S.Pd" },
  { id: "7D", nama: "Kelas 7D", waliKelas: "Nur Azizatul Khasanah, S.Pd" },
  { id: "7E", nama: "Kelas 7E", waliKelas: "Silvia Dwi Anggraini, S.Pd" },

  // Kelas 8 (8A - 8E)
  { id: "8A", nama: "Kelas 8A", waliKelas: "Rima Farikhatus S. S.Pd" },
  { id: "8B", nama: "Kelas 8B", waliKelas: "Fety Nur Laily, S.Pd" },
  { id: "8C", nama: "Kelas 8C", waliKelas: "Luthfiya Rafika Rahmah, S.Pd" },
  { id: "8D", nama: "Kelas 8D", waliKelas: "Laili Muhlishoh, S.Pd" },
  { id: "8E", nama: "Kelas 8E", waliKelas: "Nur Fadilla, M.Pd.I" },

  // Kelas 9 (9A - 9E)
  { id: "9A", nama: "Kelas 9A", waliKelas: "Shofiyatud Diyana, S.Pd" },
  { id: "9B", nama: "Kelas 9B", waliKelas: "Anis Hidayatullah, S.Pd" },
  { id: "9C", nama: "Kelas 9C", waliKelas: "Syifaa'ul Afidah, S.Pd" },
  { id: "9D", nama: "Kelas 9D", waliKelas: "Ardiani Swastika Prameswari, S. Pd" },
  { id: "9E", nama: "Kelas 9E", waliKelas: "Izza Rahmawati, S.Pd" }
];

export const INITIAL_STUDENTS = [
  // --- KELAS 7A ---
  { id: "S7A01", nis: "2425001", nisn: "0112345671", nama: "Ahmad Zaki Mubarak", gender: "L", kelas: "7A", noHp: "081234567001" },
  { id: "S7A02", nis: "2425002", nisn: "0112345672", nama: "Aliya Maulida", gender: "P", kelas: "7A", noHp: "081234567002" },
  { id: "S7A03", nis: "2425003", nisn: "0112345673", nama: "Bagas Prasetyo", gender: "L", kelas: "7A", noHp: "081234567003" },
  { id: "S7A04", nis: "2425004", nisn: "0112345674", nama: "Dita Rahmawati", gender: "P", kelas: "7A", noHp: "081234567004" },

  // --- KELAS 7B ---
  { id: "S7B01", nis: "2425005", nisn: "0112345675", nama: "Faris Naufal", gender: "L", kelas: "7B", noHp: "081234567005" },
  { id: "S7B02", nis: "2425006", nisn: "0112345676", nama: "Hasan Basri", gender: "L", kelas: "7B", noHp: "081234567006" },
  { id: "S7B03", nis: "2425007", nisn: "0112345677", nama: "Intan Nuraini", gender: "P", kelas: "7B", noHp: "081234567007" },

  // --- KELAS 7C ---
  { id: "S7C01", nis: "2425008", nisn: "0112345678", nama: "Khoirul Anam", gender: "L", kelas: "7C", noHp: "081234567008" },
  { id: "S7C02", nis: "2425009", nisn: "0112345679", nama: "Lina Zahra", gender: "P", kelas: "7C", noHp: "081234567009" },

  // --- KELAS 7D ---
  { id: "S7D01", nis: "2425010", nisn: "0112345680", nama: "M. Rizky Ramadhan", gender: "L", kelas: "7D", noHp: "081234567010" },
  { id: "S7D02", nis: "2425011", nisn: "0112345681", nama: "Naila Safitri", gender: "P", kelas: "7D", noHp: "081234567011" },

  // --- KELAS 7E ---
  { id: "S7E01", nis: "2425012", nisn: "0112345682", nama: "Okta Pratama", gender: "L", kelas: "7E", noHp: "081234567012" },
  { id: "S7E02", nis: "2425013", nisn: "0112345683", nama: "Putri Aulia", gender: "P", kelas: "7E", noHp: "081234567013" },

  // --- KELAS 8A ---
  { id: "S8A01", nis: "2324001", nisn: "0102345680", nama: "Muhammad Syarifuddin", gender: "L", kelas: "8A", noHp: "081234567014" },
  { id: "S8A02", nis: "2324002", nisn: "0102345681", nama: "Nabila Az-Zahra", gender: "P", kelas: "8A", noHp: "081234567015" },

  // --- KELAS 8B ---
  { id: "S8B01", nis: "2324003", nisn: "0102345682", nama: "Rahmat Hidayatullah", gender: "L", kelas: "8B", noHp: "081234567016" },
  { id: "S8B02", nis: "2324004", nisn: "0102345683", nama: "Siti Nurjanah", gender: "P", kelas: "8B", noHp: "081234567017" },

  // --- KELAS 8C ---
  { id: "S8C01", nis: "2324005", nisn: "0102345684", nama: "Taufik Hidayat", gender: "L", kelas: "8C", noHp: "081234567018" },
  { id: "S8C02", nis: "2324006", nisn: "0102345685", nama: "Uswatun Hasanah", gender: "P", kelas: "8C", noHp: "081234567019" },

  // --- KELAS 8D ---
  { id: "S8D01", nis: "2324007", nisn: "0102345686", nama: "Vino Alamsyah", gender: "L", kelas: "8D", noHp: "081234567020" },
  { id: "S8D02", nis: "2324008", nisn: "0102345687", nama: "Widiya Astuti", gender: "P", kelas: "8D", noHp: "081234567021" },

  // --- KELAS 8E ---
  { id: "S8E01", nis: "2324009", nisn: "0102345688", nama: "Yafi Kurniawan", gender: "L", kelas: "8E", noHp: "081234567022" },
  { id: "S8E02", nis: "2324010", nisn: "0102345689", nama: "Zainab Al-Kubra", gender: "P", kelas: "8E", noHp: "081234567023" },

  // --- KELAS 9A ---
  { id: "S9A01", nis: "2223001", nisn: "0092345685", nama: "Umar Al-Faruq", gender: "L", kelas: "9A", noHp: "081234567024" },
  { id: "S9A02", nis: "2223002", nisn: "0092345686", nama: "Vina Amelia", gender: "P", kelas: "9A", noHp: "081234567025" },

  // --- KELAS 9B ---
  { id: "S9B01", nis: "2223003", nisn: "0092345687", nama: "Yusuf Habibie", gender: "L", kelas: "9B", noHp: "081234567026" },
  { id: "S9B02", nis: "2223004", nisn: "0092345688", nama: "Zahra Salsabila", gender: "P", kelas: "9B", noHp: "081234567027" },

  // --- KELAS 9C ---
  { id: "S9C01", nis: "2223005", nisn: "0092345689", nama: "Aditya Wardana", gender: "L", kelas: "9C", noHp: "081234567028" },
  { id: "S9C02", nis: "2223006", nisn: "0092345690", nama: "Bella Safira", gender: "P", kelas: "9C", noHp: "081234567029" },

  // --- KELAS 9D ---
  { id: "S9D01", nis: "2223007", nisn: "0092345691", nama: "Chandra Wijaya", gender: "L", kelas: "9D", noHp: "081234567030" },
  { id: "S9D02", nis: "2223008", nisn: "0092345692", nama: "Dewi Lestari", gender: "P", kelas: "9D", noHp: "081234567031" },

  // --- KELAS 9E ---
  { id: "S9E01", nis: "2223009", nisn: "0092345693", nama: "Eko Prasetyo", gender: "L", kelas: "9E", noHp: "081234567032" },
  { id: "S9E02", nis: "2223010", nisn: "0092345694", nama: "Fitri Handayani", gender: "P", kelas: "9E", noHp: "081234567033" }
];

// Seed attendance for today (format: YYYY-MM-DD)
const getTodayStr = () => new Date().toISOString().split('T')[0];

export const INITIAL_ATTENDANCE = [
  { studentId: "S7A01", date: getTodayStr(), jamKe: 1, status: "Hadir", catatan: "" },
  { studentId: "S7A02", date: getTodayStr(), jamKe: 1, status: "Hadir", catatan: "" },
  { studentId: "S7A03", date: getTodayStr(), jamKe: 1, status: "Sakit", catatan: "Surat dokter" },
  { studentId: "S7A04", date: getTodayStr(), jamKe: 1, status: "Izin", catatan: "Acara keluarga" },
  { studentId: "S7B01", date: getTodayStr(), jamKe: 1, status: "Hadir", catatan: "" },
  { studentId: "S7B02", date: getTodayStr(), jamKe: 1, status: "Alpa", catatan: "Tanpa keterangan" },
  { studentId: "S8A01", date: getTodayStr(), jamKe: 1, status: "Hadir", catatan: "" },
  { studentId: "S8A02", date: getTodayStr(), jamKe: 1, status: "Hadir", catatan: "" },
  { studentId: "S9A01", date: getTodayStr(), jamKe: 1, status: "Hadir", catatan: "" },
  { studentId: "S9A02", date: getTodayStr(), jamKe: 1, status: "Sakit", catatan: "Demam" },
];
