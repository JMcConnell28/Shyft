create schema if not exists account_private;
revoke all on schema account_private from public, anon, authenticated;

create table account_private.user_preferences (
  user_id text primary key references public."user"(id) on delete cascade,
  announcement_push_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table account_private.user_preferences enable row level security;
grant usage on schema account_private to postgres, service_role;
grant all on account_private.user_preferences to postgres, service_role;
revoke all on account_private.user_preferences from public, anon, authenticated;
