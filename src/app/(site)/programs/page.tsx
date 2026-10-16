import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { PageHero, Wrap, Todo } from "@/components/Bits";
import CmsImage from "@/components/CmsImage";
import { getPrograms } from "@/lib/content";
import { hasText } from "@/lib/site";
export const metadata: Metadata = { title: "Programs", description: "Classes at Kidz Time School from Pre-Nursery to Class 6." };
export default async function Programs() {
  const programs = await getPrograms();
  return (<><PageHero title="Programs" intro="Classes from Pre-Nursery to Class 6." />
    <Wrap>{programs.length === 0 && <p>Program details are coming soon.</p>}
      <ul className="grid gap-6 md:grid-cols-2">
        {programs.map((p) => {
          const filled = p.summary || hasText(p.objectives) || hasText(p.curriculum) || p.milestones?.length;
          return (<li key={p.id} id={p.slug} className="scroll-mt-24 overflow-hidden rounded-3xl bg-white">
            {p.coverImage && <div className="relative aspect-[16/9]"><CmsImage media={p.coverImage} sizes="(min-width:768px) 50vw, 100vw" /></div>}
            <div className="p-6"><h2 className="text-2xl font-semibold">{p.name}</h2>{p.ageGroup && <p className="mt-1 font-bold">{p.ageGroup}</p>}
              {p.summary && <p className="mt-3">{p.summary}</p>}
              {hasText(p.objectives) && <div className="rich mt-3"><h3>Learning objectives</h3><RichText data={p.objectives!} /></div>}
              {hasText(p.curriculum) && <div className="rich mt-3"><h3>Curriculum</h3><RichText data={p.curriculum!} /></div>}
              {!!p.milestones?.length && <div className="mt-3"><h3 className="text-lg font-semibold">Milestones</h3><ul className="mt-1 list-disc pl-6">{p.milestones.map((m) => <li key={m.id}>{m.text}</li>)}</ul></div>}
              {!filled && <Todo>add age group, objectives and curriculum for {p.name}.</Todo>}</div></li>);
        })}
      </ul></Wrap></>);
}
