import Link from "next/link";
import type { ComponentProps } from "react";
import { Markdown } from "renoun";

import { DocsHeaderTitle } from "@/app/components/DocsHeader";
import {
  getRecentExportsList,
  RECENT_WINDOW_DAYS,
} from "@/app/lib/recent-exports";
import { markdownComponents } from "@/app/lib/markdown-components";

const recentDescriptionComponents = {
  ...markdownComponents,
  a: ({ children }: ComponentProps<"a">) => <span>{children}</span>,
};

export async function DocsHome() {
  const recentExports = await getRecentExportsList();

  return (
    <>
      <DocsHeaderTitle title="Recently Added" />
      <main className="docs-content docs-home">
        <section className="recent-intro">
          <p>Exports added in the last {RECENT_WINDOW_DAYS} days.</p>
        </section>
        <section aria-label="Recent TSL exports">
          {recentExports.length === 0 ? (
            <p className="recent-empty">
              No exports have been added in the last {RECENT_WINDOW_DAYS} days.
            </p>
          ) : (
            <ul className="recent-list">
              {recentExports.map((exp) => (
                <li key={exp.href} className="recent-list__item">
                  <Link href={exp.href} className="recent-list__link">
                    <div className="recent-list__main">
                      <h2 className="recent-list__title">
                        {exp.title || exp.name}
                      </h2>
                      {exp.description ? (
                        <div className="recent-list__description">
                          <Markdown components={recentDescriptionComponents}>
                            {exp.description}
                          </Markdown>
                        </div>
                      ) : null}
                    </div>
                    <div className="recent-list__meta">
                      <p className="recent-list__file">{exp.breadcrumb}</p>
                      <time
                        className="recent-list__date"
                        dateTime={exp.createdAt.toISOString()}
                      >
                        {exp.createdAt.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
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
  );
}
