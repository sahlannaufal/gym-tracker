import { slugify } from "./blogPosts";
import { supabase } from "./supabase/client";

const BUCKET = "blog-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Upload gambar artikel (inline maupun cover) ke bucket publik `blog-images`.
// Mengembalikan URL publik yang siap dipakai langsung di <img src>.
export async function uploadBlogImage(file: File, folder: "inline" | "cover"): Promise<string> {
  if (!supabase) throw new Error("Supabase belum terkonfigurasi.");
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Ukuran gambar maksimal 5 MB.");

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const baseName = slugify(file.name.replace(/\.[^.]+$/, "")) || "gambar";
  const path = `${folder}/${Date.now()}-${baseName}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw new Error(`Upload gagal: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
