-- ============================================================================
-- APBD Budget Snapshot Schema
-- ============================================================================
-- Stores DJPK APBD snapshots per region, budget year, and reporting period.
--
-- Identity:
--   * one report per (budget_year, period_month, provinsi_code, pemda_code)
--   * one account row per (report_id, row_index)
--
-- DJPK's export provides no account code or explicit hierarchy, so row_index
-- (the source row position) is the only stable line identity available.
-- ============================================================================


-- ─────────────────────────────────────────────────────────────────────────
-- 1. Tables
-- ─────────────────────────────────────────────────────────────────────────

create table public.apbd_reports (
    id uuid primary key default gen_random_uuid(),
    budget_year smallint not null check (budget_year between 2000 and 2100),
    period_month smallint not null check (period_month between 1 and 12),
    period_name text not null check (btrim(period_name) <> ''),

    provinsi_code text not null check (btrim(provinsi_code) <> ''),
    provinsi_name text not null check (btrim(provinsi_name) <> ''),
    pemda_code text not null check (btrim(pemda_code) <> ''),
    pemda_name text not null check (btrim(pemda_name) <> ''),

    source_url text not null,
    download_url text not null,
    fetched_at timestamptz not null,
    http_status smallint not null check (http_status between 200 and 299),
    keterangan_portal text,
    data_hash text not null check (data_hash ~ '^[a-f0-9]{64}$'),
    raw_row_count integer not null check (raw_row_count >= 0),

    total_pendapatan_anggaran numeric(20, 2),
    total_pendapatan_realisasi numeric(20, 2),
    total_belanja_anggaran numeric(20, 2),
    total_belanja_realisasi numeric(20, 2),
    total_pembiayaan_anggaran numeric(20, 2),
    total_pembiayaan_realisasi numeric(20, 2),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (budget_year, period_month, provinsi_code, pemda_code)
);

create table public.apbd_accounts (
    id bigint generated always as identity primary key,
    report_id uuid not null
        references public.apbd_reports (id)
        on delete cascade,
    row_index integer not null check (row_index >= 0),
    akun text not null check (btrim(akun) <> ''),
    anggaran numeric(20, 2) not null check (anggaran >= 0),
    realisasi numeric(20, 2) not null check (realisasi >= 0),
    persentase numeric(10, 2) not null,
    -- Only the three top-level totals recognized by the scraper are marked;
    -- consumers must use apbd_reports totals instead of summing account rows.
    is_total_row boolean not null default false,
    -- Verbatim source row, so attributes added by DJPK later are not lost.
    raw_row jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    unique (report_id, row_index)
);

create index apbd_reports_period_idx
    on public.apbd_reports (budget_year desc, period_month desc);

create index apbd_accounts_report_akun_idx
    on public.apbd_accounts (report_id, akun);

create trigger apbd_reports_set_updated_at
before update on public.apbd_reports
for each row
execute function private.set_updated_at();

create trigger apbd_accounts_set_updated_at
before update on public.apbd_accounts
for each row
execute function private.set_updated_at();


-- ─────────────────────────────────────────────────────────────────────────
-- 2. Atomic import
-- ─────────────────────────────────────────────────────────────────────────

