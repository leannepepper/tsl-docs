import { getTslIndex } from "@/app/lib/tsl-index";

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

function shouldSkipPathname(pathname: string): boolean {
  const last = pathname.split("/").pop();
  if (!last) return false;

  const normalized = last.toLowerCase();
  return (
    normalized === "tsl-base" || normalized === "nodes" || normalized === "tsl"
  );
}

export async function getRecentExportsList(): Promise<RecentExport[]> {
  if (recentExportsCache) {
    return recentExportsCache;
  }

  const now = new Date();
  const cutoff = new Date(
    now.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000
  );

  const index = await getTslIndex();
  const exports: RecentExport[] = [];

  for (const file of index.files) {
    if (shouldSkipPathname(file.pathname)) continue;

    for (const exp of file.exportEntries) {
      const firstCommitDate = exp.firstCommitDate;
      if (!firstCommitDate || firstCommitDate < cutoff) continue;

      const name = exp.name;
      const title = exp.title;
      const slug = exp.slug;
      if (!name || !title || !slug) continue;

      exports.push({
        name,
        title,
        slug,
        description: exp.description,
        createdAt: firstCommitDate,
        filePathname: file.pathname,
        href: exp.href,
        breadcrumb: file.breadcrumb,
      });
    }
  }
  // Sort newest first.
  exports.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  recentExportsCache = exports;
  return exports;
}
