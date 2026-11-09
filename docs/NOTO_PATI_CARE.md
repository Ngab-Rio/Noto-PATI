# Noto PATI Care — Edukasi & Literasi Fasilitas Publik

**Noto PATI Care** adalah fitur edukasi infrastruktur yang menyediakan materi informatif, panduan mengenali gejala kerusakan fisik, pemahaman faktor penyebab, dampak sosial-lingkungan, serta langkah pengamanan dini yang aman bagi masyarakat Kabupaten Pati.

Fitur ini memperluas peran Noto PATI: tidak hanya sebagai platform pelaporan kerusakan, melainkan sarana edukasi dan pemberdayaan literasi warga kota.

---

## 1. Arsitektur & Struktur Data

Materi edukasi disimpan pada tabel `care_articles` di Supabase dengan kebijakan RLS yang ketat (hanya materi dengan status `is_published = true` yang dapat diakses publik).

### Skema Tabel `care_articles`

| Kolom | Tipe Data | Deskripsi |
|---|---|---|
| `id` | `uuid` (PK) | Identifier unik artikel |
| `slug` | `text` (Unique) | URL slug artikel (contoh: `jalan-berlubang-dan-amblas`) |
| `category` | `report_category` | Kategori laporan (`jalan`, `lampu`, `drainase`, `jembatan`, `tanggul`, `trotoar`, `rambu`, `lainnya`) |
| `title` | `text` | Judul materi edukasi |
| `summary` | `text` | Ringkasan materi untuk kartu dan meta deskripsi SEO |
| `content` | `text` | Pembahasan mendalam mengenai kondisi kerusakan |
| `causes` | `text[]` | Daftar penyebab umum kerusakan |
| `impacts` | `text[]` | Dampak terhadap masyarakat, mobilitas, dan lingkungan |
| `safety_actions` | `text[]` | Tindakan aman warga dan batasan pencegahan bahaya |
| `prevention_steps` | `text[]` | Langkah gotong royong dan pemeliharaan lingkungan |
| `references` | `jsonb` | Daftar dokumen rujukan teknis, SNI, dan pedoman kementerian |
| `reviewed_at` | `timestamptz` | Tanggal peninjauan/kurasi materi |
| `is_published` | `boolean` | Status publikasi artikel (default `true`) |
| `read_time_minutes` | `integer` | Estimasi waktu baca dalam menit |

### Keamanan & Row Level Security (RLS)
- Publik (`anon` dan `authenticated`) hanya memiliki hak `SELECT` untuk baris dengan `is_published = true`.
- Draft materi yang belum dipublikasikan tidak akan bocor ke publik.
- Dilengkapi fallback data statis (`mock-data.ts`) jika terjadi gangguan koneksi database, sehingga fungsi pelaporan tidak pernah terganggu (*graceful degradation*).

---

## 2. Cakupan Kategori Materi Edukasi

Setiap kategori laporan memiliki materi edukasi yang relevan dengan konteks wilayah Kabupaten Pati:

1. **Jalan & Aspal (`jalan`)**
   - *Topik:* Mengenal Jalan Berlubang, Penurunan Badan Jalan, dan Tindakan Pengamanan Dini.
   - *Instansi Pengampu:* Bina Marga - DPUTR Kabupaten Pati.
   - *Fokus:* Bahaya lubang tertutup genangan air, larangan menambal jalan dengan batu runcing/bambu, dan tata cara penandaan visual darurat.

2. **Drainase & Saluran Air (`drainase`)**
   - *Topik:* Pencegahan Genangan Air: Memahami Masalah Saluran Drainase dan Sedimentasi.
   - *Instansi Pengampu:* Dinas SDA - DPUTR Kabupaten Pati.
   - *Fokus:* Peringatan bahaya gas beracun di gorong-gorong tertutup, pentingnya bak kontrol portabel, dan pembersihan sampah parit.

3. **Penerangan Jalan Umum (`lampu`)**
   - *Topik:* Penerangan Jalan Umum (PJU) Mati & Prosedur Keamanan Bahaya Kelistrikan.
   - *Instansi Pengampu:* Dinas Perhubungan Kabupaten Pati & PLN UP3 Pati.
   - *Fokus:* Larangan keras memegang tiang lampu PJU yang rusak saat hujan, bahaya arus induksi, dan pelaporan label ID tiang.

4. **Trotoar & Pedestrian (`trotoar`)**
   - *Topik:* Memahami Hak Pejalan Kaki: Kerusakan Trotoar dan Ubin Pemandu (Guiding Block).
   - *Instansi Pengampu:* Bina Marga - DPUTR Kabupaten Pati.
   - *Fokus:* Aksesibilitas pejalan kaki difabel tunanetra, larangan parkir/okupasi di atas guiding block kuning, serta penandaan manhole amblas.

5. **Jembatan & Penyeberangan (`jembatan`)**
   - *Topik:* Mendeteksi Kerusakan Jembatan: Retak Struktur, Oprit Amblas, dan Gerusan Air.
   - *Instansi Pengampu:* Bina Marga - DPUTR & Balai Besar Pelaksanaan Jalan Nasional.
   - *Fokus:* Deteksi dini gerusan pilar (scouring) aliran Sungai Juwana, getaran abnormal, dan pembatasan tonase darurat.

