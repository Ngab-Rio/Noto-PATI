-- ============================================================================
-- Seed Admin User - Noto PATI
-- ============================================================================
-- Script untuk promote user menjadi admin
-- 
-- CARA MENGGUNAKAN:
-- 1. Edit email di bawah ini dengan email user yang ingin dijadikan admin
-- 2. Jalankan script ini via Supabase Dashboard (SQL Editor) atau CLI:
--    npx supabase db execute -f supabase/seed_admin.sql
--
-- CATATAN:
-- - User harus sudah terdaftar terlebih dahulu (via /register)
-- - Default role semua user baru adalah 'warga'
-- - Script ini akan mengubah role menjadi 'admin'
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. PROMOTE USER BY EMAIL
-- ─────────────────────────────────────────────────────────────────────────
-- Ganti 'admin@example.com' dengan email user yang ingin dijadikan admin

UPDATE public.user_roles
SET role = 'admin'
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@example.com'  -- 👈 EDIT EMAIL DI SINI
);


-- ─────────────────────────────────────────────────────────────────────────
-- 2. VERIFIKASI HASIL
-- ─────────────────────────────────────────────────────────────────────────
-- Query ini akan menampilkan informasi user yang baru saja dipromote

SELECT 
  u.id as user_id,
  u.email,
  p.full_name,
  ur.role,
  ur.created_at as role_assigned_at,
  u.created_at as user_created_at,
  CASE 
    WHEN ur.role = 'admin' THEN '✅ ADMIN ACCESS GRANTED'
    ELSE '⚠️ Still WARGA - Check email or run UPDATE again'
  END as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@example.com';  -- 👈 EDIT EMAIL DI SINI (sama dengan di atas)


-- ─────────────────────────────────────────────────────────────────────────
-- 3. BONUS: LIST ALL ADMINS
-- ─────────────────────────────────────────────────────────────────────────
-- (Opsional) Tampilkan semua user dengan role admin

SELECT 
  u.email,
  p.full_name,
  ur.created_at as admin_since
FROM auth.users u
INNER JOIN public.user_roles ur ON ur.user_id = u.id
INNER JOIN public.profiles p ON p.id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;


-- ============================================================================
-- NOTES:
-- ============================================================================
-- Setelah promote berhasil:
-- 1. User harus LOGOUT dari aplikasi
-- 2. LOGIN kembali agar session ter-update
-- 3. Akses http://localhost:3000/admin untuk lihat dashboard
-- 
-- Jika masih redirect ke /unauthorized:
-- - Periksa email di query apakah sama persis (case-sensitive)
-- - Pastikan user sudah terdaftar (ada di auth.users)
-- - Coba logout/login ulang atau clear browser cookies
-- 
-- Untuk demote admin kembali ke warga:
-- UPDATE public.user_roles SET role = 'warga' WHERE user_id = '<uuid>';
-- ============================================================================
