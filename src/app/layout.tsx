import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RigelStore",
  description: "Toko produk digital — website + Telegram, pembayaran QRIS otomatis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
