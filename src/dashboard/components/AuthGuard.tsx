import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getInfluencerSessionId, getBrandSessionId } from '../../lib/session'
import { getAuthStatus } from '../../api/auth'
import { apiClient } from '../../lib/api-client'

type GuardState = 'loading' | 'authenticated' | 'unauthenticated'

/**
 * Protects dashboard routes. Checks for a valid session (either influencer
 * or brand) in localStorage and validates it against the server. If invalid
 * or missing, redirects to the appropriate login page.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GuardState>('loading')
  const location = useLocation()

  useEffect(() => {
    const influencerSession = getInfluencerSessionId()
    const brandSession = getBrandSessionId()

    if (influencerSession) {
      // Validate influencer session via /api/auth/status
      getAuthStatus(influencerSession)
        .then((res) => {
          setState(res.status === 'authenticated' ? 'authenticated' : 'unauthenticated')
        })
        .catch(() => setState('unauthenticated'))
    } else if (brandSession) {
      // Validate brand session via GET /api/brand (returns brand profile if valid)
      apiClient.get('/api/brand')
        .then(() => setState('authenticated'))
        .catch(() => setState('unauthenticated'))
    } else {
      setState('unauthenticated')
    }
  }, [])

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Verifying session…</p>
        </div>
      </div>
    )
  }

  if (state === 'unauthenticated') {
    // Redirect to appropriate login based on where they came from
    return <Navigate to="/brands/register" state={{ from: location }} replace />
  }

  return <>{children}</>
}
