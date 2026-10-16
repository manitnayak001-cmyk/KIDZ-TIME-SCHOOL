// One-time import of the school's real details and photos into the CMS. Safe to run again: it never overwrites existing content.
import path from "path";
import { getPayload } from "payload";
import config from "../src/payload.config";

const text = (t: string, tag?: "h2") => ({ type: tag ? "heading" : "paragraph", tag, version: 1, format: "", indent: 0, direction: "ltr", children: [{ type: "text", version: 1, text: t, format: 0, detail: 0, mode: "normal", style: "" }] });
const rich = (...blocks: ReturnType<typeof text>[]) => ({ root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr" as const, children: blocks } }) as never;

const payload = await getPayload({ config });
const img = async (file: string, alt: string) => (await payload.create({ collection: "media", data: { alt }, filePath: path.resolve("public/images", file) })).id;
const empty = async (collection: "programs" | "activities" | "gallery-items" | "faqs") => (await payload.count({ collection })).totalDocs === 0;

await payload.updateGlobal({ slug: "site-settings", data: {
  name: "Kidz Time School", tagline: "Fun Learn & Play", phone: "7290030030", email: "kidztimeschool@gmail.com", hours: "Monday to Saturday, 8:00 am to 2:00 pm",
  locations: [{ label: "Location 1", address: "A 46, Sahib Kunj, New Palam Vihar, Gurugram, Haryana 122017" }, { label: "Location 2", address: "H.No. 33, Dharam Colony, near Shiv Mandir, Palam Vihar Extension, Gurugram, Haryana 122017" }],
  social: [{ name: "Facebook", url: "https://www.facebook.com/share/1FcCXPneLR/" }, { name: "Instagram", url: "https://instagram.com/kidztimeschool?obrf=bTVlMm5paXVjdjV0" }],
} });

const photos = {
  mothers: await img("hero-mothers-day.jpg", "Children in paper crowns showing Mother's Day crafts"),
  xmas: await img("christmas.jpg", "Children dressed as Santa and angels holding paper Christmas trees"),
  xmas2: await img("christmas-group.jpg", "Four children in Santa costumes beside a Christmas tree"),
  diwali: await img("diwali.jpg", "Children holding lit diyas beside a rangoli and a Happy Diwali board"),
  plants: await img("plants.jpg", "Children in green paper crowns holding potted plants"),
  red: await img("red-day.jpg", "Children in red clothes holding drawings of fruits on Red Day"),
};
await payload.updateGlobal({ slug: "home-page", data: { heroHeadline: "Where little learners have fun, learn and play", heroText: "A friendly school in Palam Vihar, Gurugram for children from Pre-Nursery to Class 6.", heroImage: photos.mothers } });
await payload.updateGlobal({ slug: "about-page", data: { principalName: "Jayashree Nayak" } });

if (await empty("programs")) {
  const names = ["Pre-Nursery", "Nursery", "LKG & UKG", "Classes 1 to 5", "Class 6"];
  for (const [i, name] of names.entries()) await payload.create({ collection: "programs", data: { name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, ""), order: i } });
}
if (await empty("activities")) {
  await payload.create({ collection: "activities", data: { title: "Festivals and celebrations", category: "cultural", description: "Diwali rangoli, Christmas, Mother's Day and more, celebrated in class with crafts and costumes.", image: photos.diwali, order: 0 } });
  await payload.create({ collection: "activities", data: { title: "Nature and environment", category: "outdoor", description: "Children plant saplings and learn how plants grow.", image: photos.plants, order: 1 } });
  await payload.create({ collection: "activities", data: { title: "Arts and crafts", category: "arts", description: "Drawing, colouring and paper crafts for every theme day.", image: photos.red, order: 2 } });
}
if (await empty("gallery-items")) {
  const g: [number, string, "celebrations" | "activities"][] = [[photos.xmas, "Santa and angels with paper Christmas trees", "celebrations"], [photos.xmas2, "Children in Santa costumes beside a Christmas tree", "celebrations"],
    [photos.diwali, "Diwali diyas and rangoli", "celebrations"], [photos.mothers, "Mother's Day paper crowns", "celebrations"], [photos.plants, "Children with the plants they potted", "activities"], [photos.red, "Red Day fruit drawings", "activities"]];
  for (const [i, [image, caption, category]] of g.entries()) await payload.create({ collection: "gallery-items", data: { image, caption, category, order: i } });
}
if (await empty("faqs")) {
  const f = [["Which classes are open for admission?", "Admissions are open from Pre-Nursery onwards."], ["What are the fees?", "Please contact the school for fee details."], ["When can I visit?", "Monday to Saturday, 8:00 am to 2:00 pm."], ["How do I enquire?", "Use the enquiry form on this page, or call or WhatsApp 7290030030."]];
  for (const [i, [question, answer]] of f.entries()) await payload.create({ collection: "faqs", data: { question, answer, order: i } });
}
const privacy = await payload.findGlobal({ slug: "privacy-page" });
if (!JSON.stringify(privacy.body ?? {}).includes('"text"')) await payload.updateGlobal({ slug: "privacy-page", data: { body: rich(
  text("DRAFT TEMPLATE: the school must review this against its actual practices and applicable law before launch.", "h2"),
  text("Information we collect", "h2"), text("When you send an enquiry we collect the name, mobile number, optional email address, class of interest and message you provide."),
  text("How we use it", "h2"), text("Authorised school staff use this information only to reply to your enquiry."),
  text("Photographs of children", "h2"), text("Photographs on this website are published with the consent of parents. Contact us to have a photo removed."),
  text("How long we keep it", "h2"), text("[School to confirm how long enquiries are kept.]"),
  text("Contact us", "h2"), text("Questions about this policy: kidztimeschool@gmail.com or 7290030030.")) } });
console.log("Seed complete");
process.exit(0);
