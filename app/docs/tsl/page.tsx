import type { HTMLAttributes } from "react";
import { Headings, Reference } from "renoun";
import { OnThisPage } from "@/app/components/OnThisPage";
import { tslDir } from "@/app/lib/tsl-collections";

export default async function Page() {
  const file = await tslDir.getFile("TSL", "js");
  const exports = await file.getExports();
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
        <h1>TSL.js Exports</h1>
        <Reference source={file as any} components={{ Section }} />
      </main>
      <aside className="docs-toc">
        <OnThisPage headings={headings} entry={file} />
      </aside>
    </>
  );
}
