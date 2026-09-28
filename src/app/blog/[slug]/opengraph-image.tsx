import { getPost } from "@/content/posts";
import { OG_SIZE, ogCard } from "@/lib/seo";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Guide for real estate agents";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  return ogCard({ eyebrow: "Guides for agents", title: post?.title ?? "Guides for real estate agents", subtitle: post ? `${post.readMinutes} min read` : undefined });
}
