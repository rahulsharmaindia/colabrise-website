import { useEffect, useState, useCallback } from 'react'
import {
  User,
  Loader2,
  Pencil,
  X,
  Save,
  AtSign,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Heart,
  MessageCircle,
  LogOut,
  Trash2,
  BarChart3,
  CreditCard,
  HelpCircle,
  Wallet,
  Play,
} from 'lucide-react'
import { DashCard, DashButton, DashBadge } from '../../components/ui'
import { getErrorMessage } from '../../../lib/api-client'
import {
  getCreatorProfile,
  getCreatorMedia,
  getCreatorNiches,
  updateCreatorProfile,
  updateCreatorNiches,
  type CreatorProfile,
  type MediaItem,
  type UpdateCreatorProfilePayload,
} from '../../../api/creator-dashboard'
import { clearAllSessions } from '../../../lib/session'
import { useNavigate } from 'react-router-dom'

// ── Helpers ──────────────────────────────────────────────────

const NICHE_OPTIONS = [
  'Fashion', 'Fitness', 'Tech', 'Beauty', 'Travel',
  'Food', 'Lifestyle', 'Health', 'Education', 'Entertainment', 'Other',
]

function formatCount(n: number | undefined | null): string {
  const val = n ?? 0
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `${(val / 1_000).toFixed(1)}K`
  return String(val)
}

