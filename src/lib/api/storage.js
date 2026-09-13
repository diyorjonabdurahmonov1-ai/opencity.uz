import { supabase } from "../supabaseClient";

const BUCKET = "report-photos";

// path har doim `${userId}/...` bilan boshlanishi kerak — Storage RLS policy shuni tekshiradi.
export async function uploadPhoto(userId, blob) {
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
