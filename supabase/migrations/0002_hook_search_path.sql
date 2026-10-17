-- Advisor fix: the auth hook runs with an empty search_path.
alter function public.hook_course_company_only(jsonb) set search_path = '';
