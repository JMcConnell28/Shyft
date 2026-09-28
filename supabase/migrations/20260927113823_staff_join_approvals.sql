create table public.staff_join_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  location_id uuid references public.locations(id) on delete set null,
  staff_group_id uuid references public.staff_groups(id) on delete set null,
  invite_link_id uuid not null references public.staff_invite_links(id) on delete cascade,
  user_id text not null references public."user"(id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by text references public."user"(id) on delete set null,
  unique (user_id, invite_link_id)
);

create unique index staff_join_requests_one_pending_location_idx
  on public.staff_join_requests (organization_id, user_id, location_id)
  where status = 'pending';

create index staff_join_requests_pending_org_idx
  on public.staff_join_requests (organization_id, created_at)
  where status = 'pending';

create index staff_join_requests_user_idx
  on public.staff_join_requests (user_id, created_at desc);

alter table public.staff_join_requests enable row level security;
revoke all on public.staff_join_requests from anon, authenticated;
