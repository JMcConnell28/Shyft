create table if not exists public.rota_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  name text not null,
  description text,
  created_by text not null references public."user"(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.rotas (
  id uuid primary key default gen_random_uuid(),
  organization_id text not null references public."organization"(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  week_start date not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  note text,
  shift_count integer not null default 0,
  scheduled_hours numeric(8, 2) not null default 0,
  scheduled_staff_count integer not null default 0,
  created_by text not null references public."user"(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz,
  published_by_user_id text references public."user"(id) on delete set null,
  published_version integer not null default 0,
  source_type text not null default 'blank' check (
    source_type in ('blank', 'previous-week', 'template', 'duplicate')
  ),
  source_rota_id uuid references public.rotas(id) on delete set null,
  template_id uuid references public.rota_templates(id) on delete set null,
  unique (organization_id, location_id, week_start)
);

create table if not exists public.rota_reads (
  id uuid primary key default gen_random_uuid(),
  rota_id uuid not null references public.rotas(id) on delete cascade,
  user_id text not null references public."user"(id) on delete cascade,
  seen_published_version integer not null default 0,
  seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (rota_id, user_id)
);

create index if not exists rota_templates_organization_idx
  on public.rota_templates (organization_id, location_id);

create index if not exists rotas_organization_lookup_idx
  on public.rotas (organization_id, location_id, week_start);

create index if not exists rotas_publish_lookup_idx
  on public.rotas (organization_id, location_id, status, published_version);

create index if not exists rota_reads_user_lookup_idx
  on public.rota_reads (user_id, rota_id, seen_published_version);
