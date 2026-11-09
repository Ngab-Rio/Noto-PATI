create table public.report_reviews (
    id uuid primary key default gen_random_uuid(),
    report_id uuid not null
        references public.reports (id)
        on delete cascade,
    user_id uuid not null
        references auth.users (id)
        on delete cascade,
    rating smallint not null
        check (rating between 1 and 5),
    comment text not null
        check (
            char_length(btrim(comment)) between 1 and 1000
            and comment ~ '[^[:space:]]'
        ),
    created_at timestamptz not null default now(),
    unique (report_id, user_id)
);

create index report_reviews_report_id_created_at_idx
    on public.report_reviews (report_id, created_at desc);

alter table public.report_reviews enable row level security;

revoke all on table public.report_reviews
from public, anon, authenticated, service_role;

create function public.get_report_review_summary(p_report_id uuid)
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
                        'is_viewer', visible_reviews.user_id = (select auth.uid())
                    )
                    order by visible_reviews.created_at desc
                )
                from visible_reviews
            ),
            '[]'::jsonb
        )
    from stats;
$$;

revoke all on function public.get_report_review_summary(uuid)
from public, anon, authenticated, service_role;

grant execute on function public.get_report_review_summary(uuid)
to anon, authenticated;

create function public.submit_report_review(
    p_report_id uuid,
    p_rating smallint,
    p_comment text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_user_id uuid := (select auth.uid());
    v_report_status public.report_status;
begin
    if v_user_id is null then
        raise exception 'AUTHENTICATION_REQUIRED';
    end if;

    if not exists (
        select 1
        from public.user_roles
        where user_roles.user_id = v_user_id
          and user_roles.role = 'warga'::public.app_role
    ) then
        raise exception 'CITIZEN_ONLY';
    end if;

    if p_rating is null or p_rating not between 1 and 5
       or p_comment is null
       or char_length(btrim(p_comment)) not between 1 and 1000
       or p_comment !~ '[^[:space:]]' then
        raise exception 'INVALID_REVIEW';
    end if;

    select reports.status
    into v_report_status
    from public.reports
    where reports.id = p_report_id
    for share;

    if not found then
        raise exception 'REPORT_NOT_FOUND';
    end if;

    if v_report_status <> 'selesai'::public.report_status then
        raise exception 'REPORT_NOT_COMPLETED';
    end if;

    begin
        insert into public.report_reviews (report_id, user_id, rating, comment)
        values (p_report_id, v_user_id, p_rating, btrim(p_comment));
    exception
        when unique_violation then
            raise exception 'REVIEW_ALREADY_SUBMITTED';
    end;
end;
$$;

revoke all on function public.submit_report_review(uuid, smallint, text)
from public, anon, authenticated, service_role;

grant execute on function public.submit_report_review(uuid, smallint, text)
to authenticated;
