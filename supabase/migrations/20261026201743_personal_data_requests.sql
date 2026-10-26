create schema if not exists privacy_private;
revoke all on schema privacy_private from public, anon, authenticated;
grant usage on schema privacy_private to postgres, service_role;

create table privacy_private.data_requests (
  id uuid primary key default gen_random_uuid(),
  user_id text references public."user"(id) on delete set null,
  subject_name text not null,
  subject_email text not null,
  status text not null default 'requested'
    check (status in ('requested','in_review','awaiting_workplace','ready','completed','expired')),
  requested_at timestamptz not null default now(),
  due_at timestamptz not null default now() + interval '1 month',
  original_due_at timestamptz not null default now() + interval '1 month',
  public_message text not null default 'Your request has been received. We will review your personal information and any workplace follow-up needed.',
  draft jsonb,
  draft_expires_at timestamptz,
  released_response jsonb,
  released_at timestamptz,
  expires_at timestamptz,
  downloaded_at timestamptz,
  revision integer not null default 0,
  check (draft is null or jsonb_typeof(draft) = 'object'),
  check (released_response is null or jsonb_typeof(released_response) = 'object'),
  check (status <> 'ready' or (released_response is not null and expires_at is not null)),
  check (char_length(public_message) <= 2000)
);
create unique index data_requests_one_pending_per_user
  on privacy_private.data_requests(user_id)
  where user_id is not null and status in ('requested','in_review','awaiting_workplace');
create index data_requests_user_history on privacy_private.data_requests(user_id, requested_at desc);
create index data_requests_queue on privacy_private.data_requests(status, due_at);
create index data_requests_expiry on privacy_private.data_requests(expires_at) where released_response is not null;

create table privacy_private.data_request_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references privacy_private.data_requests(id) on delete cascade,
  admin_user_id text references admin_private.admin_user(id) on delete set null,
  kind text not null check (kind in ('requested','updated','prepared','draft_saved','released','downloaded','expired')),
  public_message text not null default '',
  internal_note text not null default '',
  created_at timestamptz not null default now(),
  notify_user boolean not null default false,
  email_sent_at timestamptz,
  email_claimed_at timestamptz,
  email_attempts integer not null default 0,
  next_email_attempt_at timestamptz not null default now()
);
create index data_request_events_history on privacy_private.data_request_events(request_id, created_at);
create index data_request_events_outbox on privacy_private.data_request_events(next_email_attempt_at)
  where notify_user and email_sent_at is null;

alter table privacy_private.data_requests enable row level security;
alter table privacy_private.data_request_events enable row level security;
revoke all on all tables in schema privacy_private from public, anon, authenticated;
grant all on all tables in schema privacy_private to postgres, service_role;
comment on schema privacy_private is 'Server-only personal data access requests; never expose through the Data API.';
