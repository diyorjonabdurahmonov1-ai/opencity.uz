-- OpenCity — 0008: fuqaro o'zi yuborgan hisobotni o'zi o'chira oladi.

create policy "reports_delete_own" on public.reports
  for delete using (created_by = auth.uid());
