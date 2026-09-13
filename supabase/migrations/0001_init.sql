-- OpenCity — boshlang'ich sxema: jadvallar, funksiyalar, trigger'lar, RLS, Storage, seed.
-- Supabase Dashboard → SQL Editor'ga to'liq nusxalab, "Run" bosing.

create extension if not exists pgcrypto;

-- ============================================================
-- JADVALLAR
-- ============================================================

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'private' check (kind in ('government', 'private')),
  district text,
  category text,
  type text,
  city text,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index organizations_gov_dept_idx
  on public.organizations (district, category)
  where kind = 'government';

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text not null default 'Fuqaro',
  role text not null default 'citizen' check (role in ('citizen', 'org', 'admin')),
  org_id uuid references public.organizations (id) on delete set null,
  detected_district text,
  home_lat double precision,
  home_lng double precision,
  created_at timestamptz not null default now()
);

create table public.org_applications (
  id uuid primary key default gen_random_uuid(),
  org_name text not null,
  org_type text,
  reg_number text,
  address text,
  city text,
  email text,
  phone text,
  contact_person text,
  contact_position text,
  description text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text,
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  title text not null,
  description text,
  photo_url text,
  district text not null,
  address text,
  coords jsonb,
  status text not null default 'submitted' check (status in (
    'submitted', 'under_review', 'assigned', 'in_progress',
    'waiting_info', 'resolved', 'neglected', 'rejected', 'closed'
  )),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  assigned_org_id uuid not null references public.organizations (id),
  resolution_photos text[] not null default '{}',
  created_by uuid not null references public.profiles (id) on delete cascade,
  created_by_name text,
  created_at timestamptz not null default now()
);

create table public.report_timeline (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports (id) on delete cascade,
  status text not null,
  at timestamptz not null default now(),
  by text,
  note text
);

