import React from "react";
import {
  Headings,
  Reference,
  isDirectory,
  isFile,
  type Directory,
} from "renoun";
import { notFound } from "next/navigation";

import { OnThisPage } from "@/app/components/OnThisPage";
import { tslDir } from "@/app/lib/tsl-collections";

export const dynamic = "error"; // disallow runtime rendering
export const revalidate = false; // not ISR
export const dynamicParams = false; // only the params you return below

type StaticPageParams = { slug: string[] };
type RouteParams = { slug: string | string[] };

async function collectFileParams(
  directory: Directory<any>
): Promise<StaticPageParams[]> {
  const entries = await directory.getEntries();
  const params: StaticPageParams[] = [];

  for (const entry of entries) {
    if (isDirectory(entry)) {
      params.push(...(await collectFileParams(entry)));
      continue;
    }

    if (!isFile(entry)) continue;

    const slugSegments = entry.getPathnameSegments({
      includeBasePathname: false,
    });

    if (slugSegments.length === 0) continue;

    params.push({ slug: slugSegments });
  }

  return params;
}

export async function generateStaticParams(): Promise<StaticPageParams[]> {
  return collectFileParams(tslDir);
}

export default async function Page({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const segments = Array.isArray(slug) ? slug : [slug].filter(Boolean);

  if (!segments.length) {
    return notFound();
  }

  if (segments.at(-1) === "math-node") {
    return (
      <p>
        Unknown doc or math node (which has a type resolve error right now)
      </p>
    );
  }

  const pathname = segments.join("/");

  const file = await tslDir
    .getFile(pathname, "js")
    .catch(() => undefined);

  if (!file) {
    return notFound();
  }

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
