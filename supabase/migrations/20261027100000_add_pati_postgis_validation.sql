create extension if not exists postgis with schema extensions;

create table public.regions (
    id text primary key,
    name text not null,
    boundary extensions.geometry(MultiPolygon, 4326) not null,
    source text not null,
    source_feature_id text,
    verified_at date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint regions_boundary_valid_check
        check (extensions.ST_IsValid(boundary))
);

create index regions_boundary_gix
    on public.regions using gist (boundary);

alter table public.reports
    add column location extensions.geography(Point, 4326);

create index reports_location_gix
    on public.reports using gist (location);

create or replace function public.is_within_pati(
    p_lng double precision,
    p_lat double precision
)
returns boolean
language sql
stable
set search_path = public, extensions
as $$
    select exists (
        select 1
        from public.regions
        where id = 'pati'
          and extensions.ST_Covers(
              boundary,
              extensions.ST_SetSRID(
                  extensions.ST_MakePoint(p_lng, p_lat),
                  4326
              )
          )
    );
$$;

revoke all on function public.is_within_pati(double precision, double precision)
from public, anon, authenticated;

grant execute on function public.is_within_pati(double precision, double precision)
to anon, authenticated;

create or replace function private.validate_report_location()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
begin
    if new.latitude is null or new.longitude is null then
        raise exception using
            errcode = '22023',
            message = 'Koordinat laporan wajib diisi.';
    end if;

    if not public.is_within_pati(new.longitude, new.latitude) then
        raise exception using
            errcode = '22023',
            message = 'Lokasi laporan berada di luar wilayah Kabupaten Pati.';
    end if;

    new.location := extensions.ST_SetSRID(
        extensions.ST_MakePoint(new.longitude, new.latitude),
        4326
    )::extensions.geography;

    return new;
end;
$$;

revoke all on function private.validate_report_location()
from public, anon, authenticated;

create trigger reports_validate_location
before insert on public.reports
for each row
execute function private.validate_report_location();

create or replace function public.upsert_pati_region(
    p_boundary_geojson jsonb,
    p_source text,
    p_source_feature_id text,
    p_verified_at date
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
    v_boundary extensions.geometry;
begin
    if p_boundary_geojson ->> 'type' <> 'Polygon' then
        raise exception using
            errcode = '22023',
            message = 'Geometry Kabupaten Pati harus berupa Polygon.';
    end if;

    v_boundary := extensions.ST_Multi(
        extensions.ST_SetSRID(
            extensions.ST_GeomFromGeoJSON(p_boundary_geojson::text),
            4326
        )
    );

    if not extensions.ST_IsValid(v_boundary) then
        raise exception using
            errcode = '22023',
            message = 'Geometry Kabupaten Pati tidak valid.';
    end if;

    insert into public.regions (
        id,
        name,
        boundary,
        source,
        source_feature_id,
        verified_at
    )
    values (
        'pati',
        'Kabupaten Pati',
        v_boundary,
        p_source,
        p_source_feature_id,
        p_verified_at
    )
    on conflict (id) do update
    set name = excluded.name,
        boundary = excluded.boundary,
        source = excluded.source,
        source_feature_id = excluded.source_feature_id,
        verified_at = excluded.verified_at,
        updated_at = now();
end;
$$;

revoke all on function public.upsert_pati_region(jsonb, text, text, date)
from public, anon, authenticated;

grant execute on function public.upsert_pati_region(jsonb, text, text, date)
to service_role;

create or replace function private.set_region_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.updated_at := now();
    return new;
end;
$$;

revoke all on function private.set_region_updated_at()
from public, anon, authenticated;

create trigger regions_set_updated_at
before update on public.regions
for each row
execute function private.set_region_updated_at();

alter table public.regions enable row level security;
revoke all on table public.regions from anon, authenticated;
