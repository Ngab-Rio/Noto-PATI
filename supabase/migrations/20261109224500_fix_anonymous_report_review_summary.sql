create or replace function public.get_report_review_summary(p_report_id uuid)
returns table (
    review_count bigint,
    average_rating numeric,
    viewer_has_reviewed boolean,
    can_review boolean,
    reviews jsonb
)
language sql
stable
security definer
set search_path = ''
as $$
    with eligible_report as (
        select reports.id
        from public.reports
        where reports.id = p_report_id
          and reports.status = 'selesai'::public.report_status
    ),
    all_reviews as (
        select
            report_reviews.user_id,
            report_reviews.rating,
            report_reviews.comment,
            report_reviews.created_at
        from public.report_reviews
        join eligible_report
            on eligible_report.id = report_reviews.report_id
    ),
    recent_reviews as (
        select *
        from all_reviews
        order by created_at desc
        limit 50
    ),
    visible_reviews as (
        select *
        from recent_reviews
        union all
        select *
        from all_reviews
        where user_id = (select auth.uid())
          and not exists (
              select 1
              from recent_reviews
              where recent_reviews.user_id = all_reviews.user_id
          )
    ),
    stats as (
        select
            count(*)::bigint as review_count,
            coalesce(round(avg(rating)::numeric, 1), 0)::numeric as average_rating,
            coalesce(bool_or(user_id = (select auth.uid())), false) as viewer_has_reviewed
        from all_reviews
    )
    select
        stats.review_count,
        stats.average_rating,
        stats.viewer_has_reviewed,
        (select auth.uid()) is not null
            and exists (
                select 1
                from public.user_roles
                where user_roles.user_id = (select auth.uid())
                  and user_roles.role = 'warga'::public.app_role
            ),
        coalesce(
            (
                select jsonb_agg(
                    jsonb_build_object(
                        'rating', visible_reviews.rating,
                        'comment', visible_reviews.comment,
                        'created_at', visible_reviews.created_at,
                        'is_viewer', coalesce(
                            visible_reviews.user_id = (select auth.uid()),
                            false
                        )
                    )
                    order by visible_reviews.created_at desc
                )
                from visible_reviews
            ),
            '[]'::jsonb
        )
    from stats;
$$;
