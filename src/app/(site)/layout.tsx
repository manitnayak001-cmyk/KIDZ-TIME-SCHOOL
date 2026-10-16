import type { Metadata } from "next";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { getSettings } from "@/lib/content";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Content comes from the CMS database, so pages are always rendered fresh and edits appear immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${s.name} | Pre-Nursery to Class 6 in Palam Vihar, Gurugram`, template: `%s | ${s.name}` },
    description: `${s.name} in Palam Vihar, Gurugram. Admissions open from Pre-Nursery to Class 6.${s.phone ? ` Call ${s.phone}.` : ""}`,
    openGraph: { title: s.name, description: s.tagline, url: SITE_URL, type: "website", images: ["/images/hero-mothers-day.jpg"] },
  };
}
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  return (
    <html lang="en"><body>
      <svg width="0" height="0" aria-hidden="true" className="absolute"><defs><clipPath id="shield" clipPathUnits="objectBoundingBox"><path d="M0,0.06 Q0.12,0 0.5,0.05 Q0.88,0 1,0.06 L1,0.6 Q1,0.86 0.5,1 Q0,0.86 0,0.6 Z" /></clipPath></defs></svg>
      <a href="#main" className="skip">Skip to content</a>
      <Header name={s.name} phone={s.phone} /><main id="main">{children}</main><Footer name={s.name} tagline={s.tagline} social={s.social} />
    </body></html>
  );
}
