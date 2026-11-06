# Scraper Data APBD DJPK Kemenkeu

Modul dan CLI scraper untuk mengambil data resmi Anggaran Pendapatan dan Belanja Daerah (APBD) dari portal resmi Direktorat Jenderal Perimbangan Keuangan (DJPK) Kementerian Keuangan Republik Indonesia.

---

## 1. Analisis Sumber Data DJPK

Berdasarkan investigasi terhadap portal DJPK:
- **URL Tampilan Portal:**
  `https://djpk.kemenkeu.go.id/portal/data/apbd?periode={periode}&tahun={tahun}&provinsi={provinsi}&pemda={pemda}`
  - `provinsi=11`: Provinsi Jawa Tengah
  - `pemda=17`: Kabupaten Pati
  - `periode=1..12`: Bulan pelaporan (1 = Januari, 2 = Februari, dst.)
  - `tahun=YYYY`: Tahun anggaran (contoh: 2026)
- **Mekanisme Pengunduhan Resmi:**
  Portal menyediakan tombol download resmi yang mengarah ke endpoint:
  `https://djpk.kemenkeu.go.id/portal/csv_apbd?type=apbd&periode={periode}&tahun={tahun}&provinsi={provinsi}&pemda={pemda}`
- **Format File Download:**
  Meskipun URL bernama `csv_apbd`, file keluaran DJPK berformat **Microsoft XML Spreadsheet 2003** (`urn:schemas-microsoft-com:office:spreadsheet`).
  Format ini berisi tabel baris akun, anggaran, realisasi, dan persentase yang jauh lebih terstruktur dan bersih dibandingkan scraping DOM HTML yang rapuh.
- **Kesimpulan Pendekatan:**
  Tidak diperlukan headless browser berat seperti Playwright. Implementasi menggunakan `fetch` HTTP langsung ke endpoint unduhan resmi DJPK, dengan fallback parser XML Spreadsheet berbasis regex yang toleran dan parser metadata label portal.

---

## 2. Struktur Modul

Proses scraping dipisahkan secara modular di luar frontend Next.js:

```
src/features/apbd/
├── types/
│   └── index.ts               # Tipe data TypeScript (ApbdRawRow, ApbdMetadata, dll)
├── scraper/
│   ├── constants.ts           # URL endpoint DJPK, kode wilayah default Pati, nama bulan
│   ├── parser.ts              # XML Spreadsheet parser & currency number parser
│   ├── parser.test.ts         # Unit test komprehensif untuk parser
│   └── index.ts               # Core scraping engine (fetch with retry, hashing, metadata)
└── storage.ts                 # Penyimpanan file JSON ke data/raw/apbd/

scripts/
└── scrape-apbd.ts             # CLI executable script (mendukung argumen CLI)
```

---

## 3. Cara Menjalankan

### A. Melalui NPM Script (Default: Kab. Pati, Tahun 2026, Bulan 1)
```bash
npm run scrape:apbd
```

### B. Mengambil Data Bulan/Periode Tertentu
Parameter `--periode` bernilai `1` sampai `12` (menyesuaikan bulan):
```bash
# Contoh: Mengambil data bulan Februari (periode 2)
npm run scrape:apbd -- --periode 2

# Contoh: Mengambil data tahun 2025 periode 12 (Desember)
npm run scrape:apbd -- --tahun 2025 --periode 12
```

### C. Panduan Bantuan Argumen
```bash
npm run scrape:apbd -- --help
```

Daftar opsi CLI yang didukung:
- `--tahun <YYYY>`: Tahun anggaran (default: `2026`)
- `--periode <1-12>`: Bulan pelaporan (default: `1`)
- `--provinsi <kode>`: Kode provinsi DJPK (default: `11` - Jawa Tengah)
- `--pemda <kode>`: Kode pemda DJPK (default: `17` - Kab. Pati)
- `--output <dir>`: Direktori penyimpanan kustom (default: `data/raw/apbd`)

---

## 4. Format Output Ekstraksi

Hasil ekstraksi disimpan dalam format JSON terstruktur di direktori `data/raw/apbd/apbd_{tahun}_m{periode}_pemda{pemda}.json`.

Struktur data JSON:
```json
{
  "metadata": {
    "sourceUrl": "https://djpk.kemenkeu.go.id/portal/data/apbd?periode=1&tahun=2026&provinsi=11&pemda=17",
    "downloadUrl": "https://djpk.kemenkeu.go.id/portal/csv_apbd?type=apbd&periode=1&tahun=2026&provinsi=11&pemda=17",
    "fetchedAt": "2026-11-05T15:45:01.000Z",
    "httpStatus": 200,
    "keteranganPortal": "Keterangan: Data APBD Murni, realisasi APBD s.d Januari 2026, - data diterima SIKD per 04 November 2026",
    "region": {
      "provinsiCode": "11",
      "provinsiName": "Provinsi Jawa Tengah",
      "pemdaCode": "17",
      "pemdaName": "Kab. Pati"
    },
    "budgetYear": 2026,
    "periodMonth": 1,
    "periodName": "Januari",
    "dataHash": "91351fd7e7609e3cc493ff63287dc1b63f883ec76729b51795d4a2694cb98fa4",
    "rawRowCount": 29
  },
  "rows": [
    {
      "akun": "Pendapatan Daerah",
      "anggaran": 2719861122000,
      "realisasi": 248568536414,
      "persentase": 9.14
    },
    {
      "akun": "PAD",
      "anggaran": 612271706000,
      "realisasi": 47588998714,
      "persentase": 7.77
    }
  ],
  "summary": {
    "totalPendapatanAnggaran": 2719861122000,
    "totalPendapatanRealisasi": 248568536414,
    "totalBelanjaAnggaran": 2867861122000,
    "totalBelanjaRealisasi": 102520071453
  }
}
```

### D. Impor ke Supabase

Setelah file JSON tersimpan, normalisasi, validasi, dan impor ke Supabase
dijelaskan di [`docs/APBD_IMPORT.md`](./APBD_IMPORT.md):

```bash
npm run import:apbd -- --dry-run
npm run import:apbd
```

---

## 5. Pengujian & Verifikasi Mutu

- **Unit Tests:**
  11 pengujian otomatis di `src/features/apbd/scraper/parser.test.ts` memvalidasi parsing XML spreadsheet, penanganan angka mata uang IDR, perhitungan ringkasan, dan proteksi kesalahan parsing.
  ```bash
  npm test
  ```
- **Type Checking & Lint:**
  ```bash
  npx tsc --noEmit
  npm run lint
  ```
- **Live Integration:**
  Script telah diuji langsung mengambil data real dari server DJPK Kemenkeu untuk periode Januari dan Februari 2026.

