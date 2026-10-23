-- Run inside a transaction after the migration, then ROLLBACK. Nothing persists.
do $$
declare
  target_location uuid;
  target_account uuid;
  fixture_subscription text := 'sub_station_test_' || txid_current();
  fixture_invoice text := 'in_station_test_' || txid_current();
  result boolean;
begin
  select id, billing_account_id into target_location, target_account
  from public.locations where billing_account_id is not null limit 1;
  if target_location is null then raise exception 'A fixture location is required'; end if;

  update billing_private.location_entitlements set trial_ends_at = now() - interval '1 day' where location_id = target_location;
  insert into billing_private.location_addons (location_id, addon_type, status, activated_at, billing_starts_at)
  values (target_location, 'time_attendance', 'active', now() - interval '2 days', now() - interval '1 day')
  on conflict (location_id, addon_type) do update set status = 'active', activated_at = excluded.activated_at, billing_starts_at = excluded.billing_starts_at, cancel_at = null;
  update billing_private.location_hardware_entitlements
  set entitlement_status = 'claimed', fulfillment_status = 'pending', claimed_at = now() - interval '2 days',
      delivery_name = 'Test recipient', delivery_line1 = 'Test address', delivery_city = 'Test city', delivery_postcode = 'SW1A 1AA', delivery_country = 'GB'
  where location_id = target_location;
  insert into public.billing_subscriptions (billing_account_id, stripe_subscription_id, stripe_customer_id, status, current_period_end, created_at)
  values (target_account, fixture_subscription, 'cus_station_test', 'active', now() + interval '30 days', now() + interval '1 day');

  select needs_station into result from billing_private.clock_station_fulfillment where location_id = target_location;
  if result then raise exception 'An active subscription alone must not release hardware'; end if;

  insert into billing_private.station_payment_receipts
    (stripe_invoice_id, billing_account_id, stripe_subscription_id, amount_paid, currency, invoice_created_at, paid_at, includes_time_attendance)
  values (fixture_invoice, target_account, fixture_subscription, 2500, 'gbp', now(), now(), true);
  select needs_station into result from billing_private.clock_station_fulfillment where location_id = target_location;
  if not result then raise exception 'A qualifying paid T&A customer must enter the queue'; end if;

  update billing_private.location_entitlements set trial_ends_at = now() + interval '1 day' where location_id = target_location;
  select needs_station into result from billing_private.clock_station_fulfillment where location_id = target_location;
  if result then raise exception 'A current trial must not release hardware'; end if;
  update billing_private.location_entitlements set trial_ends_at = now() - interval '1 day' where location_id = target_location;

  update public.billing_subscriptions set status = 'past_due' where stripe_subscription_id = fixture_subscription;
  select needs_station into result from billing_private.clock_station_fulfillment where location_id = target_location;
  if result then raise exception 'Overdue subscriptions must be held'; end if;
  update public.billing_subscriptions set status = 'active' where stripe_subscription_id = fixture_subscription;

  update billing_private.station_payment_receipts set includes_time_attendance = false where stripe_invoice_id = fixture_invoice;
  select needs_station into result from billing_private.clock_station_fulfillment where location_id = target_location;
  if result then raise exception 'Core-only payment must not release hardware'; end if;
  update billing_private.station_payment_receipts set includes_time_attendance = true where stripe_invoice_id = fixture_invoice;

  update billing_private.location_addons set billing_starts_at = now() + interval '1 day' where location_id = target_location;
  select needs_station into result from billing_private.clock_station_fulfillment where location_id = target_location;
  if result then raise exception 'Payment before add-on activation must not qualify'; end if;
  update billing_private.location_addons set billing_starts_at = now() - interval '1 day', status = 'canceled' where location_id = target_location;
  select needs_station into result from billing_private.clock_station_fulfillment where location_id = target_location;
  if result then raise exception 'Canceled add-ons must be held'; end if;
  update billing_private.location_addons set status = 'active' where location_id = target_location;

  update billing_private.location_hardware_entitlements set fulfillment_status = 'ready' where location_id = target_location;
  select needs_station into result from billing_private.clock_station_fulfillment where location_id = target_location;
  if not result then raise exception 'Ready stations must remain in the dispatch queue'; end if;
  update billing_private.location_hardware_entitlements set fulfillment_status = 'shipped' where location_id = target_location;
  select needs_station into result from billing_private.clock_station_fulfillment where location_id = target_location;
  if result then raise exception 'Sent stations must leave the queue'; end if;

  if has_table_privilege('anon', 'billing_private.station_payment_receipts', 'select')
    or has_table_privilege('authenticated', 'billing_private.clock_station_fulfillment', 'select')
    or has_table_privilege('authenticated', 'billing_private.station_admin_alerts', 'select')
  then raise exception 'Operations data must remain private'; end if;
end $$;
select 'station fulfilment integration checks passed' as result;
