import path from "path";
import type { Access, CollectionConfig, GlobalConfig, Where } from "payload";

const roleOf = (req: { user?: unknown }) => (req.user as { role?: string } | null | undefined)?.role;
const staff: Access = ({ req }) => Boolean(req.user);
const admin: Access = ({ req }) => roleOf(req) === "admin";
const everyone: Access = () => true;
/** Visitors see only items marked visible; staff see everything. */
const visibleOnly: Access = ({ req }) => (req.user ? true : { visible: { equals: true } });
/** Visitors see only published posts whose publish date has arrived (this gives scheduled publishing). */
const publishedPosts: Access = ({ req }) => {
  if (req.user) return true;
  const and: Where[] = [{ status: { equals: "published" } }, { publishedAt: { less_than_equal: new Date().toISOString() } }];
  return { and };
};
/** Visitors see only testimonials that are visible and have parent consent. */
const consentedOnly: Access = ({ req }) => {
  if (req.user) return true;
  const and: Where[] = [{ visible: { equals: true } }, { consent: { equals: true } }];
  return { and };
};
const slugField = { name: "slug", type: "text", required: true, unique: true, index: true, admin: { description: "Used in the page address, e.g. my-first-post" } } as const;
const order = { name: "order", type: "number", defaultValue: 0, admin: { description: "Lower numbers appear first" } } as const;
const visible = { name: "visible", type: "checkbox", defaultValue: true, admin: { description: "Untick to hide from the website" } } as const;

export const Users: CollectionConfig = {
  slug: "users",
  auth: { maxLoginAttempts: 5, lockTime: 10 * 60 * 1000, tokenExpiration: 60 * 60 * 8 },
  admin: { useAsTitle: "email", defaultColumns: ["email", "role"] },
  access: {
    read: staff, create: admin, delete: admin,
    update: ({ req }) => (roleOf(req) === "admin" ? true : req.user ? { id: { equals: req.user.id } } : false),
  },
  hooks: {
    beforeChange: [async ({ data, operation, req }) => {
      // The very first account becomes the administrator.
      if (operation === "create") {
        const { totalDocs } = await req.payload.count({ collection: "users", overrideAccess: true });
        if (totalDocs === 0) data.role = "admin";
      }
      return data;
    }],
  },
  fields: [{ name: "role", type: "select", required: true, defaultValue: "editor", options: [{ label: "Administrator", value: "admin" }, { label: "Editor", value: "editor" }], access: { update: ({ req }) => roleOf(req) === "admin" } }],
};

export const Media: CollectionConfig = {
  slug: "media",
  access: { read: everyone, create: staff, update: staff, delete: staff },
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), "media"),
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    imageSizes: [{ name: "thumbnail", width: 400 }, { name: "card", width: 800 }],
  },
  fields: [{ name: "alt", type: "text", required: true, admin: { description: "Describe the photo for visitors who cannot see it" } }],
};

export const Programs: CollectionConfig = {
  slug: "programs", defaultSort: "order",
  admin: { useAsTitle: "name", defaultColumns: ["name", "ageGroup", "order", "visible"] },
  access: { read: visibleOnly, create: staff, update: staff, delete: staff },
  fields: [
    { name: "name", type: "text", required: true }, slugField,
    { name: "ageGroup", type: "text" }, { name: "summary", type: "textarea" },
    { name: "objectives", type: "richText" }, { name: "curriculum", type: "richText" },
    { name: "milestones", type: "array", fields: [{ name: "text", type: "text", required: true }] },
    { name: "coverImage", type: "upload", relationTo: "media" }, order, visible,
  ],
};

export const Activities: CollectionConfig = {
  slug: "activities", defaultSort: "order",
  admin: { useAsTitle: "title", defaultColumns: ["title", "category", "order", "visible"] },
  access: { read: visibleOnly, create: staff, update: staff, delete: staff },
  fields: [
    { name: "title", type: "text", required: true },
    { name: "category", type: "select", required: true, options: ["indoor", "outdoor", "arts", "sports", "cultural", "classroom", "facility"] },
    { name: "description", type: "textarea" }, { name: "image", type: "upload", relationTo: "media" }, order, visible,
  ],
};

export const GalleryItems: CollectionConfig = {
  slug: "gallery-items", defaultSort: "order",
  labels: { singular: "Gallery photo", plural: "Gallery photos" },
  admin: { useAsTitle: "caption", defaultColumns: ["caption", "category", "order", "visible"] },
  access: { read: visibleOnly, create: staff, update: staff, delete: staff },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "caption", type: "text", required: true, admin: { description: "Also used as the photo's description for accessibility" } },
    { name: "category", type: "select", required: true, options: ["events", "celebrations", "classrooms", "activities", "facilities"] }, order, visible,
  ],
};

