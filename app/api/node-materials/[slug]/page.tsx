import { Headings, Reference } from "renoun";
import React from "react";
import { OnThisPage } from "@/app/components/OnThisPage";
import { materialsDir } from "@/app/lib/tsl-collections";

export const dynamic = "error";

export async function generateStaticParams() {
  if (!materialsDir) return [];
  const entries = await materialsDir.getEntries();
  return entries.map((e) => {
    const parts = e.getPathname().split("/");
    return { slug: parts[parts.length - 1] };
  });
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!materialsDir) {
    return <p>No NodeMaterials folder in this three build.</p>;
  }
  const file = await materialsDir.getFile(slug, "js");
  const exports = await file.getExports();
  const headings: Headings = exports.map((exp) => ({
    id: exp.getSlug(),
    text: exp.getTitle(),
    level: 3,
  }));
  const titleToSlug = new Map(
    exports.map((exp) => [exp.getTitle(), exp.getSlug()])
  );
  const SectionHeading = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
    const pieces = React.Children.toArray(props.children).filter(
      (c) => typeof c === "string"
    ) as string[];
    const title = pieces.join("").trim();
    const id = titleToSlug.get(title) || undefined;
    return <h3 {...props} id={id} style={{ scrollMarginTop: "80px" }} />;
  };
  return (
    <>
      <main className="docs-content">
        <h1>{file.getTitle()}</h1>
        {exports.map((exp, i) => {
          const slug = exp.getSlug();
          const Section = (props: React.HTMLAttributes<HTMLElement>) => (
            <section {...props} id={slug} style={{ scrollMarginTop: "80px" }} />
          );
          return (
            <Reference
              key={i}
              source={file.getAbsolutePath()}
              filter={{ types: [{ name: exp.getName() }] }}
              components={{ Section }}
            />
          );
        })}
      </main>
      <aside className="docs-toc">
        <OnThisPage headings={headings} entry={file} />
      </aside>
    </>
  );
}
