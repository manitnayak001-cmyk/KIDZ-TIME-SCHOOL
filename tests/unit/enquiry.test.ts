import { describe, expect, it } from "vitest";
import { normalizePhone, validateEnquiry } from "@/lib/enquiry";

const valid = { type: "admission", name: "Asha Verma", phone: "9876543210" };
describe("normalizePhone", () => {
  it.each(["9876543210", "+91 98765 43210", "919876543210", "09876543210", "98765-43210"])("accepts %s", (p) => expect(normalizePhone(p)).toBe("9876543210"));
  it.each(["", "12345", "5876543210", "98765432101", "abcdefghij", "+1 9876543210"])("rejects %s", (p) => expect(normalizePhone(p)).toBeNull());
});
describe("validateEnquiry", () => {
  it("accepts a minimal valid admission enquiry and stores the phone as +91", () => {
    const r = validateEnquiry(valid);
    expect(r).toMatchObject({ ok: true, spam: false, data: { type: "admission", name: "Asha Verma", phone: "+919876543210" } });
  });
  it("rejects a missing name, bad phone and bad email together", () => {
    const r = validateEnquiry({ type: "admission", name: "A", phone: "123", email: "nope" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["email", "name", "phone"]);
  });
  it("requires a message on the contact form but not on admissions", () => {
    expect(validateEnquiry({ ...valid, type: "contact" }).ok).toBe(false);
    expect(validateEnquiry({ ...valid, type: "contact", message: "Please call me" }).ok).toBe(true);
  });
  it("rejects unknown form types and non-object input", () => {
    expect(validateEnquiry({ ...valid, type: "hack" }).ok).toBe(false);
    for (const bad of [null, undefined, "x", 5, []]) expect(validateEnquiry(bad).ok).toBe(false);
  });
  it("flags the hidden trap field as spam", () => expect(validateEnquiry({ ...valid, website: "http://spam" })).toMatchObject({ ok: true, spam: true }));
  it("flags instant submissions as spam but ignores clock differences", () => {
    const now = 1_000_000;
    expect(validateEnquiry({ ...valid, startedAt: now - 500 }, now)).toMatchObject({ spam: true });
    expect(validateEnquiry({ ...valid, startedAt: now - 10_000 }, now)).toMatchObject({ spam: false });
    expect(validateEnquiry({ ...valid, startedAt: now + 60_000 }, now)).toMatchObject({ spam: false });
  });
  it("removes line breaks from single-line fields (blocks e-mail header injection)", () => {
    const r = validateEnquiry({ ...valid, name: "Asha\r\nBcc: evil@example.com", childClass: "Nursery\n" });
    expect(r.ok && r.data.name).toBe("Asha Bcc: evil@example.com");
    expect(r.ok && r.data.childClass).toBe("Nursery");
  });
  it("caps lengths and strips control characters", () => {
    const r = validateEnquiry({ ...valid, type: "contact", message: "x".repeat(5000) + "\u0007" });
    expect(r.ok && r.data.message?.length).toBe(1000);
    expect(r.ok && r.data.message).not.toContain("\u0007");
  });
  it("keeps HTML as plain text (the pages escape it when displayed)", () => {
    const r = validateEnquiry({ ...valid, type: "contact", message: "<script>alert(1)</script>" });
    expect(r.ok && r.data.message).toBe("<script>alert(1)</script>");
  });
});
