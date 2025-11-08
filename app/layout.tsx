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
  title: "Design System",
  description: "Design system documentation built with renoun and Next.js.",
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
    <RootProvider
      git="mrdoob/three.js@dev"
      theme={{ light: "everforest-light", dark: "dracula-soft" }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${spaceGrotesk.variable} ${iceberg.variable}`}>
          {children}
        </body>
      </html>
    </RootProvider>
  );
}
