# DEVELOPMENT.md — Noto PATI

> **Dokumen:** Panduan pengembangan lokal dan konvensi implementasi  
> **Versi acuan:** PRD Noto PATI v1.0, revisi 23 Oktober 2026  
> **Status:** Panduan awal untuk prototipe lomba  
> **Bahasa aplikasi dan dokumentasi proyek:** Bahasa Indonesia

Dokumen ini melengkapi PRD Noto PATI v1.0 (misalnya `Noto_PATI_PRD_v1.md`; sesuaikan nama berkas jika tim menggunakan nama `PRD.md`). PRD mendefinisikan kebutuhan produk, sedangkan dokumen ini menjelaskan cara menyiapkan lingkungan pengembangan dan menjaga implementasi tetap konsisten. Jika petunjuk implementasi bertentangan dengan kebutuhan, aturan status, keamanan, atau privasi dalam PRD, kebutuhan PRD harus diutamakan dan perbedaannya dicatat.

---

## 1. Stack target

### 1.1 Stack utama

| Lapisan | Pilihan | Aturan penggunaan |
|---|---|---|
| Runtime JavaScript | **Node.js 24 LTS** | Gunakan major version yang sama di lingkungan lokal dan CI. Node.js 22 LTS dapat digunakan jika diperlukan kompatibilitas, tetapi tim harus menyepakati satu versi. Hindari versi `Current` untuk lingkungan utama tim. |
| Package manager | **npm** | `package-lock.json` wajib disimpan di Git. Gunakan `npm ci` saat menyiapkan instalasi dari repository. |
| Framework | **Next.js App Router + TypeScript** | Satu aplikasi untuk halaman publik, form warga, dashboard Admin, dan backend logic. Gunakan Server Components secara default. |
| Styling | **Tailwind CSS** | Pendekatan mobile-first dan token desain yang konsisten. Ikuti konfigurasi yang dihasilkan oleh versi stabil yang dipasang; jangan mencampur petunjuk Tailwind v3 dan v4. |
| UI components | **shadcn/ui** | Gunakan untuk komponen dasar yang dapat disesuaikan. Komponen hasil generator tetap menjadi kode proyek dan harus melalui code review. |
| Form dan validasi | **React Hook Form + Zod** | Validasi klien membantu pengalaman pengguna; validasi server tetap menjadi acuan final. |
| Peta | **Leaflet + React-Leaflet + OpenStreetMap tiles** | Komponen peta menggunakan client-side rendering. Jangan menganggap koordinat yang dikirim browser valid sebelum diperiksa server. Patuhi kebijakan penggunaan tile provider. |
| Backend/data API | **Supabase Client + Next.js Server Actions/Route Handlers** | Gunakan server logic untuk tindakan sensitif, integrasi eksternal, serta validasi business rules. |
| Database | **Supabase PostgreSQL** | Schema dikelola dengan migrasi SQL yang ditinjau dan disimpan di Git. |
| Geospasial | **PostGIS** | Untuk validasi titik terhadap polygon Kabupaten Pati dan pencarian laporan berdasarkan radius. Data batas administratif harus berasal dari sumber yang diverifikasi. |
| Auth | **Supabase Auth + `@supabase/ssr`** | Sesi berbasis cookie untuk integrasi server-side. Provider email/Google dikonfigurasi melalui Supabase. |
| File storage | **Supabase Storage** | Foto disimpan sebagai file; PostgreSQL menyimpan path dan metadata, bukan data gambar dalam bentuk base64. Kebijakan akses ditetapkan sebelum foto digunakan. |
| Pengujian unit | **Vitest** | Uji validasi, aturan status, perhitungan SLA, dan fungsi business logic. |
| Pengujian end-to-end | **Playwright** | Uji alur pengguna, otorisasi, pelaporan, peta, dan dashboard Admin. |
| Version control | **Git + GitHub** | Perubahan dibuat pada branch terpisah dan ditinjau sebelum digabungkan. |
| Deployment | **Vercel + Supabase** | Kredensial lokal dan konfigurasi deployment dipisahkan. Jangan menyimpan secret di repository. |

### 1.2 Integrasi opsional

Integrasi ini **bukan prasyarat untuk menjalankan alur inti MVP**. Tambahkan hanya ketika kebutuhan dan keputusan PRD telah dikunci.

