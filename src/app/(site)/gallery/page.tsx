import type { Metadata } from "next";
import { PageHero, Wrap } from "@/components/Bits";
import Gallery from "@/components/Gallery";
import { getGallery } from "@/lib/content";
export const metadata: Metadata = { title: "Gallery", description: "Photos of celebrations and activities at Kidz Time School." };
export default async function GalleryPage() {
  const docs = await getGallery();
  const items = docs.flatMap((g) => {
    const m = typeof g.image === "object" ? g.image : null;
    return m?.url ? [{ id: String(g.id), src: m.sizes?.card?.url || m.url, full: m.url, alt: g.caption || m.alt, cat: g.category }] : [];
  });
  return (<><PageHero title="Gallery" intro="Moments from celebrations and classroom activities." /><Wrap><Gallery items={items} /></Wrap></>);
}
