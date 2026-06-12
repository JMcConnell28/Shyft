alter table public.staff_groups
add column if not exists color text not null default 'slate';

alter table public.staff_groups
drop constraint if exists staff_groups_color_check;

alter table public.staff_groups
add constraint staff_groups_color_check
check (
  color in (
    'slate',
    'sky',
    'emerald',
    'amber',
    'rose',
    'violet',
    'cyan',
    'orange'
  )
);
