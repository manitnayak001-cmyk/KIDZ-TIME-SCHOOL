export const SITE_URL = process.env.SITE_URL || "https://kidztimeschool.com";
/** "72900 30030" or "+91 7290030030" -> "917290030030" for wa.me and tel: links. */
export const phoneIntl = (phone: string) => `91${phone.replace(/\D/g, "").slice(-10)}`;
export const whatsappLink = (phone: string) => `https://wa.me/${phoneIntl(phone)}?text=${encodeURIComponent("Hello, I would like to enquire about admission.")}`;
export const mapsLink = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
/** True when a rich-text field actually contains some text. */
export const hasText = (rt: unknown) => /"text":"[^"]/.test(JSON.stringify(rt ?? {}));
export const dateIN = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "");
