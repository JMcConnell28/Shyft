create schema if not exists push_private;

revoke all on schema push_private from public, anon, authenticated;

create table push_private.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references public."user"(id) on delete cascade,
  organization_id text references public."organization"(id) on delete set null,
  endpoint text not null unique,
  p256dh_key text not null,
  auth_key text not null,
  device_description text,
  user_agent text,
  platform text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  last_used_at timestamptz,
  revoked_at timestamptz,
  check (char_length(endpoint) between 20 and 4096),
  check (char_length(p256dh_key) between 20 and 512),
  check (char_length(auth_key) between 8 and 256),
  check (device_description is null or char_length(device_description) <= 160),
  check (user_agent is null or char_length(user_agent) <= 1024),
  check (platform is null or char_length(platform) <= 160)
);

create index push_subscriptions_user_active_idx
  on push_private.push_subscriptions (user_id, updated_at desc)
  where revoked_at is null;

create index push_subscriptions_organization_active_idx
  on push_private.push_subscriptions (organization_id, updated_at desc)
  where organization_id is not null and revoked_at is null;

grant usage on schema push_private to postgres, service_role;
grant all on all tables in schema push_private to postgres, service_role;
revoke all on all tables in schema push_private from public, anon, authenticated;
