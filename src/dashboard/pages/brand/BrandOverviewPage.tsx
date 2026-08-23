import { useEffect, useState, useCallback, useRef } from 'react'
import { Building2, Globe, FileText, Link2, Pencil, X, Loader2, Upload, Lock } from 'lucide-react'
import { FaInstagram, FaFacebookF, FaXTwitter, FaLinkedinIn, FaTiktok } from 'react-icons/fa6'
import { DashCard, DashButton } from '../../components/ui'
import { getBrandProfile, updateBrandProfile, type BrandProfile } from '../../../api/brand'
import { getErrorMessage } from '../../../lib/api-client'

const INDUSTRIES = [
  'Fashion', 'Beauty', 'Food & Beverage', 'Technology',
  'Health & Fitness', 'Travel', 'Entertainment', 'Education',
  'Finance', 'Other',
]

const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/yourbrand', icon: FaInstagram, color: 'text-pink-400' },
  { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/yourbrand', icon: FaFacebookF, color: 'text-blue-400' },
  { key: 'twitter', label: 'Twitter / X', placeholder: 'https://x.com/yourbrand', icon: FaXTwitter, color: 'text-gray-300' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/yourbrand', icon: FaLinkedinIn, color: 'text-sky-400' },
  { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@yourbrand', icon: FaTiktok, color: 'text-emerald-400' },
]

type EditForm = {
  name: string
  industry: string
  website: string
  description: string
  logo: string | null
  socialLinks: Record<string, string>
}

function profileToForm(profile: BrandProfile): EditForm {
  const links: Record<string, string> = {}
  for (const p of SOCIAL_PLATFORMS) {
    links[p.key] = profile.socialLinks?.[p.key] ?? ''
  }
  // Also include any extra platforms not in the predefined list
  if (profile.socialLinks) {
    for (const [k, v] of Object.entries(profile.socialLinks)) {
      if (!links[k]) links[k] = v ?? ''
    }
  }
  return {
    name: profile.name,
    industry: profile.industry,
    website: profile.website ?? '',
    description: profile.description ?? '',
    logo: profile.logo,
    socialLinks: links,
  }
}

export function BrandOverviewPage() {
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<EditForm>({ name: '', industry: '', website: '', description: '', logo: null, socialLinks: {} })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoChanged, setLogoChanged] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getBrandProfile()
      setProfile(data)
      setForm(profileToForm(data))
      setLogoPreview(data.logo)
    } catch (e) {
      setError(getErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Logo must be smaller than 2 MB')
      return
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setSaveError('Logo must be a PNG or JPG image')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const dataUri = reader.result as string
      setLogoPreview(dataUri)
      setForm((f) => ({ ...f, logo: dataUri }))
      setLogoChanged(true)
      setSaveError(null)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    try {
      // Server uses @IsString() validation — send empty string to clear
      // optional fields (server normalises '' → null internally).
      const updates: Record<string, unknown> = {
        name: form.name.trim(),
        industry: form.industry.trim(),
        website: form.website.trim(),
        description: form.description.trim(),
      }

      if (logoChanged && form.logo) {
        updates.logo = form.logo
      }

      // Build social links — send all platforms, empty string to clear
      const socialLinks: Record<string, string> = {}
      for (const [platform, url] of Object.entries(form.socialLinks)) {
        socialLinks[platform] = url.trim()
      }
      updates.socialLinks = socialLinks

      const updated = await updateBrandProfile(updates)
      setProfile(updated)
      setForm(profileToForm(updated))
      setLogoPreview(updated.logo)
      setLogoChanged(false)
      setEditing(false)
    } catch (e) {
      setSaveError(getErrorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  const startEditing = () => {
    if (profile) {
      setForm(profileToForm(profile))
      setLogoPreview(profile.logo)
      setLogoChanged(false)
      setSaveError(null)
    }
    setEditing(true)
  }

  const cancelEditing = () => {
    if (profile) {
      setForm(profileToForm(profile))
      setLogoPreview(profile.logo)
      setLogoChanged(false)
      setSaveError(null)
    }
    setEditing(false)
  }

  // ── Loading state ──────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Brand Profile</h1>
        <DashCard>
          <p className="text-red-400 text-sm">{error}</p>
          <DashButton className="mt-4" size="sm" onClick={fetchProfile}>
            Retry
          </DashButton>
        </DashCard>
      </div>
    )
  }

  if (!profile) return null

  // ── Edit mode ──────────────────────────────────────────────
  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Brand Profile</h1>
          <button onClick={cancelEditing} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-only Business ID */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] max-w-2xl">
          <Lock className="w-4 h-4 text-gray-400 dark:text-gray-500 shrink-0" />
          <div className="flex-1">
            <p className="text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Business ID</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">@{profile.businessId}</p>
          </div>
          <span className="text-[11px] text-gray-400 dark:text-gray-600">Read-only</span>
        </div>

        <DashCard className="max-w-2xl space-y-6">
          {/* Logo upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Brand Logo</label>
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-white/10"
                />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white">
                  {form.name[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <DashButton
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Change Logo
                </DashButton>
                <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1.5">PNG or JPG, max 2 MB</p>
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Brand Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              placeholder="Your brand name"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Industry *</label>
            <select
              value={form.industry}
              onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 [&>option]:bg-white dark:[&>option]:bg-gray-900"
            >
              <option value="">Select industry</option>
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website</label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              placeholder="https://yourbrand.com"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none"
              placeholder="Tell creators about your brand..."
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Social Links</label>
            <div className="space-y-3">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div key={platform.key} className="flex items-center gap-3">
                  <platform.icon className={`w-4 h-4 ${platform.color} shrink-0`} />
                  <input
                    type="url"
                    value={form.socialLinks[platform.key] ?? ''}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        socialLinks: { ...f.socialLinks, [platform.key]: e.target.value },
                      }))
                    }
                    className="flex-1 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                    placeholder={platform.placeholder}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save error */}
          {saveError && <p className="text-sm text-red-400">{saveError}</p>}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <DashButton onClick={handleSave} disabled={saving || !form.name || !form.industry}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save Changes'}
            </DashButton>
            <DashButton variant="secondary" onClick={cancelEditing}>
              Cancel
            </DashButton>
          </div>
        </DashCard>
      </div>
    )
  }

  // ── Profile view ───────────────────────────────────────────
  const socialEntries = Object.entries(profile.socialLinks ?? {}).filter(
    ([, url]) => url && url.trim().length > 0,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Brand Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your brand's public-facing information.</p>
        </div>
        <DashButton size="md" onClick={startEditing}>
          <Pencil className="w-4 h-4" />
          Edit Profile
        </DashButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main info */}
        <DashCard className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-4">
            {profile.logo ? (
              <img
                src={profile.logo}
                alt={profile.name}
                className="w-16 h-16 rounded-xl object-cover border border-gray-200 dark:border-white/10"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white">
                {profile.name[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{profile.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">@{profile.businessId}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">About</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {profile.description || <span className="text-gray-600 italic">No description set</span>}
            </p>
          </div>

          {/* Industry & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Industry</span>
              </div>
              <p className="text-sm text-gray-900 dark:text-white">{profile.industry}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Website</span>
              </div>
              {profile.website ? (
                <a
                  href={profile.website.match(/^https?:\/\//) ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 underline underline-offset-2"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <p className="text-sm text-gray-400 dark:text-gray-600 italic">Not set</p>
              )}
            </div>
          </div>
        </DashCard>

        {/* Social Links */}
        <DashCard className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Link2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Social Links</h3>
          </div>
          {socialEntries.length > 0 ? (
            <ul className="space-y-3">
              {socialEntries.map(([platform, url]) => {
                const config = SOCIAL_PLATFORMS.find((p) => p.key === platform)
                const Icon = config?.icon
                const iconColor = config?.color ?? 'text-gray-400'
                return (
                  <li key={platform}>
                    <a
                      href={url!.match(/^https?:\/\//) ? url! : `https://${url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 hover:text-purple-400 transition-colors group"
                    >
                      {Icon ? (
                        <Icon className={`w-4 h-4 ${iconColor} group-hover:text-purple-400 transition-colors shrink-0`} />
                      ) : (
                        <span className="w-4 h-4 rounded-full bg-purple-500/60 shrink-0" />
                      )}
                      <span className="truncate">{url!.replace(/^https?:\/\//, '')}</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">No social links added.</p>
          )}

          {/* Show platforms without links */}
          {socialEntries.length < SOCIAL_PLATFORMS.length && (
            <div className="pt-3 border-t border-gray-100 dark:border-white/5">
              <p className="text-[11px] text-gray-400 dark:text-gray-600 mb-2">Not configured:</p>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_PLATFORMS.filter(
                  (p) => !socialEntries.find(([k]) => k === p.key),
                ).map((p) => (
                  <span
                    key={p.key}
                    className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-full"
                  >
                    <p.icon className="w-3 h-3" />
                    {p.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </DashCard>
      </div>
    </div>
  )
}
