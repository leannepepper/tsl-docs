import Link from 'next/link'
import { History } from 'renoun'
import type { HistorySelectEntriesContext } from 'renoun'

import { tslDir } from '@/app/lib/tsl-collections'

export const RECENT_WINDOW_DAYS = 90

type HistoryExportEntry = HistorySelectEntriesContext['entries'][number]
type ProgressMessageInput = {
  phase: string
  commitsProcessed: number
  totalCommits: number
}

const SKIPPED_FILE_NAMES = new Set(['tsl-base', 'nodes', 'tsl'])
const DOCS_ROOT_PREFIX = 'src/nodes/'
const FILE_EXTENSION = '.js'

export function RecentExportsHistory() {
  const repo = tslDir.getRepository()
  const cutoffUnix = getCutoffUnix(RECENT_WINDOW_DAYS)

  return (
    <History
      source={repo}
      selectEntries={(context) => selectRecentEntries(context, cutoffUnix)}
      components={{
        Progress: (props) => (
          <p className="recent-empty" role="status" aria-live="polite">
            {getProgressMessage(props)}
          </p>
        ),
        Complete: ({ entries }) => {
          if (entries.length === 0) {
            return (
              <p className="recent-empty">
                No exports have been added in the last {RECENT_WINDOW_DAYS}{' '}
                days.
              </p>
            )
          }

          return (
            <ul className="recent-list">
              {entries.map((entry) => {
                const addedAt = getEntryAddedDate(entry)
                const pathname = toDocsPathname(entry.filePath)
                const breadcrumb = toBreadcrumb(entry.filePath)
                const href = entry.name ? `${pathname}#${entry.name}` : pathname

                return (
                  <li key={entry.id} className="recent-list__item">
                    <Link href={href} className="recent-list__link">
                      <div className="recent-list__main">
                        <h2 className="recent-list__title">{entry.name}</h2>
                      </div>
                      <div className="recent-list__meta">
                        <p className="recent-list__file">{breadcrumb}</p>
                        {addedAt ? (
                          <time
                            className="recent-list__date"
                            dateTime={addedAt.toISOString()}
                          >
                            {addedAt.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </time>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )
        },
      }}
    />
  )
}

function selectRecentEntries(
  { entries }: HistorySelectEntriesContext,
  cutoffUnix: number
): HistoryExportEntry[] {
  const filtered = entries
    .filter((entry) => !shouldSkipEntry(entry.filePath))
    .map((entry) => ({
      entry,
      addedUnix: getEntryAddedUnix(entry),
    }))
    .filter((item) => item.addedUnix !== null && item.addedUnix >= cutoffUnix)
    .sort((a, b) => (b.addedUnix ?? 0) - (a.addedUnix ?? 0))

  return filtered.map((item) => item.entry)
}

function getEntryAddedUnix(entry: HistoryExportEntry): number | null {
  let minAddedUnix = Infinity

  for (const change of entry.changes) {
    if (change.kind !== 'Added') continue
    if (change.unix < minAddedUnix) {
      minAddedUnix = change.unix
    }
  }

  return Number.isFinite(minAddedUnix) ? minAddedUnix : null
}

function getEntryAddedDate(entry: HistoryExportEntry): Date | undefined {
  const addedUnix = getEntryAddedUnix(entry)
  if (addedUnix == null) return undefined
  return new Date(addedUnix * 1000)
}

function getCutoffUnix(days: number): number {
  const now = Date.now()
  const windowMs = days * 24 * 60 * 60 * 1000
  return Math.floor((now - windowMs) / 1000)
}

function shouldSkipEntry(filePath: string): boolean {
  const normalized = normalizeFilePath(filePath)
  const last = normalized.split('/').pop()
  if (!last) return false
  return SKIPPED_FILE_NAMES.has(last.toLowerCase())
}

function normalizeFilePath(filePath: string): string {
  const withoutLeading = filePath.startsWith('/') ? filePath.slice(1) : filePath
  const withoutRoot = withoutLeading.startsWith(DOCS_ROOT_PREFIX)
    ? withoutLeading.slice(DOCS_ROOT_PREFIX.length)
    : withoutLeading

  return withoutRoot.endsWith(FILE_EXTENSION)
    ? withoutRoot.slice(0, -FILE_EXTENSION.length)
    : withoutRoot
}

function toDocsPathname(filePath: string): string {
  const segments = toSlugSegments(normalizeFilePath(filePath))
  return segments.length > 0 ? `/${segments.join('/')}` : '/'
}

function toBreadcrumb(filePath: string): string {
  const segments = toSlugSegments(normalizeFilePath(filePath))
  if (segments.length === 0) return filePath
  return segments.join(' / ')
}

function toSlugSegments(path: string): string[] {
  if (!path) return []
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => toKebabSlug(segment))
}

function toKebabSlug(segment: string): string {
  const normalized = segment.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
  const withDashes = normalized
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  return withDashes || segment
}

function getProgressMessage({
  phase,
  commitsProcessed,
  totalCommits,
}: ProgressMessageInput): string {
  if (totalCommits > 0) {
    return `Loading recent exports... (${commitsProcessed.toLocaleString()} of ${totalCommits.toLocaleString()} commits)`
  }

  switch (phase) {
    case 'ensureRepoReady':
      return 'Loading recent exports... (preparing repository)'
    case 'resolveHead':
      return 'Loading recent exports... (resolving latest commit)'
    case 'gitLogCached':
      return 'Loading recent exports... (reading commit history)'
    case 'buildCommitReleaseMap':
      return 'Loading recent exports... (indexing releases)'
    case 'resolveEntries':
      return 'Loading recent exports... (resolving entry files)'
    case 'batch':
      return 'Loading recent exports... (analyzing export history)'
    default:
      return 'Loading recent exports...'
  }
}
