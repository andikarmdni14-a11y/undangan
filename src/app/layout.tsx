import type { Metadata, Viewport } from "next";
import { karla, tenorSans } from "./fonts";
import { wedding } from "@/content/wedding";
import { allowIndexing, siteUrl } from "@/lib/env";
import "./globals.css";

const { groom, bride } = wedding.couple;
const title = `Undangan Pernikahan ${groom.nickname} & ${bride.nickname}`;
const description = `Dengan penuh syukur, kami mengundang Anda pada hari bahagia ${groom.nickname} & ${bride.nickname}.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    locale: "id_ID",
    images: [{ url: "/images/meta/og.jpg", width: 1200, height: 630, alt: `${groom.nickname} & ${bride.nickname}` }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/images/meta/og.jpg"] },
  // Undangan bersifat personal: jangan diindeks mesin pencari.
  robots: allowIndexing() ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#FAFAFA",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${tenorSans.variable} ${karla.variable}`}>
      <body className="min-h-dvh bg-alabaster text-ink">{children}</body>
    </html>
  );
}
