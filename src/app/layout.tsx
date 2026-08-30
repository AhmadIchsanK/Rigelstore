import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./_components/SiteHeader";
import { SiteFooter } from "./_components/SiteFooter";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "RigelStore — Toko Produk Digital",
    template: "%s — RigelStore",
  },
  description:
    "Toko produk digital: file, kredensial, dan PDF terproteksi. Pembayaran QRIS otomatis, pengiriman instan yang aman.",
  openGraph: {
    title: "RigelStore — Toko Produk Digital",
    description: "Produk digital dengan pembayaran QRIS otomatis & pengiriman aman.",
    type: "website",
    locale: "id_ID",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
