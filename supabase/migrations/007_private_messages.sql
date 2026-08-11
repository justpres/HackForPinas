-- Create private messages table
create table if not exists public.private_messages (
  id uuid primary key default gen_random_uuid(),
  sender text not null,
  receiver text not null,
  message text not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.private_messages enable row level security;

-- Policies for public anonymous users to read and insert (drop first to prevent duplicate errors)
drop policy if exists "Anon can view their own private messages" on public.private_messages;
create policy "Anon can view their own private messages"
  on public.private_messages for select
  to anon
  using (true);

drop policy if exists "Anon can insert private messages" on public.private_messages;
create policy "Anon can insert private messages"
  on public.private_messages for insert
  to anon
  with check (length(message) > 0 and length(message) <= 250);

-- Enable real-time updates for private_messages table
do $$
begin
  -- Check if table is not already in the publication before adding it
  if not exists (
    select 1
    from pg_publication_rel pr
    join pg_class c on c.oid = pr.prrelid
    join pg_namespace n on n.oid = c.relnamespace
    where pr.prpubid = (select oid from pg_publication where pubname = 'supabase_realtime')
      and n.nspname = 'public'
      and c.relname = 'private_messages'
  ) then
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
      alter publication supabase_realtime add table public.private_messages;
    end if;
  end if;
exception
  when others then
    null;
end $$;

-- Trigger to clean up private messages older than 24 hours
create or replace function public.clean_old_private_messages()
returns trigger as $$
begin
  delete from public.private_messages where created_at < now() - interval '24 hours';
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_clean_old_private_messages on public.private_messages;
create trigger trg_clean_old_private_messages
  after insert on public.private_messages
  for each statement
  execute function public.clean_old_private_messages();
