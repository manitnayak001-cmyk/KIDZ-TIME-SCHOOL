import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { PageHero, Wrap, Todo } from "@/components/Bits";
import EnquiryForm from "@/components/EnquiryForm";
import { getAdmission, getFaqs, getPrograms, getSettings } from "@/lib/content";
import { hasText, phoneIntl, whatsappLink } from "@/lib/site";
export const metadata: Metadata = { title: "Admissions", description: "Admissions are open at Kidz Time School from Pre-Nursery onwards." };
export default async function Admissions() {
  const [a, faqs, programs, s] = await Promise.all([getAdmission(), getFaqs(), getPrograms(), getSettings()]);
  const empty = !a.steps?.length && !hasText(a.eligibility) && !a.documents?.length && !a.importantDates?.length;
  return (<><PageHero title="Admissions" intro="Admissions are open, Pre-Nursery onwards." />
    <Wrap>
      {a.intro && <p className="max-w-prose text-lg">{a.intro}</p>}
      {!!a.steps?.length && <><h2 className="mt-6 text-2xl font-semibold">How to apply</h2><ol className="mt-4 grid list-decimal gap-3 pl-6 md:grid-cols-2">{a.steps.map((x) => <li key={x.id} className="font-bold">{x.text}</li>)}</ol></>}
      {hasText(a.eligibility) && <div className="rich mt-6"><h2>Eligibility</h2><RichText data={a.eligibility!} /></div>}
      {!!a.documents?.length && <><h2 className="mt-6 text-2xl font-semibold">Documents required</h2><ul className="mt-3 list-disc pl-6">{a.documents.map((x) => <li key={x.id}>{x.text}</li>)}</ul></>}
      {!!a.importantDates?.length && <><h2 className="mt-6 text-2xl font-semibold">Important dates</h2><ul className="mt-3 list-disc pl-6">{a.importantDates.map((x) => <li key={x.id}><strong>{x.label}</strong>{x.date && `: ${x.date}`}</li>)}</ul></>}
      {empty && <Todo>add admission steps, eligibility, documents and dates in the admin panel (Admission info).</Todo>}
      <div className="mt-6 flex flex-wrap gap-3">
        <a className="btn bg-cherry text-white" href={whatsappLink(s.phone)}>Enquire on WhatsApp</a>
        <a className="btn border-2 border-ink text-ink" href={`tel:+${phoneIntl(s.phone)}`}>Call {s.phone}</a></div>
      <div className="mt-10 max-w-xl"><EnquiryForm type="admission" classes={programs.map((p) => p.name)} /></div>
      {faqs.length > 0 && <><h2 className="mt-14 text-2xl font-semibold">Frequently asked questions</h2>
        <div className="mt-4 grid gap-3">{faqs.map((f) => (<details key={f.id} className="rounded-2xl bg-white p-4"><summary className="cursor-pointer font-bold">{f.question}</summary><p className="mt-2">{f.answer}</p></details>))}</div></>}
    </Wrap></>);
}