6. **Tanggul & Pengendali Banjir (`tanggul`)**
   - *Topik:* Mengenali Retakan dan Rembesan pada Tanggul Sungai.
   - *Instansi Pengampu:* Dinas SDA - DPUTR.
   - *Fokus:* Mengenali perubahan yang terlihat, menjauhi area berisiko, dan melaporkan kondisi dari lokasi aman.

7. **Rambu & Marka Jalan (`rambu`)**
   - *Topik:* Rambu Hilang, Rusak, atau Marka Jalan Memudar.
   - *Instansi Pengampu:* Dinas Perhubungan Kabupaten Pati.
   - *Fokus:* Tidak memindahkan atau memperbaiki rambu sendiri, dan mengirimkan lokasi serta kondisi kepada petugas.

8. **Fasilitas Publik Lainnya (`lainnya`)**
   - *Topik:* Panduan Umum Menghadapi Kerusakan Fasilitas Publik.
   - *Instansi Pengampu:* Dinas pengelola fasilitas terkait.
   - *Fokus:* Menjauhi bagian berbahaya, tidak memperbaiki atau menghadapi siapa pun, serta melaporkan jenis fasilitas, lokasi, dan kondisi yang terlihat dengan aman.
   - *Termasuk:* Vandalisme dan bentuk kerusakan fasilitas lain yang belum memiliki kategori khusus. Kartu edukasi setelah laporan selalu menampilkan panduan umum ini; materi vandalisme khusus tetap tersedia terpisah di katalog.

Materi baru tersedia sebagai fallback aplikasi dan melalui migrasi `20261109220000_expand_care_education_coverage.sql`. Jalankan migrasi sebelum berharap artikel baru muncul dari database yang sudah berisi artikel lama.

---

## 3. Integrasi & Edukasi Kontekstual

1. **Pusat Edukasi Publik (`/care`)**
   - Direktori lengkap materi dengan filter kategori instan, live search, waktu baca, dan tanggal kurasi.
   - Dilengkapi banner pedoman keselamatan utama masyarakat.

2. **Halaman Detail Materi (`/care/[slug]`)**
   - Tata letak terstruktur: Pengenalan Gejala, Penyebab, Dampak, Tindakan Aman, Langkah Pencegahan, dan Rujukan Dokumen Teknis.
   - Metadata SEO OpenGraph dinamis untuk kemudahan berbagi ke media sosial/warga.
   - Tombol Call-to-Action untuk langsung melaporkan jika warga menemukan kerusakan serupa.

3. **Halaman Konfirmasi Keberhasilan & Visual-First Education (`/report/success`)**
   - Setelah laporan berhasil dikirim dari `/report/new`, warga diarahkan ke `/report/success?reportId=...&ticket=...&category=...`.
   - **Konfirmasi Langsung Tampil**: Status pengiriman sukses dan nomor tiket ditampilkan seketika di bagian atas (non-blocking).
   - **Kartu Edukasi Visual (`VisualEducationCard`)**:
     - Memuat ilustrasi SVG atau ikon tematik untuk seluruh kategori laporan.
     - Judul padat (< 6 kata) dan ringkasan ringkas (maks. 2 kalimat).
     - Kolom **Tindakan Aman** (maks. 3 item ikon + teks singkat) dan **Pencegahan** (maks. 3 item).
     - Tombol aksi jelas: *"Pelajari Selengkapnya"* (ke artikel lengkap) dan *"Lihat Detail Laporan"*.
     - Dilindungi `Suspense` dan `VisualEducationCardSkeleton` untuk mencegah layout shift.
     - Event telemetry tracking sederhana tanpa PII (`card_viewed`, `click_learn_more`, `click_view_report`).

4. **Rekomendasi di Halaman Detail Laporan (`/reports/[id]`)**
   - Komponen `<CareRelatedSection />` menampilkan rekomendasi materi edukasi yang sesuai dengan kategori laporan yang sedang dilihat.

---

## 4. Prinsip Keselamatan Warga (Safety Notice)

Noto PATI Care secara tegas menerapkan panduan keselamatan:
- **Bukan Instruksi Pekerjaan Teknis**: Materi ditujukan untuk literasi dan langkah pengamanan awal, bukan panduan perbaikan fisik mandiri yang berisiko.
- **Larangan Khusus**: Warga tidak menyentuh kabel terbuka atau bagian tajam, tidak masuk ke gorong-gorong tertutup, tidak mendekati tanggul yang retak/tergerus, dan tidak memanjat struktur jembatan.
- **Vandalisme**: Jangan menghadapi terduga pelaku atau membersihkan bahan yang tidak dikenal; laporkan kondisi fasilitas dari lokasi aman.
- **Prioritas Utama**: Menjauhi zona bahaya, memasang penanda visual aman dari jarak jauh, dan melaporkan koordinat presisi via Noto PATI.

---

## 5. Pengujian & Verifikasi

Fitur telah diuji melalui automated unit tests di `src/features/care/care.test.ts`:
- Validasi cakupan seluruh 8 kategori laporan, termasuk materi vandalisme.
- Validasi bahwa kartu edukasi kontekstual menautkan ke artikel yang tersedia.
- Validasi field wajib setiap artikel edukasi (causes, impacts, safety actions, prevention, references).
- Pengujian mekanisme fallback jika koneksi database mengalami gangguan.
- Pengujian query slug dan rekomendasi kategori laporan.

Menjalankan pengujian:
```bash
npx tsc --noEmit
npm run lint
npm test
```