- **Roboflow atau penyedia vision model lain:** untuk usulan kategori atau ringkasan visual foto setelah kualitas model, privasi, biaya, dan kebijakan data dievaluasi. Roboflow adalah kandidat, bukan keputusan final untuk semua jenis analisis.
- **Penyedia email:** untuk notifikasi P1 setelah provider dipilih dan dikonfigurasi.
- **Recharts:** hanya jika dashboard atau halaman anggaran memerlukan grafik.
- **Supabase CLI dan Docker:** untuk menjalankan Supabase secara lokal serta menerapkan migrasi yang dapat direproduksi. Jika tim memakai project Supabase development terkelola, Docker tidak wajib untuk setup dasar.
- **Prisma:** tidak diperlukan untuk MVP. Query Supabase Client dan migrasi SQL menjadi pendekatan awal; jangan menambahkan ORM tanpa kebutuhan yang jelas.

### 1.3 Aturan dependensi

1. Pilih rilis stabil yang kompatibel pada saat proyek disiapkan, lalu commit `package-lock.json`.
2. Jangan memperbarui dependensi utama secara massal di tengah pengerjaan fitur. Update dilakukan terpisah, disertai pengujian build dan test.
3. Hindari menambah package untuk fungsi kecil yang bisa diselesaikan dengan API platform atau utilitas yang sudah ada.
4. Untuk versi API dan instruksi instalasi yang dapat berubah, gunakan dokumentasi resmi pada bagian referensi.

---

## 2. Struktur repository yang disarankan

Struktur awal berikut menggunakan `src/` dan pemisahan berdasarkan fitur. Direktori dapat berkembang, tetapi tanggung jawabnya perlu dijaga.

```text
noto-pati/
├─ public/
│  ├─ images/
│  ├─ icons/
│  └─ demo/                       # aset demo yang aman dan memiliki sumber/lisensi
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  │  ├─ page.tsx              # landing page
│  │  │  ├─ peta/page.tsx
│  │  │  ├─ laporan/[id]/page.tsx # detail laporan publik
│  │  │  └─ anggaran/page.tsx
│  │  ├─ (auth)/
│  │  │  ├─ masuk/page.tsx
│  │  │  ├─ daftar/page.tsx
│  │  │  └─ auth/callback/route.ts
│  │  ├─ (warga)/
│  │  │  ├─ laporan/baru/page.tsx
│  │  │  └─ akun/laporan/page.tsx
│  │  ├─ admin/
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ laporan/[id]/page.tsx
│  │  ├─ api/
│  │  │  └─ health/route.ts        # endpoint health sederhana jika diperlukan
│  │  ├─ globals.css
│  │  └─ layout.tsx
│  ├─ components/
│  │  ├─ ui/                       # komponen shadcn/ui
│  │  ├─ layout/                   # header, footer, navigasi
│  │  └─ shared/                   # komponen presentasi lintas fitur
│  ├─ features/
│  │  ├─ auth/
│  │  │  ├─ components/
│  │  │  ├─ schemas/
│  │  │  └─ server/
│  │  ├─ reports/
│  │  │  ├─ components/
│  │  │  ├─ schemas/
│  │  │  ├─ actions.ts             # mutasi dari UI jika menggunakan Server Actions
│  │  │  ├─ constants.ts           # status dan aturan statis laporan
│  │  │  ├─ server/                # use case/service khusus server
│  │  │  └─ types.ts
│  │  ├─ map/
│  │  │  ├─ components/            # komponen Leaflet client-side
│  │  │  └─ types.ts
│  │  ├─ budget/
│  │  │  ├─ components/
│  │  │  ├─ schemas/
│  │  │  └─ types.ts
│  │  └─ admin/
│  │     ├─ components/
│  │     └─ server/
│  ├─ lib/
│  │  ├─ supabase/
│  │  │  ├─ client.ts              # browser client
│  │  │  ├─ server.ts              # server/cookie client
│  │  │  └─ admin.ts               # hanya jika benar-benar diperlukan; server-only
│  │  ├─ env.ts                    # pembacaan/validasi environment
│  │  ├─ errors/                   # tipe dan utilitas error aplikasi
│  │  ├─ geo/                      # helper non-rahasia; query spasial tepercaya tetap di server/DB
│  │  └─ utils.ts
│  ├─ schemas/                     # schema validasi yang benar-benar lintas fitur
│  ├─ types/
│  │  └─ database.types.ts         # tipe hasil generate dari schema Supabase
│  └─ config/
│     ├─ report-categories.ts
│     └─ app.ts
├─ supabase/
│  ├─ migrations/                  # perubahan schema, policy, function, dan indeks SQL
│  ├─ seed.sql                     # hanya data development/demo yang aman
│  └─ config.toml                  # konfigurasi Supabase CLI jika digunakan
├─ scripts/
│  ├─ import-budget-csv.ts         # alat impor terkontrol, jika dibutuhkan
│  └─ validate-budget-data.ts      # pemeriksaan data anggaran sebelum ditinjau Admin
├─ data/
│  └─ reference/                   # data batas wilayah/sumber publik dengan asal dan lisensi terdokumentasi
├─ tests/
│  ├─ unit/
│  ├─ integration/
│  └─ e2e/
├─ .env.example
├─ .gitignore
├─ DEVELOPMENT.md
├─ PRD.md
├─ package.json
├─ package-lock.json
├─ tsconfig.json
└─ README.md
```

