update storage.buckets
set public = false
where id = 'completion-evidence';

drop policy if exists "Authenticated users can view completion evidence"
on storage.objects;

create policy "Admins can view completion evidence"
on storage.objects for select
to authenticated
using (
  bucket_id = 'completion-evidence'
  and exists (
    select 1
    from public.user_roles
    where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
  )
);

comment on column public.report_status_history.proof_image_url is
  'Private completion-evidence storage path; never expose as a public URL';
