-- NFC key material belongs to server-side provisioning and scan verification.
-- A workforce manager's RLS membership must never grant access to these secrets.
revoke all privileges on table public.clock_tags from public, anon, authenticated;

-- Table revokes do not remove independent column grants. Clear those too,
-- including any historical grant on the AES key or legacy token hash.
do $$
declare
  columns text;
begin
  select string_agg(quote_ident(attname), ', ' order by attnum)
    into columns
    from pg_attribute
   where attrelid = 'public.clock_tags'::regclass
     and attnum > 0
     and not attisdropped;

  execute format(
    'revoke all privileges (%s) on table public.clock_tags from public, anon, authenticated',
    columns
  );
end;
$$;

alter table public.clock_tags enable row level security;
drop policy if exists clock_tags_select_manager on public.clock_tags;

create policy clock_tags_server_access
on public.clock_tags
for all
to service_role
using (true)
with check (true);

grant select, insert, update, delete on table public.clock_tags to service_role;
