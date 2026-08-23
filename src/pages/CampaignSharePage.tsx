import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getInfluencerSessionId, getBrandSessionId } from '../lib/session'

/**
 * Public campaign share page — `/campaigns/:campaignId`
 *
 * When someone clicks a shared campaign link (from WhatsApp/Instagram DM),
 * they land here. This page:
 * 1. If the user is already logged in → redirects to the dashboard campaign detail
 * 2. If not logged in → shows a brief campaign card + prompts them to sign in
 */
export default function CampaignSharePage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // If already authenticated, redirect to the dashboard campaign view
    const creatorSession = getInfluencerSessionId()
    const brandSession = getBrandSessionId()

    if (creatorSession) {
      // Creator → redirect to campaigns page (the detail is shown inline)
      navigate(`/dashboard/campaigns`, { replace: true })
      return
    }
    if (brandSession) {
      navigate(`/dashboard/campaigns`, { replace: true })
      return
    }

    setChecking(false)
  }, [navigate, campaignId])

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in — show a landing card
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-white font-semibold text-lg">Colabrise</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/20 flex items-center justify-center">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>

          <h1 className="text-white text-xl font-semibold">Campaign Invitation</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            You've been invited to view a campaign on Colabrise. Sign in to see full details, apply, and collaborate with the brand.
          </p>

          {/* CTA buttons */}
          <div className="space-y-3 pt-2">
            <a
              href="/creators/register"
              className="block w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold text-center hover:shadow-lg hover:shadow-purple-500/20 transition-all"
            >
              Sign In as Creator
            </a>
            <a
              href="/brands/register"
              className="block w-full py-3 rounded-xl border border-white/10 text-gray-300 text-sm font-medium text-center hover:bg-white/5 transition-colors"
            >
              Sign In as Brand
            </a>
          </div>
        </div>

        <p className="text-gray-600 text-xs">
          Colabrise connects creators with brands for campaign collaborations.
        </p>
      </div>
    </div>
  )
}
