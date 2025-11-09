import Sidebar from "../components/Sidebar";
import {
  DocsHeaderBar,
  DocsHeaderProvider,
  DocsSearchSlot,
} from "../components/DocsHeader";
import { tslCategories } from "../lib/tsl-collections";

export async function generateStaticParams() {
  // one page per category (including "constants")
  return tslCategories.map((c) => ({ category: c.key }));
}

export default async function APILayout(props: any) {
  const { children } = props;
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
