create table if not exists public.sla_policies (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    verification_hours integer not null check (verification_hours > 0),
    handling_days integer not null check (handling_days > 0),
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

insert into public.sla_policies (name, verification_hours, handling_days)
values ('prototipe-demo', 24, 7)
on conflict (name) do update
set verification_hours = excluded.verification_hours,
    handling_days = excluded.handling_days;

alter table public.reports
    add column if not exists verification_due_at timestamptz,
    add column if not exists handling_due_at timestamptz,
    add column if not exists verified_at timestamptz;

update public.reports r
set verification_due_at = r.created_at + make_interval(hours => p.verification_hours)
from public.sla_policies p
where p.name = 'prototipe-demo'
  and r.verification_due_at is null;

alter table public.sla_policies enable row level security;
drop policy if exists "Anyone can read active SLA policy" on public.sla_policies;
create policy "Anyone can read active SLA policy"
on public.sla_policies for select
to anon, authenticated
using (is_active = true);

revoke all on table public.sla_policies from anon, authenticated;
grant select (id, name, verification_hours, handling_days, is_active)
on table public.sla_policies to anon, authenticated;

create table if not exists public.report_status_transitions (
    from_status public.report_status not null,
    to_status public.report_status not null,
    primary key (from_status, to_status)
);

insert into public.report_status_transitions (from_status, to_status)
values
    ('diterima', 'diverifikasi'),
    ('diterima', 'ditolak'),
    ('diterima', 'digabung'),
    ('diverifikasi', 'diproses'),
    ('diverifikasi', 'ditolak'),
    ('diverifikasi', 'digabung'),
    ('diproses', 'selesai'),
    ('diproses', 'ditolak'),
    ('diproses', 'digabung')
on conflict do nothing;

alter table public.report_status_transitions enable row level security;
drop policy if exists "Anyone can read report status transitions" on public.report_status_transitions;
create policy "Anyone can read report status transitions"
on public.report_status_transitions for select
to anon, authenticated
using (true);

revoke all on table public.report_status_transitions from anon, authenticated;
grant select on table public.report_status_transitions to anon, authenticated;

create or replace function public.admin_transition_report(
    p_report_id uuid,
    p_to_status public.report_status,
    p_note text default null,
    p_merged_into_report_id uuid default null
)
returns table (
    report_id uuid,
    status public.report_status,
    changed_at timestamptz,
    verification_due_at timestamptz,
    handling_due_at timestamptz
)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
    v_user_id uuid := auth.uid();
    v_report public.reports%rowtype;
    v_policy public.sla_policies%rowtype;
    v_now timestamptz := now();
begin
    if v_user_id is null or not exists (
        select 1 from public.user_roles
        where user_id = v_user_id and role = 'admin'
    ) then
        raise exception 'NOT_AUTHORIZED';
    end if;

    select * into v_report
    from public.reports
    where id = p_report_id
    for update;

    if not found then
        raise exception 'REPORT_NOT_FOUND';
    end if;

    if not exists (
        select 1 from public.report_status_transitions
        where from_status = v_report.status and to_status = p_to_status
    ) then
        raise exception 'INVALID_STATUS_TRANSITION';
    end if;

    if p_to_status = 'ditolak' and nullif(btrim(coalesce(p_note, '')), '') is null then
        raise exception 'REJECTION_NOTE_REQUIRED';
    end if;

    if p_to_status = 'digabung' then
        if p_merged_into_report_id is null or p_merged_into_report_id = p_report_id then
            raise exception 'MERGE_PARENT_REQUIRED';
        end if;
        if not exists (
            select 1 from public.reports
            where id = p_merged_into_report_id
              and status <> 'digabung'
              and merged_into_report_id is null
        ) then
            raise exception 'MERGE_PARENT_INVALID';
        end if;
    end if;

    select * into v_policy
    from public.sla_policies
    where is_active = true
    order by created_at desc
    limit 1;

    if not found then
        raise exception 'SLA_POLICY_NOT_CONFIGURED';
    end if;

    update public.reports
    set status = p_to_status,
        merged_into_report_id = case
            when p_to_status = 'digabung' then p_merged_into_report_id
            else v_report.merged_into_report_id
        end,
        verified_at = case
            when p_to_status = 'diverifikasi' then v_now
            else v_report.verified_at
        end,
        handling_due_at = case
            when p_to_status = 'diverifikasi'
                then v_now + make_interval(days => v_policy.handling_days)
            else v_report.handling_due_at
        end,
        updated_at = v_now
    where id = p_report_id;

    insert into public.report_status_history (report_id, status, changed_by, note, created_at)
    values (p_report_id, p_to_status, v_user_id, nullif(btrim(p_note), ''), v_now);

    return query
    select r.id, r.status, v_now, r.verification_due_at, r.handling_due_at
    from public.reports r
    where r.id = p_report_id;
end;
$$;

revoke all on function public.admin_transition_report(uuid, public.report_status, text, uuid)
from public, anon, authenticated;
grant execute on function public.admin_transition_report(uuid, public.report_status, text, uuid)
to authenticated;

create or replace function private.set_report_verification_due_at()
returns trigger
language plpgsql
set search_path = public
as $$
declare
    v_hours integer;
begin
    select verification_hours into v_hours
    from public.sla_policies
    where is_active = true
    order by created_at desc
    limit 1;
    new.verification_due_at := coalesce(
        new.verification_due_at,
        new.created_at + make_interval(hours => coalesce(v_hours, 24))
    );
    return new;
end;
$$;

drop trigger if exists reports_set_verification_due_at on public.reports;
create trigger reports_set_verification_due_at
before insert on public.reports
for each row execute function private.set_report_verification_due_at();

grant select (verification_due_at, handling_due_at, verified_at)
on table public.reports to anon, authenticated;