### Aturan struktur

- `src/app/` menangani routing, metadata, komposisi halaman, dan batas layout. Simpan business logic yang kompleks di `src/features/` atau `src/lib/`, bukan menumpuk di `page.tsx`.
- `src/features/<fitur>/` menyimpan komponen, schema, tipe, dan service terkait fitur agar kode mudah ditelusuri.
- `src/components/ui/` hanya untuk komponen UI umum yang dihasilkan atau disesuaikan dari shadcn/ui; komponen spesifik laporan diletakkan di fitur laporan.
- `src/lib/supabase/client.ts` hanya untuk pemakaian browser. `src/lib/supabase/server.ts` dipakai di Server Components, Server Actions, dan Route Handlers.
- File `admin.ts` tidak wajib dibuat. Bila diperlukan untuk operasi dengan secret key, pastikan hanya dapat diimpor di server dan setiap operasi tetap dilindungi otorisasi yang eksplisit.
- Semua perubahan schema database dibuat sebagai migration SQL di `supabase/migrations/`. Jangan hanya mengubah schema lewat Dashboard tanpa menangkap perubahan tersebut ke migrasi.
- `scripts/` berisi alat pemeliharaan data yang dapat dijalankan secara terpisah, bukan logic request web. Scraping APBD otomatis dan OCR tidak masuk pekerjaan MVP.
- Jangan menaruh foto pengguna, kredensial, dump database, atau data pribadi nyata di `public/`, `data/`, maupun repository.

---

## 3. Prasyarat lokal

### Wajib

1. **Node.js 24 LTS** dan npm yang menyertainya. Pastikan versi Node sesuai major version yang disepakati tim.
2. **Git** untuk clone repository dan mengelola branch.
3. Editor yang mendukung TypeScript, misalnya Visual Studio Code.
4. Browser modern untuk menguji antarmuka, izin kamera, dan geolokasi.
5. Project **Supabase development** dengan akses ke URL proyek dan publishable key.
6. Koneksi internet untuk mengakses paket npm, Supabase, dan tile peta.

Verifikasi versi dari terminal:

```bash
node --version
npm --version
git --version
```

### Wajib sebelum fitur terkait dikembangkan

- Sumber polygon/multipolygon batas Kabupaten Pati yang dapat dipertanggungjawabkan dan telah diverifikasi.
- Konfigurasi Supabase Auth untuk email dan, jika diaktifkan, Google OAuth.
- Storage bucket dan kebijakan akses foto yang telah disetujui tim.
- Data APBD subset MVP yang sudah diverifikasi, beserta nama dokumen, versi, halaman/bagian, jenis angka, dan sumber.

### Opsional

- **Docker Desktop atau runtime Docker-compatible** bila menjalankan seluruh Supabase secara lokal.
- Akun dan kredensial penyedia vision model setelah integrasi AI disetujui untuk P1.
- API key penyedia email setelah notifikasi email diimplementasikan.
- Browser tambahan untuk pengujian lintas-browser.

Jangan menganggap layanan eksternal, batas kuota, kredensial AI, data batas wilayah, atau data anggaran sudah tersedia hanya karena disebut di PRD. Periksa semua prasyarat tersebut sebelum mulai mengimplementasikan fiturnya.

---

## 4. Setup awal

Petunjuk berikut mengasumsikan repository sudah memiliki `package.json` dan `package-lock.json`. Jika proyek belum dibuat, inisialisasikan Next.js dengan App Router, TypeScript, `src/`, ESLint, Tailwind CSS, dan alias impor `@/*`, lalu commit hasil scaffold sebelum tim mulai bekerja.

