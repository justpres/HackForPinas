-- Organizers table
create table organizers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organizer_type text check (organizer_type in ('government','university','private')) not null,
  is_verified boolean default false,
  facebook_page_id text,
  official_website text,
  created_at timestamptz default now()
);

-- Hackathons table  
create table hackathons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organizer_id uuid references organizers(id),
  description text not null,
  source_type text check (source_type in ('facebook','official_site','community_submitted')) not null,
  source_url text not null,
  redirect_url text not null,
  deadline timestamptz not null,
  event_start timestamptz,
  event_end timestamptz,
  region text not null,
  format text check (format in ('online','in-person','hybrid')) not null,
  status text check (status in ('pending_review','published','rejected','expired')) default 'pending_review',
  poster_image_url text,
  last_checked_at timestamptz default now(),
  submitted_by_email text,
  created_at timestamptz default now()
);

-- Submissions audit log
create table submissions_audit_log (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid references hackathons(id),
  action text check (action in ('submitted','approved','rejected','edited','expired')) not null,
  actor text,
  notes text,
  created_at timestamptz default now()
);

create or replace function enforce_pending_review_on_insert()
returns trigger as $$
begin
  NEW.status := 'pending_review';
  return NEW;
end;
$$ language plpgsql;

create trigger trg_enforce_pending_review
  before insert on hackathons
  for each row
  execute function enforce_pending_review_on_insert();

create index idx_hackathons_status on hackathons(status);
create index idx_hackathons_deadline on hackathons(deadline);
create index idx_hackathons_region on hackathons(region);
create index idx_hackathons_organizer_id on hackathons(organizer_id);
