-- Recovery quotas are shared across app workers; identities are HMAC hashes.
create table account_private.password_recovery_limits (
  key_hash text primary key check (key_hash ~ '^[0-9a-f]{64}$'),
  hit_count integer not null check (hit_count > 0),
  expires_at timestamptz not null
);

create index password_recovery_limits_expiry_idx
  on account_private.password_recovery_limits (expires_at);

alter table account_private.password_recovery_limits enable row level security;
revoke all on account_private.password_recovery_limits from public, anon, authenticated;
grant usage on schema account_private to service_role;
grant select, insert, update, delete on account_private.password_recovery_limits to service_role;
create policy password_recovery_limits_server_access
  on account_private.password_recovery_limits for all to service_role
  using (true) with check (true);
