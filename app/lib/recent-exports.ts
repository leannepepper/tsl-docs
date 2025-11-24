import {
  isDirectory,
  isFile,
  type Directory,
  type FileSystemEntry,
} from "renoun";

import { tslDir } from "@/app/lib/tsl-collections";

export const RECENT_WINDOW_DAYS = 365;

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

async function collectRecentExportsFromDirectory(
  directory: Directory<any>,
  cutoff: Date
): Promise<RecentExport[]> {
  const entries = await directory.getEntries();
  const results: RecentExport[] = [];

  for (const entry of entries as FileSystemEntry[]) {
    if (isDirectory(entry)) {
      const nested = await collectRecentExportsFromDirectory(entry, cutoff);
      results.push(...nested);
      continue;
    }

    if (!isFile(entry)) continue;

    // TSL directory is filtered to JavaScript files, so these entries should
    // support `getExports` and related APIs.
    const file: any = entry;

    if (typeof file.getExports !== "function") continue;

    const exports = await file.getExports();
    if (!exports || exports.length === 0) continue;

    const pathname = file.getPathname({ includeBasePathname: false }) as string;
    const normalizedPathname = pathname.startsWith("/")
      ? pathname
      : `/${pathname}`;

    const breadcrumbSegments = file.getPathnameSegments({
      includeBasePathname: false,
    }) as string[];
    const breadcrumb = breadcrumbSegments.join(" / ");

    for (const exp of exports as any[]) {
      if (typeof exp.getFirstCommitDate !== "function") continue;

      const firstCommitDate: Date | undefined = await exp.getFirstCommitDate();
      if (!firstCommitDate) continue;

      if (firstCommitDate < cutoff) continue;

      const name: string = exp.getName();
      const title: string = exp.getTitle();
      const slug: string = exp.getSlug();
      const description: string | undefined =
        typeof exp.getDescription === "function"
          ? exp.getDescription()
          : undefined;

      results.push({
        name,
        title,
        slug,
        description,
        createdAt: firstCommitDate,
        filePathname: normalizedPathname,
        href: `${normalizedPathname}#${slug}`,
        breadcrumb,
      });
    }
  }

  return results;
}

export async function getRecentExportsList(): Promise<RecentExport[]> {
  const now = new Date();
  const cutoff = new Date(
    now.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );

  const exports = await collectRecentExportsFromDirectory(tslDir, cutoff);
  // Sort newest first.
  exports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return exports;
}
