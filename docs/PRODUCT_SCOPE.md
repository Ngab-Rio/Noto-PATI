# Product Scope — Noto PATI

> **Sumber:** Noto_PATI_PRD_v1.md (v1.0, 23 Oktober 2026)
> **Fungsi dokumen:** Pagar scope. Jika sebuah fitur tidak tertulis di bagian "Dalam Scope", fitur itu **tidak dikerjakan** sampai scope diubah secara resmi (lihat bagian 8).
> **Status produk:** Prototipe lomba, bukan sistem resmi Pemerintah Kabupaten Pati.

---

## 1. Ringkasan Singkat

Noto PATI adalah web mobile-first untuk melaporkan kerusakan infrastruktur publik di Kabupaten Pati (jalan rusak, drainase, penerangan jalan, trotoar, jembatan/infrastruktur lain). Laporan memakai foto kamera langsung dan lokasi yang divalidasi di dalam wilayah Kabupaten Pati. Status penanganan dapat dipantau publik, Admin memverifikasi dan menindaklanjuti, dan satu halaman Anggaran menampilkan subset data APBD 2025 yang sudah diverifikasi manual.

**Tiga masalah yang dijawab:** kepastian tindak lanjut, laporan duplikat, dan informasi anggaran yang sulit dipahami.

**Prinsip yang tidak boleh dilanggar:**
1. Laporan mudah dibuat.
2. Status dapat ditelusuri.
3. Data publik bersumber jelas.
4. AI tidak menggantikan verifikasi manusia.
5. Tidak ada klaim bahwa pemerintah telah menerima atau menangani laporan tanpa konfirmasi nyata.

---

## 2. Target Pengguna

| Jenis pengguna | Akun | Yang boleh dilakukan |
|---|---|---|
| **Pengunjung** | Tidak perlu | Melihat peta, daftar/detail laporan publik, linimasa publik, dan halaman Anggaran |
| **Warga** | Wajib (email/Google via Supabase Auth) | Membuat laporan, melihat laporan sendiri; (P1) mendukung laporan, memberi rating, mengajukan buka kembali |
| **Admin** | Role khusus, ditetapkan lewat proses administratif aman | Verifikasi, tolak (dengan alasan), gabung duplikat, ubah status, unggah bukti tindak lanjut |

**Ketentuan pengguna:**
- Hanya ada dua role terautentikasi: `Warga` dan `Admin`. **OPD bukan role** pada MVP.
- Role Admin tidak bisa dipilih atau diubah sendiri oleh pengguna dari browser.
- Pelaporan **wajib akun**. "Anonim" hanya berarti identitas pelapor tidak tampil ke publik.
- Konteks pengguna: mayoritas akses dari ponsel dengan koneksi seluler.

---

## 3. Dalam Scope: MVP P0 (wajib untuk demo inti)

| # | Fitur | Ref PRD |
|---|---|---|
| 1 | Landing page yang menjelaskan fungsi dan batasan prototipe | 5.1 |
| 2 | Autentikasi Warga (email/Google) via Supabase Auth, role aman | FR-01 |
| 3 | Form laporan: judul, kategori, deskripsi, **foto kamera langsung maks. 3**, lokasi perangkat | FR-02, FR-03 |
| 4 | Validasi koordinat di **server** terhadap polygon Kabupaten Pati yang terverifikasi (PostGIS `ST_Covers`) | FR-04 |
| 5 | Peta publik: marker per status, filter kategori/status, clustering marker | FR-05 |
| 6 | Detail laporan: status, linimasa publik, indikator SLA, foto aman ditampilkan; identitas pelapor disembunyikan | FR-06 |
| 7 | Dashboard Admin: antrean, verifikasi, tolak + alasan, gabung duplikat, ubah status, unggah bukti tindak lanjut | FR-07 |
| 8 | Riwayat status (append-only dari sisi aplikasi): status lama/baru, waktu server, pelaku, catatan | FR-08 |
| 9 | SLA simulasi: hitung dari waktu server, tampil sisa waktu/terlambat, tanda di dashboard | FR-09 |
| 10 | Kandidat duplikat berbasis **jarak + kategori** sebagai bantuan (bukan keputusan otomatis) | FR-10 |
| 11 | Halaman Anggaran: subset APBD 2025 terverifikasi manual, label jenis angka (mis. "pagu, bukan realisasi"), dokumen + halaman sumber, versi dokumen | BG-01 |
| 12 | Label jelas untuk data simulasi, SLA demo, dan laporan yang belum terkonfirmasi ditangani pemerintah | 5.1 |

### Kategori laporan (tetap pada MVP)
`road_damage` (Jalan rusak), `drainage` (Drainase dan saluran air), `street_lighting` (Penerangan jalan), `sidewalk` (Trotoar dan fasilitas pejalan kaki), `other_infrastructure` (Jembatan dan infrastruktur lainnya).

