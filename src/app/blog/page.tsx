import type { Metadata } from "next";
import Link from "next/link";
import { POSTS } from "@/content/posts";

export const metadata: Metadata = {
  title: "Guides for Real Estate Agents",
  description: "Headshot tips, social media ideas and marketing guides for real estate agents.",
};

export default function BlogIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="font-display text-4xl font-semibold">Guides for agents</h1>
      <div className="mt-8 space-y-4">
        {POSTS.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="card block p-6 hover:border-navy">
            <h2 className="text-lg font-semibold">{p.title}</h2>
            <p className="mt-1 text-sm text-muted">{p.description}</p>
            <p className="mt-2 text-xs text-muted">{p.readMinutes} min read</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
