insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'report-photos',
    'report-photos',
    false,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop function public.create_report(
    uuid,
    public.report_category,
    text,
    text,
    text
);

create function public.create_report(
    p_client_request_id uuid,
    p_category public.report_category,
    p_title text,
    p_description text,
    p_detail_location text
)
returns table (id uuid, ticket_number text, created boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_reporter_id uuid := auth.uid();
begin
    return query
    select reports.id, reports.ticket_number, false
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
    returning reports.id, reports.ticket_number, true;
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