import type { Metadata } from "next";
import Link from "next/link";
import TrackedMarketingLink from "@/components/TrackedMarketingLink";

const pageUrl = "https://gym.abadikan.com/aplikasi-tracking-gym";

export const metadata: Metadata = {
  title: "Aplikasi Tracking Gym & Progres Latihan | Abadikan Gym",
  description:
    "Catat beban, repetisi, set, program latihan, dan perkembangan tubuh dalam satu aplikasi tracking gym yang praktis dan gratis.",
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: pageUrl,
    siteName: "Abadikan Gym",
    title: "Aplikasi Tracking Gym & Progres Latihan | Abadikan Gym",
    description:
      "Pantau latihan, progres beban, program gym, dan perkembangan tubuh dengan lebih teratur.",
  },
  robots: { index: true, follow: true },
};

const features = [
  {
    title: "Catat latihan dengan cepat",
    description: "Simpan beban, repetisi, dan set tanpa mengganggu fokus latihanmu.",
  },
  {
    title: "Pantau progres",
    description: "Lihat riwayat dan grafik perkembangan beban dari waktu ke waktu.",
  },
  {
    title: "Susun program sendiri",
    description: "Buat program latihan yang dapat digunakan kembali dan jadwalkan sesuai kebutuhan.",
  },
  {
    title: "Tutorial gerakan",
    description: "Pelajari target otot, peralatan, dan langkah gerakan dalam bahasa Indonesia.",
  },
  {
    title: "Catat perkembangan tubuh",
    description: "Pantau berat badan, body fat, massa otot, dan perubahan pengukuranmu.",
  },
  {
    title: "Sinkron lintas perangkat",
    description: "Masuk dengan email atau Google agar data latihan tetap tersinkron.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Abadikan Gym Tracker",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web, Android, iOS",
  url: pageUrl,
  description:
    "Aplikasi tracking gym untuk mencatat latihan, program, progres beban, dan perkembangan tubuh.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "IDR",
  },
};

export default function MarketingPage() {
  return (
    <div className="overflow-hidden bg-gray-950 text-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />

      <header className="border-b border-gray-800/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/aplikasi-tracking-gym" className="flex items-center gap-3 font-bold">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400 text-gray-950">
              <svg aria-hidden="true" viewBox="0 0 32 32" className="h-6 w-6" fill="currentColor">
                <rect x="7" y="14" width="18" height="4" rx="2" />
                <rect x="3" y="10" width="3" height="12" rx="1" />
                <rect x="26" y="10" width="3" height="12" rx="1" />
              </svg>
            </span>
            Abadikan Gym
          </Link>
          <TrackedMarketingLink href="/login" ctaName="header_login" leadsToAuth className="rounded-xl border border-gray-700 px-4 py-2 text-sm font-semibold hover:border-gray-500">
            Masuk
          </TrackedMarketingLink>
        </div>
      </header>

      <section className="relative px-5 py-20 sm:px-8 sm:py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-lime-400/10 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-lime-400">Gym Progress Tracker</p>
          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Catat latihan. Pantau progres. <span className="text-lime-400">Jadi lebih kuat.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
            Abadikan Gym membantu kamu mencatat beban, repetisi, set, program latihan, dan perkembangan tubuh dalam satu aplikasi yang praktis.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <TrackedMarketingLink href="/login" ctaName="hero_start" leadsToAuth className="rounded-xl bg-lime-400 px-6 py-3.5 font-bold text-gray-950 transition-colors hover:bg-lime-300">
              Mulai Gratis
            </TrackedMarketingLink>
            <TrackedMarketingLink href="#fitur" ctaName="hero_features" className="rounded-xl border border-gray-700 px-6 py-3.5 font-bold transition-colors hover:border-gray-500">
              Lihat Fitur
            </TrackedMarketingLink>
          </div>
        </div>
      </section>

      <section id="fitur" className="border-y border-gray-800 bg-gray-900/30 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-lime-400">Fitur utama</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Semua yang dibutuhkan untuk mengikuti progres latihan</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <article key={feature.title} className="rounded-2xl border border-gray-800 bg-gray-950/70 p-6">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-lime-400/15 text-sm font-black text-lime-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-lime-400">Cara kerja</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Mulai dalam tiga langkah sederhana</h2>
          </div>
          <ol className="space-y-4">
            {["Buat akun gratis dengan email atau Google.", "Susun program dan mulai mencatat latihan.", "Lihat riwayat serta perkembangan performamu."].map((step, index) => (
              <li key={step} className="flex gap-4 rounded-2xl border border-gray-800 p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lime-400 font-black text-gray-950">{index + 1}</span>
                <p className="pt-1 text-gray-300">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 pb-20 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-lime-400 px-6 py-12 text-center text-gray-950 sm:px-12">
          <h2 className="text-3xl font-black tracking-tight">Siap mengabadikan progresmu?</h2>
          <p className="mx-auto mt-3 max-w-xl text-gray-800">Mulai catat latihan hari ini dan lihat seberapa jauh perkembanganmu.</p>
          <TrackedMarketingLink href="/login" ctaName="footer_start" leadsToAuth className="mt-7 inline-block rounded-xl bg-gray-950 px-6 py-3.5 font-bold text-white hover:bg-gray-900">
            Gunakan Abadikan Gym
          </TrackedMarketingLink>
        </div>
      </section>

      <footer className="border-t border-gray-800 px-5 py-8 text-center text-sm text-gray-500 sm:px-8">
        <p>© {new Date().getFullYear()} Abadikan Gym. Catat dan pantau progres latihanmu.</p>
      </footer>
    </div>
  );
}
