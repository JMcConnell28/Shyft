alter table public.rota_shifts
  alter column organization_id drop not null;

alter table public.rota_published_shifts
  alter column organization_id drop not null;
