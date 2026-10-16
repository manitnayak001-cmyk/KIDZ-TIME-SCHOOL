// Quick health check of a running site. Usage: BASE_URL=https://kidztimeschool.com npm run smoke
const base = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
let failed = 0;
const check = async (name, fn) => { try { await fn(); console.log("PASS", name); } catch (e) { failed++; console.log("FAIL", name, "-", e.message); } };
const get = (p, o) => fetch(base + p, { redirect: "manual", ...o });
const expectStatus = async (p, code, o) => { const r = await get(p, o); if (r.status !== code) throw new Error(`${p} returned ${r.status}, expected ${code}`); return r; };

for (const p of ["/", "/about", "/programs", "/activities", "/gallery", "/news", "/admissions", "/contact", "/privacy"])
  await check(`page ${p} loads with a heading`, async () => { const t = await (await expectStatus(p, 200)).text(); if (!/<h1/.test(t)) throw new Error("no <h1>"); });
await check("health check reports database ok", async () => { const t = await (await expectStatus("/healthz", 200)).text(); if (t !== "ok") throw new Error(t); });
await check("unknown page shows the friendly 404", async () => { const t = await (await expectStatus("/no-such-page", 404)).text(); if (!/Page not found/.test(t)) throw new Error("custom 404 text missing"); });
await check("robots.txt and sitemap.xml exist", async () => { await expectStatus("/robots.txt", 200); await expectStatus("/sitemap.xml", 200); });
await check("admin login page loads", () => expectStatus("/admin", 200));
await check("enquiries are not public", () => expectStatus("/api/enquiries", 403));
await check("user list is not public", () => expectStatus("/api/users", 403));
await check("invalid enquiry is rejected", () => expectStatus("/enquiry-submit", 422, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "contact", name: "x", phone: "1" }) }));
await check("site does not reveal its technology in headers", async () => { const r = await get("/"); if ((r.headers.get("x-powered-by") || "").includes("Next")) throw new Error("x-powered-by shows Next.js"); });
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed"); process.exit(failed ? 1 : 0);
