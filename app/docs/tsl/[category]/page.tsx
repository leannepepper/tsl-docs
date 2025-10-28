import type { HTMLAttributes } from "react";
import Link from "next/link";
import { Headings, Reference } from "renoun";
import { OnThisPage } from "@/app/components/OnThisPage";
import {
  tslCategories,
  getDirForCategory,
  coreDir,
  isExcludedTslEntry,
} from "@/app/lib/tsl-collections";

export const dynamic = "error"; // disallow runtime rendering
export const revalidate = false; // not ISR
export const dynamicParams = false; // only the params you return below

export async function generateStaticParams() {
  // one page per category (including "constants")
  return tslCategories.map((c) => ({ category: c.key }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  if (category === "constants") {
    const constantsFile = await coreDir.getFile("constants", "js");
    const exports = await constantsFile.getExports();
    const headings: Headings = (exports ?? []).map((exp) => ({
      id: exp.getName(),
      text: exp.getTitle(),
      level: 3,
    }));

    const Section = (props: HTMLAttributes<HTMLElement>) => (
      <section {...props} style={{ scrollMarginTop: "80px" }} />
    );

    return (
      <>
        <main className="docs-content">
          <h1>constants</h1>
          <Reference source={constantsFile as any} components={{ Section }} />
        </main>
        <aside className="docs-toc">
          <OnThisPage headings={headings} entry={constantsFile} />
        </aside>
      </>
    );
  }

  const dir = getDirForCategory(category as any);
  if (!dir) return <p>Unknown category.</p>;

  const entries = await dir.getEntries();
  const filteredEntries = entries.filter((entry) => {
    const segments = entry.getPathname().split("/");
    const slug = segments[segments.length - 1];
    return !isExcludedTslEntry(category, slug);
  });
  return (
    <>
      <h1>
        {tslCategories.find((c) => c.key === category)?.label ?? category}
      </h1>
      <ul>
        {filteredEntries.map((e) => (
          <li key={e.getPathname()}>
            <Link href={e.getPathname()}>{e.getTitle()}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
