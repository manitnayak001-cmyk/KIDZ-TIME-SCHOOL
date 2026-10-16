import { getPayload } from "payload";
import config from "@payload-config";
export const dynamic = "force-dynamic";
/** Used by Docker and uptime checks: confirms the app can reach the database. */
export async function GET() {
  try { const p = await getPayload({ config }); await p.count({ collection: "users" }); return new Response("ok"); }
  catch { return new Response("database unavailable", { status: 503 }); }
}
