# Troubleshooting Guide - Admin Operations

## 🐛 Known Issues & Fixes

### Issue #1: "Gagal menolak/verifikasi laporan" Error

**Symptoms:**
- Alert shows: "❌ Gagal menolak laporan. Silakan coba lagi."
- Alert shows: "❌ Gagal memverifikasi laporan. Silakan coba lagi."
- No status change in database

**Root Causes:**

#### A) Missing `changed_by` field in report_status_history
**Error:** RLS policy or database constraint requires `changed_by` field

**Fix Applied:**
```typescript
// Before (WRONG):
await supabase.from("report_status_history").insert({
  report_id: reportId,
  status: "diverifikasi",
  note: "...",
});

// After (CORRECT):
await supabase.from("report_status_history").insert({
  report_id: reportId,
  status: "diverifikasi",
  changed_by: adminUser.id,  // ✅ Added
  note: "...",
});
```

#### B) Non-existent `verified_at` column
**Error:** Column "verified_at" does not exist in reports table

**Fix Applied:**
```typescript
// Before (WRONG):
await supabase.from("reports").update({
  status: "diverifikasi",
  verified_at: new Date().toISOString(),  // ❌ Column doesn't exist
});

// After (CORRECT):
await supabase.from("reports").update({
  status: "diverifikasi",  // ✅ Only update status
});
```

**Commit:** `fix: add changed_by field and remove non-existent verified_at column`

---

### Issue #2: Admin Redirect to /unauthorized

**Symptoms:**
- Admin user redirects to `/unauthorized` when accessing `/admin`
- `requireAdmin()` fails even though user has admin role

**Root Causes:**

#### A) Admin role not seeded
**Check:**
```sql
SELECT u.email, ur.role 
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'admin@production.com';
```

**Fix:**
Run `supabase/seed_admin.sql` via Supabase Dashboard SQL Editor

#### B) RLS policy blocking user_roles read
**Check RLS policies:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'user_roles';
```

**Expected Policy:**
```sql
CREATE POLICY "Users can read their own role"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);
```

---

### Issue #3: Activity Logging Errors

**Symptoms:**
- Console error: `relation "admin_activity_logs" does not exist`
- Verify/reject works but logs not saved

**Root Cause:**
Migration not run yet

**Fix:**
1. Run `supabase/migrations/20261104100000_create_admin_activity_logs.sql`
2. Or: Activity logging is **non-blocking**, so operations will still work

**Note:** Activity logging is optional. The main operations will succeed even if logging fails.

---

### Issue #4: Completion Evidence Upload Fails

**Symptoms:**
- Error: `The resource was not found` when uploading photo

**Root Cause:**
Storage bucket `completion-evidence` doesn't exist

**Fix:**
Run `supabase/migrations/20261104110000_create_completion_evidence_storage.sql` via Dashboard

---

### Issue #5: Status Transition Rejected

**Symptoms:**
- Error: "Transisi dari 'diproses' ke 'diverifikasi' tidak diizinkan"

**Root Cause:**
Invalid status transition attempted

**Valid Transitions:**
```
diterima → diverifikasi (via verifyReport)
diterima → ditolak (via rejectReport)
diverifikasi → diproses (via updateReportStatus)
diproses → selesai (via updateReportStatus)
```

**Fix:**
Follow the correct flow. Cannot go backwards or skip steps.

---

### Issue #6: Report Not Found

**Symptoms:**
- Error: "Laporan tidak ditemukan"

**Root Causes:**

#### A) Wrong reportId passed
**Check:** Make sure you're passing UUID, not ticket_number

```typescript
// WRONG:
verifyReport("PT-2024-000001");

