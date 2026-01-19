import {
  getTslIndex,
  type ExportIndexEntry,
  type FileIndexEntry,
} from "@/app/lib/tsl-index";

export type SearchResult = {
  title: string;
  description?: string;
  href: string;
  breadcrumb: string;
  createdAt?: string; // ISO string
  createdAtLabel?: string;
  titleLower: string;
  descriptionLower: string;
  breadcrumbLower: string;
};

let searchResultsCache: SearchResult[] | null = null;

const serializeDate = (dateInput?: Date | string) => {
  if (!dateInput) return {};

  const date =
    dateInput instanceof Date ? dateInput : new Date(dateInput as string);
  if (Number.isNaN(date.getTime())) return {};

  return { createdAt: date.toISOString(), createdAtLabel: formatDate(date) };
};

const formatDate = (date: Date): string =>
  date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export async function getSearchResults(): Promise<SearchResult[]> {
  if (searchResultsCache) {
    return searchResultsCache;
  }

  const index = await getTslIndex();
  const results = dedupeResults(buildSearchResults(index.files));
  results.sort((a, b) => a.title.localeCompare(b.title));
  searchResultsCache = results;

  return results;
}

function buildSearchResults(files: FileIndexEntry[]): SearchResult[] {
  const results: SearchResult[] = [];

  for (const file of files) {
    if (shouldSkipPathname(file.pathname)) continue;
    const exportEntries = file.exportEntries;

    if (!exportEntries.length) {
      const fileResult = createSearchResultFromFile(file);
      if (fileResult) results.push(fileResult);
      continue;
    }

    for (const exp of exportEntries) {
      const exportResult = createSearchResultFromExport(exp, file);
      if (exportResult) results.push(exportResult);
    }
  }

  return results;
}

function createSearchResultFromFile(
  file: FileIndexEntry
): SearchResult | null {
  const title = typeof file.title === "string" ? file.title : undefined;
  if (!title) return null;

  const description =
    typeof file.description === "string" ? file.description : undefined;

  const { createdAt, createdAtLabel } = serializeDate(file.lastCommitDate);

  return {
    title,
    description,
    href: file.pathname,
    breadcrumb: file.breadcrumb,
    createdAt,
    createdAtLabel,
    titleLower: title.toLowerCase(),
    descriptionLower: (description ?? "").toLowerCase(),
    breadcrumbLower: file.breadcrumb.toLowerCase(),
  };
}

function createSearchResultFromExport(
  exp: ExportIndexEntry,
  file: FileIndexEntry
): SearchResult | null {
  const title =
    typeof exp.title === "string"
      ? exp.title
      : typeof exp.name === "string"
      ? exp.name
      : undefined;
  if (!title) return null;

  const description =
    typeof exp.description === "string" ? exp.description : undefined;

  const createdAtDate = exp.firstCommitDate ?? file.lastCommitDate;
  const { createdAt: isoDate, createdAtLabel } = serializeDate(createdAtDate);

  return {
    title,
    description,
    href: exp.href,
    breadcrumb: exp.breadcrumb,
    createdAt: isoDate,
    createdAtLabel,
    titleLower: title.toLowerCase(),
    descriptionLower: (description ?? "").toLowerCase(),
    breadcrumbLower: exp.breadcrumb.toLowerCase(),
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

function shouldSkipPathname(pathname: string): boolean {
  const last = pathname.split("/").pop();
  if (!last) return false;

  const normalized = last.toLowerCase();
  return (
    normalized === "tsl-base" || normalized === "nodes" || normalized === "tsl"
  );
}
