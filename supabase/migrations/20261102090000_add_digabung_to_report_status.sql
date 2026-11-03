-- ============================================================================
-- Migration: Add 'digabung' to report_status Enum
-- Version: 20261102090000
-- ============================================================================

-- PostgreSQL does not allow using a newly added enum value in the same transaction
-- (e.g. in CHECK constraints or functions). Thus, adding the value is separated
-- into this preceding migration.

alter type public.report_status add value if not exists 'digabung';

