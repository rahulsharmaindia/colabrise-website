import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Megaphone, Calendar, Users, DollarSign, Loader2, RefreshCw, Target, Film, IndianRupee, Handshake, Percent, Gift, Clapperboard, BookOpen, Image, Share2 } from 'lucide-react'
import { DashCard, DashButton, DashBadge, EmptyState } from '../../components/ui'
import { listBrandCampaigns, type Campaign, type CampaignStatus } from '../../../api/campaigns'
import { getErrorMessage } from '../../../lib/api-client'
import { BrandCampaignDetailPage } from './BrandCampaignDetailPage'
import { CampaignFormPage } from './CampaignFormPage'
import { useSearchFilter, matchesSearch } from '../../hooks/useSearchFilter'

const statusVariant: Record<CampaignStatus, 'success' | 'info' | 'warning' | 'default' | 'error'> = {
  active: 'success',
  published: 'info',
  completed: 'info',
  draft: 'default',
  cancelled: 'error',
  archived: 'warning',
}

type FilterTab = 'all' | 'active' | 'upcoming' | 'draft' | 'expired'

function isUpcoming(campaign: Campaign): boolean {
  if (campaign.status !== 'published') return false
  if (!campaign.startDate) return true
  return new Date(campaign.startDate) > new Date()
}

function isExpired(campaign: Campaign): boolean {
  if (campaign.status === 'draft') return false
  if (campaign.status === 'completed' || campaign.status === 'cancelled' || campaign.status === 'archived') return true
  if (campaign.endDate && campaign.endDate.trim() && !isNaN(new Date(campaign.endDate).getTime()) && new Date(campaign.endDate) < new Date()) return true
  if (campaign.applicationDeadline && campaign.applicationDeadline.trim() && !isNaN(new Date(campaign.applicationDeadline).getTime()) && new Date(campaign.applicationDeadline) < new Date() && campaign.status !== 'active') return true
  return false
}

function formatBudget(amount?: number | null): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

// ── Share a campaign via the OG preview link ─────────────────

