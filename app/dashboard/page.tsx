"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAdminEmail, type BlogPostRecord } from "@/lib/blogPosts";
import { formatDateOrNull } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";

function StatusBadge({ status }: { status: BlogPostRecord["status"] }) {
  const published = status === "published";
  return (
    <span
      className={
        "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
        (published ? "bg-lime-400/15 text-lime-400" : "bg-gray-700/50 text-gray-300")
      }
    >
      {published ? "Publish" : "Draft"}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [posts, setPosts] = useState<BlogPostRecord[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = isAdminEmail(user?.email);

  const loadPosts = useCallback(async () => {
    if (!supabase) {
      setLoadError("Supabase belum terkonfigurasi.");
      setPosts([]);
      return;
    }
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) {
      setLoadError(`Gagal memuat postingan: ${error.message}`);
      setPosts([]);
      return;
    }
    setLoadError("");
    setPosts(data ?? []);
  }, []);

  useEffect(() => {
    if (isAdmin) void loadPosts();
  }, [isAdmin, loadPosts]);

  async function handleDelete(post: BlogPostRecord) {
    const confirmed = window.confirm(`Hapus permanen postingan "${post.title}"?`);
    if (!confirmed || !supabase) return;
    setDeletingId(post.id);
    const { error } = await supabase.from("blog_posts").delete().eq("id", post.id);
    if (error) {
      window.alert(`Gagal menghapus: ${error.message}`);
      setDeletingId(null);
      return;
    }
    setPosts((current) => current?.filter((item) => item.id !== post.id) ?? null);
    setDeletingId(null);
  }

  if (loading) {
    return (
      <p className="py-20 text-center text-sm text-gray-500">Memeriksa sesi...</p>
    );
  }

  if (!user) {
    // AuthGate sudah mengarahkan tamu ke /login; tampilan cadangan ini
    // mencegah admin page render kosong saat sesi belum pulih.
    return (
      <p className="py-20 text-center text-sm text-gray-500">
        Sesi tidak ditemukan. <Link href="/login" className="text-lime-400 hover:text-lime-300">Masuk</Link>
      </p>
    );
  }

  if (!isAdmin) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">Akses ditolak</h1>
        <p className="mt-3 text-sm text-gray-400">
          Akun ini tidak berwenang membuka dashboard blog.
        </p>
        <Link href="/" className="mt-5 inline-block text-sm font-semibold text-lime-400 hover:text-lime-300">
          ← Kembali ke aplikasi
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-400">Admin</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight">Kelola Blog</h1>
          <p className="mt-1 text-sm text-gray-400">{user.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/ads"
            className="rounded-xl border border-gray-700 px-5 py-2.5 text-sm font-bold text-gray-200 transition-colors hover:border-lime-400/50 hover:bg-gray-800"
          >
            Tautan Iklan
          </Link>
          <Link
            href="/dashboard/post/new"
            className="rounded-xl bg-lime-400 px-5 py-2.5 text-sm font-bold text-gray-950 transition-colors hover:bg-lime-300"
          >
            + Tulis Postingan
          </Link>
        </div>
      </header>

      {loadError && (
        <p className="mt-6 rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {loadError}
        </p>
      )}

      <section className="mt-8 space-y-4">
        {posts === null && !loadError && (
          <p className="py-10 text-center text-sm text-gray-500">Memuat postingan...</p>
        )}

        {posts?.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-700 p-10 text-center">
            <p className="text-sm text-gray-400">Belum ada postingan.</p>
            <Link
              href="/dashboard/post/new"
              className="mt-4 inline-block text-sm font-semibold text-lime-400 hover:text-lime-300"
            >
              Tulis yang pertama →
            </Link>
          </div>
        )}

        {posts?.map((post) => (
          <article
            key={post.id}
            className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={post.status} />
                  <span className="text-xs text-gray-500">
                    Diperbarui {formatDateOrNull(post.updated_at) ?? "—"}
                    {post.published_at && ` · terbit ${formatDateOrNull(post.published_at)}`}
                  </span>
                </div>
                <h2 className="mt-2 truncate text-base font-bold text-gray-100">{post.title}</h2>
                <p className="mt-1 truncate text-xs text-gray-500">/{post.slug}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  href={`/dashboard/post/${post.id}`}
                  className="rounded-lg border border-gray-700 px-3.5 py-2 text-xs font-semibold text-gray-200 transition-colors hover:bg-gray-800"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDelete(post)}
                  disabled={deletingId === post.id}
                  className="rounded-lg border border-red-900/60 px-3.5 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-950/40 disabled:opacity-50"
                >
                  {deletingId === post.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <button
        type="button"
        onClick={() => router.push("/")}
        className="mt-10 text-sm text-gray-500 hover:text-gray-300"
      >
        ← Kembali ke aplikasi
      </button>
    </div>
  );
}
