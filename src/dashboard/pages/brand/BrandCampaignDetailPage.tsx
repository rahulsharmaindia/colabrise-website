import { useEffect, useState, useCallback } from 'react'
import {
  ArrowLeft, Pencil, Loader2, FileText, DollarSign,
  Users, Calendar, Target, CheckSquare, Globe, Link2, Film,
  Clapperboard, BookOpen, Image, IndianRupee, Clock, Hash,
  AtSign, MessageSquare, Copy, CheckCircle2, XCircle, UserCheck,
} from 'lucide-react'
import { DashCard, DashButton, DashBadge } from '../../components/ui'
import { getCampaign, listCampaignApplications, reviewApplication, type Campaign, type CampaignStatus, type CampaignApplication } from '../../../api/campaigns'
import { getErrorMessage } from '../../../lib/api-client'

interface BrandCampaignDetailPageProps {
  campaignId: string
  onBack: () => void
  onEdit?: (campaignId: string, data: Record<string, unknown>) => void
  onDuplicate?: (data: Record<string, unknown>) => void
}

const statusVariant: Record<CampaignStatus, 'success' | 'info' | 'warning' | 'default' | 'error'> = {
  active: 'success',
  published: 'info',
  completed: 'info',
  draft: 'default',
  cancelled: 'error',
  archived: 'warning',
}

