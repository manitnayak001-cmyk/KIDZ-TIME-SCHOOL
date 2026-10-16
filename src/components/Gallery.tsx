"use client";
import Image from "next/image";
import { useRef, useState } from "react";
export type Item = { id: string; src: string; full: string; alt: string; cat: string };
export default function Gallery({ items }: { items: Item[] }) {
  const cats = ["All", ...Array.from(new Set(items.map((i) => i.cat)))];
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<Item | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const shown = cat === "All" ? items : items.filter((i) => i.cat === cat);
  return (<>
    <div role="group" aria-label="Filter photos" className="flex flex-wrap gap-2">
      {cats.map((c) => <button key={c} aria-pressed={c === cat} onClick={() => setCat(c)} className={`btn capitalize ${c === cat ? "bg-ink text-white" : "bg-white text-ink"}`}>{c}</button>)}
    </div>
    {shown.length === 0 && <p className="mt-8">No photos yet.</p>}
    <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
      {shown.map((i) => (<li key={i.id}><button onClick={() => { setOpen(i); ref.current?.showModal(); }} className="relative block aspect-square w-full overflow-hidden rounded-3xl">
        <Image src={i.src} alt={i.alt} fill unoptimized sizes="(min-width:768px) 33vw, 50vw" className="object-cover" loading="lazy" />
        <span className="sr-only">View larger</span></button></li>))}
    </ul>
    <dialog ref={ref} onClose={() => setOpen(null)} className="m-auto rounded-3xl p-3 backdrop:bg-black/70">
      {open && (<><div className="relative aspect-[4/3] w-[min(90vw,48rem)]"><Image src={open.full} alt={open.alt} fill unoptimized sizes="90vw" className="object-contain" /></div><p className="mt-2">{open.alt}</p></>)}
      <form method="dialog"><button className="btn mt-3 bg-cherry text-white">Close</button></form>
    </dialog>
  </>);
}
