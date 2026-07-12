alter table public.announcements
  add column if not exists is_pinned boolean not null default false;

create index if not exists announcements_active_pinned_published_idx
  on public.announcements (organization_id, is_pinned desc, published_at desc)
  where status = 'active';

create table if not exists public.announcement_poll_options (
  id uuid primary key default gen_random_uuid(),
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  label text not null check (char_length(trim(label)) between 1 and 120),
  position smallint not null check (position between 0 and 5),
  created_at timestamptz not null default timezone('utc', now()),
  unique (announcement_id, id),
  unique (announcement_id, position)
);

create table if not exists public.announcement_poll_votes (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  option_id uuid not null,
  user_id text not null references public."user"(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (announcement_id, user_id),
  foreign key (announcement_id, option_id)
    references public.announcement_poll_options(announcement_id, id)
    on delete cascade
);

create index if not exists announcement_poll_options_announcement_idx
  on public.announcement_poll_options (announcement_id, position);

create index if not exists announcement_poll_votes_option_idx
  on public.announcement_poll_votes (option_id);

create index if not exists announcement_poll_votes_user_idx
  on public.announcement_poll_votes (user_id, updated_at desc);

alter table public.announcement_poll_options enable row level security;
alter table public.announcement_poll_votes enable row level security;

drop policy if exists "announcement_poll_options_select_visible"
  on public.announcement_poll_options;
create policy "announcement_poll_options_select_visible"
on public.announcement_poll_options
for select
to public
using (
  exists (
    select 1
    from public.announcements announcement
    where announcement.id = announcement_poll_options.announcement_id
  )
);

drop policy if exists "announcement_poll_options_insert_server_only"
  on public.announcement_poll_options;
create policy "announcement_poll_options_insert_server_only"
on public.announcement_poll_options
for insert
to public
with check (false);

drop policy if exists "announcement_poll_options_update_server_only"
  on public.announcement_poll_options;
create policy "announcement_poll_options_update_server_only"
on public.announcement_poll_options
for update
to public
using (false)
with check (false);

drop policy if exists "announcement_poll_options_delete_server_only"
  on public.announcement_poll_options;
create policy "announcement_poll_options_delete_server_only"
on public.announcement_poll_options
for delete
to public
using (false);

drop policy if exists "announcement_poll_votes_select_own"
  on public.announcement_poll_votes;
create policy "announcement_poll_votes_select_own"
on public.announcement_poll_votes
for select
to public
using (user_id = public.current_better_auth_user_id());

drop policy if exists "announcement_poll_votes_insert_server_only"
  on public.announcement_poll_votes;
create policy "announcement_poll_votes_insert_server_only"
on public.announcement_poll_votes
for insert
to public
with check (false);

drop policy if exists "announcement_poll_votes_update_server_only"
  on public.announcement_poll_votes;
create policy "announcement_poll_votes_update_server_only"
on public.announcement_poll_votes
for update
to public
using (false)
with check (false);

drop policy if exists "announcement_poll_votes_delete_server_only"
  on public.announcement_poll_votes;
create policy "announcement_poll_votes_delete_server_only"
on public.announcement_poll_votes
for delete
to public
using (false);
