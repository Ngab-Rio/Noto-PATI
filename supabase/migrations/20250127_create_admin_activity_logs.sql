-- ============================================================================
-- Admin Activity Logs Table
-- ============================================================================
-- Issue: #08 - Admin Dashboard (Enhanced Audit Trail)
-- Purpose: Internal audit log for all admin actions (separate from public timeline)
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Create Table
-- ─────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Admin who performed the action
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action type (verify, reject, update, etc.)
  action_type TEXT NOT NULL CHECK (action_type IN (
    'verify_report',
    'reject_report',
    'update_status',
    'upload_evidence',
    'delete_evidence',
    'merge_reports',
    'assign_dinas',
    'update_sla'
  )),
  
  -- Target report being acted upon
  target_report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  
  -- Action details (JSON for flexibility)
  -- Example: {"old_status": "diterima", "new_status": "diverifikasi", "reason": "..."}
  details JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata for security audit
  ip_address TEXT,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Indexes for Performance
-- ─────────────────────────────────────────────────────────────────────────

-- Index for filtering by admin user
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_user
ON public.admin_activity_logs (admin_user_id, created_at DESC);

-- Index for filtering by report
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_target_report
ON public.admin_activity_logs (target_report_id, created_at DESC);

-- Index for filtering by action type
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_action_type
ON public.admin_activity_logs (action_type, created_at DESC);

-- Index for time-based queries
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at
ON public.admin_activity_logs (created_at DESC);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. RLS Policies
-- ─────────────────────────────────────────────────────────────────────────

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view activity logs
CREATE POLICY "Only admins can view activity logs"
ON public.admin_activity_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Only admins can insert activity logs (via service role in Server Actions)
CREATE POLICY "System can insert activity logs"
ON public.admin_activity_logs FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- No UPDATE or DELETE policies - logs are immutable for audit integrity

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Comments for Documentation
-- ─────────────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.admin_activity_logs IS
'Internal audit log for admin actions. NOT visible to public (unlike report_status_history)';

COMMENT ON COLUMN public.admin_activity_logs.admin_user_id IS
'UUID of admin who performed the action';

COMMENT ON COLUMN public.admin_activity_logs.action_type IS
'Type of action performed (verify, reject, update, etc.)';

COMMENT ON COLUMN public.admin_activity_logs.target_report_id IS
'UUID of the report being acted upon';

COMMENT ON COLUMN public.admin_activity_logs.details IS
'JSON object with action-specific details (old/new values, reasons, etc.)';

COMMENT ON COLUMN public.admin_activity_logs.ip_address IS
'IP address of admin (for security audit)';

COMMENT ON COLUMN public.admin_activity_logs.user_agent IS
'Browser user agent (for security audit)';

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Helper View: Admin Activity with Profile Info
-- ─────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.admin_activity_logs_with_profile AS
SELECT
  aal.id,
  aal.action_type,
  aal.target_report_id,
  aal.details,
  aal.created_at,
  
  -- Admin profile info
  p.full_name as admin_name,
  p.email as admin_email,
  
  -- Report info
  r.ticket_number,
  r.title as report_title,
  r.status as current_report_status
  
FROM public.admin_activity_logs aal
LEFT JOIN public.profiles p ON p.id = aal.admin_user_id
LEFT JOIN public.reports r ON r.id = aal.target_report_id
ORDER BY aal.created_at DESC;

-- Grant SELECT on view to authenticated users with admin role
GRANT SELECT ON public.admin_activity_logs_with_profile TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Verification Query
-- ─────────────────────────────────────────────────────────────────────────

SELECT 
  '✅ admin_activity_logs table created' as status,
  COUNT(*) as total_logs
FROM public.admin_activity_logs;

SELECT 
  '✅ RLS policies created' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'admin_activity_logs';
