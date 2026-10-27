alter table public.reports
    add column latitude double precision,
    add column longitude double precision,
    add column location_accuracy_m double precision,
    add column location_captured_at timestamptz,
    add constraint reports_latitude_range_check
        check (latitude is null or latitude between -90 and 90),
    add constraint reports_longitude_range_check
        check (longitude is null or longitude between -180 and 180),
    add constraint reports_location_complete_check
        check (
            (latitude is null and longitude is null)
            or (latitude is not null and longitude is not null)
        ),
    add constraint reports_location_accuracy_check
        check (location_accuracy_m is null or location_accuracy_m >= 0);

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
    p_detail_location text,
    p_latitude double precision,
    p_longitude double precision,
    p_location_accuracy_m double precision,
    p_location_captured_at timestamptz
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
        client_request_id,
        latitude,
        longitude,
        location_accuracy_m,
        location_captured_at
    )
    values (
        v_reporter_id,
        p_category,
        p_title,
        p_description,
        p_detail_location,
        p_client_request_id,
        p_latitude,
        p_longitude,
        p_location_accuracy_m,
        p_location_captured_at
    )
    returning reports.id, reports.ticket_number, true;
end;
$$;

revoke all on function public.create_report(
    uuid,
    public.report_category,
    text,
    text,
    text,
    double precision,
    double precision,
    double precision,
    timestamptz
)
from public;

grant execute on function public.create_report(
    uuid,
    public.report_category,
    text,
    text,
    text,
    double precision,
    double precision,
    double precision,
    timestamptz
)
to anon, authenticated;