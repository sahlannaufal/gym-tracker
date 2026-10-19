"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { isAdminEmail } from "@/lib/blogPosts";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/useAuth";

type AdSettings = { enabled: boolean; target_url: string };

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
  const [targetUrl, setTargetUrl] = useState("");
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
      .select("enabled,target_url")
      .eq("id", 1)
      .maybeSingle();

    if (queryError || !data) {
      setError(queryError?.message ?? "Pengaturan iklan belum tersedia. Jalankan migrasi database terbaru.");
      setLoading(false);
      return;
    }

    const current = data as AdSettings;
    setSettings(current);
    setTargetUrl(current.target_url);
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
    const nextUrl = targetUrl.trim();
    if (!isValidExternalUrl(nextUrl)) {
      setError("Masukkan tautan lengkap yang diawali http:// atau https://.");
      setNotice("");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    const { error: updateError } = await supabase
      .from("app_ad_settings")
      .update({ enabled, target_url: new URL(nextUrl).toString(), updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (updateError) {
      setError(`Pengaturan gagal disimpan: ${updateError.message}`);
      setSaving(false);
      return;
    }

    const updatedSettings = { enabled, target_url: new URL(nextUrl).toString() };
    setSettings(updatedSettings);
    setTargetUrl(updatedSettings.target_url);
    setNotice("Pengaturan tersimpan. Perubahan dipakai otomatis saat aplikasi memeriksa tautan iklan berikutnya.");
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
          Atur tujuan pengalihan promosi yang digunakan aplikasi untuk akun non-premium. Perubahan disimpan di Supabase dan tidak memerlukan deploy ulang.
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
          <label htmlFor="ad-target-url" className="block text-sm font-semibold text-gray-200">URL tujuan</label>
          <input
            id="ad-target-url"
            type="url"
            inputMode="url"
            autoComplete="url"
            required
            value={targetUrl}
            onChange={(event) => setTargetUrl(event.target.value)}
            placeholder="https://contoh.com/tautan-iklan"
            className="mt-2 w-full rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-gray-100 outline-none transition focus:border-lime-400 focus:ring-2 focus:ring-lime-400/20"
          />
          <p className="mt-2 text-xs leading-5 text-gray-500">Gunakan URL lengkap dengan awalan http:// atau https://. Tautan diperiksa ulang sebelum pengguna dialihkan.</p>
        </div>

        {settings && (
          <div className="rounded-xl border border-gray-800 bg-gray-950/70 p-4 text-xs text-gray-400">
            Status saat tersimpan: <span className={settings.enabled ? "font-semibold text-lime-300" : "font-semibold text-gray-300"}>{settings.enabled ? "Aktif" : "Nonaktif"}</span>
            <a href={settings.target_url} target="_blank" rel="noreferrer" className="mt-2 block break-all text-lime-400 hover:text-lime-300">
              {settings.target_url}
            </a>
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
