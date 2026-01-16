import {
  Section,
  Reference,
  isDirectory,
  isFile,
  type Directory,
  type ReferenceComponents,
  type File,
  Markdown,
} from "renoun";
import { notFound } from "next/navigation";

import { OnThisPage } from "@/app/components/OnThisPage";
import { DocsHeaderTitle } from "@/app/components/DocsHeader";
import { ReferenceRowGroup } from "@/app/components/ReferenceRowGroup";
import { tslDir } from "@/app/lib/tsl-collections";
import { markdownComponents } from "@/app/lib/markdown-components";
// import {
//   RECENT_BADGE_LABEL,
//   getRecentExportNamesForRoute,
// } from "@/app/lib/recent-exports";

export const dynamic = "error"; // disallow runtime rendering
export const revalidate = false; // not ISR
export const dynamicParams = false; // only allow routes from generateStaticParams

type StaticPageParams = { slug: string[] };
type RouteParams = { slug: string | string[] };

async function getLastModifiedLabel(file: File): Promise<string | undefined> {
  const lastCommitDate = await file.getLastCommitDate();

  if (!lastCommitDate) {
    return undefined;
  }

  return lastCommitDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

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

    // Pre-validate this file's exports at build time.
    // If type resolution fails, skip this file from static generation.
    const isValid = await validateFileExports(entry);
    if (!isValid) {
      console.warn(`Skipping file from build: ${slugSegments.join("/")}`);
      continue;
    }

    params.push({ slug: slugSegments });
  }

  return params;
}

/**
 * Validate that all exports in a file can be type-resolved without errors.
 * Returns false if any export causes an UnresolvedTypeExpressionError.
 */
async function validateFileExports(file: any): Promise<boolean> {
  try {
    if (typeof file.getExports !== "function") return true;
    const exports = await file.getExports();
    for (const exp of exports) {
      try {
        // Force full type resolution - this is what Reference does internally
        await exp.getType();
        // Also try getText() which may trigger different resolution paths
        if (typeof exp.getText === "function") {
          await exp.getText();
        }
      } catch {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
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

  const lastModifiedLabel = await getLastModifiedLabel(file);

  const exports = await file.getExports();

  const firstCommitDates = await Promise.all(
    exports.map(async (exp: any) => {
      return exp.getFirstCommitDate();
    })
  );

  const firstCommitByExportName: Record<string, Date | undefined> = {};
  exports.forEach((exp: any, index: number) => {
    const name = exp.name;
    if (name) {
      firstCommitByExportName[name] = firstCommitDates[index] ?? undefined;
    }
  });

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
    <>
      <DocsHeaderTitle title={file.title} />
      <main className="docs-content">
        <Reference source={file} components={referenceComponents} />
      </main>
      <aside className="docs-toc">
        <OnThisPage sections={sections} entry={file} />
      </aside>
    </>
  );
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
