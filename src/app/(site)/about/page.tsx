import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { PageHero, Wrap, Todo } from "@/components/Bits";
import { getAbout } from "@/lib/content";
import { hasText } from "@/lib/site";
export const metadata: Metadata = { title: "About Us", description: "About Kidz Time School in Palam Vihar, Gurugram: our values, approach and principal." };
export default async function About() {
  const a = await getAbout();
  return (<><PageHero title="About Kidz Time School" intro="A school in Palam Vihar, Gurugram where children have fun, learn and play." />
    <Wrap><div className="grid gap-10 md:grid-cols-2">
      <section><h2 className="text-2xl font-semibold">Our story</h2>{hasText(a.story) ? <div className="rich mt-3"><RichText data={a.story!} /></div> : <Todo>add the school's story in the admin panel (About page).</Todo>}</section>
      <section><h2 className="text-2xl font-semibold">Vision and mission</h2>
        {a.vision || a.mission ? <div className="mt-3 grid gap-3">{a.vision && <p><strong>Vision:</strong> {a.vision}</p>}{a.mission && <p><strong>Mission:</strong> {a.mission}</p>}</div> : <Todo>add vision and mission statements.</Todo>}</section>
      <section><h2 className="text-2xl font-semibold">Core values</h2>
        {a.values?.length ? <ul className="mt-4 flex flex-wrap gap-2">{a.values.map((v) => <li key={v.id} className="rounded-full bg-sky px-4 py-1 font-bold">{v.text}</li>)}</ul> : <Todo>add the school's core values.</Todo>}</section>
      <section><h2 className="text-2xl font-semibold">Message from the Principal</h2>{a.principalName && <p className="mt-2 font-bold">{a.principalName}, Principal</p>}
        {hasText(a.principalMessage) ? <div className="rich mt-3"><RichText data={a.principalMessage!} /></div> : <Todo>add the principal's message.</Todo>}</section>
    </div></Wrap></>);
}
