# Authentication & Authorization — Noto PATI

> **Sumber:** Noto_PATI_PRD_v1.md (bagian 4, 7, 8, 9 FR-01/FR-07/FR-08, 12, 15, 16)
> **Berpasangan dengan:** `productscope.md` dan `security.md`
> **Prinsip:** Server adalah pengambil keputusan akhir. UI hanya mencerminkan hak akses, bukan menegakkannya.

---

## 1. Ringkasan

- Autentikasi memakai **Supabase Auth** (email atau Google). Sesi dikelola oleh Supabase.
- Ada dua role terautentikasi: **`Warga`** dan **`Admin`**. Pengunjung tanpa akun bukan role.
- **OPD bukan role** pada MVP.
- Pelaporan **wajib akun**. "Anonim" hanya berarti identitas pelapor tidak tampil ke publik.
- Otorisasi berlapis: **RLS PostgreSQL** + **pemeriksaan otorisasi di server Next.js**.

---

## 2. Peran dan Hak Akses

| Aksi | Pengunjung | Warga | Admin |
|---|:-:|:-:|:-:|
| Lihat peta, daftar/detail laporan publik, linimasa | ✅ | ✅ | ✅ |
| Lihat halaman Anggaran | ✅ | ✅ | ✅ |
| Buat laporan | ❌ | ✅ | ❌* |
| Lihat laporan milik sendiri (termasuk yang belum publik) | ❌ | ✅ | ✅ (semua) |
| Lihat identitas pelapor | ❌ | ❌ (kecuali dirinya sendiri) | ✅ |
| Dukung laporan orang lain (P1) | ❌ | ✅ (1x per laporan) | ❌ |
| Beri rating setelah `Selesai` (P1) | ❌ | ✅ (hanya pelapor) | ❌ |
| Ajukan buka kembali (P1) | ❌ | ✅ (hanya pelapor) | ❌ |
| Verifikasi / tolak / gabung laporan | ❌ | ❌ | ✅ |
| Ubah status sesuai transisi | ❌ | ❌ | ✅ |
| Unggah bukti tindak lanjut | ❌ | ❌ | ✅ |
| Setujui/tolak permintaan buka kembali | ❌ | ❌ | ✅ |
| Publikasi / kelola data anggaran | ❌ | ❌ | ✅ |
| Akses log audit internal | ❌ | ❌ | ✅ |
| Akses dashboard Admin | ❌ | ❌ | ✅ |

\* PRD tidak mengizinkan Admin membuat laporan secara eksplisit. Jika tim ingin mengizinkannya, catat sebagai perubahan scope di `productscope.md`.

---

## 3. Alur Autentikasi

### 3.1 Registrasi dan login Warga
1. Warga memilih **email** atau **Google** melalui Supabase Auth.
2. Setelah akun terbentuk, dibuat baris `profiles` (`id` = ID Supabase Auth, `display_name`, `role = 'warga'`, `created_at`).
3. Role default **selalu `warga`**, ditetapkan oleh server atau trigger database, bukan dari input klien.
4. Sesi disimpan lewat mekanisme Supabase (cookie/session) dan diperbarui sesuai dokumentasi Supabase SSR untuk Next.js App Router.

### 3.2 Penetapan role Admin
- Role `Admin` **hanya** dapat ditetapkan melalui proses administratif yang aman (misalnya SQL terkontrol oleh pemilik proyek atau fungsi server dengan service role).
- **Dilarang:** memilih role saat pendaftaran, mengubah role dari browser, mengirim `role` di body request yang dipercaya server.
- Perubahan role dicatat (siapa, kapan, dari-ke) di log audit.

### 3.3 Akses halaman terlindungi
- Rute `/admin/*` diperiksa di server (middleware dan di tiap Server Action/Route Handler). Pengguna tanpa sesi diarahkan ke login; pengguna ber-role `warga` mendapat penolakan (403), bukan sekadar disembunyikan.
- Rute pembuatan laporan membutuhkan sesi valid.
- Halaman publik (peta, detail laporan, Anggaran) tidak membutuhkan sesi.

