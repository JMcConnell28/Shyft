insert into admin_private.feature_flags(key,name,description,is_enabled,default_value)
values ('rota.budget_manager','Budget manager',
  'Set and edit weekly budgets, view budget suggestions and show budget warnings. Saved budgets are retained when disabled.',
  true,'true'::jsonb)
on conflict(key) do nothing;
