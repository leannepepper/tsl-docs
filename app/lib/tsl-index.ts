import {
  isDirectory,
  isFile,
  type Directory,
  type FileSystemEntry,
} from "renoun";

import { tslDir } from "@/app/lib/tsl-collections";

export type ExportIndexEntry = {
  name?: string;
  title?: string;
  slug?: string;
  description?: string;
  firstCommitDate?: Date;
  href: string;
  filePathname: string;
  breadcrumb: string;
};

export type FileIndexEntry = {
  pathname: string;
  breadcrumb: string;
  title?: string;
  description?: string;
  lastCommitDate?: Date;
  exportEntries: ExportIndexEntry[];
};

export type TslIndex = {
  files: FileIndexEntry[];
  filesByPath: Map<string, FileIndexEntry>;
  exportEntries: ExportIndexEntry[];
};

let indexPromise: Promise<TslIndex> | null = null;

export async function getTslIndex(): Promise<TslIndex> {
  if (!indexPromise) {
    indexPromise = buildIndex();
  }
  return indexPromise;
}

async function buildIndex(): Promise<TslIndex> {
  const files = await collectFileIndex(tslDir);
  const filesByPath = new Map<string, FileIndexEntry>();
  const exportEntries: ExportIndexEntry[] = [];

  for (const file of files) {
    filesByPath.set(file.pathname, file);
    exportEntries.push(...file.exportEntries);
  }

  return { files, filesByPath, exportEntries };
}

async function collectFileIndex(
  directory: Directory<any>
): Promise<FileIndexEntry[]> {
  const entries = await directory.getEntries();
  const results = await mapWithConcurrency(
    entries as FileSystemEntry[],
    8,
    async (entry) => {
      if (isDirectory(entry)) {
        return collectFileIndex(entry);
      }

      if (!isFile(entry)) return [];

      const file: any = entry;
      const pathname = normalizePathname(
        file.getPathname({ includeBasePathname: false })
      );
      const breadcrumbSegments = file.getPathnameSegments({
        includeBasePathname: false,
      }) as string[];
      const breadcrumb = breadcrumbSegments.join(" / ");

      const lastCommitDate =
        typeof file.getLastCommitDate === "function"
          ? await file.getLastCommitDate()
          : undefined;

      const exports =
        typeof file.getExports === "function" ? await file.getExports() : [];

      const exportEntries = await mapWithConcurrency(
        exports as any[],
        10,
        async (exp: any) => {
          const name: string | undefined = exp.name;
          const title: string | undefined = exp.title;
          const slug: string | undefined = exp.slug;
          const description: string | undefined = exp.description;
          const anchor = name ?? slug ?? undefined;
          const href = anchor ? `${pathname}#${anchor}` : pathname;
          const firstCommitDate =
            typeof exp.getFirstCommitDate === "function"
              ? await exp.getFirstCommitDate()
              : undefined;

          return {
            name,
            title,
            slug,
            description,
            firstCommitDate,
            href,
            filePathname: pathname,
            breadcrumb,
          } satisfies ExportIndexEntry;
        }
      );

      return [
        {
          pathname,
          breadcrumb,
          title: typeof file.title === "string" ? file.title : undefined,
          description:
            typeof file.description === "string" ? file.description : undefined,
          lastCommitDate,
          exportEntries,
        } satisfies FileIndexEntry,
      ];
    }
  );

  return results.flat();
}

const normalizePathname = (pathname: string): string =>
  pathname.startsWith("/") ? pathname : `/${pathname}`;

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
