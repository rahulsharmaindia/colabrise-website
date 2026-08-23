import { apiClient } from '../lib/api-client'

// ── Types ─────────────────────────────────────────────────────

export interface CreatorProfile {
  id?: string | null
  name?: string | null
  displayName?: string | null
  display_name?: string | null
  username?: string | null
  bio?: string | null
  biography?: string | null
  profilePictureUrl?: string | null
  profile_picture_url?: string | null
  followerCount?: number | null
  followers_count?: number | null
  followsCount?: number | null
  follows_count?: number | null
  mediaCount?: number | null
  media_count?: number | null
  niche?: string | null
  niches?: string[]
  instagramHandle?: string | null
  contactNumber?: string | null
  contact_number?: string | null
  email?: string | null
  emailVerificationStatus?: 'verified' | 'unverified' | null
  email_verification_status?: 'verified' | 'unverified' | null
  contactVerificationStatus?: 'verified' | 'unverified' | null
  contact_verification_status?: 'verified' | 'unverified' | null
  accountType?: string | null
  account_type?: string | null
  pricePerReel?: number | null
  price_per_reel?: number | null
  pricePerPost?: number | null
  price_per_post?: number | null
  pricePerStory?: number | null
  price_per_story?: number | null
  priceAdRights15Days?: number | null
  price_ad_rights_15_days?: number | null
}

/** Normalize server response to consistent camelCase profile */
export function normalizeProfile(raw: CreatorProfile): CreatorProfile {
  return {
    ...raw,
    displayName: raw.displayName ?? raw.display_name ?? raw.name ?? null,
    username: raw.username ?? null,
    bio: raw.bio ?? raw.biography ?? null,
    profilePictureUrl: raw.profilePictureUrl ?? raw.profile_picture_url ?? null,
    followerCount: raw.followerCount ?? raw.followers_count ?? 0,
    followsCount: raw.followsCount ?? raw.follows_count ?? 0,
    mediaCount: raw.mediaCount ?? raw.media_count ?? 0,
    niche: raw.niche ?? null,
    instagramHandle: raw.instagramHandle ?? (raw as Record<string, unknown>).instagram_handle as string ?? null,
    contactNumber: raw.contactNumber ?? raw.contact_number ?? null,
    emailVerificationStatus: raw.emailVerificationStatus ?? raw.email_verification_status ?? null,
    contactVerificationStatus: raw.contactVerificationStatus ?? raw.contact_verification_status ?? null,
    accountType: raw.accountType ?? raw.account_type ?? null,
    pricePerReel: raw.pricePerReel ?? raw.price_per_reel ?? null,
    pricePerPost: raw.pricePerPost ?? raw.price_per_post ?? null,
    pricePerStory: raw.pricePerStory ?? raw.price_per_story ?? null,
    priceAdRights15Days: raw.priceAdRights15Days ?? raw.price_ad_rights_15_days ?? null,
  }
}

export interface MediaItem {
  id: string
  mediaType: string
  thumbnailUrl?: string | null
  permalink?: string | null
  caption?: string | null
  likeCount?: number
  commentsCount?: number
}

export interface UpdateCreatorProfilePayload {
  displayName?: string
  bio?: string
  niche?: string
  instagramHandle?: string
  contactNumber?: string
  pricePerReel?: number
  pricePerPost?: number
  pricePerStory?: number
  priceAdRights15Days?: number
}

export interface CampaignStats {
  active: number
  completed: number
  applied: number
  rejected: number
}

export type CreatorCampaignFilter = 'all' | 'active' | 'completed' | 'applied'

export interface CreatorCampaign {
  campaignId: string
  title: string
  status: string
  description?: string | null
  brandName?: string | null
  totalBudget?: number | null
  budgetPerCreator?: number | null
  totalSlots: number
  approvedCount: number
  startDate?: string | null
  endDate?: string | null
  applicationDeadline?: string | null
  preferredNiche?: string | null
  applicationStatus?: string | null // pending | approved | rejected | null (not applied)
}

export interface DiscoverBrand {
  businessId: string
  name: string
  industry: string
  logo?: string | null
  website?: string | null
  description?: string | null
  campaignCount?: number
  isFollowing?: boolean
}

export interface ContentSubmission {
  campaignId: string
  contentUrl: string
  caption?: string
  notes?: string
}

// ── Creator Profile ───────────────────────────────────────────

/** Fetch the authenticated creator's full profile from /api/profile */
export async function getCreatorProfile(): Promise<CreatorProfile> {
  const { data } = await apiClient.get('/api/profile')
  return normalizeProfile((data as CreatorProfile) ?? ({} as CreatorProfile))
}

