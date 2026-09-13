import { supabase } from "../supabaseClient";

// Faqat xususiy tashkilotlar — davlat bo'limlari (2000+) ilova holatiga to'liq yuklanmaydi.
export async function fetchOrganizations() {
  const { data, error } = await supabase.from("organizations").select("*").eq("kind", "private").order("name");
  if (error) throw error;
  return data;
}

export async function fetchOrgById(id) {
  if (!id) return null;
  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

// Admin: xodimni biriktirish uchun tashkilot nomi bo'yicha qidirish (davlat bo'limlari juda ko'p bo'lgani uchun).
export async function searchOrganizations(query) {
  if (!query || query.trim().length < 2) return [];
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .ilike("name", `%${query.trim()}%`)
    .order("name")
    .limit(20);
  if (error) throw error;
  return data;
}

// Yangi hisobot yaratilganda viloyat+tuman+turkumga mos oldindan tayyorlangan davlat bo'limini topadi.
export async function findGovernmentOrg(region, district, category) {
  const { data, error } = await supabase
    .from("organizations")
    .select("*")
    .eq("kind", "government")
    .eq("region", region)
    .eq("district", district)
    .eq("category", category)
    .single();
  if (error) throw error;
  return data;
}

export async function createPrivateOrg({ name, type, city }) {
  const { data, error } = await supabase
    .from("organizations")
    .insert({ name, type, city, kind: "private", approved_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateOrgDetails(orgId, { name, type, city }) {
  const { data, error } = await supabase
    .from("organizations")
    .update({ name, type, city })
    .eq("id", orgId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setOrgActive(orgId, active) {
  const { data, error } = await supabase.from("organizations").update({ active }).eq("id", orgId).select().single();
  if (error) throw error;
  return data;
}

// Admin: tashkilot uchun brend logotipini yuklaydi va saqlaydi.
export async function uploadOrgLogo(orgId, file) {
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `${orgId}-${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage.from("org-logos").upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;
  const { data } = supabase.storage.from("org-logos").getPublicUrl(path);
  const { error } = await supabase.from("organizations").update({ logo_url: data.publicUrl }).eq("id", orgId);
  if (error) throw error;
  return data.publicUrl;
}
