import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import { DocsShellClient } from "./DocsShellClient";

type DocsShellProps = {
  children: ReactNode;
  showBackground?: boolean;
};

export async function DocsShell({
  children,
  showBackground = true,
}: DocsShellProps) {
  return (
    <DocsShellClient
      sidebar={<Sidebar />}
      showBackground={showBackground}
    >
      {children}
    </DocsShellClient>
  );
}
