# Security & Privacy — Noto PATI

> **Sumber:** Noto_PATI_PRD_v1.md (bagian 11, 12, 13, 14, 15, 17, 18, 19)
> **Berpasangan dengan:** `productscope.md` dan `authentication.md`
> **Catatan:** Noto PATI adalah prototipe lomba. Dokumen ini menetapkan batas keamanan minimum agar demo aman dan tidak menyesatkan; bukan sertifikasi keamanan produksi.

---

## 1. Prinsip Keamanan

1. **Server menentukan.** Validasi klien hanya kenyamanan; keputusan akhir selalu di server.
2. **Hak akses minimum.** Setiap peran hanya mendapat akses yang diperlukan (RLS + otorisasi server).
3. **Rahasia tidak pernah ke browser.** Service role dan API key hanya di server.
4. **Tidak ada sukses palsu.** Kegagalan unggah, kamera, lokasi, AI, atau email harus tampak jelas dan tidak menghasilkan laporan "berhasil" yang tidak lengkap.
5. **Privasi sejak desain.** Identitas pelapor tersembunyi, EXIF dibersihkan, lokasi tidak dilacak terus-menerus.
6. **Jangan menyesatkan publik.** Data demo, SLA simulasi, dan angka anggaran diberi label yang tepat.

---

## 2. Inventaris Aset dan Risiko Utama

| Aset | Risiko | Kontrol utama |
|---|---|---|
| Akun dan role | Eskalasi ke Admin | Role hanya lewat proses administratif; RLS; cek server |
| Identitas pelapor | Terbuka ke publik | View/kolom publik tanpa `reporter_id`; RLS |
| Foto laporan (wajah, pelat nomor, info pribadi) | Kebocoran privasi | Peringatan, hapus EXIF, akses Storage dibatasi, foto asli dapat dibatasi ke Admin |
| Koordinat lokasi | Pelacakan/penyalahgunaan | Izin hanya saat membuat laporan; tanpa pelacakan berkelanjutan |
| Service role key, API key AI/email | Akses tidak sah, biaya membengkak | Hanya env server; tidak di repo/bundle |
| Riwayat status | Manipulasi bukti | Append-only dari sisi aplikasi; pelaku dari sesi |
| Data anggaran | Angka salah, menyesatkan | Verifikasi manual, label jenis angka, sumber + halaman |
| Layanan AI eksternal | Kebocoran data, biaya, hasil keliru | Opsional, rate limit, fallback manual, evaluasi privasi |

---

## 3. Kontrol Keamanan Aplikasi

### 3.1 Validasi input
- Semua input divalidasi di server dengan skema (Zod): judul, kategori (slug yang dikenal), deskripsi, jumlah foto (1–3), tipe dan ukuran file, koordinat (rentang valid, urutan longitude/latitude).
- Tolak laporan tanpa data wajib atau tanpa minimal satu foto.
- Teks pengguna dirender dengan escaping standar framework (cegah XSS); tidak memakai `dangerouslySetInnerHTML` pada konten pengguna.
- Query database memakai klien/parameter terparameterisasi; tidak merangkai SQL dari input.

### 3.2 Rate limiting
- Terapkan pada: pembuatan laporan, pemanggilan AI, pengiriman email, dan percobaan login (selain bawaan Supabase).
- Tujuan: mengurangi spam, laporan palsu, dan penyalahgunaan biaya.
- Batas awal ditentukan tim dan diuji; respons saat terkena batas harus jelas (`429`).

### 3.3 Row Level Security
- RLS aktif di semua tabel yang diakses via Supabase client.
- Detail kebijakan per tabel ada di `authentication.md` bagian 5.
- Constraint database sebagai lapis kedua: unique `(user_id, report_id)` pada dukungan, foreign key, constraint status valid.

### 3.4 Keamanan Storage (foto)
- Simpan **path Storage**, bukan hanya URL publik.
- Bedakan `photo_type`: foto laporan vs bukti tindak lanjut.
- Bucket tidak dibuka bebas; akses mengikuti kebijakan publik/privat yang disetujui sebelum upload diaktifkan.
- Foto asli tetap disimpan sebagai sumber; versi blur (jika ada) disimpan sebagai turunan terpisah.
- Validasi tipe MIME dan ukuran di server; batasi nama dan path file.

---

## 4. Privasi dan Data Pribadi

### 4.1 Identitas pelapor
- Tidak ditampilkan di halaman publik, peta, atau API publik.
- Log audit internal hanya dapat diakses pihak berwenang (Admin).

