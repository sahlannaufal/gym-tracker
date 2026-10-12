import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BlogInArticleAd from "@/components/BlogInArticleAd";
import TrackedBlogLink from "@/components/TrackedBlogLink";
import {
  getPublishedPostBySlug,
  getPublishedPosts,
  splitHtmlAtThirdHeading,
} from "@/lib/blogPosts";
import { MARKETING_ORIGIN } from "@/lib/site";
import { formatDateOrNull } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};
  const url = `${MARKETING_ORIGIN}/blog/${post.slug}`;
  return {
    title: `${post.title} | Abadikan Gym`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "id_ID",
      url,
      siteName: "Abadikan Gym",
      title: post.title,
      description: post.description,
      publishedTime: post.published_at ?? undefined,
      ...(post.cover_image_url ? { images: [{ url: post.cover_image_url }] } : {}),
    },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const url = `${MARKETING_ORIGIN}/blog/${post.slug}`;
  const allPosts = await getPublishedPosts();
  const related = allPosts.filter((item) => item.slug !== post.slug).slice(0, 3);
  const [contentBefore, contentAfter] = splitHtmlAtThirdHeading(post.content_html);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.published_at,
    dateModified: post.updated_at.slice(0, 10) || post.published_at,
    inLanguage: "id-ID",
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Abadikan Gym" },
    publisher: { "@type": "Organization", name: "Abadikan Gym" },
    ...(post.cover_image_url ? { image: post.cover_image_url } : {}),
  };

  return (
    <article className="marketing-article mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-18">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <Link href="/blog" className="marketing-article-back">← Semua cerita</Link>
      <header className="marketing-article-header mt-8 border-b border-gray-800 pb-8">
        <p className="marketing-editorial-kicker">{post.reading_time}{formatDateOrNull(post.published_at) ? ` · ${formatDateOrNull(post.published_at)}` : ""}</p>
        <h1 className="marketing-editorial-title mt-5">{post.title}</h1>
        {post.intro && <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-300">{post.intro}</p>}
      </header>

      {post.cover_image_url && (
        <img
          src={post.cover_image_url}
          alt=""
          className="marketing-article-cover mt-9 w-full rounded-2xl border border-gray-800 object-cover"
        />
      )}

      <div className="marketing-article-body py-10">
        <div className="blog-content" dangerouslySetInnerHTML={{ __html: contentBefore }} />
        <BlogInArticleAd />
        {contentAfter && <div className="blog-content" dangerouslySetInnerHTML={{ __html: contentAfter }} />}
      </div>

      <aside className="marketing-article-cta rounded-3xl bg-lime-400 p-7 text-gray-950 sm:p-9">
        <h2 className="text-2xl font-black">Catat progres latihanmu</h2>
        <p className="mt-2 leading-7 text-gray-800">Simpan beban, repetisi, set, dan program latihan dalam satu tempat.</p>
        <TrackedBlogLink
          href="/login"
          ctaName="article_start"
          location="article_cta"
          className="mt-5 inline-block rounded-xl bg-gray-950 px-5 py-3 font-bold text-white hover:bg-gray-900"
        >
          Mulai dengan Abadikan Gym
        </TrackedBlogLink>
      </aside>

      {related.length > 0 && (
        <section className="marketing-related mt-12 border-t border-gray-800 pt-8">
          <h2 className="text-xl font-bold">Artikel lainnya</h2>
          <ul className="mt-4 space-y-3">
            {related.map((item) => (
              <li key={item.slug}>
                <TrackedBlogLink
                  href={`/blog/${item.slug}`}
                  articleSlug={item.slug}
                  location="related_articles"
                  className="text-gray-300 hover:text-lime-400"
                >
                  {item.title} →
                </TrackedBlogLink>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
