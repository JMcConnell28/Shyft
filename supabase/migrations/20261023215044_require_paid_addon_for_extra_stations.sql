create or replace view billing_private.station_fulfillment_requests with (security_invoker = true) as
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
         and s.paid_at is not null and p.billing_account_id = s.billing_account_id and s.subscription_status = 'active'
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
