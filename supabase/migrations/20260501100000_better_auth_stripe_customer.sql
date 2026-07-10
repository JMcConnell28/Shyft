alter table public."user"
  add column if not exists "stripeCustomerId" text;

create unique index if not exists "user_stripeCustomerId_uidx"
  on public."user" ("stripeCustomerId")
  where "stripeCustomerId" is not null;
