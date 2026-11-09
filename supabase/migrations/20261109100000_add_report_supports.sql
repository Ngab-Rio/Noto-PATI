create table public.report_supports (
    report_id uuid not null
        references public.reports (id)
        on delete cascade,
    user_id uuid not null
        references auth.users (id)
        on delete cascade,
    created_at timestamptz not null default now(),
    primary key (report_id, user_id)
);

create index report_supports_user_id_created_at_idx
    on public.report_supports (user_id, created_at desc);

alter table public.report_supports enable row level security;

revoke all on table public.report_supports
from public, anon, authenticated, service_role;

create function public.get_report_support_summaries(p_report_ids uuid[])
returns table (
    report_id uuid,
    support_count bigint,
    has_supported boolean,
    is_owner boolean,
    can_support boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
    if coalesce(cardinality(p_report_ids), 0) > 500 then
        raise exception 'TOO_MANY_REPORTS';
    end if;

    return query
    with requested_reports as (
        select distinct requested.id
        from unnest(coalesce(p_report_ids, array[]::uuid[])) as requested(id)
    )
    select
        reports.id,
        count(report_supports.user_id),
        coalesce(bool_or(report_supports.user_id = (select auth.uid())), false),
        coalesce(reports.reporter_id = (select auth.uid()), false),
        (select auth.uid()) is not null
            and reports.reporter_id <> (select auth.uid())
            and exists (
                select 1
                from public.user_roles
                where user_roles.user_id = (select auth.uid())
                  and user_roles.role = 'warga'::public.app_role
            )
    from requested_reports
    join public.reports on reports.id = requested_reports.id
    left join public.report_supports
        on report_supports.report_id = reports.id
    group by reports.id, reports.reporter_id;
end;
$$;

revoke all on function public.get_report_support_summaries(uuid[])
from public, anon, authenticated, service_role;

grant execute on function public.get_report_support_summaries(uuid[])
to anon, authenticated, service_role;

create function public.support_report(p_report_id uuid)
returns table (
    support_count bigint,
    has_supported boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := (select auth.uid());
    v_reporter_id uuid;
    v_merged_into_report_id uuid;
begin
    if v_user_id is null then
        raise exception 'AUTHENTICATION_REQUIRED';
    end if;

    if not exists (
        select 1
        from public.user_roles
        where user_roles.user_id = v_user_id
          and user_roles.role = 'warga'::public.app_role
    ) then
        raise exception 'CITIZEN_ONLY';
    end if;

    select reports.reporter_id, reports.merged_into_report_id
    into v_reporter_id, v_merged_into_report_id
    from public.reports
    where reports.id = p_report_id;

    if not found then
        raise exception 'REPORT_NOT_FOUND';
    end if;

    if v_merged_into_report_id is not null then
        raise exception 'REPORT_NOT_SUPPORTABLE';
    end if;

    if v_reporter_id = v_user_id then
        raise exception 'OWN_REPORT_NOT_SUPPORTABLE';
    end if;

    insert into public.report_supports (report_id, user_id)
    values (p_report_id, v_user_id)
    on conflict (report_id, user_id) do nothing;

    return query
    select
        count(report_supports.user_id),
        coalesce(bool_or(report_supports.user_id = v_user_id), false)
    from public.report_supports
    where report_supports.report_id = p_report_id;
end;
$$;

revoke all on function public.support_report(uuid)
from public, anon, authenticated, service_role;

grant execute on function public.support_report(uuid)
to authenticated;
