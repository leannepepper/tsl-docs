import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import { DocsShellClient } from "./DocsShellClient";
import { getSearchResults } from "@/app/lib/search-results";

type DocsShellProps = {
  children: ReactNode;
  showBackground?: boolean;
};

export async function DocsShell({
  children,
  showBackground = true,
}: DocsShellProps) {
  const searchResults = await getSearchResults();

  return (
    <DocsShellClient
      sidebar={<Sidebar />}
      showBackground={showBackground}
      searchResults={searchResults}
    >
      {children}
    </DocsShellClient>
  );
}
