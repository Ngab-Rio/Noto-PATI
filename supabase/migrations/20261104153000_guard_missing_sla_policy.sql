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

    select * into v_report from public.reports where id = p_report_id for update;
    if not found then
        raise exception 'REPORT_NOT_FOUND';
    end if;

    if not exists (
        select 1 from public.report_status_transitions
        where from_status = v_report.status and to_status = p_to_status
    ) then
        raise exception 'INVALID_STATUS_TRANSITION';
    end if;

    if p_to_status = 'ditolak'
       and nullif(btrim(coalesce(p_note, '')), '') is null then
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
