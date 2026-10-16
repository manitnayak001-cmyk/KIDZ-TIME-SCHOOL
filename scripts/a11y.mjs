// Automated accessibility scan (axe-core) of every public page. Usage: BASE_URL=http://localhost:3000 npm run a11y
// It cannot judge colour contrast or keyboard feel: check those by hand.
import { JSDOM } from "jsdom";
import { createRequire } from "module";
const axeSource = (await import("fs")).readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
const base = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
let total = 0;
for (const p of ["/", "/about", "/programs", "/activities", "/gallery", "/news", "/admissions", "/contact", "/privacy"]) {
  const html = await (await fetch(base + p)).text();
  const dom = new JSDOM(html, { runScripts: "outside-only", url: base + p });
  dom.window.eval(axeSource);
  const r = await dom.window.axe.run(dom.window.document, { rules: { "color-contrast": { enabled: false } } });
  total += r.violations.length;
  console.log(p.padEnd(14), r.violations.length ? `${r.violations.length} issue(s)` : "no issues");
  for (const v of r.violations) console.log("   -", v.id, "|", v.help, "|", v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(", "));
}
process.exit(total ? 1 : 0);
