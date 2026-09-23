"use client";

import { trackEvent } from "@/lib/analytics";
import { TRAKTEER_URL } from "@/lib/support";

type Placement = "account" | "dashboard";

const heartIcon = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
    aria-hidden
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
  </svg>
);

// Kartu dukungan pengembang (Trakteer). Dua mode: "card" untuk halaman Profil
// dan "banner" tipis yang bisa ditutup untuk Dashboard — agar terlihat tanpa
// mengganggu alur utama aplikasi.
export default function SupportCreatorCard({
  placement,
  variant = "card",
  onDismiss,
}: {
  placement: Placement;
  variant?: "card" | "banner";
  onDismiss?: () => void;
}) {
  const trackClick = () => {
    trackEvent("Support CTA Clicked", { placement, source: "trakteer" });
  };

  if (variant === "banner") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[#be1e2d]/40 bg-[#be1e2d]/10 px-3 py-2">
        <span className="shrink-0 text-[#ff5a68]">{heartIcon}</span>
        <p className="min-w-0 flex-1 truncate text-xs text-gray-300">
          Dukung pengembangan aplikasi
        </p>
        <a
          href={TRAKTEER_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={trackClick}
          className="shrink-0 rounded-lg bg-[#be1e2d] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#d32231]"
        >
          Trakteer
        </a>
        <button
          type="button"
          aria-label="Tutup banner dukungan"
          onClick={() => {
            trackEvent("Support Banner Dismissed", { placement });
            onDismiss?.();
          }}
          className="shrink-0 rounded-lg p-1 text-gray-500 transition-colors hover:text-gray-300"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="h-4 w-4"
            aria-hidden
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#be1e2d]/30 bg-[#be1e2d]/10 p-5">
      <div className="flex items-center gap-2">
        <span className="text-[#ff5a68]">{heartIcon}</span>
        <p className="text-xs font-medium uppercase tracking-wide text-[#ff5a68]">
          Dukung Saya di Trakteer
        </p>
      </div>
      <p className="mt-2 text-sm leading-6 text-gray-300">
        Kalau Gym Progress Tracker membantu latihanmu, kamu bisa berdonasi
        lewat Trakteer. Dukunganmu dipakai untuk mengembangkan aplikasi ini.
      </p>
      <a
        href={TRAKTEER_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={trackClick}
        className="mt-4 inline-block rounded-xl bg-[#be1e2d] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#d32231]"
      >
        Dukung via Trakteer
      </a>
    </div>
  );
}
