import {
  Section,
  Reference,
  type FileSystemEntry,
  type NavigationEntry,
  type ReferenceComponents,
  Markdown,
} from "renoun";
import { notFound } from "next/navigation";

import { OnThisPage } from "@/app/components/OnThisPage";
import { DocsHeaderTitle } from "@/app/components/DocsHeader";
import { DocsShell } from "@/app/components/DocsShell";
import { ReferenceRowGroup } from "@/app/components/ReferenceRowGroup";
import { markdownComponents } from "@/app/lib/markdown-components";
import { tslDir } from "@/app/lib/tsl-collections";
// import {
//   RECENT_BADGE_LABEL,
//   getRecentExportNamesForRoute,
// } from "@/app/lib/recent-exports";

export const dynamic = "error"; // disallow runtime rendering
export const revalidate = false; // not ISR
export const dynamicParams = false; // only allow routes from generateStaticParams

type StaticPageParams = { slug: string[] };
type RouteParams = { slug: string | string[] };

function collectFileParams(
  entries: NavigationEntry<FileSystemEntry>[]
): StaticPageParams[] {
  const params: StaticPageParams[] = [];

  for (const { entry, children } of entries) {
    if (children && children.length > 0) {
      params.push(...collectFileParams(children));
      continue;
    }

    const slugSegments = entry.getPathnameSegments({
      includeBasePathname: false,
    });

    if (slugSegments.length > 0) {
      params.push({ slug: slugSegments });
    }
  }

  return params;
}

export async function generateStaticParams(): Promise<StaticPageParams[]> {
  return collectFileParams(await tslDir.getTree());
}

export default async function Page({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  const segments = Array.isArray(slug) ? slug : [slug].filter(Boolean);

  if (!segments.length) {
    notFound();
  }

  const pathname = segments.join("/");

  const file = await tslDir.getFile(pathname, "js").catch(() => undefined);

  if (!file) {
    notFound();
  }

  const fileEntry = file!;

  const exports = await fileEntry.getExports().catch((err: unknown) => {
    console.warn(
      "[tsl-docs] Failed to analyze exports for",
      pathname,
      err instanceof Error ? err.message : err
    );
    return [];
  });

  const exportNames = exports
    .map((exp: any) => exp.name)
    .filter((name: any): name is string => typeof name === "string");

  const historyDates = await Promise.all([
    fileEntry.getLastCommitDate(),
    ...exports.map((exp: any) => exp.getFirstCommitDate()),
  ]);
  const [lastModifiedDate, ...firstCommitDates] = historyDates;
  const firstCommitByExportName = Object.fromEntries(
    exportNames.map((name, index) => [name, firstCommitDates[index]])
  ) as Record<string, Date | undefined>;
  const lastModifiedLabel = lastModifiedDate
    ? formatDate(lastModifiedDate)
    : undefined;

  const currentYear = new Date().getFullYear();

  const referenceComponents = createReferenceComponents(
    firstCommitByExportName,
    currentYear,
    lastModifiedLabel
  );

  const sections: Section[] = (exports ?? []).map((exp: any) => ({
    id: exp.name,
    title: exp.title,
    level: 3,
  }));

  return (
    <DocsShell>
      <>
        <DocsHeaderTitle title={fileEntry.title} />
        <main className="docs-content">
          <Reference source={file} components={referenceComponents} />
        </main>
        <aside className="docs-toc">
          <OnThisPage sections={sections} entry={file} />
        </aside>
      </>
    </DocsShell>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const createReferenceComponents = (
  firstCommitByExportName: Record<string, Date | undefined>,
  currentYear: number,
  lastModifiedLabel?: string
): Partial<ReferenceComponents> => {
  let hasShownDate = false;

  return {
    Section: ({ id, kind, children }) => {
      const firstCommitDate =
        typeof id === "string" ? firstCommitByExportName[id] : undefined;
      const isNew =
        firstCommitDate && firstCommitDate.getFullYear() === currentYear;

      return (
        <section
          id={id}
          data-kind={kind}
          className="reference-section"
          style={{ scrollMarginTop: "80px" }}
        >
          {isNew ? (
            <div className="reference-heading">
              <span className="badge badge--recent">N E W</span>
            </div>
          ) : null}
          {children}
        </section>
      );
    },
    SectionHeading: ({ title, ["aria-label"]: ariaLabel }) => {
      const shouldShowModified = !hasShownDate && !!lastModifiedLabel;
      if (shouldShowModified) {
        hasShownDate = true;
      }
      return (
        <div className="reference-heading reference-heading--with-meta">
          {title ? (
            <h2 className="reference-heading__title" aria-label={ariaLabel}>
              {title}
            </h2>
          ) : null}
          {shouldShowModified ? (
            <span className="reference-heading__meta">
              Last modified: {lastModifiedLabel}
            </span>
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
      <div className="reference-description">
        <Markdown components={markdownComponents}>
          {children as string}
        </Markdown>
      </div>
    ),
    Detail: ({ children }) => (
      <div className="reference-detail">{children}</div>
    ),
    DetailHeading: ({ children }) => {
      const label =
        typeof children === "string"
          ? children.trim()
          : Array.isArray(children) &&
            children.length === 1 &&
            typeof children[0] === "string"
          ? children[0].trim()
          : undefined;

      if (
        label &&
        (label === "Parameters" || label === "Methods" || label === "Accessors")
      ) {
        return null;
      }

      return <p className="reference-detail__heading">{children}</p>;
    },
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
    TableRowGroup: ({ children, hasSubRow }) => (
      <ReferenceRowGroup hasSubRow={hasSubRow}>{children}</ReferenceRowGroup>
    ),
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
          typeof index === "number"
            ? `reference-table__cell--${index}`
            : undefined
        )}
        colSpan={colSpan}
      >
        {children}
      </td>
    ),
  };
};

function cx(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}
