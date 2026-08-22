import { createContext, useContext } from 'react'

export interface SearchFilterContextValue {
  query: string
  setQuery: (q: string) => void
}

export const SearchFilterContext = createContext<SearchFilterContextValue>({
  query: '',
  setQuery: () => {},
})

export function useSearchFilter() {
  return useContext(SearchFilterContext)
}

/**
 * Match a search query against multiple text fields (case-insensitive).
 * Returns true if query is empty or any field contains the query.
 */
export function matchesSearch(query: string, ...fields: (string | null | undefined)[]): boolean {
  if (!query.trim()) return true
  const q = query.toLowerCase()
  return fields.some((f) => f?.toLowerCase().includes(q))
}
