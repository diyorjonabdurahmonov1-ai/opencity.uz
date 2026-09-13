# Supabase sozlash

## 1. Migratsiyalarni ishga tushirish

1. https://supabase.com dagi loyihangizni oching.
2. Chap menyudan **SQL Editor** → **New query**.
3. `migrations/0001_init.sql` faylining butun mazmunini nusxalab, shu yerga joylashtiring, **Run** bosing. Jadvallar, RLS qoidalari, trigger'lar yaratiladi.
4. Yangi so'rov oching, `migrations/0002_nationwide_regions.sql` faylining butun mazmunini nusxalab, **Run** bosing. Bu — butun O'zbekiston bo'yicha (14 hudud, 202 tuman/shahar, 11 turkum = ~2222 ta) davlat bo'limlarini yaratadi va eski Toshkent-only 110 ta bo'limni almashtiradi.
5. Yangi so'rov oching, `migrations/0003_application_kinds.sql` faylini ishga tushiring. Bu — "Tashkilot huquqi" arizasini ikki turga ajratadi: davlat bo'limi xodimi (viloyat/tuman/turkum orqali) va tadbirkor/xususiy kompaniya.
6. Yangi so'rov oching, `migrations/0004_private_org_claim.sql` faylini ishga tushiring. Bu — xususiy tashkilotlarga hali davlat bo'limida turgan (hal qilinmagan) hisobotni o'ziga "qabul qilib olish" huquqini beradi.
7. Yangi so'rov oching, `migrations/0005_org_logos.sql` faylini ishga tushiring. Bu — tashkilotlar uchun logotip (brend rasmi) saqlash imkoniyatini (`org-logos` Storage bucket) qo'shadi.
8. Yangi so'rov oching, `migrations/0006_admin_powers.sql` faylini ishga tushiring. Bu — foydalanuvchini bloklash (`banned`) va adminga hisobotni butunlay o'chirish huquqini qo'shadi.
9. Yangi so'rov oching, `migrations/0007_multi_photo.sql` faylini ishga tushiring. Bu — bitta hisobotga bir nechta rasm biriktirish imkoniyatini qo'shadi.

Ikkala fayl ham qayta ishga tushirilishi uchun mo'ljallanmagan (xatolik chiqsa — "already exists" va h.k.) — avval mos jadvallarni/policy'larni `drop` qiling yoki yangi loyiha oching. Agar `0002` DELETE qadamida FOREIGN KEY xatoligi chiqsa, demak eski davlat bo'limlariga bog'langan test hisobot(lar) bor — avval o'shalarni o'chiring.

Kelajakda hudud/tuman ro'yxati (`src/data/regions.js`) o'zgarsa, `node scripts/gen-migration.mjs` buyrug'ini ishga tushirib, `0002` faylini qayta generatsiya qilish mumkin.

## 2. Google OAuth yoqish

1. [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services → Credentials** → **Create Credentials → OAuth client ID** → turi: **Web application**.
2. **Authorized redirect URIs** ga qo'shing: `https://<PROJECT-REF>.supabase.co/auth/v1/callback` (`<PROJECT-REF>` — Supabase loyihangiz manzilidagi kod).
3. **Authorized JavaScript origins** ga qo'shing: `http://localhost:5173` (development uchun).
4. Yaratilgan **Client ID** va **Client Secret**ni Supabase Dashboard → **Authentication → Providers → Google** sahifasiga kiriting va yoqing.
5. Supabase Dashboard → **Authentication → URL Configuration**: **Site URL** va **Redirect URLs** ro'yxatiga `http://localhost:5173` qo'shing (keyinchalik production domeningizni ham qo'shasiz).

## 3. Frontend uchun kalitlar

Supabase Dashboard → **Project Settings → API** sahifasidan:
- **Project URL** → `.env.local` faylidagi `VITE_SUPABASE_URL`
- **anon public** kalit → `.env.local` faylidagi `VITE_SUPABASE_ANON_KEY`

`service_role` kalitini **hech qachon** frontend kodiga yoki `.env.local`ga qo'ymang — u RLS'ni butunlay chetlab o'tadi.

## 4. Birinchi adminni tayinlash

Ro'yxatdan o'tgan foydalanuvchini admin qilish uchun SQL Editor'da:

```sql
update public.profiles set role = 'admin' where email = 'sizning-emailingiz@gmail.com';
```

## 5. Bo'lim xodimini tashkilotga biriktirish

Ilova ichida Admin panelida ("Xodimni tashkilotga biriktirish" bo'limi) email bo'yicha foydalanuvchini tanlab, unga tegishli tashkilotni (davlat bo'limi yoki tasdiqlangan xususiy kompaniya) biriktirishingiz mumkin — bu uning `role`ini `org`ga o'zgartiradi va faqat shu tashkilotga tayinlangan hisobotlarni ko'rish/boshqarish huquqini beradi.
