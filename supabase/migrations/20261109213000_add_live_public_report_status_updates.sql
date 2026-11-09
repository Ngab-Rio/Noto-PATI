create table public.public_report_status_updates (
    id uuid primary key
        references public.report_status_history (id)
        on delete cascade,
    report_id uuid not null
        references public.reports (id)
        on delete cascade,
    status public.report_status not null,
    note text,
    created_at timestamptz not null
);

create index public_report_status_updates_report_id_created_at_idx
    on public.public_report_status_updates (report_id, created_at);

alter table public.public_report_status_updates enable row level security;

create policy "Anyone can read public report status updates"
on public.public_report_status_updates
for select
to anon, authenticated
using (true);

revoke all on table public.public_report_status_updates
from public, anon, authenticated, service_role;

grant select (id, report_id, status, note, created_at)
on table public.public_report_status_updates
to anon, authenticated;

create function private.sync_public_report_status_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.public_report_status_updates (
        id,
        report_id,
        status,
        note,
        created_at
    )
    values (
        new.id,
        new.report_id,
        new.status,
        new.note,
        new.created_at
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

revoke all on function private.sync_public_report_status_update()
from public, anon, authenticated, service_role;

create trigger report_status_history_sync_public_update
after insert on public.report_status_history
for each row
execute function private.sync_public_report_status_update();

insert into public.public_report_status_updates (
    id,
    report_id,
    status,
    note,
    created_at
)
select
    id,
    report_id,
    status,
    note,
    created_at
from public.report_status_history
on conflict (id) do nothing;

do $$
begin
    if not exists (
        select 1
        from pg_publication_tables
        where pubname = 'supabase_realtime'
          and schemaname = 'public'
          and tablename = 'public_report_status_updates'
    ) then
        alter publication supabase_realtime
            add table public.public_report_status_updates;
    end if;
end;
$$;
