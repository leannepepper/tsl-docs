import type { Metadata } from "next";
import { Iceberg, Space_Grotesk } from "next/font/google";
import { RootProvider } from "renoun";
import ogImage from "../assets/tsl.png";
import "./layout.css";

const iceberg = Iceberg({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "TSL Docs",
  description: "Unofficial TSL documentation.",
  metadataBase: new URL("https://tsl-docs.vercel.app"),
  openGraph: {
    title: "TSL Docs",
    description: "Unofficial TSL documentation.",
    images: [
      {
        url: typeof ogImage === "string" ? ogImage : ogImage.src,
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootProvider git="mrdoob/three.js@master" theme="everforest-light">
      <html lang="en" suppressHydrationWarning>
        <body className={`${spaceGrotesk.variable} ${iceberg.variable}`}>
          {children}
        </body>
      </html>
    </RootProvider>
  );
}
