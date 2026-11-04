# Manual Migration Steps - Admin Features

## 🎯 Tujuan

Karena ada conflict dengan migration history, kita akan jalankan migrations secara manual via Supabase Dashboard.

## 📋 Prerequisites

- Akses ke Supabase Dashboard
- URL: https://unhvcenpkwmkonmpcsaq.supabase.co/project/unhvcenpkwmkonmpcsaq/editor

---

## Step 1: Admin Activity Logs Table

**File:** `supabase/migrations/20250127_create_admin_activity_logs.sql`

### Jalankan via SQL Editor:

1. Buka Supabase Dashboard → SQL Editor
2. New Query
3. Copy-paste seluruh isi file `supabase/migrations/20250127_create_admin_activity_logs.sql`
4. Run

### Expected Output:
```
✅ admin_activity_logs table created
✅ RLS policies created
```

### Verification Query:
```sql
-- Check table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'admin_activity_logs'
);

-- Should return: true
```

---

## Step 2: Completion Evidence Storage

**File:** `supabase/migrations/20250127_create_completion_evidence_storage.sql`

### Jalankan via SQL Editor:

1. New Query
2. Copy-paste seluruh isi file `supabase/migrations/20250127_create_completion_evidence_storage.sql`
3. Run

### Expected Output:
```
✅ Storage bucket created
✅ Storage policies created
```

### Verification Query:
```sql
-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'completion-evidence';

-- Should return 1 row with:
-- id: completion-evidence
-- public: true
-- file_size_limit: 5242880
```

---

## Step 3: Seed Admin User

**File:** `supabase/seed_admin.sql`

### Jalankan via SQL Editor:

1. New Query
2. Copy-paste seluruh isi file `supabase/seed_admin.sql`
3. Run

### Expected Output:
```
✅ ADMIN ACCESS GRANTED
```

### Verification Query:
```sql
SELECT 
  u.email,
  ur.role,
  p.full_name,
  u.created_at
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'admin@production.com';

-- Should return 1 row with role = 'admin'
```

---

## 🔍 Check Remote Migrations

Jika ingin tahu apa isi migrations yang ada di remote (`20261104150000` dan `20261104153000`):

### Option A: Via SQL Editor
```sql
-- Check migration history
SELECT * FROM supabase_migrations.schema_migrations
ORDER BY version DESC
LIMIT 5;
```

### Option B: Via Supabase CLI
```bash
# Download remote migrations
npx supabase db diff --use-migra --file remote_diff.sql
```

---

## 🚨 Troubleshooting

### Issue: "relation 'admin_activity_logs' already exists"

**Solution:** Table sudah ada, skip Step 1

**Verify:**
```sql
SELECT COUNT(*) FROM admin_activity_logs;
```

### Issue: "bucket 'completion-evidence' already exists"

**Solution:** Bucket sudah ada, skip Step 2

**Verify:**
```sql
SELECT * FROM storage.buckets WHERE id = 'completion-evidence';
```

### Issue: "user with email 'admin@production.com' already exists"

**Solution:** Admin sudah di-seed sebelumnya

**Verify role:**
```sql
SELECT ur.role 
FROM auth.users u
JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'admin@production.com';

-- If role != 'admin', run this:
UPDATE user_roles 
SET role = 'admin'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admin@production.com');
```

---

## ✅ Final Verification

Setelah semua steps dijalankan, verify semuanya bekerja:

### 1. Admin Login Test
```bash
# Browser:
http://localhost:3001/login

# Login dengan:
Email: admin@production.com
Password: 123123qweqwe123123

# Navigate to:
http://localhost:3001/admin
```

### 2. Verify Report Test
1. Pilih laporan dengan status "diterima"
2. Klik "Verifikasi Laporan"
3. Should show: ✅ Laporan berhasil diverifikasi!

### 3. Check Activity Log
```sql
SELECT 
  aal.action_type,
  aal.created_at,
  p.full_name as admin_name,
  r.ticket_number
FROM admin_activity_logs aal
LEFT JOIN profiles p ON p.id = aal.admin_user_id
LEFT JOIN reports r ON r.id = aal.target_report_id
ORDER BY aal.created_at DESC
LIMIT 5;
```

Should show recent admin actions.

---

## 📝 Notes

### Why Manual Migration?

1. **Migration History Conflict:**
   - Remote has: `20261104150000`, `20261104153000`
   - Local has: `20250127` (wrong date format)
   
2. **Safety:**
   - Manual execution via Dashboard lebih aman
   - Kita bisa review setiap query sebelum run
   - Lebih mudah rollback jika ada error

3. **Optional Features:**
   - Activity logs: nice-to-have, not critical
   - Evidence upload: optional MVP feature
   - Main operations work without these

### Future Migrations

Untuk migrations selanjutnya, gunakan format yang benar:

```bash
# Generate new migration
npx supabase migration new feature_name

# Will create: supabase/migrations/20261127XXXXXX_feature_name.sql
```

Pastikan tahun adalah **2026**, bukan 2025.

---

## 🎯 Summary

| Feature | Method | Status |
|---------|--------|--------|
| Admin Activity Logs | Manual (Dashboard) | Optional |
| Evidence Storage | Manual (Dashboard) | Optional |
| Admin User Seed | Manual (Dashboard) | Required |
| Core Admin Operations | Already Deployed | ✅ Working |

**Next:** Test admin operations di browser!

---

*Last Updated: 2026-01-27*
