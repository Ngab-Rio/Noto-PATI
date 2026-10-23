# Noto PATI

> **Pelaporan Infrastruktur & Transparansi Anggaran Kabupaten Pati**  

Noto PATI ("Noto" dalam bahasa Jawa berarti *menata*) adalah web pelaporan infrastruktur warga Kabupaten Pati (jalan rusak, drainase tersumbat, lampu PJU mati, jembatan rusak) yang menghubungkan laporan fisik dengan transparansi data belanja infrastruktur pada APBD Kabupaten Pati T.A. 2025.



---

## Tech Stack Utama

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
* **Library:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (preset Nova) + [Lucide Icons](https://lucide.dev/)
* **Form & Validasi:** [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)
* **Peta & Visualisasi:** [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/) & [Recharts](https://recharts.org/)
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
npm install
```

### 3. Konfigurasi Environment Variables
Salin berkas template environment:
```bash
cp .env.example .env.local
```
Buka file `.env.local` dan isi kredensial proyek Supabase Anda.

### 4. Jalankan Development Server
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

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

---


## Dokumentasi Terkait

Untuk pemahaman mendalam tentang standar dan alur kerja teknis, silakan baca:
* [**`docs/TESTING.md`**](./docs/TESTING.md) — Panduan pengujian, alur quality gate, dan cheatsheet testing.
* [**`ARCHITECTURE.md`**](./ARCHITECTURE.md) — Rincian arsitektur 4 lapisan, batasan server/client, dan aturan database.
* [**`DEVELOPMENT.md`**](./DEVELOPMENT.md) — Konvensi pengembangan lokal, standar kode, dan error handling.
* [**`PRD.md`**](./PRD.md) — Product Requirement Document (kebutuhan produk dan kriteria penerimaan).
* [**`docs/PRODUCT_SCOPE.md`**](./docs/PRODUCT_SCOPE.md) — Batasan ruang lingkup fitur MVP vs P2.
* [**`docs/SECURITY.md`**](./docs/SECURITY.md) — Kebijakan keamanan, pengelolaan rahasia, dan kepatuhan privasi (UU PDP).

---

## 🤝 Kontribusi

Silakan tinjau [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md) untuk konvensi penamaan branch, tata cara membuat Pull Request, dan standar commit.
