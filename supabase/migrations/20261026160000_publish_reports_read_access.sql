-- Public report pages may read report content without exposing reporter identity.
create policy "Anyone can read published reports"
on public.reports
for select
to anon, authenticated
using (true);

create policy "Anyone can read published report history"
on public.report_status_history
for select
to anon, authenticated
using (true);

revoke select on table public.reports, public.report_status_history
from anon, authenticated;

grant select (
	id,
	ticket_number,
	category,
	title,
	description,
	detail_location,
	status,
	latitude,
	longitude,
	location_accuracy_m,
	location_captured_at,
	created_at,
	updated_at
)
on table public.reports
to anon, authenticated;

grant select (id, report_id, status, note, created_at)
on table public.report_status_history
to anon, authenticated;
