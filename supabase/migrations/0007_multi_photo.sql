-- OpenCity — 0007: hisobotga bir nechta rasm biriktirish imkoniyati.

alter table public.reports add column if not exists photos text[] not null default '{}';
