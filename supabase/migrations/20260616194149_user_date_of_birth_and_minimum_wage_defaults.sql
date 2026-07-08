alter table public."user"
  add column if not exists "dateOfBirth" date;

alter table public."user"
  drop constraint if exists user_date_of_birth_check;

alter table public."user"
  add constraint user_date_of_birth_check
  check (
    "dateOfBirth" is null
    or (
      "dateOfBirth" <= current_date
      and "dateOfBirth" >= (current_date - interval '120 years')::date
    )
  );

update public.employee_compensation compensation
set hourly_rate_pence = case
    when age(current_date, user_account."dateOfBirth") >= interval '21 years'
      then 1271
    when age(current_date, user_account."dateOfBirth") >= interval '18 years'
      then 1085
    else 800
  end,
  updated_at = timezone('utc', now())
from public.employees employee
join public."user" user_account on user_account.id = employee.user_id
where compensation.employee_id = employee.id
  and compensation.pay_type = 'hourly'
  and compensation.hourly_rate_pence = 1271
  and user_account."dateOfBirth" is not null;
