import Link from "next/link";

import { DocsHeaderTitle } from "@/app/components/DocsHeader";
import {
  getRecentExportsList,
  RECENT_WINDOW_DAYS,
} from "@/app/lib/recent-exports";

export async function DocsHome() {
  const recentExports = await getRecentExportsList();

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

        <section aria-label="Recent TSL exports">
          {recentExports.length === 0 ? (
            <p className="recent-empty">
              No exports have been added in the last {RECENT_WINDOW_DAYS} days.
            </p>
          ) : (
            <ul className="recent-grid">
              {recentExports.map((exp) => (
                <li key={exp.href}>
                  <Link href={exp.href} className="recent-card">
                    <div className="recent-card__meta">
                      <p className="recent-card__file">{exp.breadcrumb}</p>
                      <time
                        className="recent-card__date"
                        dateTime={exp.createdAt.toISOString()}
                      >
                        {exp.createdAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                    <h2 className="recent-card__title">
                      {exp.title || exp.name}
                    </h2>
                    {exp.description ? (
                      <p className="recent-card__description">
                        {exp.description}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
