import { Reference } from "renoun";
import React from "react";
import { OnThisPage } from "@/app/components/OnThisPage";
import { tslCategories, getDirForCategory } from "@/app/lib/tsl-collections";

export const dynamic = "error";

export async function generateStaticParams() {
  const all: { category: string; slug: string }[] = [];

  for (const c of tslCategories) {
    // only categories that have files (skip "constants")
    const dir = "dir" in c && c.dir ? c.dir : null;
    if (!dir) continue;

    const entries = await dir.getEntries();
    for (const e of entries) {
      // the last segment of getPathname() is the slug (already kebab-cased)
      const parts = e.getPathname().split("/");
      const slug = parts[parts.length - 1];
      all.push({ category: c.key, slug });
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
  const dir = getDirForCategory(category as any);
  if (!dir) return <p>Unknown category.</p>;

  const file = await dir.getFile(slug, "js");
  const exports = await file.getExports();
  const headings = exports?.map((exp) => ({
    id: exp.getSlug(),
    text: exp.getTitle(),
    level: 3,
  }));

  const Section = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    // TODO: add id to the section
    return <section {...props} style={{ scrollMarginTop: "80px" }} />;
  };
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
