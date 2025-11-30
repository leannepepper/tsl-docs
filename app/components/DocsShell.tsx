import type { ReactNode } from "react";

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

export function DocsShell({
  children,
  showBackground = true,
}: DocsShellProps) {
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
