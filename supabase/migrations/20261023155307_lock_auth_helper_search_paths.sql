-- All application-object references in these helpers are schema-qualified.
-- Resolve builtins through pg_catalog, never a caller-controlled search path.
alter function public.request_header(text) set search_path = '';
alter function public.request_cookie(text) set search_path = '';
alter function public.current_better_auth_session_token() set search_path = '';
alter function public.set_user_onboarding_preferences_updated_at() set search_path = '';