### Status dan transisi (dikunci)
- Status: `Diterima`, `Diverifikasi`, `Diproses`, `Selesai`, `Dibuka Kembali`, `Ditolak`, `Digabung`.
- `Diterima` → `Diverifikasi` | `Ditolak` | `Digabung`
- `Diverifikasi` → `Diproses`
- `Diproses` → `Selesai`
- `Selesai` → `Dibuka Kembali` (hanya setelah permintaan Warga disetujui Admin)
- `Dibuka Kembali` → `Diproses`
- `Ditolak` dan `Digabung` adalah status akhir. Transisi lain ditolak server.
- Status `Ditutup` **tidak dipakai**.

### Nilai SLA demo (bukan standar resmi)
- Verifikasi: 24 jam kalender. Penanganan: 7 hari kalender setelah diverifikasi.
- Saat pembukaan kembali disetujui, siklus penanganan baru dimulai dengan tenggat baru.

---

## 4. Dalam Scope: P1 (hanya setelah seluruh P0 stabil dan lulus uji)

P1 **bukan syarat demo inti**. Dikerjakan hanya jika waktu tersisa, dan tidak boleh mengorbankan P0.

| # | Fitur | Ref PRD |
|---|---|---|
| 1 | Notifikasi email untuk kejadian penting (kegagalan email tidak menggagalkan laporan) | FR-13 |
| 2 | Dukungan laporan: 1 dukungan per akun per laporan, bukan laporan sendiri | FR-11 |
| 3 | Rating 1–5 setelah `Selesai` + permintaan buka kembali yang ditinjau Admin | FR-12 |
| 4 | Analisis foto AI: usulan kategori + ringkasan visual; tidak boleh menghambat laporan manual | AI-01 |
| 5 | Impor CSV anggaran + antarmuka verifikasi Admin (jika belum, data dimuat tim lewat proses terkontrol) | BG-02 |
| 6 | PWA installable dengan cache **aset statis saja** | 5.2 |

---

## 5. Di Luar Scope (tidak dikerjakan)

### 5.1 Dikecualikan secara eksplisit
- Integrasi resmi dengan SP4N-LAPOR, SIPD, atau sistem pemerintah lain.
- Klaim bahwa laporan telah ditangani pemerintah tanpa konfirmasi yang dapat diverifikasi.
- Data bansos atau data pribadi penerima manfaat.
- Pembayaran.
- Aplikasi native Android/iOS.
- Foto dari galeri sebagai pengganti kamera langsung (tanpa fallback unggah galeri).
- Pengubahan bukti foto oleh AI yang merekayasa kondisi kerusakan.

### 5.2 Ditunda ke tahap lanjutan (P2), **jangan dikerjakan sekarang**
- Pemeriksaan otomatis sumber APBD tiap 30 hari dan pengambilan dokumen/CSV baru.
- Ekstraksi tabel PDF otomatis, OCR, pipeline validasi data.
- Penjelasan APBD oleh AI (AI-04).
- Deteksi duplikat lanjutan berbasis kemiripan foto/teks/embedding (AI-02).
- Skor urgensi berbobot (AI-03).
- Gamifikasi: misi Cek Anggaran, poin, lencana, papan peringkat kecamatan (GM-01).
- Skor akuntabilitas OPD otomatis, prediksi titik rawan, hubungan laporan-anggaran per kategori/kecamatan.
- Penyimpanan/pengiriman draf laporan saat offline.

### 5.3 Larangan perilaku (berlaku selalu)
- Tidak menggabungkan laporan otomatis hanya berdasarkan skor.
- AI tidak boleh menyetujui laporan, mengubah status, atau memutuskan penggabungan.
- Tidak memakai bounding box kasar atau koordinat demo sebagai pengganti polygon batas wilayah.
- Tidak mempublikasikan angka anggaran yang belum diverifikasi; tidak menyamakan total APBD, belanja, pagu, dan realisasi.
- Tidak melakukan scraping otomatis atau penjelasan anggaran oleh AI pada MVP.
- Tidak melacak lokasi pengguna secara terus-menerus.

---

## 6. Kriteria Penerimaan

