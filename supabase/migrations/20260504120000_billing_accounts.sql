create table if not exists public.billing_accounts (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('location', 'organization')),
  organization_id text references public."organization"("id") on delete set null,
  location_id uuid references public.locations(id) on delete set null,
  owner_user_id text references public."user"(id) on delete set null,
  stripe_customer_id text unique,
  status text not null default 'incomplete' check (
    status in ('incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid')
  ),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists billing_accounts_organization_uidx
  on public.billing_accounts (organization_id)
  where scope = 'organization' and organization_id is not null;

create unique index if not exists billing_accounts_location_uidx
  on public.billing_accounts (location_id)
  where scope = 'location' and location_id is not null;

create index if not exists billing_accounts_owner_user_idx
  on public.billing_accounts (owner_user_id);

alter table public.locations
  add column if not exists billing_account_id uuid references public.billing_accounts(id);

create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  billing_account_id uuid not null references public.billing_accounts(id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  stripe_price_id text,
  status text not null,
  quantity integer not null default 1 check (quantity > 0),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists billing_subscriptions_account_idx
  on public.billing_subscriptions (billing_account_id, status);

insert into public.billing_accounts (
  scope,
  organization_id,
  location_id,
  owner_user_id
)
select
  'location',
  l.organization_id,
  l.id,
  lm.user_id
from public.locations l
left join lateral (
  select user_id
  from public.location_memberships
  where location_id = l.id
  order by
    case role
      when 'owner' then 0
      when 'admin' then 1
      when 'manager' then 2
      else 3
    end,
    created_at asc
  limit 1
) lm on true
where l.billing_account_id is null;

update public.locations l
set billing_account_id = ba.id
from public.billing_accounts ba
where l.billing_account_id is null
  and ba.scope = 'location'
  and ba.location_id = l.id;

create or replace function public.ensure_location_billing_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  created_billing_account_id uuid;
begin
  if new.billing_account_id is not null then
    return new;
  end if;

  insert into public.billing_accounts (
    scope,
    organization_id,
    location_id
  ) values (
    'location',
    new.organization_id,
    new.id
  )
  returning id into created_billing_account_id;

  new.billing_account_id := created_billing_account_id;

  return new;
end;
$$;

drop trigger if exists locations_ensure_billing_account on public.locations;
create trigger locations_ensure_billing_account
before insert on public.locations
for each row
execute function public.ensure_location_billing_account();

alter table public.locations
  alter column billing_account_id set not null;

alter table public.billing_accounts enable row level security;
alter table public.billing_subscriptions enable row level security;

drop policy if exists "billing_accounts_select_member" on public.billing_accounts;
create policy "billing_accounts_select_member"
on public.billing_accounts
for select
to public
using (
  (organization_id is not null and public.is_org_member(organization_id))
  or exists (
    select 1
    from public.locations l
    where l.billing_account_id = billing_accounts.id
      and public.is_location_member(l.id)
  )
);

drop policy if exists "billing_subscriptions_select_member" on public.billing_subscriptions;
create policy "billing_subscriptions_select_member"
on public.billing_subscriptions
for select
to public
using (
  exists (
    select 1
    from public.billing_accounts ba
    where ba.id = billing_subscriptions.billing_account_id
      and (
        (ba.organization_id is not null and public.is_org_member(ba.organization_id))
        or exists (
          select 1
          from public.locations l
          where l.billing_account_id = ba.id
            and public.is_location_member(l.id)
        )
      )
  )
);
