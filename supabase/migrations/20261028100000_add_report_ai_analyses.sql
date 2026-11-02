create table public.report_ai_analyses (
    id uuid primary key default gen_random_uuid(),
    report_id uuid references public.reports (id) on delete set null,
    photo_sha256 text not null
        check (photo_sha256 ~ '^[0-9a-f]{64}$'),
    provider text not null,
    model text not null,
    suggested_category public.report_category,
    suggested_title text,
    suggested_description text,
    confidence numeric
        check (confidence is null or confidence between 0 and 1),
    status text not null
        check (status in ('processing', 'succeeded', 'failed')),
    error_code text
        check (
            error_code is null
            or error_code in (
                'timeout',
                'rate_limited',
                'provider_unavailable',
                'invalid_response',
                'metadata_error'
            )
        ),
    duration_ms integer
        check (duration_ms is null or duration_ms >= 0),
    created_at timestamptz not null default now()
);

create index report_ai_analyses_report_created_at_idx
    on public.report_ai_analyses (report_id, created_at desc);

alter table public.report_ai_analyses enable row level security;
revoke all on table public.report_ai_analyses from public, anon, authenticated;
grant all on table public.report_ai_analyses to service_role;

create table private.report_ai_analysis_rate_limits (
    requester_hash text not null
        check (requester_hash ~ '^[0-9a-f]{64}$'),
    created_at timestamptz not null default now()
);

alter table private.report_ai_analysis_rate_limits enable row level security;
revoke all on table private.report_ai_analysis_rate_limits
from public, anon, authenticated;

create function public.start_report_ai_analysis(
    p_requester_hash text,
    p_photo_sha256 text,
    p_provider text,
    p_model text,
    p_rate_limit integer
)
returns table (analysis_id uuid, allowed boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_analysis_id uuid;
begin
    if p_requester_hash !~ '^[0-9a-f]{64}$'
       or p_photo_sha256 !~ '^[0-9a-f]{64}$'
       or p_provider = ''
       or p_model = ''
       or p_rate_limit < 1 then
        raise exception using
            errcode = '22023',
            message = 'Invalid AI analysis request.';
    end if;

    perform pg_advisory_xact_lock(hashtextextended(p_requester_hash, 0));

    delete from private.report_ai_analysis_rate_limits
    where created_at <= now() - interval '1 hour';

    if (
        select count(*)
        from private.report_ai_analysis_rate_limits
        where requester_hash = p_requester_hash
          and created_at > now() - interval '1 hour'
    ) >= p_rate_limit then
        return query select null::uuid, false;
        return;
    end if;

    insert into private.report_ai_analysis_rate_limits (requester_hash)
    values (p_requester_hash);

    insert into public.report_ai_analyses (
        photo_sha256,
        provider,
        model,
        status
    )
    values (
        p_photo_sha256,
        p_provider,
        p_model,
        'processing'
    )
    returning id into v_analysis_id;

    return query select v_analysis_id, true;
end;
$$;

revoke all on function public.start_report_ai_analysis(text, text, text, text, integer)
from public, anon, authenticated;

grant execute on function public.start_report_ai_analysis(text, text, text, text, integer)
to service_role;