### 6.1 Kriteria selesai MVP (demo layak jika semua lulus)
1. Warga dapat daftar/masuk; pengguna tak berwenang tidak dapat mengakses dashboard Admin.
2. Warga dapat membuat laporan dengan kamera langsung (maks. 3 foto), kategori, judul, deskripsi, dan lokasi valid.
3. Sistem menolak laporan tanpa data wajib, foto yang gagal diunggah, atau koordinat di luar Kabupaten Pati.
4. Penolakan izin kamera/lokasi menghasilkan pesan jelas dan tidak membuat laporan sukses palsu.
5. Peta menampilkan laporan publik dari database; filter kategori/status berfungsi.
6. Admin dapat verifikasi, tolak dengan alasan, gabung duplikat, ubah status sesuai transisi, dan unggah bukti tindak lanjut.
7. Perubahan status terekam di riwayat dengan waktu server dan pelaku.
8. SLA dihitung dari waktu server; status terlambat konsisten di detail laporan dan dashboard Admin.
9. Pengunjung tidak dapat melihat info privat pelapor atau foto yang dibatasi akses.
10. Halaman Anggaran hanya menampilkan data terverifikasi, dengan label jenis angka dan sumber dokumen yang dapat dibuka.
11. Pelaporan tetap berjalan ketika AI tidak aktif atau gagal.
12. Semua data simulasi ditandai demo dan tidak menimbulkan kesan penanganan pemerintah yang belum terjadi.

### 6.2 Target metrik (target evaluasi prototipe, bukan klaim kinerja produksi)

| Tujuan | Target |
|---|---|
| Pelaporan mudah | Median waktu isi form sampai terkirim < 2 menit (skenario normal, ±10 penguji) |
| Validasi lokasi | 100% kasus uji batas wilayah sesuai hasil yang diharapkan (dalam, luar, tepat di batas) |
| Status transparan | 100% laporan tampil dengan status, waktu pembaruan, dan info SLA relevan |
| Riwayat tertelusuri | 100% perubahan status tercatat dengan waktu dan pelaku |
| Data anggaran tepercaya | 100% angka terpublikasi punya sumber dokumen + halaman/bagian |
| Peta berfungsi | Seluruh skenario uji filter dan clustering lulus |
| Kandidat duplikat | ≥80% relevansi pada 30 pasangan uji berlabel |
| Analisis foto (jika P1) | ≥80% kesesuaian kategori pada 30 foto uji; bukan jaminan akurasi lapangan |
| Performa | Halaman publik < 3 detik pada 4G wajar (di luar waktu layanan AI); foto ±1 MB setelah kompresi |

### 6.3 Kriteria non-fungsional minimum
- **Keamanan:** validasi input di server, rate limiting pada pengiriman laporan, secret dan service role hanya di server.
- **RLS:** aktif di tabel yang diakses via Supabase client; diuji untuk Pengunjung, Warga, Admin.
- **Privasi:** EXIF tidak diperlukan dihapus; identitas pelapor tidak tampil publik; foto asli tetap disimpan sebagai sumber.
- **Aksesibilitas:** label form jelas, kontras sasaran WCAG AA, navigasi keyboard.
- **Keandalan:** kegagalan AI/email/unggah tidak menghasilkan sukses palsu; siapkan data demo aman untuk antisipasi gangguan saat presentasi.

---

## 7. Keputusan yang Harus Dikunci Sebelum Coding

Pekerjaan terkait **tidak boleh dianggap selesai** sebelum item ini terkunci.

| Keputusan | Kondisi selesai |
|---|---|
| Sumber polygon Kabupaten Pati | File, asal/lisensi, sistem koordinat, dan hasil uji polygon terdokumentasi |
| Nilai SLA demo final | Disetujui tim dan dilabeli simulasi |
| Dataset APBD MVP | Subset, versi dokumen, nilai, jenis nilai, halaman, sumber sudah diperiksa manual |
| Provider dan pendekatan AI foto (jika P1) | Dataset uji, kualitas, biaya, privasi, fallback terdokumentasi |
| Kebijakan akses foto | Aturan publik/privat dan retensi disetujui sebelum upload diaktifkan |
| Perilaku PWA offline | MVP hanya cache aset statis |
| Pengiriman email (jika P1) | Provider dipilih, atau ditandai belum diimplementasikan |

---

## 8. Aturan Perubahan Scope

Sebuah permintaan fitur baru atau perluasan fitur lama hanya boleh masuk jika:
1. Fitur P0 sudah semuanya lulus kriteria penerimaan (bagian 6.1).
2. Perubahan dicatat di tabel log di bawah, lengkap dengan alasan dan fitur apa yang dikorbankan atau ditunda.
3. Dampaknya pada kriteria penerimaan dan pengujian sudah ditinjau.

**Uji cepat saat ragu:** *Apakah fitur ini termasuk P0 di bagian 3? Jika tidak, apakah P0 sudah selesai dan teruji?* Jika jawabannya tidak, fitur itu ditunda.

### Log Perubahan Scope

| Tanggal | Perubahan | Alasan | Dikorbankan/ditunda | Disetujui oleh |
|---|---|---|---|---|
| 23 Okt 2026 | Dokumen dibuat dari PRD v1.0 | Baseline scope | - | RADITYA |