### 4.1 Ambil repository dan instal dependensi

```bash
git clone <URL_REPOSITORY>
cd noto-pati
npm ci
```

Jika `package-lock.json` belum tersedia pada tahap scaffold awal, jalankan `npm install` sekali untuk membuat lockfile. Setelah lockfile masuk repository, gunakan `npm ci` agar instalasi antaranggota tim konsisten.

Jika dependensi inti belum tercantum di `package.json`, pasang sekali dan commit perubahan `package.json` serta lockfile:

```bash
npm install @supabase/supabase-js @supabase/ssr react-hook-form zod @hookform/resolvers leaflet react-leaflet
npm install -D vitest @playwright/test
```

Jika tim memilih memakai Supabase CLI untuk migrasi atau development lokal, tambahkan CLI sebagai dev dependency:

```bash
npm install -D supabase
```

Inisialisasikan shadcn/ui pada project yang telah disiapkan dengan Tailwind CSS:

```bash
npx shadcn@latest init
```

Periksa prompt dan perubahan konfigurasi yang dihasilkan, lalu commit setelah dipastikan sesuai dengan project. Jangan mengulang instalasi hanya karena perintah di atas tercantum di dokumen; periksa terlebih dahulu `package.json`.

### 4.2 Siapkan environment lokal

Di Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Di macOS/Linux:

```bash
cp .env.example .env.local
```

Isi nilai yang diperlukan pada `.env.local`. File ini tidak boleh di-commit.

### 4.3 Siapkan Supabase

1. Buat project Supabase **khusus development** atau gunakan project dev bersama yang aksesnya dibatasi.
2. Salin Project URL dan publishable key dari dashboard Supabase ke `.env.local`.
3. Aktifkan ekstensi PostGIS sesuai dokumentasi Supabase dan pastikan lokasi ekstensi/schema yang digunakan konsisten dengan migrasi.
4. Siapkan migration SQL untuk tabel, foreign key, constraint, indeks, fungsi spasial, serta RLS. RLS wajib diterapkan pada tabel yang dapat diakses melalui Supabase client.
5. Buat Storage bucket sesuai rancangan tim. Default awal yang disarankan adalah bucket privat; foto hanya ditampilkan dengan mekanisme akses yang tepat, misalnya signed URL atau endpoint berotorisasi.
6. Konfigurasikan URL situs dan redirect URL autentikasi lokal, termasuk callback yang benar-benar dibuat aplikasi. Jika Google OAuth diaktifkan, konfigurasikan provider dan redirect di dashboard Supabase.
7. Jangan memberi Warga kemampuan untuk mengubah role akun sendiri. Pembuatan atau promosi akun Admin harus melalui prosedur administratif yang dikendalikan tim.

### 4.4 Migrasi database

**Workflow yang disarankan:** simpan perubahan schema sebagai migration SQL dan tinjau sebelum diterapkan.

Jika Supabase CLI belum dikonfigurasi dalam repository:

```bash
npm install --save-dev supabase
npx supabase init
```

Jangan jalankan `supabase init` lagi jika folder `supabase/` dan `config.toml` sudah tersedia. Perubahan struktur folder yang dihasilkan CLI harus ditinjau dan di-commit.

Untuk development lokal menggunakan Supabase CLI, Docker diperlukan:

```bash
npx supabase start
npx supabase migration new initial_schema
# Edit file SQL yang dibuat di supabase/migrations/
npx supabase db reset
```

`db reset` mereset database lokal dan menjalankan ulang migrasi serta seed yang dikonfigurasi. Gunakan hanya pada lingkungan lokal yang datanya boleh dihapus.

Untuk project Supabase development terkelola, workflow umum adalah:

```bash
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
npx supabase migration new nama_perubahan
# Edit dan review migration SQL terlebih dahulu
npx supabase db push
```

`db push` menerapkan migrasi yang belum diterapkan ke project yang terhubung. Pastikan project-ref menunjuk ke **development**, tinjau perubahan, dan jangan jalankan perintah ini terhadap project produksi atau demo bersama tanpa persetujuan dan backup yang sesuai. Jangan mengubah schema remote secara manual tanpa membawa perubahan tersebut kembali ke riwayat migrasi.

### 4.5 Konfigurasikan UI dan fitur peta