export const Posts: CollectionConfig = {
  slug: "posts", labels: { singular: "News post", plural: "News posts" }, defaultSort: "-publishedAt",
  admin: {
    useAsTitle: "title", defaultColumns: ["title", "status", "publishedAt"],
    // "Preview" button in the editor: staff who are logged in can open drafts and scheduled posts on the real page.
    preview: (doc) => (doc?.slug ? `${process.env.SITE_URL || "http://localhost:3000"}/news/${doc.slug}` : null),
  },
  access: {
    read: publishedPosts,
    create: staff, update: staff, delete: staff,
  },
  fields: [
    { name: "title", type: "text", required: true }, slugField,
    { name: "status", type: "select", required: true, defaultValue: "draft", options: ["draft", "published", "archived"] },
    { name: "publishedAt", type: "date", admin: { date: { pickerAppearance: "dayAndTime" }, description: "Set a future date to schedule the post" } },
    { name: "category", type: "select", options: ["announcement", "event", "celebration", "notice"] },
    { name: "excerpt", type: "textarea" }, { name: "coverImage", type: "upload", relationTo: "media" }, { name: "body", type: "richText" },
  ],
};

export const Faqs: CollectionConfig = {
  slug: "faqs", defaultSort: "order", labels: { singular: "FAQ", plural: "FAQs" },
  admin: { useAsTitle: "question" }, access: { read: visibleOnly, create: staff, update: staff, delete: staff },
  fields: [{ name: "question", type: "text", required: true }, { name: "answer", type: "textarea", required: true }, order, visible],
};

export const Testimonials: CollectionConfig = {
  slug: "testimonials", admin: { useAsTitle: "parentName" },
  access: { read: consentedOnly, create: staff, update: staff, delete: staff },
  fields: [
    { name: "quote", type: "textarea", required: true }, { name: "parentName", type: "text" },
    { name: "consent", type: "checkbox", defaultValue: false, admin: { description: "Tick only when the parent has agreed to publication" } }, visible,
  ],
};

export const Enquiries: CollectionConfig = {
  slug: "enquiries", defaultSort: "-createdAt",
  admin: { useAsTitle: "name", defaultColumns: ["name", "phone", "type", "status", "createdAt"] },
  // Never public. Enquiries are created only by the server-side form handler.
  access: { read: staff, create: () => false, update: staff, delete: admin },
  fields: [
    { name: "type", type: "select", required: true, options: ["admission", "contact"], index: true },
    { name: "name", type: "text", required: true }, { name: "phone", type: "text", required: true }, { name: "email", type: "email" },
    { name: "childClass", type: "text", label: "Class of interest" }, { name: "message", type: "textarea" },
    { name: "status", type: "select", defaultValue: "new", index: true, options: ["new", "contacted", "closed"] },
    { name: "notes", type: "textarea", admin: { description: "Private staff notes" } },
  ],
};

export const SiteSettings: GlobalConfig = {
  slug: "site-settings", access: { read: everyone, update: staff },
  fields: [
    { name: "name", type: "text", required: true, defaultValue: "Kidz Time School" }, { name: "tagline", type: "text", defaultValue: "Fun Learn & Play" },
    { name: "phone", type: "text" }, { name: "email", type: "email" }, { name: "hours", type: "text" },
    { name: "locations", type: "array", fields: [{ name: "label", type: "text", required: true }, { name: "address", type: "textarea", required: true }] },
    { name: "social", type: "array", fields: [{ name: "name", type: "text", required: true }, { name: "url", type: "text", required: true }] },
  ],
};

export const AdmissionInfo: GlobalConfig = {
  slug: "admission-info", access: { read: everyone, update: staff },
  fields: [
    { name: "intro", type: "textarea" }, { name: "steps", type: "array", fields: [{ name: "text", type: "text", required: true }] },
    { name: "eligibility", type: "richText" }, { name: "documents", type: "array", fields: [{ name: "text", type: "text", required: true }] },
    { name: "importantDates", type: "array", fields: [{ name: "label", type: "text", required: true }, { name: "date", type: "text" }] },
  ],
};

const rt = (name: string) => ({ name, type: "richText" }) as const;
export const HomePage: GlobalConfig = {
  slug: "home-page", access: { read: everyone, update: staff },
  fields: [{ name: "heroHeadline", type: "text" }, { name: "heroText", type: "textarea" }, { name: "heroImage", type: "upload", relationTo: "media" }],
};
export const AboutPage: GlobalConfig = {
  slug: "about-page", access: { read: everyone, update: staff },
  fields: [rt("story"), { name: "vision", type: "textarea" }, { name: "mission", type: "textarea" },
    { name: "values", type: "array", fields: [{ name: "text", type: "text", required: true }] },
    { name: "principalName", type: "text" }, rt("principalMessage")],
};
export const PrivacyPage: GlobalConfig = { slug: "privacy-page", access: { read: everyone, update: staff }, fields: [rt("body")] };

export const collections = [Users, Media, Programs, Activities, GalleryItems, Posts, Faqs, Testimonials, Enquiries];
export const globals = [SiteSettings, HomePage, AboutPage, AdmissionInfo, PrivacyPage];
