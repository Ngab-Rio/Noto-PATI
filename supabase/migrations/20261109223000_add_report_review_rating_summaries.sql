create or replace function public.get_report_review_ratings(p_report_ids uuid[])
returns table (
    report_id uuid,
    review_count bigint,
    average_rating numeric
)
language sql
stable
security definer
set search_path = ''
as $$
    select
        report_reviews.report_id,
        count(*)::bigint as review_count,
        round(avg(report_reviews.rating)::numeric, 1)::numeric as average_rating
    from public.report_reviews
    join public.reports
        on reports.id = report_reviews.report_id
    where report_reviews.report_id = any(coalesce(p_report_ids, '{}'::uuid[]))
      and reports.status = 'selesai'::public.report_status
    group by report_reviews.report_id;
$$;

revoke all on function public.get_report_review_ratings(uuid[])
from public, anon, authenticated, service_role;

grant execute on function public.get_report_review_ratings(uuid[])
to anon, authenticated;
