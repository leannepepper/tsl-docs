import type { SearchResult } from "@/app/lib/search-results";

let searchResultsCache: SearchResult[] | null = null;
let searchResultsPromise: Promise<SearchResult[]> | null = null;

export async function loadSearchResultsClient(): Promise<SearchResult[]> {
  if (searchResultsCache) {
    return searchResultsCache;
  }

  if (!searchResultsPromise) {
    searchResultsPromise = fetch("/search.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            `[tsl-docs] Failed to load search results: ${response.status}`
          );
        }

        const results = (await response.json()) as SearchResult[];
        searchResultsCache = results;
        return results;
      })
      .catch((error) => {
        searchResultsPromise = null;
        throw error;
      });
  }

  return searchResultsPromise;
}
