insert into admin_private.feature_flags (key, name, description, is_enabled, default_value)
values (
  'company.sage_employee_import',
  'Sage employee imports',
  'Import Sage employee payroll references. Existing references, manual edits and Sage timesheet exports remain available.',
  true,
  'true'::jsonb
)
on conflict (key) do nothing;
