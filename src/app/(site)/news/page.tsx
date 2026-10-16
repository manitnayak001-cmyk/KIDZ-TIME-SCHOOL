import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Wrap } from "@/components/Bits";
import CmsImage from "@/components/CmsImage";
import { getPosts, getSettings } from "@/lib/content";
import { dateIN, phoneIntl } from "@/lib/site";
export const metadata: Metadata = { title: "News and Announcements", description: "Latest updates and notices from Kidz Time School." };
export default async function News() {
  const [posts, s] = await Promise.all([getPosts(), getSettings()]);
  return (<><PageHero title="News and announcements" intro="School updates, events and notices." />
    <Wrap>{posts.length === 0 ? (<div className="rounded-3xl bg-white p-8"><h2 className="text-2xl font-semibold">No announcements yet</h2>
        <p className="mt-2">For urgent questions, call <a className="underline" href={`tel:+${phoneIntl(s.phone)}`}>{s.phone}</a>.</p></div>) : (
      <ul className="grid gap-6 md:grid-cols-3">{posts.map((p) => (<li key={p.id} className="overflow-hidden rounded-3xl bg-white">
        {p.coverImage && <div className="relative aspect-[4/3]"><CmsImage media={p.coverImage} sizes="(min-width:768px) 33vw, 100vw" /></div>}
        <div className="p-5"><p className="text-sm font-bold">{dateIN(p.publishedAt)}{p.category && <span className="capitalize"> · {p.category}</span>}</p>
          <h2 className="mt-1 text-xl font-semibold"><Link href={`/news/${p.slug}`} className="hover:underline">{p.title}</Link></h2>{p.excerpt && <p className="mt-2">{p.excerpt}</p>}</div></li>))}</ul>)}
    </Wrap></>);
}
