import { supabase } from "../supabaseClient";

export async function fetchMyProfile(userId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function updateMyProfile(userId, patch) {
  const { data, error } = await supabase.from("profiles").update(patch).eq("id", userId).select().single();
  if (error) throw error;
  return data;
}

// Admin: email bo'yicha profil qidirish (xodimni tashkilotga biriktirish uchun).
export async function findProfileByEmail(email) {
  const { data, error } = await supabase.from("profiles").select("*").ilike("email", email.trim()).maybeSingle();
  if (error) throw error;
  return data;
}

export async function assignProfileToOrg(profileId, orgId) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ role: "org", org_id: orgId })
    .eq("id", profileId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Admin: ism yoki email bo'yicha foydalanuvchilarni qidirish.
export async function searchProfiles(query) {
  if (!query || query.trim().length < 2) return [];
  const q = `%${query.trim()}%`;
  const { data, error } = await supabase
    .from("profiles")
    .select("*, org:organizations(id,name)")
    .or(`name.ilike.${q},email.ilike.${q}`)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data;
}

// Admin: eng so'nggi ro'yxatdan o'tgan foydalanuvchilar (qidiruv bo'sh bo'lganda ko'rsatish uchun).
export async function fetchRecentProfiles() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*, org:organizations(id,name)")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data;
}

export async function setProfileRole(profileId, role) {
  const patch = { role };
  if (role !== "org") patch.org_id = null;
  const { data, error } = await supabase.from("profiles").update(patch).eq("id", profileId).select().single();
  if (error) throw error;
  return data;
}

export async function setProfileBanned(profileId, banned) {
  const { data, error } = await supabase.from("profiles").update({ banned }).eq("id", profileId).select().single();
  if (error) throw error;
  return data;
}

export async function setProfileLanguage(profileId, language) {
  const { data, error } = await supabase.from("profiles").update({ language }).eq("id", profileId).select().single();
  if (error) throw error;
  return data;
}
