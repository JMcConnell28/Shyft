create table if not exists public.shift_swap_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('swap', 'cover')),
  status text not null check (
    status in (
      'awaiting_peer',
      'open',
      'pending_manager',
      'approved',
      'denied',
      'cancelled',
      'expired'
    )
  ),
  rota_id uuid not null references public.rotas(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  source_published_shift_id uuid not null references public.rota_published_shifts(id) on delete cascade,
  source_assignment_id uuid not null references public.rota_published_shift_assignments(id) on delete cascade,
  source_working_shift_id uuid references public.rota_shifts(id) on delete set null,
  requester_employee_id uuid not null references public.employees(id) on delete cascade,
  requester_user_id text not null references public."user"(id) on delete cascade,
  target_employee_id uuid references public.employees(id) on delete set null,
  target_published_shift_id uuid references public.rota_published_shifts(id) on delete set null,
  target_assignment_id uuid references public.rota_published_shift_assignments(id) on delete set null,
  target_working_shift_id uuid references public.rota_shifts(id) on delete set null,
  accepted_response_id uuid,
  manager_user_id text references public."user"(id) on delete set null,
  manager_note text,
  cutoff_at timestamptz not null,
  approved_at timestamptz,
  denied_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (
    (request_type = 'swap' and status <> 'open')
    or (request_type = 'cover' and status <> 'awaiting_peer')
  ),
  check (
    request_type <> 'swap'
    or (
      target_employee_id is not null
      and target_published_shift_id is not null
      and target_assignment_id is not null
    )
  )
);

create table if not exists public.shift_swap_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.shift_swap_requests(id) on delete cascade,
  responder_employee_id uuid not null references public.employees(id) on delete cascade,
  responder_user_id text not null references public."user"(id) on delete cascade,
  responder_assignment_id uuid references public.rota_published_shift_assignments(id) on delete set null,
  status text not null default 'pending' check (
    status in ('pending', 'accepted', 'declined', 'withdrawn', 'approved', 'denied')
  ),
  responded_at timestamptz,
  manager_handled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.shift_swap_requests
  add constraint shift_swap_requests_accepted_response_id_fkey
  foreign key (accepted_response_id)
  references public.shift_swap_responses(id)
  on delete set null;

create unique index if not exists shift_swap_requests_active_source_assignment_uidx
  on public.shift_swap_requests (source_assignment_id)
  where status in ('awaiting_peer', 'open', 'pending_manager');

create index if not exists shift_swap_requests_manager_queue_idx
  on public.shift_swap_requests (location_id, status, created_at);

create index if not exists shift_swap_requests_requester_idx
  on public.shift_swap_requests (requester_employee_id, status, created_at desc);

create index if not exists shift_swap_requests_target_idx
  on public.shift_swap_requests (target_employee_id, status, created_at desc);

create index if not exists shift_swap_responses_request_lookup_idx
  on public.shift_swap_responses (request_id, status, created_at desc);

create index if not exists shift_swap_responses_employee_lookup_idx
  on public.shift_swap_responses (responder_employee_id, status, created_at desc);

create unique index if not exists shift_swap_responses_active_employee_uidx
  on public.shift_swap_responses (request_id, responder_employee_id)
  where status in ('pending', 'accepted');

alter table public.shift_swap_requests enable row level security;
alter table public.shift_swap_responses enable row level security;

drop policy if exists "shift_swap_requests_select_participant_or_manager"
  on public.shift_swap_requests;
create policy "shift_swap_requests_select_participant_or_manager"
on public.shift_swap_requests
for select
to public
using (
  public.has_location_role(location_id, array['owner', 'admin', 'manager'])
  or requester_user_id = public.current_better_auth_user_id()
  or exists (
    select 1
    from public.employees employee
    where employee.id = shift_swap_requests.target_employee_id
      and employee.user_id = public.current_better_auth_user_id()
  )
  or exists (
    select 1
    from public.shift_swap_responses response
    where response.request_id = shift_swap_requests.id
      and response.responder_user_id = public.current_better_auth_user_id()
  )
  or (
    shift_swap_requests.request_type = 'cover'
    and shift_swap_requests.status = 'open'
    and exists (
      select 1
      from public.employees requester
      join public.employees responder
        on responder.organization_id is not distinct from requester.organization_id
       and responder.staff_group_id is not distinct from requester.staff_group_id
      join public.employee_location_assignments assignment
        on assignment.employee_id = responder.id
       and assignment.location_id = shift_swap_requests.location_id
       and assignment.is_enabled = true
       and assignment.disabled_at is null
      where requester.id = shift_swap_requests.requester_employee_id
        and responder.user_id = public.current_better_auth_user_id()
        and responder.status = 'active'
        and responder.id <> shift_swap_requests.requester_employee_id
    )
  )
);

drop policy if exists "shift_swap_requests_insert_server_only"
  on public.shift_swap_requests;
create policy "shift_swap_requests_insert_server_only"
on public.shift_swap_requests
for insert
to public
with check (false);

drop policy if exists "shift_swap_requests_update_server_only"
  on public.shift_swap_requests;
create policy "shift_swap_requests_update_server_only"
on public.shift_swap_requests
for update
to public
using (false)
with check (false);

drop policy if exists "shift_swap_requests_delete_server_only"
  on public.shift_swap_requests;
create policy "shift_swap_requests_delete_server_only"
on public.shift_swap_requests
for delete
to public
using (false);

drop policy if exists "shift_swap_responses_select_participant_or_manager"
  on public.shift_swap_responses;
create policy "shift_swap_responses_select_participant_or_manager"
on public.shift_swap_responses
for select
to public
using (
  responder_user_id = public.current_better_auth_user_id()
  or exists (
    select 1
    from public.shift_swap_requests request
    where request.id = shift_swap_responses.request_id
      and (
        request.requester_user_id = public.current_better_auth_user_id()
        or public.has_location_role(request.location_id, array['owner', 'admin', 'manager'])
        or exists (
          select 1
          from public.employees employee
          where employee.id = request.target_employee_id
            and employee.user_id = public.current_better_auth_user_id()
        )
      )
  )
);

drop policy if exists "shift_swap_responses_insert_server_only"
  on public.shift_swap_responses;
create policy "shift_swap_responses_insert_server_only"
on public.shift_swap_responses
for insert
to public
with check (false);

drop policy if exists "shift_swap_responses_update_server_only"
  on public.shift_swap_responses;
create policy "shift_swap_responses_update_server_only"
on public.shift_swap_responses
for update
to public
using (false)
with check (false);

drop policy if exists "shift_swap_responses_delete_server_only"
  on public.shift_swap_responses;
create policy "shift_swap_responses_delete_server_only"
on public.shift_swap_responses
for delete
to public
using (false);