/** Fetch creator's media/reels */
export async function getCreatorMedia(): Promise<MediaItem[]> {
  const { data } = await apiClient.get('/api/media')
  if (Array.isArray(data)) return data as MediaItem[]
  return []
}

/** Fetch creator niches */
export async function getCreatorNiches(): Promise<string[]> {
  const { data } = await apiClient.get('/api/profile/niches')
  if (Array.isArray(data)) return data as string[]
  if (data && typeof data === 'object' && 'niches' in data) {
    return (data as { niches: string[] }).niches
  }
  return []
}

/** Update creator niches */
export async function updateCreatorNiches(niches: string[]): Promise<void> {
  await apiClient.patch('/api/profile/niches', { niches })
}

/** Update creator profile fields */
export async function updateCreatorProfile(
  payload: UpdateCreatorProfilePayload,
): Promise<CreatorProfile> {
  const { data } = await apiClient.patch<CreatorProfile>('/api/account/profile', payload)
  return data
}

// ── Campaign Stats ────────────────────────────────────────────

/** Get creator campaign summary stats — computed from my-campaigns data */
export async function getCreatorCampaignStats(): Promise<CampaignStats> {
  try {
    const { data } = await apiClient.get('/api/my-campaigns')
    const allMy: CreatorCampaign[] = Array.isArray(data) ? data as CreatorCampaign[] : []

    let active = 0
    let completed = 0
    let applied = 0
    let rejected = 0

    for (const c of allMy) {
      const appStatus = (c.applicationStatus ?? '').toLowerCase()
      const campStatus = (c.status ?? '').toLowerCase()

      if (appStatus === 'rejected') {
        rejected++
      } else if (campStatus === 'completed' || campStatus === 'archived') {
        completed++
      } else if (appStatus === 'approved') {
        active++
      } else if (appStatus === 'pending') {
        applied++
      }
    }

    return { active, completed, applied, rejected }
  } catch {
    return { active: 0, completed: 0, applied: 0, rejected: 0 }
  }
}

// ── Campaigns ─────────────────────────────────────────────────

/** Get marketplace campaigns with optional filter for creator view.
 *
 * - `all`: Marketplace campaigns (Published/Active) the creator can browse.
 * - `active`: Campaigns where the creator's application is Approved and
 *   the campaign is still running (not completed/archived/cancelled).
 * - `completed`: Campaigns the creator applied to that are now Completed or Archived.
 * - `applied`: Campaigns where the creator's application is Pending and
 *   the campaign is still running.
 */
export async function getCreatorCampaigns(params?: {
  filter?: CreatorCampaignFilter
  search?: string
  niche?: string
  limit?: number
}): Promise<CreatorCampaign[]> {
  const filter = params?.filter ?? 'all'

  // For active/completed/applied tabs, use /api/my-campaigns which returns
  // campaigns the creator has applied to, enriched with applicationStatus.
  if (filter === 'active' || filter === 'completed' || filter === 'applied') {
    const { data } = await apiClient.get('/api/my-campaigns')
    const allMy: CreatorCampaign[] = Array.isArray(data) ? data as CreatorCampaign[] : []

    let filtered: CreatorCampaign[]
    if (filter === 'applied') {
      // Pending applications on campaigns that are still running
      filtered = allMy.filter((c) => {
        const appStatus = (c.applicationStatus ?? '').toLowerCase()
        const campStatus = (c.status ?? '').toLowerCase()
        return appStatus === 'pending' &&
          campStatus !== 'completed' &&
          campStatus !== 'archived' &&
          campStatus !== 'cancelled'
      })
    } else if (filter === 'active') {
      // Approved applications on campaigns that are still running
      filtered = allMy.filter((c) => {
        const appStatus = (c.applicationStatus ?? '').toLowerCase()
        const campStatus = (c.status ?? '').toLowerCase()
        return appStatus === 'approved' &&
          campStatus !== 'completed' &&
          campStatus !== 'archived' &&
          campStatus !== 'cancelled'
      })
    } else {
      // Completed: campaigns that are done (regardless of application status)
      filtered = allMy.filter((c) => {
        const campStatus = (c.status ?? '').toLowerCase()
        return campStatus === 'completed' || campStatus === 'archived'
      })
    }

    // Apply client-side search if provided
    if (params?.search) {
      const q = params.search.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          (c.title ?? '').toLowerCase().includes(q) ||
          (c.brandName ?? '').toLowerCase().includes(q) ||
          (c.preferredNiche ?? '').toLowerCase().includes(q),
      )
    }

    return filtered
  }

  // For 'all' tab, use the marketplace endpoint + enrich with application status
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.search) searchParams.set('search', params.search)
  if (params?.niche) searchParams.set('niche', params.niche)

  const qs = searchParams.toString()
  const url = `/api/marketplace/campaigns${qs ? `?${qs}` : ''}`
  const [marketRes, myRes] = await Promise.all([
    apiClient.get(url),
    apiClient.get('/api/my-campaigns').catch(() => ({ data: [] })),
  ])

  let campaigns: CreatorCampaign[]
  if (marketRes.data && typeof marketRes.data === 'object' && 'items' in marketRes.data) {
    campaigns = (marketRes.data as { items: CreatorCampaign[] }).items
  } else if (Array.isArray(marketRes.data)) {
    campaigns = marketRes.data as CreatorCampaign[]
  } else {
    campaigns = []
  }

  // Build a lookup of application statuses from my-campaigns
  const myData = Array.isArray(myRes.data) ? myRes.data as CreatorCampaign[] : []
  const appStatusMap = new Map<string, string>()
  for (const c of myData) {
    if (c.campaignId && c.applicationStatus) {
      appStatusMap.set(c.campaignId, c.applicationStatus)
    }
  }

  // Merge application status into marketplace campaigns
  return campaigns.map((c) => ({
    ...c,
    applicationStatus: c.applicationStatus ?? appStatusMap.get(c.campaignId) ?? null,
  }))
}

