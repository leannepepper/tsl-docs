import {
  isDirectory,
  isFile,
  type Directory,
  type FileSystemEntry,
} from "renoun";

import { tslDir } from "@/app/lib/tsl-collections";

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

const normalizePathname = (pathname: string): string =>
  pathname.startsWith("/") ? pathname : `/${pathname}`;

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

async function collectSearchResults(
  directory: Directory<any>
): Promise<SearchResult[]> {
  const entries = await directory.getEntries();
  const filteredEntries = entries.filter(
    (entry) => !shouldSkipEntry(entry as FileSystemEntry)
  );

  const results = await Promise.all(
    filteredEntries.map(async (entry: FileSystemEntry) => {
      if (isDirectory(entry)) {
        return collectSearchResults(entry);
      }

      if (!isFile(entry)) {
        return [];
      }

      const file: any = entry;
      const pathname = normalizePathname(
        file.getPathname({ includeBasePathname: false })
      );
      const breadcrumbSegments = file.getPathnameSegments({
        includeBasePathname: false,
      }) as string[];
      const breadcrumb = breadcrumbSegments.join(" / ");

      const fileLastModified =
        typeof file.getLastCommitDate === "function"
          ? await file.getLastCommitDate()
          : undefined;

      const exports =
        typeof file.getExports === "function" ? await file.getExports() : null;

      if (!exports || exports.length === 0) {
        const fileResult = createSearchResultFromFile(
          file,
          pathname,
          breadcrumb,
          fileLastModified
        );
        return fileResult ? [fileResult] : [];
      }

      const exportResults = await Promise.all(
        (exports as any[]).map(async (exp: any) => {
          return createSearchResultFromExport(
            exp,
            pathname,
            breadcrumb,
            fileLastModified
          );
        })
      );

      return exportResults.filter(Boolean) as SearchResult[];
    })
  );

  return results.flat();
}

export async function getSearchResults(): Promise<SearchResult[]> {
  if (searchResultsCache) {
    return searchResultsCache;
  }

  const results = dedupeResults(await collectSearchResults(tslDir));
  results.sort((a, b) => a.title.localeCompare(b.title));
  searchResultsCache = results;

  return results;
}

function createSearchResultFromFile(
  file: any,
  pathname: string,
  breadcrumb: string,
  fallbackDate?: Date
): SearchResult | null {
  const title =
    typeof file.getTitle === "function" ? file.getTitle() : undefined;
  if (!title) return null;

  const description =
    typeof file.getDescription === "function"
      ? file.getDescription()
      : undefined;

  const { createdAt, createdAtLabel } = serializeDate(fallbackDate);

  return {
    title,
    description,
    href: pathname,
    breadcrumb,
    createdAt,
    createdAtLabel,
    titleLower: title.toLowerCase(),
    descriptionLower: (description ?? "").toLowerCase(),
    breadcrumbLower: breadcrumb.toLowerCase(),
  };
}

async function createSearchResultFromExport(
  exp: any,
  pathname: string,
  breadcrumb: string,
  fallbackDate?: Date
): Promise<SearchResult | null> {
  const title =
    typeof exp.getTitle === "function"
      ? exp.getTitle()
      : typeof exp.getName === "function"
      ? exp.getName()
      : undefined;
  if (!title) return null;

  const description =
    typeof exp.getDescription === "function" ? exp.getDescription() : undefined;

  const createdAt =
    typeof exp.getFirstCommitDate === "function"
      ? await exp.getFirstCommitDate()
      : undefined;

  const createdAtDate = createdAt ?? fallbackDate;
  const { createdAt: isoDate, createdAtLabel } = serializeDate(createdAtDate);

  const slug =
    typeof exp.getSlug === "function"
      ? exp.getSlug()
      : typeof exp.getName === "function"
      ? exp.getName()
      : undefined;

  const anchor =
    typeof exp.getName === "function" ? exp.getName() : slug ?? undefined;

  const href = anchor ? `${pathname}#${anchor}` : pathname;

  return {
    title,
    description,
    href,
    breadcrumb,
    createdAt: isoDate,
    createdAtLabel,
    titleLower: title.toLowerCase(),
    descriptionLower: (description ?? "").toLowerCase(),
    breadcrumbLower: breadcrumb.toLowerCase(),
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

function shouldSkipEntry(entry: FileSystemEntry): boolean {
  if (!isFile(entry)) return false;

  const pathname =
    typeof entry.getPathname === "function"
      ? entry.getPathname({ includeBasePathname: false })
      : undefined;
  const last = pathname?.split("/").pop();
  if (!last) return false;

  const normalized = last.toLowerCase();
  return (
    normalized === "tsl-base" || normalized === "nodes" || normalized === "tsl"
  );
}
