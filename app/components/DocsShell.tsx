import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import {
  DocsHeaderBar,
  DocsHeaderProvider,
  DocsSearchSlot,
} from "./DocsHeader";

export function DocsShell({ children }: { children: ReactNode }) {
  return (
    <DocsHeaderProvider>
      <div className="docs-layout">
        <DocsHeaderBar />
        <div className="docs-shell">
          <aside className="docs-sidebar">
            <Sidebar />
          </aside>
          <DocsSearchSlot>{children}</DocsSearchSlot>
        </div>
      </div>
    </DocsHeaderProvider>
  );
}
