import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { validateEnquiry } from "@/lib/enquiry";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(ip, 5, 60 * 60 * 1000)) return NextResponse.json({ ok: false, error: "Too many enquiries from this connection. Please call or WhatsApp us instead." }, { status: 429 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  const result = validateEnquiry(body);
  if (!result.ok) return NextResponse.json({ ok: false, errors: result.errors }, { status: 422 });
  if (result.spam) return NextResponse.json({ ok: true });
  try {
    const payload = await getPayload({ config });
    // Overall cap that survives restarts: stops a flood from many addresses at once.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { totalDocs } = await payload.count({ collection: "enquiries", where: { createdAt: { greater_than: since } }, overrideAccess: true });
    if (totalDocs >= 60) return NextResponse.json({ ok: false, error: "We are receiving many enquiries right now. Please call or WhatsApp us instead." }, { status: 429 });
    await payload.create({ collection: "enquiries", data: result.data, overrideAccess: true });
    if (process.env.NOTIFY_EMAIL) {
      const d = result.data; // never allow a failed e-mail to lose or reject an enquiry
      payload.sendEmail({ to: process.env.NOTIFY_EMAIL, subject: `New ${d.type} enquiry from ${d.name}`, text: `Name: ${d.name}\nPhone: ${d.phone}\nEmail: ${d.email ?? "-"}\nClass: ${d.childClass ?? "-"}\n\n${d.message ?? ""}\n\nOpen the admin panel to follow up.` }).catch((e) => console.error("Enquiry e-mail failed", e));
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Enquiry could not be saved", err);
    return NextResponse.json({ ok: false, error: "We could not save your enquiry. Please call or WhatsApp us." }, { status: 500 });
  }
}
