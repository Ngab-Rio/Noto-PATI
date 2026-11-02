# Admin Testing Guide - Noto PATI

Panduan lengkap untuk testing fitur admin dan role-based access control.

## 📋 Prerequisites

Sebelum mulai testing:

- ✅ Development server running (`npm run dev`)
- ✅ Supabase project sudah setup (local atau cloud)
- ✅ Database migrations sudah dijalankan
- ✅ Environment variables sudah dikonfigurasi (`.env.local`)

---

## 🧪 Test Scenarios

### Scenario 1: Register User Baru (Role Default: Warga)

**Tujuan:** Memastikan user baru otomatis dapat role `warga`

**Langkah:**

1. Buka `http://localhost:3000/register`
2. Isi form:
   - **Nama Lengkap:** Test User Warga
   - **Email:** warga@test.com
   - **Password:** Password123!
3. Klik **Daftar**

**Expected Result:**
- ✅ Redirect ke `/profile` (jika email confirmation disabled)
- ✅ Atau pesan "Periksa email untuk verifikasi" (jika enabled)
- ✅ User tercatat di `auth.users`
- ✅ Profile tercatat di `public.profiles`
- ✅ Role tercatat di `public.user_roles` dengan `role = 'warga'`

**Verifikasi di Database:**

```sql
SELECT 
  u.email,
  p.full_name,
  ur.role
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'warga@test.com';
```

**Expected Output:**
```
email            | full_name        | role
-----------------+------------------+-------
warga@test.com   | Test User Warga  | warga
```

---

### Scenario 2: Warga Mencoba Akses Admin (Should Fail)

**Tujuan:** Memastikan admin guard bekerja dengan benar

**Langkah:**

1. Login sebagai warga (`warga@test.com`)
2. Manually akses `http://localhost:3000/admin`

**Expected Result:**
- ❌ **Tidak bisa akses dashboard admin**
- ✅ Redirect ke `/unauthorized`
- ✅ Pesan: "Halaman ini untuk Admin. Akun Anda tidak memiliki izin..."

**Browser Console:**
- ❌ Tidak ada error
- ✅ Clean redirect (Next.js server-side redirect)

---

### Scenario 3: Promote User ke Admin

**Tujuan:** Mengubah role user dari `warga` ke `admin`

**Langkah:**

1. Logout dari aplikasi
2. Buka Supabase Dashboard → SQL Editor
3. Jalankan script `supabase/seed_admin.sql` dengan email `warga@test.com`:

```sql
UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'warga@test.com'
);

-- Verifikasi
SELECT u.email, ur.role 
FROM auth.users u
INNER JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'warga@test.com';
```

**Expected Output:**
```
email            | role
-----------------+-------
warga@test.com   | admin  ✅
```

---

### Scenario 4: Login Sebagai Admin (Success)

**Tujuan:** Memastikan admin bisa akses dashboard

**Langkah:**

1. Buka `http://localhost:3000/login`
2. Login dengan:
   - **Email:** warga@test.com
   - **Password:** Password123!
3. Setelah login, akses `http://localhost:3000/admin`

**Expected Result:**
- ✅ Login berhasil
- ✅ Redirect ke `/` atau path `next` (jika ada)
- ✅ Bisa akses `/admin` tanpa redirect
- ✅ Dashboard admin terbuka dengan UI lengkap:
  - Stat cards (Total Laporan, Menunggu Verifikasi, dll)
  - SLA warning banner
  - Tabel antrean laporan (mock data)
  - Status distribution chart
  - Quick action shortcuts
  - Admin activity log

**Browser URL:**
```
http://localhost:3000/admin  ✅ (tidak redirect)
```

---

### Scenario 5: Admin Navigation & SubNav

**Tujuan:** Memastikan navigasi admin berfungsi

**Langkah:**

1. Login sebagai admin
2. Akses `/admin`
3. Perhatikan **AdminSubnav** di bawah navbar utama
4. Klik link:
   - **Dashboard** → `/admin`
   - **Semua Laporan** → `/admin/reports`
   - **Lihat semua** (di tabel) → `/admin/reports`

**Expected Result:**
- ✅ SubNav muncul hanya di halaman admin
- ✅ Navigasi antar halaman admin smooth
- ✅ Active state terlihat di menu yang sedang dibuka
- ✅ `/admin/reports` menampilkan halaman daftar laporan lengkap

---

### Scenario 6: Protected Routes - Deep Links

**Tujuan:** Memastikan semua route admin terlindungi

