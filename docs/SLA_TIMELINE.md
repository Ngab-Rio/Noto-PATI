# SLA Timeline — Dokumentasi Teknis

> SLA pada Noto PATI merupakan **simulasi untuk kebutuhan demonstrasi prototipe**, bukan standar pelayanan resmi Pemerintah Kabupaten Pati.

---

## 1. Mekanisme Status History

Setiap perubahan status laporan dicatat ke tabel `report_status_history` secara atomik melalui stored procedure `admin_transition_report` di Supabase.

### Kolom `report_status_history`

| Kolom             | Tipe          | Keterangan                                             |
|-------------------|---------------|--------------------------------------------------------|
| `id`              | `uuid`        | PK                                                     |
| `report_id`       | `uuid`        | FK ke `reports.id`                                     |
| `status`          | `report_status` | Status baru setelah transisi                         |
| `changed_by`      | `uuid \| null` | UUID admin yang melakukan transisi (null = sistem)   |
| `note`            | `text \| null` | Catatan publik (alasan verifikasi/penolakan dll.)    |
| `proof_image_url` | `text \| null` | Path ke foto bukti penyelesaian (hanya status selesai) |
| `created_at`      | `timestamptz` | Waktu server saat transisi terjadi                    |

### Jaminan Atomisitas

Stored procedure `admin_transition_report` menggunakan `SELECT … FOR UPDATE` pada baris laporan sebelum melakukan transisi. Ini mencegah dua admin mengubah status laporan yang sama secara bersamaan (race condition).

```sql
-- Contoh bagian kritis dalam stored procedure
SELECT id, status, ... FROM reports WHERE id = p_report_id FOR UPDATE;
```

Versi final `admin_transition_report` (migration `20261104160000`) membatasi transisi secara eksplisit:

```
diterima     → diverifikasi | ditolak
diverifikasi → diproses
diproses     → selesai
```

Status `digabung` hanya dapat ditulis oleh sistem merge (`detect_and_merge_duplicate_report`), bukan oleh Admin. Tabel `report_status_transitions` tetap tersedia sebagai referensi transisi publik, tetapi guard utama berada di dalam stored procedure.

---

## 2. Konfigurasi SLA

Konfigurasi SLA disimpan di tabel `sla_policies`:

```sql
SELECT * FROM sla_policies WHERE is_active = true ORDER BY created_at DESC LIMIT 1;
```

### Nilai Awal (Prototipe Demo)

| Parameter            | Nilai   | Keterangan                              |
|----------------------|---------|-----------------------------------------|
| `verification_hours` | 24      | Tenggat verifikasi sejak laporan masuk  |
| `handling_days`      | 7       | Tenggat penyelesaian sejak diverifikasi |

### Rumus Kalkulasi

```
verification_due_at = created_at + INTERVAL '24 hours'
handling_due_at     = verified_at + INTERVAL '7 days'
```

Kedua kolom ini disimpan langsung di tabel `reports` agar efisien dan snapshot-safe — perubahan konfigurasi SLA di masa depan tidak akan mengubah tenggat laporan lama.

---

## 3. Aturan SLA per Status

| Status        | SLA Aktif                     | Keterangan                                            |
|---------------|-------------------------------|-------------------------------------------------------|
| `diterima`    | Verifikasi (`verification_due_at`) | Dihitung dari `created_at`                       |
| `diverifikasi`| Penyelesaian (`handling_due_at`)   | Dihitung dari `verified_at`                      |
| `diproses`    | Penyelesaian (`handling_due_at`)   | Menggunakan tenggat yang sama, tidak di-reset    |
| `selesai`     | Tidak aktif — tampilkan hasil | Bandingkan waktu history `selesai` dengan `handling_due_at`; jika salah satu tidak ada/tidak valid → `not_applicable` |
| `ditolak`     | Tidak berlaku (`not_applicable`)   | Tidak ada SLA penyelesaian                       |
| `digabung`    | Tidak berlaku (`not_applicable`)   | Ikuti SLA laporan utama (parent report)          |

---

## 4. Kondisi SLA (`SlaState`)