- Inisialisasikan shadcn/ui pada project yang sudah memakai Tailwind CSS, lalu tambahkan hanya komponen yang benar-benar diperlukan.
- Impor stylesheet Leaflet dengan benar sesuai pola build yang dipakai.
- Komponen Leaflet harus berjalan di client karena membutuhkan API browser. Gunakan Client Component dan dynamic import tanpa SSR jika diperlukan oleh konfigurasi Next.js.
- Uji tampilan peta pada ponsel dan layar desktop. Pastikan penggunaan ubin OpenStreetMap mematuhi kebijakan atribusi dan penggunaan layanan.

### 4.6 Jalankan aplikasi dan pengujian

```bash
npm run dev
```

Buka <http://localhost:3000>.

Sebelum membuat pull request, jalankan script yang tersedia dalam `package.json`. Target script yang disarankan:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Untuk end-to-end test, tambahkan script `test:e2e` dan siapkan browser Playwright:

```bash
npx playwright install chromium
npm run test:e2e
```

Nama script harus didefinisikan di `package.json`; jangan menganggap command tersedia sebelum script dan tool terkait dipasang. Pengujian yang membutuhkan provider eksternal harus menggunakan mock atau lingkungan uji, bukan memanggil layanan berbayar secara tak terkendali.

---

## 5. Environment variables

Buat `.env.example` sebagai template tanpa kredensial asli. Salin menjadi `.env.local` pada mesin masing-masing.

```dotenv
# URL aplikasi lokal. Perbarui sesuai URL deployment ketika menyiapkan lingkungan tersebut.
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase project development
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Opsional: hanya jika implementasi server benar-benar membutuhkan operasi istimewa.
# Secret key dapat melewati RLS. Jangan gunakan untuk operasi rutin yang dapat memakai sesi pengguna dan RLS.
# SUPABASE_SECRET_KEY=

# Opsional untuk P1: isi hanya setelah provider AI dan bentuk endpoint final dipilih.
# ROBOFLOW_API_KEY=
# ROBOFLOW_MODEL_ENDPOINT=

# Opsional untuk P1: provider notifikasi email belum ditentukan dalam PRD.
# EMAIL_API_KEY=
# EMAIL_FROM_ADDRESS=

# Opsional untuk pengujian end-to-end bila base URL perlu dioverride.
# PLAYWRIGHT_BASE_URL=http://localhost:3000
```

### 5.1 Aturan environment variables

- Nama yang diawali `NEXT_PUBLIC_` dianggap dapat tersedia pada bundle browser. Hanya masukkan nilai yang memang aman untuk dipublikasikan, seperti Supabase URL dan publishable key.
- `SUPABASE_SECRET_KEY`, kredensial AI, kredensial email, database password, dan token deployment harus tetap di server atau tool pengelolaan secret. Jangan pernah menamainya dengan prefix `NEXT_PUBLIC_`.
- Publishable key bukan pengganti keamanan database. Akses tetap harus dilindungi oleh RLS, constraint database, dan pemeriksaan otorisasi server.
- Jangan menyimpan `.env.local`, token, file kredensial, atau output konfigurasi rahasia di Git. Pastikan pola `.env*` sudah tercakup dalam `.gitignore`, sambil tetap mempertahankan `.env.example`.
- Jangan menempelkan nilai secret ke issue, screenshot, log, commit, atau pesan debug. Jika secret terlanjur terekspos, rotasi melalui dashboard penyedia.
- OAuth Google dikonfigurasi melalui dashboard Supabase dan Google Cloud sesuai kebutuhan. Jangan membuat nama environment variable OAuth yang tidak digunakan oleh aplikasi.
- Environment staging/demo/production harus menggunakan URL, key, bucket, dan data yang sesuai lingkungannya. Jangan arahkan mesin lokal ke project produksi secara default.
- Validasi variable wajib saat aplikasi/server dimulai atau saat integrasi digunakan, lalu tampilkan error konfigurasi yang aman tanpa mencetak secret.

### 5.2 Variabel wajib dan opsional

| Variabel | Kewajiban | Digunakan untuk |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Wajib untuk callback/URL absolut jika digunakan oleh implementasi | URL dasar aplikasi lokal atau deployment |
| `NEXT_PUBLIC_SUPABASE_URL` | Wajib | Endpoint project Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Wajib | Akses client yang dibatasi kebijakan RLS |
| `SUPABASE_SECRET_KEY` | Opsional dan dihindari jika tidak perlu | Operasi istimewa terbatas yang harus dijalankan di server |
| `ROBOFLOW_API_KEY` | Opsional, P1 | Autentikasi ke layanan inferensi yang dipilih |
| `ROBOFLOW_MODEL_ENDPOINT` | Opsional, P1 | Endpoint/model yang benar-benar disepakati setelah integrasi diuji |
| `EMAIL_API_KEY` | Opsional, P1 | Provider email yang dipilih kemudian |
| `EMAIL_FROM_ADDRESS` | Opsional, P1 | Alamat pengirim yang telah diverifikasi provider |
| `PLAYWRIGHT_BASE_URL` | Opsional | Base URL ketika menjalankan E2E di lingkungan khusus |

