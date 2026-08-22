import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Megaphone,
  Calendar,
  Users,
  Search,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  X,
  Upload,
  Target,
  IndianRupee,
  Percent,
  Gift,
  Handshake,
  Clapperboard,
  BookOpen,
  Image,
} from 'lucide-react'
import { DashCard, DashButton, DashBadge, EmptyState } from '../../components/ui'
import { getErrorMessage } from '../../../lib/api-client'
import { CreatorCampaignDetailPage } from './CreatorCampaignDetailPage'
import {
  getCreatorCampaignStats,
  getCreatorCampaigns,
  applyForCampaign,
  submitCampaignContent,
  type CampaignStats,
  type CreatorCampaign,
  type CreatorCampaignFilter,
} from '../../../api/creator-dashboard'

// ── Helpers ──────────────────────────────────────────────────

const statusVariant: Record<string, 'success' | 'info' | 'warning' | 'default' | 'error'> = {
  active: 'success',
  published: 'info',
  completed: 'info',
  draft: 'default',
  cancelled: 'error',
  archived: 'warning',
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatBudget(amount?: number | null): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-IN').format(amount)
}

// ── Niche color mapping (same as brand page) ─────────────────

const NICHE_COLORS: Record<string, { pill: string; bg: string }> = {
  beauty: { pill: 'bg-pink-500/15 text-pink-400', bg: '!border-[3px] !border-pink-500/50' },
  fashion: { pill: 'bg-fuchsia-500/15 text-fuchsia-400', bg: '!border-[3px] !border-fuchsia-500/50' },
  fitness: { pill: 'bg-orange-500/15 text-orange-400', bg: '!border-[3px] !border-orange-500/50' },
  food: { pill: 'bg-amber-500/15 text-amber-400', bg: '!border-[3px] !border-amber-500/50' },
  tech: { pill: 'bg-blue-500/15 text-blue-400', bg: '!border-[3px] !border-blue-500/50' },
  technology: { pill: 'bg-blue-500/15 text-blue-400', bg: '!border-[3px] !border-blue-500/50' },
  travel: { pill: 'bg-emerald-500/15 text-emerald-400', bg: '!border-[3px] !border-emerald-500/50' },
  entertainment: { pill: 'bg-violet-500/15 text-violet-400', bg: '!border-[3px] !border-violet-500/50' },
  education: { pill: 'bg-sky-500/15 text-sky-400', bg: '!border-[3px] !border-sky-500/50' },
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

// ── Deliverables ─────────────────────────────────────────────

function getDeliverables(campaign: CreatorCampaign): { reels: number; stories: number; posts: number } | null {
  const raw = campaign as unknown as Record<string, unknown>
  const d = raw.deliverables
  if (!d || typeof d !== 'object') return null
  const obj = d as Record<string, number>
  if (obj.reels == null && obj.stories == null && obj.posts == null) return null
  return { reels: obj.reels ?? 0, stories: obj.stories ?? 0, posts: obj.posts ?? 0 }
}

// ── Filter tabs ──────────────────────────────────────────────

const FILTER_TABS: { key: CreatorCampaignFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'applied', label: 'Applied' },
  { key: 'approved', label: 'Approved' },
]

// ── Apply Modal ──────────────────────────────────────────────

function ApplyModal({
  campaign,
  onClose,
  onApplied,
}: {
  campaign: CreatorCampaign
  onClose: () => void
  onApplied: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApply = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await applyForCampaign(campaign.campaignId)
      onApplied()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-dark-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Apply for Campaign</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-5">
          <p className="text-sm text-white font-medium">{campaign.title}</p>
          {campaign.brandName && (
            <p className="text-xs text-gray-500 mt-0.5">by {campaign.brandName}</p>
          )}
          {campaign.description && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-3">{campaign.description}</p>
          )}
        </div>

        {/* Campaign quick info */}
        <div className="grid grid-cols-3 gap-3 mb-5 p-3 rounded-lg bg-white/5 border border-white/5">
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{formatBudget(campaign.budgetPerCreator)}</p>
            <p className="text-[10px] text-gray-500">Per Creator</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{campaign.totalSlots - campaign.approvedCount}</p>
            <p className="text-[10px] text-gray-500">Slots Left</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">{formatDate(campaign.applicationDeadline)}</p>
            <p className="text-[10px] text-gray-500">Deadline</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <DashButton onClick={handleApply} disabled={submitting} size="md" className="flex-1">
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {submitting ? 'Applying...' : 'Confirm Application'}
          </DashButton>
          <DashButton variant="ghost" size="md" onClick={onClose} disabled={submitting}>
            Cancel
          </DashButton>
        </div>

        <p className="text-[10px] text-gray-600 mt-3 text-center">
          Your profile will be shared with the brand for review.
        </p>
      </div>
    </div>
  )
}

// ── Submit Content Modal ─────────────────────────────────────

