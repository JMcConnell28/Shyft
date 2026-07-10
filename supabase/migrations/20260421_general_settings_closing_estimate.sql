alter table public."organization"
  add column if not exists "estimatedClosingTime" time not null default '23:00';
