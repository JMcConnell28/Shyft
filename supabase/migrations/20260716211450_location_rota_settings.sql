create table if not exists public.location_rota_settings (
  location_id uuid primary key references public.locations(id) on delete cascade,
  organization_id text references public."organization"(id) on delete cascade,
  default_zone_id uuid references public.zones(id) on delete set null,
  allow_edit_after_publish boolean not null default true,
  confirm_shift_delete boolean not null default true,
  copy_notes_by_default boolean not null default true,
  notify_staff_on_publish boolean not null default true,
  show_notes_to_staff boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists location_rota_settings_organization_idx
  on public.location_rota_settings (organization_id, location_id);

alter table public.location_rota_settings enable row level security;

drop policy if exists "location_rota_settings_select_member"
  on public.location_rota_settings;

create policy "location_rota_settings_select_member"
on public.location_rota_settings
for select
to public
using (public.is_location_member(location_id));

drop policy if exists "location_rota_settings_manage_manager"
  on public.location_rota_settings;

create policy "location_rota_settings_manage_manager"
on public.location_rota_settings
for all
to public
using (
  public.has_location_role(location_id, array['owner', 'admin', 'manager'])
)
with check (
  public.has_location_role(location_id, array['owner', 'admin', 'manager'])
);

comment on table public.location_rota_settings is
  'Location-scoped planning, editing, copying, and publishing preferences for rota workflows.';