function SubmitContentModal({
  campaign,
  onClose,
  onSubmitted,
}: {
  campaign: CreatorCampaign
  onClose: () => void
  onSubmitted: () => void
}) {
  const [contentUrl, setContentUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!contentUrl.trim()) {
      setError('Please provide a link to your Instagram content.')
      return
    }
    // Validate URL
    try {
      const url = new URL(contentUrl)
      if (!url.hostname.includes('instagram.com')) {
        setError('Please provide a valid Instagram URL (e.g. https://instagram.com/reel/...)')
        return
      }
    } catch {
      setError('Please provide a valid URL (e.g. https://instagram.com/reel/...)')
      return
    }
    if (!caption.trim() || caption.trim().length < 3) {
      setError('Caption is required (minimum 3 characters).')
      return
    }
    if (caption.length > 2200) {
      setError('Caption must be 2200 characters or less.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await submitCampaignContent({
        campaignId: campaign.campaignId,
        contentUrl,
        caption,
        notes: notes || undefined,
      })
      onSubmitted()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-dark-800 p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Submit Content</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Campaign: <span className="text-white font-medium">{campaign.title}</span>
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Content URL */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Instagram Post URL *
            </label>
            <input
              type="url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://instagram.com/reel/..."
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
            <p className="text-[10px] text-gray-600 mt-1">Must be a public Instagram post/reel URL</p>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Post Caption *
            </label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Paste the exact caption you used on your post..."
              rows={4}
              maxLength={2200}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
            <p className="text-[10px] text-gray-600 mt-1">{caption.length}/2200</p>
          </div>

          {/* Notes to brand */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Notes to Brand (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context for the brand..."
              rows={2}
              maxLength={1000}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
            <p className="text-[10px] text-gray-600 mt-1">{notes.length}/1000</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <DashButton onClick={handleSubmit} disabled={submitting} size="md" className="flex-1">
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {submitting ? 'Submitting...' : 'Submit Content'}
          </DashButton>
          <DashButton variant="ghost" size="md" onClick={onClose} disabled={submitting}>
            Cancel
          </DashButton>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────

export function CreatorCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CreatorCampaign[]>([])
  const [stats, setStats] = useState<CampaignStats>({ active: 0, completed: 0, applied: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<CreatorCampaignFilter>('all')
  const [applyingCampaign, setApplyingCampaign] = useState<CreatorCampaign | null>(null)
  const [submittingCampaign, setSubmittingCampaign] = useState<CreatorCampaign | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<CreatorCampaign | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const data = await getCreatorCampaignStats()
      setStats(data)
    } catch {
      // Fail silently — stats are supplementary
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const fetchCampaigns = useCallback(
    async (s?: string, filter?: CreatorCampaignFilter) => {
      setLoading(true)
      setError(null)
      try {
        const data = await getCreatorCampaigns({
          search: s ?? search,
          filter: filter ?? activeFilter,
          limit: 50,
        })
        setCampaigns(data)
      } catch (e) {
        setError(getErrorMessage(e))
      } finally {
        setLoading(false)
      }
    },
    [search, activeFilter],
  )

  useEffect(() => {
    fetchStats()
    fetchCampaigns('', 'all')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchCampaigns(value, activeFilter)
    }, 400)
  }

  const handleFilterChange = (filter: CreatorCampaignFilter) => {
    setActiveFilter(filter)
    fetchCampaigns(search, filter)
  }

  const handleApplied = () => {
    setApplyingCampaign(null)
    setSuccessMessage('Application submitted successfully!')
    fetchCampaigns()
    fetchStats()
    setTimeout(() => setSuccessMessage(null), 4000)
  }

  const handleContentSubmitted = () => {
    setSubmittingCampaign(null)
    setSuccessMessage('Content submitted successfully!')
    fetchCampaigns()
    setTimeout(() => setSuccessMessage(null), 4000)
  }

  // ── Detail view ────────────────────────────────────────────
  if (selectedCampaign) {
    return (
      <CreatorCampaignDetailPage
        campaign={selectedCampaign as any}
        onBack={() => { setSelectedCampaign(null); fetchCampaigns(); fetchStats() }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Campaigns</h1>
          <p className="text-sm text-gray-400 mt-1">Discover campaigns and collaborate with brands.</p>
        </div>
        <DashButton variant="ghost" size="sm" onClick={() => fetchCampaigns()}>
          <RefreshCw className="w-4 h-4" />
        </DashButton>
      </div>

      {/* Success toast */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400">{successMessage}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashCard className="!p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400">Completed</p>
              <p className="text-2xl font-semibold text-white mt-1">{statsLoading ? '—' : stats.completed}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
        </DashCard>
        <DashCard className="!p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400">Active</p>
              <p className="text-2xl font-semibold text-white mt-1">{statsLoading ? '—' : stats.active}</p>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
        </DashCard>
        <DashCard className="!p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400">Applied</p>
              <p className="text-2xl font-semibold text-white mt-1">{statsLoading ? '—' : stats.applied}</p>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </DashCard>
        <DashCard className="!p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-gray-400">Rejected</p>
              <p className="text-2xl font-semibold text-white mt-1">{statsLoading ? '—' : stats.rejected}</p>
            </div>
            <div className="p-2 rounded-lg bg-red-500/15 text-red-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
        </DashCard>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search campaigns by name, brand, or niche..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-white/5 pb-px overflow-x-auto">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors whitespace-nowrap ${
              activeFilter === tab.key
                ? 'text-purple-400 bg-purple-500/10 border-b-2 border-purple-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
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
          <DashButton className="mt-4" size="sm" onClick={() => fetchCampaigns()}>
            Retry
          </DashButton>
        </DashCard>
      )}

      {/* Empty */}
      {!loading && !error && campaigns.length === 0 && (
        <EmptyState
          icon={<Megaphone className="w-10 h-10" />}
          title="No campaigns found"
          description={
            search || activeFilter !== 'all'
              ? 'Try adjusting your search or filter.'
              : 'No campaigns available right now. Check back later!'
          }
        />
      )}

      {/* Campaign Grid */}
      {!loading && !error && campaigns.length > 0 && (
        <>
          <p className="text-xs text-gray-500">
            {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {campaigns.map((campaign) => {
              const nicheStyle = getNicheStyle(campaign.preferredNiche)
              const deliverables = getDeliverables(campaign)
              const slotsAvailable = campaign.totalSlots - campaign.approvedCount
              const raw = campaign as unknown as Record<string, unknown>
              const platform = raw.platform as string | undefined
              const paymentModel = raw.paymentModel as string | undefined

              return (
                <DashCard
                  key={campaign.campaignId}
                  className={`flex flex-col cursor-pointer hover:border-purple-500/30 transition-colors ${nicheStyle.bg}`}
                >
                  {/* Header — clickable to open detail */}
                  <div
                    className="cursor-pointer"
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-white truncate">{campaign.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          {campaign.brandName && (
                            <p className="text-[11px] text-gray-500">by {campaign.brandName}</p>
                          )}
                          {platform && (
                            <span className="text-[10px] text-gray-600">• {platform}</span>
                          )}
                        </div>
                      </div>
                      <DashBadge variant={statusVariant[campaign.status] ?? 'default'}>
                        {campaign.status}
                      </DashBadge>
                    </div>

                  {/* Description */}
                  {campaign.description && (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{campaign.description}</p>
                  )}

                  {/* Tags: niche + payment model */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    {campaign.preferredNiche && (
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${nicheStyle.pill}`}>
                        <Target className="w-2.5 h-2.5" />
                        {campaign.preferredNiche}
                      </span>
                    )}
                    {paymentModel && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full">
                        <PaymentIcon model={paymentModel} />
                        {paymentModel}
                      </span>
                    )}
                  </div>

                  {/* Deliverables */}
                  {deliverables && (
                    <div className="flex items-center gap-3 mb-2 text-[11px] text-gray-500">
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
                  <div className="flex items-center gap-3 mt-2 pt-3 border-t border-white/5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(campaign.applicationDeadline ?? campaign.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {campaign.approvedCount}/{campaign.totalSlots}
                    </span>
                    <span className="ml-auto flex items-center gap-0.5 font-medium text-gray-300">
                      <IndianRupee className="w-3 h-3" />
                      {formatBudget(campaign.budgetPerCreator)}
                    </span>
                  </div>
                  </div>{/* end clickable area */}

                  {/* Action Button — Always visible */}
                  <div className="mt-3 pt-3 border-t border-white/5">
                    {campaign.applicationStatus === 'approved' ? (
                      <DashButton
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={() => setSubmittingCampaign(campaign)}
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Submit Content
                      </DashButton>
                    ) : campaign.applicationStatus === 'pending' ? (
                      <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-xs font-medium text-amber-400">Application Pending</span>
                      </div>
                    ) : campaign.applicationStatus === 'rejected' ? (
                      <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span className="text-xs font-medium text-red-400">Application Rejected</span>
                      </div>
                    ) : slotsAvailable <= 0 ? (
                      <div className="flex items-center justify-center gap-2 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <span className="text-xs font-medium text-gray-500">No Slots Available</span>
                      </div>
                    ) : (campaign.status === 'active' || campaign.status === 'published') ? (
                      <DashButton
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => setApplyingCampaign(campaign)}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Apply Now
                      </DashButton>
                    ) : null}
                  </div>
                </DashCard>
              )
            })}
          </div>
        </>
      )}

      {/* Modals */}
      {applyingCampaign && (
        <ApplyModal
          campaign={applyingCampaign}
          onClose={() => setApplyingCampaign(null)}
          onApplied={handleApplied}
        />
      )}
      {submittingCampaign && (
        <SubmitContentModal
          campaign={submittingCampaign}
          onClose={() => setSubmittingCampaign(null)}
          onSubmitted={handleContentSubmitted}
        />
      )}
    </div>
  )
}
