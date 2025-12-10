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
import { useCallback } from "react";
import type { SearchResult } from "@/app/lib/search-results";
import {
  attachStableSurmiser,
  createSurmiserProvider as buildSurmiserProvider,
} from "@/app/lib/stable-surmiser";

type HeaderValue = {
  title: string;
  setTitle: (title: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isSearchActive: boolean;
  setSearchActive: (value: boolean) => void;
  searchResults: SearchResult[];
};

const DocsHeaderContext = createContext<HeaderValue | undefined>(undefined);
const SURMISER_DEBOUNCE_MS = 120;
const SURMISER_MIN_CONFIDENCE = 60;

export function DocsHeaderProvider({
  children,
  searchResults,
}: {
  children: ReactNode;
  searchResults: SearchResult[];
}) {
  const [title, setTitle] = useState("");
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
      searchResults,
    }),
    [title, searchQuery, isSearchActive, searchResults]
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

type DocsHeaderBarProps = {
  onToggleMobileNav?: () => void;
  isMobileNavOpen?: boolean;
};

export function DocsHeaderBar({
  onToggleMobileNav,
  isMobileNavOpen,
}: DocsHeaderBarProps) {
  const {
    title,
    searchQuery,
    setSearchQuery,
    isSearchActive,
    setSearchActive,
    searchResults,
  } = useDocsHeaderContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const surmiserProvider = useMemo(
    () => buildSurmiserProvider(searchResults),
    [searchResults]
  );

  useEffect(() => {
    if (isSearchActive) {
      inputRef.current?.focus();
    }
  }, [isSearchActive]);

  useEffect(() => {
    const header = headerRef.current;
    const sentinel = sentinelRef.current;
    if (!header || !sentinel) return;

    // On small/medium screens, keep the header compact and skip sticky animation logic.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 960px)").matches
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        header.classList.toggle("is-stuck", entry.intersectionRatio < 1);
      },
      { threshold: [1] }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const handleTrigger = () => {
    setSearchActive(true);
  };

  const handleBlur = useCallback(() => {
    // Keep search open; we rely on Escape or route change to exit search.
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setSearchQuery("");
      setSearchActive(false);
    }
  };

  useEffect(() => {
    if (!isSearchActive) return;
    const input = inputRef.current;
    if (!input) return;
    if (document.activeElement !== input) {
      input.focus({ preventScroll: true });
    }
  }, [isSearchActive, searchQuery]);

  useEffect(() => {
    if (!isSearchActive) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target) return;

      const isHeader = headerRef.current?.contains(target);
      const isSearchSurface = target.closest("[data-search-surface='true']");
      if (isHeader || isSearchSurface) return;

      setSearchQuery("");
      setSearchActive(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isSearchActive, setSearchActive, setSearchQuery]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !isSearchActive) return;

    const detach = attachStableSurmiser(input, {
      providers: [surmiserProvider],
      debounceMs: SURMISER_DEBOUNCE_MS,
      minConfidence: SURMISER_MIN_CONFIDENCE,
      onAccept: () => {
        setSearchQuery(input.value);
      },
    });

    return () => {
      detach?.();
    };
  }, [surmiserProvider, setSearchQuery, isSearchActive]);

  const handleAttachRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
    },
    []
  );

  return (
    <>
      <div
        ref={sentinelRef}
        className="docs-header__sentinel"
        aria-hidden="true"
      />
      <header ref={headerRef} className="docs-header">
        <div className="docs-header__brand-wrap">
          <Link href="/#docs" className="docs-header__brand">
            TSL
          </Link>
        </div>
        <div className="docs-header__slot">
          {isSearchActive ? (
            <label className="docs-header__input-wrap">
              <svg viewBox="0 0 64 64" aria-hidden="true">
                <circle cx="28" cy="28" r="18" />
                <line x1="40" y1="40" x2="58" y2="58" />
              </svg>
              <input
                ref={handleAttachRef}
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
          <button
            type="button"
            className="docs-header__mobile-toggle"
            onClick={onToggleMobileNav}
            aria-label={
              isMobileNavOpen ? "Close navigation" : "Open navigation"
            }
            aria-expanded={!!isMobileNavOpen}
            aria-controls="docs-mobile-nav"
          >
            <span className="docs-header__mobile-toggle-bar" />
            <span className="docs-header__mobile-toggle-bar" />
            <span className="docs-header__mobile-toggle-bar" />
          </button>
        </div>
      </header>
    </>
  );
}

export function DocsHeaderTitle({ title }: { title: string }) {
  const { setTitle } = useDocsHeaderContext();

  useEffect(() => {
    setTitle(title);
    return () => {
      setTitle("");
    };
  }, [title, setTitle]);

  return null;
}

export function DocsSearchSlot({ children }: { children: ReactNode }) {
  const { searchQuery, searchResults, setSearchActive, setSearchQuery } =
    useDocsHeaderContext();
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchActive(false);
  }, [setSearchActive, setSearchQuery]);
  const trimmed = searchQuery.trim();

  if (!trimmed) {
    return <>{children}</>;
  }

  const normalized = trimmed.toLowerCase();
  const results = filterSearchResults(normalized, searchResults);

  return (
    <>
      <main
        className="docs-content docs-search"
        data-search-surface="true"
      >
        <p className="docs-search__label">
          Showing {results.length} result{results.length === 1 ? "" : "s"} for “
          {trimmed}”
        </p>
        {results.length ? (
          <ul className="docs-search__results">
            {results.map((result) => (
              <li key={result.href}>
                <Link
                  href={result.href}
                  className="docs-search__result"
                  onClick={clearSearch}
                >
                  <div className="recent-list__main">
                    <h2 className="recent-list__title">{result.title}</h2>
                    {result.description ? (
                      <p className="recent-list__description">
                        {result.description}
                      </p>
                    ) : null}
                  </div>
                  <div className="recent-list__meta">
                    <p className="recent-list__file">{result.breadcrumb}</p>
                    {result.createdAt ? (
                      <time
                        className="recent-list__date"
                        dateTime={result.createdAt}
                      >
                        {result.createdAtLabel ?? result.createdAt}
                      </time>
                    ) : null}
                  </div>
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
      <aside
        className="docs-toc docs-search__sidebar"
        data-search-surface="true"
      >
        <p>Press Esc to exit search.</p>
      </aside>
    </>
  );
}

function filterSearchResults(
  normalizedQuery: string,
  results: SearchResult[]
): SearchResult[] {
  return results.filter((item) => {
    return (
      item.titleLower.includes(normalizedQuery) ||
      (!!item.descriptionLower && item.descriptionLower.includes(normalizedQuery)) ||
      item.breadcrumbLower.includes(normalizedQuery)
    );
  });
}
