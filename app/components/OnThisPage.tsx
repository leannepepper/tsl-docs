"use client";

import { MDXHeadings, TableOfContents } from "renoun";

export default function OnThisPage({ headings }: { headings?: MDXHeadings }) {
  return <TableOfContents headings={headings ?? []} />;
}
