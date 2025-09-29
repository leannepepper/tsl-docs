"use client";
import OnThisPage from "@/app/components/OnThisPage";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function APILayout(props: any) {
  const { children, params } = props;
  const pathname = usePathname();
  console.log({ pathname });
  return (
    <>
      <main className="docs-content">{children}</main>
      <aside className="docs-toc">
        <OnThisPage />
      </aside>
    </>
  );
}
