import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog";

const pageUrl = "https://gym.abadikan.com/blog";

export const metadata: Metadata = {
  title: "Blog Latihan Gym dan Progres Kebugaran | Abadikan Gym",
  description: "Panduan praktis tentang latihan gym, progressive overload, program pemula, waktu istirahat, dan cara membaca progres.",
  alternates: { canonical: pageUrl },
  openGraph: { type: "website", locale: "id_ID", url: pageUrl, siteName: "Abadikan Gym", title: "Blog Abadikan Gym", description: "Panduan latihan gym yang praktis untuk membantu progresmu." },
  robots: { index: true, follow: true },
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <header className="max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-lime-400">Blog Abadikan Gym</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Panduan untuk latihan yang lebih terarah</h1>
        <p className="mt-5 text-lg leading-8 text-gray-400">Pelajari cara menyusun latihan, mencatat performa, dan memahami progres tanpa membuat prosesnya rumit.</p>
      </header>

      <section className="mt-12 grid gap-5 sm:grid-cols-2">
        {BLOG_POSTS.map((post) => (
          <article key={post.slug} className="flex flex-col rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
            <p className="text-xs font-medium text-lime-400">{post.readingTime}</p>
            <h2 className="mt-3 text-xl font-bold leading-snug">
              <Link href={`/blog/${post.slug}`} className="hover:text-lime-400">{post.title}</Link>
            </h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-gray-400">{post.description}</p>
            <Link href={`/blog/${post.slug}`} className="mt-5 text-sm font-semibold text-lime-400 hover:text-lime-300">Baca panduan →</Link>
          </article>
        ))}
      </section>
    </div>
  );
}
