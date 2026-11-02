create table private.reverse_geocode_cache (
    coordinate_hash text primary key
        check (coordinate_hash ~ '^[0-9a-f]{64}$'),
    display_name text not null
        check (length(display_name) between 1 and 500),
    cached_at timestamptz not null default now()
);

alter table private.reverse_geocode_cache enable row level security;
revoke all on table private.reverse_geocode_cache
from public, anon, authenticated;

create table private.reverse_geocode_state (
    singleton boolean primary key default true
        check (singleton),
    last_requested_at timestamptz not null default '-infinity'
);

insert into private.reverse_geocode_state (singleton)
values (true);

alter table private.reverse_geocode_state enable row level security;
revoke all on table private.reverse_geocode_state
from public, anon, authenticated;

create function public.claim_reverse_geocode(p_coordinate_hash text)
returns table (cached_address text, allowed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_cached_address text;
    v_last_requested_at timestamptz;
begin
    if p_coordinate_hash !~ '^[0-9a-f]{64}$' then
        raise exception using
            errcode = '22023',
            message = 'Invalid reverse geocoding request.';
    end if;

    select display_name
    into v_cached_address
    from private.reverse_geocode_cache
    where coordinate_hash = p_coordinate_hash
      and cached_at > now() - interval '30 days';

    if v_cached_address is not null then
        return query select v_cached_address, true;
        return;
    end if;

    select last_requested_at
    into v_last_requested_at
    from private.reverse_geocode_state
    where singleton = true
    for update;

    if v_last_requested_at > now() - interval '1 second' then
        return query select null::text, false;
        return;
    end if;

    update private.reverse_geocode_state
    set last_requested_at = now()
    where singleton = true;

    return query select null::text, true;
end;
$$;

revoke all on function public.claim_reverse_geocode(text)
from public, anon, authenticated;
grant execute on function public.claim_reverse_geocode(text)
to service_role;

create function public.store_reverse_geocode_cache(
    p_coordinate_hash text,
    p_display_name text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
    if p_coordinate_hash !~ '^[0-9a-f]{64}$'
       or length(btrim(p_display_name)) not between 1 and 500 then
        raise exception using
            errcode = '22023',
            message = 'Invalid reverse geocoding result.';
    end if;

    insert into private.reverse_geocode_cache (
        coordinate_hash,
        display_name,
        cached_at
    )
    values (
        p_coordinate_hash,
        btrim(p_display_name),
        now()
    )
    on conflict (coordinate_hash)
    do update set
        display_name = excluded.display_name,
        cached_at = excluded.cached_at;
end;
$$;

revoke all on function public.store_reverse_geocode_cache(text, text)
from public, anon, authenticated;
grant execute on function public.store_reverse_geocode_cache(text, text)
to service_role;
