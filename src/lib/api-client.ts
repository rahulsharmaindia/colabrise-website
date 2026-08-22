import axios, { type InternalAxiosRequestConfig } from 'axios'
import { getAnySessionId } from './session'

/**
 * The nanoboost server has no /api/v1 prefix — routes are literal
 * (e.g. /api/brand/register, /api/auth/google/start). See
 * nanoceleb/nanoboost/src/main.ts.
 *
 * Falls back to the production Railway deployment when VITE_API_URL is
 * unset, matching colabrise-web's src/lib/api-client.ts and
 * flutterapp's lib/core/config/app_config.dart so an out-of-the-box
 * `npm run dev` still talks to a live backend.
 */
const baseURL = import.meta.env.VITE_API_URL ?? 'https://nanoboost-production.up.railway.app'

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach session token (influencer or brand) on every request.
// The server accepts auth via both `Authorization: Bearer <token>` header
// AND `?session_id=<token>` query parameter. The Flutter app uses the
// query-param approach, so we send both to ensure compatibility with all
// server guards.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const sessionId = getAnySessionId()
  if (sessionId) {
    config.headers.set('Authorization', `Bearer ${sessionId}`)
    // Also append as query param — some server guards only check this
    config.params = { ...config.params, session_id: sessionId }
  }
  return config
})

// The server wraps every response as { data, error, requestId }.
// Unwrap `data` here so callers work with plain payloads.
apiClient.interceptors.response.use((response) => {
  if (
    response.data &&
    typeof response.data === 'object' &&
    'data' in response.data &&
    'error' in response.data
  ) {
    response.data = response.data.data
  }
  return response
})

/** Extract a human-readable error message from an unknown thrown value. */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const withResponse = error as {
      response?: { data?: { error?: { message?: string } } }
      message?: string
    }
    const apiMessage = withResponse.response?.data?.error?.message
    if (apiMessage) return apiMessage
    if (withResponse.message) return withResponse.message
  }
  return 'Something went wrong. Please try again.'
}
