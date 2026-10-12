import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Client ringkas untuk komponen server (RSC). Hanya dipakai untuk membaca
// data publik blog — tanpa sesi auth, karena baris `published` memang terbuka
// lewat RLS anon. Fetch memakai `cache: "no-store"`: tidak ada Data Cache,
// sehingga setiap request selalu membaca data terbaru dari Supabase.
export function getServerSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          cache: "no-store",
        }),
    },
  });
}