**Test Matrix:**

| User Role | URL                    | Expected Result                        |
|-----------|------------------------|----------------------------------------|
| Guest     | `/admin`               | Redirect → `/login?next=/admin`        |
| Warga     | `/admin`               | Redirect → `/unauthorized`             |
| Admin     | `/admin`               | ✅ Dashboard terbuka                    |
| Guest     | `/admin/reports`       | Redirect → `/login?next=/admin/reports`|
| Warga     | `/admin/reports`       | Redirect → `/unauthorized`             |
| Admin     | `/admin/reports`       | ✅ Daftar laporan terbuka               |

**Cara Test:**
- Logout (guest)
- Login sebagai warga
- Login sebagai admin
- Akses URL di atas dan catat hasilnya

---

### Scenario 7: Session Persistence

**Tujuan:** Memastikan session admin persist setelah refresh

**Langkah:**

1. Login sebagai admin
2. Akses `/admin`
3. **Refresh halaman** (F5 atau Ctrl+R)
4. **Buka tab baru** dan akses `/admin`
5. **Tutup browser** dan buka lagi → akses `/admin`

**Expected Result:**
- ✅ Tidak perlu login ulang setelah refresh
- ✅ Session tetap valid di tab baru
- ✅ Session expired setelah tutup browser (depends on Supabase settings)

---

### Scenario 8: Logout & Access Control

**Tujuan:** Memastikan logout menghapus session dengan benar

**Langkah:**

1. Login sebagai admin
2. Akses `/admin` (pastikan bisa)
3. Klik **Logout** di navbar
4. Coba akses `/admin` lagi

**Expected Result:**
- ✅ Logout redirect ke `/` (homepage)
- ✅ Setelah logout, akses `/admin` redirect ke `/login?next=/admin`
- ✅ Session benar-benar dihapus (tidak ada auth cookie)

---

### Scenario 9: Google OAuth Admin Flow

**Tujuan:** Memastikan admin bisa login via Google OAuth

**Prerequisites:**
- Google OAuth sudah dikonfigurasi di Supabase

**Langkah:**

1. Daftar user baru via Google OAuth:
   - Buka `/login`
   - Klik **Login dengan Google**
   - Pilih akun Google (contoh: admin.google@test.com)
2. Promote user ke admin via SQL:
   ```sql
   UPDATE public.user_roles
   SET role = 'admin'
   WHERE user_id = (
     SELECT id FROM auth.users WHERE email = 'admin.google@test.com'
   );
   ```
3. Logout
4. Login ulang via Google OAuth
5. Akses `/admin`

**Expected Result:**
- ✅ OAuth flow berhasil (redirect ke `/profile` atau `/`)
- ✅ User tercatat di database dengan provider `google`
- ✅ Role assignment bekerja untuk OAuth user
- ✅ Bisa akses `/admin` setelah promote

---

## 🔍 Database Verification Queries

### Check All Users & Roles

```sql
SELECT 
  u.id,
  u.email,
  u.created_at,
  p.full_name,
  ur.role,
  CASE 
    WHEN ur.role = 'admin' THEN '👑 ADMIN'
    WHEN ur.role = 'warga' THEN '👤 WARGA'
    ELSE '⚠️ NO ROLE'
  END as badge
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
ORDER BY u.created_at DESC;
```

### List Only Admins

```sql
SELECT 
  u.email,
  p.full_name,
  ur.created_at as admin_since,
  EXTRACT(DAY FROM NOW() - ur.created_at) as days_as_admin
FROM auth.users u
INNER JOIN public.user_roles ur ON ur.user_id = u.id
INNER JOIN public.profiles p ON p.id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;
```

### Check User by Email

```sql
SELECT 
  u.id as user_id,
  u.email,
  u.email_confirmed_at,
  p.full_name,
  ur.role,
  ur.created_at as role_since
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
WHERE u.email = 'warga@test.com';  -- 👈 Change email here
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Redirect Loop (Login → Admin → Login)

**Symptoms:**
- Login berhasil tapi redirect ke `/login` lagi
- Console error: "Too many redirects"

**Possible Causes:**
- Session cookie tidak ter-set (Supabase config salah)
- CORS issue di local development
- Browser block third-party cookies

**Solutions:**
1. Check `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
2. Clear browser cookies dan cache
3. Test di incognito/private window
4. Verify `createClient()` returns valid session

---

### Issue 2: Still Redirect to `/unauthorized` After Promote