### 4.2 Foto
- Pengambilan **hanya lewat kamera langsung**; tidak ada fallback galeri.
- Tampilkan peringatan agar warga menghindari wajah, pelat nomor, dan informasi pribadi.
- Kompres di klien (target ±1 MB) dan **hapus EXIF yang tidak diperlukan** sebelum unggah.
- Penghapusan EXIF **tidak** menghilangkan identitas yang terlihat di gambar; karena itu foto dapat dibatasi ke Admin bila memuat informasi yang perlu dilindungi.
- Kompresi tidak boleh mengubah kesan kondisi kerusakan.

### 4.3 Lokasi
- Minta izin geolokasi hanya saat membuat laporan.
- Simpan koordinat, akurasi, dan waktu pengambilan untuk validasi.
- Koordinat bukan bukti mutlak foto diambil di titik tersebut; jangan diklaim demikian.
- Tidak ada pelacakan pergerakan terus-menerus.

### 4.4 Retensi
- Kebijakan retensi dan penghapusan data **harus ditetapkan sebelum** prototipe dipakai dengan laporan nyata.
- Sampai itu ditetapkan, gunakan data demo yang diberi label.

---

## 5. Validasi Wilayah (Geospasial)

- Gunakan polygon/multipolygon Kabupaten Pati dari sumber yang dapat dipertanggungjawabkan; dokumentasikan asal, lisensi, dan sistem koordinat.
- Validasi di server dengan PostGIS `ST_Covers` (titik di dalam atau tepat pada batas).
- Urutan koordinat: **longitude, latitude**.
- **Dilarang** memakai bounding box kasar atau koordinat demo sebagai pengganti batas resmi.
- Fitur validasi lokasi belum dianggap selesai sebelum lulus uji titik di dalam, di luar, dan di tepi polygon.
- Lokasi di luar polygon ditolak sebelum laporan dibuat, dengan pesan yang jelas.

---

## 6. Keamanan Integrasi AI (P1, opsional)

- AI adalah **bantuan, bukan prasyarat**. Kegagalan, kelambatan, atau keyakinan rendah → form manual tetap berfungsi.
- Panggilan AI hanya dari server Next.js dengan kredensial server.
- Output model divalidasi dan dibatasi ke format yang diharapkan; tidak dieksekusi atau dirender mentah.
- AI **tidak boleh**: menyetujui laporan, mengubah status, memutuskan penggabungan, menentukan lokasi foto, memastikan tingkat bahaya secara pasti, atau mengubah/merekayasa foto bukti.
- Jangan kirim foto yang dapat mengidentifikasi seseorang ke penyedia eksternal sebelum risiko dan kebijakan penyimpanan/pelatihan data dievaluasi.
- Sebelum aktif, periksa: harga, kuota, lokasi pemrosesan, masa retensi, kebijakan penggunaan data untuk pelatihan, dan persyaratan API terbaru.
- Catat versi model dan prediksi untuk evaluasi; laporan asli warga tetap disimpan.
- Rate limit dan batas biaya wajib untuk mencegah penyalahgunaan.

---

## 7. Integritas dan Kejujuran Data

### 7.1 Laporan dan status
- Waktu penerimaan dan perubahan status berasal dari server, bukan jam perangkat.
- Riwayat status append-only dari sisi aplikasi (status lama/baru, waktu, pelaku, alasan).
- SLA adalah **target simulasi**; label ini wajib tampil di halaman publik.
- Perubahan konfigurasi SLA berlaku untuk laporan baru; tidak mengubah tenggat laporan berjalan secara diam-diam.
- Data simulasi dibedakan jelas dari klaim penanganan nyata. Aplikasi tidak boleh menyiratkan pemerintah sudah menerima/menangani laporan tanpa konfirmasi nyata.

### 7.2 Data anggaran (APBD 2025)
- Hanya data yang telah diperiksa manual dan ditelusuri ke dokumen sumber yang dipublikasikan.
- Setiap item menyimpan: nama dokumen, versi/status, tahun anggaran, pos/program, nilai, jenis nilai, halaman/bagian, URL sumber, tanggal verifikasi/impor.
- Label jenis angka wajib (mis. "pagu, bukan realisasi"); APBD murni dan perubahan dipisahkan.
- Total dihitung dengan kode deterministik, bukan oleh model.
- Jika data belum terverifikasi: tampilkan "belum tersedia", jangan perkiraan.

---

