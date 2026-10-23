-- Team/profile reads already go through authorised server functions. RLS filters
-- rows, not columns: browser roles must not read the sensitive base tables.
revoke all privileges on table public."user", public.employees
  from public, anon, authenticated;

-- Table-level REVOKE does not remove separately granted column privileges.
do $$
declare
  target_table text;
  column_names text;
begin
  foreach target_table in array array['user', 'employees'] loop
    select string_agg(format('%I', attname), ', ' order by attnum)
      into column_names
      from pg_attribute
      where attrelid = format('public.%I', target_table)::regclass
        and attnum > 0 and not attisdropped;
    execute format(
      'revoke all privileges (%s) on table public.%I from public, anon, authenticated',
      column_names, target_table
    );
  end loop;
end
$$;

-- The service_role and table owner retain their existing server access.
notify pgrst, 'reload schema';
