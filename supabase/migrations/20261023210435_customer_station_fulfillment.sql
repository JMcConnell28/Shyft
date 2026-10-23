-- Payment evidence and internal operations data stay outside the Data API.
create table billing_private.station_payment_receipts (
  stripe_invoice_id text primary key,
  billing_account_id uuid not null references public.billing_accounts(id) on delete cascade,
  stripe_subscription_id text not null,
  amount_paid bigint not null check (amount_paid > 0),
  currency text not null,
  invoice_created_at timestamptz not null,
  paid_at timestamptz not null,
  includes_time_attendance boolean not null default false,
  created_at timestamptz not null default now()
);
create index station_payment_receipts_account_idx on billing_private.station_payment_receipts (billing_account_id, paid_at desc);
alter table billing_private.station_payment_receipts enable row level security;
revoke all on billing_private.station_payment_receipts from public, anon, authenticated;
grant all on billing_private.station_payment_receipts to service_role;

alter table billing_private.location_hardware_entitlements
  add column fulfillment_notes text,
  drop constraint location_hardware_entitlements_fulfillment_status_check;
alter table billing_private.location_hardware_entitlements
  add constraint location_hardware_entitlements_fulfillment_status_check
  check (fulfillment_status in ('not_requested', 'pending', 'ready', 'shipped', 'delivered', 'failed'));

create view billing_private.clock_station_fulfillment with (security_invoker = true) as
select l.id as location_id, l.name as location_name, l.organization_id, l.billing_account_id,
       entitlement.trial_ends_at, subscription.status as subscription_status,
       addon.status as addon_status, hardware.entitlement_status, hardware.fulfillment_status,
       hardware.delivery_name, hardware.delivery_line1, hardware.delivery_line2,
       hardware.delivery_city, hardware.delivery_county, hardware.delivery_postcode, hardware.delivery_country,
       hardware.fulfillment_reference, hardware.fulfillment_notes, hardware.shipped_at,
       receipt.paid_at, receipt.stripe_invoice_id,
       (nullif(trim(hardware.delivery_name), '') is not null
        and nullif(trim(hardware.delivery_line1), '') is not null
        and nullif(trim(hardware.delivery_city), '') is not null
        and nullif(trim(hardware.delivery_postcode), '') is not null
        and hardware.delivery_country = 'GB') as has_delivery_address,
       coalesce(hardware.entitlement_status = 'claimed'
         and hardware.fulfillment_status in ('pending', 'ready', 'failed')
         and receipt.stripe_invoice_id is not null
         and subscription.status = 'active' and subscription.current_period_end > now()
         and addon.status in ('trialing', 'active', 'canceling')
         and (addon.cancel_at is null or addon.cancel_at > now()), false) as needs_station
from public.locations l
left join billing_private.location_entitlements entitlement on entitlement.location_id = l.id
left join billing_private.location_addons addon on addon.location_id = l.id and addon.addon_type = 'time_attendance'
left join billing_private.location_hardware_entitlements hardware on hardware.location_id = l.id
left join lateral (
  select status, stripe_subscription_id, current_period_end from public.billing_subscriptions
  where billing_account_id = l.billing_account_id order by created_at desc, id desc limit 1
) subscription on true
left join lateral (
  select paid_at, stripe_invoice_id from billing_private.station_payment_receipts r
  where r.billing_account_id = l.billing_account_id
    and r.stripe_subscription_id = subscription.stripe_subscription_id
    and r.includes_time_attendance
    -- Stripe timestamps are whole seconds; application trial dates retain milliseconds.
    and r.invoice_created_at + interval '1 second' >= greatest(addon.activated_at, addon.billing_starts_at, entitlement.trial_ends_at, hardware.claimed_at)
    and r.paid_at <= now()
  order by r.paid_at, r.stripe_invoice_id limit 1
) receipt on true;
revoke all on billing_private.clock_station_fulfillment from public, anon, authenticated;
grant select on billing_private.clock_station_fulfillment to service_role;

create table billing_private.station_admin_alerts (
  location_id uuid primary key references public.locations(id) on delete cascade,
  created_at timestamptz not null default now(),
  email_sent_at timestamptz,
  email_attempted_at timestamptz,
  email_error text
);
alter table billing_private.station_admin_alerts enable row level security;
revoke all on billing_private.station_admin_alerts from public, anon, authenticated;
grant all on billing_private.station_admin_alerts to service_role;
