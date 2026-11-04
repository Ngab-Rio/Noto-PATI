# Admin Operations Testing Guide

## 🎯 Tujuan Testing

Memvalidasi bahwa semua backend operations admin dashboard berfungsi dengan benar sesuai Issue #08.

## ✅ Prerequisites

1. **Admin User Setup**
   ```sql
   -- Edit supabase/seed_admin.sql dengan credentials:
   v_admin_email := 'admin@production.com';  -- Sesuai .env
   v_admin_password := '123123qweqwe123123';
   v_admin_full_name := 'Admin Noto PATI';
   ```

2. **Run Seed Script via Supabase Dashboard**
   - Buka: https://unhvcenpkwmkonmpcsaq.supabase.co/project/unhvcenpkwmkonmpcsaq/editor
   - Copy-paste isi `supabase/seed_admin.sql`
   - Jalankan dan verifikasi output `✅ ADMIN ACCESS GRANTED`

3. **Test Data**
   - Pastikan ada minimal 3 laporan dengan status berbeda:
     - 1 laporan status "diterima" (untuk test verify/reject)
     - 1 laporan status "diverifikasi" (untuk test progress)
     - 1 laporan status "diproses" (untuk test complete)

## 🧪 Test Scenarios

### Test 1: Admin Login & Access

**Steps:**
1. Buka `http://localhost:3000/login`
2. Login dengan:
   - Email: `admin@production.com`
   - Password: `123123qweqwe123123`
3. Redirect ke homepage
4. Akses `http://localhost:3000/admin`

**Expected Result:**
- ✅ Login berhasil tanpa error
- ✅ Dashboard admin terbuka (tidak redirect ke /unauthorized)
- ✅ List laporan tampil dengan data real dari database
- ✅ Statistik cards menampilkan angka yang benar

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Test 2: Verify Report (diterima → diverifikasi)

**Steps:**
1. Di Admin Dashboard, pilih laporan dengan status "Diterima"
2. Klik laporan untuk buka detail
3. Di panel kanan, klik tombol **"Verifikasi Laporan"**
4. Konfirmasi dialog
5. Tunggu redirect/refresh

**Expected Result:**
- ✅ Status badge berubah menjadi "Diverifikasi"
- ✅ Timeline bertambah 1 entry baru dengan:
  - Status: Diverifikasi
  - Actor: Admin (nama Anda)
  - Note: "Laporan telah diverifikasi oleh admin"
- ✅ Tombol action berubah menjadi "Mulai Pemrosesan Lapangan"
- ✅ Database `reports.status` = 'diverifikasi'
- ✅ Entry baru di `report_status_history`

**SQL Verification:**
```sql
SELECT * FROM reports WHERE id = '<report_id>';
SELECT * FROM report_status_history WHERE report_id = '<report_id>' ORDER BY created_at DESC LIMIT 1;
```

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Test 3: Reject Report

**Steps:**
1. Pilih laporan lain dengan status "Diterima"
2. Buka detail laporan
3. Klik tombol **"Tolak Laporan"**
4. Form rejection muncul
5. Isi alasan penolakan (minimal 10 karakter): "Lokasi kerusakan berada di jalur provinsi, bukan kewenangan Pemkab Pati"
6. Klik "Konfirmasi Penolakan"

**Expected Result:**
- ✅ Status berubah menjadi "Ditolak"
- ✅ Timeline menampilkan alasan penolakan
- ✅ Panel action menampilkan "Status Terminal - tidak dapat diubah"
- ✅ Database status = 'ditolak'

**Edge Cases to Test:**
- [ ] Reject dengan alasan < 10 karakter → Error validation
- [ ] Reject tanpa isi alasan → Error "wajib diisi"
- [ ] Cancel reject → Form hilang, tidak ada perubahan status

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Test 4: Update Status to "Diproses"

**Steps:**
1. Pilih laporan dengan status "Diverifikasi"
2. Buka detail
3. Klik **"Mulai Pemrosesan Lapangan"**
4. Konfirmasi

**Expected Result:**
- ✅ Status → "Diproses"
- ✅ Timeline updated
- ✅ Action button berubah → "Tandai Selesai" (hijau)
- ✅ Database updated

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Test 5: Complete Report (diproses → selesai)

**Steps:**
1. Pilih laporan dengan status "Diproses"
2. Klik **"Tandai Selesai"**
3. Konfirmasi

**Expected Result:**
- ✅ Status → "Selesai"
- ✅ Timeline updated dengan timestamp completion
- ✅ Panel menampilkan "Status Terminal"
- ✅ SLA indicator hijau (jika dalam waktu)

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Test 6: Invalid State Transitions

**Test Prevention Logic:**

**Scenario A:** Try to verify already verified report
- Expected: Button disabled dengan label "Sudah Diverifikasi"

**Scenario B:** Try to complete report that's still "Diterima"
- Expected: No "Tandai Selesai" button, only "Verifikasi"

**Scenario C:** Try to modify terminal status (selesai/ditolak)
- Expected: Panel shows "Status Terminal" message, no action buttons

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Test 7: Error Handling

**Test Network/Server Errors:**

