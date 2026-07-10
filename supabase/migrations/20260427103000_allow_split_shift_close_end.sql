alter table public.rota_shifts
  drop constraint if exists rota_shifts_check;

alter table public.rota_shifts
  add constraint rota_shifts_check
  check (
    (
      shift_type = 'standard'
      and end_time is not null
      and end_kind is null
      and split_second_start_time is null
      and split_second_end_time is null
    )
    or (
      shift_type = 'closing'
      and end_time is null
      and end_kind = 'location_close'
      and split_second_start_time is null
      and split_second_end_time is null
    )
    or (
      shift_type = 'split'
      and end_time is not null
      and split_second_start_time is not null
      and (
        (end_kind is null and split_second_end_time is not null)
        or (end_kind = 'location_close' and split_second_end_time is null)
      )
    )
  );

alter table public.rota_published_shifts
  drop constraint if exists rota_published_shifts_check;

alter table public.rota_published_shifts
  add constraint rota_published_shifts_check
  check (
    (
      shift_type = 'standard'
      and end_time is not null
      and end_kind is null
      and split_second_start_time is null
      and split_second_end_time is null
    )
    or (
      shift_type = 'closing'
      and end_time is null
      and end_kind = 'location_close'
      and split_second_start_time is null
      and split_second_end_time is null
    )
    or (
      shift_type = 'split'
      and end_time is not null
      and split_second_start_time is not null
      and (
        (end_kind is null and split_second_end_time is not null)
        or (end_kind = 'location_close' and split_second_end_time is null)
      )
    )
  );
