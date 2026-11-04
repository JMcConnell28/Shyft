-- The app uses Postgres and server-only Supabase clients. Browser roles have no
-- supported direct application Data API. Keep service-role grants unchanged.
set local lock_timeout = '5s';
revoke create on schema public from public, anon, authenticated;
revoke all on schema admin_private, billing_private, push_private, account_private, privacy_private from public, anon, authenticated;

do $$
declare
  object record;
  columns text;
begin
  for object in
    select c.oid, n.nspname, c.relname, c.relkind
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname in ('public','admin_private','billing_private','push_private','account_private','privacy_private')
      and c.relkind in ('r','p','v','m','f','S')
      and not exists (select 1 from pg_depend d where d.classid = 'pg_class'::regclass and d.objid = c.oid and d.deptype = 'e')
  loop
    if object.relkind = 'S' then
      execute format('revoke all on sequence %I.%I from public, anon, authenticated', object.nspname, object.relname);
    else
      execute format('revoke all on table %I.%I from public, anon, authenticated', object.nspname, object.relname);
      select string_agg(quote_ident(attname), ', ' order by attnum) into columns
        from pg_attribute where attrelid = object.oid and attnum > 0 and not attisdropped;
      if columns is not null then
        execute format('revoke all privileges (%s) on table %I.%I from public, anon, authenticated', columns, object.nspname, object.relname);
      end if;
      if object.nspname <> 'public' and object.relkind in ('r','p') then
        execute format('alter table %I.%I enable row level security', object.nspname, object.relname);
        if not exists (select 1 from pg_policy where polrelid = object.oid and polname = 'application_server_access') then
          execute format('create policy application_server_access on %I.%I for all to service_role using (true) with check (true)', object.nspname, object.relname);
        end if;
      end if;
    end if;
  end loop;

  for object in
    select n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as arguments
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname in ('public','admin_private','billing_private','push_private','account_private','privacy_private')
      and not exists (select 1 from pg_depend d where d.classid = 'pg_proc'::regclass and d.objid = p.oid and d.deptype = 'e')
  loop
    execute format('revoke execute on routine %I.%I(%s) from public, anon, authenticated', object.nspname, object.proname, object.arguments);
  end loop;
end;
$$;

-- PostgreSQL's built-in PUBLIC function privilege is global: a schema-only
-- revoke cannot cancel it. Remove global browser defaults as well as old
-- schema-specific grants, without changing platform-owned creators.
alter default privileges for role postgres revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres revoke all on sequences from public, anon, authenticated;
do $$
declare application_schema text;
begin
  foreach application_schema in array array['public','admin_private','billing_private','push_private','account_private','privacy_private'] loop
    execute format('alter default privileges for role postgres in schema %I revoke all on tables from public, anon, authenticated', application_schema);
    execute format('alter default privileges for role postgres in schema %I revoke all on sequences from public, anon, authenticated', application_schema);
    execute format('alter default privileges for role postgres in schema %I revoke execute on functions from public, anon, authenticated', application_schema);
  end loop;
end;
$$;

notify pgrst, 'reload schema';