| State               | Deskripsi                                               |
|---------------------|---------------------------------------------------------|
| `in_target`         | Dalam tenggat, laporan belum selesai                   |
| `overdue`           | Telah melewati tenggat, laporan belum selesai          |
| `completed_on_time` | Diselesaikan sebelum atau tepat tenggat                |
| `completed_late`    | Diselesaikan setelah melewati tenggat                  |
| `not_applicable`    | SLA tidak berlaku (ditolak/digabung/data tidak lengkap atau timestamp tidak valid) |

---

## 5. Domain Logic — `src/domain/sla.ts`

### `calculateSlaStage(status, dueAt, now, completedAt?)`

Kalkulasi SLA untuk satu tahap (verifikasi atau penyelesaian). Menerima parameter eksplisit agar dapat diuji secara deterministik tanpa mock global `Date`.

```ts
import { calculateSlaStage } from "@/domain/sla";

const stage = calculateSlaStage(
  "diterima",          // status laporan
  "2026-01-11T12:00Z", // dueAt (verification_due_at)
  "2026-01-10T12:00Z", // now (waktu server)
);
// → { kind: "verification", state: "in_target", remainingMs: 86_400_000, dueAt: "..." }
```

### `calculateReportSla(input, now)`

Abstraksi tingkat tinggi yang memilih `dueAt` yang tepat berdasarkan status laporan dan mendelegasikan ke `calculateSlaStage`.

```ts
import { calculateReportSla } from "@/domain/sla";

const sla = calculateReportSla({
  status: "diverifikasi",
  verificationDueAt: "2026-01-10T07:00Z",
  handlingDueAt: "2026-01-17T12:00Z",
  completedAt: null,
}, now);
```

### `formatRemainingTime(remainingMs)`

Memformat milidetik menjadi label bahasa Indonesia yang dapat dibaca.

| Input (ms)   | Output        |
|--------------|---------------|
| `86_400_000` | `1 hari`      |
| `90_000_000` | `1 hari 1 jam`|
| `3_900_000`  | `1 jam 5 mnt` |
| `-86_400_000`| `1 hari`      |
| `null`       | `Belum tersedia` |

### `formatDueDate(dueAt)`

Memformat ISO timestamp tenggat ke format lokal Indonesia (`Asia/Jakarta`).

---

## 6. Penanganan Laporan Duplikat / Digabung

Laporan dengan status `digabung` selalu mengembalikan `state: "not_applicable"`. Ini by design — SLA laporan duplikat **tidak dihitung secara independen**; transparansi dan SLA dipusatkan ke laporan utama (`merged_into_report_id`).

Di halaman publik, laporan yang digabung menampilkan:
- Banner notifikasi bahwa laporan telah digabung
- Tombol link langsung ke laporan utama (dengan SLA aktif)

---

## 7. Akses Publik dan Admin

### RLS & Column Grants

| Kolom                  | Akses Publik (anon) | Akses Admin |
|------------------------|---------------------|-------------|
| `verification_due_at`  | SELECT              | SELECT      |
| `handling_due_at`      | SELECT              | SELECT      |
| `verified_at`          | SELECT              | SELECT      |
| `report_status_history.note` | SELECT       | SELECT      |
| `report_status_history.changed_by` | Tidak diekspos ke publik | SELECT |

Kolom `changed_by` (identitas admin) **tidak pernah ditampilkan** di halaman publik. Migration `20261106100000` mencabut grant SELECT tingkat tabel dan menggantinya dengan grant kolom eksplisit, sehingga `changed_by` tidak dapat dibaca melalui REST API publik. Halaman detail laporan hanya mengambil `id, status, note, created_at, proof_image_url` dari `report_status_history`; `id` dipakai sebagai key render, bukan identitas pelapor/admin.

`note` pada `report_status_history` adalah **catatan publik** (mis. alasan penolakan yang memang untuk pelapor). Catatan internal admin disimpan terpisah di `admin_activity_logs`, yang hanya dapat dibaca admin. Dengan demikian tidak ada catatan internal yang ikut tampil di linimasa publik.

