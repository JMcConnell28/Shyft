create schema if not exists rota_private;

revoke all on schema rota_private from public, anon, authenticated;
grant usage on schema rota_private to postgres, service_role;

alter table public.rotas
  add column content_version integer not null default 1 check (content_version > 0),
  add column published_content_version integer not null default 0 check (published_content_version >= 0),
  add column content_fingerprint text not null default '';

-- Preserve the existing publication sequence as the starting point.
update public.rotas
set content_version = greatest(published_version, 1)
      + case when has_unpublished_changes then 1 else 0 end,
    published_content_version = case when published_snapshot_version > 0
      then greatest(published_version, 1) else 0 end;

create or replace function rota_private.track_content_version()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  next_fingerprint text;
begin
  -- IDs are excluded: saving recreates shift rows without changing their content.
  with shift_content as (
    select jsonb_build_object(
      'day', shift.day_date,
      'zone', shift.zone_id,
      'zone_name', shift.zone_name_snapshot,
      'type', shift.shift_type,
      'start', shift.start_time,
      'end', shift.end_time,
      'end_kind', shift.end_kind,
      'second_start', shift.split_second_start_time,
      'second_end', shift.split_second_end_time,
      'employees', coalesce((
        select jsonb_agg(assignment.employee_id order by assignment.employee_id)
        from public.rota_shift_assignments assignment
        where assignment.rota_shift_id = shift.id
      ), '[]'::jsonb)
    ) as content
    from public.rota_shifts shift
    where shift.rota_id = new.id
  )
  select md5(jsonb_build_object(
    'week', new.week_start,
    'note', new.note,
    'shifts', coalesce((select jsonb_agg(content order by content) from shift_content), '[]'::jsonb)
  )::text) into next_fingerprint;

  if tg_op = 'INSERT' then
    new.content_version := 1;
    new.published_content_version := 0;
    new.content_fingerprint := next_fingerprint;
    return new;
  end if;

  new.content_version := old.content_version;
  if old.content_fingerprint <> '' and old.content_fingerprint <> next_fingerprint then
    new.content_version := old.content_version + 1;
  end if;
  new.content_fingerprint := next_fingerprint;
  new.published_content_version := old.published_content_version;
  if new.published_version <> old.published_version then
    new.published_content_version := new.content_version;
  end if;
  return new;
end;
$$;

revoke all on function rota_private.track_content_version() from public, anon, authenticated;
grant execute on function rota_private.track_content_version() to postgres, service_role;

create trigger rotas_track_content_version
before insert or update on public.rotas
for each row execute function rota_private.track_content_version();

-- Establish fingerprints without advancing any existing versions.
update public.rotas set content_fingerprint = '';
