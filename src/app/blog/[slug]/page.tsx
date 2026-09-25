import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POSTS, getPost } from "@/content/posts";
import { brand } from "@/lib/brand";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.description, alternates: { canonical: `/blog/${post.slug}` }, openGraph: { type: "article", title: post.title, description: post.description } };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    publisher: { "@type": "Organization", name: brand.name },
  };
  return (
    <article className="mx-auto max-w-2xl px-4 py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"><ArrowLeft size={14} aria-hidden /> All guides</Link>
      <h1 className="mt-4 font-display text-3xl md:text-4xl leading-tight">{post.title}</h1>
      <p className="mt-2 text-sm text-muted">{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} · {post.readMinutes} min read</p>
      <div className="prose-simple mt-8">{post.body()}</div>
    </article>
  );
}
