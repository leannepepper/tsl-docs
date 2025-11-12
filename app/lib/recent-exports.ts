import { isFile, type JavaScriptFile } from "renoun";

import { tslDir } from "./tsl-collections";

const RECENT_WINDOW_DAYS = 90;
const RECENT_WINDOW_MS = RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000;
const REPO_OWNER = "mrdoob";
const REPO_NAME = "three.js";
const REPO_REF = "master";
const REPO_SUBDIR = "src/nodes";
const GITHUB_API_ROOT = "https://api.github.com";
const COMMITS_PER_PAGE = 100;
const MAX_COMMIT_PAGES = 2;
const MAX_COMMITS_TO_PROCESS = 40;
const MAX_COMMIT_DETAIL_CONCURRENCY = 3;
const REMOTE_FETCH_TIMEOUT_MS = 6000;

export const RECENT_BADGE_LABEL = "Recently Added";

export type RecentExportSummary = {
  fileTitle: string;
  exportTitle: string;
  exportName: string;
  description?: string;
  href: string;
  route: string;
  commitDate: Date;
};

type RecentExportRouteRecord = {
  names: Set<string>;
  commitDate: Date;
};

type RecentExportCache = {
  list: RecentExportSummary[];
  map: Map<string, RecentExportRouteRecord>;
};

type CommitSummary = {
  sha: string;
  date?: string;
};

let recentExportsPromise: Promise<RecentExportCache> | null = null;
let remoteCommitMapPromise: Promise<Map<string, Date>> | null = null;
const SHOULD_FETCH_REMOTE = Boolean(process.env.GITHUB_TOKEN);

function normalizeRoute(route: string): string {
  const withLeading = route.startsWith("/") ? route : `/${route}`;
  if (withLeading.length > 1 && withLeading.endsWith("/")) {
    return withLeading.slice(0, -1);
  }
  return withLeading;
}

function getDocsRoute(entry: JavaScriptFile<any>): string {
  const relative = entry.getPathname({ includeBasePathname: false });
  const normalizedRelative = relative.startsWith("/")
    ? relative
    : `/${relative}`;
  return normalizeRoute(`/docs${normalizedRelative}`);
}

async function buildRecentExportCache(): Promise<RecentExportCache> {
  const entries = await tslDir.getEntries({ recursive: true });
  const cutoff = Date.now() - RECENT_WINDOW_MS;
  const list: RecentExportSummary[] = [];
  const map = new Map<string, RecentExportRouteRecord>();
  let remoteCommitMap: Map<string, Date> | null = null;
  let attemptedRemoteCommits = false;

  for (const entry of entries) {
    if (!isFile(entry)) continue;

    try {
      let lastCommit = await entry.getLastCommitDate();

      if (!lastCommit) {
        if (!attemptedRemoteCommits && SHOULD_FETCH_REMOTE) {
          remoteCommitMap = await getRemoteCommitMapWithTimeout();
          attemptedRemoteCommits = true;
        }

        if (remoteCommitMap) {
          const relativeKey = normalizeCommitPath(
            entry.getRelativePathToRoot()
          );
          lastCommit =
            remoteCommitMap.get(relativeKey) ??
            remoteCommitMap.get(`${REPO_SUBDIR}/${relativeKey}`);
        }
      }

      if (!lastCommit || lastCommit.getTime() < cutoff) {
        continue;
      }

      const exports = await entry.getExports();
      if (!exports.length) continue;

      const route = getDocsRoute(entry);
      const routeRecord = map.get(route) ?? {
        names: new Set<string>(),
        commitDate: lastCommit,
      };

      for (const nodeExport of exports) {
        const exportName = nodeExport.getName();
        routeRecord.names.add(exportName);

        list.push({
          fileTitle: entry.getTitle(),
          exportTitle: nodeExport.getTitle(),
          exportName,
          description: nodeExport.getDescription(),
          href: `${route}#${encodeURIComponent(exportName)}`,
          route,
          commitDate: lastCommit,
        });
      }

      map.set(route, routeRecord);
    } catch {
      continue;
    }
  }

  list.sort((a, b) => b.commitDate.getTime() - a.commitDate.getTime());

  return { list, map };
}

async function getRecentExportCache(): Promise<RecentExportCache> {
  if (!recentExportsPromise) {
    recentExportsPromise = buildRecentExportCache();
  }
  return recentExportsPromise;
}

export async function getRecentExportsList(limit?: number) {
  const cache = await getRecentExportCache();
  return typeof limit === "number" ? cache.list.slice(0, limit) : cache.list;
}

export async function getRecentExportNamesForRoute(route: string) {
  const cache = await getRecentExportCache();
  const normalized = normalizeRoute(route);
  const record = cache.map.get(normalized);
  return record ? new Set(record.names) : new Set<string>();
}

export function isRecentDate(date?: Date | null) {
  if (!date) return false;
  return Date.now() - date.getTime() <= RECENT_WINDOW_MS;
}

