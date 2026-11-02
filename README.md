# Noto PATI

> **Pelaporan Infrastruktur & Transparansi Anggaran Kabupaten Pati**  

Noto PATI ("Noto" dalam bahasa Jawa berarti *menata*) adalah web pelaporan infrastruktur warga Kabupaten Pati (jalan rusak, drainase tersumbat, lampu PJU mati, jembatan rusak) yang menghubungkan laporan fisik dengan transparansi data belanja infrastruktur pada APBD Kabupaten Pati T.A. 2025.

Project ini merupakan prototipe civic-tech independen, bukan kanal aduan resmi Pemerintah
Kabupaten Pati. Fokus utamanya adalah membuat laporan warga lebih mudah ditelusuri,
menampilkan status secara transparan, dan membantu warga memahami konteks anggaran
infrastruktur.


![Ilustrasi peta Kabupaten Pati](./public/images/illustrations/map_pati.svg)

Asset peta ini digunakan sebagai gambaran visual wilayah Pati. Validasi lokasi laporan
dilakukan di server menggunakan polygon PostGIS yang di-seed melalui data
[`pati.geojson`](./pati.geojson), bukan berdasarkan gambar peta atau bounding box.

### Alur utama aplikasi

1. Pengunjung dapat melihat landing page, daftar laporan, detail laporan, peta, dan anggaran.
2. Pengunjung dapat membuat laporan anonim; warga yang login memperoleh riwayat laporan.
3. Form laporan mengambil foto kamera, lokasi perangkat, kategori, judul, dan deskripsi.
4. Server memvalidasi data dan lokasi, lalu menyimpan laporan ke Supabase.
5. Foto disimpan di bucket privat dan ditampilkan melalui signed URL.
6. Analisis foto AI bersifat opsional; pengguna tetap dapat mengisi form secara manual.

> **Catatan data:** sebagian data laporan, tindak lanjut, dan angka anggaran pada prototipe
> masih bersifat simulasi dan diberi label di antarmuka.



---

