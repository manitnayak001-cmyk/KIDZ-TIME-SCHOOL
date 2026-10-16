import type { Metadata } from "next";
import { PageHero, Wrap } from "@/components/Bits";
import CmsImage from "@/components/CmsImage";
import { getActivities } from "@/lib/content";
export const metadata: Metadata = { title: "Activities and Facilities", description: "Celebrations, arts and crafts, and nature activities at Kidz Time School." };
export default async function Activities() {
  const items = await getActivities();
  return (<><PageHero title="Activities and facilities" intro="Children learn through celebrations, crafts and hands-on projects." />
    <Wrap>{items.length === 0 && <p>Activities will be added soon.</p>}
      <ul className="grid gap-6 md:grid-cols-3">
        {items.map((a) => (<li key={a.id} className="overflow-hidden rounded-3xl bg-white">
          {a.image && <div className="relative aspect-[4/3]"><CmsImage media={a.image} sizes="(min-width:768px) 33vw, 100vw" /></div>}
          <div className="p-5"><p className="text-sm font-bold capitalize">{a.category}</p><h2 className="text-xl font-semibold">{a.title}</h2><p className="mt-2">{a.description}</p></div></li>))}
      </ul></Wrap></>);
}