-- Writes one snapshot in a single transaction. Re-importing the same period
-- updates matching rows; rows that disappeared from the source are removed.
-- Other periods are never touched.
create function public.import_apbd_snapshot(
    p_report jsonb,
    p_accounts jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_report_id uuid;
    v_account_count integer;
    v_stale_deleted integer;
begin
    if p_report is null or jsonb_typeof(p_report) <> 'object' then
        raise exception 'p_report harus berupa objek JSON';
    end if;

    if p_accounts is null or jsonb_typeof(p_accounts) <> 'array' then
        raise exception 'p_accounts harus berupa array JSON';
    end if;

    if jsonb_array_length(p_accounts) = 0 then
        raise exception 'p_accounts tidak boleh kosong';
    end if;

    insert into public.apbd_reports (
        budget_year,
        period_month,
        period_name,
        provinsi_code,
        provinsi_name,
        pemda_code,
        pemda_name,
        source_url,
        download_url,
        fetched_at,
        http_status,
        keterangan_portal,
        data_hash,
        raw_row_count,
        total_pendapatan_anggaran,
        total_pendapatan_realisasi,
        total_belanja_anggaran,
        total_belanja_realisasi,
        total_pembiayaan_anggaran,
        total_pembiayaan_realisasi
    )
    values (
        (p_report ->> 'budget_year')::smallint,
        (p_report ->> 'period_month')::smallint,
        p_report ->> 'period_name',
        p_report ->> 'provinsi_code',
        p_report ->> 'provinsi_name',
        p_report ->> 'pemda_code',
        p_report ->> 'pemda_name',
        p_report ->> 'source_url',
        p_report ->> 'download_url',
        (p_report ->> 'fetched_at')::timestamptz,
        (p_report ->> 'http_status')::smallint,
        p_report ->> 'keterangan_portal',
        p_report ->> 'data_hash',
        (p_report ->> 'raw_row_count')::integer,
        (p_report ->> 'total_pendapatan_anggaran')::numeric,
        (p_report ->> 'total_pendapatan_realisasi')::numeric,
        (p_report ->> 'total_belanja_anggaran')::numeric,
        (p_report ->> 'total_belanja_realisasi')::numeric,
        (p_report ->> 'total_pembiayaan_anggaran')::numeric,
        (p_report ->> 'total_pembiayaan_realisasi')::numeric
    )
    on conflict (budget_year, period_month, provinsi_code, pemda_code)
    do update set
        period_name = excluded.period_name,
        provinsi_name = excluded.provinsi_name,
        pemda_name = excluded.pemda_name,
        source_url = excluded.source_url,
        download_url = excluded.download_url,
        fetched_at = excluded.fetched_at,
        http_status = excluded.http_status,
        keterangan_portal = excluded.keterangan_portal,
        data_hash = excluded.data_hash,
        raw_row_count = excluded.raw_row_count,
        total_pendapatan_anggaran = excluded.total_pendapatan_anggaran,
        total_pendapatan_realisasi = excluded.total_pendapatan_realisasi,
        total_belanja_anggaran = excluded.total_belanja_anggaran,
        total_belanja_realisasi = excluded.total_belanja_realisasi,
        total_pembiayaan_anggaran = excluded.total_pembiayaan_anggaran,
        total_pembiayaan_realisasi = excluded.total_pembiayaan_realisasi,
        updated_at = now()
    returning id into v_report_id;

    delete from public.apbd_accounts as account
    where account.report_id = v_report_id
      and not exists (
          select 1
          from jsonb_array_elements(p_accounts) as item
          where (item ->> 'row_index')::integer = account.row_index
      );

    get diagnostics v_stale_deleted = row_count;

    insert into public.apbd_accounts (
        report_id,
        row_index,
        akun,
        anggaran,
        realisasi,
        persentase,
        is_total_row,
        raw_row
    )
    select
        v_report_id,
        (item ->> 'row_index')::integer,
        item ->> 'akun',
        (item ->> 'anggaran')::numeric,
        (item ->> 'realisasi')::numeric,
        (item ->> 'persentase')::numeric,
        coalesce((item ->> 'is_total_row')::boolean, false),
        coalesce(item -> 'raw_row', '{}'::jsonb)
    from jsonb_array_elements(p_accounts) as item
    on conflict (report_id, row_index)
    do update set
        akun = excluded.akun,
        anggaran = excluded.anggaran,
        realisasi = excluded.realisasi,
        persentase = excluded.persentase,
        is_total_row = excluded.is_total_row,
        raw_row = excluded.raw_row,
        updated_at = now();

    get diagnostics v_account_count = row_count;

    return jsonb_build_object(
        'report_id', v_report_id,
        'account_count', v_account_count,
        'stale_deleted', v_stale_deleted
    );
end;
$$;

revoke all on function public.import_apbd_snapshot(jsonb, jsonb)
from public, anon, authenticated;

grant execute on function public.import_apbd_snapshot(jsonb, jsonb)
to service_role;


-- ─────────────────────────────────────────────────────────────────────────
-- 3. Read-only access for the public budget page
-- ─────────────────────────────────────────────────────────────────────────

alter table public.apbd_reports enable row level security;
alter table public.apbd_accounts enable row level security;

create policy "Anyone can read APBD reports"
on public.apbd_reports
for select
to anon, authenticated
using (true);

create policy "Anyone can read APBD accounts"
on public.apbd_accounts
for select
to anon, authenticated
using (true);

revoke all on table public.apbd_reports, public.apbd_accounts
from anon, authenticated;

grant select on table public.apbd_reports, public.apbd_accounts
to anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────
-- 4. Documentation
-- ─────────────────────────────────────────────────────────────────────────

comment on table public.apbd_reports is
    'One DJPK APBD snapshot per region, budget year, and reporting month.';
comment on table public.apbd_accounts is
    'Verbatim DJPK account rows for a snapshot. Use apbd_reports totals for aggregates.';
comment on column public.apbd_accounts.row_index is
    'Zero-based source row position; stable identity when DJPK provides no account code.';
comment on column public.apbd_accounts.raw_row is
    'Original scraped row, preserved to avoid losing source attributes.';
comment on column public.apbd_accounts.is_total_row is
    'True only for Pendapatan Daerah, Belanja Daerah, and Pembiayaan Daerah totals.';
