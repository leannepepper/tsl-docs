"use client";

import { useCallback, useState, type ReactNode } from "react";

import {
  DocsHeaderBar,
  DocsHeaderProvider,
  DocsSearchSlot,
} from "./DocsHeader";
import HeroBackground from "./HeroBackground";

type DocsShellClientProps = {
  children: ReactNode;
  sidebar: ReactNode;
  showBackground?: boolean;
};

export function DocsShellClient({
  children,
  sidebar,
  showBackground = true,
}: DocsShellClientProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const toggleMobileNav = useCallback(() => {
    setIsMobileNavOpen((open: boolean) => !open);
  }, []);

  const closeMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  return (
    <DocsHeaderProvider>
      {showBackground ? <HeroBackground variant="docs" /> : null}
      <div className="docs-layout">
        <DocsHeaderBar
          onToggleMobileNav={toggleMobileNav}
          isMobileNavOpen={isMobileNavOpen}
        />
        <div className="docs-shell">
          <aside className="docs-sidebar">{sidebar}</aside>
          <DocsSearchSlot>{children}</DocsSearchSlot>
        </div>
        {/* Mobile navigation overlay – only visible on small screens via CSS */}
        <div
          id="docs-mobile-nav"
          className={`docs-mobile-nav${
            isMobileNavOpen ? " docs-mobile-nav--open" : ""
          }`}
          aria-hidden={!isMobileNavOpen}
        >
          <button
            type="button"
            className="docs-mobile-nav__backdrop"
            onClick={closeMobileNav}
            aria-label="Close navigation"
          />
          <aside
            className="docs-mobile-nav__panel"
            aria-label="Documentation navigation"
          >
            <button
              type="button"
              className="docs-mobile-nav__close"
              onClick={closeMobileNav}
              aria-label="Close navigation"
            >
              ✕
            </button>
            {sidebar}
          </aside>
        </div>
        <footer className="docs-footer">
          <GitRepositoryLink />
          <span className="docs-footer__text">
            made with{" "}
            <a
              href="https://www.renoun.dev/docs/introduction"
              target="_blank"
              rel="noreferrer"
              className="docs-footer__link"
            >
              renoun
            </a>
          </span>
        </footer>
      </div>
    </DocsHeaderProvider>
  );
}

function GitRepositoryLink() {
  return (
    <a
      href="https://github.com/leannepepper/tsl-docs"
      target="_blank"
      rel="noreferrer"
      className="docs-footer__repo-link"
    >
      <span>View Repository</span>
    </a>
  );
}
