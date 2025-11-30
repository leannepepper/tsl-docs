import { Suspense } from "react";

import HeroBackground from "./components/HeroBackground";
import { DocsHome, DocsHomeLoading } from "./components/DocsHome";
import { DocsShell } from "./components/DocsShell";

export default function Page() {
  return (
    <main className="home-shell">
      <HeroBackground />
      <section className="home-hero">
        <div className="home-hero__content">
          <div
            className="home-hero__words"
            aria-label="Three Shader Language Docs"
          >
            <div>
              <span>T</span>
              hree
            </div>
            <div>
              <span>S</span>
              hader
            </div>
            <div>
              <span>L</span>
              anguage
            </div>
            <p className="home-hero__kicker">unofficial documentation</p>
          </div>
          <a href="#docs" className="home-hero__cta">
            Go to Docs
          </a>
        </div>
      </section>
      <section id="docs" className="home-docs">
        <DocsShell showBackground={false}>
          <Suspense fallback={<DocsHomeLoading />}>
            <DocsHome />
          </Suspense>
        </DocsShell>
      </section>
    </main>
  );
}
