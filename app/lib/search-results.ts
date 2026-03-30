import type {
  FileStructure,
  ModuleExportStructure,
} from "renoun";

import { tslDir } from "@/app/lib/tsl-collections";

export type SearchResult = {
  title: string;
  description?: string;
  href: string;
  breadcrumb: string;
  createdAt?: string; // ISO string
};

const normalizePathname = (pathname: string): string =>
  pathname.startsWith("/") ? pathname : `/${pathname}`;

const DOCS_BASE_PATHNAME = "/nodes";

function serializeDate(dateInput?: Date | string) {
  if (!dateInput) return {};

  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(date.getTime())) return {};

  return {
    createdAt: date.toISOString(),
  };
}

async function loadSearchResults(): Promise<SearchResult[]> {
  const structure = await tslDir.getStructure({
    includeExports: "headers",
    includeSections: false,
    includeResolvedTypes: false,
    includeGitDates: "first",
    includeAuthors: false,
    includeTags: false,
  });
  const results = dedupeResults(collectSearchResults(structure));
  results.sort((a, b) => a.title.localeCompare(b.title));
  return results;
}

export async function getSearchResults(): Promise<SearchResult[]> {
  return loadSearchResults();
}

function collectSearchResults(structure: Array<FileStructure | any>): SearchResult[] {
  const results: SearchResult[] = [];

  for (const item of structure) {
    if (item.kind !== "File") continue;

    if (shouldSkipPath(item.path)) continue;

    const pathname = toDocsPathname(item.path);
    const breadcrumb = toBreadcrumb(item.path);

    const fileResult = createSearchResultFromFile(item, pathname, breadcrumb);
    if (fileResult) {
      results.push(fileResult);
    }

    if (!item.exports || item.exports.length === 0) continue;

    for (const exp of item.exports as ModuleExportStructure[]) {
      const exportResult = createSearchResultFromExport(exp, pathname, breadcrumb);
      if (exportResult) {
        results.push(exportResult);
      }
    }
  }

  return results;
}

function createSearchResultFromFile(
  file: FileStructure,
  pathname: string,
  breadcrumb: string
): SearchResult | null {
  const title = file.title;
  if (!title) return null;

  const description = file.description;
  const { createdAt } = serializeDate(file.firstCommitDate);

  return {
    title,
    description,
    href: pathname,
    breadcrumb,
    createdAt,
  };
}

function createSearchResultFromExport(
  exp: ModuleExportStructure,
  pathname: string,
  breadcrumb: string
): SearchResult | null {
  const title = exp.title || exp.name;
  if (!title) return null;

  const description = exp.description;
  const href = toDocsPathname(exp.path);
  const { createdAt } = serializeDate(exp.firstCommitDate);

  return {
    title,
    description,
    href,
    breadcrumb,
    createdAt,
  };
}

function dedupeResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter((item) => {
    const key = item.href.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function shouldSkipPath(pathname: string): boolean {
  const normalizedPath = toDocsPathname(pathname);
  const last = normalizedPath.split("/").pop();
  if (!last) return false;

  const normalized = last.toLowerCase();
  return (
    normalized === "tsl-base" || normalized === "nodes" || normalized === "tsl"
  );
}

function toDocsPathname(pathname: string): string {
  const normalized = normalizePathname(pathname);
  if (normalized === DOCS_BASE_PATHNAME) {
    return "/";
  }

  if (normalized.startsWith(`${DOCS_BASE_PATHNAME}/`)) {
    return normalized.slice(DOCS_BASE_PATHNAME.length);
  }

  return normalized;
}

function toBreadcrumb(pathname: string): string {
  return toDocsPathname(pathname)
    .split("/")
    .filter(Boolean)
    .join(" / ");
}