Jika implementasi memilih nama variabel yang berbeda, perbarui tabel dan `.env.example` dalam pull request yang sama. Jangan mempertahankan variabel yang tidak digunakan.

---

## 6. Konvensi implementasi

### TypeScript dan penamaan

1. Gunakan TypeScript dengan `strict: true`. Hindari `any`; bila tipe eksternal memang tidak diketahui, gunakan `unknown` lalu lakukan narrowing/validasi.
2. Gunakan tipe database yang dihasilkan dari schema Supabase, dan perbarui file generated ketika migrasi yang relevan berubah. Jangan mempertahankan tipe database buatan tangan yang sudah tidak sesuai dengan schema.
3. Gunakan `PascalCase` untuk nama komponen dan tipe/interface, `camelCase` untuk fungsi/variabel, dan `UPPER_SNAKE_CASE` untuk konstanta global yang benar-benar konstan.
4. Gunakan nama file komponen seperti `ReportCard.tsx`, hook seperti `useReportFilters.ts`, schema seperti `report.schema.ts`, dan test seperti `report-status.test.ts`. Ikuti pola yang sama dalam satu fitur.
5. Nama kolom database menggunakan `snake_case`; properti TypeScript menggunakan `camelCase`. Konversi antarformat harus eksplisit jika tidak ditangani oleh library.
6. Pertahankan istilah domain PRD secara konsisten: `Diterima`, `Diverifikasi`, `Diproses`, `Selesai`, `Dibuka Kembali`, `Ditolak`, dan `Digabung`. Gunakan konstanta/tipe bersama agar status tidak ditulis berulang dengan string bebas.
7. Slug kategori tetap konsisten dan stabil, misalnya `road_damage`, `drainage`, `street_lighting`, `sidewalk`, dan `other_infrastructure`. Label bahasa Indonesia boleh berubah dengan hati-hati; slug tidak menjadi teks UI.
8. Validasi data eksternal atau input pengguna dengan Zod pada batas masuk. TypeScript tidak menggantikan validasi runtime.
9. Pilih nama yang mendeskripsikan tujuan. Hindari file `helpers.ts` atau `utils.ts` yang menjadi tempat menampung berbagai fungsi domain yang tidak berhubungan.
10. Hindari `use client` di tingkat layout/aplikasi tanpa alasan. Gunakan Client Component hanya untuk interaksi browser seperti kamera, geolokasi, kontrol map, dan state form yang memang membutuhkannya.

### Batas tanggung jawab

#### UI dan Client Components

- Mengumpulkan input, menampilkan status proses, meminta izin kamera/geolokasi, mengompresi foto bila sesuai, dan memberikan validasi awal untuk pengalaman pengguna.
- Tidak menentukan keputusan akhir tentang role, status laporan, batas wilayah, SLA, atau izin mengakses record.
- Tidak menyimpan secret atau menjalankan operasi administratif hanya karena tombol disembunyikan dari pengguna.
- Peta menampilkan data dari layanan aplikasi; perhitungan browser tidak menggantikan validasi spasial di server/database.

#### Next.js server

- Memvalidasi input ulang menggunakan schema yang sama atau schema server yang sesuai.
- Memverifikasi sesi, identitas, dan otorisasi sebelum operasi yang memerlukan akun atau role Admin.
- Menjalankan business rules seperti transisi status, alasan penolakan/penggabungan, perhitungan tenggat, dan validasi koordinat.
- Menjadi satu-satunya tempat untuk memakai secret penyedia eksternal. Utamakan client Supabase berbasis sesi pengguna dan RLS untuk akses rutin.
- Gunakan Server Actions untuk mutasi yang berasal dari UI internal. Gunakan Route Handlers untuk endpoint yang memang dibutuhkan klien eksternal, callback, webhook, atau API yang sengaja diekspos. Keduanya tetap wajib memeriksa autentikasi/otorisasi.
- Hindari menaruh seluruh logika dalam file `page.tsx`, Route Handler, atau satu Server Action yang terlalu besar. Pisahkan use case/service agar mudah diuji.

