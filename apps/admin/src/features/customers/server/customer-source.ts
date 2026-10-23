// Start with organizations, including those that have not completed onboarding.
// Legacy standalone accounts remain visible as separate customers.
const customerSourceSql = `
  with customer_source as (
    select 'org:' || o.id as id, o.id as organization_id, null::uuid as standalone_account_id,
           o.name, o.contact_email, o."createdAt" as created_at
    from public.organization o
    union all
    select 'account:' || a.id::text, null, a.id,
           coalesce(l.name, 'Standalone customer'), null, a.created_at
    from public.billing_accounts a
    left join public.locations l on l.id = a.location_id
    where a.organization_id is null
  ), customer_data as (
    select c.id, c.name, coalesce(c.contact_email, owner.email, member_owner.email) as email,
           c.created_at,
           coalesce(locations.trial_ends_at, trial.trial_ends_at, onboarding.trial_ends_at) as trial_ends_at,
           coalesce(subscription.status,
             case when coalesce(locations.trial_ends_at, trial.trial_ends_at, onboarding.trial_ends_at) > now() then 'trial'
                  when coalesce(locations.trial_ends_at, trial.trial_ends_at, onboarding.trial_ends_at) is not null then 'trial_expired'
                  else 'onboarding' end) as stage,
           locations.location_count, locations.addon_count,
           (select count(*) from billing_private.station_fulfillment_requests r where (r.organization_id = c.organization_id or r.billing_account_id = c.standalone_account_id) and r.needs_station) as stations_needed
    from customer_source c
    left join lateral (
      select a.* from public.billing_accounts a
      where a.organization_id = c.organization_id or a.id = c.standalone_account_id
      order by (a.scope = 'organization') desc, a.created_at desc limit 1
    ) account on true
    left join public."user" owner on owner.id = account.owner_user_id
    left join lateral (
      select u.email from public.member m join public."user" u on u.id = m."userId"
      where m."organizationId" = c.organization_id and m.role = 'owner'
      order by m."createdAt", m.id limit 1
    ) member_owner on true
    left join lateral (
      select case when status = 'trialing' then 'trial' else status end as status
      from public.billing_subscriptions where billing_account_id = account.id
      order by created_at desc, id desc limit 1
    ) subscription on true
    left join public.workspace_trials trial on trial.organization_id = c.organization_id
    left join public.organization_onboarding_states onboarding on onboarding.organization_id = c.organization_id
    left join lateral (
      select count(*) as location_count, min(s.trial_ends_at) as trial_ends_at,
        count(*) filter (where s.addon_status in ('trialing','active','canceling')) as addon_count
      from billing_private.clock_station_fulfillment s
      where s.organization_id = c.organization_id or s.billing_account_id = c.standalone_account_id
    ) locations on true
  )`

export { customerSourceSql }
