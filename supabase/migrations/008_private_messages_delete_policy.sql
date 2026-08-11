-- Policies for public anonymous users to delete private messages (drop first to prevent duplicate errors)
drop policy if exists "Anon can delete private messages" on public.private_messages;
create policy "Anon can delete private messages"
  on public.private_messages for delete
  to anon
  using (true);
