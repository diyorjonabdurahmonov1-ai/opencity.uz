-- OpenCity — 0010: foydalanuvchi tanlagan interfeys tili (qurilmalar orasida sinxronlanadi).

alter table public.profiles add column if not exists language text not null default 'uz' check (language in ('uz', 'ru', 'en'));
