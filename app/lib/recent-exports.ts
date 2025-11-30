import {
  isDirectory,
  isFile,
  type Directory,
  type FileSystemEntry,
} from "renoun";

import { tslDir } from "@/app/lib/tsl-collections";

export const RECENT_WINDOW_DAYS = 90;

export type RecentExport = {
  name: string;
  title: string;
  slug: string;
  description?: string;
  createdAt: Date;
  /** Route pathname for the file, starting with `/` (no query or hash). */
  filePathname: string;
  /** Full link to the export, including hash fragment. */
  href: string;
  /** Path-like label showing the directory and file where the export lives. */
  breadcrumb: string;
};

// Simple per-process cache so we don't have to walk the entire TSL tree on
// every request. This is especially helpful in development where the server
// restarts frequently anyway.
let recentExportsCache: RecentExport[] | null = null;

async function collectRecentExportsFromDirectory(
  directory: Directory<any>,
  cutoff: Date
): Promise<RecentExport[]> {
  const entries = await directory.getEntries();
  const results = await mapWithConcurrency(
    entries as FileSystemEntry[],
    8,
    async (entry) => {
      if (isDirectory(entry)) {
        return collectRecentExportsFromDirectory(entry, cutoff);
      }

      if (!isFile(entry)) return [];

      // TSL directory is filtered to JavaScript files, so these entries should
      // support `getExports` and related APIs.
      const file: any = entry;

      if (typeof file.getExports !== "function") return [];

      const exports = await file.getExports();
      if (!exports || exports.length === 0) return [];

      const pathname = file.getPathname({
        includeBasePathname: false,
      }) as string;
      const normalizedPathname = pathname.startsWith("/")
        ? pathname
        : `/${pathname}`;

      const breadcrumbSegments = file.getPathnameSegments({
        includeBasePathname: false,
      }) as string[];
      const breadcrumb = breadcrumbSegments.join(" / ");

      const exportResults = await mapWithConcurrency(
        exports as any[],
        10,
        async (exp: any) => {
          if (typeof exp.getFirstCommitDate !== "function") return null;

          const firstCommitDate: Date | undefined =
            await exp.getFirstCommitDate();
          if (!firstCommitDate) return null;

          if (firstCommitDate < cutoff) return null;

          const name: string = exp.getName();
          const title: string = exp.getTitle();
          const slug: string = exp.getSlug();
          const description: string | undefined =
            typeof exp.getDescription === "function"
              ? exp.getDescription()
              : undefined;

          return {
            name,
            title,
            slug,
            description,
            createdAt: firstCommitDate,
            filePathname: normalizedPathname,
            href: `${normalizedPathname}#${slug}`,
            breadcrumb,
          } satisfies RecentExport;
        }
      );

      return exportResults.filter(Boolean) as RecentExport[];
    }
  );

  return results.flat();
}

export async function getRecentExportsList(): Promise<RecentExport[]> {
  if (recentExportsCache) {
    return recentExportsCache;
  }

  const now = new Date();
  const cutoff = new Date(
    now.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );

  const exports = await collectRecentExportsFromDirectory(tslDir, cutoff);
  // Sort newest first.
  exports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  recentExportsCache = exports;
  return exports;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  iterator: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const results: R[] = new Array(items.length);
  const workers: Array<Promise<void>> = [];
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await iterator(items[currentIndex], currentIndex);
    }
  };

  const workerCount = Math.min(limit, items.length);
  for (let i = 0; i < workerCount; i += 1) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return results;
}
