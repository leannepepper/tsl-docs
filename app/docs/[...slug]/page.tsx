import React from "react";
import {
  Headings,
  Reference,
  isDirectory,
  isFile,
  type Directory,
  type ReferenceComponents,
} from "renoun";
import { notFound } from "next/navigation";

import { OnThisPage } from "@/app/components/OnThisPage";
import { DocsHeaderTitle } from "@/app/components/DocsHeader";
import { tslDir } from "@/app/lib/tsl-collections";
import {
  RECENT_BADGE_LABEL,
  getRecentExportNamesForRoute,
} from "@/app/lib/recent-exports";

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

  const pathname = segments.join("/");

  const file = await tslDir.getFile(pathname, "js").catch(() => undefined);

  if (!file) {
    return notFound();
  }

  const docsRoute = `/docs/${pathname}`;
  const recentExports = await getRecentExportNamesForRoute(docsRoute);
  const referenceComponents = createReferenceComponents(recentExports);
  const exports = await file.getExports();
  const headings: Headings = (exports ?? []).map((exp: any) => ({
    id: exp.getName(),
    text: exp.getTitle(),
    level: 3,
  }));

  return (
    <>
      <DocsHeaderTitle title={file.getTitle()} />
      <main className="docs-content">
        <Reference source={file as any} components={referenceComponents} />
      </main>
      <aside className="docs-toc">
        <OnThisPage headings={headings} entry={file} />
      </aside>
    </>
  );
}

const createReferenceComponents = (
  recentExports: Set<string>
): Partial<ReferenceComponents> => ({
  Section: ({ id, kind, children }) => (
    <section
      id={id}
      data-kind={kind}
      className="reference-section"
      style={{ scrollMarginTop: "80px" }}
    >
      {children}
    </section>
  ),
  SectionHeading: ({ label, title, ["aria-label"]: ariaLabel }) => {
    const showRecentBadge = !!title && recentExports.has(title);
    return (
      <div className="reference-heading">
        <div className="reference-heading__meta">
          {label ? (
            <span className="reference-heading__label">
              {label.toUpperCase()}
            </span>
          ) : null}
          {showRecentBadge ? (
            <span className="badge badge--recent">{RECENT_BADGE_LABEL}</span>
          ) : null}
        </div>
        {title ? (
          <h2 className="reference-heading__title" aria-label={ariaLabel}>
            {title}
          </h2>
        ) : null}
      </div>
    );
  },
  SectionBody: ({ hasDescription, children }) => (
    <div
      className={cx(
        "reference-body",
        hasDescription ? "reference-body--with-description" : undefined
      )}
    >
      {children}
    </div>
  ),
  Column: ({ gap, children }) => (
    <div className="reference-stack" data-gap={gap ?? undefined}>
      {children}
    </div>
  ),
  Row: ({ gap, children }) => (
    <div className="reference-row" data-gap={gap ?? undefined}>
      {children}
    </div>
  ),
  Description: ({ children }) => (
    <p className="reference-description">{children}</p>
  ),
  Detail: ({ children }) => (
    <div className="reference-detail">{children}</div>
  ),
  DetailHeading: ({ children }) => (
    <p className="reference-detail__heading">{children}</p>
  ),
  Signatures: ({ children }) => (
    <div className="reference-signatures">{children}</div>
  ),
  Code: ({ children }) => <code className="reference-code">{children}</code>,
  Table: ({ children }) => (
    <table className="reference-table">{children}</table>
  ),
  TableHead: ({ children }) => (
    <thead className="reference-table__head">{children}</thead>
  ),
  TableBody: ({ children }) => (
    <tbody className="reference-table__body">{children}</tbody>
  ),
  TableRow: ({ hasSubRow, children }) => (
    <tr
      className={cx(
        "reference-table__row",
        hasSubRow ? "reference-table__row--has-sub" : undefined
      )}
    >
      {children}
    </tr>
  ),
  TableRowGroup: ({ children }) => <>{children}</>,
  TableSubRow: ({ children }) => (
    <tr className="reference-table__sub-row">
      <td className="reference-table__sub-cell" colSpan={99}>
        {children}
      </td>
    </tr>
  ),
  TableHeader: ({ children }) => (
    <th className="reference-table__header">{children}</th>
  ),
  TableData: ({ children, colSpan, index }) => (
    <td
      className={cx(
        "reference-table__cell",
        typeof index === "number" ? `reference-table__cell--${index}` : undefined
      )}
      colSpan={colSpan}
    >
      {children}
    </td>
  ),
});

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
