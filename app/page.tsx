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
              width="84"
              height="56"
              viewBox="0 0 169 111"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M86.6456 104.394C91.8181 104.394 165.929 10.636 162.517 6.34564C159.6 2.67845 88.0366 29.4214 84.6942 29.4214C82.0722 29.4214 6.00305 2.75884 6.00303 8.29546C6.00304 14.9265 83.1103 104.394 86.6456 104.394Z"
                fill="url(#paint0_linear_108_171)"
                stroke="#5BACB2"
                strokeWidth="12"
              />
              <defs>
                <linearGradient
                  id="paint0_linear_108_171"
                  x1="84.6678"
                  y1="104.403"
                  x2="84.1403"
                  y2="6.76736"
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
