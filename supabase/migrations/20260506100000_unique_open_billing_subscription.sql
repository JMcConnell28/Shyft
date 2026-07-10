delete from public.billing_subscriptions duplicate_subscription
using (
  select
    id,
    row_number() over (
      partition by billing_account_id
      order by created_at desc, updated_at desc
    ) as subscription_rank
  from public.billing_subscriptions
  where status in (
    'incomplete',
    'trialing',
    'active',
    'past_due',
    'unpaid',
    'paused'
  )
) ranked_subscription
where duplicate_subscription.id = ranked_subscription.id
  and ranked_subscription.subscription_rank > 1;

create unique index if not exists billing_subscriptions_one_open_per_account_uidx
  on public.billing_subscriptions (billing_account_id)
  where status in (
    'incomplete',
    'trialing',
    'active',
    'past_due',
    'unpaid',
    'paused'
  );
