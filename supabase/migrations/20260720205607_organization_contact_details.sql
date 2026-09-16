alter table public."organization"
  add column if not exists contact_email text,
  add column if not exists contact_phone text;

comment on column public."organization".contact_email is
  'Primary workplace contact email shown in general settings.';

comment on column public."organization".contact_phone is
  'Primary workplace contact phone number shown in general settings.';
