import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

// VAQTINCHA: Google OAuth hozircha ishlamayapti, loyiha esa hali ommaga chiqmagan —
// sinov uchun "Google orqali kirish" tugmasi Google'ga yo'naltirmasdan Supabase'ning
// anonim kirishi (signInAnonymously) orqali darhol sessiya ochadi. Bu haqiqiy auth
// foydalanuvchisi, shuning uchun RLS va `handle_new_user` trigger'i odatdagidek ishlaydi.
// Supabase Dashboard → Authentication → Sign In / Providers → "Allow anonymous sign-ins"
// yoqilgan bo'lishi shart. Google'ni qaytarish uchun shu flagni `false` qiling.
export const TEMP_SKIP_GOOGLE_AUTH = true;

export function useAuth() {
  const [session, setSession] = useState(undefined); // undefined = hali yuklanmoqda

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (TEMP_SKIP_GOOGLE_AUTH) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        console.error(error);
        window.alert(
          "Kirib bo'lmadi: " + error.message +
          "\n\nSupabase'da anonim kirish (Allow anonymous sign-ins) yoqilganini tekshiring."
        );
      }
      return { data, error };
    }
    return supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  return { session, user: session?.user ?? null, loading: session === undefined, signInWithGoogle, signOut };
}
