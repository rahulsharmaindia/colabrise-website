import { useEffect, useState, useCallback, useRef } from 'react'
import { Users, Search, Loader2, RefreshCw } from 'lucide-react'
import { DashCard, DashButton, DashBadge, EmptyState } from '../../components/ui'
import { searchCreators, type CreatorProfile } from '../../../api/creators'
import { getErrorMessage } from '../../../lib/api-client'
import { useSearchFilter, matchesSearch } from '../../hooks/useSearchFilter'

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export function BrandCreatorsPage() {
  const [creators, setCreators] = useState<CreatorProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [niche, setNiche] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { query: globalSearch } = useSearchFilter()

  const fetchCreators = useCallback(async (q?: string, n?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await searchCreators({
        query: q ?? query,
        niche: n ?? niche,
        limit: 50,
      })
      setCreators(data)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [query, niche])

  // Initial load
  useEffect(() => {
    fetchCreators('', '')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced search
  const handleSearchChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchCreators(value, niche)
    }, 400)
  }

  const handleNicheChange = (value: string) => {
    setNiche(value)
    fetchCreators(query, value)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Creators</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Discover and browse creators on the platform.</p>
        </div>
        <DashButton variant="ghost" size="sm" onClick={() => fetchCreators()}>
          <RefreshCw className="w-4 h-4" />
        </DashButton>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, username, or bio..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>
        <input
          type="text"
          value={niche}
          onChange={(e) => handleNicheChange(e.target.value)}
          placeholder="Filter by niche..."
          className="sm:w-48 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <DashCard>
          <p className="text-red-400 text-sm">{error}</p>
          <DashButton className="mt-4" size="sm" onClick={() => fetchCreators()}>
            Retry
          </DashButton>
        </DashCard>
      )}

      {/* Empty */}
      {!loading && !error && creators.length === 0 && (
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title="No creators found"
          description={query || niche ? 'Try adjusting your search or filter.' : 'No creators registered yet.'}
        />
      )}

      {/* Creator grid */}
      {!loading && !error && creators.length > 0 && (() => {
        const displayed = globalSearch.trim()
          ? creators.filter((c) => matchesSearch(globalSearch, c.displayName, c.username, c.bio, c.niche))
          : creators
        if (displayed.length === 0) return (
          <EmptyState
            icon={<Users className="w-10 h-10" />}
            title="No matches"
            description="No creators match the search."
          />
        )
        return (
        <>
          <p className="text-xs text-gray-400 dark:text-gray-500">{displayed.length} creator{displayed.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayed.map((creator) => (
              <DashCard key={creator.id} className="flex flex-col items-center text-center">
                {/* Avatar */}
                {creator.profilePictureUrl ? (
                  <img
                    src={creator.profilePictureUrl}
                    alt={creator.displayName ?? creator.username ?? 'Creator'}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-white/10 mb-3"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold text-gray-900 dark:text-white mb-3">
                    {(creator.displayName ?? creator.username ?? 'C')[0]?.toUpperCase()}
                  </div>
                )}

                {/* Name */}
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-full">
                  {creator.displayName ?? creator.username ?? 'Creator'}
                </h3>
                {creator.username && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">@{creator.username}</p>
                )}

                {/* Niche badge */}
                {creator.niche && (
                  <div className="mt-2">
                    <DashBadge variant="info">{creator.niche}</DashBadge>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-white/5 w-full justify-center text-xs text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <p className="font-medium text-gray-900 dark:text-white">{formatCount(creator.followerCount)}</p>
                    <p>Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-900 dark:text-white">{formatCount(creator.mediaCount)}</p>
                    <p>Posts</p>
                  </div>
                </div>
              </DashCard>
            ))}
          </div>
        </>
        )
      })()}
    </div>
  )
}
