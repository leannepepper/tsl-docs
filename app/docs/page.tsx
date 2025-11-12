import Link from "next/link";

import { DocsHeaderTitle } from "@/app/components/DocsHeader";
import {
  RECENT_BADGE_LABEL,
  RECENT_WINDOW_DAYS,
  getRecentExportsList,
} from "@/app/lib/recent-exports";

export default async function Page() {
  const recentExports = await getRecentExportsList(24);

  return (
    <>
      <DocsHeaderTitle title="Recently Added" />
      <main className="docs-content docs-home">
        <section className="recent-intro">
          <p>
            Tracking TSL’s{" "}
            <span className="recent-intro__highlight">main branch</span> so you
            can jump straight to the freshest exports. Anything added in the
            last {RECENT_WINDOW_DAYS} days lands here automatically.
          </p>
          <p className="recent-intro__hint">
            Click an item to open its page and scroll directly to the new API.
          </p>
        </section>
        {recentExports.length ? (
          <ul className="recent-grid">
            {recentExports.map((entry) => (
              <li key={`${entry.route}-${entry.exportName}`}>
                <Link href={entry.href} className="recent-card">
                  <div className="recent-card__meta">
                    <span className="recent-card__file">{entry.fileTitle}</span>
                    <span className="badge badge--recent">
                      {RECENT_BADGE_LABEL}
                    </span>
                  </div>
                  <h2 className="recent-card__title">{entry.exportTitle}</h2>
                  {entry.description ? (
                    <p className="recent-card__description">
                      {entry.description}
                    </p>
                  ) : null}
                  <span className="recent-card__date">
                    Added{" "}
                    {entry.commitDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="recent-empty">
            <p>
              No exports have shipped in the last {RECENT_WINDOW_DAYS} days.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
