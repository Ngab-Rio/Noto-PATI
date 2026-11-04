# Solution: Migration Conflict & Missing SLA Features

## Problem Summary

**Current Situation:**
- Branch `feat/admin-dashboard-real-reports-map` has admin UI & basic actions
- Branch `feat/report-status-history-sla` has production-ready RPC functions
- 2 migrations from SLA branch NOT in current branch
- Migration history conflict when trying to push

**Impact:**
- Admin actions use direct DB updates (less robust)
- Missing `admin_transition_report()` RPC function
- No DB-level transition validation
- Manual SLA calculation instead of automatic

---

## Solution: Copy Migrations from SLA Branch

### Step 1: Extract Migrations from SLA Branch

```bash
# Navigate to project root
cd d:/programming/Project/Noto-PATI

# Extract first migration
git show feat/report-status-history-sla:supabase/migrations/20261104150000_add_report_sla_and_transitions.sql > supabase/migrations/20261104150000_add_report_sla_and_transitions.sql

# Extract second migration  
git show feat/report-status-history-sla:supabase/migrations/20261104153000_guard_missing_sla_policy.sql > supabase/migrations/20261104153000_guard_missing_sla_policy.sql
```

### Step 2: Run Migrations Manually via Supabase Dashboard

**Why manual?**
- Avoids migration history conflict
- Safer for production database
- Allows review before execution

**Steps:**

1. Open Supabase Dashboard: https://unhvcenpkwmkonmpcsaq.supabase.co/project/unhvcenpkwmkonmpcsaq/editor

2. Open SQL Editor → New Query

3. Copy-paste content of `20261104150000_add_report_sla_and_transitions.sql`

4. Click **Run**

5. Expected Output:
   ```
   ✅ sla_policies table created
   ✅ report_status_transitions table created
   ✅ admin_transition_report() function created
   ✅ Columns added to reports table
   ```

6. Repeat for `20261104153000_guard_missing_sla_policy.sql`

### Step 3: Verify Migration Success

Run this query in SQL Editor:

```sql
-- Check tables exist
SELECT 
  'sla_policies' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'sla_policies'
  ) as exists
UNION ALL
SELECT 
  'report_status_transitions',
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'report_status_transitions'
  )
UNION ALL
SELECT
  'admin_transition_report() function',
  EXISTS (
    SELECT FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'admin_transition_report'
  );

-- Check new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'reports'
AND column_name IN ('verification_due_at', 'handling_due_at', 'verified_at');
```

Expected: All return `true` or show column info.

---

## Step 4: Update Admin Actions to Use RPC

**Current Code (Direct DB):**
```typescript
// src/features/admin/actions.ts (current)
const { error: updateError } = await supabase
  .from("reports")
  .update({ status: newStatus })
  .eq("id", reportId);

const { error: historyError } = await supabase
  .from("report_status_history")
  .insert({ report_id: reportId, status: newStatus, changed_by: adminUser.id });
```

**New Code (Using RPC):**

Create new file: `src/features/admin/actions-v2.ts`

```typescript
"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/guards";
import { revalidatePath } from "next/cache";
import { logAdminActivity } from "./activity-logger";

const transitionSchema = z.object({
  reportId: z.string().uuid(),
  toStatus: z.enum(["diverifikasi", "diproses", "selesai", "ditolak"]),
  note: z.string().max(500).optional(),
  evidencePath: z.string().optional(),
});

export type ActionResult<T = unknown> =
  | { ok: true; data: T; message: string }
  | { ok: false; message: string };

export async function transitionReportV2(
  reportId: string,
  toStatus: "diverifikasi" | "diproses" | "selesai" | "ditolak",
  note?: string,
  evidencePath?: string,
): Promise<ActionResult> {
  try {
    const adminUser = await requireAdmin();
    const validated = transitionSchema.parse({
      reportId,
      toStatus,
      note,
      evidencePath,
    });

    const supabase = await createClient();

    // Use RPC function from SLA migration
    const { data, error } = await supabase.rpc("admin_transition_report", {
      p_report_id: validated.reportId,
      p_to_status: validated.toStatus,
      p_note: validated.note || null,
      p_merged_into_report_id: null,
      p_proof_image_path: validated.evidencePath || null,
    });

    if (error) {
      console.error("RPC error:", error);
      
      // Handle specific error codes
      if (error.message.includes("NOT_AUTHORIZED")) {
        return { ok: false, message: "Anda tidak memiliki izin untuk tindakan ini." };
      }
      if (error.message.includes("REPORT_NOT_FOUND")) {
        return { ok: false, message: "Laporan tidak ditemukan." };
      }
      if (error.message.includes("INVALID_STATUS_TRANSITION")) {
        return {
          ok: false,
          message: `Transisi status tidak diizinkan. Periksa alur status yang valid.`,
        };
      }
      if (error.message.includes("REJECTION_NOTE_REQUIRED")) {
        return {
          ok: false,
          message: "Alasan penolakan wajib diisi untuk transparansi.",
        };
      }
      if (error.message.includes("SLA_POLICY_NOT_CONFIGURED")) {
        return {
          ok: false,
          message: "Kebijakan SLA belum dikonfigurasi. Hubungi administrator sistem.",
        };
      }

      return {
        ok: false,
        message: "Gagal mengubah status. Silakan coba lagi.",
      };
    }

    // Revalidate pages
    revalidatePath("/admin");
    revalidatePath("/admin/reports");
    revalidatePath(`/admin/reports/${validated.reportId}`);

    // Log activity
    logAdminActivity({
      adminUserId: adminUser.id,
      actionType:
        validated.toStatus === "ditolak"
          ? "reject_report"
          : validated.toStatus === "diverifikasi"
            ? "verify_report"
            : "update_status",
      targetReportId: validated.reportId,
      details: {
        toStatus: validated.toStatus,
        note: validated.note,
        evidencePath: validated.evidencePath,
      },
    });

    const statusLabels = {
      diverifikasi: "diverifikasi",
      diproses: "diproses",
      selesai: "selesai",
      ditolak: "ditolak",
    };

    return {
      ok: true,
      data: { reportId: validated.reportId, newStatus: validated.toStatus },
      message: `Laporan berhasil ${statusLabels[validated.toStatus]}.`,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        ok: false,
        message: error.issues[0]?.message || "Data tidak valid",
      };
    }

    console.error("transitionReportV2 error:", error);
    return {
      ok: false,
      message: "Terjadi kesalahan sistem. Silakan coba lagi.",
    };
  }
}
```

