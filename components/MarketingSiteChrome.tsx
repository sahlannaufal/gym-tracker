import Link from "next/link";
import TrackedBlogLink from "@/components/TrackedBlogLink";

export function MarketingSiteHeader({ active = "" }: { active?: "blog" | "" }) {
  return (
    <header className="marketing-site-header">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 sm:px-10 lg:px-14">
        <Link href="/" className="marketing-site-brand">
          <span className="marketing-site-mark" aria-hidden="true">A</span>
          <span>Abadikan <i>Gym</i></span>
        </Link>
        <nav className="flex items-center gap-5 sm:gap-8" aria-label="Navigasi utama">
          <Link href="/blog" aria-current={active === "blog" ? "page" : undefined} className={`marketing-site-navlink ${active === "blog" ? "is-active" : ""}`}>Cerita</Link>
          <TrackedBlogLink href="/login" ctaName="header_start" location="blog_header" className="marketing-site-cta">Mulai <span aria-hidden="true">↗</span></TrackedBlogLink>
        </nav>
      </div>
    </header>
  );
}

export function MarketingSiteFooter() {
  return (
    <footer className="marketing-site-footer">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-14">
        <Link href="/" className="marketing-site-brand"><span className="marketing-site-mark" aria-hidden="true">A</span><span>Abadikan <i>Gym</i></span></Link>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
          <Link href="/blog" className="hover:text-lime-200">Cerita</Link>
          <Link href="/terms" className="hover:text-lime-200">Syarat &amp; Ketentuan</Link>
          <Link href="/privacy" className="hover:text-lime-200">Kebijakan Privasi</Link>
        </div>
        <p className="text-xs text-gray-600">© {new Date().getFullYear()} Abadikan Gym</p>
      </div>
    </footer>
  );
}