## 8. Keandalan dan Kegagalan Layanan

| Kegagalan | Perilaku yang wajib |
|---|---|
| Izin kamera ditolak / kamera tidak ada | Pesan jelas + instruksi + percobaan ulang; laporan tidak dianggap terkirim |
| Izin lokasi ditolak / lokasi gagal | Pesan jelas; laporan tidak dibuat |
| Unggah foto/penyimpanan gagal | Tampilkan kegagalan; transaksi tidak ditandai sukses |
| AI gagal/lambat/tidak tersedia | Lanjut jalur manual |
| Email gagal | Laporan tetap tersimpan |
| Koneksi/kuota bermasalah saat presentasi | Gunakan data demo aman yang sudah disiapkan |
| Data anggaran belum diverifikasi | Tampilkan keterangan, bukan angka |

---

## 9. Manajemen Rahasia dan Deployment

- Environment variable server-side di Vercel/Supabase; tidak ada rahasia di repository.
- Sediakan `.env.example` tanpa nilai asli.
- Dependensi dikunci dengan lockfile; versi harus saling kompatibel.
- Review konfigurasi deployment sebelum demo: variabel lingkungan, bucket Storage, RLS aktif, endpoint Admin terlindungi.
- Jangan mencatat (log) data pribadi, token, atau secret.

---

## 10. Checklist Pra-Demo

- [ ] RLS aktif pada semua tabel terakses klien.
- [ ] Service role key tidak ada di bundle/repo (cari di build dan riwayat git).
- [ ] Pengunjung dan Warga ditolak dari `/admin` dan API Admin.
- [ ] Role tidak dapat diubah dari browser.
- [ ] `reporter_id` tidak muncul di respons publik.
- [ ] Koordinat di dalam, luar, dan tepi polygon lulus uji.
- [ ] Rate limiting aktif pada laporan dan AI.
- [ ] EXIF dihapus; peringatan privasi foto tampil.
- [ ] Kebijakan akses foto (publik/privat) sudah disetujui.
- [ ] Label "data demo" dan "SLA simulasi" tampil.
- [ ] Setiap angka anggaran punya sumber, halaman, dan jenis nilai.
- [ ] Skenario gagal (kamera, lokasi, unggah, AI, email) menghasilkan pesan jelas, bukan sukses palsu.
- [ ] Data demo cadangan siap.

---

## 11. Kriteria Penerimaan (Keamanan)

1. Pengujian RLS lulus untuk Pengunjung, Warga, dan Admin.
2. Operasi administratif ditolak server bagi non-Admin, termasuk lewat request langsung.
3. Input tidak valid (data kosong, koordinat di luar wilayah, jumlah foto > 3, tipe file salah) ditolak dengan pesan jelas.
4. Rate limiting terbukti bekerja pada pengiriman laporan dan pemanggilan AI.
5. Tidak ada secret di bundle klien atau repository.
6. Foto yang diunggah bebas EXIF yang tidak diperlukan; akses Storage sesuai kebijakan.
7. Seluruh skenario kegagalan pada bagian 8 menghasilkan perilaku yang ditetapkan.
8. Pelaporan manual tetap berjalan saat AI nonaktif atau gagal.
9. Semua angka anggaran yang tampil cocok dengan dokumen sumber, halaman, jenis nilai, dan versi.
10. Seluruh data simulasi tertandai demo.

---

## 12. Di Luar Scope (Keamanan)

- Sertifikasi keamanan produksi, audit penetrasi formal, atau kepatuhan regulasi resmi.
- Pelacakan lokasi berkelanjutan.
- Blur otomatis foto sebagai fitur wajib (hanya dipertimbangkan setelah diuji).
- Pelaporan offline dengan sinkronisasi (belum dirancang; P2).
- Integrasi ke sistem pemerintah (SP4N-LAPOR, SIPD).

---

## 13. Keputusan Terbuka yang Mempengaruhi Keamanan

| Keputusan | Dampak |
|---|---|
| Kebijakan akses foto (publik/privat) | Menentukan konfigurasi bucket dan RLS Storage |
| Kebijakan retensi dan penghapusan data | Wajib sebelum dipakai dengan laporan nyata |
| Sumber polygon Kabupaten Pati | Dasar validasi lokasi |
| Provider AI foto | Privasi, biaya, retensi, penggunaan data |
| Angka batas rate limiting | Perlu diuji agar tidak menghalangi pengguna sah |
| Penyedia email | Konfigurasi domain dan kebijakan pengiriman |