function shareCampaign(campaign: Campaign): void {
  const raw = campaign as unknown as Record<string, unknown>
  const params = new URLSearchParams()
  params.set('id', campaign.campaignId)
  params.set('t', campaign.title.slice(0, 40))
  const brandName = (raw.brandName as string) || ''
  if (brandName) params.set('b', brandName.slice(0, 25))
  if (campaign.budgetPerCreator) params.set('p', String(campaign.budgetPerCreator))
  if (campaign.preferredNiche) params.set('n', campaign.preferredNiche)
  if (campaign.paymentModel) params.set('pm', campaign.paymentModel)
  if (campaign.minimumFollowers) {
    const f = Number(campaign.minimumFollowers)
    params.set('f', f >= 1000 ? `${(f / 1000).toFixed(0)}K+` : `${f}+`)
  }
  const d = getDeliverables(campaign)
  if (d) {
    const dparts: string[] = []
    if (d.reels > 0) dparts.push(`${d.reels} ${d.reels === 1 ? 'Reel' : 'Reels'}`)
    if (d.stories > 0) dparts.push(`${d.stories} ${d.stories === 1 ? 'Story' : 'Stories'}`)
    if (d.posts > 0) dparts.push(`${d.posts} ${d.posts === 1 ? 'Post' : 'Posts'}`)
    if (dparts.length > 0) params.set('dl', dparts.join(' + ').slice(0, 25))
  }
  params.set('app', String(campaign.approvedCount))
  const shareUrl = `${window.location.origin}/api/og?${params.toString()}`
  if (navigator.share) {
    navigator.share({ title: campaign.title, url: shareUrl })
  } else {
    navigator.clipboard.writeText(shareUrl)
  }
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

// ── Niche color mapping ──────────────────────────────────────

const NICHE_COLORS: Record<string, { pill: string; bg: string }> = {
  beauty: { pill: 'bg-pink-500/15 text-pink-400', bg: '!border-[3px] !border-pink-500/50' },
  fashion: { pill: 'bg-fuchsia-500/15 text-fuchsia-400', bg: '!border-[3px] !border-fuchsia-500/50' },
  fitness: { pill: 'bg-orange-500/15 text-orange-400', bg: '!border-[3px] !border-orange-500/50' },
  'health & fitness': { pill: 'bg-orange-500/15 text-orange-400', bg: '!border-[3px] !border-orange-500/50' },
  food: { pill: 'bg-amber-500/15 text-amber-400', bg: '!border-[3px] !border-amber-500/50' },
  'food & beverage': { pill: 'bg-amber-500/15 text-amber-400', bg: '!border-[3px] !border-amber-500/50' },
  tech: { pill: 'bg-blue-500/15 text-blue-400', bg: '!border-[3px] !border-blue-500/50' },
  technology: { pill: 'bg-blue-500/15 text-blue-400', bg: '!border-[3px] !border-blue-500/50' },
  travel: { pill: 'bg-emerald-500/15 text-emerald-400', bg: '!border-[3px] !border-emerald-500/50' },
  entertainment: { pill: 'bg-violet-500/15 text-violet-400', bg: '!border-[3px] !border-violet-500/50' },
  education: { pill: 'bg-sky-500/15 text-sky-400', bg: '!border-[3px] !border-sky-500/50' },
  finance: { pill: 'bg-green-500/15 text-green-400', bg: '!border-[3px] !border-green-500/50' },
  lifestyle: { pill: 'bg-rose-500/15 text-rose-400', bg: '!border-[3px] !border-rose-500/50' },
  gaming: { pill: 'bg-indigo-500/15 text-indigo-400', bg: '!border-[3px] !border-indigo-500/50' },
}

function getNicheStyle(niche?: string | null) {
  if (!niche) return { pill: 'bg-cyan-500/10 text-cyan-400', bg: '' }
  const key = niche.toLowerCase()
  return NICHE_COLORS[key] ?? { pill: 'bg-cyan-500/10 text-cyan-400', bg: '!border-[3px] !border-cyan-500/40' }
}

// ── Payment model icon ───────────────────────────────────────

function PaymentIcon({ model }: { model?: string | null }) {
  if (!model) return null
  const lower = model.toLowerCase()
  if (lower === 'fixed' || lower === 'flat') return <IndianRupee className="w-2.5 h-2.5" />
  if (lower === 'commission') return <Percent className="w-2.5 h-2.5" />
  if (lower === 'barter') return <Gift className="w-2.5 h-2.5" />
  if (lower === 'hybrid') return <Handshake className="w-2.5 h-2.5" />
  return <IndianRupee className="w-2.5 h-2.5" />
}

// ── Deliverables from raw campaign data ──────────────────────

function getDeliverables(campaign: Campaign): { reels: number; stories: number; posts: number } | null {
  const raw = campaign as unknown as Record<string, unknown>
  const d = raw.deliverables
  if (!d || typeof d !== 'object') return null
  const obj = d as Record<string, number>
  if (obj.reels == null && obj.stories == null && obj.posts == null) return null
  return { reels: obj.reels ?? 0, stories: obj.stories ?? 0, posts: obj.posts ?? 0 }
}

export function BrandCampaignsPage() {
  const { campaignId: urlCampaignId } = useParams<{ campaignId?: string }>()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterTab>('all')
  const [selectedId, setSelectedId] = useState<string | null>(urlCampaignId ?? null)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Record<string, unknown> | null>(null)
  const { query: searchQuery } = useSearchFilter()

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listBrandCampaigns()
      setCampaigns(data)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns])

  const stats = useMemo(() => {
    const total = campaigns.length
    const active = campaigns.filter((c) => c.status === 'active').length
    const upcoming = campaigns.filter(isUpcoming).length
    const drafts = campaigns.filter((c) => c.status === 'draft').length
    return { total, active, upcoming, drafts }
  }, [campaigns])

  const filtered = useMemo(() => {
    let list = campaigns
    switch (filter) {
      case 'active': list = campaigns.filter((c) => c.status === 'active'); break
      case 'upcoming': list = campaigns.filter(isUpcoming); break
      case 'draft': list = campaigns.filter((c) => c.status === 'draft'); break
      case 'expired': list = campaigns.filter(isExpired); break
    }
    if (searchQuery.trim()) {
      list = list.filter((c) => matchesSearch(
        searchQuery,
        c.title, c.description, c.preferredNiche, c.platform, c.paymentModel, c.objective, c.campaignType, c.status,
      ))
    }
    return list
  }, [campaigns, filter, searchQuery])

  // ── Create/Edit form ─────────────────────────────────────────
  if (creating) {
    return (
      <CampaignFormPage
        onBack={() => { setCreating(false); fetchCampaigns() }}
        initialData={editingData}
      />
    )
  }

  if (editingId) {
    return (
      <CampaignFormPage
        editingCampaignId={editingId}
        initialData={editingData}
        onBack={() => { setEditingId(null); setEditingData(null); fetchCampaigns() }}
      />
    )
  }

  // ── Detail view ────────────────────────────────────────────
  if (selectedId) {
    return (
      <BrandCampaignDetailPage
        campaignId={selectedId}
        onBack={() => { setSelectedId(null); fetchCampaigns() }}
        onEdit={(id, data) => { setSelectedId(null); setEditingId(id); setEditingData(data) }}
        onDuplicate={(data) => { setSelectedId(null); setEditingData(data); setCreating(true) }}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Campaigns</h1>
        <DashCard>
          <p className="text-red-400 text-sm">{error}</p>
          <DashButton className="mt-4" size="sm" onClick={fetchCampaigns}>Retry</DashButton>
        </DashCard>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage all your campaigns.</p>
        </div>
        <div className="flex items-center gap-2">
          <DashButton size="md" onClick={() => setCreating(true)}>
            + Create Campaign
          </DashButton>
          <DashButton variant="ghost" size="sm" onClick={fetchCampaigns}>
            <RefreshCw className="w-4 h-4" />
          </DashButton>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total" value={stats.total} icon={Megaphone} color="bg-purple-500/15 text-purple-400" bg="bg-purple-500/[0.06]" />
        <StatCard label="Active" value={stats.active} icon={Users} color="bg-emerald-500/15 text-emerald-400" bg="bg-emerald-500/[0.06]" />
        <StatCard label="Upcoming" value={stats.upcoming} icon={Calendar} color="bg-cyan-500/15 text-cyan-400" bg="bg-cyan-500/[0.06]" />
        <StatCard label="Drafts" value={stats.drafts} icon={DollarSign} color="bg-amber-500/15 text-amber-400" bg="bg-amber-500/[0.06]" />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-gray-100 dark:border-white/5 pb-px">
        {(['all', 'active', 'upcoming', 'draft', 'expired'] as FilterTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors capitalize ${
              filter === tab
                ? 'text-purple-400 bg-purple-500/10 border-b-2 border-purple-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Campaign grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-10 h-10" />}
          title={filter === 'all' ? 'No campaigns yet' : `No ${filter} campaigns`}
          description={filter === 'all' ? 'Create your first campaign in the mobile app to see it here.' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((campaign) => {
            const nicheStyle = getNicheStyle(campaign.preferredNiche)
            const deliverables = getDeliverables(campaign)
            return (
              <DashCard
                key={campaign.campaignId}
                className={`flex flex-col cursor-pointer hover:border-purple-500/30 transition-colors ${nicheStyle.bg}`}
              >
                <button
                  className="flex flex-col flex-1 text-left w-full"
                  onClick={() => setSelectedId(campaign.campaignId)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2 w-full">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{campaign.title}</h3>
                      {campaign.platform && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">{campaign.platform}</p>
                      )}
                    </div>
                    {isExpired(campaign) ? (
                      <span className="inline-flex items-center text-[10px] bg-red-500/15 text-red-400 px-2.5 py-0.5 rounded-full font-medium">
                        Expired
                      </span>
                    ) : (
                      <DashBadge variant={statusVariant[campaign.status]}>
                        {campaign.status}
                      </DashBadge>
                    )}
                  </div>

                  {/* Description */}
                  {campaign.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{campaign.description}</p>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {campaign.preferredNiche && (
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${nicheStyle.pill}`}>
                        <Target className="w-2.5 h-2.5" />
                        {campaign.preferredNiche}
                      </span>
                    )}
                    {campaign.paymentModel && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
                        <PaymentIcon model={campaign.paymentModel} />
                        {campaign.paymentModel}
                      </span>
                    )}
                  </div>

                  {/* Deliverables */}
                  {deliverables && (
                    <div className="flex items-center gap-3 mb-2 text-[11px] text-gray-400 dark:text-gray-500">
                      {deliverables.reels > 0 && (
                        <span className="flex items-center gap-1">
                          <Clapperboard className="w-3 h-3 text-purple-400" />
                          {deliverables.reels} Reel{deliverables.reels > 1 ? 's' : ''}
                        </span>
                      )}
                      {deliverables.stories > 0 && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 text-cyan-400" />
                          {deliverables.stories} Stor{deliverables.stories > 1 ? 'ies' : 'y'}
                        </span>
                      )}
                      {deliverables.posts > 0 && (
                        <span className="flex items-center gap-1">
                          <Image className="w-3 h-3 text-emerald-400" />
                          {deliverables.posts} Post{deliverables.posts > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex-1" />

                  {/* Footer stats */}
                  <div className="flex items-center gap-3 mt-2 pt-3 border-t border-gray-100 dark:border-white/5 text-xs text-gray-400 dark:text-gray-500 w-full">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(campaign.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {campaign.approvedCount}/{campaign.totalSlots}
                    </span>
                    <span className="ml-auto flex items-center gap-0.5 font-medium text-gray-700 dark:text-gray-300">
                      <IndianRupee className="w-3 h-3" />
                      {campaign.budgetPerCreator != null ? new Intl.NumberFormat('en-IN').format(campaign.budgetPerCreator) : '—'}
                    </span>
                  </div>
                </button>

                {/* Share button — outside the clickable area to avoid nested buttons */}
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      shareCampaign(campaign)
                    }}
                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gray-400 hover:text-purple-400 transition-colors px-2 py-1 rounded-lg hover:bg-purple-500/5"
                    title="Share campaign"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share
                  </button>
                </div>
              </DashCard>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Stat card helper ─────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  bg?: string
}) {
  return (
    <DashCard className={bg}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </DashCard>
  )
}
