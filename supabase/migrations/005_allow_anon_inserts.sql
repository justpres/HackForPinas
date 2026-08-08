-- Allow anonymous inserts on organizers to support community submit & scrapers
create policy "Anon can insert organizers"
  on organizers for insert
  to anon
  with check (true);

-- Allow anonymous inserts on submissions_audit_log to track community submit & scrapers
create policy "Anon can insert submissions_audit_log"
  on submissions_audit_log for insert
  to anon
  with check (true);
