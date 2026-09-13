-- OpenCity — 0006: admin imkoniyatlarini kengaytirish
-- (foydalanuvchini bloklash, hisobotni o'chirish, tashkilotni faolsizlantirish).

alter table public.profiles add column if not exists banned boolean not null default false;
alter table public.organizations add column if not exists active boolean not null default true;

create or replace function public.current_banned()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select banned from public.profiles where id = auth.uid()), false);
$$;

-- Bloklangan foydalanuvchi yangi hisobot/ovoz/ariza yubora olmaydi.
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own" on public.reports
  for insert with check (created_by = auth.uid() and not public.current_banned());

drop policy if exists "report_votes_insert_own" on public.report_votes;
create policy "report_votes_insert_own" on public.report_votes
  for insert with check (user_id = auth.uid() and not public.current_banned());

drop policy if exists "org_applications_insert_own" on public.org_applications;
create policy "org_applications_insert_own" on public.org_applications
  for insert with check (created_by = auth.uid() and not public.current_banned());

-- Admin hisobotni butunlay o'chira oladi (soxta/spam holatlar uchun).
create policy "reports_delete_admin" on public.reports
  for delete using (public.current_role() = 'admin');
