-- ============================================================================
-- Migration: Add Duplicate Report Detection and Merge Schema
-- Version: 20261102100000
-- ============================================================================

-- 1. Add merged_into_report_id column to public.reports
alter table public.reports
    add column if not exists merged_into_report_id uuid
        references public.reports (id)
        on delete set null;

-- Grant column select on newly added merged_into_report_id to public/anon
grant select (merged_into_report_id)
on table public.reports
to anon, authenticated;

-- 3. Integrity Constraints on public.reports
-- Prevent a report from merging into itself
alter table public.reports
    drop constraint if exists reports_cannot_merge_into_self_check;

alter table public.reports
    add constraint reports_cannot_merge_into_self_check
        check (merged_into_report_id is null or merged_into_report_id <> id);

-- Ensure that if a report is marked 'digabung', it must have a parent reference
alter table public.reports
    drop constraint if exists reports_digabung_must_have_parent_check;

alter table public.reports
    add constraint reports_digabung_must_have_parent_check
        check (status <> 'digabung' or merged_into_report_id is not null);

-- 4. Indexes for Merge Lookups and Duplicate Candidate Searching
create index if not exists reports_merged_into_report_id_idx
    on public.reports (merged_into_report_id)
    where merged_into_report_id is not null;

-- Partial index for active candidate parent reports
create index if not exists reports_active_merge_candidates_idx
    on public.reports (category, status, created_at)
    where merged_into_report_id is null
      and status in ('diterima', 'diverifikasi', 'diproses');

-- 5. Create report_merge_logs table (Append-only audit trail)
create table if not exists public.report_merge_logs (
    id uuid primary key default gen_random_uuid(),
    parent_report_id uuid not null
        references public.reports (id)
        on delete cascade,
    duplicate_report_id uuid not null
        references public.reports (id)
        on delete cascade,
    distance_meters double precision not null,
    time_diff_seconds integer not null,
    rule_version text not null default 'v1.0',
    decision text not null default 'merged',
    parameters jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now()
);

-- Indexes for audit trail lookups
create index if not exists report_merge_logs_parent_idx
    on public.report_merge_logs (parent_report_id);

create index if not exists report_merge_logs_duplicate_idx
    on public.report_merge_logs (duplicate_report_id);

create index if not exists report_merge_logs_created_at_idx
    on public.report_merge_logs (created_at desc);

-- 6. Row Level Security for report_merge_logs
alter table public.report_merge_logs enable row level security;

-- Public can view merge logs for governance transparency
drop policy if exists report_merge_logs_select_policy on public.report_merge_logs;
create policy report_merge_logs_select_policy
    on public.report_merge_logs
    for select
    to anon, authenticated
    using (true);

-- Only trusted server process (service_role) can insert merge logs
drop policy if exists report_merge_logs_insert_policy on public.report_merge_logs;
create policy report_merge_logs_insert_policy
    on public.report_merge_logs
    for insert
    to service_role
    with check (true);