function formatCurrency(n?: number | null): string {
  if (n == null || n === 0) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

function getResolvedName(profile: CreatorProfile): string {
  return profile.displayName || profile.name || (profile.username ? `@${profile.username}` : 'Creator')
}

// ── Niche Chips Editor ───────────────────────────────────────

function NicheChipsEditor({
  selected,
  onSave,
  onCancel,
}: {
  selected: string[]
  onSave: (niches: string[]) => void
  onCancel: () => void
}) {
  const [current, setCurrent] = useState<string[]>(selected)
  const [saving, setSaving] = useState(false)

  const toggle = (niche: string) => {
    if (current.includes(niche)) {
      setCurrent(current.filter((n) => n !== niche))
    } else if (current.length < 3) {
      setCurrent([...current, niche])
    }
  }

  const handleSave = async () => {
    setSaving(true)
    await onSave(current)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-dark-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">Edit Niches</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-white" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-4">Select up to 3 niches that describe your content.</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {NICHE_OPTIONS.map((niche) => (
            <button
              key={niche}
              onClick={() => toggle(niche)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                current.includes(niche)
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {niche}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-500 mb-4">{current.length}/3 selected</p>
        <div className="flex gap-3">
          <DashButton size="sm" onClick={handleSave} disabled={saving || current.length === 0}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? 'Saving...' : 'Save'}
          </DashButton>
          <DashButton variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </DashButton>
        </div>
      </div>
    </div>
  )
}

// ── Edit Profile Modal ───────────────────────────────────────

function EditProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: CreatorProfile
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = useState<UpdateCreatorProfilePayload>({
    displayName: profile.displayName ?? profile.name ?? '',
    bio: profile.bio ?? profile.biography ?? '',
    niche: profile.niche ?? '',
    instagramHandle: profile.instagramHandle ?? profile.username ?? '',
    contactNumber: profile.contactNumber ?? '',
    pricePerReel: profile.pricePerReel ?? 0,
    pricePerPost: profile.pricePerPost ?? 0,
    pricePerStory: profile.pricePerStory ?? 0,
    priceAdRights15Days: profile.priceAdRights15Days ?? 0,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateField = (field: keyof UpdateCreatorProfilePayload, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.displayName?.trim()) {
      setError('Display name is required.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await updateCreatorProfile(form)
      onSaved()
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl border border-white/10 bg-dark-800 p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
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
          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Display Name *</label>
            <input
              type="text"
              value={form.displayName ?? ''}
              onChange={(e) => updateField('displayName', e.target.value)}
              placeholder="Your display name"
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>

          {/* Instagram Handle */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              <AtSign className="w-3 h-3 inline mr-1" />
              Instagram Handle
            </label>
            <input
              type="text"
              value={form.instagramHandle ?? ''}
              onChange={(e) => updateField('instagramHandle', e.target.value)}
              placeholder="your_handle"
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Bio</label>
            <textarea
              value={form.bio ?? ''}
              onChange={(e) => updateField('bio', e.target.value)}
              placeholder="Tell brands about yourself..."
              rows={3}
              maxLength={300}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
            />
            <p className="text-xs text-gray-600 mt-1">{(form.bio ?? '').length}/300</p>
          </div>

          {/* Niche */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Primary Niche</label>
            <select
              value={form.niche ?? ''}
              onChange={(e) => updateField('niche', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            >
              <option value="">Select niche</option>
              {NICHE_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Contact Number */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              <Phone className="w-3 h-3 inline mr-1" />
              Contact Number
            </label>
            <input
              type="tel"
              value={form.contactNumber ?? ''}
              onChange={(e) => updateField('contactNumber', e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
            />
          </div>

          {/* Pricing Section */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Rate Card (INR)</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Per Reel</label>
                <input
                  type="number"
                  min={0}
                  value={form.pricePerReel ?? 0}
                  onChange={(e) => updateField('pricePerReel', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Per Post</label>
                <input
                  type="number"
                  min={0}
                  value={form.pricePerPost ?? 0}
                  onChange={(e) => updateField('pricePerPost', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Per Story</label>
                <input
                  type="number"
                  min={0}
                  value={form.pricePerStory ?? 0}
                  onChange={(e) => updateField('pricePerStory', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1">Ad Rights (15 days)</label>
                <input
                  type="number"
                  min={0}
                  value={form.priceAdRights15Days ?? 0}
                  onChange={(e) => updateField('priceAdRights15Days', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-white/5">
            <DashButton onClick={handleSave} disabled={saving} size="sm">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </DashButton>
            <DashButton variant="ghost" size="sm" onClick={onClose} disabled={saving}>
              Cancel
            </DashButton>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────

export function CreatorOverviewPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<CreatorProfile | null>(null)
  const [media, setMedia] = useState<MediaItem[]>([])
  const [niches, setNiches] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showNicheEditor, setShowNicheEditor] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileData, mediaData, nicheData] = await Promise.allSettled([
        getCreatorProfile(),
        getCreatorMedia(),
        getCreatorNiches(),
      ])

      if (profileData.status === 'fulfilled') {
        setProfile(profileData.value)
      } else {
        setError(getErrorMessage(profileData.reason))
        return
      }

      if (mediaData.status === 'fulfilled') {
        setMedia(mediaData.value)
      }

      if (nicheData.status === 'fulfilled') {
        setNiches(nicheData.value)
      }
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleEditSaved = () => {
    setShowEditModal(false)
    fetchData()
  }

  const handleNichesSaved = async (newNiches: string[]) => {
    try {
      await updateCreatorNiches(newNiches)
      setNiches(newNiches)
      setShowNicheEditor(false)
    } catch {
      // Keep editor open on failure
    }
  }

  const handleDisconnect = () => {
    clearAllSessions()
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-white">My Profile</h1>
        <DashCard>
          <p className="text-red-400 text-sm">{error ?? 'Unable to load profile.'}</p>
          <DashButton className="mt-4" size="sm" onClick={fetchData}>
            Retry
          </DashButton>
        </DashCard>
      </div>
    )
  }

  const resolvedName = getResolvedName(profile)
  const followerCount = profile.followerCount ?? 0
  const hasRateCard = profile.pricePerReel || profile.pricePerPost || profile.pricePerStory || profile.priceAdRights15Days
  const videoMedia = media.filter((m) => m.mediaType === 'VIDEO' || m.mediaType === 'REEL')

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Your creator profile overview.</p>
        </div>
        <DashButton variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
          <Pencil className="w-3.5 h-3.5" />
          Edit Profile
        </DashButton>
      </div>

      {/* ═══ Profile Card ═══ */}
      <DashCard>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with gradient ring */}
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
              {profile.profilePictureUrl ? (
                <img
                  src={profile.profilePictureUrl}
                  alt={resolvedName}
                  className="w-full h-full rounded-full object-cover border-2 border-dark-800"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-dark-800 flex items-center justify-center border-2 border-dark-800">
                  <User className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            {profile.accountType && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold uppercase bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full border border-purple-500/30 whitespace-nowrap">
                {profile.accountType.replace('_', ' ')}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-semibold text-white">{resolvedName}</h2>
            {profile.username && (
              <p className="text-sm text-gray-400 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <AtSign className="w-3.5 h-3.5" />
                {profile.username}
              </p>
            )}

            {/* Niche Chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3 justify-center sm:justify-start">
              {(niches.length > 0 ? niches : profile.niche ? [profile.niche] : []).map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-medium text-purple-400"
                >
                  {n}
                </span>
              ))}
              <button
                onClick={() => setShowNicheEditor(true)}
                className="text-xs text-gray-500 hover:text-purple-400 transition-colors px-1.5"
                aria-label="Edit niches"
              >
                <Pencil className="w-3 h-3 inline" />
              </button>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 mt-4 justify-center sm:justify-start">
              <div className="text-center">
                <p className="text-lg font-semibold text-white">{formatCount(followerCount)}</p>
                <p className="text-[10px] text-gray-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">{formatCount(profile.followsCount)}</p>
                <p className="text-[10px] text-gray-500">Following</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-white">{formatCount(profile.mediaCount)}</p>
                <p className="text-[10px] text-gray-500">Posts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {(profile.bio || profile.biography) && (
          <p className="text-sm text-gray-300 leading-relaxed mt-4 pt-4 border-t border-white/5">
            {profile.bio || profile.biography}
          </p>
        )}
      </DashCard>

      {/* ═══ Contact Details ═══ */}
      <DashCard>
        <h3 className="text-sm font-semibold text-white mb-3">Contact Details</h3>
        <div className="space-y-3">
          {/* Email */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-white">{profile.email ?? 'Not provided'}</p>
                <p className="text-[10px] text-gray-500">Email</p>
              </div>
            </div>
            {profile.email && (
              <DashBadge variant={profile.emailVerificationStatus === 'verified' ? 'success' : 'warning'}>
                {profile.emailVerificationStatus === 'verified' ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" />Verified</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" />Unverified</>
                )}
              </DashBadge>
            )}
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-white">{profile.contactNumber ?? 'Not provided'}</p>
                <p className="text-[10px] text-gray-500">Phone</p>
              </div>
            </div>
            {profile.contactNumber && (
              <DashBadge variant={profile.contactVerificationStatus === 'verified' ? 'success' : 'warning'}>
                {profile.contactVerificationStatus === 'verified' ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" />Verified</>
                ) : (
                  <><AlertCircle className="w-3 h-3 mr-1" />Unverified</>
                )}
              </DashBadge>
            )}
          </div>
        </div>
      </DashCard>

      {/* ═══ Quick Actions ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/dashboard/campaigns')}
          className="rounded-xl border border-white/10 bg-dark-800 p-4 flex flex-col items-center gap-2 hover:bg-white/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-xs font-medium text-gray-300">Campaigns</span>
        </button>
        <button
          onClick={() => navigate('/dashboard/brands')}
          className="rounded-xl border border-white/10 bg-dark-800 p-4 flex flex-col items-center gap-2 hover:bg-white/5 transition-colors"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-xs font-medium text-gray-300">Brands</span>
        </button>
        <button
          disabled
          className="rounded-xl border border-white/10 bg-dark-800 p-4 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-gray-500">Wallet</span>
          <span className="text-[9px] text-gray-600">Coming soon</span>
        </button>
        <button
          disabled
          className="rounded-xl border border-white/10 bg-dark-800 p-4 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-amber-400" />
          </div>
          <span className="text-xs font-medium text-gray-500">Support</span>
          <span className="text-[9px] text-gray-600">Coming soon</span>
        </button>
      </div>

      {/* ═══ Rate Card ═══ */}
      {hasRateCard ? (
        <DashCard>
          <h3 className="text-sm font-semibold text-white mb-3">Rate Card</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-lg bg-white/5 border border-white/5 p-3 text-center">
              <p className="text-base font-semibold text-white">{formatCurrency(profile.pricePerReel)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Per Reel</p>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/5 p-3 text-center">
              <p className="text-base font-semibold text-white">{formatCurrency(profile.pricePerPost)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Per Post</p>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/5 p-3 text-center">
              <p className="text-base font-semibold text-white">{formatCurrency(profile.pricePerStory)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Per Story</p>
            </div>
            <div className="rounded-lg bg-white/5 border border-white/5 p-3 text-center">
              <p className="text-base font-semibold text-white">{formatCurrency(profile.priceAdRights15Days)}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Ad Rights (15d)</p>
            </div>
          </div>
        </DashCard>
      ) : (
        <DashCard>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Rate Card</h3>
              <p className="text-xs text-gray-500 mt-0.5">Set your pricing so brands can see your rates.</p>
            </div>
            <DashButton variant="secondary" size="sm" onClick={() => setShowEditModal(true)}>
              Set Rates
            </DashButton>
          </div>
        </DashCard>
      )}

      {/* ═══ Reels & Videos ═══ */}
      {videoMedia.length > 0 && (
        <DashCard>
          <h3 className="text-sm font-semibold text-white mb-3">
            Reels & Videos
            <span className="ml-2 text-xs text-gray-500 font-normal">{videoMedia.length}</span>
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {videoMedia.slice(0, 9).map((item) => (
              <a
                key={item.id}
                href={item.permalink ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="relative aspect-[9/16] rounded-lg overflow-hidden bg-white/5 border border-white/5 group hover:border-purple-500/30 transition-colors"
              >
                {item.thumbnailUrl ? (
                  <img
                    src={item.thumbnailUrl}
                    alt={item.caption ?? 'Video'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-600" />
                  </div>
                )}
                {/* Overlay with stats */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <div className="flex items-center gap-3 text-[10px] text-white">
                    {item.likeCount != null && (
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-3 h-3" /> {formatCount(item.likeCount)}
                      </span>
                    )}
                    {item.commentsCount != null && (
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="w-3 h-3" /> {formatCount(item.commentsCount)}
                      </span>
                    )}
                  </div>
                </div>
                {/* Play icon */}
                <div className="absolute top-2 right-2 bg-black/40 rounded-full p-1">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              </a>
            ))}
          </div>
          {videoMedia.length > 9 && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              +{videoMedia.length - 9} more videos
            </p>
          )}
        </DashCard>
      )}

      {/* ═══ Account Actions ═══ */}
      <DashCard>
        <h3 className="text-sm font-semibold text-white mb-3">Account</h3>
        <div className="space-y-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors"
          >
            <Pencil className="w-4 h-4 text-gray-500" />
            Edit Profile
          </button>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4 text-gray-500" />
            Disconnect Account
          </button>
          <button
            disabled
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400/60 cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
            <span className="ml-auto text-[10px] text-gray-600">Coming soon</span>
          </button>
        </div>
      </DashCard>

      {/* ═══ Modals ═══ */}
      {showEditModal && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSaved={handleEditSaved}
        />
      )}
      {showNicheEditor && (
        <NicheChipsEditor
          selected={niches.length > 0 ? niches : profile.niche ? [profile.niche] : []}
          onSave={handleNichesSaved}
          onCancel={() => setShowNicheEditor(false)}
        />
      )}
    </div>
  )
}
