import { DocsHeaderTitle } from '@/app/components/DocsHeader'
import {
  RECENT_WINDOW_DAYS,
  RecentExportsHistory,
} from '@/app/lib/recent-exports'

export async function DocsHome() {
  return (
    <>
      <DocsHeaderTitle title="Recently Added" />
      <main className="docs-content docs-home">
        <section className="recent-intro">
          <p>Exports added in the last {RECENT_WINDOW_DAYS} days.</p>
        </section>
        <section aria-label="Recent TSL exports">
          <RecentExportsHistory />
        </section>
      </main>
    </>
  )
}

export function DocsHomeLoading() {
  return (
    <>
      <DocsHeaderTitle title="Recently Added" />
      <main className="docs-content docs-home">
        <section className="recent-intro">
          <p>Exports added in the last {RECENT_WINDOW_DAYS} days.</p>
        </section>
        <section aria-label="Recent TSL exports">
          <p className="recent-empty">Loading recent exports...</p>
        </section>
      </main>
    </>
  )
}
