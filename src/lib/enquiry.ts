export type EnquiryData = { type: "admission" | "contact"; name: string; phone: string; email?: string; childClass?: string; message?: string };
export type EnquiryResult = { ok: true; spam: boolean; data: EnquiryData } | { ok: false; errors: Record<string, string> };

// Removes control characters, trims, and caps the length.
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max) : "");

/** Single-line fields: also collapses any whitespace, so line breaks cannot sneak in. */
const line = (v: unknown, max: number) => clean(v, max).replace(/\s+/g, " ");

/** Accepts Indian mobile numbers with optional +91 / 91 / 0 prefix. Returns 10 digits or null. */
export function normalizePhone(raw: string): string | null {
  const m = raw.replace(/[\s\-()]/g, "").match(/^(?:\+91|91|0)?([6-9]\d{9})$/);
  return m ? m[1] : null;
}

export function validateEnquiry(input: unknown, now = Date.now()): EnquiryResult {
  const b = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const type = b.type === "admission" || b.type === "contact" ? b.type : null;
  const name = line(b.name, 100), email = line(b.email, 200), message = clean(b.message, 1000), childClass = line(b.childClass, 50);
  const phone = normalizePhone(line(b.phone, 30));
  if (!type) errors.type = "Unknown form type.";
  if (name.length < 2) errors.name = "Please enter your name.";
  if (!phone) errors.phone = "Please enter a 10-digit mobile number.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Please enter a valid email address.";
  if (type === "contact" && message.length < 5) errors.message = "Please tell us how we can help.";
  if (Object.keys(errors).length || !type || !phone) return { ok: false, errors };
  // Bots fill the hidden field or submit instantly. They get a normal-looking success and nothing is stored.
  const started = typeof b.startedAt === "number" ? b.startedAt : null;
  const spam = clean(b.website, 100) !== "" || (started !== null && now - started >= 0 && now - started < 3000);
  return { ok: true, spam, data: { type, name, phone: `+91${phone}`, ...(email && { email }), ...(childClass && { childClass }), ...(message && { message }) } };
}
