alter table public.clock_tags
  add column if not exists ntag_public_id text,
  add column if not exists ntag_aes_key_hex text,
  add column if not exists ntag_last_seen_counter integer not null default 0;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'clock_tags_ntag_public_id_format_check'
  ) then
    alter table public.clock_tags
      add constraint clock_tags_ntag_public_id_format_check
      check (
        ntag_public_id is null
        or ntag_public_id ~ '^clk_[A-Za-z0-9_-]{16,64}$'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'clock_tags_ntag_aes_key_hex_format_check'
  ) then
    alter table public.clock_tags
      add constraint clock_tags_ntag_aes_key_hex_format_check
      check (
        ntag_aes_key_hex is null
        or ntag_aes_key_hex ~ '^[0-9A-F]{32}$'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'clock_tags_ntag_last_seen_counter_check'
  ) then
    alter table public.clock_tags
      add constraint clock_tags_ntag_last_seen_counter_check
      check (ntag_last_seen_counter >= 0);
  end if;
end $$;

create unique index if not exists clock_tags_ntag_public_id_unique_idx
  on public.clock_tags (ntag_public_id)
  where ntag_public_id is not null;

create index if not exists clock_tags_ntag_location_lookup_idx
  on public.clock_tags (location_id, ntag_public_id)
  where ntag_public_id is not null;

create table if not exists public.clock_tag_counter_claims (
  id uuid primary key default gen_random_uuid(),
  clock_tag_id uuid not null references public.clock_tags(id) on delete cascade,
  picc_counter integer not null check (picc_counter >= 0),
  encrypted_picc_hex text not null check (encrypted_picc_hex ~ '^[0-9A-F]{32}$'),
  cmac_hex text not null check (cmac_hex ~ '^[0-9A-F]{16}$'),
  created_at timestamptz not null default timezone('utc', now()),
  unique (clock_tag_id, picc_counter)
);

create index if not exists clock_tag_counter_claims_tag_created_idx
  on public.clock_tag_counter_claims (clock_tag_id, created_at desc);

alter table public.clock_tag_counter_claims enable row level security;

drop policy if exists "clock_tag_counter_claims_select_manager"
  on public.clock_tag_counter_claims;
create policy "clock_tag_counter_claims_select_manager"
on public.clock_tag_counter_claims
for select
to public
using (
  exists (
    select 1
    from public.clock_tags tag
    where tag.id = clock_tag_counter_claims.clock_tag_id
      and public.has_location_role(
        tag.location_id,
        array['owner', 'admin', 'manager', 'supervisor']
      )
  )
);