const statusLabel: Record<CampaignStatus, string> = {
  active: 'Active',
  published: 'Published',
  completed: 'Completed',
  draft: 'Draft',
  cancelled: 'Cancelled',
  archived: 'Archived',
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

function r(raw: Record<string, unknown>, key: string): string | null {
  const v = raw[key]
  if (v == null) return null
  if (typeof v === 'string') return v || null
  if (typeof v === 'number') return String(v)
  return null
}

function has(raw: Record<string, unknown>, key: string): boolean {
  const v = raw[key]
  if (v == null) return false
  if (typeof v === 'string') return v.length > 0
  if (Array.isArray(v)) return v.length > 0
  return true
}

function rArr(raw: Record<string, unknown>, key: string): string[] {
  const v = raw[key]
  if (Array.isArray(v)) return v.map(String)
  return []
}

function isExpiredCampaign(campaign: Campaign): boolean {
  // Drafts are never expired
  if (campaign.status === 'draft') return false
  if (campaign.status === 'completed' || campaign.status === 'cancelled' || campaign.status === 'archived') return true
  // Only check dates if they are actually set (non-empty, valid date)
  if (campaign.endDate && campaign.endDate.trim() && !isNaN(new Date(campaign.endDate).getTime()) && new Date(campaign.endDate) < new Date()) return true
  if (campaign.applicationDeadline && campaign.applicationDeadline.trim() && !isNaN(new Date(campaign.applicationDeadline).getTime()) && new Date(campaign.applicationDeadline) < new Date() && campaign.status !== 'active') return true
  return false
}

export function BrandCampaignDetailPage({ campaignId, onBack, onEdit, onDuplicate }: BrandCampaignDetailPageProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [raw, setRaw] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampaign = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getCampaign(campaignId)
      setCampaign(data)
      setRaw(data as unknown as Record<string, unknown>)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchCampaign()
  }, [fetchCampaign])

  const startEdit = () => {
    if (!campaign || !onEdit) return
    onEdit(campaignId, raw)
  }

  const handleDuplicate = () => {
    if (!campaign || !onDuplicate) return
    // Copy all data but clear dates so the user sets fresh ones
    const data: Record<string, unknown> = {
      ...raw,
      startDate: '',
      endDate: '',
      applicationDeadline: '',
      submissionDeadline: '',
      contentDeadline: '',
      status: 'Draft',
      campaignId: undefined,
      approvedCount: 0,
      title: `${campaign.title} (Copy)`,
    }
    onDuplicate(data)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-7 h-7 text-purple-400 animate-spin" />
        <p className="text-sm text-gray-400 dark:text-gray-500">Loading campaign details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to campaigns
        </button>
        <DashCard className="text-center py-10">
          <p className="text-red-400 text-sm mb-4">{error}</p>
          <DashButton size="sm" onClick={fetchCampaign}>Try again</DashButton>
        </DashCard>
      </div>
    )
  }

  if (!campaign) return null

  const expired = isExpiredCampaign(campaign)

  // ── Detail view ───────────────────────────────────────────
  const slots = { total: campaign.totalSlots, approved: campaign.approvedCount, remaining: campaign.totalSlots - campaign.approvedCount }
  const slotsProgress = campaign.totalSlots > 0 ? (campaign.approvedCount / campaign.totalSlots) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to campaigns
      </button>

      {/* Hero header card */}
      <DashCard className="!p-0 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500/10 via-pink-500/5 to-transparent px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{campaign.title}</h1>
                <DashBadge variant={statusVariant[campaign.status]}>{statusLabel[campaign.status]}</DashBadge>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
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
                {campaign.paymentModel && (
                  <span className="flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {campaign.paymentModel}
                  </span>
                )}
              </div>
            </div>
            {expired ? (
              <DashButton size="sm" onClick={handleDuplicate}>
                <Copy className="w-3.5 h-3.5" />
                Create Duplicate
              </DashButton>
            ) : (campaign.status === 'draft' || campaign.status === 'published' || campaign.status === 'active') && (
              <DashButton size="sm" onClick={startEdit}>
                <Pencil className="w-3.5 h-3.5" />
                Edit Campaign
              </DashButton>
            )}
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

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Description */}
        <Section icon={<FileText className="w-4 h-4 text-blue-400" />} title="Description & Objective">
          {campaign.objective && <KV label="Objective" value={campaign.objective} />}
          {campaign.campaignType && <KV label="Type" value={campaign.campaignType} />}
          {campaign.description ? (
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-2">{campaign.description}</p>
          ) : (
            !campaign.objective && !campaign.campaignType && (
              <p className="text-xs text-gray-400 dark:text-gray-600 italic">No description provided.</p>
            )
          )}
        </Section>

        {/* Budget */}
        <Section icon={<DollarSign className="w-4 h-4 text-amber-400" />} title="Budget & Payment">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <InfoTile label="Per Creator" value={formatBudget(campaign.budgetPerCreator)} accent="border-amber-500/20" />
            <InfoTile label="Total Budget" value={formatBudget(campaign.totalBudget)} accent="border-emerald-500/20" />
          </div>
          <KV label="Payment Model" value={campaign.paymentModel} />
          {has(raw, 'commissionRate') && <KV label="Commission" value={`${r(raw, 'commissionRate')}%`} />}
          {has(raw, 'bonusCriteria') && <KV label="Bonus" value={r(raw, 'bonusCriteria')} />}
        </Section>

        {/* Slots — full width */}
        <Section icon={<Users className="w-4 h-4 text-emerald-400" />} title="Creator Slots" className="lg:col-span-2">
          <div className="grid grid-cols-3 gap-3 mb-4">
            <InfoTile label="Approved" value={String(slots.approved)} accent="border-emerald-500/20" />
            <InfoTile label="Remaining" value={String(slots.remaining)} accent="border-cyan-500/20" />
            <InfoTile label="Total" value={String(slots.total)} accent="border-purple-500/20" />
          </div>
          <div className="relative w-full bg-gray-50 dark:bg-white/5 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${slotsProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{Math.round(slotsProgress)}% filled</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500">{slots.remaining} slot{slots.remaining !== 1 ? 's' : ''} remaining</p>
          </div>
        </Section>

        {/* Applications — full width */}
        <ApplicationsPanel campaignId={campaignId} campaignStatus={campaign.status} onStatusChange={fetchCampaign} />

        {/* Timeline */}
        <Section icon={<Calendar className="w-4 h-4 text-cyan-400" />} title="Timeline">
          <div className="space-y-3">
            <TimelineRow icon={<Clock className="w-3.5 h-3.5" />} label="Application Deadline" value={formatDate(campaign.applicationDeadline)} />
            <TimelineRow icon={<Calendar className="w-3.5 h-3.5" />} label="Campaign Start" value={formatDate(campaign.startDate)} />
            <TimelineRow icon={<Calendar className="w-3.5 h-3.5" />} label="Campaign End" value={formatDate(campaign.endDate)} />
            {has(raw, 'submissionDeadline') && <TimelineRow icon={<Clock className="w-3.5 h-3.5" />} label="Submission Deadline" value={formatDate(r(raw, 'submissionDeadline'))} />}
            {has(raw, 'contentDeadline') && <TimelineRow icon={<Clock className="w-3.5 h-3.5" />} label="Content Deadline" value={formatDate(r(raw, 'contentDeadline'))} />}
          </div>
        </Section>

        {/* Deliverables */}
        {has(raw, 'deliverables') && (
          <Section icon={<Film className="w-4 h-4 text-purple-400" />} title="Deliverables">
            {(() => {
              const d = raw.deliverables as Record<string, number> | null
              if (!d) return <p className="text-xs text-gray-400 dark:text-gray-600 italic">No deliverables specified.</p>
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
          {has(raw, 'contentStyleExpectations') && <KV label="Content Style" value={r(raw, 'contentStyleExpectations')} />}
          {!campaign.preferredNiche && !campaign.minimumFollowers && !has(raw, 'engagementRate') && (
            <p className="text-xs text-gray-400 dark:text-gray-600 italic">No specific requirements set.</p>
          )}
        </Section>

        {/* Content Requirements */}
        <Section icon={<CheckSquare className="w-4 h-4 text-pink-400" />} title="Content Requirements">
          {has(raw, 'postTypes') && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {rArr(raw, 'postTypes').map((t) => (
                <span key={t} className="text-[11px] bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full text-purple-300 font-medium">{t}</span>
              ))}
            </div>
          )}
          {has(raw, 'contentCountPerInfluencer') && <KV label="Content Count" value={`${r(raw, 'contentCountPerInfluencer')} per creator`} />}
          {has(raw, 'handleToTag') && (
            <div className="flex items-center gap-2 mb-2">
              <AtSign className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{r(raw, 'handleToTag')}</span>
            </div>
          )}
          {has(raw, 'hashtags') && (
            <div className="flex items-start gap-2 mb-2">
              <Hash className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{rArr(raw, 'hashtags').join('  ')}</span>
            </div>
          )}
          {has(raw, 'mentions') && (
            <div className="flex items-start gap-2 mb-2">
              <AtSign className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{rArr(raw, 'mentions').join('  ')}</span>
            </div>
          )}
          {has(raw, 'captionGuidelines') && (
            <div className="flex items-start gap-2 mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{r(raw, 'captionGuidelines')}</span>
            </div>
          )}
          {!has(raw, 'postTypes') && !has(raw, 'contentCountPerInfluencer') && !has(raw, 'hashtags') && (
            <p className="text-xs text-gray-400 dark:text-gray-600 italic">No content requirements specified.</p>
          )}
        </Section>

        {/* Target Audience */}
        {(has(raw, 'ageGroupMin') || has(raw, 'gender') || has(raw, 'targetLocation')) && (
          <Section icon={<Globe className="w-4 h-4 text-sky-400" />} title="Target Audience">
            {has(raw, 'ageGroupMin') && has(raw, 'ageGroupMax') && <KV label="Age Range" value={`${r(raw, 'ageGroupMin')} – ${r(raw, 'ageGroupMax')} years`} />}
            {has(raw, 'gender') && <KV label="Gender" value={r(raw, 'gender')} />}
            {has(raw, 'targetLocation') && <KV label="Location" value={r(raw, 'targetLocation')} />}
            {has(raw, 'interests') && <KV label="Interests" value={rArr(raw, 'interests').join(', ')} />}
            {has(raw, 'languagePreference') && <KV label="Language" value={r(raw, 'languagePreference')} />}
          </Section>
        )}

        {/* References */}
        {(campaign.referenceVideoUrl || (campaign.additionalReferenceLinks && campaign.additionalReferenceLinks.length > 0)) && (
          <Section icon={<Link2 className="w-4 h-4 text-violet-400" />} title="References & Resources">
            {campaign.referenceVideoUrl && (
              <div className="mb-3">
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Reference Video</p>
                <a
                  href={campaign.referenceVideoUrl.match(/^https?:\/\//) ? campaign.referenceVideoUrl : `https://${campaign.referenceVideoUrl}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2 break-all"
                >
                  <Link2 className="w-3.5 h-3.5 shrink-0" />
                  {campaign.referenceVideoUrl.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            {campaign.additionalReferenceLinks && campaign.additionalReferenceLinks.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1.5">Additional Links</p>
                <ul className="space-y-1.5">
                  {campaign.additionalReferenceLinks.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.match(/^https?:\/\//) ? link : `https://${link}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2 break-all"
                      >
                        <Link2 className="w-3.5 h-3.5 shrink-0" />
                        {link.replace(/^https?:\/\//, '')}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  )
}

// ── Applications Panel ───────────────────────────────────────

function ApplicationsPanel({ campaignId, campaignStatus, onStatusChange }: { campaignId: string; campaignStatus: CampaignStatus; onStatusChange: () => void }) {
  const [applications, setApplications] = useState<CampaignApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reviewing, setReviewing] = useState<string | null>(null)

  const fetchApplications = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listCampaignApplications(campaignId)
      setApplications(data)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    fetchApplications()
  }, [fetchApplications])

  const handleReview = async (applicationId: string, status: 'Approved' | 'Rejected') => {
    setReviewing(applicationId)
    try {
      await reviewApplication(campaignId, applicationId, status)
      await fetchApplications()
      onStatusChange()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setReviewing(null)
    }
  }

  const pending = applications.filter((a) => a.status === 'Pending')
  const approved = applications.filter((a) => a.status === 'Approved')
  const rejected = applications.filter((a) => a.status === 'Rejected')

  return (
    <Section icon={<UserCheck className="w-4 h-4 text-indigo-400" />} title={`Applications (${applications.length})`} className="lg:col-span-2">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
        </div>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : applications.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No applications yet.</p>
      ) : (
        <div className="space-y-4">
          {/* Pending applications — show first with action buttons */}
          {pending.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-2">Pending ({pending.length})</p>
              <div className="space-y-2">
                {pending.map((app) => (
                  <ApplicationCard
                    key={app.applicationId}
                    app={app}
                    reviewing={reviewing === app.applicationId}
                    canReview={campaignStatus !== 'completed' && campaignStatus !== 'cancelled' && campaignStatus !== 'archived'}
                    onApprove={() => handleReview(app.applicationId, 'Approved')}
                    onReject={() => handleReview(app.applicationId, 'Rejected')}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Approved */}
          {approved.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 mb-2">Approved ({approved.length})</p>
              <div className="space-y-2">
                {approved.map((app) => (
                  <ApplicationCard key={app.applicationId} app={app} />
                ))}
              </div>
            </div>
          )}
          {/* Rejected */}
          {rejected.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-400 mb-2">Rejected ({rejected.length})</p>
              <div className="space-y-2">
                {rejected.map((app) => (
                  <ApplicationCard key={app.applicationId} app={app} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Section>
  )
}

function ApplicationCard({
  app,
  reviewing = false,
  canReview = false,
  onApprove,
  onReject,
}: {
  app: CampaignApplication
  reviewing?: boolean
  canReview?: boolean
  onApprove?: () => void
  onReject?: () => void
}) {
  const statusColor = app.status === 'Approved' ? 'text-emerald-400' : app.status === 'Rejected' ? 'text-red-400' : 'text-amber-400'
  const statusBg = app.status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20' : app.status === 'Rejected' ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06]">
      {/* Avatar */}
      {app.profilePictureUrl ? (
        <img
          src={app.profilePictureUrl}
          alt={app.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-white/10"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/10 flex items-center justify-center">
          <span className="text-sm font-bold text-purple-400">
            {(app.username ?? '?').slice(0, 2).toUpperCase()}
          </span>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{app.username || 'Unknown'}</p>
        <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
          <span>{app.followerCount > 0 ? `${(app.followerCount / 1000).toFixed(1)}K followers` : 'No followers data'}</span>
          <span>{new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Status or actions */}
      {app.status === 'Pending' && canReview && onApprove && onReject ? (
        <div className="flex items-center gap-2">
          <button
            onClick={onApprove}
            disabled={reviewing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            {reviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
            Approve
          </button>
          <button
            onClick={onReject}
            disabled={reviewing}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {reviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
            Reject
          </button>
        </div>
      ) : (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusBg} ${statusColor}`}>
          {app.status}
        </span>
      )}
    </div>
  )
}

// ── Helper components ────────────────────────────────────────

function Section({ icon, title, children, className = '' }: { icon: React.ReactNode; title: string; children: React.ReactNode; className?: string }) {
  return (
    <DashCard className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100 dark:border-white/5">
        {icon}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div>{children}</div>
    </DashCard>
  )
}

function KV({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div className="flex gap-3 mb-2.5 last:mb-0">
      <span className="text-xs text-gray-400 dark:text-gray-500 w-32 shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-200 flex-1">{value}</span>
    </div>
  )
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-white/[0.04] rounded-lg px-3 py-2.5 border border-gray-100 dark:border-white/5">
      {icon}
      <div>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function InfoTile({ label, value, accent = '' }: { label: string; value: string; accent?: string }) {
  return (
    <div className={`bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl px-3 py-3 text-center ${accent}`}>
      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function DeliverableTile({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-xl px-3 py-4 text-center flex flex-col items-center gap-2">
      {icon}
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
      <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{label}</p>
    </div>
  )
}

function TimelineRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 shrink-0">
        {icon}
      </div>
      <div className="flex-1 flex items-center justify-between">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
      </div>
    </div>
  )
}


