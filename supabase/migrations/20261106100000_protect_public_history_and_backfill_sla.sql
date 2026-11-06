-- Issue #9 follow-up.
-- Keep admin identities out of the public timeline; `note` is public by design
-- (internal admin notes live in `admin_activity_logs`).
revoke select on table public.report_status_history from anon, authenticated;

grant select (
    id,
    report_id,
    status,
    note,
    proof_image_url,
    created_at
)
on table public.report_status_history
to anon, authenticated;

-- Backfill SLA snapshots for reports verified before the SLA columns existed.
-- Uses real history timestamps, never synthetic ones.
update public.reports r
set verified_at = history.first_verified_at
from (
    select report_id, min(created_at) as first_verified_at
    from public.report_status_history
    where status = 'diverifikasi'
    group by report_id
) history
where r.id = history.report_id
  and r.verified_at is null;

update public.reports r
set handling_due_at = r.verified_at + make_interval(days => policy.handling_days)
from (
    select handling_days
    from public.sla_policies
    where is_active = true
    order by created_at desc
    limit 1
) policy
where r.verified_at is not null
  and r.handling_due_at is null;
