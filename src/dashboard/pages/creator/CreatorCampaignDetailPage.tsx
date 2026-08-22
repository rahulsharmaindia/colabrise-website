import { useEffect, useState, useCallback } from 'react'
import {
  ArrowLeft, Loader2, FileText, DollarSign,
  Users, Calendar, Target, CheckSquare, Globe, Link2, Film,
  Clapperboard, BookOpen, Image, IndianRupee, Clock, Hash,
  AtSign, MessageSquare, Send, Upload, X, CheckCircle2, XCircle,
} from 'lucide-react'
import { DashCard, DashButton, DashBadge } from '../../components/ui'
import { getErrorMessage } from '../../../lib/api-client'
import {
  applyForCampaign,
  submitCampaignContent,
  getMyApplication,
} from '../../../api/creator-dashboard'

// ── Types ────────────────────────────────────────────────────

interface CampaignDetail {
  campaignId: string
  title: string
  status: string
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
  brandName?: string | null
  [key: string]: unknown
}

interface MyApplication {
  applicationId?: string
  status?: string
}

// ── Props ────────────────────────────────────────────────────

interface CreatorCampaignDetailPageProps {
  campaign: CampaignDetail
  onBack: () => void
}

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
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatBudget(amount?: number | null): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}

function has(raw: Record<string, unknown>, key: string): boolean {
  const v = raw[key]
  if (v == null) return false
  if (typeof v === 'string') return v.length > 0
  if (Array.isArray(v)) return v.length > 0
  return true
}

function r(raw: Record<string, unknown>, key: string): string | null {
  const v = raw[key]
  if (v == null) return null
  if (typeof v === 'string') return v || null
  if (typeof v === 'number') return String(v)
  return null
}

function rArr(raw: Record<string, unknown>, key: string): string[] {
  const v = raw[key]
  if (Array.isArray(v)) return v.map(String)
  return []
}

// ── Submit Content Modal ─────────────────────────────────────

