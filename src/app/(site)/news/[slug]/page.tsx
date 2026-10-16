import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { Wrap } from "@/components/Bits";
import CmsImage from "@/components/CmsImage";
import { getPost } from "@/lib/content";
import { dateIN } from "@/lib/site";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { post } = await getPost((await params).slug);
  return post ? { title: post.title, description: post.excerpt || undefined, alternates: { canonical: `/news/${post.slug}` } } : { title: "Not found" };
}
export default async function Post({ params }: Props) {
  const { post, isPreview } = await getPost((await params).slug);
  if (!post) notFound();
  return (<Wrap><article className="mx-auto max-w-3xl">
    {isPreview && <p role="status" className="mb-6 rounded-2xl bg-sun p-4 font-bold text-ink">Preview only: this post is not public yet (status: {post.status}).</p>}
    <Link href="/news" className="font-bold underline">All news</Link>
    <p className="mt-6 text-sm font-bold">{dateIN(post.publishedAt)}{post.category && <span className="capitalize"> · {post.category}</span>}</p>
    <h1 className="mt-1 text-4xl font-semibold">{post.title}</h1>
    {post.coverImage && <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl"><CmsImage media={post.coverImage} sizes="48rem" /></div>}
    {post.body && <div className="rich mt-6"><RichText data={post.body} /></div>}
  </article></Wrap>);
}
