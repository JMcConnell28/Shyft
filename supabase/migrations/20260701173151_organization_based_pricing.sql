alter table public."organization"
  add column if not exists status text not null default 'active',
  add column if not exists merged_into_organization_id text references public."organization"("id") on delete set null,
  add column if not exists merged_at timestamptz,
  add constraint organization_status_check check (status in ('active', 'merged'));

create index if not exists organization_merged_into_idx
  on public."organization" (merged_into_organization_id)
  where merged_into_organization_id is not null;

alter table billing_private.billing_subscription_items
  drop constraint if exists billing_subscription_items_item_type_check;

alter table billing_private.billing_subscription_items
  add constraint billing_subscription_items_item_type_check
  check (
    item_type in (
      'core_base',
      'core_extra_employee',
      'time_attendance_employee',
      'location',
      'time_attendance',
      'employee_overage',
      'legacy'
    )
  );

do $$
declare
  standalone_location record;
  created_organization_id text;
  created_organization_slug text;
  owner_user_id text;
begin
  for standalone_location in
    select id, name, slug, created_at
    from public.locations
    where organization_id is null
    order by created_at, id
  loop
    created_organization_id := gen_random_uuid()::text;
    created_organization_slug := standalone_location.slug;

    while exists (
      select 1
      from public."organization"
      where "slug" = created_organization_slug
    ) loop
      created_organization_slug := standalone_location.slug || '-' || left(gen_random_uuid()::text, 8);
    end loop;

    select user_id into owner_user_id
    from public.location_memberships
    where location_id = standalone_location.id
      and role in ('owner', 'admin')
    order by case role when 'owner' then 0 else 1 end, created_at
    limit 1;

    insert into public."organization" (
      "id",
      "name",
      "slug",
      "createdAt",
      "metadata"
    ) values (
      created_organization_id,
      standalone_location.name,
      created_organization_slug,
      standalone_location.created_at,
      jsonb_build_object('createdFrom', 'standalone_location_wrap')::text
    );

    if owner_user_id is not null then
      insert into public."member" (
        "id",
        "organizationId",
        "userId",
        "role",
        "createdAt"
      ) values (
        gen_random_uuid()::text,
        created_organization_id,
        owner_user_id,
        'owner',
        timezone('utc', now())
      )
      on conflict do nothing;
    end if;

    insert into public.organization_onboarding_states (
      organization_id,
      trial_started_at,
      trial_ends_at,
      last_step,
      completed_at
    )
    select
      created_organization_id,
      entitlement.trial_started_at,
      entitlement.trial_ends_at,
      'complete',
      timezone('utc', now())
    from billing_private.location_entitlements entitlement
    where entitlement.location_id = standalone_location.id
    on conflict (organization_id) do nothing;

    insert into public.workspace_trials (
      scope,
      organization_id,
      status,
      trial_started_at,
      trial_ends_at
    )
    select
      'organization',
      created_organization_id,
      case
        when entitlement.trial_ends_at <= timezone('utc', now()) then 'expired'
        else 'trialing'
      end,
      entitlement.trial_started_at,
      entitlement.trial_ends_at
    from billing_private.location_entitlements entitlement
    where entitlement.location_id = standalone_location.id
    on conflict (organization_id)
    where organization_id is not null
    do nothing;

    update public.locations
    set organization_id = created_organization_id,
        updated_at = timezone('utc', now())
    where id = standalone_location.id;

    update public.zones
    set organization_id = created_organization_id,
        updated_at = timezone('utc', now())
    where location_id = standalone_location.id
      and organization_id is null;

    update public.staff_groups
    set organization_id = created_organization_id,
        updated_at = timezone('utc', now())
    where location_id = standalone_location.id
      and organization_id is null;

    update public.employees
    set organization_id = created_organization_id,
        updated_at = timezone('utc', now())
    where location_id = standalone_location.id
      and organization_id is null;

    update public.employee_location_assignments
    set organization_id = created_organization_id
    where location_id = standalone_location.id
      and organization_id is null;

    update public.staff_invite_links
    set organization_id = created_organization_id
    where location_id = standalone_location.id
      and organization_id is null;

    update public.rota_templates
    set organization_id = created_organization_id,
        updated_at = timezone('utc', now())
    where location_id = standalone_location.id
      and organization_id is null;

    update public.rotas
    set organization_id = created_organization_id,
        updated_at = timezone('utc', now())
    where location_id = standalone_location.id
      and organization_id is null;

    update public.location_operating_hours
    set organization_id = created_organization_id
    where location_id = standalone_location.id
      and organization_id is null;
  end loop;
end $$;

insert into public.billing_accounts (
  scope,
  organization_id,
  owner_user_id,
  status
)
select distinct on (organization_row."id")
  'organization',
  organization_row."id",
  member_row."userId",
  'incomplete'
from public."organization" organization_row
left join public."member" member_row
  on member_row."organizationId" = organization_row."id"
 and member_row.role like '%owner%'
where not exists (
  select 1
  from public.billing_accounts existing_account
  where existing_account.scope = 'organization'
    and existing_account.organization_id = organization_row."id"
)
order by organization_row."id", member_row."createdAt" nulls last;

update public.locations location
set billing_account_id = organization_account.id,
    updated_at = timezone('utc', now())
from public.billing_accounts organization_account
where organization_account.scope = 'organization'
  and organization_account.organization_id = location.organization_id
  and location.billing_account_id is distinct from organization_account.id;

insert into billing_private.billing_account_administrators (
  billing_account_id,
  user_id,
  role,
  created_by_user_id
)
select account.id, member_row."userId", 'owner', member_row."userId"
from public.billing_accounts account
join public."member" member_row
  on member_row."organizationId" = account.organization_id
where account.scope = 'organization'
  and member_row.role like '%owner%'
on conflict (billing_account_id, user_id) do update
set role = 'owner';

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

  if new.organization_id is null then
    raise exception 'Locations must belong to an organization.';
  end if;

  select id into created_billing_account_id
  from public.billing_accounts
  where scope = 'organization'
    and organization_id = new.organization_id
  limit 1;

  if created_billing_account_id is null then
    insert into public.billing_accounts (
      scope,
      organization_id
    ) values (
      'organization',
      new.organization_id
    )
    returning id into created_billing_account_id;
  end if;

  new.billing_account_id := created_billing_account_id;

  return new;
end;
$$;

alter table public.locations
  alter column organization_id set not null;

alter table public.zones
  alter column organization_id set not null;

alter table public.employee_location_assignments
  alter column organization_id set not null;

alter table public.staff_invite_links
  alter column organization_id set not null;

alter table public.rotas
  alter column organization_id set not null;

alter table public.rota_templates
  alter column organization_id set not null;

alter table public.location_operating_hours
  alter column organization_id set not null;
