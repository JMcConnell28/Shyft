create schema if not exists admin_private;

revoke all on schema admin_private from public, anon, authenticated;

create table if not exists admin_private.admin_user (
  id text primary key,
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  role text not null default 'readonly' check (role in ('owner', 'developer', 'support', 'readonly')),
  disabled_at timestamptz,
  "createdAt" timestamptz not null default timezone('utc', now()),
  "updatedAt" timestamptz not null default timezone('utc', now())
);

create table if not exists admin_private.admin_session (
  id text primary key,
  "expiresAt" timestamptz not null,
  token text not null unique,
  "createdAt" timestamptz not null default timezone('utc', now()),
  "updatedAt" timestamptz not null,
  "ipAddress" text,
  "userAgent" text,
  "userId" text not null references admin_private.admin_user(id) on delete cascade
);

create table if not exists admin_private.admin_account (
  id text primary key,
  "accountId" text not null,
  "providerId" text not null,
  "userId" text not null references admin_private.admin_user(id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default timezone('utc', now()),
  "updatedAt" timestamptz not null
);

create table if not exists admin_private.admin_verification (
  id text primary key,
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default timezone('utc', now()),
  "updatedAt" timestamptz not null default timezone('utc', now())
);

create table if not exists admin_private.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id text references admin_private.admin_user(id) on delete set null,
  action text not null,
  target_type text not null,
  target_id text,
  permission text,
  before_state jsonb,
  after_state jsonb,
  metadata jsonb not null default '{}'::jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists admin_private.app_error_reports (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null,
  source text not null check (source in ('client', 'server')),
  severity text not null default 'error' check (severity in ('info', 'warning', 'error', 'fatal')),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'ignored')),
  message text not null,
  stack text,
  route_path text,
  user_id text references public."user"(id) on delete set null,
  organization_id text references public."organization"(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  browser_name text,
  browser_version text,
  operating_system text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  occurrence_count integer not null default 1 check (occurrence_count > 0),
  resolved_at timestamptz,
  resolved_by_admin_user_id text references admin_private.admin_user(id) on delete set null
);

create table if not exists admin_private.app_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  actor_user_id text references public."user"(id) on delete set null,
  organization_id text references public."organization"(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists admin_private.feature_flags (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z0-9][a-z0-9._-]{1,80}$'),
  name text not null,
  description text,
  is_enabled boolean not null default false,
  default_value jsonb not null default 'false'::jsonb,
  created_by_admin_user_id text references admin_private.admin_user(id) on delete set null,
  updated_by_admin_user_id text references admin_private.admin_user(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists admin_private.feature_flag_targets (
  id uuid primary key default gen_random_uuid(),
  feature_flag_id uuid not null references admin_private.feature_flags(id) on delete cascade,
  target_type text not null check (target_type in ('organization', 'location')),
  organization_id text references public."organization"(id) on delete cascade,
  location_id uuid references public.locations(id) on delete cascade,
  value jsonb not null default 'true'::jsonb,
  created_by_admin_user_id text references admin_private.admin_user(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  check (
    (target_type = 'organization' and organization_id is not null and location_id is null)
    or (target_type = 'location' and location_id is not null and organization_id is null)
  )
);

create table if not exists admin_private.support_threads (
  id uuid primary key default gen_random_uuid(),
  created_by_user_id text references public."user"(id) on delete set null,
  organization_id text references public."organization"(id) on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  subject text not null,
  category text not null default 'support' check (category in ('support', 'bug', 'feature_request')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open' check (status in ('open', 'waiting', 'resolved', 'closed')),
  assigned_admin_user_id text references admin_private.admin_user(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists admin_private.support_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references admin_private.support_threads(id) on delete cascade,
  author_type text not null check (author_type in ('user', 'admin', 'system')),
  user_id text references public."user"(id) on delete set null,
  admin_user_id text references admin_private.admin_user(id) on delete set null,
  body text not null check (char_length(trim(body)) between 1 and 5000),
  is_internal_note boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists admin_private.impersonation_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  admin_user_id text not null references admin_private.admin_user(id) on delete cascade,
  target_user_id text not null references public."user"(id) on delete cascade,
  reason text not null,
  is_read_only boolean not null default true,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists admin_private.app_user_status_overrides (
  user_id text primary key references public."user"(id) on delete cascade,
  status text not null check (status in ('active', 'deactivated')),
  reason text,
  updated_by_admin_user_id text references admin_private.admin_user(id) on delete set null,
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists feature_flag_targets_organization_uidx
  on admin_private.feature_flag_targets (feature_flag_id, organization_id)
  where organization_id is not null;

create unique index if not exists feature_flag_targets_location_uidx
  on admin_private.feature_flag_targets (feature_flag_id, location_id)
  where location_id is not null;

create unique index if not exists app_error_reports_fingerprint_uidx
  on admin_private.app_error_reports (fingerprint);

create index if not exists admin_session_user_idx
  on admin_private.admin_session ("userId");

create index if not exists admin_account_user_idx
  on admin_private.admin_account ("userId");

create index if not exists admin_verification_identifier_idx
  on admin_private.admin_verification (identifier);

create index if not exists admin_audit_logs_created_idx
  on admin_private.admin_audit_logs (created_at desc);

create index if not exists app_events_created_idx
  on admin_private.app_events (created_at desc);

create index if not exists support_threads_status_idx
  on admin_private.support_threads (status, updated_at desc);

grant usage on schema admin_private to postgres, service_role;
grant all on all tables in schema admin_private to postgres, service_role;
grant all on all sequences in schema admin_private to postgres, service_role;
