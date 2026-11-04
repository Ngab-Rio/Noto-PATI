do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'report_status_history'
      and column_name = 'proof_image_url'
  ) then
    alter table public.report_status_history
      add column proof_image_url text;
  end if;
end
$$;

grant select
on table public.report_status_history
to anon, authenticated;

grant select (
  id,
  report_id,
  status,
  note,
  proof_image_url,
  created_at
)
on table public.report_status_history
to anon, authenticated;
