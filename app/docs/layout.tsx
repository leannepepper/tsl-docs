import Sidebar from "../components/Sidebar";
import { tslCategories } from "../lib/tsl-collections";

export async function generateStaticParams() {
  // one page per category (including "constants")
  return tslCategories.map((c) => ({ category: c.key }));
}

export default async function APILayout(props: any) {
  const { children } = props;
  return (
    <div className="docs-layout">
      <header className="docs-header">
        <div className="docs-header__brand">TSL</div>
        <div className="docs-header__search">
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="28" cy="28" r="18" />
            <line x1="40" y1="40" x2="58" y2="58" />
          </svg>
          <span>Search</span>
        </div>
      </header>
      <div className="docs-shell">
        <aside className="docs-sidebar">
          <Sidebar />
        </aside>
        {children}
      </div>
    </div>
  );
}
