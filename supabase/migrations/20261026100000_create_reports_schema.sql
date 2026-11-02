-- Report domain enums.
create type public.report_status as enum (
    'diterima',
    'diverifikasi',
    'diproses',
    'selesai',
    'ditolak'
);

create type public.report_category as enum (
    'jalan',
    'lampu',
    'drainase',
    'jembatan',
    'tanggul',
    'trotoar',
    'rambu',
    'lainnya'
);

create sequence public.report_ticket_number_seq;


-- Reports submitted by authenticated citizens.
create table public.reports (
    id uuid primary key default gen_random_uuid(),
    ticket_number text not null unique default (
        'NP-' || to_char(now(), 'YYYY') || '-' ||
        lpad(nextval('public.report_ticket_number_seq')::text, 6, '0')
    ),
    reporter_id uuid not null
        references auth.users (id)
        on delete restrict,
    category public.report_category not null,
    title text not null
        check (char_length(btrim(title)) between 10 and 100),
    description text not null
        check (char_length(btrim(description)) between 20 and 1000),
    detail_location text not null
        check (char_length(btrim(detail_location)) between 20 and 500),
    status public.report_status not null default 'diterima',
    client_request_id uuid not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (reporter_id, client_request_id)
);


-- Photo metadata; the binary objects live in a private Storage bucket.
create table public.report_photos (
    id uuid primary key default gen_random_uuid(),
    report_id uuid not null
        references public.reports (id)
        on delete cascade,
    storage_path text not null unique,
    mime_type text not null
        check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
    file_size_bytes integer not null
        check (file_size_bytes between 1 and 5242880),
    sort_order smallint not null
        check (sort_order between 0 and 2),
    created_at timestamptz not null default now(),
    unique (report_id, sort_order)
);

create table public.report_status_history (
    id uuid primary key default gen_random_uuid(),
    report_id uuid not null
        references public.reports (id)
        on delete cascade,
    status public.report_status not null,
    changed_by uuid
        references auth.users (id)
        on delete set null,
    note text,
    created_at timestamptz not null default now()
);

create index reports_reporter_id_created_at_idx
    on public.reports (reporter_id, created_at desc);

create index report_photos_report_id_idx
    on public.report_photos (report_id);

create index report_status_history_report_id_created_at_idx
    on public.report_status_history (report_id, created_at desc);


-- Keep updated_at server-controlled.
create trigger reports_set_updated_at
before update on public.reports
for each row
execute function private.set_updated_at();


-- Record the initial status in the same transaction as report creation.
create function private.create_initial_report_status_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    insert into public.report_status_history (report_id, status, changed_by)
    values (new.id, new.status, new.reporter_id);
    return new;
end;
$$;

revoke all on function private.create_initial_report_status_history()
from public, anon, authenticated;

create trigger reports_create_initial_status_history
after insert on public.reports
for each row
execute function private.create_initial_report_status_history();


-- Citizens can create and read only their own report data.
alter table public.reports enable row level security;
alter table public.report_photos enable row level security;
alter table public.report_status_history enable row level security;

create policy "Users can read own reports"
on public.reports
for select
to authenticated
using ((select auth.uid()) = reporter_id);

create policy "Users can create own reports"
on public.reports
for insert
to authenticated
with check ((select auth.uid()) = reporter_id);

create policy "Users can read photos from own reports"
on public.report_photos
for select
to authenticated
using (
    exists (
        select 1
        from public.reports
        where reports.id = report_photos.report_id
          and reports.reporter_id = (select auth.uid())
    )
);

create policy "Users can read history from own reports"
on public.report_status_history
for select
to authenticated
using (
    exists (
        select 1
        from public.reports
        where reports.id = report_status_history.report_id
          and reports.reporter_id = (select auth.uid())
    )
);

revoke all on table public.reports, public.report_photos, public.report_status_history
from anon, authenticated;

grant select on table public.reports to authenticated;
grant insert (
    reporter_id,
    category,
    title,
    description,
    detail_location,
    client_request_id
)
on table public.reports
to authenticated;
grant select on table public.report_photos, public.report_status_history to authenticated;