#### Database dan Storage

- PostgreSQL adalah sumber kebenaran untuk record laporan, status, riwayat, SLA, dukungan, dan metadata foto.
- Terapkan foreign key, unique/check constraint, indeks, dan RLS sesuai kebutuhan akses. RLS menjadi lapisan pertahanan tambahan, bukan alasan untuk menghilangkan otorisasi server pada operasi sensitif.
- Perubahan status harus menjaga konsistensi antara record laporan dan riwayat. Gunakan transaksi, function/RPC, atau mekanisme database yang sesuai agar status tidak berubah tanpa log audit.
- Gunakan PostGIS untuk validasi titik terhadap polygon Kabupaten Pati dan pencarian radius. Urutan koordinat saat membentuk titik adalah longitude lalu latitude. Jangan mengganti polygon resmi dengan bounding box kasar.
- Storage menampung file foto. Simpan `storage_path` dan metadata relevan dalam tabel; jangan simpan binary gambar/base64 di kolom laporan.
- Gunakan bucket privat sebagai default sampai aturan akses foto diputuskan. Foto bukti yang ditampilkan ke publik harus mengikuti kebijakan privasi dan akses; jangan menyematkan secret URL atau menganggap URL publik otomatis aman.
- EXIF yang tidak diperlukan dihapus sebelum unggah/pemrosesan eksternal. Penghapusan EXIF tidak menghapus wajah, pelat nomor, atau informasi sensitif yang terlihat dalam gambar.

#### Integrasi eksternal

- AI hanya memberikan rekomendasi klasifikasi/ringkasan visual. AI tidak mengubah status, menolak laporan, menggabungkan laporan, atau menentukan lokasi secara otomatis.
- Hasil model harus divalidasi terhadap schema respons dan ditangani sebagai data tidak tepercaya. Pertahankan jalur manual saat provider tidak tersedia.
- Perhitungan nominal anggaran dilakukan dari nilai terstruktur menggunakan kode/database. AI boleh membantu menjelaskan data yang telah diverifikasi, tetapi tidak boleh menjadi sumber nilai angka.
- Scraping APBD otomatis, OCR, embedding lanjutan, dan analisis urgensi berada di luar alur inti MVP. Jangan menambahkannya ke request path utama tanpa perubahan ruang lingkup yang disetujui.
- Kegagalan notifikasi email tidak boleh membatalkan laporan yang sudah berhasil disimpan.

### Error handling

1. **Validasi di batas masuk.** Validasi form di klien untuk UX, kemudian validasi ulang pada server. Jangan percaya tipe TypeScript saja untuk data request.
2. **Gunakan error yang dapat ditindaklanjuti.** Pisahkan error validasi, belum login, tidak berwenang, konflik aturan bisnis, layanan eksternal, dan error internal. Beri pesan yang dapat dipahami pengguna dalam Bahasa Indonesia.
3. **Jangan bocorkan detail internal.** Stack trace, SQL error mentah, token, secret, signed URL sensitif, serta respons mentah provider tidak boleh dikirim ke UI. Detail teknis boleh dicatat secara aman pada server.
4. **Konsistenkan hasil Server Action.** Gunakan bentuk hasil terstruktur seperti `success`, `data`, atau `error`/`fieldErrors`, agar UI tidak perlu menebak format error. Bentuk final dapat dipilih tim, tetapi harus seragam antarfitur.
5. **Jangan menelan error.** Hindari `catch {}` kosong atau menampilkan sukses setelah operasi gagal. Tangani error yang diperkirakan secara eksplisit; teruskan error tak terduga ke penanganan error umum setelah dicatat dengan aman.
6. **Jaga integritas operasi.** Jika unggah foto gagal atau transaksi pembuatan laporan tidak lengkap, jangan tampilkan laporan sebagai terkirim. Tentukan pembersihan file orphan jika file terunggah tetapi record gagal dibuat.
7. **Jangan mengandalkan pesan error untuk keamanan.** Semua operasi tetap memeriksa hak akses, termasuk ketika route atau tombol tidak ditampilkan di UI.
8. **Kegagalan layanan eksternal.** Timeout atau kegagalan AI menghasilkan status fallback tanpa menghambat input manual. Kegagalan email dicatat dan dapat dicoba ulang sesuai kebijakan, tanpa menggagalkan laporan inti.
9. **Log yang aman.** Log server boleh mencatat ID request, kode error, waktu, dan konteks minimum. Jangan log seluruh deskripsi sensitif, koordinat presisi, foto, cookie, token, atau secret tanpa kebutuhan yang sah.
10. **Pesan UI harus jelas.** Tampilkan langkah berikutnya saat kamera/lokasi ditolak, koneksi hilang, unggahan gagal, lokasi berada di luar wilayah, atau laporan berubah status karena keputusan Admin.