-- 7. Stored Procedure: detect_and_merge_duplicate_report
-- Atomically checks for duplicate candidate and merges if eligible.
-- Parameters:
--   p_report_id: UUID of newly submitted report
--   p_max_distance_m: Max radius in meters (default 50)
--   p_max_time_diff_hours: Max time window in hours (default 6)
--   p_rule_version: Version identifier for rule set (default 'v1.0')
create or replace function public.detect_and_merge_duplicate_report(
    p_report_id uuid,
    p_max_distance_m double precision default 50.0,
    p_max_time_diff_hours double precision default 6.0,
    p_rule_version text default 'v1.0'
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
    v_new_report record;
    v_parent record;
    v_distance double precision;
    v_time_diff integer;
    v_max_seconds integer;
begin
    -- 1. Fetch newly submitted report
    select
        id,
        ticket_number,
        category,
        status,
        created_at,
        location,
        latitude,
        longitude,
        location_accuracy_m,
        merged_into_report_id
    into v_new_report
    from public.reports
    where id = p_report_id
    for update;

    if not found then
        return jsonb_build_object(
            'success', false,
            'reason', 'REPORT_NOT_FOUND'
        );
    end if;

    -- Skip if report is already merged or terminal
    if v_new_report.merged_into_report_id is not null or v_new_report.status not in ('diterima', 'diverifikasi', 'diproses') then
        return jsonb_build_object(
            'success', false,
            'is_duplicate', false,
            'reason', 'ALREADY_MERGED_OR_TERMINAL'
        );
    end if;

    -- Skip if location is unavailable or GPS accuracy is too low (> 100m)
    if v_new_report.location is null or (v_new_report.location_accuracy_m is not null and v_new_report.location_accuracy_m > 100.0) then
        return jsonb_build_object(
            'success', true,
            'is_duplicate', false,
            'reason', 'INVALID_OR_LOW_ACCURACY_LOCATION'
        );
    end if;

    v_max_seconds := round(p_max_time_diff_hours * 3600);

    -- 2. Search for existing active parent report candidate:
    --    - Same category
    --    - Active status ('diterima', 'diverifikasi', 'diproses')
    --    - Not already merged (merged_into_report_id IS NULL)
    --    - Within p_max_distance_m using PostGIS ST_DWithin
    --    - Within time window (<= p_max_time_diff_hours)
    --    - Pick the OLDEST report (ORDER BY created_at ASC)
    select
        r.id,
        r.ticket_number,
        r.created_at,
        extensions.ST_Distance(r.location, v_new_report.location) as distance_m,
        abs(extract(epoch from (v_new_report.created_at - r.created_at)))::integer as time_diff_s
    into v_parent
    from public.reports r
    where r.id <> v_new_report.id
      and r.category = v_new_report.category
      and r.status in ('diterima', 'diverifikasi', 'diproses')
      and r.merged_into_report_id is null
      and r.location is not null
      and extensions.ST_DWithin(r.location, v_new_report.location, p_max_distance_m)
      and abs(extract(epoch from (v_new_report.created_at - r.created_at))) <= v_max_seconds
    order by r.created_at asc
    limit 1
    for update;

    -- 3. If no candidate found, report remains independent
    if not found then
        return jsonb_build_object(
            'success', true,
            'is_duplicate', false,
            'report_id', v_new_report.id,
            'ticket_number', v_new_report.ticket_number
        );
    end if;

    -- 4. Candidate found -> execute merge
    v_distance := v_parent.distance_m;
    v_time_diff := v_parent.time_diff_s;

    -- Update duplicate report status and parent pointer
    update public.reports
    set
        status = 'digabung',
        merged_into_report_id = v_parent.id,
        updated_at = now()
    where id = v_new_report.id;

    -- Insert status history entry
    insert into public.report_status_history (
        report_id,
        status,
        note,
        actor_id,
        created_at
    ) values (
        v_new_report.id,
        'digabung',
        'Laporan digabung otomatis ke laporan utama ' || v_parent.ticket_number || ' (jarak ' || round(v_distance::numeric, 1) || 'm).',
        null, -- system automated actor
        now()
    );

    -- Insert merge audit log
    insert into public.report_merge_logs (
        parent_report_id,
        duplicate_report_id,
        distance_meters,
        time_diff_seconds,
        rule_version,
        decision,
        parameters
    ) values (
        v_parent.id,
        v_new_report.id,
        round(v_distance::numeric, 2),
        v_time_diff,
        p_rule_version,
        'merged',
        jsonb_build_object(
            'max_distance_m', p_max_distance_m,
            'max_time_diff_hours', p_max_time_diff_hours,
            'parent_ticket_number', v_parent.ticket_number,
            'duplicate_ticket_number', v_new_report.ticket_number
        )
    );

    return jsonb_build_object(
        'success', true,
        'is_duplicate', true,
        'duplicate_report_id', v_new_report.id,
        'duplicate_ticket_number', v_new_report.ticket_number,
        'parent_report_id', v_parent.id,
        'parent_ticket_number', v_parent.ticket_number,
        'distance_meters', round(v_distance::numeric, 2),
        'time_diff_seconds', v_time_diff
    );
end;
$$;

-- Restrict execution to service_role and authenticated/postgres
revoke all on function public.detect_and_merge_duplicate_report(uuid, double precision, double precision, text)
from public, anon;

grant execute on function public.detect_and_merge_duplicate_report(uuid, double precision, double precision, text)
to service_role;