create table public.report_votes (
  report_id uuid not null references public.reports (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

create table public.report_reopen_votes (
  report_id uuid not null references public.reports (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (report_id, user_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text,
  type text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index reports_assigned_org_id_idx on public.reports (assigned_org_id);
create index reports_created_by_idx on public.reports (created_by);
create index reports_district_idx on public.reports (district);
create index report_timeline_report_id_idx on public.report_timeline (report_id);
create index notifications_user_id_idx on public.notifications (user_id);
create index org_applications_created_by_idx on public.org_applications (created_by);

-- ============================================================
-- YORDAMCHI FUNKSIYALAR (RLS siyosatlarida rekursiyani oldini olish uchun)
-- ============================================================

create function public.current_role()
returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.current_org_id()
returns uuid
language sql stable security definer set search_path = public as $$
  select org_id from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- TRIGGER'LAR
-- ============================================================

create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', 'Fuqaro')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.notify_on_timeline_insert()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_report public.reports%rowtype;
begin
  select * into v_report from public.reports where id = new.report_id;
  if v_report.created_by is not null and v_report.created_by <> auth.uid() then
    insert into public.notifications (user_id, title, message, type)
    values (
      v_report.created_by,
      'Hisobot holati yangilandi',
      coalesce(new.note, '"' || v_report.title || '" hisobotining holati o''zgardi.'),
      case when new.status in ('resolved', 'closed') then 'success' else 'info' end
    );
  end if;
  return new;
end;
$$;

create trigger on_timeline_insert
  after insert on public.report_timeline
  for each row execute function public.notify_on_timeline_insert();

create function public.notify_on_application_decision()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status <> old.status and new.status in ('approved', 'rejected') then
    insert into public.notifications (user_id, title, message, type)
    values (
      new.created_by,
      case when new.status = 'approved' then 'Tashkilot tasdiqlandi' else 'Ariza rad etildi' end,
      case when new.status = 'approved'
        then '"' || new.org_name || '" tashkiloti tasdiqlandi. Endi Tashkilot Portaliga kirishingiz mumkin.'
        else coalesce('Sabab: ' || new.rejection_reason, 'Arizangiz rad etildi.')
      end,
      case when new.status = 'approved' then 'success' else 'warn' end
    );
  end if;
  return new;
end;
$$;

create trigger on_application_decision
  after update on public.org_applications
  for each row execute function public.notify_on_application_decision();

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.org_applications enable row level security;
alter table public.reports enable row level security;
alter table public.report_timeline enable row level security;
alter table public.report_votes enable row level security;
alter table public.report_reopen_votes enable row level security;
alter table public.notifications enable row level security;

-- profiles: har kim faqat o'zinikini, admin — hammasini
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.current_role() = 'admin');
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.current_role() = 'admin');

-- organizations: nomlarini hamma ko'radi, faqat admin yozadi
create policy "organizations_select_all" on public.organizations
  for select using (auth.role() = 'authenticated');
create policy "organizations_admin_write" on public.organizations
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- org_applications: arizachi va admin ko'radi, faqat admin qaror qiladi
create policy "org_applications_select_own_or_admin" on public.org_applications
  for select using (created_by = auth.uid() or public.current_role() = 'admin');
create policy "org_applications_insert_own" on public.org_applications
  for insert with check (created_by = auth.uid());
create policy "org_applications_update_admin" on public.org_applications
  for update using (public.current_role() = 'admin');

-- reports: o'qish uchun ochiq (xarita/ovoz berish), yozish — faqat o'zi/tayinlangan bo'lim/admin
create policy "reports_select_all" on public.reports
  for select using (auth.role() = 'authenticated');
create policy "reports_insert_own" on public.reports
  for insert with check (created_by = auth.uid());
create policy "reports_update_own_org_or_admin" on public.reports
  for update using (
    created_by = auth.uid()
    or public.current_org_id() = assigned_org_id
    or public.current_role() = 'admin'
  );

-- report_timeline: o'qish ochiq, yozish — hisobot egasi/tayinlangan bo'lim/admin
create policy "report_timeline_select_all" on public.report_timeline
  for select using (auth.role() = 'authenticated');
create policy "report_timeline_insert_permitted" on public.report_timeline
  for insert with check (
    exists (
      select 1 from public.reports r
      where r.id = report_id
        and (
          r.created_by = auth.uid()
          or public.current_org_id() = r.assigned_org_id
          or public.current_role() = 'admin'
        )
    )
  );

-- report_votes / report_reopen_votes: o'qish ochiq, har kim faqat o'z ovozini qo'shadi/o'chiradi
create policy "report_votes_select_all" on public.report_votes
  for select using (auth.role() = 'authenticated');
create policy "report_votes_insert_own" on public.report_votes
  for insert with check (user_id = auth.uid());
create policy "report_votes_delete_own" on public.report_votes
  for delete using (user_id = auth.uid());

create policy "report_reopen_votes_select_all" on public.report_reopen_votes
  for select using (auth.role() = 'authenticated');
create policy "report_reopen_votes_insert_own" on public.report_reopen_votes
  for insert with check (user_id = auth.uid());
create policy "report_reopen_votes_delete_own" on public.report_reopen_votes
  for delete using (user_id = auth.uid());

-- notifications: faqat egasi ko'radi/o'qilgan deb belgilaydi; boshqasiga yozish faqat trigger orqali
create policy "notifications_select_own" on public.notifications
  for select using (user_id = auth.uid());
create policy "notifications_insert_own" on public.notifications
  for insert with check (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications
  for update using (user_id = auth.uid());

-- ============================================================
-- STORAGE: hisobot rasmlari
-- ============================================================

insert into storage.buckets (id, name, public)
values ('report-photos', 'report-photos', true)
on conflict (id) do nothing;

create policy "report_photos_public_read" on storage.objects
  for select using (bucket_id = 'report-photos');

create policy "report_photos_auth_insert" on storage.objects
  for insert with check (
    bucket_id = 'report-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "report_photos_owner_update" on storage.objects
  for update using (
    bucket_id = 'report-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "report_photos_owner_or_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'report-photos'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.current_role() = 'admin')
  );

-- ============================================================
-- SEED: har bir tuman x turkum uchun davlat bo'limi
-- ============================================================

with categories(category, dept_name) as (
  values
    ('roads', 'Yo''l xo''jaligi boshqarmasi'),
    ('lighting', 'Shahar yorug''lik tarmog''i'),
    ('waste', 'Tozalik va obodonlashtirish boshqarmasi'),
    ('water', 'Suv ta''minoti korxonasi'),
    ('transport', 'Yo''lovchi transporti boshqarmasi'),
    ('parks', 'Bog''-park xo''jaligi'),
    ('sidewalks', 'Yo''l-transport infratuzilmasi boshqarmasi'),
    ('buildings', 'Shahar qurilish nazorati'),
    ('safety', 'Yo''l harakati xavfsizligi boshqarmasi'),
    ('environment', 'Ekologiya nazorati boshqarmasi'),
    ('other', 'Umumiy murojaatlar boshqarmasi')
),
districts(district) as (
  values
    ('Yunusobod'), ('Chilonzor'), ('Mirzo Ulug''bek'), ('Shayxontohur'),
    ('Yakkasaroy'), ('Mirobod'), ('Bektemir'), ('Sergeli'), ('Uchtepa'), ('Olmazor')
)
insert into public.organizations (name, kind, district, category, type, city)
select d.district || ' — ' || c.dept_name, 'government', d.district, c.category, 'Davlat idorasi', 'Toshkent'
from districts d cross join categories c
on conflict (district, category) where kind = 'government' do nothing;
