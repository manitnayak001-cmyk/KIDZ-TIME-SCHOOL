"use client";
import { useState } from "react";

type Props = { type: "admission" | "contact"; classes?: string[] };
const input = "mt-1 w-full rounded-2xl border-2 border-ink/30 bg-white px-4 py-2";

export default function EnquiryForm({ type, classes = [] }: Props) {
  const [started] = useState(() => Date.now());
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending"); setErrors({}); setNotice("");
    const fields = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/enquiry-submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...fields, type, startedAt: started }) });
      const data = await res.json();
      if (res.ok && data.ok) { setState("done"); return; }
      setErrors(data.errors ?? {}); setNotice(data.error ?? "Please fix the fields marked below."); setState("error");
    } catch { setNotice("We could not send your enquiry. Please call or WhatsApp us."); setState("error"); }
  }

  if (state === "done") return (
    <div role="status" className="rounded-3xl border-2 border-leaf bg-sun-soft p-6"><h3 className="text-xl font-semibold">Thank you</h3><p className="mt-1">We have received your enquiry and will call you soon.</p></div>);

  const field = (id: string, label: string, el: React.ReactNode) => (
    <div><label htmlFor={id} className="font-bold">{label}</label>{el}
      {errors[id] && <p id={`${id}-err`} className="mt-1 font-bold text-cherry">{errors[id]}</p>}</div>);
  const a = (id: string) => ({ id, name: id, "aria-invalid": Boolean(errors[id]), "aria-describedby": errors[id] ? `${id}-err` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-4 rounded-3xl bg-white p-6">
      <h2 className="text-2xl font-semibold">{type === "admission" ? "Admission enquiry" : "Send us a message"}</h2>
      {field("name", "Your name", <input {...a("name")} required autoComplete="name" className={input} />)}
      {field("phone", "Mobile number", <input {...a("phone")} required type="tel" autoComplete="tel" inputMode="tel" className={input} />)}
      {field("email", "Email (optional)", <input {...a("email")} type="email" autoComplete="email" className={input} />)}
      {type === "admission" && field("childClass", "Class of interest (optional)", (
        <select {...a("childClass")} className={input}><option value="">Not sure yet</option>{classes.map((c) => <option key={c}>{c}</option>)}</select>))}
      {field("message", type === "contact" ? "Message" : "Message (optional)", <textarea {...a("message")} rows={4} required={type === "contact"} className={input} />)}
      <div aria-hidden="true" className="absolute -left-[999px]"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div aria-live="polite">{notice && <p className="font-bold text-cherry">{notice}</p>}</div>
      <button disabled={state === "sending"} className="btn bg-cherry text-white disabled:opacity-60">{state === "sending" ? "Sending..." : "Send enquiry"}</button>
    </form>);
}