### Step 5: Update Client Component

**File:** `src/app/admin/reports/[id]/report-actions-client.tsx`

```typescript
// Change import
import { transitionReportV2 as transitionReport } from "@/features/admin/actions-v2";

// Rest stays the same - API compatible!
```

---

## Benefits of Using RPC

### 1. Atomic Operations
- Status update + history insert in single transaction
- No partial updates if one fails

### 2. Server-Side Validation
- Transition rules enforced at DB level
- Cannot bypass via direct DB access

### 3. SLA Automation
- Auto-calculates `handling_due_at` when verifying
- Sets `verified_at` timestamp
- Updates `verification_due_at` on report creation

### 4. Concurrency Control
- Uses `FOR UPDATE` row locking
- Prevents race conditions
- Safe for multiple admins

### 5. Audit Trail
- Guaranteed consistency
- Transaction rollback if any step fails

---

## Migration Checklist

### ✅ Pre-Migration
- [ ] Backup database (Supabase automatic backups enabled)
- [ ] Review migration SQL files
- [ ] Test in development first (if possible)

### ✅ Migration Steps
- [ ] Extract migrations from SLA branch (git show command)
- [ ] Open Supabase Dashboard SQL Editor
- [ ] Run `20261104150000_add_report_sla_and_transitions.sql`
- [ ] Verify success (check tables/functions exist)
- [ ] Run `20261104153000_guard_missing_sla_policy.sql`
- [ ] Verify success

### ✅ Code Updates
- [ ] Create `actions-v2.ts` with RPC implementation
- [ ] Update `report-actions-client.tsx` import
- [ ] Test verify action
- [ ] Test reject action
- [ ] Test status updates

### ✅ Post-Migration Testing
- [ ] Login as admin
- [ ] Verify report (diterima → diverifikasi)
- [ ] Check `verified_at` populated
- [ ] Check `handling_due_at` calculated (7 days from now)
- [ ] Reject report with reason
- [ ] Update to diproses
- [ ] Complete to selesai
- [ ] Verify timeline shows all changes

---

## Rollback Plan (If Needed)

If migration causes issues:

### Option 1: Keep Current Simple Implementation
- Revert `actions-v2.ts` changes
- Keep using direct DB updates
- Accept limitations (less robust)

### Option 2: Drop Migrations
```sql
-- Drop function
DROP FUNCTION IF EXISTS public.admin_transition_report;

-- Drop tables
DROP TABLE IF EXISTS public.report_status_transitions CASCADE;
DROP TABLE IF EXISTS public.sla_policies CASCADE;

-- Drop columns (optional - may have data)
-- ALTER TABLE public.reports DROP COLUMN IF EXISTS verification_due_at;
-- ALTER TABLE public.reports DROP COLUMN IF EXISTS handling_due_at;
-- ALTER TABLE public.reports DROP COLUMN IF EXISTS verified_at;
```

---

## Alternative: Keep Both Branches Separate

If merging is too risky:

### Scenario A: Ship Current Branch
- ✅ Admin UI works
- ✅ Basic transitions work
- ⚠️ Less robust
- 📝 Document as "v1"

### Scenario B: Merge SLA Branch
- Create new branch: `feat/admin-complete`
- Merge both branches
- Resolve conflicts
- Test thoroughly

### Scenario C: Start Fresh
- Create new branch from `main`
- Cherry-pick admin UI commits
- Cherry-pick SLA commits
- Clean migration history

---

## Decision Matrix

| Approach | Effort | Risk | Robustness | Time |
|----------|--------|------|------------|------|
| Manual SQL (Recommended) | Low | Low | High | 30 min |
| Git merge branches | High | Medium | High | 2-3 hours |
| Keep current simple | None | Low | Medium | 0 min |
| Start fresh branch | Very High | Low | High | 4-6 hours |

**Recommendation:** ✅ Manual SQL migration (Option 1)

---

## Summary

### What To Do
1. Copy 2 SQL files from SLA branch using `git show`
2. Run them manually in Supabase Dashboard
3. Create `actions-v2.ts` with RPC implementation
4. Update import in client component
5. Test end-to-end

### Time Estimate
- Extract migrations: 5 min
- Run SQL: 10 min
- Update code: 15 min
- Testing: 30 min
- **Total: ~1 hour**

### Risk
- ✅ Low risk (manual review before execution)
- ✅ Can rollback easily
- ✅ No migration history conflict

### Outcome
- ✅ Production-ready admin operations
- ✅ Robust concurrency handling
- ✅ Automatic SLA tracking
- ✅ All features working

---

**Last Updated:** 2026-11-04  
**Status:** Ready to Execute
