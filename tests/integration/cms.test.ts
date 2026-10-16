import { beforeAll, describe, expect, it } from "vitest";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";

let payload: Payload;
let admin: any, editor: any;
const as = (u: any) => ({ ...u, collection: "users" });
const asPublic = { overrideAccess: false } as const;
const past = "2020-01-01T00:00:00.000Z", future = "2099-01-01T00:00:00.000Z";

beforeAll(async () => {
  payload = await getPayload({ config });
  admin = as(await payload.create({ collection: "users", data: { email: "admin@test.dev", password: "Admin-pass-12345" } }));
  editor = as(await payload.create({ collection: "users", data: { email: "editor@test.dev", password: "Editor-pass-12345" } }));
});

describe("users and roles", () => {
  it("makes the first account an administrator and later ones editors", () => { expect(admin.role).toBe("admin"); expect(editor.role).toBe("editor"); });
  it("lets an administrator create users but not an editor", async () => {
    await expect(payload.create({ collection: "users", data: { email: "x@test.dev", password: "Pass-12345-xx" }, overrideAccess: false, user: editor })).rejects.toThrow();
    await expect(payload.create({ collection: "users", data: { email: "y@test.dev", password: "Pass-12345-yy" }, overrideAccess: false, user: admin })).resolves.toBeTruthy();
  });
  it("stops an editor promoting themselves", async () => {
    await payload.update({ collection: "users", id: editor.id, data: { role: "admin" }, overrideAccess: false, user: editor });
    expect((await payload.findByID({ collection: "users", id: editor.id })).role).toBe("editor");
  });
  it("hides the user list from the public", async () => { await expect(payload.find({ collection: "users", ...asPublic })).rejects.toThrow(); });
  it("locks an account after repeated wrong passwords", async () => {
    for (let i = 0; i < 5; i++) await payload.login({ collection: "users", data: { email: "y@test.dev", password: "wrong-password" } }).catch(() => {});
    await expect(payload.login({ collection: "users", data: { email: "y@test.dev", password: "Pass-12345-yy" } })).rejects.toThrow();
  });
});

describe("enquiries are private", () => {
  let id: number | string;
  beforeAll(async () => { id = (await payload.create({ collection: "enquiries", data: { type: "contact", name: "Parent", phone: "+919876543210", message: "hello" } })).id; });
  it("cannot be read or created by the public", async () => {
    await expect(payload.find({ collection: "enquiries", ...asPublic })).rejects.toThrow();
    await expect(payload.create({ collection: "enquiries", data: { type: "contact", name: "Bot", phone: "+919876543210" }, ...asPublic })).rejects.toThrow();
  });
  it("cannot be created through the staff interface either (only the form handler can)", async () => {
    await expect(payload.create({ collection: "enquiries", data: { type: "contact", name: "x", phone: "1" }, overrideAccess: false, user: admin })).rejects.toThrow();
  });
  it("can be read and updated by staff, but only deleted by an administrator", async () => {
    expect((await payload.find({ collection: "enquiries", overrideAccess: false, user: editor })).totalDocs).toBeGreaterThan(0);
    const u = await payload.update({ collection: "enquiries", id, data: { status: "contacted", notes: "called" }, overrideAccess: false, user: editor });
    expect(u.status).toBe("contacted");
    await expect(payload.delete({ collection: "enquiries", id, overrideAccess: false, user: editor })).rejects.toThrow();
    await expect(payload.delete({ collection: "enquiries", id, overrideAccess: false, user: admin })).resolves.toBeTruthy();
  });
});

describe("what the public can see", () => {
  it("shows only published posts dated today or earlier", async () => {
    const mk = (slug: string, status: string, publishedAt?: string) => payload.create({ collection: "posts", data: { title: slug, slug, status: status as any, publishedAt }, overrideAccess: false, user: editor });
    await mk("live", "published", past); await mk("draft", "draft", past); await mk("scheduled", "published", future); await mk("old", "archived", past);
    const slugs = async (user?: any) => (await payload.find({ collection: "posts", overrideAccess: false, user })).docs.map((d) => d.slug).sort();
    expect(await slugs()).toEqual(["live"]);
    expect(await slugs(editor)).toEqual(["draft", "live", "old", "scheduled"]);
  });
  it("hides programs, gallery items and activities marked not visible", async () => {
    await payload.create({ collection: "programs", data: { name: "Shown", slug: "shown", visible: true }, user: editor, overrideAccess: false });
    await payload.create({ collection: "programs", data: { name: "Hidden", slug: "hidden", visible: false }, user: editor, overrideAccess: false });
    expect((await payload.find({ collection: "programs", ...asPublic })).docs.map((d) => d.name)).toEqual(["Shown"]);
    await expect(payload.find({ collection: "faqs", ...asPublic })).resolves.toBeTruthy();
  });
  it("shows testimonials only with parent consent", async () => {
    const t = (quote: string, consent: boolean) => payload.create({ collection: "testimonials", data: { quote, consent, visible: true }, user: editor, overrideAccess: false });
    await t("with consent", true); await t("no consent", false);
    expect((await payload.find({ collection: "testimonials", ...asPublic })).docs.map((d) => d.quote)).toEqual(["with consent"]);
  });
  it("lets only staff change site settings", async () => {
    await expect(payload.updateGlobal({ slug: "site-settings", data: { phone: "1" }, ...asPublic })).rejects.toThrow();
    await expect(payload.updateGlobal({ slug: "site-settings", data: { phone: "7290030030" }, overrideAccess: false, user: editor })).resolves.toBeTruthy();
    expect((await payload.findGlobal({ slug: "site-settings", ...asPublic })).phone).toBe("7290030030");
  });
});

describe("content management operations", () => {
  it("creates, edits, reorders and deletes a program as an editor", async () => {
    const o = { overrideAccess: false, user: editor } as const;
    const a = await payload.create({ collection: "programs", data: { name: "A", slug: "prog-a", order: 2 }, ...o });
    const b = await payload.create({ collection: "programs", data: { name: "B", slug: "prog-b", order: 1 }, ...o });
    await payload.update({ collection: "programs", id: a.id, data: { name: "A renamed", order: 0 }, ...o });
    const names = (await payload.find({ collection: "programs", sort: "order", ...o })).docs.map((d) => d.name).filter((n) => n.startsWith("A") || n === "B");
    expect(names).toEqual(["A renamed", "B"]);
    await payload.delete({ collection: "programs", id: b.id, ...o });
    expect((await payload.find({ collection: "programs", where: { slug: { equals: "prog-b" } }, ...o })).totalDocs).toBe(0);
  });
  it("refuses two items with the same address (slug)", async () => {
    await expect(payload.create({ collection: "programs", data: { name: "Dup", slug: "prog-a" } })).rejects.toThrow();
  });
});

describe("photo uploads", () => {
  it("requires a description (alt text)", async () => {
    await expect(payload.create({ collection: "media", data: {} as any, filePath: "public/images/logo.jpg" })).rejects.toThrow();
  });
  it("accepts an image with a description", async () => {
    const m = await payload.create({ collection: "media", data: { alt: "School logo" }, filePath: "public/images/logo.jpg" });
    expect(m.mimeType).toBe("image/jpeg");
  });
  it("rejects files that are not images", async () => {
    await expect(payload.create({ collection: "media", data: { alt: "doc" }, filePath: "README.md" })).rejects.toThrow();
  });
  it("only lets logged-in staff upload", async () => {
    await expect(payload.create({ collection: "media", data: { alt: "x" }, filePath: "public/images/logo.jpg", ...asPublic })).rejects.toThrow();
  });
});
