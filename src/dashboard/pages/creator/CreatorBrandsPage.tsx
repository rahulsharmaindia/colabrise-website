import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Building2,
  ExternalLink,
  Search,
  Loader2,
  RefreshCw,
  UserPlus,
  UserMinus,
  Megaphone,
} from 'lucide-react'
import { DashCard, DashButton, EmptyState } from '../../components/ui'
import { getErrorMessage } from '../../../lib/api-client'
import {
  getDiscoverBrands,
  getFollowedBrands,
  followBrand,
  unfollowBrand,
  type DiscoverBrand,
} from '../../../api/creator-dashboard'

type FilterTab = 'all' | 'following'

export function CreatorBrandsPage() {
  const [brands, setBrands] = useState<DiscoverBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [industry, setIndustry] = useState('')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchBrands = useCallback(async (q?: string, ind?: string) => {
    setLoading(true)
    setError(null)
    try {
      const [data, followedSet] = await Promise.all([
        getDiscoverBrands({
          query: q ?? query,
          industry: ind ?? industry,
          limit: 50,
        }),
        getFollowedBrands(),
      ])
      setBrands(data)
      setFollowingIds(followedSet)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [query, industry])

  useEffect(() => {
    fetchBrands('', '')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchBrands(value, industry)
    }, 400)
  }

  const handleIndustryChange = (value: string) => {
    setIndustry(value)
    fetchBrands(query, value)
  }

  const handleToggleFollow = async (businessId: string) => {
    const isCurrentlyFollowing = followingIds.has(businessId)
    setTogglingIds((prev) => new Set(prev).add(businessId))

    try {
      if (isCurrentlyFollowing) {
        await unfollowBrand(businessId)
        setFollowingIds((prev) => {
          const next = new Set(prev)
          next.delete(businessId)
          return next
        })
      } else {
        await followBrand(businessId)
        setFollowingIds((prev) => new Set(prev).add(businessId))
      }
    } catch {
      // Revert on error — keep current state
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(businessId)
        return next
      })
    }
  }

  const filteredBrands =
    activeTab === 'following'
      ? brands.filter((b) => followingIds.has(b.businessId))
      : brands

  if (loading && brands.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (error && brands.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Discover Brands</h1>
        <DashCard>
          <p className="text-red-400 text-sm">{error}</p>
          <DashButton className="mt-4" size="sm" onClick={() => fetchBrands()}>
            Retry
          </DashButton>
        </DashCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Discover Brands</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Find and follow brands to stay updated on new campaigns.
          </p>
        </div>
        <DashButton variant="ghost" size="sm" onClick={() => fetchBrands()}>
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
            placeholder="Search brands by name..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
        </div>
        <select
          value={industry}
          onChange={(e) => handleIndustryChange(e.target.value)}
          className="sm:w-48 px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        >
          <option value="">All Industries</option>
          <option value="Beauty">Beauty</option>
          <option value="Fashion">Fashion</option>
          <option value="Fitness">Fitness</option>
          <option value="Food">Food & Beverage</option>
          <option value="Tech">Technology</option>
          <option value="Travel">Travel</option>
          <option value="Health">Health & Wellness</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Education">Education</option>
          <option value="Finance">Finance</option>
        </select>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeTab === 'following'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-gray-100 dark:bg-white/5 text-emerald-400 border border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'
          }`}
        >
          Following
          {followingIds.size > 0 && (
            <span className="ml-1.5 text-[10px] opacity-80">({followingIds.size})</span>
          )}
        </button>
      </div>

      {/* Empty */}
      {filteredBrands.length === 0 && !loading && (
        <EmptyState
          icon={<Building2 className="w-10 h-10" />}
          title={activeTab === 'following' ? 'No followed brands' : 'No brands found'}
          description={
            activeTab === 'following'
              ? 'You haven\'t followed any brands yet. Switch to "All" to discover brands.'
              : query || industry
                ? 'Try adjusting your search or filter.'
                : 'No brands available yet. Check back later!'
          }
        />
      )}

      {/* Brand Cards Grid */}
      {filteredBrands.length > 0 && (
        <>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''}{' '}
            {activeTab === 'following' ? 'followed' : 'available'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBrands.map((brand) => {
              const isFollowing = followingIds.has(brand.businessId)
              const isToggling = togglingIds.has(brand.businessId)

              return (
                <DashCard key={brand.businessId} className="flex flex-col">
                  {/* Brand header */}
                  <div className="flex items-start gap-3 mb-3">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-base font-semibold text-white shrink-0">
                        {brand.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {brand.name}
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{brand.industry}</p>
                    </div>
                  </div>

                  {/* Description */}
                  {brand.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                      {brand.description}
                    </p>
                  )}

                  <div className="flex-1" />

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                      {brand.campaignCount != null && (
                        <span className="flex items-center gap-1">
                          <Megaphone className="w-3.5 h-3.5" />
                          {brand.campaignCount} campaign{brand.campaignCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      {brand.website && (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Website
                        </a>
                      )}
                    </div>

                    {/* Follow/Unfollow button */}
                    <button
                      onClick={() => handleToggleFollow(brand.businessId)}
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isFollowing
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/20 hover:bg-purple-500/25'
                      }`}
                      aria-label={isFollowing ? `Unfollow ${brand.name}` : `Follow ${brand.name}`}
                    >
                      {isToggling ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isFollowing ? (
                        <UserMinus className="w-3 h-3" />
                      ) : (
                        <UserPlus className="w-3 h-3" />
                      )}
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </DashCard>
              )
            })}
          </div>
        </>
      )}

      {loading && brands.length > 0 && (
        <div className="flex justify-center">
          <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
        </div>
      )}
    </div>
  )
}
