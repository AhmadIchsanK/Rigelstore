/**
 * Password unik yang MUDAH DIINGAT untuk PDF terproteksi.
 * Bentuk: Kata-Kata-NNNN (mis. "Biru-Gajah-4821").
 *
 * CATATAN JUJUR (PROJECT_SPEC / panduan): password PDF BUKAN DRM. Ini hanya
 * mencegah orang awam membuka, bukan jaminan anti-bajak.
 */
import { randomInt } from "node:crypto";

const ADJ = [
  "Biru", "Merah", "Hijau", "Cerah", "Tenang", "Berani", "Cepat", "Hangat",
  "Lembut", "Gagah", "Ceria", "Emas", "Perak", "Segar", "Kuat", "Ramah",
];
const NOUN = [
  "Gajah", "Elang", "Rusa", "Harimau", "Merpati", "Kucing", "Panda", "Serigala",
  "Bintang", "Ombak", "Gunung", "Cahaya", "Bulan", "Angin", "Hujan", "Karang",
];

/** Buat password mudah diingat, cukup acak (2 kata + 4 digit). */
export function generateMemorablePassword(): string {
  const a = ADJ[randomInt(ADJ.length)];
  const n = NOUN[randomInt(NOUN.length)];
  const num = String(randomInt(1000, 10000)); // 4 digit
  return `${a}-${n}-${num}`;
}
