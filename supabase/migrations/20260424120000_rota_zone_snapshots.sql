alter table public.rota_shifts
  add column if not exists zone_name_snapshot text;

alter table public.rota_published_shifts
  add column if not exists zone_name_snapshot text;

update public.rota_shifts rs
set zone_name_snapshot = z.name
from public.zones z
where rs.zone_id = z.id
  and rs.zone_name_snapshot is null;

update public.rota_published_shifts rps
set zone_name_snapshot = z.name
from public.zones z
where rps.zone_id = z.id
  and rps.zone_name_snapshot is null;

alter table public.rota_shifts
  alter column zone_name_snapshot set not null;

alter table public.rota_published_shifts
  alter column zone_name_snapshot set not null;

alter table public.rota_shifts
  drop constraint if exists rota_shifts_zone_id_fkey;

alter table public.rota_published_shifts
  drop constraint if exists rota_published_shifts_zone_id_fkey;

alter table public.rota_shifts
  alter column zone_id drop not null;

alter table public.rota_published_shifts
  alter column zone_id drop not null;

alter table public.rota_shifts
  add constraint rota_shifts_zone_id_fkey
  foreign key (zone_id)
  references public.zones(id)
  on delete set null;

alter table public.rota_published_shifts
  add constraint rota_published_shifts_zone_id_fkey
  foreign key (zone_id)
  references public.zones(id)
  on delete set null;
