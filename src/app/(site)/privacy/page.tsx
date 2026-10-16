import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { PageHero, Wrap, Todo } from "@/components/Bits";
import { getPrivacy } from "@/lib/content";
import { hasText } from "@/lib/site";
export const metadata: Metadata = { title: "Privacy Policy", description: "How Kidz Time School handles website and enquiry data." };
export default async function Privacy() {
  const p = await getPrivacy();
  return (<><PageHero title="Privacy policy" intro="How we handle information from website visitors and enquiries." />
    <Wrap>{hasText(p.body) ? <div className="rich max-w-3xl"><RichText data={p.body!} /></div> : <Todo>add the privacy policy in the admin panel.</Todo>}</Wrap></>);
}
