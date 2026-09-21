import Link from "next/link";
import BlogAdSense from "@/components/BlogAdSense";
import TrackedBlogLink from "@/components/TrackedBlogLink";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <BlogAdSense />
      <header className="border-b border-gray-800/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="font-bold text-gray-100">
            Abadikan Gym
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/blog" className="text-gray-300 hover:text-lime-400">Blog</Link>
            <TrackedBlogLink
              href="/login"
              ctaName="header_start"
              location="blog_header"
              className="rounded-xl bg-lime-400 px-4 py-2 font-semibold text-gray-950 hover:bg-lime-300"
            >
              Mulai
            </TrackedBlogLink>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-gray-800 px-5 py-8 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Abadikan Gym
      </footer>
    </div>
  );
}
