import type { Metadata } from "next";
import { PageHero, Wrap } from "@/components/Bits";
import EnquiryForm from "@/components/EnquiryForm";
import { getSettings } from "@/lib/content";
import { mapsLink, phoneIntl } from "@/lib/site";
export const metadata: Metadata = { title: "Contact Us", description: "Address, phone, email and hours for Kidz Time School, Palam Vihar, Gurugram." };
export default async function Contact() {
  const s = await getSettings();
  const first = s.locations[0]?.address;
  return (<><PageHero title="Contact us" intro="Call, WhatsApp or visit us." />
    <Wrap><div className="grid gap-8 md:grid-cols-2">
      <div className="grid gap-4">
        {s.locations.map((l) => (<address key={l.id} className="rounded-3xl bg-white p-6 not-italic"><h2 className="text-xl font-semibold">{l.label}</h2><p className="whitespace-pre-line">{l.address}</p>
          <a className="mt-2 inline-block font-bold underline" href={mapsLink(l.address)}>Open in Google Maps</a></address>))}
        <div className="rounded-3xl bg-ink p-6 text-white"><p>{s.hours}</p>
          <p className="mt-2"><a className="underline" href={`tel:+${phoneIntl(s.phone)}`}>{s.phone}</a> (also WhatsApp)</p>
          <p><a className="underline" href={`mailto:${s.email}`}>{s.email}</a></p></div>
      </div>
      {first && <iframe title={`Map showing ${s.name}`} src={`https://www.google.com/maps?q=${encodeURIComponent(first)}&output=embed`} loading="lazy" className="h-96 w-full rounded-3xl border-0 md:h-full" />}
    </div><div className="mt-10 max-w-xl"><EnquiryForm type="contact" /></div></Wrap></>);
}