**Scenario A:** Disconnect internet, try verify
- Expected: Alert "❌ Terjadi kesalahan tidak terduga"

**Scenario B:** Invalid report ID (manual URL manipulation)
- Expected: Proper error message, not crash

**Scenario C:** Database constraint violation
- Expected: Graceful error message

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Test 8: Timeline Audit Integrity

**Steps:**
1. Pilih laporan yang sudah punya timeline history
2. Verify all transitions tercatat
3. Check timestamps ascending order
4. Verify actor names correct

**Expected Result:**
- ✅ Semua status transition tercatat
- ✅ Timestamps logical (tidak ada future date)
- ✅ Actor name = admin full_name dari profiles
- ✅ Notes descriptive dan informatif

**SQL Verification:**
```sql
SELECT 
  rsh.*,
  p.full_name as actor_name
FROM report_status_history rsh
LEFT JOIN profiles p ON p.id = rsh.changed_by_user_id
WHERE rsh.report_id = '<report_id>'
ORDER BY rsh.created_at ASC;
```

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Test 9: Permission & Authorization

**Scenario A: Non-admin User**
1. Logout admin
2. Login sebagai warga biasa
3. Try access `/admin` via URL

**Expected:**
- ✅ Redirect ke `/unauthorized`
- ✅ No server error/crash

**Scenario B: Unauthenticated**
1. Logout completely
2. Try access `/admin/reports/[id]`

**Expected:**
- ✅ Redirect ke `/login`

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

### Test 10: Page Revalidation & Fresh Data

**Steps:**
1. Buka 2 browser tabs dengan laporan yang sama
2. Di Tab 1: Verify report
3. Di Tab 2: Refresh page manually

**Expected:**
- ✅ Tab 2 menampilkan status terbaru
- ✅ No stale cache data
- ✅ Timeline synchronized

**Actual Result:**
- [ ] Pass / [ ] Fail
- Notes: _______________

---

## 📊 Test Summary Template

```
╔══════════════════════════════════════════════════════════╗
║           ADMIN OPERATIONS TEST RESULTS                  ║
╚══════════════════════════════════════════════════════════╝

Date: _________________
Tester: _______________
Branch: feat/admin-dashboard-real-reports-map

┌─────────────────────────────────────────────────────────┐
│ Test Cases                         Pass    Fail    N/A  │
├─────────────────────────────────────────────────────────┤
│ 1. Admin Login & Access            [ ]    [ ]     [ ]  │
│ 2. Verify Report                   [ ]    [ ]     [ ]  │
│ 3. Reject Report                   [ ]    [ ]     [ ]  │
│ 4. Update to Diproses              [ ]    [ ]     [ ]  │
│ 5. Complete Report                 [ ]    [ ]     [ ]  │
│ 6. Invalid State Transitions       [ ]    [ ]     [ ]  │
│ 7. Error Handling                  [ ]    [ ]     [ ]  │
│ 8. Timeline Audit Integrity        [ ]    [ ]     [ ]  │
│ 9. Permission & Authorization      [ ]    [ ]     [ ]  │
│ 10. Page Revalidation              [ ]    [ ]     [ ]  │
└─────────────────────────────────────────────────────────┘

Total: __/10 Pass    __/10 Fail

Overall Status: [ ] READY FOR PRODUCTION
                [ ] NEEDS FIXES
                [ ] BLOCKED

Critical Issues Found:
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

Non-Critical Issues:
1. _______________________________________________
2. _______________________________________________
```

---

## 🚀 Post-Testing Actions

### If All Tests Pass:
1. ✅ Mark Issue #08 backend operations as complete
2. ✅ Update progress: 38% → ~70%
3. ✅ Commit changes with descriptive message
4. ✅ Proceed to optional features (completion evidence upload)

### If Tests Fail:
1. 🐛 Document exact error messages
2. 🐛 Check browser console for client errors
3. 🐛 Check server logs for backend errors
4. 🐛 Fix issues before proceeding

---

## 🔧 Debugging Commands

**Check Admin Role:**
```sql
SELECT u.email, ur.role, p.full_name
FROM auth.users u
LEFT JOIN user_roles ur ON ur.user_id = u.id
LEFT JOIN profiles p ON p.id = u.id
WHERE u.email = 'admin@production.com';
```

**Check Report Status History:**
```sql
SELECT 
  r.ticket_number,
  r.status as current_status,
  rsh.status as history_status,
  rsh.note,
  rsh.created_at,
  p.full_name as changed_by
FROM reports r
LEFT JOIN report_status_history rsh ON rsh.report_id = r.id
LEFT JOIN profiles p ON p.id = rsh.changed_by_user_id
WHERE r.ticket_number = 'PT-XXXXX'
ORDER BY rsh.created_at DESC;
```

**Check RLS Policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'reports';
SELECT * FROM pg_policies WHERE tablename = 'report_status_history';
```

---

## 📞 Support

Jika menemukan bug atau behavior tidak sesuai spesifikasi, catat:
1. Exact steps to reproduce
2. Expected vs actual result
3. Browser console errors
4. Server logs (jika ada akses)
5. Database state before/after action

**Happy Testing! 🧪**
