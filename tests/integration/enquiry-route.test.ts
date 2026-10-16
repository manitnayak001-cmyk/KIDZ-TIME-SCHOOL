import { beforeAll, describe, expect, it } from "vitest";
import { getPayload, type Payload } from "payload";
import config from "@payload-config";
import { POST } from "@/app/(site)/enquiry-submit/route";

let payload: Payload;
beforeAll(async () => { payload = await getPayload({ config }); });
const send = (body: unknown, ip: string, raw?: string) =>
  POST(new Request("http://localhost/enquiry-submit", { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": ip }, body: raw ?? JSON.stringify(body) }));
const count = async (name: string) => (await payload.count({ collection: "enquiries", where: { name: { equals: name } } })).totalDocs;
const good = (name: string) => ({ type: "admission", name, phone: "9876543210", childClass: "Nursery", startedAt: Date.now() - 10_000 });

describe("POST /enquiry-submit", () => {
  it("saves a valid enquiry", async () => {
    const res = await send(good("Route Parent"), "10.0.0.1");
    expect(res.status).toBe(200); expect(await res.json()).toEqual({ ok: true });
    expect(await count("Route Parent")).toBe(1);
  });
  it("returns field errors for invalid input and saves nothing", async () => {
    const res = await send({ type: "admission", name: "X", phone: "1" }, "10.0.0.2");
    expect(res.status).toBe(422); expect((await res.json()).errors.phone).toBeTruthy();
  });
  it("pretends to accept bots but saves nothing", async () => {
    const res = await send({ ...good("Bot Person"), website: "spam.example" }, "10.0.0.3");
    expect(res.status).toBe(200); expect(await count("Bot Person")).toBe(0);
  });
  it("rejects malformed requests", async () => { expect((await send(null, "10.0.0.4", "{not json")).status).toBe(400); });
  it("stores script tags as plain text without running anything", async () => {
    await send({ ...good("Xss Test"), type: "contact", message: "<img src=x onerror=alert(1)> hello" }, "10.0.0.5");
    const doc = (await payload.find({ collection: "enquiries", where: { name: { equals: "Xss Test" } } })).docs[0];
    expect(doc.message).toContain("<img"); // stored as text; React escapes it when the admin panel shows it
  });
  it("limits one address to 5 enquiries an hour", async () => {
    const codes: number[] = [];
    for (let i = 0; i < 7; i++) codes.push((await send(good(`Flood ${i}`), "10.0.0.9")).status);
    expect(codes).toEqual([200, 200, 200, 200, 200, 429, 429]);
  });
});
