import "server-only";

/**
 * Enkripsi kredensial saat disimpan (at rest) — AES-256-GCM.
 *
 * Kredensial unik TIDAK PERNAH disimpan dalam bentuk polos di database. Nilai
 * mentah hanya ada sesaat di server saat enkripsi/dekripsi. Kunci berasal dari
 * environment (`CREDENTIAL_ENCRYPTION_KEY`) — bukan di kode.
 *
 * Format tersimpan: "v1:base64url(iv):base64url(tag):base64url(ciphertext)".
 */
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const VERSION = "v1";
const IV_BYTES = 12; // standar GCM

/** Ambil & validasi kunci 32-byte dari environment. */
function key(): Buffer {
  const raw = process.env.CREDENTIAL_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "CREDENTIAL_ENCRYPTION_KEY belum diset. Isi di environment (32 byte, base64 atau hex).",
    );
  }
  // Terima base64, base64url, atau hex; wajib menghasilkan 32 byte.
  let buf: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    buf = Buffer.from(raw, "hex");
  } else {
    buf = Buffer.from(raw, "base64");
  }
  if (buf.length !== 32) {
    throw new Error("CREDENTIAL_ENCRYPTION_KEY harus 32 byte (256-bit) setelah decode.");
  }
  return buf;
}

/** Enkripsi teks polos -> string tersimpan. */
export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString("base64url"),
    tag.toString("base64url"),
    ct.toString("base64url"),
  ].join(":");
}

/** Dekripsi string tersimpan -> teks polos. Melempar bila rusak/dipalsukan. */
export function decryptSecret(stored: string): string {
  const parts = stored.split(":");
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error("Format secret terenkripsi tidak dikenal.");
  }
  const [, ivB64, tagB64, ctB64] = parts;
  const iv = Buffer.from(ivB64, "base64url");
  const tag = Buffer.from(tagB64, "base64url");
  const ct = Buffer.from(ctB64, "base64url");

  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}
