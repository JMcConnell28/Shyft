alter table public."organization"
  add column if not exists "stripeCustomerId" text;

create unique index if not exists "organization_stripeCustomerId_uidx"
  on public."organization" ("stripeCustomerId")
  where "stripeCustomerId" is not null;

create table if not exists public."subscription" (
  "id" text primary key,
  "plan" text not null,
  "referenceId" text not null,
  "stripeCustomerId" text,
  "stripeSubscriptionId" text,
  "status" text not null default 'incomplete',
  "periodStart" timestamptz,
  "periodEnd" timestamptz,
  "trialStart" timestamptz,
  "trialEnd" timestamptz,
  "cancelAtPeriodEnd" boolean default false,
  "cancelAt" timestamptz,
  "canceledAt" timestamptz,
  "endedAt" timestamptz,
  "seats" integer
);

create index if not exists "subscription_referenceId_idx"
  on public."subscription" ("referenceId");

create index if not exists "subscription_stripeCustomerId_idx"
  on public."subscription" ("stripeCustomerId");

create unique index if not exists "subscription_stripeSubscriptionId_uidx"
  on public."subscription" ("stripeSubscriptionId")
  where "stripeSubscriptionId" is not null;
