import { getServerSupabase } from "./supabase/server";

// Satu-satunya akun yang boleh mengelola blog lewat /dashboard.
// RLS di Supabase memakai email yang sama (lihat migration 0006).
export const ADMIN_EMAIL = "sahlannaufal.sn@gmail.com";

export type BlogStatus = "draft" | "published";

export type BlogPostRecord = {
  id: string;
  slug: string;
  title: string;
  description: string;
  intro: string;
  published_at: string | null;
  reading_time: string;
  keywords: string[];
  content_html: string;
  cover_image_url: string | null;
  status: BlogStatus;
  created_at: string;
  updated_at: string;
};

export type BlogPostSummary = Pick<
  BlogPostRecord,
  "slug" | "title" | "description" | "published_at" | "reading_time" | "cover_image_url"
>;

export function isAdminEmail(email: string | null | undefined): boolean {
  return (email ?? "").toLowerCase() === ADMIN_EMAIL;
}

// Slug khas URL: huruf kecil, spasi/ganti tanda baca jadi tanda minus.
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const POST_COLUMNS =
  "id, slug, title, description, intro, published_at, reading_time, keywords, content_html, cover_image_url, status, created_at, updated_at";

// ---------------------------------------------------------------------------
// Helper baca untuk komponen server (publik). Fetch memakai `no-store`, jadi
// setiap request selalu membaca data terbaru — tidak ada cache ISR. Semua
// diamankan `try/catch` agar build tidak gagal saat Supabase belum
// terkonfigurasi / migrasi belum dijalankan — halaman tampil kosong dulu.
// ---------------------------------------------------------------------------

// Saat Next mencoba prerender statis, fetch `no-store` melempar "Dynamic
// server usage" (ditandai lewat async-storage internal Next, sehingga route
// tetap ditandai dinamis meski error ditangkap di sini). Karena supabase-js
// membungkus error fetch menjadi plain object `{ message, ... }`, error ini
// tidak bisa di-rethrow sebagai DynamicServerError — tangkap lalu kembalikan
// fallback senyap tanpa di-log sebagai kegagalan.
function isDynamicUsageError(error: unknown): boolean {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : "";
  return message.includes("Dynamic server usage");
}

export async function getPublishedPosts(): Promise<BlogPostRecord[]> {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("blog_posts")
      .select(POST_COLUMNS)
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      if (isDynamicUsageError(error)) return [];
      console.error(`[blog] getPublishedPosts gagal: ${error.message}`);
      return [];
    }
    return data ?? [];
  } catch (error) {
    if (isDynamicUsageError(error)) return [];
    console.error("[blog] getPublishedPosts gagal:", error);
    return [];
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPostRecord | null> {
  try {
    const supabase = getServerSupabase();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("blog_posts")
      .select(POST_COLUMNS)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) {
      if (isDynamicUsageError(error)) return null;
      console.error(`[blog] getPublishedPostBySlug gagal: ${error.message}`);
      return null;
    }
    return data;
  } catch (error) {
    if (isDynamicUsageError(error)) return null;
    console.error("[blog] getPublishedPostBySlug gagal:", error);
    return null;
  }
}

// Memecah body HTML tepat sebelum heading ketiga, untuk menyisipkan iklan
// in-article di sela dua blok konten (posisi yang sama seperti artikel lama).
export function splitHtmlAtThirdHeading(html: string): [string, string] {
  const matches = [...html.matchAll(/<h[23][\s>]/g)];
  if (matches.length < 3) return [html, ""];
  const cutAt = matches[2].index ?? 0;
  return [html.slice(0, cutAt), html.slice(cutAt)];
}
