create function public.get_public_report_engagement_rankings(
    p_category text default null,
    p_status text default null,
    p_search text default null,
    p_limit integer default 6,
    p_offset integer default 0
)
returns table (
    report_id uuid,
    group_support_count bigint,
    merged_report_count bigint,
    engagement_score numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_search text := nullif(btrim(p_search), '');
begin
    if p_limit is null or p_limit < 1 or p_limit > 100 then
        raise exception 'INVALID_LIMIT';
    end if;

    if p_offset is null or p_offset < 0 then
        raise exception 'INVALID_OFFSET';
    end if;

    if p_search is not null and char_length(p_search) > 200 then
        raise exception 'INVALID_SEARCH';
    end if;

    if p_status is not null
       and p_status not in ('diterima', 'diverifikasi', 'diproses') then
        raise exception 'INVALID_ACTIVE_STATUS_FILTER';
    end if;

    return query
    with active_roots as materialized (
        select
            reports.id,
            reports.category,
            reports.status,
            reports.title,
            reports.detail_location,
            reports.created_at
        from public.reports
        where reports.merged_into_report_id is null
          and reports.status in ('diterima', 'diverifikasi', 'diproses')
    ),
    report_group_members as (
        select active_roots.id as root_id, active_roots.id as member_id
        from active_roots

        union all

        select active_roots.id, merged_reports.id
        from active_roots
        join public.reports as merged_reports
          on merged_reports.merged_into_report_id = active_roots.id
         and merged_reports.status = 'digabung'
    ),
    support_totals as (
        select
            report_group_members.root_id,
            count(distinct report_supports.user_id)::bigint as group_support_count
        from report_group_members
        left join public.report_supports
          on report_supports.report_id = report_group_members.member_id
        group by report_group_members.root_id
    ),
    merge_totals as (
        select
            active_roots.id as root_id,
            count(merged_reports.id)::bigint as merged_report_count
        from active_roots
        left join public.reports as merged_reports
          on merged_reports.merged_into_report_id = active_roots.id
         and merged_reports.status = 'digabung'
        group by active_roots.id
    ),
    metrics as (
        select
            active_roots.id,
            active_roots.category,
            active_roots.status,
            active_roots.title,
            active_roots.detail_location,
            active_roots.created_at,
            support_totals.group_support_count,
            merge_totals.merged_report_count
        from active_roots
        join support_totals on support_totals.root_id = active_roots.id
        join merge_totals on merge_totals.root_id = active_roots.id
    ),
    filtered_metrics as (
        select metrics.*
        from metrics
        where (p_category is null or metrics.category::text = p_category)
          and (p_status is null or metrics.status::text = p_status)
          and (
              v_search is null
              or metrics.title ilike '%' || v_search || '%'
              or metrics.detail_location ilike '%' || v_search || '%'
          )
    ),
    maxima as (
        select
            coalesce(max(filtered_metrics.group_support_count), 0)::numeric as max_support_count,
            coalesce(max(filtered_metrics.merged_report_count), 0)::numeric as max_merged_report_count
        from filtered_metrics
    ),
    scored as (
        select
            filtered_metrics.id,
            filtered_metrics.created_at,
            filtered_metrics.group_support_count,
            filtered_metrics.merged_report_count,
            (
                0.5 * coalesce(
                    ln(1::numeric + filtered_metrics.group_support_count)
                    / nullif(ln(1::numeric + maxima.max_support_count), 0),
                    0
                )
                + 0.5 * coalesce(
                    ln(1::numeric + filtered_metrics.merged_report_count)
                    / nullif(ln(1::numeric + maxima.max_merged_report_count), 0),
                    0
                )
            ) as engagement_score
        from filtered_metrics
        cross join maxima
    )
    select
        scored.id,
        scored.group_support_count,
        scored.merged_report_count,
        scored.engagement_score
    from scored
    order by scored.engagement_score desc, scored.created_at desc, scored.id
    offset p_offset
    limit p_limit;
end;
$$;

revoke all on function public.get_public_report_engagement_rankings(
    text,
    text,
    text,
    integer,
    integer
)
from public, anon, authenticated, service_role;

grant execute on function public.get_public_report_engagement_rankings(
    text,
    text,
    text,
    integer,
    integer
)
to anon, authenticated, service_role;
