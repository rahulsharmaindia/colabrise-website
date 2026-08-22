import { apiClient } from '../lib/api-client'

// ── Types ─────────────────────────────────────────────────────

export type CampaignStatus =
  | 'draft'
  | 'published'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'archived'

export interface Campaign {
  campaignId: string
  title: string
  status: CampaignStatus
  description?: string | null
  objective?: string | null
  campaignType?: string | null
  platform?: string | null
  totalBudget?: number | null
  budgetPerCreator?: number | null
  paymentModel?: string | null
  totalSlots: number
  approvedCount: number
  startDate?: string | null
  endDate?: string | null
  applicationDeadline?: string | null
  preferredNiche?: string | null
  minimumFollowers?: number | null
  referenceVideoUrl?: string | null
  additionalReferenceLinks?: string[]
}

export interface PaginatedCampaigns {
  items: Campaign[]
  page: number
  total: number
  hasMore: boolean
}

// ── Brand-side endpoints ──────────────────────────────────────

/** Normalize campaign status from server (e.g. "Draft" → "draft") */
function normalizeCampaign(c: Campaign): Campaign {
  return { ...c, status: (c.status?.toLowerCase() ?? 'draft') as CampaignStatus }
}

/** List all campaigns for the authenticated brand. GET /api/campaigns */
export async function listBrandCampaigns(): Promise<Campaign[]> {
  const { data } = await apiClient.get<Campaign[]>('/api/campaigns')
  return (data ?? []).map(normalizeCampaign)
}

/** Get a single campaign by ID. GET /api/campaigns/:id */
export async function getCampaign(campaignId: string): Promise<Campaign> {
  const { data } = await apiClient.get<Campaign>(`/api/campaigns/${campaignId}`)
  return normalizeCampaign(data)
}

/** Create a new campaign. POST /api/campaigns */
export async function createCampaign(payload: Partial<Campaign>): Promise<Campaign> {
  const { data } = await apiClient.post<Campaign>('/api/campaigns', payload)
  return data
}

/** Full update of a campaign. PUT /api/campaigns/:id */
export async function updateCampaign(
  campaignId: string,
  payload: Partial<Campaign>,
): Promise<Campaign> {
  const { data } = await apiClient.put<Campaign>(`/api/campaigns/${campaignId}`, payload)
  return data
}

/** Update campaign status. PATCH /api/campaigns/:id/status */
export async function updateCampaignStatus(
  campaignId: string,
  status: CampaignStatus,
): Promise<void> {
  await apiClient.patch(`/api/campaigns/${campaignId}/status`, { status })
}

/** Duplicate a campaign as a new draft. POST /api/campaigns/:id/duplicate */
export async function duplicateCampaign(campaignId: string): Promise<Campaign> {
  const { data } = await apiClient.post<Campaign>(`/api/campaigns/${campaignId}/duplicate`, {})
  return data
}

/** Delete an archived campaign. DELETE /api/campaigns/:id */
export async function deleteCampaign(campaignId: string): Promise<void> {
  await apiClient.delete(`/api/campaigns/${campaignId}`)
}
