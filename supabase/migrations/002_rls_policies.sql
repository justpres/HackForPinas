-- Enable RLS
alter table organizers enable row level security;
alter table hackathons enable row level security;
alter table submissions_audit_log enable row level security;

-- hackathons policies
create policy "Anon can view published hackathons"
  on hackathons for select
  to anon
  using (status = 'published');

create policy "Anon can insert hackathons"
  on hackathons for insert
  to anon
  with check (true);

create policy "Authenticated admins have full access to hackathons"
  on hackathons for all
  to authenticated
  using (true)
  with check (true);

-- organizers policies
create policy "Anon can view all organizers"
  on organizers for select
  to anon
  using (true);

create policy "Authenticated admins have full access to organizers"
  on organizers for all
  to authenticated
  using (true)
  with check (true);

-- submissions_audit_log policies
create policy "Authenticated admins can view audit log"
  on submissions_audit_log for select
  to authenticated
  using (true);

create policy "Authenticated admins can insert audit log"
  on submissions_audit_log for insert
  to authenticated
  with check (true);
