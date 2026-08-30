import { describe, expect, it } from "vitest";
import { generateMemorablePassword } from "./password";

describe("password PDF mudah diingat", () => {
  it("berformat Kata-Kata-NNNN", () => {
    for (let i = 0; i < 20; i++) {
      const p = generateMemorablePassword();
      expect(p).toMatch(/^[A-Z][a-z]+-[A-Z][a-z]+-\d{4}$/);
    }
  });

  it("bervariasi (tidak selalu sama)", () => {
    const set = new Set(Array.from({ length: 20 }, () => generateMemorablePassword()));
    expect(set.size).toBeGreaterThan(1);
  });
});