---

## 4. Aturan Otorisasi

### 4.1 Pemeriksaan di server (wajib)
Setiap operasi berikut **harus** memverifikasi sesi dan role di server, tidak boleh bergantung pada UI:
- Membuat laporan (sesi valid + validasi data + validasi polygon).
- Verifikasi, penolakan, penggabungan, perubahan status, unggah bukti tindak lanjut.
- Publikasi atau perubahan data anggaran.
- Keputusan buka kembali.
- Pemanggilan layanan AI dan email.

Perilaku standar: sesi tidak ada → `401`; sesi ada tetapi tidak berwenang → `403`; transisi status tidak valid → `4xx` dengan pesan jelas.

### 4.2 Transisi status (ditegakkan server)
- `Diterima` → `Diverifikasi` | `Ditolak` | `Digabung`
- `Diverifikasi` → `Diproses`
- `Diproses` → `Selesai`
- `Selesai` → `Dibuka Kembali` (hanya setelah permintaan Warga disetujui Admin)
- `Dibuka Kembali` → `Diproses`
- `Ditolak` dan `Digabung` adalah status akhir.

Aturan tambahan:
- Penolakan **wajib** menyertakan alasan; penggabungan **wajib** menyertakan ID laporan utama.
- `Selesai` membutuhkan catatan dan bukti tindak lanjut.
- Status awal `Diterima` hanya diberikan sistem setelah seluruh validasi berhasil.
- Waktu perubahan selalu dari **server**, pelaku diambil dari sesi (bukan dari input klien).

### 4.3 Kepemilikan
- Rating, permintaan buka kembali: hanya `reporter_id` laporan tersebut.
- Dukungan: hanya laporan yang bukan milik sendiri, **unique constraint** `(user_id, report_id)` di database.
- Warga hanya dapat melihat/mengelola laporan dan aksi miliknya.

---

## 5. Row Level Security (RLS)

RLS **wajib aktif** pada semua tabel yang dapat diakses melalui Supabase client.

| Tabel | Pengunjung | Warga | Admin |
|---|---|---|---|
| `profiles` | Tidak ada akses | Baca/ubah `display_name` milik sendiri; **tidak boleh** ubah `role` | Baca semua |
| `report_categories` | Baca | Baca | Baca |
| `reports` | Baca hanya kolom/baris yang berstatus publik, **tanpa** `reporter_id` | Insert sebagai diri sendiri; baca laporan sendiri; baca publik | Baca semua; ubah status lewat jalur yang diizinkan |
| `report_photos` | Hanya foto yang aman ditampilkan | Foto milik sendiri | Semua, termasuk bukti tindak lanjut |
| `report_status_history` | Baca linimasa publik | Baca linimasa laporan terkait | Baca semua; **insert only** (append-only dari sisi aplikasi) |
| `report_supports` | Tidak ada akses | Insert milik sendiri (1x) | Baca |
| `report_ratings` | Tidak ada akses | Insert hanya oleh pelapor, hanya setelah `Selesai` | Baca |
| `reopen_requests` | Tidak ada akses | Insert/baca milik sendiri | Baca; isi keputusan |
| `sla_policies` | Baca (untuk label) | Baca | Kelola |
| `budget_documents`, `budget_items` | Baca hanya data terverifikasi/terpublikasi | Sama | Kelola dan publikasi |

Catatan:
- Identitas pelapor tidak boleh bocor lewat query publik. Gunakan view atau kolom terbatas untuk data publik.
- Tabel riwayat status: tidak ada policy `UPDATE`/`DELETE` untuk Warga maupun Pengunjung.
- Kebijakan RLS **diuji terpisah** untuk Pengunjung, Warga, dan Admin (lihat bagian 8).

---

## 6. Penanganan Kredensial

