"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type HeaderValue = {
  title: string;
  setTitle: (title: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isSearchActive: boolean;
  setSearchActive: (value: boolean) => void;
};

const DocsHeaderContext = createContext<HeaderValue | undefined>(undefined);

export function DocsHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Search");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setSearchActive] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setSearchQuery("");
    setSearchActive(false);
  }, [pathname]);

  const value = useMemo(
    () => ({
      title,
      setTitle,
      searchQuery,
      setSearchQuery,
      isSearchActive,
      setSearchActive,
    }),
    [title, searchQuery, isSearchActive]
  );

  return (
    <DocsHeaderContext.Provider value={value}>
      {children}
    </DocsHeaderContext.Provider>
  );
}

function useDocsHeaderContext() {
  const ctx = useContext(DocsHeaderContext);
  if (!ctx) {
    throw new Error(
      "DocsHeader components must be rendered within DocsHeaderProvider"
    );
  }
  return ctx;
}

export function DocsHeaderBar() {
  const {
    title,
    searchQuery,
    setSearchQuery,
    isSearchActive,
    setSearchActive,
  } = useDocsHeaderContext();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchActive) {
      inputRef.current?.focus();
    }
  }, [isSearchActive]);


  const handleTrigger = () => {
    setSearchActive(true);
  };

  const handleBlur = () => {
    if (!searchQuery.trim()) {
      setSearchActive(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSearchQuery("");
      setSearchActive(false);
    }
  };

  return (
    <header className="docs-header">
      <Link href="/#docs" className="docs-header__brand">
        TSL
      </Link>
      <div className="docs-header__slot">
        {isSearchActive ? (
          <label className="docs-header__input-wrap">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="28" cy="28" r="18" />
              <line x1="40" y1="40" x2="58" y2="58" />
            </svg>
            <input
              ref={inputRef}
              className="docs-header__input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Search docs..."
              aria-label="Search docs"
            />
          </label>
        ) : (
          <button
            type="button"
            className="docs-header__trigger"
            onClick={handleTrigger}
          >
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="28" cy="28" r="18" />
              <line x1="40" y1="40" x2="58" y2="58" />
            </svg>
            <span>{title}</span>
          </button>
        )}
      </div>
    </header>
  );
}

export function DocsHeaderTitle({ title }: { title: string }) {
  const { setTitle } = useDocsHeaderContext();

  useEffect(() => {
    setTitle(title);
    return () => {
      setTitle("Search");
    };
  }, [title, setTitle]);

  return null;
}

export function DocsSearchSlot({ children }: { children: ReactNode }) {
  const { searchQuery } = useDocsHeaderContext();
  const trimmed = searchQuery.trim();

  if (!trimmed) {
    return <>{children}</>;
  }

  const results = filterSearchResults(trimmed);

  return (
    <>
      <main className="docs-content docs-search">
        <p className="docs-search__label">
          Showing {results.length} result{results.length === 1 ? "" : "s"} for “
          {trimmed}”
        </p>
        {results.length ? (
          <ul className="docs-search__results">
            {results.map((result) => (
              <li key={result.href}>
                <Link href={result.href} className="docs-search__result">
                  <div className="docs-search__result-title">{result.title}</div>
                  <p>{result.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="docs-search__empty">
            No matches yet. Try different keywords.
          </div>
        )}
      </main>
      <aside className="docs-toc docs-search__sidebar">
        <p>Press Esc to exit search.</p>
      </aside>
    </>
  );
}

type SearchResult = {
  title: string;
  description: string;
  href: string;
};

const MOCK_RESULTS: SearchResult[] = [
  {
    title: "Math · Math Node",
    description: "Compose math operations that run directly in your shader.",
    href: "/math/math-node",
  },
  {
    title: "Core · Array Node",
    description: "Build reusable inputs and structs for complex graphs.",
    href: "/core/array-node",
  },
  {
    title: "Code · Scriptable Node",
    description: "Author custom snippets that inject GLSL at compile time.",
    href: "/code/scriptable-node",
  },
  {
    title: "Display · Tone Mapping Node",
    description: "Apply ACES-style tonemapping before presenting frames.",
    href: "/display/tone-mapping-node",
  },
];

function filterSearchResults(query: string): SearchResult[] {
  const normalized = query.toLowerCase();
  return MOCK_RESULTS.filter(
    (item) =>
      item.title.toLowerCase().includes(normalized) ||
      item.description.toLowerCase().includes(normalized)
  );
}
