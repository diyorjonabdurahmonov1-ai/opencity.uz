-- OpenCity — 0005: tashkilotlar uchun logotip (brend rasmi).

alter table public.organizations add column if not exists logo_url text;

insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

create policy "org_logos_public_read" on storage.objects
  for select using (bucket_id = 'org-logos');

create policy "org_logos_admin_write" on storage.objects
  for insert with check (bucket_id = 'org-logos' and public.current_role() = 'admin');

create policy "org_logos_admin_update" on storage.objects
  for update using (bucket_id = 'org-logos' and public.current_role() = 'admin');

create policy "org_logos_admin_delete" on storage.objects
  for delete using (bucket_id = 'org-logos' and public.current_role() = 'admin');
