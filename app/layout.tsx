import type { Metadata } from "next";
import Link from "next/link";
import { RootProvider } from "renoun";

import "./layout.css";
import Sidebar from "./components/Sidebar";

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
    <RootProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <div className="docs-layout">
            <aside className="docs-sidebar">
              <Sidebar />
            </aside>
            {children}
          </div>
        </body>
      </html>
    </RootProvider>
  );
}
