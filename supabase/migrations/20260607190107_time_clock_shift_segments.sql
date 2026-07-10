alter table public.time_entries
add column if not exists shift_segment text not null default 'full'
check (shift_segment in ('full', 'split_first', 'split_second'));

create index if not exists time_entries_shift_segment_lookup_idx
on public.time_entries (employee_id, rota_published_shift_id, shift_segment)
where rota_published_shift_id is not null;