**Symptoms:**
- User sudah di-promote ke admin di database
- Tapi masih redirect ke `/unauthorized` saat akses `/admin`

**Possible Causes:**
- Session cache belum ter-update
- User belum logout/login ulang setelah promote

**Solutions:**
1. **Logout** dari aplikasi
2. **Login** ulang
3. Akses `/admin` lagi
4. Jika masih gagal, check database:
   ```sql
   SELECT role FROM public.user_roles 
   WHERE user_id = (SELECT id FROM auth.users WHERE email = 'your@email.com');
   ```
5. Verify email di SQL query **exactly match** (case-sensitive)

---

### Issue 3: Dashboard Tidak Menampilkan Data Real

**Symptoms:**
- Dashboard admin terbuka, tapi data masih hardcoded/mock

**Expected Behavior:**
- ✅ **INI NORMAL** - Dashboard saat ini memang menggunakan **mock data**
- Mock data ada di: `src/features/admin/mock-data.ts`
- Backend operations (verifikasi, update status) **belum terimplementasi**

**Solutions (Future Development):**
- Implementasi Server Actions di `src/features/admin/actions.ts`
- Ganti mock data dengan query real dari `reports` table
- Baca `docs/ADMIN_SETUP.md` bagian "Next Steps (Development)"

---

### Issue 4: RLS Policy Error

**Symptoms:**
- Error: "new row violates row-level security policy"
- Query ke `user_roles` gagal

**Possible Causes:**
- RLS policy hanya izinkan user read role sendiri
- Admin mencoba query role user lain dengan client biasa

**Solutions:**
- Gunakan **service role client** untuk admin operations:
  ```typescript
  import { createAdminClient } from "@/lib/supabase/admin";
  const admin = createAdminClient();
  const { data } = await admin.from("user_roles").select("*");
  ```

---

## ✅ Test Checklist

Gunakan checklist ini untuk memastikan semua scenario sudah di-test:

- [ ] **Register user baru** → role default `warga` ✅
- [ ] **Warga akses `/admin`** → redirect `/unauthorized` ✅
- [ ] **Promote user ke admin** via SQL → role berubah ✅
- [ ] **Admin login** → session valid ✅
- [ ] **Admin akses `/admin`** → dashboard terbuka ✅
- [ ] **AdminSubnav** muncul di halaman admin ✅
- [ ] **Navigasi** antar halaman admin ✅
- [ ] **Guest akses `/admin`** → redirect `/login?next=/admin` ✅
- [ ] **Session persist** setelah refresh ✅
- [ ] **Logout** → session cleared ✅
- [ ] **Google OAuth admin** → flow berhasil ✅
- [ ] **Database queries** → data sesuai ✅

---

## 📊 Test Report Template

Setelah testing, dokumentasikan hasil dengan format ini:

```markdown
## Test Report - Admin Access Control

**Date:** 2026-10-25
**Tester:** [Nama Anda]
**Branch:** ui/ux-improvements
**Environment:** Local Development

### Summary
- ✅ Total Scenarios: 9
- ✅ Passed: 9
- ❌ Failed: 0
- ⚠️ Partial: 0

### Scenario Results

| Scenario | Status | Notes |
|----------|--------|-------|
| Register User (Warga) | ✅ PASS | Default role assigned correctly |
| Warga Access Admin | ✅ PASS | Redirected to /unauthorized |
| Promote to Admin | ✅ PASS | SQL query successful |
| Admin Login | ✅ PASS | Session created |
| Admin Dashboard | ✅ PASS | UI displayed, mock data shown |
| Admin Navigation | ✅ PASS | SubNav and routing working |
| Protected Routes | ✅ PASS | All guards functional |
| Session Persistence | ✅ PASS | Survives refresh |
| Logout | ✅ PASS | Session cleared |

### Issues Found
- None ✅

### Recommendations
1. Implement real data fetching (replace mock)
2. Add Server Actions for admin operations
3. Consider adding user management UI for role promotion
```

---

## 📚 References

- **Admin Setup:** `docs/ADMIN_SETUP.md`
- **Authentication Docs:** `docs/AUTHENTICATION.md`
- **Admin Guards:** `src/lib/auth/guards.ts`
- **Dashboard:** `src/app/admin/page.tsx`
- **Mock Data:** `src/features/admin/mock-data.ts`
- **Seed Script:** `supabase/seed_admin.sql`

---

**Happy Testing! 🚀**

Jika menemukan bug atau issue yang tidak tercantum di guide ini, silakan dokumentasikan dan laporkan.