function SubmitContentModal({
  campaign,
  onClose,
  onSubmitted,
}: {
  campaign: CampaignDetail
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
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Instagram Post URL *</label>
            <input
              type="url"
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://instagram.com/reel/..."
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Post Caption *</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Paste the exact caption you used..."
              rows={4}
              maxLength={2200}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
            <p className="text-[10px] text-gray-600 mt-1">{caption.length}/2200</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes to Brand (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context..."
              rows={2}
              maxLength={1000}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
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

// ── Main Component ───────────────────────────────────────────

export function CreatorCampaignDetailPage({ campaign, onBack }: CreatorCampaignDetailPageProps) {
  const campaignId = campaign.campaignId
  const [myApplication, setMyApplication] = useState<MyApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const fetchApplicationStatus = useCallback(async () => {
    setLoading(true)
    try {
      const app = await getMyApplication(campaignId)
      setMyApplication(app)
    } catch {
      // If it fails, assume no application exists
      setMyApplication(null)
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchApplicationStatus()
  }, [fetchApplicationStatus])

  const handleApply = async () => {
    setApplying(true)
    setApplyError(null)
    try {
      await applyForCampaign(campaignId)
      setMyApplication({ status: 'Pending' })
      setSuccessMessage('Application submitted! The brand will review your profile.')
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (e) {
      setApplyError(getErrorMessage(e))
    } finally {
      setApplying(false)
    }
  }

  const handleContentSubmitted = () => {
    setShowSubmitModal(false)
    setSuccessMessage('Content submitted for review!')
    setTimeout(() => setSuccessMessage(null), 5000)
  }

  const raw = campaign as unknown as Record<string, unknown>
  const slots = { total: campaign.totalSlots ?? 0, approved: campaign.approvedCount ?? 0, remaining: (campaign.totalSlots ?? 0) - (campaign.approvedCount ?? 0) }
  const slotsProgress = slots.total > 0 ? (slots.approved / slots.total) * 100 : 0
  // Normalize application status — treat empty objects or objects without status as "no application"
  const hasApplication = myApplication != null && typeof myApplication === 'object' && !!myApplication.status
  const applicationStatus = hasApplication ? myApplication.status!.toLowerCase() : null
  const campaignStatus = (campaign.status ?? '').toLowerCase()

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to campaigns
      </button>

      {/* Success toast */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400">{successMessage}</p>
        </div>
      )}

      {/* Hero header card */}
      <DashCard className="!p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold text-white">{campaign.title}</h1>
                <DashBadge variant={statusVariant[campaign.status] ?? 'default'}>{campaign.status}</DashBadge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                {campaign.brandName && (
                  <span className="font-medium text-gray-300">by {campaign.brandName}</span>
                )}
                {campaign.platform && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    {campaign.platform}
                  </span>
                )}
                {campaign.preferredNiche && (
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    {campaign.preferredNiche}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <QuickStat icon={<IndianRupee className="w-4 h-4 text-amber-400" />} label="Per Creator" value={formatBudget(campaign.budgetPerCreator)} />
            <QuickStat icon={<Users className="w-4 h-4 text-emerald-400" />} label="Slots" value={`${campaign.approvedCount}/${campaign.totalSlots}`} />
            <QuickStat icon={<Calendar className="w-4 h-4 text-cyan-400" />} label="Starts" value={formatDate(campaign.startDate)} />
            <QuickStat icon={<Clock className="w-4 h-4 text-purple-400" />} label="Deadline" value={formatDate(campaign.applicationDeadline)} />
          </div>
        </div>
      </DashCard>

      {/* ═══ ACTION CTA ═══ */}
      <DashCard className="!py-4">
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
          </div>
        ) : applicationStatus === 'approved' ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-400">Application Approved</p>
                <p className="text-[11px] text-gray-500">You can now submit your content for this campaign.</p>
              </div>
            </div>
            <DashButton
              size="lg"
              className="w-full"
              onClick={() => setShowSubmitModal(true)}
            >
              <Upload className="w-4 h-4" />
              Submit Content
            </DashButton>
          </div>
        ) : applicationStatus === 'pending' ? (
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-400">Application Pending</p>
              <p className="text-[11px] text-gray-500">The brand is reviewing your profile.</p>
            </div>
          </div>
        ) : applicationStatus === 'rejected' ? (
          <div className="flex items-center justify-center gap-3 py-2">
            <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-400">Application Rejected</p>
              <p className="text-[11px] text-gray-500">Unfortunately the brand has not approved your application.</p>
            </div>
          </div>
        ) : (campaignStatus === 'completed' || campaignStatus === 'cancelled' || campaignStatus === 'archived') ? (
          <div className="flex items-center justify-center py-2">
            <p className="text-sm text-gray-500">This campaign is no longer accepting applications.</p>
          </div>
        ) : (
          /* Default: show Apply button */
          <div className="space-y-3">
            {applyError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <p className="text-sm text-red-400">{applyError}</p>
              </div>
            )}
            <DashButton
              size="lg"
              className="w-full"
              onClick={handleApply}
              disabled={applying}
            >
              {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {applying ? 'Applying...' : 'Apply to Campaign'}
            </DashButton>
            <p className="text-[11px] text-gray-500 text-center">
              Your profile will be shared with the brand for review.
            </p>
          </div>
        )}
      </DashCard>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Description */}
        <Section icon={<FileText className="w-4 h-4 text-blue-400" />} title="Description & Objective">
          {campaign.objective && <KV label="Objective" value={campaign.objective} />}
          {campaign.campaignType && <KV label="Type" value={campaign.campaignType} />}
          {campaign.description ? (
            <p className="text-sm text-gray-300 leading-relaxed mt-2">{campaign.description}</p>
          ) : (
            !campaign.objective && !campaign.campaignType && (
              <p className="text-xs text-gray-600 italic">No description provided.</p>
            )
          )}
        </Section>

        {/* Budget */}
        <Section icon={<DollarSign className="w-4 h-4 text-amber-400" />} title="Budget & Payment">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <InfoTile label="Per Creator" value={formatBudget(campaign.budgetPerCreator)} accent="border-amber-500/20" />
            <InfoTile label="Total Budget" value={formatBudget(campaign.totalBudget)} accent="border-emerald-500/20" />
          </div>
          {campaign.paymentModel && <KV label="Payment Model" value={campaign.paymentModel} />}
          {has(raw, 'commissionRate') && <KV label="Commission" value={`${r(raw, 'commissionRate')}%`} />}
        </Section>

        {/* Slots */}
        <Section icon={<Users className="w-4 h-4 text-emerald-400" />} title="Creator Slots" className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <InfoTile label="Approved" value={String(slots.approved)} accent="border-emerald-500/20" />
            <InfoTile label="Remaining" value={String(slots.remaining)} accent="border-cyan-500/20" />
            <InfoTile label="Total" value={String(slots.total)} accent="border-purple-500/20" />
          </div>
          <div className="relative w-full bg-white/5 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all"
              style={{ width: `${slotsProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-500 mt-2">{Math.round(slotsProgress)}% filled • {slots.remaining} slot{slots.remaining !== 1 ? 's' : ''} remaining</p>
        </Section>

        {/* Timeline */}
        <Section icon={<Calendar className="w-4 h-4 text-cyan-400" />} title="Timeline">
          <div className="space-y-3">
            <TimelineRow label="Application Deadline" value={formatDate(campaign.applicationDeadline)} />
            <TimelineRow label="Campaign Start" value={formatDate(campaign.startDate)} />
            <TimelineRow label="Campaign End" value={formatDate(campaign.endDate)} />
            {has(raw, 'submissionDeadline') && <TimelineRow label="Submission Deadline" value={formatDate(r(raw, 'submissionDeadline'))} />}
          </div>
        </Section>

        {/* Deliverables */}
        {has(raw, 'deliverables') && (
          <Section icon={<Film className="w-4 h-4 text-purple-400" />} title="Deliverables">
            {(() => {
              const d = raw.deliverables as Record<string, number> | null
              if (!d) return null
              return (
                <div className="grid grid-cols-3 gap-3">
                  <DeliverableTile icon={<Clapperboard className="w-5 h-5 text-purple-400" />} label="Reels" count={d.reels ?? 0} />
                  <DeliverableTile icon={<BookOpen className="w-5 h-5 text-cyan-400" />} label="Stories" count={d.stories ?? 0} />
                  <DeliverableTile icon={<Image className="w-5 h-5 text-emerald-400" />} label="Posts" count={d.posts ?? 0} />
                </div>
              )
            })()}
          </Section>
        )}

        {/* Requirements */}
        <Section icon={<Target className="w-4 h-4 text-orange-400" />} title="Creator Requirements">
          <KV label="Preferred Niche" value={campaign.preferredNiche} />
          <KV label="Min Followers" value={campaign.minimumFollowers ? campaign.minimumFollowers.toLocaleString('en-IN') : null} />
          {has(raw, 'engagementRate') && <KV label="Engagement Rate" value={`${r(raw, 'engagementRate')}%`} />}
          {!campaign.preferredNiche && !campaign.minimumFollowers && (
            <p className="text-xs text-gray-600 italic">No specific requirements.</p>
          )}
        </Section>

        {/* Content Requirements */}
        {(has(raw, 'postTypes') || has(raw, 'hashtags') || has(raw, 'handleToTag') || has(raw, 'captionGuidelines')) && (
          <Section icon={<CheckSquare className="w-4 h-4 text-pink-400" />} title="Content Guidelines">
            {has(raw, 'postTypes') && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {rArr(raw, 'postTypes').map((t) => (
                  <span key={t} className="text-[11px] bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full text-purple-300 font-medium">{t}</span>
                ))}
              </div>
            )}
            {has(raw, 'handleToTag') && (
              <div className="flex items-center gap-2 mb-2">
                <AtSign className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-sm text-gray-300">Tag: {r(raw, 'handleToTag')}</span>
              </div>
            )}
            {has(raw, 'hashtags') && (
              <div className="flex items-start gap-2 mb-2">
                <Hash className="w-3.5 h-3.5 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-300">{rArr(raw, 'hashtags').join('  ')}</span>
              </div>
            )}
            {has(raw, 'captionGuidelines') && (
              <div className="flex items-start gap-2 mb-2">
                <MessageSquare className="w-3.5 h-3.5 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-300">{r(raw, 'captionGuidelines')}</span>
              </div>
            )}
          </Section>
        )}

        {/* References */}
        {(campaign.referenceVideoUrl || (campaign.additionalReferenceLinks && campaign.additionalReferenceLinks.length > 0)) && (
          <Section icon={<Link2 className="w-4 h-4 text-violet-400" />} title="References">
            {campaign.referenceVideoUrl && (
              <a
                href={campaign.referenceVideoUrl.match(/^https?:\/\//) ? campaign.referenceVideoUrl : `https://${campaign.referenceVideoUrl}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2 break-all"
              >
                <Link2 className="w-3.5 h-3.5 shrink-0" /> Reference Video
              </a>
            )}
            {campaign.additionalReferenceLinks?.map((link, i) => (
              <a
                key={i}
                href={link.match(/^https?:\/\//) ? link : `https://${link}`}
                target="_blank"
                rel="noreferrer"
                className="block mt-2 inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2 break-all"
              >
                <Link2 className="w-3.5 h-3.5 shrink-0" /> {link.replace(/^https?:\/\//, '')}
              </a>
            ))}
          </Section>
        )}
      </div>

      {/* Submit Content Modal */}
      {showSubmitModal && campaign && (
        <SubmitContentModal
          campaign={campaign}
          onClose={() => setShowSubmitModal(false)}
          onSubmitted={handleContentSubmitted}
        />
      )}
    </div>
  )
}

// ── Helper Components ────────────────────────────────────────

function Section({ icon, title, children, className = '' }: { icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }) {
  return (
    <DashCard className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2.5 pb-3 border-b border-white/5">
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div>{children}</div>
    </DashCard>
  )
}

function KV({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3 mb-2.5 last:mb-0">
      <span className="text-xs text-gray-500 w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-200 flex-1">{value}</span>
    </div>
  )
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-white/[0.04] rounded-lg px-3 py-2.5 border border-white/5">
      {icon}
      <div>
        <p className="text-[11px] text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

function InfoTile({ label, value, accent = '' }: { label: string; value: string; accent?: string }) {
  return (
    <div className={`bg-white/[0.03] border border-white/5 rounded-xl px-3 py-3 text-center ${accent}`}>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[11px] text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function DeliverableTile({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-4 text-center flex flex-col items-center gap-2">
      {icon}
      <p className="text-2xl font-bold text-white">{count}</p>
      <p className="text-[11px] text-gray-500 font-medium">{label}</p>
    </div>
  )
}

function TimelineRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  )
}
