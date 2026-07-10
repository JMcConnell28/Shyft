do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conrelid = 'public.billing_accounts'::regclass
      and conname = 'billing_accounts_location_id_fkey'
      and contype = 'f'
  ) then
    alter table public.billing_accounts
      alter constraint billing_accounts_location_id_fkey
      deferrable initially deferred;
  end if;
end;
$$;
