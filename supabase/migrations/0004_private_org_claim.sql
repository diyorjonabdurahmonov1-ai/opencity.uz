-- OpenCity — 0004: xususiy tashkilotlar davlat bo'limiga tayinlangan (hali hal qilinmagan)
-- hisobotni o'zlariga "qabul qilib" ola olishlari uchun qo'shimcha RLS siyosati.

create policy "reports_claim_by_private_org" on public.reports
  for update using (
    public.current_role() = 'org'
    and exists (select 1 from public.organizations o where o.id = public.current_org_id() and o.kind = 'private')
    and exists (select 1 from public.organizations og where og.id = reports.assigned_org_id and og.kind = 'government')
    and reports.status not in ('resolved', 'closed')
  )
  with check (
    assigned_org_id = public.current_org_id()
  );
