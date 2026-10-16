import { getPayload } from "payload";
import config from "@payload-config";
import { headers } from "next/headers";

// overrideAccess:false makes the website obey the same rules as the public API:
// hidden items, drafts and future-dated posts are never returned here.
const db = () => getPayload({ config });
const pub = { overrideAccess: false } as const;

export async function getSettings() {
  const s = await (await db()).findGlobal({ slug: "site-settings", ...pub });
  return { name: s.name || "Kidz Time School", tagline: s.tagline || "", phone: s.phone || "", email: s.email || "", hours: s.hours || "", locations: s.locations ?? [], social: s.social ?? [] };
}
export const getHome = async () => (await db()).findGlobal({ slug: "home-page", ...pub });
export const getAbout = async () => (await db()).findGlobal({ slug: "about-page", ...pub });
export const getAdmission = async () => (await db()).findGlobal({ slug: "admission-info", ...pub });
export const getPrivacy = async () => (await db()).findGlobal({ slug: "privacy-page", ...pub });

export async function getPrograms() { return (await (await db()).find({ collection: "programs", sort: "order", pagination: false, ...pub })).docs; }
export async function getActivities() { return (await (await db()).find({ collection: "activities", sort: "order", pagination: false, ...pub })).docs; }
export async function getGallery() { return (await (await db()).find({ collection: "gallery-items", sort: "order", pagination: false, ...pub })).docs; }
export async function getFaqs() { return (await (await db()).find({ collection: "faqs", sort: "order", pagination: false, ...pub })).docs; }
export async function getPosts(limit = 50) { return (await (await db()).find({ collection: "posts", sort: "-publishedAt", limit, ...pub })).docs; }

/** Staff who are logged in can also open drafts and scheduled posts (preview). Everyone else gets the public rules. */
export async function getPost(slug: string) {
  const payload = await db();
  const { user } = await payload.auth({ headers: await headers() });
  const post = (await payload.find({ collection: "posts", where: { slug: { equals: slug } }, limit: 1, overrideAccess: false, user })).docs[0] ?? null;
  const live = post?.status === "published" && !!post.publishedAt && new Date(post.publishedAt) <= new Date();
  return { post, isPreview: Boolean(user && post && !live) };
}
export async function getTestimonials() { return (await (await db()).find({ collection: "testimonials", pagination: false, ...pub })).docs; }
