-- ============================================================================
-- Create Storage Bucket for Completion Evidence Photos
-- ============================================================================
-- Issue: #08 - Admin Dashboard (FR-11: Bukti Penyelesaian)
-- Purpose: Store completion photos uploaded by admin when marking as "selesai"
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Create Storage Bucket
-- ─────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'completion-evidence',
  'completion-evidence',
  true,  -- Public bucket untuk display di UI
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. Storage RLS Policies
-- ─────────────────────────────────────────────────────────────────────────

-- Policy: Authenticated users can view completion evidence
CREATE POLICY "Authenticated users can view completion evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'completion-evidence');

-- Policy: Only admins can upload completion evidence
CREATE POLICY "Only admins can upload completion evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'completion-evidence'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Policy: Only admins can update/delete their uploads
CREATE POLICY "Only admins can delete completion evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'completion-evidence'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Add proof_image_url column to report_status_history (if not exists)
-- ─────────────────────────────────────────────────────────────────────────

-- This column stores the public URL of completion photo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'report_status_history'
    AND column_name = 'proof_image_url'
  ) THEN
    ALTER TABLE public.report_status_history
    ADD COLUMN proof_image_url TEXT;

    COMMENT ON COLUMN public.report_status_history.proof_image_url IS
    'Public URL of completion evidence photo (for status=selesai)';
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. Create Index for Performance
-- ─────────────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_report_status_history_proof_image
ON public.report_status_history (report_id, proof_image_url)
WHERE proof_image_url IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────
-- Verification Query
-- ─────────────────────────────────────────────────────────────────────────

SELECT 
  '✅ Storage bucket created' as status,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'completion-evidence';

SELECT 
  '✅ Storage policies created' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%completion evidence%';
