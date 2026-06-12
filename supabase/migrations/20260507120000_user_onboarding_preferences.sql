create table if not exists public.user_onboarding_preferences (
  user_id text primary key references public."user"(id) on delete cascade,
  intent text not null default 'manage',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_onboarding_preferences_intent_check
    check (intent in ('manage', 'join'))
);

create or replace function public.set_user_onboarding_preferences_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_onboarding_preferences_touch_updated_at
on public.user_onboarding_preferences;

create trigger user_onboarding_preferences_touch_updated_at
before update on public.user_onboarding_preferences
for each row
execute function public.set_user_onboarding_preferences_updated_at();
