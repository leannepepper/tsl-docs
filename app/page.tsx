import { Suspense } from "react";

import HeroBackground from "./components/HeroBackground";
import { DocsHome, DocsHomeLoading } from "./components/DocsHome";
import { DocsShell } from "./components/DocsShell";

export default function Page() {
  return (
    <main className="home-shell">
      <HeroBackground />
      <section className="home-hero">
        <a
          className="home-hero__official"
          href="https://threejs.org/docs/index.html#TSL"
          target="_blank"
          rel="noreferrer"
        >
          Official TSL docs <span aria-hidden="true">→</span>
        </a>
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
          <a href="#docs" className="home-hero__cta" aria-label="Go to Docs">
            <span className="sr-only">Go to Docs</span>
            <svg
              width="323"
              height="207"
              viewBox="0 0 323 207"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M165.762 200.927C176.009 200.928 322.829 15.1837 316.069 6.68415C310.291 -0.580865 168.517 52.3993 161.896 52.3993C156.701 52.3993 6.00146 -0.421619 6.00145 10.5469C6.00147 23.6837 158.758 200.927 165.762 200.927Z"
                fill="url(#paint0_linear_108_171)"
                stroke="#5BACB2"
                strokeWidth="12"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_108_171"
                  x1="161.843"
                  y1="200.945"
                  x2="160.798"
                  y2="7.51961"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.192308" stopColor="#34CCE0" />
                  <stop offset="0.745192" stopColor="#1C6F7A" />
                </linearGradient>
              </defs>
            </svg>
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
