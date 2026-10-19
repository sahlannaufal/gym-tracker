"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { isAdminEmail } from "@/lib/blogPosts";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";

type AdSettings = { enabled: boolean; target_urls: string[] };

function isValidExternalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export default function DashboardAdsPage() {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<AdSettings | null>(null);
  const [targetUrls, setTargetUrls] = useState<string[]>([""]);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const isAdmin = isAdminEmail(user?.email);

  const loadSettings = useCallback(async () => {
    if (!supabase) {
      setError("Supabase belum dikonfigurasi.");
      setLoading(false);
      return;
    }
    const { data, error: queryError } = await supabase
      .from("app_ad_settings")
      .select("enabled,target_urls")
      .eq("id", 1)
      .maybeSingle();

    if (queryError || !data) {
      setError(queryError?.message ?? "Pengaturan iklan belum tersedia. Jalankan migrasi database terbaru.");
      setLoading(false);
      return;
    }

    const current = data as AdSettings;
    setSettings(current);
    setTargetUrls(current.target_urls.length > 0 ? current.target_urls : [""]);
    setEnabled(current.enabled);
    setError("");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading || !isAdmin) return;
    void loadSettings();
  }, [authLoading, isAdmin, loadSettings]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !settings) return;
    const enteredUrls = targetUrls.map((url) => url.trim());
    if (enteredUrls.some((url) => !url)) {
      setError("Lengkapi atau hapus setiap kolom URL yang kosong.");
      setNotice("");
      return;
    }
    const nextUrls = enteredUrls;
    if (nextUrls.length === 0) {
      setError("Masukkan setidaknya satu URL iklan.");
      setNotice("");
      return;
    }
    if (nextUrls.length > 20) {
      setError("Maksimal 20 URL iklan.");
      setNotice("");
      return;
    }
    if (nextUrls.some((url) => !isValidExternalUrl(url))) {
      setError("Setiap kolom harus berisi URL lengkap yang diawali http:// atau https://.");
      setNotice("");
      return;
    }
    const normalizedUrls = nextUrls.map((url) => new URL(url).toString());
    if (new Set(normalizedUrls).size !== normalizedUrls.length) {
      setError("Setiap URL harus berbeda. Hapus kolom yang duplikat.");
      setNotice("");
      return;
    }
    const firstUrl = normalizedUrls[0]!;

    setSaving(true);
    setError("");
    setNotice("");
    const { error: updateError } = await supabase
      .from("app_ad_settings")
      .update({
        enabled,
        target_urls: normalizedUrls,
        // Pertahankan kolom tunggal agar versi aplikasi lama tetap memakai URL pertama.
        target_url: firstUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    if (updateError) {
      setError(`Pengaturan gagal disimpan: ${updateError.message}`);
      setSaving(false);
      return;
    }

    const updatedSettings = { enabled, target_urls: normalizedUrls };
    setSettings(updatedSettings);
    setTargetUrls(updatedSettings.target_urls);
    setNotice("Daftar tersimpan. Aplikasi akan memakai URL berikutnya pada pengalihan setelahnya.");
    setSaving(false);
  }

  if (authLoading || loading && isAdmin) {
    return <p className="py-20 text-center text-sm text-gray-500">Memuat pengaturan...</p>;
  }

  if (!user || !isAdmin) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">Akses ditolak</h1>
        <p className="mt-3 text-sm text-gray-400">Akun ini tidak berwenang mengubah tautan iklan.</p>
        <Link href="/dashboard" className="mt-5 inline-block text-sm font-semibold text-lime-400 hover:text-lime-300">
          ← Kembali ke dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/dashboard" className="text-sm font-semibold text-gray-400 hover:text-gray-200">
        ← Dashboard
      </Link>
      <header className="mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-lime-400">Pengaturan aplikasi</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight">Tautan Iklan</h1>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          Tambahkan setiap URL di kolom tersendiri. Aplikasi membuka URL secara bergantian setiap lima menit untuk akun non-premium. Perubahan disimpan di Supabase tanpa deploy ulang.
        </p>
      </header>

      <form onSubmit={handleSave} className="mt-8 space-y-6 rounded-2xl border border-gray-800 bg-gray-900/60 p-5 sm:p-6">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="mt-1 h-4 w-4 accent-lime-400"
          />
          <span>
            <span className="block text-sm font-semibold text-gray-100">Aktifkan pengalihan iklan</span>
            <span className="mt-1 block text-xs leading-5 text-gray-500">Jika dimatikan, pengguna tidak akan dialihkan ke tautan promosi.</span>
          </span>
        </label>

        <div>
          <p className="block text-sm font-semibold text-gray-200">Daftar URL iklan</p>
          <div className="mt-2 space-y-3">
            {targetUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2">
                <label htmlFor={`ad-target-url-${index}`} className="w-8 shrink-0 text-xs font-semibold text-gray-500">
                  {index + 1}.
                </label>
                <input
                  id={`ad-target-url-${index}`}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  required
                  value={url}
                  onChange={(event) => setTargetUrls((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                  placeholder="https://contoh.com/tautan-iklan"
                  className="min-w-0 flex-1 rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
                />
                <button
                  type="button"
                  onClick={() => setTargetUrls((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                  disabled={targetUrls.length === 1}
                  aria-label={`Hapus URL iklan ${index + 1}`}
                  className="shrink-0 rounded-lg border border-gray-700 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:border-red-500 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setTargetUrls((current) => current.length < 20 ? [...current, ""] : current)}
            disabled={targetUrls.length >= 20}
            className="mt-3 rounded-lg border border-lime-700/70 px-3 py-2 text-sm font-semibold text-lime-300 transition hover:bg-lime-400/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            + Tambah URL
          </button>
          <p className="mt-2 text-xs leading-5 text-gray-500">Maksimal 20 URL. Urutan kolom menentukan urutan rotasi. Tautan diperiksa ulang sebelum pengguna dialihkan.</p>
        </div>

        {settings && (
          <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4 text-xs text-gray-400">
            Status saat tersimpan: <span className={settings.enabled ? "font-semibold text-lime-300" : "font-semibold text-gray-300"}>{settings.enabled ? "Aktif" : "Nonaktif"}</span>
            <ol className="mt-2 list-inside list-decimal space-y-1">
              {settings.target_urls.map((url, index) => (
                <li key={`${url}-${index}`}>
                  <a href={url} target="_blank" rel="noreferrer" className="break-all text-lime-400 hover:text-lime-300">
                    {url}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        )}

        {error && <p role="alert" className="rounded-xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</p>}
        {notice && <p role="status" className="rounded-xl border border-lime-900/60 bg-lime-950/30 px-4 py-3 text-sm text-lime-200">{notice}</p>}

        <button
          type="submit"
          disabled={saving || !settings}
          className="w-full rounded-xl bg-lime-400 px-5 py-3 text-sm font-bold text-gray-950 transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? "Menyimpan..." : "Simpan pengaturan"}
        </button>
      </form>
    </div>
  );
}
