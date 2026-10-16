import Image from "next/image";
import Link from "next/link";
import { phoneIntl } from "@/lib/site";
const nav = [["About", "/about"], ["Programs", "/programs"], ["Activities", "/activities"], ["Gallery", "/gallery"], ["News", "/news"], ["Admissions", "/admissions"], ["Contact", "/contact"]];
export default function Header({ name, phone }: { name: string; phone: string }) {
  const tel = `tel:+${phoneIntl(phone)}`;
  return (
    <header className="sticky top-0 z-40 border-b border-sun/60 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link href="/" className="flex items-center gap-3" aria-label={`${name} home`}>
          <Image src="/images/logo.jpg" alt="" width={48} height={48} className="h-12 w-12 object-contain mix-blend-multiply" />
          <span className="font-display text-xl font-semibold text-ink">{name}</span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-5 font-bold lg:flex">
          {nav.map(([l, h]) => <Link key={h} href={h} className="hover:text-cherry">{l}</Link>)}
          {phone && <a href={tel} className="btn bg-cherry text-white">Call {phone}</a>}
        </nav>
        <details className="relative lg:hidden">
          <summary className="btn cursor-pointer list-none bg-sun text-ink">Menu</summary>
          <div className="absolute right-0 mt-2 flex w-56 flex-col gap-3 rounded-2xl bg-white p-4 shadow-lg">
            {nav.map(([l, h]) => <Link key={h} href={h} className="font-bold">{l}</Link>)}
            {phone && <a href={tel} className="btn bg-cherry text-white">Call us</a>}
          </div>
        </details>
      </div>
    </header>
  );
}