Foto laporan diambil melalui service role di server untuk membuat signed URL; service role tidak pernah dikirim ke browser.

---

## 8. Migration & Testing

### Migration yang Relevan

| File                                          | Keterangan                                     |
|-----------------------------------------------|------------------------------------------------|
| `20261104150000_add_report_sla_and_transitions.sql` | Tabel `sla_policies`, kolom SLA di `reports`, trigger, stored procedure `admin_transition_report` |
| `20261104153000_guard_missing_sla_policy.sql` | Guard jika tidak ada SLA policy aktif          |
| `20261104154000_fix_admin_transition_ambiguous_columns.sql` | Fix kolom ambigu di stored procedure |
| `20261104160000_restrict_admin_report_transitions.sql` | Validasi transisi status yang diizinkan, wajib bukti penyelesaian, larangan merge via Admin |
| `20261104161000_private_completion_evidence.sql` | Bucket bukti penyelesaian menjadi privat |
| `20261104162000_publish_completion_evidence.sql` | Grant SELECT `proof_image_url` untuk halaman publik |
| `20261106100000_protect_public_history_and_backfill_sla.sql` | Cabut grant tabel `report_status_history` (lindungi `changed_by`); backfill `verified_at` dan `handling_due_at` dari history nyata untuk laporan lama |

### Backfill laporan lama

Migration `20261106100000` mengisi `verified_at` dari entri history `diverifikasi` pertama dan menghitung `handling_due_at` dari `verified_at + handling_days` hanya bila kolom tersebut masih kosong. Tidak ada timestamp buatan: backfill memakai waktu history yang benar-benar tercatat. Setelah terisi, nilai tersebut menjadi snapshot dan tidak berubah saat `sla_policies` diubah.

### Menjalankan Test SLA

```bash
# Jalankan seluruh test
npm test

# Jalankan hanya test SLA
npx vitest run src/domain/sla.test.ts
```

Test di `src/domain/sla.test.ts` mencakup:
- Semua kondisi SLA (in_target, overdue, completed_on_time, completed_late)
- Laporan terminal (ditolak, digabung)
- Data timestamp tidak lengkap (null) dan timestamp tidak valid
- Edge case: selesai tepat pada tenggat
- Semua path `calculateReportSla` per status

### Verifikasi database (manual)

Pengujian unit di atas hanya mencakup logika domain TypeScript. Perilaku database (trigger, RPC, RLS, snapshot) harus diverifikasi pada Supabase lokal/remote dengan checklist berikut:

- `verification_due_at = created_at + 24 jam`
- `handling_due_at = verified_at + 7 hari`
- `diproses` tidak mengubah `handling_due_at`
- `admin_transition_report` mencatat history secara atomik
- Transisi tidak valid, penolakan tanpa alasan, dan merge via Admin ditolak
- `anon` dapat membaca history/SLA, tetapi tidak dapat insert/update, tidak dapat membaca `changed_by`, dan tidak dapat memanggil RPC
- Perubahan `sla_policies` tidak mengubah tenggat snapshot laporan lama

**Catatan:** migration belum dijalankan ke Supabase remote pada environment ini. Jalankan `supabase db push` (atau `supabase migration up` untuk lokal) sebelum mengandalkan fitur ini di deployment.

---

## 9. Keterbatasan dan Disclaimer

> **SLA ini adalah simulasi.** Angka-angka verifikasi (24 jam) dan penyelesaian (7 hari) ditetapkan untuk kebutuhan demonstrasi prototipe Noto PATI dan tidak mencerminkan standar atau komitmen pelayanan resmi Pemerintah Kabupaten Pati maupun dinas teknis terkait.

Keterbatasan lain:
- **Tidak ada eskalasi** — sistem tidak mengirimkan notifikasi saat SLA terlampaui.
- **Tidak ada integrasi OPD** — sistem tidak terhubung ke sistem internal dinas.
- **Waktu server** — seluruh kalkulasi menggunakan `timestamptz` server Supabase; pastikan timezone server dikonfigurasi dengan benar.

