import { describe, expect, it } from "vitest";
import { isProductType, slugify, usesUniqueInventory } from "./types";

describe("aturan tipe produk", () => {
  it("hanya unique_credential yang memakai inventory unik berstok", () => {
    expect(usesUniqueInventory("unique_credential")).toBe(true);
    expect(usesUniqueInventory("reusable_file")).toBe(false);
    expect(usesUniqueInventory("protected_pdf")).toBe(false);
    expect(usesUniqueInventory("bundle")).toBe(false);
  });

  it("validasi tipe produk", () => {
    expect(isProductType("unique_credential")).toBe(true);
    expect(isProductType("tidak_ada")).toBe(false);
  });

  it("slugify menghasilkan slug URL-aman", () => {
    expect(slugify("Buku Mewarnai Hewan (Anak 4–6)")).toBe("buku-mewarnai-hewan-anak-46");
    expect(slugify("  Halo   Dunia  ")).toBe("halo-dunia");
  });
});
