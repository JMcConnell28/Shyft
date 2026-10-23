create table billing_private.clock_station_purchases (
  id uuid primary key,
  location_id uuid not null references public.locations(id) on delete cascade,
  billing_account_id uuid not null references public.billing_accounts(id),
  created_by_user_id text not null references public."user"(id),
  stripe_customer_id text not null,
  stripe_price_id text not null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  unit_amount integer not null check (unit_amount > 0),
  return_path text not null,
  currency text not null check (currency = 'gbp'),
  payment_status text not null default 'awaiting_payment' check (payment_status in ('awaiting_payment','paid','failed','expired','refunded','disputed')),
  is_live boolean not null default false,
  paid_at timestamptz,
  clock_tag_id uuid unique references public.clock_tags(id) on delete set null,
  fulfillment_status text not null default 'pending' check (fulfillment_status in ('pending','ready','shipped','delivered','failed')),
  delivery_name text not null, delivery_line1 text not null, delivery_line2 text,
  delivery_city text not null, delivery_county text, delivery_postcode text not null,
  delivery_country text not null check (delivery_country = 'GB'),
  fulfillment_reference text, fulfillment_notes text, shipped_at timestamptz, delivered_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index clock_station_purchases_location_idx on billing_private.clock_station_purchases(location_id, created_at desc);
alter table billing_private.clock_station_purchases enable row level security;
revoke all on billing_private.clock_station_purchases from public, anon, authenticated;
grant all on billing_private.clock_station_purchases to service_role;

alter table billing_private.location_hardware_entitlements
  add column clock_tag_id uuid unique references public.clock_tags(id) on delete set null;
-- Preserve a single existing tag; ambiguous locations require an explicit admin assignment.
update billing_private.location_hardware_entitlements h set clock_tag_id = (
  select t.id from public.clock_tags t where t.location_id = h.location_id
  and t.is_active and t.ntag_public_id is not null and t.ntag_aes_key_hex is not null limit 1
) where h.entitlement_status = 'claimed' and 1 = (
  select count(*) from public.clock_tags t where t.location_id = h.location_id
  and t.is_active and t.ntag_public_id is not null and t.ntag_aes_key_hex is not null
);

create view billing_private.station_fulfillment_requests with (security_invoker = true) as
select 'included:' || s.location_id::text as request_id, s.location_id, 'included'::text as source,
       null::uuid as purchase_id, h.clock_tag_id,
       case when s.paid_at is null then 'awaiting_payment' else 'paid' end as payment_status,
       s.paid_at, s.needs_station, s.fulfillment_status,
       s.delivery_name, s.delivery_line1, s.delivery_line2, s.delivery_city, s.delivery_county, s.delivery_postcode, s.delivery_country,
       s.fulfillment_reference, s.fulfillment_notes, s.shipped_at, s.has_delivery_address, true as is_live,
       s.organization_id, s.billing_account_id, s.location_name
from billing_private.clock_station_fulfillment s
join billing_private.location_hardware_entitlements h on h.location_id = s.location_id
where h.entitlement_status = 'claimed'
union all
select 'additional:' || p.id::text, p.location_id, 'additional', p.id, p.clock_tag_id,
       p.payment_status, p.paid_at,
       coalesce(p.payment_status = 'paid' and p.is_live and p.fulfillment_status in ('pending','ready','failed')
         and p.billing_account_id = s.billing_account_id and s.subscription_status = 'active'
         and s.trial_ends_at <= now()
         and (select b.current_period_end from public.billing_subscriptions b where b.billing_account_id = s.billing_account_id order by b.created_at desc, b.id desc limit 1) > now()
         and exists(select 1 from billing_private.location_addons a where a.location_id = p.location_id and a.addon_type = 'time_attendance'
           and a.status in ('active','trialing','canceling') and (a.cancel_at is null or a.cancel_at > now())), false),
       p.fulfillment_status, p.delivery_name, p.delivery_line1, p.delivery_line2, p.delivery_city, p.delivery_county, p.delivery_postcode, p.delivery_country,
       p.fulfillment_reference, p.fulfillment_notes, p.shipped_at,
       nullif(trim(p.delivery_name),'') is not null and nullif(trim(p.delivery_line1),'') is not null
         and nullif(trim(p.delivery_city),'') is not null and nullif(trim(p.delivery_postcode),'') is not null,
       p.is_live, s.organization_id, p.billing_account_id, s.location_name
from billing_private.clock_station_purchases p
join billing_private.clock_station_fulfillment s on s.location_id = p.location_id;
revoke all on billing_private.station_fulfillment_requests from public, anon, authenticated;
grant select on billing_private.station_fulfillment_requests to service_role;

alter table billing_private.station_admin_alerts
  add column purchase_id uuid references billing_private.clock_station_purchases(id) on delete cascade,
  add column request_id text generated always as (
    case when purchase_id is null then 'included:' || location_id::text else 'additional:' || purchase_id::text end
  ) stored,
  drop constraint station_admin_alerts_pkey;
alter table billing_private.station_admin_alerts add primary key(request_id);
