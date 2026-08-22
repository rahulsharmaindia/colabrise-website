import { apiClient } from '../lib/api-client'

/**
 * Google OAuth flow for influencers/creators — mirrors the same
 * server routes the Flutter app uses (nanoceleb/nanoboost/src/modules/auth/auth.controller.ts).
 * All three routes are public; authentication happens inside the OAuth
 * exchange, not via a request body.
 */

export interface StartGoogleAuthResponse {
  state: string
  poll_token: string
  auth_url: string
}

/**
 * Starts the Google OAuth flow. `webRedirectUri` should be this site's own
 * origin (e.g. `${window.location.origin}/creators/register`) so the server
 * treats this as a web popup and redirects/auto-closes back here instead of
 * falling back to the mobile colabrise:// deep link.
 */
export async function startGoogleAuth(webRedirectUri: string): Promise<StartGoogleAuthResponse> {
  const { data } = await apiClient.get<StartGoogleAuthResponse>('/api/auth/google/start', {
    params: { platform: 'web', web_redirect_uri: webRedirectUri },
  })
  return data
}

export type GooglePollStatus = 'pending' | 'authenticated' | 'error' | 'not_found'

export interface PollGoogleAuthResponse {
  status: GooglePollStatus
  session_id: string | null
}

export async function pollGoogleAuth(pollToken: string): Promise<PollGoogleAuthResponse> {
  const { data } = await apiClient.get<PollGoogleAuthResponse>('/api/auth/google/poll', {
    params: { poll_token: pollToken },
  })
  return data
}

export type ProfileCompletionStatus = 'incomplete' | 'complete' | null

export interface AuthStatusResponse {
  status: 'authenticated' | 'not_found'
  user_id: string | null
  profile_completion_status: ProfileCompletionStatus
  email: string | null
}

export async function getAuthStatus(sessionId: string): Promise<AuthStatusResponse> {
  const { data } = await apiClient.get<AuthStatusResponse>('/api/auth/status', {
    params: { session_id: sessionId },
  })
  return data
}
