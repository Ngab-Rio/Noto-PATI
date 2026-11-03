# Setup Admin User - Noto PATI

Dokumentasi lengkap untuk membuat user admin dan mengakses dashboard administrasi.

## 📋 Status Sistem

**✅ SUDAH BERFUNGSI:**
- Authentication flow (email + Google OAuth)
- Admin guard (`requireAdmin`) - proteksi route `/admin`
- Dashboard admin UI yang lengkap
- Database schema untuk role management
- RLS policies untuk keamanan data

**⚠️ KETERBATASAN SAAT INI:**
- Dashboard admin menggunakan **mock data** (belum fetch dari database real)
- Operasi admin (verifikasi, tolak, gabung laporan) **belum terimplementasi**
- User promotion ke admin **hanya melalui SQL manual** (tidak ada UI)

---

## 🚀 Cara Membuat User Admin

### Opsi 1: Via Seed Script - Otomatis (Recommended) ✨

Script `seed_admin.sql` sekarang bisa **langsung create user admin** tanpa perlu registrasi manual!

**Langkah:**

1. **Edit konfigurasi di `supabase/seed_admin.sql`:**

   ```sql
   -- Line 18-20: Edit credentials admin
   v_admin_email TEXT := 'admin@notopati.dev';           -- Email admin
   v_admin_password TEXT := 'Admin123!SecurePassword';   -- Password (min 8 char)
   v_admin_full_name TEXT := 'Administrator Noto PATI';  -- Nama lengkap
   ```

