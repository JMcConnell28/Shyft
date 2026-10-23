-- Run after station_fulfillment.sql in the same BEGIN / ROLLBACK transaction.
do $$
declare
  location uuid; account uuid; owner_id text;
  first_order uuid := gen_random_uuid(); second_order uuid := gen_random_uuid(); unpaid_order uuid := gen_random_uuid();
  ready_count integer;
begin
  select id, billing_account_id into location, account from public.locations where billing_account_id is not null limit 1;
  select id into owner_id from public."user" limit 1;
  insert into billing_private.clock_station_purchases
    (id, location_id, billing_account_id, created_by_user_id, stripe_customer_id, stripe_price_id, unit_amount, return_path, currency,
     payment_status, is_live, paid_at, delivery_name, delivery_line1, delivery_city, delivery_postcode, delivery_country)
  select id, location, account, owner_id, 'cus_fixture', 'price_fixture', 2499, '/app/demo/settings/billing', 'gbp',
    case when id = unpaid_order then 'awaiting_payment' else 'paid' end, true, now(), 'Fixture', 'Test address', 'Derry', 'BT48 1AA', 'GB'
  from unnest(array[first_order,second_order,unpaid_order]) as id;

  select count(*) into ready_count from billing_private.station_fulfillment_requests where purchase_id in (first_order,second_order,unpaid_order) and needs_station;
  if ready_count <> 2 then raise exception 'Each paid extra station must queue independently; unpaid orders must not queue: %', ready_count; end if;
  if (select fulfillment_status from billing_private.location_hardware_entitlements where location_id = location) <> 'shipped' then
    raise exception 'Fixture must have an already-shipped included station'; end if;

  update billing_private.clock_station_purchases set is_live = false where id = first_order;
  if (select needs_station from billing_private.station_fulfillment_requests where purchase_id = first_order) then raise exception 'Test payments must not release hardware'; end if;
  update billing_private.clock_station_purchases set is_live = true, payment_status = 'refunded' where id = first_order;
  if (select needs_station from billing_private.station_fulfillment_requests where purchase_id = first_order) then raise exception 'Refunded payments must not release hardware'; end if;
  update billing_private.clock_station_purchases set payment_status = 'paid' where id = first_order;

  insert into billing_private.station_admin_alerts (location_id, purchase_id) values (location,first_order),(location,second_order) on conflict(request_id) do nothing;
  insert into billing_private.station_admin_alerts (location_id, purchase_id) values (location,first_order) on conflict(request_id) do nothing;
  if (select count(*) from billing_private.station_admin_alerts where purchase_id in (first_order,second_order)) <> 2 then raise exception 'Alert deduplication must be per physical station'; end if;

  update billing_private.clock_station_purchases set fulfillment_status = 'shipped' where id = first_order;
  if (select needs_station from billing_private.station_fulfillment_requests where purchase_id = first_order) then raise exception 'Shipped extra stations must leave the queue'; end if;
  if not (select needs_station from billing_private.station_fulfillment_requests where purchase_id = second_order) then raise exception 'Shipping one extra station must not complete another'; end if;

  update billing_private.station_payment_receipts set includes_time_attendance = false where billing_account_id = account;
  if (select needs_station from billing_private.station_fulfillment_requests where purchase_id = second_order) then raise exception 'Extra hardware also requires paid T&A'; end if;
  if has_table_privilege('anon','billing_private.clock_station_purchases','select') or has_table_privilege('authenticated','billing_private.station_fulfillment_requests','select') then raise exception 'Purchase operations must remain private'; end if;
end $$;
select 'extra station purchase checks passed' as result;
