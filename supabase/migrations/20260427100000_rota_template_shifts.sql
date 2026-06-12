create table if not exists public.rota_template_shifts (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.rota_templates(id) on delete cascade,
  day_offset integer not null check (day_offset between 0 and 6),
  zone_id uuid references public.zones(id) on delete set null,
  zone_name_snapshot text not null,
  shift_type text not null check (shift_type in ('standard', 'closing', 'split')),
  start_time time not null,
  end_time time,
  end_kind text,
  split_second_start_time time,
  split_second_end_time time,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists rota_template_shifts_template_idx
  on public.rota_template_shifts (template_id, day_offset, sort_order);

create unique index if not exists rota_templates_location_name_uidx
  on public.rota_templates (location_id, lower(name))
  where location_id is not null;

alter table public.rota_template_shifts enable row level security;

drop policy if exists "rota_template_shifts_select_member" on public.rota_template_shifts;
create policy "rota_template_shifts_select_member"
on public.rota_template_shifts
for select
to public
using (
  exists (
    select 1
    from public.rota_templates template
    where template.id = rota_template_shifts.template_id
      and (
        (template.organization_id is not null and public.is_org_member(template.organization_id))
        or (template.location_id is not null and public.is_location_member(template.location_id))
      )
  )
);
