import type { Metadata } from "next";
import Link from "next/link";
import TrackedMarketingLink from "@/components/TrackedMarketingLink";
import MarketingExperience from "@/components/MarketingExperience";

const pageUrl = "https://abadikan.com/";

export const metadata: Metadata = {
  title: "Abadikan Gym — Catat Progres, Bukan Sekadar Latihan",
  description: "Catat latihan, susun program, dan lihat progres kekuatanmu dari waktu ke waktu dengan Abadikan Gym.",
  alternates: { canonical: pageUrl },
  openGraph: {
    type: "website", locale: "id_ID", url: pageUrl, siteName: "Abadikan Gym",
    title: "Abadikan Gym — Catat Progres, Bukan Sekadar Latihan",
    description: "Semua sesi latihanmu tersusun rapi. Setiap progres jadi terlihat.",
  },
  robots: { index: true, follow: true },
};

const structuredData = {
  "@context": "https://schema.org", "@type": "SoftwareApplication",
  name: "Abadikan Gym Tracker", applicationCategory: "HealthApplication",
  operatingSystem: "Web, Android, iOS", url: pageUrl,
  description: "Aplikasi tracking gym untuk mencatat latihan, program, progres beban, dan perkembangan tubuh.",
  offers: { "@type": "Offer", price: "0", priceCurrency: "IDR" },
};

const featureCards = [
  { number: "01", eyebrow: "CATAT", title: "Fokus ke repetisi berikutnya.", text: "Simpan beban, repetisi, dan set dengan cepat. Catatanmu tetap rapi tanpa memecah fokus latihan." },
  { number: "02", eyebrow: "PAHAMI", title: "Lihat apa yang sudah berubah.", text: "Riwayat dan grafik beban membantumu melihat tren, bukan hanya mengandalkan ingatan." },
  { number: "03", eyebrow: "RUTINKAN", title: "Program yang siap dipakai lagi.", text: "Susun latihanmu sendiri, pilih sesi untuk hari ini, dan lanjutkan dari satu latihan ke latihan berikutnya." },
];

function BrandMark() {
  return <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-300 text-gray-950"><svg aria-hidden="true" viewBox="0 0 32 32" className="h-5 w-5" fill="currentColor"><rect x="7" y="14" width="18" height="4" rx="2"/><rect x="3" y="10" width="3" height="12" rx="1"/><rect x="26" y="10" width="3" height="12" rx="1"/></svg></span>;
}

function WorkoutPreview() {
  return (
    <div className="marketing-device" aria-label="Pratinjau tampilan aplikasi Abadikan Gym">
      <div className="marketing-device-top"><span className="flex items-center gap-2"><BrandMark /> <span className="font-semibold text-white">Abadikan <span className="text-gray-400">Gym</span></span></span><span className="marketing-live"><i /> Tersinkron</span></div>
      <div className="marketing-device-body">
        <div className="flex items-end justify-between"><div><p className="marketing-kicker">SENIN, 12 OKTOBER</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-white">Push Day</h2></div><span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-gray-300">Sesi 04</span></div>
        <div className="marketing-workout-row mt-7"><div><span className="marketing-exercise-index">01</span><strong>Bench Press</strong><small>Dada · Barbell</small></div><div className="text-right"><strong>60 <small>kg</small></strong><small>3 set × 8 rep</small></div></div>
        <div className="marketing-workout-row"><div><span className="marketing-exercise-index">02</span><strong>Incline Dumbbell Press</strong><small>Dada atas · Dumbbell</small></div><div className="text-right"><strong>22 <small>kg</small></strong><small>3 set × 10 rep</small></div></div>
        <div className="marketing-workout-row"><div><span className="marketing-exercise-index">03</span><strong>Triceps Pushdown</strong><small>Trisep · Cable</small></div><div className="text-right"><strong>25 <small>kg</small></strong><small>3 set × 12 rep</small></div></div>
        <div className="marketing-device-footer"><span>PROGRES BENCH PRESS</span><span className="text-lime-300">+12.5 kg <span aria-hidden="true">↗</span></span></div>
        <div className="marketing-chart" aria-hidden="true"><div className="marketing-chart-lines"><i/><i/><i/></div><svg viewBox="0 0 460 92" preserveAspectRatio="none"><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#bef264" stopOpacity=".28"/><stop offset="1" stopColor="#bef264" stopOpacity="0"/></linearGradient></defs><path className="marketing-chart-fill" d="M0 78 C38 74 42 62 80 66 S128 54 160 58 S210 37 240 45 S289 40 320 32 S365 36 390 20 S431 22 460 8 V92 H0Z"/><path className="marketing-chart-line" d="M0 78 C38 74 42 62 80 66 S128 54 160 58 S210 37 240 45 S289 40 320 32 S365 36 390 20 S431 22 460 8"/></svg></div>
        <div className="marketing-chart-labels"><span>AGU</span><span>SEP</span><span>OKT</span><span>+ progres, tersimpan.</span></div>
      </div>
    </div>
  );
}

