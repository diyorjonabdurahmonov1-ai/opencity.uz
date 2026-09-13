import { writeFileSync } from "fs";
import { REGIONS } from "../src/data/regions.js";

const CATEGORY_DEPTS = [
  ["roads", "Yo'l xo'jaligi boshqarmasi"],
  ["lighting", "Shahar yorug'lik tarmog'i"],
  ["waste", "Tozalik va obodonlashtirish boshqarmasi"],
  ["water", "Suv ta'minoti korxonasi"],
  ["transport", "Yo'lovchi transporti boshqarmasi"],
  ["parks", "Bog'-park xo'jaligi"],
  ["sidewalks", "Yo'l-transport infratuzilmasi boshqarmasi"],
  ["buildings", "Shahar qurilish nazorati"],
  ["safety", "Yo'l harakati xavfsizligi boshqarmasi"],
  ["environment", "Ekologiya nazorati boshqarmasi"],
  ["other", "Umumiy murojaatlar boshqarmasi"],
];

function esc(s) {
  return s.replace(/'/g, "''");
}

const rows = [];
for (const region of REGIONS) {
  for (const d of region.districts) {
    for (const [cat, dept] of CATEGORY_DEPTS) {
      const name = `${d.name} — ${dept}`;
      rows.push(`  ('${esc(name)}', 'government', '${esc(region.name)}', '${esc(d.name)}', '${cat}', 'Davlat idorasi', '${esc(region.name)}')`);
    }
  }
}

const sql = `-- OpenCity — 0002: butun O'zbekiston bo'yicha viloyat/tuman qo'llab-quvvatlash.
-- Bu fayl avtomatik generatsiya qilingan (scripts/gen-migration.mjs, ${new Date().toISOString().slice(0, 10)}).
-- 0001_init.sql allaqachon ishga tushirilgan loyihalarda shu faylni SQL Editor'da qo'shimcha ishga tushiring.
--
-- DIQQAT: bu migratsiya eski 110 ta Toshkent-only davlat bo'limini o'chirib, ularning o'rniga
-- barcha 14 hudud (viloyat/shahar) x barcha tuman/shahar x 11 turkum uchun (~${rows.length} ta) yangi
-- bo'lim yaratadi. Agar sizda allaqachon shu eski bo'limlarga bog'langan (assigned_org_id) haqiqiy
-- hisobot(lar) mavjud bo'lsa, DELETE qadami xatolik beradi (FOREIGN KEY constraint) — bu holatda
-- avval o'sha test hisobotlarini o'chiring, so'ng migratsiyani qayta ishga tushiring.

alter table public.profiles add column if not exists detected_region text;
alter table public.organizations add column if not exists region text;
alter table public.reports add column if not exists region text;

drop index if exists organizations_gov_dept_idx;

delete from public.organizations where kind = 'government';

create unique index organizations_gov_dept_idx
  on public.organizations (region, district, category)
  where kind = 'government';

insert into public.organizations (name, kind, region, district, category, type, city) values
${rows.join(",\n")};
`;

writeFileSync(new URL("../supabase/migrations/0002_nationwide_regions.sql", import.meta.url), sql, "utf8");
console.log(`Generated ${rows.length} government org rows.`);
