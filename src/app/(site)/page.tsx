import Image from "next/image";
import Link from "next/link";
import { RichText } from "@payloadcms/richtext-lexical/react";
import CmsImage from "@/components/CmsImage";
import { getSettings, getHome, getPrograms, getActivities, getGallery, getPosts, getTestimonials } from "@/lib/content";
import { SITE_URL, phoneIntl, whatsappLink, dateIN } from "@/lib/site";
export default async function Home() {
  const [s, h, programs, activities, gallery, posts, testimonials] = await Promise.all([getSettings(), getHome(), getPrograms(), getActivities(), getGallery(), getPosts(3), getTestimonials()]);
  const jsonLd = { "@context": "https://schema.org", "@type": "School", name: s.name, url: SITE_URL, telephone: `+${phoneIntl(s.phone)}`, email: s.email,
    address: { "@type": "PostalAddress", addressLocality: "Gurugram", addressRegion: "Haryana", postalCode: "122017", addressCountry: "IN" } };
  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:grid-cols-2 md:py-20">
      <div>
        <p className="inline-block rounded-full bg-sun px-4 py-1 font-bold text-ink">Admissions open, Pre-Nursery onwards</p>
        <h1 className="mt-5 text-5xl font-semibold md:text-6xl">{h.heroHeadline || s.name}</h1>
        <p className="mt-5 max-w-prose text-lg">{h.heroText}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="btn bg-cherry text-white" href={whatsappLink(s.phone)}>Enquire on WhatsApp</a>
          <Link className="btn border-2 border-ink text-ink" href="/admissions">Admissions</Link>
        </div>
      </div>
      <div className="hero-in relative mx-auto w-full max-w-md">
        <div className="shield absolute inset-0 translate-x-4 translate-y-4 bg-sun" aria-hidden="true" />
        <div className="shield relative aspect-[4/5]"><CmsImage media={h.heroImage} priority sizes="(min-width:768px) 28rem, 90vw" /></div>
      </div>
    </section>
    {programs.length > 0 && <section className="bg-white py-16"><div className="mx-auto max-w-6xl px-5">
      <h2 className="text-3xl font-semibold">Programs from Pre-Nursery to Class 6</h2>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {programs.map((p) => <li key={p.id}><Link href={`/programs#${p.slug}`} className="block h-full rounded-3xl bg-sky p-5"><h3 className="text-xl font-semibold">{p.name}</h3>{p.ageGroup && <p className="mt-1 text-sm">{p.ageGroup}</p>}</Link></li>)}
      </ul></div></section>}
    {activities.length > 0 && <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-3xl font-semibold">Learning beyond the textbook</h2>
      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {activities.slice(0, 3).map((a) => (<li key={a.id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="relative aspect-[4/3]"><CmsImage media={a.image} sizes="(min-width:768px) 33vw, 100vw" /></div>
          <div className="p-5"><h3 className="text-xl font-semibold">{a.title}</h3><p className="mt-2">{a.description}</p></div></li>))}
      </ul></section>}
    {posts.length > 0 && <section className="bg-white py-16"><div className="mx-auto max-w-6xl px-5">
      <h2 className="text-3xl font-semibold">Latest news</h2>
      <ul className="mt-8 grid gap-4 md:grid-cols-3">
        {posts.map((p) => <li key={p.id}><Link href={`/news/${p.slug}`} className="block h-full rounded-3xl bg-sun-soft p-5"><p className="text-sm font-bold">{dateIN(p.publishedAt)}</p><h3 className="mt-1 text-xl font-semibold">{p.title}</h3></Link></li>)}
      </ul></div></section>}
    {gallery.length > 0 && <section className="bg-sun-soft py-16"><div className="mx-auto max-w-6xl px-5">
      <div className="flex items-end justify-between"><h2 className="text-3xl font-semibold">Moments from school</h2><Link href="/gallery" className="font-bold underline">See all photos</Link></div>
      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {gallery.slice(0, 4).map((g) => <li key={g.id} className="relative aspect-square overflow-hidden rounded-3xl"><CmsImage media={g.image} sizes="(min-width:768px) 25vw, 50vw" /></li>)}
      </ul></div></section>}
    {testimonials.length > 0 && <section className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-3xl font-semibold">What parents say</h2>
      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {testimonials.slice(0, 3).map((t) => <li key={t.id} className="rounded-3xl bg-white p-6"><blockquote>&ldquo;{t.quote}&rdquo;</blockquote>{t.parentName && <p className="mt-3 font-bold">{t.parentName}</p>}</li>)}
      </ul></section>}
    <section id="contact" className="mx-auto max-w-6xl px-5 py-16">
      <h2 className="text-3xl font-semibold">Visit or contact us</h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {s.locations.map((l) => <address key={l.id} className="rounded-3xl bg-white p-6 not-italic"><h3 className="text-xl font-semibold">{l.label}</h3><p className="whitespace-pre-line">{l.address}</p></address>)}
        <div className="rounded-3xl bg-ink p-6 text-white"><h3 className="font-display text-xl font-semibold text-sun">Get in touch</h3>
          <p className="mt-2">{s.hours}</p>
          <p className="mt-2"><a className="underline" href={`tel:+${phoneIntl(s.phone)}`}>{s.phone}</a> (also WhatsApp)</p>
          <p><a className="underline" href={`mailto:${s.email}`}>{s.email}</a></p></div>
      </div></section>
  </>);
}