- **Service role key** dan **API key pihak ketiga** (AI, email) hanya ada di environment variable server. Tidak boleh masuk bundle browser, repository, atau log.
- Hanya `anon key` dan URL Supabase yang boleh terekspos ke klien.
- Operasi yang butuh hak tinggi dijalankan di Server Action/Route Handler, bukan di klien.
- Secret tidak dikomit; sediakan `.env.example` tanpa nilai nyata.

---

## 7. Kasus Khusus dan Perilaku yang Diharapkan

| Situasi | Perilaku |
|---|---|
| Pengguna belum login membuka form laporan | Diarahkan ke login, tidak ada laporan dibuat |
| Warga mengakses `/admin` | Ditolak (403) di server |
| Warga mengirim `role: 'admin'` pada request | Diabaikan/ditolak, role tidak berubah |
| Sesi kedaluwarsa saat mengirim laporan | Pesan jelas, data form dipertahankan jika memungkinkan, tidak ada sukses palsu |
| Admin mengirim transisi tidak valid (mis. `Diterima` → `Selesai`) | Ditolak server dengan pesan |
| Warga mendukung laporan miliknya sendiri atau dua kali | Ditolak server/database |
| Warga memberi rating pada laporan orang lain atau yang belum `Selesai` | Ditolak |
| Login Google gagal / dibatalkan | Tampilkan pesan, sediakan percobaan ulang atau login email |

---

## 8. Kriteria Penerimaan

1. Warga dapat mendaftar dan masuk dengan email atau Google; sesi bertahan dan dapat dikeluarkan (logout).
2. Pengguna tanpa sesi tidak dapat membuat laporan.
3. Pengguna `Warga` dan Pengunjung tidak dapat mengakses dashboard Admin maupun endpoint Admin (diuji lewat UI **dan** request langsung).
4. Pengguna tidak dapat mengubah role sendiri lewat browser, request manual, atau pemanggilan Supabase client.
5. Role `Admin` hanya dapat ditetapkan lewat proses administratif yang terdokumentasi.
6. Transisi status di luar aturan bagian 4.2 ditolak server.
7. Setiap perubahan status tercatat dengan waktu server dan identitas pelaku dari sesi.
8. Warga tidak dapat mengubah/menghapus riwayat status.
9. Respons publik tidak memuat `reporter_id` atau identitas pelapor.
10. Dukungan ganda dan dukungan pada laporan sendiri ditolak (jika P1 aktif).
11. Service role key tidak ditemukan di bundle klien maupun repository (diperiksa saat review deployment).
12. Pengujian RLS lulus untuk tiga jenis pengguna (Pengunjung, Warga, Admin).

### Strategi pengujian
- **Vitest:** fungsi transisi status dan validasi otorisasi.
- **Pengujian database:** RLS dan constraint diuji sebagai tiga identitas berbeda.
- **Playwright:** alur login, akses terlarang ke `/admin`, alur Admin end-to-end.

---

## 9. Di Luar Scope (Authentication)

- Role OPD atau role tambahan lain.
- SSO/integrasi akun pemerintah.
- Pelaporan tanpa akun (guest report).
- Manajemen role lewat UI oleh pengguna biasa.
- Multi-factor authentication khusus (dapat dipertimbangkan sebagai perubahan scope; tidak diwajibkan PRD).

## 10. Konfigurasi implementasi Noto PATI

Set environment berikut pada `.env.local` dan deployment:

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

Di Supabase Auth, aktifkan Email provider dan atur Site URL ke `NEXT_PUBLIC_APP_URL`. Tambahkan redirect URL berikut:

- `http://localhost:3000/auth/callback`
- URL callback deployment yang sesuai

Google OAuth menggunakan callback yang sama dan hanya berjalan jika provider Google telah dikonfigurasi di Supabase serta Google Cloud. Role `admin` tidak memiliki form web; tetapkan secara terkontrol pada database:

```sql
update public.user_roles
set role = 'admin'
where user_id = '<auth-user-uuid>';
```

Jalankan SQL tersebut hanya melalui akses administratif tepercaya. Publishable key boleh berada di browser karena seluruh tabel terkait dilindungi RLS; service role key tidak diperlukan oleh aplikasi web ini.
