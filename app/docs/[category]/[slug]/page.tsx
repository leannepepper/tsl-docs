import { Headings, Reference } from "renoun";
import React from "react";
import { OnThisPage } from "@/app/components/OnThisPage";
import { tslCategories } from "@/app/lib/tsl-collections";
import { isFile } from "renoun";

export const dynamic = "error"; // disallow runtime rendering
export const revalidate = false; // not ISR
export const dynamicParams = false; // only the params you return below

export async function generateStaticParams() {
  const all: { category: string; slug: string }[] = [];
  for (const c of tslCategories) {
    if (!c.dir) continue;
    const entries = await c.dir.getEntries();
    for (const e of entries) {
      if (!isFile(e)) continue;
      all.push({ category: c.key, slug: e.getSlug() });
    }
  }
  return all;
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const categoryEntry = tslCategories.find((c) => c.key === category);
  if (!categoryEntry?.dir || slug === "math-node") {
    return (
      <p>
        Unknown category or math node (which has a type reslove error right now)
      </p>
    );
  }

  const dir = categoryEntry.dir;
  const file = await dir.getFile(slug, "js");
  const exports = await file.getExports();
  const headings: Headings = (exports ?? []).map((exp: any) => ({
    id: exp.getName(),
    text: exp.getTitle(),
    level: 3,
  }));
  return (
    <>
      <main className="docs-content">
        <h1>{file.getTitle()}</h1>
        <Reference source={file as any} components={{ Section }} />
      </main>
      <aside className="docs-toc">
        <OnThisPage headings={headings} entry={file} />
      </aside>
    </>
  );
}

const Section = (props: React.HTMLAttributes<HTMLHeadingElement>) => (
  <section {...props} style={{ scrollMarginTop: "80px" }} />
);