// CORRECT:
verifyReport("550e8400-e29b-41d4-a716-446655440000");
```

#### B) RLS policy blocking read
**Check:**
```sql
-- Test as admin user
SELECT * FROM reports WHERE id = '<uuid>';
```

If returns nothing, check RLS policies on `reports` table.

---

## 🔧 Debugging Commands

### Check Admin Role
```sql
SELECT 
  u.id,
  u.email,
  ur.role,
  ur.created_at as role_assigned_at
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
WHERE u.email = 'admin@production.com';
```

**Expected Output:**
```
role: admin
```

### Check Report Status
```sql
SELECT 
  id,
  ticket_number,
  status,
  created_at,
  updated_at
FROM reports
WHERE ticket_number = 'NP-2024-000001';
```

### Check Status History
```sql
SELECT 
  rsh.id,
  rsh.status,
  rsh.note,
  rsh.created_at,
  p.full_name as changed_by_name
FROM report_status_history rsh
LEFT JOIN profiles p ON p.id = rsh.changed_by
WHERE rsh.report_id = '<uuid>'
ORDER BY rsh.created_at DESC;
```

### Check RLS Policies
```sql
-- Reports table
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'reports';

-- report_status_history table
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'report_status_history';
```

### Check Activity Logs (if migration run)
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
LIMIT 10;
```

---

## 🚨 Common Error Messages

### 1. "Unauthorized: Admin access required"
- **Cause:** Not logged in as admin
- **Fix:** Login with admin credentials, run seed script

### 2. "ID laporan tidak valid"
- **Cause:** reportId is not a valid UUID
- **Fix:** Check you're passing report.id, not report.ticket_number

### 3. "Alasan penolakan minimal 10 karakter"
- **Cause:** Reject reason too short
- **Fix:** Write at least 10 characters in rejection reason

### 4. "Laporan dengan status 'selesai' tidak dapat diverifikasi"
- **Cause:** Trying to modify terminal status
- **Fix:** Terminal statuses (selesai, ditolak) cannot be changed

### 5. "Column 'changed_by' violates not-null constraint"
- **Cause:** Old version of code not passing changed_by
- **Fix:** Update to latest code with changed_by field

---

## 📋 Testing Checklist After Fix

- [ ] Can login as admin (admin@production.com)
- [ ] Can access /admin dashboard
- [ ] Can view report detail
- [ ] Can verify report (diterima → diverifikasi) ✅
- [ ] Can reject report with reason ✅
- [ ] Can update to diproses
- [ ] Can complete report (diproses → selesai)
- [ ] Timeline shows changes with admin name
- [ ] Activity logs recorded (if migration run)
- [ ] Non-admin blocked from /admin

---

## 🆘 Still Having Issues?

### 1. Check Browser Console
- Open DevTools → Console tab
- Look for red error messages
- Note exact error text

### 2. Check Server Logs
If running locally:
```bash
npm run dev
```
Watch terminal for error messages when clicking verify/reject

### 3. Check Database Logs (Supabase Dashboard)
- Go to Database → Logs
- Filter by "Error" level
- Look for RLS policy violations or constraint errors

### 4. Enable Detailed Logging
Add to Server Action:
```typescript
console.log("Report before update:", report);
console.log("Update error:", updateError);
console.log("History error:", historyError);
```

### 5. Test with SQL Directly
```sql
-- Try manual update
UPDATE reports 
SET status = 'diverifikasi'
WHERE id = '<uuid>';

-- Check if RLS blocks it
-- If error: "new row violates row-level security policy"
-- Then: RLS policy issue
```

---

## 📞 Support

If none of the above fixes work:

1. **Collect Information:**
   - Exact error message
   - Browser console output
   - Server logs
   - SQL query results from debugging commands
   - User role verification

2. **Check Documentation:**
   - `ADMIN_OPERATIONS_TESTING.md` - Full test guide
   - `ADMIN_IMPLEMENTATION_SUMMARY.md` - Technical details
   - Database schema in `supabase/migrations/`

3. **Verify Prerequisites:**
   - Admin user created via seed script
   - Migrations run successfully
   - RLS policies configured
   - Auth working correctly

---

*Last Updated: 2026-01-27*  
*Version: 1.1 (after database field fixes)*
