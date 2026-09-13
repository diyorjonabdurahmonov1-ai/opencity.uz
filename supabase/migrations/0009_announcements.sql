-- OpenCity — 0009: davlat tashkilotlari uchun e'lonlar (ko'cha yopilishi / hudud xizmati uzilishi).

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id),
  kind text not null check (kind in ('line', 'zone')),
  title text not null,
  description text,
  region text,
  district text,
  -- kind = 'line' uchun: ko'cha yopilgan qismning boshi/oxiri va (ixtiyoriy) aylanib o'tish yo'li
  line_start jsonb,
  line_end jsonb,
  detour jsonb,
  -- kind = 'zone' uchun: markaz nuqta + radius (metrda) — ta'sirlangan hudud doirasi
  zone_center jsonb,
  zone_radius double precision,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create index announcements_org_id_idx on public.announcements (org_id);

alter table public.announcements enable row level security;

-- Hammaga ochiq — fuqarolar xaritada ko'radi
create policy "announcements_select_all" on public.announcements
  for select using (auth.role() = 'authenticated');

-- Faqat davlat tashkiloti xodimi, faqat o'z tashkiloti nomidan e'lon joylay oladi
create policy "announcements_insert_gov_org" on public.announcements
  for insert with check (
    public.current_role() = 'org'
    and org_id = public.current_org_id()
    and exists (select 1 from public.organizations o where o.id = public.current_org_id() and o.kind = 'government')
  );

create policy "announcements_update_own_org_or_admin" on public.announcements
  for update using (org_id = public.current_org_id() or public.current_role() = 'admin');

create policy "announcements_delete_own_org_or_admin" on public.announcements
  for delete using (org_id = public.current_org_id() or public.current_role() = 'admin');