export { RECENT_WINDOW_DAYS };

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "tsl-docs",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function getRemoteCommitMap(): Promise<Map<string, Date>> {
  if (!remoteCommitMapPromise) {
    remoteCommitMapPromise = fetchRemoteCommitMap();
  }
  return remoteCommitMapPromise;
}

async function getRemoteCommitMapWithTimeout(): Promise<Map<string, Date> | null> {
  if (!SHOULD_FETCH_REMOTE) {
    return null;
  }

  try {
    const result = await Promise.race([
      getRemoteCommitMap(),
      timeout<Map<string, Date>>(REMOTE_FETCH_TIMEOUT_MS),
    ]);
    return result ?? null;
  } catch {
    remoteCommitMapPromise = null;
    return null;
  }
}

async function fetchRemoteCommitMap(): Promise<Map<string, Date>> {
  const sinceIso = new Date(Date.now() - RECENT_WINDOW_MS).toISOString();
  const summaries = await fetchCommitSummaries(sinceIso);
  if (!summaries.length) {
    return new Map();
  }

  const commitsToProcess = summaries.slice(0, MAX_COMMITS_TO_PROCESS);
  const map = new Map<string, Date>();
  const cutoff = Date.now() - RECENT_WINDOW_MS;
  let cursor = 0;
  const workerCount = Math.min(
    MAX_COMMIT_DETAIL_CONCURRENCY,
    commitsToProcess.length
  );

  async function worker() {
    while (true) {
      const commit = commitsToProcess[cursor++];
      if (!commit) break;
      await addCommitFilesToMap(commit, map, cutoff);
    }
  }

  await Promise.all(Array.from({ length: workerCount }, worker));
  return map;
}

async function fetchCommitSummaries(sinceIso: string): Promise<CommitSummary[]> {
  const commits: CommitSummary[] = [];
  for (let page = 1; page <= MAX_COMMIT_PAGES; page += 1) {
    const url = new URL(
      `/repos/${REPO_OWNER}/${REPO_NAME}/commits`,
      GITHUB_API_ROOT
    );
    url.searchParams.set("sha", REPO_REF);
    url.searchParams.set("path", REPO_SUBDIR);
    url.searchParams.set("since", sinceIso);
    url.searchParams.set("per_page", COMMITS_PER_PAGE.toString());
    url.searchParams.set("page", page.toString());

    const response = await fetch(url, {
      headers: githubHeaders(),
      cache: "no-store",
    }).catch(() => null);

    if (!response || !response.ok) {
      if (
        response &&
        response.status === 403 &&
        response.headers.get("x-ratelimit-remaining") === "0"
      ) {
        remoteCommitMapPromise = null;
      }
      break;
    }

    const data = (await response.json().catch(() => [])) as any[];
    if (!Array.isArray(data) || data.length === 0) {
      break;
    }

    for (const commit of data) {
      if (!commit || typeof commit.sha !== "string") continue;
      commits.push({
        sha: commit.sha,
        date:
          commit.commit?.committer?.date ?? commit.commit?.author?.date ?? "",
      });
    }

    if (data.length < COMMITS_PER_PAGE) {
      break;
    }
  }

  return commits;
}

async function addCommitFilesToMap(
  commit: CommitSummary,
  map: Map<string, Date>,
  cutoff: number
) {
  try {
    const response = await fetch(
      `${GITHUB_API_ROOT}/repos/${REPO_OWNER}/${REPO_NAME}/commits/${commit.sha}`,
      { headers: githubHeaders(), cache: "no-store" }
    );

    if (!response.ok) {
      return;
    }

    const detail = await response.json();
    const dateString =
      detail.commit?.committer?.date ??
      detail.commit?.author?.date ??
      commit.date;
    if (!dateString) {
      return;
    }
    const commitDate = new Date(dateString);
    if (Number.isNaN(commitDate.getTime()) || commitDate.getTime() < cutoff) {
      return;
    }

    const files = Array.isArray(detail.files) ? detail.files : [];
    for (const file of files) {
      if (!file || typeof file.filename !== "string") continue;
      const normalizedFull = normalizeCommitPath(file.filename);
      if (!normalizedFull.startsWith(`${REPO_SUBDIR}/`)) continue;
      const relative = normalizedFull.slice(REPO_SUBDIR.length + 1);
      setLatest(map, relative, commitDate);
      setLatest(map, normalizedFull, commitDate);
    }
  } catch {
    // ignore commit fetch failures and continue
  }
}

function normalizeCommitPath(path: string) {
  return path.replace(/\\/g, "/");
}

function setLatest(map: Map<string, Date>, key: string, date: Date) {
  const existing = map.get(key);
  if (!existing || existing.getTime() < date.getTime()) {
    map.set(key, date);
  }
}

function timeout<T>(ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), ms);
  });
}
