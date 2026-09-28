import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost, relatedPosts } from "@/content/posts";
import { appUrl, brand } from "@/lib/brand";
import { PLANS, formatUsd } from "@/lib/plans";
import { JsonLd, breadcrumbLd } from "@/lib/seo";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    // Long headlines get a shorter search title so Google doesn't cut them off.
    title: post.seoTitle ?? post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date, modifiedTime: post.updated ?? post.date },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const url = appUrl(`/blog/${post.slug}`);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    image: appUrl(`/blog/${post.slug}/opengraph-image`),
    mainEntityOfPage: url,
    url,
    author: { "@type": "Organization", name: brand.name, url: appUrl("/") },
    publisher: { "@id": appUrl("/#organization") },
  };
  const related = relatedPosts(post.slug);
  return (
    <article className="mx-auto max-w-2xl px-4 py-14">
      <JsonLd data={[ld, breadcrumbLd([["Guides", "/blog"], [post.title, `/blog/${post.slug}`]])]} />
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={14} aria-hidden /> All guides</Link>
      <h1 className="mt-4 font-display text-3xl md:text-4xl leading-tight">{post.title}</h1>
      <p className="mt-2 text-sm text-muted">
        {new Date(post.updated ?? post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })} · {post.readMinutes} min read
      </p>
      <div className="prose-simple mt-8">{post.body()}</div>

      <aside className="card mt-12 p-6">
        <h2 className="text-lg font-semibold">New headshots without booking a photographer</h2>
        <p className="mt-1 text-muted">
          Upload a few selfies and get realistic headshots in 12 real estate styles, plus Just Listed and Open House graphics, in about an hour.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/#pricing" className="btn-primary">Get headshots from {formatUsd(PLANS.starter.priceCents)}</Link>
          <Link href="/styles" className="btn-ghost">See the styles</Link>
        </div>
      </aside>

      {related.length ? (
        <nav className="mt-12" aria-label="Related guides">
          <h2 className="text-lg font-semibold">Related guides</h2>
          <ul className="mt-3 space-y-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/blog/${r.slug}`} className="font-medium text-accent underline">{r.title}</Link>
                <p className="text-sm text-muted">{r.description}</p>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </article>
  );
}
