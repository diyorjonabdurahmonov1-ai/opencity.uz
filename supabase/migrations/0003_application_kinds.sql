-- OpenCity — 0003: arizalarni ikki turga ajratish (davlat bo'limi xodimi / tadbirkor).

alter table public.org_applications
  add column if not exists kind text not null default 'private' check (kind in ('government', 'private'));

alter table public.org_applications
  add column if not exists target_org_id uuid references public.organizations (id);
