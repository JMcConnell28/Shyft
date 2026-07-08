create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"("id") on delete cascade,
  author_user_id text not null references public."user"(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 3 and 120),
  body text not null check (char_length(trim(body)) between 1 and 4000),
  target_scope text not null check (target_scope in ('organization', 'locations')),
  status text not null default 'active' check (status in ('active', 'archived')),
  published_at timestamptz not null default timezone('utc', now()),
  archived_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (status = 'archived' and archived_at is not null)
    or (status = 'active' and archived_at is null)
  )
);

create table if not exists public.announcement_locations (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  primary key (announcement_id, location_id)
);

create table if not exists public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id text not null references public."user"(id) on delete cascade,
  read_at timestamptz not null default timezone('utc', now()),
  primary key (announcement_id, user_id)
);

create index if not exists announcements_org_status_published_idx
  on public.announcements (organization_id, status, published_at desc);

create index if not exists announcement_locations_location_idx
  on public.announcement_locations (location_id, announcement_id);

create index if not exists announcement_reads_user_idx
  on public.announcement_reads (user_id, read_at desc);

alter table public.announcements enable row level security;
alter table public.announcement_locations enable row level security;
alter table public.announcement_reads enable row level security;

drop policy if exists "announcements_select_visible" on public.announcements;
create policy "announcements_select_visible"
on public.announcements
for select
to public
using (
  public.has_org_role(organization_id, array['owner', 'admin'])
  or author_user_id = public.current_better_auth_user_id()
  or (
    status = 'active'
    and public.is_org_member(organization_id)
    and (
      target_scope = 'organization'
      or exists (
        select 1
        from public.announcement_locations target
        join public.employees employee
          on employee.organization_id = announcements.organization_id
         and employee.user_id = public.current_better_auth_user_id()
         and employee.status = 'active'
        join public.employee_location_assignments assignment
          on assignment.employee_id = employee.id
         and assignment.location_id = target.location_id
         and assignment.is_enabled = true
         and assignment.disabled_at is null
        where target.announcement_id = announcements.id
      )
      or exists (
        select 1
        from public.announcement_locations target
        where target.announcement_id = announcements.id
          and public.has_location_role(target.location_id, array['manager'])
      )
    )
  )
);

drop policy if exists "announcements_insert_server_only" on public.announcements;
create policy "announcements_insert_server_only"
on public.announcements
for insert
to public
with check (false);

drop policy if exists "announcements_update_server_only" on public.announcements;
create policy "announcements_update_server_only"
on public.announcements
for update
to public
using (false)
with check (false);

drop policy if exists "announcements_delete_server_only" on public.announcements;
create policy "announcements_delete_server_only"
on public.announcements
for delete
to public
using (false);

drop policy if exists "announcement_locations_select_visible" on public.announcement_locations;
create policy "announcement_locations_select_visible"
on public.announcement_locations
for select
to public
using (
  exists (
    select 1
    from public.locations location
    where location.id = announcement_locations.location_id
      and public.is_org_member(location.organization_id)
  )
);

drop policy if exists "announcement_locations_insert_server_only" on public.announcement_locations;
create policy "announcement_locations_insert_server_only"
on public.announcement_locations
for insert
to public
with check (false);

drop policy if exists "announcement_locations_update_server_only" on public.announcement_locations;
create policy "announcement_locations_update_server_only"
on public.announcement_locations
for update
to public
using (false)
with check (false);

drop policy if exists "announcement_locations_delete_server_only" on public.announcement_locations;
create policy "announcement_locations_delete_server_only"
on public.announcement_locations
for delete
to public
using (false);

drop policy if exists "announcement_reads_select_own" on public.announcement_reads;
create policy "announcement_reads_select_own"
on public.announcement_reads
for select
to public
using (user_id = public.current_better_auth_user_id());

drop policy if exists "announcement_reads_insert_server_only" on public.announcement_reads;
create policy "announcement_reads_insert_server_only"
on public.announcement_reads
for insert
to public
with check (false);

drop policy if exists "announcement_reads_update_server_only" on public.announcement_reads;
create policy "announcement_reads_update_server_only"
on public.announcement_reads
for update
to public
using (false)
with check (false);

drop policy if exists "announcement_reads_delete_server_only" on public.announcement_reads;
create policy "announcement_reads_delete_server_only"
on public.announcement_reads
for delete
to public
using (false);