/** Apply for a campaign. POST /api/campaigns/:id/applications */
export async function applyForCampaign(campaignId: string): Promise<void> {
  await apiClient.post(`/api/campaigns/${campaignId}/applications`, {})
}

/** Check creator's existing application for a campaign */
export async function getMyApplication(campaignId: string): Promise<{ applicationId?: string; status?: string } | null> {
  try {
    const { data } = await apiClient.get(`/api/campaigns/${campaignId}/my-application`)
    return data as { applicationId?: string; status?: string } | null
  } catch {
    return null
  }
}

/** Submit content for an approved campaign. POST /api/campaigns/:id/submissions */
export async function submitCampaignContent(submission: ContentSubmission): Promise<void> {
  await apiClient.post(`/api/campaigns/${submission.campaignId}/submissions`, {
    contentUrl: submission.contentUrl,
    contentCaption: submission.caption ?? '',
    notesToBrand: submission.notes ?? undefined,
  })
}

/** Get creator's submissions for a campaign */
export async function getMySubmissions(campaignId: string): Promise<unknown[]> {
  try {
    const { data } = await apiClient.get(`/api/campaigns/${campaignId}/my-submissions`)
    if (Array.isArray(data)) return data
    if (data && typeof data === 'object' && 'submissions' in data) {
      return (data as { submissions: unknown[] }).submissions
    }
    return []
  } catch {
    return []
  }
}

// ── Brands Follow/Unfollow ────────────────────────────────────

/** Get list of followed brand businessIds */
export async function getFollowedBrands(): Promise<Set<string>> {
  try {
    const { data } = await apiClient.get('/api/follows/brands')
    if (Array.isArray(data)) {
      return new Set(data.map((b: { businessId?: string }) => b.businessId ?? '').filter(Boolean))
    }
    return new Set()
  } catch {
    return new Set()
  }
}

/** Get brands with follow status */
export async function getDiscoverBrands(params?: {
  query?: string
  industry?: string
  limit?: number
}): Promise<DiscoverBrand[]> {
  const searchParams = new URLSearchParams()
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.query) searchParams.set('query', params.query)
  if (params?.industry) searchParams.set('industry', params.industry)

  const qs = searchParams.toString()
  const url = `/api/marketplace/brands${qs ? `?${qs}` : ''}`
  const { data } = await apiClient.get(url)

  if (data && typeof data === 'object' && 'items' in data) {
    return (data as { items: DiscoverBrand[] }).items
  }
  if (Array.isArray(data)) return data as DiscoverBrand[]
  return []
}

/** Follow a brand. POST /api/follows/brands with { businessId } */
export async function followBrand(businessId: string): Promise<void> {
  await apiClient.post('/api/follows/brands', { businessId })
}

/** Unfollow a brand. DELETE /api/follows/brands/:businessId */
export async function unfollowBrand(businessId: string): Promise<void> {
  await apiClient.delete(`/api/follows/brands/${encodeURIComponent(businessId)}`)
}
