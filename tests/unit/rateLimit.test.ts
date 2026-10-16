import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rateLimit";
describe("rateLimit", () => {
  it("allows up to the limit, then blocks", () => {
    for (let i = 0; i < 3; i++) expect(rateLimit("a", 3, 1000, 100 + i)).toBe(true);
    expect(rateLimit("a", 3, 1000, 200)).toBe(false);
  });
  it("lets the visitor back in after the window passes", () => expect(rateLimit("a", 3, 1000, 5000)).toBe(true));
  it("counts each address separately", () => expect(rateLimit("b", 3, 1000, 200)).toBe(true));
});
