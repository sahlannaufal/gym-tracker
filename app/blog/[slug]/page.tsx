import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  const url = `https://gym.abadikan.com/blog/${post.slug}`;
  return {
    title: `${post.title} | Abadikan Gym`,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: { type: "article", locale: "id_ID", url, siteName: "Abadikan Gym", title: post.title, description: post.description, publishedTime: post.publishedAt },
    robots: { index: true, follow: true },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  const url = `https://gym.abadikan.com/blog/${post.slug}`;
  const related = BLOG_POSTS.filter((item) => item.slug !== post.slug).slice(0, 3);
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: "id-ID",
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: "Abadikan Gym" },
    publisher: { "@type": "Organization", name: "Abadikan Gym" },
  };

  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-18">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <Link href="/blog" className="text-sm font-semibold text-lime-400 hover:text-lime-300">← Semua artikel</Link>
      <header className="mt-8 border-b border-gray-800 pb-8">
        <p className="text-sm text-gray-500">{post.readingTime}</p>
        <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-5 text-lg leading-8 text-gray-300">{post.intro}</p>
      </header>

      <div className="space-y-10 py-10">
        {post.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-2xl font-bold tracking-tight text-gray-100">{section.heading}</h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-gray-300">
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            {section.bullets && (
              <ul className="mt-4 list-disc space-y-2 pl-6 leading-7 text-gray-300">
                {section.bullets.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      <aside className="rounded-3xl bg-lime-400 p-7 text-gray-950 sm:p-9">
        <h2 className="text-2xl font-black">Catat progres latihanmu</h2>
        <p className="mt-2 leading-7 text-gray-800">Simpan beban, repetisi, set, dan program latihan dalam satu tempat.</p>
        <Link href="/login" className="mt-5 inline-block rounded-xl bg-gray-950 px-5 py-3 font-bold text-white hover:bg-gray-900">Mulai dengan Abadikan Gym</Link>
      </aside>

      <section className="mt-12 border-t border-gray-800 pt-8">
        <h2 className="text-xl font-bold">Artikel lainnya</h2>
        <ul className="mt-4 space-y-3">
          {related.map((item) => <li key={item.slug}><Link href={`/blog/${item.slug}`} className="text-gray-300 hover:text-lime-400">{item.title} →</Link></li>)}
        </ul>
      </section>
    </article>
  );
}
