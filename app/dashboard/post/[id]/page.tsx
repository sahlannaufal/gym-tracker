"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import BlogEditor from "@/components/BlogEditor";
import {
  isAdminEmail,
  slugify,
  type BlogPostRecord,
  type BlogStatus,
} from "@/lib/blogPosts";
import { uploadBlogImage } from "@/lib/blogImages";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";

const inputClass =
  "w-full rounded-xl border border-gray-700 bg-gray-900 px-4 py-2.5 text-sm text-gray-100 " +
  "placeholder-gray-500 focus:border-lime-400 focus:outline-none focus:ring-1 focus:ring-lime-400";

const labelClass = "block text-xs font-bold uppercase tracking-wide text-gray-400";

type FormState = {
  title: string;
  slug: string;
  description: string;
  intro: string;
  reading_time: string;
  keywords: string;
  published_at: string;
  cover_image_url: string;
  status: BlogStatus;
};

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  description: "",
  intro: "",
  reading_time: "",
  keywords: "",
  published_at: "",
  cover_image_url: "",
  status: "draft",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function BlogPostEditorPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id;
  const isNew = postId === "new";
  const router = useRouter();
  const { user, loading } = useAuth();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [contentHtml, setContentHtml] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [pageState, setPageState] = useState<"loading" | "ready" | "missing">("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [coverUploading, setCoverUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Slug otomatis dari judul sampai pengguna mengedit slug secara manual.
  const slugTouchedRef = useRef(false);

  const isAdmin = isAdminEmail(user?.email);

  const loadPost = useCallback(async () => {
    if (!supabase) {
      setError("Supabase belum terkonfigurasi.");
      setPageState("ready");
      return;
    }
    if (isNew) {
      setForm(EMPTY_FORM);
      setContentHtml("");
      slugTouchedRef.current = false;
      setEditorKey((key) => key + 1);
      setPageState("ready");
      return;
    }
    const { data, error: fetchError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .maybeSingle();
    if (fetchError) {
      setError(`Gagal memuat postingan: ${fetchError.message}`);
      setPageState("ready");
      return;
    }
    if (!data) {
      setPageState("missing");
      return;
    }
    const post = data as BlogPostRecord;
    setForm({
      title: post.title,
      slug: post.slug,
      description: post.description,
      intro: post.intro,
      reading_time: post.reading_time,
      keywords: post.keywords.join(", "),
      // Kolom tanggal dari DB bisa berupa ISO lengkap; input date hanya
      // menerima "YYYY-MM-DD".
      published_at: post.published_at?.slice(0, 10) ?? "",
      cover_image_url: post.cover_image_url ?? "",
      status: post.status,
    });
    setContentHtml(post.content_html);
    slugTouchedRef.current = true;
    setEditorKey((key) => key + 1);
    setPageState("ready");
  }, [isNew, postId]);

  useEffect(() => {
    if (isAdmin) void loadPost();
  }, [isAdmin, loadPost]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === "title" && !slugTouchedRef.current) {
        next.slug = slugify(String(value));
      }
      return next;
    });
  }

  async function handleCoverUpload(file: File) {
    setCoverUploading(true);
    setError("");
    try {
      const url = await uploadBlogImage(file, "cover");
      updateField("cover_image_url", url);
    } catch (coverError) {
      setError(coverError instanceof Error ? coverError.message : "Upload cover gagal.");
    } finally {
      setCoverUploading(false);
    }
  }

  async function handleSave(status: BlogStatus) {
    if (saving) return;
    const title = form.title.trim();
    const slug = slugify(form.slug || title);
    if (!title) {
      setError("Judul wajib diisi.");
      return;
    }
    if (!slug) {
      setError("Slug tidak boleh kosong.");
      return;
    }
    if (!contentHtml.trim() || contentHtml === "<p></p>") {
      setError("Isi artikel masih kosong.");
      return;
    }
    if (!supabase) {
      setError("Supabase belum terkonfigurasi.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      title,
      slug,
      description: form.description.trim(),
      intro: form.intro.trim(),
      reading_time: form.reading_time.trim(),
      keywords: form.keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      published_at: status === "published" ? form.published_at || todayIso() : form.published_at || null,
      cover_image_url: form.cover_image_url.trim() || null,
      content_html: contentHtml,
      status,
      updated_at: new Date().toISOString(),
    };

    try {
      if (isNew) {
        const { error: insertError } = await supabase.from("blog_posts").insert({
          ...payload,
          created_at: new Date().toISOString(),
        });
        if (insertError) throw insertError;
      } else {
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", postId);
        if (updateError) throw updateError;
      }
      router.push("/dashboard");
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : String(saveError);
      setError(
        message.includes("duplicate key") || message.includes("slug")
          ? `Slug "${slug}" sudah dipakai postingan lain. Ubah slug lalu simpan lagi.`
          : `Gagal menyimpan: ${message}`
      );
      setSaving(false);
    }
  }

  if (loading || (isAdmin && pageState === "loading")) {
    return <p className="py-20 text-center text-sm text-gray-500">Memuat...</p>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">Akses ditolak</h1>
        <p className="mt-3 text-sm text-gray-400">Akun ini tidak berwenang mengelola blog.</p>
        <Link href="/" className="mt-5 inline-block text-sm font-semibold text-lime-400">
          ← Kembali ke aplikasi
        </Link>
      </div>
    );
  }

  if (pageState === "missing") {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">Postingan tidak ditemukan</h1>
        <Link href="/dashboard" className="mt-5 inline-block text-sm font-semibold text-lime-400">
          ← Kembali ke daftar
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/dashboard" className="text-sm font-semibold text-lime-400 hover:text-lime-300">
            ← Daftar postingan
          </Link>
          <h1 className="mt-3 text-2xl font-black tracking-tight">
            {isNew ? "Tulis Postingan" : "Edit Postingan"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleSave(form.status)}
            disabled={saving}
            className="rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-800 disabled:opacity-50"
          >
            Simpan{form.status === "published" ? " & Publish" : " (Draft)"}
          </button>
          {form.status === "draft" && (
            <button
              type="button"
              onClick={() => void handleSave("published")}
              disabled={saving}
              className="rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-bold text-gray-950 transition-colors hover:bg-lime-300 disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : "Publish"}
            </button>
          )}
        </div>
      </header>

      {error && (
        <p className="mt-5 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 space-y-5 rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
        <div>
          <label className={labelClass} htmlFor="post-title">
            Judul
          </label>
          <input
            id="post-title"
            className={`${inputClass} mt-2`}
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            placeholder="Judul artikel"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="post-slug">
            Slug (URL: /blog/slug)
          </label>
          <input
            id="post-slug"
            className={`${inputClass} mt-2 font-mono`}
            value={form.slug}
            onChange={(event) => {
              slugTouchedRef.current = true;
              updateField("slug", slugify(event.target.value));
            }}
            placeholder="judul-artikel"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="post-description">
            Deskripsi (untuk SEO &amp; kartu blog)
          </label>
          <textarea
            id="post-description"
            className={`${inputClass} mt-2`}
            rows={2}
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            placeholder="Ringkasan singkat artikel"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="post-intro">
            Intro (paragraf pembuka di bawah judul)
          </label>
          <textarea
            id="post-intro"
            className={`${inputClass} mt-2`}
            rows={3}
            value={form.intro}
            onChange={(event) => updateField("intro", event.target.value)}
            placeholder="Paragraf pembuka artikel"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="post-reading-time">
              Waktu baca
            </label>
            <input
              id="post-reading-time"
              className={`${inputClass} mt-2`}
              value={form.reading_time}
              onChange={(event) => updateField("reading_time", event.target.value)}
              placeholder="5 menit baca"
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="post-published-at">
              Tanggal terbit
            </label>
            <input
              id="post-published-at"
              type="date"
              className={`${inputClass} mt-2`}
              value={form.published_at}
              onChange={(event) => updateField("published_at", event.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="post-keywords">
            Kata kunci SEO (pisahkan dengan koma)
          </label>
          <input
            id="post-keywords"
            className={`${inputClass} mt-2`}
            value={form.keywords}
            onChange={(event) => updateField("keywords", event.target.value)}
            placeholder="latihan gym, progres beban"
          />
        </div>

        <div>
          <span className={labelClass}>Cover opsional</span>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {form.cover_image_url && (
              <img
                src={form.cover_image_url}
                alt="Preview cover"
                className="h-20 w-32 rounded-lg border border-gray-700 object-cover"
              />
            )}
            <button
              type="button"
              disabled={coverUploading}
              onClick={() => coverInputRef.current?.click()}
              className="rounded-lg border border-gray-700 px-3.5 py-2 text-xs font-semibold text-gray-200 transition-colors hover:bg-gray-800 disabled:opacity-50"
            >
              {coverUploading ? "Mengunggah..." : form.cover_image_url ? "Ganti cover" : "Upload cover"}
            </button>
            {form.cover_image_url && (
              <button
                type="button"
                onClick={() => updateField("cover_image_url", "")}
                className="text-xs font-semibold text-red-400 hover:text-red-300"
              >
                Hapus cover
              </button>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleCoverUpload(file);
                event.target.value = "";
              }}
            />
          </div>
        </div>

        <div>
          <span className={labelClass}>Status</span>
          <div className="mt-2 flex gap-2">
            {(["draft", "published"] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => updateField("status", status)}
                className={
                  "rounded-lg px-4 py-2 text-xs font-semibold transition-colors " +
                  (form.status === status
                    ? "bg-lime-400 text-gray-950"
                    : "border border-gray-700 text-gray-300 hover:bg-gray-800")
                }
              >
                {status === "draft" ? "Draft" : "Publish"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <span className={labelClass}>Isi artikel</span>
        <div className="mt-2">
          <BlogEditor
            key={editorKey}
            initialContent={contentHtml}
            onContentChange={setContentHtml}
            onUploadImage={(file) => uploadBlogImage(file, "inline")}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleSave(form.status)}
          disabled={saving}
          className="rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-gray-950 transition-colors hover:bg-lime-300 disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : isNew ? "Simpan postingan" : "Simpan perubahan"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          disabled={saving}
          className="rounded-xl border border-gray-700 px-5 py-3 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          Batal
        </button>
      </div>
    </div>
  );
}
