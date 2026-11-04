-- ============================================================================
-- Seed Admin User - Noto PATI
-- ============================================================================
-- Script untuk membuat user admin secara otomatis (tanpa registrasi manual)
-- 
-- CARA MENGGUNAKAN:
-- 1. Edit email, password, dan nama admin di bagian CONFIGURATION
-- 2. Jalankan script via Supabase Dashboard (SQL Editor) atau CLI:
--    npx supabase db query -f supabase/seed_admin.sql
--
-- OPSI PENGGUNAAN:
-- - MODE 1: Create new admin user (jika belum ada)
-- - MODE 2: Promote existing user ke admin (jika sudah register)
--
-- CATATAN KEAMANAN:
-- - Password akan di-hash oleh Supabase Auth
-- - Jangan commit password asli ke version control
-- - Gunakan environment variable untuk production
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────
-- 📝 CONFIGURATION - EDIT DISINI
-- ─────────────────────────────────────────────────────────────────────────

-- Admin user credentials
DO $$
DECLARE
  v_admin_email TEXT := 'admin@production.com';           -- 👈 Email dari .env
  v_admin_password TEXT := '123123qweqwe123123';          -- 👈 Password dari .env
  v_admin_full_name TEXT := 'Admin Noto PATI';            -- 👈 Nama lengkap admin
  v_user_id UUID;
BEGIN
  -- ─────────────────────────────────────────────────────────────────────────
  -- MODE 1: CREATE NEW ADMIN USER (Otomatis)
  -- ─────────────────────────────────────────────────────────────────────────
  -- Check if user already exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_admin_email;

  IF v_user_id IS NULL THEN
    -- User belum ada, create new user via auth.users
    RAISE NOTICE '🔄 Creating new admin user: %', v_admin_email;
    
    -- Insert into auth.users (Supabase internal table)
    -- Note: Password akan di-hash otomatis oleh Supabase
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      v_admin_email,
      crypt(v_admin_password, gen_salt('bf')),  -- Bcrypt hash
      NOW(),  -- Email auto-confirmed untuk admin seed
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('full_name', v_admin_full_name),
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO v_user_id;

    RAISE NOTICE '✅ User created with ID: %', v_user_id;

    -- Trigger akan otomatis create profile dan role 'warga'
    -- Kita tunggu sebentar untuk trigger selesai
    PERFORM pg_sleep(0.5);

    -- Update role ke admin
    UPDATE public.user_roles
    SET role = 'admin'
    WHERE user_id = v_user_id;

    RAISE NOTICE '✅ Role updated to ADMIN';

  ELSE
    -- ─────────────────────────────────────────────────────────────────────────
    -- MODE 2: PROMOTE EXISTING USER
    -- ─────────────────────────────────────────────────────────────────────────
    RAISE NOTICE '⚠️  User already exists: %', v_admin_email;
    RAISE NOTICE '🔄 Promoting existing user to ADMIN...';

    UPDATE public.user_roles
    SET role = 'admin'
    WHERE user_id = v_user_id;

    RAISE NOTICE '✅ User promoted to ADMIN';
  END IF;

END $$;


-- ─────────────────────────────────────────────────────────────────────────
-- 🔍 VERIFICATION - Tampilkan Hasil
-- ─────────────────────────────────────────────────────────────────────────

SELECT 
  '=== ADMIN USER CREATED/UPDATED ===' as info,
  u.id as user_id,
  u.email,
  p.full_name,
  ur.role,
  u.email_confirmed_at,
  u.created_at as user_created_at,
  ur.created_at as role_assigned_at,
  CASE 
    WHEN ur.role = 'admin' THEN '✅ ADMIN ACCESS GRANTED'
    WHEN ur.role = 'warga' THEN '⚠️ Still WARGA (check script errors)'
    ELSE '❌ NO ROLE ASSIGNED'
  END as status
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@production.com'  -- 👈 EDIT: Sama dengan email di atas
ORDER BY u.created_at DESC
LIMIT 1;


-- ─────────────────────────────────────────────────────────────────────────
-- 📊 BONUS: LIST ALL ADMINS
-- ─────────────────────────────────────────────────────────────────────────

SELECT 
  '=== ALL ADMIN USERS ===' as info,
  u.email,
  p.full_name,
  ur.created_at as admin_since,
  EXTRACT(DAY FROM NOW() - ur.created_at) as days_as_admin
FROM auth.users u
INNER JOIN public.user_roles ur ON ur.user_id = u.id
INNER JOIN public.profiles p ON p.id = u.id
WHERE ur.role = 'admin'
ORDER BY ur.created_at DESC;


-- ============================================================================
-- 🔐 SECURITY NOTES
-- ============================================================================
-- 1. Password di-hash menggunakan bcrypt (gen_salt('bf'))
-- 2. Email auto-confirmed untuk admin seed (tidak perlu verifikasi)
-- 3. Script ini bypass RLS karena berjalan dengan superuser privilege
-- 4. Untuk production, gunakan environment variable untuk password
--
-- RECOMMENDED PRODUCTION SETUP:
-- - Jangan hardcode password di script
-- - Gunakan secrets management (Vault, AWS Secrets, dll)
-- - Rotate password setelah first login
-- - Enable MFA untuk admin accounts
-- ============================================================================

-- ============================================================================
-- 🧪 TESTING
-- ============================================================================
-- Setelah script berhasil:
-- 1. Buka http://localhost:3000/login
-- 2. Login dengan:
--    Email: admin@production.com
--    Password: 123123qweqwe123123
-- 3. Akses http://localhost:3000/admin
-- 4. Dashboard admin harus terbuka tanpa redirect
--
-- Troubleshooting:
-- - Jika redirect ke /unauthorized: Periksa role di database
-- - Jika login gagal: Periksa password (case-sensitive)
-- - Jika trigger error: Pastikan migration profiles sudah jalan
-- ============================================================================

-- ============================================================================
-- 🔄 ALTERNATIVE: Promote Existing User (Manual)
-- ============================================================================
-- Jika Anda lebih suka promote user yang sudah register via UI:
--
-- UPDATE public.user_roles
-- SET role = 'admin'
-- WHERE user_id = (
--   SELECT id FROM auth.users WHERE email = 'user@example.com'
-- );
-- ============================================================================
