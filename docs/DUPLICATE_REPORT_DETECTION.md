# Automatic Duplicate Report Detection & Merge

Dokumentasi arsitektur, parameter prototipe, dan aturan penggabungan laporan fasilitas publik yang terindikasi duplikat secara otomatis di Noto PATI.

---

## 1. Overview & Objectives

Ketika terjadi kerusakan fasilitas publik (misal: jalan berlubang di jalan protokol atau lampu PJU padam), beberapa warga sering melaporkan titik kerusakan yang sama dalam selang waktu singkat.

Fitur ini bertujuan:
- **Mengurangi laporan berulang** untuk titik kerusakan yang sama.
- **Mempertahankan bukti warga**: foto dan deskripsi laporan duplikat tidak dihapus, melainkan diikatkan sebagai bukti penguat.
- **Memusatkan progres penanganan & SLA**: warga dan publik dipusatkan pada satu laporan utama yang sah.
- **Auditabilitas**: setiap keputusan tercatat ke dalam log audit (`report_merge_logs`).

---

## 2. Parameter Prototipe / Demo

Parameter awal yang digunakan untuk keperluan simulasi prototipe (bukan standar resmi pemerintah):
- **Radius Maksimal Spasial**: `50 meter`
- **Rentang Waktu Maksimal**: `6 jam` (`21.600 detik`)
- **Toleransi Akurasi GPS**: Laporan dengan `location_accuracy_m > 100m` atau tanpa koordinat diabaikan dari deteksi otomatis (diperlakukan sebagai laporan mandiri).

---

## 3. Aturan Deteksi (Deterministic Rules)

Sebuah laporan baru dinyatakan sebagai **duplikat** jika seluruh aturan berikut terpenuhi secara simultan:
1. **Kategori Sama**: `new_report.category = candidate.category`.
2. **Jarak Geografis ≤ 50m**: Menggunakan PostGIS `ST_DWithin(new_report.location, candidate.location, 50.0)`.
3. **Selisih Waktu ≤ 6 Jam**: `|created_at(new) - created_at(candidate)| <= 6 hours`.
4. **Status Kandidat Aktif**: Status laporan utama harus salah satu dari `diterima`, `diverifikasi`, atau `diproses`. Laporan berstatus terminal (`selesai`, `ditolak`) tidak dapat menjadi target merge.
5. **Anti-Chain (Bukan Duplikat Lain)**: Kandidat utama harus memiliki `merged_into_report_id IS NULL`. Laporan yang sudah digabung tidak boleh menjadi target penggabungan.
6. **Pemilihan Laporan Utama**: Jika terdapat lebih dari 1 kandidat yang cocok, sistem memilih laporan aktif **paling lama** (`ORDER BY created_at ASC LIMIT 1`).

> **Catatan Reliabilitas**: Jika hasil deteksi ragu-ragu, tidak ada kandidat yang memenuhi, atau service deteksi mengalami error, laporan baru **tetap tersimpan normal sebagai laporan mandiri dengan status `diterima`**.

---

## 4. Arsitektur Teknis

### A. Database Schema
- **Kolom `reports.merged_into_report_id`**: Referensi UUID ke laporan utama (`ON DELETE SET NULL`).
- **Status Enum `digabung`**: Nilai baru pada enum `report_status`.
- **Constraint**:
  - `reports_cannot_merge_into_self_check`: Mencegah laporan merge ke dirinya sendiri.
  - `reports_digabung_must_have_parent_check`: Jika status `digabung`, maka wajib memiliki `merged_into_report_id`.
- **Spatial Index**: GIST Index pada kolom `location` (`geography(Point, 4326)`).
- **Audit Table `report_merge_logs`**:
  - Append-only table.
  - Menyimpan `parent_report_id`, `duplicate_report_id`, `distance_meters`, `time_diff_seconds`, `rule_version`, `parameters`, dan timestamp server.
  - RLS: Publik hanya dapat membaca (transparansi tata kelola), hanya `service_role` yang dapat melakukan insert.

### B. Database Stored Procedure
Fungsi PL/pgSQL `detect_and_merge_duplicate_report(uuid, double precision, double precision, text)`:
- Dijalankan secara atomik dengan `SECURITY DEFINER` (dibatasi hanya untuk `service_role`).
- Menggunakan `FOR UPDATE` row lock untuk mencegah *race condition* ketika ada laporan bersamaan.

### C. Server Service & Fallback
- File: [`src/lib/reports/duplicate-detector.ts`](file:///home/panther/Documents/Programming/noto-pati/src/lib/reports/duplicate-detector.ts)
- Dipanggil secara asinkron pasca-submit di Server Action [`src/app/(citizen)/report/new/actions.ts`](file:///home/panther/Documents/Programming/noto-pati/src/app/(citizen)/report/new/actions.ts).
- Dibungkus dalam blok `try/catch` non-fatal agar tidak menggagalkan proses submission warga jika terjadi kendala pada PostGIS/DB RPC.
- Memiliki fallback client-side algoritma Haversine jika fungsi RPC tidak tersedia.

---

## 5. Perilaku Publik & UI

1. **Detail Laporan Duplikat (`/reports/[id]`)**:
   - Menampilkan status badge `Digabung`.
   - Menampilkan banner peringatan informasi yang menjelaskan bahwa kerusakan ini telah digabung ke laporan utama, lengkap dengan link tombol langsung ke laporan utama.
   - Tidak memiliki SLA independen (SLA mengikuti laporan utama).
2. **Detail Laporan Utama**:
   - Menampilkan seksi **"Laporan Serupa dari Warga Lain (+N digabung)"**.
   - Menampilkan riwayat waktu dan link detail bukti warga yang digabung.
3. **Peta Publik & Daftar Publik**:
   - Laporan dengan status `digabung` atau `merged_into_report_id IS NOT NULL` difilter keluar dari daftar utama dan marker peta publik agar tidak terhitung ganda (hanya laporan utama yang tampil).

