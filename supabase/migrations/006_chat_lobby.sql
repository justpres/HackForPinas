-- Create chat table if it doesn't exist
create table if not exists public.chat_lobby (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  message text not null,
  avatar_color text not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.chat_lobby enable row level security;

-- Policies for public anonymous users to read and insert (drop first to prevent duplicate errors)
drop policy if exists "Anon can view all chat messages" on public.chat_lobby;
create policy "Anon can view all chat messages"
  on public.chat_lobby for select
  to anon
  using (true);

drop policy if exists "Anon can insert chat messages" on public.chat_lobby;
create policy "Anon can insert chat messages"
  on public.chat_lobby for insert
  to anon
  with check (length(message) > 0 and length(message) <= 250);

-- Enable real-time updates for chat_lobby table (safe check to prevent duplicate adding errors)
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
      and c.relname = 'chat_lobby'
  ) then
    if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
      alter publication supabase_realtime add table public.chat_lobby;
    end if;
  end if;
exception
  when others then
    null; -- ignore error if publication doesn't exist
end $$;

-- Trigger to clean up messages older than 24 hours (drop first to prevent duplicate errors)
create or replace function public.clean_old_chat_messages()
returns trigger as $$
begin
  delete from public.chat_lobby where created_at < now() - interval '24 hours';
  return null;
end;
$$ language plpgsql;

drop trigger if exists trg_clean_old_chat_messages on public.chat_lobby;
create trigger trg_clean_old_chat_messages
  after insert on public.chat_lobby
  for each statement
  execute function public.clean_old_chat_messages();
