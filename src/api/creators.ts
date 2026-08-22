import { apiClient } from '../lib/api-client'

// ── Types ─────────────────────────────────────────────────────

export interface CreatorProfile {
  id: string
  userId: string
  username?: string | null
  displayName?: string | null
  bio?: string | null
  profilePictureUrl?: string | null
  followerCount: number
  followsCount: number
  mediaCount: number
  niche?: string | null
}

export interface PaginatedCreators {
  items: CreatorProfile[]
  page: number
  total: number
  hasMore: boolean
}

// ── Brand-side creator search ─────────────────────────────────

/** Search creators (brand-side). GET /api/creators/search */
export async function searchCreators(params?: {
  query?: string
  niche?: string
  page?: number
  limit?: number
}): Promise<CreatorProfile[]> {
  const searchParams = new URLSearchParams()
  if (params?.query) searchParams.set('query', params.query)
  if (params?.niche) searchParams.set('niche', params.niche)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))

  const qs = searchParams.toString()
  const url = `/api/creators/search${qs ? `?${qs}` : ''}`
  const { data } = await apiClient.get(url)

  // Server may return paginated { items: [...] } or a plain list
  if (data && typeof data === 'object' && 'items' in data) {
    return (data as PaginatedCreators).items
  }
  if (Array.isArray(data)) {
    return data as CreatorProfile[]
  }
  return []
}

// ── Marketplace brand search (for brands page listing all brands) ──

export interface MarketplaceBrand {
  businessId: string
  name: string
  industry: string
  logo?: string | null
  website?: string | null
  description?: string | null
  campaignCount?: number
}

export interface PaginatedBrands {
  items: MarketplaceBrand[]
  page: number
  total: number
  hasMore: boolean
}

/** Search brands (marketplace endpoint). GET /api/marketplace/brands */
export async function searchBrands(params?: {
  query?: string
  industry?: string
  page?: number
  limit?: number
}): Promise<MarketplaceBrand[]> {
  const searchParams = new URLSearchParams()
  if (params?.query) searchParams.set('query', params.query)
  if (params?.industry) searchParams.set('industry', params.industry)
  if (params?.page) searchParams.set('page', String(params.page))
  if (params?.limit) searchParams.set('limit', String(params.limit))

  const qs = searchParams.toString()
  const url = `/api/marketplace/brands${qs ? `?${qs}` : ''}`
  const { data } = await apiClient.get(url)

  if (data && typeof data === 'object' && 'items' in data) {
    return (data as PaginatedBrands).items
  }
  if (Array.isArray(data)) {
    return data as MarketplaceBrand[]
  }
  return []
}
