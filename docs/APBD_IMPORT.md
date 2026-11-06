# Normalisasi dan Impor Data APBD ke Supabase

Dokumen ini menjelaskan alur dari file JSON hasil scraper DJPK
(`data/raw/apbd/apbd_*.json`) sampai tersimpan di Supabase.

## 1. Alur

```
JSON mentah
  → normalizer.ts   (seragamkan field & parse angka)
  → validation.ts   (tolak metadata/baris tidak valid)
  → importer.ts     (panggil RPC import_apbd_snapshot)
  → Supabase PostgreSQL
```

Logika normalisasi, validasi, dan penyimpanan dipisah agar tiap tahap dapat
diuji sendiri. Tidak ada data yang ditulis sebelum melewati validasi.

## 2. Struktur Data Aktual

File scraper berisi:

- `metadata`: URL sumber, waktu ambil, wilayah, tahun, bulan, hash, dan jumlah
  baris mentah.
- `rows[]`: `akun`, `anggaran`, `realisasi`, `persentase`.
- `summary`: total pendapatan, belanja, dan pembiayaan.

DJPK **tidak menyediakan kode akun atau hierarki eksplisit** pada output ini.
Karena itu:

- Kode akun dan parent tidak dibuat-buat.
- Urutan baris sumber (`row_index`, mulai dari 0) menjadi identitas stabil.
- Nama akun yang muncul lebih dari sekali (mis. `Belanja Pegawai`) tetap
  disimpan sebagai baris terpisah dan dilaporkan sebagai peringatan.
- Baris sumber asli disimpan utuh di kolom `raw_row` agar atribut baru dari
  DJPK tidak hilang.

## 3. Tabel

### `public.apbd_reports`

Satu baris = satu snapshot periode.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | `uuid` | Primary key |
| `budget_year` | `smallint` | Tahun anggaran |
| `period_month` | `smallint` | Bulan laporan 1–12 |
| `period_name` | `text` | Nama bulan |
| `provinsi_code`, `provinsi_name` | `text` | Wilayah provinsi |
| `pemda_code`, `pemda_name` | `text` | Wilayah pemda |
| `source_url`, `download_url` | `text` | Sumber data |
| `fetched_at` | `timestamptz` | Waktu pengambilan |
| `http_status` | `smallint` | Status HTTP saat scraping |
| `keterangan_portal` | `text` | Keterangan resmi portal |
| `data_hash` | `text` | SHA-256 file mentah |
| `raw_row_count` | `integer` | Jumlah baris mentah |
| `total_*` | `numeric(20,2)` | Ringkasan resmi DJPK |
| `created_at`, `updated_at` | `timestamptz` | Audit |

Constraint unik: `(budget_year, period_month, provinsi_code, pemda_code)`.

### `public.apbd_accounts`

Satu baris = satu baris akun pada snapshot.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | `bigint identity` | Primary key |
| `report_id` | `uuid` | FK ke `apbd_reports`, cascade delete |
| `row_index` | `integer` | Posisi baris sumber (identitas stabil) |
| `akun` | `text` | Nama akun |
| `anggaran` | `numeric(20,2)` | Pagu/anggaran |
| `realisasi` | `numeric(20,2)` | Realisasi |
| `persentase` | `numeric(10,2)` | Persentase dari sumber |
| `is_total_row` | `boolean` | Hanya 3 total utama |
| `raw_row` | `jsonb` | Baris sumber lengkap |

Constraint unik: `(report_id, row_index)`.

**Agregasi:** jangan menjumlahkan `apbd_accounts` karena sumber memuat baris
induk dan anak sekaligus. Gunakan total resmi di `apbd_reports`.

### RLS

- `anon` dan `authenticated`: hanya `SELECT`.
- Penulisan hanya melalui service role (server/CLI), tidak ada policy
  `INSERT`/`UPDATE`/`DELETE`.

## 4. Normalisasi dan Validasi

- Angka menerima number, string polos, `Rp 2.719.861.122.000`, `1.234.567,89`,
  dan persentase `9,14%`.
- Nilai kosong/null/tidak valid menjadi `null`, bukan `0`, agar ditolak
  validasi. Hanya `0` asli dari sumber yang disimpan sebagai nol.
- Metadata divalidasi: tahun, bulan, wilayah, URL, waktu, hash SHA-256, status
  HTTP 2xx.
- Baris divalidasi: nama akun wajib, `row_index` unik, anggaran/realisasi
  numerik dan tidak negatif, persentase numerik.
- Baris tidak valid dibuang dan dilaporkan; baris valid tetap dapat diimpor.
  Jika metadata inti tidak valid, seluruh snapshot ditolak.

## 5. Idempotensi dan Isolasi Periode

`import_apbd_snapshot(p_report, p_accounts)` menjalankan seluruh penulisan
dalam satu transaksi:

1. Upsert `apbd_reports` berdasarkan kunci tahun + bulan + wilayah.
2. Hapus baris akun snapshot tersebut yang sudah tidak ada di sumber
   (`row_index` tidak lagi dikirim).
3. Upsert `apbd_accounts` berdasarkan `(report_id, row_index)`.

Konsekuensi:

- Impor ulang file yang sama tidak membuat duplikasi.
- Impor file periode lain tidak menyentuh periode lain.
- Jumlah baris yang dihapus karena stale dilaporkan.

## 6. Menjalankan Impor

Prasyarat:

- Migration `20261105100000_create_apbd_budget_schema.sql` sudah dijalankan.
- `.env` berisi `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`.
- Service role key hanya dipakai oleh CLI/server, tidak pernah di frontend.

```bash
# Validasi tanpa menulis
npm run import:apbd -- --dry-run

# Impor semua file apbd_*.json di data/raw/apbd
npm run import:apbd

# Impor satu file
npm run import:apbd -- --file data/raw/apbd/apbd_2026_m11_pemda17.json

# Direktori lain
npm run import:apbd -- --dir path/ke/hasil/scraper
```

Output per file mencakup jumlah akun valid, akun gagal, jumlah akun tersimpan,
baris stale yang dihapus, dan `report_id`. Exit code `1` bila ada file/baris
yang gagal.

## 7. Verifikasi Setelah Impor

```sql
select budget_year, period_month, pemda_name, raw_row_count, data_hash
from public.apbd_reports
order by budget_year desc, period_month desc;

select report_id, count(*)
from public.apbd_accounts
group by report_id;
```
