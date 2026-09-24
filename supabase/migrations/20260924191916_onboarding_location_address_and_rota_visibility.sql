alter table public.locations
  add column if not exists address_line1 text,
  add column if not exists address_line2 text,
  add column if not exists address_city text,
  add column if not exists address_county text,
  add column if not exists address_postcode text,
  add column if not exists address_country text;

alter table public.employee_location_assignments
  add column if not exists show_on_rota boolean not null default true;
