import type { Metadata } from "next";
import TrackedBlogLink from "@/components/TrackedBlogLink";
import { getPublishedPosts } from "@/lib/blogPosts";
import { formatDateOrNull } from "@/lib/format";

const pageUrl = "https://abadikan.com/blog";

export const metadata: Metadata = {
  title: "Blog Latihan Gym dan Progres Kebugaran | Abadikan Gym",
  description: "Panduan praktis tentang latihan gym, progressive overload, program pemula, waktu istirahat, dan cara membaca progres.",
  alternates: { canonical: pageUrl },
  openGraph: { type: "website", locale: "id_ID", url: pageUrl, siteName: "Abadikan Gym", title: "Blog Abadikan Gym", description: "Panduan latihan gym yang praktis untuk membantu progresmu." },
  robots: { index: true, follow: true },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="marketing-blog-index mx-auto max-w-[1440px] px-5 py-14 sm:px-10 sm:py-20 lg:px-14">
      <header className="marketing-blog-intro max-w-4xl">
        <p className="marketing-editorial-kicker">CATATAN UNTUK PERJALANANMU</p>
        <h1 className="marketing-editorial-title mt-5">Panduan untuk latihan yang <em>lebih terarah.</em></h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg sm:leading-8">Pelajari cara menyusun latihan, mencatat performa, dan memahami progres tanpa membuat prosesnya rumit.</p>
        <div className="marketing-editorial-rule mt-9"><span>ARTIKEL &amp; PANDUAN</span><span>{String(posts.length).padStart(2, "0")} CERITA</span></div>
      </header>

      {posts.length === 0 && (
        <p className="marketing-blog-empty mt-12 rounded-2xl border border-gray-800 p-8 text-center text-sm text-gray-400">
          Artikel sedang disiapkan. Kembali lagi nanti.
        </p>
      )}

      <section className="marketing-blog-grid mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <article key={post.slug} className={`marketing-post-card flex flex-col overflow-hidden ${index === 0 ? "marketing-post-featured" : ""}`}>
            {post.cover_image_url && (
              <TrackedBlogLink
                href={`/blog/${post.slug}`}
                articleSlug={post.slug}
                location="blog_index_cover"
                className="block"
              >
                <img
                  src={post.cover_image_url}
                  alt=""
                  className="marketing-post-cover h-40 w-full border-b border-gray-800 object-cover"
                  loading="lazy"
                />
              </TrackedBlogLink>
            )}
            <div className="flex flex-1 flex-col p-6 sm:p-7">
              <p className="marketing-post-meta text-xs font-medium text-lime-400">
                {post.reading_time}
                {formatDateOrNull(post.published_at) && (
                  <span className="ml-2 text-gray-500">· {formatDateOrNull(post.published_at)}</span>
                )}
              </p>
              <h2 className="marketing-post-title mt-3 text-xl font-bold leading-snug">
                <TrackedBlogLink
                  href={`/blog/${post.slug}`}
                  articleSlug={post.slug}
                  location="blog_index_title"
                  className="hover:text-lime-300"
                >
                  {post.title}
                </TrackedBlogLink>
              </h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-gray-400">{post.description}</p>
              <TrackedBlogLink
                href={`/blog/${post.slug}`}
                articleSlug={post.slug}
                location="blog_index_read_more"
                className="marketing-post-read mt-5 text-sm font-semibold text-lime-400 hover:text-lime-300"
              >
                Baca panduan →
              </TrackedBlogLink>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
