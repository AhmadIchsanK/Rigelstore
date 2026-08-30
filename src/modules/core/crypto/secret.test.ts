import { randomBytes } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./secret";

beforeAll(() => {
  // Kunci uji 32-byte (hanya untuk tes; produksi memakai env yang berbeda).
  process.env.CREDENTIAL_ENCRYPTION_KEY = randomBytes(32).toString("base64");
});

describe("enkripsi kredensial at rest (AES-256-GCM)", () => {
  it("round-trip: dekripsi mengembalikan teks asli", () => {
    const plain = "akun@example.com | p4ssw0rd-Rahasia!";
    const enc = encryptSecret(plain);
    expect(decryptSecret(enc)).toBe(plain);
  });

  it("ciphertext TIDAK memuat teks polos & berformat v1", () => {
    const plain = "super-secret-value";
    const enc = encryptSecret(plain);
    expect(enc.startsWith("v1:")).toBe(true);
    expect(enc.includes(plain)).toBe(false);
    expect(enc.split(":")).toHaveLength(4);
  });

  it("dua enkripsi teks sama menghasilkan ciphertext berbeda (IV acak)", () => {
    const plain = "same-input";
    expect(encryptSecret(plain)).not.toBe(encryptSecret(plain));
  });

  it("ciphertext yang dirusak ditolak (auth tag GCM)", () => {
    const enc = encryptSecret("integrity-check");
    const parts = enc.split(":");
    // Rusak byte terakhir ciphertext.
    const ct = Buffer.from(parts[3], "base64url");
    ct[0] = ct[0] ^ 0xff;
    parts[3] = ct.toString("base64url");
    expect(() => decryptSecret(parts.join(":"))).toThrow();
  });
});
