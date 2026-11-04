alter table admin_private.admin_user add column "twoFactorEnabled" boolean not null default false;
create table admin_private.admin_two_factor (
  id text primary key,
  "userId" text not null unique references admin_private.admin_user(id) on delete cascade,
  secret text not null,
  "backupCodes" text not null,
  verified boolean not null default false,
  "failedVerificationCount" integer not null default 0,
  "lockedUntil" timestamptz
);
alter table admin_private.admin_two_factor enable row level security;
revoke all on admin_private.admin_two_factor from public, anon, authenticated;
grant select, insert, update, delete on admin_private.admin_two_factor to service_role;
create policy admin_two_factor_server_access on admin_private.admin_two_factor
for all to service_role using (true) with check (true);