2. **Jalankan script:**

   **Via Supabase Dashboard:**
   - Buka [Supabase Dashboard](https://supabase.com/dashboard)
   - Pilih project Noto-PATI
   - Buka menu **SQL Editor** → **New query**
   - Copy-paste isi file `supabase/seed_admin.sql`
   - Klik **Run**

   **Via CLI (Local Development):**
   ```bash
   npx supabase db query -f supabase/seed_admin.sql
   ```
   
   **Atau untuk remote/cloud:**
   ```bash
   npx supabase db query -f supabase/seed_admin.sql --linked
   ```

3. **Verifikasi hasil:**

   Script akan otomatis menampilkan output:
   ```
   🔄 Creating new admin user: admin@notopati.dev
   ✅ User created with ID: <uuid>
   ✅ Role updated to ADMIN
   
   === ADMIN USER CREATED/UPDATED ===
   email: admin@notopati.dev
   full_name: Administrator Noto PATI
   role: admin
   status: ✅ ADMIN ACCESS GRANTED
   ```

4. **Login langsung:**

   - Buka `http://localhost:3000/login`
   - Login dengan credentials yang Anda set di script
   - Akses `http://localhost:3000/admin`

**Keunggulan Opsi 1:**
- ✅ Tidak perlu registrasi manual via UI
- ✅ Email auto-confirmed (tidak perlu verifikasi)
- ✅ Password di-hash dengan bcrypt
- ✅ Idempotent: bisa dijalankan ulang (akan promote jika user sudah ada)
- ✅ Cocok untuk seed development database

---

### Opsi 2: Promote User yang Sudah Register

Jika Anda sudah punya user yang terdaftar dan ingin di-promote ke admin:

1. **Pastikan user sudah terdaftar:**
   - Via `/register` atau Google OAuth
   - Catat email user

2. **Edit dan jalankan query ini:**

   ```sql
   -- Di Supabase SQL Editor
   UPDATE public.user_roles
   SET role = 'admin'
   WHERE user_id = (
     SELECT id FROM auth.users WHERE email = 'user@example.com'
   );
   
   -- Verifikasi
   SELECT u.email, ur.role 
   FROM auth.users u
   INNER JOIN public.user_roles ur ON ur.user_id = u.id
   WHERE u.email = 'user@example.com';
   ```

3. **Logout dan Login ulang:**
   - User harus logout dulu
   - Login kembali agar session ter-update
   - Akses `/admin`

---

### Opsi 3: Manual via Database UI (Supabase Table Editor)

Untuk yang lebih suka GUI:

1. **Cari User ID:**
   - Buka **Authentication** → **Users**
   - Cari user berdasarkan email
   - Copy **UUID** user

2. **Update Role:**
   - Buka **Table Editor** → Tabel `user_roles`
   - Cari row dengan `user_id` yang sesuai
   - Edit kolom `role` dari `warga` menjadi `admin`
   - Save

3. **Logout dan Login ulang**

---

## 🔐 Cara Login ke Dashboard Admin

### 1. Mengakses Halaman Login

```
http://localhost:3000/login
```

### 2. Login dengan User Admin

- Gunakan **email dan password** yang sudah dipromote ke admin
- Atau gunakan **Google OAuth** jika user admin menggunakan OAuth

### 3. Akses Dashboard Admin

Setelah login berhasil:

```
http://localhost:3000/admin
```

**Yang Akan Anda Lihat:**
- ✅ Dashboard dengan stat cards (Total Laporan, Menunggu Verifikasi, dll)
- ✅ SLA warning banner (jika ada laporan terlambat)
- ✅ Tabel antrean laporan (mock data)
- ✅ Status distribution chart
- ✅ Quick action shortcuts
- ✅ Admin activity log

**Catatan:** Data yang ditampilkan saat ini adalah **mock data** dari `src/features/admin/mock-data.ts`. Backend operations (verifikasi, tolak, update status) belum terimplementasi.

---

## 🔍 Verifikasi Role User

### Via Supabase Dashboard:

1. Buka **Table Editor** → Tabel `user_roles`
2. Cari berdasarkan `user_id`
3. Cek kolom `role` (harus `admin`)

### Via SQL Query:

```sql
-- Cek role berdasarkan email
SELECT 
  u.email,
  ur.role,
  p.full_name,
  ur.created_at as role_assigned_at
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@example.com';
```

### Via Application (Logged In):

Coba akses halaman admin:
- **Berhasil:** Dashboard admin terbuka → User adalah admin ✅
- **Redirect ke `/unauthorized`:** User bukan admin ❌
- **Redirect ke `/login`:** User belum login

---

## 🛡️ Keamanan Admin Access

### Admin Guard Protection

File: `src/lib/auth/guards.ts`

```typescript
export async function requireAdmin() {
  const user = await requireUser("/admin");
  const role = await getCurrentRole(user.id);
  
  if (role !== "admin") {
    redirect("/unauthorized");
  }
  
  return user;
}
```

**Cara Kerja:**
1. Cek apakah user sudah login (via `requireUser`)
2. Query role user dari tabel `user_roles`
3. Jika role bukan `admin` → redirect ke `/unauthorized`
4. Return user object jika valid

### Protected Routes

Semua route di bawah `/admin/*` terlindungi via layout:

```typescript
// src/app/admin/layout.tsx
export default async function AdminLayout({ children }) {
  await requireAdmin(); // 🛡️ Blocking guard
  return <AdminDashboard>{children}</AdminDashboard>
}
```

**Halaman yang dilindungi:**
- `/admin` - Dashboard utama
- `/admin/reports` - Daftar laporan lengkap
- `/admin/reports/[id]` - Detail laporan (coming soon)

---

## 📊 Mock Data vs Real Data

### Mock Data (Saat Ini):

**File:** `src/features/admin/mock-data.ts`

```typescript
export const MOCK_ADMIN_REPORTS = [
  { id: "R-001", title: "Jalan berlubang...", status: "diterima", ... },
  { id: "R-002", title: "Lampu jalan mati...", status: "diproses", ... },
  // ... 4 data lainnya
];
```

**Digunakan di:**
- `src/app/admin/page.tsx` - Dashboard stats dan tabel
- `src/features/admin/components/admin-queue-table.tsx` - Tabel antrean

### Migrasi ke Real Data (Future):

Untuk mengganti dengan data real dari database `reports`:

```typescript
// Di admin/page.tsx (Server Component)
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();
const { data: reports } = await supabase
  .from("reports")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(10);
```

**Catatan:** Backend operations (verifikasi, update status, tolak, gabung) perlu diimplementasikan sebagai Server Actions di `src/features/admin/actions.ts`.

---

## ⚡ Quick Commands

### Promote User by Email (SQL):

```sql
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'user@example.com');
```

### List All Admins:

```sql
SELECT 
  u.email,
  p.full_name,
  ur.created_at as admin_since
FROM auth.users u
INNER JOIN public.user_roles ur ON ur.user_id = u.id
INNER JOIN public.profiles p ON p.id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;
```

### Demote Admin to Warga:

```sql
UPDATE public.user_roles
SET role = 'warga'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@example.com');
```

### Check User Role by ID:

```sql
SELECT role FROM public.user_roles WHERE user_id = '<uuid>';
```

---

## 🐛 Troubleshooting

### 1. Redirect ke `/unauthorized` setelah login

**Penyebab:** User belum dipromote ke admin

**Solusi:**
- Cek role di tabel `user_roles`
- Jalankan SQL promote (lihat Opsi 1/2 di atas)
- Logout dan login ulang

### 2. Dashboard admin masih redirect ke login

**Penyebab:** Session belum valid atau expired

**Solusi:**
- Clear cookies browser
- Login ulang
- Periksa `NEXT_PUBLIC_SUPABASE_URL` dan `SUPABASE_ANON_KEY` di `.env.local`

### 3. Query `user_roles` tidak mengembalikan data

**Penyebab:** Migration belum dijalankan

**Solusi:**
```bash
npx supabase db reset  # Reset database lokal
# atau
npx supabase db push   # Push migration ke Supabase Cloud
```

### 4. RLS policy error saat query role

**Penyebab:** User mencoba query role user lain

**Solusi:** Policy `user_roles` hanya izinkan read role sendiri. Gunakan service role client untuk admin operations:

```typescript
import { createAdminClient } from "@/lib/supabase/admin";
const admin = createAdminClient();
```

---

## 📚 Referensi

- **Authentication Flow:** `docs/AUTHENTICATION.md`
- **Database Schema:** `supabase/migrations/20261024122338_create_profiles_schema.sql`
- **Admin Guards:** `src/lib/auth/guards.ts`
- **Dashboard Admin:** `src/app/admin/page.tsx`
- **Mock Data:** `src/features/admin/mock-data.ts`

---

## 🎯 Next Steps (Development)

Untuk membuat sistem admin fully functional, implementasikan:

1. **Server Actions untuk operasi admin:**
   - `verifyReport(reportId)` - Ubah status ke `diverifikasi`
   - `rejectReport(reportId, reason)` - Ubah status ke `ditolak`
   - `mergeReports(sourceId, targetId)` - Gabung laporan duplikat
   - `updateReportStatus(reportId, newStatus, note)`

2. **Database integration:**
   - Ganti mock data dengan query real dari tabel `reports`
   - Implementasi filter by status, category, overdue
   - Search functionality

3. **File upload:**
   - Upload bukti tindak lanjut oleh admin
   - Link ke report via `report_admin_attachments` table

4. **Audit logging:**
   - Catat setiap admin action ke `admin_activity_log` table
   - Tampilkan di dashboard

5. **Opsional - Web UI untuk promote admin:**
   - Halaman `/admin/users` untuk manage roles
   - Protected dengan extra authorization check

---

**Generated:** 2026-10-25
**Branch:** ui/ux-improvements
**Version:** 1.0.0