### Data demo

1. **Pisahkan data demo dan data nyata.** Gunakan Supabase development/demo terpisah dari produksi jika tersedia. Jangan menguji seed atau skrip reset pada database yang menyimpan data nyata.
2. **Labeli data simulasi.** Setiap laporan, akun, status, bukti tindak lanjut, SLA, dan notifikasi simulasi harus jelas ditandai sebagai data demo. Jangan memberi kesan bahwa laporan fiktif sudah ditangani Pemerintah Kabupaten Pati.
3. **Tambahkan penanda eksplisit.** Rancang kolom atau mekanisme data yang dapat membedakan demo, misalnya `is_demo` atau `data_source`, sesuai keputusan schema tim. Jangan hanya mengandalkan judul atau teks deskripsi untuk mengenali data demo.
4. **Jangan memakai identitas warga nyata.** Gunakan akun penguji buatan, alamat email khusus pengujian, foto yang dibuat untuk demo atau memiliki izin, dan lokasi uji yang tidak mengungkap alamat pribadi.
5. **Jangan gunakan data pribadi pada seed.** `supabase/seed.sql` hanya memuat kategori, konfigurasi SLA demo, data anggaran yang telah diverifikasi, dan laporan/foto demo yang aman. Seed tidak boleh memuat secret atau token.
6. **Foto demo harus aman.** Hindari wajah, pelat nomor, alamat rumah, dan informasi identifikasi lain. Jika menggunakan gambar pihak ketiga, catat sumber serta lisensinya.
7. **Jaga angka APBD.** Angka demo yang berasal dari dokumen publik tetap harus mencatat dokumen, versi, halaman/bagian, jenis angka, dan tanggal verifikasi. Jangan mencampur angka contoh buatan dengan angka resmi tanpa label.
8. **Jangan seeding data demo otomatis ke production.** Sebelum skrip seed/import dijalankan, pastikan environment dan project-ref benar. Jalankan seeding demo hanya pada lingkungan yang telah ditetapkan.
9. **Jaga tampilan publik.** Data demo diberi badge/keterangan “Data Simulasi” pada landing page, detail laporan, peta, dashboard, dan bagian lain yang berpotensi disalahartikan sebagai layanan pemerintah resmi.
10. **Reset secara terkendali.** Prosedur reset hanya berlaku untuk database lokal. Sebelum menghapus data di lingkungan bersama, dapatkan persetujuan dan buat backup yang sesuai.

---

## Referensi resmi

- Next.js — <https://nextjs.org/docs>
- Node.js releases — <https://nodejs.org/en/about/previous-releases>
- Supabase dengan Next.js — <https://supabase.com/docs/guides/getting-started/quickstarts/nextjs>
- Supabase SSR client — <https://supabase.com/docs/guides/auth/server-side/creating-a-client>
- Supabase CLI dan pengembangan lokal — <https://supabase.com/docs/guides/local-development/cli/getting-started>
- Supabase database migrations — <https://supabase.com/docs/guides/deployment/database-migrations>
- Tailwind CSS dengan Next.js — <https://tailwindcss.com/docs/installation/framework-guides/nextjs>
- shadcn/ui untuk Next.js — <https://ui.shadcn.com/docs/installation/next>
- Leaflet — <https://leafletjs.com/reference.html>
- React-Leaflet — <https://react-leaflet.js.org/>
- React Hook Form — <https://react-hook-form.com/>
- Zod — <https://zod.dev/>
- Vitest — <https://vitest.dev/guide/>
- Playwright — <https://playwright.dev/docs/intro>
- MDN Geolocation API — <https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API>
- MDN `getUserMedia()` — <https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia>

---

**Prinsip perubahan:** setiap perubahan stack, struktur folder, environment variables, schema database, atau aturan implementasi yang berdampak pada tim harus disertai perubahan dokumentasi terkait. Jangan memperkenalkan teknologi baru hanya untuk mengakomodasi satu fitur sebelum kebutuhan, manfaat, biaya, privasi, dan konsekuensinya ditinjau.
