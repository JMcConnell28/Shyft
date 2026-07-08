alter table public.zones
  add column if not exists deleted_at timestamptz;

alter table public.zones
  drop constraint if exists zones_location_id_name_key;

drop index if exists zones_active_location_name_uidx;

create unique index zones_active_location_name_uidx
  on public.zones (location_id, (lower(name)))
  where deleted_at is null;

create index if not exists zones_active_location_sort_idx
  on public.zones (location_id, sort_order, created_at)
  where deleted_at is null;
