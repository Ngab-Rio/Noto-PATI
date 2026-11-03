-- ============================================================================
-- Migration: Ensure Grant Select on reports.merged_into_report_id for Public
-- Version: 20261103141500
-- ============================================================================

grant select (merged_into_report_id)
on table public.reports
to anon, authenticated;