export default function MarketingPage() {
  return (
    <MarketingExperience>
      <div className="marketing-page min-h-screen overflow-hidden bg-[#10120e] text-[#f2f2e9]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
        <header className="marketing-header">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-10 lg:px-14">
            <Link href="/" className="flex items-center gap-2.5 text-sm font-bold tracking-tight"><BrandMark /> Abadikan Gym</Link>
            <nav className="flex items-center gap-5 sm:gap-8"><Link href="/blog" className="text-sm text-gray-300 transition hover:text-lime-200">Cerita</Link><TrackedMarketingLink href="/login" ctaName="header_login" leadsToAuth className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold tracking-wide transition hover:border-lime-300 hover:text-lime-200 sm:px-5 sm:text-sm">Masuk <span aria-hidden="true">↗</span></TrackedMarketingLink></nav>
          </div>
        </header>

        <main>
          <section className="marketing-hero relative px-5 pb-20 pt-16 sm:px-10 sm:pb-28 sm:pt-24 lg:px-14 lg:pt-28">
            <div className="marketing-orbit marketing-orbit-one"/><div className="marketing-orbit marketing-orbit-two"/>
            <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 lg:grid-cols-[1fr_0.94fr] lg:gap-10">
              <div className="marketing-hero-copy" data-scroll-reveal>
                <p className="marketing-kicker"><span className="marketing-kicker-line"/> CATAT. PAHAMI. JADI LEBIH KUAT.</p>
                <h1 className="marketing-display mt-7 max-w-3xl">Setiap repetisi punya <em>cerita.</em></h1>
                <p className="mt-7 max-w-xl text-base leading-7 text-gray-400 sm:text-lg sm:leading-8">Abadikan Gym membantumu mengingat latihan hari ini dan melihat sejauh apa kamu sudah berkembang.</p>
                <div className="mt-9 flex flex-wrap items-center gap-4"><TrackedMarketingLink href="/login" ctaName="hero_start" leadsToAuth className="marketing-primary-cta">Mulai gratis <span aria-hidden="true">↗</span></TrackedMarketingLink><a className="marketing-text-link" href="#cerita">Lihat cara kerjanya <span aria-hidden="true">↓</span></a></div>
                <div className="mt-12 flex items-center gap-4 border-t border-white/10 pt-5 text-xs text-gray-500"><span className="marketing-avatars"><i>A</i><i>G</i><i>+</i></span><span>Latihanmu, tercatat rapi.<br/><b className="font-medium text-gray-300">Gratis untuk mulai.</b></span></div>
              </div>
              <div className="marketing-preview-wrap" data-scroll-reveal><div className="marketing-preview-caption"><span>PROGRES YANG TERLIHAT</span><span>01 — 03</span></div><WorkoutPreview/><div className="marketing-floating-note"><span className="marketing-note-icon">↗</span><span><small>BENCH PRESS · 8 MINGGU</small><strong>+12.5 <small>kg</small></strong></span></div></div>
            </div>
            <div className="marketing-scroll-cue"><span>SCROLL UNTUK MELIHAT CERITANYA</span><i/></div>
          </section>

          <section id="cerita" className="marketing-story-section marketing-story-stage px-5 sm:px-10 lg:px-14" data-scroll-reveal data-scroll-emphasis>
            <div className="marketing-story-sticky">
              <div className="marketing-story-content mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[0.45fr_1fr] lg:gap-20">
                <p className="marketing-kicker"><span className="marketing-kicker-line"/> PROGRES TAK SELALU TERASA</p>
                <div><h2 className="marketing-statement"><span className="marketing-statement-first">Terkadang, kamu jadi lebih kuat</span>{" "}<span className="marketing-statement-second">tanpa menyadarinya.</span></h2><div className="mt-10 flex flex-col gap-5 border-t border-white/15 pt-6 sm:flex-row sm:items-start sm:justify-between"><p className="max-w-md text-sm leading-7 text-gray-400 sm:text-base">Satu sesi terasa biasa. Tapi saat catatanmu terkumpul, setiap beban dan repetisi mulai menunjukkan perjalananmu.</p><span className="marketing-handwritten">Satu sesi demi satu sesi <b>↗</b></span></div></div>
              </div>
            </div>
          </section>

          <section className="marketing-feature-section px-5 py-20 sm:px-10 sm:py-28 lg:px-14">
            <div className="mx-auto max-w-[1440px]"><div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end" data-scroll-reveal><div><p className="marketing-kicker"><span className="marketing-kicker-line"/> PERJALANAN LATIHANMU</p><h2 className="marketing-section-title mt-5">Dari catatan kecil,<br/><em>terlihat perubahan.</em></h2></div><p className="max-w-sm text-sm leading-6 text-gray-400">Semua yang kamu butuhkan untuk menjaga ritme dan memahami progres latihanmu.</p></div>
              <div className="marketing-feature-grid mt-14">{featureCards.map((feature) => <article key={feature.number} className="marketing-feature-card" data-scroll-reveal><div className="flex items-center justify-between"><span className="marketing-feature-number">{feature.number}</span><span className="marketing-card-arrow" aria-hidden="true">↗</span></div><p className="marketing-kicker mt-12">{feature.eyebrow}</p><h3>{feature.title}</h3><p className="marketing-feature-copy">{feature.text}</p></article>)}</div>
            </div>
          </section>

          <section className="marketing-quote-section px-5 py-24 sm:px-10 sm:py-36 lg:px-14" data-scroll-reveal><div className="marketing-quote-art" aria-hidden="true"><span>60</span><i/><b>KG</b></div><div className="relative mx-auto max-w-5xl text-center"><p className="marketing-kicker justify-center"><span className="marketing-kicker-line"/> BUKAN TENTANG CEPAT</p><blockquote className="marketing-quote mt-8">Yang penting bukan seberapa cepat. Tapi kamu <em>terus kembali.</em></blockquote><p className="mx-auto mt-7 max-w-lg text-sm leading-7 text-gray-400">Mulai dari satu latihan hari ini. Biarkan catatanmu mengingat sisanya.</p></div></section>

          <section className="marketing-cta-section px-5 pb-24 pt-12 sm:px-10 sm:pb-32 lg:px-14"><div className="marketing-cta-panel mx-auto max-w-[1440px]" data-scroll-reveal><p className="marketing-kicker"><span className="marketing-kicker-line"/> LANGKAH PERTAMAMU DIMULAI DI SINI</p><h2 className="marketing-cta-title mt-6">Ayo, <em>abadikan</em><br className="sm:hidden"/> progresmu.</h2><div className="mt-9 flex flex-wrap items-center gap-5"><TrackedMarketingLink href="/login" ctaName="footer_start" leadsToAuth className="marketing-primary-cta">Gunakan gratis <span aria-hidden="true">↗</span></TrackedMarketingLink><span className="text-xs text-gray-400">Tanpa biaya. Mulai kapan saja.</span></div></div></section>
        </main>

        <footer className="marketing-footer px-5 py-7 sm:px-10 lg:px-14"><div className="mx-auto flex max-w-[1440px] flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><Link href="/" className="flex items-center gap-2 text-sm font-bold"><BrandMark/> Abadikan Gym</Link><div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500"><Link href="/blog" className="hover:text-gray-200">Cerita</Link><Link href="/terms" className="hover:text-gray-200">Syarat &amp; Ketentuan</Link><Link href="/privacy" className="hover:text-gray-200">Kebijakan Privasi</Link></div><p className="text-xs text-gray-600">© {new Date().getFullYear()} Abadikan Gym</p></div></footer>
      </div>
    </MarketingExperience>
  );
}
