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
| `category` | `report_category` | Kategori infrastruktur (enum: `jalan`, `lampu`, `drainase`, `jembatan`, `trotoar`) |
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

## 2. Lima Kategori Materi Edukasi Awal

Setiap kategori telah dibekali minimal satu materi kurasi mendalam yang relevan dengan konteks wilayah Kabupaten Pati:

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
     - Memuat ilustrasi SVG tematik per kategori (`RoadIllustration`, `DrainageIllustration`, dll.).
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
- **Larangan Khusus**: Warga dilarang keras memanjat pilar jembatan, membuka panel gardu listrik PJU, atau masuk ke gorong-gorong tertutup.
- **Prioritas Utama**: Menjauhi zona bahaya, memasang penanda visual aman dari jarak jauh, dan melaporkan koordinat presisi via Noto PATI.

---

## 5. Pengujian & Verifikasi

Fitur telah diuji melalui automated unit tests di `src/features/care/care.test.ts`:
- Validasi keberadaan 5 kategori utama.
- Validasi field wajib setiap artikel edukasi (causes, impacts, safety actions, prevention, references).
- Pengujian mekanisme fallback jika koneksi database mengalami gangguan.
- Pengujian query slug dan rekomendasi kategori laporan.

Menjalankan pengujian:
```bash
npx tsc --noEmit
npm run lint
npm test
```

