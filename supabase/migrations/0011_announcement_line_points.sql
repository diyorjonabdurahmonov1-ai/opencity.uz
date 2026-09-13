-- OpenCity — 0011: ko'cha yopilishi e'lonlari uchun ixtiyoriy sondagi nuqtalardan iborat
-- (haqiqiy ko'cha shakliga mos) chiziq. Eski line_start/line_end/detour ustunlari
-- line_points/detour_points massivlariga almashtiriladi, mavjud ma'lumotlar saqlab qolinadi.

alter table public.announcements add column if not exists line_points jsonb;
alter table public.announcements add column if not exists detour_points jsonb;

update public.announcements
set line_points = jsonb_build_array(line_start, line_end)
where kind = 'line' and line_start is not null and line_end is not null and line_points is null;

update public.announcements
set detour_points = detour
where kind = 'line' and detour is not null and detour_points is null;

alter table public.announcements drop column if exists line_start;
alter table public.announcements drop column if exists line_end;
alter table public.announcements drop column if exists detour;