## Tech Stack Utama

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
* **Library:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (preset Nova) + [Lucide Icons](https://lucide.dev/)
* **Form & Validasi:** [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
* **Peta & Visualisasi:** [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) + GeoJSON & [Recharts](https://recharts.org/)
* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL + PostGIS) + `@supabase/ssr`
* **Testing:** [Vitest](https://vitest.dev/) (Unit/Domain) + [Playwright](https://playwright.dev/) (E2E) + [ESLint](https://eslint.org/)

---

## Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terpasang:

* **Node.js:** Versi **24 LTS** (direkomendasikan) atau minimal **22 LTS**.
* **Package Manager:** `npm` (disertakan bersama instalasi Node.js).
* **Git:** Versi terbaru.

Verifikasi versi di terminal:
```bash
node -v   # v24.x.x atau v22.x.x
npm -v    # v10.x.x ke atas
git --version
```

---

## Panduan Memulai Cepat (Getting Started)

Ikuti langkah-langkah berikut untuk menjalankan proyek di lingkungan lokal:

### 1. Clone Repository
```bash
git clone https://github.com/Ngab-Rio/Noto-PATI.git
cd Noto-PATI
```

### 2. Install Dependensi
Gunakan `npm install` atau `npm ci` untuk memastikan dependensi terpasang sesuai `package-lock.json`:
```bash
npm ci
```

Gunakan `npm install` hanya jika Anda perlu memperbarui dependency atau `package-lock.json`
belum tersedia.

### 3. Konfigurasi Environment Variables
Salin berkas template environment:
```bash
cp .env.example .env.local
```
Buka file `.env.local` dan isi kredensial proyek Supabase Anda.

Di PowerShell Windows, perintah yang setara adalah:
```powershell
Copy-Item .env.example .env.local
```

Minimal isi variabel berikut agar aplikasi dapat berjalan:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

`SUPABASE_SERVICE_ROLE_KEY` diperlukan untuk upload foto, signed URL, seed region,
dan operasi server tertentu. Jangan pernah mengcommit `.env.local`, service role key,
atau API key provider.

### 4. Terapkan Database Supabase

Pastikan Supabase CLI sudah terpasang dan project development sudah terhubung. Terapkan
migrasi yang ada di [`supabase/migrations/`](./supabase/migrations/):

```bash
supabase link --project-ref your-project-ref
supabase db push
```

Jika menggunakan Supabase lokal:

```bash
supabase start
supabase db reset
```

### 5. Seed Polygon Kabupaten Pati

Setelah environment Supabase dan migrasi tersedia, seed region Pati:

```bash
npm run seed:region
```

Script ini memakai [`pati.geojson`](./pati.geojson) dan RPC server-side untuk menyimpan
polygon validasi lokasi. Untuk menonaktifkan validasi region sementara di environment
development:

```bash
npm run disable:region
```

Jangan menonaktifkan validasi wilayah pada deployment yang menerima laporan nyata.

### 6. Jalankan Development Server
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

Halaman penting setelah server berjalan:

| URL | Keterangan |
|---|---|
| `/` | Landing page |
| `/report/new` | Form laporan anonim/authenticated |
| `/map` | Peta laporan publik |
| `/reports` | Daftar laporan publik |
| `/budget` | Halaman transparansi anggaran |
| `/login` | Login warga |
| `/admin` | Area admin yang masih dalam pengembangan |

---

## Konfigurasi Environment Variables

Aplikasi divalidasi saat startup oleh `src/config/env.client.ts` dan `src/config/env.server.ts`. Jika variabel wajib belum diisi, sistem akan menampilkan pesan diagnostik yang jelas.

| Variabel | Lingkup | Wajib? | Keterangan | Contoh |
|---|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Client & Server | Ya | URL basis aplikasi (untuk callback OAuth & metadata) | `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Client & Server | Ya | Endpoint API project Supabase | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client & Server | Ya | Publishable / Anon API key Supabase | `sb_publishable_...` |
| `NEXT_PUBLIC_ENABLE_MOCK_LOCATION` | Client | Opsional | Aktifkan simulasi titik koordinat Pati untuk pengujian | `true` atau `false` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server Only** | Opsional | Kunci admin untuk skrip operasional data (Rahasia) | `eyJhbGci...` |
| `CRON_SECRET` | **Server Only** | Opsional | Token otorisasi endpoint cron internal | `secret-token` |
| `AI_VISION_BASE_URL` | **Server Only** | Opsional | Base URL OpenAI-compatible vision API (tanpa /chat/completions) | `https://api.openai.com/v1` |
| `AI_VISION_API_KEY` | **Server Only** | Opsional | API key untuk vision provider (Rahasia) | `sk-...` atau `gsk_...` |
| `AI_VISION_MODEL` | **Server Only** | Opsional | Model name untuk vision analysis | `gpt-4-vision-preview` |
| `AI_ANALYSIS_ALLOWED_ORIGINS` | **Server Only** | ⚠️ **TEMPORARY** | **Dev-only:** Origins tambahan untuk tunnel testing (akan dihapus di production) | `https://tunnel.example` |

>  **Catatan Penting:**  
> - **`AI_ANALYSIS_ALLOWED_ORIGINS`** adalah variable **SEMENTARA** hanya untuk development dengan tunnel (ngrok, VS Code dev tunnels).  
> - Variable ini **HARUS DIHAPUS** saat deploy ke production.  
> - Production hanya akan menggunakan `NEXT_PUBLIC_APP_URL` sebagai allowed origin.  
> - Lihat `docs/AI_PHOTO_ANALYSIS.md` untuk detail lengkap.

---

## Perintah yang Tersedia (NPM Scripts)

| Perintah | Deskripsi |
|---|---|
| `npm run dev` | Menjalankan development server lokal dengan Turbopack (`http://localhost:3000`) |
| `npm run build` | Membuat bundle production yang teroptimasi |
| `npm run start` | Menjalankan server aplikasi production hasil build |
| `npm run lint` | Memeriksa kepatuhan kode menggunakan ESLint |
| `npm run typecheck` | Memeriksa validitas tipe data TypeScript (`tsc --noEmit`) |
| `npm run test` | Menjalankan seluruh pengujian unit/domain via Vitest |
| `npm run test:watch` | Menjalankan Vitest dalam mode interaktif (watch mode) |
| `npm run test:e2e` | Menjalankan pengujian end-to-end browser dengan Playwright |
| `npm run seed:region` | Memasukkan polygon Kabupaten Pati ke database |
| `npm run disable:region` | Menonaktifkan/menghapus region Pati dari database development |

---

## Progress Project

### Sudah tersedia

- Landing page mobile-first dengan hero visual isometrik Kabupaten Pati.
- Registrasi/login email dan Google melalui Supabase Auth.
- Pelaporan anonim maupun authenticated.
- Pengambilan foto kamera maksimal 3 file dan kompresi client-side.
- Pengambilan lokasi perangkat dan reverse geocoding opsional.
- Validasi lokasi server-side dengan PostGIS `ST_Covers`.
- Penyimpanan foto privat dan signed URL.
- Daftar, detail, dan peta laporan publik.
- Clustering marker melalui MapLibre.
- Analisis foto AI opsional dengan rate limit, timeout, dan fallback manual.
- Test Vitest untuk konfigurasi theme dan kontrak AI.

### Sedang dikembangkan atau belum tersedia

- Dashboard admin untuk verifikasi, penolakan, penggabungan, dan perubahan status laporan.
- Transisi status lengkap beserta SLA dan eskalasi.
- Dukungan laporan, rating, dan pengajuan buka kembali.

Status di atas menggambarkan kondisi kode saat ini; detail scope dan kriteria penerimaan
tersedia di [`docs/PRODUCT_SCOPE.md`](./docs/PRODUCT_SCOPE.md).


## Dokumentasi Terkait

Untuk pemahaman mendalam tentang standar dan alur kerja teknis, silakan baca:
* [**`docs/TESTING.md`**](./docs/TESTING.md) — Panduan pengujian, alur quality gate, dan cheatsheet testing.
* [**`ARCHITECTURE.md`**](./ARCHITECTURE.md) — Rincian arsitektur 4 lapisan, batasan server/client, dan aturan database.
* [**`DEVELOPMENT.md`**](./DEVELOPMENT.md) — Konvensi pengembangan lokal, standar kode, dan error handling.
* [**`PRD.md`**](./PRD.md) — Product Requirement Document (kebutuhan produk dan kriteria penerimaan).
* [**`docs/PRODUCT_SCOPE.md`**](./docs/PRODUCT_SCOPE.md) — Batasan ruang lingkup fitur MVP vs P2.
* [**`docs/SECURITY.md`**](./docs/SECURITY.md) — Kebijakan keamanan, pengelolaan rahasia, dan kepatuhan privasi (UU PDP).
* [**`docs/ASSET_MANAGEMENT.md`**](./docs/ASSET_MANAGEMENT.md) — Struktur dan penggunaan asset visual.

---

##  Kontribusi

Silakan tinjau [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md) untuk konvensi penamaan branch, tata cara membuat Pull Request, dan standar commit.
