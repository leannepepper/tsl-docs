import type { Metadata } from "next";
import { RootProvider } from "renoun";
import "./layout.css";

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
        <body>{children}</body>
      </html>
    </RootProvider>
  );
}
