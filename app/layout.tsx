import type { Metadata } from "next";
import { Iceberg, Space_Grotesk } from "next/font/google";
import { RootProvider } from "renoun";
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
  description: "TSL documentation built with renoun.",
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
