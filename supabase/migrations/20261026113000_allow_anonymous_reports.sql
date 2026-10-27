-- Reports may be submitted without an account. A signed-in reporter is still
-- linked to auth.users when a session is available.
alter table public.reports
    alter column reporter_id drop not null;

alter table public.reports
    drop constraint reports_reporter_id_client_request_id_key;

alter table public.reports
    add constraint reports_client_request_id_key unique (client_request_id);

drop policy if exists "Users can create own reports"
on public.reports;

create policy "Authenticated users can create own reports"
on public.reports
for insert
to authenticated
with check ((select auth.uid()) = reporter_id);

create policy "Anonymous users can create reports"
on public.reports
for insert
to anon
with check (reporter_id is null);

create or replace function public.create_report(
    p_client_request_id uuid,
    p_category public.report_category,
    p_title text,
    p_description text,
    p_detail_location text
)
returns table (id uuid, ticket_number text)
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_reporter_id uuid := auth.uid();
begin
    return query
    select reports.id, reports.ticket_number
    from public.reports
    where reports.client_request_id = p_client_request_id;

    if found then
        return;
    end if;

    return query
    insert into public.reports (
        reporter_id,
        category,
        title,
        description,
        detail_location,
        client_request_id
    )
    values (
        v_reporter_id,
        p_category,
        p_title,
        p_description,
        p_detail_location,
        p_client_request_id
    )
    returning reports.id, reports.ticket_number;
end;
$$;

revoke all on function public.create_report(
    uuid,
    public.report_category,
    text,
    text,
    text
)
from public;

grant execute on function public.create_report(
    uuid,
    public.report_category,
    text,
    text,
    text
)
to anon, authenticated;

revoke insert on table public.reports from anon, authenticated;