-- The course's own Supabase project (EU, course only, no client data).
-- Decided 2026-10-09: per-learner progress in Supabase — an explicit exception
-- for this course only; see README.

-- 1. Only company accounts may become users. Wired as a "Before user created"
--    Auth Hook (Dashboard → Authentication → Hooks). Server-side, so a crafted
--    sign-in from another domain never gets an account at all.
create or replace function public.hook_course_company_only(event jsonb)
returns jsonb
language plpgsql
as $$
declare
  email text := lower(coalesce(event->'user'->>'email', ''));
begin
  if email like '%@first-edea.com' then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'error', jsonb_build_object('http_code', 403, 'message', 'The course is open to first-edea.com accounts only.')
  );
end;
$$;

grant execute on function public.hook_course_company_only to supabase_auth_admin;
revoke execute on function public.hook_course_company_only from authenticated, anon, public;

-- 2. Progress: one row per learner per item (a prediction, an exercise, a lesson).
create table if not exists public.progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  key text not null check (length(key) between 1 and 200),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.progress enable row level security;

-- A learner reads and writes only their own rows, and only with a company email.
create policy "own rows, company accounts" on public.progress
  for all
  to authenticated
  using (user_id = (select auth.uid()) and lower((select auth.jwt()) ->> 'email') like '%@first-edea.com')
  with check (user_id = (select auth.uid()) and lower((select auth.jwt()) ->> 'email') like '%@first-edea.com');
