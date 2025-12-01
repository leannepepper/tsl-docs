import type { ReactNode } from "react";
import { Logo } from "renoun";

import Sidebar from "./Sidebar";
import {
  DocsHeaderBar,
  DocsHeaderProvider,
  DocsSearchSlot,
} from "./DocsHeader";
import HeroBackground from "./HeroBackground";

type DocsShellProps = {
  children: ReactNode;
  showBackground?: boolean;
};

export function DocsShell({ children, showBackground = true }: DocsShellProps) {
  return (
    <DocsHeaderProvider>
      {showBackground ? <HeroBackground variant="docs" /> : null}
      <div className="docs-layout">
        <DocsHeaderBar />
        <div className="docs-shell">
          <aside className="docs-sidebar">
            <Sidebar />
          </aside>
          <DocsSearchSlot>{children}</DocsSearchSlot>
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
      <Logo variant="gitHost" width="1em" height="1em" />
      <span>View Repository</span>
    </a>
  );
}
