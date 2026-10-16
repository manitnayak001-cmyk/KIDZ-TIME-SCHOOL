import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPosts } from "@/lib/content";
export const dynamic = "force-dynamic";
const pages = ["", "about", "programs", "activities", "gallery", "news", "admissions", "contact", "privacy"];
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts(500);
  return [...pages.map((p) => ({ url: `${SITE_URL}/${p}` })), ...posts.map((p) => ({ url: `${SITE_URL}/news/${p.slug}`, lastModified: p.updatedAt }))];
}
